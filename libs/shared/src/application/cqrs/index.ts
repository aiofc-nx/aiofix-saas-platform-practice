/**
 * @fileoverview
 * 共享领域模块 - CQRS 基础设施导出
 *
 * CQRS (Command Query Responsibility Segregation) 基础设施
 * 提供命令查询职责分离模式的核心组件
 */

// 命令总线相关导出
export {
  Command,
  CommandHandler,
  CommandBus,
  CommandHandlerNotFoundException,
  CommandExecutionException,
} from './command-bus';

// 查询总线相关导出
export {
  Query,
  QueryHandler,
  QueryBus,
  QueryHandlerNotFoundException,
  QueryExecutionException,
} from './query-bus';

// 事件总线相关导出
export {
  DomainEvent,
  EventHandler,
  EventBus,
  EventPublishException,
  EventHandlerExecutionException,
} from './event-bus';

// 事件存储相关导出
export {
  StoredEvent,
  EventStore,
  InMemoryEventStore,
  EventStoreException,
} from './event-store';
