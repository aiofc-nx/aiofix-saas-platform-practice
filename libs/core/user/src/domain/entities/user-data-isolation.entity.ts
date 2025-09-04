/**
 * @file user-data-isolation.entity.ts
 * @description 用户数据隔离实体基类
 *
 * 该文件定义了用户数据隔离实体基类，专门为UserEntity提供类型安全的数据隔离支持。
 * 继承自DataIsolationAwareEntity，但使用TenantId类型来提供更好的类型安全性。
 *
 * 主要功能：
 * 1. 类型安全的租户ID、组织ID、部门ID管理
 * 2. 与UserEntity的完美类型匹配
 * 3. 保持与基类的兼容性
 */

import {
  DataIsolationAwareEntity,
  DataIsolationLevel,
  DataPrivacyLevel,
} from '@aiofix/shared';
import { TenantId } from '@aiofix/shared';

/**
 * 用户数据隔离实体基类
 * @description 专门为UserEntity提供类型安全的数据隔离支持
 */
export abstract class UserDataIsolationEntity extends DataIsolationAwareEntity {
  protected readonly _tenantId: TenantId;
  protected _organizationId?: TenantId;
  protected _departmentIds: TenantId[] = [];

  /**
   * 构造函数
   * @param tenantId 租户ID
   * @param dataIsolationLevel 数据隔离级别
   * @param dataPrivacyLevel 数据隐私级别
   * @param id 实体唯一标识符
   * @param organizationId 组织ID（可选）
   * @param departmentIds 部门ID列表（可选）
   * @param userId 用户ID（可选）
   */
  constructor(
    tenantId: TenantId,
    dataIsolationLevel: DataIsolationLevel = DataIsolationLevel.TENANT,
    dataPrivacyLevel: DataPrivacyLevel = DataPrivacyLevel.PROTECTED,
    id?: string,
    organizationId?: TenantId,
    departmentIds: TenantId[] = [],
    userId?: string,
  ) {
    // 将TenantId转换为Uuid传递给基类
    super(
      tenantId.toUuid(),
      dataIsolationLevel,
      dataPrivacyLevel,
      id ? ({ value: id } as any) : undefined,
      organizationId?.toUuid(),
      departmentIds.map(deptId => deptId.toUuid()),
      userId ? ({ value: userId } as any) : undefined,
    );

    // 在子类中保持TenantId类型
    this._tenantId = tenantId;
    this._organizationId = organizationId;
    this._departmentIds = [...departmentIds];
  }

  /**
   * 获取租户ID
   * @returns {TenantId} 租户ID
   */
  get tenantId(): TenantId {
    return this._tenantId;
  }

  /**
   * 获取组织ID
   * @returns {TenantId | undefined} 组织ID
   */
  get organizationId(): TenantId | undefined {
    return this._organizationId;
  }

  /**
   * 获取部门ID列表
   * @returns {TenantId[]} 部门ID列表
   */
  get departmentIds(): TenantId[] {
    return [...this._departmentIds];
  }

  /**
   * 设置组织ID
   * @param organizationId 组织ID
   */
  protected setOrganizationId(organizationId: TenantId): void {
    this._organizationId = organizationId;
    // 调用基类方法保持兼容性
    super['setOrganizationId'](organizationId.toUuid());
  }

  /**
   * 添加部门ID
   * @param departmentId 部门ID
   */
  protected addDepartmentId(departmentId: TenantId): void {
    if (!this._departmentIds.some(id => id.equals(departmentId))) {
      this._departmentIds.push(departmentId);
      // 调用基类方法保持兼容性
      super['addDepartmentId'](departmentId.toUuid());
    }
  }

  /**
   * 移除部门ID
   * @param departmentId 部门ID
   */
  protected removeDepartmentId(departmentId: TenantId): void {
    this._departmentIds = this._departmentIds.filter(
      id => !id.equals(departmentId),
    );
    // 调用基类方法保持兼容性
    super['removeDepartmentId'](departmentId.toUuid());
  }
}
