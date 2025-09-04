# SAAS平台开发指南与最佳实践

## 📚 开发指南与最佳实践

### 开发环境配置

#### 7.1 开发环境要求

**必需软件**

- Node.js 18.x+
- pnpm 8.x+
- PostgreSQL 15.x
- MongoDB 7.x
- Redis 7.x
- Docker & Docker Compose

**技术栈要求**

- **ORM**: 统一使用 MikroORM
- **PostgreSQL**: 命令端，写操作
- **MongoDB**: 查询端，读操作
- **日志**: 必须使用 PinoLoggerService
- **UUID**: 统一使用 uuid v4

**推荐工具**

- VS Code + 扩展
- Postman / Insomnia
- DBeaver / pgAdmin
- MongoDB Compass
- Redis Desktop Manager

#### 7.2 项目初始化

```bash
# 克隆项目
git clone <repository-url>
cd saas-platform

# 安装依赖
pnpm install

# 环境配置
cp .env.example .env
# 编辑 .env 文件配置数据库连接等

# 启动开发环境
pnpm run dev:docker

# 运行数据库迁移
pnpm run migration:run

# 启动应用
pnpm run start:dev
```

### 代码规范

#### 7.3 命名规范

**文件命名**

```typescript
// 使用 kebab-case
user - management.service.ts;
create - user.usecase.ts;
user - profile.entity.ts;
user - repository.interface.ts;
```

**类命名**

```typescript
// 使用 PascalCase
export class UserManagementService {}
export class CreateUserUseCase {}
export class UserProfile {}
export class UserRepository {}
```

**方法命名**

```typescript
// 使用 camelCase
async createUser(request: CreateUserRequest): Promise<CreateUserResponse> {}
async getUserById(id: string): Promise<User | null> {}
async updateUserProfile(id: string, profile: UserProfile): Promise<void> {}
async deleteUser(id: string): Promise<void> {}
```

**常量命名**

```typescript
// 使用 UPPER_SNAKE_CASE
export const MAX_USER_COUNT = 1000;
export const DEFAULT_PAGE_SIZE = 20;
export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
} as const;
```

#### 7.4 代码结构规范

**目录结构**

```
src/
├── domain/                    # 领域层
│   ├── entities/             # 实体
│   ├── value-objects/        # 值对象
│   ├── aggregates/           # 聚合根
│   ├── domain-events/        # 领域事件
│   ├── domain-services/      # 领域服务
│   ├── repositories/         # 仓储接口
│   ├── exceptions/           # 领域异常
│   └── enums/               # 枚举
├── application/              # 应用层
│   ├── use-cases/           # 用例
│   ├── commands/            # 命令
│   ├── queries/             # 查询
│   ├── services/            # 应用服务
│   └── interfaces/          # 接口
├── infrastructure/           # 基础设施层
│   ├── repositories/        # 仓储实现
│   ├── mappers/             # 映射器
│   ├── services/            # 基础设施服务
│   └── config/              # 配置
└── presentation/             # 表现层
    ├── controllers/         # 控制器
    ├── dtos/               # 数据传输对象
    ├── validators/         # 验证器
    └── guards/             # 守卫
```

**文件组织**

```typescript
// 每个文件只包含一个主要的类/接口
// user.entity.ts
export class User extends DataIsolationAwareEntity {
  // 属性定义
  // 构造函数
  // 业务方法
  // 私有方法
  // getter/setter
}

// 避免在一个文件中定义多个类
// ❌ 错误示例
export class User {}
export class UserProfile {}
export class UserSettings {}
```

#### 7.5 代码注释规范

**类注释**

````typescript
/**
 * 用户聚合根
 *
 * 负责管理用户相关的业务规则和一致性边界。
 * 用户聚合根包含用户的基本信息、状态管理、权限控制等。
 *
 * @example
 * ```typescript
 * const user = UserAggregate.create('username', 'email', 'password');
 * user.changeEmail('newemail@example.com');
 * user.deactivate();
 * ```
 */
export class UserAggregate extends AggregateRoot {
  // 实现...
}
````

**方法注释**

```typescript
/**
 * 创建新用户
 *
 * @param username - 用户名，长度3-50字符
 * @param email - 邮箱地址，必须有效格式
 * @param password - 密码，长度8-128字符
 * @param tenantId - 租户ID，可选
 * @returns 新创建的用户聚合根
 * @throws {InvalidUsernameException} 当用户名无效时
 * @throws {InvalidEmailException} 当邮箱格式无效时
 * @throws {InvalidPasswordException} 当密码不符合要求时
 */
static create(
  username: string,
  email: string,
  password: string,
  tenantId?: string,
): UserAggregate {
  // 实现...
}
```

**复杂逻辑注释**

```typescript
// 检查用户权限的复杂逻辑
async checkUserPermission(
  userId: string,
  resource: string,
  action: string,
  targetEntity?: DataIsolationAwareEntity,
): Promise<boolean> {
  // 1. 获取用户信息
  const user = await this.userRepository.findById(userId);
  if (!user) {
    return false;
  }

  // 2. 获取用户权限列表
  const permissions = await this.permissionRepository.findUserPermissions(
    userId,
    user.tenantId,
  );

  // 3. 检查是否有对应权限
  const hasPermission = permissions.some(
    permission =>
      permission.resource === resource && permission.action === action,
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
```

### 最佳实践

#### 7.6 领域驱动设计实践

**聚合根设计**

```typescript
// 用户聚合根 - 管理用户相关的所有业务规则
export class UserAggregate extends AggregateRoot {
  private _user: UserEntity;
  private _profile: UserProfile;
  private _settings: UserSettings;

  // 静态工厂方法
  static create(
    username: string,
    email: string,
    password: string,
    tenantId?: string,
  ): UserAggregate {
    const aggregate = new UserAggregate();
    const userId = UserId.generate();

    // 创建用户实体
    aggregate._user = UserEntity.create(
      userId,
      username,
      email,
      password,
      tenantId,
    );

    // 创建用户档案
    aggregate._profile = UserProfile.create(userId);

    // 创建用户设置
    aggregate._settings = UserSettings.create(userId);

    // 应用业务规则
    aggregate.validateUserData(username, email, password);

    // 产生领域事件
    aggregate.apply(new UserCreatedEvent(userId, username, email, tenantId));

    return aggregate;
  }

  // 业务方法 - 改变邮箱
  changeEmail(newEmail: string): void {
    // 业务规则验证
    if (this._user.email === newEmail) {
      return; // 无变化，直接返回
    }

    if (!this.isValidEmail(newEmail)) {
      throw new InvalidEmailException('Invalid email format');
    }

    // 更新实体
    this._user.changeEmail(newEmail);

    // 产生领域事件
    this.apply(
      new UserEmailChangedEvent(this._user.id, this._user.email, newEmail),
    );
  }

  // 业务方法 - 激活用户
  activate(): void {
    if (this._user.status === UserStatus.ACTIVE) {
      return; // 已经是激活状态
    }

    this._user.activate();
    this.apply(new UserActivatedEvent(this._user.id));
  }

  // 私有方法 - 验证用户数据
  private validateUserData(
    username: string,
    email: string,
    password: string,
  ): void {
    if (!this.isValidUsername(username)) {
      throw new InvalidUsernameException('Username must be 3-50 characters');
    }

    if (!this.isValidEmail(email)) {
      throw new InvalidEmailException('Invalid email format');
    }

    if (!this.isValidPassword(password)) {
      throw new InvalidPasswordException('Password must be 8-128 characters');
    }
  }

  // 私有方法 - 验证用户名
  private isValidUsername(username: string): boolean {
    return username.length >= 3 && username.length <= 50;
  }

  // 私有方法 - 验证邮箱
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // 私有方法 - 验证密码
  private isValidPassword(password: string): boolean {
    return password.length >= 8 && password.length <= 128;
  }

  // Getters
  get id(): UserId {
    return this._user.id;
  }

  get username(): string {
    return this._user.username;
  }

  get email(): string {
    return this._user.email;
  }

  get status(): UserStatus {
    return this._user.status;
  }

  get tenantId(): string | undefined {
    return this._user.tenantId;
  }

  get profile(): UserProfile {
    return this._profile;
  }

  get settings(): UserSettings {
    return this._settings;
  }
}
```

**值对象设计**

```typescript
// 用户ID值对象
export class UserId {
  constructor(private readonly value: string) {
    this.validate(value);
  }

  // 静态工厂方法
  static generate(): UserId {
    return new UserId(crypto.randomUUID());
  }

  // 验证方法
  private validate(value: string): void {
    if (!value || typeof value !== 'string') {
      throw new InvalidUserIdException('User ID must be a non-empty string');
    }

    if (!this.isValidUuid(value)) {
      throw new InvalidUserIdException('User ID must be a valid UUID');
    }
  }

  // 私有方法 - 验证UUID格式
  private isValidUuid(value: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
  }

  // 比较方法
  equals(other: UserId): boolean {
    return this.value === other.value;
  }

  // 转换为字符串
  toString(): string {
    return this.value;
  }

  // 获取值
  getValue(): string {
    return this.value;
  }
}
```

#### 7.7 应用层设计实践

**用例设计**

```typescript
// 创建用户用例
@Injectable()
export class CreateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly eventBus: EventBus,
    private readonly logger: PinoLoggerService,
  ) {}

  async execute(request: CreateUserRequest): Promise<CreateUserResponse> {
    try {
      // 1. 业务规则验证
      await this.validateBusinessRules(request);

      // 2. 创建用户聚合根
      const userAggregate = UserAggregate.create(
        request.username,
        request.email,
        request.password,
        request.tenantId,
      );

      // 3. 保存聚合根
      await this.userRepository.save(userAggregate);

      // 4. 发布领域事件
      const events = userAggregate.getUncommittedEvents();
      await this.eventBus.publishAll(events);

      // 5. 标记事件为已提交
      userAggregate.markEventsAsCommitted();

      // 6. 记录审计日志
      this.logger.info('User created successfully', {
        userId: userAggregate.id.toString(),
        username: userAggregate.username,
        email: userAggregate.email,
        tenantId: userAggregate.tenantId,
      });

      return new CreateUserResponse(
        userAggregate.id.toString(),
        true,
        'User created successfully',
      );
    } catch (error) {
      // 错误处理和日志记录
      this.logger.error('Failed to create user', {
        username: request.username,
        email: request.email,
        error: error.message,
        stack: error.stack,
      });

      throw error;
    }
  }

  // 私有方法 - 业务规则验证
  private async validateBusinessRules(
    request: CreateUserRequest,
  ): Promise<void> {
    // 检查用户名是否已存在
    if (await this.userRepository.existsByUsername(request.username)) {
      throw new UsernameAlreadyExistsException(
        `Username '${request.username}' already exists`,
      );
    }

    // 检查邮箱是否已存在
    if (await this.userRepository.existsByEmail(request.email)) {
      throw new EmailAlreadyExistsException(
        `Email '${request.email}' already exists`,
      );
    }

    // 检查租户是否存在（如果提供）
    if (request.tenantId) {
      // 这里可以添加租户验证逻辑
      // await this.tenantService.validateTenant(request.tenantId);
    }
  }
}
```

**应用服务设计**

```typescript
// 用户管理应用服务
@Injectable()
export class UserManagementService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tenantService: TenantService,
    private readonly organizationService: OrganizationService,
    private readonly permissionService: PermissionService,
    private readonly eventBus: EventBus,
    private readonly logger: PinoLoggerService,
  ) {}

  // 复杂业务：用户加入租户
  async joinUserToTenant(
    userId: string,
    tenantId: string,
    roles: string[],
    organizationId?: string,
    departmentIds?: string[],
  ): Promise<JoinTenantResponse> {
    try {
      // 1. 验证租户状态
      const tenant = await this.tenantService.findById(tenantId);
      if (!tenant.isActive()) {
        throw new TenantNotActiveException(
          `Tenant '${tenantId}' is not active`,
        );
      }

      // 2. 验证组织权限（如果指定）
      if (organizationId) {
        const organization =
          await this.organizationService.findById(organizationId);
        if (!organization.belongsToTenant(tenantId)) {
          throw new OrganizationNotInTenantException(
            `Organization '${organizationId}' does not belong to tenant '${tenantId}'`,
          );
        }
      }

      // 3. 分配用户权限
      await this.permissionService.assignRolesToUser(userId, tenantId, roles);

      // 4. 更新用户状态
      const user = await this.userRepository.findById(userId);
      user.joinTenant(tenantId, organizationId, departmentIds);
      await this.userRepository.save(user);

      // 5. 发布领域事件
      const events = user.getUncommittedEvents();
      await this.eventBus.publishAll(events);

      // 6. 记录审计日志
      this.logger.info('User joined tenant successfully', {
        userId,
        tenantId,
        organizationId,
        departmentIds,
        roles,
      });

      return new JoinTenantResponse(true, 'User joined tenant successfully');
    } catch (error) {
      this.logger.error('Failed to join user to tenant', {
        userId,
        tenantId,
        error: error.message,
      });

      throw error;
    }
  }
}
```

#### 7.8 基础设施层实践

**仓储实现**

```typescript
// 用户仓储实现
@Injectable()
export class UserRepositoryImpl implements UserRepository {
  constructor(
    private readonly dataSource: DataSource,
    private readonly logger: PinoLoggerService,
  ) {}

  async save(user: UserAggregate): Promise<void> {
    try {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // 保存用户实体
        await this.saveUserEntity(queryRunner, user);

        // 保存用户档案
        await this.saveUserProfile(queryRunner, user);

        // 保存用户设置
        await this.saveUserSettings(queryRunner, user);

        await queryRunner.commitTransaction();
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      this.logger.error('Failed to save user', {
        userId: user.id.toString(),
        error: error.message,
      });
      throw new UserSaveException('Failed to save user', error);
    }
  }

  async findById(id: string): Promise<UserAggregate | null> {
    try {
      // 查询用户实体
      const userEntity = await this.dataSource
        .createQueryBuilder()
        .select('*')
        .from('users', 'u')
        .where('u.id = :id', { id })
        .getRawOne();

      if (!userEntity) {
        return null;
      }

      // 查询用户档案
      const userProfile = await this.dataSource
        .createQueryBuilder()
        .select('*')
        .from('user_profiles', 'up')
        .where('up.user_id = :userId', { userId: id })
        .getRawOne();

      // 查询用户设置
      const userSettings = await this.dataSource
        .createQueryBuilder()
        .select('*')
        .from('user_settings', 'us')
        .where('us.user_id = :userId', { userId: id })
        .getRawOne();

      // 重建聚合根
      return this.rebuildUserAggregate(userEntity, userProfile, userSettings);
    } catch (error) {
      this.logger.error('Failed to find user by ID', {
        userId: id,
        error: error.message,
      });
      throw new UserFindException('Failed to find user', error);
    }
  }

  async existsByEmail(email: string): Promise<boolean> {
    try {
      const count = await this.dataSource
        .createQueryBuilder()
        .select('COUNT(*)', 'count')
        .from('users', 'u')
        .where('u.email = :email', { email })
        .getRawOne();

      return parseInt(count.count) > 0;
    } catch (error) {
      this.logger.error('Failed to check user existence by email', {
        email,
        error: error.message,
      });
      throw new UserFindException('Failed to check user existence', error);
    }
  }

  // 私有方法 - 保存用户实体
  private async saveUserEntity(
    queryRunner: QueryRunner,
    user: UserAggregate,
  ): Promise<void> {
    const userData = {
      id: user.id.toString(),
      username: user.username,
      email: user.email,
      status: user.status,
      tenant_id: user.tenantId,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    };

    await queryRunner.query(
      `INSERT INTO users (id, username, email, status, tenant_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO UPDATE SET
         username = EXCLUDED.username,
         email = EXCLUDED.email,
         status = EXCLUDED.status,
         tenant_id = EXCLUDED.tenant_id,
         updated_at = EXCLUDED.updated_at`,
      Object.values(userData),
    );
  }

  // 私有方法 - 重建用户聚合根
  private rebuildUserAggregate(
    userEntity: any,
    userProfile: any,
    userSettings: any,
  ): UserAggregate {
    // 这里实现从数据库数据重建聚合根的逻辑
    // 由于聚合根重建比较复杂，这里只是示例
    throw new Error('Method not implemented');
  }
}
```

### 错误处理

#### 7.9 异常设计

**异常层次结构**

```typescript
// 基础异常类
export abstract class BaseException extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
    cause?: Error,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.cause = cause;
  }
}

// 领域异常
export abstract class DomainException extends BaseException {
  constructor(message: string, code: string, cause?: Error) {
    super(message, code, 400, cause);
  }
}

// 应用异常
export abstract class ApplicationException extends BaseException {
  constructor(message: string, code: string, cause?: Error) {
    super(message, code, 400, cause);
  }
}

// 基础设施异常
export abstract class InfrastructureException extends BaseException {
  constructor(message: string, code: string, cause?: Error) {
    super(message, code, 500, cause);
  }
}

// 具体异常类
export class InvalidEmailException extends DomainException {
  constructor(message: string = 'Invalid email format') {
    super(message, 'INVALID_EMAIL');
  }
}

export class UserEmailAlreadyExistsException extends DomainException {
  constructor(email: string) {
    super(`Email '${email}' already exists`, 'USER_EMAIL_ALREADY_EXISTS');
  }
}

export class UserNotFoundException extends ApplicationException {
  constructor(userId: string) {
    super(`User '${userId}' not found`, 'USER_NOT_FOUND');
  }
}

export class DatabaseConnectionException extends InfrastructureException {
  constructor(message: string = 'Database connection failed') {
    super(message, 'DATABASE_CONNECTION_FAILED');
  }
}
```

**异常过滤器**

```typescript
// 全局异常过滤器
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: PinoLoggerService) {}

  catch(exception: Error, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // 记录异常日志
    this.logger.error('Unhandled exception', {
      exception: exception.message,
      stack: exception.stack,
      url: request.url,
      method: request.method,
      body: request.body,
      query: request.query,
      params: request.params,
      headers: request.headers,
    });

    // 构建错误响应
    const errorResponse = this.buildErrorResponse(exception);

    // 发送响应
    response.status(errorResponse.statusCode).json(errorResponse);
  }

  // 构建错误响应
  private buildErrorResponse(exception: Error): ErrorResponse {
    if (exception instanceof BaseException) {
      return {
        success: false,
        error: {
          code: exception.code,
          message: exception.message,
          statusCode: exception.statusCode,
        },
        timestamp: new Date().toISOString(),
      };
    }

    // 默认错误响应
    return {
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
        statusCode: 500,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
```

### 日志记录

#### 7.10 日志最佳实践

**结构化日志**

```typescript
// 日志服务
@Injectable()
export class LoggingService {
  constructor(private readonly logger: PinoLoggerService) {}

  // 记录业务操作
  logBusinessOperation(
    operation: string,
    userId: string,
    details: Record<string, any>,
  ): void {
    this.logger.info('Business operation executed', {
      operation,
      userId,
      timestamp: new Date().toISOString(),
      ...details,
    });
  }

  // 记录安全事件
  logSecurityEvent(
    event: string,
    userId: string,
    ipAddress: string,
    userAgent: string,
    details: Record<string, any>,
  ): void {
    this.logger.warn('Security event detected', {
      event,
      userId,
      ipAddress,
      userAgent,
      timestamp: new Date().toISOString(),
      ...details,
    });
  }

  // 记录性能指标
  logPerformanceMetric(
    operation: string,
    duration: number,
    metadata: Record<string, any>,
  ): void {
    this.logger.info('Performance metric', {
      operation,
      duration,
      timestamp: new Date().toISOString(),
      ...metadata,
    });
  }

  // 记录审计日志
  logAuditEvent(
    action: string,
    userId: string,
    resource: string,
    resourceId: string,
    details: Record<string, any>,
  ): void {
    this.logger.info('Audit event', {
      action,
      userId,
      resource,
      resourceId,
      timestamp: new Date().toISOString(),
      ...details,
    });
  }
}
```

**日志中间件**

```typescript
// 日志中间件
@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  constructor(
    private readonly logger: PinoLoggerService,
    private readonly loggingService: LoggingService,
  ) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const startTime = Date.now();
    const { method, url, headers, body, query, params } = req;
    const userId = this.extractUserId(req);

    // 记录请求开始
    this.logger.info('HTTP request started', {
      method,
      url,
      userId,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString(),
    });

    // 响应完成后的日志记录
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const { statusCode } = res;

      // 记录请求完成
      this.logger.info('HTTP request completed', {
        method,
        url,
        statusCode,
        duration,
        userId,
        timestamp: new Date().toISOString(),
      });

      // 记录性能指标
      this.loggingService.logPerformanceMetric(`${method} ${url}`, duration, {
        statusCode,
        userId,
      });

      // 记录慢请求
      if (duration > 1000) {
        this.logger.warn('Slow request detected', {
          method,
          url,
          duration,
          userId,
          timestamp: new Date().toISOString(),
        });
      }

      // 记录错误请求
      if (statusCode >= 400) {
        this.logger.error('HTTP request failed', {
          method,
          url,
          statusCode,
          duration,
          userId,
          timestamp: new Date().toISOString(),
        });
      }
    });

    next();
  }

  // 提取用户ID
  private extractUserId(req: Request): string | undefined {
    // 从JWT token或其他方式提取用户ID
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
        return decoded.sub;
      } catch (error) {
        return undefined;
      }
    }
    return undefined;
  }
}
```

---

**文档版本**: v1.0.0  
**创建日期**: 2024-12-19  
**适用范围**: SAAS平台开发指南与最佳实践指导
