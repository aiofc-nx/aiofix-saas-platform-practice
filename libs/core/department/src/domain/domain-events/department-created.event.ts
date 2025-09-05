/**
 * @class DepartmentCreatedEvent
 * @description 部门创建事件
 *
 * 原理与机制：
 * 1. 继承DomainEvent基类
 * 2. 包含事件的关键数据
 * 3. 支持事件溯源和审计
 * 4. 可以被其他模块订阅
 *
 * 功能与职责：
 * 1. 记录部门创建事件
 * 2. 传递关键信息
 * 3. 支持事件溯源和状态重建
 * 4. 触发相关的业务流程
 *
 * @example
 * ```typescript
 * const event = new DepartmentCreatedEvent(
 *   'dept-123',
 *   'Sales Department',
 *   'SALES',
 *   'tenant-456',
 *   'org-789'
 * );
 * ```
 * @since 2.1.0
 */

import { DomainEvent } from '@aiofix/shared';
import { DepartmentType } from '../enums';

/**
 * 部门创建事件
 */
export class DepartmentCreatedEvent extends DomainEvent {
  public readonly eventType = 'DepartmentCreated';
  public readonly eventVersion = '1.0.0';
  public readonly aggregateId: string;
  public readonly aggregateType = 'Department';
  public readonly version = 1;

  constructor(
    public readonly departmentId: string,
    public readonly name: string,
    public readonly code: string,
    public readonly type: DepartmentType,
    public readonly tenantId: string,
    public readonly organizationId: string,
    public readonly description?: string,
    public readonly parentDepartmentId?: string,
    public readonly managerId?: string,
    public readonly level: number = 1,
    public readonly path: string = '',
    public readonly createdBy: string = 'system',
    public readonly timestamp: Date = new Date(),
  ) {
    super('DepartmentCreated', {
      departmentId,
      name,
      code,
      type,
      tenantId,
      organizationId,
      description,
      parentDepartmentId,
      managerId,
      level,
      path,
      createdBy,
      timestamp,
    });
    this.aggregateId = departmentId;
  }

  /**
   * 获取事件数据
   * @returns 事件数据
   */
  public getEventData(): DepartmentCreatedEventData {
    return {
      departmentId: this.departmentId,
      name: this.name,
      code: this.code,
      type: this.type,
      tenantId: this.tenantId,
      organizationId: this.organizationId,
      description: this.description,
      parentDepartmentId: this.parentDepartmentId,
      managerId: this.managerId,
      level: this.level,
      path: this.path,
      createdBy: this.createdBy,
      timestamp: this.timestamp,
    };
  }
}

/**
 * 部门创建事件数据接口
 */
export interface DepartmentCreatedEventData {
  departmentId: string;
  name: string;
  code: string;
  type: DepartmentType;
  tenantId: string;
  organizationId: string;
  description?: string;
  parentDepartmentId?: string;
  managerId?: string;
  level: number;
  path: string;
  createdBy: string;
  timestamp: Date;
}
