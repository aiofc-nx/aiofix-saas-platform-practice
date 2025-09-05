/**
 * @description 更新组织用例
 * @author 江郎
 * @since 2.1.0
 */

import { Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { PinoLoggerService, LogContext } from '@aiofix/logging';
import { OrganizationRepository } from '../../domain/repositories/organization.repository';
import { OrganizationEntity } from '../../domain/entities/organization.entity';
import { OrganizationAggregate } from '../../domain/aggregates/organization.aggregate';
import { OrganizationId, OrganizationName } from '@aiofix/shared';
import { UpdateOrganizationRequest } from '../interfaces/organization-management.interface';
import { UpdateOrganizationResponse } from '../dtos/update-organization-response.dto';
import { InvalidArgumentException } from '../../domain/exceptions/invalid-argument.exception';
import { OrganizationNotFoundException } from '../../domain/exceptions/organization-not-found.exception';

@Injectable()
export class UpdateOrganizationUseCase {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
    private readonly eventBus: EventBus,
    private readonly logger: PinoLoggerService,
  ) {}

  /**
   * 执行更新组织用例
   * @param organizationId 组织ID
   * @param request 更新组织请求
   * @returns 更新组织响应
   */
  async execute(
    organizationId: string,
    request: UpdateOrganizationRequest,
  ): Promise<UpdateOrganizationResponse> {
    try {
      this.logger.info('开始更新组织', LogContext.BUSINESS, {
        organizationId,
        currentUserId: request.currentUserId,
      });

      // 1. 验证请求参数
      this.validateRequest(organizationId, request);

      // 2. 查找组织
      const organization = await this.organizationRepository.findById(
        new OrganizationId(organizationId),
      );
      if (!organization) {
        throw new OrganizationNotFoundException(organizationId);
      }

      // 3. 业务规则验证
      await this.validateBusinessRules(organizationId, request, organization);

      // 4. 创建组织聚合根（用于事件溯源）
      const organizationAggregate = new OrganizationAggregate(organizationId);
      organizationAggregate.loadFromHistory([organization]);

      // 5. 更新组织信息
      if (request.name && request.name !== organization.name.toString()) {
        organizationAggregate.updateInfo(
          new OrganizationName(request.name),
          organization.description,
          organization.managerId,
          request.currentUserId,
        );
      }

      if (
        request.description &&
        request.description !== organization.description
      ) {
        organizationAggregate.updateInfo(
          organization.name,
          request.description,
          request.currentUserId,
        );
      }

      // 6. 保存更新后的组织实体
      await this.organizationRepository.save(
        organizationAggregate.organization,
      );

      // 7. 发布领域事件
      await this.eventBus.publishAll(organizationAggregate.uncommittedEvents);

      // 8. 清除已发布的事件
      organizationAggregate.clearEvents();

      this.logger.info('组织更新成功', LogContext.BUSINESS, {
        organizationId,
        currentUserId: request.currentUserId,
      });

      return new UpdateOrganizationResponse(
        organizationId,
        true,
        '组织更新成功',
      );
    } catch (error) {
      this.logger.error('组织更新失败', LogContext.BUSINESS, {
        organizationId,
        currentUserId: request.currentUserId,
        error: error instanceof Error ? error.message : String(error),
      });

      throw error;
    }
  }

  /**
   * 验证请求参数
   * @param organizationId 组织ID
   * @param request 更新组织请求
   */
  private validateRequest(
    organizationId: string,
    request: UpdateOrganizationRequest,
  ): void {
    if (!organizationId || organizationId.trim().length === 0) {
      throw new InvalidArgumentException('组织ID不能为空', 'organizationId');
    }

    if (!request.currentUserId || request.currentUserId.trim().length === 0) {
      throw new InvalidArgumentException('当前用户ID不能为空', 'currentUserId');
    }

    // 验证组织名称长度
    if (request.name && request.name.length > 100) {
      throw new InvalidArgumentException(
        '组织名称长度不能超过100个字符',
        'name',
        request.name.length,
      );
    }

    // 验证组织代码长度
    if (request.code && request.code.length > 50) {
      throw new InvalidArgumentException(
        '组织代码长度不能超过50个字符',
        'code',
        request.code.length,
      );
    }

    // 验证组织代码格式
    if (request.code && !/^[a-zA-Z0-9_-]+$/.test(request.code)) {
      throw new InvalidArgumentException(
        '组织代码只能包含字母、数字、下划线和连字符',
        'code',
      );
    }
  }

  /**
   * 验证业务规则
   * @param organizationId 组织ID
   * @param request 更新组织请求
   * @param currentOrganization 当前组织实体
   */
  private async validateBusinessRules(
    organizationId: string,
    request: UpdateOrganizationRequest,
    currentOrganization: OrganizationEntity,
  ): Promise<void> {
    // 如果更新组织名称，检查名称是否已存在
    if (request.name && request.name !== currentOrganization.name.toString()) {
      const existingByName =
        await this.organizationRepository.findByNameAndTenant(
          request.name,
          currentOrganization.tenantId.toString(),
        );
      if (
        existingByName &&
        existingByName.organizationId.toString() !== organizationId
      ) {
        throw new InvalidArgumentException('组织名称已存在', 'name');
      }
    }

    // 如果更新组织代码，检查代码是否已存在
    if (request.code && request.code !== currentOrganization.code.toString()) {
      const existingByCode =
        await this.organizationRepository.findByCodeAndTenant(
          request.code,
          currentOrganization.tenantId.toString(),
        );
      if (
        existingByCode &&
        existingByCode.organizationId.toString() !== organizationId
      ) {
        throw new InvalidArgumentException('组织代码已存在', 'code');
      }
    }

    // 如果指定了父组织，检查父组织是否存在且不形成循环
    if (request.parentOrganizationId) {
      if (request.parentOrganizationId === organizationId) {
        throw new InvalidArgumentException(
          '组织不能将自己设为父组织',
          'parentOrganizationId',
        );
      }

      const parentOrganization = await this.organizationRepository.findById(
        new OrganizationId(request.parentOrganizationId),
      );
      if (!parentOrganization) {
        throw new InvalidArgumentException(
          '父组织不存在',
          'parentOrganizationId',
        );
      }

      // 检查父组织是否属于同一租户
      if (
        parentOrganization.tenantId.toString() !==
        currentOrganization.tenantId.toString()
      ) {
        throw new InvalidArgumentException(
          '父组织必须属于同一租户',
          'parentOrganizationId',
        );
      }

      // 检查是否形成循环引用（简单检查，实际可能需要递归检查）
      // 这里可以添加更复杂的循环检查逻辑
    }
  }
}
