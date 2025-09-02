/**
 * @file email-notification-created.event.ts
 * @description 邮件通知创建事件
 *
 * 该事件记录邮件通知的创建，包含完整的业务上下文信息。
 * 遵循DDD原则，确保事件数据的完整性和不可变性。
 */

import { BaseEvent } from '@aiofix/shared';
import {
  NotificationType,
  NotificationStatus,
  NotificationPriority,
} from '@aiofix/shared';

/**
 * @interface EmailNotificationData
 * @description 邮件通知数据接口
 */
export interface EmailNotificationData {
  templateId: string;
  recipients: string[];
  subject?: string;
  data: Record<string, unknown>;
  priority: NotificationPriority;
  scheduledAt?: Date;
  metadata: Record<string, unknown>;
}

/**
 * @class EmailNotificationCreatedEvent
 * @description 邮件通知创建事件
 *
 * 主要原理与机制：
 * 1. 继承BaseEvent，获得事件基础功能
 * 2. 不可变事件数据，确保历史记录完整性
 * 3. 包含完整的业务上下文信息
 * 4. 支持事件重放和状态重建
 *
 * 功能与业务规则：
 * 1. 记录邮件通知创建的完整信息
 * 2. 支持审计和合规要求
 * 3. 触发后续业务流程（如发送队列）
 */
export class EmailNotificationCreatedEvent extends BaseEvent {
  public readonly notificationId: string;
  public readonly tenantId: string;
  public readonly type: NotificationType;
  public readonly templateId: string;
  public readonly recipients: string[];
  public readonly subject?: string;
  public readonly data: Record<string, unknown>;
  public readonly priority: NotificationPriority;
  public readonly status: NotificationStatus;
  public readonly scheduledAt?: Date;
  public readonly eventMetadata: Record<string, unknown>;

  constructor(
    notificationId: string,
    tenantId: string,
    templateId: string,
    recipients: string[],
    data: Record<string, unknown>,
    priority: NotificationPriority,
    status: NotificationStatus,
    subject?: string,
    scheduledAt?: Date,
    metadata: Record<string, unknown> = {},
    operatorId?: string
  ) {
    super();

    this.notificationId = notificationId;
    this.tenantId = tenantId;
    this.type = NotificationType.EMAIL;
    this.templateId = templateId;
    this.recipients = [...recipients]; // 不可变副本
    this.subject = subject;
    this.data = { ...data }; // 不可变副本
    this.priority = priority;
    this.status = status;
    this.scheduledAt = scheduledAt ? new Date(scheduledAt) : undefined;
    this.eventMetadata = { ...metadata }; // 不可变副本
  }

  /**
   * @method serializeEventData
   * @description 序列化事件数据
   * @returns {Record<string, unknown>} 序列化后的事件数据
   */
  getEventData(): Record<string, unknown> {
    return {
      notificationId: this.notificationId,
      tenantId: this.tenantId,
      type: this.type,
      templateId: this.templateId,
      recipients: this.recipients,
      subject: this.subject,
      data: this.data,
      priority: this.priority,
      status: this.status,
      scheduledAt: this.scheduledAt?.toISOString(),
      metadata: this.eventMetadata,
    };
  }

  /**
   * @static
   * @method create
   * @description 创建邮件通知创建事件
   * @param notificationId 通知ID
   * @param tenantId 租户ID
   * @param templateId 模板ID
   * @param recipients 收件人列表
   * @param data 模板数据
   * @param priority 优先级
   * @param status 状态
   * @param subject 邮件主题（可选）
   * @param scheduledAt 计划发送时间（可选）
   * @param metadata 元数据（可选）
   * @param operatorId 操作者ID（可选）
   * @returns {EmailNotificationCreatedEvent} 邮件通知创建事件
   */
  static create(
    notificationId: string,
    tenantId: string,
    templateId: string,
    recipients: string[],
    data: Record<string, unknown>,
    priority: NotificationPriority,
    status: NotificationStatus,
    subject?: string,
    scheduledAt?: Date,
    metadata: Record<string, unknown> = {},
    operatorId?: string
  ): EmailNotificationCreatedEvent {
    return new EmailNotificationCreatedEvent(
      notificationId,
      tenantId,
      templateId,
      recipients,
      data,
      priority,
      status,
      subject,
      scheduledAt,
      metadata,
      operatorId
    );
  }
}
