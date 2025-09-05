/**
 * @description 平台停用事件
 * @author 江郎
 * @since 2.1.0
 */

import { DomainEvent } from '@aiofix/shared';
import { PlatformStatus } from '../enums';

/**
 * @interface PlatformDeactivatedEventData
 * @description 平台停用事件数据接口
 */
export interface PlatformDeactivatedEventData {
  platformId: string;
  previousStatus: PlatformStatus;
  currentStatus: PlatformStatus;
  updatedBy: string;
  timestamp: Date;
}

/**
 * @class PlatformDeactivatedEvent
 * @description 平台停用事件
 *
 * 功能与职责：
 * 1. 记录平台停用的状态变更
 * 2. 支持事件溯源和状态重建
 * 3. 触发相关的业务流程
 *
 * @example
 * ```typescript
 * const event = new PlatformDeactivatedEvent(
 *   '550e8400-e29b-41d4-a716-446655440000',
 *   PlatformStatus.ACTIVE,
 *   PlatformStatus.INACTIVE,
 *   'admin'
 * );
 * ```
 * @since 2.1.0
 */
export class PlatformDeactivatedEvent extends DomainEvent {
  public readonly eventType = 'PlatformDeactivated';
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
    super('PlatformDeactivated', {
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
  public getEventData(): PlatformDeactivatedEventData {
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
    return `平台 ${this.platformId} 已停用，状态从 ${this.previousStatus} 变更为 ${this.currentStatus}`;
  }
}
