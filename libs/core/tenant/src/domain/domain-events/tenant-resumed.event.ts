/**
 * @class TenantResumedEvent
 * @description
 * 租户恢复领域事件，表示租户已被恢复。
 *
 * @since 1.0.0
 */

import { DomainEvent } from '@aiofix/shared';
import { TenantStatus } from '../enums';

/**
 * 租户恢复事件数据接口
 */
export interface TenantResumedEventData {
  tenantId: string;
  resumedAt: Date;
  previousStatus: TenantStatus;
  newStatus: TenantStatus;
}

/**
 * 租户恢复领域事件类
 * @description 表示租户已被恢复的领域事件
 */
export class TenantResumedEvent extends DomainEvent<TenantResumedEventData> {
  constructor(
    tenantId: string,
    previousStatus: TenantStatus,
    newStatus: TenantStatus,
    eventId?: string,
  ) {
    super(
      'TenantResumedEvent',
      {
        tenantId,
        resumedAt: new Date(),
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
   * 获取恢复时间
   * @returns 恢复时间
   */
  getResumedAt(): Date {
    return this.getData().resumedAt;
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
