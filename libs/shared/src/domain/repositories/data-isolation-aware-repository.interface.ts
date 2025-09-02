/**
 * @file data-isolation-aware-repository.interface.ts
 * @description 数据隔离感知仓储接口
 *
 * 该文件定义了支持数据隔离的仓储接口，扩展基础仓储接口以支持多层级数据隔离查询。
 * 所有需要数据隔离的实体仓储都应该继承自这个接口。
 *
 * 主要功能：
 * 1. 支持多层级数据隔离查询
 * 2. 支持隐私级别过滤
 * 3. 支持跨层级数据访问控制
 * 4. 提供数据隔离相关的查询方法
 *
 * 业务规则：
 * 1. 所有查询必须支持数据隔离
 * 2. 查询结果必须符合访问权限
 * 3. 支持隐私级别过滤
 * 4. 支持跨层级数据访问
 */

import { Uuid } from '../value-objects/uuid.vo';
import { BaseRepository, QueryOptions, QueryResult } from './base-repository.interface';
import { DataIsolationAwareEntity, DataIsolationLevel, DataPrivacyLevel } from '../entities/data-isolation-aware.entity';

/**
 * @interface DataIsolationQueryOptions
 * @description 数据隔离查询选项接口
 */
export interface DataIsolationQueryOptions extends QueryOptions {
  dataIsolationLevel?: DataIsolationLevel; // 数据隔离级别
  dataPrivacyLevel?: DataPrivacyLevel; // 数据隐私级别
  organizationId?: string; // 组织ID
  departmentIds?: string[]; // 部门ID列表
  userId?: string; // 用户ID
  includePublicData?: boolean; // 是否包含公共数据
  includeProtectedData?: boolean; // 是否包含受保护数据
}

/**
 * @interface DataIsolationFilterCriteria
 * @description 数据隔离过滤条件接口
 */
export interface DataIsolationFilterCriteria {
  tenantId?: string; // 租户ID
  organizationId?: string; // 组织ID
  departmentIds?: string[]; // 部门ID列表
  userId?: string; // 用户ID
  dataIsolationLevel?: DataIsolationLevel; // 数据隔离级别
  dataPrivacyLevel?: DataPrivacyLevel; // 数据隐私级别
}

/**
 * @interface DataIsolationAwareRepository<T>
 * @description 数据隔离感知仓储接口
 */
export interface DataIsolationAwareRepository<T extends DataIsolationAwareEntity> extends BaseRepository<T> {
  /**
   * @method findByTenant
   * @description 根据租户查找实体
   * @param tenantId 租户ID
   * @param options 查询选项
   * @returns 查询结果
   */
  findByTenant(tenantId: Uuid, options?: DataIsolationQueryOptions): Promise<QueryResult<T>>;

  /**
   * @method findByOrganization
   * @description 根据组织查找实体
   * @param organizationId 组织ID
   * @param tenantId 租户ID
   * @param options 查询选项
   * @returns 查询结果
   */
  findByOrganization(
    organizationId: Uuid,
    tenantId: Uuid,
    options?: DataIsolationQueryOptions,
  ): Promise<QueryResult<T>>;

  /**
   * @method findByDepartment
   * @description 根据部门查找实体
   * @param departmentId 部门ID
   * @param tenantId 租户ID
   * @param options 查询选项
   * @returns 查询结果
   */
  findByDepartment(
    departmentId: Uuid,
    tenantId: Uuid,
    options?: DataIsolationQueryOptions,
  ): Promise<QueryResult<T>>;

  /**
   * @method findByUser
   * @description 根据用户查找实体
   * @param userId 用户ID
   * @param tenantId 租户ID
   * @param options 查询选项
   * @returns 查询结果
   */
  findByUser(
    userId: Uuid,
    tenantId: Uuid,
    options?: DataIsolationQueryOptions,
  ): Promise<QueryResult<T>>;

  /**
   * @method findByDataIsolationLevel
   * @description 根据数据隔离级别查找实体
   * @param level 数据隔离级别
   * @param tenantId 租户ID
   * @param options 查询选项
   * @returns 查询结果
   */
  findByDataIsolationLevel(
    level: DataIsolationLevel,
    tenantId: Uuid,
    options?: DataIsolationQueryOptions,
  ): Promise<QueryResult<T>>;

  /**
   * @method findByDataPrivacyLevel
   * @description 根据数据隐私级别查找实体
   * @param level 数据隐私级别
   * @param tenantId 租户ID
   * @param options 查询选项
   * @returns 查询结果
   */
  findByDataPrivacyLevel(
    level: DataPrivacyLevel,
    tenantId: Uuid,
    options?: DataIsolationQueryOptions,
  ): Promise<QueryResult<T>>;

  /**
   * @method findPublicData
   * @description 查找公共数据
   * @param tenantId 租户ID
   * @param options 查询选项
   * @returns 查询结果
   */
  findPublicData(tenantId: Uuid, options?: DataIsolationQueryOptions): Promise<QueryResult<T>>;

  /**
   * @method findProtectedData
   * @description 查找受保护数据
   * @param tenantId 租户ID
   * @param options 查询选项
   * @returns 查询结果
   */
  findProtectedData(tenantId: Uuid, options?: DataIsolationQueryOptions): Promise<QueryResult<T>>;

  /**
   * @method findByIdAndTenant
   * @description 根据ID和租户查找实体
   * @param id 实体ID
   * @param tenantId 租户ID
   * @returns 实体实例或null
   */
  findByIdAndTenant(id: Uuid, tenantId: Uuid): Promise<T | null>;

  /**
   * @method findByIdAndOrganization
   * @description 根据ID和组织查找实体
   * @param id 实体ID
   * @param organizationId 组织ID
   * @param tenantId 租户ID
   * @returns 实体实例或null
   */
  findByIdAndOrganization(id: Uuid, organizationId: Uuid, tenantId: Uuid): Promise<T | null>;

  /**
   * @method findByIdAndDepartment
   * @description 根据ID和部门查找实体
   * @param id 实体ID
   * @param departmentId 部门ID
   * @param tenantId 租户ID
   * @returns 实体实例或null
   */
  findByIdAndDepartment(id: Uuid, departmentId: Uuid, tenantId: Uuid): Promise<T | null>;

  /**
   * @method findByIdAndUser
   * @description 根据ID和用户查找实体
   * @param id 实体ID
   * @param userId 用户ID
   * @param tenantId 租户ID
   * @returns 实体实例或null
   */
  findByIdAndUser(id: Uuid, userId: Uuid, tenantId: Uuid): Promise<T | null>;

  /**
   * @method countByTenant
   * @description 统计租户下的实体数量
   * @param tenantId 租户ID
   * @param criteria 过滤条件
   * @returns 实体数量
   */
  countByTenant(tenantId: Uuid, criteria?: DataIsolationFilterCriteria): Promise<number>;

  /**
   * @method countByOrganization
   * @description 统计组织下的实体数量
   * @param organizationId 组织ID
   * @param tenantId 租户ID
   * @param criteria 过滤条件
   * @returns 实体数量
   */
  countByOrganization(
    organizationId: Uuid,
    tenantId: Uuid,
    criteria?: DataIsolationFilterCriteria,
  ): Promise<number>;

  /**
   * @method countByDepartment
   * @description 统计部门下的实体数量
   * @param departmentId 部门ID
   * @param tenantId 租户ID
   * @param criteria 过滤条件
   * @returns 实体数量
   */
  countByDepartment(
    departmentId: Uuid,
    tenantId: Uuid,
    criteria?: DataIsolationFilterCriteria,
  ): Promise<number>;

  /**
   * @method countByUser
   * @description 统计用户下的实体数量
   * @param userId 用户ID
   * @param tenantId 租户ID
   * @param criteria 过滤条件
   * @returns 实体数量
   */
  countByUser(
    userId: Uuid,
    tenantId: Uuid,
    criteria?: DataIsolationFilterCriteria,
  ): Promise<number>;

  /**
   * @method existsByTenant
   * @description 检查租户下是否存在实体
   * @param id 实体ID
   * @param tenantId 租户ID
   * @returns 是否存在
   */
  existsByTenant(id: Uuid, tenantId: Uuid): Promise<boolean>;

  /**
   * @method existsByOrganization
   * @description 检查组织下是否存在实体
   * @param id 实体ID
   * @param organizationId 组织ID
   * @param tenantId 租户ID
   * @returns 是否存在
   */
  existsByOrganization(id: Uuid, organizationId: Uuid, tenantId: Uuid): Promise<boolean>;

  /**
   * @method existsByDepartment
   * @description 检查部门下是否存在实体
   * @param id 实体ID
   * @param departmentId 部门ID
   * @param tenantId 租户ID
   * @returns 是否存在
   */
  existsByDepartment(id: Uuid, departmentId: Uuid, tenantId: Uuid): Promise<boolean>;

  /**
   * @method existsByUser
   * @description 检查用户下是否存在实体
   * @param id 实体ID
   * @param userId 用户ID
   * @param tenantId 租户ID
   * @returns 是否存在
   */
  existsByUser(id: Uuid, userId: Uuid, tenantId: Uuid): Promise<boolean>;

  /**
   * @method deleteByTenant
   * @description 删除租户下的实体
   * @param id 实体ID
   * @param tenantId 租户ID
   * @param hardDelete 是否硬删除
   * @returns 是否删除成功
   */
  deleteByTenant(id: Uuid, tenantId: Uuid, hardDelete?: boolean): Promise<boolean>;

  /**
   * @method deleteByOrganization
   * @description 删除组织下的实体
   * @param id 实体ID
   * @param organizationId 组织ID
   * @param tenantId 租户ID
   * @param hardDelete 是否硬删除
   * @returns 是否删除成功
   */
  deleteByOrganization(
    id: Uuid,
    organizationId: Uuid,
    tenantId: Uuid,
    hardDelete?: boolean,
  ): Promise<boolean>;

  /**
   * @method deleteByDepartment
   * @description 删除部门下的实体
   * @param id 实体ID
   * @param departmentId 部门ID
   * @param tenantId 租户ID
   * @param hardDelete 是否硬删除
   * @returns 是否删除成功
   */
  deleteByDepartment(
    id: Uuid,
    departmentId: Uuid,
    tenantId: Uuid,
    hardDelete?: boolean,
  ): Promise<boolean>;

  /**
   * @method deleteByUser
   * @description 删除用户下的实体
   * @param id 实体ID
   * @param userId 用户ID
   * @param tenantId 租户ID
   * @param hardDelete 是否硬删除
   * @returns 是否删除成功
   */
  deleteByUser(
    id: Uuid,
    userId: Uuid,
    tenantId: Uuid,
    hardDelete?: boolean,
  ): Promise<boolean>;
}
