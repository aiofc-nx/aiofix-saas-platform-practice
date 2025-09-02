/**
 * @file template.service.ts
 * @description 模板领域服务
 *
 * 该服务负责处理模板领域的复杂业务逻辑，包括：
 * - 模板的创建和验证
 * - 模板的状态管理
 * - 模板的版本控制
 * - 模板的渲染和变量处理
 *
 * 遵循DDD原则，封装模板领域的业务逻辑。
 */

import { Injectable } from '@nestjs/common';
import { Template } from '../entities/template.entity';
import { TemplateRepositoryInterface } from '../repositories/template-repository.interface';
import { NotificationType, TemplateStatus, Uuid } from '@aiofix/shared';

/**
 * @class TemplateService
 * @description 模板领域服务类
 *
 * 该服务提供模板管理的核心业务逻辑，包括模板的创建、验证、状态管理等。
 */
@Injectable()
export class TemplateService {
  /**
   * @constructor
   * @param templateRepository 模板仓储
   */
  constructor(
    private readonly templateRepository: TemplateRepositoryInterface
  ) {}

  /**
   * @method createTemplate
   * @description 创建模板
   * @param tenantId 租户ID
   * @param name 模板名称
   * @param type 通知类型
   * @param content 模板内容
   * @param variables 模板变量
   * @param language 语言
   * @param category 分类
   * @param subject 主题（邮件专用）
   * @param tags 标签
   * @param metadata 元数据
   * @returns {Promise<Template>} 创建的模板实例
   */
  async createTemplate(
    tenantId: Uuid,
    name: string,
    type: NotificationType,
    content: string,
    variables: string[],
    language: string,
    category: string,
    subject?: string,
    tags: string[] = [],
    metadata: Record<string, unknown> = {}
  ): Promise<Template> {
    // 验证模板名称是否已存在
    const existingTemplate = await this.templateRepository.findByName(
      name,
      tenantId.toString()
    );
    if (existingTemplate) {
      throw new Error(`模板名称 "${name}" 已存在`);
    }

    // 创建模板实例
    const template = Template.create(
      tenantId,
      name,
      type,
      content,
      variables,
      language,
      category,
      subject,
      tags,
      metadata
    );

    // 验证模板内容
    if (!template.validateContent()) {
      throw new Error('模板内容验证失败');
    }

    // 保存模板
    return await this.templateRepository.save(template);
  }

  /**
   * @method updateTemplate
   * @description 更新模板
   * @param templateId 模板ID
   * @param tenantId 租户ID
   * @param content 新内容
   * @param variables 新变量
   * @param subject 新主题（邮件专用）
   * @returns {Promise<Template>} 更新后的模板实例
   */
  async updateTemplate(
    templateId: string,
    tenantId: Uuid,
    content: string,
    variables: string[],
    subject?: string
  ): Promise<Template> {
    // 查找模板
    const template = await this.templateRepository.findById(templateId);
    if (!template) {
      throw new Error('模板不存在');
    }

    // 验证租户权限
    if (template.tenantId.toString() !== tenantId.toString()) {
      throw new Error('无权访问此模板');
    }

    // 更新模板内容
    template.updateContent(content, variables, subject);

    // 验证模板内容
    if (!template.validateContent()) {
      throw new Error('模板内容验证失败');
    }

    // 保存模板
    return await this.templateRepository.save(template);
  }

  /**
   * @method activateTemplate
   * @description 激活模板
   * @param templateId 模板ID
   * @param tenantId 租户ID
   * @returns {Promise<Template>} 激活后的模板实例
   */
  async activateTemplate(
    templateId: string,
    tenantId: Uuid
  ): Promise<Template> {
    // 查找模板
    const template = await this.templateRepository.findById(templateId);
    if (!template) {
      throw new Error('模板不存在');
    }

    // 验证租户权限
    if (template.tenantId.toString() !== tenantId.toString()) {
      throw new Error('无权访问此模板');
    }

    // 激活模板
    template.activate();

    // 保存模板
    return await this.templateRepository.save(template);
  }

  /**
   * @method deactivateTemplate
   * @description 停用模板
   * @param templateId 模板ID
   * @param tenantId 租户ID
   * @returns {Promise<Template>} 停用后的模板实例
   */
  async deactivateTemplate(
    templateId: string,
    tenantId: Uuid
  ): Promise<Template> {
    // 查找模板
    const template = await this.templateRepository.findById(templateId);
    if (!template) {
      throw new Error('模板不存在');
    }

    // 验证租户权限
    if (template.tenantId.toString() !== tenantId.toString()) {
      throw new Error('无权访问此模板');
    }

    // 停用模板
    template.deactivate();

    // 保存模板
    return await this.templateRepository.save(template);
  }

  /**
   * @method archiveTemplate
   * @description 归档模板
   * @param templateId 模板ID
   * @param tenantId 租户ID
   * @returns {Promise<Template>} 归档后的模板实例
   */
  async archiveTemplate(templateId: string, tenantId: Uuid): Promise<Template> {
    // 查找模板
    const template = await this.templateRepository.findById(templateId);
    if (!template) {
      throw new Error('模板不存在');
    }

    // 验证租户权限
    if (template.tenantId.toString() !== tenantId.toString()) {
      throw new Error('无权访问此模板');
    }

    // 归档模板
    template.archive();

    // 保存模板
    return await this.templateRepository.save(template);
  }

  /**
   * @method getActiveTemplate
   * @description 获取激活状态的模板
   * @param name 模板名称
   * @param type 通知类型
   * @param tenantId 租户ID
   * @returns {Promise<Template | null>} 激活的模板实例或null
   */
  async getActiveTemplate(
    name: string,
    type: NotificationType,
    tenantId: Uuid
  ): Promise<Template | null> {
    return await this.templateRepository.findActiveTemplateByTypeAndName(
      type,
      name,
      tenantId.toString()
    );
  }

  /**
   * @method renderTemplate
   * @description 渲染模板
   * @param templateId 模板ID
   * @param tenantId 租户ID
   * @param data 模板数据
   * @returns {Promise<string>} 渲染后的内容
   */
  async renderTemplate(
    templateId: string,
    tenantId: Uuid,
    data: Record<string, unknown>
  ): Promise<string> {
    // 查找模板
    const template = await this.templateRepository.findById(templateId);
    if (!template) {
      throw new Error('模板不存在');
    }

    // 验证租户权限
    if (template.tenantId.toString() !== tenantId.toString()) {
      throw new Error('无权访问此模板');
    }

    // 检查模板是否激活
    if (!template.isActive()) {
      throw new Error('模板未激活，无法使用');
    }

    // 渲染模板
    return template.render(data);
  }

  /**
   * @method validateTemplateContent
   * @description 验证模板内容
   * @param content 模板内容
   * @param type 通知类型
   * @param variables 模板变量
   * @returns {boolean} 内容是否有效
   */
  validateTemplateContent(
    content: string,
    type: NotificationType,
    variables: string[]
  ): boolean {
    // 检查内容是否为空
    if (!content || content.trim().length === 0) {
      return false;
    }

    // 检查内容长度限制
    if (type === NotificationType.SMS && content.length > 160) {
      return false;
    }

    // 检查变量是否在内容中使用
    const usedVariables = this.extractVariablesFromContent(content);
    const unusedVariables = variables.filter(
      (variable) => !usedVariables.includes(variable)
    );

    return unusedVariables.length === 0;
  }

  /**
   * @method extractVariablesFromContent
   * @description 从内容中提取变量
   * @param content 模板内容
   * @returns {string[]} 变量列表
   */
  extractVariablesFromContent(content: string): string[] {
    const variableRegex = /\{\{([^}]+)\}\}/g;
    const variables: string[] = [];
    let match;

    while ((match = variableRegex.exec(content)) !== null) {
      const variable = match[1].trim();
      if (!variables.includes(variable)) {
        variables.push(variable);
      }
    }

    return variables;
  }

  /**
   * @method getTemplateStatistics
   * @description 获取模板统计信息
   * @param tenantId 租户ID
   * @returns {Promise<Record<string, number>>} 统计信息
   */
  async getTemplateStatistics(tenantId: Uuid): Promise<Record<string, number>> {
    const totalTemplates = await this.templateRepository.count(
      tenantId.toString()
    );
    const activeTemplates = await this.templateRepository.countByStatus(
      TemplateStatus.ACTIVE,
      tenantId.toString()
    );
    const draftTemplates = await this.templateRepository.countByStatus(
      TemplateStatus.DRAFT,
      tenantId.toString()
    );
    const archivedTemplates = await this.templateRepository.countByStatus(
      TemplateStatus.ARCHIVED,
      tenantId.toString()
    );

    return {
      total: totalTemplates,
      active: activeTemplates,
      draft: draftTemplates,
      archived: archivedTemplates,
    };
  }
}
