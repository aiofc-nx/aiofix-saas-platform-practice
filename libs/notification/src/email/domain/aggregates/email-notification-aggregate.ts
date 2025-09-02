/**
 * @file email-notification-aggregate.ts
 * @description 邮件通知聚合
 *
 * 该聚合封装了邮件通知的完整生命周期管理，包括创建、发送、重试等操作。
 * 遵循DDD聚合设计原则，确保业务一致性和数据完整性。
 */

import { BaseEvent, Uuid, EmailAddress } from '@aiofix/shared';
import { EmailNotification } from '../entities/email-notification.entity';
import { EmailNotificationRepository } from '../repositories/email-notification.repository';
import { EmailSubject } from '../value-objects/email-subject.vo';
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
 * @interface CreateEmailNotificationCommand
 * @description 创建邮件通知命令
 */
export interface CreateEmailNotificationCommand {
  tenantId: string;
  templateId: string;
  recipients: string[];
  subject?: string;
  data: Record<string, unknown>;
  priority: NotificationPriority;
  scheduledAt?: Date;
  metadata?: Record<string, unknown>;
}

/**
 * @interface SendEmailNotificationCommand
 * @description 发送邮件通知命令
 */
export interface SendEmailNotificationCommand {
  notificationId: string;
  provider: string;
  messageId: string;
  deliveryStatus: string;
  providerMessageId?: string;
  retryCount: number;
}

/**
 * @interface FailEmailNotificationCommand
 * @description 邮件通知失败命令
 */
export interface FailEmailNotificationCommand {
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
 * @class EmailNotificationAggregate
 * @description 邮件通知聚合
 *
 * 主要原理与机制：
 * 1. 封装邮件通知的完整生命周期
 * 2. 确保业务规则的一致性
 * 3. 发布领域事件
 * 4. 管理聚合状态转换
 *
 * 功能与业务规则：
 * 1. 创建邮件通知
 * 2. 发送邮件通知
 * 3. 处理发送失败
 * 4. 重试机制管理
 * 5. 状态转换控制
 */
export class EmailNotificationAggregate extends AggregateRoot {
  private notification: EmailNotification | null = null;

  constructor(
    private readonly emailNotificationRepository: EmailNotificationRepository
  ) {
    super();
  }

  /**
   * @method createEmailNotification
   * @description 创建邮件通知
   */
  async createEmailNotification(
    command: CreateEmailNotificationCommand
  ): Promise<EmailNotification> {
    // 1. 创建邮件通知实体
    const tenantId = Uuid.fromString(command.tenantId);
    const recipients = command.recipients.map((email) =>
      EmailAddress.create(email)
    );
    const subject = command.subject
      ? EmailSubject.create(command.subject)
      : undefined;

    this.notification = EmailNotification.create(
      tenantId,
      Uuid.fromString(command.templateId),
      recipients,
      command.data,
      command.priority,
      command.scheduledAt,
      subject,
      command.metadata
    );

    // 2. 保存到仓储
    await this.emailNotificationRepository.save(this.notification);

    return this.notification;
  }

  /**
   * @method sendEmailNotification
   * @description 发送邮件通知
   */
  async sendEmailNotification(
    command: SendEmailNotificationCommand
  ): Promise<void> {
    if (!this.notification) {
      throw new Error('邮件通知不存在');
    }

    // 1. 验证通知状态
    if (this.notification.status !== NotificationStatus.PENDING) {
      throw new Error(`无法发送状态为 ${this.notification.status} 的邮件通知`);
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
    await this.emailNotificationRepository.save(this.notification);
  }

  /**
   * @method failEmailNotification
   * @description 邮件通知发送失败
   */
  async failEmailNotification(
    command: FailEmailNotificationCommand
  ): Promise<void> {
    if (!this.notification) {
      throw new Error('邮件通知不存在');
    }

    // 1. 验证通知状态
    if (this.notification.status !== NotificationStatus.PENDING) {
      throw new Error(
        `无法标记状态为 ${this.notification.status} 的邮件通知为失败`
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
    await this.emailNotificationRepository.save(this.notification);
  }

  /**
   * @method retryEmailNotification
   * @description 重试邮件通知
   */
  async retryEmailNotification(): Promise<void> {
    if (!this.notification) {
      throw new Error('邮件通知不存在');
    }

    // 1. 验证是否可以重试
    if (!this.notification.canRetry) {
      throw new Error('邮件通知无法重试');
    }

    if (this.notification.retryCount >= this.notification.maxRetries) {
      throw new Error('邮件通知已达到最大重试次数');
    }

    // 2. 重置状态为待发送
    this.notification.resetForRetry();

    // 3. 保存到仓储
    await this.emailNotificationRepository.save(this.notification);
  }

  /**
   * @method cancelEmailNotification
   * @description 取消邮件通知
   */
  async cancelEmailNotification(): Promise<void> {
    if (!this.notification) {
      throw new Error('邮件通知不存在');
    }

    // 1. 验证是否可以取消
    if (this.notification.status === NotificationStatus.SENT) {
      throw new Error('已发送的邮件通知无法取消');
    }

    if (this.notification.status === NotificationStatus.FAILED) {
      throw new Error('已失败的邮件通知无法取消');
    }

    // 2. 标记为已取消
    this.notification.markAsCancelled();

    // 3. 保存到仓储
    await this.emailNotificationRepository.save(this.notification);
  }

  /**
   * @method getEmailNotification
   * @description 获取邮件通知
   */
  getEmailNotification(): EmailNotification | null {
    return this.notification;
  }

  /**
   * @method loadEmailNotification
   * @description 加载邮件通知
   */
  async loadEmailNotification(notificationId: string): Promise<void> {
    const uuid = Uuid.fromString(notificationId);
    this.notification = await this.emailNotificationRepository.findById(uuid);
  }

  /**
   * @method deleteEmailNotification
   * @description 删除邮件通知
   */
  async deleteEmailNotification(): Promise<void> {
    if (!this.notification) {
      throw new Error('邮件通知不存在');
    }

    // 1. 验证是否可以删除
    if (this.notification.status === NotificationStatus.PENDING) {
      throw new Error('待发送的邮件通知无法删除');
    }

    // 2. 从仓储删除
    await this.emailNotificationRepository.delete(this.notification.id);

    // 3. 清空聚合状态
    this.notification = null;
  }
}
