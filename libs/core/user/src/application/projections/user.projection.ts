/**
 * @description 用户投影服务
 * @author 江郎
 * @since 2.1.0
 */

import { Injectable } from '@nestjs/common';
import { PinoLoggerService } from '@aiofix/logging';
import { LogContext } from '@aiofix/logging';

// 用户投影接口
export interface UserProjection {
  handle(event: any): Promise<void>;
}

// 用户投影服务实现
@Injectable()
export class UserProjectionService implements UserProjection {
  private readonly logger: PinoLoggerService;

  constructor(logger: PinoLoggerService) {
    this.logger = logger;
  }

  async handle(event: any): Promise<void> {
    this.logger.info('处理用户事件', LogContext.EVENT, {
      eventType: event.type,
      eventId: event.id,
    });

    switch (event.type) {
      case 'UserCreated':
        await this.handleUserCreated(event);
        break;
      case 'UserUpdated':
        await this.handleUserUpdated(event);
        break;
      case 'UserDeleted':
        await this.handleUserDeleted(event);
        break;
      default:
        this.logger.warn('未知的用户事件类型', LogContext.EVENT, {
          eventType: event.type,
        });
    }
  }

  private async handleUserCreated(event: any): Promise<void> {
    this.logger.info('处理用户创建事件', LogContext.EVENT, {
      userId: event.data.userId,
    });
  }

  private async handleUserUpdated(event: any): Promise<void> {
    this.logger.info('处理用户更新事件', LogContext.EVENT, {
      userId: event.data.userId,
    });
  }

  private async handleUserDeleted(event: any): Promise<void> {
    this.logger.info('处理用户删除事件', LogContext.EVENT, {
      userId: event.data.userId,
    });
  }
}
