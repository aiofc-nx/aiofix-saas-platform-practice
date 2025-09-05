/**
 * @description 暂停组织用例
 * @author 江郎
 * @since 2.1.0
 */

import { Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { PinoLoggerService, LogContext } from '@aiofix/logging';
import { OrganizationRepository } from '../../domain/repositories/organization.repository';
import { OrganizationAggregate } from '../../domain/aggregates/organization.aggregate';
import { OrganizationId } from '@aiofix/shared';
import { OrganizationStatus } from '../../domain/enums/organization-status.enum';
import {
  SuspendOrganizationRequest,
  BaseResponse,
} from '../interfaces/organization-management.interface';
import { InvalidArgumentException } from '../../domain/exceptions/invalid-argument.exception';
import { OrganizationNotFoundException } from '../../domain/exceptions/organization-not-found.exception';

@Injectable()
export class SuspendOrganizationUseCase {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
    private readonly eventBus: EventBus,
    private readonly logger: PinoLoggerService,
  ) {}

  /**
   * 执行暂停组织用例
   * @param request 暂停组织请求
   * @returns 暂停组织响应
   */
  async execute(request: SuspendOrganizationRequest): Promise<BaseResponse> {
    try {
      this.logger.info('开始暂停组织', LogContext.BUSINESS, {
        organizationId: request.organizationId,
        reason: request.reason,
        currentUserId: request.currentUserId,
      });

      // 1. 验证请求参数
      this.validateRequest(request);

      // 2. 查找组织
      const organization = await this.organizationRepository.findById(
        new OrganizationId(request.organizationId),
      );
      if (!organization) {
        throw new OrganizationNotFoundException(request.organizationId);
      }

      // 3. 检查组织状态
      if (organization.status === OrganizationStatus.SUSPENDED) {
        this.logger.warn('组织已经是暂停状态', LogContext.BUSINESS, {
          organizationId: request.organizationId,
        });
        return {
          success: true,
          message: '组织已经是暂停状态',
        };
      }

      // 4. 创建组织聚合根（用于事件溯源）
      const organizationAggregate = new OrganizationAggregate(
        request.organizationId,
      );
      organizationAggregate.loadFromHistory([organization]);

      // 5. 暂停组织
      organizationAggregate.suspend(request.currentUserId);

      // 6. 保存更新后的组织实体
      await this.organizationRepository.save(
        organizationAggregate.organization,
      );

      // 7. 发布领域事件
      await this.eventBus.publishAll(organizationAggregate.uncommittedEvents);

      // 8. 清除已发布的事件
      organizationAggregate.clearEvents();

      this.logger.info('组织暂停成功', LogContext.BUSINESS, {
        organizationId: request.organizationId,
        reason: request.reason,
        currentUserId: request.currentUserId,
      });

      return {
        success: true,
        message: '组织暂停成功',
      };
    } catch (error) {
      this.logger.error('组织暂停失败', LogContext.BUSINESS, {
        organizationId: request.organizationId,
        reason: request.reason,
        currentUserId: request.currentUserId,
        error: error instanceof Error ? error.message : String(error),
      });

      throw error;
    }
  }

  /**
   * 验证请求参数
   * @param request 暂停组织请求
   */
  private validateRequest(request: SuspendOrganizationRequest): void {
    if (!request.organizationId || request.organizationId.trim().length === 0) {
      throw new InvalidArgumentException('组织ID不能为空', 'organizationId');
    }

    if (!request.currentUserId || request.currentUserId.trim().length === 0) {
      throw new InvalidArgumentException('当前用户ID不能为空', 'currentUserId');
    }
  }
}
