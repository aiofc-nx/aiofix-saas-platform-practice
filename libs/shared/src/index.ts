/**
 * @fileoverview
 * 共享领域模块导出文件
 *
 * 该模块提供跨领域共享的基础组件、工具类和通用服务，
 * 遵循 Clean Architecture 原则，按领域边界组织代码。
 */

// 领域层导出
export * from './domain';

// 应用层导出（排除冲突的DomainEvent）
export {
  CommandBus,
  CommandHandler,
  Command,
  QueryBus,
  QueryHandler,
  Query,
  EventBus,
  EventHandler,
  EventStore,
  StoredEvent,
  InMemoryEventStore
} from './application';

// 基础设施层导出
export * from './infrastructure';

// 表现层导出
export * from './presentation';

// 模块导出
export * from './lib/shared.module';

// 导出通知相关类型
export * from './types/notification.types';
