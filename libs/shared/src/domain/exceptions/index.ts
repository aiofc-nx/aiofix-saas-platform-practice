/**
 * @fileoverview
 * 共享领域模块 - 领域异常导出
 *
 * 领域异常表示业务规则违反或领域错误。
 * 异常应该具有明确的业务含义，便于错误处理。
 */

// 领域异常基类
export * from './domain.exception';

// 数据隔离相关异常
export { TenantAccessDeniedError } from '../entities/data-isolation-aware.entity';
