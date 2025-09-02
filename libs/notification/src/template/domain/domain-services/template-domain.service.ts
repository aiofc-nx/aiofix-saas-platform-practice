/**
 * @file template-domain.service.ts
 * @description 模板领域服务
 *
 * 该服务处理模板的复杂业务逻辑，包括验证、版本管理、审核流程等。
 * 遵循DDD原则，保持领域逻辑的纯粹性。
 */

import { Injectable } from '@nestjs/common';
import { Template, ReviewStatus } from '../entities/template.entity';
import { TemplateRepository } from '../repositories';
import { NotificationType, TemplateStatus, Uuid } from '@aiofix/shared';

/**
 * @interface TemplateValidationResult
 * @description 模板验证结果接口
 */
export interface TemplateValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * @interface TemplateReviewResult
 * @description 模板审核结果接口
 */
export interface TemplateReviewResult {
  canSubmit: boolean;
  canApprove: boolean;
  canReject: boolean;
  reasons: string[];
}

/**
 * @interface TemplateVersionInfo
 * @description 模板版本信息接口
 */
export interface TemplateVersionInfo {
  version: number;
  content: string;
  subject?: string;
  variables: string[];
  status: TemplateStatus;
  reviewStatus: ReviewStatus;
  createdAt: Date;
  updatedAt: Date;
  createdBy: Uuid;
  updatedBy: Uuid;
  reviewComments?: string;
  reviewerId?: Uuid;
  reviewedAt?: Date;
}

/**
 * @class TemplateDomainService
 * @description 模板领域服务
 *
 * 主要原理与机制：
 * 1. 处理跨聚合的业务逻辑
 * 2. 协调多个仓储和聚合
 * 3. 实现复杂的业务规则验证
 * 4. 保持领域逻辑的纯粹性
 *
 * 功能与业务规则：
 * 1. 模板验证
 * 2. 版本管理
 * 3. 审核流程
 * 4. 模板统计
 */
@Injectable()
export class TemplateDomainService {
  constructor(private readonly templateRepository: TemplateRepository) {}

  /**
   * @method validateTemplate
   * @description 验证模板
   */
  validateTemplate(template: Template): TemplateValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. 验证模板名称
    if (!template.name || template.name.trim() === '') {
      errors.push('模板名称不能为空');
    }

    if (template.name.length > 100) {
      errors.push('模板名称长度不能超过100字符');
    }

    // 2. 验证模板内容
    if (!template.content || template.content.trim() === '') {
      errors.push('模板内容不能为空');
    }

    if (template.content.length > 10000) {
      errors.push('模板内容长度不能超过10000字符');
    }

    // 3. 验证邮件模板主题
    if (template.type === NotificationType.EMAIL && !template.subject) {
      errors.push('邮件模板必须包含主题');
    }

    if (template.subject && template.subject.length > 200) {
      errors.push('邮件主题长度不能超过200字符');
    }

    // 4. 验证变量一致性
    const contentVariables = this.extractVariablesFromContent(template.content);
    const declaredVariables = template.variables;

    // 检查内容中的变量是否都已声明
    for (const variable of contentVariables) {
      if (!declaredVariables.includes(variable)) {
        warnings.push(`变量 "${variable}" 在内容中使用但未声明`);
      }
    }

    // 检查声明的变量是否在内容中使用
    for (const variable of declaredVariables) {
      if (!contentVariables.includes(variable)) {
        warnings.push(`变量 "${variable}" 已声明但未在内容中使用`);
      }
    }

    // 5. 验证变量名称格式
    for (const variable of declaredVariables) {
      if (!this.isValidVariableName(variable)) {
        errors.push(
          `变量名称 "${variable}" 格式无效，只能包含字母、数字和下划线`
        );
      }
    }

    // 6. 验证分类和标签
    if (!template.category || template.category.trim() === '') {
      errors.push('模板分类不能为空');
    }

    if (template.tags.length > 10) {
      warnings.push('模板标签数量过多，建议不超过10个');
    }

    // 7. 验证语言代码
    if (!this.isValidLanguageCode(template.language)) {
      errors.push(`无效的语言代码: ${template.language}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * @method validateTemplateName
   * @description 验证模板名称唯一性
   */
  async validateTemplateName(
    name: string,
    tenantId: Uuid,
    excludeId?: string
  ): Promise<boolean> {
    const existingTemplate = await this.templateRepository.findByName(
      name,
      tenantId.toString()
    );

    if (!existingTemplate) {
      return true; // 名称可用
    }

    if (excludeId && existingTemplate.id.value === excludeId) {
      return true; // 排除自身
    }

    return false; // 名称已存在
  }

  /**
   * @method checkTemplateReviewStatus
   * @description 检查模板审核状态
   */
  checkTemplateReviewStatus(template: Template): TemplateReviewResult {
    const reasons: string[] = [];

    // 检查是否可以提交审核
    const canSubmit = template.status === TemplateStatus.DRAFT;
    if (!canSubmit) {
      reasons.push('只有草稿状态的模板才能提交审核');
    }

    // 检查是否可以审核通过
    const canApprove = template.reviewStatus === ReviewStatus.UNDER_REVIEW;
    if (!canApprove) {
      reasons.push('只有审核中的模板才能通过审核');
    }

    // 检查是否可以审核拒绝
    const canReject = template.reviewStatus === ReviewStatus.UNDER_REVIEW;
    if (!canReject) {
      reasons.push('只有审核中的模板才能拒绝');
    }

    return {
      canSubmit,
      canApprove,
      canReject,
      reasons,
    };
  }

  /**
   * @method getTemplateStatistics
   * @description 获取模板统计信息
   */
  async getTemplateStatistics(
    tenantId: Uuid,
    fromDate?: Date,
    toDate?: Date
  ): Promise<{
    total: number;
    active: number;
    draft: number;
    inactive: number;
    archived: number;
    byType: Record<NotificationType, number>;
    byStatus: Record<TemplateStatus, number>;
    byCategory: Record<string, number>;
    byLanguage: Record<string, number>;
    mostUsed: Array<{
      templateId: string;
      name: string;
      usageCount: number;
    }>;
  }> {
    const statistics = await this.templateRepository.getStatistics(
      tenantId.toString(),
      fromDate,
      toDate
    );

    const byType = await this.templateRepository.countByType(
      tenantId.toString()
    );
    const byStatus = await this.templateRepository.countByStatus(
      tenantId.toString()
    );
    const byCategory = await this.templateRepository.countByCategory(
      tenantId.toString()
    );
    const byLanguage = await this.templateRepository.countByLanguage(
      tenantId.toString()
    );
    const mostUsed = await this.templateRepository.getMostUsedTemplates(
      tenantId.toString(),
      10
    );

    return {
      ...statistics,
      byType,
      byStatus,
      byCategory,
      byLanguage,
      mostUsed,
    };
  }

  /**
   * @method duplicateTemplate
   * @description 复制模板
   */
  async duplicateTemplate(
    templateId: Uuid,
    newName: string,
    tenantId: Uuid,
    createdBy: string
  ): Promise<Template> {
    const originalTemplate = await this.templateRepository.findById(templateId);
    if (!originalTemplate) {
      throw new Error(`模板 ${templateId.toString()} 不存在`);
    }

    // 验证新名称唯一性
    const isNameAvailable = await this.validateTemplateName(newName, tenantId);
    if (!isNameAvailable) {
      throw new Error(`模板名称 "${newName}" 已存在`);
    }

    // 创建新模板
    const newTemplate = Template.create(
      originalTemplate.tenantId,
      newName,
      originalTemplate.type,
      originalTemplate.content,
      [...originalTemplate.variables],
      originalTemplate.language,
      originalTemplate.category,
      originalTemplate.subject,
      [...originalTemplate.tags],
      { ...originalTemplate.metadata },
      Uuid.fromString(createdBy)
    );

    return newTemplate;
  }

  /**
   * @method searchTemplates
   * @description 搜索模板
   */
  async searchTemplates(
    tenantId: Uuid,
    searchCriteria: {
      keyword?: string;
      type?: NotificationType;
      status?: TemplateStatus;
      category?: string;
      language?: string;
      tags?: string[];
      reviewStatus?: ReviewStatus;
    },
    limit: number = 20,
    offset: number = 0
  ): Promise<Template[]> {
    return this.templateRepository.search(
      tenantId.toString(),
      searchCriteria,
      limit,
      offset
    );
  }

  /**
   * @method getTemplateVersionHistory
   * @description 获取模板版本历史
   */
  async getTemplateVersionHistory(
    templateId: Uuid,
    _tenantId: Uuid
  ): Promise<TemplateVersionInfo[]> {
    const template = await this.templateRepository.findById(templateId);
    if (!template) {
      throw new Error(`模板 ${templateId.toString()} 不存在`);
    }

    return template.versionHistory.map((version) => ({
      version: version.version,
      content: version.content,
      subject: version.subject,
      variables: version.variables,
      status: version.status,
      reviewStatus: version.reviewStatus,
      createdAt: version.createdAt,
      updatedAt: version.updatedAt,
      createdBy: version.createdBy,
      updatedBy: version.updatedBy,
      reviewComments: version.reviewComments,
      reviewerId: version.reviewerId,
      reviewedAt: version.reviewedAt,
    }));
  }

  /**
   * @private
   * @method extractVariablesFromContent
   * @description 从内容中提取变量
   */
  private extractVariablesFromContent(content: string): string[] {
    const variables: string[] = [];
    const variableRegex = /\{\{([^}]+)\}\}/g;
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
   * @private
   * @method isValidVariableName
   * @description 验证变量名称格式
   */
  private isValidVariableName(variable: string): boolean {
    const variableRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
    return variableRegex.test(variable);
  }

  /**
   * @private
   * @method isValidLanguageCode
   * @description 验证语言代码格式
   */
  private isValidLanguageCode(language: string): boolean {
    const languageRegex = /^[a-z]{2}(-[A-Z]{2})?$/;
    return languageRegex.test(language);
  }
}
