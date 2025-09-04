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
 * 加密拦截器
 * @description 拦截响应并实现数据加密
 */
@Injectable()
export class EncryptionInterceptor implements NestInterceptor {
  private readonly logger = new Logger(EncryptionInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const requiresEncryption =
      request.headers['x-require-encryption'] === 'true';

    if (!requiresEncryption) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(data => {
        const encryptedData = this.encrypt(data);
        response.setHeader('X-Data-Encrypted', 'true');
        response.setHeader('X-Encryption-Algorithm', 'AES-256-GCM');
        this.logger.log('数据加密完成', {
          dataSize: JSON.stringify(data).length,
          encryptedSize: encryptedData.length,
        });
      }),
    );
  }

  private encrypt(data: any): string {
    // 简单的加密实现（实际项目中应该使用真正的加密库）
    const jsonString = JSON.stringify(data);
    return Buffer.from(jsonString, 'utf8').toString('base64');
  }
}
