# 用户事件投影机制

## 概述

用户事件投影机制是用户模块的核心组件，负责将PostgreSQL命令端的事件数据同步到MongoDB查询端，实现CQRS架构中的读写模型分离。

## 架构设计

### 组件结构

```
UserEventProjectionService (事件投影服务)
    ↓
UserEventHandler (事件处理器)
    ↓
MongoDB Repositories (读模型仓储)
    ↓
MongoDB Collections (读模型集合)
```

### 数据流

1. **命令端操作** → PostgreSQL (写模型)
2. **领域事件发布** → EventBus
3. **事件监听** → UserEventProjectionService
4. **事件处理** → UserEventHandler
5. **读模型同步** → MongoDB (读模型)

## 核心组件

### 1. UserEventProjectionService

事件投影服务，负责：

- 监听事件总线中的用户相关事件
- 管理事件投影的生命周期
- 支持事件重放和状态重建
- 提供健康检查和状态监控

#### 主要方法

```typescript
// 启动事件投影服务
await projectionService.start();

// 停止事件投影服务
await projectionService.stop();

// 重放指定时间范围内的事件
await projectionService.replayEvents(fromDate, toDate);

// 重建所有读模型
await projectionService.rebuildReadModels();

// 获取服务状态
const status = projectionService.getStatus();

// 健康检查
const isHealthy = projectionService.isHealthy();
```

### 2. UserEventHandler

事件处理器，负责：

- 处理各种用户相关的领域事件
- 将事件数据转换为MongoDB文档
- 执行读模型的增删改操作

#### 支持的事件类型

- `UserCreated` - 用户创建
- `UserUpdated` - 用户更新
- `UserStatusChanged` - 用户状态变更
- `UserProfileCreated` - 用户档案创建
- `UserProfileUpdated` - 用户档案更新
- `UserRelationshipCreated` - 用户关系创建
- `UserRelationshipStatusChanged` - 用户关系状态变更
- `UserDeleted` - 用户删除

## 使用方法

### 1. 基本配置

在用户模块中导入必要的依赖：

```typescript
import { Module } from "@nestjs/common";
import { LoggingModule } from "@aiofix/logging";
import { EventStoreModule } from "@aiofix/shared";
import {
  UserEventHandler,
  UserEventProjectionService,
} from "./infrastructure/events";

@Module({
  imports: [LoggingModule, EventStoreModule],
  providers: [UserEventHandler, UserEventProjectionService],
  exports: [UserEventProjectionService],
})
export class UserModule {}
```

### 2. 自动启动

事件投影服务会在模块初始化时自动启动，无需手动干预。

### 3. 手动控制

如果需要手动控制事件投影服务：

```typescript
@Injectable()
export class UserService {
  constructor(
    private readonly eventProjectionService: UserEventProjectionService
  ) {}

  async startEventProjection(): Promise<void> {
    await this.eventProjectionService.start();
  }

  async stopEventProjection(): Promise<void> {
    await this.eventProjectionService.stop();
  }
}
```

### 4. 事件重放

在系统恢复或数据修复时，可以重放事件：

```typescript
// 重放最近24小时的事件
const fromDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
const toDate = new Date();
await projectionService.replayEvents(fromDate, toDate);

// 重建所有读模型
await projectionService.rebuildReadModels();
```

## 监控和维护

### 1. 状态监控

```typescript
const status = projectionService.getStatus();
console.log("服务状态:", status);
// 输出: { isRunning: true, eventHandlersCount: 8, supportedEventTypes: [...] }
```

### 2. 健康检查

```typescript
const isHealthy = projectionService.isHealthy();
if (!isHealthy) {
  console.log("事件投影服务异常");
}
```

### 3. 日志监控

事件投影服务会记录详细的操作日志，包括：

- 事件处理成功/失败
- 服务启动/停止
- 事件重放进度
- 错误和异常信息

## 性能优化

### 1. 批量处理

对于大量事件，建议使用批量处理：

```typescript
// 分批重放事件，避免内存溢出
const batchSize = 1000;
const events = await eventStore.getEvents(fromDate, toDate);
for (let i = 0; i < events.length; i += batchSize) {
  const batch = events.slice(i, i + batchSize);
  await Promise.all(batch.map(event => handler.handleEvent(event)));
}
```

### 2. 并发控制

事件处理支持并发执行，但需要注意数据库连接池的限制。

### 3. 错误重试

事件处理失败时会记录错误日志，建议实现重试机制：

```typescript
// 简单的重试机制
async function handleEventWithRetry(
  event: DomainEvent,
  maxRetries = 3
): Promise<void> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await handler.handleEvent(event);
      return;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
}
```

## 故障排除

### 1. 常见问题

- **事件处理失败**: 检查MongoDB连接和权限
- **服务无法启动**: 检查EventBus和EventStore配置
- **性能问题**: 检查数据库索引和连接池配置

### 2. 调试方法

```typescript
// 启用详细日志
const status = projectionService.getStatus();
console.log("事件处理器数量:", status.eventHandlersCount);
console.log("支持的事件类型:", status.supportedEventTypes);

// 检查特定事件的处理
const event = { eventType: "UserCreated", eventId: "test-123" };
await userEventHandler.handleEvent(event);
```

## 扩展和定制

### 1. 添加新事件类型

```typescript
// 在UserEventHandler中添加新方法
async handleUserPasswordChangedEvent(event: DomainEvent): Promise<void> {
  // 处理密码变更事件
}

// 在UserEventProjectionService中注册新处理器
this.eventHandlers.set('UserPasswordChanged',
  (event) => this.userEventHandler.handleUserPasswordChangedEvent(event));
```

### 2. 自定义事件处理逻辑

可以继承UserEventHandler类，重写特定的事件处理方法：

```typescript
export class CustomUserEventHandler extends UserEventHandler {
  async handleUserCreatedEvent(event: DomainEvent): Promise<void> {
    // 自定义处理逻辑
    await super.handleUserCreatedEvent(event);

    // 额外的业务逻辑
    await this.sendWelcomeEmail(event.eventData);
  }
}
```

## 总结

用户事件投影机制提供了完整的CQRS实现，确保读写模型的一致性，支持事件重放和状态重建，是构建高可用、可扩展用户管理系统的关键组件。
