import { Injectable } from '@nestjs/common';
import { DomainEvent } from './event-bus';

/**
 * @interface StoredEvent
 * @description 存储的事件接口，表示持久化到事件存储中的事件
 * 
 * 原理与机制：
 * 1. 存储的事件包含原始领域事件的所有信息
 * 2. 添加了存储相关的元数据，如存储时间、版本等
 * 3. 支持事件的序列化和反序列化
 * 4. 提供事件的重放和审计能力
 * 
 * 功能与职责：
 * 1. 定义存储事件的基本结构
 * 2. 提供事件的元数据信息
 * 3. 支持事件的版本控制
 * 4. 确保事件的完整性
 */
export interface StoredEvent extends DomainEvent {
  readonly storedAt: Date;
  readonly eventData: string; // 序列化的事件数据
  readonly eventMetadata: string; // 序列化的事件元数据
}

/**
 * @interface EventStore
 * @description 事件存储接口，定义事件存储的基本操作
 * 
 * 原理与机制：
 * 1. 事件存储是事件溯源模式的核心组件
 * 2. 负责事件的持久化和检索
 * 3. 支持聚合根的事件流重建
 * 4. 提供事件的重放和投影能力
 * 
 * 功能与职责：
 * 1. 存储领域事件
 * 2. 检索聚合根的事件流
 * 3. 支持事件的重放
 * 4. 提供事件的审计能力
 */
export interface EventStore {
  /**
   * 存储事件
   * @param {DomainEvent} event 要存储的领域事件
   * @returns {Promise<void>} 存储完成
   */
  store(event: DomainEvent): Promise<void>;

  /**
   * 获取聚合根的事件流
   * @param {string} aggregateId 聚合根ID
   * @param {string} aggregateType 聚合根类型
   * @param {number} fromVersion 起始版本号
   * @returns {Promise<StoredEvent[]>} 事件流
   */
  getEvents(
    aggregateId: string,
    aggregateType: string,
    fromVersion?: number
  ): Promise<StoredEvent[]>;

  /**
   * 获取所有事件
   * @param {string} fromEventId 起始事件ID
   * @param {number} limit 限制数量
   * @returns {Promise<StoredEvent[]>} 事件列表
   */
  getAllEvents(fromEventId?: string, limit?: number): Promise<StoredEvent[]>;

  /**
   * 获取聚合根的当前版本
   * @param {string} aggregateId 聚合根ID
   * @param {string} aggregateType 聚合根类型
   * @returns {Promise<number>} 当前版本号
   */
  getCurrentVersion(
    aggregateId: string,
    aggregateType: string
  ): Promise<number>;
}

/**
 * @class InMemoryEventStore
 * @description 内存事件存储实现，用于测试和开发环境
 * 
 * 原理与机制：
 * 1. 使用内存数据结构存储事件
 * 2. 提供完整的事件存储接口实现
 * 3. 支持事件的快速访问和检索
 * 4. 适用于开发和测试环境
 * 
 * 功能与职责：
 * 1. 在内存中存储领域事件
 * 2. 提供事件流的检索功能
 * 3. 支持事件的重放
 * 4. 提供版本控制功能
 * 
 * @example
 * ```typescript
 * const eventStore = new InMemoryEventStore();
 * 
 * // 存储事件
 * await eventStore.store(new UserCreatedEvent({
 *   userId: 'user-123',
 *   username: 'john'
 * }));
 * 
 * // 获取事件流
 * const events = await eventStore.getEvents('user-123', 'User', 1);
 * ```
 * @since 1.0.0
 */
@Injectable()
export class InMemoryEventStore implements EventStore {
  private events: StoredEvent[] = [];
  private aggregateVersions = new Map<string, number>();

  /**
   * 存储事件
   * @description 将领域事件存储到内存中
   * @param {DomainEvent} event 要存储的领域事件
   * @returns {Promise<void>} 存储完成
   * @throws {EventStoreException} 当存储失败时抛出异常
   * @example
   * ```typescript
   * await eventStore.store(new UserCreatedEvent({
   *   userId: 'user-123',
   *   username: 'john'
   * }));
   * ```
   */
  async store(event: DomainEvent): Promise<void> {
    try {
      const storedEvent: StoredEvent = {
        ...event,
        storedAt: new Date(),
        eventData: JSON.stringify(event),
        eventMetadata: JSON.stringify({
          eventType: event.eventType,
          aggregateId: event.aggregateId,
          aggregateType: event.aggregateType,
          version: event.version,
          occurredOn: event.occurredOn
        })
      };

      this.events.push(storedEvent);

      // 更新聚合根版本
      const aggregateKey = `${event.aggregateType}:${event.aggregateId}`;
      this.aggregateVersions.set(aggregateKey, event.version);
    } catch (error) {
      throw new EventStoreException(
        `Failed to store event: ${event.eventType}`,
        error as Error
      );
    }
  }

  /**
   * 获取聚合根的事件流
   * @description 从内存中检索指定聚合根的事件流
   * @param {string} aggregateId 聚合根ID
   * @param {string} aggregateType 聚合根类型
   * @param {number} fromVersion 起始版本号
   * @returns {Promise<StoredEvent[]>} 事件流
   * @example
   * ```typescript
   * const events = await eventStore.getEvents('user-123', 'User', 1);
   * ```
   */
  async getEvents(
    aggregateId: string,
    aggregateType: string,
    fromVersion: number = 1
  ): Promise<StoredEvent[]> {
    return this.events.filter(
      event =>
        event.aggregateId === aggregateId &&
        event.aggregateType === aggregateType &&
        event.version >= fromVersion
    );
  }

  /**
   * 获取所有事件
   * @description 从内存中检索所有事件
   * @param {string} fromEventId 起始事件ID
   * @param {number} limit 限制数量
   * @returns {Promise<StoredEvent[]>} 事件列表
   * @example
   * ```typescript
   * const events = await eventStore.getAllEvents('event-1', 100);
   * ```
   */
  async getAllEvents(
    fromEventId?: string,
    limit?: number
  ): Promise<StoredEvent[]> {
    let filteredEvents = this.events;

    if (fromEventId) {
      const fromIndex = this.events.findIndex(event => event.eventId === fromEventId);
      if (fromIndex !== -1) {
        filteredEvents = this.events.slice(fromIndex + 1);
      }
    }

    if (limit) {
      filteredEvents = filteredEvents.slice(0, limit);
    }

    return filteredEvents;
  }

  /**
   * 获取聚合根的当前版本
   * @description 获取指定聚合根的当前版本号
   * @param {string} aggregateId 聚合根ID
   * @param {string} aggregateType 聚合根类型
   * @returns {Promise<number>} 当前版本号
   * @example
   * ```typescript
   * const version = await eventStore.getCurrentVersion('user-123', 'User');
   * ```
   */
  async getCurrentVersion(
    aggregateId: string,
    aggregateType: string
  ): Promise<number> {
    const aggregateKey = `${aggregateType}:${aggregateId}`;
    return this.aggregateVersions.get(aggregateKey) || 0;
  }

  /**
   * 清除所有事件
   * @description 清除内存中的所有事件（仅用于测试）
   * @example
   * ```typescript
   * eventStore.clear();
   * ```
   */
  clear(): void {
    this.events = [];
    this.aggregateVersions.clear();
  }

  /**
   * 获取事件总数
   * @description 获取存储的事件总数
   * @returns {number} 事件总数
   * @example
   * ```typescript
   * const count = eventStore.getEventCount();
   * ```
   */
  getEventCount(): number {
    return this.events.length;
  }
}

/**
 * @class EventStoreException
 * @description 事件存储异常
 * 
 * 原理与机制：
 * 1. 当事件存储操作失败时抛出此异常
 * 2. 包含原始错误信息
 * 3. 提供事件存储的上下文信息
 * 
 * 功能与职责：
 * 1. 标识事件存储失败的错误
 * 2. 保留原始错误信息
 * 3. 提供错误上下文
 */
export class EventStoreException extends Error {
  constructor(message: string, public readonly originalError?: Error) {
    super(message);
    this.name = 'EventStoreException';
  }
}
