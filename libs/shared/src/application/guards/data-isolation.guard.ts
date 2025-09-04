/**
 * @file data-isolation.guard.ts
 * @description 数据隔离守卫
 *
 * 该文件定义了数据隔离守卫，提供API层面的数据隔离保护。
 * 数据隔离守卫确保所有API请求都遵循多层级数据隔离策略。
 *
 * 主要功能：
 * 1. API请求的租户上下文验证
 * 2. 数据访问权限检查
 * 3. 跨租户访问防护
 * 4. 数据隔离审计
 *
 * 遵循DDD和Clean Architecture原则，提供统一的数据隔离保护。
 */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  DataIsolationService,
  DataAccessRequest,
} from '../../domain/services/data-isolation.service';
import {
  DataIsolationLevel,
  TenantContext,
  DataIsolationAwareEntity,
} from '../../domain/entities/data-isolation-aware.entity';

/**
 * @decorator RequireDataIsolation
 * @description 要求数据隔离的装饰器
 */
export const RequireDataIsolation = (isolationLevel: DataIsolationLevel) => {
  return (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor => {
    Reflect.defineMetadata(
      'dataIsolationLevel',
      isolationLevel,
      descriptor.value as object,
    );
    return descriptor;
  };
};

/**
 * @decorator SkipDataIsolation
 * @description 跳过数据隔离的装饰器
 */
export const SkipDataIsolation = () => {
  return (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor => {
    Reflect.defineMetadata(
      'skipDataIsolation',
      true,
      descriptor.value as object,
    );
    return descriptor;
  };
};

/**
 * @interface TenantContextProvider
 * @description 租户上下文提供者接口
 */
export interface TenantContextProvider {
  getTenantContext(
    executionContext: ExecutionContext,
  ): Promise<TenantContext | null>;
}

/**
 * @class DataIsolationGuard
 * @description 数据隔离守卫
 *
 * 提供API层面的数据隔离保护，确保：
 * - 所有请求都有有效的租户上下文
 * - 数据访问符合隔离策略
 * - 跨租户访问被正确阻止
 * - 数据访问被审计记录
 */
@Injectable()
export class DataIsolationGuard implements CanActivate {
  constructor(
    private readonly dataIsolationService: DataIsolationService,
    @Inject('TenantContextProvider')
    private readonly tenantContextProvider: TenantContextProvider,
    private readonly reflector: Reflector,
  ) {}

  /**
   * @method canActivate
   * @description 检查是否可以激活
   * @param context 执行上下文
   * @returns 是否可以激活
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const handler = context.getHandler();

    // 1. 检查是否跳过数据隔离
    const skipIsolation = this.reflector.get<boolean>(
      'skipDataIsolation',
      handler,
    );
    if (skipIsolation) {
      return true;
    }

    // 2. 获取租户上下文
    const tenantContext =
      await this.tenantContextProvider.getTenantContext(context);
    if (!tenantContext) {
      return false;
    }

    // 3. 验证租户上下文
    const validationResult =
      this.dataIsolationService.validateTenantContext(tenantContext);
    if (!validationResult.isValid) {
      return false;
    }

    // 4. 获取要求的隔离级别
    const requiredLevel = this.getRequiredIsolationLevel(context);
    // 如果没有指定隔离级别，使用租户上下文的隔离级别
    if (tenantContext.isolationLevel !== requiredLevel) {
      return false;
    }

    return true;
  }

  /**
   * @method handleRequest
   * @description 处理请求
   * @param context 执行上下文
   * @param user 用户实体
   * @param target 目标实体
   * @param isolationLevel 隔离级别
   * @returns 处理结果
   */
  async handleRequest(
    context: ExecutionContext,
    user: DataIsolationAwareEntity,
    target: DataIsolationAwareEntity,
    isolationLevel: DataIsolationLevel,
  ): Promise<string> {
    const accessRequest: DataAccessRequest = {
      source: user,
      target,
      requestedLevel: isolationLevel,
    };

    const accessResult =
      this.dataIsolationService.validateDataAccess(accessRequest);

    // 审计数据访问（无论成功还是失败都要审计）
    this.dataIsolationService.auditDataAccess(accessRequest, accessResult);

    if (!accessResult.isAllowed) {
      throw new ForbiddenException(`数据访问被拒绝: ${accessResult.reason}`);
    }

    // 模拟处理结果
    return 'result';
  }

  /**
   * @method getRequiredIsolationLevel
   * @description 获取要求的隔离级别
   * @param context 执行上下文
   * @returns 隔离级别
   */
  getRequiredIsolationLevel(context: ExecutionContext): DataIsolationLevel {
    const handler = context.getHandler();
    const level = this.reflector.get<DataIsolationLevel>(
      'dataIsolationLevel',
      handler,
    );
    return level || DataIsolationLevel.TENANT;
  }
}

/**
 * @class DefaultTenantContextProvider
 * @description 默认租户上下文提供者
 */
@Injectable()
export class DefaultTenantContextProvider implements TenantContextProvider {
  /**
   * @method getTenantContext
   * @description 获取租户上下文
   * @param executionContext 执行上下文
   * @returns 租户上下文
   */
  async getTenantContext(
    executionContext: ExecutionContext,
  ): Promise<TenantContext | null> {
    const request = executionContext.switchToHttp().getRequest();

    // 从请求头中获取租户信息
    let tenantId = request.headers['x-tenant-id'];
    let organizationId = request.headers['x-organization-id'];
    let departmentIds = request.headers['x-department-ids']?.split(',') || [];
    let isolationLevel =
      (request.headers['x-isolation-level'] as DataIsolationLevel) ||
      DataIsolationLevel.TENANT;

    // 如果请求头中没有，从请求体中获取
    if (!tenantId) {
      tenantId = request.body.tenantId as string;
      organizationId = request.body.organizationId as string;
      departmentIds = request.body.departmentIds as string[];
      isolationLevel = request.body.isolationLevel as DataIsolationLevel;
    }

    // 如果请求体中没有，从查询参数中获取
    if (!tenantId) {
      tenantId = request.query.tenantId as string;
      organizationId = request.query.organizationId as string;
      const queryDeptIds = request.query.departmentIds;
      departmentIds = Array.isArray(queryDeptIds)
        ? (queryDeptIds as string[])
        : typeof queryDeptIds === 'string'
          ? queryDeptIds.split(',')
          : [];
      isolationLevel =
        (request.query.isolationLevel as DataIsolationLevel) ||
        DataIsolationLevel.TENANT;
    }

    // 如果查询参数中没有，从路径参数中获取
    if (!tenantId) {
      tenantId = request.params.tenantId as string;
      organizationId = request.params.organizationId as string;
      const paramDeptIds = request.params.departmentIds;
      departmentIds = Array.isArray(paramDeptIds)
        ? (paramDeptIds as string[])
        : typeof paramDeptIds === 'string'
          ? paramDeptIds.split(',')
          : [];
      isolationLevel =
        (request.params.isolationLevel as DataIsolationLevel) ||
        DataIsolationLevel.TENANT;
    }

    if (!tenantId) {
      return null;
    }

    return {
      tenantId,
      organizationId,
      departmentIds,
      isolationLevel,
    };
  }
}
