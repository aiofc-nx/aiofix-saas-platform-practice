/**
 * @class DepartmentSuspendedEvent
 * @description 部门暂停事件
 *
 * 原理与机制：
 * 1. 继承DomainEvent基类
 * 2. 包含事件的关键数据
 * 3. 支持事件溯源和审计
 * 4. 可以被其他模块订阅
 *
 * 功能与职责：
 * 1. 记录部门暂停事件
 * 2. 传递关键信息
 * 3. 支持事件溯源和状态重建
 * 4. 触发相关的业务流程
 *
 * @example
 * ```typescript
 * const event = new DepartmentSuspendedEvent(
 *   'dept-123',
 *   'user-456'
 * );
 * ```
 * @since 2.1.0
 */

import { DomainEvent } from '@aiofix/shared';

/**
 * 部门暂停事件
 */
export class DepartmentSuspendedEvent extends DomainEvent {
  public readonly eventType = 'DepartmentSuspended';
  public readonly eventVersion = '1.0.0';
  public readonly aggregateId: string;
  public readonly aggregateType = 'Department';
  public readonly version = 1;

  constructor(
    public readonly departmentId: string,
    public readonly suspendedBy: string,
    public readonly timestamp: Date = new Date(),
  ) {
    super('DepartmentSuspended', {
      departmentId,
      suspendedBy,
      timestamp,
    });
    this.aggregateId = departmentId;
  }

  /**
   * 获取事件数据
   * @returns 事件数据
   */
  public getEventData(): DepartmentSuspendedEventData {
    return {
      departmentId: this.departmentId,
      suspendedBy: this.suspendedBy,
      timestamp: this.timestamp,
    };
  }
}

/**
 * 部门暂停事件数据接口
 */
export interface DepartmentSuspendedEventData {
  departmentId: string;
  suspendedBy: string;
  timestamp: Date;
}
