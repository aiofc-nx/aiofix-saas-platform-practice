/**
 * @description User用户管理模块
 * @author 江郎
 * @since 2.1.0
 */

import { Module } from '@nestjs/common';
import { LoggingModule } from '@aiofix/logging';

// 基础设施层
import { UserEventHandler } from './infrastructure/events/user-event-handler';
import { UserEventProjectionService } from './infrastructure/events/user-event-projection.service';

// 应用层
import { UserManagementService } from './application/services/user-management.service';
import { UserOnboardingService } from './application/services/user-onboarding.service';
import { CreateUserUseCase } from './application/use-cases/create-user.usecase';
import { UpdateUserUseCase } from './application/use-cases/update-user.usecase';
import { GetUserUseCase } from './application/use-cases/get-user.usecase';

// 表现层
import { UserManagementController } from './presentation/controllers/user-management.controller';
import { UserStatisticsController } from './presentation/controllers/user-statistics.controller';
import { UserQueryController } from './presentation/controllers/user-query.controller';

/**
 * @class UserModule
 * @description
 * 用户管理模块，整合用户管理的所有功能组件。
 * 包括基础设施层、应用层和表现层的完整实现。
 *
 * 原理与机制：
 * 1. 采用Clean Architecture分层架构
 * 2. 通过依赖注入管理组件依赖关系
 * 3. 支持事件驱动架构和CQRS模式
 * 4. 集成日志和事件存储服务
 * 5. 遵循"一般的业务逻辑直接在use-case实现，复杂业务逻辑才需要应用服务"的原则
 *
 * 功能与职责：
 * 1. 用户生命周期管理
 * 2. 用户档案管理
 * 3. 用户关系管理
 * 4. 用户统计和分析
 * 5. 事件投影和同步
 *
 * @example
 * ```typescript
 * // 在应用模块中导入
 * import { UserModule } from '@aiofix/core/user';
 *
 * @Module({
 *   imports: [UserModule],
 * })
 * export class AppModule {}
 * ```
 * @since 1.0.0
 */
@Module({
  imports: [LoggingModule],
  controllers: [
    UserManagementController,
    UserStatisticsController,
    UserQueryController,
  ],
  providers: [
    // 基础设施层
    UserEventHandler,
    UserEventProjectionService,

    // 应用层 - Use Cases (简单业务逻辑)
    CreateUserUseCase,
    UpdateUserUseCase,
    GetUserUseCase,

    // 应用层 - Services (复杂业务协调)
    UserManagementService,
    UserOnboardingService,
  ],
  exports: [
    // 导出服务供其他模块使用
    UserManagementService,
    UserOnboardingService,
    UserEventProjectionService,

    // 导出Use Cases供其他模块使用
    CreateUserUseCase,
    UpdateUserUseCase,
    GetUserUseCase,
  ],
})
export class UserModule {}
