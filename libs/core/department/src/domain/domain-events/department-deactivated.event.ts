/**
 * @class DepartmentDeactivatedEvent
 * @description 部门停用事件
 *
 * 原理与机制：
 * 1. 继承DomainEvent基类
 * 2. 包含事件的关键数据
 * 3. 支持事件溯源和审计
 * 4. 可以被其他模块订阅
 *
 * 功能与职责：
 * 1. 记录部门停用事件
 * 2. 传递关键信息
 * 3. 支持事件溯源和状态重建
 * 4. 触发相关的业务流程
 *
 * @example
 * ```typescript
 * const event = new DepartmentDeactivatedEvent(
 *   'dept-123',
 *   'user-456'
 * );
 * ```
 * @since 2.1.0
 */

import { DomainEvent } from '@aiofix/shared';

/**
 * 部门停用事件
 */
export class DepartmentDeactivatedEvent extends DomainEvent {
  public readonly eventType = 'DepartmentDeactivated';
  public readonly eventVersion = '1.0.0';
  public readonly aggregateId: string;
  public readonly aggregateType = 'Department';
  public readonly version = 1;

  constructor(
    public readonly departmentId: string,
    public readonly deactivatedBy: string,
    public readonly timestamp: Date = new Date(),
  ) {
    super('DepartmentDeactivated', {
      departmentId,
      deactivatedBy,
      timestamp,
    });
    this.aggregateId = departmentId;
  }

  /**
   * 获取事件数据
   * @returns 事件数据
   */
  public getEventData(): DepartmentDeactivatedEventData {
    return {
      departmentId: this.departmentId,
      deactivatedBy: this.deactivatedBy,
      timestamp: this.timestamp,
    };
  }
}

/**
 * 部门停用事件数据接口
 */
export interface DepartmentDeactivatedEventData {
  departmentId: string;
  deactivatedBy: string;
  timestamp: Date;
}
