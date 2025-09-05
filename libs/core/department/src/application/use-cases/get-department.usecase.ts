/**
 * @description 获取部门用例
 * @author 江郎
 * @since 1.0.0
 */

import { Injectable } from '@nestjs/common';
import { PinoLoggerService, LogContext } from '@aiofix/logging';
import {
  DepartmentRepository,
  DepartmentQueryCriteria,
} from '../../domain/repositories/department.repository';
import { DepartmentEntity } from '../../domain/entities/department.entity';
import { DepartmentId, TenantId, OrganizationId } from '@aiofix/shared';
import { DepartmentStatus, DepartmentType } from '../../domain/enums';
import {
  GetDepartmentRequest,
  GetDepartmentsRequest,
  BaseResponse,
} from '../interfaces/department-management.interface';
import { DepartmentDto } from '../dtos';
import { InvalidArgumentException } from '../../domain/exceptions/invalid-argument.exception';
import { DepartmentNotFoundException } from '../../domain/exceptions/department-not-found.exception';

@Injectable()
export class GetDepartmentUseCase {
  constructor(
    private readonly departmentRepository: DepartmentRepository,
    private readonly logger: PinoLoggerService,
  ) {}

  /**
   * 根据ID获取部门
   * @param request 获取部门请求
   * @returns 部门信息
   */
  async getDepartmentById(
    request: GetDepartmentRequest,
  ): Promise<BaseResponse> {
    try {
      this.logger.info('开始获取部门', LogContext.BUSINESS, {
        departmentId: request.departmentId,
        tenantId: request.tenantId,
        currentUserId: request.currentUserId,
      });

      if (!request.departmentId || request.departmentId.trim().length === 0) {
        throw new InvalidArgumentException('部门ID不能为空');
      }

      const department: DepartmentEntity | null =
        await this.departmentRepository.findById(
          new DepartmentId(request.departmentId),
        );

      if (!department) {
        throw new DepartmentNotFoundException(request.departmentId);
      }

      const _departmentDto: DepartmentDto = this.mapToDto(department);

      this.logger.info('部门获取成功', LogContext.BUSINESS, {
        departmentId: request.departmentId,
      });

      return {
        success: true,
        message: '部门获取成功',
      };
    } catch (error) {
      this.logger.error('部门获取失败', LogContext.BUSINESS, {
        departmentId: request.departmentId,
        tenantId: request.tenantId,
        currentUserId: request.currentUserId,
        error: error instanceof Error ? error.message : String(error),
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        message: '部门获取失败',
      };
    }
  }

  /**
   * 根据条件获取部门列表
   * @param request 获取部门请求
   * @returns 部门列表
   */
  async getDepartmentsByCriteria(
    request: GetDepartmentsRequest,
  ): Promise<BaseResponse> {
    try {
      this.logger.info('开始获取部门列表', LogContext.BUSINESS, {
        tenantId: request.tenantId,
        organizationId: request.organizationId,
        currentUserId: request.currentUserId,
        page: request.page,
        size: request.size,
      });

      // 验证请求参数
      this.validateRequest(request);

      // 构建查询条件
      const criteria: DepartmentQueryCriteria = {
        tenantId: new TenantId(request.tenantId),
        organizationId: request.organizationId
          ? new OrganizationId(request.organizationId)
          : undefined,
        status: request.status
          ? (request.status as DepartmentStatus)
          : undefined,
        type: request.type ? (request.type as DepartmentType) : undefined,
        managerId: request.managerId,
        parentDepartmentId: request.parentDepartmentId
          ? new DepartmentId(request.parentDepartmentId)
          : undefined,
        name: request.searchText,
        limit: request.size,
        offset: request.page ? (request.page - 1) * (request.size ?? 20) : 0,
      };

      // 执行查询
      const departments =
        await this.departmentRepository.findByCriteria(criteria);
      const total = await this.departmentRepository.countByCriteria(criteria);

      // 转换为DTO
      const _departmentDtos: DepartmentDto[] = departments.map(dept =>
        this.mapToDto(dept),
      );

      this.logger.info('部门列表获取成功', LogContext.BUSINESS, {
        tenantId: request.tenantId,
        organizationId: request.organizationId,
        total,
        page: request.page,
        size: request.size,
      });

      return {
        success: true,
        message: '部门列表获取成功',
      };
    } catch (error) {
      this.logger.error('部门列表获取失败', LogContext.BUSINESS, {
        tenantId: request.tenantId,
        organizationId: request.organizationId,
        currentUserId: request.currentUserId,
        error: error instanceof Error ? error.message : String(error),
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        message: '部门列表获取失败',
      };
    }
  }

  /**
   * 验证请求参数
   * @param request 获取部门请求
   */
  private validateRequest(request: GetDepartmentsRequest): void {
    if (!request.tenantId || request.tenantId.trim().length === 0) {
      throw new InvalidArgumentException('租户ID不能为空');
    }

    if (!request.currentUserId || request.currentUserId.trim().length === 0) {
      throw new InvalidArgumentException('当前用户ID不能为空');
    }

    if (request.page && request.page < 1) {
      throw new InvalidArgumentException('页码必须大于0');
    }

    if (request.size && (request.size < 1 || request.size > 100)) {
      throw new InvalidArgumentException('每页大小必须在1-100之间');
    }
  }

  /**
   * 将领域实体转换为DTO
   * @param department 部门实体
   * @returns 部门DTO
   */
  private mapToDto(department: DepartmentEntity): DepartmentDto {
    return new DepartmentDto(
      department.id.toString(),
      department.name.toString(),
      department.code.toString(),
      department.type,
      department.status,
      department.tenantId.toString(),
      department.organizationId?.toString() ?? '',
      department.description,
      department.parentDepartmentId?.toString(),
      department.managerId,
      department.level,
      department.path,
      department.createdBy,
      department.createdAt,
      department.updatedAt,
    );
  }
}
