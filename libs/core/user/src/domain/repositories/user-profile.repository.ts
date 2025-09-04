/**
 * @interface UserProfileRepository
 * @description
 * 用户档案仓储接口，定义用户档案实体的数据访问契约。
 *
 * 原理与机制：
 * 1. 作为仓储接口，UserProfileRepository定义了用户档案实体的CRUD操作
 * 2. 支持多租户数据隔离和查询
 * 3. 提供基于不同条件的查询方法
 * 4. 支持档案偏好设置和隐私管理
 *
 * 功能与职责：
 * 1. 用户档案实体的增删改查操作
 * 2. 支持多租户数据隔离
 * 3. 提供档案偏好设置管理
 * 4. 支持档案隐私级别控制
 *
 * @example
 * ```typescript
 * class PostgresUserProfileRepository implements UserProfileRepository {
 *   async findByUserId(userId: UserId): Promise<UserProfileEntity | null> {
 *     // 实现查找逻辑
 *   }
 * }
 * ```
 * @since 1.0.0
 */

import { UserProfileEntity } from '../entities/user-profile.entity';
import { UserId, TenantId } from '@aiofix/shared';
import { DataPrivacyLevel } from '@aiofix/shared';

/**
 * 用户档案查询条件接口
 */
export interface UserProfileQueryCriteria {
  userId?: UserId;
  tenantId?: TenantId;
  organizationId?: string;
  departmentIds?: string[];
  dataPrivacyLevel?: DataPrivacyLevel;
  hasAvatar?: boolean;
  hasBio?: boolean;
  createdAfter?: Date;
  createdBefore?: Date;
  limit?: number;
  offset?: number;
}

/**
 * 用户档案仓储接口
 * @description 定义用户档案实体的数据访问契约
 */
export interface UserProfileRepository {
  /**
   * 根据ID查找用户档案
   * @description 通过档案ID查找用户档案实体
   * @param {string} id 档案ID
   * @returns {Promise<UserProfileEntity | null>} 用户档案实体或null
   */
  findById(id: string): Promise<UserProfileEntity | null>;

  /**
   * 根据用户ID查找用户档案
   * @description 通过用户ID查找用户档案实体
   * @param {UserId} userId 用户ID
   * @returns {Promise<UserProfileEntity | null>} 用户档案实体或null
   */
  findByUserId(userId: UserId): Promise<UserProfileEntity | null>;

  /**
   * 根据条件查询用户档案列表
   * @description 根据查询条件查找用户档案列表
   * @param {UserProfileQueryCriteria} criteria 查询条件
   * @returns {Promise<UserProfileEntity[]>} 用户档案实体列表
   */
  findByCriteria(
    criteria: UserProfileQueryCriteria,
  ): Promise<UserProfileEntity[]>;

  /**
   * 根据租户ID查找用户档案列表
   * @description 查找指定租户下的所有用户档案
   * @param {TenantId} tenantId 租户ID
   * @param {number} [limit] 限制数量
   * @param {number} [offset] 偏移量
   * @returns {Promise<UserProfileEntity[]>} 用户档案实体列表
   */
  findByTenantId(
    tenantId: TenantId,
    limit?: number,
    offset?: number,
  ): Promise<UserProfileEntity[]>;

  /**
   * 根据组织ID查找用户档案列表
   * @description 查找指定组织下的所有用户档案
   * @param {string} organizationId 组织ID
   * @param {TenantId} tenantId 租户ID
   * @param {number} [limit] 限制数量
   * @param {number} [offset] 偏移量
   * @returns {Promise<UserProfileEntity[]>} 用户档案实体列表
   */
  findByOrganizationId(
    organizationId: string,
    tenantId: TenantId,
    limit?: number,
    offset?: number,
  ): Promise<UserProfileEntity[]>;

  /**
   * 根据部门ID查找用户档案列表
   * @description 查找指定部门下的所有用户档案
   * @param {string} departmentId 部门ID
   * @param {TenantId} tenantId 租户ID
   * @param {number} [limit] 限制数量
   * @param {number} [offset] 偏移量
   * @returns {Promise<UserProfileEntity[]>} 用户档案实体列表
   */
  findByDepartmentId(
    departmentId: string,
    tenantId: TenantId,
    limit?: number,
    offset?: number,
  ): Promise<UserProfileEntity[]>;

  /**
   * 保存用户档案
   * @description 保存或更新用户档案实体
   * @param {UserProfileEntity} profile 用户档案实体
   * @returns {Promise<UserProfileEntity>} 保存后的用户档案实体
   */
  save(profile: UserProfileEntity): Promise<UserProfileEntity>;

  /**
   * 批量保存用户档案
   * @description 批量保存或更新用户档案实体
   * @param {UserProfileEntity[]} profiles 用户档案实体列表
   * @returns {Promise<UserProfileEntity[]>} 保存后的用户档案实体列表
   */
  saveMany(profiles: UserProfileEntity[]): Promise<UserProfileEntity[]>;

  /**
   * 删除用户档案
   * @description 删除用户档案实体
   * @param {string} id 档案ID
   * @returns {Promise<boolean>} 是否删除成功
   */
  delete(id: string): Promise<boolean>;

  /**
   * 根据用户ID删除用户档案
   * @description 根据用户ID删除用户档案实体
   * @param {UserId} userId 用户ID
   * @returns {Promise<boolean>} 是否删除成功
   */
  deleteByUserId(userId: UserId): Promise<boolean>;

  /**
   * 更新档案偏好设置
   * @description 更新用户的偏好设置
   * @param {string} id 档案ID
   * @param {string} key 偏好键
   * @param {unknown} value 偏好值
   * @returns {Promise<boolean>} 是否更新成功
   */
  updatePreference(id: string, key: string, value: unknown): Promise<boolean>;

  /**
   * 批量更新档案偏好设置
   * @description 批量更新用户的偏好设置
   * @param {string} id 档案ID
   * @param {Record<string, unknown>} preferences 偏好设置
   * @returns {Promise<boolean>} 是否更新成功
   */
  updatePreferences(
    id: string,
    preferences: Record<string, unknown>,
  ): Promise<boolean>;

  /**
   * 统计用户档案数量
   * @description 根据条件统计用户档案数量
   * @param {UserProfileQueryCriteria} criteria 查询条件
   * @returns {Promise<number>} 用户档案数量
   */
  countByCriteria(criteria: UserProfileQueryCriteria): Promise<number>;

  /**
   * 根据租户统计用户档案数量
   * @description 统计指定租户下的用户档案数量
   * @param {TenantId} tenantId 租户ID
   * @returns {Promise<number>} 用户档案数量
   */
  countByTenantId(tenantId: TenantId): Promise<number>;
}
