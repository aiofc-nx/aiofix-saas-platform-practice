/**
 * @class SuspendTenantUseCase
 * @description
 * 暂停租户用例，负责处理租户暂停的业务逻辑。
 *
 * 原理与机制：
 * 1. 验证租户当前状态是否允许暂停
 * 2. 执行租户暂停操作
 * 3. 发布租户暂停事件
 * 4. 更新租户状态为暂停
 *
 * 功能与职责：
 * 1. 验证租户暂停的业务规则
 * 2. 执行租户暂停操作
 * 3. 发布领域事件
 * 4. 返回标准化的响应
 *
 * @example
 * ```typescript
 * const useCase = new SuspendTenantUseCase(
 *   tenantRepository,
 *   eventBus,
 *   logger
 * );
 *
 * const result = await useCase.execute({
 *   tenantId: 'tenant-123',
 *   reason: '违规操作',
 *   suspendedBy: 'admin-456'
 * });
 * ```
 * @since 1.0.0
 */

import { Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { PinoLoggerService } from '@aiofix/logging';
import { LogContext } from '@aiofix/logging';
import { ITenantRepository } from '../../domain/repositories/tenant.repository';
import { TenantId } from '@aiofix/shared';
import { TenantSuspendedEvent } from '../../domain/domain-events';
import { TenantStatus } from '../../domain/enums/tenant-status.enum';

/**
 * 暂停租户请求接口
 */
export interface SuspendTenantRequest {
  tenantId: string;
  reason: string;
  suspendedBy: string;
  suspendedAt?: Date;
}

/**
 * 暂停租户响应接口
 */
export interface SuspendTenantResponse {
  success: boolean;
  tenantId?: string;
  message: string;
  error?: string;
}

/**
 * 暂停租户用例类
 * @description 处理租户暂停的业务逻辑
 */
@Injectable()
export class SuspendTenantUseCase {
  constructor(
    private readonly tenantRepository: ITenantRepository,
    private readonly eventBus: EventBus,
    private readonly logger: PinoLoggerService,
  ) {}

  /**
   * 执行暂停租户用例
   * @param request 暂停请求
   * @returns 暂停结果
   */
  async execute(request: SuspendTenantRequest): Promise<SuspendTenantResponse> {
    try {
      this.logger.info(
        `Executing SuspendTenantUseCase for tenant: ${request.tenantId}`,
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
          message: '暂停租户失败：租户不存在',
        };
      }

      // 3. 检查租户状态
      const currentStatus = tenantAggregate.getTenantStatus();
      if (currentStatus === TenantStatus.SUSPENDED) {
        return {
          success: false,
          error: '租户已处于暂停状态',
          message: '暂停租户失败：租户已处于暂停状态',
        };
      }

      if (currentStatus === TenantStatus.DELETED) {
        return {
          success: false,
          error: '无法暂停已删除的租户',
          message: '暂停租户失败：无法暂停已删除的租户',
        };
      }

      // 4. 执行暂停操作
      tenantAggregate.suspend();

      // 5. 保存到仓储
      await this.tenantRepository.save(tenantAggregate);

      // 6. 发布领域事件
      await this.eventBus.publish(
        new TenantSuspendedEvent(
          request.tenantId,
          currentStatus,
          TenantStatus.SUSPENDED,
        ),
      );

      this.logger.info(
        `Successfully suspended tenant: ${request.tenantId}`,
        LogContext.BUSINESS,
      );

      return {
        success: true,
        tenantId: request.tenantId,
        message: '租户暂停成功',
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to execute SuspendTenantUseCase: ${errorMessage}`,
        LogContext.BUSINESS,
        { error: errorMessage, request },
      );

      return {
        success: false,
        error: errorMessage,
        message: '暂停租户失败',
      };
    }
  }

  /**
   * 验证请求参数
   * @param request 暂停请求
   */
  private validateRequest(request: SuspendTenantRequest): void {
    if (!request.tenantId || request.tenantId.trim().length === 0) {
      throw new Error('租户ID不能为空');
    }

    if (!request.reason || request.reason.trim().length === 0) {
      throw new Error('暂停原因不能为空');
    }

    if (!request.suspendedBy || request.suspendedBy.trim().length === 0) {
      throw new Error('操作人不能为空');
    }
  }
}
