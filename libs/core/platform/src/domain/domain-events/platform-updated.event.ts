/**
 * @description 平台更新事件
 * @author 江郎
 * @since 2.1.0
 */

import { DomainEvent } from '@aiofix/shared';

/**
 * @interface PlatformUpdatedEventData
 * @description 平台更新事件数据接口
 */
export interface PlatformUpdatedEventData {
  platformId: string;
  changes: {
    name?: string;
    version?: string;
    description?: string;
  };
  updatedBy: string;
  timestamp: Date;
}

/**
 * @class PlatformUpdatedEvent
 * @description 平台更新事件
 *
 * 功能与职责：
 * 1. 记录平台信息更新的变更
 * 2. 支持事件溯源和状态重建
 * 3. 触发相关的业务流程
 *
 * @example
 * ```typescript
 * const event = new PlatformUpdatedEvent(
 *   '550e8400-e29b-41d4-a716-446655440000',
 *   {
 *     name: 'Aiofix SaaS Platform v2',
 *     version: '2.0.0',
 *     description: '升级版企业级SaaS平台'
 *   },
 *   'admin'
 * );
 * ```
 * @since 2.1.0
 */
export class PlatformUpdatedEvent extends DomainEvent {
  public readonly eventType = 'PlatformUpdated';
  public readonly eventVersion = '1.0.0';
  public readonly aggregateId: string;
  public readonly aggregateType = 'Platform';
  public readonly version = 1;

  constructor(
    public readonly platformId: string,
    public readonly changes: {
      name?: string;
      version?: string;
      description?: string;
    },
    public readonly updatedBy: string,
    public readonly timestamp: Date = new Date(),
  ) {
    super('PlatformUpdated', {
      platformId,
      changes,
      updatedBy,
      timestamp,
    });
    this.aggregateId = platformId;
  }

  /**
   * 获取事件数据
   * @returns 事件数据
   */
  public getEventData(): PlatformUpdatedEventData {
    return {
      platformId: this.platformId,
      changes: this.changes,
      updatedBy: this.updatedBy,
      timestamp: this.timestamp,
    };
  }

  /**
   * 获取事件摘要
   * @returns 事件摘要
   */
  public getSummary(): string {
    const changeList = Object.entries(this.changes)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');

    return `平台 ${this.platformId} 已更新，变更: ${changeList}`;
  }
}
