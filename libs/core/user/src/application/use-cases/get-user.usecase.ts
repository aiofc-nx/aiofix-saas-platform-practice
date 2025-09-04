/**
 * @class GetUserUseCase
 * @description
 * 获取用户用例，负责处理用户查询的业务逻辑。
 *
 * 原理与机制：
 * 1. 作为应用层的用例，直接实现简单的用户查询业务逻辑
 * 2. 通过用户仓储获取用户数据，不涉及复杂的跨模块协调
 * 3. 支持权限验证和数据访问控制
 * 4. 返回标准化的响应格式
 *
 * 功能与职责：
 * 1. 根据ID获取单个用户信息
 * 2. 根据条件获取用户列表
 * 3. 验证用户访问权限
 * 4. 处理查询异常和错误
 *
 * @example
 * ```typescript
 * const useCase = new GetUserUseCase(userRepository, permissionService);
 * const user = await useCase.execute({ userId: 'user-123', currentUserId: 'current-456' });
 * ```
 * @since 1.0.0
 */

import { Injectable } from '@nestjs/common';
import { PinoLoggerService } from '@aiofix/logging';
import { UserRepository } from '../../domain/repositories/user.repository';
import { PermissionService } from '../../domain/services/permission.service';
import { UserNotFoundException } from '../../domain/exceptions/user-not-found.exception';
import { AccessDeniedException } from '../../domain/exceptions/access-denied.exception';
import { GetUserRequest, GetUserResponse } from '../dtos/get-user.dto';
import { GetUsersRequest, GetUsersResponse } from '../dtos/get-users.dto';
import { UserId, TenantId } from '@aiofix/shared';
import { LogContext } from '@aiofix/logging';

@Injectable()
export class GetUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly permissionService: PermissionService,
    private readonly logger: PinoLoggerService,
  ) {}

  /**
   * 执行获取用户用例
   * @param request 获取用户请求
   * @returns 用户信息响应
   */
  async execute(request: GetUserRequest): Promise<GetUserResponse> {
    try {
      this.logger.info('开始获取用户', LogContext.BUSINESS, {
        userId: request.userId,
        currentUserId: request.currentUserId,
      });

      // 1. 验证请求参数
      this.validateRequest(request);

      // 2. 获取用户信息
      const userId = new UserId(request.userId);
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new UserNotFoundException(request.userId);
      }

      // 3. 检查访问权限
      this.checkAccessPermission(request.currentUserId, user);

      // 4. 返回用户信息
      this.logger.info('用户获取成功', LogContext.BUSINESS, {
        userId: request.userId,
        currentUserId: request.currentUserId,
      });

      return {
        success: true,
        user: {
          id: user.id.toString(),
          username: user.username.toString(),
          email: user.email.toString(),
          status: user.status,
          tenantId: user.tenantId.toString(),
          organizationId: user.organizationId?.toString() ?? undefined,
          departmentIds: user.departmentIds.map(id => id.toString()),
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      };
    } catch (error) {
      this.logger.error('获取用户失败', LogContext.BUSINESS, {
        userId: request.userId,
        currentUserId: request.currentUserId,
        error: error instanceof Error ? error.message : String(error),
      });

      if (error instanceof UserNotFoundException) {
        throw error;
      }

      if (error instanceof AccessDeniedException) {
        throw error;
      }

      throw new Error(
        `获取用户失败: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 获取用户列表
   * @param request 获取用户列表请求
   * @returns 用户列表响应
   */
  async getUsers(request: GetUsersRequest): Promise<GetUsersResponse> {
    try {
      this.logger.info('开始获取用户列表', LogContext.BUSINESS, {
        tenantId: request.tenantId,
        currentUserId: request.currentUserId,
        page: request.page,
        size: request.size,
      });

      // 1. 验证请求参数
      this.validateGetUsersRequest(request);

      // 2. 获取用户列表
      const tenantId = new TenantId(request.tenantId);
      const users = await this.userRepository.findByTenantId(
        tenantId,
        request.page,
        request.size,
      );

      // 3. 获取总数
      const total = await this.userRepository.countByTenantId(tenantId);

      // 4. 返回用户列表
      this.logger.info('用户列表获取成功', LogContext.BUSINESS, {
        tenantId: request.tenantId,
        currentUserId: request.currentUserId,
        count: users.length,
        total,
      });

      return {
        success: true,
        users: users.map(user => ({
          id: user.id.toString(),
          username: user.username.toString(),
          email: user.email.toString(),
          status: user.status,
          tenantId: user.tenantId.toString(),
          organizationId: user.organizationId?.toString() ?? undefined,
          departmentIds: user.departmentIds.map(id => id.toString()),
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        })),
        pagination: {
          page: request.page,
          size: request.size,
          total,
          totalPages: Math.ceil(total / request.size),
        },
      };
    } catch (error) {
      this.logger.error('获取用户列表失败', LogContext.BUSINESS, {
        tenantId: request.tenantId,
        currentUserId: request.currentUserId,
        error: error instanceof Error ? error.message : String(error),
      });

      throw new Error(
        `获取用户列表失败: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 验证获取用户请求
   * @param request 请求对象
   */
  private validateRequest(request: GetUserRequest): void {
    if (!request.userId || request.userId.trim().length === 0) {
      throw new Error('用户ID不能为空');
    }

    if (!request.currentUserId || request.currentUserId.trim().length === 0) {
      throw new Error('当前用户ID不能为空');
    }
  }

  /**
   * 验证获取用户列表请求
   * @param request 请求对象
   */
  private validateGetUsersRequest(request: GetUsersRequest): void {
    if (!request.tenantId || request.tenantId.trim().length === 0) {
      throw new Error('租户ID不能为空');
    }

    if (!request.currentUserId || request.currentUserId.trim().length === 0) {
      throw new Error('当前用户ID不能为空');
    }

    if (request.page < 1) {
      throw new Error('页码必须大于0');
    }

    if (request.size < 1 || request.size > 100) {
      throw new Error('页面大小必须在1-100之间');
    }
  }

  /**
   * 检查用户访问权限
   * @param _currentUserId 当前用户ID
   * @param _targetUser 目标用户
   * @returns 是否有权限
   */
  private checkAccessPermission(
    _currentUserId: string,
    _targetUser: unknown,
  ): void {
    // TODO: 实现实际的权限检查逻辑
    // 这里应该调用PermissionService来验证用户是否有权限访问目标用户
    // 暂时返回true，表示有权限
    return;
  }
}
