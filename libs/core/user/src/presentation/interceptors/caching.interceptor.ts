import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * 缓存拦截器
 * @description 拦截响应并实现缓存逻辑
 */
@Injectable()
export class CachingInterceptor implements NestInterceptor {
  private readonly cache = new Map<string, { data: any; expiresAt: number }>();

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const cacheKey = this.generateCacheKey(request);

    // 检查缓存
    const cached = this.get(cacheKey);
    if (cached) {
      return of(cached);
    }

    return next.handle().pipe(
      tap(data => {
        this.set(cacheKey, data, 300); // 缓存5分钟
      }),
    );
  }

  private generateCacheKey(request: any): string {
    const { method, url, query, body, user } = request;
    const userId = user?.id || 'anonymous';
    return `cache:${method}:${url}:${userId}:${JSON.stringify(query)}:${JSON.stringify(body)}`;
  }

  private get(key: string): any {
    const cached = this.cache.get(key);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.data;
    }
    if (cached) {
      this.cache.delete(key);
    }
    return null;
  }

  private set(key: string, data: any, ttlSeconds: number): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }
}
