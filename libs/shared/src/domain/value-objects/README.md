# 共享领域值对象 (Shared Domain Value Objects)

## 概述

本模块提供了完整的值对象实现，遵循 DDD（领域驱动设计）和 Clean Architecture 原则。值对象是不可变的，通过值来定义相等性，封装了业务规则和验证逻辑。

## 架构设计

### 基础架构

```
BaseValueObject (抽象基类)
├── 序列化支持 (toJSON, toObject, fromJSON)
├── 克隆支持 (clone)
├── 不变性验证 (validateInvariants)
└── 错误处理 (InvalidValueObjectError)
```

### 值对象层次

```
基础值对象
├── Uuid - UUID v4标识符
├── Email - 邮箱地址
└── Password - 密码（带强度评估）

业务值对象
├── Money - 货币金额（支持多种货币）
├── DateRange - 日期范围
├── PhoneNumber - 手机号码
├── AuthToken - 认证令牌
├── WebhookUrl - Webhook URL
└── DeviceToken - 设备令牌
```

## 核心特性

### 1. 不可变性 (Immutability)

所有值对象创建后不可修改，确保数据一致性。

### 2. 值相等性 (Value Equality)

通过值而非引用判断相等性。

### 3. 业务规则封装

将验证逻辑和业务规则封装在值对象内部。

### 4. 类型安全

完整的 TypeScript 类型支持。

### 5. 序列化支持

支持 JSON 序列化和反序列化。

### 6. 性能优化

提供缓存装饰器优化验证性能。

## 使用示例

### 基础值对象

```typescript
import { Uuid, Email, Password } from '@hl8-aio-saas-practice/shared';

// UUID
const id = Uuid.generate();
const idFromString = Uuid.fromString('550e8400-e29b-41d4-a716-446655440000');

// Email
const email = new Email('user@example.com');
const isCorporate = email.isCorporate();
const domain = email.getDomain();

// Password
const password = Password.generate(16, true);
const strength = password.getStrengthLevel();
const isStrong = password.isStrong();
```

### 业务值对象

```typescript
import { Money, Currency, DateRange } from '@hl8-aio-saas-practice/shared';

// Money
const price = new Money(99.99, Currency.CNY);
const total = price.add(new Money(10.01, Currency.CNY));
const formatted = price.toString(); // "CNY 99.99"

// DateRange
const range = DateRange.today();
const isCurrent = range.isCurrent();
const workingDays = range.getWorkingDays();
```

### 序列化

```typescript
// 序列化
const email = new Email('user@example.com');
const json = email.toJSON();
const obj = email.toObject();

// 反序列化
const emailFromJson = Email.fromJSON(json);
```

### 缓存优化

```typescript
import { GlobalCachedValidation } from '@hl8-aio-saas-practice/shared';

class MyValueObject extends BaseValueObject {
  @GlobalCachedValidation({ ttl: 300000 }) // 5分钟缓存
  static isValid(value: string): boolean {
    // 复杂的验证逻辑
    return true;
  }
}
```

## 错误处理

所有值对象都提供统一的错误处理机制：

```typescript
import {
  InvalidEmailError,
  InvalidPasswordError,
} from '@hl8-aio-saas-practice/shared';

try {
  const email = new Email('invalid-email');
} catch (error) {
  if (error instanceof InvalidEmailError) {
    console.log('邮箱格式错误:', error.message);
    console.log('输入值:', error.value);
  }
}
```

## 性能优化

### 缓存机制

使用缓存装饰器可以显著提高验证性能：

```typescript
// 局部缓存
@CachedValidation({ ttl: 60000, maxSize: 100 })

// 全局缓存
@GlobalCachedValidation({ ttl: 300000, maxSize: 1000 })
```

### 缓存管理

```typescript
import {
  ClearValidationCache,
  GetValidationCacheSize,
} from '@hl8-aio-saas-practice/shared';

// 清空缓存
ClearValidationCache();

// 获取缓存大小
const size = GetValidationCacheSize();
```

## 扩展指南

### 创建新的值对象

1. 继承 `BaseValueObject`
2. 实现抽象方法
3. 添加验证逻辑
4. 定义错误类型

```typescript
import { BaseValueObject, InvalidValueObjectError } from './base.value-object';

export class InvalidMyValueError extends InvalidValueObjectError {
  constructor(message: string, value?: unknown) {
    super(message, 'MyValue', value);
    this.name = 'InvalidMyValueError';
  }
}

export class MyValue extends BaseValueObject {
  private readonly _value: string;

  constructor(value: string) {
    super();
    this.validate(value);
    this._value = value;
    this.validateInvariants();
  }

  // 实现抽象方法...
  equals(other: unknown): boolean {
    return other instanceof MyValue && this._value === other._value;
  }

  toJSON(): string {
    return JSON.stringify({ value: this._value });
  }

  toObject(): Record<string, unknown> {
    return { value: this._value };
  }

  fromJSON(json: string): MyValue {
    // 实现反序列化逻辑
  }

  toString(): string {
    return this._value;
  }

  clone(): MyValue {
    return new MyValue(this._value);
  }

  private validate(value: string): void {
    // 实现验证逻辑
  }

  protected validateInvariants(): void {
    // 实现不变性验证
  }
}
```

## 最佳实践

### 1. 验证优先

在构造函数中进行严格的验证，确保值对象的有效性。

### 2. 不可变性

所有属性都应该是只读的，避免外部修改。

### 3. 值相等性

正确实现 `equals` 方法，基于值而非引用。

### 4. 序列化安全

确保序列化不暴露敏感信息（如密码明文）。

### 5. 性能考虑

对于复杂的验证逻辑，使用缓存装饰器。

### 6. 错误处理

提供具体的错误类型和详细的错误信息。

## 测试

每个值对象都应该包含完整的测试用例：

- 构造函数验证
- 相等性比较
- 序列化/反序列化
- 业务方法测试
- 错误处理测试
- 性能测试

## 总结

本模块提供了完整、类型安全、高性能的值对象实现，支持 SAAS 平台的各种业务需求。通过统一的架构设计和丰富的功能特性，为整个系统提供了可靠的基础组件。
