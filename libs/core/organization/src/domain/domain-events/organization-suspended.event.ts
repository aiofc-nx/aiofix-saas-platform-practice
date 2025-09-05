/**
 * @class OrganizationSuspendedEvent
 * @description 组织暂停事件
 *
 * 原理与机制：
 * 1. 继承DomainEvent基类
 * 2. 包含事件的关键数据
 * 3. 支持事件溯源和审计
 * 4. 可以被其他模块订阅
 *
 * 功能与职责：
 * 1. 记录组织暂停事件
 * 2. 传递关键信息
 * 3. 支持事件溯源和状态重建
 * 4. 触发相关的业务流程
 *
 * @example
 * ```typescript
 * const event = new OrganizationSuspendedEvent(
 *   'org-123',
 *   'user-456'
 * );
 * ```
 * @since 2.1.0
 */

import { DomainEvent } from '@aiofix/shared';

/**
 * 组织暂停事件数据接口
 */
export interface OrganizationSuspendedEventData {
  organizationId: string;
  suspendedBy: string;
  timestamp: Date;
}

/**
 * 组织暂停事件类
 */
export class OrganizationSuspendedEvent extends DomainEvent {
  public readonly eventType = 'OrganizationSuspended';
  public readonly eventVersion = '1.0.0';
  public readonly aggregateId: string;
  public readonly aggregateType = 'Organization';
  public readonly version = 1;

  constructor(
    public readonly organizationId: string,
    public readonly suspendedBy: string,
    public readonly timestamp: Date = new Date(),
  ) {
    super('OrganizationSuspended', {
      organizationId,
      suspendedBy,
      timestamp,
    });
    this.aggregateId = organizationId;
  }

  /**
   * 获取事件数据
   * @returns 事件数据
   */
  public getEventData(): OrganizationSuspendedEventData {
    return {
      organizationId: this.organizationId,
      suspendedBy: this.suspendedBy,
      timestamp: this.timestamp,
    };
  }
}
