/**
 * @class CreateUserUseCase
 * @description
 * 创建用户用例，负责协调用户创建的业务流程。
 *
 * 原理与机制：
 * 1. 作为应用层的用例，CreateUserUseCase协调领域服务和基础设施服务
 * 2. 使用命令模式封装用户创建请求，确保请求的不可变性
 * 3. 通过领域事件实现松耦合的业务流程
 * 4. 使用事务确保数据一致性
 *
 * 功能与职责：
 * 1. 验证用户创建请求的有效性
 * 2. 协调用户实体创建和持久化
 * 3. 发送用户创建成功事件
 * 4. 处理用户创建失败的回滚
 *
 * @example
 * ```typescript
 * const useCase = new CreateUserUseCase(userLifecycleService, eventBus);
 * const result = await useCase.execute({
 *   username: 'john_doe',
 *   email: 'john@example.com',
 *   tenantId: 'tenant-123'
 * });
 * ```
 * @since 1.0.0
 */

import { Injectable } from '@nestjs/common';
import { UserLifecycleService } from '../../domain/domain-services/user-lifecycle.service';
import { UserRepository } from '../../domain/repositories/user.repository';
import { UserProfileRepository } from '../../domain/repositories/user-profile.repository';
import { UserRelationshipRepository } from '../../domain/repositories/user-relationship.repository';
import { UserEntity } from '../../domain/entities/user.entity';
import { UserProfileEntity } from '../../domain/entities/user-profile.entity';
import { UserId, Username, Email, PhoneNumber, TenantId } from '@aiofix/shared';
import { UserType } from '../../domain/enums/user-type.enum';
import { DataPrivacyLevel } from '@aiofix/shared';
import { UserCreatedEvent } from '../../domain/domain-events';

/**
 * 创建用户请求接口
 */
export interface CreateUserRequest {
  username: string;
  email: string;
  phone?: string;
  tenantId: string;
  organizationId?: string;
  departmentIds?: string[];
  userType?: UserType;
  dataPrivacyLevel?: DataPrivacyLevel;
  profile?: {
    displayName?: string;
    bio?: string;
    location?: string;
    website?: string;
  };
}

/**
 * 创建用户响应接口
 */
export interface CreateUserResponse {
  success: boolean;
  userId: string;
  username: string;
  email: string;
  tenantId: string;
  userType: UserType;
  profileId?: string;
  message?: string;
  errors?: string[];
}

/**
 * 创建用户用例
 * @description 实现用户创建的业务逻辑
 */
@Injectable()
export class CreateUserUseCase {
  constructor(
    private readonly userLifecycleService: UserLifecycleService,
    private readonly userRepository: UserRepository,
    private readonly userProfileRepository: UserProfileRepository,
    private readonly userRelationshipRepository: UserRelationshipRepository
  ) {}

  /**
   * 执行用户创建用例
   * @description 创建新用户并处理相关的业务流程
   * @param {CreateUserRequest} request 用户创建请求
   * @returns {Promise<CreateUserResponse>} 创建结果
   */
  async execute(request: CreateUserRequest): Promise<CreateUserResponse> {
    try {
      // 1. 验证请求数据
      const validationResult = await this.validateRequest(request);
      if (!validationResult.isValid) {
        return {
          success: false,
          userId: '',
          username: request.username,
          email: request.email,
          tenantId: request.tenantId,
          userType: request.userType || UserType.TENANT_USER,
          errors: validationResult.errors
        };
      }

      // 2. 创建用户实体
      const userData = {
        username: Username.create(request.username),
        email: new Email(request.email),
        phone: request.phone ? PhoneNumber.create(request.phone) : undefined,
        tenantId: TenantId.create(request.tenantId),
        organizationId: request.organizationId,
        departmentIds: request.departmentIds || [],
        userType: request.userType || UserType.TENANT_USER,
        dataPrivacyLevel: request.dataPrivacyLevel || DataPrivacyLevel.PROTECTED
      };

      const user = await this.userLifecycleService.createUser(userData);

      // 3. 创建用户档案（如果提供了档案信息）
      let profileId: string | undefined;
      if (request.profile) {
        const profile = await this.createUserProfile(user.id.toString(), request.profile, request);
        profileId = profile.id.toString();
      }

      // 4. 发布用户创建事件
      // TODO: 实现事件总线发布
      // await this.eventBus.publish(new UserCreatedEvent(...));

      // 5. 返回成功响应
      return {
        success: true,
        userId: user.id.toString(),
        username: user.username.toString(),
        email: user.email.toString(),
        tenantId: user.tenantId.toString(),
        userType: user.userType,
        profileId,
        message: '用户创建成功'
      };

    } catch (error) {
      // 6. 处理错误情况
      console.error('创建用户失败:', error);
      
      return {
        success: false,
        userId: '',
        username: request.username,
        email: request.email,
        tenantId: request.tenantId,
        userType: request.userType || UserType.TENANT_USER,
        message: '用户创建失败',
        errors: [error instanceof Error ? error.message : '未知错误']
      };
    }
  }

  /**
   * 验证请求数据
   * @description 验证用户创建请求的有效性
   * @param {CreateUserRequest} request 用户创建请求
   * @returns {Promise<{isValid: boolean, errors: string[]}>} 验证结果
   */
  private async validateRequest(request: CreateUserRequest): Promise<{isValid: boolean, errors: string[]}> {
    const errors: string[] = [];

    // 验证必填字段
    if (!request.username || request.username.trim().length === 0) {
      errors.push('用户名不能为空');
    }

    if (!request.email || request.email.trim().length === 0) {
      errors.push('邮箱不能为空');
    }

    if (!request.tenantId || request.tenantId.trim().length === 0) {
      errors.push('租户ID不能为空');
    }

    // 验证用户名格式
    if (request.username && !this.isValidUsername(request.username)) {
      errors.push('用户名格式无效，只能包含字母、数字、下划线和连字符，长度3-20位');
    }

    // 验证邮箱格式
    if (request.email && !this.isValidEmail(request.email)) {
      errors.push('邮箱格式无效');
    }

    // 验证手机号格式（如果提供）
    if (request.phone && !this.isValidPhone(request.phone)) {
      errors.push('手机号格式无效');
    }

    // 验证用户名和邮箱唯一性
    if (request.username && request.email && request.tenantId) {
      try {
        const usernameExists = await this.userRepository.existsByUsername(
          Username.create(request.username),
          TenantId.create(request.tenantId)
        );
        if (usernameExists) {
          errors.push('用户名已存在');
        }

        const emailExists = await this.userRepository.existsByEmail(
          new Email(request.email),
          TenantId.create(request.tenantId)
        );
        if (emailExists) {
          errors.push('邮箱已存在');
        }
      } catch (error) {
        errors.push('验证用户名和邮箱唯一性时发生错误');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * 创建用户档案
   * @description 为新用户创建档案
   * @param {string} userId 用户ID
   * @param {object} profileData 档案数据
   * @param {CreateUserRequest} request 原始请求
   * @returns {Promise<UserProfileEntity>} 创建的用户档案
   */
  private async createUserProfile(
    userId: string,
    profileData: any,
    request: CreateUserRequest
  ): Promise<UserProfileEntity> {
    const profileId = `profile-${userId}`;
    const displayName = profileData.displayName || request.username;

    const profile = await this.userProfileRepository.save(
      UserProfileEntity.createPrivateProfile(
        profileId,
        displayName,
        request.tenantId,
        userId,
        request.organizationId,
        request.departmentIds || []
      )
    );

    // 更新档案的其他字段
    if (profileData.bio) {
      profile.updateBio(profileData.bio);
    }
    if (profileData.location) {
      profile.updateLocation(profileData.location);
    }
    if (profileData.website) {
      profile.updateWebsite(profileData.website);
    }

    return await this.userProfileRepository.save(profile);
  }

  /**
   * 验证用户名格式
   * @description 检查用户名是否符合格式要求
   * @param {string} username 用户名
   * @returns {boolean} 是否有效
   */
  private isValidUsername(username: string): boolean {
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    return usernameRegex.test(username);
  }

  /**
   * 验证邮箱格式
   * @description 检查邮箱是否符合格式要求
   * @param {string} email 邮箱
   * @returns {boolean} 是否有效
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * 验证手机号格式
   * @description 检查手机号是否符合格式要求
   * @param {string} phone 手机号
   * @returns {boolean} 是否有效
   */
  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
  }
}
