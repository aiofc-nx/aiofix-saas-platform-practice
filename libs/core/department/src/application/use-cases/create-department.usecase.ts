/**
 * @description 创建部门用例
 * @author 江郎
 * @since 1.0.0
 */

import { Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { PinoLoggerService, LogContext } from '@aiofix/logging';
import { DepartmentRepository } from '../../domain/repositories/department.repository';
import { DepartmentAggregate } from '../../domain/aggregates/department.aggregate';
import {
  DepartmentId,
  DepartmentName,
  DepartmentCode,
  TenantId,
  OrganizationId,
} from '@aiofix/shared';
import { CreateDepartmentRequest } from '../interfaces/department-management.interface';
import { CreateDepartmentResponse } from '../dtos/create-department-response.dto';
import { DepartmentType } from '../../domain/enums';
import { InvalidArgumentException } from '../../domain/exceptions/invalid-argument.exception';

@Injectable()
export class CreateDepartmentUseCase {
  constructor(
    private readonly departmentRepository: DepartmentRepository,
    private readonly eventBus: EventBus,
    private readonly logger: PinoLoggerService,
  ) {}

  /**
   * 执行创建部门用例
   * @param request 创建部门请求
   * @returns 创建部门响应
   */
  async execute(
    request: CreateDepartmentRequest,
  ): Promise<CreateDepartmentResponse> {
    try {
      this.logger.info('开始创建部门', LogContext.BUSINESS, {
        name: request.name,
        code: request.code,
        type: request.type,
        tenantId: request.tenantId,
        organizationId: request.organizationId,
        currentUserId: request.createdBy,
      });

      // 1. 验证请求参数
      this.validateRequest(request);

      // 2. 业务规则验证
      await this.validateBusinessRules(request);

      // 3. 创建部门聚合根
      const departmentId = new DepartmentId(request.id);
      const name = new DepartmentName(request.name);
      const code = new DepartmentCode(request.code);
      const tenantId = new TenantId(request.tenantId);
      const organizationId = new OrganizationId(request.organizationId);
      const type = request.type as DepartmentType;

      const departmentAggregate = DepartmentAggregate.create(
        departmentId,
        name,
        code,
        type,
        tenantId.toString(),
        organizationId.toString(),
        request.description,
        request.parentDepartmentId
          ? new DepartmentId(request.parentDepartmentId)
          : undefined,
        request.managerId,
        1, // level
        '', // path
        request.createdBy,
      );

      // 4. 保存部门实体
      await this.departmentRepository.save(departmentAggregate.department);

      // 5. 发布领域事件
      await this.eventBus.publishAll(departmentAggregate.uncommittedEvents);

      // 6. 清除已发布的事件
      departmentAggregate.clearEvents();

      this.logger.info('部门创建成功', LogContext.BUSINESS, {
        departmentId: departmentId.toString(),
        name: request.name,
        code: request.code,
        type: request.type,
        tenantId: request.tenantId,
        organizationId: request.organizationId,
      });

      return {
        success: true,
        departmentId: departmentId.toString(),
        message: '部门创建成功',
      };
    } catch (error) {
      this.logger.error('部门创建失败', LogContext.BUSINESS, {
        name: request.name,
        code: request.code,
        type: request.type,
        tenantId: request.tenantId,
        organizationId: request.organizationId,
        currentUserId: request.createdBy,
        error: error instanceof Error ? error.message : String(error),
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        message: '部门创建失败',
      };
    }
  }

  /**
   * 验证请求参数
   * @param request 创建部门请求
   */
  private validateRequest(request: CreateDepartmentRequest): void {
    if (!request.name || request.name.trim().length === 0) {
      throw new InvalidArgumentException('部门名称不能为空');
    }

    if (!request.code || request.code.trim().length === 0) {
      throw new InvalidArgumentException('部门代码不能为空');
    }

    if (!request.type || request.type.trim().length === 0) {
      throw new InvalidArgumentException('部门类型不能为空');
    }

    if (!request.tenantId || request.tenantId.trim().length === 0) {
      throw new InvalidArgumentException('租户ID不能为空');
    }

    if (!request.organizationId || request.organizationId.trim().length === 0) {
      throw new InvalidArgumentException('组织ID不能为空');
    }

    if (!request.createdBy || request.createdBy.trim().length === 0) {
      throw new InvalidArgumentException('创建者ID不能为空');
    }

    // 验证部门名称长度
    if (request.name.length > 100) {
      throw new InvalidArgumentException('部门名称长度不能超过100个字符');
    }

    // 验证部门代码长度
    if (request.code.length > 50) {
      throw new InvalidArgumentException('部门代码长度不能超过50个字符');
    }

    // 验证部门代码格式（只能包含字母、数字、下划线、连字符）
    if (!/^[a-zA-Z0-9_-]+$/.test(request.code)) {
      throw new InvalidArgumentException(
        '部门代码只能包含字母、数字、下划线和连字符',
      );
    }
  }

  /**
   * 验证业务规则
   * @param request 创建部门请求
   */
  private async validateBusinessRules(
    request: CreateDepartmentRequest,
  ): Promise<void> {
    // 检查部门名称是否已存在
    const existingByName = await this.departmentRepository.findByNameAndTenant(
      request.name,
      new TenantId(request.tenantId),
    );
    if (existingByName) {
      throw new InvalidArgumentException('部门名称已存在');
    }

    // 检查部门代码是否已存在
    const existingByCode = await this.departmentRepository.findByCodeAndTenant(
      request.code,
      new TenantId(request.tenantId),
    );
    if (existingByCode) {
      throw new InvalidArgumentException('部门代码已存在');
    }

    // 如果指定了父部门，检查父部门是否存在
    if (request.parentDepartmentId) {
      const parentDepartment = await this.departmentRepository.findById(
        new DepartmentId(request.parentDepartmentId),
      );
      if (!parentDepartment) {
        throw new InvalidArgumentException('父部门不存在');
      }

      // 检查父部门是否属于同一租户和组织
      if (parentDepartment.tenantId.toString() !== request.tenantId) {
        throw new InvalidArgumentException('父部门必须属于同一租户');
      }

      if (
        parentDepartment.organizationId?.toString() !== request.organizationId
      ) {
        throw new InvalidArgumentException('父部门必须属于同一组织');
      }
    }
  }
}
