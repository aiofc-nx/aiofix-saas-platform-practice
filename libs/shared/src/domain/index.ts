/**
 * @fileoverview
 * 共享领域模块 - 领域层导出
 *
 * 领域层包含业务核心逻辑，包括实体、值对象、聚合根、领域事件等。
 * 该层不依赖任何外部框架或基础设施，纯粹表达业务规则。
 */

// 领域层导出
export * from './entities';
export * from './value-objects';
export * from './enums';
export * from './exceptions';
export * from './repositories';
export * from './services';
export * from './aggregates';
export * from './domain-events';
export * from './domain-services';
export * from './types';
export * from './utils/tenant-id-adapter.util';
