import { Injectable, Type } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

/**
 * @interface Query
 * @description 查询接口，所有查询都必须实现此接口
 * 
 * 原理与机制：
 * 1. 查询是 CQRS 模式中的读操作封装，代表一个数据获取意图
 * 2. 查询是不可变的，一旦创建就不能修改
 * 3. 查询包含获取数据所需的所有参数
 * 4. 查询通过查询总线发送给对应的查询处理器
 * 
 * 功能与职责：
 * 1. 定义查询的基本结构
 * 2. 确保查询的不可变性
 * 3. 提供查询的类型安全
 */
export interface Query<TResult = any> {
  readonly queryId: string;
  readonly occurredOn: Date;
}

/**
 * @interface QueryHandler
 * @description 查询处理器接口，所有查询处理器都必须实现此接口
 * 
 * 原理与机制：
 * 1. 查询处理器负责处理特定的查询类型
 * 2. 每个查询只能有一个处理器
 * 3. 处理器执行查询并返回结果
 * 4. 处理器不产生领域事件，只返回数据
 * 
 * 功能与职责：
 * 1. 处理特定的查询类型
 * 2. 从读模型获取数据
 * 3. 返回查询结果
 * 4. 不修改系统状态
 */
export interface QueryHandler<TQuery extends Query<TResult>, TResult = any> {
  execute(query: TQuery): Promise<TResult>;
}

/**
 * @class QueryBus
 * @description 查询总线，负责分发查询到对应的处理器
 * 
 * 原理与机制：
 * 1. 查询总线是 CQRS 模式中的核心组件，负责查询的分发
 * 2. 使用依赖注入容器来获取查询处理器实例
 * 3. 支持查询的异步处理
 * 4. 提供查询处理的错误处理机制
 * 
 * 功能与职责：
 * 1. 注册查询处理器
 * 2. 分发查询到对应的处理器
 * 3. 处理查询执行异常
 * 4. 提供查询处理的监控和日志
 * 
 * @example
 * ```typescript
 * // 注册查询处理器
 * queryBus.register(GetUserByIdQuery, GetUserByIdHandler);
 * 
 * // 执行查询
 * const user = await queryBus.execute(new GetUserByIdQuery({
 *   userId: 'user-123'
 * }));
 * ```
 * @since 1.0.0
 */
@Injectable()
export class QueryBus {
  private handlers = new Map<string, Type<QueryHandler<any, any>>>();

  constructor(private readonly moduleRef: ModuleRef) {}

  /**
   * 注册查询处理器
   * @description 将查询类型与对应的处理器关联
   * @param {Type<TQuery>} queryType 查询类型
   * @param {Type<QueryHandler<TQuery, TResult>>} handlerType 处理器类型
   * @example
   * ```typescript
   * queryBus.register(GetUserByIdQuery, GetUserByIdHandler);
   * ```
   */
  register<TQuery extends Query<TResult>, TResult = any>(
    queryType: Type<TQuery>,
    handlerType: Type<QueryHandler<TQuery, TResult>>
  ): void {
    this.handlers.set(queryType.name, handlerType);
  }

  /**
   * 执行查询
   * @description 将查询发送给对应的处理器执行
   * @param {TQuery} query 要执行的查询
   * @returns {Promise<TResult>} 查询执行结果
   * @throws {QueryHandlerNotFoundException} 当找不到对应的处理器时抛出异常
   * @throws {QueryExecutionException} 当查询执行失败时抛出异常
   * @example
   * ```typescript
   * const user = await queryBus.execute(new GetUserByIdQuery({
   *   userId: 'user-123'
   * }));
   * ```
   */
  async execute<TQuery extends Query<TResult>, TResult = any>(
    query: TQuery
  ): Promise<TResult> {
    const handlerType = this.handlers.get(query.constructor.name);
    
    if (!handlerType) {
      throw new QueryHandlerNotFoundException(
        `No handler found for query: ${query.constructor.name}`
      );
    }

    try {
      const handler = this.moduleRef.get(handlerType, { strict: false });
      return await handler.execute(query);
    } catch (error) {
      throw new QueryExecutionException(
        `Failed to execute query: ${query.constructor.name}`,
        error as Error
      );
    }
  }

  /**
   * 检查查询是否有对应的处理器
   * @description 检查指定的查询类型是否已注册处理器
   * @param {Type<TQuery>} queryType 查询类型
   * @returns {boolean} 是否有对应的处理器
   * @example
   * ```typescript
   * const hasHandler = queryBus.hasHandler(GetUserByIdQuery);
   * ```
   */
  hasHandler<TQuery extends Query>(queryType: Type<TQuery>): boolean {
    return this.handlers.has(queryType.name);
  }

  /**
   * 获取已注册的查询类型列表
   * @description 返回所有已注册查询处理器的查询类型
   * @returns {string[]} 查询类型名称列表
   * @example
   * ```typescript
   * const registeredQueries = queryBus.getRegisteredQueries();
   * ```
   */
  getRegisteredQueries(): string[] {
    return Array.from(this.handlers.keys());
  }
}

/**
 * @class QueryHandlerNotFoundException
 * @description 查询处理器未找到异常
 * 
 * 原理与机制：
 * 1. 当查询总线找不到对应的处理器时抛出此异常
 * 2. 通常是因为忘记注册查询处理器
 * 3. 帮助开发者快速定位问题
 * 
 * 功能与职责：
 * 1. 标识查询处理器未找到的错误
 * 2. 提供详细的错误信息
 * 3. 帮助调试和问题定位
 */
export class QueryHandlerNotFoundException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'QueryHandlerNotFoundException';
  }
}

/**
 * @class QueryExecutionException
 * @description 查询执行异常
 * 
 * 原理与机制：
 * 1. 当查询执行过程中发生错误时抛出此异常
 * 2. 包含原始错误信息
 * 3. 提供查询执行的上下文信息
 * 
 * 功能与职责：
 * 1. 标识查询执行失败的错误
 * 2. 保留原始错误信息
 * 3. 提供错误上下文
 */
export class QueryExecutionException extends Error {
  constructor(message: string, public readonly originalError?: Error) {
    super(message);
    this.name = 'QueryExecutionException';
  }
}
