/**
 * @file webhook-notification.repository.ts
 * @description Webhook通知仓储接口
 *
 * 该接口定义Webhook通知的数据访问契约，包括：
 * - 基础的CRUD操作
 * - 业务查询方法
 * - 统计分析方法
 * - 批量操作方法
 *
 * 遵循DDD原则，定义领域层的数据访问需求。
 */

import { WebhookNotification } from '../entities/webhook-notification.entity';
import { Uuid } from '@aiofix/shared';
import { NotificationStatus, NotificationPriority } from '@aiofix/shared';

/**
 * @interface WebhookNotificationRepository
 * @description Webhook通知仓储接口
 *
 * 主要原理与机制：
 * 1. 定义Webhook通知数据访问的契约
 * 2. 隔离领域层和基础设施层
 * 3. 支持不同的存储实现
 * 4. 保持领域逻辑的纯粹性
 *
 * 功能与业务规则：
 * 1. 基础CRUD操作
 * 2. 业务查询方法
 * 3. 事务管理支持
 * 4. 并发控制支持
 */
export interface WebhookNotificationRepository {
  /**
   * @method save
   * @description 保存Webhook通知
   */
  save(notification: WebhookNotification): Promise<void>;

  /**
   * @method findById
   * @description 根据ID查找Webhook通知
   */
  findById(id: Uuid): Promise<WebhookNotification | null>;

  /**
   * @method findByTenant
   * @description 查找租户下的Webhook通知
   */
  findByTenant(
    tenantId: string,
    limit?: number,
    offset?: number
  ): Promise<WebhookNotification[]>;

  /**
   * @method findByStatus
   * @description 根据状态查找Webhook通知
   */
  findByStatus(
    status: NotificationStatus,
    tenantId?: string,
    limit?: number,
    offset?: number
  ): Promise<WebhookNotification[]>;

  /**
   * @method findByPriority
   * @description 根据优先级查找Webhook通知
   */
  findByPriority(
    priority: NotificationPriority,
    tenantId?: string,
    limit?: number,
    offset?: number
  ): Promise<WebhookNotification[]>;

  /**
   * @method findByTemplate
   * @description 根据模板查找Webhook通知
   */
  findByTemplate(
    templateId: string,
    tenantId?: string,
    limit?: number,
    offset?: number
  ): Promise<WebhookNotification[]>;

  /**
   * @method findByRecipient
   * @description 根据收件人查找Webhook通知
   */
  findByRecipient(
    recipient: string,
    tenantId?: string,
    limit?: number,
    offset?: number
  ): Promise<WebhookNotification[]>;

  /**
   * @method findByProtocol
   * @description 根据协议查找Webhook通知
   */
  findByProtocol(
    protocol: string,
    tenantId?: string,
    limit?: number,
    offset?: number
  ): Promise<WebhookNotification[]>;

  /**
   * @method findPendingNotifications
   * @description 查找待发送的Webhook通知
   */
  findPendingNotifications(
    tenantId?: string,
    limit?: number,
    offset?: number
  ): Promise<WebhookNotification[]>;

  /**
   * @method findScheduledNotifications
   * @description 查找计划发送的Webhook通知
   */
  findScheduledNotifications(
    fromDate: Date,
    toDate: Date,
    tenantId?: string,
    limit?: number,
    offset?: number
  ): Promise<WebhookNotification[]>;

  /**
   * @method findFailedNotifications
   * @description 查找发送失败的Webhook通知
   */
  findFailedNotifications(
    tenantId?: string,
    limit?: number,
    offset?: number
  ): Promise<WebhookNotification[]>;

  /**
   * @method delete
   * @description 删除Webhook通知
   */
  delete(id: Uuid): Promise<void>;

  /**
   * @method exists
   * @description 检查Webhook通知是否存在
   */
  exists(id: Uuid): Promise<boolean>;

  /**
   * @method count
   * @description 统计Webhook通知数量
   */
  count(tenantId?: string, status?: NotificationStatus): Promise<number>;

  /**
   * @method countByStatus
   * @description 按状态统计Webhook通知数量
   */
  countByStatus(tenantId?: string): Promise<Record<NotificationStatus, number>>;

  /**
   * @method countByPriority
   * @description 按优先级统计Webhook通知数量
   */
  countByPriority(
    tenantId?: string
  ): Promise<Record<NotificationPriority, number>>;

  /**
   * @method countByProtocol
   * @description 按协议统计Webhook通知数量
   */
  countByProtocol(tenantId?: string): Promise<Record<string, number>>;

  /**
   * @method getStatistics
   * @description 获取Webhook通知统计信息
   */
  getStatistics(
    tenantId?: string,
    fromDate?: Date,
    toDate?: Date
  ): Promise<{
    total: number;
    sent: number;
    failed: number;
    pending: number;
    successRate: number;
    averageDeliveryTime: number;
  }>;
}
