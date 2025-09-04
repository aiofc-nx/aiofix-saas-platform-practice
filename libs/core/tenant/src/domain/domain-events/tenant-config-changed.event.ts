/**
 * @class TenantConfigChangedEvent
 * @description
 * 租户配置变更领域事件，表示租户配置已被修改。
 *
 * @since 1.0.0
 */

import { DomainEvent } from '@aiofix/shared';

/**
 * 租户配置变更事件数据接口
 */
export interface TenantConfigChangedEventData {
  tenantId: string;
  changedAt: Date;
  previousConfig: Record<string, any>;
  newConfig: Record<string, any>;
}

/**
 * 租户配置变更领域事件类
 * @description 表示租户配置已被修改的领域事件
 */
export class TenantConfigChangedEvent extends DomainEvent<TenantConfigChangedEventData> {
  constructor(
    tenantId: string,
    previousConfig: Record<string, any>,
    newConfig: Record<string, any>,
    eventId?: string,
  ) {
    super(
      'TenantConfigChangedEvent',
      {
        tenantId,
        changedAt: new Date(),
        previousConfig,
        newConfig,
      },
      eventId,
    );
  }

  /**
   * 获取租户ID
   * @returns 租户ID
   */
  getTenantId(): string {
    return this.getData().tenantId;
  }

  /**
   * 获取变更时间
   * @returns 变更时间
   */
  getChangedAt(): Date {
    return this.getData().changedAt;
  }

  /**
   * 获取之前的配置
   * @returns 之前的配置
   */
  getPreviousConfig(): Record<string, any> {
    return this.getData().previousConfig;
  }

  /**
   * 获取新配置
   * @returns 新配置
   */
  getNewConfig(): Record<string, any> {
    return this.getData().newConfig;
  }
}
