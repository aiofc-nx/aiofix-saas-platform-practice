/**
 * @file template.entity.ts
 * @description 通知模板实体
 *
 * 该实体负责管理通知模板的核心业务逻辑，包括：
 * - 模板的创建和状态管理
 * - 模板内容的验证和业务规则
 * - 模板的生命周期管理
 *
 * 遵循DDD原则，封装通知模板的领域逻辑。
 */

import {
  DataIsolationAwareEntity,
  Uuid,
  DataIsolationLevel,
  DataPrivacyLevel,
} from '@aiofix/shared';
import {
  NotificationType,
  TemplateStatus,
  Template as ITemplate,
} from '@aiofix/shared';

/**
 * @enum ReviewStatus
 * @description 审核状态枚举
 */
export enum ReviewStatus {
  PENDING = 'pending', // 待审核
  APPROVED = 'approved', // 已通过
  REJECTED = 'rejected', // 已拒绝
  UNDER_REVIEW = 'under_review', // 审核中
}

/**
 * @interface TemplateVersion
 * @description 模板版本信息
 */
export interface TemplateVersion {
  version: number;
  content: string;
  subject?: string;
  variables: string[];
  status: TemplateStatus;
  reviewStatus: ReviewStatus;
  createdBy: Uuid;
  createdAt: Date;
  updatedBy: Uuid;
  updatedAt: Date;
  reviewComments?: string;
  reviewerId?: Uuid;
  reviewedAt?: Date;
}

/**
 * @class Template
 * @description 通知模板实体类
 *
 * 该实体继承自DataIsolationAwareEntity，提供多租户数据隔离能力，
 * 并实现通知模板的特定业务逻辑。
 */
export class Template extends DataIsolationAwareEntity implements ITemplate {
  private readonly _name: string;
  private readonly _type: NotificationType;
  private _subject?: string;
  private _content: string;
  private _variables: string[];
  private _status: TemplateStatus;
  private readonly _language: string;
  private readonly _category: string;
  private readonly _tags: string[];
  private _metadata: Record<string, unknown>;
  // 版本管理相关属性
  private _templateVersion: number = 1;
  private readonly _versionHistory: TemplateVersion[] = [];
  private readonly _isLatestVersion: boolean = true;
  // 审核相关属性
  private _reviewStatus: ReviewStatus = ReviewStatus.PENDING;
  private _reviewerId?: Uuid;
  private _reviewedAt?: Date;
  private _reviewComments?: string;
  // 使用统计相关属性
  private _usageCount: number = 0;
  private _lastUsedAt?: Date;
  private readonly _createdBy: Uuid;
  private _updatedBy: Uuid;

  /**
   * @constructor
   * @param id 模板ID
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
   * @param createdBy 创建者
   * @param updatedBy 更新者
   */
  constructor(
    id: Uuid,
    tenantId: Uuid,
    name: string,
    type: NotificationType,
    content: string,
    variables: string[],
    language: string,
    category: string,
    subject?: string,
    tags: string[] = [],
    metadata: Record<string, unknown> = {},
    createdBy: Uuid = Uuid.fromString('system'),
    updatedBy: Uuid = Uuid.fromString('system'),
  ) {
    super(tenantId, DataIsolationLevel.TENANT, DataPrivacyLevel.PROTECTED, id);
    this._name = name;
    this._type = type;
    this._subject = subject;
    this._content = content;
    this._variables = variables;
    this._status = TemplateStatus.DRAFT;
    this._language = language;
    this._category = category;
    this._tags = tags;
    this._metadata = metadata;
    this._createdBy = createdBy;
    this._updatedBy = updatedBy;
  }

  /**
   * @method getName
   * @description 获取模板名称
   * @returns {string} 模板名称
   */
  get name(): string {
    return this._name;
  }

  /**
   * @method getType
   * @description 获取通知类型
   * @returns {NotificationType} 通知类型
   */
  get type(): NotificationType {
    return this._type;
  }

  /**
   * @method getSubject
   * @description 获取主题
   * @returns {string | undefined} 主题
   */
  get subject(): string | undefined {
    return this._subject;
  }

  /**
   * @method getContent
   * @description 获取模板内容
   * @returns {string} 模板内容
   */
  get content(): string {
    return this._content;
  }

  /**
   * @method getVariables
   * @description 获取模板变量
   * @returns {string[]} 模板变量
   */
  get variables(): string[] {
    return this._variables;
  }

  /**
   * @method getStatus
   * @description 获取模板状态
   * @returns {TemplateStatus} 模板状态
   */
  get status(): TemplateStatus {
    return this._status;
  }

  /**
   * @method getTemplateVersion
   * @description 获取模板版本信息
   * @returns {object} 模板版本信息
   */
  get templateVersion(): {
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
  } {
    return {
      version: this._templateVersion,
      content: this._content,
      subject: this._subject,
      variables: this._variables,
      status: this._status,
      reviewStatus: this._reviewStatus,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      createdBy: this._createdBy,
      updatedBy: this._updatedBy,
    };
  }

  /**
   * @method getLanguage
   * @description 获取语言
   * @returns {string} 语言
   */
  get language(): string {
    return this._language;
  }

  /**
   * @method getCategory
   * @description 获取分类
   * @returns {string} 分类
   */
  get category(): string {
    return this._category;
  }

  /**
   * @method getTags
   * @description 获取标签
   * @returns {string[]} 标签
   */
  get tags(): string[] {
    return this._tags;
  }

  /**
   * @method getMetadata
   * @description 获取元数据
   * @returns {Record<string, unknown>} 元数据
   */
  get metadata(): Record<string, unknown> {
    return this._metadata;
  }

  // 版本管理相关getter
  get versionHistory(): TemplateVersion[] {
    return [...this._versionHistory];
  }

  get isLatestVersion(): boolean {
    return this._isLatestVersion;
  }

  // 审核相关getter
  get reviewStatus(): ReviewStatus {
    return this._reviewStatus;
  }

  get reviewerId(): Uuid | undefined {
    return this._reviewerId;
  }

  get reviewedAt(): Date | undefined {
    return this._reviewedAt;
  }

  get reviewComments(): string | undefined {
    return this._reviewComments;
  }

  // 使用统计相关getter
  get usageCount(): number {
    return this._usageCount;
  }

  get lastUsedAt(): Date | undefined {
    return this._lastUsedAt;
  }

  get createdBy(): Uuid {
    return this._createdBy;
  }

  get updatedBy(): Uuid {
    return this._updatedBy;
  }

  /**
   * @method updateContent
   * @description 更新模板内容
   * @param content 新内容
   * @param variables 新变量
   * @param subject 新主题（邮件专用）
   * @param updatedBy 更新者
   */
  updateContent(
    content: string,
    variables: string[],
    subject?: string,
    updatedBy: Uuid = Uuid.fromString('system'),
  ): void {
    // 保存当前版本到历史记录
    this.saveVersionToHistory();

    // 更新内容
    this._content = content;
    this._variables = variables;
    if (subject !== undefined) {
      this._subject = subject;
    }

    // 增加版本号
    this._templateVersion++;
    this._status = TemplateStatus.DRAFT;
    this._reviewStatus = ReviewStatus.PENDING;
    this._updatedBy = updatedBy;
    this.updateTimestamp();
  }

  /**
   * @method activate
   * @description 激活模板
   */
  activate(): void {
    if (this._reviewStatus !== ReviewStatus.APPROVED) {
      throw new Error('只有审核通过的模板才能激活');
    }
    if (!this.validateContent()) {
      throw new Error('模板内容验证失败，无法激活');
    }
    this._status = TemplateStatus.ACTIVE;
  }

  /**
   * @method deactivate
   * @description 停用模板
   */
  deactivate(): void {
    if (this._status !== TemplateStatus.ACTIVE) {
      throw new Error('只有激活状态的模板才能停用');
    }
    this._status = TemplateStatus.INACTIVE;
  }

  /**
   * @method archive
   * @description 归档模板
   */
  archive(): void {
    if (this._status === TemplateStatus.ACTIVE) {
      throw new Error('激活状态的模板不能直接归档，请先停用');
    }
    this._status = TemplateStatus.ARCHIVED;
  }

  /**
   * @method addTag
   * @description 添加标签
   * @param tag 标签
   */
  addTag(tag: string): void {
    if (!this._tags.includes(tag)) {
      this._tags.push(tag);
    }
  }

  /**
   * @method removeTag
   * @description 移除标签
   * @param tag 标签
   */
  removeTag(tag: string): void {
    const index = this._tags.indexOf(tag);
    if (index > -1) {
      this._tags.splice(index, 1);
    }
  }

  /**
   * @method updateMetadata
   * @description 更新元数据
   * @param metadata 新元数据
   */
  updateMetadata(metadata: Record<string, unknown>): void {
    this._metadata = { ...this._metadata, ...metadata };
  }

  /**
   * @method validateContent
   * @description 验证模板内容
   * @returns {boolean} 内容是否有效
   */
  validateContent(): boolean {
    // 检查内容是否为空
    if (!this._content || this._content.trim().length === 0) {
      return false;
    }

    // 检查变量是否在内容中使用
    const usedVariables = this.extractVariablesFromContent();
    const unusedVariables = this._variables.filter(
      variable => !usedVariables.includes(variable),
    );

    if (unusedVariables.length > 0) {
      return false;
    }

    // 检查内容长度限制
    if (this._type === NotificationType.SMS && this._content.length > 160) {
      return false;
    }

    return true;
  }

  /**
   * @method extractVariablesFromContent
   * @description 从内容中提取变量
   * @returns {string[]} 变量列表
   */
  extractVariablesFromContent(): string[] {
    const variableRegex = /\{\{([^}]+)\}\}/g;
    const variables: string[] = [];
    let match;

    while ((match = variableRegex.exec(this._content)) !== null) {
      const variable = match[1].trim();
      if (!variables.includes(variable)) {
        variables.push(variable);
      }
    }

    return variables;
  }

  /**
   * @method render
   * @description 渲染模板
   * @param data 模板数据
   * @returns {string} 渲染后的内容
   */
  render(data: Record<string, unknown>): string {
    let renderedContent = this._content;

    // 替换变量
    this._variables.forEach(variable => {
      const value = data[variable];
      const placeholder = `{{${variable}}}`;
      renderedContent = renderedContent.replace(
        new RegExp(placeholder, 'g'),
        value !== undefined
          ? typeof value === 'string'
            ? value
            : JSON.stringify(value)
          : '',
      );
    });

    return renderedContent;
  }

  /**
   * @method isActive
   * @description 检查模板是否激活
   * @returns {boolean} 是否激活
   */
  isActive(): boolean {
    return this._status === TemplateStatus.ACTIVE;
  }

  /**
   * @method canBeActivated
   * @description 检查模板是否可以激活
   * @returns {boolean} 是否可以激活
   */
  canBeActivated(): boolean {
    return this._status === TemplateStatus.DRAFT && this.validateContent();
  }

  /**
   * @method create
   * @description 创建模板实例
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
   * @param createdBy 创建者
   * @returns {Template} 模板实例
   */
  static create(
    tenantId: Uuid,
    name: string,
    type: NotificationType,
    content: string,
    variables: string[],
    language: string,
    category: string,
    subject?: string,
    tags: string[] = [],
    metadata: Record<string, unknown> = {},
    createdBy: Uuid = Uuid.fromString('system'),
  ): Template {
    // 验证必填字段
    if (!name || name.trim() === '') {
      throw new Error('模板名称不能为空');
    }
    if (!content || content.trim() === '') {
      throw new Error('模板内容不能为空');
    }
    if (!category || category.trim() === '') {
      throw new Error('模板分类不能为空');
    }

    const id = Uuid.generate();
    return new Template(
      id,
      tenantId,
      name,
      type,
      content,
      variables,
      language,
      category,
      subject,
      tags,
      metadata,
      createdBy,
      createdBy,
    );
  }

  /**
   * @private
   * @method saveVersionToHistory
   * @description 保存当前版本到历史记录
   */
  private saveVersionToHistory(): void {
    const version: TemplateVersion = {
      version: this._templateVersion,
      content: this._content,
      subject: this._subject,
      variables: [...this._variables],
      status: this._status,
      reviewStatus: this._reviewStatus,
      createdBy: this._createdBy,
      createdAt: this.createdAt,
      updatedBy: this._updatedBy,
      updatedAt: this.updatedAt,
      reviewComments: this._reviewComments,
      reviewerId: this._reviewerId,
      reviewedAt: this._reviewedAt,
    };

    this._versionHistory.push(version);
  }

  /**
   * @method submitForReview
   * @description 提交审核
   */
  submitForReview(): void {
    if (this._status !== TemplateStatus.DRAFT) {
      throw new Error('只有草稿状态的模板才能提交审核');
    }
    this._reviewStatus = ReviewStatus.UNDER_REVIEW;
    this.updateTimestamp();
  }

  /**
   * @method approve
   * @description 审核通过
   * @param reviewerId 审核者ID
   * @param comments 审核意见
   */
  approve(reviewerId: Uuid, comments?: string): void {
    if (this._reviewStatus !== ReviewStatus.UNDER_REVIEW) {
      throw new Error('只有审核中的模板才能通过审核');
    }
    this._reviewStatus = ReviewStatus.APPROVED;
    this._reviewerId = reviewerId;
    this._reviewedAt = new Date();
    this._reviewComments = comments;
    this.updateTimestamp();
  }

  /**
   * @method reject
   * @description 审核拒绝
   * @param reviewerId 审核者ID
   * @param comments 拒绝原因
   */
  reject(reviewerId: Uuid, comments: string): void {
    if (this._reviewStatus !== ReviewStatus.UNDER_REVIEW) {
      throw new Error('只有审核中的模板才能拒绝');
    }
    this._reviewStatus = ReviewStatus.REJECTED;
    this._reviewerId = reviewerId;
    this._reviewedAt = new Date();
    this._reviewComments = comments;
    this.updateTimestamp();
  }

  /**
   * @method incrementUsage
   * @description 增加使用次数
   */
  incrementUsage(): void {
    this._usageCount++;
    this._lastUsedAt = new Date();
  }

  /**
   * @method getVersion
   * @description 获取指定版本
   * @param version 版本号
   * @returns {TemplateVersion | undefined} 版本信息
   */
  getVersion(version: number): TemplateVersion | undefined {
    // 如果是当前版本，返回当前版本信息
    if (version === this._templateVersion) {
      return {
        version: this._templateVersion,
        content: this._content,
        subject: this._subject,
        variables: [...this._variables],
        status: this._status,
        reviewStatus: this._reviewStatus,
        createdAt: this._createdAt,
        updatedAt: this._updatedAt,
        createdBy: this._createdBy,
        updatedBy: this._updatedBy,
      };
    }
    // 否则从历史记录中查找
    return this._versionHistory.find(v => v.version === version);
  }

  /**
   * @method revertToVersion
   * @description 回滚到指定版本
   * @param version 版本号
   * @param updatedBy 更新者
   */
  revertToVersion(
    version: number,
    updatedBy: Uuid = Uuid.fromString('system'),
  ): void {
    const targetVersion = this.getVersion(version);
    if (!targetVersion) {
      throw new Error(`版本 ${version} 不存在`);
    }

    // 保存当前版本到历史记录
    this.saveVersionToHistory();

    // 回滚到目标版本
    this._content = targetVersion.content;
    this._subject = targetVersion.subject;
    this._variables = [...targetVersion.variables];
    this._status = targetVersion.status;
    this._reviewStatus = targetVersion.reviewStatus;
    this._templateVersion++;
    this._updatedBy = updatedBy;
    this.updateTimestamp();
  }
}
