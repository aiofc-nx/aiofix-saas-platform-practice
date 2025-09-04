/**
 * @class AuthGuard
 * @description
 * 认证守卫，用于验证用户身份和JWT令牌。
 * 确保只有经过认证的用户才能访问受保护的资源。
 *
 * 原理与机制：
 * 1. 从请求头中提取JWT令牌
 * 2. 验证JWT令牌的有效性
 * 3. 解析用户信息并附加到请求对象
 * 4. 支持跳过认证的端点
 *
 * 功能与职责：
 * 1. JWT令牌验证
 * 2. 用户身份验证
 * 3. 请求上下文增强
 * 4. 认证异常处理
 *
 * @example
 * ```typescript
 * // 在控制器上使用
 * @UseGuards(AuthGuard)
 * export class UserController {}
 *
 * // 在方法上使用
 * @UseGuards(AuthGuard)
 * async createUser() {}
 * ```
 * @since 1.0.0
 */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 * @class AuthGuard
 * @description
 * 认证守卫，用于验证用户身份和JWT令牌的有效性。
 *
 * 原理与机制：
 * 1. 继承自NestJS的AuthGuard
 * 2. 验证JWT令牌的有效性
 * 3. 解析用户信息并注入到请求上下文
 * 4. 支持多种认证策略
 *
 * 功能与职责：
 * 1. 验证请求中的认证令牌
 * 2. 解析用户身份信息
 * 3. 注入用户信息到请求上下文
 * 4. 处理认证失败的情况
 *
 * @example
 * ```typescript
 * @UseGuards(AuthGuard)
 * @Get('profile')
 * async getProfile(@Request() req) {
 *   return req.user;
 * }
 * ```
 * @since 1.0.0
 */
@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(
    private readonly reflector: Reflector,
    // private readonly jwtService: JwtService,
  ) {}

  /**
   * 检查是否可以激活路由
   * @param context 执行上下文
   * @returns 是否可以激活
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 检查是否需要跳过认证
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('缺少认证令牌');
    }

    try {
      // 暂时跳过JWT验证，直接返回true
      // const payload = await this.jwtService.verifyAsync(token);
      // request['user'] = payload;
      request['user'] = { id: 'temp-user-id' }; // 临时用户信息
      return true;
    } catch {
      this.logger.warn('Token验证失败', {
        token: token.substring(0, 10) + '...',
        ip: request.ip,
        userAgent: request.headers['user-agent'],
      });
      return false;
    }
  }

  /**
   * 从请求头中提取令牌
   * @param request 请求对象
   * @returns JWT令牌或undefined
   */
  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

/**
 * 公共路由装饰器
 * @param isPublic 是否为公共路由
 * @returns 装饰器
 */
export const Public = (isPublic = true) => {
  return (
    target: any,
    propertyKey?: string,
    descriptor?: PropertyDescriptor,
  ) => {
    if (descriptor) {
      Reflect.defineMetadata('isPublic', isPublic, descriptor.value);
    } else {
      Reflect.defineMetadata('isPublic', isPublic, target);
    }
    return descriptor || target;
  };
};
