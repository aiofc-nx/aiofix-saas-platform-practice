/**
 * @class OrganizationManagementService
 * @description
 * 组织管理应用服务，作为应用层的简单协调入口点。
 *
 * 原理与机制：
 * 1. 作为应用层的协调服务，OrganizationManagementService只负责简单的业务协调
 * 2. 复杂的业务逻辑交给专门的业务服务处理
 * 3. 遵循"一般的业务逻辑直接在use-case实现，复杂业务逻辑才需要应用服务"的原则
 * 4. 通过依赖注入使用专门的业务服务
 *
 * 功能与职责：
 * 1. 简单的组织操作协调（创建、更新、查询、激活、暂停、停用等）
 * 2. 调用相应的Use Case处理具体业务逻辑
 * 3. 提供统一的错误处理和日志记录
 * 4. 不处理复杂的跨模块业务逻辑
 *
 * @example
 * ```typescript
 * const organizationService = new OrganizationManagementService(
 *   createOrganizationUseCase,
 *   updateOrganizationUseCase,
 *   getOrganizationUseCase,
 *   activateOrganizationUseCase,
 *   suspendOrganizationUseCase,
 *   deactivateOrganizationUseCase,
 *   eventBus
 * );
 *
 * // 简单操作 - 直接调用Use Case
 * const organization = await organizationService.createOrganization(createRequest);
 * ```
 * @since 1.0.0
 */

import { Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { CreateOrganizationUseCase } from '../use-cases/create-organization.usecase';
import { UpdateOrganizationUseCase } from '../use-cases/update-organization.usecase';
import { GetOrganizationUseCase } from '../use-cases/get-organization.usecase';
import { ActivateOrganizationUseCase } from '../use-cases/activate-organization.usecase';
import { SuspendOrganizationUseCase } from '../use-cases/suspend-organization.usecase';
import { DeactivateOrganizationUseCase } from '../use-cases/deactivate-organization.usecase';
import {
  IOrganizationManagementService,
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
  GetOrganizationRequest,
  ActivateOrganizationRequest,
  SuspendOrganizationRequest,
  DeactivateOrganizationRequest,
  BaseResponse,
} from '../interfaces/organization-management.interface';
import {
  CreateOrganizationResponse,
  UpdateOrganizationResponse,
} from '../dtos';
import { PinoLoggerService, LogContext } from '@aiofix/logging';

/**
 * 组织管理应用服务
 * @description 只负责简单的业务协调，复杂业务逻辑交给专门的业务服务
 */
@Injectable()
export class OrganizationManagementService
  implements IOrganizationManagementService
{
  private readonly logger: PinoLoggerService;

  constructor(
    private readonly createOrganizationUseCase: CreateOrganizationUseCase,
    private readonly updateOrganizationUseCase: UpdateOrganizationUseCase,
    private readonly getOrganizationUseCase: GetOrganizationUseCase,
    private readonly activateOrganizationUseCase: ActivateOrganizationUseCase,
    private readonly suspendOrganizationUseCase: SuspendOrganizationUseCase,
    private readonly deactivateOrganizationUseCase: DeactivateOrganizationUseCase,
    private readonly eventBus: EventBus,
    logger: PinoLoggerService,
  ) {
    this.logger = logger;
  }

  /**
   * 创建组织
   * @description 简单的组织创建操作，直接调用Use Case
   * @param request 创建组织请求
   * @returns 创建结果
   */
  async createOrganization(
    request: CreateOrganizationRequest,
  ): Promise<CreateOrganizationResponse> {
    try {
      this.logger.info(
        `Creating organization with name: ${request.name}`,
        LogContext.BUSINESS,
      );

      // 直接调用Use Case处理业务逻辑
      const result = await this.createOrganizationUseCase.execute(request);

      if (result.success) {
        this.logger.info(
          `Organization created successfully with ID: ${result.organizationId}`,
          LogContext.BUSINESS,
        );
      }

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to create organization: ${errorMessage}`,
        LogContext.BUSINESS,
        {
          name: request.name,
          code: request.code,
          error: errorMessage,
        },
      );
      throw error;
    }
  }

  /**
   * 更新组织
   * @description 简单的组织更新操作，直接调用Use Case
   * @param organizationId 组织ID
   * @param request 更新请求
   * @returns 更新结果
   */
  async updateOrganization(
    organizationId: string,
    request: UpdateOrganizationRequest,
  ): Promise<UpdateOrganizationResponse> {
    try {
      this.logger.info(
        `Updating organization with ID: ${organizationId}`,
        LogContext.BUSINESS,
      );

      // 直接调用Use Case处理业务逻辑
      const result = await this.updateOrganizationUseCase.execute(
        organizationId,
        request,
      );

      if (result.success) {
        this.logger.info(
          `Organization updated successfully: ${organizationId}`,
          LogContext.BUSINESS,
        );
      }

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to update organization ${organizationId}: ${errorMessage}`,
        LogContext.BUSINESS,
        {
          organizationId,
          error: errorMessage,
        },
      );
      throw error;
    }
  }

  /**
   * 获取组织
   * @description 简单的组织查询操作，直接调用Use Case
   * @param request 获取组织请求
   * @returns 组织信息
   */
  async getOrganization(
    request: GetOrganizationRequest,
  ): Promise<BaseResponse> {
    try {
      this.logger.info('开始获取组织', LogContext.BUSINESS, {
        organizationId: request.organizationId,
        currentUserId: request.currentUserId,
      });

      // 如果有具体的组织ID，获取单个组织
      if (request.organizationId) {
        const result: BaseResponse =
          await this.getOrganizationUseCase.getOrganizationById(
            request.organizationId,
          );
        return result;
      }

      // 否则根据条件获取组织列表
      const result: BaseResponse =
        await this.getOrganizationUseCase.getOrganizationsByCriteria(request);

      if (result.success) {
        this.logger.info('组织获取成功', LogContext.BUSINESS, {
          organizationId: request.organizationId,
        });
      }

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error('组织获取失败', LogContext.BUSINESS, {
        organizationId: request.organizationId,
        error: errorMessage,
      });
      throw error;
    }
  }

  /**
   * 激活组织
   * @description 简单的组织激活操作，直接调用Use Case
   * @param request 激活组织请求
   * @returns 激活结果
   */
  async activateOrganization(
    request: ActivateOrganizationRequest,
  ): Promise<BaseResponse> {
    try {
      this.logger.info(
        `Activating organization: ${request.organizationId}`,
        LogContext.BUSINESS,
      );

      // 直接调用Use Case处理业务逻辑
      const result: BaseResponse =
        await this.activateOrganizationUseCase.execute(request);

      if (result.success) {
        this.logger.info(
          `Organization activated successfully: ${request.organizationId}`,
          LogContext.BUSINESS,
        );
      }

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to activate organization ${request.organizationId}: ${errorMessage}`,
        LogContext.BUSINESS,
        {
          organizationId: request.organizationId,
          error: errorMessage,
        },
      );
      throw error;
    }
  }

  /**
   * 暂停组织
   * @description 简单的组织暂停操作，直接调用Use Case
   * @param request 暂停组织请求
   * @returns 暂停结果
   */
  async suspendOrganization(
    request: SuspendOrganizationRequest,
  ): Promise<BaseResponse> {
    try {
      this.logger.info(
        `Suspending organization: ${request.organizationId}`,
        LogContext.BUSINESS,
      );

      // 直接调用Use Case处理业务逻辑
      const result: BaseResponse =
        await this.suspendOrganizationUseCase.execute(request);

      if (result.success) {
        this.logger.info(
          `Organization suspended successfully: ${request.organizationId}`,
          LogContext.BUSINESS,
        );
      }

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to suspend organization ${request.organizationId}: ${errorMessage}`,
        LogContext.BUSINESS,
        {
          organizationId: request.organizationId,
          error: errorMessage,
        },
      );
      throw error;
    }
  }

  /**
   * 停用组织
   * @description 简单的组织停用操作，直接调用Use Case
   * @param request 停用组织请求
   * @returns 停用结果
   */
  async deactivateOrganization(
    request: DeactivateOrganizationRequest,
  ): Promise<BaseResponse> {
    try {
      this.logger.info(
        `Deactivating organization: ${request.organizationId}`,
        LogContext.BUSINESS,
      );

      // 直接调用Use Case处理业务逻辑
      const result: BaseResponse =
        await this.deactivateOrganizationUseCase.execute(request);

      if (result.success) {
        this.logger.info(
          `Organization deactivated successfully: ${request.organizationId}`,
          LogContext.BUSINESS,
        );
      }

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to deactivate organization ${request.organizationId}: ${errorMessage}`,
        LogContext.BUSINESS,
        {
          organizationId: request.organizationId,
          error: errorMessage,
        },
      );
      throw error;
    }
  }
}
