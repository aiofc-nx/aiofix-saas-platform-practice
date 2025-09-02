# SAAS平台技术设计文档

## 🎯 技术设计概述

### 设计目标

基于业务需求文档，设计一个高性能、可扩展、安全的 SAAS 平台，支持多租户、多组织、多部门的复杂业务场景。平台将平台、租户、组织、部门、用户、认证授权等领域作为核心功能，同时将侧重于业务领域的平台、租户、组织、部门、用户与认证授权分离，确保职责清晰。为今后横向扩展增加其他业务领域模块，例如：人力资源、财务管理、进销存、客户关系管理、AI拓展等奠定坚实的基础。

### 架构特点

- **单体应用优先**：采用单体应用架构，便于开发和维护
- **模块化设计**：通过模块化设计实现高内聚低耦合
- **可扩展性**：为未来微服务化预留接口和设计空间
- **技术栈简化**：避免过度设计，选择必要的技术组件

### 架构目标

SAAS平台的领域架构，实现：

1. **职责清晰**：每个模块都有明确的业务边界
2. **高内聚低耦合**：模块内部高内聚，模块间低耦合
3. **可复用性**：基础模块可以被多个业务场景复用
4. **可扩展性**：每个模块可以独立演进和扩展
5. **团队协作友好**：不同团队可以专注不同模块

### 技术架构原则

项目采用混合架构，技术栈包括：Clean Architecture + RESTful API + CQRS + GraphQL + 事件溯源 + 多数据库支持 + 单体应用架构

1. **分层架构**: 遵循 Clean Architecture 分层设计
2. **领域驱动**: 基于 DDD 思想进行领域建模
3. **CQRS 模式**: 命令查询职责分离
4. **GraphQL 支持**: 灵活查询和数据获取
5. **事件溯源**: 采用 Event Sourcing 模式
6. **多数据库**: 支持 PostgreSQL 和 MongoDB
7. **数据隔离**: 完整的多层级数据隔离策略
8. **访问控制**: 基于隔离级别和隐私级别的细粒度访问控制
9. **高性能**: 支持百万级用户和复杂权限场景
10. **高安全**: 多层次安全防护机制
11. **核心功能分离**: 将业务管理领域（平台、租户、组织、部门、用户）与认证授权领域分离，确保职责清晰
12. **目录结构设计**: 遵循领域驱动设计（DDD）思想，代码目录架构应当首先体现领域的边界

### 架构设计原则

```
架构设计原则：
1. 单一职责原则：每个模块只负责一个明确的业务领域
2. 高内聚低耦合：模块内部高内聚，模块间低耦合
3. 领域驱动设计：按业务领域划分，而不是按技术层次划分
4. 可复用性：模块可以被多个业务场景复用
5. 可扩展性：模块可以独立演进和扩展
6. 团队协作友好：不同团队可以专注不同模块
```

### 技术栈选择

#### 后端技术栈

- **语言**: TypeScript 5.x
- **框架**: NestJS 11.x
- **数据库**: PostgreSQL 15.x (命令端 + 事件存储) + MongoDB 7.x (查询端)
- **缓存**: Redis 7.x
- **ORM**: MikroORM
- **认证**: Passport.js + JWT
- **权限控制**: CASL

#### 开发工具

- **包管理**: pnpm
- **构建工具**: pnpm workspace
- **代码规范**: ESLint + Prettier
- **测试框架**: Jest
- **API 文档**: Swagger/OpenAPI

## 🏗️ 系统架构设计

### 核心领域模块划分

#### 2.1 用户管理模块（User Management）

**职责范围**
- 统一管理所有类型的用户实体
- 用户生命周期管理
- 用户档案管理
- 用户关系管理

**包含的子领域**

##### 2.1.1 平台用户管理（Platform Users）
- 系统管理员（System Administrator）
- 平台运营人员（Platform Operator）
- 技术支持人员（Technical Support）
- 财务管理员（Finance Administrator）
- 合规管理员（Compliance Administrator）

##### 2.1.2 租户用户管理（Tenant Users）
- 租户管理员（Tenant Administrator）
- 普通用户（Regular User）
- 部门用户（Department User）
- 组织用户（Organization User）

##### 2.1.3 用户档案管理
- 基本信息管理（姓名、邮箱、电话等）
- 扩展信息管理（头像、个人简介等）
- 偏好设置管理（语言、时区、通知等）
- 隐私设置管理（数据可见性、分享权限等）

##### 2.1.4 用户关系管理
- 用户与租户的关系
- 用户与组织的关系
- 用户与部门的关系
- 用户与角色的关系

**技术特点**
- 支持多租户架构
- 支持多层级数据隔离
- 支持用户状态管理
- 支持用户关系管理

#### 2.2 平台管理模块（Platform Management）

**职责范围**
- 平台级配置管理
- 平台级系统设置
- 平台级功能开关
- 平台级安全策略
- 平台级策略管理

**包含的子领域**

##### 2.2.1 平台配置管理
- 系统配置（System Configuration）
- 功能开关（Feature Flags）
- 全局参数（Global Parameters）
- 环境配置（Environment Configuration）

##### 2.2.2 平台策略管理
- 安全策略（Security Policy）
- 合规策略（Compliance Policy）
- 运营策略（Operation Policy）
- 技术策略（Technical Policy）

##### 2.2.3 平台监控管理
- 系统监控（System Monitoring）
- 性能监控（Performance Monitoring）
- 安全监控（Security Monitoring）
- 业务监控（Business Monitoring）

**技术特点**
- 配置热更新
- 策略版本管理
- 配置审计追踪
- 多环境支持

#### 2.3 租户管理模块（Tenant Management）

**职责范围**
- 租户生命周期管理
- 租户配置管理
- 租户隔离策略
- 租户计费管理
- 租户策略管理

**包含的子领域**

##### 2.3.1 租户生命周期管理
- 租户创建（Tenant Creation）
- 租户激活（Tenant Activation）
- 租户暂停（Tenant Suspension）
- 租户终止（Tenant Termination）

##### 2.3.2 租户配置管理
- 租户配置（Tenant Configuration）
- 租户设置（Tenant Settings）
- 租户策略（Tenant Policy）
- 租户限制（Tenant Limits）

##### 2.3.3 租户计费管理
- 计费计划（Billing Plans）
- 使用量统计（Usage Statistics）
- 费用计算（Cost Calculation）
- 支付管理（Payment Management）

**技术特点**
- 多租户数据隔离
- 租户级配置管理
- 计费集成支持
- 租户级监控

#### 2.4 组织管理模块（Organization Management）

**职责范围**
- 组织架构管理
- 组织关系管理
- 组织配置管理
- 组织策略管理

**包含的子领域**

##### 2.4.1 组织架构管理
- 组织创建（Organization Creation）
- 组织层级（Organization Hierarchy）
- 组织关系（Organization Relationships）
- 组织状态（Organization Status）

##### 2.4.2 组织配置管理
- 组织配置（Organization Configuration）
- 组织设置（Organization Settings）
- 组织策略（Organization Policy）
- 组织限制（Organization Limits）

##### 2.4.3 组织关系管理
- 组织与租户的关系
- 组织与部门的关系
- 组织与用户的关系
- 组织间的关系

**技术特点**
- 支持复杂组织架构
- 组织级数据隔离
- 组织级权限控制
- 组织级配置管理

#### 2.5 部门管理模块（Department Management）

**职责范围**
- 部门架构管理
- 部门关系管理
- 部门配置管理
- 部门策略管理

**包含的子领域**

##### 2.5.1 部门架构管理
- 部门创建（Department Creation）
- 部门层级（Department Hierarchy）
- 部门关系（Department Relationships）
- 部门状态（Department Status）

##### 2.5.2 部门配置管理
- 部门配置（Department Configuration）
- 部门设置（Department Settings）
- 部门策略（Department Policy）
- 部门限制（Department Limits）

##### 2.5.3 部门关系管理
- 部门与组织的关系
- 部门与用户的关系
- 部门间的关系
- 部门与租户的关系

**技术特点**
- 支持复杂部门架构
- 部门级数据隔离
- 部门级权限控制
- 部门级配置管理

#### 2.6 IAM模块（Identity & Access Management）

**职责范围**
- 身份认证（Authentication）
- 授权管理（Authorization）
- 角色管理（Role Management）
- 权限管理（Permission Management）
- 会话管理（Session Management）
- 审计日志（Audit Logging）

**包含的子领域**

##### 2.6.1 身份认证（Authentication）
- 用户名密码认证
- 多因子认证（MFA）
- 单点登录（SSO）
- OAuth2.0/OIDC
- 生物识别认证

##### 2.6.2 授权管理（Authorization）
- 基于角色的访问控制（RBAC）
- 基于属性的访问控制（ABAC）
- 基于策略的访问控制（PBAC）
- 动态权限控制

##### 2.6.3 角色管理（Role Management）
- 角色定义（Role Definition）
- 角色分配（Role Assignment）
- 角色继承（Role Inheritance）
- 角色组合（Role Composition）

##### 2.6.4 权限管理（Permission Management）
- 权限定义（Permission Definition）
- 权限分配（Permission Assignment）
- 权限验证（Permission Validation）
- 权限审计（Permission Audit）

##### 2.6.5 会话管理（Session Management）
- 会话创建（Session Creation）
- 会话维护（Session Maintenance）
- 会话验证（Session Validation）
- 会话终止（Session Termination）

##### 2.6.6 审计日志（Audit Logging）
- 认证日志（Authentication Logs）
- 授权日志（Authorization Logs）
- 操作日志（Operation Logs）
- 安全日志（Security Logs）

**技术特点**
- 支持多种认证方式
- 灵活的权限控制
- 完整的审计追踪
- 高性能的权限验证

### 整体架构图

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   REST API  │  │  GraphQL    │  │ WebSocket   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                   Application Layer                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Use Cases  │  │ Commands    │  │   Queries   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Handlers   │  │ Validators  │  │ Projections│        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                     Domain Layer                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Aggregates  │  │  Entities   │  │ Value Objs  │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Domain Evt  │  │ Domain Svc  │  │ Repos Intf  │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                Infrastructure Layer                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ PostgreSQL  │  │  MongoDB    │  │    Redis    │        │
│  │ (Command DB)│  │ (Query DB)  │  │   (Cache)   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │Event Store  │  │Read Models  │  │ External Svc│        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

### 目录结构设计原则

遵循领域驱动设计（DDD）思想，代码目录架构应当首先体现领域的边界。SAAS平台将平台、租户、组织、部门、用户、认证授权等领域作为核心功能，同时将侧重于业务领域的平台、租户、组织、部门、用户与认证授权分离，确保职责清晰。

#### 设计原则详解

**核心原则**：
- **核心功能优先**：SAAS平台将平台、租户、组织、部门、用户、认证授权等领域作为核心功能
- **业务与认证分离**：将侧重于业务领域的平台、租户、组织、部门、用户与认证授权分离
- **共享模块统一**：统一开发维护一个共享模块，各领域模块内不设置共享领域层
- **基础设施独立**：配置、日志、缓存、数据库等通用基础设施独立开发，供各领域模块统一调用
- **分层架构其次**：在每个模块内部再按分层架构组织
- **功能组件最后**：在每层内部按功能组件组织

**命名规范**：
- **核心业务模块**：以业务领域名称命名（如：platform、tenant、user、organization、department）
- **认证授权模块**：以服务类型命名（如：iam）
- **共享模块**：以共享功能命名（如：shared），统一维护，各领域模块不重复创建
- **基础设施模块**：以功能类型命名（如：config、logging、cache、database、notification），独立开发，统一调用
- **分层目录**：以架构层名称命名（如：domain、application、infrastructure、presentation）
- **功能组件**：以功能组件名称命名（如：entities、use-cases、controllers、repositories）

**优势**：
1. **核心功能内聚**：平台、租户、组织、部门、用户、认证授权等核心功能各自内聚
2. **职责边界清晰**：业务管理模块负责业务逻辑，IAM 模块负责认证授权
3. **共享模块统一**：避免重复开发，统一维护共享功能，提高代码复用性
4. **基础设施独立**：通用基础设施独立开发，便于统一升级和维护
5. **可维护性**：修改某个领域时影响范围可控
6. **可扩展性**：新增领域时结构清晰
7. **团队协作**：不同团队可以专注不同领域

#### 目录结构示例

```
libs/core/                    # 核心业务模块
├── platform/                 # 平台管理模块（核心业务领域）
│   ├── src/
│   │   ├── domain/          # 领域层
│   │   ├── application/     # 应用层
│   │   ├── infrastructure/  # 基础设施层
│   │   └── presentation/    # 表现层
│   ├── package.json
│   └── tsconfig.json
├── tenant/                   # 租户管理模块（核心业务领域）
│   ├── src/
│   │   ├── domain/          # 领域层
│   │   ├── application/     # 应用层
│   │   ├── infrastructure/  # 基础设施层
│   │   └── presentation/    # 表现层
│   ├── package.json
│   └── tsconfig.json
├── user/                     # 用户管理模块（核心业务领域，统一管理平台用户+租户用户）
│   ├── src/
│   │   ├── domain/          # 领域层
│   │   ├── application/     # 应用层
│   │   ├── infrastructure/  # 基础设施层
│   │   └── presentation/    # 表现层
│   ├── package.json
│   └── tsconfig.json
├── organization/             # 组织管理模块（核心业务领域）
│   ├── src/
│   │   ├── domain/          # 领域层
│   │   ├── application/     # 应用层
│   │   ├── infrastructure/  # 基础设施层
│   │   └── presentation/    # 表现层
│   ├── package.json
│   └── tsconfig.json
├── department/               # 部门管理模块（核心业务领域）
│   ├── src/
│   │   ├── domain/          # 领域层
│   │   ├── application/     # 应用层
│   │   ├── infrastructure/  # 基础设施层
│   │   └── presentation/    # 表现层
│   ├── package.json
│   └── tsconfig.json
└── iam/                      # 身份认证与授权管理模块（核心功能，与业务领域分离）
    ├── src/
    │   ├── auth/            # 认证子领域
    │   │   ├── domain/      # 领域层
    │   │   ├── application/ # 应用层
    │   │   ├── infrastructure/# 基础设施层
    │   │   └── presentation/# 表现层
    │   ├── role/            # 角色子领域
    │   │   ├── domain/      # 领域层
    │   │   ├── application/ # 应用层
    │   │   ├── infrastructure/# 基础设施层
    │   │   └── presentation/# 表现层
    │   ├── permission/      # 权限子领域
    │   │   ├── domain/      # 领域层
    │   │   ├── application/ # 应用层
    │   │   ├── infrastructure/# 基础设施层
    │   │   └── presentation/# 表现层
    │   ├── session/         # 会话子领域
    │   │   ├── domain/      # 领域层
    │   │   ├── application/ # 应用层
    │   │   ├── infrastructure/# 基础设施层
    │   │   └── presentation/# 表现层
    │   └── audit/           # 审计子领域
    │       ├── domain/      # 领域层
    │       ├── application/ # 应用层
    │       ├── infrastructure/# 基础设施层
    │       └── presentation/# 表现层
    ├── package.json
    └── tsconfig.json

libs/shared/                  # 共享基础设施模块
├── src/
│   ├── domain/              # 共享领域组件
│   │   ├── entities/        # 基础实体类
│   │   ├── value-objects/   # 通用值对象
│   │   └── enums/           # 通用枚举
│   ├── infrastructure/      # 共享基础设施
│   └── presentation/        # 共享表现层组件
├── package.json
└── tsconfig.json

libs/infrastructure/          # 通用基础设施模块
├── config/                   # 配置管理
│   ├── src/
│   │   ├── database/        # 数据库配置
│   │   ├── redis/           # Redis配置
│   │   ├── jwt/             # JWT配置
│   │   └── app/             # 应用配置
│   ├── package.json
│   └── tsconfig.json
├── logging/                  # 日志管理
│   ├── src/
│   │   ├── formatters/      # 日志格式化
│   │   ├── transports/      # 日志传输
│   │   └── levels/          # 日志级别
│   ├── package.json
│   └── tsconfig.json
├── cache/                    # 缓存管理
│   ├── src/
│   │   ├── redis/           # Redis缓存
│   │   ├── memory/          # 内存缓存
│   │   └── strategies/      # 缓存策略
│   ├── package.json
│   └── tsconfig.json
└── database/                 # 数据库管理
    ├── src/
    │   ├── postgresql/      # PostgreSQL连接
    │   ├── mongodb/         # MongoDB连接
    │   ├── migrations/      # 数据库迁移
    │   └── seeds/           # 数据种子
    ├── package.json
    └── tsconfig.json

libs/notification/            # 通知领域模块
├── src/
│   ├── domain/              # 领域层
│   │   ├── entities/        # 通知实体
│   │   ├── value-objects/   # 通知值对象
│   │   ├── aggregates/      # 通知聚合根
│   │   ├── domain-events/   # 通知领域事件
│   │   ├── domain-services/ # 通知领域服务
│   │   ├── repositories/    # 通知仓储接口
│   │   ├── exceptions/      # 通知异常
│   │   ├── enums/           # 通知枚举
│   │   └── types/           # 通知类型定义
│   ├── application/         # 应用层
│   │   ├── use-cases/       # 通知用例
│   │   ├── commands/        # 通知命令
│   │   ├── queries/         # 通知查询
│   │   ├── projections/     # 通知投影
│   │   ├── services/        # 通知应用服务
│   │   └── interfaces/      # 通知应用层接口
│   ├── infrastructure/      # 基础设施层
│   │   ├── repositories/    # 通知仓储实现
│   │   ├── mappers/         # 通知映射器
│   │   ├── entities/        # 通知ORM实体
│   │   ├── services/        # 通知基础设施服务
│   │   ├── external/        # 外部通知服务集成
│   │   ├── config/          # 通知配置
│   │   └── migrations/      # 通知数据库迁移
│   └── presentation/        # 表现层
│       ├── controllers/     # 通知控制器
│       ├── dtos/            # 通知数据传输对象
│       ├── validators/      # 通知验证器
│       ├── guards/          # 通知权限守卫
│       └── interceptors/    # 通知拦截器
├── package.json
└── tsconfig.json
```

#### 应用示例

**正确示例**：
- ✅ `libs/core/iam/src/auth/infrastructure/jwt.service.ts` - IAM认证子领域的基础设施服务
- ✅ `libs/core/platform/src/domain/entities/platform-config.entity.ts` - 平台管理模块的领域实体
- ✅ `libs/core/tenant/src/domain/entities/tenant.entity.ts` - 租户管理模块的领域实体
- ✅ `libs/core/user/src/domain/entities/user.entity.ts` - 用户管理模块的领域实体
- ✅ `libs/core/iam/src/role/application/use-cases/create-role.usecase.ts` - IAM角色子领域的应用用例
- ✅ `libs/infrastructure/config/src/database/database.config.ts` - 通用数据库配置服务
- ✅ `libs/infrastructure/logging/src/formatters/json.formatter.ts` - 通用日志格式化服务
- ✅ `libs/infrastructure/cache/src/redis/redis.cache.service.ts` - 通用Redis缓存服务
- ✅ `libs/notification/src/domain/entities/notification.entity.ts` - 通知领域实体
- ✅ `libs/notification/src/application/use-cases/send-notification.usecase.ts` - 通知发送用例
- ✅ `libs/shared/src/domain/value-objects/uuid.vo.ts` - 共享UUID值对象

**错误示例**：
- ❌ `libs/core/iam/src/infrastructure/auth/jwt.service.ts` - 按分层架构组织，不符合DDD原则
- ❌ `libs/core/iam/src/domain/user/user.entity.ts` - 用户实体不应放在IAM模块中
- ❌ `libs/core/iam/src/platform/domain/entities/platform-user.entity.ts` - 平台用户实体不应放在IAM模块中
- ❌ `libs/core/platform/src/shared/domain/value-objects/uuid.vo.ts` - 各领域模块不应创建共享领域层
- ❌ `libs/core/user/src/infrastructure/database/database.service.ts` - 各领域模块不应重复开发基础设施服务
- ❌ `libs/core/tenant/src/shared/utils/logging.util.ts` - 各领域模块不应重复开发通用工具
- ❌ `libs/core/user/src/domain/entities/notification.entity.ts` - 通知实体不应放在用户模块中
- ❌ `libs/core/platform/src/application/use-cases/send-notification.usecase.ts` - 通知用例不应放在平台模块中

### 模块划分

```
libs/
├── shared/                   # 共享模块
│   ├── domain/               # 共享领域模型
│   ├── infrastructure/       # 共享基础设施
│   └── utils/                # 工具类
├── notification/             # 通知领域模块（独立开发，供各领域模块统一使用）
├── core/                     # 核心业务模块
│   ├── platform/             # 平台管理模块（核心业务领域）
│   ├── tenant/               # 租户管理模块（核心业务领域）
│   ├── user/                 # 用户管理模块（核心业务领域）
│   ├── organization/         # 组织管理模块（核心业务领域）
│   ├── department/           # 部门管理模块（核心业务领域）
│   └── iam/                  # 身份认证与授权管理模块（核心功能，与业务领域分离）
│       ├── auth/             # 认证子领域
│       ├── role/             # 角色子领域
│       ├── permission/       # 权限子领域
│       ├── session/          # 会话子领域
│       └── audit/            # 审计子领域
```

### 模块依赖关系

#### 3.1 依赖关系图

```
                    ┌─────────────────────────────────────┐
                    │           Business Modules           │
                    │           (业务模块层)               │
                    │  ┌─────────────┐  ┌─────────────┐  │
                    │  │   HR Mgmt   │  │ Finance Mgmt│  │
                    │  │ (人力资源)   │  │ (财务管理)   │  │
                    │  └─────────────┘  └─────────────┘  │
                    └─────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Mgmt     │    │  Platform Mgmt  │    │  Tenant Mgmt    │
│   (用户管理)     │    │   (平台管理)     │    │   (租户管理)     │
│   ┌─────────┐   │    │   ┌─────────┐   │    │   ┌─────────┐   │
│   │   IAM   │   │    │   │   IAM   │   │    │   │   IAM   │   │
│   └─────────┘   │    │   └─────────┘   │    │   └─────────┘   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Organization   │    │     Shared      │    │      IAM       │
│     Mgmt        │    │   (共享模块)     │    │ (身份认证授权)   │
│   (组织管理)     │    │                 │    │                 │
│   ┌─────────┐   │    │                 │    │                 │
│   │   IAM   │   │    │                 │    │                 │
│   └─────────┘   │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       │                       │
┌─────────────────┐              │                       │
│  Department     │              │                       │
│     Mgmt        │              │                       │
│   (部门管理)     │              │                       │
│   ┌─────────┐   │              │                       │
│   │   IAM   │   │              │                       │
│   └─────────┘   │              │                       │
└─────────────────┘              │                       │
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────────────────┐
                    │         Infrastructure Layer        │
                    │           (基础设施层)               │
                    │  ┌─────────────┐  ┌─────────────┐  │
                    │  │ PostgreSQL  │  │   Redis     │  │
                    │  │   MongoDB   │  │             │  │
                    └─────────────────────────────────────┘
```

#### 3.2 依赖关系说明

**基础依赖**
- **Shared模块**：所有模块都依赖的共享基础设施（值对象、基类、工具等）
- **IAM模块**：提供认证授权服务，被所有管理模块使用

**核心管理模块依赖**
- **User Management**：依赖Shared模块和IAM模块，专注于用户实体管理
- **Platform Management**：依赖Shared模块和IAM模块，管理平台级配置
- **Tenant Management**：依赖Shared模块和IAM模块，管理租户实体和生命周期
- **Organization Management**：依赖Shared模块、IAM模块和Tenant Management，管理组织架构
- **Department Management**：依赖Shared模块、IAM模块和Organization Management，管理部门架构

**业务模块依赖**
- **Business Modules**：业务模块（如HR、Finance、Order等）依赖所有基础管理模块
- **Infrastructure Layer**：基础设施层被所有上层模块使用

#### 3.3 依赖关系设计原则

**实体关系管理原则**
- **层级关系**：租户 → 组织 → 部门，形成清晰的层级结构
- **包含关系**：上级实体包含下级实体，下级实体属于上级实体
- **关系维护**：每个管理模块负责维护自己实体与其他实体的关系

**认证授权管理原则**
- **统一认证**：所有管理模块都直接依赖IAM模块进行认证授权
- **权限控制**：每个管理模块都有自己的权限控制需求
- **服务复用**：IAM模块作为公共服务，被所有模块复用

**模块职责分离原则**
- **用户管理**：专注于用户实体、用户档案、用户认证授权
- **组织管理**：专注于组织架构、组织关系、用户与组织的关系
- **部门管理**：专注于部门架构、部门关系、用户与部门的关系
- **租户管理**：专注于租户生命周期、租户配置、用户与租户的关系
│   ├── auth/                 # 认证授权子领域
│   │   ├── domain/           # 领域层
│   │   │   ├── entities/     # 实体 (业务实体)
│   │   │   ├── value-objects/# 值对象 (不可变对象)
│   │   │   ├── aggregates/   # 聚合根 (业务规则、一致性边界)
│   │   │   ├── domain-events/# 领域事件
│   │   │   ├── domain-services/# 领域服务
│   │   │   ├── repositories/ # 仓储接口
│   │   │   ├── exceptions/   # 领域异常
│   │   │   ├── enums/        # 枚举
│   │   │   └── types/        # 类型定义
│   │   ├── application/      # 应用层
│   │   │   ├── use-cases/    # 用例 (业务逻辑入口)
│   │   │   ├── commands/     # 命令 (写操作)
│   │   │   │   ├── handlers/ # 命令处理器
│   │   │   │   └── validators/ # 命令验证器
│   │   │   ├── queries/      # 查询 (读操作)
│   │   │   │   ├── handlers/ # 查询处理器
│   │   │   │   └── validators/ # 查询验证器
│   │   │   ├── projections/  # 读模型投影
│   │   │   ├── services/     # 应用服务
│   │   │   └── interfaces/   # 应用层接口
│   │   ├── infrastructure/   # 基础设施层
│   │   │   ├── repositories/ # 仓储实现
│   │   │   ├── mappers/      # 映射器
│   │   │   ├── entities/     # ORM实体
│   │   │   ├── services/     # 基础设施服务
│   │   │   ├── external/     # 外部服务集成
│   │   │   ├── config/       # 配置
│   │   │   └── migrations/   # 数据库迁移
│   │   └── presentation/     # 表现层
│   │       ├── controllers/  # 控制器
│   │       ├── dtos/         # 数据传输对象
│   │       ├── validators/   # 表现层验证器
│   │       ├── guards/       # 权限守卫
│   │       └── interceptors/ # 拦截器
# 注意：组织管理和部门管理已独立为独立模块，与IAM同级
│   ├── role/                 # 角色子领域
│   ├── permission/           # 权限子领域
│   └── audit/                # 审计子领域
apps/
└── api/                      # API应用
```

### 子领域职责划分

**注意**: 以下业务领域已独立为独立模块，与IAM同级，作为SAAS平台的核心业务功能：
- Platform Management (平台管理) - `libs/core/platform`
- Tenant Management (租户管理) - `libs/core/tenant`
- User Management (用户管理) - `libs/core/user`
- Organization Management (组织管理) - `libs/core/organization`
- Department Management (部门管理) - `libs/core/department`

**IAM模块专注于认证授权功能，与业务领域分离，包含以下子领域：**

#### 1. **auth 子领域**

- **职责**: 身份认证、多因子认证、单点登录
- **核心功能**: 
  - 用户名密码认证
  - 多因子认证（TOTP、短信、邮箱）
  - 单点登录（SSO）
  - OAuth2.0/OIDC集成
  - 生物识别认证
- **边界**: 专注于认证流程和认证方式，不涉及用户数据管理

#### 2. **role 子领域**

- **职责**: 角色定义、角色分配、角色继承
- **核心功能**: 
  - 角色定义和配置
  - 角色分配和撤销
  - 角色继承和组合
  - 系统角色和业务角色管理
  - 角色权限关联
- **边界**: 专注于角色层面的管理，不涉及具体权限实现

#### 3. **permission 子领域**

- **职责**: 权限定义、权限分配、权限验证
- **核心功能**: 
  - 权限定义和配置
  - 权限分配和撤销
  - 权限验证和检查
  - 功能权限、数据权限、字段权限
  - 权限申请和审批流程
- **边界**: 专注于权限层面的管理，提供权限验证服务

#### 4. **session 子领域**

- **职责**: 会话管理、会话验证、会话安全
- **核心功能**: 
  - 会话创建和维护
  - 会话验证和刷新
  - 会话安全策略
  - 多设备会话管理
  - 会话审计和监控
  - 会话超时管理
  - 并发会话控制
- **边界**: 专注于会话层面的管理，确保会话安全

#### 5. **audit 子领域**

- **职责**: 审计日志、合规检查、安全监控
- **核心功能**: 
  - 操作日志记录
  - 审计报告生成
  - 合规检查支持
  - 安全事件监控
  - 数据访问追踪
- **边界**: 专注于审计层面的管理，提供完整的审计能力

## 🔄 Clean Architecture + CQRS + GraphQL + 事件溯源架构设计

### Use Case 设计原则

```typescript
// Use Case 是业务逻辑的统一入口
@Injectable()
export class CreateUserUseCase {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly userRepository: UserRepository,
    private readonly emailService: EmailService,
    private readonly auditService: AuditService
  ) {}

  async execute(request: CreateUserRequest): Promise<CreateUserResponse> {
    // 1. 业务规则验证
    await this.validateBusinessRules(request);

    // 2. 创建命令
    const command = new CreateUserCommand(
      request.username,
      request.email,
      request.password,
      request.tenantId
    );

    // 3. 执行命令
    await this.commandBus.execute(command);

    // 4. 业务逻辑处理
    await this.sendWelcomeEmail(request.email);
    await this.auditService.logUserCreation(request);

    return { userId: command.userId, success: true };
  }

  private async validateBusinessRules(
    request: CreateUserRequest
  ): Promise<void> {
    // 业务规则验证逻辑
  }
}

@Injectable()
export class GetUserUseCase {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly permissionService: PermissionService
  ) {}

  async execute(request: GetUserRequest): Promise<GetUserResponse> {
    // 1. 权限验证
    await this.permissionService.checkPermission(
      request.currentUserId,
      'user',
      'read',
      request.userId
    );

    // 2. 创建查询
    const query = new GetUserByIdQuery(request.userId);

    // 3. 执行查询
    const user = await this.queryBus.execute(query);

    return { user, success: true };
  }
}
```

### CQRS 目录结构最佳实践

#### 应用层目录组织原则

```
application/
├── use-cases/          # 用例 (业务逻辑入口)
├── commands/           # 命令 (写操作)
│   ├── handlers/      # 命令处理器
│   └── validators/    # 命令验证器
├── queries/           # 查询 (读操作)
│   ├── handlers/      # 查询处理器
│   └── validators/    # 查询验证器
├── projections/       # 读模型投影
├── services/          # 应用服务
└── interfaces/        # 应用层接口
```

**设计原则**：
- **命令和查询分离**：写操作和读操作完全分离
- **处理器就近原则**：handlers放在对应的commands/queries目录下
- **验证器分离**：每个命令/查询都有对应的验证器
- **职责清晰**：每个目录都有明确的职责边界

### CQRS + GraphQL 模式设计

#### 命令端（Command Side）

```typescript
// 命令定义
export class CreateUserCommand {
  constructor(
    public readonly username: string,
    public readonly email: string,
    public readonly password: string,
    public readonly tenantId?: string
  ) {}
}

export class ChangeUserEmailCommand {
  constructor(
    public readonly userId: string,
    public readonly newEmail: string
  ) {}
}

// 命令处理器 - 位于 commands/handlers/
@CommandHandler(CreateUserCommand)
export class CreateUserHandler {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly eventStore: EventStore
  ) {}

  async execute(command: CreateUserCommand): Promise<void> {
    // 创建用户聚合根
    const userAggregate = UserAggregate.create(
      command.username,
      command.email,
      command.password
    );

    // 保存聚合根
    await this.userRepository.save(userAggregate);

    // 保存领域事件
    const events = userAggregate.getUncommittedEvents();
    await this.eventStore.saveEvents(
      userAggregate.getId(),
      events,
      userAggregate.getVersion()
    );

    // 标记事件为已提交
    userAggregate.markEventsAsCommitted();
  }
}

// 命令验证器 - 位于 commands/validators/
@Injectable()
export class CreateUserCommandValidator {
  async validate(command: CreateUserCommand): Promise<void> {
    if (!command.username || command.username.length < 3) {
      throw new ValidationException('Username must be at least 3 characters');
    }
    
    if (!command.email || !isValidEmail(command.email)) {
      throw new ValidationException('Invalid email format');
    }
    
    if (!command.password || command.password.length < 8) {
      throw new ValidationException('Password must be at least 8 characters');
    }
  }
}

// 命令总线
@Injectable()
export class CommandBus {
  constructor(private readonly handlers: Map<string, CommandHandler>) {}

  async execute<T extends Command>(command: T): Promise<void> {
    const handler = this.handlers.get(command.constructor.name);
    if (!handler) {
      throw new CommandHandlerNotFoundException(command.constructor.name);
    }
    await handler.execute(command);
  }
}
```

#### 查询端（Query Side）

```typescript
// 查询定义
export class GetUserByIdQuery {
  constructor(public readonly userId: string) {}
}

export class GetUsersByTenantQuery {
  constructor(
    public readonly tenantId: string,
    public readonly page: number,
    public readonly size: number
  ) {}
}

// 查询处理器 - 位于 queries/handlers/
@QueryHandler(GetUserByIdQuery)
export class GetUserByIdHandler {
  constructor(private readonly userReadModel: UserReadModel) {}

  async execute(query: GetUserByIdQuery): Promise<UserDto> {
    return this.userReadModel.findById(query.userId);
  }
}

// 查询验证器 - 位于 queries/validators/
@Injectable()
export class GetUserByIdQueryValidator {
  async validate(query: GetUserByIdQuery): Promise<void> {
    if (!query.userId || !isValidUuid(query.userId)) {
      throw new ValidationException('Invalid user ID format');
    }
  }
}

// 查询总线
@Injectable()
export class QueryBus {
  constructor(private readonly handlers: Map<string, QueryHandler>) {}

  async execute<T extends Query, R>(query: T): Promise<R> {
    const handler = this.handlers.get(query.constructor.name);
    if (!handler) {
      throw new QueryHandlerNotFoundException(query.constructor.name);
    }
    return handler.execute(query);
  }
}
```

### 事件溯源设计

#### 事件存储

```typescript
// 事件存储接口
interface EventStore {
  saveEvents(
    aggregateId: string,
    events: DomainEvent[],
    expectedVersion: number
  ): Promise<void>;
  getEvents(aggregateId: string): Promise<DomainEvent[]>;
  getEventsByType(eventType: string): Promise<DomainEvent[]>;
  getEventsByDateRange(from: Date, to: Date): Promise<DomainEvent[]>;
}

// PostgreSQL事件存储实现
@Injectable()
export class PostgreSQLEventStore implements EventStore {
  constructor(private readonly dataSource: DataSource) {}

  async saveEvents(
    aggregateId: string,
    events: DomainEvent[],
    expectedVersion: number
  ): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 检查版本冲突
      const currentVersion = await this.getCurrentVersion(aggregateId);
      if (currentVersion !== expectedVersion) {
        throw new ConcurrencyException(
          aggregateId,
          expectedVersion,
          currentVersion
        );
      }

      // 保存事件
      for (const event of events) {
        await queryRunner.query(
          `INSERT INTO domain_events (event_id, aggregate_id, aggregate_type, event_type, event_data, version, created_at) 
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            event.eventId,
            event.aggregateId,
            event.aggregateType,
            event.eventType,
            JSON.stringify(event.eventData),
            expectedVersion + 1,
            event.timestamp,
          ]
        );
        expectedVersion++;
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getEvents(aggregateId: string): Promise<DomainEvent[]> {
    const result = await this.dataSource.query(
      `SELECT * FROM domain_events WHERE aggregate_id = $1 ORDER BY version ASC`,
      [aggregateId]
    );
    return result.map(this.mapToDomainEvent);
  }

  private mapToDomainEvent(row: any): DomainEvent {
    return {
      eventId: row.event_id,
      aggregateId: row.aggregate_id,
      aggregateType: row.aggregate_type,
      eventType: row.event_type,
      eventData: JSON.parse(row.event_data),
      metadata: JSON.parse(row.metadata || '{}'),
      timestamp: new Date(row.created_at),
      version: row.version,
    };
  }
}
```

#### 领域模型分层设计

```typescript
// 1. 聚合根基类 - 业务规则和一致性边界
abstract class AggregateRoot {
  private uncommittedEvents: DomainEvent[] = [];
  private version: number = 0;

  protected apply(event: DomainEvent): void {
    this.uncommittedEvents.push(event);
    this.when(event);
  }

  protected abstract when(event: DomainEvent): void;

  getUncommittedEvents(): DomainEvent[] {
    return this.uncommittedEvents;
  }

  markEventsAsCommitted(): void {
    this.uncommittedEvents = [];
  }

  getVersion(): number {
    return this.version;
  }

  setVersion(version: number): void {
    this.version = version;
  }

  static rebuildFromEvents<T extends AggregateRoot>(
    this: new () => T,
    events: DomainEvent[]
  ): T {
    const aggregate = new this();
    events.forEach((event) => aggregate.when(event));
    aggregate.setVersion(events.length);
    return aggregate;
  }
}

// 2. 角色聚合根 - 角色级业务规则和一致性边界
export class RoleAggregate extends AggregateRoot {
  private role: RoleEntity;
  private uncommittedEvents: DomainEvent[] = [];

  static create(
    name: string,
    code: string,
    description: string,
    tenantId: string
  ): RoleAggregate {
    const aggregate = new RoleAggregate();
    const roleId = RoleId.generate();

    // 创建角色实体
    aggregate.role = RoleEntity.create(roleId, name, code, description, tenantId);

    // 应用业务规则
    aggregate.validateRoleCode(code);

    // 产生领域事件
    aggregate.apply(new RoleCreatedEvent(roleId, name, code, tenantId));

    return aggregate;
  }

  changeName(newName: string): void {
    // 业务规则验证
    if (this.role.name === newName) {
      return;
    }

    // 更新实体
    this.role.changeName(newName);

    // 产生领域事件
    this.apply(
      new RoleNameChangedEvent(this.role.id, this.role.name, newName)
    );
  }

  changeDescription(newDescription: string): void {
    if (this.role.description === newDescription) {
      return;
    }
    this.apply(new RoleDescriptionChangedEvent(this.role.id, this.role.description, newDescription));
  }

  protected when(event: DomainEvent): void {
    if (event instanceof RoleCreatedEvent) {
      this.role = RoleEntity.create(
        new RoleId(event.roleId),
        event.name,
        event.code,
        event.description,
        event.tenantId
      );
    } else if (event instanceof RoleNameChangedEvent) {
      this.role.changeName(event.newName);
    } else if (event instanceof RoleDescriptionChangedEvent) {
      this.role.changeDescription(event.newDescription);
    }
  }

  private validateRoleCode(code: string): void {
    // 角色代码验证业务规则
    if (!/^[A-Z_][A-Z0-9_]*$/.test(code)) {
      throw new InvalidRoleCodeException(
        'Role code must start with uppercase letter and contain only uppercase letters, numbers and underscores'
      );
    }
  }

  // Getters
  getId(): RoleId {
    return this.role.id;
  }

  getRole(): RoleEntity {
    return this.role;
  }
}

// 3. 权限聚合根 - 权限级业务规则和一致性边界
export class PermissionAggregate extends AggregateRoot {
  private permission: PermissionEntity;
  private uncommittedEvents: DomainEvent[] = [];

  static create(
    name: string,
    code: string,
    resource: string,
    action: string,
    tenantId: string
  ): PermissionAggregate {
    const aggregate = new PermissionAggregate();
    const permissionId = PermissionId.generate();

    // 创建权限实体
    aggregate.permission = PermissionEntity.create(
      permissionId,
      name,
      code,
      resource,
      action,
      tenantId
    );

    // 应用业务规则
    aggregate.validatePermissionCode(code);

    // 产生领域事件
    aggregate.apply(new PermissionCreatedEvent(
      permissionId,
      name,
      code,
      resource,
      action,
      tenantId
    ));

    return aggregate;
  }

  changeResource(newResource: string): void {
    if (this.permission.resource === newResource) {
      return;
    }
    this.apply(new PermissionResourceChangedEvent(
      this.permission.id.toString(),
      this.permission.resource,
      newResource
    ));
  }

  changeAction(newAction: string): void {
    if (this.permission.action === newAction) {
      return;
    }
    this.apply(new PermissionActionChangedEvent(
      this.permission.id.toString(),
      this.permission.action,
      newAction
    ));
  }

  protected when(event: DomainEvent): void {
    if (event instanceof PermissionCreatedEvent) {
      this.permission = PermissionEntity.create(
        new PermissionId(event.permissionId),
        event.name,
        event.code,
        event.resource,
        event.action,
        event.tenantId
      );
    } else if (event instanceof PermissionResourceChangedEvent) {
      this.permission.changeResource(event.newResource);
    } else if (event instanceof PermissionActionChangedEvent) {
      this.permission.changeAction(event.newAction);
    }
  }

  private validatePermissionCode(code: string): void {
    // 权限代码验证业务规则
    if (!/^[A-Z_][A-Z0-9_]*$/.test(code)) {
      throw new InvalidPermissionCodeException(
        'Permission code must start with uppercase letter and contain only uppercase letters, numbers and underscores'
      );
    }
  }

  // Getters
  getId(): PermissionId {
    return this.permission.id;
  }

  getPermission(): PermissionEntity {
    return this.permission;
  }
}

// 3. 角色实体 - 角色级业务实体，有标识
export class RoleEntity extends DataIsolationAwareEntity {
  constructor(
    id: RoleId,
    private name: string,
    private code: string,
    private description: string,
    private tenantId: string,
    private status: RoleStatus = RoleStatus.ACTIVE,
    dataPrivacyLevel: DataPrivacyLevel = DataPrivacyLevel.PROTECTED
  ) {
    super(
      new Uuid(tenantId),
      DataIsolationLevel.TENANT,
      dataPrivacyLevel,
      id
    );
  }

  static create(
    id: RoleId,
    name: string,
    code: string,
    description: string,
    tenantId: string
  ): RoleEntity {
    return new RoleEntity(id, name, code, description, tenantId);
  }

  changeName(newName: string): void {
    this.name = newName;
  }

  changeDescription(newDescription: string): void {
    this.description = newDescription;
  }

  // Getters
  get id(): RoleId {
    return this._id as RoleId;
  }
  get roleName(): string {
    return this.name;
  }
  get roleCode(): string {
    return this.code;
  }
  get roleDescription(): string {
    return this.description;
  }
  get roleStatus(): RoleStatus {
    return this.status;
  }
}

// 4. 权限实体 - 权限级业务实体，有标识
export class PermissionEntity extends DataIsolationAwareEntity {
  constructor(
    id: PermissionId,
    private name: string,
    private code: string,
    private resource: string,
    private action: string,
    private tenantId: string,
    private status: PermissionStatus = PermissionStatus.ACTIVE,
    dataPrivacyLevel: DataPrivacyLevel = DataPrivacyLevel.PROTECTED
  ) {
    super(
      new Uuid(tenantId),
      DataIsolationLevel.TENANT,
      dataPrivacyLevel,
      id
    );
  }

  static create(
    id: PermissionId,
    name: string,
    code: string,
    resource: string,
    action: string,
    tenantId: string
  ): PermissionEntity {
    return new PermissionEntity(id, name, code, resource, action, tenantId);
  }

  changeResource(newResource: string): void {
    this.resource = newResource;
  }

  changeAction(newAction: string): void {
    this.action = newAction;
  }

  // Getters
  get id(): PermissionId {
    return this._id as PermissionId;
  }
  get permissionName(): string {
    return this.name;
  }
  get permissionCode(): string {
    return this.code;
  }
  get permissionResource(): string {
    return this.resource;
  }
  get permissionAction(): string {
    return this.action;
  }
  get permissionStatus(): PermissionStatus {
    return this.status;
  }
}

// 4. 值对象 - 不可变对象
export class RoleId {
  constructor(private readonly value: string) {}

  static generate(): RoleId {
    return new RoleId(crypto.randomUUID());
  }

  equals(other: RoleId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}

export class PermissionId {
  constructor(private readonly value: string) {}

  static generate(): PermissionId {
    return new PermissionId(crypto.randomUUID());
  }

  equals(other: PermissionId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}

export class Uuid {
  constructor(private readonly value: string) {}

  static generate(): Uuid {
    return new Uuid(crypto.randomUUID());
  }

  equals(other: Uuid): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
```

#### 读模型投影

```typescript
// 投影接口
interface Projection {
  handle(event: DomainEvent): Promise<void>;
}

// 会话读模型投影
@Injectable()
export class SessionReadModelProjection implements Projection {
  constructor(private readonly sessionReadModel: SessionReadModel) {}

  async handle(event: DomainEvent): Promise<void> {
    if (event instanceof SessionCreatedEvent) {
      await this.sessionReadModel.create({
        id: event.eventData.sessionId,
        userId: event.eventData.userId,
        tenantId: event.eventData.tenantId,
        deviceInfo: event.eventData.deviceInfo,
        ipAddress: event.eventData.ipAddress,
        userAgent: event.eventData.userAgent,
        expiresAt: event.eventData.expiresAt,
        status: 'ACTIVE',
        createdAt: event.timestamp,
      });
    } else if (event instanceof SessionRefreshedEvent) {
      await this.sessionReadModel.updateExpiresAt(
        event.eventData.sessionId,
        event.eventData.newExpiresAt
      );
    } else if (event instanceof SessionTerminatedEvent) {
      await this.sessionReadModel.updateStatus(
        event.eventData.sessionId,
        'TERMINATED'
      );
    }
  }
}

// 角色读模型服务
@Injectable()
export class RoleReadModel {
  constructor(private readonly dataSource: DataSource) {}

  async create(roleData: RoleDto): Promise<void> {
    await this.dataSource.query(
      `INSERT INTO roles_read_model (
        id, name, code, description, tenant_id, status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        roleData.id,
        roleData.name,
        roleData.code,
        roleData.description,
        roleData.tenantId,
        roleData.status,
        roleData.createdAt,
      ]
    );
  }

  async updateName(roleId: string, name: string): Promise<void> {
    await this.dataSource.query(
      `UPDATE roles_read_model SET name = $1, updated_at = NOW() WHERE id = $2`,
      [name, roleId]
    );
  }

  async updateDescription(roleId: string, description: string): Promise<void> {
    await this.dataSource.query(
      `UPDATE roles_read_model SET description = $1, updated_at = NOW() WHERE id = $2`,
      [description, roleId]
    );
  }

  async findById(roleId: string): Promise<RoleDto | null> {
    const result = await this.dataSource.query(
      `SELECT * FROM roles_read_model WHERE id = $1`,
      [roleId]
    );
    return result.length > 0 ? this.mapToRoleDto(result[0]) : null;
  }

  async findByTenant(
    tenantId: string,
    page: number,
    size: number
  ): Promise<RoleDto[]> {
    const offset = (page - 1) * size;
    const result = await this.dataSource.query(
      `SELECT * FROM roles_read_model WHERE tenant_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [tenantId, size, offset]
    );
    return result.map(this.mapToRoleDto);
  }

  private mapToRoleDto(row: any): RoleDto {
    return {
      id: row.id,
      name: row.name,
      code: row.code,
      description: row.description,
      tenantId: row.tenant_id,
      status: row.status,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}

// 权限读模型服务
@Injectable()
export class PermissionReadModel {
  constructor(private readonly dataSource: DataSource) {}

  async create(permissionData: PermissionDto): Promise<void> {
    await this.dataSource.query(
      `INSERT INTO permissions_read_model (
        id, name, code, resource, action, tenant_id, status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        permissionData.id,
        permissionData.name,
        permissionData.code,
        permissionData.resource,
        permissionData.action,
        permissionData.tenantId,
        permissionData.status,
        permissionData.createdAt,
      ]
    );
  }

  async updateResource(permissionId: string, resource: string): Promise<void> {
    await this.dataSource.query(
      `UPDATE permissions_read_model SET resource = $1, updated_at = NOW() WHERE id = $2`,
      [resource, permissionId]
    );
  }

  async updateAction(permissionId: string, action: string): Promise<void> {
    await this.dataSource.query(
      `UPDATE permissions_read_model SET action = $1, updated_at = NOW() WHERE id = $2`,
      [action, permissionId]
    );
  }

  async findById(permissionId: string): Promise<PermissionDto | null> {
    const result = await this.dataSource.query(
      `SELECT * FROM permissions_read_model WHERE id = $1`,
      [permissionId]
    );
    return result.length > 0 ? this.mapToPermissionDto(result[0]) : null;
  }

  async findByTenant(
    tenantId: string,
    page: number,
    size: number
  ): Promise<PermissionDto[]> {
    const offset = (page - 1) * size;
    const result = await this.dataSource.query(
      `SELECT * FROM permissions_read_model WHERE tenant_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [tenantId, size, offset]
    );
    return result.map(this.mapToPermissionDto);
  }

  private mapToPermissionDto(row: any): PermissionDto {
    return {
      id: row.id,
      name: row.name,
      code: row.code,
      resource: row.resource,
      action: row.action,
      tenantId: row.tenant_id,
      status: row.status,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
```

## 🔐 安全架构与数据隔离设计

### 数据隔离策略

#### 4.1 多层级数据隔离

```
数据隔离层级：
┌─────────────────────────────────────────────────────────┐
│                    Platform Level                       │
│                 (平台级数据隔离)                         │
├─────────────────────────────────────────────────────────┤
│                     Tenant Level                        │
│                  (租户级数据隔离)                        │
├─────────────────────────────────────────────────────────┤
│                  Organization Level                     │
│                 (组织级数据隔离)                         │
├─────────────────────────────────────────────────────────┤
│                   Department Level                     │
│                  (部门级数据隔离)                        │
├─────────────────────────────────────────────────────────┤
│                     User Level                         │
│                   (用户级数据隔离)                       │
└─────────────────────────────────────────────────────────┘
```

#### 4.2 数据隐私级别

```
数据隐私级别：
1. PUBLIC（公开数据）
   - 可以被任何人访问
   - 适用于公开信息

2. SHARED（共享数据）
   - 可以在指定范围内共享
   - 适用于内部共享信息

3. PROTECTED（受保护数据）
   - 需要特定权限才能访问
   - 适用于敏感信息

4. PRIVATE（私有数据）
   - 只有所有者可以访问
   - 适用于个人隐私信息
```

### 数据隔离与访问控制架构

#### 数据隔离级别

```typescript
export enum DataIsolationLevel {
  /** 平台级隔离 */
  PLATFORM = 'platform',
  /** 租户级隔离 */
  TENANT = 'tenant',
  /** 组织级隔离 */
  ORGANIZATION = 'organization',
  /** 部门级隔离 */
  DEPARTMENT = 'department',
  /** 子部门级隔离 */
  SUB_DEPARTMENT = 'sub_department',
  /** 用户级隔离 */
  USER = 'user',
}

export enum DataPrivacyLevel {
  /** 可共享 */
  SHARED = 'shared',
  /** 受保护 */
  PROTECTED = 'protected',
}
```

#### 数据隔离层次结构

```
平台 (Platform)
├── 平台级数据 (Platform Data)
│   ├── 可共享数据 (Shared Data)
│   │   ├── 平台公告
│   │   ├── 系统通知
│   │   ├── 公共API文档
│   │   └── 平台版本信息
│   └── 受保护数据 (Protected Data)
│       ├── 平台配置
│       ├── 系统日志
│       ├── 管理员数据
│       └── 系统维护配置
└── 租户 (Tenant)
    ├── 租户级数据 (Tenant Data)
    │   ├── 可共享数据 (Shared Data)
    │   └── 受保护数据 (Protected Data)
    ├── 组织 (Organization)
    │   ├── 组织级数据 (Organization Data)
    │   │   ├── 可共享数据 (Shared Data)
    │   │   └── 受保护数据 (Protected Data)
    │   ├── 部门 (Department)
    │   │   ├── 部门级数据 (Department Data)
    │   │   │   ├── 可共享数据 (Shared Data)
    │   │   │   └── 受保护数据 (Protected Data)
    │   │   └── 子部门 (Sub-Department)
    │   │       └── 子部门级数据 (Sub-Department Data)
    │   └── 用户级数据 (User Data)
    │       ├── 可共享数据 (Shared Data)
    │       └── 受保护数据 (Protected Data)
    └── 用户级数据 (User Data)
        ├── 可共享数据 (Shared Data)
        └── 受保护数据 (Protected Data)
```

#### 实体基类设计

```typescript
// 平台感知实体基类
export abstract class PlatformAwareEntity extends BaseEntity {
  protected _dataPrivacyLevel: DataPrivacyLevel;

  constructor(
    id?: Uuid,
    dataPrivacyLevel: DataPrivacyLevel = DataPrivacyLevel.PROTECTED
  ) {
    super(id ?? Uuid.generate());
    this._dataPrivacyLevel = dataPrivacyLevel;
  }

  public canAccess(target: PlatformAwareEntity): boolean {
    try {
      // 如果目标对象是可共享数据，则允许访问
      if (target._dataPrivacyLevel === DataPrivacyLevel.SHARED) {
        return true;
      }

      // 如果目标对象是受保护数据，则需要平台管理员权限
      if (target._dataPrivacyLevel === DataPrivacyLevel.PROTECTED) {
        return this.isPlatformAdmin();
      }

      return false;
    } catch {
      return false;
    }
  }

  protected abstract isPlatformAdmin(): boolean;

  public isSharedData(): boolean {
    return this._dataPrivacyLevel === DataPrivacyLevel.SHARED;
  }

  public isProtectedData(): boolean {
    return this._dataPrivacyLevel === DataPrivacyLevel.PROTECTED;
  }

  protected assertPlatformAccess(target: PlatformAwareEntity): void {
    if (!this.canAccess(target)) {
      throw new PlatformAccessDeniedError(
        `平台级访问被拒绝: 目标对象隐私级别为${target._dataPrivacyLevel}`
      );
    }
  }
}

// 数据隔离感知实体基类
export abstract class DataIsolationAwareEntity extends BaseEntity {
  protected readonly _tenantId: Uuid;
  protected _organizationId?: Uuid;
  protected _departmentIds: Uuid[] = [];
  protected _userId?: Uuid;
  protected _dataIsolationLevel: DataIsolationLevel;
  protected _dataPrivacyLevel: DataPrivacyLevel;

  constructor(
    tenantId: Uuid,
    dataIsolationLevel: DataIsolationLevel = DataIsolationLevel.TENANT,
    dataPrivacyLevel: DataPrivacyLevel = DataPrivacyLevel.PROTECTED,
    id?: Uuid,
    organizationId?: Uuid,
    departmentIds: Uuid[] = [],
    userId?: Uuid
  ) {
    super(id ?? Uuid.generate());
    this._tenantId = tenantId;
    this._dataIsolationLevel = dataIsolationLevel;
    this._dataPrivacyLevel = dataPrivacyLevel;
    this._organizationId = organizationId;
    this._departmentIds = [...departmentIds];
    this._userId = userId;
  }

  public canAccess(target: DataIsolationAwareEntity): boolean {
    try {
      // 平台级数据访问控制
      if (target._dataIsolationLevel === DataIsolationLevel.PLATFORM) {
        return this.canAccessPlatformData(target);
      }

      // 用户级数据访问控制（跨层级存在）
      if (target._dataIsolationLevel === DataIsolationLevel.USER) {
        return this.canAccessUserData(target);
      }

      // 其他级别的访问控制
      return this.canAccessByLevel(target, target._dataIsolationLevel);
    } catch {
      return false;
    }
  }

  private canAccessPlatformData(target: DataIsolationAwareEntity): boolean {
    if (target._dataPrivacyLevel === DataPrivacyLevel.SHARED) {
      return true; // 可共享的平台数据，所有用户都可访问
    }
    return this.isPlatformAdmin();
  }

  private canAccessUserData(target: DataIsolationAwareEntity): boolean {
    if (target._dataPrivacyLevel === DataPrivacyLevel.SHARED) {
      return this.isInSameOrganization(target);
    }
    return this._userId?.equals(target._userId) ?? false;
  }

  private canAccessByLevel(
    target: DataIsolationAwareEntity,
    level: DataIsolationLevel
  ): boolean {
    // 首先检查租户是否匹配
    if (!this._tenantId.equals(target.tenantId)) {
      return false;
    }

    // 如果目标对象是租户级公共数据，则允许访问
    if (target._dataIsolationLevel === DataIsolationLevel.TENANT) {
      return true;
    }

    switch (level) {
      case DataIsolationLevel.TENANT:
        return true; // 租户级访问允许访问所有同租户数据
      case DataIsolationLevel.ORGANIZATION:
        this.assertSameOrganization(target);
        return true;
      case DataIsolationLevel.DEPARTMENT:
        this.assertSameDepartment(target);
        return true;
      case DataIsolationLevel.SUB_DEPARTMENT:
        this.assertSameDepartment(target);
        return true;
      default:
        return false;
    }
  }

  protected assertSameTenant(other: DataIsolationAwareEntity): void {
    if (!this._tenantId.equals(other.tenantId)) {
      throw new TenantAccessDeniedError(
        `操作禁止: 实体属于租户${this._tenantId.toString()}，目标属于${other.tenantId.toString()}`
      );
    }
  }

  protected assertSameOrganization(other: DataIsolationAwareEntity): void {
    this.assertSameTenant(other);
    if (this._organizationId && other.organizationId) {
      if (!this._organizationId.equals(other.organizationId)) {
        throw new TenantAccessDeniedError(
          `操作禁止: 实体属于组织${this._organizationId.toString()}，目标属于${other.organizationId.toString()}`
        );
      }
    }
  }

  protected assertSameDepartment(other: DataIsolationAwareEntity): void {
    this.assertSameOrganization(other);
    const commonDepartments = this._departmentIds.filter((deptId) =>
      other.departmentIds.some((otherDeptId) => deptId.equals(otherDeptId))
    );
    if (commonDepartments.length === 0) {
      throw new TenantAccessDeniedError(
        `操作禁止: 实体与目标对象没有共同的部门归属`
      );
    }
  }
}
```

### 认证架构

#### JWT Token 设计

```typescript
interface JWTPayload {
  sub: string; // 用户ID
  tenantId: string; // 租户ID
  orgIds: string[]; // 组织ID列表
  deptIds: string[]; // 部门ID列表
  roles: string[]; // 角色列表
  permissions: string[]; // 权限列表
  iat: number; // 签发时间
  exp: number; // 过期时间
  jti: string; // JWT ID
}
```

#### 多因子认证

```typescript
interface MFAConfig {
  type: 'TOTP' | 'SMS' | 'EMAIL';
  enabled: boolean;
  backupCodes: string[];
  lastUsed: Date;
}
```

### 权限控制架构

#### RBAC + ABAC + 数据隔离混合模型

```typescript
interface Permission {
  resource: string; // 资源标识
  action: string; // 操作类型
  conditions: Condition[]; // 访问条件
  isolationLevel: DataIsolationLevel; // 数据隔离级别
  privacyLevel: DataPrivacyLevel; // 隐私级别
}

interface Condition {
  attribute: string; // 属性名
  operator: string; // 操作符
  value: any; // 属性值
}

// 权限检查服务
@Injectable()
export class PermissionService {
  constructor(
    private readonly dataAccessControlService: DataAccessControlService,
    private readonly userRepository: UserRepository,
    private readonly permissionRepository: PermissionRepository
  ) {}

  async checkPermission(
    userId: string,
    resource: string,
    action: string,
    targetEntity?: DataIsolationAwareEntity
  ): Promise<boolean> {
    // 1. 获取用户信息
    const user = await this.userRepository.findById(userId);
    if (!user) {
      return false;
    }

    // 2. 获取用户权限
    const permissions = await this.permissionRepository.findUserPermissions(
      userId,
      user.tenantId
    );

    // 3. 检查权限
    const hasPermission = permissions.some(
      (permission) =>
        permission.resource === resource && permission.action === action
    );

    if (!hasPermission) {
      return false;
    }

    // 4. 如果有目标实体，进行数据隔离检查
    if (targetEntity) {
      return user.canAccess(targetEntity);
    }

    return true;
  }

  async checkDataAccess(
    userId: string,
    targetEntity: DataIsolationAwareEntity
  ): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      return false;
    }

    return user.canAccess(targetEntity);
  }
}
```

### 数据安全架构

#### 数据隔离策略

- **平台级隔离**: 系统级别隔离，只有平台管理员可访问
- **租户级隔离**: 数据库级别隔离，确保租户间数据完全隔离
- **组织级隔离**: 应用级别隔离，组织间数据隔离
- **部门级隔离**: 数据级别隔离，部门间数据隔离
- **子部门级隔离**: 细粒度数据隔离，子部门间数据隔离
- **用户级隔离**: 行级别隔离，用户间数据隔离

#### 数据访问控制策略

- **隐私级别控制**: 基于 `DataPrivacyLevel` 的访问控制
  - **可共享数据**: 同级别内所有成员可访问
  - **受保护数据**: 需要特定权限才能访问
- **跨层级访问控制**: 支持从高级别向低级别的访问控制
- **用户级数据跨层级**: 用户级数据可以存在于任何组织层级下，但访问控制基于用户身份

#### 4.14 个人数据与部门数据访问控制机制

##### 4.14.1 数据分类定义

```typescript
export enum DataOwnershipType {
  /** 个人数据 - 用户创建和拥有的数据 */
  PERSONAL = 'personal',
  /** 部门数据 - 部门内部共享的数据 */
  DEPARTMENT = 'department',
  /** 组织数据 - 组织内部共享的数据 */
  ORGANIZATION = 'organization',
  /** 租户数据 - 租户内部共享的数据 */
  TENANT = 'tenant',
  /** 平台数据 - 平台级共享的数据 */
  PLATFORM = 'platform',
}

export enum DataAccessScope {
  /** 私有访问 - 只有所有者可以访问 */
  PRIVATE = 'private',
  /** 部门访问 - 部门内成员可以访问 */
  DEPARTMENT = 'department',
  /** 组织访问 - 组织内成员可以访问 */
  ORGANIZATION = 'organization',
  /** 租户访问 - 租户内成员可以访问 */
  TENANT = 'tenant',
  /** 平台访问 - 平台内所有用户都可以访问 */
  PLATFORM = 'platform',
}
```

##### 4.14.2 数据访问控制实体设计

```typescript
// 数据访问控制实体基类
export abstract class DataAccessControlledEntity extends DataIsolationAwareEntity {
  protected _dataOwnershipType: DataOwnershipType;
  protected _dataAccessScope: DataAccessScope;
  protected _ownerId: Uuid;
  protected _sharedWithUsers: Uuid[] = [];
  protected _sharedWithDepartments: Uuid[] = [];
  protected _sharedWithOrganizations: Uuid[] = [];

  constructor(
    tenantId: Uuid,
    dataIsolationLevel: DataIsolationLevel,
    dataPrivacyLevel: DataPrivacyLevel,
    dataOwnershipType: DataOwnershipType,
    dataAccessScope: DataAccessScope,
    ownerId: Uuid,
    id?: Uuid,
    organizationId?: Uuid,
    departmentIds: Uuid[] = [],
    userId?: Uuid
  ) {
    super(
      tenantId,
      dataIsolationLevel,
      dataPrivacyLevel,
      id,
      organizationId,
      departmentIds,
      userId
    );
    this._dataOwnershipType = dataOwnershipType;
    this._dataAccessScope = dataAccessScope;
    this._ownerId = ownerId;
  }

  /**
   * 检查用户是否可以访问此实体
   * @param user 请求访问的用户
   * @returns 是否允许访问
   */
  public canAccess(user: DataIsolationAwareEntity): boolean {
    // 1. 基础数据隔离检查
    if (!super.canAccess(user)) {
      return false;
    }

    // 2. 所有者检查
    if (this._ownerId.equals(user.id)) {
      return true;
    }

    // 3. 数据访问范围检查
    switch (this._dataAccessScope) {
      case DataAccessScope.PRIVATE:
        return false; // 私有数据只有所有者可以访问
      
      case DataAccessScope.DEPARTMENT:
        return this.canAccessByDepartment(user);
      
      case DataAccessScope.ORGANIZATION:
        return this.canAccessByOrganization(user);
      
      case DataAccessScope.TENANT:
        return this.canAccessByTenant(user);
      
      case DataAccessScope.PLATFORM:
        return true; // 平台级数据所有用户都可以访问
      
      default:
        return false;
    }
  }

  /**
   * 部门级访问控制
   */
  private canAccessByDepartment(user: DataIsolationAwareEntity): boolean {
    // 检查用户是否在共享部门列表中
    if (this._sharedWithDepartments.length > 0) {
      const userDepartments = user.departmentIds || [];
      return this._sharedWithDepartments.some(deptId =>
        userDepartments.some(userDeptId => deptId.equals(userDeptId))
      );
    }

    // 如果没有指定共享部门，检查用户是否与所有者在同一部门
    if (this._organizationId && user.organizationId) {
      if (!this._organizationId.equals(user.organizationId)) {
        return false;
      }

      const userDepartments = user.departmentIds || [];
      const ownerDepartments = this._departmentIds || [];
      
      return userDepartments.some(userDeptId =>
        ownerDepartments.some(ownerDeptId => userDeptId.equals(ownerDeptId))
      );
    }

    return false;
  }

  /**
   * 组织级访问控制
   */
  private canAccessByOrganization(user: DataIsolationAwareEntity): boolean {
    // 检查用户是否在共享组织列表中
    if (this._sharedWithOrganizations.length > 0) {
      return this._sharedWithOrganizations.some(orgId =>
        user.organizationId && orgId.equals(user.organizationId)
      );
    }

    // 如果没有指定共享组织，检查用户是否与所有者在同一组织
    return this._organizationId && user.organizationId &&
           this._organizationId.equals(user.organizationId);
  }

  /**
   * 租户级访问控制
   */
  private canAccessByTenant(user: DataIsolationAwareEntity): boolean {
    // 租户级数据，同租户内所有用户都可以访问
    return this._tenantId.equals(user.tenantId);
  }

  /**
   * 共享数据给指定用户
   */
  public shareWithUser(userId: Uuid): void {
    if (!this._sharedWithUsers.some(id => id.equals(userId))) {
      this._sharedWithUsers.push(userId);
    }
  }

  /**
   * 共享数据给指定部门
   */
  public shareWithDepartment(departmentId: Uuid): void {
    if (!this._sharedWithDepartments.some(id => id.equals(departmentId))) {
      this._sharedWithDepartments.push(departmentId);
    }
  }

  /**
   * 共享数据给指定组织
   */
  public shareWithOrganization(organizationId: Uuid): void {
    if (!this._sharedWithOrganizations.some(id => id.equals(organizationId))) {
      this._sharedWithOrganizations.push(organizationId);
    }
  }

  /**
   * 撤销用户访问权限
   */
  public revokeUserAccess(userId: Uuid): void {
    this._sharedWithUsers = this._sharedWithUsers.filter(id => !id.equals(userId));
  }

  /**
   * 撤销部门访问权限
   */
  public revokeDepartmentAccess(departmentId: Uuid): void {
    this._sharedWithDepartments = this._sharedWithDepartments.filter(id => !id.equals(departmentId));
  }

  /**
   * 撤销组织访问权限
   */
  public revokeOrganizationAccess(organizationId: Uuid): void {
    this._sharedWithOrganizations = this._sharedWithOrganizations.filter(id => !id.equals(organizationId));
  }

  // Getters
  get dataOwnershipType(): DataOwnershipType {
    return this._dataOwnershipType;
  }

  get dataAccessScope(): DataAccessScope {
    return this._dataAccessScope;
  }

  get ownerId(): Uuid {
    return this._ownerId;
  }

  get sharedWithUsers(): Uuid[] {
    return [...this._sharedWithUsers];
  }

  get sharedWithDepartments(): Uuid[] {
    return [...this._sharedWithDepartments];
  }

  get sharedWithOrganizations(): Uuid[] {
    return [...this._sharedWithOrganizations];
  }
}
```

##### 4.14.3 业务实体实现示例

```typescript
// 个人数据实体 - 用户创建和拥有的数据
export class PersonalDocument extends DataAccessControlledEntity {
  private _title: string;
  private _content: string;
  private _tags: string[] = [];
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(
    tenantId: Uuid,
    ownerId: Uuid,
    title: string,
    content: string,
    organizationId?: Uuid,
    departmentIds: Uuid[] = [],
    id?: Uuid
  ) {
    super(
      tenantId,
      DataIsolationLevel.USER,
      DataPrivacyLevel.PROTECTED,
      DataOwnershipType.PERSONAL,
      DataAccessScope.PRIVATE, // 默认私有访问
      ownerId,
      id,
      organizationId,
      departmentIds,
      ownerId
    );
    this._title = title;
    this._content = content;
    this._createdAt = new Date();
    this._updatedAt = new Date();
  }

  /**
   * 共享文档给指定用户
   */
  shareWithUser(userId: Uuid): void {
    super.shareWithUser(userId);
    this._dataAccessScope = DataAccessScope.PRIVATE; // 保持私有，但允许特定用户访问
  }

  /**
   * 共享文档给部门
   */
  shareWithDepartment(departmentId: Uuid): void {
    super.shareWithDepartment(departmentId);
    this._dataAccessScope = DataAccessScope.DEPARTMENT;
  }

  /**
   * 共享文档给组织
   */
  shareWithOrganization(organizationId: Uuid): void {
    super.shareWithOrganization(organizationId);
    this._dataAccessScope = DataAccessScope.ORGANIZATION;
  }

  /**
   * 发布为租户级文档
   */
  publishToTenant(): void {
    this._dataAccessScope = DataAccessScope.TENANT;
    this._dataOwnershipType = DataOwnershipType.TENANT;
  }

  // Getters
  get title(): string {
    return this._title;
  }

  get content(): string {
    return this._content;
  }

  get tags(): string[] {
    return [...this._tags];
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }
}

// 部门数据实体 - 部门内部共享的数据
export class DepartmentProject extends DataAccessControlledEntity {
  private _name: string;
  private _description: string;
  private _status: ProjectStatus;
  private _startDate: Date;
  private _endDate?: Date;
  private _teamMembers: Uuid[] = [];
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(
    tenantId: Uuid,
    organizationId: Uuid,
    departmentIds: Uuid[],
    ownerId: Uuid,
    name: string,
    description: string,
    id?: Uuid
  ) {
    super(
      tenantId,
      DataIsolationLevel.DEPARTMENT,
      DataPrivacyLevel.PROTECTED,
      DataOwnershipType.DEPARTMENT,
      DataAccessScope.DEPARTMENT, // 部门内共享
      ownerId,
      id,
      organizationId,
      departmentIds,
      ownerId
    );
    this._name = name;
    this._description = description;
    this._status = ProjectStatus.PLANNING;
    this._startDate = new Date();
    this._createdAt = new Date();
    this._updatedAt = new Date();
  }

  /**
   * 添加团队成员
   */
  addTeamMember(userId: Uuid): void {
    if (!this._teamMembers.some(id => id.equals(userId))) {
      this._teamMembers.push(userId);
    }
  }

  /**
   * 移除团队成员
   */
  removeTeamMember(userId: Uuid): void {
    this._teamMembers = this._teamMembers.filter(id => !id.equals(userId));
  }

  /**
   * 扩展项目到其他部门
   */
  extendToDepartments(departmentIds: Uuid[]): void {
    departmentIds.forEach(deptId => {
      if (!this._departmentIds.some(id => id.equals(deptId))) {
        this._departmentIds.push(deptId);
      }
    });
  }

  /**
   * 扩展项目到组织级
   */
  extendToOrganization(): void {
    this._dataAccessScope = DataAccessScope.ORGANIZATION;
    this._dataOwnershipType = DataOwnershipType.ORGANIZATION;
  }

  // Getters
  get name(): string {
    return this._name;
  }

  get description(): string {
    return this._description;
  }

  get status(): ProjectStatus {
    return this._status;
  }

  get startDate(): Date {
    return this._startDate;
  }

  get endDate(): Date | undefined {
    return this._endDate;
  }

  get teamMembers(): Uuid[] {
    return [...this._teamMembers];
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }
}

// 组织数据实体 - 组织内部共享的数据
export class OrganizationPolicy extends DataAccessControlledEntity {
  private _name: string;
  private _content: string;
  private _category: PolicyCategory;
  private _version: string;
  private _effectiveDate: Date;
  private _expiryDate?: Date;
  private _approvalStatus: ApprovalStatus;
  private _approvedBy?: Uuid;
  private _approvedAt?: Date;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(
    tenantId: Uuid,
    organizationId: Uuid,
    ownerId: Uuid,
    name: string,
    content: string,
    category: PolicyCategory,
    id?: Uuid
  ) {
    super(
      tenantId,
      DataIsolationLevel.ORGANIZATION,
      DataPrivacyLevel.PROTECTED,
      DataOwnershipType.ORGANIZATION,
      DataAccessScope.ORGANIZATION, // 组织内共享
      ownerId,
      id,
      organizationId,
      [],
      ownerId
    );
    this._name = name;
    this._content = content;
    this._category = category;
    this._version = '1.0.0';
    this._effectiveDate = new Date();
    this._approvalStatus = ApprovalStatus.DRAFT;
    this._createdAt = new Date();
    this._updatedAt = new Date();
  }

  /**
   * 提交审批
   */
  submitForApproval(): void {
    this._approvalStatus = ApprovalStatus.PENDING;
    this._updatedAt = new Date();
  }

  /**
   * 审批通过
   */
  approve(approverId: Uuid): void {
    this._approvalStatus = ApprovalStatus.APPROVED;
    this._approvedBy = approverId;
    this._approvedAt = new Date();
    this._updatedAt = new Date();
  }

  /**
   * 审批拒绝
   */
  reject(reason: string): void {
    this._approvalStatus = ApprovalStatus.REJECTED;
    this._updatedAt = new Date();
  }

  /**
   * 发布到租户级
   */
  publishToTenant(): void {
    this._dataAccessScope = DataAccessScope.TENANT;
    this._dataOwnershipType = DataOwnershipType.TENANT;
    this._updatedAt = new Date();
  }

  // Getters
  get name(): string {
    return this._name;
  }

  get content(): string {
    return this._content;
  }

  get category(): PolicyCategory {
    return this._category;
  }

  get version(): string {
    return this._version;
  }

  get effectiveDate(): Date {
    return this._effectiveDate;
  }

  get expiryDate(): Date | undefined {
    return this._expiryDate;
  }

  get approvalStatus(): ApprovalStatus {
    return this._approvalStatus;
  }

  get approvedBy(): Uuid | undefined {
    return this._approvedBy;
  }

  get approvedAt(): Date | undefined {
    return this._approvedAt;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }
}
```

##### 4.14.4 数据访问控制服务

```typescript
// 数据访问控制服务
@Injectable()
export class DataAccessControlService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly organizationRepository: OrganizationRepository,
    private readonly departmentRepository: DepartmentRepository,
    private readonly cacheService: CacheService
  ) {}

  /**
   * 检查用户对指定实体的访问权限
   */
  async checkDataAccess(
    userId: string,
    targetEntity: DataAccessControlledEntity
  ): Promise<boolean> {
    // 1. 从缓存获取用户信息
    const cacheKey = `user:${userId}:access_control`;
    let user = await this.cacheService.get(cacheKey);
    
    if (!user) {
      user = await this.userRepository.findById(userId);
      if (!user) {
        return false;
      }
      // 缓存用户信息5分钟
      await this.cacheService.set(cacheKey, user, 300);
    }

    // 2. 基础数据隔离检查
    if (!user.canAccess(targetEntity)) {
      return false;
    }

    // 3. 数据访问控制检查
    return targetEntity.canAccess(user);
  }

  /**
   * 获取用户可以访问的个人数据
   */
  async getAccessiblePersonalData(
    userId: string,
    ownerId?: string,
    page: number = 1,
    size: number = 20
  ): Promise<PaginatedResponse<PersonalDocument>> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException(userId);
    }

    // 构建查询条件
    const conditions: any = {
      tenantId: user.tenantId,
      $or: [
        { ownerId: userId }, // 自己创建的数据
        { sharedWithUsers: userId }, // 共享给自己的数据
      ]
    };

    // 如果指定了所有者，添加所有者条件
    if (ownerId) {
      conditions.ownerId = ownerId;
    }

    // 添加部门和组织访问条件
    if (user.organizationId) {
      conditions.$or.push({
        sharedWithOrganizations: user.organizationId
      });
    }

    if (user.departmentIds && user.departmentIds.length > 0) {
      conditions.$or.push({
        sharedWithDepartments: { $in: user.departmentIds }
      });
    }

    return this.personalDocumentRepository.findByConditions(
      conditions,
      page,
      size
    );
  }

  /**
   * 获取用户可以访问的部门数据
   */
  async getAccessibleDepartmentData(
    userId: string,
    departmentId?: string,
    page: number = 1,
    size: number = 20
  ): Promise<PaginatedResponse<DepartmentProject>> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException(userId);
    }

    // 构建查询条件
    const conditions: any = {
      tenantId: user.tenantId,
      $or: [
        { ownerId: userId }, // 自己创建的数据
        { sharedWithUsers: userId }, // 共享给自己的数据
      ]
    };

    // 如果指定了部门，添加部门条件
    if (departmentId) {
      conditions.departmentIds = departmentId;
    } else {
      // 如果没有指定部门，查询用户所在部门的数据
      if (user.departmentIds && user.departmentIds.length > 0) {
        conditions.departmentIds = { $in: user.departmentIds };
      }
    }

    // 添加组织访问条件
    if (user.organizationId) {
      conditions.$or.push({
        sharedWithOrganizations: user.organizationId
      });
    }

    return this.departmentProjectRepository.findByConditions(
      conditions,
      page,
      size
    );
  }

  /**
   * 获取用户可以访问的组织数据
   */
  async getAccessibleOrganizationData(
    userId: string,
    organizationId?: string,
    page: number = 1,
    size: number = 20
  ): Promise<PaginatedResponse<OrganizationPolicy>> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException(userId);
    }

    // 构建查询条件
    const conditions: any = {
      tenantId: user.tenantId,
      $or: [
        { ownerId: userId }, // 自己创建的数据
        { sharedWithUsers: userId }, // 共享给自己的数据
      ]
    };

    // 如果指定了组织，添加组织条件
    if (organizationId) {
      conditions.organizationId = organizationId;
    } else {
      // 如果没有指定组织，查询用户所在组织的数据
      if (user.organizationId) {
        conditions.organizationId = user.organizationId;
      }
    }

    return this.organizationPolicyRepository.findByConditions(
      conditions,
      page,
      size
    );
  }

  /**
   * 检查用户是否有权限共享数据
   */
  async canShareData(
    userId: string,
    targetEntity: DataAccessControlledEntity
  ): Promise<boolean> {
    // 1. 检查是否是数据所有者
    if (targetEntity.ownerId.equals(userId)) {
      return true;
    }

    // 2. 检查是否有共享权限
    const user = await this.userRepository.findById(userId);
    if (!user) {
      return false;
    }

    // 3. 检查用户权限
    return this.checkUserPermission(user, 'data', 'share', targetEntity);
  }

  /**
   * 共享数据给指定用户
   */
  async shareDataWithUser(
    userId: string,
    targetEntity: DataAccessControlledEntity,
    targetUserId: string
  ): Promise<void> {
    // 检查权限
    if (!(await this.canShareData(userId, targetEntity))) {
      throw new AccessDeniedException('没有权限共享此数据');
    }

    // 执行共享
    targetEntity.shareWithUser(new Uuid(targetUserId));
    
    // 保存实体
    await this.saveEntity(targetEntity);
    
    // 记录审计日志
    await this.auditService.logDataSharing(
      userId,
      targetEntity.id.toString(),
      'USER',
      targetUserId
    );
  }

  /**
   * 共享数据给指定部门
   */
  async shareDataWithDepartment(
    userId: string,
    targetEntity: DataAccessControlledEntity,
    departmentId: string
  ): Promise<void> {
    // 检查权限
    if (!(await this.canShareData(userId, targetEntity))) {
      throw new AccessDeniedException('没有权限共享此数据');
    }

    // 执行共享
    targetEntity.shareWithDepartment(new Uuid(departmentId));
    
    // 保存实体
    await this.saveEntity(targetEntity);
    
    // 记录审计日志
    await this.auditService.logDataSharing(
      userId,
      targetEntity.id.toString(),
      'DEPARTMENT',
      departmentId
    );
  }

  /**
   * 撤销数据访问权限
   */
  async revokeDataAccess(
    userId: string,
    targetEntity: DataAccessControlledEntity,
    targetType: 'USER' | 'DEPARTMENT' | 'ORGANIZATION',
    targetId: string
  ): Promise<void> {
    // 检查权限
    if (!(await this.canShareData(userId, targetEntity))) {
      throw new AccessDeniedException('没有权限撤销此数据的访问权限');
    }

    // 执行撤销
    switch (targetType) {
      case 'USER':
        targetEntity.revokeUserAccess(new Uuid(targetId));
        break;
      case 'DEPARTMENT':
        targetEntity.revokeDepartmentAccess(new Uuid(targetId));
        break;
      case 'ORGANIZATION':
        targetEntity.revokeOrganizationAccess(new Uuid(targetId));
        break;
    }
    
    // 保存实体
    await this.saveEntity(targetEntity);
    
    // 记录审计日志
    await this.auditService.logDataAccessRevocation(
      userId,
      targetEntity.id.toString(),
      targetType,
      targetId
    );
  }

  /**
   * 获取数据访问权限列表
   */
  async getDataAccessPermissions(
    entityId: string
  ): Promise<DataAccessPermissions> {
    const entity = await this.getEntityById(entityId);
    if (!entity) {
      throw new EntityNotFoundException(entityId);
    }

    return {
      ownerId: entity.ownerId.toString(),
      dataOwnershipType: entity.dataOwnershipType,
      dataAccessScope: entity.dataAccessScope,
      sharedWithUsers: entity.sharedWithUsers.map(id => id.toString()),
      sharedWithDepartments: entity.sharedWithDepartments.map(id => id.toString()),
      sharedWithOrganizations: entity.sharedWithOrganizations.map(id => id.toString()),
    };
  }

  private async checkUserPermission(
    user: User,
    resource: string,
    action: string,
    targetEntity?: DataAccessControlledEntity
  ): Promise<boolean> {
    // 实现用户权限检查逻辑
    // 这里可以集成现有的权限系统
    return true; // 简化实现
  }

  private async saveEntity(entity: DataAccessControlledEntity): Promise<void> {
    // 根据实体类型保存到对应的仓储
    // 这里需要根据实际实现调整
  }

  private async getEntityById(entityId: string): Promise<DataAccessControlledEntity | null> {
    // 根据实体ID获取实体
    // 这里需要根据实际实现调整
    return null;
  }
}

// 数据访问权限信息
interface DataAccessPermissions {
  ownerId: string;
  dataOwnershipType: DataOwnershipType;
  dataAccessScope: DataAccessScope;
  sharedWithUsers: string[];
  sharedWithDepartments: string[];
  sharedWithOrganizations: string[];
}

// 枚举定义
export enum ProjectStatus {
  PLANNING = 'planning',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ON_HOLD = 'on_hold',
  CANCELLED = 'cancelled',
}

export enum PolicyCategory {
  HR = 'hr',
  FINANCE = 'finance',
  IT = 'it',
  SECURITY = 'security',
  COMPLIANCE = 'compliance',
  OPERATIONS = 'operations',
}

export enum ApprovalStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}
```

#### 数据隔离实现示例

```typescript
// 用户实体 - 支持跨层级存在
export class User extends DataIsolationAwareEntity {
  private _username: string;
  private _email: string;
  private _status: UserStatus;

  constructor(
    tenantId: Uuid,
    username: string,
    email: string,
    organizationId?: Uuid,
    departmentIds: Uuid[] = [],
    dataPrivacyLevel: DataPrivacyLevel = DataPrivacyLevel.PROTECTED,
    id?: Uuid
  ) {
    super(
      tenantId,
      DataIsolationLevel.USER,
      dataPrivacyLevel,
      id,
      organizationId,
      departmentIds,
      id // userId 与实体ID相同
    );
    this._username = username;
    this._email = email;
    this._status = UserStatus.ACTIVE;
  }

  // 静态工厂方法 - 创建租户级用户（无组织归属）
  static createTenantUser(
    tenantId: Uuid,
    username: string,
    email: string
  ): User {
    return new User(tenantId, username, email);
  }

  // 静态工厂方法 - 创建组织级用户
  static createOrganizationUser(
    tenantId: Uuid,
    username: string,
    email: string,
    organizationId: Uuid
  ): User {
    return new User(tenantId, username, email, organizationId);
  }

  // 静态工厂方法 - 创建部门级用户
  static createDepartmentUser(
    tenantId: Uuid,
    username: string,
    email: string,
    organizationId: Uuid,
    departmentIds: Uuid[]
  ): User {
    return new User(tenantId, username, email, organizationId, departmentIds);
  }
}

// 组织实体 - 组织级隔离
export class Organization extends DataIsolationAwareEntity {
  private _name: string;
  private _code: string;
  private _status: OrganizationStatus;

  constructor(
    tenantId: Uuid,
    name: string,
    code: string,
    dataPrivacyLevel: DataPrivacyLevel = DataPrivacyLevel.PROTECTED,
    id?: Uuid
  ) {
    super(
      tenantId,
      DataIsolationLevel.ORGANIZATION,
      dataPrivacyLevel,
      id,
      id // organizationId 与实体ID相同
    );
    this._name = name;
    this._code = code;
    this._status = OrganizationStatus.ACTIVE;
  }
}

// 部门实体 - 部门级隔离
export class Department extends DataIsolationAwareEntity {
  private _name: string;
  private _code: string;
  private _parentId?: Uuid;
  private _level: number;
  private _status: DepartmentStatus;

  constructor(
    tenantId: Uuid,
    organizationId: Uuid,
    name: string,
    code: string,
    level: number = 1,
    parentId?: Uuid,
    dataPrivacyLevel: DataPrivacyLevel = DataPrivacyLevel.PROTECTED,
    id?: Uuid
  ) {
    super(
      tenantId,
      DataIsolationLevel.DEPARTMENT,
      dataPrivacyLevel,
      id,
      organizationId,
      [id!] // departmentIds 包含当前部门ID
    );
    this._name = name;
    this._code = code;
    this._parentId = parentId;
    this._level = level;
    this._status = DepartmentStatus.ACTIVE;
  }
}

// 租户配置实体 - 租户级公共数据
export class TenantConfiguration extends DataIsolationAwareEntity {
  private _settings: Record<string, unknown> = {};

  constructor(
    tenantId: Uuid,
    dataPrivacyLevel: DataPrivacyLevel = DataPrivacyLevel.SHARED,
    id?: Uuid
  ) {
    super(tenantId, DataIsolationLevel.TENANT, dataPrivacyLevel, id);
  }

  getSetting(key: string): unknown {
    return this._settings[key];
  }

  setSetting(key: string, value: unknown): void {
    this._settings[key] = value;
    this.updateTimestamp();
  }
}

// 平台配置实体 - 平台级数据
export class PlatformConfiguration extends PlatformAwareEntity {
  private readonly _key: string;
  private _value: unknown;
  private readonly _category: string;
  private readonly _isSystem: boolean;

  constructor(
    key: string,
    value: unknown,
    category: string,
    isSystem: boolean = false,
    dataPrivacyLevel: DataPrivacyLevel = DataPrivacyLevel.PROTECTED,
    id?: Uuid
  ) {
    super(id, dataPrivacyLevel);
    this._key = key;
    this._value = value;
    this._category = category;
    this._isSystem = isSystem;
  }

  override isPlatformAdmin(): boolean {
    // 实现平台管理员权限检查逻辑
    return false;
  }
}
```

## 📊 数据模型与GraphQL设计

### 核心实体关系

```
Platform (平台)
├── PlatformConfiguration (平台配置) - 1:N
├── PlatformUser (平台用户) - 1:N
├── SystemConfiguration (系统配置) - 1:N
└── PlatformAdministrator (平台管理员) - 1:N

Tenant (租户)
├── Organization (组织) - 1:N
│   ├── Department (部门) - 1:N
│   │   └── SubDepartment (子部门) - 1:N
│   └── TenantUser (租户用户) - M:N (跨层级存在)
├── TenantUser (租户用户) - 1:N (租户级用户，无组织归属)
├── Role (角色) - 1:N
├── Permission (权限) - 1:N
├── TenantConfiguration (租户配置) - 1:N
└── AuditLog (审计日志) - 1:N

PlatformUser (平台用户)
└── TenantUser (租户用户) - 1:1 (用户生命周期管理)

数据隔离关系：
Platform (平台级) - 平台级数据隔离
└── Tenant (租户级) - 租户级数据隔离
    ├── Organization (组织级) - 组织级数据隔离
    │   ├── Department (部门级) - 部门级数据隔离
    │   │   └── SubDepartment (子部门级) - 子部门级数据隔离
    │   └── TenantUser (用户级) - 用户级数据隔离（跨层级存在）
    └── TenantUser (用户级) - 用户级数据隔离（跨层级存在）
```

### 数据隔离关系

```
数据隔离层次结构：
Platform (平台级)
├── PlatformUser (平台用户) - 平台级数据隔离
├── PlatformConfiguration (平台配置) - 平台级数据隔离
├── SystemConfiguration (系统配置) - 平台级数据隔离
└── PlatformAdministrator (平台管理员) - 平台级数据隔离

Tenant (租户级)
├── Organization (组织级)
│   ├── Department (部门级)
│   │   └── SubDepartment (子部门级)
│   └── TenantUser (用户级 - 跨层级存在)
├── TenantUser (用户级 - 跨层级存在)
├── Role (角色) - 租户级数据隔离
├── Permission (权限) - 租户级数据隔离
├── TenantConfiguration (租户配置) - 租户级数据隔离
└── AuditLog (审计日志) - 租户级数据隔离

隐私级别分类：
├── SHARED (可共享) - 同级别内所有成员可访问
└── PROTECTED (受保护) - 需要特定权限才能访问

实体类型：
├── PlatformAwareEntity (平台感知实体)
│   ├── PlatformUser (平台用户)
│   ├── PlatformConfiguration (平台配置)
│   ├── SystemConfiguration (系统配置)
│   └── PlatformAdministrator (平台管理员)
└── DataIsolationAwareEntity (数据隔离感知实体)
    ├── Tenant Level (租户级)
    │   ├── Tenant (租户)
    │   ├── Role (角色)
    │   ├── Permission (权限)
    │   ├── TenantConfiguration (租户配置)
    │   └── AuditLog (审计日志)
    ├── Organization Level (组织级)
    │   └── Organization (组织)
    ├── Department Level (部门级)
    │   └── Department (部门)
    ├── SubDepartment Level (子部门级)
    │   └── SubDepartment (子部门)
    └── User Level (用户级 - 跨层级)
        └── TenantUser (租户用户)
```

### 数据库设计

#### PostgreSQL 表结构

```sql
-- 租户表
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    subscription_plan VARCHAR(100),
    resource_quota JSONB,
    config JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 组织表
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) NOT NULL,
    type VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    description TEXT,
    manager_id UUID,
    config JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, name),
    UNIQUE(tenant_id, code)
);

-- 部门表
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) NOT NULL,
    type VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    parent_id UUID REFERENCES departments(id),
    level INTEGER NOT NULL DEFAULT 1,
    path TEXT,
    manager_id UUID,
    description TEXT,
    config JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, name),
    UNIQUE(organization_id, code)
);

-- 平台配置表
CREATE TABLE platform_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(255) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    is_system BOOLEAN NOT NULL DEFAULT FALSE,
    data_privacy_level VARCHAR(20) NOT NULL DEFAULT 'PROTECTED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 平台用户表
CREATE TABLE platform_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    profile JSONB,
    mfa_config JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 租户配置表
CREATE TABLE tenant_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    settings JSONB NOT NULL DEFAULT '{}',
    data_privacy_level VARCHAR(20) NOT NULL DEFAULT 'SHARED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 租户用户表
CREATE TABLE tenant_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform_user_id UUID NOT NULL REFERENCES platform_users(id),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    hire_date DATE,
    leave_date DATE,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(platform_user_id, tenant_id)
);

-- 用户组织关系表
CREATE TABLE user_organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_user_id UUID NOT NULL REFERENCES tenant_users(id),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    department_id UUID REFERENCES departments(id),
    data_isolation_level VARCHAR(20) NOT NULL DEFAULT 'USER',
    data_privacy_level VARCHAR(20) NOT NULL DEFAULT 'PROTECTED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_user_id, organization_id)
);

-- 数据访问控制表
CREATE TABLE data_access_control (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    organization_id UUID REFERENCES organizations(id),
    department_ids JSONB DEFAULT '[]',
    data_ownership_type VARCHAR(20) NOT NULL,
    data_access_scope VARCHAR(20) NOT NULL,
    owner_id UUID NOT NULL REFERENCES platform_users(id),
    shared_with_users JSONB DEFAULT '[]',
    shared_with_departments JSONB DEFAULT '[]',
    shared_with_organizations JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_data_access_control_entity (entity_id, entity_type),
    INDEX idx_data_access_control_owner (owner_id),
    INDEX idx_data_access_control_tenant (tenant_id),
    INDEX idx_data_access_control_organization (organization_id)
);

-- 个人文档表
CREATE TABLE personal_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    owner_id UUID NOT NULL REFERENCES platform_users(id),
    organization_id UUID REFERENCES organizations(id),
    department_ids JSONB DEFAULT '[]',
    title VARCHAR(255) NOT NULL,
    content TEXT,
    tags JSONB DEFAULT '[]',
    data_ownership_type VARCHAR(20) NOT NULL DEFAULT 'personal',
    data_access_scope VARCHAR(20) NOT NULL DEFAULT 'private',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_personal_documents_owner (owner_id),
    INDEX idx_personal_documents_tenant (tenant_id),
    INDEX idx_personal_documents_organization (organization_id)
);

-- 部门项目表
CREATE TABLE department_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    department_ids JSONB NOT NULL DEFAULT '[]',
    owner_id UUID NOT NULL REFERENCES platform_users(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'planning',
    start_date DATE NOT NULL,
    end_date DATE,
    team_members JSONB DEFAULT '[]',
    data_ownership_type VARCHAR(20) NOT NULL DEFAULT 'department',
    data_access_scope VARCHAR(20) NOT NULL DEFAULT 'department',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_department_projects_owner (owner_id),
    INDEX idx_department_projects_tenant (tenant_id),
    INDEX idx_department_projects_organization (organization_id),
    INDEX idx_department_projects_departments USING GIN (department_ids)
);

-- 组织政策表
CREATE TABLE organization_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    owner_id UUID NOT NULL REFERENCES platform_users(id),
    name VARCHAR(255) NOT NULL,
    content TEXT,
    category VARCHAR(100) NOT NULL,
    version VARCHAR(50) NOT NULL DEFAULT '1.0.0',
    effective_date DATE NOT NULL,
    expiry_date DATE,
    approval_status VARCHAR(50) NOT NULL DEFAULT 'draft',
    approved_by UUID REFERENCES platform_users(id),
    approved_at TIMESTAMP,
    data_ownership_type VARCHAR(20) NOT NULL DEFAULT 'organization',
    data_access_scope VARCHAR(20) NOT NULL DEFAULT 'organization',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_organization_policies_owner (owner_id),
    INDEX idx_organization_policies_tenant (tenant_id),
    INDEX idx_organization_policies_organization (organization_id),
    INDEX idx_organization_policies_category (category),
    INDEX idx_organization_policies_status (approval_status)
);

-- 数据共享记录表
CREATE TABLE data_sharing_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    shared_by UUID NOT NULL REFERENCES platform_users(id),
    shared_with_type VARCHAR(20) NOT NULL, -- 'USER', 'DEPARTMENT', 'ORGANIZATION'
    shared_with_id UUID NOT NULL,
    shared_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    INDEX idx_data_sharing_records_entity (entity_id, entity_type),
    INDEX idx_data_sharing_records_shared_by (shared_by),
    INDEX idx_data_sharing_records_shared_with (shared_with_type, shared_with_id),
    INDEX idx_data_sharing_records_active (is_active)
);

-- 角色表
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) NOT NULL,
    type VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    description TEXT,
    scope VARCHAR(50) NOT NULL DEFAULT 'GLOBAL',
    parent_id UUID REFERENCES roles(id),
    is_system BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, name),
    UNIQUE(tenant_id, code)
);

-- 权限表
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) NOT NULL,
    type VARCHAR(100),
    resource VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    conditions JSONB,
    isolation_level VARCHAR(20) NOT NULL DEFAULT 'TENANT',
    privacy_level VARCHAR(20) NOT NULL DEFAULT 'PROTECTED',
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    description TEXT,
    is_system BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, code)
);

-- 角色权限关系表
CREATE TABLE role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES roles(id),
    permission_id UUID NOT NULL REFERENCES permissions(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(role_id, permission_id)
);

-- 用户角色关系表
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_user_id UUID NOT NULL REFERENCES tenant_users(id),
    role_id UUID NOT NULL REFERENCES roles(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_user_id, role_id)
);

-- 审计日志表
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id),
    user_id UUID REFERENCES platform_users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(255),
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 领域事件存储表
CREATE TABLE domain_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL UNIQUE,
    aggregate_id VARCHAR(100) NOT NULL,
    aggregate_type VARCHAR(50) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB NOT NULL,
    metadata JSONB,
    version INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 读模型表（用户）
CREATE TABLE users_read_model (
    id UUID PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    tenant_id UUID REFERENCES tenants(id),
    organization_id UUID REFERENCES organizations(id),
    department_ids JSONB DEFAULT '[]',
    isolation_level VARCHAR(20) NOT NULL DEFAULT 'USER',
    privacy_level VARCHAR(20) NOT NULL DEFAULT 'PROTECTED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 认证相关表
-- 用户会话表
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES platform_users(id),
    tenant_id UUID REFERENCES tenants(id),
    session_id VARCHAR(255) UNIQUE NOT NULL,
    token_hash VARCHAR(255),
    device_info JSONB,
    ip_address INET,
    user_agent TEXT,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 多因子认证配置表
CREATE TABLE mfa_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES platform_users(id),
    type VARCHAR(50) NOT NULL, -- 'TOTP', 'SMS', 'EMAIL'
    secret_key VARCHAR(255),
    backup_codes JSONB,
    is_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    last_used TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, type)
);

-- 登录尝试记录表
CREATE TABLE login_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES platform_users(id),
    username VARCHAR(100),
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN NOT NULL,
    failure_reason VARCHAR(255),
    attempt_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 密码重置令牌表
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES platform_users(id),
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 邮箱验证令牌表
CREATE TABLE email_verification_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES platform_users(id),
    email VARCHAR(255) NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### MongoDB 集合设计

```javascript
// 用户会话集合
db.user_sessions.insertOne({
  _id: ObjectId(),
  userId: 'uuid',
  tenantId: 'uuid',
  sessionId: 'string',
  token: 'string',
  deviceInfo: {
    userAgent: 'string',
    ipAddress: 'string',
    location: 'string',
  },
  permissions: ['permission1', 'permission2'],
  lastActivity: new Date(),
  expiresAt: new Date(),
  createdAt: new Date(),
});

// 权限缓存集合
db.permission_cache.insertOne({
  _id: ObjectId(),
  userId: 'uuid',
  tenantId: 'uuid',
  permissions: [
    {
      resource: 'string',
      action: 'string',
      conditions: {},
    },
  ],
  roles: ['role1', 'role2'],
  expiresAt: new Date(),
  createdAt: new Date(),
});

// 事件存储集合
db.domain_events.insertOne({
  _id: ObjectId(),
  eventId: 'uuid',
  aggregateId: 'uuid',
  aggregateType: 'string',
  eventType: 'string',
  eventData: {},
  metadata: {
    tenantId: 'uuid',
    userId: 'uuid',
    timestamp: new Date(),
    version: 1,
  },
  createdAt: new Date(),
});
```

## 🔄 事件溯源与GraphQL架构

### 领域事件设计

```typescript
// 基础事件接口
interface DomainEvent {
  eventId: string;
  aggregateId: string;
  aggregateType: string;
  eventType: string;
  eventData: any;
  metadata: EventMetadata;
  timestamp: Date;
  version: number;
}

interface EventMetadata {
  tenantId?: string;
  userId?: string;
  organizationId?: string;
  departmentIds?: string[];
  isolationLevel?: DataIsolationLevel;
  privacyLevel?: DataPrivacyLevel;
  correlationId?: string;
  causationId?: string;
}
```

// 角色相关事件
interface RoleCreatedEvent extends DomainEvent {
eventType: 'RoleCreated';
eventData: {
roleId: string;
name: string;
code: string;
description: string;
tenantId: string;
};
}

interface RoleNameChangedEvent extends DomainEvent {
eventType: 'RoleNameChanged';
eventData: {
roleId: string;
oldName: string;
newName: string;
};
}

interface RoleDescriptionChangedEvent extends DomainEvent {
eventType: 'RoleDescriptionChanged';
eventData: {
roleId: string;
oldDescription: string;
newDescription: string;
};
}

// 权限相关事件
interface PermissionCreatedEvent extends DomainEvent {
eventType: 'PermissionCreated';
eventData: {
permissionId: string;
name: string;
code: string;
resource: string;
action: string;
tenantId: string;
};
}

interface PermissionResourceChangedEvent extends DomainEvent {
eventType: 'PermissionResourceChanged';
eventData: {
permissionId: string;
oldResource: string;
newResource: string;
};
}

interface PermissionActionChangedEvent extends DomainEvent {
eventType: 'PermissionActionChanged';
eventData: {
permissionId: string;
oldAction: string;
newAction: string;
};
}

// 会话相关事件
interface SessionCreatedEvent extends DomainEvent {
eventType: 'SessionCreated';
eventData: {
sessionId: string;
userId: string;
tenantId?: string;
deviceInfo: any;
ipAddress: string;
userAgent: string;
expiresAt: Date;
};
}

interface SessionRefreshedEvent extends DomainEvent {
eventType: 'SessionRefreshed';
eventData: {
sessionId: string;
userId: string;
newExpiresAt: Date;
};
}

interface SessionTerminatedEvent extends DomainEvent {
eventType: 'SessionTerminated';
eventData: {
sessionId: string;
userId: string;
reason: string;
};
}

// 权限相关事件
interface PermissionGrantedEvent extends DomainEvent {
eventType: 'PermissionGranted';
eventData: {
userId: string;
permissionId: string;
grantedBy: string;
tenantId: string;
};
}

// 认证相关事件
interface UserLoginEvent extends DomainEvent {
eventType: 'UserLogin';
eventData: {
userId: string;
tenantId?: string;
ipAddress: string;
userAgent: string;
loginMethod: 'PASSWORD' | 'MFA' | 'SSO';
};
}

interface UserLogoutEvent extends DomainEvent {
eventType: 'UserLogout';
eventData: {
userId: string;
sessionId: string;
tenantId?: string;
logoutReason: 'USER_INITIATED' | 'SESSION_EXPIRED' | 'SECURITY_POLICY';
};
}

````

### 事件投影设计

```typescript
// 投影接口
interface Projection {
  handle(event: DomainEvent): Promise<void>;
}

// 角色读模型投影
@Injectable()
export class RoleReadModelProjection implements Projection {
  constructor(private readonly roleReadModel: RoleReadModel) {}

  async handle(event: DomainEvent): Promise<void> {
    if (event instanceof RoleCreatedEvent) {
      await this.roleReadModel.create({
        id: event.eventData.roleId,
        name: event.eventData.name,
        code: event.eventData.code,
        description: event.eventData.description,
        tenantId: event.eventData.tenantId,
        status: 'ACTIVE',
        createdAt: event.timestamp,
      });
    } else if (event instanceof RoleNameChangedEvent) {
      await this.roleReadModel.updateName(
        event.eventData.roleId,
        event.eventData.newName
      );
    } else if (event instanceof RoleDescriptionChangedEvent) {
      await this.roleReadModel.updateDescription(
        event.eventData.roleId,
        event.eventData.newDescription
      );
    }
  }
}

// 权限读模型投影
@Injectable()
export class PermissionReadModelProjection implements Projection {
  constructor(private readonly permissionReadModel: PermissionReadModel) {}

  async handle(event: DomainEvent): Promise<void> {
    if (event instanceof PermissionCreatedEvent) {
      await this.permissionReadModel.create({
        id: event.eventData.permissionId,
        name: event.eventData.name,
        code: event.eventData.code,
        resource: event.eventData.resource,
        action: event.eventData.action,
        tenantId: event.eventData.tenantId,
        status: 'ACTIVE',
        createdAt: event.timestamp,
      });
    } else if (event instanceof PermissionResourceChangedEvent) {
      await this.permissionReadModel.updateResource(
        event.eventData.permissionId,
        event.eventData.newResource
      );
    } else if (event instanceof PermissionActionChangedEvent) {
      await this.permissionReadModel.updateAction(
        event.eventData.permissionId,
        event.eventData.newAction
      );
    }
  }
}
````

// 审计日志投影
@Injectable()
export class AuditLogProjection implements Projection {
constructor(private readonly auditService: AuditService) {}

async handle(event: DomainEvent): Promise<void> {
await this.auditService.logEvent(event);
}
}

````

## 🚀 性能优化与GraphQL优化设计

### 缓存策略

#### Redis 缓存设计

```typescript
// 缓存键设计
const CACHE_KEYS = {
  USER_PERMISSIONS: 'user:permissions:{userId}:{tenantId}',
  USER_ROLES: 'user:roles:{userId}:{tenantId}',
  ORGANIZATION_USERS: 'org:users:{orgId}',
  DEPARTMENT_USERS: 'dept:users:{deptId}',
  PERMISSION_CACHE: 'permission:{permissionId}',
  ROLE_CACHE: 'role:{roleId}',
  TENANT_CONFIG: 'tenant:config:{tenantId}',
  USER_SESSION: 'session:{sessionId}',
};

// 缓存配置
const CACHE_CONFIG = {
  USER_PERMISSIONS_TTL: 300, // 5分钟
  USER_ROLES_TTL: 600, // 10分钟
  ORGANIZATION_USERS_TTL: 1800, // 30分钟
  PERMISSION_CACHE_TTL: 3600, // 1小时
  ROLE_CACHE_TTL: 3600, // 1小时
  TENANT_CONFIG_TTL: 7200, // 2小时
  USER_SESSION_TTL: 1800, // 30分钟
};
````

#### 缓存更新策略

```typescript
// 缓存更新事件
interface CacheInvalidationEvent {
  type: 'USER_PERMISSIONS' | 'USER_ROLES' | 'ORGANIZATION_USERS';
  userId?: string;
  tenantId?: string;
  organizationId?: string;
}

// 缓存服务
@Injectable()
export class CacheService {
  constructor(
    private readonly redisService: RedisService,
    private readonly eventBus: EventBus
  ) {
    this.eventBus.subscribe(
      CacheInvalidationEvent,
      this.handleCacheInvalidation.bind(this)
    );
  }

  async invalidateUserPermissions(
    userId: string,
    tenantId: string
  ): Promise<void> {
    const key = CACHE_KEYS.USER_PERMISSIONS.replace('{userId}', userId).replace(
      '{tenantId}',
      tenantId
    );
    await this.redisService.del(key);
  }

  private async handleCacheInvalidation(
    event: CacheInvalidationEvent
  ): Promise<void> {
    switch (event.type) {
      case 'USER_PERMISSIONS':
        if (event.userId && event.tenantId) {
          await this.invalidateUserPermissions(event.userId, event.tenantId);
        }
        break;
      // 其他缓存失效处理...
    }
  }
}
```

### 数据库优化

#### 索引设计

```sql
-- 用户相关索引
CREATE INDEX idx_platform_configurations_key ON platform_configurations(key);
CREATE INDEX idx_platform_configurations_category ON platform_configurations(category);
CREATE INDEX idx_platform_configurations_privacy_level ON platform_configurations(data_privacy_level);

CREATE INDEX idx_platform_users_email ON platform_users(email);
CREATE INDEX idx_platform_users_username ON platform_users(username);
CREATE INDEX idx_platform_users_status ON platform_users(status);

CREATE INDEX idx_tenant_configurations_tenant_id ON tenant_configurations(tenant_id);
CREATE INDEX idx_tenant_configurations_privacy_level ON tenant_configurations(data_privacy_level);

CREATE INDEX idx_tenant_users_platform_user_id ON tenant_users(platform_user_id);
CREATE INDEX idx_tenant_users_tenant_id ON tenant_users(tenant_id);
CREATE INDEX idx_tenant_users_status ON tenant_users(status);

-- 组织相关索引
CREATE INDEX idx_organizations_tenant_id ON organizations(tenant_id);
CREATE INDEX idx_organizations_status ON organizations(status);
CREATE INDEX idx_organizations_tenant_name ON organizations(tenant_id, name);

-- 部门相关索引
CREATE INDEX idx_departments_organization_id ON departments(organization_id);
CREATE INDEX idx_departments_parent_id ON departments(parent_id);
CREATE INDEX idx_departments_path ON departments(path);
CREATE INDEX idx_departments_level ON departments(level);

-- 用户组织关系索引
CREATE INDEX idx_user_organizations_tenant_user_id ON user_organizations(tenant_user_id);
CREATE INDEX idx_user_organizations_organization_id ON user_organizations(organization_id);
CREATE INDEX idx_user_organizations_department_id ON user_organizations(department_id);
CREATE INDEX idx_user_organizations_isolation_level ON user_organizations(data_isolation_level);
CREATE INDEX idx_user_organizations_privacy_level ON user_organizations(data_privacy_level);

-- 权限相关索引
CREATE INDEX idx_roles_tenant_id ON roles(tenant_id);
CREATE INDEX idx_roles_parent_id ON roles(parent_id);
CREATE INDEX idx_roles_tenant_code ON roles(tenant_id, code);

CREATE INDEX idx_permissions_tenant_id ON permissions(tenant_id);
CREATE INDEX idx_permissions_resource ON permissions(resource);
CREATE INDEX idx_permissions_tenant_code ON permissions(tenant_id, code);
CREATE INDEX idx_permissions_isolation_level ON permissions(isolation_level);
CREATE INDEX idx_permissions_privacy_level ON permissions(privacy_level);

-- 审计日志索引
CREATE INDEX idx_audit_logs_tenant_id ON audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_tenant_created_at ON audit_logs(tenant_id, created_at);

-- 认证相关索引
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_session_id ON user_sessions(session_id);
CREATE INDEX idx_user_sessions_token_hash ON user_sessions(token_hash);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX idx_user_sessions_is_active ON user_sessions(is_active);

CREATE INDEX idx_mfa_configs_user_id ON mfa_configs(user_id);
CREATE INDEX idx_mfa_configs_type ON mfa_configs(type);
CREATE INDEX idx_mfa_configs_user_type ON mfa_configs(user_id, type);

CREATE INDEX idx_login_attempts_user_id ON login_attempts(user_id);
CREATE INDEX idx_login_attempts_ip_address ON login_attempts(ip_address);
CREATE INDEX idx_login_attempts_attempt_time ON login_attempts(attempt_time);
CREATE INDEX idx_login_attempts_success ON login_attempts(success);

CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_tokens_token_hash ON password_reset_tokens(token_hash);
CREATE INDEX idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);

CREATE INDEX idx_email_verification_tokens_user_id ON email_verification_tokens(user_id);
CREATE INDEX idx_email_verification_tokens_token_hash ON email_verification_tokens(token_hash);
CREATE INDEX idx_email_verification_tokens_expires_at ON email_verification_tokens(expires_at);

-- 事件存储索引
CREATE INDEX idx_domain_events_aggregate_id ON domain_events(aggregate_id);
CREATE INDEX idx_domain_events_aggregate_type ON domain_events(aggregate_type);
CREATE INDEX idx_domain_events_event_type ON domain_events(event_type);
CREATE INDEX idx_domain_events_created_at ON domain_events(created_at);
CREATE INDEX idx_domain_events_aggregate_version ON domain_events(aggregate_id, version);
CREATE INDEX idx_domain_events_event_id ON domain_events(event_id);

-- 读模型索引
CREATE INDEX idx_users_read_model_tenant_id ON users_read_model(tenant_id);
CREATE INDEX idx_users_read_model_organization_id ON users_read_model(organization_id);
CREATE INDEX idx_users_read_model_email ON users_read_model(email);
CREATE INDEX idx_users_read_model_status ON users_read_model(status);
CREATE INDEX idx_users_read_model_isolation_level ON users_read_model(isolation_level);
CREATE INDEX idx_users_read_model_privacy_level ON users_read_model(privacy_level);
CREATE INDEX idx_users_read_model_created_at ON users_read_model(created_at);
```

#### 查询优化

```typescript
// 用户权限查询优化
@Injectable()
export class UserPermissionService {
  constructor(
    private readonly cacheService: CacheService,
    private readonly userRepository: UserRepository,
    private readonly permissionRepository: PermissionRepository
  ) {}

  async getUserPermissions(
    userId: string,
    tenantId: string
  ): Promise<Permission[]> {
    // 先从缓存获取
    const cacheKey = CACHE_KEYS.USER_PERMISSIONS.replace(
      '{userId}',
      userId
    ).replace('{tenantId}', tenantId);
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    // 缓存未命中，从数据库查询
    const permissions = await this.permissionRepository.findUserPermissions(
      userId,
      tenantId
    );

    // 写入缓存
    await this.cacheService.set(
      cacheKey,
      permissions,
      CACHE_CONFIG.USER_PERMISSIONS_TTL
    );

    return permissions;
  }

  async hasPermission(
    userId: string,
    tenantId: string,
    resource: string,
    action: string
  ): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId, tenantId);
    return permissions.some(
      (p) => p.resource === resource && p.action === action
    );
  }
}
```

## 🔧 部署架构与监控设计

### 技术选型

#### 5.1 后端技术栈
- **框架**: NestJS (TypeScript)
- **数据库**: PostgreSQL + MongoDB
- **缓存**: Redis
- **搜索引擎**: Elasticsearch

#### 5.2 架构模式
- **Clean Architecture**: 分层架构
- **DDD**: 领域驱动设计
- **CQRS**: 命令查询职责分离
- **Event Sourcing**: 事件溯源

#### 5.3 部署方式
- **容器化**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **监控**: Prometheus + Grafana
- **日志**: ELK Stack

### 容器化部署

#### Docker 配置

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# 安装pnpm
RUN npm install -g pnpm

# 复制package文件
COPY package.json pnpm-lock.yaml ./

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 构建应用
RUN pnpm build

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["pnpm", "start:prod"]
```

#### Docker Compose 配置

```yaml
version: '3.8'

services:
  saas-api:
    build: .
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@postgres:5432/saas
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis
    networks:
      - saas-network

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=saas
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - saas-network

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    networks:
      - saas-network



volumes:
  postgres_data:
  redis_data:

networks:
  saas-network:
    driver: bridge
```

### 监控和日志

#### 监控配置

```typescript
// 监控指标
interface Metrics {
  // 用户相关指标
  activeUsers: number;
  newUsersPerDay: number;
  userLoginRate: number;

  // 权限相关指标
  permissionChecks: number;
  permissionCacheHitRate: number;
  permissionGrantRate: number;

  // 系统性能指标
  apiResponseTime: number;
  databaseQueryTime: number;
  cacheHitRate: number;

  // 错误指标
  errorRate: number;
  authenticationFailures: number;
  authorizationFailures: number;
}

// 监控服务
@Injectable()
export class MetricsService {
  constructor(private readonly prometheusService: PrometheusService) {}

  recordUserLogin(userId: string, tenantId: string): void {
    this.prometheusService
      .counter('user_logins_total', {
        userId,
        tenantId,
      })
      .inc();
  }

  recordPermissionCheck(
    userId: string,
    resource: string,
    action: string,
    granted: boolean
  ): void {
    this.prometheusService
      .counter('permission_checks_total', {
        userId,
        resource,
        action,
        granted: granted.toString(),
      })
      .inc();
  }

  recordApiResponseTime(method: string, path: string, duration: number): void {
    this.prometheusService
      .histogram('api_response_time_seconds', {
        method,
        path,
      })
      .observe(duration);
  }
}
```

#### 日志配置

```typescript
// 日志配置
const loggerConfig = {
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
};

// 结构化日志
interface LogContext {
  userId?: string;
  tenantId?: string;
  organizationId?: string;
  requestId?: string;
  action?: string;
  resource?: string;
}

// 日志服务
@Injectable()
export class LoggerService {
  private logger = winston.createLogger(loggerConfig);

  logUserAction(
    level: string,
    message: string,
    context: LogContext,
    error?: Error
  ): void {
    this.logger.log(level, message, {
      ...context,
      timestamp: new Date().toISOString(),
      error: error?.stack,
    });
  }

  logSecurityEvent(event: string, context: LogContext, details: any): void {
    this.logger.warn('Security Event', {
      event,
      ...context,
      details,
      timestamp: new Date().toISOString(),
    });
  }
}
```

## 📋 测试策略与架构

### 开发路线图

#### 6.1 第一阶段：基础架构（2-3周）
- 搭建基础项目结构
- 实现Shared模块
- 设计数据模型
- 搭建基础设施

#### 6.2 第二阶段：核心模块（4-6周）
- 实现User Management模块
- 实现Platform Management模块
- 实现Tenant Management模块
- 实现IAM模块

#### 6.3 第三阶段：扩展模块（3-4周）
- 实现Organization Management模块
- 实现Department Management模块
- 实现模块间集成
- 完善API接口

#### 6.4 第四阶段：优化完善（2-3周）
- 性能优化
- 安全加固
- 测试完善
- 文档完善

### 风险评估与应对

#### 6.5 技术风险
- **风险**: 架构复杂度增加
- **应对**: 采用成熟的技术栈和架构模式

#### 6.6 开发风险
- **风险**: 开发周期延长
- **应对**: 分阶段开发，优先实现核心功能

#### 6.7 集成风险
- **风险**: 模块间集成复杂
- **应对**: 设计清晰的接口契约，做好集成测试

### 测试分层

#### 单元测试

```typescript
// 用户实体测试
describe('User Entity', () => {
  let user: User;

  beforeEach(() => {
    user = new User('user-123', 'testuser', 'test@example.com');
  });

  it('should create user with valid data', () => {
    expect(user.getId()).toBe('user-123');
    expect(user.getUsername()).toBe('testuser');
    expect(user.getEmail()).toBe('test@example.com');
  });

  it('should validate email format', () => {
    expect(() => {
      user.changeEmail('invalid-email');
    }).toThrow(InvalidEmailException);
  });

  it('should allow valid email change', () => {
    user.changeEmail('newemail@example.com');
    expect(user.getEmail()).toBe('newemail@example.com');
  });
});

// 权限服务测试
describe('PermissionService', () => {
  let permissionService: PermissionService;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockPermissionRepository: jest.Mocked<PermissionRepository>;

  beforeEach(() => {
    mockUserRepository = createMockUserRepository();
    mockPermissionRepository = createMockPermissionRepository();
    permissionService = new PermissionService(
      mockUserRepository,
      mockPermissionRepository
    );
  });

  it('should check user permission correctly', async () => {
    const userId = 'user-123';
    const resource = 'user';
    const action = 'read';

    mockPermissionRepository.findUserPermissions.mockResolvedValue([
      { resource: 'user', action: 'read' },
    ]);

    const hasPermission = await permissionService.hasPermission(
      userId,
      resource,
      action
    );
    expect(hasPermission).toBe(true);
  });
});
```

#### 集成测试

```typescript
// API集成测试
describe('User API Integration', () => {
  let app: INestApplication;
  let userService: UserService;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    userService = moduleFixture.get<UserService>(UserService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create user via API', async () => {
    const createUserDto = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    };

    const response = await request(app.getHttpServer())
      .post('/api/users')
      .send(createUserDto)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.username).toBe(createUserDto.username);
  });
});
```

#### 端到端测试

```typescript
// 用户注册流程E2E测试
describe('User Registration E2E', () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = await puppeteer.launch();
    page = await browser.newPage();
  });

  afterAll(async () => {
    await browser.close();
  });

  it('should complete user registration flow', async () => {
    // 访问注册页面
    await page.goto('http://localhost:3000/register');

    // 填写注册信息
    await page.type('#username', 'testuser');
    await page.type('#email', 'test@example.com');
    await page.type('#password', 'password123');
    await page.type('#confirmPassword', 'password123');

    // 提交注册
    await page.click('#registerButton');

    // 验证注册成功
    await page.waitForSelector('.success-message');
    const successMessage = await page.$eval(
      '.success-message',
      (el) => el.textContent
    );
    expect(successMessage).toContain('注册成功');
  });
});
```

## 🔄 持续集成/持续部署与测试自动化

### CI/CD 流水线

#### GitHub Actions 配置

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm install -g pnpm && pnpm install

      - name: Run linting
        run: pnpm lint

      - name: Run unit tests
        run: pnpm test:unit
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test

      - name: Run integration tests
        run: pnpm test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
          REDIS_URL: redis://localhost:6379

      - name: Run E2E tests
        run: pnpm test:e2e
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
          REDIS_URL: redis://localhost:6379

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm install -g pnpm && pnpm install

      - name: Build application
        run: pnpm build

      - name: Build Docker image
        run: docker build -t saas-api:${{ github.sha }} .

      - name: Push to registry
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker tag saas-api:${{ github.sha }} ${{ secrets.DOCKER_REGISTRY }}/saas-api:${{ github.sha }}
          docker push ${{ secrets.DOCKER_REGISTRY }}/saas-api:${{ github.sha }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Deploy to production
        run: |
          # 部署脚本
          echo "Deploying to production..."
```

## 📚 开发指南与最佳实践

### 总结

#### 架构调整成果

根据 `saas-platform-domain-architecture.md` 的架构设计，IAM模块进行了重大调整：

1. **职责重新定位**: IAM模块从混合业务实体管理重新定位为专注于身份认证、授权、角色、权限和审计的核心功能模块
2. **模块边界清晰**: 用户管理、平台管理、租户管理、组织管理、部门管理作为独立模块，各自负责自己的业务逻辑
3. **服务化定位**: IAM模块作为公共服务提供者，为所有管理模块提供统一的认证授权服务
4. **高内聚低耦合**: 每个模块职责单一，模块间依赖关系清晰，便于维护和扩展

#### 新的IAM模块架构

```
IAM模块核心功能：
├── Auth (认证) - 身份认证、多因子认证、单点登录
├── Role (角色) - 角色定义、角色分配、角色继承
├── Permission (权限) - 权限定义、权限分配、权限验证
├── Session (会话) - 会话管理、会话验证、会话安全、会话超时管理、并发会话控制
└── Audit (审计) - 审计日志、合规检查、安全监控
```

#### 技术架构优势

1. **职责清晰**: 每个模块都有明确的业务边界，不越界管理其他模块职责
2. **高内聚低耦合**: 模块内部高内聚，模块间低耦合，便于团队协作
3. **可复用性**: IAM模块作为公共服务，可以被多个业务场景复用
4. **可扩展性**: 每个模块可以独立演进和扩展，不影响其他模块
5. **团队协作友好**: 不同团队可以专注不同模块，提高开发效率

#### 实施建议

1. **立即停止当前开发**: 避免在错误架构上继续投入
2. **重新设计架构**: 基于新的领域划分重新设计
3. **分阶段实施**: 按照开发路线图分阶段实施
4. **持续优化**: 在实施过程中持续优化架构设计

#### 预期效果

1. **架构清晰**: 模块职责明确，边界清晰
2. **维护简单**: 模块间耦合低，维护成本低
3. **扩展容易**: 新功能可以独立开发，不影响现有模块
4. **团队高效**: 不同团队可以并行开发，提高开发效率

---

**文档结束**

本文档详细描述了重新设计后的SAAS平台技术架构，整合了领域架构设计的主要内容，为系统开发提供了完整的技术指导。在新的架构下，各模块职责清晰，边界明确，便于团队协作和系统维护。在实际开发过程中，需要根据具体的技术实现和业务调整对文档进行相应的更新和维护。

### 参考文档

1. **业务需求文档**: SAAS平台业务需求分析文档
2. **数据隔离文档**: 数据隔离与访问控制设计文档（已整合）
3. **数据库设计文档**: 数据库表结构详细设计
4. **API 文档**: REST API 接口详细文档
5. **部署文档**: 系统部署和运维指南
6. **测试文档**: 测试策略和测试用例
7. **领域架构文档**: saas-platform-domain-architecture.md

## 📋 总结

### 数据隔离与访问控制整合完成

本文档已成功整合了`data-isolation-and-access-control.md`的主要内容，为SAAS平台提供了完整的数据隔离与访问控制设计。

#### 整合内容包括

1. **数据隔离策略详解**
   - 6个数据隔离级别：平台、租户、组织、部门、子部门、用户
   - 2个隐私级别：可共享、受保护
   - 详细的业务需求分析和数据分类

2. **实体基类设计**
   - `PlatformAwareEntity`：平台感知实体基类
   - `DataIsolationAwareEntity`：数据隔离感知实体基类
   - 完整的访问控制方法和断言机制

3. **公共数据访问机制**
   - 租户级公共数据访问控制
   - 组织级公共数据访问控制
   - 灵活的共享策略设计

4. **实现示例与最佳实践**
   - 仓储层、应用层、控制器层实现示例
   - 完整的测试策略和测试用例
   - 性能优化和安全考虑

#### 架构优势

- **完整的数据分类支持**：支持6个隔离级别和2个隐私级别
- **类型安全**：完整的TypeScript类型支持和编译时检查
- **可扩展性**：基类设计和策略模式，易于扩展新实体类型
- **向后兼容**：保持现有API兼容性，支持渐进式迁移

#### 应用价值

这种完整的数据隔离与访问控制机制为SAAS平台提供了：

1. **数据安全保障**：多层次的数据隔离确保租户数据安全
2. **灵活共享机制**：支持不同级别的数据共享需求
3. **可扩展架构**：易于扩展新的隔离级别和访问策略
4. **开发效率**：统一的API和模式提高开发效率
5. **合规支持**：满足各种数据保护和隐私法规要求

通过这种完整的数据隔离与访问控制机制，平台能够安全、灵活地处理各种复杂的数据访问场景，为多租户SaaS应用提供了坚实的数据安全基础。

---

**文档结束**

本文档详细描述了SAAS平台的完整技术架构，包括系统架构设计、安全架构与数据隔离设计、部署架构与监控设计、测试策略与架构、架构设计原则与最佳实践、开发指南与最佳实践等各个方面。通过整合数据隔离与访问控制设计，文档更加完整和统一，为系统开发提供了全面的技术指导。

### 参考文档

1. **业务需求文档**: IAM 业务需求分析文档
2. **数据隔离文档**: 数据隔离与访问控制设计文档
3. **数据库设计文档**: 数据库表结构详细设计
4. **API 文档**: REST API 接口详细文档
5. **部署文档**: 系统部署和运维指南
6. **测试文档**: 测试策略和测试用例
7. **领域架构文档**: saas-platform-domain-architecture.md

### 代码规范

#### TypeScript 配置

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "removeComments": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "test"]
}
```

#### ESLint 配置

```json
{
  "extends": [
    "@typescript-eslint/recommended",
    "@typescript-eslint/recommended-requiring-type-checking"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "./tsconfig.json"
  },
  "plugins": ["@typescript-eslint"],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/prefer-const": "error",
    "@typescript-eslint/no-var-requires": "error"
  }
}
```

### API 设计规范

#### RESTful API 设计

```typescript
// 用户命令API（写操作）
@Controller('api/users')
export class UserCommandController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly changeUserEmailUseCase: ChangeUserEmailUseCase,
    private readonly joinTenantUseCase: JoinTenantUseCase,
    private readonly leaveTenantUseCase: LeaveTenantUseCase
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  async createUser(
    @Body() createUserDto: CreateUserDto,
    @Request() req
  ): Promise<{ success: boolean; userId: string }> {
    const request = new CreateUserRequest(
      createUserDto.username,
      createUserDto.email,
      createUserDto.password,
      createUserDto.tenantId,
      req.user.id
    );
    return this.createUserUseCase.execute(request);
  }

  @Put(':id/email')
  @UseGuards(AuthGuard)
  async changeUserEmail(
    @Param('id') id: string,
    @Body() changeEmailDto: ChangeUserEmailDto,
    @Request() req
  ): Promise<{ success: boolean }> {
    const request = new ChangeUserEmailRequest(
      id,
      changeEmailDto.newEmail,
      req.user.id
    );
    return this.changeUserEmailUseCase.execute(request);
  }

  @Post(':id/join-tenant')
  @UseGuards(AuthGuard)
  async joinTenant(
    @Param('id') id: string,
    @Body() joinTenantDto: JoinTenantDto,
    @Request() req
  ): Promise<{ success: boolean }> {
    const request = new JoinTenantRequest(
      id,
      joinTenantDto.tenantId,
      req.user.id
    );
    return this.joinTenantUseCase.execute(request);
  }

  @Post(':id/leave-tenant')
  @UseGuards(AuthGuard)
  async leaveTenant(
    @Param('id') id: string,
    @Request() req
  ): Promise<{ success: boolean }> {
    const request = new LeaveTenantRequest(id, req.user.id);
    return this.leaveTenantUseCase.execute(request);
  }
}

// 用户查询API（读操作）
@Controller('api/users')
export class UserQueryController {
  constructor(
    private readonly getUserUseCase: GetUserUseCase,
    private readonly getUsersUseCase: GetUsersUseCase,
    private readonly getUserPermissionsUseCase: GetUserPermissionsUseCase,
    private readonly getUserEventsUseCase: GetUserEventsUseCase
  ) {}

  @Get(':id')
  @UseGuards(AuthGuard)
  async getUser(
    @Param('id') id: string,
    @Request() req
  ): Promise<UserResponseDto> {
    const request = new GetUserRequest(id, req.user.id);
    const response = await this.getUserUseCase.execute(request);
    return response.user;
  }

  @Get()
  @UseGuards(AuthGuard)
  async getUsers(
    @Query() queryDto: GetUsersQueryDto,
    @Request() req
  ): Promise<PaginatedResponse<UserResponseDto>> {
    const request = new GetUsersRequest(
      queryDto.tenantId,
      queryDto.page,
      queryDto.size,
      req.user.id
    );
    const response = await this.getUsersUseCase.execute(request);
    return response.users;
  }

  @Get(':id/permissions')
  @UseGuards(AuthGuard)
  async getUserPermissions(
    @Param('id') id: string,
    @Request() req
  ): Promise<PermissionResponseDto[]> {
    const request = new GetUserPermissionsRequest(id, req.user.id);
    const response = await this.getUserPermissionsUseCase.execute(request);
    return response.permissions;
  }

  @Get(':id/events')
  @UseGuards(AuthGuard)
  async getUserEvents(
    @Param('id') id: string,
    @Query() queryDto: GetUserEventsQueryDto,
    @Request() req
  ): Promise<PaginatedResponse<DomainEventDto>> {
    const request = new GetUserEventsRequest(
      id,
      queryDto.from,
      queryDto.to,
      queryDto.page,
      queryDto.size,
      req.user.id
    );
    const response = await this.getUserEventsUseCase.execute(request);
    return response.events;
  }
}

// GraphQL Resolvers
@Resolver('User')
export class UserResolver {
  constructor(
    private readonly getUserUseCase: GetUserUseCase,
    private readonly getUsersUseCase: GetUsersUseCase,
    private readonly getUserPermissionsUseCase: GetUserPermissionsUseCase,
    private readonly getUserOrganizationsUseCase: GetUserOrganizationsUseCase,
    private readonly getUserAuditLogsUseCase: GetUserAuditLogsUseCase,
    private readonly context: GraphQLContext
  ) {}

  @Query()
  async user(@Args('id') id: string): Promise<UserResponseDto> {
    const request = new GetUserRequest(id, this.context.currentUserId);
    const response = await this.getUserUseCase.execute(request);
    return response.user;
  }

  @Query()
  async users(
    @Args('tenantId') tenantId: string,
    @Args('page') page: number = 1,
    @Args('size') size: number = 20
  ): Promise<PaginatedResponse<UserResponseDto>> {
    const request = new GetUsersRequest(
      tenantId,
      page,
      size,
      this.context.currentUserId
    );
    const response = await this.getUsersUseCase.execute(request);
    return response.users;
  }

  @ResolveField()
  async permissions(@Parent() user: UserResponseDto): Promise<PermissionResponseDto[]> {
    const request = new GetUserPermissionsRequest(user.id, this.context.currentUserId);
    const response = await this.getUserPermissionsUseCase.execute(request);
    return response.permissions;
  }

  @ResolveField()
  async organizations(@Parent() user: UserResponseDto): Promise<OrganizationResponseDto[]> {
    const request = new GetUserOrganizationsRequest(user.id, this.context.currentUserId);
    const response = await this.getUserOrganizationsUseCase.execute(request);
    return response.organizations;
  }

  @ResolveField()
  async auditLogs(
    @Parent() user: UserResponseDto,
    @Args('limit') limit: number = 10
  ): Promise<AuditLogResponseDto[]> {
    const request = new GetUserAuditLogsRequest(user.id, limit, this.context.currentUserId);
    const response = await this.getUserAuditLogsUseCase.execute(request);
    return response.auditLogs;
  }
}

// GraphQL Schema
export const userSchema = gql`
  type User {
    id: ID!
    username: String!
    email: String!
    status: String!
    tenantId: ID
    createdAt: DateTime!
    updatedAt: DateTime!
    permissions: [Permission!]!
    organizations: [Organization!]!
    auditLogs(limit: Int = 10): [AuditLog!]!
  }

  type Permission {
    id: ID!
    name: String!
    code: String!
    resource: String!
    action: String!
  }

  type Organization {
    id: ID!
    name: String!
    code: String!
    departments: [Department!]!
  }

  type Department {
    id: ID!
    name: String!
    code: String!
    level: Int!
  }

  type AuditLog {
    id: ID!
    action: String!
    resourceType: String!
    resourceId: String!
    timestamp: DateTime!
  }

  type PaginatedUsers {
    data: [User!]!
    total: Int!
    page: Int!
    size: Int!
    totalPages: Int!
  }

  type Query {
    user(id: ID!): User
    users(tenantId: ID!, page: Int = 1, size: Int = 20): PaginatedUsers
  }

  scalar DateTime
`;

## 🏗️ 架构设计原则与最佳实践

### 架构优势总结

#### 7.1 架构优势
1. **职责清晰**: 每个模块都有明确的业务边界
2. **高内聚低耦合**: 模块内部高内聚，模块间低耦合
3. **可复用性**: 基础模块可以被多个业务场景复用
4. **可扩展性**: 每个模块可以独立演进和扩展
5. **团队协作友好**: 不同团队可以专注不同模块

#### 7.2 实施建议
1. **立即停止当前开发**: 避免在错误架构上继续投入
2. **重新设计架构**: 基于新的领域划分重新设计
3. **分阶段实施**: 按照开发路线图分阶段实施
4. **持续优化**: 在实施过程中持续优化架构设计

#### 7.3 预期效果
1. **架构清晰**: 模块职责明确，边界清晰
2. **维护简单**: 模块间耦合低，维护成本低
3. **扩展容易**: 新功能可以独立开发，不影响现有模块
4. **团队高效**: 不同团队可以并行开发，提高开发效率

### Clean Architecture 分层原则

```
依赖方向 (Dependency Direction)
┌─────────────────────────────────────┐
│     Presentation Layer              │
│  ┌─────────────┐  ┌─────────────┐  │
│  │ Controllers │  │  Resolvers  │  │
│  └─────────────┘  └─────────────┘  │
│           ↓                         │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│      Application Layer              │
│  ┌─────────────┐  ┌─────────────┐  │
│  │  Use Cases  │  │  Handlers   │  │
│  └─────────────┘  └─────────────┘  │
│  ┌─────────────┐  ┌─────────────┐  │
│  │Data Access  │  │ Validators  │  │
│  │  Control    │  │             │  │
│  └─────────────┘  └─────────────┘  │
│           ↓                         │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│        Domain Layer                 │
│  ┌─────────────┐  ┌─────────────┐  │
│  │ Aggregates  │  │  Entities   │  │
│  └─────────────┘  └─────────────┘  │
│  ┌─────────────┐  ┌─────────────┐  │
│  │Data Isolation│ │ Value Objs  │  │
│  │   Aware     │  │             │  │
│  └─────────────┘  └─────────────┘  │
│           ↓                         │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│     Infrastructure Layer            │
│  ┌─────────────┐  ┌─────────────┐  │
│  │ Repositories│  │   Services  │  │
│  └─────────────┘  └─────────────┘  │
└─────────────────────────────────────┘
```

**关键原则**：
- 外层只能依赖内层
- 内层不能依赖外层
- Use Case 是业务逻辑的统一入口
- 聚合根管理业务规则和一致性
- 实体和值对象分离，职责清晰

### 领域模型分层设计

```
领域模型分层
┌─────────────────────────────────────┐
│           Aggregate (聚合根)         │  ← 业务规则、一致性边界
├─────────────────────────────────────┤
│           Entity (实体)             │  ← 业务实体、标识
│  ┌─────────────────────────────────┐ │
│  │   PlatformAwareEntity          │ │  ← 平台感知实体基类
│  │   DataIsolationAwareEntity     │ │  ← 数据隔离感知实体基类
│  └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│        Value Object (值对象)        │  ← 不可变对象、业务概念
└─────────────────────────────────────┘
```

### 业务逻辑流程

```
用户创建流程：
1. Controller → Use Case → Command → Handler → Aggregate → Entity → Event Store
2. Use Case 负责业务逻辑编排和验证
3. Aggregate 负责业务规则和一致性
4. Entity 负责业务实体状态管理
5. Value Object 负责业务概念封装
6. DataIsolationAwareEntity 负责数据隔离和访问控制

数据访问控制流程：
1. 权限检查 → 数据隔离检查 → 隐私级别检查 → 访问授权
2. 基于隔离级别和隐私级别的细粒度访问控制
3. 支持跨层级的数据访问控制
4. 用户级数据支持跨层级存在
```

##### 4.14.5 API接口设计

```typescript
// 数据访问控制API控制器
@Controller('api/data-access')
@UseGuards(AuthGuard)
export class DataAccessController {
  constructor(
    private readonly dataAccessControlService: DataAccessControlService,
    private readonly personalDocumentService: PersonalDocumentService,
    private readonly departmentProjectService: DepartmentProjectService,
    private readonly organizationPolicyService: OrganizationPolicyService
  ) {}

  /**
   * 获取用户可以访问的个人数据
   */
  @Get('personal-documents')
  async getPersonalDocuments(
    @Query() queryDto: GetPersonalDocumentsQueryDto,
    @Request() req
  ): Promise<PaginatedResponse<PersonalDocumentDto>> {
    const { ownerId, page, size } = queryDto;
    return this.dataAccessControlService.getAccessiblePersonalData(
      req.user.id,
      ownerId,
      page,
      size
    );
  }

  /**
   * 获取用户可以访问的部门数据
   */
  @Get('department-projects')
  async getDepartmentProjects(
    @Query() queryDto: GetDepartmentProjectsQueryDto,
    @Request() req
  ): Promise<PaginatedResponse<DepartmentProjectDto>> {
    const { departmentId, page, size } = queryDto;
    return this.dataAccessControlService.getAccessibleDepartmentData(
      req.user.id,
      departmentId,
      page,
      size
    );
  }

  /**
   * 获取用户可以访问的组织数据
   */
  @Get('organization-policies')
  async getOrganizationPolicies(
    @Query() queryDto: GetOrganizationPoliciesQueryDto,
    @Request() req
  ): Promise<PaginatedResponse<OrganizationPolicyDto>> {
    const { organizationId, page, size } = queryDto;
    return this.dataAccessControlService.getAccessibleOrganizationData(
      req.user.id,
      organizationId,
      page,
      size
    );
  }

  /**
   * 共享数据给指定用户
   */
  @Post('share/user')
  async shareWithUser(
    @Body() shareDto: ShareWithUserDto,
    @Request() req
  ): Promise<{ success: boolean }> {
    const { entityId, entityType, targetUserId } = shareDto;
    const entity = await this.getEntityById(entityId, entityType);
    
    await this.dataAccessControlService.shareDataWithUser(
      req.user.id,
      entity,
      targetUserId
    );

    return { success: true };
  }

  /**
   * 共享数据给指定部门
   */
  @Post('share/department')
  async shareWithDepartment(
    @Body() shareDto: ShareWithDepartmentDto,
    @Request() req
  ): Promise<{ success: boolean }> {
    const { entityId, entityType, departmentId } = shareDto;
    const entity = await this.getEntityById(entityId, entityType);
    
    await this.dataAccessControlService.shareDataWithDepartment(
      req.user.id,
      entity,
      departmentId
    );

    return { success: true };
  }

  /**
   * 撤销数据访问权限
   */
  @Delete('revoke')
  async revokeAccess(
    @Body() revokeDto: RevokeAccessDto,
    @Request() req
  ): Promise<{ success: boolean }> {
    const { entityId, entityType, targetType, targetId } = revokeDto;
    const entity = await this.getEntityById(entityId, entityType);
    
    await this.dataAccessControlService.revokeDataAccess(
      req.user.id,
      entity,
      targetType,
      targetId
    );

    return { success: true };
  }

  /**
   * 获取数据访问权限信息
   */
  @Get(':entityId/permissions')
  async getDataAccessPermissions(
    @Param('entityId') entityId: string,
    @Query('entityType') entityType: string
  ): Promise<DataAccessPermissionsDto> {
    return this.dataAccessControlService.getDataAccessPermissions(entityId);
  }

  private async getEntityById(
    entityId: string,
    entityType: string
  ): Promise<DataAccessControlledEntity> {
    switch (entityType) {
      case 'PersonalDocument':
        return this.personalDocumentService.findById(entityId);
      case 'DepartmentProject':
        return this.departmentProjectService.findById(entityId);
      case 'OrganizationPolicy':
        return this.organizationPolicyService.findById(entityId);
      default:
        throw new BadRequestException(`Unsupported entity type: ${entityType}`);
    }
  }
}

// 个人文档API控制器
@Controller('api/personal-documents')
@UseGuards(AuthGuard)
export class PersonalDocumentController {
  constructor(
    private readonly personalDocumentService: PersonalDocumentService,
    private readonly dataAccessControlService: DataAccessControlService
  ) {}

  /**
   * 创建个人文档
   */
  @Post()
  async createPersonalDocument(
    @Body() createDto: CreatePersonalDocumentDto,
    @Request() req
  ): Promise<PersonalDocumentDto> {
    const document = await this.personalDocumentService.create(
      req.user.tenantId,
      req.user.id,
      createDto.title,
      createDto.content,
      req.user.organizationId,
      req.user.departmentIds,
      createDto.tags
    );

    return this.personalDocumentService.toDto(document);
  }

  /**
   * 更新个人文档
   */
  @Put(':id')
  async updatePersonalDocument(
    @Param('id') id: string,
    @Body() updateDto: UpdatePersonalDocumentDto,
    @Request() req
  ): Promise<PersonalDocumentDto> {
    // 检查访问权限
    const document = await this.personalDocumentService.findById(id);
    if (!(await this.dataAccessControlService.checkDataAccess(req.user.id, document))) {
      throw new AccessDeniedException('没有权限访问此文档');
    }

    const updatedDocument = await this.personalDocumentService.update(
      id,
      updateDto.title,
      updateDto.content,
      updateDto.tags
    );

    return this.personalDocumentService.toDto(updatedDocument);
  }

  /**
   * 删除个人文档
   */
  @Delete(':id')
  async deletePersonalDocument(
    @Param('id') id: string,
    @Request() req
  ): Promise<{ success: boolean }> {
    // 检查访问权限
    const document = await this.personalDocumentService.findById(id);
    if (!(await this.dataAccessControlService.checkDataAccess(req.user.id, document))) {
      throw new AccessDeniedException('没有权限访问此文档');
    }

    await this.personalDocumentService.delete(id);
    return { success: true };
  }
}

// 部门项目API控制器
@Controller('api/department-projects')
@UseGuards(AuthGuard)
export class DepartmentProjectController {
  constructor(
    private readonly departmentProjectService: DepartmentProjectService,
    private readonly dataAccessControlService: DataAccessControlService
  ) {}

  /**
   * 创建部门项目
   */
  @Post()
  async createDepartmentProject(
    @Body() createDto: CreateDepartmentProjectDto,
    @Request() req
  ): Promise<DepartmentProjectDto> {
    const project = await this.departmentProjectService.create(
      req.user.tenantId,
      req.user.organizationId,
      req.user.departmentIds,
      req.user.id,
      createDto.name,
      createDto.description
    );

    return this.departmentProjectService.toDto(project);
  }

  /**
   * 更新部门项目
   */
  @Put(':id')
  async updateDepartmentProject(
    @Param('id') id: string,
    @Body() updateDto: UpdateDepartmentProjectDto,
    @Request() req
  ): Promise<DepartmentProjectDto> {
    // 检查访问权限
    const project = await this.departmentProjectService.findById(id);
    if (!(await this.dataAccessControlService.checkDataAccess(req.user.id, project))) {
      throw new AccessDeniedException('没有权限访问此项目');
    }

    const updatedProject = await this.departmentProjectService.update(
      id,
      updateDto.name,
      updateDto.description,
      updateDto.status,
      updateDto.endDate
    );

    return this.departmentProjectService.toDto(updatedProject);
  }

  /**
   * 添加项目团队成员
   */
  @Post(':id/team-members')
  async addTeamMember(
    @Param('id') id: string,
    @Body() addMemberDto: AddTeamMemberDto,
    @Request() req
  ): Promise<{ success: boolean }> {
    // 检查访问权限
    const project = await this.departmentProjectService.findById(id);
    if (!(await this.dataAccessControlService.checkDataAccess(req.user.id, project))) {
      throw new AccessDeniedException('没有权限访问此项目');
    }

    await this.departmentProjectService.addTeamMember(id, addMemberDto.userId);
    return { success: true };
  }

  /**
   * 扩展项目到其他部门
   */
  @Post(':id/extend-departments')
  async extendToDepartments(
    @Param('id') id: string,
    @Body() extendDto: ExtendToDepartmentsDto,
    @Request() req
  ): Promise<{ success: boolean }> {
    // 检查访问权限
    const project = await this.departmentProjectService.findById(id);
    if (!(await this.dataAccessControlService.checkDataAccess(req.user.id, project))) {
      throw new AccessDeniedException('没有权限访问此项目');
    }

    await this.departmentProjectService.extendToDepartments(id, extendDto.departmentIds);
    return { success: true };
  }
}

// 组织政策API控制器
@Controller('api/organization-policies')
@UseGuards(AuthGuard)
export class OrganizationPolicyController {
  constructor(
    private readonly organizationPolicyService: OrganizationPolicyService,
    private readonly dataAccessControlService: DataAccessControlService
  ) {}

  /**
   * 创建组织政策
   */
  @Post()
  async createOrganizationPolicy(
    @Body() createDto: CreateOrganizationPolicyDto,
    @Request() req
  ): Promise<OrganizationPolicyDto> {
    const policy = await this.organizationPolicyService.create(
      req.user.tenantId,
      req.user.organizationId,
      req.user.id,
      createDto.name,
      createDto.content,
      createDto.category
    );

    return this.organizationPolicyService.toDto(policy);
  }

  /**
   * 提交政策审批
   */
  @Post(':id/submit-approval')
  async submitForApproval(
    @Param('id') id: string,
    @Request() req
  ): Promise<{ success: boolean }> {
    // 检查访问权限
    const policy = await this.organizationPolicyService.findById(id);
    if (!(await this.dataAccessControlService.checkDataAccess(req.user.id, policy))) {
      throw new AccessDeniedException('没有权限访问此政策');
    }

    await this.organizationPolicyService.submitForApproval(id);
    return { success: true };
  }

  /**
   * 审批政策
   */
  @Post(':id/approve')
  async approvePolicy(
    @Param('id') id: string,
    @Request() req
  ): Promise<{ success: boolean }> {
    // 检查访问权限
    const policy = await this.organizationPolicyService.findById(id);
    if (!(await this.dataAccessControlService.checkDataAccess(req.user.id, policy))) {
      throw new AccessDeniedException('没有权限访问此政策');
    }

    await this.organizationPolicyService.approve(id, req.user.id);
    return { success: true };
  }

  /**
   * 发布政策到租户级
   */
  @Post(':id/publish-tenant')
  async publishToTenant(
    @Param('id') id: string,
    @Request() req
  ): Promise<{ success: boolean }> {
    // 检查访问权限
    const policy = await this.organizationPolicyService.findById(id);
    if (!(await this.dataAccessControlService.checkDataAccess(req.user.id, policy))) {
      throw new AccessDeniedException('没有权限访问此政策');
    }

    await this.organizationPolicyService.publishToTenant(id);
    return { success: true };
  }
}
```

##### 4.14.6 DTO定义

##### 4.14.7 测试策略

```typescript
// 数据访问控制服务测试
describe('DataAccessControlService', () => {
  let service: DataAccessControlService;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockCacheService: jest.Mocked<CacheService>;

  beforeEach(() => {
    mockUserRepository = createMockUserRepository();
    mockCacheService = createMockCacheService();
    service = new DataAccessControlService(
      mockUserRepository,
      mockOrganizationRepository,
      mockDepartmentRepository,
      mockCacheService
    );
  });

  describe('checkDataAccess', () => {
    it('should allow access for data owner', async () => {
      const userId = 'user-123';
      const ownerId = 'user-123';
      const targetEntity = createMockPersonalDocument(ownerId);

      const result = await service.checkDataAccess(userId, targetEntity);
      expect(result).toBe(true);
    });

    it('should allow access for shared user', async () => {
      const userId = 'user-456';
      const ownerId = 'user-123';
      const targetEntity = createMockPersonalDocument(ownerId);
      targetEntity.shareWithUser(new Uuid(userId));

      const result = await service.checkDataAccess(userId, targetEntity);
      expect(result).toBe(true);
    });

    it('should allow access for department member', async () => {
      const userId = 'user-456';
      const ownerId = 'user-123';
      const departmentId = 'dept-789';
      const targetEntity = createMockDepartmentProject(ownerId, departmentId);
      const user = createMockUser(userId, departmentId);

      mockUserRepository.findById.mockResolvedValue(user);

      const result = await service.checkDataAccess(userId, targetEntity);
      expect(result).toBe(true);
    });

    it('should deny access for unauthorized user', async () => {
      const userId = 'user-456';
      const ownerId = 'user-123';
      const targetEntity = createMockPersonalDocument(ownerId);

      const result = await service.checkDataAccess(userId, targetEntity);
      expect(result).toBe(false);
    });
  });

  describe('getAccessiblePersonalData', () => {
    it('should return user own documents', async () => {
      const userId = 'user-123';
      const user = createMockUser(userId);
      mockUserRepository.findById.mockResolvedValue(user);

      const result = await service.getAccessiblePersonalData(userId);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].ownerId).toBe(userId);
    });

    it('should return shared documents', async () => {
      const userId = 'user-456';
      const user = createMockUser(userId);
      mockUserRepository.findById.mockResolvedValue(user);

      const result = await service.getAccessiblePersonalData(userId);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].sharedWithUsers).toContain(userId);
    });
  });

  describe('shareDataWithUser', () => {
    it('should share data with user successfully', async () => {
      const userId = 'user-123';
      const targetUserId = 'user-456';
      const targetEntity = createMockPersonalDocument(userId);

      await service.shareDataWithUser(userId, targetEntity, targetUserId);

      expect(targetEntity.sharedWithUsers).toContainEqual(new Uuid(targetUserId));
    });

    it('should throw error when user has no permission to share', async () => {
      const userId = 'user-123';
      const targetUserId = 'user-456';
      const targetEntity = createMockPersonalDocument('user-789'); // Different owner

      await expect(
        service.shareDataWithUser(userId, targetEntity, targetUserId)
      ).rejects.toThrow(AccessDeniedException);
    });
  });
});

// 个人文档实体测试
describe('PersonalDocument', () => {
  let document: PersonalDocument;
  const ownerId = new Uuid('user-123');
  const tenantId = new Uuid('tenant-456');

  beforeEach(() => {
    document = new PersonalDocument(
      tenantId,
      ownerId,
      'Test Document',
      'Test Content'
    );
  });

  it('should create document with private access scope', () => {
    expect(document.dataAccessScope).toBe(DataAccessScope.PRIVATE);
    expect(document.dataOwnershipType).toBe(DataOwnershipType.PERSONAL);
  });

  it('should allow owner access', () => {
    const owner = createMockUser(ownerId.toString());
    expect(document.canAccess(owner)).toBe(true);
  });

  it('should deny non-owner access by default', () => {
    const nonOwner = createMockUser('user-789');
    expect(document.canAccess(nonOwner)).toBe(false);
  });

  it('should allow shared user access', () => {
    const sharedUserId = new Uuid('user-789');
    document.shareWithUser(sharedUserId);
    
    const sharedUser = createMockUser(sharedUserId.toString());
    expect(document.canAccess(sharedUser)).toBe(true);
  });

  it('should allow department access after sharing', () => {
    const departmentId = new Uuid('dept-789');
    document.shareWithDepartment(departmentId);
    
    const departmentMember = createMockUser('user-789', undefined, [departmentId]);
    expect(document.canAccess(departmentMember)).toBe(true);
  });

  it('should allow organization access after sharing', () => {
    const organizationId = new Uuid('org-789');
    document.shareWithOrganization(organizationId);
    
    const orgMember = createMockUser('user-789', organizationId);
    expect(document.canAccess(orgMember)).toBe(true);
  });

  it('should change access scope when publishing to tenant', () => {
    document.publishToTenant();
    
    expect(document.dataAccessScope).toBe(DataAccessScope.TENANT);
    expect(document.dataOwnershipType).toBe(DataOwnershipType.TENANT);
  });
});

// 部门项目实体测试
describe('DepartmentProject', () => {
  let project: DepartmentProject;
  const ownerId = new Uuid('user-123');
  const tenantId = new Uuid('tenant-456');
  const organizationId = new Uuid('org-789');
  const departmentIds = [new Uuid('dept-123')];

  beforeEach(() => {
    project = new DepartmentProject(
      tenantId,
      organizationId,
      departmentIds,
      ownerId,
      'Test Project',
      'Test Description'
    );
  });

  it('should create project with department access scope', () => {
    expect(project.dataAccessScope).toBe(DataAccessScope.DEPARTMENT);
    expect(project.dataOwnershipType).toBe(DataOwnershipType.DEPARTMENT);
  });

  it('should allow department member access', () => {
    const departmentMember = createMockUser('user-456', organizationId, departmentIds);
    expect(project.canAccess(departmentMember)).toBe(true);
  });

  it('should deny non-department member access', () => {
    const nonMember = createMockUser('user-789', organizationId, [new Uuid('dept-456')]);
    expect(project.canAccess(nonMember)).toBe(false);
  });

  it('should add team member successfully', () => {
    const newMemberId = new Uuid('user-789');
    project.addTeamMember(newMemberId);
    
    expect(project.teamMembers).toContainEqual(newMemberId);
  });

  it('should extend to additional departments', () => {
    const newDepartmentIds = [new Uuid('dept-456'), new Uuid('dept-789')];
    project.extendToDepartments(newDepartmentIds);
    
    expect(project.departmentIds).toContainEqual(newDepartmentIds[0]);
    expect(project.departmentIds).toContainEqual(newDepartmentIds[1]);
  });

  it('should change to organization scope when extending', () => {
    project.extendToOrganization();
    
    expect(project.dataAccessScope).toBe(DataAccessScope.ORGANIZATION);
    expect(project.dataOwnershipType).toBe(DataOwnershipType.ORGANIZATION);
  });
});

// 组织政策实体测试
describe('OrganizationPolicy', () => {
  let policy: OrganizationPolicy;
  const ownerId = new Uuid('user-123');
  const tenantId = new Uuid('tenant-456');
  const organizationId = new Uuid('org-789');

  beforeEach(() => {
    policy = new OrganizationPolicy(
      tenantId,
      organizationId,
      ownerId,
      'Test Policy',
      'Test Content',
      PolicyCategory.HR
    );
  });

  it('should create policy with organization access scope', () => {
    expect(policy.dataAccessScope).toBe(DataAccessScope.ORGANIZATION);
    expect(policy.dataOwnershipType).toBe(DataOwnershipType.ORGANIZATION);
  });

  it('should allow organization member access', () => {
    const orgMember = createMockUser('user-456', organizationId);
    expect(policy.canAccess(orgMember)).toBe(true);
  });

  it('should deny non-organization member access', () => {
    const nonMember = createMockUser('user-789', new Uuid('org-456'));
    expect(policy.canAccess(nonMember)).toBe(false);
  });

  it('should change status when submitting for approval', () => {
    policy.submitForApproval();
    
    expect(policy.approvalStatus).toBe(ApprovalStatus.PENDING);
  });

  it('should change status when approved', () => {
    const approverId = new Uuid('user-456');
    policy.approve(approverId);
    
    expect(policy.approvalStatus).toBe(ApprovalStatus.APPROVED);
    expect(policy.approvedBy).toEqual(approverId);
    expect(policy.approvedAt).toBeDefined();
  });

  it('should change status when rejected', () => {
    policy.reject('Invalid content');
    
    expect(policy.approvalStatus).toBe(ApprovalStatus.REJECTED);
  });

  it('should change to tenant scope when publishing', () => {
    policy.publishToTenant();
    
    expect(policy.dataAccessScope).toBe(DataAccessScope.TENANT);
    expect(policy.dataOwnershipType).toBe(DataOwnershipType.TENANT);
  });
});

// 辅助函数
function createMockUser(
  id: string,
  organizationId?: Uuid,
  departmentIds: Uuid[] = []
): DataIsolationAwareEntity {
  return {
    id: new Uuid(id),
    tenantId: new Uuid('tenant-123'),
    organizationId,
    departmentIds,
    canAccess: jest.fn().mockReturnValue(true),
  } as any;
}

function createMockPersonalDocument(ownerId: string): PersonalDocument {
  return new PersonalDocument(
    new Uuid('tenant-123'),
    new Uuid(ownerId),
    'Test Document',
    'Test Content'
  );
}

function createMockDepartmentProject(
  ownerId: string,
  departmentId: string
): DepartmentProject {
  return new DepartmentProject(
    new Uuid('tenant-123'),
    new Uuid('org-123'),
    [new Uuid(departmentId)],
    new Uuid(ownerId),
    'Test Project',
    'Test Description'
  );
}

function createMockUserRepository(): jest.Mocked<UserRepository> {
  return {
    findById: jest.fn(),
  } as any;
}

function createMockCacheService(): jest.Mocked<CacheService> {
  return {
    get: jest.fn(),
    set: jest.fn(),
  } as any;
}
```

##### 4.14.8 最佳实践总结

#### 数据访问控制设计原则

1. **最小权限原则**: 用户默认只能访问自己创建的数据
2. **显式授权原则**: 数据共享需要明确的授权操作
3. **权限继承原则**: 高级别权限包含低级别权限
4. **审计追踪原则**: 所有权限变更都要记录审计日志

#### 实现要点

1. **实体设计**: 所有业务实体都继承自 `DataAccessControlledEntity`
2. **权限检查**: 在API层统一进行权限检查
3. **缓存策略**: 用户权限信息缓存5分钟，提高性能
4. **事务处理**: 权限变更和数据操作在同一事务中处理

#### 扩展性考虑

1. **新实体类型**: 只需继承 `DataAccessControlledEntity` 即可
2. **新权限模型**: 可以在基类中添加新的权限检查方法
3. **新共享策略**: 支持自定义的共享规则和条件

#### 性能优化

1. **索引设计**: 为权限相关字段创建复合索引
2. **查询优化**: 使用条件查询减少数据传输
3. **缓存策略**: 合理使用Redis缓存减少数据库查询

#### 安全考虑

1. **权限验证**: 每次数据访问都要验证权限
2. **审计日志**: 记录所有权限变更和访问操作
3. **数据隔离**: 确保不同租户间数据完全隔离

```typescript
// 查询DTO
export class GetPersonalDocumentsQueryDto {
  @IsOptional()
  @IsUUID()
  ownerId?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  size?: number = 20;
}

export class GetDepartmentProjectsQueryDto {
  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  size?: number = 20;
}

export class GetOrganizationPoliciesQueryDto {
  @IsOptional()
  @IsUUID()
  organizationId?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  size?: number = 20;
}

// 共享DTO
export class ShareWithUserDto {
  @IsUUID()
  entityId: string;

  @IsString()
  entityType: string;

  @IsUUID()
  targetUserId: string;
}

export class ShareWithDepartmentDto {
  @IsUUID()
  entityId: string;

  @IsString()
  entityType: string;

  @IsUUID()
  departmentId: string;
}

export class RevokeAccessDto {
  @IsUUID()
  entityId: string;

  @IsString()
  entityType: string;

  @IsIn(['USER', 'DEPARTMENT', 'ORGANIZATION'])
  targetType: string;

  @IsUUID()
  targetId: string;
}

// 创建DTO
export class CreatePersonalDocumentDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class UpdatePersonalDocumentDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  content?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class CreateDepartmentProjectDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}

export class UpdateDepartmentProjectDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @IsOptional()
  @IsIn(['planning', 'in_progress', 'completed', 'on_hold', 'cancelled'])
  status?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class AddTeamMemberDto {
  @IsUUID()
  userId: string;
}

export class ExtendToDepartmentsDto {
  @IsArray()
  @IsUUID('4', { each: true })
  departmentIds: string[];
}

export class CreateOrganizationPolicyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsIn(['hr', 'finance', 'it', 'security', 'compliance', 'operations'])
  category: string;
}

// 响应DTO
export class PersonalDocumentDto {
  id: string;
  title: string;
  content: string;
  tags: string[];
  ownerId: string;
  organizationId?: string;
  departmentIds: string[];
  dataOwnershipType: string;
  dataAccessScope: string;
  createdAt: Date;
  updatedAt: Date;
}

export class DepartmentProjectDto {
  id: string;
  name: string;
  description: string;
  status: string;
  startDate: Date;
  endDate?: Date;
  teamMembers: string[];
  ownerId: string;
  organizationId: string;
  departmentIds: string[];
  dataOwnershipType: string;
  dataAccessScope: string;
  createdAt: Date;
  updatedAt: Date;
}

export class OrganizationPolicyDto {
  id: string;
  name: string;
  content: string;
  category: string;
  version: string;
  effectiveDate: Date;
  expiryDate?: Date;
  approvalStatus: string;
  approvedBy?: string;
  approvedAt?: Date;
  ownerId: string;
  organizationId: string;
  dataOwnershipType: string;
  dataAccessScope: string;
  createdAt: Date;
  updatedAt: Date;
}

export class DataAccessPermissionsDto {
  ownerId: string;
  dataOwnershipType: string;
  dataAccessScope: string;
  sharedWithUsers: string[];
  sharedWithDepartments: string[];
  sharedWithOrganizations: string[];
}
```

## 🎯 API 设计策略与GraphQL集成

### RESTful API vs GraphQL 分工

#### RESTful API 职责（命令端）
- **用户管理**: `POST /api/users` - 创建用户
- **认证操作**: `POST /api/auth/login` - 用户登录
- **权限管理**: `POST /api/permissions/grant` - 授予权限
- **组织管理**: `POST /api/organizations` - 创建组织

#### GraphQL 职责（查询端）
- **复杂查询**: 用户及其关联数据（权限、组织、审计日志）
- **灵活查询**: 根据前端需求动态获取数据
- **批量查询**: 减少网络请求，提升前端性能
- **实时数据**: 通过 WebSocket 订阅数据变更

### 使用场景对比

| 场景 | RESTful API | GraphQL |
|------|-------------|---------|
| **用户注册** | ✅ 适合 | ❌ 不适合 |
| **用户登录** | ✅ 适合 | ❌ 不适合 |
| **获取用户详情** | ⚠️ 需要多次请求 | ✅ 一次查询获取所有数据 |
| **权限检查** | ⚠️ 需要额外请求 | ✅ 包含在用户查询中 |
| **组织架构查询** | ⚠️ 需要多个端点 | ✅ 嵌套查询 |
| **审计日志查询** | ⚠️ 需要分页处理 | ✅ 支持复杂过滤 |

### 性能优化策略

```typescript
// GraphQL 查询优化
@Injectable()
export class GraphQLDataLoader {
  constructor(private readonly queryBus: QueryBus) {}

  // 批量加载用户权限
  async loadUserPermissions(userIds: string[]): Promise<Map<string, Permission[]>> {
    const query = new BatchGetUserPermissionsQuery(userIds);
    const permissions = await this.queryBus.execute(query);

    const result = new Map();
    permissions.forEach(permission => {
      const userPermissions = result.get(permission.userId) || [];
      userPermissions.push(permission);
      result.set(permission.userId, userPermissions);
    });

    return result;
  }

  // 批量加载组织信息
  async loadOrganizations(orgIds: string[]): Promise<Map<string, Organization>> {
    const query = new BatchGetOrganizationsQuery(orgIds);
    const organizations = await this.queryBus.execute(query);

    return new Map(organizations.map(org => [org.id, org]));
  }
}
````

// 认证 API
@Controller('api/auth')
export class AuthController {
constructor(private readonly authService: AuthService) {}

@Post('login')
async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
return this.authService.login(loginDto);
}

@Post('logout')
@UseGuards(AuthGuard)
async logout(@Request() req): Promise<void> {
return this.authService.logout(req.user.id, req.sessionId);
}

@Post('refresh')
async refreshToken(
@Body() refreshDto: RefreshTokenDto
): Promise<LoginResponseDto> {
return this.authService.refreshToken(refreshDto.refreshToken);
}

@Post('mfa/setup')
@UseGuards(AuthGuard)
async setupMFA(
@Body() mfaSetupDto: MFASetupDto
): Promise<MFASetupResponseDto> {
return this.authService.setupMFA(req.user.id, mfaSetupDto);
}

@Post('mfa/verify')
async verifyMFA(
@Body() mfaVerifyDto: MFAVerifyDto
): Promise<LoginResponseDto> {
return this.authService.verifyMFA(mfaVerifyDto);
}

@Post('password/reset/request')
async requestPasswordReset(
@Body() resetRequestDto: PasswordResetRequestDto
): Promise<void> {
return this.authService.requestPasswordReset(resetRequestDto.email);
}

@Post('password/reset/confirm')
async confirmPasswordReset(
@Body() resetConfirmDto: PasswordResetConfirmDto
): Promise<void> {
return this.authService.confirmPasswordReset(resetConfirmDto);
}

@Post('email/verify/request')
@UseGuards(AuthGuard)
async requestEmailVerification(@Request() req): Promise<void> {
return this.authService.requestEmailVerification(req.user.id);
}

@Post('email/verify/confirm')
async confirmEmailVerification(
@Body() emailVerifyDto: EmailVerificationDto
): Promise<void> {
return this.authService.confirmEmailVerification(emailVerifyDto);
}
}

// DTO 定义
export class CreateUserDto {
@IsString()
@IsNotEmpty()
username: string;

@IsEmail()
email: string;

@IsString()
@MinLength(8)
password: string;

@IsString()
@IsOptional()
firstName?: string;

@IsString()
@IsOptional()
lastName?: string;
}

// Use Case 请求/响应 DTO
export class CreateUserRequest {
constructor(
public readonly username: string,
public readonly email: string,
public readonly password: string,
public readonly tenantId?: string,
public readonly currentUserId: string
) {}
}

export class CreateUserResponse {
constructor(
public readonly userId: string,
public readonly success: boolean
) {}
}

export class ChangeUserEmailRequest {
constructor(
public readonly userId: string,
public readonly newEmail: string,
public readonly currentUserId: string
) {}
}

export class ChangeUserEmailResponse {
constructor(
public readonly success: boolean
) {}
}

export class JoinTenantRequest {
constructor(
public readonly userId: string,
public readonly tenantId: string,
public readonly currentUserId: string
) {}
}

export class JoinTenantResponse {
constructor(
public readonly success: boolean
) {}
}

export class LeaveTenantRequest {
constructor(
public readonly userId: string,
public readonly currentUserId: string
) {}
}

export class LeaveTenantResponse {
constructor(
public readonly success: boolean
) {}
}

export class GetUserRequest {
constructor(
public readonly userId: string,
public readonly currentUserId: string
) {}
}

export class GetUserResponse {
constructor(
public readonly user: UserResponseDto,
public readonly success: boolean
) {}
}

export class GetUsersRequest {
constructor(
public readonly tenantId: string,
public readonly page: number,
public readonly size: number,
public readonly currentUserId: string
) {}
}

export class GetUsersResponse {
constructor(
public readonly users: PaginatedResponse<UserResponseDto>,
public readonly success: boolean
) {}
}

export class GetUserPermissionsRequest {
constructor(
public readonly userId: string,
public readonly currentUserId: string
) {}
}

export class GetUserPermissionsResponse {
constructor(
public readonly permissions: PermissionResponseDto[],
public readonly success: boolean
) {}
}

export class GetUserEventsRequest {
constructor(
public readonly userId: string,
public readonly from?: string,
public readonly to?: string,
public readonly page: number,
public readonly size: number,
public readonly currentUserId: string
) {}
}

export class GetUserEventsResponse {
constructor(
public readonly events: PaginatedResponse<DomainEventDto>,
public readonly success: boolean
) {}
}

export class UserResponseDto {
id: string;
username: string;
email: string;
firstName?: string;
lastName?: string;
status: string;
tenantId?: string;
createdAt: Date;
updatedAt: Date;
}

// CQRS 相关 DTO
export class ChangeUserEmailDto {
@IsEmail()
newEmail: string;
}

export class JoinTenantDto {
@IsUUID()
tenantId: string;
}

export class GetUsersQueryDto {
@IsUUID()
tenantId: string;

@IsNumber()
@Min(1)
page: number = 1;

@IsNumber()
@Min(1)
@Max(100)
size: number = 20;
}

export class GetUserEventsQueryDto {
@IsDateString()
@IsOptional()
from?: string;

@IsDateString()
@IsOptional()
to?: string;

@IsNumber()
@Min(1)
page: number = 1;

@IsNumber()
@Min(1)
@Max(100)
size: number = 20;
}

export class PaginatedResponse<T> {
data: T[];
total: number;
page: number;
size: number;
totalPages: number;
}

export class DomainEventDto {
eventId: string;
aggregateId: string;
aggregateType: string;
eventType: string;
eventData: any;
metadata: any;
timestamp: Date;
version: number;
}

// 认证相关 DTO
export class LoginDto {
@IsString()
@IsNotEmpty()
username: string;

@IsString()
@IsNotEmpty()
password: string;

@IsString()
@IsOptional()
mfaCode?: string;

@IsString()
@IsOptional()
tenantId?: string;
}

export class LoginResponseDto {
accessToken: string;
refreshToken: string;
expiresIn: number;
tokenType: string;
user: {
id: string;
username: string;
email: string;
tenantId?: string;
orgIds: string[];
deptIds: string[];
roles: string[];
permissions: string[];
};
}

export class RefreshTokenDto {
@IsString()
@IsNotEmpty()
refreshToken: string;
}

export class MFASetupDto {
@IsString()
@IsIn(['TOTP', 'SMS', 'EMAIL'])
type: string;

@IsString()
@IsOptional()
phoneNumber?: string;
}

export class MFASetupResponseDto {
secretKey?: string;
qrCode?: string;
backupCodes: string[];
}

export class MFAVerifyDto {
@IsString()
@IsNotEmpty()
username: string;

@IsString()
@IsNotEmpty()
password: string;

@IsString()
@IsNotEmpty()
mfaCode: string;

@IsString()
@IsOptional()
tenantId?: string;
}

export class PasswordResetRequestDto {
@IsEmail()
email: string;
}

export class PasswordResetConfirmDto {
@IsString()
@IsNotEmpty()
token: string;

@IsString()
@MinLength(8)
newPassword: string;

@IsString()
@MinLength(8)
confirmPassword: string;
}

export class EmailVerificationDto {
@IsString()
@IsNotEmpty()
token: string;
}
```

### 错误处理规范

#### 全局异常过滤器

```typescript
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status = 500;
    let message = 'Internal server error';
    let code = 'INTERNAL_ERROR';
    let details: Record<string, unknown> = {};

    if (exception instanceof BusinessException) {
      status = exception.statusCode;
      message = exception.message;
      code = exception.code;
      details = exception.details || {};
    } else if (exception instanceof ValidationException) {
      status = 400;
      message = 'Validation failed';
      code = 'VALIDATION_ERROR';
      details = { errors: exception.errors };
    } else if (exception instanceof Error) {
      message = exception.message;
      code = 'UNKNOWN_ERROR';
    }

    // 记录异常日志
    this.logger.logUserAction(
      'error',
      `Exception occurred: ${message}`,
      {
        userId: request.user?.id,
        tenantId: request.headers['x-tenant-id'],
        path: request.url,
        method: request.method,
      },
      exception as Error
    );

    // 返回统一错误响应
    response.status(status).json({
      success: false,
      error: {
        code,
        message,
        details,
        timestamp: new Date().toISOString(),
        path: request.url,
        requestId: request.headers['x-request-id'],
      },
    });
  }
}
````

## 📝 附录

### 技术术语表

| 术语           | 英文                                     | 定义                 |
| -------------- | ---------------------------------------- | -------------------- |
| IAM            | Identity and Access Management           | 身份与访问管理       |
| DDD            | Domain-Driven Design                     | 领域驱动设计         |
| CQRS           | Command Query Responsibility Segregation | 命令查询职责分离     |
| Event Sourcing | Event Sourcing                           | 事件溯源             |
| RBAC           | Role-Based Access Control                | 基于角色的访问控制   |
| ABAC           | Attribute-Based Access Control           | 基于属性的访问控制   |
| Data Isolation | Data Isolation                           | 数据隔离             |
| Data Privacy   | Data Privacy                             | 数据隐私             |
| JWT            | JSON Web Token                           | JSON 网络令牌        |
| TOTP           | Time-based One-Time Password             | 基于时间的一次性密码 |
| ORM            | Object-Relational Mapping                | 对象关系映射         |
| API            | Application Programming Interface        | 应用程序编程接口     |

### 参考文档
