/**
 * @class DepartmentUpdatedEvent
 * @description 部门更新事件
 *
 * 原理与机制：
 * 1. 继承DomainEvent基类
 * 2. 包含事件的关键数据
 * 3. 支持事件溯源和审计
 * 4. 可以被其他模块订阅
 *
 * 功能与职责：
 * 1. 记录部门更新事件
 * 2. 传递关键信息
 * 3. 支持事件溯源和状态重建
 * 4. 触发相关的业务流程
 *
 * @example
 * ```typescript
 * const event = new DepartmentUpdatedEvent(
 *   'dept-123',
 *   { name: { old: 'Old Name', new: 'New Name' } },
 *   'user-456'
 * );
 * ```
 * @since 2.1.0
 */

import { DomainEvent } from '@aiofix/shared';

/**
 * 部门更新事件
 */
export class DepartmentUpdatedEvent extends DomainEvent {
  public readonly eventType = 'DepartmentUpdated';
  public readonly eventVersion = '1.0.0';
  public readonly aggregateId: string;
  public readonly aggregateType = 'Department';
  public readonly version = 1;

  constructor(
    public readonly departmentId: string,
    public readonly changes: Record<string, { old?: unknown; new?: unknown }>,
    public readonly updatedBy: string,
    public readonly timestamp: Date = new Date(),
  ) {
    super('DepartmentUpdated', {
      departmentId,
      changes,
      updatedBy,
      timestamp,
    });
    this.aggregateId = departmentId;
  }

  /**
   * 获取事件数据
   * @returns 事件数据
   */
  public getEventData(): DepartmentUpdatedEventData {
    return {
      departmentId: this.departmentId,
      changes: this.changes,
      updatedBy: this.updatedBy,
      timestamp: this.timestamp,
    };
  }
}

/**
 * 部门更新事件数据接口
 */
export interface DepartmentUpdatedEventData {
  departmentId: string;
  changes: Record<string, { old?: unknown; new?: unknown }>;
  updatedBy: string;
  timestamp: Date;
}
