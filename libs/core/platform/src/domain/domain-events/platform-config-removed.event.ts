/**
 * @description 平台配置删除事件
 * @author 江郎
 * @since 2.1.0
 */

import { DomainEvent } from '@aiofix/shared';

/**
 * @interface PlatformConfigRemovedEventData
 * @description 平台配置删除事件数据接口
 */
export interface PlatformConfigRemovedEventData {
  platformId: string;
  configKey: string;
  updatedBy: string;
  timestamp: Date;
}

/**
 * @class PlatformConfigRemovedEvent
 * @description 平台配置删除事件
 *
 * 功能与职责：
 * 1. 记录平台配置删除的变更
 * 2. 支持事件溯源和状态重建
 * 3. 触发相关的业务流程
 *
 * @example
 * ```typescript
 * const event = new PlatformConfigRemovedEvent(
 *   '550e8400-e29b-41d4-a716-446655440000',
 *   'maxUsers',
 *   'admin'
 * );
 * ```
 * @since 2.1.0
 */
export class PlatformConfigRemovedEvent extends DomainEvent {
  public readonly eventType = 'PlatformConfigRemoved';
  public readonly eventVersion = '1.0.0';
  public readonly aggregateId: string;
  public readonly aggregateType = 'Platform';
  public readonly version = 1;

  constructor(
    public readonly platformId: string,
    public readonly configKey: string,
    public readonly updatedBy: string,
    public readonly timestamp: Date = new Date(),
  ) {
    super('PlatformConfigRemoved', {
      platformId,
      configKey,
      updatedBy,
      timestamp,
    });
    this.aggregateId = platformId;
  }

  /**
   * 获取事件数据
   * @returns 事件数据
   */
  public getEventData(): PlatformConfigRemovedEventData {
    return {
      platformId: this.platformId,
      configKey: this.configKey,
      updatedBy: this.updatedBy,
      timestamp: this.timestamp,
    };
  }

  /**
   * 获取事件摘要
   * @returns 事件摘要
   */
  public getSummary(): string {
    return `平台 ${this.platformId} 配置已删除，配置键: ${this.configKey}`;
  }
}
