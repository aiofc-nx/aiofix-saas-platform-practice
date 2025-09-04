# @aiofix/logging 使用示例

## 快速开始

### 1. 安装依赖

```bash
pnpm add @aiofix/logging
```

### 2. 在模块中注册

```typescript
import { LoggingModule } from "@aiofix/logging";

@Module({
  imports: [
    LoggingModule.register({
      config: {
        level: "info",
        format: "json",
        colorize: false,
      },
      global: true,
    }),
  ],
})
export class AppModule {}
```

### 3. 在服务中使用

```typescript
import { PinoLoggerService } from "@aiofix/logging";

@Injectable()
export class UserService {
  constructor(private readonly logger: PinoLoggerService) {}

  async createUser(userData: any) {
    this.logger.info("开始创建用户", "BUSINESS", {
      userId: userData.id,
      operation: "create",
    });

    // 业务逻辑...
  }
}
```

## 主要特性

- ✅ 高性能结构化日志
- ✅ 多租户支持
- ✅ 请求追踪
- ✅ 性能监控
- ✅ 错误处理
- ✅ 配置灵活

## 日志级别

- `trace` - 最详细的调试信息
- `debug` - 调试信息
- `info` - 一般信息
- `warn` - 警告信息
- `error` - 错误信息
- `fatal` - 致命错误

## 日志上下文

- `HTTP_REQUEST` - HTTP请求
- `DATABASE` - 数据库操作
- `BUSINESS` - 业务逻辑
- `AUTH` - 认证授权
- `CONFIG` - 配置管理
- `CACHE` - 缓存操作
- `EVENT` - 事件处理
- `SYSTEM` - 系统操作
- `EXTERNAL` - 外部服务
- `PERFORMANCE` - 性能监控
