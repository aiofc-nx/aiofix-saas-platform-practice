/**
 * @class TenantDeletedEvent
 * @description
 * 租户删除领域事件，表示租户已被删除。
 *
 * @since 1.0.0
 */

import { DomainEvent } from '@aiofix/shared';
import { TenantStatus } from '../enums';

/**
 * 租户删除事件数据接口
 */
export interface TenantDeletedEventData {
  tenantId: string;
  deletedAt: Date;
  previousStatus: TenantStatus;
  newStatus: TenantStatus;
}

/**
 * 租户删除领域事件类
 * @description 表示租户已被删除的领域事件
 */
export class TenantDeletedEvent extends DomainEvent<TenantDeletedEventData> {
  constructor(
    tenantId: string,
    previousStatus: TenantStatus,
    newStatus: TenantStatus,
    eventId?: string,
  ) {
    super(
      'TenantDeletedEvent',
      {
        tenantId,
        deletedAt: new Date(),
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
   * 获取删除时间
   * @returns 删除时间
   */
  getDeletedAt(): Date {
    return this.getData().deletedAt;
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
