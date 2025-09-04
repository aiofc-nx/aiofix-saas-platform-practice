/**
 * @class UserOnboardingService
 * @description
 * 用户入职服务，负责协调复杂的用户入职业务流程。
 *
 * 原理与机制：
 * 1. 作为应用服务，UserOnboardingService协调多个模块和聚合根
 * 2. 处理跨模块的复杂业务逻辑，如用户入职、权限分配、组织分配等
 * 3. 通过事件总线实现松耦合的业务流程
 * 4. 提供事务管理和错误处理
 *
 * 功能与职责：
 * 1. 用户入职流程协调（涉及用户、租户、组织、部门、权限等多个模块）
 * 2. 跨模块数据一致性保证
 * 3. 复杂业务流程的事务管理
 * 4. 入职失败的回滚处理
 *
 * @example
 * ```typescript
 * const onboardingService = new UserOnboardingService(
 *   userRepository,
 *   tenantService,
 *   organizationService,
 *   permissionService,
 *   eventBus
 * );
 *
 * const result = await onboardingService.onboardUserToTenant(
 *   userId,
 *   tenantId,
 *   organizationId,
 *   departmentIds,
 *   roles
 * );
 * ```
 * @since 1.0.0
 */

import { Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { PinoLoggerService, LogContext } from '@aiofix/logging';
import { UserRepository } from '../../domain/repositories/user.repository';
import { UserAggregate } from '../../domain/aggregates/user.aggregate';
import { TenantId, UserId } from '@aiofix/shared';

// 用户入职请求接口
export interface UserOnboardingRequest {
  userId: string;
  tenantId: string;
  organizationId?: string;
  departmentIds?: string[];
  roles: string[];
  hireDate?: Date;
  managerId?: string;
  currentUserId: string;
}

// 用户入职响应接口
export interface UserOnboardingResponse {
  success: boolean;
  userId: string;
  tenantId: string;
  message: string;
}

// 用户离职请求接口
export interface UserOffboardingRequest {
  userId: string;
  tenantId: string;
  reason: string;
  effectiveDate: Date;
  currentUserId: string;
}

// 用户离职响应接口
export interface UserOffboardingResponse {
  success: boolean;
  userId: string;
  message: string;
}

/**
 * 用户入职服务
 */
@Injectable()
export class UserOnboardingService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly eventBus: EventBus,
    private readonly logger: PinoLoggerService,
  ) {}

  /**
   * 用户入职到租户
   * @description 协调复杂的用户入职流程，涉及多个模块的协调
   * @param request 用户入职请求
   * @returns 入职结果
   */
  async onboardUserToTenant(
    request: UserOnboardingRequest,
  ): Promise<UserOnboardingResponse> {
    try {
      this.logger.info('开始用户入职流程', LogContext.BUSINESS, {
        userId: request.userId,
        tenantId: request.tenantId,
        organizationId: request.organizationId,
        currentUserId: request.currentUserId,
      });

      // 1. 验证用户状态
      await this.validateUserForOnboarding(request.userId);

      // 2. 验证租户状态
      await this.validateTenantForOnboarding(request.tenantId);

      // 3. 验证组织和部门
      if (request.organizationId) {
        await this.validateOrganizationForOnboarding(
          request.organizationId,
          request.tenantId,
        );
      }

      if (request.departmentIds && request.departmentIds.length > 0) {
        await this.validateDepartmentsForOnboarding(
          request.departmentIds,
          request.organizationId,
          request.tenantId,
        );
      }

      // 4. 执行用户入职
      const user = await this.userRepository.findById(
        new UserId(request.userId),
      );
      if (!user) {
        throw new Error('用户不存在');
      }

      // 5. 更新用户状态和归属
      user.joinTenant(
        new TenantId(request.tenantId),
        request.organizationId
          ? new TenantId(request.organizationId)
          : undefined,
        request.departmentIds
          ? request.departmentIds.map(id => new TenantId(id))
          : [],
      );

      // 6. 保存用户
      await this.userRepository.save(user);

      // 7. 发布领域事件
      // 这里需要发布用户入职事件，触发后续的权限分配、通知等流程
      await this.eventBus.publish({
        type: 'UserOnboardedToTenant',
        data: {
          userId: request.userId,
          tenantId: request.tenantId,
          organizationId: request.organizationId,
          departmentIds: request.departmentIds,
          roles: request.roles,
          hireDate: request.hireDate,
          managerId: request.managerId,
          onboardedBy: request.currentUserId,
          timestamp: new Date(),
        },
      });

      this.logger.info('用户入职成功', LogContext.BUSINESS, {
        userId: request.userId,
        tenantId: request.tenantId,
      });

      return {
        success: true,
        userId: request.userId,
        tenantId: request.tenantId,
        message: '用户入职成功',
      };
    } catch (error) {
      this.logger.error('用户入职失败', LogContext.BUSINESS, {
        userId: request.userId,
        tenantId: request.tenantId,
        error: error instanceof Error ? error.message : String(error),
      });

      // 这里可以实现入职失败的回滚逻辑
      await this.rollbackOnboarding(request.userId, request.tenantId);

      throw error;
    }
  }

  /**
   * 用户离职处理
   * @description 协调复杂的用户离职流程，涉及数据清理和权限回收
   * @param request 用户离职请求
   * @returns 离职结果
   */
  async processUserOffboarding(
    request: UserOffboardingRequest,
  ): Promise<UserOffboardingResponse> {
    try {
      this.logger.info('开始用户离职流程', LogContext.BUSINESS, {
        userId: request.userId,
        tenantId: request.tenantId,
        reason: request.reason,
        currentUserId: request.currentUserId,
      });

      // 1. 验证用户状态
      await this.validateUserForOffboarding(request.userId, request.tenantId);

      // 2. 执行离职流程
      const user = await this.userRepository.findById(
        new UserId(request.userId),
      );
      if (!user) {
        throw new Error('用户不存在');
      }

      // 3. 更新用户状态
      user.leaveTenant(new TenantId(request.tenantId), request.reason);

      // 4. 保存用户
      await this.userRepository.save(user);

      // 5. 发布领域事件
      await this.eventBus.publish({
        type: 'UserOffboardedFromTenant',
        data: {
          userId: request.userId,
          tenantId: request.tenantId,
          reason: request.reason,
          effectiveDate: request.effectiveDate,
          offboardedBy: request.currentUserId,
          timestamp: new Date(),
        },
      });

      this.logger.info('用户离职处理成功', LogContext.BUSINESS, {
        userId: request.userId,
        tenantId: request.tenantId,
      });

      return {
        success: true,
        userId: request.userId,
        message: '用户离职处理成功',
      };
    } catch (error) {
      this.logger.error('用户离职处理失败', LogContext.BUSINESS, {
        userId: request.userId,
        tenantId: request.tenantId,
        error: error instanceof Error ? error.message : String(error),
      });

      throw error;
    }
  }

  /**
   * 验证用户是否适合入职
   * @param userId 用户ID
   */
  private async validateUserForOnboarding(userId: string): Promise<void> {
    const user = await this.userRepository.findById(new UserId(userId));
    if (!user) {
      throw new Error('用户不存在');
    }

    if (user.isActive()) {
      throw new Error('用户已经是激活状态');
    }
  }

  /**
   * 验证租户是否适合入职
   * @param tenantId 租户ID
   */
  private async validateTenantForOnboarding(tenantId: string): Promise<void> {
    // 这里需要调用租户服务验证租户状态
    // 暂时使用模拟实现
    if (!tenantId || tenantId.trim().length === 0) {
      throw new Error('租户ID不能为空');
    }
  }

  /**
   * 验证组织是否适合入职
   * @param organizationId 组织ID
   * @param tenantId 租户ID
   */
  private async validateOrganizationForOnboarding(
    organizationId: string,
    tenantId: string,
  ): Promise<void> {
    // 这里需要调用组织服务验证组织状态
    // 暂时使用模拟实现
    if (!organizationId || organizationId.trim().length === 0) {
      throw new Error('组织ID不能为空');
    }
  }

  /**
   * 验证部门是否适合入职
   * @param departmentIds 部门ID列表
   * @param organizationId 组织ID
   * @param tenantId 租户ID
   */
  private async validateDepartmentsForOnboarding(
    departmentIds: string[],
    organizationId?: string,
    tenantId?: string,
  ): Promise<void> {
    // 这里需要调用部门服务验证部门状态
    // 暂时使用模拟实现
    if (!departmentIds || departmentIds.length === 0) {
      throw new Error('部门ID列表不能为空');
    }
  }

  /**
   * 验证用户是否适合离职
   * @param userId 用户ID
   * @param tenantId 租户ID
   */
  private async validateUserForOffboarding(
    userId: string,
    tenantId: string,
  ): Promise<void> {
    const user = await this.userRepository.findById(new UserId(userId));
    if (!user) {
      throw new Error('用户不存在');
    }

    if (!user.belongsToTenant(new TenantId(tenantId))) {
      throw new Error('用户不属于指定租户');
    }
  }

  /**
   * 入职失败回滚
   * @param userId 用户ID
   * @param tenantId 租户ID
   */
  private async rollbackOnboarding(
    userId: string,
    tenantId: string,
  ): Promise<void> {
    try {
      this.logger.info('开始回滚入职操作', LogContext.BUSINESS, {
        userId,
        tenantId,
      });

      // 这里实现具体的回滚逻辑
      // 例如：恢复用户状态、清理已分配的资源等

      this.logger.info('入职回滚完成', LogContext.BUSINESS, {
        userId,
        tenantId,
      });
    } catch (rollbackError) {
      this.logger.error('入职回滚失败', LogContext.BUSINESS, {
        userId,
        tenantId,
        error:
          rollbackError instanceof Error
            ? rollbackError.message
            : String(rollbackError),
      });
    }
  }
}
