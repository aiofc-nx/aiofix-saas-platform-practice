/**
 * @interface UserRelationshipRepository
 * @description
 * 用户关系仓储接口，定义用户关系实体的数据访问契约。
 *
 * 原理与机制：
 * 1. 作为仓储接口，UserRelationshipRepository定义了用户关系实体的CRUD操作
 * 2. 支持多租户数据隔离和查询
 * 3. 提供基于不同条件的查询方法
 * 4. 支持关系状态管理和权限控制
 *
 * 功能与职责：
 * 1. 用户关系实体的增删改查操作
 * 2. 支持多租户数据隔离
 * 3. 提供关系状态管理
 * 4. 支持关系权限控制
 *
 * @example
 * ```typescript
 * class PostgresUserRelationshipRepository implements UserRelationshipRepository {
 *   async findByUserId(userId: UserId): Promise<UserRelationshipEntity[]> {
 *     // 实现查找逻辑
 *   }
 * }
 * ```
 * @since 1.0.0
 */

import { UserRelationshipEntity } from '../entities/user-relationship.entity';
import { UserId, TenantId } from '@aiofix/shared';

/**
 * 用户关系查询条件接口
 */
export interface UserRelationshipQueryCriteria {
  userId?: UserId;
  targetEntityId?: string;
  targetEntityType?: string;
  relationshipType?: string;
  status?: string;
  tenantId?: TenantId;
  organizationId?: string;
  departmentIds?: string[];
  hasPermissions?: string[];
  startDateAfter?: Date;
  startDateBefore?: Date;
  endDateAfter?: Date;
  endDateBefore?: Date;
  isActive?: boolean;
  limit?: number;
  offset?: number;
}

/**
 * 用户关系仓储接口
 * @description 定义用户关系实体的数据访问契约
 */
export interface UserRelationshipRepository {
  /**
   * 根据ID查找用户关系
   * @description 通过关系ID查找用户关系实体
   * @param {string} id 关系ID
   * @returns {Promise<UserRelationshipEntity | null>} 用户关系实体或null
   */
  findById(id: string): Promise<UserRelationshipEntity | null>;

  /**
   * 根据用户ID查找用户关系列表
   * @description 通过用户ID查找所有相关的关系
   * @param {UserId} userId 用户ID
   * @returns {Promise<UserRelationshipEntity[]>} 用户关系实体列表
   */
  findByUserId(userId: UserId): Promise<UserRelationshipEntity[]>;

  /**
   * 根据目标实体查找用户关系列表
   * @description 通过目标实体ID和类型查找相关的关系
   * @param {string} targetEntityId 目标实体ID
   * @param {string} targetEntityType 目标实体类型
   * @returns {Promise<UserRelationshipEntity[]>} 用户关系实体列表
   */
  findByTargetEntity(
    targetEntityId: string,
    targetEntityType: string,
  ): Promise<UserRelationshipEntity[]>;

  /**
   * 根据条件查询用户关系列表
   * @description 根据查询条件查找用户关系列表
   * @param {UserRelationshipQueryCriteria} criteria 查询条件
   * @returns {Promise<UserRelationshipEntity[]>} 用户关系实体列表
   */
  findByCriteria(
    criteria: UserRelationshipQueryCriteria,
  ): Promise<UserRelationshipEntity[]>;

  /**
   * 根据租户ID查找用户关系列表
   * @description 查找指定租户下的所有用户关系
   * @param {TenantId} tenantId 租户ID
   * @param {number} [limit] 限制数量
   * @param {number} [offset] 偏移量
   * @returns {Promise<UserRelationshipEntity[]>} 用户关系实体列表
   */
  findByTenantId(
    tenantId: TenantId,
    limit?: number,
    offset?: number,
  ): Promise<UserRelationshipEntity[]>;

  /**
   * 根据组织ID查找用户关系列表
   * @description 查找指定组织下的所有用户关系
   * @param {string} organizationId 组织ID
   * @param {TenantId} tenantId 租户ID
   * @param {number} [limit] 限制数量
   * @param {number} [offset] 偏移量
   * @returns {Promise<UserRelationshipEntity[]>} 用户关系实体列表
   */
  findByOrganizationId(
    organizationId: string,
    tenantId: TenantId,
    limit?: number,
    offset?: number,
  ): Promise<UserRelationshipEntity[]>;

  /**
   * 根据部门ID查找用户关系列表
   * @description 查找指定部门下的所有用户关系
   * @param {string} departmentId 部门ID
   * @param {TenantId} tenantId 租户ID
   * @param {number} [limit] 限制数量
   * @param {number} [offset] 偏移量
   * @returns {Promise<UserRelationshipEntity[]>} 用户关系实体列表
   */
  findByDepartmentId(
    departmentId: string,
    tenantId: TenantId,
    limit?: number,
    offset?: number,
  ): Promise<UserRelationshipEntity[]>;

  /**
   * 保存用户关系
   * @description 保存或更新用户关系实体
   * @param {UserRelationshipEntity} relationship 用户关系实体
   * @returns {Promise<UserRelationshipEntity>} 保存后的用户关系实体
   */
  save(relationship: UserRelationshipEntity): Promise<UserRelationshipEntity>;

  /**
   * 批量保存用户关系
   * @description 批量保存或更新用户关系实体
   * @param {UserRelationshipEntity[]} relationships 用户关系实体列表
   * @returns {Promise<UserRelationshipEntity[]>} 保存后的用户关系实体列表
   */
  saveMany(
    relationships: UserRelationshipEntity[],
  ): Promise<UserRelationshipEntity[]>;

  /**
   * 删除用户关系
   * @description 删除用户关系实体
   * @param {string} id 关系ID
   * @returns {Promise<boolean>} 是否删除成功
   */
  delete(id: string): Promise<boolean>;

  /**
   * 根据用户ID删除用户关系
   * @description 根据用户ID删除所有相关的关系
   * @param {UserId} userId 用户ID
   * @returns {Promise<boolean>} 是否删除成功
   */
  deleteByUserId(userId: UserId): Promise<boolean>;

  /**
   * 根据目标实体删除用户关系
   * @description 根据目标实体ID和类型删除相关的关系
   * @param {string} targetEntityId 目标实体ID
   * @param {string} targetEntityType 目标实体类型
   * @returns {Promise<boolean>} 是否删除成功
   */
  deleteByTargetEntity(
    targetEntityId: string,
    targetEntityType: string,
  ): Promise<boolean>;

  /**
   * 检查关系是否存在
   * @description 检查指定用户与目标实体的关系是否存在
   * @param {UserId} userId 用户ID
   * @param {string} targetEntityId 目标实体ID
   * @param {string} targetEntityType 目标实体类型
   * @returns {Promise<boolean>} 是否存在
   */
  existsByUserAndTarget(
    userId: UserId,
    targetEntityId: string,
    targetEntityType: string,
  ): Promise<boolean>;

  /**
   * 更新关系状态
   * @description 更新用户关系的状态
   * @param {string} id 关系ID
   * @param {string} status 新状态
   * @returns {Promise<boolean>} 是否更新成功
   */
  updateStatus(id: string, status: string): Promise<boolean>;

  /**
   * 更新关系权限
   * @description 更新用户关系的权限列表
   * @param {string} id 关系ID
   * @param {string[]} permissions 权限列表
   * @returns {Promise<boolean>} 是否更新成功
   */
  updatePermissions(id: string, permissions: string[]): Promise<boolean>;

  /**
   * 统计用户关系数量
   * @description 根据条件统计用户关系数量
   * @param {UserRelationshipQueryCriteria} criteria 查询条件
   * @returns {Promise<number>} 用户关系数量
   */
  countByCriteria(criteria: UserRelationshipQueryCriteria): Promise<number>;

  /**
   * 根据租户统计用户关系数量
   * @description 统计指定租户下的用户关系数量
   * @param {TenantId} tenantId 租户ID
   * @returns {Promise<number>} 用户关系数量
   */
  countByTenantId(tenantId: TenantId): Promise<number>;
}
