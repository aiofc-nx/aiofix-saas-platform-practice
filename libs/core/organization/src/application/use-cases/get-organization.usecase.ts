/**
 * @description 获取组织用例
 * @author 江郎
 * @since 2.1.0
 */

import { Injectable } from '@nestjs/common';
import { PinoLoggerService, LogContext } from '@aiofix/logging';
import {
  OrganizationRepository,
  OrganizationQueryCriteria,
} from '../../domain/repositories/organization.repository';
import { OrganizationEntity } from '../../domain/entities/organization.entity';
import { OrganizationId } from '@aiofix/shared';
import { OrganizationStatus, OrganizationType } from '../../domain/enums';
import {
  GetOrganizationRequest,
  BaseResponse,
} from '../interfaces/organization-management.interface';
import { OrganizationDto } from '../dtos';
import { InvalidArgumentException } from '../../domain/exceptions/invalid-argument.exception';
import { OrganizationNotFoundException } from '../../domain/exceptions/organization-not-found.exception';

@Injectable()
export class GetOrganizationUseCase {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
    private readonly logger: PinoLoggerService,
  ) {}

  /**
   * 根据ID获取组织
   * @param organizationId 组织ID
   * @returns 组织信息
   */
  async getOrganizationById(organizationId: string): Promise<BaseResponse> {
    try {
      this.logger.info('开始获取组织', LogContext.BUSINESS, {
        organizationId,
      });

      if (!organizationId || organizationId.trim().length === 0) {
        throw new InvalidArgumentException('组织ID不能为空', 'organizationId');
      }

      const organization: OrganizationEntity | null =
        await this.organizationRepository.findById(
          new OrganizationId(organizationId),
        );

      if (!organization) {
        throw new OrganizationNotFoundException(organizationId);
      }

      const _organizationDto: OrganizationDto = this.mapToDto(organization);

      this.logger.info('组织获取成功', LogContext.BUSINESS, {
        organizationId,
      });

      return {
        success: true,
        message: '组织获取成功',
      };
    } catch (error) {
      this.logger.error('组织获取失败', LogContext.BUSINESS, {
        organizationId,
        error: error instanceof Error ? error.message : String(error),
      });

      throw error;
    }
  }

  /**
   * 根据条件获取组织列表
   * @param request 获取组织请求
   * @returns 组织列表
   */
  async getOrganizationsByCriteria(
    request: GetOrganizationRequest,
  ): Promise<BaseResponse> {
    try {
      this.logger.info('开始获取组织列表', LogContext.BUSINESS, {
        tenantId: request.tenantId,
        currentUserId: request.currentUserId,
        page: request.page,
        size: request.size,
      });

      // 验证请求参数
      this.validateRequest(request);

      // 构建查询条件
      const criteria: OrganizationQueryCriteria = {
        tenantId: request.tenantId,
        organizationId: request.organizationId,
        status: request.status
          ? (request.status as OrganizationStatus)
          : undefined,
        type: request.type ? (request.type as OrganizationType) : undefined,
        managerId: request.managerId,
        parentOrganizationId: request.parentOrganizationId,
        name: request.name,
        code: request.code,
        limit: request.size,
        offset: request.page ? (request.page - 1) * (request.size ?? 20) : 0,
      };

      // 执行查询
      const organizations =
        await this.organizationRepository.findByCriteria(criteria);
      const total = await this.organizationRepository.countByCriteria(criteria);

      // 转换为DTO
      const _organizationDtos: OrganizationDto[] = organizations.map(org =>
        this.mapToDto(org),
      );

      this.logger.info('组织列表获取成功', LogContext.BUSINESS, {
        tenantId: request.tenantId,
        total,
        page: request.page,
        size: request.size,
      });

      return {
        success: true,
        message: '组织列表获取成功',
      };
    } catch (error) {
      this.logger.error('组织列表获取失败', LogContext.BUSINESS, {
        tenantId: request.tenantId,
        currentUserId: request.currentUserId,
        error: error instanceof Error ? error.message : String(error),
      });

      throw error;
    }
  }

  /**
   * 验证请求参数
   * @param request 获取组织请求
   */
  private validateRequest(request: GetOrganizationRequest): void {
    if (!request.currentUserId || request.currentUserId.trim().length === 0) {
      throw new InvalidArgumentException('当前用户ID不能为空', 'currentUserId');
    }

    if (request.page && request.page < 1) {
      throw new InvalidArgumentException('页码必须大于0', 'page', request.page);
    }

    if (request.size && (request.size < 1 || request.size > 100)) {
      throw new InvalidArgumentException(
        '每页大小必须在1-100之间',
        'size',
        request.size,
      );
    }
  }

  /**
   * 将领域实体转换为DTO
   * @param organization 组织实体
   * @returns 组织DTO
   */
  private mapToDto(organization: OrganizationEntity): OrganizationDto {
    return {
      id: organization.organizationId.toString(),
      name: organization.name.toString(),
      code: organization.code.toString(),
      type: organization.type,
      status: organization.status,
      description: organization.description,
      parentOrganizationId: organization.parentOrganizationId?.toString(),
      managerId: organization.managerId,
      tenantId: organization.tenantId.toString(),
      organizationId: organization.organizationId.toString(),
      departmentIds: organization.departmentIds.map(id => id.toString()),
      dataPrivacyLevel: organization.dataPrivacyLevel,
      metadata: organization.getAllMetadata(),
      createdBy: organization.createdBy,
      updatedBy: organization.updatedBy,
      createdAt: organization.createdAt,
      updatedAt: organization.updatedAt,
      version: organization.version,
    };
  }
}
