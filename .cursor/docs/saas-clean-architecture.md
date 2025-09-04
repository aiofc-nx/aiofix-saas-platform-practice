# SAAS平台Clean Architecture设计

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
    private readonly auditService: AuditService,
  ) {}

  async execute(request: CreateUserRequest): Promise<CreateUserResponse> {
    // 1. 业务规则验证
    await this.validateBusinessRules(request);

    // 2. 创建命令
    const command = new CreateUserCommand(
      request.username,
      request.email,
      request.password,
      request.tenantId,
    );

    // 3. 执行命令
    await this.commandBus.execute(command);

    // 4. 业务逻辑处理
    await this.sendWelcomeEmail(request.email);
    await this.auditService.logUserCreation(request);

    return { userId: command.userId, success: true };
  }

  private async validateBusinessRules(
    request: CreateUserRequest,
  ): Promise<void> {
    // 业务规则验证逻辑
  }
}

@Injectable()
export class GetUserUseCase {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly permissionService: PermissionService,
  ) {}

  async execute(request: GetUserRequest): Promise<GetUserResponse> {
    // 1. 权限验证
    await this.permissionService.checkPermission(
      request.currentUserId,
      'user',
      'read',
      request.userId,
    );

    // 2. 创建查询
    const query = new GetUserByIdQuery(request.userId);

    // 3. 执行查询
    const user = await this.queryBus.execute(query);

    return { user, success: true };
  }
}
```

### 应用层职责划分原则

#### 核心原则

**"一般的业务逻辑直接在use-case实现，复杂业务逻辑才需要应用服务"**

这是SAAS平台应用层设计的核心原则，确保代码职责清晰、维护简单、测试容易。

#### 职责划分详解

##### 1. Use Case（用例）职责

**适用场景**：简单业务逻辑、单一聚合根操作、基础业务规则验证

**主要职责**：

- 业务规则验证
- 单一聚合根操作
- 基础业务逻辑编排
- 事件发布
- 审计日志记录

**实现示例**：

```typescript
// 简单业务逻辑 - 直接在 Use Case 中实现
@Injectable()
export class CreateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(request: CreateUserRequest): Promise<CreateUserResponse> {
    // 1. 业务规则验证
    await this.validateBusinessRules(request);

    // 2. 创建用户聚合根
    const userAggregate = UserAggregate.create(
      request.username,
      request.email,
      request.password,
    );

    // 3. 保存并发布事件
    await this.userRepository.save(userAggregate);
    await this.eventBus.publishAll(userAggregate.getUncommittedEvents());

    return new CreateUserResponse(userAggregate.getId(), true);
  }

  private async validateBusinessRules(
    request: CreateUserRequest,
  ): Promise<void> {
    // 简单的业务规则验证
    if (await this.userRepository.existsByEmail(request.email)) {
      throw new UserEmailAlreadyExistsException(request.email);
    }
  }
}
```

##### 2. Application Service（应用服务）职责

**适用场景**：复杂业务逻辑、跨模块协调、多聚合根操作、外部服务集成

**主要职责**：

- 跨模块业务协调
- 多聚合根操作编排
- 复杂业务流程管理
- 外部服务集成
- 事务边界管理

**实现示例**：

```typescript
// 复杂业务逻辑 - 需要应用服务协调
@Injectable()
export class JoinTenantUseCase {
  constructor(
    private readonly userManagementService: UserManagementService, // 应用服务
    private readonly tenantService: TenantService,
    private readonly permissionService: PermissionService,
  ) {}

  async execute(request: JoinTenantRequest): Promise<JoinTenantResponse> {
    // 复杂的跨模块业务逻辑，需要应用服务协调
    return this.userManagementService.joinUserToTenant(
      request.userId,
      request.tenantId,
      request.roles,
      request.organizationId,
      request.departmentIds,
    );
  }
}

// 应用服务 - 只负责复杂业务协调
@Injectable()
export class UserManagementService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tenantService: TenantService,
    private readonly organizationService: OrganizationService,
    private readonly permissionService: PermissionService,
    private readonly eventBus: EventBus,
  ) {}

  // 复杂业务：用户加入租户（涉及多个模块协调）
  async joinUserToTenant(
    userId: string,
    tenantId: string,
    roles: string[],
    organizationId?: string,
    departmentIds?: string[],
  ): Promise<JoinTenantResponse> {
    // 1. 验证租户状态
    const tenant = await this.tenantService.findById(tenantId);
    if (!tenant.isActive()) {
      throw new TenantNotActiveException(tenantId);
    }

    // 2. 验证组织权限
    if (organizationId) {
      const organization =
        await this.organizationService.findById(organizationId);
      if (!organization.belongsToTenant(tenantId)) {
        throw new OrganizationNotInTenantException(organizationId, tenantId);
      }
    }

    // 3. 分配用户权限
    await this.permissionService.assignRolesToUser(userId, tenantId, roles);

    // 4. 更新用户状态
    const user = await this.userRepository.findById(userId);
    user.joinTenant(tenantId, organizationId, departmentIds);
    await this.userRepository.save(user);

    // 5. 发布领域事件
    await this.eventBus.publishAll(user.getUncommittedEvents());

    return new JoinTenantResponse(true);
  }

  // 复杂业务：用户离职处理（涉及数据清理和权限回收）
  async processUserOffboarding(
    userId: string,
    tenantId: string,
    reason: string,
  ): Promise<OffboardingResponse> {
    // 复杂的离职流程处理
    // ... 实现离职逻辑
  }
}
```

#### 设计指导原则

##### 1. 何时使用 Use Case

- **单一职责**：只处理一个明确的业务操作
- **简单逻辑**：业务规则相对简单，不需要跨模块协调
- **单一聚合根**：只操作一个聚合根
- **基础验证**：主要是数据验证和基础业务规则

##### 2. 何时使用 Application Service

- **跨模块协调**：需要协调多个模块的业务逻辑
- **多聚合根操作**：涉及多个聚合根的复杂操作
- **外部服务集成**：需要调用外部服务或第三方API
- **复杂业务流程**：包含多个步骤、条件判断的业务流程
- **事务边界管理**：需要管理复杂的事务边界

##### 3. 避免反模式

**❌ 错误示例**：Use Case 承担过多职责

```typescript
// 错误：Use Case 承担了应用服务的职责
@Injectable()
export class CreateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tenantService: TenantService,
    private readonly organizationService: OrganizationService,
    private readonly permissionService: PermissionService,
    private readonly emailService: EmailService,
    private readonly auditService: AuditService,
  ) {}

  async execute(request: CreateUserRequest): Promise<CreateUserResponse> {
    // 错误：Use Case 中包含了复杂的跨模块协调逻辑
    const tenant = await this.tenantService.findById(request.tenantId);
    const organization = await this.organizationService.findById(
      request.organizationId,
    );
    // ... 更多复杂的协调逻辑
  }
}
```

**✅ 正确示例**：职责清晰分离

```typescript
// 正确：Use Case 只负责简单业务逻辑
@Injectable()
export class CreateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(request: CreateUserRequest): Promise<CreateUserResponse> {
    // 正确：只处理用户创建的核心逻辑
    const userAggregate = UserAggregate.create(
      request.username,
      request.email,
      request.password,
    );

    await this.userRepository.save(userAggregate);
    await this.eventBus.publishAll(userAggregate.getUncommittedEvents());

    return new CreateUserResponse(userAggregate.getId(), true);
  }
}

// 正确：复杂业务逻辑由应用服务处理
@Injectable()
export class UserOnboardingService {
  async onboardUserToTenant(
    request: OnboardUserRequest,
  ): Promise<OnboardUserResponse> {
    // 处理复杂的入职流程
  }
}
```

#### 架构优势

1. **职责清晰**：每个组件都有明确的职责边界
2. **易于测试**：Use Case 可以独立测试，不依赖复杂的外部服务
3. **易于维护**：修改简单业务逻辑时，影响范围可控
4. **易于扩展**：新增业务逻辑时，可以明确选择使用 Use Case 还是应用服务
5. **团队协作**：不同开发者可以并行开发不同的 Use Case 和应用服务

#### 实施建议

1. **优先使用 Use Case**：对于大多数业务操作，优先考虑使用 Use Case
2. **谨慎使用应用服务**：只有在确实需要复杂协调时才创建应用服务
3. **持续重构**：随着业务发展，及时调整职责划分
4. **团队培训**：确保团队成员理解并遵循这一原则

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
    public readonly tenantId?: string,
  ) {}
}

export class ChangeUserEmailCommand {
  constructor(
    public readonly userId: string,
    public readonly newEmail: string,
  ) {}
}

// 命令处理器 - 位于 commands/handlers/
@CommandHandler(CreateUserCommand)
export class CreateUserHandler {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly eventStore: EventStore,
  ) {}

  async execute(command: CreateUserCommand): Promise<void> {
    // 创建用户聚合根
    const userAggregate = UserAggregate.create(
      command.username,
      command.email,
      command.password,
    );

    // 保存聚合根
    await this.userRepository.save(userAggregate);

    // 保存领域事件
    const events = userAggregate.getUncommittedEvents();
    await this.eventStore.saveEvents(
      userAggregate.getId(),
      events,
      userAggregate.getVersion(),
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
    public readonly size: number,
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
    expectedVersion: number,
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
    expectedVersion: number,
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
          currentVersion,
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
          ],
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
      [aggregateId],
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
    events: DomainEvent[],
  ): T {
    const aggregate = new this();
    events.forEach(event => aggregate.when(event));
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
    tenantId: string,
  ): RoleAggregate {
    const aggregate = new RoleAggregate();
    const roleId = RoleId.generate();

    // 创建角色实体
    aggregate.role = RoleEntity.create(
      roleId,
      name,
      code,
      description,
      tenantId,
    );

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
    this.apply(new RoleNameChangedEvent(this.role.id, this.role.name, newName));
  }

  changeDescription(newDescription: string): void {
    if (this.role.description === newDescription) {
      return;
    }
    this.apply(
      new RoleDescriptionChangedEvent(
        this.role.id,
        this.role.description,
        newDescription,
      ),
    );
  }

  protected when(event: DomainEvent): void {
    if (event instanceof RoleCreatedEvent) {
      this.role = RoleEntity.create(
        new RoleId(event.roleId),
        event.name,
        event.code,
        event.description,
        event.tenantId,
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
        'Role code must start with uppercase letter and contain only uppercase letters, numbers and underscores',
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
    tenantId: string,
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
      tenantId,
    );

    // 应用业务规则
    aggregate.validatePermissionCode(code);

    // 产生领域事件
    aggregate.apply(
      new PermissionCreatedEvent(
        permissionId,
        name,
        code,
        resource,
        action,
        tenantId,
      ),
    );

    return aggregate;
  }

  changeResource(newResource: string): void {
    if (this.permission.resource === newResource) {
      return;
    }
    this.apply(
      new PermissionResourceChangedEvent(
        this.permission.id.toString(),
        this.permission.resource,
        newResource,
      ),
    );
  }

  changeAction(newAction: string): void {
    if (this.permission.action === newAction) {
      return;
    }
    this.apply(
      new PermissionActionChangedEvent(
        this.permission.id.toString(),
        this.permission.action,
        newAction,
      ),
    );
  }

  protected when(event: DomainEvent): void {
    if (event instanceof PermissionCreatedEvent) {
      this.permission = PermissionEntity.create(
        new PermissionId(event.permissionId),
        event.name,
        event.code,
        event.resource,
        event.action,
        event.tenantId,
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
        'Permission code must start with uppercase letter and contain only uppercase letters, numbers and underscores',
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
    dataPrivacyLevel: DataPrivacyLevel = DataPrivacyLevel.PROTECTED,
  ) {
    super(new Uuid(tenantId), DataIsolationLevel.TENANT, dataPrivacyLevel, id);
  }

  static create(
    id: RoleId,
    name: string,
    code: string,
    description: string,
    tenantId: string,
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
    dataPrivacyLevel: DataPrivacyLevel = DataPrivacyLevel.PROTECTED,
  ) {
    super(new Uuid(tenantId), DataIsolationLevel.TENANT, dataPrivacyLevel, id);
  }

  static create(
    id: PermissionId,
    name: string,
    code: string,
    resource: string,
    action: string,
    tenantId: string,
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
        event.eventData.newExpiresAt,
      );
    } else if (event instanceof SessionTerminatedEvent) {
      await this.sessionReadModel.updateStatus(
        event.eventData.sessionId,
        'TERMINATED',
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
      ],
    );
  }

  async updateName(roleId: string, name: string): Promise<void> {
    await this.dataSource.query(
      `UPDATE roles_read_model SET name = $1, updated_at = NOW() WHERE id = $2`,
      [name, roleId],
    );
  }

  async updateDescription(roleId: string, description: string): Promise<void> {
    await this.dataSource.query(
      `UPDATE roles_read_model SET description = $1, updated_at = NOW() WHERE id = $2`,
      [description, roleId],
    );
  }

  async findById(roleId: string): Promise<RoleDto | null> {
    const result = await this.dataSource.query(
      `SELECT * FROM roles_read_model WHERE id = $1`,
      [roleId],
    );
    return result.length > 0 ? this.mapToRoleDto(result[0]) : null;
  }

  async findByTenant(
    tenantId: string,
    page: number,
    size: number,
  ): Promise<RoleDto[]> {
    const offset = (page - 1) * size;
    const result = await this.dataSource.query(
      `SELECT * FROM roles_read_model WHERE tenant_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [tenantId, size, offset],
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
      ],
    );
  }

  async updateResource(permissionId: string, resource: string): Promise<void> {
    await this.dataSource.query(
      `UPDATE permissions_read_model SET resource = $1, updated_at = NOW() WHERE id = $2`,
      [resource, permissionId],
    );
  }

  async updateAction(permissionId: string, action: string): Promise<void> {
    await this.dataSource.query(
      `UPDATE permissions_read_model SET action = $1, updated_at = NOW() WHERE id = $2`,
      [action, permissionId],
    );
  }

  async findById(permissionId: string): Promise<PermissionDto | null> {
    const result = await this.dataSource.query(
      `SELECT * FROM permissions_read_model WHERE id = $1`,
      [permissionId],
    );
    return result.length > 0 ? this.mapToPermissionDto(result[0]) : null;
  }

  async findByTenant(
    tenantId: string,
    page: number,
    size: number,
  ): Promise<PermissionDto[]> {
    const offset = (page - 1) * size;
    const result = await this.dataSource.query(
      `SELECT * FROM permissions_read_model WHERE tenant_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [tenantId, size, offset],
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
```

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
        event.eventData.newName,
      );
    } else if (event instanceof RoleDescriptionChangedEvent) {
      await this.roleReadModel.updateDescription(
        event.eventData.roleId,
        event.eventData.newDescription,
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
        event.eventData.newResource,
      );
    } else if (event instanceof PermissionActionChangedEvent) {
      await this.permissionReadModel.updateAction(
        event.eventData.permissionId,
        event.eventData.newAction,
      );
    }
  }
}

// 审计日志投影
@Injectable()
export class AuditLogProjection implements Projection {
  constructor(private readonly auditService: AuditService) {}

  async handle(event: DomainEvent): Promise<void> {
    await this.auditService.logEvent(event);
  }
}
```

---

**文档版本**: v1.0.0  
**创建日期**: 2024-12-19  
**适用范围**: SAAS平台Clean Architecture设计指导
