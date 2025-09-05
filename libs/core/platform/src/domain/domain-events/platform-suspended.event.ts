/**
 * @description 平台暂停事件
 * @author 江郎
 * @since 2.1.0
 */

import { DomainEvent } from '@aiofix/shared';
import { PlatformStatus } from '../enums';

/**
 * @interface PlatformSuspendedEventData
 * @description 平台暂停事件数据接口
 */
export interface PlatformSuspendedEventData {
  platformId: string;
  previousStatus: PlatformStatus;
  currentStatus: PlatformStatus;
  updatedBy: string;
  timestamp: Date;
}

/**
 * @class PlatformSuspendedEvent
 * @description 平台暂停事件
 *
 * 功能与职责：
 * 1. 记录平台暂停的状态变更
 * 2. 支持事件溯源和状态重建
 * 3. 触发相关的业务流程
 *
 * @example
 * ```typescript
 * const event = new PlatformSuspendedEvent(
 *   '550e8400-e29b-41d4-a716-446655440000',
 *   PlatformStatus.ACTIVE,
 *   PlatformStatus.SUSPENDED,
 *   'admin'
 * );
 * ```
 * @since 2.1.0
 */
export class PlatformSuspendedEvent extends DomainEvent {
  public readonly eventType = 'PlatformSuspended';
  public readonly eventVersion = '1.0.0';
  public readonly aggregateId: string;
  public readonly aggregateType = 'Platform';
  public readonly version = 1;

  constructor(
    public readonly platformId: string,
    public readonly previousStatus: PlatformStatus,
    public readonly currentStatus: PlatformStatus,
    public readonly updatedBy: string,
    public readonly timestamp: Date = new Date(),
  ) {
    super('PlatformSuspended', {
      platformId,
      previousStatus,
      currentStatus,
      updatedBy,
      timestamp,
    });
    this.aggregateId = platformId;
  }

  /**
   * 获取事件数据
   * @returns 事件数据
   */
  public getEventData(): PlatformSuspendedEventData {
    return {
      platformId: this.platformId,
      previousStatus: this.previousStatus,
      currentStatus: this.currentStatus,
      updatedBy: this.updatedBy,
      timestamp: this.timestamp,
    };
  }

  /**
   * 获取事件摘要
   * @returns 事件摘要
   */
  public getSummary(): string {
    return `平台 ${this.platformId} 已暂停，状态从 ${this.previousStatus} 变更为 ${this.currentStatus}`;
  }
}
