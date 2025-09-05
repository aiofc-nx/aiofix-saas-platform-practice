/**
 * @class CreateTenantUseCase
 * @description 创建租户用例
 *
 * 功能与职责：
 * 1. 处理租户创建的具体业务逻辑
 * 2. 协调领域对象和仓储
 * 3. 发布领域事件
 * 4. 返回标准化的响应
 *
 * @example
 * ```typescript
 * const useCase = new CreateTenantUseCase(
 *   tenantRepository,
 *   eventBus,
 *   logger
 * );
 *
 * const result = await useCase.execute(request);
 * ```
 * @since 1.0.0
 */

import { Injectable, Inject } from '@nestjs/common';
import { TenantId, TenantName, TenantCode, TenantDomain } from '@aiofix/shared';
import { ITenantRepository } from '../../domain/repositories/tenant.repository';
import { TenantAggregate } from '../../domain/aggregates/tenant.aggregate';
import { TenantType } from '../../domain/enums/tenant-type.enum';
import {
  CreateTenantRequest,
  CreateTenantResponse,
} from '../dtos/create-tenant.dto';

/**
 * 创建租户用例类
 * @description 处理租户创建的业务逻辑
 */
@Injectable()
export class CreateTenantUseCase {
  constructor(
    @Inject('ITenantRepository')
    private readonly tenantRepository: ITenantRepository,
  ) {}

  /**
   * 执行创建租户用例
   * @param request 创建请求
   * @returns 创建结果
   */
  async execute(request: CreateTenantRequest): Promise<CreateTenantResponse> {
    try {
      // 1. 验证请求
      this.validateRequest(request);

      // 2. 检查业务规则
      await this.checkBusinessRules(request);

      // 3. 创建领域对象
      const tenantAggregate = this.createTenantAggregate(request);

      // 4. 保存到仓储
      await this.tenantRepository.save(tenantAggregate);

      // 6. 返回结果
      return {
        success: true,
        tenantId: tenantAggregate.getTenantId().toString(),
        message: '租户创建成功',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        message: '租户创建失败',
      };
    }
  }

  /**
   * 验证请求参数
   * @param request 创建请求
   */
  private validateRequest(request: CreateTenantRequest): void {
    if (!request.name || request.name.trim().length === 0) {
      throw new Error('租户名称不能为空');
    }

    if (!request.code || request.code.trim().length === 0) {
      throw new Error('租户代码不能为空');
    }

    if (!request.domain || request.domain.trim().length === 0) {
      throw new Error('租户域名不能为空');
    }

    if (!request.type) {
      throw new Error('租户类型不能为空');
    }

    if (!Object.values(TenantType).includes(request.type)) {
      throw new Error('无效的租户类型');
    }
  }

  /**
   * 检查业务规则
   * @param request 创建请求
   */
  private async checkBusinessRules(
    request: CreateTenantRequest,
  ): Promise<void> {
    // 检查租户代码是否已存在
    const existingByCode = await this.tenantRepository.findByCode(
      new TenantCode(request.code),
    );
    if (existingByCode) {
      throw new Error('租户代码已存在');
    }

    // 检查租户域名是否已存在
    const existingByDomain = await this.tenantRepository.findByDomain(
      new TenantDomain(request.domain),
    );
    if (existingByDomain) {
      throw new Error('租户域名已存在');
    }

    // 检查租户名称是否已存在
    const existingByName = await this.tenantRepository.findByName(request.name);
    if (existingByName) {
      throw new Error('租户名称已存在');
    }
  }

  /**
   * 创建租户聚合根
   * @param request 创建请求
   * @returns 租户聚合根
   */
  private createTenantAggregate(request: CreateTenantRequest): TenantAggregate {
    const id = new TenantId(request.id);
    const name = new TenantName(request.name);
    const code = new TenantCode(request.code);
    const domain = new TenantDomain(request.domain);

    // 根据租户类型创建相应的聚合根
    switch (request.type) {
      case TenantType.ENTERPRISE:
        return TenantAggregate.createEnterprise(
          id,
          name,
          code,
          domain,
          request.description,
        );
      case TenantType.ORGANIZATION:
        return TenantAggregate.createOrganization(
          id,
          name,
          code,
          domain,
          request.description,
        );
      case TenantType.PARTNERSHIP:
        return TenantAggregate.createPartnership(
          id,
          name,
          code,
          domain,
          request.description,
        );
      case TenantType.PERSONAL:
        return TenantAggregate.createPersonal(
          id,
          name,
          code,
          domain,
          request.description,
        );
      default:
        throw new Error('不支持的租户类型');
    }
  }
}
