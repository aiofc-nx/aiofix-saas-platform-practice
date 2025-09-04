/**
 * @class UserEventHandler
 * @description
 * 用户事件处理器，负责处理用户相关的领域事件并同步到MongoDB读模型。
 *
 * 原理与机制：
 * 1. 监听用户相关的领域事件（如用户创建、更新、删除等）
 * 2. 将事件数据投影到MongoDB读模型，保持读写模型的一致性
 * 3. 支持事件重放和状态重建
 * 4. 处理事件失败的重试机制
 *
 * 功能与职责：
 * 1. 事件监听和处理
 * 2. 读模型同步
 * 3. 事件重放支持
 * 4. 错误处理和重试
 *
 * @example
 * ```typescript
 * const handler = new UserEventHandler(
 *   mongoUserRepository,
 *   mongoUserProfileRepository,
 *   mongoUserRelationshipRepository
 * );
 * await handler.handleUserCreatedEvent(event);
 * ```
 * @since 1.0.0
 */

import { Injectable } from '@nestjs/common';
import { DomainEvent } from '@aiofix/shared';
import { PinoLoggerService } from '@aiofix/logging';
import { MongoUserRepository } from '../repositories/mongodb/mongo-user.repository';
import { MongoUserProfileRepository } from '../repositories/mongodb/mongo-user-profile.repository';
import { MongoUserRelationshipRepository } from '../repositories/mongodb/mongo-user-relationship.repository';
import { MongoUserMapper } from '../mappers/mongodb/user.mapper';
import { MongoUserProfileMapper } from '../mappers/mongodb/user-profile.mapper';
import { MongoUserRelationshipMapper } from '../mappers/mongodb/user-relationship.mapper';
import { LogContext } from '@aiofix/logging';

/**
 * 用户事件处理器
 */
@Injectable()
export class UserEventHandler {
  constructor(
    private readonly logger: PinoLoggerService,
    private readonly mongoUserRepository: MongoUserRepository,
    private readonly mongoUserProfileRepository: MongoUserProfileRepository,
    private readonly mongoUserRelationshipRepository: MongoUserRelationshipRepository,
    private readonly mongoUserMapper: MongoUserMapper,
    private readonly mongoUserProfileMapper: MongoUserProfileMapper,
    private readonly mongoUserRelationshipMapper: MongoUserRelationshipMapper,
  ) {}

  /**
   * 处理用户创建事件
   * @description 将用户创建事件同步到MongoDB读模型
   * @param {DomainEvent} event 用户创建事件
   */
  async handleUserCreatedEvent(event: DomainEvent): Promise<void> {
    try {
      this.logger.info('处理用户创建事件', LogContext.EVENT, {
        eventId: event.eventId,
      });

      // 使用正确的事件数据访问方式
      const userData = (event as any).data || {};

      // 创建用户读模型
      const userDocument = this.mongoUserMapper.toDocument({
        id: userData.userId,
        username: userData.username,
        email: userData.email,
        status: userData.status,
        userType: userData.userType,
        tenantId: userData.tenantId,
        organizationId: userData.organizationId,
        departmentIds: userData.departmentIds,
        dataIsolationLevel: userData.dataIsolationLevel,
        dataPrivacyLevel: userData.dataPrivacyLevel,
        createdAt: event.occurredOn,
        updatedAt: event.occurredOn,
        version: 1,
      } as any);

      await this.mongoUserRepository.save(userDocument as any);

      this.logger.info('用户创建事件处理成功', LogContext.EVENT, {
        eventId: event.eventId,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error('用户创建事件处理失败', LogContext.EVENT, {
        eventId: event.eventId,
        error: errorMessage,
      });
      throw error;
    }
  }

  /**
   * 处理用户更新事件
   * @description 将用户更新事件同步到MongoDB读模型
   * @param {DomainEvent} event 用户更新事件
   */
  async handleUserUpdatedEvent(event: DomainEvent): Promise<void> {
    try {
      this.logger.info('处理用户更新事件', LogContext.EVENT, {
        eventId: event.eventId,
      });

      // 使用正确的事件数据访问方式
      const userData = (event as any).data || {};

      // 更新用户读模型 - 使用toDocument方法替代toPartialUpdate
      const updateData = this.mongoUserMapper.toDocument({
        username: userData.username,
        email: userData.email,
        status: userData.status,
        organizationId: userData.organizationId,
        departmentIds: userData.departmentIds,
        updatedAt: event.occurredOn,
      } as any);

      // 使用save方法替代update方法
      await this.mongoUserRepository.save(updateData as any);

      this.logger.info('用户更新事件处理成功', LogContext.EVENT, {
        eventId: event.eventId,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error('用户更新事件处理失败', LogContext.EVENT, {
        eventId: event.eventId,
        error: errorMessage,
      });
      throw error;
    }
  }

  /**
   * 处理用户状态变更事件
   * @description 将用户状态变更事件同步到MongoDB读模型
   * @param {DomainEvent} event 用户状态变更事件
   */
  async handleUserStatusChangedEvent(event: DomainEvent): Promise<void> {
    try {
      this.logger.info('处理用户状态变更事件', LogContext.EVENT, {
        eventId: event.eventId,
      });

      // 使用正确的事件数据访问方式
      const userData = (event as any).data || {};

      // 更新用户状态 - 使用toDocument方法替代toPartialUpdate
      const updateData = this.mongoUserMapper.toDocument({
        status: userData.newStatus,
        updatedAt: event.occurredOn,
      } as any);

      // 使用save方法替代update方法
      await this.mongoUserRepository.save(updateData as any);

      this.logger.info('用户状态变更事件处理成功', LogContext.EVENT, {
        eventId: event.eventId,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error('用户状态变更事件处理失败', LogContext.EVENT, {
        eventId: event.eventId,
        error: errorMessage,
      });
      throw error;
    }
  }

  /**
   * 处理用户档案创建事件
   * @description 将用户档案创建事件同步到MongoDB读模型
   * @param {DomainEvent} event 用户档案创建事件
   */
  async handleUserProfileCreatedEvent(event: DomainEvent): Promise<void> {
    try {
      this.logger.info('处理用户档案创建事件', LogContext.EVENT, {
        eventId: event.eventId,
      });

      // 使用正确的事件数据访问方式
      const profileData = (event as any).data || {};

      // 创建用户档案读模型
      const profileDocument = this.mongoUserProfileMapper.toDocument({
        userId: profileData.userId,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        displayName: profileData.displayName,
        avatar: profileData.avatar,
        bio: profileData.bio,
        location: profileData.location,
        timezone: profileData.timezone,
        language: profileData.language,
        dateOfBirth: profileData.dateOfBirth,
        gender: profileData.gender,
        website: profileData.website,
        socialLinks: profileData.socialLinks,
        preferences: profileData.preferences,
        skills: profileData.skills,
        interests: profileData.interests,
        education: profileData.education,
        experience: profileData.experience,
        certifications: profileData.certifications,
        createdAt: event.occurredOn,
        updatedAt: event.occurredOn,
        version: 1,
      } as any);

      // 使用save方法
      await this.mongoUserProfileRepository.save(profileDocument as any);

      this.logger.info('用户档案创建事件处理成功', LogContext.EVENT, {
        eventId: event.eventId,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error('用户档案创建事件处理失败', LogContext.EVENT, {
        eventId: event.eventId,
        error: errorMessage,
      });
      throw error;
    }
  }

  /**
   * 处理用户档案更新事件
   * @description 将用户档案更新事件同步到MongoDB读模型
   * @param {DomainEvent} event 用户档案更新事件
   */
  async handleUserProfileUpdatedEvent(event: DomainEvent): Promise<void> {
    try {
      this.logger.info('处理用户档案更新事件', LogContext.EVENT, {
        eventId: event.eventId,
      });

      // 使用正确的事件数据访问方式
      const profileData = (event as any).data || {};

      // 更新用户档案读模型 - 使用toDocument方法替代toPartialUpdate
      const updateData = this.mongoUserProfileMapper.toDocument({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        displayName: profileData.displayName,
        avatar: profileData.avatar,
        bio: profileData.bio,
        location: profileData.location,
        timezone: profileData.timezone,
        language: profileData.language,
        dateOfBirth: profileData.dateOfBirth,
        gender: profileData.gender,
        website: profileData.website,
        socialLinks: profileData.socialLinks,
        preferences: profileData.preferences,
        skills: profileData.skills,
        interests: profileData.interests,
        education: profileData.education,
        experience: profileData.experience,
        certifications: profileData.certifications,
        updatedAt: event.occurredOn,
      } as any);

      // 使用save方法替代update方法
      await this.mongoUserProfileRepository.save(updateData as any);

      this.logger.info('用户档案更新事件处理成功', LogContext.EVENT, {
        eventId: event.eventId,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error('用户档案更新事件处理失败', LogContext.EVENT, {
        eventId: event.eventId,
        error: errorMessage,
      });
      throw error;
    }
  }

  /**
   * 处理用户关系创建事件
   * @description 将用户关系创建事件同步到MongoDB读模型
   * @param {DomainEvent} event 用户关系创建事件
   */
  async handleUserRelationshipCreatedEvent(event: DomainEvent): Promise<void> {
    try {
      this.logger.info('处理用户关系创建事件', LogContext.EVENT, {
        eventId: event.eventId,
      });

      // 使用正确的事件数据访问方式
      const relationshipData = (event as any).data || {};

      // 创建用户关系读模型
      const relationshipDocument = this.mongoUserRelationshipMapper.toDocument({
        relationshipId: relationshipData.relationshipId,
        sourceUserId: relationshipData.sourceUserId,
        targetUserId: relationshipData.targetUserId,
        relationshipType: relationshipData.relationshipType,
        status: relationshipData.status,
        initiatedAt: relationshipData.initiatedAt,
        notes: relationshipData.notes,
        tenantId: relationshipData.tenantId,
        organizationId: relationshipData.organizationId,
        departmentIds: relationshipData.departmentIds,
        dataIsolationLevel: relationshipData.dataIsolationLevel,
        dataPrivacyLevel: relationshipData.dataPrivacyLevel,
        createdAt: event.occurredOn,
        updatedAt: event.occurredOn,
        version: 1,
      } as any);

      await this.mongoUserRelationshipRepository.save(
        relationshipDocument as any,
      );

      this.logger.info('用户关系创建事件处理成功', LogContext.EVENT, {
        eventId: event.eventId,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error('用户关系创建事件处理失败', LogContext.EVENT, {
        eventId: event.eventId,
        error: errorMessage,
      });
      throw error;
    }
  }

  /**
   * 处理用户关系状态变更事件
   * @description 将用户关系状态变更事件同步到MongoDB读模型
   * @param {DomainEvent} event 用户关系状态变更事件
   */
  async handleUserRelationshipStatusChangedEvent(
    event: DomainEvent,
  ): Promise<void> {
    try {
      this.logger.info('处理用户关系状态变更事件', LogContext.EVENT, {
        eventId: event.eventId,
      });

      // 使用正确的事件数据访问方式
      const relationshipData = (event as any).data || {};

      // 更新用户关系状态 - 使用toDocument方法替代toPartialUpdate
      const updateData = this.mongoUserRelationshipMapper.toDocument({
        status: relationshipData.newStatus,
        acceptedAt: relationshipData.acceptedAt,
        terminatedAt: relationshipData.terminatedAt,
        updatedAt: event.occurredOn,
      } as any);

      // 使用save方法替代update方法
      await this.mongoUserRelationshipRepository.save(updateData as any);

      this.logger.info('用户关系状态变更事件处理成功', LogContext.EVENT, {
        eventId: event.eventId,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error('用户关系状态变更事件处理失败', LogContext.EVENT, {
        eventId: event.eventId,
        error: errorMessage,
      });
      throw error;
    }
  }

  /**
   * 处理用户删除事件
   * @description 将用户删除事件同步到MongoDB读模型
   * @param {DomainEvent} event 用户删除事件
   */
  async handleUserDeletedEvent(event: DomainEvent): Promise<void> {
    try {
      this.logger.info('处理用户删除事件', LogContext.EVENT, {
        eventId: event.eventId,
      });

      // 使用正确的事件数据访问方式
      const userData = (event as any).data || {};

      // 从MongoDB读模型中删除用户
      await this.mongoUserRepository.delete(userData.userId);

      // 删除相关的用户档案
      await this.mongoUserProfileRepository.delete(userData.userId);

      // 删除相关的用户关系
      await this.mongoUserRelationshipRepository.deleteByUserId(
        userData.userId,
      );

      this.logger.info('用户删除事件处理成功', LogContext.EVENT, {
        eventId: event.eventId,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error('用户删除事件处理失败', LogContext.EVENT, {
        eventId: event.eventId,
        error: errorMessage,
      });
      throw error;
    }
  }

  /**
   * 处理所有用户事件
   * @description 根据事件类型分发到相应的处理方法
   * @param {DomainEvent} event 领域事件
   */
  async handleEvent(event: DomainEvent): Promise<void> {
    try {
      switch (event.eventType) {
        case 'UserCreated':
          await this.handleUserCreatedEvent(event);
          break;
        case 'UserUpdated':
          await this.handleUserUpdatedEvent(event);
          break;
        case 'UserStatusChanged':
          await this.handleUserStatusChangedEvent(event);
          break;
        case 'UserProfileCreated':
          await this.handleUserProfileCreatedEvent(event);
          break;
        case 'UserProfileUpdated':
          await this.handleUserProfileUpdatedEvent(event);
          break;
        case 'UserRelationshipCreated':
          await this.handleUserRelationshipCreatedEvent(event);
          break;
        case 'UserRelationshipStatusChanged':
          await this.handleUserRelationshipStatusChangedEvent(event);
          break;
        case 'UserDeleted':
          await this.handleUserDeletedEvent(event);
          break;
        default:
          this.logger.warn('未知的事件类型', LogContext.EVENT, {
            eventType: event.eventType,
            eventId: event.eventId,
          });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error('事件处理失败', LogContext.EVENT, {
        eventId: event.eventId,
        eventType: event.eventType,
        error: errorMessage,
      });
      throw error;
    }
  }
}
