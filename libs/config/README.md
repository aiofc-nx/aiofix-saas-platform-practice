# @aiofix/config

AIoFix SaaS Platform - 配置管理基础设施

## 功能特性

- ✅ 环境变量管理
- ✅ 配置文件加载
- ✅ 配置验证
- ✅ 配置类型定义
- ✅ 配置服务提供
- ✅ 多环境支持

## 快速开始

### 安装

```bash
pnpm add @aiofix/config
```

### 使用

```typescript
import { ConfigModule } from "@aiofix/config";

@Module({
  imports: [
    ConfigModule.register({
      // 配置选项
    }),
  ],
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
