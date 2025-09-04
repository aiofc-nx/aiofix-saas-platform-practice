/**
 * @file push-notification.repository.ts
 * @description 推送通知仓储接口
 *
 * 该接口定义推送通知的数据访问契约，包括：
 * - 基础的CRUD操作
 * - 业务查询方法
 * - 统计分析方法
 * - 批量操作方法
 *
 * 遵循DDD原则，定义领域层的数据访问需求。
 */

import { PushNotification } from '../entities/push-notification.entity';
import { Uuid } from '@aiofix/shared';
import { NotificationStatus, NotificationPriority } from '@aiofix/shared';

/**
 * @interface PushNotificationRepository
 * @description 推送通知仓储接口
 *
 * 主要原理与机制：
 * 1. 定义推送通知数据访问的契约
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
export interface PushNotificationRepository {
  /**
   * @method save
   * @description 保存推送通知
   */
  save(notification: PushNotification): Promise<void>;

  /**
   * @method findById
   * @description 根据ID查找推送通知
   */
  findById(id: Uuid): Promise<PushNotification | null>;

  /**
   * @method findByTenant
   * @description 查找租户下的推送通知
   */
  findByTenant(
    tenantId: string,
    limit?: number,
    offset?: number,
  ): Promise<PushNotification[]>;

  /**
   * @method findByStatus
   * @description 根据状态查找推送通知
   */
  findByStatus(
    status: NotificationStatus,
    tenantId?: string,
    limit?: number,
    offset?: number,
  ): Promise<PushNotification[]>;

  /**
   * @method findByPriority
   * @description 根据优先级查找推送通知
   */
  findByPriority(
    priority: NotificationPriority,
    tenantId?: string,
    limit?: number,
    offset?: number,
  ): Promise<PushNotification[]>;

  /**
   * @method findByTemplate
   * @description 根据模板查找推送通知
   */
  findByTemplate(
    templateId: string,
    tenantId?: string,
    limit?: number,
    offset?: number,
  ): Promise<PushNotification[]>;

  /**
   * @method findByRecipient
   * @description 根据收件人查找推送通知
   */
  findByRecipient(
    recipient: string,
    tenantId?: string,
    limit?: number,
    offset?: number,
  ): Promise<PushNotification[]>;

  /**
   * @method findByPlatform
   * @description 根据平台查找推送通知
   */
  findByPlatform(
    platform: string,
    tenantId?: string,
    limit?: number,
    offset?: number,
  ): Promise<PushNotification[]>;

  /**
   * @method findPendingNotifications
   * @description 查找待发送的推送通知
   */
  findPendingNotifications(
    tenantId?: string,
    limit?: number,
    offset?: number,
  ): Promise<PushNotification[]>;

  /**
   * @method findScheduledNotifications
   * @description 查找计划发送的推送通知
   */
  findScheduledNotifications(
    fromDate: Date,
    toDate: Date,
    tenantId?: string,
    limit?: number,
    offset?: number,
  ): Promise<PushNotification[]>;

  /**
   * @method findFailedNotifications
   * @description 查找发送失败的推送通知
   */
  findFailedNotifications(
    tenantId?: string,
    limit?: number,
    offset?: number,
  ): Promise<PushNotification[]>;

  /**
   * @method delete
   * @description 删除推送通知
   */
  delete(id: Uuid): Promise<void>;

  /**
   * @method exists
   * @description 检查推送通知是否存在
   */
  exists(id: Uuid): Promise<boolean>;

  /**
   * @method count
   * @description 统计推送通知数量
   */
  count(tenantId?: string, status?: NotificationStatus): Promise<number>;

  /**
   * @method countByStatus
   * @description 按状态统计推送通知数量
   */
  countByStatus(tenantId?: string): Promise<Record<NotificationStatus, number>>;

  /**
   * @method countByPriority
   * @description 按优先级统计推送通知数量
   */
  countByPriority(
    tenantId?: string,
  ): Promise<Record<NotificationPriority, number>>;

  /**
   * @method countByPlatform
   * @description 按平台统计推送通知数量
   */
  countByPlatform(tenantId?: string): Promise<Record<string, number>>;

  /**
   * @method getStatistics
   * @description 获取推送通知统计信息
   */
  getStatistics(
    tenantId?: string,
    fromDate?: Date,
    toDate?: Date,
  ): Promise<{
    total: number;
    sent: number;
    failed: number;
    pending: number;
    successRate: number;
    averageDeliveryTime: number;
  }>;
}
