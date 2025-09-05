/**
 * @description 删除部门用例
 * @author 江郎
 * @since 1.0.0
 */

import { Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { PinoLoggerService, LogContext } from '@aiofix/logging';
import { DepartmentRepository } from '../../domain/repositories/department.repository';
import { DepartmentAggregate } from '../../domain/aggregates/department.aggregate';
import { DepartmentId } from '@aiofix/shared';
import { DeleteDepartmentRequest } from '../interfaces/department-management.interface';
import { DeleteDepartmentResponse } from '../dtos/delete-department-response.dto';
import { InvalidArgumentException } from '../../domain/exceptions/invalid-argument.exception';
import { DepartmentNotFoundException } from '../../domain/exceptions/department-not-found.exception';

@Injectable()
export class DeleteDepartmentUseCase {
  constructor(
    private readonly departmentRepository: DepartmentRepository,
    private readonly eventBus: EventBus,
    private readonly logger: PinoLoggerService,
  ) {}

  /**
   * 执行删除部门用例
   * @param request 删除部门请求
   * @returns 删除部门响应
   */
  async execute(
    request: DeleteDepartmentRequest,
  ): Promise<DeleteDepartmentResponse> {
    try {
      this.logger.info('开始删除部门', LogContext.BUSINESS, {
        departmentId: request.departmentId,
        currentUserId: request.currentUserId,
        reason: request.reason,
      });

      // 1. 验证请求参数
      this.validateRequest(request);

      // 2. 查找部门
      const department = await this.departmentRepository.findById(
        new DepartmentId(request.departmentId),
      );
      if (!department) {
        throw new DepartmentNotFoundException(request.departmentId);
      }

      // 3. 业务规则验证
      await this.validateBusinessRules(request.departmentId);

      // 4. 创建部门聚合根（用于事件溯源）
      const departmentAggregate = new DepartmentAggregate(request.departmentId);
      departmentAggregate.loadFromHistory([department.id.toString()]);

      // 5. 删除部门
      departmentAggregate.deactivate(request.currentUserId);

      // 6. 保存删除后的部门实体
      await this.departmentRepository.save(departmentAggregate.department);

      // 7. 发布领域事件
      await this.eventBus.publishAll(departmentAggregate.uncommittedEvents);

      // 8. 清除已发布的事件
      departmentAggregate.clearEvents();

      this.logger.info('部门删除成功', LogContext.BUSINESS, {
        departmentId: request.departmentId,
        currentUserId: request.currentUserId,
      });

      return {
        success: true,
        message: '部门删除成功',
      };
    } catch (error) {
      this.logger.error('部门删除失败', LogContext.BUSINESS, {
        departmentId: request.departmentId,
        currentUserId: request.currentUserId,
        error: error instanceof Error ? error.message : String(error),
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        message: '部门删除失败',
      };
    }
  }

  /**
   * 验证请求参数
   * @param request 删除部门请求
   */
  private validateRequest(request: DeleteDepartmentRequest): void {
    if (!request.departmentId || request.departmentId.trim().length === 0) {
      throw new InvalidArgumentException('部门ID不能为空');
    }

    if (!request.currentUserId || request.currentUserId.trim().length === 0) {
      throw new InvalidArgumentException('当前用户ID不能为空');
    }
  }

  /**
   * 验证业务规则
   * @param departmentId 部门ID
   */
  private async validateBusinessRules(departmentId: string): Promise<void> {
    // 检查是否有子部门
    const children = await this.departmentRepository.findByParentDepartmentId(
      new DepartmentId(departmentId),
    );
    if (children.length > 0) {
      throw new InvalidArgumentException(
        '不能删除包含子部门的部门，请先删除或移动子部门',
      );
    }

    // 检查是否有用户属于该部门
    // 这里可以添加检查用户是否属于该部门的逻辑
    // 如果有用户属于该部门，需要先处理用户归属问题
  }
}
