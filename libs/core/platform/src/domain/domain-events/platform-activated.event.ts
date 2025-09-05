/**
 * @description 平台激活事件
 * @author 江郎
 * @since 2.1.0
 */

import { DomainEvent } from '@aiofix/shared';
import { PlatformStatus } from '../enums';

/**
 * @interface PlatformActivatedEventData
 * @description 平台激活事件数据接口
 */
export interface PlatformActivatedEventData {
  platformId: string;
  previousStatus: PlatformStatus;
  currentStatus: PlatformStatus;
  updatedBy: string;
  timestamp: Date;
}

/**
 * @class PlatformActivatedEvent
 * @description 平台激活事件
 *
 * 功能与职责：
 * 1. 记录平台激活的状态变更
 * 2. 支持事件溯源和状态重建
 * 3. 触发相关的业务流程
 *
 * @example
 * ```typescript
 * const event = new PlatformActivatedEvent(
 *   '550e8400-e29b-41d4-a716-446655440000',
 *   PlatformStatus.INITIALIZING,
 *   PlatformStatus.ACTIVE,
 *   'admin'
 * );
 * ```
 * @since 2.1.0
 */
export class PlatformActivatedEvent extends DomainEvent {
  public readonly eventType = 'PlatformActivated';
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
    super('PlatformActivated', {
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
  public getEventData(): PlatformActivatedEventData {
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
    return `平台 ${this.platformId} 已激活，状态从 ${this.previousStatus} 变更为 ${this.currentStatus}`;
  }
}
