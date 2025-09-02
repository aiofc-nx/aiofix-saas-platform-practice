/**
 * @file push-notification-domain.service.ts
 * @description 推送通知领域服务
 *
 * 该服务处理推送通知的复杂业务逻辑，包括验证、路由、重试等。
 * 遵循DDD原则，保持领域逻辑的纯粹性。
 */

import { Injectable } from '@nestjs/common';
import { PushNotification } from '../entities/push-notification.entity';
import { PushNotificationRepository } from '../repositories/push-notification.repository';
import { NotificationStatus, NotificationPriority } from '@aiofix/shared';

/**
 * @interface PushValidationResult
 * @description 推送验证结果接口
 */
export interface PushValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * @interface PushRoutingResult
 * @description 推送路由结果接口
 */
export interface PushRoutingResult {
  shouldSend: boolean;
  reason?: string;
  priority: NotificationPriority;
  scheduledAt?: Date;
}

/**
 * @class PushNotificationDomainService
 * @description 推送通知领域服务
 *
 * 主要原理与机制：
 * 1. 处理跨聚合的业务逻辑
 * 2. 协调多个仓储和聚合
 * 3. 实现复杂的业务规则验证
 * 4. 保持领域逻辑的纯粹性
 *
 * 功能与业务规则：
 * 1. 推送通知验证
 * 2. 推送路由规则
 * 3. 重试策略管理
 * 4. 批量发送优化
 */
@Injectable()
export class PushNotificationDomainService {
  constructor(
    private readonly pushNotificationRepository: PushNotificationRepository
  ) {}

  /**
   * @method validatePushNotification
   * @description 验证推送通知
   */
  validatePushNotification(
    notification: PushNotification
  ): PushValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. 验证收件人
    if (notification.recipients.length === 0) {
      errors.push('推送通知必须包含至少一个收件人');
    }

    // 验证每个收件人的设备令牌格式
    for (const recipient of notification.recipients) {
      if (!this.isValidDeviceToken(recipient)) {
        errors.push(`无效的设备令牌: ${recipient}`);
      }
    }

    // 2. 验证模板ID
    if (!notification.templateId) {
      errors.push('推送通知必须包含有效的模板ID');
    }

    // 3. 验证优先级
    if (!Object.values(NotificationPriority).includes(notification.priority)) {
      errors.push('推送通知必须包含有效的优先级');
    }

    // 4. 验证计划发送时间
    if (notification.scheduledAt) {
      const now = new Date();
      if (notification.scheduledAt <= now) {
        errors.push('计划发送时间必须晚于当前时间');
      }
    }

    // 5. 验证数据大小
    const dataSize = JSON.stringify(notification.data).length;
    if (dataSize > 4000) {
      warnings.push('推送数据过大，可能影响发送性能');
    }

    // 6. 验证收件人数量
    if (notification.recipients.length > 1000) {
      warnings.push('收件人数量过多，建议分批发送');
    }

    // 7. 验证平台一致性
    const platforms = new Set(
      notification.recipients.map((token) => this.getPlatformFromToken(token))
    );
    if (platforms.size > 1) {
      warnings.push('不同平台的设备令牌混合发送，可能影响推送效果');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * @method determinePushRouting
   * @description 确定推送路由策略
   */
  determinePushRouting(
    notification: PushNotification,
    tenantSettings?: Record<string, unknown>
  ): PushRoutingResult {
    // 1. 检查是否应该立即发送
    if (notification.scheduledAt) {
      const now = new Date();
      if (notification.scheduledAt > now) {
        return {
          shouldSend: false,
          reason: '推送计划在将来发送',
          priority: notification.priority,
          scheduledAt: notification.scheduledAt,
        };
      }
    }

    // 2. 检查优先级
    const adjustedPriority = notification.priority;
    if (notification.priority === NotificationPriority.HIGH) {
      // 高优先级推送立即发送
      return {
        shouldSend: true,
        priority: adjustedPriority,
      };
    }

    // 3. 检查租户设置
    if (tenantSettings) {
      const quietHoursEnabled = tenantSettings.quietHoursEnabled as boolean;
      if (quietHoursEnabled) {
        const quietStart = tenantSettings.quietStart as string;
        const quietEnd = tenantSettings.quietEnd as string;
        const timezone = tenantSettings.timezone as string;

        if (this.isInQuietHours(quietStart, quietEnd, timezone)) {
          return {
            shouldSend: false,
            reason: '当前处于静默时间',
            priority: adjustedPriority,
            scheduledAt: this.calculateNextSendTime(quietEnd, timezone),
          };
        }
      }
    }

    // 4. 检查发送频率限制
    if (this.shouldRateLimit(notification)) {
      return {
        shouldSend: false,
        reason: '发送频率限制',
        priority: adjustedPriority,
        scheduledAt: this.calculateRetryTime(notification.retryCount),
      };
    }

    return {
      shouldSend: true,
      priority: adjustedPriority,
    };
  }

  /**
   * @method calculateRetryStrategy
   * @description 计算重试策略
   */
  calculateRetryStrategy(
    notification: PushNotification,
    errorCode: string
  ): {
    shouldRetry: boolean;
    retryDelay: number;
    maxRetries: number;
  } {
    // 1. 检查是否已达到最大重试次数
    if (notification.retryCount >= notification.maxRetries) {
      return {
        shouldRetry: false,
        retryDelay: 0,
        maxRetries: notification.maxRetries,
      };
    }

    // 2. 根据错误类型确定重试策略
    const retryableErrors = [
      'TEMPORARY_FAILURE',
      'RATE_LIMIT_EXCEEDED',
      'SERVICE_UNAVAILABLE',
      'TIMEOUT',
      'DEVICE_NOT_REGISTERED', // 设备令牌可能暂时无效
    ];

    if (!retryableErrors.includes(errorCode)) {
      return {
        shouldRetry: false,
        retryDelay: 0,
        maxRetries: notification.maxRetries,
      };
    }

    // 3. 计算重试延迟（指数退避）
    const baseDelay = 10 * 1000; // 10秒
    const retryDelay = baseDelay * Math.pow(2, notification.retryCount);

    // 4. 限制最大延迟时间
    const maxDelay = 5 * 60 * 1000; // 5分钟
    const finalDelay = Math.min(retryDelay, maxDelay);

    return {
      shouldRetry: true,
      retryDelay: finalDelay,
      maxRetries: notification.maxRetries,
    };
  }

  /**
   * @method optimizeBatchSending
   * @description 优化批量发送
   */
  async optimizeBatchSending(
    notifications: PushNotification[],
    batchSize: number = 500
  ): Promise<PushNotification[][]> {
    // 1. 按平台分组
    const iosNotifications: PushNotification[] = [];
    const androidNotifications: PushNotification[] = [];
    const otherNotifications: PushNotification[] = [];

    for (const notification of notifications) {
      const platform = notification.getPlatform();
      switch (platform) {
        case 'ios':
          iosNotifications.push(notification);
          break;
        case 'android':
          androidNotifications.push(notification);
          break;
        default:
          otherNotifications.push(notification);
          break;
      }
    }

    // 2. 按优先级分组
    const highPriority: PushNotification[] = [];
    const normalPriority: PushNotification[] = [];
    const lowPriority: PushNotification[] = [];

    for (const notification of notifications) {
      switch (notification.priority) {
        case NotificationPriority.HIGH:
          highPriority.push(notification);
          break;
        case NotificationPriority.NORMAL:
          normalPriority.push(notification);
          break;
        case NotificationPriority.LOW:
          lowPriority.push(notification);
          break;
      }
    }

    // 3. 生成批量发送计划
    const batches: PushNotification[][] = [];
    let currentBatch: PushNotification[] = [];

    // 优先处理高优先级推送
    for (const notification of highPriority) {
      if (currentBatch.length >= batchSize) {
        batches.push([...currentBatch]);
        currentBatch = [];
      }
      currentBatch.push(notification);
    }

    // 处理普通优先级推送
    for (const notification of normalPriority) {
      if (currentBatch.length >= batchSize) {
        batches.push([...currentBatch]);
        currentBatch = [];
      }
      currentBatch.push(notification);
    }

    // 处理低优先级推送
    for (const notification of lowPriority) {
      if (currentBatch.length >= batchSize) {
        batches.push([...currentBatch]);
        currentBatch = [];
      }
      currentBatch.push(notification);
    }

    // 添加最后一个批次
    if (currentBatch.length > 0) {
      batches.push(currentBatch);
    }

    return batches;
  }

  /**
   * @method getPushStatistics
   * @description 获取推送统计信息
   */
  async getPushStatistics(
    tenantId: string,
    fromDate?: Date,
    toDate?: Date
  ): Promise<{
    total: number;
    sent: number;
    failed: number;
    pending: number;
    successRate: number;
    averageDeliveryTime: number;
    byPriority: Record<NotificationPriority, number>;
    byStatus: Record<NotificationStatus, number>;
    byPlatform: Record<string, number>;
  }> {
    const statistics = await this.pushNotificationRepository.getStatistics(
      tenantId,
      fromDate,
      toDate
    );

    const byPriority = await this.pushNotificationRepository.countByPriority(
      tenantId
    );
    const byStatus = await this.pushNotificationRepository.countByStatus(
      tenantId
    );
    const byPlatform = await this.pushNotificationRepository.countByPlatform(
      tenantId
    );

    return {
      ...statistics,
      byPriority,
      byStatus,
      byPlatform,
    };
  }

  /**
   * @private
   * @method isValidDeviceToken
   * @description 验证设备令牌格式
   */
  private isValidDeviceToken(token: string): boolean {
    // 支持Firebase、APNS等推送服务的设备令牌格式
    // Firebase FCM token: 通常为152个字符的字符串
    // APNS device token: 通常为64个字符的十六进制字符串
    const tokenRegex = /^[a-zA-Z0-9:_-]{64,152}$/;
    return tokenRegex.test(token);
  }

  /**
   * @private
   * @method getPlatformFromToken
   * @description 从设备令牌获取平台类型
   */
  private getPlatformFromToken(token: string): string {
    if (token.startsWith('ios_') || token.length === 64) {
      return 'ios';
    } else if (token.startsWith('android_') || token.length > 100) {
      return 'android';
    }
    return 'unknown';
  }

  /**
   * @private
   * @method isInQuietHours
   * @description 检查是否在静默时间
   */
  private isInQuietHours(
    quietStart: string,
    quietEnd: string,
    _timezone: string
  ): boolean {
    // 简化实现，实际应该使用moment.js或day.js处理时区
    const now = new Date();
    const currentHour = now.getHours();
    const startHour = parseInt(quietStart.split(':')[0]);
    const endHour = parseInt(quietEnd.split(':')[0]);

    if (startHour <= endHour) {
      return currentHour >= startHour && currentHour < endHour;
    } else {
      // 跨天的情况
      return currentHour >= startHour || currentHour < endHour;
    }
  }

  /**
   * @private
   * @method calculateNextSendTime
   * @description 计算下次发送时间
   */
  private calculateNextSendTime(quietEnd: string, _timezone: string): Date {
    // 简化实现，实际应该使用moment.js或day.js处理时区
    const now = new Date();
    const [hour, minute] = quietEnd.split(':').map(Number);
    const nextSend = new Date(now);
    nextSend.setHours(hour, minute, 0, 0);

    if (nextSend <= now) {
      nextSend.setDate(nextSend.getDate() + 1);
    }

    return nextSend;
  }

  /**
   * @private
   * @method shouldRateLimit
   * @description 检查是否应该限制发送频率
   */
  private shouldRateLimit(_notification: PushNotification): boolean {
    // 简化实现，实际应该检查数据库中的发送历史
    // 这里可以根据业务规则实现更复杂的频率限制逻辑
    return false;
  }

  /**
   * @private
   * @method calculateRetryTime
   * @description 计算重试时间
   */
  private calculateRetryTime(retryCount: number): Date {
    const baseDelay = 10 * 1000; // 10秒
    const retryDelay = baseDelay * Math.pow(2, retryCount);
    const maxDelay = 5 * 60 * 1000; // 5分钟
    const finalDelay = Math.min(retryDelay, maxDelay);

    const retryTime = new Date();
    retryTime.setTime(retryTime.getTime() + finalDelay);
    return retryTime;
  }
}
