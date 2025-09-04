# SAAS平台数据模型与GraphQL

## 🗄️ 数据模型与GraphQL设计

### 核心实体关系

#### 实体关系图

```
┌─────────────────────────────────────────────────────────────┐
│                    Platform                                │
│                 (平台级实体)                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Platform    │  │ Platform    │  │ Platform    │        │
│  │ Config      │  │ User        │  │ Policy      │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Tenant                                 │
│                  (租户级实体)                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Tenant      │  │ Tenant      │  │ Tenant      │        │
│  │ Config      │  │ Billing     │  │ Settings    │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Organization                              │
│                 (组织级实体)                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Organization│  │ Organization│  │ Organization│        │
│  │ Profile     │  │ Config      │  │ Policy      │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Department                               │
│                  (部门级实体)                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Department  │  │ Department  │  │ Department  │        │
│  │ Profile     │  │ Config      │  │ Policy      │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      User                                  │
│                   (用户级实体)                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ User        │  │ User        │  │ User        │        │
│  │ Profile     │  │ Settings    │  │ Preferences │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

#### 实体关系说明

**层级关系**：

- **Platform** → **Tenant** → **Organization** → **Department** → **User**
- 每个层级都可以包含下级实体
- 用户级实体可以存在于任何组织层级下

**关联关系**：

- **一对多关系**：上级实体包含多个下级实体
- **多对多关系**：用户与部门、用户与组织等
- **继承关系**：不同层级的实体继承基础属性

### 数据隔离关系

#### 数据隔离策略

```typescript
// 数据隔离级别枚举
export enum DataIsolationLevel {
  PLATFORM = 'platform', // 平台级隔离 - 全局共享数据
  TENANT = 'tenant', // 租户级隔离 - 租户内共享数据
  ORGANIZATION = 'organization', // 组织级隔离 - 组织内共享数据
  DEPARTMENT = 'department', // 部门级隔离 - 部门内共享数据
  USER = 'user', // 用户级隔离 - 用户私有数据
}

// 数据隐私级别枚举
export enum DataPrivacyLevel {
  PUBLIC = 'public', // 公开数据
  SHARED = 'shared', // 共享数据
  PROTECTED = 'protected', // 受保护数据
  PRIVATE = 'private', // 私有数据
}

// 数据所有权类型枚举
export enum DataOwnershipType {
  PERSONAL = 'personal', // 个人数据
  DEPARTMENT = 'department', // 部门数据
  ORGANIZATION = 'organization', // 组织数据
  TENANT = 'tenant', // 租户数据
  PLATFORM = 'platform', // 平台数据
}
```

#### 数据隔离实现

```typescript
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
    dataIsolationLevel: DataIsolationLevel,
    dataPrivacyLevel: DataPrivacyLevel,
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

  // 访问控制方法
  public canAccess(target: DataIsolationAwareEntity): boolean {
    // 实现访问控制逻辑
    return this.checkAccessControl(target);
  }

  private checkAccessControl(target: DataIsolationAwareEntity): boolean {
    // 1. 检查租户隔离
    if (!this._tenantId.equals(target.tenantId)) {
      return false;
    }

    // 2. 检查组织隔离
    if (target._dataIsolationLevel === DataIsolationLevel.ORGANIZATION) {
      if (!this._organizationId?.equals(target.organizationId)) {
        return false;
      }
    }

    // 3. 检查部门隔离
    if (target._dataIsolationLevel === DataIsolationLevel.DEPARTMENT) {
      const hasCommonDepartment = this._departmentIds.some(deptId =>
        target.departmentIds.some(targetDeptId => deptId.equals(targetDeptId)),
      );
      if (!hasCommonDepartment) {
        return false;
      }
    }

    // 4. 检查用户隔离
    if (target._dataIsolationLevel === DataIsolationLevel.USER) {
      if (!this._userId?.equals(target.userId)) {
        return false;
      }
    }

    return true;
  }

  // Getters
  get tenantId(): Uuid {
    return this._tenantId;
  }

  get organizationId(): Uuid | undefined {
    return this._organizationId;
  }

  get departmentIds(): Uuid[] {
    return [...this._departmentIds];
  }

  get userId(): Uuid | undefined {
    return this._userId;
  }

  get dataIsolationLevel(): DataIsolationLevel {
    return this._dataIsolationLevel;
  }

  get dataPrivacyLevel(): DataPrivacyLevel {
    return this._dataPrivacyLevel;
  }
}
```

### 数据库设计

#### 数据库架构

```
┌─────────────────────────────────────────────────────────────┐
│                PostgreSQL (Command DB)                     │
│                 (命令端 + 事件存储)                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Domain      │  │ Event       │  │ Command     │        │
│  │ Entities    │  │ Store       │  │ Log         │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 MongoDB (Query DB)                         │
│                   (查询端)                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Read        │  │ Query       │  │ Analytics   │        │
│  │ Models      │  │ Models      │  │ Data        │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Redis (Cache)                           │
│                   (缓存层)                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Session     │  │ Permission  │  │ Query       │        │
│  │ Cache       │  │ Cache       │  │ Cache       │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

#### PostgreSQL 表结构设计

```sql
-- 平台配置表
CREATE TABLE platform_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(255) NOT NULL UNIQUE,
  value TEXT,
  category VARCHAR(100) NOT NULL,
  is_system BOOLEAN DEFAULT FALSE,
  data_privacy_level VARCHAR(20) DEFAULT 'protected',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 租户表
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(100) NOT NULL UNIQUE,
  status VARCHAR(20) DEFAULT 'active',
  subscription_plan VARCHAR(50),
  max_users INTEGER DEFAULT 100,
  max_storage BIGINT DEFAULT 1073741824, -- 1GB
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 组织表
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  parent_id UUID REFERENCES organizations(id),
  level INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, code)
);

-- 部门表
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  parent_id UUID REFERENCES departments(id),
  level INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, organization_id, code)
);

-- 用户表
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  organization_id UUID REFERENCES organizations(id),
  username VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255),
  status VARCHAR(20) DEFAULT 'active',
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, username),
  UNIQUE(tenant_id, email)
);

-- 用户部门关联表
CREATE TABLE user_departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  department_id UUID NOT NULL REFERENCES departments(id),
  role VARCHAR(50),
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, department_id)
);

-- 角色表
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(100) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, code)
);

-- 权限表
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(100) NOT NULL,
  resource VARCHAR(100) NOT NULL,
  action VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, code)
);

-- 角色权限关联表
CREATE TABLE role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES roles(id),
  permission_id UUID NOT NULL REFERENCES permissions(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(role_id, permission_id)
);

-- 用户角色关联表
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  role_id UUID NOT NULL REFERENCES roles(id),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, role_id, tenant_id)
);

-- 会话表
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  tenant_id UUID REFERENCES tenants(id),
  token_hash VARCHAR(255) NOT NULL,
  device_info JSONB,
  ip_address INET,
  user_agent TEXT,
  expires_at TIMESTAMP NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 领域事件表
CREATE TABLE domain_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL,
  aggregate_id UUID NOT NULL,
  aggregate_type VARCHAR(100) NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB NOT NULL,
  metadata JSONB,
  version INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_aggregate_id (aggregate_id),
  INDEX idx_event_type (event_type),
  INDEX idx_created_at (created_at)
);

-- 审计日志表
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  tenant_id UUID REFERENCES tenants(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100) NOT NULL,
  resource_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_tenant_id (tenant_id),
  INDEX idx_action (action),
  INDEX idx_created_at (created_at)
);
```

#### MongoDB 集合设计

```typescript
// 用户读模型集合
interface UserReadModel {
  _id: string;
  userId: string;
  tenantId: string;
  organizationId?: string;
  departmentIds: string[];
  username: string;
  email: string;
  status: string;
  roles: string[];
  permissions: string[];
  profile: {
    firstName: string;
    lastName: string;
    avatar?: string;
    phone?: string;
    timezone: string;
    language: string;
  };
  settings: {
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    privacy: {
      profileVisibility: string;
      dataSharing: string;
    };
  };
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// 组织读模型集合
interface OrganizationReadModel {
  _id: string;
  organizationId: string;
  tenantId: string;
  name: string;
  code: string;
  status: string;
  parentId?: string;
  level: number;
  path: string[]; // 组织路径
  children: string[]; // 子组织ID列表
  userCount: number;
  departmentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// 部门读模型集合
interface DepartmentReadModel {
  _id: string;
  departmentId: string;
  tenantId: string;
  organizationId: string;
  name: string;
  code: string;
  status: string;
  parentId?: string;
  level: number;
  path: string[]; // 部门路径
  children: string[]; // 子部门ID列表
  userCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// 角色读模型集合
interface RoleReadModel {
  _id: string;
  roleId: string;
  tenantId: string;
  name: string;
  code: string;
  description?: string;
  status: string;
  permissions: string[];
  userCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// 权限读模型集合
interface PermissionReadModel {
  _id: string;
  permissionId: string;
  tenantId: string;
  name: string;
  code: string;
  resource: string;
  action: string;
  status: string;
  roleCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// 会话读模型集合
interface SessionReadModel {
  _id: string;
  sessionId: string;
  userId: string;
  tenantId?: string;
  deviceInfo: {
    type: string;
    os: string;
    browser: string;
    version: string;
  };
  ipAddress: string;
  userAgent: string;
  expiresAt: Date;
  status: string;
  lastActivityAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### GraphQL Schema 设计

#### 基础类型定义

```graphql
# 基础类型
scalar UUID
scalar DateTime
scalar JSON

# 分页类型
type PaginationInfo {
  page: Int!
  size: Int!
  total: Int!
  totalPages: Int!
  hasNext: Boolean!
  hasPrev: Boolean!
}

# 排序类型
input SortInput {
  field: String!
  direction: SortDirection!
}

enum SortDirection {
  ASC
  DESC
}

# 过滤类型
input FilterInput {
  field: String!
  operator: FilterOperator!
  value: String!
}

enum FilterOperator {
  EQ
  NE
  GT
  GTE
  LT
  LTE
  LIKE
  IN
  NOT_IN
  IS_NULL
  IS_NOT_NULL
}
```

#### 用户相关类型

```graphql
# 用户类型
type User {
  id: UUID!
  tenantId: UUID!
  organizationId: UUID
  departmentIds: [UUID!]!
  username: String!
  email: String!
  status: UserStatus!
  roles: [Role!]!
  permissions: [Permission!]!
  profile: UserProfile!
  settings: UserSettings!
  lastLoginAt: DateTime
  createdAt: DateTime!
  updatedAt: DateTime!

  # 关联数据
  tenant: Tenant!
  organization: Organization
  departments: [Department!]!
}

# 用户档案
type UserProfile {
  firstName: String!
  lastName: String!
  fullName: String!
  avatar: String
  phone: String
  timezone: String!
  language: String!
}

# 用户设置
type UserSettings {
  notifications: NotificationSettings!
  privacy: PrivacySettings!
}

# 通知设置
type NotificationSettings {
  email: Boolean!
  sms: Boolean!
  push: Boolean!
}

# 隐私设置
type PrivacySettings {
  profileVisibility: ProfileVisibility!
  dataSharing: DataSharingLevel!
}

# 用户状态
enum UserStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
  DELETED
}

# 档案可见性
enum ProfileVisibility {
  PUBLIC
  TENANT
  ORGANIZATION
  DEPARTMENT
  PRIVATE
}

# 数据共享级别
enum DataSharingLevel {
  NONE
  DEPARTMENT
  ORGANIZATION
  TENANT
  PLATFORM
}

# 用户输入类型
input CreateUserInput {
  username: String!
  email: String!
  password: String!
  tenantId: UUID!
  organizationId: UUID
  departmentIds: [UUID!]
  profile: CreateUserProfileInput!
  settings: CreateUserSettingsInput
}

input CreateUserProfileInput {
  firstName: String!
  lastName: String!
  phone: String
  timezone: String!
  language: String!
}

input CreateUserSettingsInput {
  notifications: NotificationSettingsInput
  privacy: PrivacySettingsInput
}

input NotificationSettingsInput {
  email: Boolean
  sms: Boolean
  push: Boolean
}

input PrivacySettingsInput {
  profileVisibility: ProfileVisibility
  dataSharing: DataSharingLevel
}

input UpdateUserInput {
  username: String
  email: String
  organizationId: UUID
  departmentIds: [UUID!]
  profile: UpdateUserProfileInput
  settings: UpdateUserSettingsInput
}

input UpdateUserProfileInput {
  firstName: String
  lastName: String
  phone: String
  timezone: String
  language: String
}

input UpdateUserSettingsInput {
  notifications: NotificationSettingsInput
  privacy: PrivacySettingsInput
}

# 用户查询输入
input UserFilterInput {
  tenantId: UUID
  organizationId: UUID
  departmentId: UUID
  status: UserStatus
  roleId: UUID
  search: String
}

input UserSortInput {
  field: UserSortField!
  direction: SortDirection!
}

enum UserSortField {
  USERNAME
  EMAIL
  CREATED_AT
  UPDATED_AT
  LAST_LOGIN_AT
}
```

#### 组织相关类型

```graphql
# 组织类型
type Organization {
  id: UUID!
  tenantId: UUID!
  name: String!
  code: String!
  status: OrganizationStatus!
  parentId: UUID
  level: Int!
  path: [String!]!
  children: [Organization!]!
  userCount: Int!
  departmentCount: Int!
  createdAt: DateTime!
  updatedAt: DateTime!

  # 关联数据
  tenant: Tenant!
  parent: Organization
  children: [Organization!]!
  users: [User!]!
  departments: [Department!]!
}

# 组织状态
enum OrganizationStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
  DELETED
}

# 组织输入类型
input CreateOrganizationInput {
  tenantId: UUID!
  name: String!
  code: String!
  parentId: UUID
}

input UpdateOrganizationInput {
  name: String
  code: String
  status: OrganizationStatus
  parentId: UUID
}

# 组织查询输入
input OrganizationFilterInput {
  tenantId: UUID!
  parentId: UUID
  status: OrganizationStatus
  level: Int
  search: String
}

input OrganizationSortInput {
  field: OrganizationSortField!
  direction: SortDirection!
}

enum OrganizationSortField {
  NAME
  CODE
  LEVEL
  USER_COUNT
  DEPARTMENT_COUNT
  CREATED_AT
  UPDATED_AT
}
```

#### 部门相关类型

```graphql
# 部门类型
type Department {
  id: UUID!
  tenantId: UUID!
  organizationId: UUID!
  name: String!
  code: String!
  status: DepartmentStatus!
  parentId: UUID
  level: Int!
  path: [String!]!
  children: [Department!]!
  userCount: Int!
  createdAt: DateTime!
  updatedAt: DateTime!

  # 关联数据
  tenant: Tenant!
  organization: Organization!
  parent: Department
  children: [Department!]!
  users: [User!]!
}

# 部门状态
enum DepartmentStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
  DELETED
}

# 部门输入类型
input CreateDepartmentInput {
  tenantId: UUID!
  organizationId: UUID!
  name: String!
  code: String!
  parentId: UUID
}

input UpdateDepartmentInput {
  name: String
  code: String
  status: DepartmentStatus
  parentId: UUID
}

# 部门查询输入
input DepartmentFilterInput {
  tenantId: UUID!
  organizationId: UUID
  parentId: UUID
  status: DepartmentStatus
  level: Int
  search: String
}

input DepartmentSortInput {
  field: DepartmentSortField!
  direction: SortDirection!
}

enum DepartmentSortField {
  NAME
  CODE
  LEVEL
  USER_COUNT
  CREATED_AT
  UPDATED_AT
}
```

#### 角色权限相关类型

```graphql
# 角色类型
type Role {
  id: UUID!
  tenantId: UUID!
  name: String!
  code: String!
  description: String
  status: RoleStatus!
  permissions: [Permission!]!
  userCount: Int!
  createdAt: DateTime!
  updatedAt: DateTime!

  # 关联数据
  tenant: Tenant!
  permissions: [Permission!]!
  users: [User!]!
}

# 角色状态
enum RoleStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
  DELETED
}

# 权限类型
type Permission {
  id: UUID!
  tenantId: UUID!
  name: String!
  code: String!
  resource: String!
  action: String!
  status: PermissionStatus!
  roleCount: Int!
  createdAt: DateTime!
  updatedAt: DateTime!

  # 关联数据
  tenant: Tenant!
  roles: [Role!]!
}

# 权限状态
enum PermissionStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
  DELETED
}

# 角色输入类型
input CreateRoleInput {
  tenantId: UUID!
  name: String!
  code: String!
  description: String
  permissionIds: [UUID!]
}

input UpdateRoleInput {
  name: String
  code: String
  description: String
  status: RoleStatus
  permissionIds: [UUID!]
}

# 权限输入类型
input CreatePermissionInput {
  tenantId: UUID!
  name: String!
  code: String!
  resource: String!
  action: String!
}

input UpdatePermissionInput {
  name: String
  code: String
  resource: String
  action: String
  status: PermissionStatus
}

# 角色权限关联输入
input AssignRoleToUserInput {
  userId: UUID!
  roleId: UUID!
  tenantId: UUID!
}

input RemoveRoleFromUserInput {
  userId: UUID!
  roleId: UUID!
  tenantId: UUID!
}

input AssignPermissionToRoleInput {
  roleId: UUID!
  permissionId: UUID!
}

input RemovePermissionFromRoleInput {
  roleId: UUID!
  permissionId: UUID!
}
```

#### 查询和变更类型

```graphql
# 查询类型
type Query {
  # 用户查询
  user(id: UUID!): User
  users(
    filter: UserFilterInput
    sort: UserSortInput
    page: Int
    size: Int
  ): UserConnection!

  # 组织查询
  organization(id: UUID!): Organization
  organizations(
    filter: OrganizationFilterInput
    sort: OrganizationSortInput
    page: Int
    size: Int
  ): OrganizationConnection!

  # 部门查询
  department(id: UUID!): Department
  departments(
    filter: DepartmentFilterInput
    sort: DepartmentSortInput
    page: Int
    size: Int
  ): DepartmentConnection!

  # 角色查询
  role(id: UUID!): Role
  roles(
    filter: RoleFilterInput
    sort: RoleSortInput
    page: Int
    size: Int
  ): RoleConnection!

  # 权限查询
  permission(id: UUID!): Permission
  permissions(
    filter: PermissionFilterInput
    sort: PermissionSortInput
    page: Int
    size: Int
  ): PermissionConnection!

  # 当前用户信息
  me: User
  myPermissions: [Permission!]!
  myRoles: [Role!]!
}

# 变更类型
type Mutation {
  # 用户管理
  createUser(input: CreateUserInput!): CreateUserPayload!
  updateUser(id: UUID!, input: UpdateUserInput!): UpdateUserPayload!
  deleteUser(id: UUID!): DeleteUserPayload!

  # 组织管理
  createOrganization(
    input: CreateOrganizationInput!
  ): CreateOrganizationPayload!
  updateOrganization(
    id: UUID!
    input: UpdateOrganizationInput!
  ): UpdateOrganizationPayload!
  deleteOrganization(id: UUID!): DeleteOrganizationPayload!

  # 部门管理
  createDepartment(input: CreateDepartmentInput!): CreateDepartmentPayload!
  updateDepartment(
    id: UUID!
    input: UpdateDepartmentInput!
  ): UpdateDepartmentPayload!
  deleteDepartment(id: UUID!): DeleteDepartmentPayload!

  # 角色管理
  createRole(input: CreateRoleInput!): CreateRolePayload!
  updateRole(id: UUID!, input: UpdateRoleInput!): UpdateRolePayload!
  deleteRole(id: UUID!): DeleteRolePayload!

  # 权限管理
  createPermission(input: CreatePermissionInput!): CreatePermissionPayload!
  updatePermission(
    id: UUID!
    input: UpdatePermissionInput!
  ): UpdatePermissionPayload!
  deletePermission(id: UUID!): DeletePermissionPayload!

  # 角色权限关联
  assignRoleToUser(input: AssignRoleToUserInput!): AssignRoleToUserPayload!
  removeRoleFromUser(
    input: RemoveRoleFromUserInput!
  ): RemoveRoleFromUserPayload!
  assignPermissionToRole(
    input: AssignPermissionToRoleInput!
  ): AssignPermissionToRolePayload!
  removePermissionFromRole(
    input: RemovePermissionFromRoleInput!
  ): RemovePermissionFromRolePayload!
}

# 连接类型
type UserConnection {
  edges: [UserEdge!]!
  pageInfo: PaginationInfo!
}

type UserEdge {
  node: User!
  cursor: String!
}

type OrganizationConnection {
  edges: [OrganizationEdge!]!
  pageInfo: PaginationInfo!
}

type OrganizationEdge {
  node: Organization!
  cursor: String!
}

type DepartmentConnection {
  edges: [DepartmentEdge!]!
  pageInfo: PaginationInfo!
}

type DepartmentEdge {
  node: Department!
  cursor: String!
}

type RoleConnection {
  edges: [RoleEdge!]!
  pageInfo: PaginationInfo!
}

type RoleEdge {
  node: Role!
  cursor: String!
}

type PermissionConnection {
  edges: [PermissionEdge!]!
  pageInfo: PaginationInfo!
}

type PermissionEdge {
  node: Permission!
  cursor: String!
}

# 响应类型
type CreateUserPayload {
  success: Boolean!
  user: User
  errors: [String!]
}

type UpdateUserPayload {
  success: Boolean!
  user: User
  errors: [String!]
}

type DeleteUserPayload {
  success: Boolean!
  errors: [String!]
}

type CreateOrganizationPayload {
  success: Boolean!
  organization: Organization
  errors: [String!]
}

type UpdateOrganizationPayload {
  success: Boolean!
  organization: Organization
  errors: [String!]
}

type DeleteOrganizationPayload {
  success: Boolean!
  errors: [String!]
}

type CreateDepartmentPayload {
  success: Boolean!
  department: Department
  errors: [String!]
}

type UpdateDepartmentPayload {
  success: Boolean!
  department: Department
  errors: [String!]
}

type DeleteDepartmentPayload {
  success: Boolean!
  errors: [String!]
}

type CreateRolePayload {
  success: Boolean!
  role: Role
  errors: [String!]
}

type UpdateRolePayload {
  success: Boolean!
  role: Role
  errors: [String!]
}

type DeleteRolePayload {
  success: Boolean!
  errors: [String!]
}

type CreatePermissionPayload {
  success: Boolean!
  permission: Permission
  errors: [String!]
}

type UpdatePermissionPayload {
  success: Boolean!
  permission: Permission
  errors: [String!]
}

type DeletePermissionPayload {
  success: Boolean!
  errors: [String!]
}

type AssignRoleToUserPayload {
  success: Boolean!
  errors: [String!]
}

type RemoveRoleFromUserPayload {
  success: Boolean!
  errors: [String!]
}

type AssignPermissionToRolePayload {
  success: Boolean!
  errors: [String!]
}

type RemovePermissionFromRolePayload {
  success: Boolean!
  errors: [String!]
}
```

### GraphQL 解析器实现

#### 用户解析器

```typescript
// 用户解析器
@Resolver(() => User)
export class UserResolver {
  constructor(
    private readonly userService: UserService,
    private readonly permissionService: PermissionService,
  ) {}

  @Query(() => User, { nullable: true })
  async user(
    @Args('id', { type: () => UUID }) id: string,
  ): Promise<User | null> {
    return this.userService.findById(id);
  }

  @Query(() => UserConnection)
  async users(
    @Args('filter', { nullable: true }) filter?: UserFilterInput,
    @Args('sort', { nullable: true }) sort?: UserSortInput,
    @Args('page', { defaultValue: 1 }) page: number,
    @Args('size', { defaultValue: 20 }) size: number,
    @CurrentUser() currentUser: User,
  ): Promise<UserConnection> {
    // 权限检查
    await this.permissionService.checkPermission(
      currentUser.id,
      'user',
      'read',
    );

    const result = await this.userService.findUsers(filter, sort, page, size);

    return {
      edges: result.data.map(user => ({
        node: user,
        cursor: Buffer.from(user.id).toString('base64'),
      })),
      pageInfo: {
        page,
        size,
        total: result.total,
        totalPages: Math.ceil(result.total / size),
        hasNext: page < Math.ceil(result.total / size),
        hasPrev: page > 1,
      },
    };
  }

  @Query(() => User)
  async me(@CurrentUser() currentUser: User): Promise<User> {
    return currentUser;
  }

  @Query(() => [Permission])
  async myPermissions(@CurrentUser() currentUser: User): Promise<Permission[]> {
    return this.permissionService.getUserPermissions(currentUser.id);
  }

  @Query(() => [Role])
  async myRoles(@CurrentUser() currentUser: User): Promise<Role[]> {
    return this.userService.getUserRoles(currentUser.id);
  }

  @Mutation(() => CreateUserPayload)
  async createUser(
    @Args('input') input: CreateUserInput,
    @CurrentUser() currentUser: User,
  ): Promise<CreateUserPayload> {
    try {
      // 权限检查
      await this.permissionService.checkPermission(
        currentUser.id,
        'user',
        'create',
      );

      const user = await this.userService.createUser(input);

      return {
        success: true,
        user,
        errors: [],
      };
    } catch (error) {
      return {
        success: false,
        user: null,
        errors: [error.message],
      };
    }
  }

  @Mutation(() => UpdateUserPayload)
  async updateUser(
    @Args('id', { type: () => UUID }) id: string,
    @Args('input') input: UpdateUserInput,
    @CurrentUser() currentUser: User,
  ): Promise<UpdateUserPayload> {
    try {
      // 权限检查
      await this.permissionService.checkPermission(
        currentUser.id,
        'user',
        'update',
      );

      const user = await this.userService.updateUser(id, input);

      return {
        success: true,
        user,
        errors: [],
      };
    } catch (error) {
      return {
        success: false,
        user: null,
        errors: [error.message],
      };
    }
  }

  @Mutation(() => DeleteUserPayload)
  async deleteUser(
    @Args('id', { type: () => UUID }) id: string,
    @CurrentUser() currentUser: User,
  ): Promise<DeleteUserPayload> {
    try {
      // 权限检查
      await this.permissionService.checkPermission(
        currentUser.id,
        'user',
        'delete',
      );

      await this.userService.deleteUser(id);

      return {
        success: true,
        errors: [],
      };
    } catch (error) {
      return {
        success: false,
        errors: [error.message],
      };
    }
  }

  @ResolveField(() => Tenant)
  async tenant(@Parent() user: User): Promise<Tenant> {
    return this.userService.getUserTenant(user.id);
  }

  @ResolveField(() => Organization, { nullable: true })
  async organization(@Parent() user: User): Promise<Organization | null> {
    if (!user.organizationId) {
      return null;
    }
    return this.userService.getUserOrganization(user.id);
  }

  @ResolveField(() => [Department])
  async departments(@Parent() user: User): Promise<Department[]> {
    return this.userService.getUserDepartments(user.id);
  }

  @ResolveField(() => [Role])
  async roles(@Parent() user: User): Promise<Role[]> {
    return this.userService.getUserRoles(user.id);
  }

  @ResolveField(() => [Permission])
  async permissions(@Parent() user: User): Promise<Permission[]> {
    return this.permissionService.getUserPermissions(user.id);
  }
}
```

#### 组织解析器

```typescript
// 组织解析器
@Resolver(() => Organization)
export class OrganizationResolver {
  constructor(
    private readonly organizationService: OrganizationService,
    private readonly permissionService: PermissionService,
  ) {}

  @Query(() => Organization, { nullable: true })
  async organization(
    @Args('id', { type: () => UUID }) id: string,
  ): Promise<Organization | null> {
    return this.organizationService.findById(id);
  }

  @Query(() => OrganizationConnection)
  async organizations(
    @Args('filter', { nullable: true }) filter?: OrganizationFilterInput,
    @Args('sort', { nullable: true }) sort?: OrganizationSortInput,
    @Args('page', { defaultValue: 1 }) page: number,
    @Args('size', { defaultValue: 20 }) size: number,
    @CurrentUser() currentUser: User,
  ): Promise<OrganizationConnection> {
    // 权限检查
    await this.permissionService.checkPermission(
      currentUser.id,
      'organization',
      'read',
    );

    const result = await this.organizationService.findOrganizations(
      filter,
      sort,
      page,
      size,
    );

    return {
      edges: result.data.map(org => ({
        node: org,
        cursor: Buffer.from(org.id).toString('base64'),
      })),
      pageInfo: {
        page,
        size,
        total: result.total,
        totalPages: Math.ceil(result.total / size),
        hasNext: page < Math.ceil(result.total / size),
        hasPrev: page > 1,
      },
    };
  }

  @Mutation(() => CreateOrganizationPayload)
  async createOrganization(
    @Args('input') input: CreateOrganizationInput,
    @CurrentUser() currentUser: User,
  ): Promise<CreateOrganizationPayload> {
    try {
      // 权限检查
      await this.permissionService.checkPermission(
        currentUser.id,
        'organization',
        'create',
      );

      const organization =
        await this.organizationService.createOrganization(input);

      return {
        success: true,
        organization,
        errors: [],
      };
    } catch (error) {
      return {
        success: false,
        organization: null,
        errors: [error.message],
      };
    }
  }

  @Mutation(() => UpdateOrganizationPayload)
  async updateOrganization(
    @Args('id', { type: () => UUID }) id: string,
    @Args('input') input: UpdateOrganizationInput,
    @CurrentUser() currentUser: User,
  ): Promise<UpdateOrganizationPayload> {
    try {
      // 权限检查
      await this.permissionService.checkPermission(
        currentUser.id,
        'organization',
        'update',
      );

      const organization = await this.organizationService.updateOrganization(
        id,
        input,
      );

      return {
        success: true,
        organization,
        errors: [],
      };
    } catch (error) {
      return {
        success: false,
        organization: null,
        errors: [error.message],
      };
    }
  }

  @Mutation(() => DeleteOrganizationPayload)
  async deleteOrganization(
    @Args('id', { type: () => UUID }) id: string,
    @CurrentUser() currentUser: User,
  ): Promise<DeleteOrganizationPayload> {
    try {
      // 权限检查
      await this.permissionService.checkPermission(
        currentUser.id,
        'organization',
        'delete',
      );

      await this.organizationService.deleteOrganization(id);

      return {
        success: true,
        errors: [],
      };
    } catch (error) {
      return {
        success: false,
        errors: [error.message],
      };
    }
  }

  @ResolveField(() => Tenant)
  async tenant(@Parent() organization: Organization): Promise<Tenant> {
    return this.organizationService.getOrganizationTenant(organization.id);
  }

  @ResolveField(() => Organization, { nullable: true })
  async parent(
    @Parent() organization: Organization,
  ): Promise<Organization | null> {
    if (!organization.parentId) {
      return null;
    }
    return this.organizationService.findById(organization.parentId);
  }

  @ResolveField(() => [Organization])
  async children(
    @Parent() organization: Organization,
  ): Promise<Organization[]> {
    return this.organizationService.getOrganizationChildren(organization.id);
  }

  @ResolveField(() => [User])
  async users(@Parent() organization: Organization): Promise<User[]> {
    return this.organizationService.getOrganizationUsers(organization.id);
  }

  @ResolveField(() => [Department])
  async departments(
    @Parent() organization: Organization,
  ): Promise<Department[]> {
    return this.organizationService.getOrganizationDepartments(organization.id);
  }
}
```

---

**文档版本**: v1.0.0  
**创建日期**: 2024-12-19  
**适用范围**: SAAS平台数据模型与GraphQL设计指导
