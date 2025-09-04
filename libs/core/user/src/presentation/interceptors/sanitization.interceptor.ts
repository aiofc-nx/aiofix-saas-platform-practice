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
 * 清理拦截器
 * @description 拦截响应并实现数据清理
 */
@Injectable()
export class SanitizationInterceptor implements NestInterceptor {
  private readonly logger = new Logger(SanitizationInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    const sanitizeLevel = request.headers['x-sanitize-level'] || 'basic';

    if (sanitizeLevel === 'none') {
      return next.handle();
    }

    return next.handle().pipe(
      map(data => {
        switch (sanitizeLevel) {
          case 'basic': {
            return this.sanitizeBasic(data);
          }
          case 'strict': {
            return this.sanitizeStrict(data);
          }
          case 'custom': {
            const customRules = request.headers['x-sanitize-rules'];
            return this.sanitizeCustom(data, customRules);
          }
          default:
            return data;
        }
      }),
    );
  }

  private sanitizeBasic(data: any): any {
    this.logger.log('执行基础清理');
    return data;
  }

  private sanitizeStrict(data: any): any {
    this.logger.log('执行严格清理');
    return data;
  }

  private sanitizeCustom(data: any, rules: any): any {
    this.logger.log('执行自定义清理', { rules });
    return data;
  }
}
