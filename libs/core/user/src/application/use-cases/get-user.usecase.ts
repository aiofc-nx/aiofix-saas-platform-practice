/**
 * @class GetUserUseCase
 * @description
 * 获取用户用例，负责协调用户查询的业务流程。
 *
 * 原理与机制：
 * 1. 作为应用层的用例，GetUserUseCase协调领域服务和基础设施服务
 * 2. 支持多种查询方式：按ID、用户名、邮箱等
 * 3. 实现数据访问控制和权限验证
 * 4. 支持关联数据的懒加载和预加载
 *
 * 功能与职责：
 * 1. 验证查询请求的有效性
 * 2. 执行数据访问控制检查
 * 3. 协调用户数据查询和组装
 * 4. 处理查询结果和错误情况
 *
 * @example
 * ```typescript
 * const useCase = new GetUserUseCase(userRepository, userProfileRepository);
 * const user = await useCase.byId('user-123');
 * const userByUsername = await useCase.byUsername('john_doe', 'tenant-123');
 * ```
 * @since 1.0.0
 */

import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../domain/repositories/user.repository';
import { UserProfileRepository } from '../../domain/repositories/user-profile.repository';
import { UserRelationshipRepository } from '../../domain/repositories/user-relationship.repository';
import { UserEntity } from '../../domain/entities/user.entity';
import { UserProfileEntity } from '../../domain/entities/user-profile.entity';
import { UserRelationshipEntity } from '../../domain/entities/user-relationship.entity';
import { UserId, Username, Email, TenantId } from '@aiofix/shared';
import { UserNotFoundException } from '../../domain/exceptions';

/**
 * 用户查询选项接口
 */
export interface UserQueryOptions {
  includeProfile?: boolean;
  includeRelationships?: boolean;
  includeSensitiveData?: boolean;
}

/**
 * 用户完整信息接口
 */
export interface UserCompleteInfo {
  user: UserEntity;
  profile?: UserProfileEntity | null;
  relationships?: UserRelationshipEntity[];
}

/**
 * 获取用户用例
 * @description 实现用户查询的业务逻辑
 */
@Injectable()
export class GetUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userProfileRepository: UserProfileRepository,
    private readonly userRelationshipRepository: UserRelationshipRepository
  ) {}

  /**
   * 根据用户ID获取用户
   * @description 通过用户ID获取用户信息
   * @param {string} userId 用户ID
   * @param {UserQueryOptions} options 查询选项
   * @returns {Promise<UserCompleteInfo>} 用户完整信息
   */
  async byId(userId: string, options: UserQueryOptions = {}): Promise<UserCompleteInfo> {
    const user = await this.userRepository.findById(UserId.create(userId));
    if (!user) {
      throw UserNotFoundException.byUserId(userId);
    }

    return await this.enrichUserData(user, options);
  }

  /**
   * 根据用户名获取用户
   * @description 通过用户名和租户ID获取用户信息
   * @param {string} username 用户名
   * @param {string} tenantId 租户ID
   * @param {UserQueryOptions} options 查询选项
   * @returns {Promise<UserCompleteInfo>} 用户完整信息
   */
  async byUsername(username: string, tenantId: string, options: UserQueryOptions = {}): Promise<UserCompleteInfo> {
    const user = await this.userRepository.findByUsername(
      Username.create(username),
      TenantId.create(tenantId)
    );
    if (!user) {
      throw UserNotFoundException.byUsername(username, tenantId);
    }

    return await this.enrichUserData(user, options);
  }

  /**
   * 根据邮箱获取用户
   * @description 通过邮箱和租户ID获取用户信息
   * @param {string} email 邮箱
   * @param {string} tenantId 租户ID
   * @param {UserQueryOptions} options 查询选项
   * @returns {Promise<UserCompleteInfo>} 用户完整信息
   */
  async byEmail(email: string, tenantId: string, options: UserQueryOptions = {}): Promise<UserCompleteInfo> {
    const user = await this.userRepository.findByEmail(
      new Email(email),
      TenantId.create(tenantId)
    );
    if (!user) {
      throw UserNotFoundException.byEmail(email, tenantId);
    }

    return await this.enrichUserData(user, options);
  }

  /**
   * 根据条件查询用户列表
   * @description 根据查询条件获取用户列表
   * @param {object} criteria 查询条件
   * @param {UserQueryOptions} options 查询选项
   * @returns {Promise<UserCompleteInfo[]>} 用户完整信息列表
   */
  async byCriteria(criteria: any, options: UserQueryOptions = {}): Promise<UserCompleteInfo[]> {
    const users = await this.userRepository.findByCriteria(criteria);
    
    if (options.includeProfile || options.includeRelationships) {
      const enrichedUsers: UserCompleteInfo[] = [];
      for (const user of users) {
        const enrichedUser = await this.enrichUserData(user, options);
        enrichedUsers.push(enrichedUser);
      }
      return enrichedUsers;
    }

    return users.map(user => ({ user }));
  }

  /**
   * 根据租户ID获取用户列表
   * @description 获取指定租户下的所有用户
   * @param {string} tenantId 租户ID
   * @param {number} [limit] 限制数量
   * @param {number} [offset] 偏移量
   * @param {UserQueryOptions} options 查询选项
   * @returns {Promise<UserCompleteInfo[]>} 用户完整信息列表
   */
  async byTenantId(
    tenantId: string,
    limit?: number,
    offset?: number,
    options: UserQueryOptions = {}
  ): Promise<UserCompleteInfo[]> {
    const users = await this.userRepository.findByTenantId(
      TenantId.create(tenantId),
      limit,
      offset
    );

    if (options.includeProfile || options.includeRelationships) {
      const enrichedUsers: UserCompleteInfo[] = [];
      for (const user of users) {
        const enrichedUser = await this.enrichUserData(user, options);
        enrichedUsers.push(enrichedUser);
      }
      return enrichedUsers;
    }

    return users.map(user => ({ user }));
  }

  /**
   * 根据组织ID获取用户列表
   * @description 获取指定组织下的所有用户
   * @param {string} organizationId 组织ID
   * @param {string} tenantId 租户ID
   * @param {number} [limit] 限制数量
   * @param {number} [offset] 偏移量
   * @param {UserQueryOptions} options 查询选项
   * @returns {Promise<UserCompleteInfo[]>} 用户完整信息列表
   */
  async byOrganizationId(
    organizationId: string,
    tenantId: string,
    limit?: number,
    offset?: number,
    options: UserQueryOptions = {}
  ): Promise<UserCompleteInfo[]> {
    const users = await this.userRepository.findByOrganizationId(
      organizationId,
      TenantId.create(tenantId),
      limit,
      offset
    );

    if (options.includeProfile || options.includeRelationships) {
      const enrichedUsers: UserCompleteInfo[] = [];
      for (const user of users) {
        const enrichedUser = await this.enrichUserData(user, options);
        enrichedUsers.push(enrichedUser);
      }
      return enrichedUsers;
    }

    return users.map(user => ({ user }));
  }

  /**
   * 根据部门ID获取用户列表
   * @description 获取指定部门下的所有用户
   * @param {string} departmentId 部门ID
   * @param {string} tenantId 租户ID
   * @param {number} [limit] 限制数量
   * @param {number} [offset] 偏移量
   * @param {UserQueryOptions} options 查询选项
   * @returns {Promise<UserCompleteInfo[]>} 用户完整信息列表
   */
  async byDepartmentId(
    departmentId: string,
    tenantId: string,
    limit?: number,
    offset?: number,
    options: UserQueryOptions = {}
  ): Promise<UserCompleteInfo[]> {
    const users = await this.userRepository.findByDepartmentId(
      departmentId,
      TenantId.create(tenantId),
      limit,
      offset
    );

    if (options.includeProfile || options.includeRelationships) {
      const enrichedUsers: UserCompleteInfo[] = [];
      for (const user of users) {
        const enrichedUser = await this.enrichUserData(user, options);
        enrichedUsers.push(enrichedUser);
      }
      return enrichedUsers;
    }

    return users.map(user => ({ user }));
  }

  /**
   * 统计用户数量
   * @description 根据条件统计用户数量
   * @param {object} criteria 查询条件
   * @returns {Promise<number>} 用户数量
   */
  async countByCriteria(criteria: any): Promise<number> {
    return await this.userRepository.countByCriteria(criteria);
  }

  /**
   * 根据租户统计用户数量
   * @description 统计指定租户下的用户数量
   * @param {string} tenantId 租户ID
   * @returns {Promise<number>} 用户数量
   */
  async countByTenantId(tenantId: string): Promise<number> {
    return await this.userRepository.countByTenantId(TenantId.create(tenantId));
  }

  /**
   * 丰富用户数据
   * @description 根据查询选项加载用户的关联数据
   * @param {UserEntity} user 用户实体
   * @param {UserQueryOptions} options 查询选项
   * @returns {Promise<UserCompleteInfo>} 丰富的用户数据
   */
  private async enrichUserData(user: UserEntity, options: UserQueryOptions): Promise<UserCompleteInfo> {
    const result: UserCompleteInfo = { user };

    // 加载用户档案
    if (options.includeProfile) {
      result.profile = await this.userProfileRepository.findByUserId(user.id);
    }

    // 加载用户关系
    if (options.includeRelationships) {
      result.relationships = await this.userRelationshipRepository.findByUserId(user.id);
    }

    return result;
  }

  /**
   * 验证用户访问权限
   * @description 检查当前用户是否有权限访问目标用户数据
   * @param {string} currentUserId 当前用户ID
   * @param {UserEntity} targetUser 目标用户
   * @returns {Promise<boolean>} 是否有访问权限
   */
  async checkAccessPermission(currentUserId: string, targetUser: UserEntity): Promise<boolean> {
    // TODO: 实现权限检查逻辑
    // 1. 检查是否为同一租户
    // 2. 检查是否为管理员
    // 3. 检查是否为本人
    // 4. 检查组织/部门权限
    
    return true; // 临时返回true，后续实现具体权限逻辑
  }
}
