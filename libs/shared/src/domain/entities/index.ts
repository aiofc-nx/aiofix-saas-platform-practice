/**
 * @fileoverview
 * 共享领域模块 - 实体导出
 *
 * 实体是领域模型的核心，具有唯一标识和生命周期。
 * 实体封装业务规则，确保领域一致性。
 */

// 基础实体类导出
export * from './base-entity';

// 数据隔离感知实体导出
export * from './data-isolation-aware.entity';

// 平台实体导出
export * from './platform-aware.entity';

// 平台配置实体导出
export * from './platform-configuration.entity';

// 用户档案实体导出
export * from './user-profile.entity';
