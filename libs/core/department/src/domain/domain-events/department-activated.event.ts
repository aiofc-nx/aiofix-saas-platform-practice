/**
 * @class DepartmentActivatedEvent
 * @description 部门激活事件
 *
 * 原理与机制：
 * 1. 继承DomainEvent基类
 * 2. 包含事件的关键数据
 * 3. 支持事件溯源和审计
 * 4. 可以被其他模块订阅
 *
 * 功能与职责：
 * 1. 记录部门激活事件
 * 2. 传递关键信息
 * 3. 支持事件溯源和状态重建
 * 4. 触发相关的业务流程
 *
 * @example
 * ```typescript
 * const event = new DepartmentActivatedEvent(
 *   'dept-123',
 *   'user-456'
 * );
 * ```
 * @since 2.1.0
 */

import { DomainEvent } from '@aiofix/shared';

/**
 * 部门激活事件
 */
export class DepartmentActivatedEvent extends DomainEvent {
  public readonly eventType = 'DepartmentActivated';
  public readonly eventVersion = '1.0.0';
  public readonly aggregateId: string;
  public readonly aggregateType = 'Department';
  public readonly version = 1;

  constructor(
    public readonly departmentId: string,
    public readonly activatedBy: string,
    public readonly timestamp: Date = new Date(),
  ) {
    super('DepartmentActivated', {
      departmentId,
      activatedBy,
      timestamp,
    });
    this.aggregateId = departmentId;
  }

  /**
   * 获取事件数据
   * @returns 事件数据
   */
  public getEventData(): DepartmentActivatedEventData {
    return {
      departmentId: this.departmentId,
      activatedBy: this.activatedBy,
      timestamp: this.timestamp,
    };
  }
}

/**
 * 部门激活事件数据接口
 */
export interface DepartmentActivatedEventData {
  departmentId: string;
  activatedBy: string;
  timestamp: Date;
}
