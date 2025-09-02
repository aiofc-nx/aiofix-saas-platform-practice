/**
 * @file email-notification-sent.event.ts
 * @description 邮件通知发送事件
 *
 * 该事件记录邮件通知的发送成功，包含发送结果和统计信息。
 * 遵循DDD原则，确保事件数据的完整性和不可变性。
 */

import { BaseEvent } from '@aiofix/shared';
import { NotificationType } from '@aiofix/shared';

/**
 * @interface EmailSendResult
 * @description 邮件发送结果接口
 */
export interface EmailSendResult {
  messageId: string;
  sentAt: Date;
  deliveryStatus: 'delivered' | 'pending' | 'bounced' | 'failed';
  provider: string;
  providerMessageId?: string;
  retryCount: number;
  metadata: Record<string, unknown>;
}

/**
 * @class EmailNotificationSentEvent
 * @description 邮件通知发送事件
 *
 * 主要原理与机制：
 * 1. 继承BaseEvent，获得事件基础功能
 * 2. 不可变事件数据，确保历史记录完整性
 * 3. 包含完整的发送结果信息
 * 4. 支持事件重放和状态重建
 *
 * 功能与业务规则：
 * 1. 记录邮件通知发送成功的完整信息
 * 2. 支持发送统计和分析
 * 3. 触发后续业务流程（如用户通知）
 */
export class EmailNotificationSentEvent extends BaseEvent {
  public readonly notificationId: string;
  public readonly tenantId: string;
  public readonly type: NotificationType;
  public readonly sentAt: Date;
  public readonly messageId: string;
  public readonly deliveryStatus: string;
  public readonly provider: string;
  public readonly providerMessageId?: string;
  public readonly retryCount: number;
  public readonly eventMetadata: Record<string, unknown>;

  constructor(
    notificationId: string,
    tenantId: string,
    sentAt: Date,
    messageId: string,
    deliveryStatus: string,
    provider: string,
    retryCount: number,
    providerMessageId?: string,
    metadata: Record<string, unknown> = {},
    operatorId?: string
  ) {
    super();

    this.notificationId = notificationId;
    this.tenantId = tenantId;
    this.type = NotificationType.EMAIL;
    this.sentAt = new Date(sentAt);
    this.messageId = messageId;
    this.deliveryStatus = deliveryStatus;
    this.provider = provider;
    this.providerMessageId = providerMessageId;
    this.retryCount = retryCount;
    this.eventMetadata = { ...metadata }; // 不可变副本
  }

  /**
   * @method getEventData
   * @description 获取事件数据
   * @returns {Record<string, unknown>} 事件数据
   */
  getEventData(): Record<string, unknown> {
    return {
      notificationId: this.notificationId,
      tenantId: this.tenantId,
      type: this.type,
      sentAt: this.sentAt.toISOString(),
      messageId: this.messageId,
      deliveryStatus: this.deliveryStatus,
      provider: this.provider,
      providerMessageId: this.providerMessageId,
      retryCount: this.retryCount,
      metadata: this.eventMetadata,
    };
  }

  /**
   * @static
   * @method create
   * @description 创建邮件通知发送事件
   * @param notificationId 通知ID
   * @param tenantId 租户ID
   * @param sentAt 发送时间
   * @param messageId 消息ID
   * @param deliveryStatus 投递状态
   * @param provider 服务提供商
   * @param retryCount 重试次数
   * @param providerMessageId 提供商消息ID（可选）
   * @param metadata 元数据（可选）
   * @param operatorId 操作者ID（可选）
   * @returns {EmailNotificationSentEvent} 邮件通知发送事件
   */
  static create(
    notificationId: string,
    tenantId: string,
    sentAt: Date,
    messageId: string,
    deliveryStatus: string,
    provider: string,
    retryCount: number,
    providerMessageId?: string,
    metadata: Record<string, unknown> = {},
    operatorId?: string
  ): EmailNotificationSentEvent {
    return new EmailNotificationSentEvent(
      notificationId,
      tenantId,
      sentAt,
      messageId,
      deliveryStatus,
      provider,
      retryCount,
      providerMessageId,
      metadata,
      operatorId
    );
  }
}
