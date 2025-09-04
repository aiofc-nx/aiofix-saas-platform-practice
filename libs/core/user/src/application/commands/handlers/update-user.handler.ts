/**
 * @class UpdateUserHandler
 * @description
 * 更新用户命令处理器，负责处理UpdateUserCommand命令。
 *
 * 原理与机制：
 * 1. 作为CQRS模式中的命令处理器，UpdateUserHandler实现命令的具体执行逻辑
 * 2. 使用依赖注入获取必要的服务
 * 3. 通过事件总线发布领域事件
 * 4. 确保命令执行的原子性和一致性
 *
 * 功能与职责：
 * 1. 处理用户更新命令
 * 2. 协调领域服务执行业务逻辑
 * 3. 发布相关领域事件
 * 4. 处理命令执行结果
 *
 * @example
 * ```typescript
 * const handler = new UpdateUserHandler(updateUserUseCase, eventBus);
 * await handler.execute(command);
 * ```
 * @since 1.0.0
 */

import { Injectable } from '@nestjs/common';
import { ICommandHandler } from '@nestjs/cqrs';
import { UpdateUserCommand } from '../update-user.command';
import { UserManagementService } from '../../services/user-management.service';
import { EventBus } from '@nestjs/cqrs';
import { UserUpdatedEvent } from '../../../domain/domain-events/user-updated.event';
import { PinoLoggerService } from '@aiofix/logging';
import { LogContext } from '@aiofix/logging';

/**
 * 更新用户命令处理器
 * @description 处理用户更新命令
 */
@Injectable()
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand> {
  private readonly logger: PinoLoggerService;

  constructor(
    private readonly userManagementService: UserManagementService,
    private readonly eventBus: EventBus,
    logger: PinoLoggerService,
  ) {
    this.logger = logger;
  }

  /**
   * 执行更新用户命令
   * @description 处理用户更新命令并执行相关业务逻辑
   * @param {UpdateUserCommand} command 更新用户命令
   * @returns {Promise<boolean>} 更新是否成功
   */
  async execute(command: UpdateUserCommand): Promise<boolean> {
    try {
      this.logger.info('开始执行更新用户命令', LogContext.BUSINESS, {
        commandId: command.commandId,
        userId: command.userId.toString(),
        updatedFields: command.getUpdatedFields(),
      });

      // 1. 转换命令为用例请求
      const request = {
        email: command.email?.toString(),
        phone: command.phone?.toString(),
        userType: command.userType,
        dataPrivacyLevel: command.dataPrivacyLevel,
        organizationId: command.organizationId,
        departmentIds: command.departmentIds,
        profile: command.profile,
        currentUserId: command.userId.toString(), // 添加缺失的 currentUserId
      };

      // 2. 执行用户更新用例
      const result = await this.userManagementService.updateUser(
        command.userId.toString(),
        request,
      );

      if (!result.success) {
        this.logger.error('用户更新用例执行失败', LogContext.BUSINESS, {
          commandId: command.commandId,
          userId: command.userId.toString(),
          message: result.message,
        });
        throw new Error(`用户更新失败: ${result.message}`);
      }

      this.logger.info('用户更新用例执行成功', LogContext.BUSINESS, {
        commandId: command.commandId,
        userId: command.userId.toString(),
        updatedFields: command.getUpdatedFields(), // 使用命令的 getUpdatedFields 方法
      });

      // 3. 发布用户更新事件
      await this.eventBus.publish(
        new UserUpdatedEvent(
          command.userId.toString(),
          command.getUpdatedFields(), // 使用命令的 getUpdatedFields 方法
          command.email?.toString(),
          command.phone?.toString(),
          command.userType,
          command.dataPrivacyLevel,
          command.organizationId,
          command.departmentIds,
          command.profile,
        ),
      );

      this.logger.info('用户更新事件发布成功', LogContext.EVENT, {
        commandId: command.commandId,
        userId: command.userId.toString(),
        eventType: 'UserUpdated',
      });

      // 4. 返回更新结果
      return result.success;
    } catch (error) {
      // 5. 处理错误情况
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      const errorName = error instanceof Error ? error.name : 'UnknownError';

      this.logger.error('处理更新用户命令失败', LogContext.BUSINESS, {
        commandId: command.commandId,
        userId: command.userId.toString(),
        error: {
          message: errorMessage,
          stack: errorStack,
          name: errorName,
        },
      });

      // 发布用户更新失败事件
      await this.eventBus.publish(
        new UserUpdatedEvent(
          command.userId.toString(),
          [],
          command.email?.toString(),
          command.phone?.toString(),
          command.userType,
          command.dataPrivacyLevel,
          command.organizationId,
          command.departmentIds,
          command.profile,
          false, // 更新失败
          error instanceof Error ? error.message : '未知错误',
        ),
      );

      throw error;
    }
  }

  /**
   * 验证命令
   * @description 验证命令的有效性
   * @param {UpdateUserCommand} command 更新用户命令
   * @returns {boolean} 命令是否有效
   */
  validate(command: UpdateUserCommand): boolean {
    return !!(
      command &&
      command.userId &&
      command.commandId &&
      command.timestamp &&
      command.occurredOn
    );
  }

  /**
   * 获取命令摘要
   * @description 返回命令的简要描述
   * @param {UpdateUserCommand} command 更新用户命令
   * @returns {string} 命令摘要
   */
  getCommandSummary(command: UpdateUserCommand): string {
    return command.getSummary();
  }

  /**
   * 获取更新的字段列表
   * @description 返回命令中要更新的字段列表
   * @param {UpdateUserCommand} command 更新用户命令
   * @returns {string[]} 更新字段列表
   */
  getUpdatedFields(command: UpdateUserCommand): string[] {
    return command.getUpdatedFields();
  }

  /**
   * 检查字段更新
   * @description 检查命令是否包含特定字段的更新
   * @param {UpdateUserCommand} command 更新用户命令
   * @param {string} field 字段名
   * @returns {boolean} 是否包含该字段更新
   */
  hasFieldUpdate(command: UpdateUserCommand, field: string): boolean {
    return command.hasFieldUpdate(field);
  }
}
