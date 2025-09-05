/**
 * @class DepartmentManagementService
 * @description
 * 部门管理应用服务，作为应用层的简单协调入口点。
 *
 * 原理与机制：
 * 1. 作为应用层的协调服务，DepartmentManagementService只负责简单的业务协调
 * 2. 复杂的业务逻辑交给专门的业务服务处理
 * 3. 遵循"一般的业务逻辑直接在use-case实现，复杂业务逻辑才需要应用服务"的原则
 * 4. 通过依赖注入使用专门的业务服务
 *
 * 功能与职责：
 * 1. 简单的部门操作协调（创建、更新、查询、删除等）
 * 2. 调用相应的Use Case处理具体业务逻辑
 * 3. 提供统一的错误处理和日志记录
 * 4. 不处理复杂的跨模块业务逻辑
 *
 * @example
 * ```typescript
 * const departmentService = new DepartmentManagementService(
 *   createDepartmentUseCase,
 *   updateDepartmentUseCase,
 *   getDepartmentUseCase,
 *   deleteDepartmentUseCase,
 *   eventBus
 * );
 *
 * // 简单操作 - 直接调用Use Case
 * const department = await departmentService.createDepartment(createRequest);
 * ```
 * @since 1.0.0
 */

import { Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { CreateDepartmentUseCase } from '../use-cases/create-department.usecase';
import { UpdateDepartmentUseCase } from '../use-cases/update-department.usecase';
import { GetDepartmentUseCase } from '../use-cases/get-department.usecase';
import { DeleteDepartmentUseCase } from '../use-cases/delete-department.usecase';
import {
  IDepartmentManagementService,
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
  GetDepartmentRequest,
  GetDepartmentsRequest,
  DeleteDepartmentRequest,
  BaseResponse,
} from '../interfaces/department-management.interface';
import { CreateDepartmentResponse, UpdateDepartmentResponse } from '../dtos';
import { PinoLoggerService, LogContext } from '@aiofix/logging';

/**
 * 部门管理应用服务
 * @description 只负责简单的业务协调，复杂业务逻辑交给专门的业务服务
 */
@Injectable()
export class DepartmentManagementService
  implements IDepartmentManagementService
{
  private readonly logger: PinoLoggerService;

  constructor(
    private readonly createDepartmentUseCase: CreateDepartmentUseCase,
    private readonly updateDepartmentUseCase: UpdateDepartmentUseCase,
    private readonly getDepartmentUseCase: GetDepartmentUseCase,
    private readonly deleteDepartmentUseCase: DeleteDepartmentUseCase,
    private readonly eventBus: EventBus,
    logger: PinoLoggerService,
  ) {
    this.logger = logger;
  }

  /**
   * 创建部门
   * @description 简单的部门创建操作，直接调用Use Case
   * @param request 创建部门请求
   * @returns 创建结果
   */
  async createDepartment(
    request: CreateDepartmentRequest,
  ): Promise<CreateDepartmentResponse> {
    try {
      this.logger.info(
        `Creating department with name: ${request.name}`,
        LogContext.BUSINESS,
      );

      // 直接调用Use Case处理业务逻辑
      const result = await this.createDepartmentUseCase.execute(request);

      if (result.success) {
        this.logger.info(
          `Department created successfully with ID: ${result.departmentId}`,
          LogContext.BUSINESS,
        );
      }

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to create department: ${errorMessage}`,
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
   * 更新部门
   * @description 简单的部门更新操作，直接调用Use Case
   * @param departmentId 部门ID
   * @param request 更新请求
   * @returns 更新结果
   */
  async updateDepartment(
    departmentId: string,
    request: UpdateDepartmentRequest,
  ): Promise<UpdateDepartmentResponse> {
    try {
      this.logger.info(
        `Updating department with ID: ${departmentId}`,
        LogContext.BUSINESS,
      );

      // 直接调用Use Case处理业务逻辑
      const result = await this.updateDepartmentUseCase.execute(
        departmentId,
        request,
      );

      if (result.success) {
        this.logger.info(
          `Department updated successfully: ${departmentId}`,
          LogContext.BUSINESS,
        );
      }

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to update department ${departmentId}: ${errorMessage}`,
        LogContext.BUSINESS,
        {
          departmentId,
          error: errorMessage,
        },
      );
      throw error;
    }
  }

  /**
   * 获取部门
   * @description 简单的部门查询操作，直接调用Use Case
   * @param request 获取部门请求
   * @returns 部门信息
   */
  async getDepartment(request: GetDepartmentRequest): Promise<BaseResponse> {
    try {
      this.logger.info('开始获取部门', LogContext.BUSINESS, {
        departmentId: request.departmentId,
        currentUserId: request.currentUserId,
      });

      // 直接调用Use Case处理业务逻辑
      const result: BaseResponse =
        await this.getDepartmentUseCase.getDepartmentById(request);

      if (result.success) {
        this.logger.info('部门获取成功', LogContext.BUSINESS, {
          departmentId: request.departmentId,
        });
      }

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error('部门获取失败', LogContext.BUSINESS, {
        departmentId: request.departmentId,
        error: errorMessage,
      });
      throw error;
    }
  }

  /**
   * 获取部门列表
   * @description 简单的部门列表查询操作，直接调用Use Case
   * @param request 获取部门列表请求
   * @returns 部门列表
   */
  async getDepartments(request: GetDepartmentsRequest): Promise<BaseResponse> {
    try {
      this.logger.info('开始获取部门列表', LogContext.BUSINESS, {
        tenantId: request.tenantId,
        organizationId: request.organizationId,
        currentUserId: request.currentUserId,
      });

      // 直接调用Use Case处理业务逻辑
      const result: BaseResponse =
        await this.getDepartmentUseCase.getDepartmentsByCriteria(request);

      if (result.success) {
        this.logger.info('部门列表获取成功', LogContext.BUSINESS, {
          tenantId: request.tenantId,
          organizationId: request.organizationId,
        });
      }

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error('部门列表获取失败', LogContext.BUSINESS, {
        tenantId: request.tenantId,
        organizationId: request.organizationId,
        error: errorMessage,
      });
      throw error;
    }
  }

  /**
   * 删除部门
   * @description 简单的部门删除操作，直接调用Use Case
   * @param request 删除部门请求
   * @returns 删除结果
   */
  async deleteDepartment(
    request: DeleteDepartmentRequest,
  ): Promise<BaseResponse> {
    try {
      this.logger.info(
        `Deleting department: ${request.departmentId}`,
        LogContext.BUSINESS,
      );

      // 直接调用Use Case处理业务逻辑
      const result: BaseResponse =
        await this.deleteDepartmentUseCase.execute(request);

      if (result.success) {
        this.logger.info(
          `Department deleted successfully: ${request.departmentId}`,
          LogContext.BUSINESS,
        );
      }

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to delete department ${request.departmentId}: ${errorMessage}`,
        LogContext.BUSINESS,
        {
          departmentId: request.departmentId,
          error: errorMessage,
        },
      );
      throw error;
    }
  }
}
