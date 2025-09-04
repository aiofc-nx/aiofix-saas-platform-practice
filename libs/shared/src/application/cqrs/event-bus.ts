import { Injectable, Type } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

/**
 * @interface DomainEvent
 * @description 领域事件接口，所有领域事件都必须实现此接口
 *
 * 原理与机制：
 * 1. 领域事件是 DDD 中的核心概念，表示领域中的某个重要事情发生了
 * 2. 事件是不可变的，一旦创建就不能修改
 * 3. 事件包含事件发生时的所有相关数据
 * 4. 事件通过事件总线分发给所有订阅者
 *
 * 功能与职责：
 * 1. 定义领域事件的基本结构
 * 2. 确保事件的不可变性
 * 3. 提供事件的类型安全
 */
export interface DomainEvent {
  readonly eventId: string;
  readonly occurredOn: Date;
  readonly eventType: string;
  readonly aggregateId: string;
  readonly aggregateType: string;
  readonly version: number;
}

/**
 * @interface EventHandler
 * @description 事件处理器接口，所有事件处理器都必须实现此接口
 *
 * 原理与机制：
 * 1. 事件处理器负责处理特定的领域事件
 * 2. 一个事件可以有多个处理器
 * 3. 处理器执行事件处理逻辑
 * 4. 处理器可以产生新的领域事件
 *
 * 功能与职责：
 * 1. 处理特定的领域事件
 * 2. 执行业务逻辑
 * 3. 更新读模型
 * 4. 发送通知
 */
export interface EventHandler<TEvent extends DomainEvent = DomainEvent> {
  handle(event: TEvent): Promise<void>;
}

/**
 * @class EventBus
 * @description 事件总线，负责分发领域事件到所有订阅者
 *
 * 原理与机制：
 * 1. 事件总线是 CQRS 模式中的核心组件，负责事件的分发
 * 2. 使用依赖注入容器来获取事件处理器实例
 * 3. 支持事件的异步处理
 * 4. 提供事件处理的错误处理机制
 *
 * 功能与职责：
 * 1. 注册事件处理器
 * 2. 分发事件到所有订阅者
 * 3. 处理事件执行异常
 * 4. 提供事件处理的监控和日志
 *
 * @example
 * ```typescript
 * // 注册事件处理器
 * eventBus.register(UserCreatedEvent, UserCreatedHandler);
 * eventBus.register(UserCreatedEvent, UserNotificationHandler);
 *
 * // 发布事件
 * await eventBus.publish(new UserCreatedEvent({
 *   userId: 'user-123',
 *   username: 'john'
 * }));
 * ```
 * @since 1.0.0
 */
@Injectable()
export class EventBus {
  private handlers = new Map<string, Type<EventHandler>[]>();

  constructor(private readonly moduleRef: ModuleRef) {}

  /**
   * 注册事件处理器
   * @description 将事件类型与对应的处理器关联
   * @param {Type<TEvent>} eventType 事件类型
   * @param {Type<EventHandler<TEvent>>} handlerType 处理器类型
   * @example
   * ```typescript
   * eventBus.register(UserCreatedEvent, UserCreatedHandler);
   * ```
   */
  register<TEvent extends DomainEvent>(
    eventType: Type<TEvent>,
    handlerType: Type<EventHandler<TEvent>>,
  ): void {
    const eventName = eventType.name;
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, []);
    }
    this.handlers.get(eventName)!.push(handlerType);
  }

  /**
   * 发布事件
   * @description 将事件分发给所有订阅的处理器
   * @param {TEvent} event 要发布的事件
   * @returns {Promise<void>} 发布完成
   * @throws {EventPublishException} 当事件发布失败时抛出异常
   * @example
   * ```typescript
   * await eventBus.publish(new UserCreatedEvent({
   *   userId: 'user-123',
   *   username: 'john'
   * }));
   * ```
   */
  async publish<TEvent extends DomainEvent>(event: TEvent): Promise<void> {
    const eventName = event.constructor.name;
    const handlerTypes = this.handlers.get(eventName) || [];

    if (handlerTypes.length === 0) {
      // 没有处理器是正常的，不是错误
      return;
    }

    const promises = handlerTypes.map(async handlerType => {
      try {
        const handler = this.moduleRef.get(handlerType, { strict: false });
        await handler.handle(event);
      } catch (error) {
        throw new EventHandlerExecutionException(
          `Failed to handle event: ${eventName} with handler: ${handlerType.name}`,
          error as Error,
        );
      }
    });

    try {
      await Promise.all(promises);
    } catch (error) {
      throw new EventPublishException(
        `Failed to publish event: ${eventName}`,
        error as Error,
      );
    }
  }

  /**
   * 发布多个事件
   * @description 批量发布多个事件
   * @param {TEvent[]} events 要发布的事件数组
   * @returns {Promise<void>} 发布完成
   * @throws {EventPublishException} 当事件发布失败时抛出异常
   * @example
   * ```typescript
   * await eventBus.publishAll([
   *   new UserCreatedEvent({ userId: 'user-123' }),
   *   new UserUpdatedEvent({ userId: 'user-123' })
   * ]);
   * ```
   */
  async publishAll<TEvent extends DomainEvent>(
    events: TEvent[],
  ): Promise<void> {
    for (const event of events) {
      await this.publish(event);
    }
  }

  /**
   * 检查事件是否有对应的处理器
   * @description 检查指定的事件类型是否已注册处理器
   * @param {Type<TEvent>} eventType 事件类型
   * @returns {boolean} 是否有对应的处理器
   * @example
   * ```typescript
   * const hasHandler = eventBus.hasHandler(UserCreatedEvent);
   * ```
   */
  hasHandler<TEvent extends DomainEvent>(eventType: Type<TEvent>): boolean {
    const handlers = this.handlers.get(eventType.name);
    return handlers !== undefined && handlers.length > 0;
  }

  /**
   * 获取事件处理器的数量
   * @description 返回指定事件类型的处理器数量
   * @param {Type<TEvent>} eventType 事件类型
   * @returns {number} 处理器数量
   * @example
   * ```typescript
   * const handlerCount = eventBus.getHandlerCount(UserCreatedEvent);
   * ```
   */
  getHandlerCount<TEvent extends DomainEvent>(eventType: Type<TEvent>): number {
    const handlers = this.handlers.get(eventType.name);
    return handlers ? handlers.length : 0;
  }

  /**
   * 获取已注册的事件类型列表
   * @description 返回所有已注册事件处理器的事件类型
   * @returns {string[]} 事件类型名称列表
   * @example
   * ```typescript
   * const registeredEvents = eventBus.getRegisteredEvents();
   * ```
   */
  getRegisteredEvents(): string[] {
    return Array.from(this.handlers.keys());
  }

  /**
   * 清除所有事件处理器
   * @description 清除所有已注册的事件处理器
   * @example
   * ```typescript
   * eventBus.clear();
   * ```
   */
  clear(): void {
    this.handlers.clear();
  }
}

/**
 * @class EventPublishException
 * @description 事件发布异常
 *
 * 原理与机制：
 * 1. 当事件发布过程中发生错误时抛出此异常
 * 2. 包含原始错误信息
 * 3. 提供事件发布的上下文信息
 *
 * 功能与职责：
 * 1. 标识事件发布失败的错误
 * 2. 保留原始错误信息
 * 3. 提供错误上下文
 */
export class EventPublishException extends Error {
  constructor(
    message: string,
    public readonly originalError?: Error,
  ) {
    super(message);
    this.name = 'EventPublishException';
  }
}

/**
 * @class EventHandlerExecutionException
 * @description 事件处理器执行异常
 *
 * 原理与机制：
 * 1. 当事件处理器执行过程中发生错误时抛出此异常
 * 2. 包含原始错误信息
 * 3. 提供事件处理器执行的上下文信息
 *
 * 功能与职责：
 * 1. 标识事件处理器执行失败的错误
 * 2. 保留原始错误信息
 * 3. 提供错误上下文
 */
export class EventHandlerExecutionException extends Error {
  constructor(
    message: string,
    public readonly originalError?: Error,
  ) {
    super(message);
    this.name = 'EventHandlerExecutionException';
  }
}
