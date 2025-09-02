/**
 * @file data-isolation-aware.entity.ts
 * @description 数据隔离感知实体基类
 *
 * 该文件定义了数据隔离感知实体基类，为所有需要多层级数据隔离的实体提供基础能力。
 * 数据隔离感知实体是支持多租户SaaS平台多层级数据隔离的核心基础设施。
 *
 * 主要功能：
 * 1. 多层级数据隔离支持（平台级、租户级、组织级、部门级、用户级）
 * 2. 跨级别访问检查
 * 3. 数据一致性验证
 * 4. 公共数据访问控制
 *
 * 遵循DDD和Clean Architecture原则，提供统一的数据隔离抽象。
 */

import { BaseEntity } from './base-entity';
import { Uuid } from '../value-objects/uuid.vo';

/**
 * @enum DataIsolationLevel
 * @description 数据隔离级别枚举
 */
export enum DataIsolationLevel {
  /** 平台级隔离 */
  PLATFORM = 'platform',
  /** 租户级隔离 */
  TENANT = 'tenant',
  /** 组织级隔离 */
  ORGANIZATION = 'organization',
  /** 部门级隔离 */
  DEPARTMENT = 'department',
  /** 子部门级隔离 */
  SUB_DEPARTMENT = 'sub_department',
  /** 用户级隔离 */
  USER = 'user',
}

/**
 * @enum DataPrivacyLevel
 * @description 数据隐私级别枚举
 */
export enum DataPrivacyLevel {
  /** 可共享 */
  SHARED = 'shared',
  /** 受保护 */
  PROTECTED = 'protected',
}

/**
 * @interface TenantContext
 * @description 租户上下文信息
 */
export interface TenantContext {
  tenantId: string;
  organizationId?: string;
  departmentIds?: string[];
  isolationLevel: DataIsolationLevel;
}

/**
 * @class TenantAccessDeniedError
 * @description 租户访问被拒绝异常
 */
export class TenantAccessDeniedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TenantAccessDeniedError';
  }
}

/**
 * @abstract
 * @class DataIsolationAwareEntity
 * @description 数据隔离感知实体基类
 *
 * 所有需要多层级数据隔离的实体的基类，提供以下功能：
 * - 多层级数据隔离支持（平台级、租户级、组织级、部门级、用户级）
 * - 跨级别访问检查
 * - 数据一致性验证
 * - 公共数据访问控制
 * - 数据上下文管理
 *
 * 使用场景：
 * - 所有业务实体（User、Organization、Department等）
 * - 需要数据隔离的聚合根
 * - 跨领域共享的实体
 * - 多层级数据访问控制
 */
export abstract class DataIsolationAwareEntity extends BaseEntity {
  protected readonly _tenantId: Uuid;
  protected _organizationId?: Uuid;
  protected _departmentIds: Uuid[] = [];
  protected _userId?: Uuid; // 添加用户ID支持
  protected _dataIsolationLevel: DataIsolationLevel;
  protected _dataPrivacyLevel: DataPrivacyLevel; // 添加隐私级别

  /**
   * @constructor
   * @description 创建数据隔离感知实体
   * @param tenantId 租户ID
   * @param dataIsolationLevel 数据隔离级别
   * @param dataPrivacyLevel 数据隐私级别
   * @param id 实体唯一标识符
   * @param organizationId 组织ID（可选）
   * @param departmentIds 部门ID列表（可选）
   * @param userId 用户ID（可选）
   */
  constructor(
    tenantId: Uuid,
    dataIsolationLevel: DataIsolationLevel = DataIsolationLevel.TENANT,
    dataPrivacyLevel: DataPrivacyLevel = DataPrivacyLevel.PROTECTED,
    id?: Uuid,
    organizationId?: Uuid,
    departmentIds: Uuid[] = [],
    userId?: Uuid,
  ) {
    super(id ?? Uuid.generate());
    this._tenantId = tenantId;
    this._dataIsolationLevel = dataIsolationLevel;
    this._dataPrivacyLevel = dataPrivacyLevel;
    this._organizationId = organizationId;
    this._departmentIds = [...departmentIds];
    this._userId = userId;
  }

  /**
   * @getter tenantId
   * @description 获取租户ID
   * @returns {Uuid} 租户ID
   */
  get tenantId(): Uuid {
    return this._tenantId;
  }

  /**
   * @getter organizationId
   * @description 获取组织ID
   * @returns {Uuid|undefined} 组织ID
   */
  get organizationId(): Uuid | undefined {
    return this._organizationId;
  }

  /**
   * @getter departmentIds
   * @description 获取部门ID列表
   * @returns {Uuid[]} 部门ID列表
   */
  get departmentIds(): Uuid[] {
    return [...this._departmentIds];
  }

  /**
   * @getter dataIsolationLevel
   * @description 获取数据隔离级别
   * @returns {DataIsolationLevel} 数据隔离级别
   */
  get dataIsolationLevel(): DataIsolationLevel {
    return this._dataIsolationLevel;
  }

  /**
   * @getter userId
   * @description 获取用户ID
   * @returns {Uuid|undefined} 用户ID
   */
  get userId(): Uuid | undefined {
    return this._userId;
  }

  /**
   * @getter dataPrivacyLevel
   * @description 获取数据隐私级别
   * @returns {DataPrivacyLevel} 数据隐私级别
   */
  get dataPrivacyLevel(): DataPrivacyLevel {
    return this._dataPrivacyLevel;
  }

  /**
   * @method assertSameTenant
   * @description 断言目标对象属于同一租户
   * @param other 目标领域对象
   * @throws {TenantAccessDeniedError} 租户不匹配时抛出
   */
  public assertSameTenant(other: DataIsolationAwareEntity): void {
    if (!this._tenantId.equals(other.tenantId)) {
      throw new TenantAccessDeniedError(
        `操作禁止: 实体属于租户${this._tenantId.toString()}，目标属于${other.tenantId.toString()}`,
      );
    }
  }

  /**
   * @method assertSameOrganization
   * @description 断言目标对象属于同一组织
   * @param other 目标领域对象
   * @throws {TenantAccessDeniedError} 组织不匹配时抛出
   */
  public assertSameOrganization(other: DataIsolationAwareEntity): void {
    this.assertSameTenant(other);

    if (this._organizationId && other.organizationId) {
      if (!this._organizationId.equals(other.organizationId)) {
        throw new TenantAccessDeniedError(
          `操作禁止: 实体属于组织${this._organizationId.toString()}，目标属于${other.organizationId.toString()}`,
        );
      }
    }
  }

  /**
   * @method assertSameDepartment
   * @description 断言目标对象属于同一部门
   * @param other 目标领域对象
   * @throws {TenantAccessDeniedError} 部门不匹配时抛出
   */
  public assertSameDepartment(other: DataIsolationAwareEntity): void {
    this.assertSameOrganization(other);

    // 如果两个实体都没有部门归属，则允许访问
    if (this._departmentIds.length === 0 && other.departmentIds.length === 0) {
      return; // 允许访问
    }

    // 如果其中一个有部门归属，另一个没有，则拒绝访问
    if (this._departmentIds.length === 0 || other.departmentIds.length === 0) {
      throw new TenantAccessDeniedError(
        `操作禁止: 一个实体有部门归属，另一个没有部门归属`,
      );
    }

    // 检查是否有共同部门
    const commonDepartments = this._departmentIds.filter(deptId =>
      other.departmentIds.some((otherDeptId: Uuid) =>
        deptId.equals(otherDeptId),
      ),
    );

    if (commonDepartments.length === 0) {
      throw new TenantAccessDeniedError(
        `操作禁止: 实体与目标对象没有共同的部门归属`,
      );
    }
  }

  /**
   * @method canAccess
   * @description 检查当前实体是否有权限访问目标对象
   * @param target 目标领域对象
   * @returns 是否允许访问
   */
  public canAccess(target: DataIsolationAwareEntity): boolean {
    try {
      // 平台级数据访问控制
      if (target._dataIsolationLevel === DataIsolationLevel.PLATFORM) {
        return this.canAccessPlatformData(target);
      }

      // 首先检查租户是否匹配
      if (!this._tenantId.equals(target.tenantId)) {
        return false;
      }

      // 如果目标对象是租户级公共数据，则允许访问
      if (target._dataIsolationLevel === DataIsolationLevel.TENANT) {
        return true;
      }

      // 如果目标对象是组织级公共数据，则允许同组织访问
      if (
        target._dataIsolationLevel === DataIsolationLevel.ORGANIZATION &&
        target.isOrganizationLevelEntity()
      ) {
        this.assertSameOrganization(target);
        return true;
      }

      // 用户级数据访问控制
      if (target._dataIsolationLevel === DataIsolationLevel.USER) {
        return this.canAccessUserData(target);
      }

      // 根据当前实体的隔离级别进行访问控制
      switch (this._dataIsolationLevel) {
        case DataIsolationLevel.TENANT:
          return true; // 租户级实体可以访问所有同租户数据
        case DataIsolationLevel.ORGANIZATION:
          this.assertSameOrganization(target);
          return true;
        case DataIsolationLevel.DEPARTMENT:
          this.assertSameDepartment(target);
          return true;
        case DataIsolationLevel.SUB_DEPARTMENT:
          this.assertSameDepartment(target);
          return true;
        case DataIsolationLevel.USER:
          return this.canAccessUserData(target);
        default:
          return false;
      }
    } catch {
      return false;
    }
  }

  /**
   * @method canAccessByLevel
   * @description 根据指定隔离级别检查访问权限
   * @param target 目标领域对象
   * @param level 隔离级别
   * @returns 是否允许访问
   */
  public canAccessByLevel(
    target: DataIsolationAwareEntity,
    level: DataIsolationLevel,
  ): boolean {
    try {
      // 首先检查租户是否匹配
      if (!this._tenantId.equals(target.tenantId)) {
        return false;
      }

      // 如果目标对象是租户级公共数据，则允许访问
      if (target._dataIsolationLevel === DataIsolationLevel.TENANT) {
        return true;
      }

      switch (level) {
        case DataIsolationLevel.TENANT:
          return true; // 租户级访问允许访问所有同租户数据
        case DataIsolationLevel.ORGANIZATION:
          this.assertSameOrganization(target);
          return true;
        case DataIsolationLevel.DEPARTMENT:
          this.assertSameDepartment(target);
          return true;
        case DataIsolationLevel.SUB_DEPARTMENT:
          this.assertSameDepartment(target);
          return true;
        default:
          return false;
      }
    } catch {
      return false;
    }
  }

  /**
   * @method getTenantContext
   * @description 获取租户上下文信息
   * @returns 租户上下文
   */
  public getTenantContext(): TenantContext {
    return {
      tenantId: this._tenantId.toString(),
      organizationId: this._organizationId?.toString(),
      departmentIds: this._departmentIds.map(id => id.toString()),
      isolationLevel: this._dataIsolationLevel,
    };
  }

  /**
   * @method setOrganizationId
   * @description 设置组织ID
   * @param organizationId 组织ID
   */
  protected setOrganizationId(organizationId: Uuid): void {
    this._organizationId = organizationId;
    this.updateTimestamp();
  }

  /**
   * @method addDepartmentId
   * @description 添加部门ID
   * @param departmentId 部门ID
   */
  protected addDepartmentId(departmentId: Uuid): void {
    if (!this._departmentIds.some(id => id.equals(departmentId))) {
      this._departmentIds.push(departmentId);
      this.updateTimestamp();
    }
  }

  /**
   * @method removeDepartmentId
   * @description 移除部门ID
   * @param departmentId 部门ID
   */
  protected removeDepartmentId(departmentId: Uuid): void {
    this._departmentIds = this._departmentIds.filter(
      id => !id.equals(departmentId),
    );
    this.updateTimestamp();
  }

  /**
   * @method setDataIsolationLevel
   * @description 设置数据隔离级别
   * @param level 数据隔离级别
   */
  protected setDataIsolationLevel(level: DataIsolationLevel): void {
    this._dataIsolationLevel = level;
    this.updateTimestamp();
  }

  /**
   * @method isInSameTenant
   * @description 检查是否在同一租户
   * @param other 目标实体
   * @returns 是否在同一租户
   */
  public isInSameTenant(other: DataIsolationAwareEntity): boolean {
    return this._tenantId.equals(other.tenantId);
  }

  /**
   * @method isInSameOrganization
   * @description 检查是否在同一组织
   * @param other 目标实体
   * @returns 是否在同一组织
   */
  public isInSameOrganization(other: DataIsolationAwareEntity): boolean {
    if (!this.isInSameTenant(other)) return false;
    if (!this._organizationId || !other.organizationId) return false;
    return this._organizationId.equals(other.organizationId);
  }

  /**
   * @method isInSameDepartment
   * @description 检查是否在同一部门
   * @param other 目标实体
   * @returns 是否在同一部门
   */
  public isInSameDepartment(other: DataIsolationAwareEntity): boolean {
    if (!this.isInSameOrganization(other)) return false;

    return this._departmentIds.some(deptId =>
      other.departmentIds.some((otherDeptId: Uuid) =>
        deptId.equals(otherDeptId),
      ),
    );
  }

  /**
   * @method isTenantPublicData
   * @description 判断是否为租户级公共数据
   * @returns {boolean} 是否为租户级公共数据
   */
  public isTenantPublicData(): boolean {
    return this._dataIsolationLevel === DataIsolationLevel.TENANT;
  }

  /**
   * @method isTenantLevelEntity
   * @description 判断是否为租户级实体（没有组织和部门归属）
   * @returns {boolean} 是否为租户级实体
   */
  public isTenantLevelEntity(): boolean {
    return !this._organizationId && this._departmentIds.length === 0;
  }

  /**
   * @method isOrganizationLevelEntity
   * @description 判断是否为组织级实体（有组织归属，但没有部门归属）
   * @returns {boolean} 是否为组织级实体
   */
  public isOrganizationLevelEntity(): boolean {
    return !!this._organizationId && this._departmentIds.length === 0;
  }

  /**
   * @method isDepartmentLevelEntity
   * @description 判断是否为部门级实体（有部门归属）
   * @returns {boolean} 是否为部门级实体
   */
  public isDepartmentLevelEntity(): boolean {
    return this._departmentIds.length > 0;
  }

  /**
   * @method canAccessTenantPublicData
   * @description 检查是否可以访问租户级公共数据
   * @param target 目标实体
   * @returns {boolean} 是否可以访问
   */
  public canAccessTenantPublicData(target: DataIsolationAwareEntity): boolean {
    return this._tenantId.equals(target.tenantId);
  }

  /**
   * @method isOrganizationPublicData
   * @description 判断是否为组织级公共数据
   * @returns {boolean} 是否为组织级公共数据
   */
  public isOrganizationPublicData(): boolean {
    return (
      this._dataIsolationLevel === DataIsolationLevel.ORGANIZATION &&
      this.isOrganizationLevelEntity()
    );
  }

  /**
   * @method canAccessOrganizationPublicData
   * @description 检查是否可以访问组织级公共数据
   * @param target 目标实体
   * @returns {boolean} 是否可以访问
   */
  public canAccessOrganizationPublicData(
    target: DataIsolationAwareEntity,
  ): boolean {
    return (
      this._tenantId.equals(target.tenantId) &&
      this.isInSameOrganization(target)
    );
  }

  /**
   * @method canAccessPlatformData
   * @description 检查是否可以访问平台级数据
   * @param target 目标实体
   * @returns {boolean} 是否可以访问
   */
  private canAccessPlatformData(target: DataIsolationAwareEntity): boolean {
    // 平台级数据访问逻辑
    if (target._dataPrivacyLevel === DataPrivacyLevel.SHARED) {
      return true; // 可共享的平台数据，所有用户都可访问
    }
    // 受保护的平台数据，需要平台管理员权限
    return this.isPlatformAdmin();
  }

  /**
   * @method canAccessUserData
   * @description 检查是否可以访问用户级数据
   * @param target 目标实体
   * @returns {boolean} 是否可以访问
   */
  private canAccessUserData(target: DataIsolationAwareEntity): boolean {
    // 用户级数据访问逻辑
    if (target._dataPrivacyLevel === DataPrivacyLevel.SHARED) {
      // 可共享的用户数据，同组织内可访问
      return this.isInSameOrganization(target);
    }
    // 受保护的用户数据，只能用户本人访问
    if (!this._userId || !target._userId) {
      return false;
    }
    return this._userId.equals(target._userId);
  }

  /**
   * @method isPlatformAdmin
   * @description 检查当前实体是否具有平台管理员权限
   * @returns {boolean} 是否具有平台管理员权限
   */
  public isPlatformAdmin(): boolean {
    // 这里需要根据具体的业务逻辑来判断
    // 可以通过用户角色、权限等方式来判断
    // 暂时返回false，需要在实际使用时重写此方法
    return false;
  }

  /**
   * @method setUserId
   * @description 设置用户ID
   * @param userId 用户ID
   */
  protected setUserId(userId: Uuid): void {
    this._userId = userId;
    this.updateTimestamp();
  }

  /**
   * @method setDataPrivacyLevel
   * @description 设置数据隐私级别
   * @param level 数据隐私级别
   */
  protected setDataPrivacyLevel(level: DataPrivacyLevel): void {
    this._dataPrivacyLevel = level;
    this.updateTimestamp();
  }

  /**
   * @method isSharedData
   * @description 判断是否为可共享数据
   * @returns {boolean} 是否为可共享数据
   */
  public isSharedData(): boolean {
    return this._dataPrivacyLevel === DataPrivacyLevel.SHARED;
  }

  /**
   * @method isProtectedData
   * @description 判断是否为受保护数据
   * @returns {boolean} 是否为受保护数据
   */
  public isProtectedData(): boolean {
    return this._dataPrivacyLevel === DataPrivacyLevel.PROTECTED;
  }

  /**
   * @method isUserLevelEntity
   * @description 判断是否为用户级实体
   * @returns {boolean} 是否为用户级实体
   */
  public isUserLevelEntity(): boolean {
    return this._dataIsolationLevel === DataIsolationLevel.USER;
  }

  /**
   * @method isPlatformLevelEntity
   * @description 判断是否为平台级实体
   * @returns {boolean} 是否为平台级实体
   */
  public isPlatformLevelEntity(): boolean {
    return this._dataIsolationLevel === DataIsolationLevel.PLATFORM;
  }
}
