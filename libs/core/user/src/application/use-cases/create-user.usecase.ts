/**
 * @description 创建用户用例
 * @author 江郎
 * @since 2.1.0
 */

import { Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { PinoLoggerService, LogContext } from '@aiofix/logging';
import { UserRepository } from '../../domain/repositories/user.repository';
import { UserAggregate } from '../../domain/aggregates/user.aggregate';
import { UserId, Username, Email, TenantId } from '@aiofix/shared';
import { CreateUserRequest } from '../interfaces/user-management.interface';
import { CreateUserResponse } from '../dtos/create-user-response.dto';
import { UserEmailAlreadyExistsException } from '../../domain/exceptions/user-email-already-exists.exception';
import { InvalidArgumentException } from '../../domain/exceptions/invalid-argument.exception';

@Injectable()
export class CreateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly eventBus: EventBus,
    private readonly logger: PinoLoggerService,
  ) {}

  /**
   * 执行创建用户用例
   * @param request 创建用户请求
   * @returns 创建用户响应
   */
  async execute(request: CreateUserRequest): Promise<CreateUserResponse> {
    try {
      this.logger.info('开始创建用户', LogContext.BUSINESS, {
        username: request.username,
        email: request.email,
        tenantId: request.tenantId,
        currentUserId: request.currentUserId,
      });

      // 1. 验证请求参数
      this.validateRequest(request);

      // 2. 业务规则验证
      await this.validateBusinessRules(request);

      // 3. 创建用户聚合根
      const userId = UserId.generate();
      const username = new Username(request.username);
      const email = new Email(request.email);
      const tenantId = request.tenantId
        ? new TenantId(request.tenantId)
        : undefined;

      const userAggregate = UserAggregate.create(
        userId,
        username,
        email,
        tenantId ?? new TenantId('platform'), // 如果没有租户ID，使用平台级
        request.organizationId
          ? new TenantId(request.organizationId)
          : undefined,
        request.departmentIds
          ? request.departmentIds.map(id => new TenantId(id))
          : [],
      );

      // 4. 保存用户实体
      await this.userRepository.save(userAggregate.user);

      // 5. 发布领域事件
      await this.eventBus.publishAll(userAggregate.uncommittedEvents);

      // 6. 清除已发布的事件
      userAggregate.clearEvents();

      this.logger.info('用户创建成功', LogContext.BUSINESS, {
        userId: userId.toString(),
        username: request.username,
        tenantId: request.tenantId,
      });

      return new CreateUserResponse(userId.toString(), true);
    } catch (error) {
      this.logger.error('用户创建失败', LogContext.BUSINESS, {
        username: request.username,
        email: request.email,
        tenantId: request.tenantId,
        currentUserId: request.currentUserId,
        error: error instanceof Error ? error.message : String(error),
      });

      throw error;
    }
  }

  /**
   * 验证请求参数
   * @param request 创建用户请求
   */
  private validateRequest(request: CreateUserRequest): void {
    if (!request.username || request.username.trim().length === 0) {
      throw new InvalidArgumentException('用户名不能为空', 'username');
    }

    if (!request.email || request.email.trim().length === 0) {
      throw new InvalidArgumentException('邮箱不能为空', 'email');
    }

    if (!request.password || request.password.length < 6) {
      throw new InvalidArgumentException(
        '密码长度不能少于6位',
        'password',
        request.password.length,
      );
    }

    if (!request.currentUserId) {
      throw new InvalidArgumentException('当前用户ID不能为空', 'currentUserId');
    }
  }

  /**
   * 验证业务规则
   * @param request 创建用户请求
   */
  private async validateBusinessRules(
    request: CreateUserRequest,
  ): Promise<void> {
    const tenantId = request.tenantId
      ? new TenantId(request.tenantId)
      : new TenantId('platform');
    const email = new Email(request.email);
    const username = new Username(request.username);

    // 检查邮箱是否已存在
    if (await this.userRepository.existsByEmail(email, tenantId)) {
      throw new UserEmailAlreadyExistsException(request.email);
    }

    // 检查用户名是否已存在
    if (await this.userRepository.existsByUsername(username, tenantId)) {
      throw new InvalidArgumentException('用户名已存在', 'username');
    }
  }
}
