/**
 * @class UserLifecycleService
 * @description
 * 用户生命周期管理领域服务，负责实现用户生命周期相关的复杂业务逻辑。
 *
 * 原理与机制：
 * 1. 作为领域服务，UserLifecycleService封装了用户生命周期管理的复杂业务规则
 * 2. 协调多个聚合根和实体的操作，确保业务一致性
 * 3. 处理跨聚合的业务逻辑，如用户状态变更的连锁反应
 * 4. 发布领域事件，通知其他系统组件状态变更
 *
 * 功能与职责：
 * 1. 用户创建和初始化
 * 2. 用户状态变更管理
 * 3. 用户删除和清理
 * 4. 用户生命周期事件发布
 *
 * @example
 * ```typescript
 * const lifecycleService = new UserLifecycleService(
 *   userRepository,
 *   userProfileRepository,
 *   eventBus
 * );
 * await lifecycleService.createUser(userData);
 * await lifecycleService.activateUser(userId);
 * ```
 * @since 1.0.0
 */

import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { UserProfileRepository } from '../repositories/user-profile.repository';
import { UserRelationshipRepository } from '../repositories/user-relationship.repository';
import { UserEntity } from '../entities/user.entity';
import { UserProfileEntity } from '../entities/user-profile.entity';
import { UserRelationshipEntity } from '../entities/user-relationship.entity';
import { UserId, Username, Email, PhoneNumber, TenantId } from '@aiofix/shared';
import { UserType } from '../enums/user-type.enum';
import { UserStatus } from '../enums/user-status.enum';
import { DataPrivacyLevel } from '@aiofix/shared';
import { UserCreatedEvent, UserStatusChangedEvent } from '../domain-events';

/**
 * 用户创建数据接口
 */
export interface UserCreationData {
  username: Username;
  email: Email;
  phone?: PhoneNumber;
  tenantId: TenantId;
  organizationId?: string;
  departmentIds?: string[];
  userType?: UserType;
  dataPrivacyLevel?: DataPrivacyLevel;
}

/**
 * 用户生命周期管理领域服务
 * @description 实现用户生命周期相关的复杂业务逻辑
 */
@Injectable()
export class UserLifecycleService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userProfileRepository: UserProfileRepository,
    private readonly userRelationshipRepository: UserRelationshipRepository
  ) {}

  /**
   * 创建用户
   * @description 创建新用户并初始化相关实体
   * @param {UserCreationData} userData 用户创建数据
   * @returns {Promise<UserEntity>} 创建的用户实体
   */
  async createUser(userData: UserCreationData): Promise<UserEntity> {
    // 1. 验证用户名和邮箱唯一性
    await this.validateUserUniqueness(userData.username, userData.email, userData.tenantId);

    // 2. 创建用户实体
    const userId = UserId.generate();
    const user = new UserEntity(
      userId,
      userData.username,
      userData.email,
      userData.tenantId,
      userData.organizationId ? TenantId.create(userData.organizationId) : undefined,
      userData.departmentIds ? userData.departmentIds.map(id => TenantId.create(id)) : [],
      userData.userType || UserType.TENANT_USER,
      userData.dataPrivacyLevel || DataPrivacyLevel.PROTECTED
    );

    // 3. 创建用户档案
    const profile = UserProfileEntity.createPrivateProfile(
      `profile-${userId.toString()}`,
      userData.username.toString(),
      userData.tenantId.toString(),
      userId.toString(),
      userData.organizationId,
      userData.departmentIds
    );

    // 4. 保存用户和档案
    const savedUser = await this.userRepository.save(user);
    await this.userProfileRepository.save(profile);

    // 5. 发布用户创建事件
    // TODO: 实现事件总线发布
    // await this.eventBus.publish(new UserCreatedEvent(...));

    return savedUser;
  }

  /**
   * 激活用户
   * @description 将用户状态设置为激活状态
   * @param {UserId} userId 用户ID
   * @returns {Promise<UserEntity>} 更新后的用户实体
   */
  async activateUser(userId: UserId): Promise<UserEntity> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    const oldStatus = user.status;
    user.activate();
    const updatedUser = await this.userRepository.save(user);

    // 发布用户状态变更事件
    // TODO: 实现事件总线发布
    // await this.eventBus.publish(new UserStatusChangedEvent(...));

    return updatedUser;
  }

  /**
   * 停用用户
   * @description 将用户状态设置为停用状态
   * @param {UserId} userId 用户ID
   * @param {string} reason 停用原因
   * @returns {Promise<UserEntity>} 更新后的用户实体
   */
  async deactivateUser(userId: UserId, reason?: string): Promise<UserEntity> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    const oldStatus = user.status;
    user.deactivate();
    const updatedUser = await this.userRepository.save(user);

    // 发布用户状态变更事件
    // TODO: 实现事件总线发布
    // await this.eventBus.publish(new UserStatusChangedEvent(...));

    return updatedUser;
  }

  /**
   * 暂停用户
   * @description 将用户状态设置为暂停状态
   * @param {UserId} userId 用户ID
   * @param {string} reason 暂停原因
   * @returns {Promise<UserEntity>} 更新后的用户实体
   */
  async suspendUser(userId: UserId, reason?: string): Promise<UserEntity> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    const oldStatus = user.status;
    user.suspend();
    const updatedUser = await this.userRepository.save(user);

    // 发布用户状态变更事件
    // TODO: 实现事件总线发布
    // await this.eventBus.publish(new UserStatusChangedEvent(...));

    return updatedUser;
  }

  /**
   * 删除用户
   * @description 将用户状态设置为删除状态，并清理相关数据
   * @param {UserId} userId 用户ID
   * @param {string} reason 删除原因
   * @returns {Promise<boolean>} 是否删除成功
   */
  async deleteUser(userId: UserId, reason?: string): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    // 1. 更新用户状态为删除
    const oldStatus = user.status;
    user.delete();
    await this.userRepository.save(user);

    // 2. 删除用户档案
    await this.userProfileRepository.deleteByUserId(userId);

    // 3. 删除用户关系
    await this.userRelationshipRepository.deleteByUserId(userId);

    // 发布用户状态变更事件
    // TODO: 实现事件总线发布
    // await this.eventBus.publish(new UserStatusChangedEvent(...));

    return true;
  }

  /**
   * 验证用户唯一性
   * @description 验证用户名和邮箱在指定租户下的唯一性
   * @param {Username} username 用户名
   * @param {Email} email 邮箱
   * @param {TenantId} tenantId 租户ID
   * @throws {Error} 当用户名或邮箱已存在时抛出异常
   */
  private async validateUserUniqueness(
    username: Username,
    email: Email,
    tenantId: TenantId
  ): Promise<void> {
    const usernameExists = await this.userRepository.existsByUsername(username, tenantId);
    if (usernameExists) {
      throw new Error('用户名已存在');
    }

    const emailExists = await this.userRepository.existsByEmail(email, tenantId);
    if (emailExists) {
      throw new Error('邮箱已存在');
    }
  }

  /**
   * 获取用户完整信息
   * @description 获取用户及其档案和关系的完整信息
   * @param {UserId} userId 用户ID
   * @returns {Promise<{user: UserEntity, profile: UserProfileEntity, relationships: UserRelationshipEntity[]}>} 用户完整信息
   */
  async getUserCompleteInfo(userId: UserId): Promise<{
    user: UserEntity;
    profile: UserProfileEntity | null;
    relationships: UserRelationshipEntity[];
  }> {
    const [user, profile, relationships] = await Promise.all([
      this.userRepository.findById(userId),
      this.userProfileRepository.findByUserId(userId),
      this.userRelationshipRepository.findByUserId(userId)
    ]);

    if (!user) {
      throw new Error('用户不存在');
    }

    return {
      user,
      profile,
      relationships
    };
  }

  /**
   * 批量更新用户状态
   * @description 批量更新多个用户的状态
   * @param {UserId[]} userIds 用户ID列表
   * @param {UserStatus} newStatus 新状态
   * @param {string} reason 状态变更原因
   * @returns {Promise<UserEntity[]>} 更新后的用户实体列表
   */
  async batchUpdateUserStatus(
    userIds: UserId[],
    newStatus: UserStatus,
    reason?: string
  ): Promise<UserEntity[]> {
    const users = await Promise.all(
      userIds.map(id => this.userRepository.findById(id))
    );

    const validUsers = users.filter(user => user !== null) as UserEntity[];
    const updatedUsers: UserEntity[] = [];

    for (const user of validUsers) {
      const oldStatus = user.status;
      
      switch (newStatus) {
        case UserStatus.ACTIVE:
          user.activate();
          break;
        case UserStatus.INACTIVE:
          user.deactivate();
          break;
        case UserStatus.SUSPENDED:
          user.suspend();
          break;
        case UserStatus.DELETED:
          user.delete();
          break;
        default:
          throw new Error(`不支持的状态: ${newStatus}`);
      }

      const updatedUser = await this.userRepository.save(user);
      updatedUsers.push(updatedUser);

      // 发布用户状态变更事件
      // TODO: 实现事件总线发布
      // await this.eventBus.publish(new UserStatusChangedEvent(...));
    }

    return updatedUsers;
  }
}
