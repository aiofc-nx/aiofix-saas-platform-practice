/**
 * @file index.ts
 * @description 租户模块入口文件
 * @since 1.0.0
 */

// 主模块
export { TenantModule } from './tenant.module';

// 领域层导出
export * from './domain/entities/tenant.entity';
export * from './domain/aggregates/tenant.aggregate';
export * from './domain/repositories/tenant.repository';
export * from './domain/domain-events';

// 应用层导出
export * from './application/services/tenant-management.service';
export * from './application/interfaces/tenant-management.interface';
export * from './application/use-cases/create-tenant.use-case';
export * from './application/use-cases/activate-tenant.use-case';
export * from './application/use-cases/suspend-tenant.use-case';
export { DeleteTenantUseCase } from './application/use-cases/delete-tenant.use-case';
export { UpdateTenantConfigUseCase } from './application/use-cases/update-tenant-config.use-case';
export * from './application/dtos';

// 基础设施层导出
export * from './infrastructure/repositories/postgresql/tenant.repository';
export * from './infrastructure/repositories/mongodb/tenant.repository';
export * from './infrastructure/mappers/postgresql/tenant.mapper';
export * from './infrastructure/mappers/mongodb/tenant.mapper';
export * from './infrastructure/entities/postgresql/tenant.orm-entity';
export * from './infrastructure/entities/mongodb/tenant.document';
export * from './infrastructure/events/tenant-event-projection.handler';
export * from './infrastructure/events/tenant-event-projection.service';

// 表现层导出
export * from './presentation/controllers/tenant-management.controller';
export * from './presentation/guards/tenant-access.guard';
export * from './presentation/interceptors/tenant-validation.interceptor';
export * from './presentation/validators';
export * from './presentation/dtos';

// 配置导出
export { tenantConfig } from './infrastructure/config/tenant.config';
