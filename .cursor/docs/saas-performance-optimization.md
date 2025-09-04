# SAAS平台性能优化与部署

## 🚀 性能优化与部署架构

### 性能优化策略

#### 5.1 数据库性能优化

**PostgreSQL 优化**

```sql
-- 1. 索引优化
-- 用户表索引
CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_users_organization_id ON users(organization_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_created_at ON users(created_at);

-- 组织表索引
CREATE INDEX idx_organizations_tenant_id ON organizations(tenant_id);
CREATE INDEX idx_organizations_parent_id ON organizations(parent_id);
CREATE INDEX idx_organizations_level ON organizations(level);
CREATE INDEX idx_organizations_status ON organizations(status);

-- 部门表索引
CREATE INDEX idx_departments_tenant_id ON departments(tenant_id);
CREATE INDEX idx_departments_organization_id ON departments(organization_id);
CREATE INDEX idx_departments_parent_id ON departments(parent_id);
CREATE INDEX idx_departments_level ON departments(level);

-- 角色表索引
CREATE INDEX idx_roles_tenant_id ON roles(tenant_id);
CREATE INDEX idx_roles_status ON roles(status);

-- 权限表索引
CREATE INDEX idx_permissions_tenant_id ON permissions(tenant_id);
CREATE INDEX idx_permissions_resource_action ON permissions(resource, action);

-- 用户角色关联表索引
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX idx_user_roles_tenant_id ON user_roles(tenant_id);

-- 角色权限关联表索引
CREATE INDEX idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission_id ON role_permissions(permission_id);

-- 会话表索引
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_tenant_id ON sessions(tenant_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX idx_sessions_status ON sessions(status);

-- 领域事件表索引
CREATE INDEX idx_domain_events_aggregate_id ON domain_events(aggregate_id);
CREATE INDEX idx_domain_events_event_type ON domain_events(event_type);
CREATE INDEX idx_domain_events_created_at ON domain_events(created_at);
CREATE INDEX idx_domain_events_tenant_id ON domain_events(tenant_id);

-- 审计日志表索引
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_tenant_id ON audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- 2. 分区表优化（针对大数据量）
-- 按租户分区的用户表
CREATE TABLE users_partitioned (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  organization_id UUID,
  username VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255),
  status VARCHAR(20) DEFAULT 'active',
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) PARTITION BY HASH (tenant_id);

-- 创建分区
CREATE TABLE users_partition_0 PARTITION OF users_partitioned
FOR VALUES WITH (modulus 4, remainder 0);

CREATE TABLE users_partition_1 PARTITION OF users_partitioned
FOR VALUES WITH (modulus 4, remainder 1);

CREATE TABLE users_partition_2 PARTITION OF users_partitioned
FOR VALUES WITH (modulus 4, remainder 2);

CREATE TABLE users_partition_3 PARTITION OF users_partitioned
FOR VALUES WITH (modulus 4, remainder 3);

-- 3. 查询优化
-- 使用 CTE 优化复杂查询
WITH user_permissions AS (
  SELECT
    u.id,
    u.username,
    u.email,
    u.tenant_id,
    u.organization_id,
    ARRAY_AGG(DISTINCT r.code) as roles,
    ARRAY_AGG(DISTINCT p.code) as permissions
  FROM users u
  LEFT JOIN user_roles ur ON u.id = ur.user_id
  LEFT JOIN roles r ON ur.role_id = r.id
  LEFT JOIN role_permissions rp ON r.id = rp.role_id
  LEFT JOIN permissions p ON rp.permission_id = p.id
  WHERE u.tenant_id = $1
  GROUP BY u.id, u.username, u.email, u.tenant_id, u.organization_id
)
SELECT * FROM user_permissions
WHERE organization_id = $2
ORDER BY username;

-- 4. 连接池配置
-- postgresql.conf 优化
max_connections = 200
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
```

**MongoDB 优化**

```typescript
// 1. 索引优化
// 用户读模型索引
db.user_read_models.createIndex({ tenantId: 1 });
db.user_read_models.createIndex({ organizationId: 1 });
db.user_read_models.createIndex({ departmentIds: 1 });
db.user_read_models.createIndex({ username: 1 });
db.user_read_models.createIndex({ email: 1 });
db.user_read_models.createIndex({ status: 1 });
db.user_read_models.createIndex({ createdAt: -1 });

// 复合索引
db.user_read_models.createIndex({ tenantId: 1, organizationId: 1 });
db.user_read_models.createIndex({ tenantId: 1, status: 1 });
db.user_read_models.createIndex({ tenantId: 1, createdAt: -1 });

// 组织读模型索引
db.organization_read_models.createIndex({ tenantId: 1 });
db.organization_read_models.createIndex({ parentId: 1 });
db.organization_read_models.createIndex({ level: 1 });
db.organization_read_models.createIndex({ status: 1 });

// 部门读模型索引
db.department_read_models.createIndex({ tenantId: 1 });
db.department_read_models.createIndex({ organizationId: 1 });
db.department_read_models.createIndex({ parentId: 1 });
db.department_read_models.createIndex({ level: 1 });

// 2. 聚合管道优化
// 优化用户统计查询
db.user_read_models.aggregate([
  { $match: { tenantId: tenantId } },
  {
    $group: {
      _id: '$organizationId',
      userCount: { $sum: 1 },
      activeUsers: { $sum: { $cond: [{ $eq: ['$status', 'ACTIVE'] }, 1, 0] } },
      inactiveUsers: {
        $sum: { $cond: [{ $eq: ['$status', 'INACTIVE'] }, 1, 0] },
      },
    },
  },
  { $sort: { userCount: -1 } },
]);

// 3. 分片策略（针对大数据量）
// 按租户分片
sh.shardCollection('saas.user_read_models', { tenantId: 1 });
sh.shardCollection('saas.organization_read_models', { tenantId: 1 });
sh.shardCollection('saas.department_read_models', { tenantId: 1 });

// 4. 读写关注级别优化
// 写操作使用 majority 确保数据一致性
const writeOptions = { w: 'majority', j: true };

// 读操作使用 majority 确保读取最新数据
const readOptions = { readConcern: { level: 'majority' } };

// 5. 批量操作优化
// 批量插入用户
const bulkOps = [];
users.forEach(user => {
  bulkOps.push({
    insertOne: {
      document: user,
    },
  });
});

if (bulkOps.length > 0) {
  await db
    .collection('user_read_models')
    .bulkWrite(bulkOps, { ordered: false });
}
```

#### 5.2 缓存策略优化

**Redis 缓存策略**

```typescript
// 1. 缓存键命名规范
export class CacheKeyBuilder {
  // 用户缓存键
  static userProfile(userId: string): string {
    return `user:profile:${userId}`;
  }

  static userPermissions(userId: string): string {
    return `user:permissions:${userId}`;
  }

  static userRoles(userId: string): string {
    return `user:roles:${userId}`;
  }

  // 组织缓存键
  static organizationProfile(orgId: string): string {
    return `org:profile:${orgId}`;
  }

  static organizationUsers(orgId: string): string {
    return `org:users:${orgId}`;
  }

  static organizationDepartments(orgId: string): string {
    return `org:departments:${orgId}`;
  }

  // 部门缓存键
  static departmentProfile(deptId: string): string {
    return `dept:profile:${deptId}`;
  }

  static departmentUsers(deptId: string): string {
    return `dept:users:${deptId}`;
  }

  // 权限缓存键
  static rolePermissions(roleId: string): string {
    return `role:permissions:${roleId}`;
  }

  static userEffectivePermissions(userId: string): string {
    return `user:effective_permissions:${userId}`;
  }

  // 会话缓存键
  static userSession(userId: string): string {
    return `session:user:${userId}`;
  }

  static sessionInfo(sessionId: string): string {
    return `session:info:${sessionId}`;
  }

  // 查询结果缓存键
  static queryResult(queryHash: string): string {
    return `query:result:${queryHash}`;
  }

  // 分页缓存键
  static paginatedResult(key: string, page: number, size: number): string {
    return `${key}:page:${page}:size:${size}`;
  }
}

// 2. 缓存服务实现
@Injectable()
export class CacheService {
  constructor(
    private readonly redis: Redis,
    private readonly logger: PinoLoggerService,
  ) {}

  // 设置缓存
  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      if (ttl) {
        await this.redis.setex(key, ttl, serializedValue);
      } else {
        await this.redis.set(key, serializedValue);
      }
    } catch (error) {
      this.logger.error('Failed to set cache', { key, error: error.message });
    }
  }

  // 获取缓存
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      if (value) {
        return JSON.parse(value);
      }
      return null;
    } catch (error) {
      this.logger.error('Failed to get cache', { key, error: error.message });
      return null;
    }
  }

  // 删除缓存
  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      this.logger.error('Failed to delete cache', {
        key,
        error: error.message,
      });
    }
  }

  // 批量删除缓存
  async delPattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      this.logger.error('Failed to delete cache pattern', {
        pattern,
        error: error.message,
      });
    }
  }

  // 设置缓存并设置过期时间
  async setex(key: string, ttl: number, value: any): Promise<void> {
    await this.set(key, value, ttl);
  }

  // 检查键是否存在
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error('Failed to check cache existence', {
        key,
        error: error.message,
      });
      return false;
    }
  }

  // 设置缓存过期时间
  async expire(key: string, ttl: number): Promise<void> {
    try {
      await this.redis.expire(key, ttl);
    } catch (error) {
      this.logger.error('Failed to set cache expiration', {
        key,
        ttl,
        error: error.message,
      });
    }
  }

  // 获取缓存过期时间
  async ttl(key: string): Promise<number> {
    try {
      return await this.redis.ttl(key);
    } catch (error) {
      this.logger.error('Failed to get cache TTL', {
        key,
        error: error.message,
      });
      return -1;
    }
  }
}

// 3. 缓存装饰器
export function Cacheable(key: string, ttl: number = 300) {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor,
  ) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheService = this.cacheService;
      if (!cacheService) {
        return method.apply(this, args);
      }

      // 构建缓存键
      const cacheKey = typeof key === 'function' ? key(...args) : key;

      // 尝试从缓存获取
      let result = await cacheService.get(cacheKey);
      if (result !== null) {
        return result;
      }

      // 执行原方法
      result = await method.apply(this, args);

      // 设置缓存
      if (result !== null && result !== undefined) {
        await cacheService.set(cacheKey, result, ttl);
      }

      return result;
    };
  };
}

// 4. 缓存失效策略
export class CacheInvalidationService {
  constructor(
    private readonly cacheService: CacheService,
    private readonly logger: PinoLoggerService,
  ) {}

  // 用户相关缓存失效
  async invalidateUserCache(userId: string): Promise<void> {
    const patterns = [
      CacheKeyBuilder.userProfile(userId),
      CacheKeyBuilder.userPermissions(userId),
      CacheKeyBuilder.userRoles(userId),
      CacheKeyBuilder.userEffectivePermissions(userId),
      CacheKeyBuilder.userSession(userId),
    ];

    await this.invalidatePatterns(patterns);
  }

  // 组织相关缓存失效
  async invalidateOrganizationCache(orgId: string): Promise<void> {
    const patterns = [
      CacheKeyBuilder.organizationProfile(orgId),
      CacheKeyBuilder.organizationUsers(orgId),
      CacheKeyBuilder.organizationDepartments(orgId),
    ];

    await this.invalidatePatterns(patterns);
  }

  // 部门相关缓存失效
  async invalidateDepartmentCache(deptId: string): Promise<void> {
    const patterns = [
      CacheKeyBuilder.departmentProfile(deptId),
      CacheKeyBuilder.departmentUsers(deptId),
    ];

    await this.invalidatePatterns(patterns);
  }

  // 角色权限相关缓存失效
  async invalidateRoleCache(roleId: string): Promise<void> {
    const patterns = [CacheKeyBuilder.rolePermissions(roleId)];

    await this.invalidatePatterns(patterns);
  }

  // 批量失效缓存
  private async invalidatePatterns(patterns: string[]): Promise<void> {
    for (const pattern of patterns) {
      try {
        await this.cacheService.delPattern(pattern);
        this.logger.debug('Cache invalidated', { pattern });
      } catch (error) {
        this.logger.error('Failed to invalidate cache', {
          pattern,
          error: error.message,
        });
      }
    }
  }
}
```

#### 5.3 查询性能优化

**GraphQL 查询优化**

```typescript
// 1. 数据加载器（DataLoader）实现
@Injectable()
export class UserDataLoader {
  constructor(
    private readonly userService: UserService,
    private readonly cacheService: CacheService,
  ) {}

  // 批量加载用户
  private userLoader = new DataLoader(async (userIds: string[]) => {
    const users = await this.userService.findByIds(userIds);
    const userMap = new Map(users.map(user => [user.id, user]));

    return userIds.map(id => userMap.get(id) || null);
  });

  // 批量加载用户权限
  private userPermissionsLoader = new DataLoader(async (userIds: string[]) => {
    const permissions = await this.userService.getUsersPermissions(userIds);
    const permissionMap = new Map(
      permissions.map(p => [p.userId, p.permissions]),
    );

    return userIds.map(id => permissionMap.get(id) || []);
  });

  // 批量加载用户角色
  private userRolesLoader = new DataLoader(async (userIds: string[]) => {
    const roles = await this.userService.getUsersRoles(userIds);
    const roleMap = new Map(roles.map(r => [r.userId, r.roles]));

    return userIds.map(id => roleMap.get(id) || []);
  });

  // 获取用户
  async getUser(userId: string): Promise<User | null> {
    return this.userLoader.load(userId);
  }

  // 获取用户权限
  async getUserPermissions(userId: string): Promise<Permission[]> {
    return this.userPermissionsLoader.load(userId);
  }

  // 获取用户角色
  async getUserRoles(userId: string): Promise<Role[]> {
    return this.userRolesLoader.load(userId);
  }

  // 清除用户缓存
  clearUserCache(userId: string): void {
    this.userLoader.clear(userId);
    this.userPermissionsLoader.clear(userId);
    this.userRolesLoader.clear(userId);
  }
}

// 2. 查询复杂度限制
export class QueryComplexityAnalyzer {
  private static readonly MAX_COMPLEXITY = 1000;
  private static readonly FIELD_WEIGHTS = {
    User: 1,
    Organization: 2,
    Department: 2,
    Role: 1,
    Permission: 1,
    Tenant: 1,
  };

  static analyzeQuery(query: string, variables?: any): number {
    let complexity = 0;

    // 解析查询复杂度
    const ast = parse(query);
    const visitor = new QueryComplexityVisitor();
    visit(ast, visitor);

    complexity = visitor.getComplexity();

    if (complexity > this.MAX_COMPLEXITY) {
      throw new Error(
        `Query complexity ${complexity} exceeds maximum ${this.MAX_COMPLEXITY}`,
      );
    }

    return complexity;
  }
}

// 3. 查询结果缓存
@Injectable()
export class QueryCacheService {
  constructor(
    private readonly cacheService: CacheService,
    private readonly logger: PinoLoggerService,
  ) {}

  // 缓存查询结果
  async cacheQueryResult(
    query: string,
    variables: any,
    result: any,
    ttl: number = 300,
  ): Promise<void> {
    try {
      const queryHash = this.generateQueryHash(query, variables);
      const cacheKey = CacheKeyBuilder.queryResult(queryHash);

      await this.cacheService.set(
        cacheKey,
        {
          result,
          timestamp: Date.now(),
          ttl,
        },
        ttl,
      );
    } catch (error) {
      this.logger.error('Failed to cache query result', {
        error: error.message,
      });
    }
  }

  // 获取缓存的查询结果
  async getCachedQueryResult(
    query: string,
    variables: any,
  ): Promise<any | null> {
    try {
      const queryHash = this.generateQueryHash(query, variables);
      const cacheKey = CacheKeyBuilder.queryResult(queryHash);

      const cached = await this.cacheService.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < cached.ttl * 1000) {
        return cached.result;
      }

      return null;
    } catch (error) {
      this.logger.error('Failed to get cached query result', {
        error: error.message,
      });
      return null;
    }
  }

  // 生成查询哈希
  private generateQueryHash(query: string, variables: any): string {
    const queryString = JSON.stringify({ query, variables });
    return createHash('sha256').update(queryString).digest('hex');
  }
}

// 4. 分页查询优化
export class PaginationOptimizer {
  // 游标分页实现
  static createCursorPagination<T>(
    items: T[],
    pageSize: number,
    cursor?: string,
  ): CursorPaginationResult<T> {
    if (items.length === 0) {
      return {
        edges: [],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: null,
          endCursor: null,
        },
      };
    }

    const edges = items.map(item => ({
      node: item,
      cursor: Buffer.from(
        JSON.stringify({ id: item.id, timestamp: item.createdAt }),
      ).toString('base64'),
    }));

    const pageInfo = {
      hasNextPage: items.length === pageSize,
      hasPreviousPage: !!cursor,
      startCursor: edges[0]?.cursor || null,
      endCursor: edges[edges.length - 1]?.cursor || null,
    };

    return { edges, pageInfo };
  }

  // 偏移分页实现
  static createOffsetPagination<T>(
    items: T[],
    total: number,
    page: number,
    size: number,
  ): OffsetPaginationResult<T> {
    const totalPages = Math.ceil(total / size);

    return {
      data: items,
      pagination: {
        page,
        size,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }
}
```

### 部署架构

#### 5.4 容器化部署

**Docker 配置**

```dockerfile
# 多阶段构建 Dockerfile
FROM node:18-alpine AS base

# 安装 pnpm
RUN npm install -g pnpm

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# 安装依赖
RUN pnpm install --frozen-lockfile

# 构建阶段
FROM base AS builder

# 复制源代码
COPY . .

# 构建应用
RUN pnpm run build

# 生产阶段
FROM node:18-alpine AS production

# 安装 dumb-init 用于进程管理
RUN apk add --no-cache dumb-init

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# 设置工作目录
WORKDIR /app

# 复制构建产物
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./

# 切换到非 root 用户
USER nestjs

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node dist/health-check.js

# 启动应用
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
```

**Docker Compose 配置**

```yaml
# docker-compose.yml
version: '3.8'

services:
  # 主应用服务
  app:
    build: .
    container_name: saas-app
    restart: unless-stopped
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/saas
      - MONGODB_URL=mongodb://mongodb:27017/saas
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=your-jwt-secret
      - JWT_EXPIRES_IN=24h
    depends_on:
      - postgres
      - mongodb
      - redis
    networks:
      - saas-network
    volumes:
      - ./logs:/app/logs
      - ./uploads:/app/uploads

  # PostgreSQL 数据库
  postgres:
    image: postgres:15-alpine
    container_name: saas-postgres
    restart: unless-stopped
    environment:
      - POSTGRES_DB=saas
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-scripts:/docker-entrypoint-initdb.d
    networks:
      - saas-network
    command: >
      postgres
      -c max_connections=200
      -c shared_buffers=256MB
      -c effective_cache_size=1GB
      -c work_mem=4MB
      -c maintenance_work_mem=64MB
      -c checkpoint_completion_target=0.9
      -c wal_buffers=16MB
      -c default_statistics_target=100
      -c random_page_cost=1.1
      -c effective_io_concurrency=200

  # MongoDB 数据库
  mongodb:
    image: mongo:7.0
    container_name: saas-mongodb
    restart: unless-stopped
    environment:
      - MONGO_INITDB_DATABASE=saas
    ports:
      - '27017:27017'
    volumes:
      - mongodb_data:/data/db
      - ./mongo-init:/docker-entrypoint-initdb.d
    networks:
      - saas-network
    command: >
      mongod
      --wiredTigerCacheSizeGB 1
      --maxInMemorySortGB 1
      --setParameter maxTransactionLockRequestTimeoutMillis=5000

  # Redis 缓存
  redis:
    image: redis:7-alpine
    container_name: saas-redis
    restart: unless-stopped
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data
      - ./redis.conf:/usr/local/etc/redis/redis.conf
    networks:
      - saas-network
    command: redis-server /usr/local/etc/redis/redis.conf

  # Nginx 反向代理
  nginx:
    image: nginx:alpine
    container_name: saas-nginx
    restart: unless-stopped
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/conf.d:/etc/nginx/conf.d
      - ./ssl:/etc/nginx/ssl
      - ./logs/nginx:/var/log/nginx
    depends_on:
      - app
    networks:
      - saas-network

  # 监控服务
  prometheus:
    image: prom/prometheus:latest
    container_name: saas-prometheus
    restart: unless-stopped
    ports:
      - '9090:9090'
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    networks:
      - saas-network
    command: >
      --config.file=/etc/prometheus/prometheus.yml
      --storage.tsdb.path=/prometheus
      --web.console.libraries=/etc/prometheus/console_libraries
      --web.console.templates=/etc/prometheus/consoles
      --storage.tsdb.retention.time=200h
      --web.enable-lifecycle

  # Grafana 监控面板
  grafana:
    image: grafana/grafana:latest
    container_name: saas-grafana
    restart: unless-stopped
    ports:
      - '3001:3000'
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana/provisioning:/etc/grafana/provisioning
    networks:
      - saas-network

volumes:
  postgres_data:
  mongodb_data:
  redis_data:
  prometheus_data:
  grafana_data:

networks:
  saas-network:
    driver: bridge
```

#### 5.5 负载均衡与高可用

**Nginx 配置**

```nginx
# nginx/nginx.conf
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # 日志格式
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    # 基础配置
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 100M;

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # 上游服务器配置
    upstream app_servers {
        least_conn;
        server app:3000 max_fails=3 fail_timeout=30s;
        # 可以添加更多应用实例
        # server app2:3000 max_fails=3 fail_timeout=30s;
        # server app3:3000 max_fails=3 fail_timeout=30s;
    }

    # 限流配置
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;

    # 主服务器配置
    server {
        listen 80;
        server_name localhost;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name localhost;

        # SSL 配置
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;

        # 安全头
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

        # 客户端配置
        client_max_body_size 100M;
        client_body_timeout 60s;
        client_header_timeout 60s;

        # 代理配置
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
        proxy_send_timeout 300s;

        # 健康检查
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }

        # API 限流
        location /api/ {
            limit_req zone=api burst=20 nodelay;

            proxy_pass http://app_servers;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # 登录接口限流
        location /api/auth/login {
            limit_req zone=login burst=5 nodelay;

            proxy_pass http://app_servers;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # GraphQL 接口
        location /graphql {
            limit_req zone=api burst=20 nodelay;

            proxy_pass http://app_servers;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # 静态文件
        location /static/ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            proxy_pass http://app_servers;
        }

        # 默认代理
        location / {
            proxy_pass http://app_servers;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

#### 5.6 监控与日志

**Prometheus 配置**

```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - 'rules/*.yml'

scrape_configs:
  - job_name: 'saas-app'
    static_configs:
      - targets: ['app:3000']
    metrics_path: '/metrics'
    scrape_interval: 10s

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres:5432']
    metrics_path: '/metrics'
    scrape_interval: 30s

  - job_name: 'mongodb'
    static_configs:
      - targets: ['mongodb:27017']
    metrics_path: '/metrics'
    scrape_interval: 30s

  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']
    metrics_path: '/metrics'
    scrape_interval: 30s

  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx:80']
    metrics_path: '/nginx_status'
    scrape_interval: 30s
```

**应用监控指标**

```typescript
// 应用监控指标
import { Injectable } from '@nestjs/common';
import { register, Counter, Histogram, Gauge } from 'prom-client';

@Injectable()
export class MetricsService {
  // HTTP 请求计数器
  private httpRequestsTotal = new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
  });

  // HTTP 请求持续时间
  private httpRequestDuration = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'HTTP request duration in seconds',
    labelNames: ['method', 'route'],
    buckets: [0.1, 0.5, 1, 2, 5],
  });

  // 活跃连接数
  private activeConnections = new Gauge({
    name: 'active_connections',
    help: 'Number of active connections',
  });

  // 数据库查询计数器
  private databaseQueriesTotal = new Counter({
    name: 'database_queries_total',
    help: 'Total number of database queries',
    labelNames: ['database', 'operation'],
  });

  // 数据库查询持续时间
  private databaseQueryDuration = new Histogram({
    name: 'database_query_duration_seconds',
    help: 'Database query duration in seconds',
    labelNames: ['database', 'operation'],
    buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
  });

  // 缓存命中率
  private cacheHits = new Counter({
    name: 'cache_hits_total',
    help: 'Total number of cache hits',
  });

  private cacheMisses = new Counter({
    name: 'cache_misses_total',
    help: 'Total number of cache misses',
  });

  // 业务指标
  private activeUsers = new Gauge({
    name: 'active_users',
    help: 'Number of active users',
    labelNames: ['tenant_id'],
  });

  private totalUsers = new Gauge({
    name: 'total_users',
    help: 'Total number of users',
    labelNames: ['tenant_id'],
  });

  // 记录 HTTP 请求
  recordHttpRequest(
    method: string,
    route: string,
    statusCode: number,
    duration: number,
  ): void {
    this.httpRequestsTotal.inc({ method, route, status_code: statusCode });
    this.httpRequestDuration.observe({ method, route }, duration);
  }

  // 记录数据库查询
  recordDatabaseQuery(
    database: string,
    operation: string,
    duration: number,
  ): void {
    this.databaseQueriesTotal.inc({ database, operation });
    this.databaseQueryDuration.observe({ database, operation }, duration);
  }

  // 记录缓存命中
  recordCacheHit(): void {
    this.cacheHits.inc();
  }

  // 记录缓存未命中
  recordCacheMiss(): void {
    this.cacheMisses.inc();
  }

  // 更新活跃用户数
  updateActiveUsers(tenantId: string, count: number): void {
    this.activeUsers.set({ tenant_id: tenantId }, count);
  }

  // 更新总用户数
  updateTotalUsers(tenantId: string, count: number): void {
    this.totalUsers.set({ tenant_id: tenantId }, count);
  }

  // 获取指标
  getMetrics(): string {
    return register.metrics();
  }
}
```

**日志配置**

```typescript
// 日志配置
import { LoggerService } from '@nestjs/common';
import { PinoLoggerService } from '@aiofix/logging';

@Injectable()
export class LoggingService implements LoggerService {
  constructor(private readonly pinoLogger: PinoLoggerService) {}

  log(message: any, context?: string): void {
    this.pinoLogger.info(message, { context });
  }

  error(message: any, trace?: string, context?: string): void {
    this.pinoLogger.error(message, { trace, context });
  }

  warn(message: any, context?: string): void {
    this.pinoLogger.warn(message, { context });
  }

  debug(message: any, context?: string): void {
    this.pinoLogger.debug(message, { context });
  }

  verbose(message: any, context?: string): void {
    this.pinoLogger.trace(message, { context });
  }
}

// 日志中间件
@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  constructor(private readonly logger: LoggingService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const startTime = Date.now();
    const { method, url, headers, body } = req;

    // 记录请求开始
    this.logger.log(`Request started: ${method} ${url}`, 'HTTP');

    // 响应完成后的日志记录
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const { statusCode } = res;

      this.logger.log(
        `Request completed: ${method} ${url} - ${statusCode} (${duration}ms)`,
        'HTTP',
      );

      // 记录慢请求
      if (duration > 1000) {
        this.logger.warn(
          `Slow request detected: ${method} ${url} - ${duration}ms`,
          'HTTP',
        );
      }

      // 记录错误请求
      if (statusCode >= 400) {
        this.logger.error(
          `Request failed: ${method} ${url} - ${statusCode}`,
          undefined,
          'HTTP',
        );
      }
    });

    next();
  }
}
```

---

**文档版本**: v1.0.0  
**创建日期**: 2024-12-19  
**适用范围**: SAAS平台性能优化与部署指导
