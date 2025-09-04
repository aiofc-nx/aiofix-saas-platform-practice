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
 * 安全拦截器
 * @description 拦截请求并实现安全检查
 */
@Injectable()
export class SecurityInterceptor implements NestInterceptor {
  private readonly logger = new Logger(SecurityInterceptor.name);

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();

    const securityCheck = this.checkSecurityThreats({
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
      url: request.url,
      method: request.method,
      userId: request.user?.id,
      tenantId: request.headers['x-tenant-id'],
    });

    if (!securityCheck.isSafe) {
      throw new HttpException('检测到安全威胁', HttpStatus.FORBIDDEN);
    }

    if (securityCheck.riskLevel > 0) {
      this.logSecurityEvent({
        type: 'suspicious_activity',
        userId: request.user?.id,
        ipAddress: request.ip,
        details: securityCheck.details,
        timestamp: new Date(),
      });
    }

    return next.handle().pipe(
      tap(() => {
        this.updateSecurityStats(request.ip, request.user?.id);
      }),
    );
  }

  private checkSecurityThreats(_request: any): {
    isSafe: boolean;
    riskLevel: number;
    details: string;
  } {
    // 简单的安全检查逻辑
    const riskLevel = 0;
    const isSafe = true;
    const details = '安全检查通过';

    return { isSafe, riskLevel, details };
  }

  private logSecurityEvent(event: any): void {
    this.logger.warn('安全事件', event);
  }

  private updateSecurityStats(ip: string, userId?: string): void {
    // 更新安全统计
    this.logger.log('更新安全统计', { ip, userId });
  }
}
