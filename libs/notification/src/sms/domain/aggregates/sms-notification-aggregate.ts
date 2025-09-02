/**
 * @file sms-notification-aggregate.ts
 * @description 短信通知聚合
 *
 * 该聚合封装了短信通知的完整生命周期管理，包括创建、发送、重试等操作。
 * 遵循DDD聚合设计原则，确保业务一致性和数据完整性。
 */

import { BaseEvent, Uuid, PhoneNumber } from '@aiofix/shared';
import { SmsNotification } from '../entities/sms-notification.entity';
import { SmsNotificationRepository } from '../repositories/sms-notification.repository';
import { NotificationStatus, NotificationPriority } from '@aiofix/shared';

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
 * @interface CreateSmsNotificationCommand
 * @description 创建短信通知命令
 */
export interface CreateSmsNotificationCommand {
  tenantId: string;
  templateId: string;
  recipients: string[];
  data: Record<string, unknown>;
  priority: NotificationPriority;
  scheduledAt?: Date;
  metadata?: Record<string, unknown>;
}

/**
 * @interface SendSmsNotificationCommand
 * @description 发送短信通知命令
 */
export interface SendSmsNotificationCommand {
  notificationId: string;
  provider: string;
  messageId: string;
  deliveryStatus: string;
  providerMessageId?: string;
  retryCount: number;
}

/**
 * @interface FailSmsNotificationCommand
 * @description 短信通知失败命令
 */
export interface FailSmsNotificationCommand {
  notificationId: string;
  errorCode: string;
  errorMessage: string;
  errorDetails?: Record<string, unknown>;
  provider: string;
  retryCount: number;
  maxRetries: number;
  canRetry: boolean;
}

/**
 * @class SmsNotificationAggregate
 * @description 短信通知聚合
 *
 * 主要原理与机制：
 * 1. 封装短信通知的完整生命周期
 * 2. 确保业务规则的一致性
 * 3. 发布领域事件
 * 4. 管理聚合状态转换
 *
 * 功能与业务规则：
 * 1. 创建短信通知
 * 2. 发送短信通知
 * 3. 处理发送失败
 * 4. 重试机制管理
 * 5. 状态转换控制
 */
export class SmsNotificationAggregate extends AggregateRoot {
  private notification: SmsNotification | null = null;

  constructor(
    private readonly smsNotificationRepository: SmsNotificationRepository
  ) {
    super();
  }

  /**
   * @method createSmsNotification
   * @description 创建短信通知
   */
  async createSmsNotification(
    command: CreateSmsNotificationCommand
  ): Promise<SmsNotification> {
    // 1. 创建短信通知实体
    const tenantId = Uuid.fromString(command.tenantId);
    const recipients = command.recipients.map((phone) =>
      PhoneNumber.create(phone)
    );

    this.notification = SmsNotification.create(
      tenantId,
      Uuid.fromString(command.templateId),
      recipients,
      command.data,
      command.priority,
      command.scheduledAt,
      command.metadata
    );

    // 2. 保存到仓储
    await this.smsNotificationRepository.save(this.notification);

    return this.notification;
  }

  /**
   * @method sendSmsNotification
   * @description 发送短信通知
   */
  async sendSmsNotification(
    command: SendSmsNotificationCommand
  ): Promise<void> {
    if (!this.notification) {
      throw new Error('短信通知不存在');
    }

    // 1. 验证通知状态
    if (this.notification.status !== NotificationStatus.PENDING) {
      throw new Error(`无法发送状态为 ${this.notification.status} 的短信通知`);
    }

    // 2. 更新通知状态
    this.notification.markAsSent({
      messageId: command.messageId,
      deliveryStatus: command.deliveryStatus,
      provider: command.provider,
      providerMessageId: command.providerMessageId,
      retryCount: command.retryCount,
    });

    // 3. 保存到仓储
    await this.smsNotificationRepository.save(this.notification);
  }

  /**
   * @method failSmsNotification
   * @description 短信通知发送失败
   */
  async failSmsNotification(
    command: FailSmsNotificationCommand
  ): Promise<void> {
    if (!this.notification) {
      throw new Error('短信通知不存在');
    }

    // 1. 验证通知状态
    if (this.notification.status !== NotificationStatus.PENDING) {
      throw new Error(
        `无法标记状态为 ${this.notification.status} 的短信通知为失败`
      );
    }

    // 2. 更新通知状态
    this.notification.markAsFailed({
      errorCode: command.errorCode,
      errorMessage: command.errorMessage,
      errorDetails: command.errorDetails,
      provider: command.provider,
      retryCount: command.retryCount,
      maxRetries: command.maxRetries,
      canRetry: command.canRetry,
    });

    // 3. 保存到仓储
    await this.smsNotificationRepository.save(this.notification);
  }

  /**
   * @method retrySmsNotification
   * @description 重试短信通知
   */
  async retrySmsNotification(): Promise<void> {
    if (!this.notification) {
      throw new Error('短信通知不存在');
    }

    // 1. 验证是否可以重试
    if (!this.notification.canRetry) {
      throw new Error('短信通知无法重试');
    }

    if (this.notification.retryCount >= this.notification.maxRetries) {
      throw new Error('短信通知已达到最大重试次数');
    }

    // 2. 重置状态为待发送
    this.notification.resetForRetry();

    // 3. 保存到仓储
    await this.smsNotificationRepository.save(this.notification);
  }

  /**
   * @method cancelSmsNotification
   * @description 取消短信通知
   */
  async cancelSmsNotification(): Promise<void> {
    if (!this.notification) {
      throw new Error('短信通知不存在');
    }

    // 1. 验证是否可以取消
    if (this.notification.status === NotificationStatus.SENT) {
      throw new Error('已发送的短信通知无法取消');
    }

    if (this.notification.status === NotificationStatus.FAILED) {
      throw new Error('已失败的短信通知无法取消');
    }

    // 2. 标记为已取消
    this.notification.markAsCancelled();

    // 3. 保存到仓储
    await this.smsNotificationRepository.save(this.notification);
  }

  /**
   * @method getSmsNotification
   * @description 获取短信通知
   */
  getSmsNotification(): SmsNotification | null {
    return this.notification;
  }

  /**
   * @method loadSmsNotification
   * @description 加载短信通知
   */
  async loadSmsNotification(notificationId: string): Promise<void> {
    const uuid = Uuid.fromString(notificationId);
    this.notification = await this.smsNotificationRepository.findById(uuid);
  }

  /**
   * @method deleteSmsNotification
   * @description 删除短信通知
   */
  async deleteSmsNotification(): Promise<void> {
    if (!this.notification) {
      throw new Error('短信通知不存在');
    }

    // 1. 验证是否可以删除
    if (this.notification.status === NotificationStatus.PENDING) {
      throw new Error('待发送的短信通知无法删除');
    }

    // 2. 从仓储删除
    await this.smsNotificationRepository.delete(this.notification.id);

    // 3. 清空聚合状态
    this.notification = null;
  }
}
