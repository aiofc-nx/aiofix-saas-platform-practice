# AIoFix SaaS Platform - 基础设施库

本目录包含AIoFix SaaS平台的所有基础设施库，采用monorepo架构，每个库都是独立的npm包。

## 📦 基础设施库列表

### 🪵 @aiofix/logging

**日志基础设施**

- 基于Pino的高性能结构化日志
- 完整的NestJS集成（Module、Service、Middleware、Interceptor）
- 多租户支持和请求追踪
- 性能监控和错误处理

### ⚙️ @aiofix/config

**配置管理**

- 环境变量管理
- 配置文件加载和验证
- 配置类型定义
- 多环境支持

### 🚀 @aiofix/cache

**缓存基础设施**

- 多存储支持（Redis、内存、文件）
- 缓存策略和TTL管理
- 缓存性能监控
- 多租户缓存隔离

### 🔐 @aiofix/iam

**身份认证与权限管理**

- 用户认证和JWT令牌管理
- 密码加密和验证
- 权限控制和访问管理
- 多租户数据隔离
- 角色和权限管理
- 组织架构管理
- 安全审计和多因子认证

### 🗄️ @aiofix/database

**数据库基础设施**

- 多数据库支持（PostgreSQL、MySQL、MongoDB）
- 数据库连接管理
- 实体映射和关系管理
- 数据库迁移和查询优化

### 📚 @aiofix/shared

**共享工具和类型**

- 通用类型定义
- 常量定义和工具函数
- 异常定义和值对象
- 枚举定义

## 🏗️ 项目结构

```
libs/
├── logging/          # 日志基础设施
├── config/           # 配置管理
├── cache/            # 缓存基础设施
├── iam/              # 身份认证与权限管理
├── database/         # 数据库基础设施
└── shared/           # 共享工具和类型
```

每个库都包含：

- `src/` - 源代码目录
- `__tests__/` - 测试目录
- `examples/` - 使用示例
- `package.json` - 包配置
- `tsconfig.json` - TypeScript配置
- `jest.config.js` - Jest测试配置
- `README.md` - 文档

## 🚀 开发指南

### 安装依赖

```bash
# 安装所有库的依赖
pnpm install

# 安装特定库的依赖
pnpm --filter @aiofix/logging install
```

### 构建

```bash
# 构建所有库
pnpm build

# 构建特定库
pnpm --filter @aiofix/logging build
```

### 测试

```bash
# 测试所有库
pnpm test

# 测试特定库
pnpm --filter @aiofix/logging test
```

### 开发模式

```bash
# 开发模式（监听文件变化）
pnpm --filter @aiofix/logging dev
```

## 📋 开发规范

### 代码规范

- 遵循TypeScript严格模式
- 使用ESLint + Prettier
- 完整的TSDoc注释
- 单元测试覆盖率 > 80%

### 架构原则

- Clean Architecture分层设计
- 依赖注入和模块化
- 接口优先设计
- 错误处理和异常管理

### 版本管理

- 语义化版本控制
- 变更日志记录
- 向后兼容性保证

## 🔗 依赖关系

```
shared ← logging, config, cache, security, database
```

- `shared` 是基础库，其他库可以依赖它
- 其他库之间避免循环依赖
- 应用层可以依赖任何基础设施库

## 📝 贡献指南

1. 遵循代码注释规范
2. 编写完整的单元测试
3. 更新相关文档
4. 确保构建和测试通过
5. 提交前进行代码审查

## 📄 许可证

MIT License - 详见各库的LICENSE文件
