/**
 * @file webhook-notification-aggregate.ts
 * @description Webhook通知聚合
 *
 * 该聚合封装了Webhook通知的完整生命周期管理，包括创建、发送、重试等操作。
 * 遵循DDD聚合设计原则，确保业务一致性和数据完整性。
 */

import { Uuid, BaseEvent } from '@aiofix/shared';
import { NotificationStatus, NotificationPriority } from '@aiofix/shared';
import { WebhookNotification } from '../entities/webhook-notification.entity';
import { WebhookNotificationRepository } from '../repositories/webhook-notification.repository';

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
 * @interface CreateWebhookNotificationCommand
 * @description 创建Webhook通知命令
 */
export interface CreateWebhookNotificationCommand {
  tenantId: string;
  templateId: string;
  recipients: string[];
  data: Record<string, unknown>;
  priority: NotificationPriority;
  scheduledAt?: Date;
  metadata?: Record<string, unknown>;
}

/**
 * @interface SendWebhookNotificationCommand
 * @description 发送Webhook通知命令
 */
export interface SendWebhookNotificationCommand {
  notificationId: string;
  provider: string;
  messageId: string;
  deliveryStatus: string;
  providerMessageId?: string;
  retryCount: number;
}

/**
 * @interface FailWebhookNotificationCommand
 * @description Webhook通知失败命令
 */
export interface FailWebhookNotificationCommand {
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
 * @class WebhookNotificationAggregate
 * @description Webhook通知聚合
 *
 * 主要原理与机制：
 * 1. 封装Webhook通知的完整生命周期
 * 2. 确保业务规则的一致性
 * 3. 发布领域事件
 * 4. 管理聚合状态转换
 *
 * 功能与业务规则：
 * 1. 创建Webhook通知
 * 2. 发送Webhook通知
 * 3. 处理发送失败
 * 4. 重试机制管理
 * 5. 状态转换控制
 */
export class WebhookNotificationAggregate extends AggregateRoot {
  private notification: WebhookNotification | null = null;

  constructor(
    private readonly webhookNotificationRepository: WebhookNotificationRepository
  ) {
    super();
  }

  /**
   * @method createWebhookNotification
   * @description 创建Webhook通知
   */
  async createWebhookNotification(
    command: CreateWebhookNotificationCommand
  ): Promise<WebhookNotification> {
    // 1. 创建Webhook通知实体
    const tenantId = Uuid.fromString(command.tenantId);

    this.notification = WebhookNotification.create(
      tenantId,
      Uuid.fromString(command.templateId),
      command.recipients,
      command.data,
      command.priority,
      command.scheduledAt,
      command.metadata
    );

    // 2. 保存到仓储
    await this.webhookNotificationRepository.save(this.notification);

    return this.notification;
  }

  /**
   * @method sendWebhookNotification
   * @description 发送Webhook通知
   */
  async sendWebhookNotification(
    command: SendWebhookNotificationCommand
  ): Promise<void> {
    if (!this.notification) {
      throw new Error('Webhook通知不存在');
    }

    // 1. 验证通知状态
    if (this.notification.status !== NotificationStatus.PENDING) {
      throw new Error(
        `无法发送状态为 ${this.notification.status} 的Webhook通知`
      );
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
    await this.webhookNotificationRepository.save(this.notification);
  }

  /**
   * @method failWebhookNotification
   * @description Webhook通知发送失败
   */
  async failWebhookNotification(
    command: FailWebhookNotificationCommand
  ): Promise<void> {
    if (!this.notification) {
      throw new Error('Webhook通知不存在');
    }

    // 1. 验证通知状态
    if (this.notification.status !== NotificationStatus.PENDING) {
      throw new Error(
        `无法标记状态为 ${this.notification.status} 的Webhook通知为失败`
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
    await this.webhookNotificationRepository.save(this.notification);
  }

  /**
   * @method retryWebhookNotification
   * @description 重试Webhook通知
   */
  async retryWebhookNotification(): Promise<void> {
    if (!this.notification) {
      throw new Error('Webhook通知不存在');
    }

    // 1. 验证是否可以重试
    if (!this.notification.canRetry) {
      throw new Error('Webhook通知无法重试');
    }

    if (this.notification.retryCount >= this.notification.maxRetries) {
      throw new Error('Webhook通知已达到最大重试次数');
    }

    // 2. 重置状态为待发送
    this.notification.resetForRetry();

    // 3. 保存到仓储
    await this.webhookNotificationRepository.save(this.notification);
  }

  /**
   * @method cancelWebhookNotification
   * @description 取消Webhook通知
   */
  async cancelWebhookNotification(): Promise<void> {
    if (!this.notification) {
      throw new Error('Webhook通知不存在');
    }

    // 1. 验证是否可以取消
    if (this.notification.status === NotificationStatus.SENT) {
      throw new Error('已发送的Webhook通知无法取消');
    }

    if (this.notification.status === NotificationStatus.FAILED) {
      throw new Error('已失败的Webhook通知无法取消');
    }

    // 2. 标记为已取消
    this.notification.markAsCancelled();

    // 3. 保存到仓储
    await this.webhookNotificationRepository.save(this.notification);
  }

  /**
   * @method getWebhookNotification
   * @description 获取Webhook通知
   */
  getWebhookNotification(): WebhookNotification | null {
    return this.notification;
  }

  /**
   * @method loadWebhookNotification
   * @description 加载Webhook通知
   */
  async loadWebhookNotification(notificationId: string): Promise<void> {
    const uuid = Uuid.fromString(notificationId);
    this.notification = await this.webhookNotificationRepository.findById(uuid);
  }

  /**
   * @method deleteWebhookNotification
   * @description 删除Webhook通知
   */
  async deleteWebhookNotification(): Promise<void> {
    if (!this.notification) {
      throw new Error('Webhook通知不存在');
    }

    // 1. 验证是否可以删除
    if (this.notification.status === NotificationStatus.PENDING) {
      throw new Error('待发送的Webhook通知无法删除');
    }

    // 2. 从仓储删除
    await this.webhookNotificationRepository.delete(this.notification.id);

    // 3. 清空聚合状态
    this.notification = null;
  }
}
