import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

/**
 * 审计拦截器
 * @description 拦截请求并记录审计日志
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const startTime = Date.now();

    // 记录请求开始
    this.logRequestStart(request);

    return next.handle().pipe(
      tap(data => {
        const duration = Date.now() - startTime;
        this.logRequestComplete(request, duration, 'success', data);
      }),
      catchError(error => {
        const duration = Date.now() - startTime;
        this.logRequestComplete(request, duration, 'error', error);
        throw error;
      }),
    );
  }

  private logRequestStart(request: any): void {
    this.logger.log('请求开始', {
      method: request.method,
      url: request.url,
      userId: request.user?.id,
      tenantId: request.headers['x-tenant-id'],
      timestamp: new Date(),
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
    });
  }

  private logRequestComplete(
    request: any,
    duration: number,
    status: string,
    data: any,
  ): void {
    this.logger.log('请求完成', {
      method: request.method,
      url: request.url,
      userId: request.user?.id,
      tenantId: request.headers['x-tenant-id'],
      timestamp: new Date(),
      duration,
      status,
      responseSize: JSON.stringify(data).length,
    });
  }
}
