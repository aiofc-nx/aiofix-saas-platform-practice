import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * 限流拦截器
 * @description 拦截请求并实现限流逻辑
 */
@Injectable()
export class RateLimitingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RateLimitingInterceptor.name);
  private readonly requestCounts = new Map<
    string,
    { count: number; resetTime: number }
  >();

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id || request.ip;
    const endpoint = `${request.method}:${request.url}`;

    const isAllowed = this.checkRateLimit(userId, endpoint);

    if (!isAllowed) {
      throw new HttpException(
        '请求过于频繁，请稍后再试',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    this.recordRequest(userId, endpoint);

    return next.handle().pipe(
      tap(() => {
        this.updateStats(userId, endpoint);
      }),
    );
  }

  private checkRateLimit(userId: string, endpoint: string): boolean {
    const key = `${userId}:${endpoint}`;
    const now = Date.now();
    const limit = 100; // 每分钟100次请求
    const windowMs = 60 * 1000; // 1分钟窗口

    const current = this.requestCounts.get(key);
    if (!current || now > current.resetTime) {
      this.requestCounts.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (current.count >= limit) {
      return false;
    }

    current.count++;
    return true;
  }

  private recordRequest(userId: string, endpoint: string): void {
    // 记录请求
    this.logger.log('记录请求', { userId, endpoint });
  }

  private updateStats(userId: string, endpoint: string): void {
    // 更新统计
    this.logger.log('更新统计', { userId, endpoint });
  }
}
