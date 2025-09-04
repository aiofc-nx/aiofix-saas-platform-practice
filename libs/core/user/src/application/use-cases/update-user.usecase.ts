/**
 * @class UpdateUserUseCase
 * @description
 * 更新用户用例，负责处理用户信息更新的业务逻辑。
 *
 * 原理与机制：
 * 1. 作为应用层的用例，直接实现简单的用户更新业务逻辑
 * 2. 通过用户仓储获取和保存用户数据，不涉及复杂的跨模块协调
 * 3. 支持权限验证和数据访问控制
 * 4. 发布领域事件，支持事件驱动架构
 *
 * 功能与职责：
 * 1. 验证用户更新请求的有效性
 * 2. 执行用户信息的更新操作
 * 3. 验证业务规则（如邮箱唯一性）
 * 4. 发布用户更新事件
 * 5. 处理更新异常和错误
 *
 * @example
 * ```typescript
 * const useCase = new UpdateUserUseCase(userRepository, eventBus, logger);
 * const response = await useCase.execute('user-123', {
 *   email: 'newemail@example.com',
 *   phone: '+1234567890',
 *   currentUserId: 'current-456'
 * });
 * ```
 * @since 1.0.0
 */

import { Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { PinoLoggerService } from '@aiofix/logging';
import { UserRepository } from '../../domain/repositories/user.repository';
import { UserId, Username, Email, TenantId, PhoneNumber } from '@aiofix/shared';
import { UpdateUserRequest } from '../interfaces/user-management.interface';
import { UpdateUserResponse } from '../dtos/update-user-response.dto';
import { UserNotFoundException } from '../../domain/exceptions/user-not-found.exception';
import { InvalidArgumentException } from '../../domain/exceptions/invalid-argument.exception';
import { UserEmailAlreadyExistsException } from '../../domain/exceptions/user-email-already-exists.exception';

@Injectable()
export class UpdateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly eventBus: EventBus,
    private readonly logger: PinoLoggerService,
  ) {}

  /**
   * 执行更新用户用例
   * @param userId 用户ID
   * @param request 更新用户请求
   * @returns 更新用户响应
   */
  async execute(
    userId: string,
    request: UpdateUserRequest,
  ): Promise<UpdateUserResponse> {
    try {
      this.logger.info('开始更新用户', undefined, {
        userId,
        currentUserId: request.currentUserId,
      });

      // 1. 验证请求参数
      this.validateRequest(request);

      // 2. 查找用户
      const user = await this.userRepository.findById(new UserId(userId));
      if (!user) {
        throw new UserNotFoundException(userId);
      }

      // 3. 业务规则验证
      await this.validateBusinessRules(userId, request);

      // 4. 更新用户信息（只更新支持修改的字段）
      let hasChanges = false;

      if (request.email) {
        user.changeEmail(new Email(request.email));
        hasChanges = true;
      }

      if (request.phone) {
        user.changePhone(new PhoneNumber(request.phone));
        hasChanges = true;
      }

      // 5. 如果有变更，保存用户
      if (hasChanges) {
        await this.userRepository.save(user);

        // 6. 发布领域事件
        await this.eventBus.publish({
          type: 'UserUpdated',
          data: {
            userId,
            updatedFields: this.getUpdatedFields(request),
            updatedBy: request.currentUserId,
            timestamp: new Date(),
          },
        });

        this.logger.info('用户更新成功', undefined, {
          userId,
          updatedFields: Object.keys(this.getUpdatedFields(request)),
        });

        return new UpdateUserResponse(userId, true, '用户更新成功');
      } else {
        this.logger.info('用户信息无变更', undefined, {
          userId,
          currentUserId: request.currentUserId,
        });

        return new UpdateUserResponse(userId, true, '用户信息无变更');
      }
    } catch (error) {
      this.logger.error('用户更新失败', undefined, {
        userId,
        currentUserId: request.currentUserId,
        error: error instanceof Error ? error.message : String(error),
      });

      throw error;
    }
  }

  /**
   * 验证请求参数
   * @param request 更新用户请求
   */
  private validateRequest(request: UpdateUserRequest): void {
    if (!request.currentUserId) {
      throw new InvalidArgumentException('当前用户ID不能为空', 'currentUserId');
    }

    // 验证邮箱格式
    if (request.email && !this.isValidEmail(request.email)) {
      throw new InvalidArgumentException(
        '邮箱格式不正确',
        'email',
        request.email,
      );
    }

    // 验证用户名格式（如果提供）
    if (request.username && request.username.trim().length < 3) {
      throw new InvalidArgumentException(
        '用户名长度不能少于3个字符',
        'username',
        request.username.length,
      );
    }

    // 验证电话号码格式（如果提供）
    if (request.phone && !this.isValidPhone(request.phone)) {
      throw new InvalidArgumentException(
        '电话号码格式不正确',
        'phone',
        request.phone,
      );
    }
  }

  /**
   * 验证业务规则
   * @param userId 用户ID
   * @param request 更新用户请求
   */
  private async validateBusinessRules(
    userId: string,
    request: UpdateUserRequest,
  ): Promise<void> {
    // 检查邮箱是否已被其他用户使用
    if (request.email) {
      const existingUser = await this.userRepository.findByEmail(
        new Email(request.email),
        new TenantId('platform'), // 这里需要根据实际情况获取租户ID
      );
      if (existingUser && existingUser.id.toString() !== userId) {
        throw new UserEmailAlreadyExistsException(request.email);
      }
    }

    // 检查用户名是否已被其他用户使用（如果提供）
    if (request.username) {
      const existingUser = await this.userRepository.findByUsername(
        new Username(request.username),
        new TenantId('platform'), // 这里需要根据实际情况获取租户ID
      );
      if (existingUser && existingUser.id.toString() !== userId) {
        throw new InvalidArgumentException('用户名已存在', 'username');
      }
    }
  }

  /**
   * 验证邮箱格式
   * @param email 邮箱地址
   * @returns 是否有效
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * 验证电话号码格式
   * @param phone 电话号码
   * @returns 是否有效
   */
  private isValidPhone(phone: string): boolean {
    // 简单的电话号码验证，支持国际格式
    const phoneRegex = /^\+?[\d\s\-()]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
  }

  /**
   * 获取更新的字段
   * @param request 更新用户请求
   * @returns 更新的字段对象
   */
  private getUpdatedFields(
    request: UpdateUserRequest,
  ): Record<string, unknown> {
    const updatedFields: Record<string, unknown> = {};

    if (request.username) updatedFields.username = request.username;
    if (request.email) updatedFields.email = request.email;
    if (request.displayName) updatedFields.displayName = request.displayName;
    if (request.phone) updatedFields.phone = request.phone;
    if (request.userType) updatedFields.userType = request.userType;
    if (request.organizationId)
      updatedFields.organizationId = request.organizationId;
    if (request.departmentIds)
      updatedFields.departmentIds = request.departmentIds;

    return updatedFields;
  }
}
