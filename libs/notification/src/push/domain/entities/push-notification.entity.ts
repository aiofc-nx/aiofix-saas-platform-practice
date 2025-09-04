/**
 * @file push-notification.entity.ts
 * @description 推送通知实体
 *
 * 该实体负责管理推送通知的核心业务逻辑，包括：
 * - 推送通知的创建和状态管理
 * - 推送发送的验证和业务规则
 * - 推送通知的生命周期管理
 *
 * 遵循DDD原则，封装推送通知的领域逻辑。
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

/**
 * @class PushNotification
 * @description 推送通知实体类
 *
 * 该实体继承自DataIsolationAwareEntity，提供多租户数据隔离能力，
 * 并实现推送通知的特定业务逻辑。
 */
export class PushNotification
  extends DataIsolationAwareEntity
  implements INotification
{
  private readonly _type: NotificationType = NotificationType.PUSH;
  private readonly _templateId: Uuid;
  private readonly _recipients: string[];
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
    recipients: string[],
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
   * @returns {string[]} 收件人列表
   */
  get recipients(): string[] {
    return [...this._recipients];
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

  // 兼容接口的getter
  get recipient(): string | string[] {
    return this._recipients;
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
    return this._recipients.every(token => this.isValidDeviceToken(token));
  }

  /**
   * @method isValidDeviceToken
   * @description 验证设备令牌格式
   * @param token 设备令牌
   * @returns {boolean} 设备令牌格式是否有效
   */
  private isValidDeviceToken(token: string): boolean {
    // 支持Firebase、APNS等推送服务的设备令牌格式
    // Firebase FCM token: 通常为152个字符的字符串
    // APNS device token: 通常为64个字符的十六进制字符串
    const tokenRegex = /^[a-zA-Z0-9:_-]{64,152}$/;
    return tokenRegex.test(token);
  }

  /**
   * @method getPlatform
   * @description 获取推送平台类型
   * @returns {string} 推送平台类型
   */
  getPlatform(): string {
    const token = this._recipients[0];
    if (token.startsWith('ios_') || token.length === 64) {
      return 'ios';
    } else if (token.startsWith('android_') || token.length > 100) {
      return 'android';
    }
    return 'unknown';
  }

  /**
   * @method create
   * @description 创建推送通知实例
   * @param tenantId 租户ID
   * @param templateId 模板ID
   * @param recipients 收件人列表
   * @param data 模板数据
   * @param priority 优先级
   * @param scheduledAt 计划发送时间
   * @param metadata 元数据
   * @returns {PushNotification} 推送通知实例
   */
  static create(
    tenantId: Uuid,
    templateId: Uuid,
    recipients: string[],
    data: Record<string, unknown>,
    priority: NotificationPriority = NotificationPriority.NORMAL,
    scheduledAt?: Date,
    metadata: Record<string, unknown> = {},
  ): PushNotification {
    const id = Uuid.generate();
    return new PushNotification(
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
}
