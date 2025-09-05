/**
 * @class DeleteTenantUseCase
 * @description
 * 删除租户用例，负责处理租户删除的业务逻辑。
 *
 * 原理与机制：
 * 1. 验证租户当前状态是否允许删除
 * 2. 检查租户是否有关联数据
 * 3. 执行租户删除操作
 * 4. 发布租户删除事件
 *
 * 功能与职责：
 * 1. 验证租户删除的业务规则
 * 2. 检查租户关联数据
 * 3. 执行租户删除操作
 * 4. 发布领域事件
 * 5. 返回标准化的响应
 *
 * @example
 * ```typescript
 * const useCase = new DeleteTenantUseCase(
 *   tenantRepository,
 *   eventBus,
 *   logger
 * );
 *
 * const result = await useCase.execute({
 *   tenantId: 'tenant-123',
 *   reason: '业务终止',
 *   deletedBy: 'admin-456'
 * });
 * ```
 * @since 1.0.0
 */

import { Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { PinoLoggerService, LogContext } from '@aiofix/logging';
import { ITenantRepository } from '../../domain/repositories/tenant.repository';
import { TenantId } from '@aiofix/shared';
import { TenantDeletedEvent } from '../../domain/domain-events';
import { TenantStatus } from '../../domain/enums/tenant-status.enum';

/**
 * 删除租户请求接口
 */
export interface DeleteTenantRequest {
  tenantId: string;
  reason: string;
  deletedBy: string;
  deletedAt?: Date;
  forceDelete?: boolean; // 是否强制删除（忽略关联数据检查）
}

/**
 * 删除租户响应接口
 */
export interface DeleteTenantResponse {
  success: boolean;
  tenantId?: string;
  message: string;
  error?: string;
}

/**
 * 删除租户用例类
 * @description 处理租户删除的业务逻辑
 */
@Injectable()
export class DeleteTenantUseCase {
  constructor(
    private readonly tenantRepository: ITenantRepository,
    private readonly eventBus: EventBus,
    private readonly logger: PinoLoggerService,
  ) {}

  /**
   * 执行删除租户用例
   * @param request 删除请求
   * @returns 删除结果
   */
  async execute(request: DeleteTenantRequest): Promise<DeleteTenantResponse> {
    try {
      this.logger.info(
        `Executing DeleteTenantUseCase for tenant: ${request.tenantId}`,
        LogContext.BUSINESS,
        { request },
      );

      // 1. 验证请求
      this.validateRequest(request);

      // 2. 获取租户聚合根
      const tenantId = new TenantId(request.tenantId);
      const tenantAggregate = await this.tenantRepository.findById(tenantId);

      if (!tenantAggregate) {
        return {
          success: false,
          error: '租户不存在',
          message: '删除租户失败：租户不存在',
        };
      }

      // 3. 检查租户状态
      const currentStatus = tenantAggregate.getTenantStatus();
      if (currentStatus === TenantStatus.DELETED) {
        return {
          success: false,
          error: '租户已被删除',
          message: '删除租户失败：租户已被删除',
        };
      }

      // 4. 检查关联数据（如果不是强制删除）
      if (!request.forceDelete) {
        const hasAssociatedData = await this.checkAssociatedData(tenantId);
        if (hasAssociatedData) {
          return {
            success: false,
            error: '租户存在关联数据，无法删除',
            message:
              '删除租户失败：租户存在关联数据，请先清理关联数据或使用强制删除',
          };
        }
      }

      // 5. 执行删除操作
      tenantAggregate.delete();

      // 6. 保存到仓储
      await this.tenantRepository.save(tenantAggregate);

      // 7. 发布领域事件
      await this.eventBus.publish(
        new TenantDeletedEvent(
          request.tenantId,
          currentStatus,
          TenantStatus.DELETED,
        ),
      );

      this.logger.info(
        `Successfully deleted tenant: ${request.tenantId}`,
        LogContext.BUSINESS,
      );

      return {
        success: true,
        tenantId: request.tenantId,
        message: '租户删除成功',
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to execute DeleteTenantUseCase: ${errorMessage}`,
        LogContext.BUSINESS,
        { error: errorMessage, request },
      );

      return {
        success: false,
        error: errorMessage,
        message: '删除租户失败',
      };
    }
  }

  /**
   * 验证请求参数
   * @param request 删除请求
   */
  private validateRequest(request: DeleteTenantRequest): void {
    if (!request.tenantId || request.tenantId.trim().length === 0) {
      throw new Error('租户ID不能为空');
    }

    if (!request.reason || request.reason.trim().length === 0) {
      throw new Error('删除原因不能为空');
    }

    if (!request.deletedBy || request.deletedBy.trim().length === 0) {
      throw new Error('操作人不能为空');
    }
  }

  /**
   * 检查租户是否有关联数据
   * @param tenantId 租户ID
   * @returns 是否有关联数据
   */
  private async checkAssociatedData(tenantId: TenantId): Promise<boolean> {
    try {
      // 这里应该检查租户是否有关联的用户、组织、部门等数据
      // 由于其他模块可能还未实现，这里先返回false
      // 实际实现时需要注入相应的仓储来检查关联数据

      // 示例检查逻辑：
      // const userCount = await this.userRepository.countByTenantId(tenantId);
      // const organizationCount = await this.organizationRepository.countByTenantId(tenantId);
      // return userCount > 0 || organizationCount > 0;

      return false; // 暂时返回false，表示没有关联数据
    } catch (error) {
      this.logger.error(
        `Failed to check associated data for tenant: ${tenantId.toString()}`,
        LogContext.BUSINESS,
        { error: error instanceof Error ? error.message : String(error) },
      );
      // 如果检查失败，为了安全起见，认为有关联数据
      return true;
    }
  }
}
