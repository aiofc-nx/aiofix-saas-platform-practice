/**
 * @description 平台元数据更新事件
 * @author 江郎
 * @since 2.1.0
 */

import { DomainEvent } from '@aiofix/shared';

/**
 * @interface PlatformMetadataUpdatedEventData
 * @description 平台元数据更新事件数据接口
 */
export interface PlatformMetadataUpdatedEventData {
  platformId: string;
  metadataKey: string;
  metadataValue: any;
  updatedBy: string;
  timestamp: Date;
}

/**
 * @class PlatformMetadataUpdatedEvent
 * @description 平台元数据更新事件
 *
 * 功能与职责：
 * 1. 记录平台元数据更新的变更
 * 2. 支持事件溯源和状态重建
 * 3. 触发相关的业务流程
 *
 * @example
 * ```typescript
 * const event = new PlatformMetadataUpdatedEvent(
 *   '550e8400-e29b-41d4-a716-446655440000',
 *   'deploymentRegion',
 *   'us-east-1',
 *   'admin'
 * );
 * ```
 * @since 2.1.0
 */
export class PlatformMetadataUpdatedEvent extends DomainEvent {
  public readonly eventType = 'PlatformMetadataUpdated';
  public readonly eventVersion = '1.0.0';
  public readonly aggregateId: string;
  public readonly aggregateType = 'Platform';
  public readonly version = 1;

  constructor(
    public readonly platformId: string,
    public readonly metadataKey: string,
    public readonly metadataValue: any,
    public readonly updatedBy: string,
    public readonly timestamp: Date = new Date(),
  ) {
    super('PlatformMetadataUpdated', {
      platformId,
      metadataKey,
      metadataValue,
      updatedBy,
      timestamp,
    });
    this.aggregateId = platformId;
  }

  /**
   * 获取事件数据
   * @returns 事件数据
   */
  public getEventData(): PlatformMetadataUpdatedEventData {
    return {
      platformId: this.platformId,
      metadataKey: this.metadataKey,
      metadataValue: this.metadataValue,
      updatedBy: this.updatedBy,
      timestamp: this.timestamp,
    };
  }

  /**
   * 获取事件摘要
   * @returns 事件摘要
   */
  public getSummary(): string {
    return `平台 ${this.platformId} 元数据已更新，${this.metadataKey}: ${this.metadataValue}`;
  }
}
