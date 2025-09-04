/**
 * @class UserManagementService
 * @description
 * 用户管理应用服务，作为应用层的简单协调入口点。
 *
 * 原理与机制：
 * 1. 作为应用层的协调服务，UserManagementService只负责简单的业务协调
 * 2. 复杂的业务逻辑（如入职、离职）交给专门的业务服务处理
 * 3. 遵循"一般的业务逻辑直接在use-case实现，复杂业务逻辑才需要应用服务"的原则
 * 4. 通过依赖注入使用专门的业务服务
 *
 * 功能与职责：
 * 1. 简单的用户操作协调（创建、更新、查询等）
 * 2. 调用相应的Use Case处理具体业务逻辑
 * 3. 提供统一的错误处理和日志记录
 * 4. 不处理复杂的跨模块业务逻辑
 *
 * @example
 * ```typescript
 * const userService = new UserManagementService(
 *   createUserUseCase,
 *   updateUserUseCase,
 *   getUserUseCase,
 *   userOnboardingService,
 *   eventBus
 * );
 *
 * // 简单操作 - 直接调用Use Case
 * const user = await userService.createUser(createUserRequest);
 *
 * // 复杂操作 - 调用专门的业务服务
 * const result = await userService.onboardUserToTenant(onboardingRequest);
 * ```
 * @since 1.0.0
 */

import { Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { CreateUserUseCase } from '../use-cases/create-user.usecase';
import { UpdateUserUseCase } from '../use-cases/update-user.usecase';
import { GetUserUseCase } from '../use-cases/get-user.usecase';
import { UserOnboardingService } from './user-onboarding.service';
import {
  IUserManagementService,
  CreateUserRequest,
  CreateUserResponse,
  UpdateUserRequest,
  UpdateUserResponse,
  GetUserRequest,
  GetUserResponse,
} from '../interfaces/user-management.interface';
import { PinoLoggerService, LogContext } from '@aiofix/logging';

/**
 * 用户管理应用服务
 * @description 只负责简单的业务协调，复杂业务逻辑交给专门的业务服务
 */
@Injectable()
export class UserManagementService implements IUserManagementService {
  private readonly logger: PinoLoggerService;

  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly getUserUseCase: GetUserUseCase,
    private readonly userOnboardingService: UserOnboardingService,
    private readonly eventBus: EventBus,
    logger: PinoLoggerService,
  ) {
    this.logger = logger;
  }

  /**
   * 创建用户
   * @description 简单的用户创建操作，直接调用Use Case
   * @param request 创建用户请求
   * @returns 创建结果
   */
  async createUser(request: CreateUserRequest): Promise<CreateUserResponse> {
    try {
      this.logger.info(
        `Creating user with username: ${request.username}`,
        LogContext.BUSINESS,
      );

      // 直接调用Use Case处理业务逻辑
      const result = await this.createUserUseCase.execute(request);

      if (result.success) {
        this.logger.info(
          `User created successfully with ID: ${result.userId}`,
          LogContext.BUSINESS,
        );
      }

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to create user: ${errorMessage}`,
        LogContext.BUSINESS,
        {
          username: request.username,
          error: errorMessage,
        },
      );
      throw error;
    }
  }

  /**
   * 更新用户
   * @description 简单的用户更新操作，直接调用Use Case
   * @param userId 用户ID
   * @param request 更新用户请求
   * @returns 更新结果
   */
  async updateUser(
    userId: string,
    request: UpdateUserRequest,
  ): Promise<UpdateUserResponse> {
    try {
      this.logger.info(`Updating user with ID: ${userId}`, LogContext.BUSINESS);

      // 直接调用Use Case处理业务逻辑
      const result = await this.updateUserUseCase.execute(userId, request);

      if (result.success) {
        this.logger.info(
          `User updated successfully with ID: ${userId}`,
          LogContext.BUSINESS,
        );
      }

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to update user: ${errorMessage}`,
        LogContext.BUSINESS,
        {
          userId,
          error: errorMessage,
        },
      );
      throw error;
    }
  }

  /**
   * 获取用户
   * @description 简单的用户查询操作，直接调用Use Case
   * @param request 获取用户请求
   * @returns 用户信息
   */
  async getUser(request: GetUserRequest): Promise<GetUserResponse> {
    try {
      this.logger.info('开始获取用户', LogContext.BUSINESS, {
        userId: request.userId,
        currentUserId: request.currentUserId,
      });

      // 直接调用Use Case处理业务逻辑
      const result = await this.getUserUseCase.getUserById(
        request.userId || '',
      );

      if (result.success) {
        this.logger.info('用户获取成功', LogContext.BUSINESS, {
          userId: request.userId,
        });
      }

      return {
        success: result.success,
        user: result.data,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error('用户获取失败', LogContext.BUSINESS, {
        userId: request.userId,
        error: errorMessage,
      });
      throw error;
    }
  }

  /**
   * 用户入职到租户
   * @description 复杂的用户入职流程，交给专门的入职服务处理
   * @param request 用户入职请求
   * @returns 入职结果
   */
  async onboardUserToTenant(request: any): Promise<any> {
    try {
      this.logger.info('开始用户入职流程', LogContext.BUSINESS, {
        userId: request.userId,
        tenantId: request.tenantId,
        currentUserId: request.currentUserId,
      });

      // 调用专门的入职服务处理复杂业务逻辑
      const result =
        await this.userOnboardingService.onboardUserToTenant(request);

      this.logger.info('用户入职流程完成', LogContext.BUSINESS, {
        userId: request.userId,
        tenantId: request.tenantId,
        success: result.success,
      });

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error('用户入职流程失败', LogContext.BUSINESS, {
        userId: request.userId,
        tenantId: request.tenantId,
        error: errorMessage,
      });
      throw error;
    }
  }

  /**
   * 用户离职处理
   * @description 复杂的用户离职流程，交给专门的入职服务处理
   * @param request 用户离职请求
   * @returns 离职结果
   */
  async processUserOffboarding(request: any): Promise<any> {
    try {
      this.logger.info('开始用户离职流程', LogContext.BUSINESS, {
        userId: request.userId,
        tenantId: request.tenantId,
        currentUserId: request.currentUserId,
      });

      // 调用专门的入职服务处理复杂业务逻辑
      const result =
        await this.userOnboardingService.processUserOffboarding(request);

      this.logger.info('用户离职流程完成', LogContext.BUSINESS, {
        userId: request.userId,
        tenantId: request.tenantId,
        success: result.success,
      });

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error('用户离职流程失败', LogContext.BUSINESS, {
        userId: request.userId,
        tenantId: request.tenantId,
        error: errorMessage,
      });
      throw error;
    }
  }
}
