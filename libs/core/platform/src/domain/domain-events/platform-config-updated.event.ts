/**
 * @description 平台配置更新事件
 * @author 江郎
 * @since 2.1.0
 */

import { DomainEvent } from '@aiofix/shared';

/**
 * @interface PlatformConfigUpdatedEventData
 * @description 平台配置更新事件数据接口
 */
export interface PlatformConfigUpdatedEventData {
  platformId: string;
  configKey: string;
  configValue: any;
  updatedBy: string;
  timestamp: Date;
}

/**
 * @class PlatformConfigUpdatedEvent
 * @description 平台配置更新事件
 *
 * 功能与职责：
 * 1. 记录平台配置更新的变更
 * 2. 支持事件溯源和状态重建
 * 3. 触发相关的业务流程
 *
 * @example
 * ```typescript
 * const event = new PlatformConfigUpdatedEvent(
 *   '550e8400-e29b-41d4-a716-446655440000',
 *   'maxUsers',
 *   2000,
 *   'admin'
 * );
 * ```
 * @since 2.1.0
 */
export class PlatformConfigUpdatedEvent extends DomainEvent {
  public readonly eventType = 'PlatformConfigUpdated';
  public readonly eventVersion = '1.0.0';
  public readonly aggregateId: string;
  public readonly aggregateType = 'Platform';
  public readonly version = 1;

  constructor(
    public readonly platformId: string,
    public readonly configKey: string,
    public readonly configValue: any,
    public readonly updatedBy: string,
    public readonly timestamp: Date = new Date(),
  ) {
    super('PlatformConfigUpdated', {
      platformId,
      configKey,
      configValue,
      updatedBy,
      timestamp,
    });
    this.aggregateId = platformId;
  }

  /**
   * 获取事件数据
   * @returns 事件数据
   */
  public getEventData(): PlatformConfigUpdatedEventData {
    return {
      platformId: this.platformId,
      configKey: this.configKey,
      configValue: this.configValue,
      updatedBy: this.updatedBy,
      timestamp: this.timestamp,
    };
  }

  /**
   * 获取事件摘要
   * @returns 事件摘要
   */
  public getSummary(): string {
    return `平台 ${this.platformId} 配置已更新，${this.configKey}: ${this.configValue}`;
  }
}
