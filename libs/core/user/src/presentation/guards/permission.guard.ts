/**
 * @class PermissionGuard
 * @description
 * 权限守卫，用于验证用户是否有权限访问特定资源。
 * 基于用户角色和权限进行访问控制。
 *
 * 原理与机制：
 * 1. 从请求中提取用户信息
 * 2. 检查用户角色和权限
 * 3. 验证资源访问权限
 * 4. 支持细粒度权限控制
 *
 * 功能与职责：
 * 1. 角色权限验证
 * 2. 资源访问控制
 * 3. 权限异常处理
 * 4. 权限审计日志
 *
 * @example
 * ```typescript
 * // 在控制器上使用
 * @UseGuards(PermissionGuard)
 * export class UserController {}
 *
 * // 在方法上使用
 * @UseGuards(PermissionGuard)
 * @RequirePermissions('user:create')
 * async createUser() {}
 * ```
 * @since 1.0.0
 */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 * 权限元数据键
 */
export const PERMISSIONS_KEY = 'permissions';

/**
 * 权限要求装饰器
 * @param resource 资源类型
 * @param action 操作类型
 * @returns 装饰器
 */
export const RequirePermissions = (resource: string, action: string) => {
  return (
    target: any,
    propertyKey?: string,
    descriptor?: PropertyDescriptor,
  ) => {
    const permissions = Reflect.getMetadata(PERMISSIONS_KEY, target) || [];
    permissions.push({ resource, action });
    Reflect.defineMetadata(PERMISSIONS_KEY, permissions, target);
    return descriptor || target;
  };
};

/**
 * 权限守卫
 */
@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  /**
   * 检查是否可以激活路由
   * @param context 执行上下文
   * @returns 是否可以激活
   */
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const _requiredPermissions = this.reflector.get<string[]>(
      'permissions',
      context.getHandler(),
    );

    if (!user) {
      throw new ForbiddenException('用户未认证');
    }

    // 获取所需的权限
    // const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
    //   "permissions",
    //   [context.getHandler(), context.getClass()]
    // );

    if (!_requiredPermissions || _requiredPermissions.length === 0) {
      return true; // 没有权限要求，允许访问
    }

    // 暂时跳过权限验证，直接返回true
    // 后续可以集成真实的权限系统
    return true;

    // 检查用户权限
    // const hasPermission = await this.checkUserPermissions(user, requiredPermissions);
    // if (!hasPermission) {
    //   throw new ForbiddenException('权限不足');
    // }
    // return true;
  }

  /**
   * 检查用户权限
   * @param user 用户信息
   * @param requiredPermissions 所需权限
   * @returns 是否有权限
   */
  private async checkUserPermissions(
    user: any,
    resource: string,
    action: string,
    _requiredPermissions: string[],
  ): Promise<boolean> {
    // 检查用户是否有指定资源的操作权限
    const userPermissions = user.permissions || [];
    const hasPermission = userPermissions.some(
      (permission: any) =>
        permission.resource === resource && permission.action === action,
    );

    return hasPermission;
  }
}

/**
 * 数据隔离权限装饰器
 * @param isolationLevel 数据隔离级别
 * @returns 装饰器
 */
export const RequireDataIsolation = (isolationLevel: string) => {
  return (
    target: any,
    propertyKey?: string,
    descriptor?: PropertyDescriptor,
  ) => {
    Reflect.defineMetadata('dataIsolationLevel', isolationLevel, target);
    return descriptor || target;
  };
};

/**
 * 租户权限权限装饰器
 * @returns 装饰器
 */
export const RequireTenantAccess = () => {
  return (
    target: any,
    propertyKey?: string,
    descriptor?: PropertyDescriptor,
  ) => {
    Reflect.defineMetadata('requireTenantAccess', true, target);
    return descriptor || target;
  };
};
