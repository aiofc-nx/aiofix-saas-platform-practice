import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';

/**
 * 解密拦截器
 * @description 拦截请求并实现数据解密
 */
@Injectable()
export class DecryptionInterceptor implements NestInterceptor {
  private readonly logger = new Logger(DecryptionInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    const isEncrypted = request.headers['x-data-encrypted'] === 'true';

    if (isEncrypted && request.body) {
      try {
        const decryptedData = this.decrypt(request.body);
        request.body = decryptedData;
        this.logger.log('数据解密完成');
      } catch {
        throw new Error('数据解密失败');
      }
    }

    return next.handle();
  }

  private decrypt(encryptedData: any): any {
    // 简单的解密实现（实际项目中应该使用真正的解密库）
    if (typeof encryptedData === 'string') {
      try {
        const buffer = Buffer.from(encryptedData, 'base64');
        const jsonString = buffer.toString('utf8');
        return JSON.parse(jsonString);
      } catch {
        throw new Error('解密失败');
      }
    }
    return encryptedData;
  }
}
