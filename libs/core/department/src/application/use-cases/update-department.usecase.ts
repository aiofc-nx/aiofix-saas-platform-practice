/**
 * @description 更新部门用例
 * @author 江郎
 * @since 1.0.0
 */

import { Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { PinoLoggerService, LogContext } from '@aiofix/logging';
import { DepartmentRepository } from '../../domain/repositories/department.repository';
import { DepartmentEntity } from '../../domain/entities/department.entity';
import { DepartmentAggregate } from '../../domain/aggregates/department.aggregate';
import { DepartmentId, DepartmentName, TenantId } from '@aiofix/shared';
import { UpdateDepartmentRequest } from '../interfaces/department-management.interface';
import { UpdateDepartmentResponse } from '../dtos/update-department-response.dto';
import { InvalidArgumentException } from '../../domain/exceptions/invalid-argument.exception';
import { DepartmentNotFoundException } from '../../domain/exceptions/department-not-found.exception';

@Injectable()
export class UpdateDepartmentUseCase {
  constructor(
    private readonly departmentRepository: DepartmentRepository,
    private readonly eventBus: EventBus,
    private readonly logger: PinoLoggerService,
  ) {}

  /**
   * 执行更新部门用例
   * @param departmentId 部门ID
   * @param request 更新部门请求
   * @returns 更新部门响应
   */
  async execute(
    departmentId: string,
    request: UpdateDepartmentRequest,
  ): Promise<UpdateDepartmentResponse> {
    try {
      this.logger.info('开始更新部门', LogContext.BUSINESS, {
        departmentId,
        currentUserId: request.currentUserId,
      });

      // 1. 验证请求参数
      this.validateRequest(departmentId, request);

      // 2. 查找部门
      const department = await this.departmentRepository.findById(
        new DepartmentId(departmentId),
      );
      if (!department) {
        throw new DepartmentNotFoundException(departmentId);
      }

      // 3. 业务规则验证
      await this.validateBusinessRules(departmentId, request, department);

      // 4. 创建部门聚合根（用于事件溯源）
      const departmentAggregate = new DepartmentAggregate(departmentId);
      departmentAggregate.loadFromHistory([department.id.toString()]);

      // 5. 更新部门信息
      if (request.name && request.name !== department.name.toString()) {
        departmentAggregate.updateInfo(
          new DepartmentName(request.name),
          department.description,
          department.managerId,
          request.currentUserId,
        );
      }

      if (
        request.description &&
        request.description !== department.description
      ) {
        departmentAggregate.updateInfo(
          department.name,
          request.description,
          department.managerId,
          request.currentUserId,
        );
      }

      if (request.managerId && request.managerId !== department.managerId) {
        departmentAggregate.updateInfo(
          department.name,
          department.description,
          request.managerId,
          request.currentUserId,
        );
      }

      // 6. 保存更新后的部门实体
      await this.departmentRepository.save(departmentAggregate.department);

      // 7. 发布领域事件
      await this.eventBus.publishAll(departmentAggregate.uncommittedEvents);

      // 8. 清除已发布的事件
      departmentAggregate.clearEvents();

      this.logger.info('部门更新成功', LogContext.BUSINESS, {
        departmentId,
        currentUserId: request.currentUserId,
      });

      return {
        success: true,
        message: '部门更新成功',
      };
    } catch (error) {
      this.logger.error('部门更新失败', LogContext.BUSINESS, {
        departmentId,
        currentUserId: request.currentUserId,
        error: error instanceof Error ? error.message : String(error),
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        message: '部门更新失败',
      };
    }
  }

  /**
   * 验证请求参数
   * @param departmentId 部门ID
   * @param request 更新部门请求
   */
  private validateRequest(
    departmentId: string,
    request: UpdateDepartmentRequest,
  ): void {
    if (!departmentId || departmentId.trim().length === 0) {
      throw new InvalidArgumentException('部门ID不能为空');
    }

    if (!request.currentUserId || request.currentUserId.trim().length === 0) {
      throw new InvalidArgumentException('当前用户ID不能为空');
    }

    // 验证部门名称长度
    if (request.name && request.name.length > 100) {
      throw new InvalidArgumentException('部门名称长度不能超过100个字符');
    }

    // 验证部门代码长度
    if (request.code && request.code.length > 50) {
      throw new InvalidArgumentException('部门代码长度不能超过50个字符');
    }

    // 验证部门代码格式
    if (request.code && !/^[a-zA-Z0-9_-]+$/.test(request.code)) {
      throw new InvalidArgumentException(
        '部门代码只能包含字母、数字、下划线和连字符',
      );
    }
  }

  /**
   * 验证业务规则
   * @param departmentId 部门ID
   * @param request 更新部门请求
   * @param currentDepartment 当前部门实体
   */
  private async validateBusinessRules(
    departmentId: string,
    request: UpdateDepartmentRequest,
    currentDepartment: DepartmentEntity,
  ): Promise<void> {
    // 如果更新部门名称，检查名称是否已存在
    if (request.name && request.name !== currentDepartment.name.toString()) {
      const existingByName =
        await this.departmentRepository.findByNameAndTenant(
          request.name,
          new TenantId(currentDepartment.tenantId.toString()),
        );
      if (existingByName && existingByName.id.toString() !== departmentId) {
        throw new InvalidArgumentException('部门名称已存在');
      }
    }

    // 如果更新部门代码，检查代码是否已存在
    if (request.code && request.code !== currentDepartment.code.toString()) {
      const existingByCode =
        await this.departmentRepository.findByCodeAndTenant(
          request.code,
          new TenantId(currentDepartment.tenantId.toString()),
        );
      if (existingByCode && existingByCode.id.toString() !== departmentId) {
        throw new InvalidArgumentException('部门代码已存在');
      }
    }

    // 如果指定了父部门，检查父部门是否存在且不形成循环
    if (request.parentDepartmentId) {
      if (request.parentDepartmentId === departmentId) {
        throw new InvalidArgumentException('部门不能将自己设为父部门');
      }

      const parentDepartment = await this.departmentRepository.findById(
        new DepartmentId(request.parentDepartmentId),
      );
      if (!parentDepartment) {
        throw new InvalidArgumentException('父部门不存在');
      }

      // 检查父部门是否属于同一租户和组织
      if (
        parentDepartment.tenantId.toString() !==
        currentDepartment.tenantId.toString()
      ) {
        throw new InvalidArgumentException('父部门必须属于同一租户');
      }

      if (
        parentDepartment.organizationId?.toString() !==
        currentDepartment.organizationId?.toString()
      ) {
        throw new InvalidArgumentException('父部门必须属于同一组织');
      }

      // 检查是否形成循环引用（简单检查，实际可能需要递归检查）
      // 这里可以添加更复杂的循环检查逻辑
    }
  }
}
