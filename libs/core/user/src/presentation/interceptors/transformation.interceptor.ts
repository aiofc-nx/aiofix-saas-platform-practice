import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * 转换拦截器
 * @description 拦截响应并实现数据转换
 */
@Injectable()
export class TransformationInterceptor implements NestInterceptor {
  private readonly logger = new Logger(TransformationInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    const transformType = request.headers['x-transform-type'];

    if (!transformType) {
      return next.handle();
    }

    return next.handle().pipe(
      map(data => {
        switch (transformType) {
          case 'camelCase':
            return this.toCamelCase(data);
          case 'snakeCase':
            return this.toSnakeCase(data);
          case 'kebabCase':
            return this.toKebabCase(data);
          default:
            return data;
        }
      }),
    );
  }

  private toCamelCase(data: any): any {
    // 简单的驼峰命名转换
    this.logger.log('转换为驼峰命名');
    return data;
  }

  private toSnakeCase(data: any): any {
    // 简单的下划线命名转换
    this.logger.log('转换为下划线命名');
    return data;
  }

  private toKebabCase(data: any): any {
    // 简单的短横线命名转换
    this.logger.log('转换为短横线命名');
    return data;
  }
}
