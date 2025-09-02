/**
 * @class UserProjection
 * @description
 * 用户投影，负责将用户相关事件转换为读模型，支持事件溯源和查询优化。
 *
 * 原理与机制：
 * 1. 作为事件溯源架构中的投影组件，UserProjection监听用户相关的领域事件
 * 2. 将事件数据转换为MongoDB中的读模型，优化查询性能
 * 3. 支持多种事件类型的处理，确保读模型与事件流同步
 * 4. 实现最终一致性，支持系统扩展和性能优化
 *
 * 功能与职责：
 * 1. 监听用户相关领域事件
 * 2. 更新用户读模型
 * 3. 维护数据一致性
 * 4. 支持查询性能优化
 *
 * @example
 * ```typescript
 * const projection = new UserProjection(userReadModel, userProfileReadModel);
 * // 投影会自动监听和处理用户相关事件
 * ```
 * @since 1.0.0
 */

import { Injectable } from '@nestjs/common';
import { EventHandler } from '@aiofix/shared';
import { UserCreatedEvent, UserUpdatedEvent, UserDeletedEvent } from '../../domain/domain-events';
import { UserReadModel } from './read-models/user.read-model';
import { UserProfileReadModel } from './read-models/user-profile.read-model';

/**
 * 用户投影
 * @description 负责将用户相关事件转换为读模型
 */
@Injectable()
export class UserProjection {
  constructor(
    private readonly userReadModel: UserReadModel,
    private readonly userProfileReadModel: UserProfileReadModel
  ) {}

  /**
   * 处理用户创建事件
   * @description 将用户创建事件转换为读模型
   * @param {UserCreatedEvent} event 用户创建事件
   */
  // @EventHandler(UserCreatedEvent) // TODO: 实现事件处理器装饰器
  async handleUserCreated(event: UserCreatedEvent): Promise<void> {
    try {
      // 1. 创建用户读模型
      await this.userReadModel.create({
        id: event.userId,
        username: event.username,
        email: event.email,
        userType: event.userType,
        status: 'ACTIVE',
        tenantId: event.tenantId,
        organizationId: event.organizationId,
        departmentIds: event.departmentIds,
        dataPrivacyLevel: event.dataPrivacyLevel,
        createdAt: event.createdAt,
        updatedAt: event.createdAt,
        version: 1
      });

      // 2. 如果包含档案信息，创建用户档案读模型
      // TODO: 实现档案创建逻辑，需要从其他地方获取档案信息
      // if (event.profile) {
      //   await this.userProfileReadModel.create({
      //     id: `profile-${event.userId}`,
      //     userId: event.userId,
      //     displayName: event.profile.displayName,
      //     avatar: event.profile.avatar,
      //     bio: event.profile.bio,
      //     location: event.profile.location,
      //     website: event.profile.website,
      //     createdAt: event.createdAt,
      //     updatedAt: event.createdAt,
      //     version: 1
      //   });
      // }

      console.log(`用户投影：成功处理用户创建事件 - ${event.userId}`);
    } catch (error) {
      console.error(`用户投影：处理用户创建事件失败 - ${event.userId}`, error);
      throw error;
    }
  }

  /**
   * 处理用户更新事件
   * @description 将用户更新事件转换为读模型更新
   * @param {UserUpdatedEvent} event 用户更新事件
   */
  // @EventHandler(UserUpdatedEvent) // TODO: 实现事件处理器装饰器
  async handleUserUpdated(event: UserUpdatedEvent): Promise<void> {
    try {
      // 1. 准备用户更新数据
      const userUpdates: any = {
        updatedAt: new Date()
      };

      // 根据更新的字段设置相应的值
      if (event.hasFieldUpdate('email')) {
        userUpdates.email = event.email;
      }
      if (event.hasFieldUpdate('phone')) {
        userUpdates.phone = event.phone;
      }
      if (event.hasFieldUpdate('userType')) {
        userUpdates.userType = event.userType;
      }
      if (event.hasFieldUpdate('dataPrivacyLevel')) {
        userUpdates.dataPrivacyLevel = event.dataPrivacyLevel;
      }
      if (event.hasFieldUpdate('organizationId')) {
        userUpdates.organizationId = event.organizationId;
      }
      if (event.hasFieldUpdate('departmentIds')) {
        userUpdates.departmentIds = event.departmentIds;
      }

      // 2. 更新用户读模型
      if (Object.keys(userUpdates).length > 1) { // 除了updatedAt还有其他字段
        await this.userReadModel.updateById(event.userId, userUpdates);
      }

      // 3. 如果包含档案更新，更新用户档案读模型
      if (event.hasFieldUpdate('profile') && event.profile) {
        const profileUpdates: any = {
          updatedAt: new Date()
        };

        if (event.profile.displayName !== undefined) {
          profileUpdates.displayName = event.profile.displayName;
        }
        if (event.profile.avatar !== undefined) {
          profileUpdates.avatar = event.profile.avatar;
        }
        if (event.profile.bio !== undefined) {
          profileUpdates.bio = event.profile.bio;
        }
        if (event.profile.location !== undefined) {
          profileUpdates.location = event.profile.location;
        }
        if (event.profile.website !== undefined) {
          profileUpdates.website = event.profile.website;
        }

        if (Object.keys(profileUpdates).length > 1) {
          await this.userProfileReadModel.updateByUserId(event.userId, profileUpdates);
        }
      }

      console.log(`用户投影：成功处理用户更新事件 - ${event.userId}，更新字段：${event.updatedFields.join(', ')}`);
    } catch (error) {
      console.error(`用户投影：处理用户更新事件失败 - ${event.userId}`, error);
      throw error;
    }
  }

  /**
   * 处理用户删除事件
   * @description 将用户删除事件转换为读模型更新
   * @param {UserDeletedEvent} event 用户删除事件
   */
  // @EventHandler(UserDeletedEvent) // TODO: 实现事件处理器装饰器
  async handleUserDeleted(event: UserDeletedEvent): Promise<void> {
    try {
      if (event.isSoftDelete()) {
        // 软删除：更新状态为已删除
        await this.userReadModel.updateById(event.userId, {
          status: 'DELETED',
          deletedAt: new Date(),
          deletedBy: event.deletedBy,
          deleteReason: event.reason,
          updatedAt: new Date()
        });

        console.log(`用户投影：成功处理用户软删除事件 - ${event.userId}`);
      } else {
        // 硬删除：物理删除读模型
        await this.userReadModel.deleteById(event.userId);
        await this.userProfileReadModel.deleteByUserId(event.userId);

        console.log(`用户投影：成功处理用户硬删除事件 - ${event.userId}`);
      }
    } catch (error) {
      console.error(`用户投影：处理用户删除事件失败 - ${event.userId}`, error);
      throw error;
    }
  }

  /**
   * 重建用户读模型
   * @description 根据事件流重建用户的完整状态
   * @param {string} userId 用户ID
   * @param {DomainEvent[]} events 事件流
   */
  async rebuildUserReadModel(userId: string, events: any[]): Promise<void> {
    try {
      console.log(`用户投影：开始重建用户读模型 - ${userId}`);

      // 1. 删除现有的读模型
      await this.userReadModel.deleteById(userId);
      await this.userProfileReadModel.deleteByUserId(userId);

      // 2. 按时间顺序重放事件
      const sortedEvents = events.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

      for (const event of sortedEvents) {
        if (event.eventType === 'UserCreated') {
          await this.handleUserCreated(event);
        } else if (event.eventType === 'UserUpdated') {
          await this.handleUserUpdated(event);
        } else if (event.eventType === 'UserDeleted') {
          await this.handleUserDeleted(event);
        }
      }

      console.log(`用户投影：成功重建用户读模型 - ${userId}`);
    } catch (error) {
      console.error(`用户投影：重建用户读模型失败 - ${userId}`, error);
      throw error;
    }
  }

  /**
   * 获取投影状态
   * @description 返回投影的当前状态信息
   * @returns {object} 投影状态
   */
  async getProjectionStatus(): Promise<object> {
    try {
      const userCount = await this.userReadModel.count();
      const profileCount = await this.userProfileReadModel.count();

      return {
        status: 'active',
        userReadModelCount: userCount,
        userProfileReadModelCount: profileCount,
        lastUpdated: new Date(),
        eventTypes: ['UserCreated', 'UserUpdated', 'UserDeleted']
      };
    } catch (error) {
      console.error('获取投影状态失败:', error);
      return {
        status: 'error',
        error: error instanceof Error ? error.message : '未知错误',
        lastUpdated: new Date()
      };
    }
  }
}
