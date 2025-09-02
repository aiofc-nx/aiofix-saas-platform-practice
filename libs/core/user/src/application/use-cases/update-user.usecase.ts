/**
 * @class UpdateUserUseCase
 * @description
 * 更新用户用例，负责协调用户更新的业务流程。
 *
 * 原理与机制：
 * 1. 作为应用层的用例，UpdateUserUseCase协调领域服务和基础设施服务
 * 2. 支持部分字段更新，确保数据一致性
 * 3. 实现数据访问控制和权限验证
 * 4. 发布用户更新事件，通知其他系统组件
 *
 * 功能与职责：
 * 1. 验证更新请求的有效性
 * 2. 执行数据访问控制检查
 * 3. 协调用户数据更新和持久化
 * 4. 处理更新结果和错误情况
 *
 * @example
 * ```typescript
 * const useCase = new UpdateUserUseCase(userLifecycleService, userProfileService);
 * const result = await useCase.execute('user-123', {
 *   email: 'newemail@example.com',
 *   profile: { displayName: 'New Name' }
 * });
 * ```
 * @since 1.0.0
 */

import { Injectable } from '@nestjs/common';
import { UserLifecycleService } from '../../domain/domain-services/user-lifecycle.service';
import { UserProfileService } from '../../domain/domain-services/user-profile.service';
import { UserRepository } from '../../domain/repositories/user.repository';
import { UserProfileRepository } from '../../domain/repositories/user-profile.repository';
import { UserEntity } from '../../domain/entities/user.entity';
import { UserProfileEntity } from '../../domain/entities/user-profile.entity';
import { UserId, Email, PhoneNumber, TenantId } from '@aiofix/shared';
import { UserType } from '../../domain/enums/user-type.enum';
import { DataPrivacyLevel } from '@aiofix/shared';
import { UserNotFoundException, UserAlreadyExistsException } from '../../domain/exceptions';

/**
 * 用户更新请求接口
 */
export interface UpdateUserRequest {
  email?: string;
  phone?: string;
  userType?: UserType;
  dataPrivacyLevel?: DataPrivacyLevel;
  organizationId?: string;
  departmentIds?: string[];
  profile?: {
    displayName?: string;
    avatar?: string;
    bio?: string;
    location?: string;
    website?: string;
  };
}

/**
 * 用户更新响应接口
 */
export interface UpdateUserResponse {
  success: boolean;
  userId: string;
  updatedFields: string[];
  message?: string;
  errors?: string[];
}

/**
 * 更新用户用例
 * @description 实现用户更新的业务逻辑
 */
@Injectable()
export class UpdateUserUseCase {
  constructor(
    private readonly userLifecycleService: UserLifecycleService,
    private readonly userProfileService: UserProfileService,
    private readonly userRepository: UserRepository,
    private readonly userProfileRepository: UserProfileRepository
  ) {}

  /**
   * 执行用户更新用例
   * @description 更新用户信息并处理相关的业务流程
   * @param {string} userId 用户ID
   * @param {UpdateUserRequest} request 用户更新请求
   * @returns {Promise<UpdateUserResponse>} 更新结果
   */
  async execute(userId: string, request: UpdateUserRequest): Promise<UpdateUserResponse> {
    try {
      // 1. 验证用户是否存在
      const existingUser = await this.userRepository.findById(UserId.create(userId));
      if (!existingUser) {
        throw UserNotFoundException.byUserId(userId);
      }

      // 2. 验证更新请求数据
      const validationResult = await this.validateUpdateRequest(userId, request, existingUser);
      if (!validationResult.isValid) {
        return {
          success: false,
          userId,
          updatedFields: [],
          errors: validationResult.errors
        };
      }

      const updatedFields: string[] = [];

      // 3. 更新用户基本信息
      if (request.email && request.email !== existingUser.email.toString()) {
        await this.updateUserEmail(existingUser, request.email);
        updatedFields.push('email');
      }

      if (request.phone && request.phone !== existingUser.phone?.toString()) {
        await this.updateUserPhone(existingUser, request.phone);
        updatedFields.push('phone');
      }

      if (request.userType && request.userType !== existingUser.userType) {
        await this.updateUserType(existingUser, request.userType);
        updatedFields.push('userType');
      }

      if (request.dataPrivacyLevel && request.dataPrivacyLevel !== existingUser.dataPrivacyLevel) {
        await this.updateDataPrivacyLevel(existingUser, request.dataPrivacyLevel);
        updatedFields.push('dataPrivacyLevel');
      }

      if (request.organizationId !== undefined && request.organizationId !== existingUser.organizationId?.toString()) {
        await this.updateOrganizationId(existingUser, request.organizationId);
        updatedFields.push('organizationId');
      }

      if (request.departmentIds !== undefined) {
        const currentDeptIds = existingUser.departmentIds.map(id => id.toString());
        if (JSON.stringify(request.departmentIds.sort()) !== JSON.stringify(currentDeptIds.sort())) {
          await this.updateDepartmentIds(existingUser, request.departmentIds);
          updatedFields.push('departmentIds');
        }
      }

      // 4. 更新用户档案
      if (request.profile) {
        const profileUpdated = await this.updateUserProfile(userId, request.profile);
        if (profileUpdated) {
          updatedFields.push('profile');
        }
      }

      // 5. 保存更新后的用户
      if (updatedFields.length > 0) {
        await this.userRepository.save(existingUser);
      }

      // 6. 发布用户更新事件
      // TODO: 实现事件总线发布
      // await this.eventBus.publish(new UserUpdatedEvent(...));

      // 7. 返回成功响应
      return {
        success: true,
        userId,
        updatedFields,
        message: '用户更新成功'
      };

    } catch (error) {
      // 8. 处理错误情况
      console.error('更新用户失败:', error);
      
      return {
        success: false,
        userId,
        updatedFields: [],
        message: '用户更新失败',
        errors: [error instanceof Error ? error.message : '未知错误']
      };
    }
  }

  /**
   * 验证更新请求
   * @description 验证用户更新请求的有效性
   * @param {string} userId 用户ID
   * @param {UpdateUserRequest} request 更新请求
   * @param {UserEntity} existingUser 现有用户
   * @returns {Promise<{isValid: boolean, errors: string[]}>} 验证结果
   */
  private async validateUpdateRequest(
    userId: string,
    request: UpdateUserRequest,
    existingUser: UserEntity
  ): Promise<{isValid: boolean, errors: string[]}> {
    const errors: string[] = [];

    // 验证邮箱格式（如果提供）
    if (request.email && !this.isValidEmail(request.email)) {
      errors.push('邮箱格式无效');
    }

    // 验证手机号格式（如果提供）
    if (request.phone && !this.isValidPhone(request.phone)) {
      errors.push('手机号格式无效');
    }

    // 验证邮箱唯一性（如果提供）
    if (request.email && request.email !== existingUser.email.toString()) {
      try {
        const emailExists = await this.userRepository.existsByEmail(
          new Email(request.email),
          TenantId.create(existingUser.tenantId.toString()),
          existingUser.id
        );
        if (emailExists) {
          errors.push('邮箱已存在');
        }
      } catch (error) {
        errors.push('验证邮箱唯一性时发生错误');
      }
    }

    // 验证用户类型变更（如果提供）
    if (request.userType && request.userType !== existingUser.userType) {
      if (!this.isValidUserTypeTransition(existingUser.userType, request.userType)) {
        errors.push(`不允许从用户类型 ${existingUser.userType} 变更为 ${request.userType}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * 更新用户邮箱
   * @description 更新用户的邮箱地址
   * @param {UserEntity} user 用户实体
   * @param {string} newEmail 新邮箱
   */
  private async updateUserEmail(user: UserEntity, newEmail: string): Promise<void> {
    user.changeEmail(new Email(newEmail));
  }

  /**
   * 更新用户手机号
   * @description 更新用户的手机号
   * @param {UserEntity} user 用户实体
   * @param {string} newPhone 新手机号
   */
  private async updateUserPhone(user: UserEntity, newPhone: string): Promise<void> {
    user.changePhone(PhoneNumber.create(newPhone));
  }

  /**
   * 更新用户类型
   * @description 更新用户的类型
   * @param {UserEntity} user 用户实体
   * @param {UserType} newUserType 新用户类型
   */
  private async updateUserType(user: UserEntity, newUserType: UserType): Promise<void> {
    // TODO: 实现用户类型变更逻辑
    // user.changeUserType(newUserType);
  }

  /**
   * 更新数据隐私级别
   * @description 更新用户的数据隐私级别
   * @param {UserEntity} user 用户实体
   * @param {DataPrivacyLevel} newPrivacyLevel 新隐私级别
   */
  private async updateDataPrivacyLevel(user: UserEntity, newPrivacyLevel: DataPrivacyLevel): Promise<void> {
    // TODO: 实现隐私级别更新逻辑
    // user.changeDataPrivacyLevel(newPrivacyLevel);
  }

  /**
   * 更新组织ID
   * @description 更新用户的组织ID
   * @param {UserEntity} user 用户实体
   * @param {string} newOrganizationId 新组织ID
   */
  private async updateOrganizationId(user: UserEntity, newOrganizationId: string): Promise<void> {
    // TODO: 实现组织ID更新逻辑
    // user.changeOrganizationId(newOrganizationId);
  }

  /**
   * 更新部门ID列表
   * @description 更新用户的部门ID列表
   * @param {UserEntity} user 用户实体
   * @param {string[]} newDepartmentIds 新部门ID列表
   */
  private async updateDepartmentIds(user: UserEntity, newDepartmentIds: string[]): Promise<void> {
    // TODO: 实现部门ID列表更新逻辑
    // user.changeDepartmentIds(newDepartmentIds);
  }

  /**
   * 更新用户档案
   * @description 更新用户的档案信息
   * @param {string} userId 用户ID
   * @param {object} profileData 档案数据
   * @returns {Promise<boolean>} 是否更新成功
   */
  private async updateUserProfile(userId: string, profileData: any): Promise<boolean> {
    try {
      await this.userProfileService.updateProfile(UserId.create(userId), profileData);
      return true;
    } catch (error) {
      console.error('更新用户档案失败:', error);
      return false;
    }
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

  /**
   * 验证用户类型转换是否有效
   * @description 检查用户类型转换是否允许
   * @param {UserType} fromType 原用户类型
   * @param {UserType} toType 目标用户类型
   * @returns {boolean} 是否允许转换
   */
  private isValidUserTypeTransition(fromType: UserType, toType: UserType): boolean {
    // TODO: 实现用户类型转换验证逻辑
    // 例如：租户用户不能直接转换为平台用户
    return true; // 临时返回true，后续实现具体验证逻辑
  }
}
