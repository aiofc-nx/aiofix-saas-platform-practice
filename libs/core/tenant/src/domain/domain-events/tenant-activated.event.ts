/**
 * @class TenantActivatedEvent
 * @description
 * 租户激活领域事件，表示租户已被激活。
 *
 * @example
 * ```typescript
 * const event = new TenantActivatedEvent(
 *   'tenant-123',
 *   TenantStatus.PENDING,
 *   TenantStatus.ACTIVE
 * );
 * ```
 * @since 1.0.0
 */

import { DomainEvent } from '@aiofix/shared';
import { TenantStatus } from '../enums';

/**
 * 租户激活事件数据接口
 */
export interface TenantActivatedEventData {
  tenantId: string;
  activatedAt: Date;
  previousStatus: TenantStatus;
  newStatus: TenantStatus;
}

/**
 * 租户激活领域事件类
 * @description 表示租户已被激活的领域事件
 */
export class TenantActivatedEvent extends DomainEvent<TenantActivatedEventData> {
  constructor(
    tenantId: string,
    previousStatus: TenantStatus,
    newStatus: TenantStatus,
    eventId?: string,
  ) {
    super(
      'TenantActivatedEvent',
      {
        tenantId,
        activatedAt: new Date(),
        previousStatus,
        newStatus,
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
   * 获取激活时间
   * @returns 激活时间
   */
  getActivatedAt(): Date {
    return this.getData().activatedAt;
  }

  /**
   * 获取之前的状态
   * @returns 之前的状态
   */
  getPreviousStatus(): TenantStatus {
    return this.getData().previousStatus;
  }

  /**
   * 获取新状态
   * @returns 新状态
   */
  getNewStatus(): TenantStatus {
    return this.getData().newStatus;
  }
}
