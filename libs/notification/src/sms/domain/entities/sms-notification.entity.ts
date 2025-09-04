/**
 * @file sms-notification.entity.ts
 * @description 短信通知实体
 *
 * 该实体负责管理短信通知的核心业务逻辑，包括：
 * - 短信通知的创建和状态管理
 * - 短信发送的验证和业务规则
 * - 短信通知的生命周期管理
 *
 * 遵循DDD原则，封装短信通知的领域逻辑。
 */

import {
  DataIsolationAwareEntity,
  Uuid,
  DataIsolationLevel,
  DataPrivacyLevel,
} from '@aiofix/shared';
import {
  NotificationType,
  NotificationStatus,
  NotificationPriority,
  Notification as INotification,
} from '@aiofix/shared';
import { PhoneNumber } from '@aiofix/shared';

/**
 * @class SmsNotification
 * @description 短信通知实体类
 *
 * 该实体继承自DataIsolationAwareEntity，提供多租户数据隔离能力，
 * 并实现短信通知的特定业务逻辑。
 */
export class SmsNotification
  extends DataIsolationAwareEntity
  implements INotification
{
  private readonly _type: NotificationType = NotificationType.SMS;
  private readonly _templateId: Uuid;
  private readonly _recipients: PhoneNumber[];
  private readonly _data: Record<string, unknown>;
  private _status: NotificationStatus;
  private readonly _priority: NotificationPriority;
  private readonly _scheduledAt?: Date;
  private _sentAt?: Date;
  private _retryCount: number;
  private readonly _maxRetries: number;
  private _errorMessage?: string;
  private readonly _metadata: Record<string, unknown>;
  // 发送相关属性
  private _messageId?: string;
  private _deliveryStatus?: string;
  private _provider?: string;
  private _providerMessageId?: string;
  private _errorCode?: string;
  private _errorDetails?: Record<string, unknown>;
  private _canRetry: boolean = true;
  private _failedAt?: Date;

  /**
   * @constructor
   * @param id 通知ID
   * @param tenantId 租户ID
   * @param templateId 模板ID
   * @param recipients 收件人列表
   * @param data 模板数据
   * @param priority 优先级
   * @param scheduledAt 计划发送时间
   * @param metadata 元数据
   */
  constructor(
    id: Uuid,
    tenantId: Uuid,
    templateId: Uuid,
    recipients: PhoneNumber[],
    data: Record<string, unknown>,
    priority: NotificationPriority = NotificationPriority.NORMAL,
    scheduledAt?: Date,
    metadata: Record<string, unknown> = {},
  ) {
    super(tenantId, DataIsolationLevel.TENANT, DataPrivacyLevel.PROTECTED, id);
    this._templateId = templateId;
    this._recipients = recipients;
    this._data = data;
    this._status = NotificationStatus.PENDING;
    this._priority = priority;
    this._scheduledAt = scheduledAt;
    this._retryCount = 0;
    this._maxRetries = 3;
    this._metadata = metadata;
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
   * @method getTemplateId
   * @description 获取模板ID
   * @returns {string} 模板ID
   */
  get templateId(): Uuid {
    return this._templateId;
  }

  /**
   * @method getRecipients
   * @description 获取收件人列表
   * @returns {PhoneNumber[]} 收件人列表
   */
  get recipients(): PhoneNumber[] {
    return [...this._recipients] as PhoneNumber[];
  }

  /**
   * @method getRecipientPhones
   * @description 获取收件人手机号码字符串列表
   * @returns {string[]} 收件人手机号码列表
   */
  get recipientPhones(): string[] {
    return this._recipients.map((recipient: PhoneNumber) => recipient.value);
  }

  /**
   * @method getRecipient
   * @description 获取收件人（兼容接口）
   * @returns {string | string[]} 收件人
   */
  get recipient(): string | string[] {
    return this.recipientPhones;
  }

  /**
   * @method getData
   * @description 获取模板数据
   * @returns {Record<string, unknown>} 模板数据
   */
  get data(): Record<string, unknown> {
    return this._data;
  }

  /**
   * @method getStatus
   * @description 获取通知状态
   * @returns {NotificationStatus} 通知状态
   */
  get status(): NotificationStatus {
    return this._status;
  }

  /**
   * @method getPriority
   * @description 获取优先级
   * @returns {NotificationPriority} 优先级
   */
  get priority(): NotificationPriority {
    return this._priority;
  }

  /**
   * @method getScheduledAt
   * @description 获取计划发送时间
   * @returns {Date | undefined} 计划发送时间
   */
  get scheduledAt(): Date | undefined {
    return this._scheduledAt;
  }

  /**
   * @method getSentAt
   * @description 获取实际发送时间
   * @returns {Date | undefined} 实际发送时间
   */
  get sentAt(): Date | undefined {
    return this._sentAt;
  }

  /**
   * @method getRetryCount
   * @description 获取重试次数
   * @returns {number} 重试次数
   */
  get retryCount(): number {
    return this._retryCount;
  }

  /**
   * @method getMaxRetries
   * @description 获取最大重试次数
   * @returns {number} 最大重试次数
   */
  get maxRetries(): number {
    return this._maxRetries;
  }

  /**
   * @method getErrorMessage
   * @description 获取错误信息
   * @returns {string | undefined} 错误信息
   */
  get errorMessage(): string | undefined {
    return this._errorMessage;
  }

  /**
   * @method getMetadata
   * @description 获取元数据
   * @returns {Record<string, unknown>} 元数据
   */
  get metadata(): Record<string, unknown> {
    return this._metadata;
  }

  // 发送相关getter方法
  get messageId(): string | undefined {
    return this._messageId;
  }

  get deliveryStatus(): string | undefined {
    return this._deliveryStatus;
  }

  get provider(): string | undefined {
    return this._provider;
  }

  get providerMessageId(): string | undefined {
    return this._providerMessageId;
  }

  get errorCode(): string | undefined {
    return this._errorCode;
  }

  get errorDetails(): Record<string, unknown> | undefined {
    return this._errorDetails;
  }

  get canRetry(): boolean {
    return this._canRetry;
  }

  get failedAt(): Date | undefined {
    return this._failedAt;
  }

  /**
   * @method markAsSending
   * @description 标记为发送中
   */
  markAsSending(): void {
    if (this._status !== NotificationStatus.PENDING) {
      throw new Error('只有待发送状态的通知才能标记为发送中');
    }
    this._status = NotificationStatus.SENDING;
  }

  /**
   * @method markAsSent
   * @description 标记为已发送
   */
  markAsSent(params: {
    messageId: string;
    deliveryStatus: string;
    provider: string;
    providerMessageId?: string;
    retryCount: number;
  }): void {
    if (this._status !== NotificationStatus.PENDING) {
      throw new Error('只有待发送状态的通知才能标记为已发送');
    }
    this._status = NotificationStatus.SENT;
    this._sentAt = new Date();
    this._messageId = params.messageId;
    this._deliveryStatus = params.deliveryStatus;
    this._provider = params.provider;
    this._providerMessageId = params.providerMessageId;
    this._retryCount = params.retryCount;
  }

  /**
   * @method markAsFailed
   * @description 标记为发送失败
   */
  markAsFailed(params: {
    errorCode: string;
    errorMessage: string;
    errorDetails?: Record<string, unknown>;
    provider: string;
    retryCount: number;
    maxRetries: number;
    canRetry: boolean;
  }): void {
    if (this._status !== NotificationStatus.PENDING) {
      throw new Error('只有待发送状态的通知才能标记为失败');
    }
    this._status = NotificationStatus.FAILED;
    this._errorMessage = params.errorMessage;
    this._retryCount = params.retryCount;
    this._errorCode = params.errorCode;
    this._errorDetails = params.errorDetails;
    this._provider = params.provider;
    this._canRetry = params.canRetry;
    this._failedAt = new Date();
  }

  /**
   * @method retry
   * @description 重试发送
   */
  retry(): void {
    if (this._status !== NotificationStatus.FAILED) {
      throw new Error('只有失败状态的通知才能重试');
    }
    if (this._retryCount >= this._maxRetries) {
      throw new Error('已达到最大重试次数');
    }
    this._retryCount++;
    this._status = NotificationStatus.PENDING;
    this._errorMessage = undefined;
  }

  /**
   * @method resetForRetry
   * @description 重置为可重试状态
   */
  resetForRetry(): void {
    this._status = NotificationStatus.PENDING;
    this._errorMessage = undefined;
    this._errorCode = undefined;
    this._errorDetails = undefined;
    this._failedAt = undefined;
    this._canRetry = true;
  }

  /**
   * @method cancel
   * @description 取消发送
   */
  cancel(): void {
    if (this._status === NotificationStatus.SENT) {
      throw new Error('已发送的通知不能取消');
    }
    this._status = NotificationStatus.CANCELLED;
  }

  /**
   * @method markAsCancelled
   * @description 标记为已取消
   */
  markAsCancelled(): void {
    if (this._status === NotificationStatus.SENT) {
      throw new Error('已发送的通知不能取消');
    }
    this._status = NotificationStatus.CANCELLED;
  }

  /**
   * @method isScheduled
   * @description 检查是否为定时发送
   * @returns {boolean} 是否为定时发送
   */
  isScheduled(): boolean {
    return this._scheduledAt !== undefined;
  }

  /**
   * @method shouldSendNow
   * @description 检查是否应该立即发送
   * @returns {boolean} 是否应该立即发送
   */
  shouldSendNow(): boolean {
    if (!this.isScheduled()) {
      return true;
    }
    return (this._scheduledAt ?? new Date()) <= new Date();
  }

  /**
   * @method validateRecipient
   * @description 验证收件人格式
   * @returns {boolean} 收件人格式是否有效
   */
  validateRecipient(): boolean {
    return this._recipients.length > 0;
  }

  /**
   * @method create
   * @description 创建短信通知实例
   * @param tenantId 租户ID
   * @param templateId 模板ID
   * @param recipients 收件人列表
   * @param data 模板数据
   * @param priority 优先级
   * @param scheduledAt 计划发送时间
   * @param metadata 元数据
   * @returns {SmsNotification} 短信通知实例
   */
  static create(
    tenantId: Uuid,
    templateId: Uuid,
    recipients: PhoneNumber[],
    data: Record<string, unknown>,
    priority: NotificationPriority = NotificationPriority.NORMAL,
    scheduledAt?: Date,
    metadata: Record<string, unknown> = {},
  ): SmsNotification {
    const id = Uuid.generate();
    return new SmsNotification(
      id,
      tenantId,
      templateId,
      recipients,
      data,
      priority,
      scheduledAt,
      metadata,
    );
  }

  /**
   * @method createFromStrings
   * @description 从字符串创建短信通知实例
   * @param tenantId 租户ID
   * @param templateId 模板ID
   * @param recipientPhones 收件人手机号码字符串列表
   * @param data 模板数据
   * @param priority 优先级
   * @param scheduledAt 计划发送时间
   * @param metadata 元数据
   * @returns {SmsNotification} 短信通知实例
   */
  static createFromStrings(
    tenantId: Uuid,
    templateId: Uuid,
    recipientPhones: string | string[],
    data: Record<string, unknown>,
    priority: NotificationPriority = NotificationPriority.NORMAL,
    scheduledAt?: Date,
    metadata: Record<string, unknown> = {},
  ): SmsNotification {
    const phones = Array.isArray(recipientPhones)
      ? recipientPhones
      : [recipientPhones];
    const recipients = phones.map((phone: string) => PhoneNumber.create(phone));

    return SmsNotification.create(
      tenantId,
      templateId,
      recipients,
      data,
      priority,
      scheduledAt,
      metadata,
    );
  }
}
