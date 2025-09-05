/**
 * @class TenantEventProjectionService
 * @description
 * 租户事件投影服务，负责管理租户事件的处理和MongoDB查询端数据的同步。
 *
 * 注意：这是一个简化版本，实际实现需要根据具体的事件存储和MongoDB仓储接口来调整。
 * @since 1.0.0
 */

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { PinoLoggerService } from '@aiofix/logging';
import { LogContext } from '@aiofix/logging';
import {
  TenantCreatedEventHandler,
  TenantActivatedEventHandler,
  TenantSuspendedEventHandler,
  TenantResumedEventHandler,
  TenantDeletedEventHandler,
  TenantConfigChangedEventHandler,
} from './tenant-event-projection.handler';

/**
 * 租户事件投影服务类
 * @description 管理租户事件处理和MongoDB数据同步
 */
@Injectable()
export class TenantEventProjectionService
  implements OnModuleInit, OnModuleDestroy
{
  private isRunning = false;
  private eventHandlers: any[] = [];

  constructor(
    private readonly eventBus: EventBus,
    private readonly logger: PinoLoggerService,
    // 注入所有事件处理器
    private readonly tenantCreatedHandler: TenantCreatedEventHandler,
    private readonly tenantActivatedHandler: TenantActivatedEventHandler,
    private readonly tenantSuspendedHandler: TenantSuspendedEventHandler,
    private readonly tenantResumedHandler: TenantResumedEventHandler,
    private readonly tenantDeletedHandler: TenantDeletedEventHandler,
    private readonly tenantConfigChangedHandler: TenantConfigChangedEventHandler,
  ) {
    this.eventHandlers = [
      tenantCreatedHandler,
      tenantActivatedHandler,
      tenantSuspendedHandler,
      tenantResumedHandler,
      tenantDeletedHandler,
      tenantConfigChangedHandler,
    ];
  }

  /**
   * 模块初始化时启动事件投影服务
   */
  async onModuleInit(): Promise<void> {
    try {
      await this.start();
      this.logger.info(
        'TenantEventProjectionService initialized successfully',
        LogContext.BUSINESS,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to initialize TenantEventProjectionService: ${errorMessage}`,
        LogContext.BUSINESS,
        { error: errorMessage },
      );
      throw error;
    }
  }

  /**
   * 模块销毁时停止事件投影服务
   */
  async onModuleDestroy(): Promise<void> {
    try {
      await this.stop();
      this.logger.info(
        'TenantEventProjectionService destroyed successfully',
        LogContext.BUSINESS,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to destroy TenantEventProjectionService: ${errorMessage}`,
        LogContext.BUSINESS,
        { error: errorMessage },
      );
    }
  }

  /**
   * 启动事件投影服务
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      this.logger.warn(
        'TenantEventProjectionService is already running',
        LogContext.BUSINESS,
      );
      return;
    }

    try {
      // 注册所有事件处理器到事件总线
      this.eventBus.register(this.eventHandlers);

      this.isRunning = true;
      this.logger.info(
        'TenantEventProjectionService started successfully',
        LogContext.BUSINESS,
        {
          handlersCount: this.eventHandlers.length,
          handlers: this.eventHandlers.map(handler => handler.constructor.name),
        },
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to start TenantEventProjectionService: ${errorMessage}`,
        LogContext.BUSINESS,
        { error: errorMessage },
      );
      throw error;
    }
  }

  /**
   * 停止事件投影服务
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      this.logger.warn(
        'TenantEventProjectionService is not running',
        LogContext.BUSINESS,
      );
      return;
    }

    try {
      // 注意：NestJS CQRS的EventBus没有unregister方法
      // 这里只是标记服务为停止状态
      this.isRunning = false;
      this.logger.info(
        'TenantEventProjectionService stopped successfully',
        LogContext.BUSINESS,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to stop TenantEventProjectionService: ${errorMessage}`,
        LogContext.BUSINESS,
        { error: errorMessage },
      );
      throw error;
    }
  }

  /**
   * 获取服务健康状态
   */
  async getHealthStatus(): Promise<{
    isRunning: boolean;
    handlersCount: number;
    lastActivity?: Date;
  }> {
    return {
      isRunning: this.isRunning,
      handlersCount: this.eventHandlers.length,
      lastActivity: new Date(),
    };
  }

  /**
   * 检查服务是否正在运行
   */
  isServiceRunning(): boolean {
    return this.isRunning;
  }

  /**
   * 获取已注册的事件处理器列表
   */
  getRegisteredHandlers(): string[] {
    return this.eventHandlers.map(handler => handler.constructor.name);
  }
}
