/**
 * @interface UserRepository
 * @description
 * 用户仓储接口，定义用户实体的数据访问契约。
 *
 * 原理与机制：
 * 1. 作为仓储接口，UserRepository定义了用户实体的CRUD操作
 * 2. 支持多租户数据隔离和查询
 * 3. 提供基于不同条件的查询方法
 * 4. 支持用户状态管理和批量操作
 *
 * 功能与职责：
 * 1. 用户实体的增删改查操作
 * 2. 支持多租户数据隔离
 * 3. 提供复杂的查询和过滤功能
 * 4. 支持用户状态变更和批量操作
 *
 * @example
 * ```typescript
 * class PostgresUserRepository implements UserRepository {
 *   async findById(id: UserId): Promise<UserEntity | null> {
 *     // 实现查找逻辑
 *   }
 * }
 * ```
 * @since 1.0.0
 */

import { UserEntity } from '../entities/user.entity';
import { UserId, Username, Email, TenantId } from '@aiofix/shared';
import { UserType } from '../enums/user-type.enum';
import { UserStatus } from '../enums/user-status.enum';

/**
 * 用户查询条件接口
 */
export interface UserQueryCriteria {
  tenantId?: TenantId;
  organizationId?: string;
  departmentIds?: string[];
  userType?: UserType;
  status?: UserStatus;
  email?: Email;
  username?: Username;
  isActive?: boolean;
  createdAfter?: Date;
  createdBefore?: Date;
  limit?: number;
  offset?: number;
}

/**
 * 用户仓储接口
 * @description 定义用户实体的数据访问契约
 */
export interface UserRepository {
  /**
   * 根据ID查找用户
   * @description 通过用户ID查找用户实体
   * @param {UserId} id 用户ID
   * @returns {Promise<UserEntity | null>} 用户实体或null
   */
  findById(id: UserId): Promise<UserEntity | null>;

  /**
   * 根据用户名查找用户
   * @description 通过用户名查找用户实体
   * @param {Username} username 用户名
   * @param {TenantId} tenantId 租户ID
   * @returns {Promise<UserEntity | null>} 用户实体或null
   */
  findByUsername(
    username: Username,
    tenantId: TenantId,
  ): Promise<UserEntity | null>;

  /**
   * 根据邮箱查找用户
   * @description 通过邮箱查找用户实体
   * @param {Email} email 邮箱
   * @param {TenantId} tenantId 租户ID
   * @returns {Promise<UserEntity | null>} 用户实体或null
   */
  findByEmail(email: Email, tenantId: TenantId): Promise<UserEntity | null>;

  /**
   * 根据条件查询用户列表
   * @description 根据查询条件查找用户列表
   * @param {UserQueryCriteria} criteria 查询条件
   * @returns {Promise<UserEntity[]>} 用户实体列表
   */
  findByCriteria(criteria: UserQueryCriteria): Promise<UserEntity[]>;

  /**
   * 根据租户ID查找用户列表
   * @description 查找指定租户下的所有用户
   * @param {TenantId} tenantId 租户ID
   * @param {number} [limit] 限制数量
   * @param {number} [offset] 偏移量
   * @returns {Promise<UserEntity[]>} 用户实体列表
   */
  findByTenantId(
    tenantId: TenantId,
    limit?: number,
    offset?: number,
  ): Promise<UserEntity[]>;

  /**
   * 根据组织ID查找用户列表
   * @description 查找指定组织下的所有用户
   * @param {string} organizationId 组织ID
   * @param {TenantId} tenantId 租户ID
   * @param {number} [limit] 限制数量
   * @param {number} [offset] 偏移量
   * @returns {Promise<UserEntity[]>} 用户实体列表
   */
  findByOrganizationId(
    organizationId: string,
    tenantId: TenantId,
    limit?: number,
    offset?: number,
  ): Promise<UserEntity[]>;

  /**
   * 根据部门ID查找用户列表
   * @description 查找指定部门下的所有用户
   * @param {string} departmentId 部门ID
   * @param {TenantId} tenantId 租户ID
   * @param {number} [limit] 限制数量
   * @param {number} [offset] 偏移量
   * @returns {Promise<UserEntity[]>} 用户实体列表
   */
  findByDepartmentId(
    departmentId: string,
    tenantId: TenantId,
    limit?: number,
    offset?: number,
  ): Promise<UserEntity[]>;

  /**
   * 保存用户
   * @description 保存或更新用户实体
   * @param {UserEntity} user 用户实体
   * @returns {Promise<UserEntity>} 保存后的用户实体
   */
  save(user: UserEntity): Promise<UserEntity>;

  /**
   * 批量保存用户
   * @description 批量保存或更新用户实体
   * @param {UserEntity[]} users 用户实体列表
   * @returns {Promise<UserEntity[]>} 保存后的用户实体列表
   */
  saveMany(users: UserEntity[]): Promise<UserEntity[]>;

  /**
   * 删除用户
   * @description 删除用户实体
   * @param {UserId} id 用户ID
   * @returns {Promise<boolean>} 是否删除成功
   */
  delete(id: UserId): Promise<boolean>;

  /**
   * 检查用户名是否存在
   * @description 检查指定租户下用户名是否已存在
   * @param {Username} username 用户名
   * @param {TenantId} tenantId 租户ID
   * @param {UserId} [excludeUserId] 排除的用户ID
   * @returns {Promise<boolean>} 是否存在
   */
  existsByUsername(
    username: Username,
    tenantId: TenantId,
    excludeUserId?: UserId,
  ): Promise<boolean>;

  /**
   * 检查邮箱是否存在
   * @description 检查指定租户下邮箱是否已存在
   * @param {Email} email 邮箱
   * @param {TenantId} tenantId 租户ID
   * @param {UserId} [excludeUserId] 排除的用户ID
   * @returns {Promise<boolean>} 是否存在
   */
  existsByEmail(
    email: Email,
    tenantId: TenantId,
    excludeUserId?: UserId,
  ): Promise<boolean>;

  /**
   * 统计用户数量
   * @description 根据条件统计用户数量
   * @param {UserQueryCriteria} criteria 查询条件
   * @returns {Promise<number>} 用户数量
   */
  countByCriteria(criteria: UserQueryCriteria): Promise<number>;

  /**
   * 根据租户统计用户数量
   * @description 统计指定租户下的用户数量
   * @param {TenantId} tenantId 租户ID
   * @returns {Promise<number>} 用户数量
   */
  countByTenantId(tenantId: TenantId): Promise<number>;
}
