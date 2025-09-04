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
 * 压缩拦截器
 * @description 拦截响应并实现数据压缩
 */
@Injectable()
export class CompressionInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CompressionInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const acceptEncoding = request.headers['accept-encoding'] || '';
    const supportsCompression =
      acceptEncoding.includes('gzip') || acceptEncoding.includes('deflate');

    if (!supportsCompression) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(data => {
        const compressedData = this.compress(data);
        response.setHeader('Content-Encoding', 'gzip');
        response.setHeader('Content-Length', compressedData.length);
        this.logger.log('数据压缩完成', {
          originalSize: JSON.stringify(data).length,
          compressedSize: compressedData.length,
        });
      }),
    );
  }

  private compress(data: any): Buffer {
    // 简单的压缩实现（实际项目中应该使用真正的压缩库）
    const jsonString = JSON.stringify(data);
    return Buffer.from(jsonString, 'utf8');
  }
}
