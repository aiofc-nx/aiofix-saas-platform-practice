/**
 * @class DepartmentEntity
 * @description
 * 部门领域实体，代表系统中的部门对象，包含部门的核心属性和行为。
 *
 * 原理与机制：
 * 1. 作为领域层的实体，DepartmentEntity聚合了与部门相关的属性（如id、name、code等）和业务方法（如激活、暂停等）。
 * 2. 继承DataIsolationAwareEntity，支持多层级数据隔离（平台级、租户级、组织级、部门级、用户级）。
 * 3. 实体的唯一性由id属性保证，所有与部门相关的业务规则应在该实体内实现，确保领域一致性。
 * 4. 使用值对象封装复杂属性，确保领域概念的完整性。
 *
 * 功能与职责：
 * 1. 表达部门的核心业务属性和行为
 * 2. 封装与部门相关的业务规则
 * 3. 保证部门实体的一致性和完整性
 * 4. 提供领域事件发布能力
 * 5. 支持多层级数据隔离和访问控制
 *
 * @example
 * ```typescript
 * const department = new DepartmentEntity(
 *   'dept-123',
 *   'Sales Department',
 *   'SALES',
 *   'tenant-456',
 *   'org-789'
 * );
 * department.activate();
 * ```
 * @since 2.1.0
 */

import {
  DataIsolationAwareEntity,
  DataIsolationLevel,
  DataPrivacyLevel,
  Uuid,
  DepartmentId,
  DepartmentName,
  DepartmentCode,
} from '@aiofix/shared';
import { DepartmentStatus, DepartmentType } from '../enums';

/**
 * 部门实体类
 */
export class DepartmentEntity extends DataIsolationAwareEntity {
  protected readonly _departmentId: DepartmentId;
  private _name: DepartmentName;
  private readonly _code: DepartmentCode;
  private readonly _type: DepartmentType;
  private _status: DepartmentStatus;
  private _description?: string;
  private readonly _parentDepartmentId?: DepartmentId;
  private _managerId?: string;
  private _level: number;
  private _path: string;
  private _metadata: Record<string, unknown>;
  private readonly _createdBy: string;
  private _updatedBy?: string;

  /**
   * @constructor
   * @description 创建部门实体
   * @param departmentId 部门ID
   * @param name 部门名称
   * @param code 部门代码
   * @param type 部门类型
   * @param tenantId 租户ID
   * @param organizationId 组织ID
   * @param dataPrivacyLevel 数据隐私级别
   * @param status 部门状态
   * @param description 部门描述（可选）
   * @param parentDepartmentId 父部门ID（可选）
   * @param managerId 管理员ID（可选）
   * @param level 部门层级
   * @param path 部门路径
   * @param createdBy 创建者
   */
  constructor(
    departmentId: DepartmentId,
    name: DepartmentName,
    code: DepartmentCode,
    type: DepartmentType,
    tenantId: string,
    organizationId: string,
    dataPrivacyLevel: DataPrivacyLevel = DataPrivacyLevel.PROTECTED,
    status: DepartmentStatus = DepartmentStatus.INITIALIZING,
    description?: string,
    parentDepartmentId?: DepartmentId,
    managerId?: string,
    level: number = 1,
    path: string = '',
    createdBy: string = 'system',
  ) {
    super(
      new Uuid(tenantId),
      DataIsolationLevel.DEPARTMENT, // 部门级数据隔离
      dataPrivacyLevel,
      new Uuid(departmentId.toString()),
      new Uuid(organizationId),
      [], // 部门没有子部门列表，通过层级关系管理
    );

    this._departmentId = departmentId;
    this._name = name;
    this._code = code;
    this._type = type;
    this._status = status;
    this._description = description;
    this._parentDepartmentId = parentDepartmentId;
    this._managerId = managerId;
    this._level = level;
    this._path = path;
    this._metadata = {};
    this._createdBy = createdBy;
  }

  /**
   * 获取部门ID
   * @returns 部门ID
   */
  get departmentId(): DepartmentId {
    return this._departmentId;
  }

  /**
   * 获取部门名称
   * @returns 部门名称
   */
  get name(): DepartmentName {
    return this._name;
  }

  /**
   * 获取部门代码
   * @returns 部门代码
   */
  get code(): DepartmentCode {
    return this._code;
  }

  /**
   * 获取部门类型
   * @returns 部门类型
   */
  get type(): DepartmentType {
    return this._type;
  }

  /**
   * 获取部门状态
   * @returns 部门状态
   */
  get status(): DepartmentStatus {
    return this._status;
  }

  /**
   * 获取部门描述
   * @returns 部门描述
   */
  get description(): string | undefined {
    return this._description;
  }

  /**
   * 获取父部门ID
   * @returns 父部门ID
   */
  get parentDepartmentId(): DepartmentId | undefined {
    return this._parentDepartmentId;
  }

  /**
   * 获取管理员ID
   * @returns 管理员ID
   */
  get managerId(): string | undefined {
    return this._managerId;
  }

  /**
   * 获取部门层级
   * @returns 部门层级
   */
  get level(): number {
    return this._level;
  }

  /**
   * 获取部门路径
   * @returns 部门路径
   */
  get path(): string {
    return this._path;
  }

  /**
   * 获取创建者
   * @returns 创建者
   */
  get createdBy(): string {
    return this._createdBy;
  }

  /**
   * 获取更新者
   * @returns 更新者
   */
  get updatedBy(): string | undefined {
    return this._updatedBy;
  }

  /**
   * 获取创建时间
   * @returns 创建时间
   */
  get createdAt(): Date {
    return this._createdAt;
  }

  /**
   * 获取更新时间
   * @returns 更新时间
   */
  get updatedAt(): Date {
    return this._updatedAt;
  }

  /**
   * 检查部门是否处于有效状态
   * @returns 是否有效
   */
  isValid(): boolean {
    return (
      (this._status === DepartmentStatus.ACTIVE ||
        this._status === DepartmentStatus.INITIALIZING) &&
      !this.isExpired()
    );
  }

  /**
   * 检查部门是否可以提供服务
   * @returns 是否可以提供服务
   */
  canProvideService(): boolean {
    return this._status === DepartmentStatus.ACTIVE;
  }

  /**
   * 检查部门是否已过期
   * @returns 是否已过期
   */
  isExpired(): boolean {
    // 这里可以添加过期逻辑，比如基于创建时间或其他条件
    return false;
  }

  /**
   * 激活部门
   * @param updatedBy 更新者
   */
  activate(updatedBy: string): void {
    if (this._status === DepartmentStatus.ACTIVE) {
      return; // 已经是激活状态，直接返回
    }

    if (!this.canTransitionTo(DepartmentStatus.ACTIVE)) {
      throw new Error(`部门状态为 ${this._status}，不能激活`);
    }

    this._status = DepartmentStatus.ACTIVE;
    this._updatedBy = updatedBy;
    this._updatedAt = new Date();
  }

  /**
   * 暂停部门
   * @param updatedBy 更新者
   */
  suspend(updatedBy: string): void {
    if (this._status === DepartmentStatus.SUSPENDED) {
      return; // 已经是暂停状态，直接返回
    }

    if (!this.canTransitionTo(DepartmentStatus.SUSPENDED)) {
      throw new Error(`部门状态为 ${this._status}，不能暂停`);
    }

    this._status = DepartmentStatus.SUSPENDED;
    this._updatedBy = updatedBy;
    this._updatedAt = new Date();
  }

  /**
   * 停用部门
   * @param updatedBy 更新者
   */
  deactivate(updatedBy: string): void {
    if (this._status === DepartmentStatus.INACTIVE) {
      return; // 已经是停用状态，直接返回
    }

    if (!this.canTransitionTo(DepartmentStatus.INACTIVE)) {
      throw new Error(`部门状态为 ${this._status}，不能停用`);
    }

    this._status = DepartmentStatus.INACTIVE;
    this._updatedBy = updatedBy;
    this._updatedAt = new Date();
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
    if (name) {
      this._name = name;
    }
    if (description !== undefined) {
      this._description = description;
    }
    if (managerId !== undefined) {
      this._managerId = managerId;
    }

    this._updatedBy = updatedBy;
    this._updatedAt = new Date();
  }

  /**
   * 设置元数据
   * @param key 元数据键
   * @param value 元数据值
   * @param updatedBy 更新者
   */
  setMetadata(key: string, value: unknown, updatedBy: string = 'system'): void {
    this._metadata[key] = value;
    this._updatedBy = updatedBy;
    this._updatedAt = new Date();
  }

  /**
   * 获取元数据
   * @param key 元数据键
   * @returns 元数据值
   */
  getMetadata(key: string): unknown {
    return this._metadata[key];
  }

  /**
   * 获取所有元数据
   * @returns 元数据对象
   */
  getAllMetadata(): Record<string, unknown> {
    return { ...this._metadata };
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
    this._level = level;
    this._path = path;
    this._updatedBy = updatedBy;
    this._updatedAt = new Date();
  }

  /**
   * 检查是否可以转换到指定状态
   * @param targetStatus 目标状态
   * @returns 是否可以转换
   */
  private canTransitionTo(targetStatus: DepartmentStatus): boolean {
    const validTransitions: Record<DepartmentStatus, DepartmentStatus[]> = {
      [DepartmentStatus.INITIALIZING]: [
        DepartmentStatus.ACTIVE,
        DepartmentStatus.INACTIVE,
      ],
      [DepartmentStatus.ACTIVE]: [
        DepartmentStatus.SUSPENDED,
        DepartmentStatus.MAINTENANCE,
        DepartmentStatus.INACTIVE,
      ],
      [DepartmentStatus.MAINTENANCE]: [
        DepartmentStatus.ACTIVE,
        DepartmentStatus.SUSPENDED,
        DepartmentStatus.INACTIVE,
      ],
      [DepartmentStatus.SUSPENDED]: [
        DepartmentStatus.ACTIVE,
        DepartmentStatus.MAINTENANCE,
        DepartmentStatus.INACTIVE,
      ],
      [DepartmentStatus.INACTIVE]: [DepartmentStatus.ACTIVE],
      [DepartmentStatus.DELETED]: [], // 删除状态不能转换到其他状态
    };

    return validTransitions[this._status].includes(targetStatus);
  }

  /**
   * 创建新的部门实体
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
   * @returns 部门实体
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
  ): DepartmentEntity {
    return new DepartmentEntity(
      departmentId,
      name,
      code,
      type,
      tenantId,
      organizationId,
      DataPrivacyLevel.PROTECTED,
      DepartmentStatus.INITIALIZING,
      description,
      parentDepartmentId,
      managerId,
      level,
      path,
      createdBy,
    );
  }
}
