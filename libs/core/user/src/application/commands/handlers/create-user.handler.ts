/**
 * @class CreateUserHandler
 * @description
 * 创建用户命令处理器，负责处理CreateUserCommand命令。
 *
 * 原理与机制：
 * 1. 作为CQRS模式中的命令处理器，CreateUserHandler实现命令的具体执行逻辑
 * 2. 使用依赖注入获取必要的服务
 * 3. 通过事件总线发布领域事件
 * 4. 确保命令执行的原子性和一致性
 * 5. 使用自定义的PinoLoggerService进行结构化日志记录
 *
 * 功能与职责：
 * 1. 处理用户创建命令
 * 2. 协调领域服务执行业务逻辑
 * 3. 发布相关领域事件
 * 4. 处理命令执行结果
 * 5. 记录结构化操作日志
 *
 * @example
 * ```typescript
 * const handler = new CreateUserHandler(createUserUseCase, eventBus);
 * await handler.execute(command);
 * ```
 * @since 1.0.0
 */

import { Injectable } from '@nestjs/common';
import { ICommandHandler } from '@nestjs/cqrs';
import { CreateUserCommand } from '../create-user.command';
import { CreateUserUseCase } from '../../use-cases/create-user.usecase';
import { EventBus } from '@nestjs/cqrs';
import { UserCreatedEvent } from '../../../domain/domain-events/user-created.event';
import { PinoLoggerService } from '@aiofix/logging';
import { LogContext } from '@aiofix/logging';

/**
 * 创建用户命令处理器
 * @description 处理用户创建命令
 */
@Injectable()
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  private readonly logger: PinoLoggerService;

  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly eventBus: EventBus,
    logger: PinoLoggerService,
  ) {
    this.logger = logger;
  }

  /**
   * 执行创建用户命令
   * @description 处理用户创建命令并执行相关业务逻辑
   * @param {CreateUserCommand} command 创建用户命令
   * @returns {Promise<string>} 创建的用户ID
   */
  async execute(command: CreateUserCommand): Promise<string> {
    try {
      this.logger.info('开始执行创建用户命令', LogContext.BUSINESS, {
        commandId: command.commandId,
        username: command.username.toString(),
        email: command.email.toString(),
        tenantId: command.tenantId.toString(),
        organizationId: command.organizationId,
        departmentIds: command.departmentIds,
        userType: command.userType,
        dataPrivacyLevel: command.dataPrivacyLevel,
      });

      // 1. 转换命令为用例请求
      const request = {
        username: command.username.toString(),
        email: command.email.toString(),
        password: 'temporary-password', // TODO: Generate secure password
        phone: command.phone?.toString(),
        tenantId: command.tenantId.toString(),
        organizationId: command.organizationId,
        departmentIds: command.departmentIds,
        userType: command.userType,
        displayName: command.profile?.displayName,
        currentUserId: 'system', // TODO: Get from context
      };

      // 2. 执行用户创建用例
      const result = await this.createUserUseCase.execute(request);

      if (!result.success) {
        this.logger.error('用户创建用例执行失败', LogContext.BUSINESS, {
          commandId: command.commandId,
          username: command.username.toString(),
          email: command.email.toString(),
          message: result.message,
        });
        throw new Error(`用户创建失败: ${result.message}`);
      }

      this.logger.info('用户创建用例执行成功', LogContext.BUSINESS, {
        commandId: command.commandId,
        userId: result.userId,
        username: result.username,
        email: result.email,
        tenantId: result.tenantId,
      });

      // 3. 发布用户创建事件
      await this.eventBus.publish(
        new UserCreatedEvent(
          result.userId,
          result.username,
          result.email,
          result.tenantId || command.tenantId.toString(),
          command.organizationId || undefined,
          command.departmentIds,
          command.userType,
          command.dataPrivacyLevel,
        ),
      );

      this.logger.info('用户创建事件发布成功', LogContext.EVENT, {
        commandId: command.commandId,
        userId: result.userId,
        eventType: 'UserCreated',
      });

      // 4. 返回创建的用户ID
      return result.userId;
    } catch (error) {
      // 5. 处理错误情况
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      const errorName = error instanceof Error ? error.name : 'UnknownError';

      this.logger.error('处理创建用户命令失败', LogContext.BUSINESS, {
        commandId: command.commandId,
        username: command.username.toString(),
        email: command.email.toString(),
        tenantId: command.tenantId.toString(),
        error: {
          message: errorMessage,
          stack: errorStack,
          name: errorName,
        },
      });

      // 发布用户创建失败事件
      await this.eventBus.publish(
        new UserCreatedEvent(
          command.userId.toString(),
          command.username.toString(),
          command.email.toString(),
          command.tenantId.toString(),
          command.organizationId,
          command.departmentIds,
          command.userType,
          command.dataPrivacyLevel,
        ),
      );

      throw error;
    }
  }

  /**
   * 验证命令
   * @description 验证命令的有效性
   * @param {CreateUserCommand} command 创建用户命令
   * @returns {boolean} 命令是否有效
   */
  validate(command: CreateUserCommand): boolean {
    const isValid = !!(
      command &&
      command.username &&
      command.email &&
      command.tenantId &&
      command.commandId &&
      command.timestamp
    );

    this.logger.debug('验证创建用户命令', LogContext.BUSINESS, {
      commandId: command?.commandId,
      isValid,
      hasUsername: !!command?.username,
      hasEmail: !!command?.email,
      hasTenantId: !!command?.tenantId,
      hasCommandId: !!command?.commandId,
      hasTimestamp: !!command?.timestamp,
    });

    return isValid;
  }

  /**
   * 获取命令摘要
   * @description 返回命令的简要描述
   * @param {CreateUserCommand} command 创建用户命令
   * @returns {string} 命令摘要
   */
  getCommandSummary(command: CreateUserCommand): string {
    const summary = command.getSummary();

    this.logger.debug('获取命令摘要', LogContext.BUSINESS, {
      commandId: command.commandId,
      summary,
    });

    return summary;
  }
}
