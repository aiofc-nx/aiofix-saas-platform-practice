/**
 * @class LoggingInterceptor
 * @description
 * 日志拦截器，用于记录API请求和响应的详细信息。
 * 包括请求参数、响应数据、执行时间等关键信息。
 *
 * 原理与机制：
 * 1. 在请求开始时记录请求信息
 * 2. 在请求结束时记录响应信息
 * 3. 在发生错误时记录错误信息
 * 4. 计算请求执行时间
 *
 * 功能与职责：
 * 1. 记录HTTP请求详情
 * 2. 记录HTTP响应详情
 * 3. 记录错误信息
 * 4. 记录性能指标
 *
 * @example
 * ```typescript
 * // 在控制器上使用
 * @UseInterceptors(LoggingInterceptor)
 * export class UserController {}
 *
 * // 全局使用
 * app.useGlobalInterceptors(new LoggingInterceptor());
 * ```
 * @since 1.0.0
 */

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { FastifyRequest, FastifyReply } from 'fastify';

/**
 * @class LoggingInterceptor
 * @description
 * 日志拦截器，用于记录API请求和响应的详细信息。
 * 包括请求参数、响应数据、执行时间等关键信息。
 *
 * 原理与机制：
 * 1. 在请求开始时记录请求信息
 * 2. 在请求结束时记录响应信息
 * 3. 在发生错误时记录错误信息
 * 4. 计算请求执行时间
 *
 * 功能与职责：
 * 1. 记录HTTP请求详情
 * 2. 记录HTTP响应详情
 * 3. 记录错误信息
 * 4. 记录性能指标
 *
 * @example
 * ```typescript
 * // 在控制器上使用
 * @UseInterceptors(LoggingInterceptor)
 * export class UserController {}
 *
 * // 全局使用
 * app.useGlobalInterceptors(new LoggingInterceptor());
 * ```
 * @since 1.0.0
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  /**
   * 拦截请求并记录日志
   * @param context 执行上下文
   * @param next 下一个处理器
   * @returns 响应流
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const response = context.switchToHttp().getResponse<FastifyReply>();
    const startTime = Date.now();

    // 记录请求开始
    this.logRequestStart(request, startTime);

    return next.handle().pipe(
      tap((_data: Record<string, unknown>) => {
        this.logRequestSuccess(request, response, startTime, _data);
      }),
      catchError((_error: unknown) => {
        this.logRequestError(request, response, startTime, _error as Error);
        throw _error;
      }),
    );
  }

  /**
   * 记录请求开始
   * @param request Fastify请求对象
   * @param startTime 开始时间
   */
  private logRequestStart(request: FastifyRequest, startTime: number): void {
    const logData = {
      timestamp: new Date().toISOString(),
      level: 'INFO',
      message: 'HTTP Request Started',
      method: request.method,
      url: request.url,
      userAgent: request.headers['user-agent'],
      ipAddress: request.ip,
      userId: (request as any).user?.id,
      tenantId: request.headers['x-tenant-id'],
      startTime,
    };

    this.logger.log(
      '🔵 [LoggingInterceptor] Request Started:',
      JSON.stringify(logData, null, 2),
    );
  }

  /**
   * 记录请求成功
   * @param request Fastify请求对象
   * @param response Fastify响应对象
   * @param startTime 开始时间
   * @param data 响应数据
   */
  private logRequestSuccess(
    request: FastifyRequest,
    response: FastifyReply,
    startTime: number,
    _data: Record<string, unknown>,
  ): void {
    const endTime = Date.now();
    const duration = endTime - startTime;

    const logData = {
      timestamp: new Date().toISOString(),
      level: 'INFO',
      message: 'HTTP Request Completed',
      method: request.method,
      url: request.url,
      statusCode: response.statusCode,
      duration: `${duration}ms`,
      userId: (request as any).user?.id,
      tenantId: request.headers['x-tenant-id'],
      responseSize: JSON.stringify(_data).length,
    };

    this.logger.log(
      '🟢 [LoggingInterceptor] Request Completed:',
      JSON.stringify(logData, null, 2),
    );
  }

  /**
   * 记录请求错误
   * @param request Fastify请求对象
   * @param response Fastify响应对象
   * @param startTime 开始时间
   * @param error 错误对象
   */
  private logRequestError(
    request: FastifyRequest,
    response: FastifyReply,
    startTime: number,
    _error: Error,
  ): void {
    const endTime = Date.now();
    const duration = endTime - startTime;

    const logData = {
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      message: 'HTTP Request Failed',
      method: request.method,
      url: request.url,
      statusCode: response.statusCode || 500,
      duration: `${duration}ms`,
      userId: (request as any).user?.id,
      tenantId: request.headers['x-tenant-id'],
      error: {
        name: _error.name,
        message: _error.message,
        stack: _error.stack,
      },
    };

    this.logger.error(
      '🔴 [LoggingInterceptor] Request Failed:',
      JSON.stringify(logData, null, 2),
    );
  }
}
