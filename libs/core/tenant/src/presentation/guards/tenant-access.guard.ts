/**
 * @class TenantAccessGuard
 * @description 租户访问守卫
 *
 * 功能与职责：
 * 1. 验证用户是否有权限访问指定租户
 * 2. 检查租户状态是否正常
 * 3. 注入租户上下文到请求中
 *
 * @example
 * ```typescript
 * @UseGuards(TenantAccessGuard)
 * @Controller('api/tenants')
 * export class TenantController {}
 * ```
 * @since 1.0.0
 */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ITenantManagementService } from '../../application/interfaces/tenant-management.interface';
import { TenantStatus } from '../../domain/enums/tenant-status.enum';

/**
 * 租户访问守卫类
 * @description 验证租户访问权限
 */
@Injectable()
export class TenantAccessGuard implements CanActivate {
  constructor(
    private readonly tenantManagementService: ITenantManagementService,
  ) {}

  /**
   * 检查是否可以激活路由
   * @param context 执行上下文
   * @returns 是否允许访问
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('用户未认证');
    }

    // 从URL参数中获取租户ID
    const tenantId = request.params.id || request.params.tenantId;

    if (!tenantId) {
      // 如果没有租户ID，允许访问（可能是创建租户等操作）
      return true;
    }

    try {
      // 获取租户信息
      const tenantResponse = await this.tenantManagementService.getTenant({
        tenantId,
        currentUserId: user.id,
      });

      if (!tenantResponse.success || !tenantResponse.tenant) {
        throw new NotFoundException('租户不存在');
      }

      const tenant = tenantResponse.tenant;

      // 检查租户状态
      if (tenant.status === TenantStatus.DELETED) {
        throw new NotFoundException('租户已被删除');
      }

      if (tenant.status === TenantStatus.SUSPENDED) {
        throw new ForbiddenException('租户已被暂停');
      }

      // 检查用户是否有权限访问该租户
      if (!this.hasTenantAccess(user, tenant)) {
        throw new ForbiddenException('无权限访问该租户');
      }

      // 注入租户上下文到请求中
      request.tenant = tenant;
      return true;
    } catch (error) {
      if (
        error instanceof ForbiddenException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new ForbiddenException('租户访问验证失败');
    }
  }

  /**
   * 检查用户是否有租户访问权限
   * @param user 用户信息
   * @param tenant 租户信息
   * @returns 是否有权限
   */
  private hasTenantAccess(user: any, tenant: any): boolean {
    // 平台管理员可以访问所有租户
    if (user.role === 'PLATFORM_ADMIN') {
      return true;
    }

    // 租户管理员可以访问自己的租户
    if (user.role === 'TENANT_ADMIN' && user.tenantId === tenant.id) {
      return true;
    }

    // 租户用户只能访问自己所属的租户
    if (user.tenantId === tenant.id) {
      return true;
    }

    return false;
  }
}
