import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Logger } from '@nestjs/common';

/**
 * 错误处理拦截器
 * @description 拦截错误并实现统一错误处理
 */
@Injectable()
export class ErrorHandlingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ErrorHandlingInterceptor.name);

  /**
   * 拦截错误并实现统一处理
   * @param context 执行上下文
   * @param next 下一个处理器
   * @returns 可观察对象
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    return next.handle().pipe(
      catchError(error => {
        // 记录错误日志
        this.logger.error('请求处理失败', {
          url: request.url,
          method: request.method,
          userId: request.user?.id,
          tenantId: request.headers['x-tenant-id'],
          error: {
            name: error.name,
            message: error.message,
            stack: error.stack,
          },
        });

        // 如果是已知的HTTP异常，直接抛出
        if (error instanceof HttpException) {
          return throwError(() => error);
        }

        // 对于未知错误，转换为内部服务器错误
        const internalError = new HttpException(
          '内部服务器错误',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );

        return throwError(() => internalError);
      }),
    );
  }
}
