/**
 * @class TenantSuspendedEvent
 * @description
 * 租户暂停领域事件，表示租户已被暂停。
 *
 * @since 1.0.0
 */

import { DomainEvent } from '@aiofix/shared';
import { TenantStatus } from '../enums';

/**
 * 租户暂停事件数据接口
 */
export interface TenantSuspendedEventData {
  tenantId: string;
  suspendedAt: Date;
  previousStatus: TenantStatus;
  newStatus: TenantStatus;
}

/**
 * 租户暂停领域事件类
 * @description 表示租户已被暂停的领域事件
 */
export class TenantSuspendedEvent extends DomainEvent<TenantSuspendedEventData> {
  constructor(
    tenantId: string,
    previousStatus: TenantStatus,
    newStatus: TenantStatus,
    eventId?: string,
  ) {
    super(
      'TenantSuspendedEvent',
      {
        tenantId,
        suspendedAt: new Date(),
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
   * 获取暂停时间
   * @returns 暂停时间
   */
  getSuspendedAt(): Date {
    return this.getData().suspendedAt;
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
