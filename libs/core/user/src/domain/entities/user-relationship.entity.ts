/**
 * @class UserRelationshipEntity
 * @description
 * 用户关系领域实体，代表系统中用户与其他实体（租户、组织、部门）的关系。
 *
 * 原理与机制：
 * 1. 作为领域层的实体，UserRelationshipEntity聚合了与用户关系相关的属性（如关系类型、状态、权限等）。
 * 2. 继承DataIsolationAwareEntity，支持多层级数据隔离（用户级数据隔离）。
 * 3. 实体的唯一性由id属性保证，所有与用户关系相关的业务规则应在该实体内实现，确保领域一致性。
 * 4. 使用值对象封装复杂属性，确保领域概念的完整性。
 *
 * 功能与职责：
 * 1. 表达用户关系的核心业务属性和行为
 * 2. 封装与用户关系相关的业务规则
 * 3. 保证用户关系实体的一致性和完整性
 * 4. 提供领域事件发布能力
 * 5. 支持用户级数据隔离和访问控制
 *
 * @example
 * ```typescript
 * const relationship = new UserRelationshipEntity(
 *   'rel-123',
 *   'user-456',
 *   'tenant-789',
 *   'TENANT_MEMBER',
 *   'ACTIVE'
 * );
 * relationship.activate();
 * relationship.grantPermission('READ');
 * ```
 * @since 1.0.0
 */

import {
  DataIsolationAwareEntity,
  DataIsolationLevel,
  DataPrivacyLevel,
  Uuid,
} from '@aiofix/shared';

/**
 * 关系类型枚举
 * @description 定义用户与其他实体的关系类型
 */
export enum RelationshipType {
  /**
   * 租户成员
   * @description 用户是租户的成员
   */
  TENANT_MEMBER = 'TENANT_MEMBER',

  /**
   * 组织成员
   * @description 用户是组织的成员
   */
  ORGANIZATION_MEMBER = 'ORGANIZATION_MEMBER',

  /**
   * 部门成员
   * @description 用户是部门的成员
   */
  DEPARTMENT_MEMBER = 'DEPARTMENT_MEMBER',

  /**
   * 租户管理员
   * @description 用户是租户的管理员
   */
  TENANT_ADMIN = 'TENANT_ADMIN',

  /**
   * 组织管理员
   * @description 用户是组织的管理员
   */
  ORGANIZATION_ADMIN = 'ORGANIZATION_ADMIN',

  /**
   * 部门管理员
   * @description 用户是部门的管理员
   */
  DEPARTMENT_ADMIN = 'DEPARTMENT_ADMIN',

  /**
   * 租户所有者
   * @description 用户是租户的所有者
   */
  TENANT_OWNER = 'TENANT_OWNER',
}

/**
 * 关系状态枚举
 * @description 定义用户关系的状态
 */
export enum RelationshipStatus {
  /**
   * 激活状态
   * @description 关系处于激活状态
   */
  ACTIVE = 'ACTIVE',

  /**
   * 非激活状态
   * @description 关系处于非激活状态
   */
  INACTIVE = 'INACTIVE',

  /**
   * 暂停状态
   * @description 关系处于暂停状态
   */
  SUSPENDED = 'SUSPENDED',

  /**
   * 待审核状态
   * @description 关系等待审核
   */
  PENDING = 'PENDING',

  /**
   * 拒绝状态
   * @description 关系被拒绝
   */
  REJECTED = 'REJECTED',

  /**
   * 过期状态
   * @description 关系已过期
   */
  EXPIRED = 'EXPIRED',
}

/**
 * 用户关系实体类
 * @description 继承DataIsolationAwareEntity，支持用户级数据隔离
 */
export class UserRelationshipEntity extends DataIsolationAwareEntity {
  /**
   * 用户ID
   * @description 关系中的用户ID
   */
  protected readonly _userId: Uuid;

  /**
   * 目标实体ID
   * @description 关系中的目标实体ID（租户、组织、部门等）
   */
  private readonly _targetEntityId: string;

  /**
   * 目标实体类型
   * @description 目标实体的类型
   */
  private readonly _targetEntityType: string;

  /**
   * 关系类型
   * @description 用户与目标实体的关系类型
   */
  private _relationshipType: RelationshipType;

  /**
   * 关系状态
   * @description 关系的当前状态
   */
  private _status: RelationshipStatus;

  /**
   * 权限列表
   * @description 用户在该关系中的权限列表
   */
  private readonly _permissions: string[] = [];

  /**
   * 关系开始时间
   * @description 关系开始生效的时间
   */
  private readonly _startDate: Date;

  /**
   * 关系结束时间
   * @description 关系结束的时间（可选）
   */
  private _endDate?: Date;

  /**
   * 关系描述
   * @description 关系的描述信息
   */
  private _description?: string;

  /**
   * 构造函数，初始化用户关系实体
   * @description 创建用户关系实体实例，设置基本属性并验证数据有效性
   * @param {string} id 关系唯一标识，必须为非空字符串
   * @param {string} userId 用户ID，必须为非空字符串
   * @param {string} targetEntityId 目标实体ID，必须为非空字符串
   * @param {string} targetEntityType 目标实体类型，必须为非空字符串
   * @param {RelationshipType} relationshipType 关系类型
   * @param {RelationshipStatus} status 关系状态
   * @param {string} tenantId 租户ID，用于数据隔离
   * @param {string} [organizationId] 组织ID，可选
   * @param {string[]} [departmentIds] 部门ID列表，可选
   * @param {DataPrivacyLevel} [dataPrivacyLevel] 数据隐私级别，默认为受保护
   * @throws {InvalidArgumentException} 当参数无效时抛出异常
   */
  constructor(
    id: string,
    userId: string,
    targetEntityId: string,
    targetEntityType: string,
    relationshipType: RelationshipType,
    status: RelationshipStatus,
    tenantId: string,
    organizationId?: string,
    departmentIds: string[] = [],
    dataPrivacyLevel: DataPrivacyLevel = DataPrivacyLevel.PROTECTED,
  ) {
    // 调用父类构造函数，设置数据隔离信息
    super(
      new Uuid(tenantId),
      DataIsolationLevel.USER,
      dataPrivacyLevel,
      new Uuid(id),
      organizationId ? new Uuid(organizationId) : undefined,
      departmentIds.map(deptId => new Uuid(deptId)),
      new Uuid(userId),
    );

    this._userId = new Uuid(userId);
    this._targetEntityId = targetEntityId;
    this._targetEntityType = targetEntityType;
    this._relationshipType = relationshipType;
    this._status = status;
    this._startDate = new Date();
  }

  /**
   * 激活关系
   * @description 将关系状态设置为激活状态
   */
  public activate(): void {
    if (this._status === RelationshipStatus.ACTIVE) {
      return; // 如果已经是激活状态，直接返回
    }
    this._status = RelationshipStatus.ACTIVE;
  }

  /**
   * 停用关系
   * @description 将关系状态设置为非激活状态
   */
  public deactivate(): void {
    if (this._status === RelationshipStatus.INACTIVE) {
      return; // 如果已经是非激活状态，直接返回
    }
    this._status = RelationshipStatus.INACTIVE;
  }

  /**
   * 暂停关系
   * @description 将关系状态设置为暂停状态
   */
  public suspend(): void {
    if (this._status === RelationshipStatus.SUSPENDED) {
      return; // 如果已经是暂停状态，直接返回
    }
    this._status = RelationshipStatus.SUSPENDED;
  }

  /**
   * 拒绝关系
   * @description 将关系状态设置为拒绝状态
   */
  public reject(): void {
    if (this._status === RelationshipStatus.REJECTED) {
      return; // 如果已经是拒绝状态，直接返回
    }
    this._status = RelationshipStatus.REJECTED;
  }

  /**
   * 设置关系结束时间
   * @description 设置关系的结束时间
   * @param {Date} endDate 结束时间
   */
  public setEndDate(endDate: Date): void {
    if (endDate <= this._startDate) {
      throw new Error('结束时间必须晚于开始时间');
    }
    this._endDate = endDate;
  }

  /**
   * 授予权限
   * @description 向用户授予指定权限
   * @param {string} permission 权限名称
   */
  public grantPermission(permission: string): void {
    if (!this._permissions.includes(permission)) {
      this._permissions.push(permission);
    }
  }

  /**
   * 撤销权限
   * @description 撤销用户的指定权限
   * @param {string} permission 权限名称
   */
  public revokePermission(permission: string): void {
    const index = this._permissions.indexOf(permission);
    if (index > -1) {
      this._permissions.splice(index, 1);
    }
  }

  /**
   * 检查权限
   * @description 检查用户是否具有指定权限
   * @param {string} permission 权限名称
   * @returns {boolean} 如果具有权限返回true，否则返回false
   */
  public hasPermission(permission: string): boolean {
    return this._permissions.includes(permission);
  }

  /**
   * 检查关系是否激活
   * @description 判断关系当前是否为激活状态
   * @returns {boolean} 如果关系激活返回true，否则返回false
   */
  public isActive(): boolean {
    return this._status === RelationshipStatus.ACTIVE;
  }

  /**
   * 检查关系是否过期
   * @description 判断关系是否已过期
   * @returns {boolean} 如果关系过期返回true，否则返回false
   */
  public isExpired(): boolean {
    if (!this._endDate) {
      return false; // 如果没有设置结束时间，则永不过期
    }
    return new Date() > this._endDate;
  }

  /**
   * 更新关系类型
   * @description 更新用户与目标实体的关系类型
   * @param {RelationshipType} newType 新的关系类型
   */
  public updateRelationshipType(newType: RelationshipType): void {
    this._relationshipType = newType;
  }

  /**
   * 更新关系描述
   * @description 更新关系的描述信息
   * @param {string} description 新的描述信息
   */
  public updateDescription(description: string): void {
    this._description = description;
  }

  // Getters
  public get userId(): Uuid {
    return this._userId;
  }

  public get targetEntityId(): string {
    return this._targetEntityId;
  }

  public get targetEntityType(): string {
    return this._targetEntityType;
  }

  public get relationshipType(): RelationshipType {
    return this._relationshipType;
  }

  public get status(): RelationshipStatus {
    return this._status;
  }

  public get permissions(): string[] {
    return [...this._permissions];
  }

  public get startDate(): Date {
    return this._startDate;
  }

  public get endDate(): Date | undefined {
    return this._endDate;
  }

  public get description(): string | undefined {
    return this._description;
  }
}
