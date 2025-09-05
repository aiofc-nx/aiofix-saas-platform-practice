/**
 * @class DepartmentAggregate
 * @description
 * 部门聚合根，管理部门的一致性边界和业务规则。
 *
 * 原理与机制：
 * 1. 继承AggregateRoot，管理一致性边界
 * 2. 封装业务规则和验证逻辑
 * 3. 使用事件管理功能
 * 4. 确保数据完整性和一致性
 *
 * 功能与职责：
 * 1. 管理部门的生命周期
 * 2. 执行相关的业务规则
 * 3. 发布领域事件
 * 4. 维护数据的一致性
 *
 * @example
 * ```typescript
 * const aggregate = DepartmentAggregate.create(
 *   'dept-123',
 *   'Sales Department',
 *   'SALES',
 *   'tenant-456',
 *   'org-789'
 * );
 * aggregate.activate();
 * ```
 * @since 2.1.0
 */

import {
  AggregateRoot,
  DepartmentId,
  DepartmentName,
  DepartmentCode,
} from '@aiofix/shared';
import { DepartmentEntity } from '../entities';
import { DepartmentStatus, DepartmentType } from '../enums';
import {
  DepartmentCreatedEvent,
  DepartmentActivatedEvent,
  DepartmentSuspendedEvent,
  DepartmentDeactivatedEvent,
  DepartmentUpdatedEvent,
} from '../domain-events';

/**
 * 部门聚合根
 */
export class DepartmentAggregate extends AggregateRoot<string> {
  private _department!: DepartmentEntity;

  constructor(id: string) {
    super(id);
    // 聚合根构造函数，用于事件溯源重建
  }

  /**
   * 创建部门聚合根
   * @param departmentId 部门ID
   * @param name 部门名称
   * @param code 部门代码
   * @param type 部门类型
   * @param tenantId 租户ID
   * @param organizationId 组织ID
   * @param description 部门描述（可选）
   * @param parentDepartmentId 父部门ID（可选）
   * @param managerId 管理员ID（可选）
   * @param level 部门层级
   * @param path 部门路径
   * @param createdBy 创建者
   * @returns 部门聚合根
   */
  static create(
    departmentId: DepartmentId,
    name: DepartmentName,
    code: DepartmentCode,
    type: DepartmentType,
    tenantId: string,
    organizationId: string,
    description?: string,
    parentDepartmentId?: DepartmentId,
    managerId?: string,
    level: number = 1,
    path: string = '',
    createdBy: string = 'system',
  ): DepartmentAggregate {
    const aggregate = new DepartmentAggregate(departmentId.toString());

    // 创建部门实体
    aggregate._department = DepartmentEntity.create(
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
    );

    // 应用创建事件
    aggregate.addDomainEvent(
      new DepartmentCreatedEvent(
        departmentId.toString(),
        name.toString(),
        code.toString(),
        type,
        tenantId,
        organizationId,
        description,
        parentDepartmentId?.toString(),
        managerId,
        level,
        path,
        createdBy,
      ),
    );

    return aggregate;
  }

  /**
   * 激活部门
   * @param updatedBy 更新者
   */
  activate(updatedBy: string): void {
    this._department.activate(updatedBy);

    this.addDomainEvent(
      new DepartmentActivatedEvent(
        this._department.departmentId.toString(),
        updatedBy,
      ),
    );
  }

  /**
   * 暂停部门
   * @param updatedBy 更新者
   */
  suspend(updatedBy: string): void {
    this._department.suspend(updatedBy);

    this.addDomainEvent(
      new DepartmentSuspendedEvent(
        this._department.departmentId.toString(),
        updatedBy,
      ),
    );
  }

  /**
   * 停用部门
   * @param updatedBy 更新者
   */
  deactivate(updatedBy: string): void {
    this._department.deactivate(updatedBy);

    this.addDomainEvent(
      new DepartmentDeactivatedEvent(
        this._department.departmentId.toString(),
        updatedBy,
      ),
    );
  }

  /**
   * 更新部门信息
   * @param name 新名称（可选）
   * @param description 新描述（可选）
   * @param managerId 新管理员ID（可选）
   * @param updatedBy 更新者
   */
  updateInfo(
    name?: DepartmentName,
    description?: string,
    managerId?: string,
    updatedBy: string = 'system',
  ): void {
    const oldName = this._department.name.toString();
    const oldDescription = this._department.description;
    const oldManagerId = this._department.managerId;

    this._department.updateInfo(name, description, managerId, updatedBy);

    // 构建变更记录
    const changes: Record<string, { old?: unknown; new?: unknown }> = {};
    if (name && name.toString() !== oldName) {
      changes.name = { old: oldName, new: name.toString() };
    }
    if (description !== undefined && description !== oldDescription) {
      changes.description = { old: oldDescription, new: description };
    }
    if (managerId !== undefined && managerId !== oldManagerId) {
      changes.managerId = { old: oldManagerId, new: managerId };
    }

    if (Object.keys(changes).length > 0) {
      this.addDomainEvent(
        new DepartmentUpdatedEvent(
          this._department.departmentId.toString(),
          changes,
          updatedBy,
        ),
      );
    }
  }

  /**
   * 设置元数据
   * @param key 元数据键
   * @param value 元数据值
   * @param updatedBy 更新者
   */
  setMetadata(key: string, value: unknown, updatedBy: string = 'system'): void {
    const oldValue = this._department.getMetadata(key);
    this._department.setMetadata(key, value, updatedBy);

    this.addDomainEvent(
      new DepartmentUpdatedEvent(
        this._department.departmentId.toString(),
        {
          [`metadata.${key}`]: { old: oldValue, new: value },
        },
        updatedBy,
      ),
    );
  }

  /**
   * 更新部门层级和路径
   * @param level 新层级
   * @param path 新路径
   * @param updatedBy 更新者
   */
  updateHierarchy(
    level: number,
    path: string,
    updatedBy: string = 'system',
  ): void {
    const oldLevel = this._department.level;
    const oldPath = this._department.path;

    this._department.updateHierarchy(level, path, updatedBy);

    this.addDomainEvent(
      new DepartmentUpdatedEvent(
        this._department.departmentId.toString(),
        {
          level: { old: oldLevel, new: level },
          path: { old: oldPath, new: path },
        },
        updatedBy,
      ),
    );
  }

  /**
   * 从历史事件重建聚合根状态
   * @param history 历史事件列表
   */
  loadFromHistory(history: string[]): void {
    if (history.length === 0) {
      throw new Error('无法从空事件列表重建聚合根状态');
    }

    // 这里应该根据实际的事件溯源实现来处理
    // 暂时留空，后续实现事件溯源时再完善
  }

  /**
   * 获取部门实体
   * @returns 部门实体
   */
  get department(): DepartmentEntity {
    return this._department;
  }

  /**
   * 获取部门ID
   * @returns 部门ID
   */
  get departmentId(): DepartmentId {
    return this._department.departmentId;
  }

  /**
   * 获取部门名称
   * @returns 部门名称
   */
  get name(): DepartmentName {
    return this._department.name;
  }

  /**
   * 获取部门代码
   * @returns 部门代码
   */
  get code(): DepartmentCode {
    return this._department.code;
  }

  /**
   * 获取部门类型
   * @returns 部门类型
   */
  get type(): DepartmentType {
    return this._department.type;
  }

  /**
   * 获取部门状态
   * @returns 部门状态
   */
  get status(): DepartmentStatus {
    return this._department.status;
  }

  /**
   * 获取部门描述
   * @returns 部门描述
   */
  get description(): string | undefined {
    return this._department.description;
  }

  /**
   * 获取父部门ID
   * @returns 父部门ID
   */
  get parentDepartmentId(): DepartmentId | undefined {
    return this._department.parentDepartmentId;
  }

  /**
   * 获取管理员ID
   * @returns 管理员ID
   */
  get managerId(): string | undefined {
    return this._department.managerId;
  }

  /**
   * 获取部门层级
   * @returns 部门层级
   */
  get level(): number {
    return this._department.level;
  }

  /**
   * 获取部门路径
   * @returns 部门路径
   */
  get path(): string {
    return this._department.path;
  }

  /**
   * 获取创建者
   * @returns 创建者
   */
  get createdBy(): string {
    return this._department.createdBy;
  }

  /**
   * 获取更新者
   * @returns 更新者
   */
  get updatedBy(): string | undefined {
    return this._department.updatedBy;
  }

  /**
   * 获取创建时间
   * @returns 创建时间
   */
  get createdAt(): Date {
    return this._department.createdAt;
  }

  /**
   * 获取更新时间
   * @returns 更新时间
   */
  get updatedAt(): Date {
    return this._department.updatedAt;
  }
}
