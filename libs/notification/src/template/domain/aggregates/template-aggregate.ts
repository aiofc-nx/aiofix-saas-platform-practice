/**
 * @file template-aggregate.ts
 * @description 模板聚合
 *
 * 该聚合封装了模板的完整生命周期管理，包括创建、更新、审核、版本管理等操作。
 * 遵循DDD聚合设计原则，确保业务一致性和数据完整性。
 */

import { BaseEvent, Uuid } from '@aiofix/shared';
import { Template, ReviewStatus } from '../entities/template.entity';
import { TemplateRepository } from '../repositories/template.repository';
import { NotificationType, TemplateStatus } from '@aiofix/shared';

/**
 * @class AggregateRoot
 * @description 聚合根基类
 */
abstract class AggregateRoot {
  private _domainEvents: BaseEvent[] = [];

  get domainEvents(): BaseEvent[] {
    return [...this._domainEvents];
  }

  protected addDomainEvent(event: BaseEvent): void {
    this._domainEvents.push(event);
  }

  clearDomainEvents(): void {
    this._domainEvents = [];
  }
}

/**
 * @interface CreateTemplateCommand
 * @description 创建模板命令
 */
export interface CreateTemplateCommand {
  tenantId: string;
  name: string;
  type: NotificationType;
  content: string;
  variables: string[];
  language: string;
  category: string;
  subject?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  createdBy: string;
}

/**
 * @interface UpdateTemplateCommand
 * @description 更新模板命令
 */
export interface UpdateTemplateCommand {
  templateId: string;
  content: string;
  variables: string[];
  subject?: string;
  updatedBy: string;
}

/**
 * @interface ReviewTemplateCommand
 * @description 审核模板命令
 */
export interface ReviewTemplateCommand {
  templateId: string;
  reviewerId: string;
  action: 'approve' | 'reject';
  comments?: string;
}

/**
 * @class TemplateAggregate
 * @description 模板聚合
 *
 * 主要原理与机制：
 * 1. 封装模板的完整生命周期
 * 2. 确保业务规则的一致性
 * 3. 发布领域事件
 * 4. 管理聚合状态转换
 *
 * 功能与业务规则：
 * 1. 创建模板
 * 2. 更新模板
 * 3. 审核模板
 * 4. 版本管理
 * 5. 状态转换控制
 */
export class TemplateAggregate extends AggregateRoot {
  private template: Template | null = null;

  constructor(private readonly templateRepository: TemplateRepository) {
    super();
  }

  /**
   * @method createTemplate
   * @description 创建模板
   */
  async createTemplate(command: CreateTemplateCommand): Promise<Template> {
    // 1. 验证模板名称唯一性
    const isNameAvailable = await this.validateTemplateName(
      command.name,
      command.tenantId
    );
    if (!isNameAvailable) {
      throw new Error(`模板名称 "${command.name}" 已存在`);
    }

    // 2. 创建模板实体
    const tenantId = Uuid.fromString(command.tenantId);

    this.template = Template.create(
      tenantId,
      command.name,
      command.type,
      command.content,
      command.variables,
      command.language,
      command.category,
      command.subject,
      command.tags ?? [],
      command.metadata ?? {},
      Uuid.fromString(command.createdBy)
    );

    // 3. 保存到仓储
    await this.templateRepository.save(this.template);

    return this.template;
  }

  /**
   * @method updateTemplate
   * @description 更新模板
   */
  async updateTemplate(command: UpdateTemplateCommand): Promise<void> {
    if (!this.template) {
      throw new Error('模板不存在');
    }

    // 1. 验证模板状态
    if (this.template.status === TemplateStatus.ARCHIVED) {
      throw new Error('已归档的模板不能更新');
    }

    // 2. 更新模板内容
    this.template.updateContent(
      command.content,
      command.variables,
      command.subject,
      Uuid.fromString(command.updatedBy)
    );

    // 3. 保存到仓储
    await this.templateRepository.save(this.template);
  }

  /**
   * @method submitForReview
   * @description 提交审核
   */
  async submitForReview(_templateId: string): Promise<void> {
    if (!this.template) {
      throw new Error('模板不存在');
    }

    // 1. 验证模板状态
    if (this.template.status !== TemplateStatus.DRAFT) {
      throw new Error('只有草稿状态的模板才能提交审核');
    }

    // 2. 提交审核
    this.template.submitForReview();

    // 3. 保存到仓储
    await this.templateRepository.save(this.template);
  }

  /**
   * @method reviewTemplate
   * @description 审核模板
   */
  async reviewTemplate(command: ReviewTemplateCommand): Promise<void> {
    if (!this.template) {
      throw new Error('模板不存在');
    }

    // 1. 验证审核状态
    if (this.template.reviewStatus !== ReviewStatus.UNDER_REVIEW) {
      throw new Error('只有审核中的模板才能进行审核操作');
    }

    // 2. 执行审核操作
    if (command.action === 'approve') {
      this.template.approve(Uuid.fromString(command.reviewerId), command.comments);
    } else {
      if (!command.comments) {
        throw new Error('拒绝审核必须提供拒绝原因');
      }
      this.template.reject(Uuid.fromString(command.reviewerId), command.comments);
    }

    // 3. 保存到仓储
    await this.templateRepository.save(this.template);
  }

  /**
   * @method activateTemplate
   * @description 激活模板
   */
  async activateTemplate(_templateId: string): Promise<void> {
    if (!this.template) {
      throw new Error('模板不存在');
    }

    // 1. 验证审核状态
    if (this.template.reviewStatus !== ReviewStatus.APPROVED) {
      throw new Error('只有审核通过的模板才能激活');
    }

    // 2. 激活模板
    this.template.activate();

    // 3. 保存到仓储
    await this.templateRepository.save(this.template);
  }

  /**
   * @method deactivateTemplate
   * @description 停用模板
   */
  async deactivateTemplate(_templateId: string): Promise<void> {
    if (!this.template) {
      throw new Error('模板不存在');
    }

    // 1. 停用模板
    this.template.deactivate();

    // 2. 保存到仓储
    await this.templateRepository.save(this.template);
  }

  /**
   * @method archiveTemplate
   * @description 归档模板
   */
  async archiveTemplate(_templateId: string): Promise<void> {
    if (!this.template) {
      throw new Error('模板不存在');
    }

    // 1. 归档模板
    this.template.archive();

    // 2. 保存到仓储
    await this.templateRepository.save(this.template);
  }

  /**
   * @method revertToVersion
   * @description 回滚到指定版本
   */
  async revertToVersion(
    templateId: string,
    version: number,
    updatedBy: string
  ): Promise<void> {
    if (!this.template) {
      throw new Error('模板不存在');
    }

    // 1. 验证版本存在
    const targetVersion = this.template.getVersion(version);
    if (!targetVersion) {
      throw new Error(`版本 ${version} 不存在`);
    }

    // 2. 回滚到指定版本
    this.template.revertToVersion(version, Uuid.fromString(updatedBy));

    // 3. 保存到仓储
    await this.templateRepository.save(this.template);
  }

  /**
   * @method incrementUsage
   * @description 增加使用次数
   */
  async incrementUsage(_templateId: string): Promise<void> {
    if (!this.template) {
      throw new Error('模板不存在');
    }

    // 1. 增加使用次数
    this.template.incrementUsage();

    // 2. 保存到仓储
    await this.templateRepository.save(this.template);
  }

  /**
   * @method getTemplate
   * @description 获取模板
   */
  getTemplate(): Template | null {
    return this.template;
  }

  /**
   * @method loadTemplate
   * @description 加载模板
   */
  async loadTemplate(templateId: string): Promise<void> {
    const uuid = Uuid.fromString(templateId);
    this.template = await this.templateRepository.findById(uuid);
  }

  /**
   * @method deleteTemplate
   * @description 删除模板
   */
  async deleteTemplate(_templateId: string): Promise<void> {
    if (!this.template) {
      throw new Error('模板不存在');
    }

    // 1. 验证是否可以删除
    if (this.template.status === TemplateStatus.ACTIVE) {
      throw new Error('激活状态的模板不能删除，请先停用');
    }

    // 2. 从仓储删除
    await this.templateRepository.delete(this.template.id);

    // 3. 清空聚合状态
    this.template = null;
  }

  /**
   * @private
   * @method validateTemplateName
   * @description 验证模板名称唯一性
   */
  private async validateTemplateName(
    name: string,
    tenantId: string
  ): Promise<boolean> {
    const existingTemplate = await this.templateRepository.findByName(
      name,
      tenantId
    );

    return !existingTemplate;
  }
}
