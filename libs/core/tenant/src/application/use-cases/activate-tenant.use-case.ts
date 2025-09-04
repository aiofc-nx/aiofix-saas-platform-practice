/**
 * @class ActivateTenantUseCase
 * @description 激活租户用例
 *
 * 功能与职责：
 * 1. 处理租户激活的具体业务逻辑
 * 2. 协调领域对象和仓储
 * 3. 发布领域事件
 * 4. 返回标准化的响应
 *
 * @example
 * ```typescript
 * const useCase = new ActivateTenantUseCase(
 *   tenantRepository,
 *   eventBus,
 *   logger
 * );
 *
 * const result = await useCase.execute(tenantId);
 * ```
 * @since 1.0.0
 */

import { Injectable } from '@nestjs/common';
import { TenantId } from '@aiofix/shared';
import { ITenantRepository } from '../../domain/repositories/tenant.repository';
import { TenantStatus } from '../../domain/enums/tenant-status.enum';

/**
 * 激活租户用例类
 * @description 处理租户激活的业务逻辑
 */
@Injectable()
export class ActivateTenantUseCase {
  constructor(private readonly tenantRepository: ITenantRepository) {}

  /**
   * 执行激活租户用例
   * @param tenantId 租户ID
   * @returns 激活结果
   */
  async execute(
    tenantId: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      // 1. 验证租户ID
      if (!tenantId || tenantId.trim().length === 0) {
        throw new Error('租户ID不能为空');
      }

      // 2. 查找租户
      const tenant = await this.tenantRepository.findById(
        new TenantId(tenantId),
      );
      if (!tenant) {
        throw new Error('租户不存在');
      }

      // 3. 检查租户状态
      if (tenant.getTenantStatus() !== TenantStatus.PENDING) {
        throw new Error(`租户状态为 ${tenant.getTenantStatus()}，不能激活`);
      }

      // 4. 激活租户
      tenant.activate();

      // 5. 保存到仓储
      await this.tenantRepository.save(tenant);

      return {
        success: true,
        message: '租户激活成功',
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : '租户激活失败',
      };
    }
  }
}
