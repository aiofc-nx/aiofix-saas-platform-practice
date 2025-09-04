# SAAS平台安全架构与数据隔离

## 🔐 安全架构与数据隔离设计

### 数据隔离策略

#### 4.1 多层级数据隔离

```
数据隔离层级：
┌─────────────────────────────────────────────────────────┐
│                    Platform Level                       │
│                 (平台级数据隔离)                         │
├─────────────────────────────────────────────────────────┤
│                     Tenant Level                        │
│                  (租户级数据隔离)                        │
├─────────────────────────────────────────────────────────┤
│                  Organization Level                     │
│                 (组织级数据隔离)                         │
├─────────────────────────────────────────────────────────┤
│                   Department Level                     │
│                  (部门级数据隔离)                        │
├─────────────────────────────────────────────────────────┤
│                     User Level                         │
│                   (用户级数据隔离)                       │
└─────────────────────────────────────────────────────────┘
```

#### 4.2 数据隐私级别

```
数据隐私级别：
1. PUBLIC（公开数据）
   - 可以被任何人访问
   - 适用于公开信息

2. SHARED（共享数据）
   - 可以在指定范围内共享
   - 适用于内部共享信息

3. PROTECTED（受保护数据）
   - 需要特定权限才能访问
   - 适用于敏感信息

4. PRIVATE（私有数据）
   - 只有所有者可以访问
   - 适用于个人隐私信息
```

### 数据隔离与访问控制架构

#### 数据隔离级别

```typescript
export enum DataIsolationLevel {
  /** 平台级隔离 */
  PLATFORM = 'platform',
  /** 租户级隔离 */
  TENANT = 'tenant',
  /** 组织级隔离 */
  ORGANIZATION = 'organization',
  /** 部门级隔离 */
  DEPARTMENT = 'department',
  /** 子部门级隔离 */
  SUB_DEPARTMENT = 'sub_department',
  /** 用户级隔离 */
  USER = 'user',
}

export enum DataPrivacyLevel {
  /** 可共享 */
  SHARED = 'shared',
  /** 受保护 */
  PROTECTED = 'protected',
}
```

#### 数据隔离层次结构

```
平台 (Platform)
├── 平台级数据 (Platform Data)
│   ├── 可共享数据 (Shared Data)
│   │   ├── 平台公告
│   │   ├── 系统通知
│   │   ├── 公共API文档
│   │   └── 平台版本信息
│   └── 受保护数据 (Protected Data)
│       ├── 平台配置
│       ├── 系统日志
│       ├── 管理员数据
│       └── 系统维护配置
└── 租户 (Tenant)
    ├── 租户级数据 (Tenant Data)
    │   ├── 可共享数据 (Shared Data)
    │   └── 受保护数据 (Protected Data)
    ├── 组织 (Organization)
    │   ├── 组织级数据 (Organization Data)
    │   │   ├── 可共享数据 (Shared Data)
    │   │   └── 受保护数据 (Protected Data)
    │   ├── 部门 (Department)
    │   │   ├── 部门级数据 (Department Data)
    │   │   │   ├── 可共享数据 (Shared Data)
    │   │   │   └── 受保护数据 (Protected Data)
    │   │   └── 子部门 (Sub-Department)
    │   │       └── 子部门级数据 (Sub-Department Data)
    │   └── 用户级数据 (User Data)
    │       ├── 可共享数据 (Shared Data)
    │       └── 受保护数据 (Protected Data)
    └── 用户级数据 (User Data)
        ├── 可共享数据 (Shared Data)
        └── 受保护数据 (Protected Data)
```

#### 实体基类设计

```typescript
// 平台感知实体基类
export abstract class PlatformAwareEntity extends BaseEntity {
  protected _dataPrivacyLevel: DataPrivacyLevel;

  constructor(
    id?: Uuid,
    dataPrivacyLevel: DataPrivacyLevel = DataPrivacyLevel.PROTECTED,
  ) {
    super(id ?? Uuid.generate());
    this._dataPrivacyLevel = dataPrivacyLevel;
  }

  public canAccess(target: PlatformAwareEntity): boolean {
    try {
      // 如果目标对象是可共享数据，则允许访问
      if (target._dataPrivacyLevel === DataPrivacyLevel.SHARED) {
        return true;
      }

      // 如果目标对象是受保护数据，则需要平台管理员权限
      if (target._dataPrivacyLevel === DataPrivacyLevel.PROTECTED) {
        return this.isPlatformAdmin();
      }

      return false;
    } catch {
      return false;
    }
  }

  protected abstract isPlatformAdmin(): boolean;

  public isSharedData(): boolean {
    return this._dataPrivacyLevel === DataPrivacyLevel.SHARED;
  }

  public isProtectedData(): boolean {
    return this._dataPrivacyLevel === DataPrivacyLevel.PROTECTED;
  }

  protected assertPlatformAccess(target: PlatformAwareEntity): void {
    if (!this.canAccess(target)) {
      throw new PlatformAccessDeniedError(
        `平台级访问被拒绝: 目标对象隐私级别为${target._dataPrivacyLevel}`,
      );
    }
  }
}

// 数据隔离感知实体基类
export abstract class DataIsolationAwareEntity extends BaseEntity {
  protected readonly _tenantId: Uuid;
  protected _organizationId?: Uuid;
  protected _departmentIds: Uuid[] = [];
  protected _userId?: Uuid;
  protected _dataIsolationLevel: DataIsolationLevel;
  protected _dataPrivacyLevel: DataPrivacyLevel;

  constructor(
    tenantId: Uuid,
    dataIsolationLevel: DataIsolationLevel = DataIsolationLevel.TENANT,
    dataPrivacyLevel: DataPrivacyLevel = DataPrivacyLevel.PROTECTED,
    id?: Uuid,
    organizationId?: Uuid,
    departmentIds: Uuid[] = [],
    userId?: Uuid,
  ) {
    super(id ?? Uuid.generate());
    this._tenantId = tenantId;
    this._dataIsolationLevel = dataIsolationLevel;
    this._dataPrivacyLevel = dataPrivacyLevel;
    this._organizationId = organizationId;
    this._departmentIds = [...departmentIds];
    this._userId = userId;
  }

  public canAccess(target: DataIsolationAwareEntity): boolean {
    try {
      // 平台级数据访问控制
      if (target._dataIsolationLevel === DataIsolationLevel.PLATFORM) {
        return this.canAccessPlatformData(target);
      }

      // 用户级数据访问控制（跨层级存在）
      if (target._dataIsolationLevel === DataIsolationLevel.USER) {
        return this.canAccessUserData(target);
      }

      // 其他级别的访问控制
      return this.canAccessByLevel(target, target._dataIsolationLevel);
    } catch {
      return false;
    }
  }

  private canAccessPlatformData(target: DataIsolationAwareEntity): boolean {
    if (target._dataPrivacyLevel === DataPrivacyLevel.SHARED) {
      return true; // 可共享的平台数据，所有用户都可访问
    }
    return this.isPlatformAdmin();
  }

  private canAccessUserData(target: DataIsolationAwareEntity): boolean {
    if (target._dataPrivacyLevel === DataPrivacyLevel.SHARED) {
      return this.isInSameOrganization(target);
    }
    return this._userId?.equals(target._userId) ?? false;
  }

  private canAccessByLevel(
    target: DataIsolationAwareEntity,
    level: DataIsolationLevel,
  ): boolean {
    // 首先检查租户是否匹配
    if (!this._tenantId.equals(target.tenantId)) {
      return false;
    }

    // 如果目标对象是租户级公共数据，则允许访问
    if (target._dataIsolationLevel === DataIsolationLevel.TENANT) {
      return true;
    }

    switch (level) {
      case DataIsolationLevel.TENANT:
        return true; // 租户级访问允许访问所有同租户数据
      case DataIsolationLevel.ORGANIZATION:
        this.assertSameOrganization(target);
        return true;
      case DataIsolationLevel.DEPARTMENT:
        this.assertSameDepartment(target);
        return true;
      case DataIsolationLevel.SUB_DEPARTMENT:
        this.assertSameDepartment(target);
        return true;
      default:
        return false;
    }
  }

  protected assertSameTenant(other: DataIsolationAwareEntity): void {
    if (!this._tenantId.equals(other.tenantId)) {
      throw new TenantAccessDeniedError(
        `操作禁止: 实体属于租户${this._tenantId.toString()}，目标属于${other.tenantId.toString()}`,
      );
    }
  }

  protected assertSameOrganization(other: DataIsolationAwareEntity): void {
    this.assertSameTenant(other);
    if (this._organizationId && other.organizationId) {
      if (!this._organizationId.equals(other.organizationId)) {
        throw new TenantAccessDeniedError(
          `操作禁止: 实体属于组织${this._organizationId.toString()}，目标属于${other.organizationId.toString()}`,
        );
      }
    }
  }

  protected assertSameDepartment(other: DataIsolationAwareEntity): void {
    this.assertSameOrganization(other);
    const commonDepartments = this._departmentIds.filter(deptId =>
      other.departmentIds.some(otherDeptId => deptId.equals(otherDeptId)),
    );
    if (commonDepartments.length === 0) {
      throw new TenantAccessDeniedError(
        `操作禁止: 实体与目标对象没有共同的部门归属`,
      );
    }
  }
}
```

#### 数据隔离实现示例

```typescript
// 用户实体 - 支持跨层级存在
export class User extends DataIsolationAwareEntity {
  private _username: string;
  private _email: string;
  private _status: UserStatus;

  constructor(
    tenantId: Uuid,
    username: string,
    email: string,
    organizationId?: Uuid,
    departmentIds: Uuid[] = [],
    dataPrivacyLevel: DataPrivacyLevel = DataPrivacyLevel.PROTECTED,
    id?: Uuid,
  ) {
    super(
      tenantId,
      DataIsolationLevel.USER,
      dataPrivacyLevel,
      id,
      organizationId,
      departmentIds,
      id, // userId 与实体ID相同
    );
    this._username = username;
    this._email = email;
    this._status = UserStatus.ACTIVE;
  }

  // 静态工厂方法 - 创建租户级用户（无组织归属）
  static createTenantUser(
    tenantId: Uuid,
    username: string,
    email: string,
  ): User {
    return new User(tenantId, username, email);
  }

  // 静态工厂方法 - 创建组织级用户
  static createOrganizationUser(
    tenantId: Uuid,
    username: string,
    email: string,
    organizationId: Uuid,
  ): User {
    return new User(tenantId, username, email, organizationId);
  }

  // 静态工厂方法 - 创建部门级用户
  static createDepartmentUser(
    tenantId: Uuid,
    username: string,
    email: string,
    organizationId: Uuid,
    departmentIds: Uuid[],
  ): User {
    return new User(tenantId, username, email, organizationId, departmentIds);
  }
}

// 组织实体 - 组织级隔离
export class Organization extends DataIsolationAwareEntity {
  private _name: string;
  private _code: string;
  private _status: OrganizationStatus;

  constructor(
    tenantId: Uuid,
    name: string,
    code: string,
    dataPrivacyLevel: DataPrivacyLevel = DataPrivacyLevel.PROTECTED,
    id?: Uuid,
  ) {
    super(
      tenantId,
      DataIsolationLevel.ORGANIZATION,
      dataPrivacyLevel,
      id,
      id, // organizationId 与实体ID相同
    );
    this._name = name;
    this._code = code;
    this._status = OrganizationStatus.ACTIVE;
  }
}

// 部门实体 - 部门级隔离
export class Department extends DataIsolationAwareEntity {
  private _name: string;
  private _code: string;
  private _parentId?: Uuid;
  private _level: number;
  private _status: DepartmentStatus;

  constructor(
    tenantId: Uuid,
    organizationId: Uuid,
    name: string,
    code: string,
    level: number = 1,
    parentId?: Uuid,
    dataPrivacyLevel: DataPrivacyLevel = DataPrivacyLevel.PROTECTED,
    id?: Uuid,
  ) {
    super(
      tenantId,
      DataIsolationLevel.DEPARTMENT,
      dataPrivacyLevel,
      id,
      organizationId,
      [id!], // departmentIds 包含当前部门ID
    );
    this._name = name;
    this._code = code;
    this._parentId = parentId;
    this._level = level;
    this._status = DepartmentStatus.ACTIVE;
  }
}

// 租户配置实体 - 租户级公共数据
export class TenantConfiguration extends DataIsolationAwareEntity {
  private _settings: Record<string, unknown> = {};

  constructor(
    tenantId: Uuid,
    dataPrivacyLevel: DataPrivacyLevel = DataPrivacyLevel.SHARED,
    id?: Uuid,
  ) {
    super(tenantId, DataIsolationLevel.TENANT, dataPrivacyLevel, id);
  }

  getSetting(key: string): unknown {
    return this._settings[key];
  }

  setSetting(key: string, value: unknown): void {
    this._settings[key] = value;
    this.updateTimestamp();
  }
}

// 平台配置实体 - 平台级数据
export class PlatformConfiguration extends PlatformAwareEntity {
  private readonly _key: string;
  private _value: unknown;
  private readonly _category: string;
  private readonly _isSystem: boolean;

  constructor(
    key: string,
    value: unknown,
    category: string,
    isSystem: boolean = false,
    dataPrivacyLevel: DataPrivacyLevel = DataPrivacyLevel.PROTECTED,
    id?: Uuid,
  ) {
    super(id, dataPrivacyLevel);
    this._key = key;
    this._value = value;
    this._category = category;
    this._isSystem = isSystem;
  }

  override isPlatformAdmin(): boolean {
    // 实现平台管理员权限检查逻辑
    return false;
  }
}
```

### 认证架构

#### JWT Token 设计

```typescript
interface JWTPayload {
  sub: string; // 用户ID
  tenantId: string; // 租户ID
  orgIds: string[]; // 组织ID列表
  deptIds: string[]; // 部门ID列表
  roles: string[]; // 角色列表
  permissions: string[]; // 权限列表
  iat: number; // 签发时间
  exp: number; // 过期时间
  jti: string; // JWT ID
}
```

#### 多因子认证

```typescript
interface MFAConfig {
  type: 'TOTP' | 'SMS' | 'EMAIL';
  enabled: boolean;
  backupCodes: string[];
  lastUsed: Date;
}
```

### 权限控制架构

#### RBAC + ABAC + 数据隔离混合模型

```typescript
interface Permission {
  resource: string; // 资源标识
  action: string; // 操作类型
  conditions: Condition[]; // 访问条件
  isolationLevel: DataIsolationLevel; // 数据隔离级别
  privacyLevel: DataPrivacyLevel; // 隐私级别
}

interface Condition {
  attribute: string; // 属性名
  operator: string; // 操作符
  value: any; // 属性值
}

// 权限检查服务
@Injectable()
export class PermissionService {
  constructor(
    private readonly dataAccessControlService: DataAccessControlService,
    private readonly userRepository: UserRepository,
    private readonly permissionRepository: PermissionRepository,
  ) {}

  async checkPermission(
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

    // 2. 获取用户权限
    const permissions = await this.permissionRepository.findUserPermissions(
      userId,
      user.tenantId,
    );

    // 3. 检查权限
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

  async checkDataAccess(
    userId: string,
    targetEntity: DataIsolationAwareEntity,
  ): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      return false;
    }

    return user.canAccess(targetEntity);
  }
}
```

### 数据安全架构

#### 数据隔离策略

- **平台级隔离**: 系统级别隔离，只有平台管理员可访问
- **租户级隔离**: 数据库级别隔离，确保租户间数据完全隔离
- **组织级隔离**: 应用级别隔离，组织间数据隔离
- **部门级隔离**: 数据级别隔离，部门间数据隔离
- **子部门级隔离**: 细粒度数据隔离，子部门间数据隔离
- **用户级隔离**: 行级别隔离，用户间数据隔离

#### 数据访问控制策略

- **隐私级别控制**: 基于 `DataPrivacyLevel` 的访问控制
  - **可共享数据**: 同级别内所有成员可访问
  - **受保护数据**: 需要特定权限才能访问
- **跨层级访问控制**: 支持从高级别向低级别的访问控制
- **用户级数据跨层级**: 用户级数据可以存在于任何组织层级下，但访问控制基于用户身份

#### 4.14 个人数据与部门数据访问控制机制

##### 4.14.1 数据分类定义

```typescript
export enum DataOwnershipType {
  /** 个人数据 - 用户创建和拥有的数据 */
  PERSONAL = 'personal',
  /** 部门数据 - 部门内部共享的数据 */
  DEPARTMENT = 'department',
  /** 组织数据 - 组织内部共享的数据 */
  ORGANIZATION = 'organization',
  /** 租户数据 - 租户内部共享的数据 */
  TENANT = 'tenant',
  /** 平台数据 - 平台级共享的数据 */
  PLATFORM = 'platform',
}

export enum DataAccessScope {
  /** 私有访问 - 只有所有者可以访问 */
  PRIVATE = 'private',
  /** 部门访问 - 部门内成员可以访问 */
  DEPARTMENT = 'department',
  /** 组织访问 - 组织内成员可以访问 */
  ORGANIZATION = 'organization',
  /** 租户访问 - 租户内成员可以访问 */
  TENANT = 'tenant',
  /** 平台访问 - 平台内所有用户都可以访问 */
  PLATFORM = 'platform',
}
```

##### 4.14.2 数据访问控制实体设计

```typescript
// 数据访问控制实体基类
export abstract class DataAccessControlledEntity extends DataIsolationAwareEntity {
  protected _dataOwnershipType: DataOwnershipType;
  protected _dataAccessScope: DataAccessScope;
  protected _ownerId: Uuid;
  protected _sharedWithUsers: Uuid[] = [];
  protected _sharedWithDepartments: Uuid[] = [];
  protected _sharedWithOrganizations: Uuid[] = [];

  constructor(
    tenantId: Uuid,
    dataIsolationLevel: DataIsolationLevel,
    dataPrivacyLevel: DataPrivacyLevel,
    dataOwnershipType: DataOwnershipType,
    dataAccessScope: DataAccessScope,
    ownerId: Uuid,
    id?: Uuid,
    organizationId?: Uuid,
    departmentIds: Uuid[] = [],
    userId?: Uuid,
  ) {
    super(
      tenantId,
      dataIsolationLevel,
      dataPrivacyLevel,
      id,
      organizationId,
      departmentIds,
      userId,
    );
    this._dataOwnershipType = dataOwnershipType;
    this._dataAccessScope = dataAccessScope;
    this._ownerId = ownerId;
  }

  /**
   * 检查用户是否可以访问此实体
   * @param user 请求访问的用户
   * @returns 是否允许访问
   */
  public canAccess(user: DataIsolationAwareEntity): boolean {
    // 1. 基础数据隔离检查
    if (!super.canAccess(user)) {
      return false;
    }

    // 2. 所有者检查
    if (this._ownerId.equals(user.id)) {
      return true;
    }

    // 3. 数据访问范围检查
    switch (this._dataAccessScope) {
      case DataAccessScope.PRIVATE:
        return false; // 私有数据只有所有者可以访问

      case DataAccessScope.DEPARTMENT:
        return this.canAccessByDepartment(user);

      case DataAccessScope.ORGANIZATION:
        return this.canAccessByOrganization(user);

      case DataAccessScope.TENANT:
        return this.canAccessByTenant(user);

      case DataAccessScope.PLATFORM:
        return true; // 平台级数据所有用户都可以访问

      default:
        return false;
    }
  }

  /**
   * 部门级访问控制
   */
  private canAccessByDepartment(user: DataIsolationAwareEntity): boolean {
    // 检查用户是否在共享部门列表中
    if (this._sharedWithDepartments.length > 0) {
      const userDepartments = user.departmentIds || [];
      return this._sharedWithDepartments.some(deptId =>
        userDepartments.some(userDeptId => deptId.equals(userDeptId)),
      );
    }

    // 如果没有指定共享部门，检查用户是否与所有者在同一部门
    if (this._organizationId && user.organizationId) {
      if (!this._organizationId.equals(user.organizationId)) {
        return false;
      }

      const userDepartments = user.departmentIds || [];
      const ownerDepartments = this._departmentIds || [];

      return userDepartments.some(userDeptId =>
        ownerDepartments.some(ownerDeptId => userDeptId.equals(ownerDeptId)),
      );
    }

    return false;
  }

  /**
   * 组织级访问控制
   */
  private canAccessByOrganization(user: DataIsolationAwareEntity): boolean {
    // 检查用户是否在共享组织列表中
    if (this._sharedWithOrganizations.length > 0) {
      return this._sharedWithOrganizations.some(
        orgId => user.organizationId && orgId.equals(user.organizationId),
      );
    }

    // 如果没有指定共享组织，检查用户是否与所有者在同一组织
    return (
      this._organizationId &&
      user.organizationId &&
      this._organizationId.equals(user.organizationId)
    );
  }

  /**
   * 租户级访问控制
   */
  private canAccessByTenant(user: DataIsolationAwareEntity): boolean {
    // 租户级数据，同租户内所有用户都可以访问
    return this._tenantId.equals(user.tenantId);
  }

  /**
   * 共享数据给指定用户
   */
  public shareWithUser(userId: Uuid): void {
    if (!this._sharedWithUsers.some(id => id.equals(userId))) {
      this._sharedWithUsers.push(userId);
    }
  }

  /**
   * 共享数据给指定部门
   */
  public shareWithDepartment(departmentId: Uuid): void {
    if (!this._sharedWithDepartments.some(id => id.equals(departmentId))) {
      this._sharedWithDepartments.push(departmentId);
    }
  }

  /**
   * 共享数据给指定组织
   */
  public shareWithOrganization(organizationId: Uuid): void {
    if (!this._sharedWithOrganizations.some(id => id.equals(organizationId))) {
      this._sharedWithOrganizations.push(organizationId);
    }
  }

  /**
   * 撤销用户访问权限
   */
  public revokeUserAccess(userId: Uuid): void {
    this._sharedWithUsers = this._sharedWithUsers.filter(
      id => !id.equals(userId),
    );
  }

  /**
   * 撤销部门访问权限
   */
  public revokeDepartmentAccess(departmentId: Uuid): void {
    this._sharedWithDepartments = this._sharedWithDepartments.filter(
      id => !id.equals(departmentId),
    );
  }

  /**
   * 撤销组织访问权限
   */
  public revokeOrganizationAccess(organizationId: Uuid): void {
    this._sharedWithOrganizations = this._sharedWithOrganizations.filter(
      id => !id.equals(organizationId),
    );
  }

  // Getters
  get dataOwnershipType(): DataOwnershipType {
    return this._dataOwnershipType;
  }

  get dataAccessScope(): DataAccessScope {
    return this._dataAccessScope;
  }

  get ownerId(): Uuid {
    return this._ownerId;
  }

  get sharedWithUsers(): Uuid[] {
    return [...this._sharedWithUsers];
  }

  get sharedWithDepartments(): Uuid[] {
    return [...this._sharedWithDepartments];
  }

  get sharedWithOrganizations(): Uuid[] {
    return [...this._sharedWithOrganizations];
  }
}
```

##### 4.14.3 业务实体实现示例

```typescript
// 个人数据实体 - 用户创建和拥有的数据
export class PersonalDocument extends DataAccessControlledEntity {
  private _title: string;
  private _content: string;
  private _tags: string[] = [];
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(
    tenantId: Uuid,
    ownerId: Uuid,
    title: string,
    content: string,
    organizationId?: Uuid,
    departmentIds: Uuid[] = [],
    id?: Uuid,
  ) {
    super(
      tenantId,
      DataIsolationLevel.USER,
      DataPrivacyLevel.PROTECTED,
      DataOwnershipType.PERSONAL,
      DataAccessScope.PRIVATE, // 默认私有访问
      ownerId,
      id,
      organizationId,
      departmentIds,
      ownerId,
    );
    this._title = title;
    this._content = content;
    this._createdAt = new Date();
    this._updatedAt = new Date();
  }

  /**
   * 共享文档给指定用户
   */
  shareWithUser(userId: Uuid): void {
    super.shareWithUser(userId);
    this._dataAccessScope = DataAccessScope.PRIVATE; // 保持私有，但允许特定用户访问
  }

  /**
   * 共享文档给部门
   */
  shareWithDepartment(departmentId: Uuid): void {
    super.shareWithDepartment(departmentId);
    this._dataAccessScope = DataAccessScope.DEPARTMENT;
  }

  /**
   * 共享文档给组织
   */
  shareWithOrganization(organizationId: Uuid): void {
    super.shareWithOrganization(organizationId);
    this._dataAccessScope = DataAccessScope.ORGANIZATION;
  }

  /**
   * 发布为租户级文档
   */
  publishToTenant(): void {
    this._dataAccessScope = DataAccessScope.TENANT;
    this._dataOwnershipType = DataOwnershipType.TENANT;
  }

  // Getters
  get title(): string {
    return this._title;
  }

  get content(): string {
    return this._content;
  }

  get tags(): string[] {
    return [...this._tags];
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }
}

// 部门数据实体 - 部门内部共享的数据
export class DepartmentProject extends DataAccessControlledEntity {
  private _name: string;
  private _description: string;
  private _status: ProjectStatus;
  private _startDate: Date;
  private _endDate?: Date;
  private _teamMembers: Uuid[] = [];
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(
    tenantId: Uuid,
    organizationId: Uuid,
    departmentIds: Uuid[],
    ownerId: Uuid,
    name: string,
    description: string,
    id?: Uuid,
  ) {
    super(
      tenantId,
      DataIsolationLevel.DEPARTMENT,
      DataPrivacyLevel.PROTECTED,
      DataOwnershipType.DEPARTMENT,
      DataAccessScope.DEPARTMENT, // 部门内共享
      ownerId,
      id,
      organizationId,
      departmentIds,
      ownerId,
    );
    this._name = name;
    this._description = description;
    this._status = ProjectStatus.PLANNING;
    this._startDate = new Date();
    this._createdAt = new Date();
    this._updatedAt = new Date();
  }

  /**
   * 添加团队成员
   */
  addTeamMember(userId: Uuid): void {
    if (!this._teamMembers.some(id => id.equals(userId))) {
      this._teamMembers.push(userId);
    }
  }

  /**
   * 移除团队成员
   */
  removeTeamMember(userId: Uuid): void {
    this._teamMembers = this._teamMembers.filter(id => !id.equals(userId));
  }

  /**
   * 扩展项目到其他部门
   */
  extendToDepartments(departmentIds: Uuid[]): void {
    departmentIds.forEach(deptId => {
      if (!this._departmentIds.some(id => id.equals(deptId))) {
        this._departmentIds.push(deptId);
      }
    });
  }

  /**
   * 扩展项目到组织级
   */
  extendToOrganization(): void {
    this._dataAccessScope = DataAccessScope.ORGANIZATION;
    this._dataOwnershipType = DataOwnershipType.ORGANIZATION;
  }

  // Getters
  get name(): string {
    return this._name;
  }

  get description(): string {
    return this._description;
  }

  get status(): ProjectStatus {
    return this._status;
  }

  get startDate(): Date {
    return this._startDate;
  }

  get endDate(): Date | undefined {
    return this._endDate;
  }

  get teamMembers(): Uuid[] {
    return [...this._teamMembers];
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }
}

// 组织数据实体 - 组织内部共享的数据
export class OrganizationPolicy extends DataAccessControlledEntity {
  private _name: string;
  private _content: string;
  private _category: PolicyCategory;
  private _version: string;
  private _effectiveDate: Date;
  private _expiryDate?: Date;
  private _approvalStatus: ApprovalStatus;
  private _approvedBy?: Uuid;
  private _approvedAt?: Date;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(
    tenantId: Uuid,
    organizationId: Uuid,
    ownerId: Uuid,
    name: string,
    content: string,
    category: PolicyCategory,
    id?: Uuid,
  ) {
    super(
      tenantId,
      DataIsolationLevel.ORGANIZATION,
      DataPrivacyLevel.PROTECTED,
      DataOwnershipType.ORGANIZATION,
      DataAccessScope.ORGANIZATION, // 组织内共享
      ownerId,
      id,
      organizationId,
      [],
      ownerId,
    );
    this._name = name;
    this._content = content;
    this._category = category;
    this._version = '1.0.0';
    this._effectiveDate = new Date();
    this._approvalStatus = ApprovalStatus.DRAFT;
    this._createdAt = new Date();
    this._updatedAt = new Date();
  }

  /**
   * 提交审批
   */
  submitForApproval(): void {
    this._approvalStatus = ApprovalStatus.PENDING;
    this._updatedAt = new Date();
  }

  /**
   * 审批通过
   */
  approve(approverId: Uuid): void {
    this._approvalStatus = ApprovalStatus.APPROVED;
    this._approvedBy = approverId;
    this._approvedAt = new Date();
    this._updatedAt = new Date();
  }

  /**
   * 审批拒绝
   */
  reject(reason: string): void {
    this._approvalStatus = ApprovalStatus.REJECTED;
    this._updatedAt = new Date();
  }

  /**
   * 发布到租户级
   */
  publishToTenant(): void {
    this._dataAccessScope = DataAccessScope.TENANT;
    this._dataOwnershipType = DataOwnershipType.TENANT;
    this._updatedAt = new Date();
  }

  // Getters
  get name(): string {
    return this._name;
  }

  get content(): string {
    return this._content;
  }

  get category(): PolicyCategory {
    return this._category;
  }

  get version(): string {
    return this._version;
  }

  get effectiveDate(): Date {
    return this._effectiveDate;
  }

  get expiryDate(): Date | undefined {
    return this._expiryDate;
  }

  get approvalStatus(): ApprovalStatus {
    return this._approvalStatus;
  }

  get approvedBy(): Uuid | undefined {
    return this._approvedBy;
  }

  get approvedAt(): Date | undefined {
    return this._approvedAt;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }
}
```

##### 4.14.4 数据访问控制服务

```typescript
// 数据访问控制服务
@Injectable()
export class DataAccessControlService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly organizationRepository: OrganizationRepository,
    private readonly departmentRepository: DepartmentRepository,
    private readonly cacheService: CacheService,
  ) {}

  /**
   * 检查用户对指定实体的访问权限
   */
  async checkDataAccess(
    userId: string,
    targetEntity: DataAccessControlledEntity,
  ): Promise<boolean> {
    // 1. 从缓存获取用户信息
    const cacheKey = `user:${userId}:access_control`;
    let user = await this.cacheService.get(cacheKey);

    if (!user) {
      user = await this.userRepository.findById(userId);
      if (!user) {
        return false;
      }
      // 缓存用户信息5分钟
      await this.cacheService.set(cacheKey, user, 300);
    }

    // 2. 基础数据隔离检查
    if (!user.canAccess(targetEntity)) {
      return false;
    }

    // 3. 数据访问控制检查
    return targetEntity.canAccess(user);
  }

  /**
   * 获取用户可以访问的个人数据
   */
  async getAccessiblePersonalData(
    userId: string,
    ownerId?: string,
    page: number = 1,
    size: number = 20,
  ): Promise<PaginatedResponse<PersonalDocument>> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException(userId);
    }

    // 构建查询条件
    const conditions: any = {
      tenantId: user.tenantId,
      $or: [
        { ownerId: userId }, // 自己创建的数据
        { sharedWithUsers: userId }, // 共享给自己的数据
      ],
    };

    // 如果指定了所有者，添加所有者条件
    if (ownerId) {
      conditions.ownerId = ownerId;
    }

    // 添加部门和组织访问条件
    if (user.organizationId) {
      conditions.$or.push({
        sharedWithOrganizations: user.organizationId,
      });
    }

    if (user.departmentIds && user.departmentIds.length > 0) {
      conditions.$or.push({
        sharedWithDepartments: { $in: user.departmentIds },
      });
    }

    return this.personalDocumentRepository.findByConditions(
      conditions,
      page,
      size,
    );
  }

  /**
   * 获取用户可以访问的部门数据
   */
  async getAccessibleDepartmentData(
    userId: string,
    departmentId?: string,
    page: number = 1,
    size: number = 20,
  ): Promise<PaginatedResponse<DepartmentProject>> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException(userId);
    }

    // 构建查询条件
    const conditions: any = {
      tenantId: user.tenantId,
      $or: [
        { ownerId: userId }, // 自己创建的数据
        { sharedWithUsers: userId }, // 共享给自己的数据
      ],
    };

    // 如果指定了部门，添加部门条件
    if (departmentId) {
      conditions.departmentIds = departmentId;
    } else {
      // 如果没有指定部门，查询用户所在部门的数据
      if (user.departmentIds && user.departmentIds.length > 0) {
        conditions.departmentIds = { $in: user.departmentIds };
      }
    }

    // 添加组织访问条件
    if (user.organizationId) {
      conditions.$or.push({
        sharedWithOrganizations: user.organizationId,
      });
    }

    return this.departmentProjectRepository.findByConditions(
      conditions,
      page,
      size,
    );
  }

  /**
   * 获取用户可以访问的组织数据
   */
  async getAccessibleOrganizationData(
    userId: string,
    organizationId?: string,
    page: number = 1,
    size: number = 20,
  ): Promise<PaginatedResponse<OrganizationPolicy>> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException(userId);
    }

    // 构建查询条件
    const conditions: any = {
      tenantId: user.tenantId,
      $or: [
        { ownerId: userId }, // 自己创建的数据
        { sharedWithUsers: userId }, // 共享给自己的数据
      ],
    };

    // 如果指定了组织，添加组织条件
    if (organizationId) {
      conditions.organizationId = organizationId;
    } else {
      // 如果没有指定组织，查询用户所在组织的数据
      if (user.organizationId) {
        conditions.organizationId = user.organizationId;
      }
    }

    return this.organizationPolicyRepository.findByConditions(
      conditions,
      page,
      size,
    );
  }

  /**
   * 检查用户是否有权限共享数据
   */
  async canShareData(
    userId: string,
    targetEntity: DataAccessControlledEntity,
  ): Promise<boolean> {
    // 1. 检查是否是数据所有者
    if (targetEntity.ownerId.equals(userId)) {
      return true;
    }

    // 2. 检查是否有共享权限
    const user = await this.userRepository.findById(userId);
    if (!user) {
      return false;
    }

    // 3. 检查用户权限
    return this.checkUserPermission(user, 'data', 'share', targetEntity);
  }

  /**
   * 共享数据给指定用户
   */
  async shareDataWithUser(
    userId: string,
    targetEntity: DataAccessControlledEntity,
    targetUserId: string,
  ): Promise<void> {
    // 检查权限
    if (!(await this.canShareData(userId, targetEntity))) {
      throw new AccessDeniedException('没有权限共享此数据');
    }

    // 执行共享
    targetEntity.shareWithUser(new Uuid(targetUserId));

    // 保存实体
    await this.saveEntity(targetEntity);

    // 记录审计日志
    await this.auditService.logDataSharing(
      userId,
      targetEntity.id.toString(),
      'USER',
      targetUserId,
    );
  }

  /**
   * 共享数据给指定部门
   */
  async shareDataWithDepartment(
    userId: string,
    targetEntity: DataAccessControlledEntity,
    departmentId: string,
  ): Promise<void> {
    // 检查权限
    if (!(await this.canShareData(userId, targetEntity))) {
      throw new AccessDeniedException('没有权限共享此数据');
    }

    // 执行共享
    targetEntity.shareWithDepartment(new Uuid(departmentId));

    // 保存实体
    await this.saveEntity(targetEntity);

    // 记录审计日志
    await this.auditService.logDataSharing(
      userId,
      targetEntity.id.toString(),
      'DEPARTMENT',
      departmentId,
    );
  }

  /**
   * 撤销数据访问权限
   */
  async revokeDataAccess(
    userId: string,
    targetEntity: DataAccessControlledEntity,
    targetType: 'USER' | 'DEPARTMENT' | 'ORGANIZATION',
    targetId: string,
  ): Promise<void> {
    // 检查权限
    if (!(await this.canShareData(userId, targetEntity))) {
      throw new AccessDeniedException('没有权限撤销此数据的访问权限');
    }

    // 执行撤销
    switch (targetType) {
      case 'USER':
        targetEntity.revokeUserAccess(new Uuid(targetId));
        break;
      case 'DEPARTMENT':
        targetEntity.revokeDepartmentAccess(new Uuid(targetId));
        break;
      case 'ORGANIZATION':
        targetEntity.revokeOrganizationAccess(new Uuid(targetId));
        break;
    }

    // 保存实体
    await this.saveEntity(targetEntity);

    // 记录审计日志
    await this.auditService.logDataAccessRevocation(
      userId,
      targetEntity.id.toString(),
      targetType,
      targetId,
    );
  }

  /**
   * 获取数据访问权限列表
   */
  async getDataAccessPermissions(
    entityId: string,
  ): Promise<DataAccessPermissions> {
    const entity = await this.getEntityById(entityId);
    if (!entity) {
      throw new EntityNotFoundException(entityId);
    }

    return {
      ownerId: entity.ownerId.toString(),
      dataOwnershipType: entity.dataOwnershipType,
      dataAccessScope: entity.dataAccessScope,
      sharedWithUsers: entity.sharedWithUsers.map(id => id.toString()),
      sharedWithDepartments: entity.sharedWithDepartments.map(id =>
        id.toString(),
      ),
      sharedWithOrganizations: entity.sharedWithOrganizations.map(id =>
        id.toString(),
      ),
    };
  }

  private async checkUserPermission(
    user: User,
    resource: string,
    action: string,
    targetEntity?: DataAccessControlledEntity,
  ): Promise<boolean> {
    // 实现用户权限检查逻辑
    // 这里可以集成现有的权限系统
    return true; // 简化实现
  }

  private async saveEntity(entity: DataAccessControlledEntity): Promise<void> {
    // 根据实体类型保存到对应的仓储
    // 这里需要根据实际实现调整
  }

  private async getEntityById(
    entityId: string,
  ): Promise<DataAccessControlledEntity | null> {
    // 根据实体ID获取实体
    // 这里需要根据实际实现调整
    return null;
  }
}

// 数据访问权限信息
interface DataAccessPermissions {
  ownerId: string;
  dataOwnershipType: DataOwnershipType;
  dataAccessScope: DataAccessScope;
  sharedWithUsers: string[];
  sharedWithDepartments: string[];
  sharedWithOrganizations: string[];
}

// 枚举定义
export enum ProjectStatus {
  PLANNING = 'planning',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ON_HOLD = 'on_hold',
  CANCELLED = 'cancelled',
}

export enum PolicyCategory {
  HR = 'hr',
  FINANCE = 'finance',
  IT = 'it',
  SECURITY = 'security',
  COMPLIANCE = 'compliance',
  OPERATIONS = 'operations',
}

export enum ApprovalStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}
```

---

**文档版本**: v1.0.0  
**创建日期**: 2024-12-19  
**适用范围**: SAAS平台安全架构与数据隔离设计指导
