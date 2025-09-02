# @aiofix/database

AIoFix SaaS Platform - 数据库基础设施

## 功能特性

- ✅ 多数据库支持（PostgreSQL、MySQL、MongoDB）
- ✅ 数据库连接管理
- ✅ 实体映射和关系管理
- ✅ 数据库迁移
- ✅ 查询优化
- ✅ 数据备份和恢复

## 快速开始

### 安装

```bash
pnpm add @aiofix/database
```

### 使用

```typescript
import { DatabaseModule } from '@aiofix/database';

@Module({
  imports: [
    DatabaseModule.register({
      // 数据库配置
    })
  ]
})
export class AppModule {}
```

## 开发

```bash
# 安装依赖
pnpm install

# 构建
pnpm build

# 测试
pnpm test

# 开发模式
pnpm dev
```
