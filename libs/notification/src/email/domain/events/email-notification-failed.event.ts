/**
 * @file email-notification-failed.event.ts
 * @description 邮件通知失败事件
 *
 * 该事件记录邮件通知的发送失败，包含错误信息和重试策略。
 * 遵循DDD原则，确保事件数据的完整性和不可变性。
 */

import { BaseEvent } from '@aiofix/shared';
import { NotificationType } from '@aiofix/shared';

/**
 * @interface EmailFailureInfo
 * @description 邮件失败信息接口
 */
export interface EmailFailureInfo {
  errorCode: string;
  errorMessage: string;
  errorDetails?: Record<string, unknown>;
  retryCount: number;
  maxRetries: number;
  canRetry: boolean;
  provider: string;
  failedAt: Date;
}

/**
 * @class EmailNotificationFailedEvent
 * @description 邮件通知失败事件
 *
 * 主要原理与机制：
 * 1. 继承BaseEvent，获得事件基础功能
 * 2. 不可变事件数据，确保历史记录完整性
 * 3. 包含完整的失败信息
 * 4. 支持事件重放和状态重建
 *
 * 功能与业务规则：
 * 1. 记录邮件通知发送失败的完整信息
 * 2. 支持失败分析和重试策略
 * 3. 触发后续业务流程（如告警通知）
 */
export class EmailNotificationFailedEvent extends BaseEvent {
  public readonly notificationId: string;
  public readonly tenantId: string;
  public readonly type: NotificationType;
  public readonly errorCode: string;
  public readonly errorMessage: string;
  public readonly errorDetails?: Record<string, unknown>;
  public readonly retryCount: number;
  public readonly maxRetries: number;
  public readonly canRetry: boolean;
  public readonly provider: string;
  public readonly failedAt: Date;

  constructor(
    notificationId: string,
    tenantId: string,
    errorCode: string,
    errorMessage: string,
    retryCount: number,
    maxRetries: number,
    canRetry: boolean,
    provider: string,
    failedAt: Date,
    errorDetails?: Record<string, unknown>,
    _operatorId?: string,
  ) {
    super();

    this.notificationId = notificationId;
    this.tenantId = tenantId;
    this.type = NotificationType.EMAIL;
    this.errorCode = errorCode;
    this.errorMessage = errorMessage;
    this.errorDetails = errorDetails ? { ...errorDetails } : undefined;
    this.retryCount = retryCount;
    this.maxRetries = maxRetries;
    this.canRetry = canRetry;
    this.provider = provider;
    this.failedAt = new Date(failedAt);
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
      errorCode: this.errorCode,
      errorMessage: this.errorMessage,
      errorDetails: this.errorDetails,
      retryCount: this.retryCount,
      maxRetries: this.maxRetries,
      canRetry: this.canRetry,
      provider: this.provider,
      failedAt: this.failedAt.toISOString(),
    };
  }

  /**
   * @static
   * @method create
   * @description 创建邮件通知失败事件
   * @param notificationId 通知ID
   * @param tenantId 租户ID
   * @param errorCode 错误代码
   * @param errorMessage 错误消息
   * @param retryCount 重试次数
   * @param maxRetries 最大重试次数
   * @param canRetry 是否可以重试
   * @param provider 服务提供商
   * @param failedAt 失败时间
   * @param errorDetails 错误详情（可选）
   * @param operatorId 操作者ID（可选）
   * @returns {EmailNotificationFailedEvent} 邮件通知失败事件
   */
  static create(
    notificationId: string,
    tenantId: string,
    errorCode: string,
    errorMessage: string,
    retryCount: number,
    maxRetries: number,
    canRetry: boolean,
    provider: string,
    failedAt: Date,
    errorDetails?: Record<string, unknown>,
    operatorId?: string,
  ): EmailNotificationFailedEvent {
    return new EmailNotificationFailedEvent(
      notificationId,
      tenantId,
      errorCode,
      errorMessage,
      retryCount,
      maxRetries,
      canRetry,
      provider,
      failedAt,
      errorDetails,
      operatorId,
    );
  }
}
