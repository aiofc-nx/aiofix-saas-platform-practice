/**
 * @description 创建组织用例
 * @author 江郎
 * @since 2.1.0
 */

import { Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { PinoLoggerService, LogContext } from '@aiofix/logging';
import { OrganizationRepository } from '../../domain/repositories/organization.repository';
import { OrganizationAggregate } from '../../domain/aggregates/organization.aggregate';
import {
  OrganizationId,
  OrganizationName,
  OrganizationCode,
  TenantId,
} from '@aiofix/shared';
import { CreateOrganizationRequest } from '../interfaces/organization-management.interface';
import { CreateOrganizationResponse } from '../dtos/create-organization-response.dto';
import { OrganizationType } from '../../domain/enums';
import { InvalidArgumentException } from '../../domain/exceptions/invalid-argument.exception';

@Injectable()
export class CreateOrganizationUseCase {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
    private readonly eventBus: EventBus,
    private readonly logger: PinoLoggerService,
  ) {}

  /**
   * 执行创建组织用例
   * @param request 创建组织请求
   * @returns 创建组织响应
   */
  async execute(
    request: CreateOrganizationRequest,
  ): Promise<CreateOrganizationResponse> {
    try {
      this.logger.info('开始创建组织', LogContext.BUSINESS, {
        name: request.name,
        code: request.code,
        type: request.type,
        tenantId: request.tenantId,
        currentUserId: request.currentUserId,
      });

      // 1. 验证请求参数
      this.validateRequest(request);

      // 2. 业务规则验证
      await this.validateBusinessRules(request);

      // 3. 创建组织聚合根
      const organizationId = OrganizationId.generate();
      const name = new OrganizationName(request.name);
      const code = new OrganizationCode(request.code);
      const tenantId = new TenantId(request.tenantId);
      const type = request.type as OrganizationType;

      const organizationAggregate = OrganizationAggregate.create(
        organizationId,
        name,
        code,
        type,
        tenantId.toString(),
        [], // departmentIds
        request.description,
        request.parentOrganizationId
          ? new OrganizationId(request.parentOrganizationId)
          : undefined,
        request.managerId,
        request.currentUserId,
      );

      // 4. 保存组织实体
      await this.organizationRepository.save(
        organizationAggregate.organization,
      );

      // 5. 发布领域事件
      await this.eventBus.publishAll(organizationAggregate.uncommittedEvents);

      // 6. 清除已发布的事件
      organizationAggregate.clearEvents();

      this.logger.info('组织创建成功', LogContext.BUSINESS, {
        organizationId: organizationId.toString(),
        name: request.name,
        code: request.code,
        tenantId: request.tenantId,
      });

      return new CreateOrganizationResponse(
        organizationId.toString(),
        true,
        request.name,
        request.code,
        request.type,
        request.tenantId,
        '组织创建成功',
      );
    } catch (error) {
      this.logger.error('组织创建失败', LogContext.BUSINESS, {
        name: request.name,
        code: request.code,
        type: request.type,
        tenantId: request.tenantId,
        currentUserId: request.currentUserId,
        error: error instanceof Error ? error.message : String(error),
      });

      throw error;
    }
  }

  /**
   * 验证请求参数
   * @param request 创建组织请求
   */
  private validateRequest(request: CreateOrganizationRequest): void {
    if (!request.name || request.name.trim().length === 0) {
      throw new InvalidArgumentException('组织名称不能为空', 'name');
    }

    if (!request.code || request.code.trim().length === 0) {
      throw new InvalidArgumentException('组织代码不能为空', 'code');
    }

    if (!request.type || request.type.trim().length === 0) {
      throw new InvalidArgumentException('组织类型不能为空', 'type');
    }

    if (!request.tenantId || request.tenantId.trim().length === 0) {
      throw new InvalidArgumentException('租户ID不能为空', 'tenantId');
    }

    if (!request.currentUserId || request.currentUserId.trim().length === 0) {
      throw new InvalidArgumentException('当前用户ID不能为空', 'currentUserId');
    }

    // 验证组织名称长度
    if (request.name.length > 100) {
      throw new InvalidArgumentException(
        '组织名称长度不能超过100个字符',
        'name',
        request.name.length,
      );
    }

    // 验证组织代码长度
    if (request.code.length > 50) {
      throw new InvalidArgumentException(
        '组织代码长度不能超过50个字符',
        'code',
        request.code.length,
      );
    }

    // 验证组织代码格式（只能包含字母、数字、下划线、连字符）
    if (!/^[a-zA-Z0-9_-]+$/.test(request.code)) {
      throw new InvalidArgumentException(
        '组织代码只能包含字母、数字、下划线和连字符',
        'code',
      );
    }
  }

  /**
   * 验证业务规则
   * @param request 创建组织请求
   */
  private async validateBusinessRules(
    request: CreateOrganizationRequest,
  ): Promise<void> {
    // 注意：这里创建的值对象用于类型验证，虽然未直接使用但确保了类型安全

    // 检查组织名称是否已存在
    const existingByName =
      await this.organizationRepository.findByNameAndTenant(
        request.name,
        request.tenantId,
      );
    if (existingByName) {
      throw new InvalidArgumentException('组织名称已存在', 'name');
    }

    // 检查组织代码是否已存在
    const existingByCode =
      await this.organizationRepository.findByCodeAndTenant(
        request.code,
        request.tenantId,
      );
    if (existingByCode) {
      throw new InvalidArgumentException('组织代码已存在', 'code');
    }

    // 如果指定了父组织，检查父组织是否存在
    if (request.parentOrganizationId) {
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
      if (parentOrganization.tenantId.toString() !== request.tenantId) {
        throw new InvalidArgumentException(
          '父组织必须属于同一租户',
          'parentOrganizationId',
        );
      }
    }
  }
}
