/**
 * @file push-notification-aggregate.ts
 * @description 推送通知聚合
 *
 * 该聚合封装了推送通知的完整生命周期管理，包括创建、发送、重试等操作。
 * 遵循DDD聚合设计原则，确保业务一致性和数据完整性。
 */

import { BaseEvent, Uuid } from '@aiofix/shared';
import { PushNotification } from '../entities/push-notification.entity';
import { PushNotificationRepository } from '../repositories/push-notification.repository';
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
 * @interface CreatePushNotificationCommand
 * @description 创建推送通知命令
 */
export interface CreatePushNotificationCommand {
  tenantId: string;
  templateId: string;
  recipients: string[];
  data: Record<string, unknown>;
  priority: NotificationPriority;
  scheduledAt?: Date;
  metadata?: Record<string, unknown>;
}

/**
 * @interface SendPushNotificationCommand
 * @description 发送推送通知命令
 */
export interface SendPushNotificationCommand {
  notificationId: string;
  provider: string;
  messageId: string;
  deliveryStatus: string;
  providerMessageId?: string;
  retryCount: number;
}

/**
 * @interface FailPushNotificationCommand
 * @description 推送通知失败命令
 */
export interface FailPushNotificationCommand {
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
 * @class PushNotificationAggregate
 * @description 推送通知聚合
 *
 * 主要原理与机制：
 * 1. 封装推送通知的完整生命周期
 * 2. 确保业务规则的一致性
 * 3. 发布领域事件
 * 4. 管理聚合状态转换
 *
 * 功能与业务规则：
 * 1. 创建推送通知
 * 2. 发送推送通知
 * 3. 处理发送失败
 * 4. 重试机制管理
 * 5. 状态转换控制
 */
export class PushNotificationAggregate extends AggregateRoot {
  private notification: PushNotification | null = null;

  constructor(
    private readonly pushNotificationRepository: PushNotificationRepository
  ) {
    super();
  }

  /**
   * @method createPushNotification
   * @description 创建推送通知
   */
  async createPushNotification(
    command: CreatePushNotificationCommand
  ): Promise<PushNotification> {
    // 1. 创建推送通知实体
    const tenantId = Uuid.fromString(command.tenantId);

    this.notification = PushNotification.create(
      tenantId,
      Uuid.fromString(command.templateId),
      command.recipients,
      command.data,
      command.priority,
      command.scheduledAt,
      command.metadata
    );

    // 2. 保存到仓储
    await this.pushNotificationRepository.save(this.notification);

    return this.notification;
  }

  /**
   * @method sendPushNotification
   * @description 发送推送通知
   */
  async sendPushNotification(
    command: SendPushNotificationCommand
  ): Promise<void> {
    if (!this.notification) {
      throw new Error('推送通知不存在');
    }

    // 1. 验证通知状态
    if (this.notification.status !== NotificationStatus.PENDING) {
      throw new Error(`无法发送状态为 ${this.notification.status} 的推送通知`);
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
    await this.pushNotificationRepository.save(this.notification);
  }

  /**
   * @method failPushNotification
   * @description 推送通知发送失败
   */
  async failPushNotification(
    command: FailPushNotificationCommand
  ): Promise<void> {
    if (!this.notification) {
      throw new Error('推送通知不存在');
    }

    // 1. 验证通知状态
    if (this.notification.status !== NotificationStatus.PENDING) {
      throw new Error(
        `无法标记状态为 ${this.notification.status} 的推送通知为失败`
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
    await this.pushNotificationRepository.save(this.notification);
  }

  /**
   * @method retryPushNotification
   * @description 重试推送通知
   */
  async retryPushNotification(): Promise<void> {
    if (!this.notification) {
      throw new Error('推送通知不存在');
    }

    // 1. 验证是否可以重试
    if (!this.notification.canRetry) {
      throw new Error('推送通知无法重试');
    }

    if (this.notification.retryCount >= this.notification.maxRetries) {
      throw new Error('推送通知已达到最大重试次数');
    }

    // 2. 重置状态为待发送
    this.notification.resetForRetry();

    // 3. 保存到仓储
    await this.pushNotificationRepository.save(this.notification);
  }

  /**
   * @method cancelPushNotification
   * @description 取消推送通知
   */
  async cancelPushNotification(): Promise<void> {
    if (!this.notification) {
      throw new Error('推送通知不存在');
    }

    // 1. 验证是否可以取消
    if (this.notification.status === NotificationStatus.SENT) {
      throw new Error('已发送的推送通知无法取消');
    }

    if (this.notification.status === NotificationStatus.FAILED) {
      throw new Error('已失败的推送通知无法取消');
    }

    // 2. 标记为已取消
    this.notification.markAsCancelled();

    // 3. 保存到仓储
    await this.pushNotificationRepository.save(this.notification);
  }

  /**
   * @method getPushNotification
   * @description 获取推送通知
   */
  getPushNotification(): PushNotification | null {
    return this.notification;
  }

  /**
   * @method loadPushNotification
   * @description 加载推送通知
   */
  async loadPushNotification(notificationId: string): Promise<void> {
    const uuid = Uuid.fromString(notificationId);
    this.notification = await this.pushNotificationRepository.findById(uuid);
  }

  /**
   * @method deletePushNotification
   * @description 删除推送通知
   */
  async deletePushNotification(): Promise<void> {
    if (!this.notification) {
      throw new Error('推送通知不存在');
    }

    // 1. 验证是否可以删除
    if (this.notification.status === NotificationStatus.PENDING) {
      throw new Error('待发送的推送通知无法删除');
    }

    // 2. 从仓储删除
    await this.pushNotificationRepository.delete(this.notification.id);

    // 3. 清空聚合状态
    this.notification = null;
  }
}
