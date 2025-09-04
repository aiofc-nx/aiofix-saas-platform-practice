# @aiofix/shared

AIoFix SaaS Platform - 共享工具和类型

## 功能特性

- ✅ 通用类型定义
- ✅ 常量定义
- ✅ 工具函数
- ✅ 异常定义
- ✅ 值对象
- ✅ 枚举定义

## 快速开始

### 安装

```bash
pnpm add @aiofix/shared
```

### 使用

```typescript
import { Uuid, EmailValueObject, ValidationException } from "@aiofix/shared";

// 使用共享类型和工具
const id = new Uuid();
const email = new EmailValueObject("user@example.com");
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
