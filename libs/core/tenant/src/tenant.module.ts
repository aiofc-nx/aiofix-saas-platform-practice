/**
 * @file tenant.module.ts
 * @description 租户模块主模块
 * @since 1.0.0
 */

import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
// import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ConfigModule } from '@nestjs/config';

// 领域层

// 基础设施层

import { TenantPostgresRepository } from './infrastructure/repositories/postgresql/tenant.repository';
import { TenantMongoRepository } from './infrastructure/repositories/mongodb/tenant.repository';
import { TenantPostgresMapper } from './infrastructure/mappers/postgresql/tenant.mapper';
import { TenantMongoMapper } from './infrastructure/mappers/mongodb/tenant.mapper';
// import { TenantEventProjectionHandler } from './infrastructure/events/tenant-event-projection.handler';
import { TenantEventProjectionService } from './infrastructure/events/tenant-event-projection.service';

// 应用层
import { TenantManagementService } from './application/services/tenant-management.service';
import { CreateTenantUseCase } from './application/use-cases/create-tenant.use-case';
import { ActivateTenantUseCase } from './application/use-cases/activate-tenant.use-case';
import { SuspendTenantUseCase } from './application/use-cases/suspend-tenant.use-case';
import { DeleteTenantUseCase } from './application/use-cases/delete-tenant.use-case';
import { UpdateTenantConfigUseCase } from './application/use-cases/update-tenant-config.use-case';

// 表现层
import { TenantManagementController } from './presentation/controllers/tenant-management.controller';
import { TenantAccessGuard } from './presentation/guards/tenant-access.guard';
import { TenantValidationInterceptor } from './presentation/interceptors/tenant-validation.interceptor';

// 配置
import { tenantConfig } from './infrastructure/config/tenant.config';

// 共享模块
import { SharedModule } from '@aiofix/shared';
import { LoggingModule } from '@aiofix/logging';

// 用例列表
const useCases = [
  CreateTenantUseCase,
  ActivateTenantUseCase,
  SuspendTenantUseCase,
  DeleteTenantUseCase,
  UpdateTenantConfigUseCase,
];

// 事件处理器列表
const eventHandlers: any[] = [
  // TenantEventProjectionHandler,
];

// 仓储提供者
const repositoryProviders = [
  {
    provide: 'ITenantRepository',
    useClass: TenantPostgresRepository,
  },
  {
    provide: 'ITenantQueryRepository',
    useClass: TenantMongoRepository,
  },
  TenantPostgresRepository,
  TenantMongoRepository,
  TenantPostgresMapper,
  TenantMongoMapper,
];

@Module({
  imports: [
    // NestJS核心模块
    CqrsModule,
    ConfigModule.forFeature(tenantConfig),

    // 共享模块
    SharedModule,
    LoggingModule,

    // 数据库模块
    // MikroOrmModule.forFeature([TenantOrmEntity, TenantDocument]),
  ],
  controllers: [TenantManagementController],
  providers: [
    // 应用服务
    TenantManagementService,

    // 用例
    ...useCases,

    // 事件处理器
    ...eventHandlers,

    // 事件投影服务
    TenantEventProjectionService,

    // 仓储和映射器
    ...repositoryProviders,

    // 守卫和拦截器
    TenantAccessGuard,
    TenantValidationInterceptor,
  ],
  exports: [
    // 导出服务供其他模块使用
    TenantManagementService,
    'ITenantRepository',
    'ITenantQueryRepository',

    // 导出用例供其他模块使用
    ...useCases,

    // 导出守卫和拦截器
    TenantAccessGuard,
    TenantValidationInterceptor,
  ],
})
export class TenantModule {
  constructor() {
    // 模块初始化逻辑
  }
}
