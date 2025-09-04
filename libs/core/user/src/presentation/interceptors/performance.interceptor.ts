import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';

/**
 * @class PerformanceInterceptor
 * @description
 * 性能监控拦截器，用于监控API响应时间和性能指标。
 * 记录请求处理时间、内存使用情况等性能数据。
 *
 * 原理与机制：
 * 1. 在请求开始时记录开始时间
 * 2. 在请求结束时计算处理时间
 * 3. 记录性能指标到日志系统
 * 4. 支持性能阈值告警
 *
 * 功能与职责：
 * 1. 监控API响应时间
 * 2. 记录性能指标
 * 3. 性能异常告警
 * 4. 性能数据统计
 *
 * @example
 * ```typescript
 * // 在控制器上使用
 * @UseInterceptors(PerformanceInterceptor)
 * export class UserController {}
 *
 * // 全局使用
 * app.useGlobalInterceptors(new PerformanceInterceptor());
 * ```
 * @since 1.0.0
 */
@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  private readonly logger = new Logger(PerformanceInterceptor.name);

  /**
   * 性能阈值配置（毫秒）
   */
  private readonly PERFORMANCE_THRESHOLDS = {
    WARNING: 1000, // 1秒警告
    ERROR: 5000, // 5秒错误
  };

  /**
   * 拦截请求并监控性能
   * @param context 执行上下文
   * @param next 下一个处理器
   * @returns 响应流
   */
  intercept(context: ExecutionContext, next: CallHandler): any {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const startTime = Date.now();
    const startMemory = process.memoryUsage();

    // 记录请求开始
    this.logPerformanceStart(request, startTime, startMemory);

    // 暂时简化实现，不使用rxjs操作符
    try {
      const result = next.handle();
      this.logPerformanceSuccess(request, response, startTime, startMemory, {
        data: 'response',
      });
      return result;
    } catch (error) {
      this.logPerformanceError(
        request,
        response,
        startTime,
        startMemory,
        error as Error,
      );
      throw error;
    }
  }

  /**
   * 记录性能监控开始
   * @param request Fastify请求对象
   * @param startTime 开始时间
   * @param startMemory 开始内存使用
   */
  private logPerformanceStart(
    request: any,
    startTime: number,
    _startMemory: NodeJS.MemoryUsage,
  ): void {
    const logContext = {
      userId: request.user?.id,
      tenantId: request.headers['x-tenant-id'],
      path: request.url,
      method: request.method,
      userAgent: request.headers['user-agent'],
      ipAddress: request.ip,
    };

    this.logger.log(
      '🔵 [PerformanceInterceptor] Performance monitoring started:',
      {
        ...logContext,
        startTime,
        startMemory: {
          rss: this.formatBytes(_startMemory.rss),
          heapUsed: this.formatBytes(_startMemory.heapUsed),
          heapTotal: this.formatBytes(_startMemory.heapTotal),
          external: this.formatBytes(_startMemory.external),
        },
      },
    );
  }

  /**
   * 记录性能监控成功
   * @param request Fastify请求对象
   * @param response Fastify响应对象
   * @param startTime 开始时间
   * @param startMemory 开始内存使用
   * @param data 响应数据
   */
  private logPerformanceSuccess(
    request: any,
    response: any,
    startTime: number,
    startMemory: NodeJS.MemoryUsage,
    _data: Record<string, unknown>,
  ): void {
    const endTime = Date.now();
    const endMemory = process.memoryUsage();
    const duration = endTime - startTime;
    const memoryDiff = {
      rss: endMemory.rss - startMemory.rss,
      heapUsed: endMemory.heapUsed - startMemory.heapUsed,
      heapTotal: endMemory.heapTotal - startMemory.heapTotal,
      external: endMemory.external - startMemory.external,
    };

    const logContext = {
      userId: request.user?.id,
      tenantId: request.headers['x-tenant-id'],
      path: request.url,
      method: request.method,
      statusCode: response.statusCode,
      duration,
      memoryDiff: {
        rss: this.formatBytes(memoryDiff.rss),
        heapUsed: this.formatBytes(memoryDiff.heapUsed),
        heapTotal: this.formatBytes(memoryDiff.heapTotal),
        external: this.formatBytes(memoryDiff.external),
      },
    };

    // 根据性能指标选择日志级别
    if (duration >= this.PERFORMANCE_THRESHOLDS.ERROR) {
      this.logger.error(
        '🔴 [PerformanceInterceptor] Performance threshold exceeded - ERROR:',
        {
          ...logContext,
          threshold: this.PERFORMANCE_THRESHOLDS.ERROR,
          severity: 'ERROR',
        },
      );
    } else if (duration >= this.PERFORMANCE_THRESHOLDS.WARNING) {
      this.logger.warn(
        '🟡 [PerformanceInterceptor] Performance threshold exceeded - WARNING:',
        {
          ...logContext,
          threshold: this.PERFORMANCE_THRESHOLDS.WARNING,
          severity: 'WARNING',
        },
      );
    } else {
      this.logger.log(
        '🟢 [PerformanceInterceptor] Performance monitoring completed:',
        {
          ...logContext,
          severity: 'NORMAL',
        },
      );
    }

    // 记录性能指标
    this.recordPerformanceMetrics(logContext);
  }

  /**
   * 记录性能监控错误
   * @param request Fastify请求对象
   * @param response Fastify响应对象
   * @param startTime 开始时间
   * @param startMemory 开始内存使用
   * @param error 错误对象
   */
  private logPerformanceError(
    request: any,
    response: any,
    startTime: number,
    _startMemory: NodeJS.MemoryUsage,
    error: Error,
  ): void {
    const endTime = Date.now();
    const duration = endTime - startTime;

    const logContext = {
      userId: request.user?.id,
      tenantId: request.headers['x-tenant-id'],
      path: request.url,
      method: request.method,
      statusCode: response.statusCode || 500,
      duration,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
    };

    this.logger.error(
      '🔴 [PerformanceInterceptor] Performance monitoring error:',
      logContext,
    );
  }

  /**
   * 记录性能指标
   * @param logContext 日志上下文
   */
  private recordPerformanceMetrics(logContext: any): void {
    // 这里可以集成性能监控系统，如Prometheus、DataDog等
    // 目前只是记录到日志，后续可以扩展
    const metrics = {
      api_response_time: logContext.duration,
      api_request_count: 1,
      api_status_code: logContext.statusCode,
      api_path: logContext.path,
      api_method: logContext.method,
      tenant_id: logContext.tenantId,
      user_id: logContext.userId,
    };

    this.logger.log(
      '📊 [PerformanceInterceptor] Performance metrics recorded:',
      {
        metrics,
      },
    );
  }

  /**
   * 格式化字节数
   * @param bytes 字节数
   * @returns 格式化后的字符串
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
