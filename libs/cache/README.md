# @aiofix/cache

AIoFix SaaS Platform - 缓存基础设施

## 功能特性

- ✅ 多存储支持（Redis、内存、文件）
- ✅ 缓存策略配置
- ✅ 缓存性能监控
- ✅ 缓存清理和失效
- ✅ 多租户缓存隔离
- ✅ TTL管理

## 快速开始

### 安装

```bash
pnpm add @aiofix/cache
```

### 使用

```typescript
import { CacheModule } from '@aiofix/cache';

@Module({
  imports: [
    CacheModule.register({
      // 缓存配置
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
