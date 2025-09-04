import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * 指标拦截器
 * @description 拦截请求并记录性能指标
 */
@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  private readonly logger = new Logger(MetricsInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const startTime = Date.now();

    this.recordRequestStart({
      method: request.method,
      path: request.url,
      userId: request.user?.id,
      tenantId: request.headers['x-tenant-id'],
      timestamp: new Date(),
    });

    return next.handle().pipe(
      tap(data => {
        const duration = Date.now() - startTime;
        this.recordRequestComplete({
          method: request.method,
          path: request.url,
          userId: request.user?.id,
          tenantId: request.headers['x-tenant-id'],
          timestamp: new Date(),
          duration,
          status: 'success',
          responseSize: JSON.stringify(data).length,
        });
      }),
    );
  }

  private recordRequestStart(metrics: any): void {
    this.logger.log('请求开始指标', metrics);
  }

  private recordRequestComplete(metrics: any): void {
    this.logger.log('请求完成指标', metrics);
  }
}
