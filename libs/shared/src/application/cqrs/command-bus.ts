import { Injectable, Type } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

/**
 * @interface Command
 * @description 命令接口，所有命令都必须实现此接口
 * 
 * 原理与机制：
 * 1. 命令是 CQRS 模式中的写操作封装，代表一个业务意图
 * 2. 命令是不可变的，一旦创建就不能修改
 * 3. 命令包含执行业务操作所需的所有数据
 * 4. 命令通过命令总线发送给对应的命令处理器
 * 
 * 功能与职责：
 * 1. 定义命令的基本结构
 * 2. 确保命令的不可变性
 * 3. 提供命令的类型安全
 */
export interface Command {
  readonly commandId: string;
  readonly occurredOn: Date;
}

/**
 * @interface CommandHandler
 * @description 命令处理器接口，所有命令处理器都必须实现此接口
 * 
 * 原理与机制：
 * 1. 命令处理器负责处理特定的命令类型
 * 2. 每个命令只能有一个处理器
 * 3. 处理器执行命令并返回结果
 * 4. 处理器可以产生领域事件
 * 
 * 功能与职责：
 * 1. 处理特定的命令类型
 * 2. 执行业务逻辑
 * 3. 产生领域事件
 * 4. 返回处理结果
 */
export interface CommandHandler<TCommand extends Command = Command> {
  execute(command: TCommand): Promise<any>;
}

/**
 * @class CommandBus
 * @description 命令总线，负责分发命令到对应的处理器
 * 
 * 原理与机制：
 * 1. 命令总线是 CQRS 模式中的核心组件，负责命令的分发
 * 2. 使用依赖注入容器来获取命令处理器实例
 * 3. 支持命令的异步处理
 * 4. 提供命令处理的错误处理机制
 * 
 * 功能与职责：
 * 1. 注册命令处理器
 * 2. 分发命令到对应的处理器
 * 3. 处理命令执行异常
 * 4. 提供命令处理的监控和日志
 * 
 * @example
 * ```typescript
 * // 注册命令处理器
 * commandBus.register(CreateUserCommand, CreateUserHandler);
 * 
 * // 执行命令
 * const result = await commandBus.execute(new CreateUserCommand({
 *   username: 'john',
 *   email: 'john@example.com'
 * }));
 * ```
 * @since 1.0.0
 */
@Injectable()
export class CommandBus {
  private handlers = new Map<string, Type<CommandHandler>>();

  constructor(private readonly moduleRef: ModuleRef) {}

  /**
   * 注册命令处理器
   * @description 将命令类型与对应的处理器关联
   * @param {Type<TCommand>} commandType 命令类型
   * @param {Type<CommandHandler<TCommand>>} handlerType 处理器类型
   * @example
   * ```typescript
   * commandBus.register(CreateUserCommand, CreateUserHandler);
   * ```
   */
  register<TCommand extends Command>(
    commandType: Type<TCommand>,
    handlerType: Type<CommandHandler<TCommand>>
  ): void {
    this.handlers.set(commandType.name, handlerType);
  }

  /**
   * 执行命令
   * @description 将命令发送给对应的处理器执行
   * @param {TCommand} command 要执行的命令
   * @returns {Promise<any>} 命令执行结果
   * @throws {CommandHandlerNotFoundException} 当找不到对应的处理器时抛出异常
   * @throws {CommandExecutionException} 当命令执行失败时抛出异常
   * @example
   * ```typescript
   * const result = await commandBus.execute(new CreateUserCommand({
   *   username: 'john',
   *   email: 'john@example.com'
   * }));
   * ```
   */
  async execute<TCommand extends Command>(command: TCommand): Promise<any> {
    const handlerType = this.handlers.get(command.constructor.name);
    
    if (!handlerType) {
      throw new CommandHandlerNotFoundException(
        `No handler found for command: ${command.constructor.name}`
      );
    }

    try {
      const handler = this.moduleRef.get(handlerType, { strict: false });
      return await handler.execute(command);
    } catch (error) {
      throw new CommandExecutionException(
        `Failed to execute command: ${command.constructor.name}`,
        error as Error
      );
    }
  }

  /**
   * 检查命令是否有对应的处理器
   * @description 检查指定的命令类型是否已注册处理器
   * @param {Type<TCommand>} commandType 命令类型
   * @returns {boolean} 是否有对应的处理器
   * @example
   * ```typescript
   * const hasHandler = commandBus.hasHandler(CreateUserCommand);
   * ```
   */
  hasHandler<TCommand extends Command>(commandType: Type<TCommand>): boolean {
    return this.handlers.has(commandType.name);
  }

  /**
   * 获取已注册的命令类型列表
   * @description 返回所有已注册命令处理器的命令类型
   * @returns {string[]} 命令类型名称列表
   * @example
   * ```typescript
   * const registeredCommands = commandBus.getRegisteredCommands();
   * ```
   */
  getRegisteredCommands(): string[] {
    return Array.from(this.handlers.keys());
  }
}

/**
 * @class CommandHandlerNotFoundException
 * @description 命令处理器未找到异常
 * 
 * 原理与机制：
 * 1. 当命令总线找不到对应的处理器时抛出此异常
 * 2. 通常是因为忘记注册命令处理器
 * 3. 帮助开发者快速定位问题
 * 
 * 功能与职责：
 * 1. 标识命令处理器未找到的错误
 * 2. 提供详细的错误信息
 * 3. 帮助调试和问题定位
 */
export class CommandHandlerNotFoundException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CommandHandlerNotFoundException';
  }
}

/**
 * @class CommandExecutionException
 * @description 命令执行异常
 * 
 * 原理与机制：
 * 1. 当命令执行过程中发生错误时抛出此异常
 * 2. 包含原始错误信息
 * 3. 提供命令执行的上下文信息
 * 
 * 功能与职责：
 * 1. 标识命令执行失败的错误
 * 2. 保留原始错误信息
 * 3. 提供错误上下文
 */
export class CommandExecutionException extends Error {
  constructor(message: string, public readonly originalError?: Error) {
    super(message);
    this.name = 'CommandExecutionException';
  }
}
