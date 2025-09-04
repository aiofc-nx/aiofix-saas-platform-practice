# SAAS平台测试策略与架构

## 🧪 测试策略与架构设计

### 测试策略

#### 6.1 测试金字塔

```
┌─────────────────────────────────────────────────────────────┐
│                    E2E Tests                               │
│                 (端到端测试)                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   User      │  │  Business   │  │ Integration │        │
│  │  Journey    │  │   Flow      │  │   Tests     │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                 Integration Tests                          │
│                   (集成测试)                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   API       │  │  Database   │  │  External   │        │
│  │  Tests      │  │   Tests     │  │   Service   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                    Unit Tests                              │
│                   (单元测试)                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Domain     │  │ Application │  │Infrastructure│        │
│  │  Logic      │  │   Layer     │  │    Layer    │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

#### 6.2 测试覆盖率目标

- **单元测试**: 90%+
- **集成测试**: 80%+
- **E2E测试**: 70%+
- **总体覆盖率**: 85%+

### 单元测试

#### 6.3 领域层测试

```typescript
// 用户聚合根测试
describe('UserAggregate', () => {
  let userAggregate: UserAggregate;

  beforeEach(() => {
    userAggregate = UserAggregate.create(
      'testuser',
      'test@example.com',
      'password123',
      'tenant-123',
    );
  });

  describe('create', () => {
    it('should create a new user with valid data', () => {
      expect(userAggregate).toBeDefined();
      expect(userAggregate.username).toBe('testuser');
      expect(userAggregate.email).toBe('test@example.com');
      expect(userAggregate.status).toBe(UserStatus.ACTIVE);
    });

    it('should generate a unique ID', () => {
      expect(userAggregate.id).toBeDefined();
      expect(typeof userAggregate.id).toBe('string');
    });

    it('should set creation timestamp', () => {
      expect(userAggregate.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('changeEmail', () => {
    it('should change email successfully', () => {
      const newEmail = 'newemail@example.com';
      userAggregate.changeEmail(newEmail);

      expect(userAggregate.email).toBe(newEmail);
      expect(userAggregate.updatedAt).toBeInstanceOf(Date);
    });

    it('should throw error for invalid email', () => {
      expect(() => {
        userAggregate.changeEmail('invalid-email');
      }).toThrow(InvalidEmailException);
    });
  });

  describe('deactivate', () => {
    it('should deactivate user', () => {
      userAggregate.deactivate();

      expect(userAggregate.status).toBe(UserStatus.INACTIVE);
      expect(userAggregate.updatedAt).toBeInstanceOf(Date);
    });
  });
});
```

#### 6.4 应用层测试

```typescript
// 用户用例测试
describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockEventBus: jest.Mocked<EventBus>;

  beforeEach(() => {
    mockUserRepository = createMockUserRepository();
    mockEventBus = createMockEventBus();

    useCase = new CreateUserUseCase(mockUserRepository, mockEventBus);
  });

  describe('execute', () => {
    it('should create user successfully', async () => {
      const request = new CreateUserRequest(
        'testuser',
        'test@example.com',
        'password123',
        'tenant-123',
      );

      const result = await useCase.execute(request);

      expect(result.success).toBe(true);
      expect(result.userId).toBeDefined();
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(mockEventBus.publishAll).toHaveBeenCalled();
    });

    it('should throw error for duplicate email', async () => {
      mockUserRepository.existsByEmail.mockResolvedValue(true);

      const request = new CreateUserRequest(
        'testuser',
        'test@example.com',
        'password123',
        'tenant-123',
      );

      await expect(useCase.execute(request)).rejects.toThrow(
        UserEmailAlreadyExistsException,
      );
    });
  });
});
```

### 集成测试

#### 6.5 API 集成测试

```typescript
// 用户API集成测试
describe('UserController (e2e)', () => {
  let app: INestApplication;
  let userRepository: UserRepository;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(getDataSourceToken())
      .useValue(createTestDataSource())
      .compile();

    app = moduleFixture.createNestApplication();
    userRepository = moduleFixture.get<UserRepository>(UserRepository);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await userRepository.clear();
  });

  describe('/users (POST)', () => {
    it('should create user', async () => {
      const createUserDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        tenantId: 'tenant-123',
      };

      const response = await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.userId).toBeDefined();
    });

    it('should return 400 for invalid data', async () => {
      const invalidDto = {
        username: '',
        email: 'invalid-email',
        password: '123',
      };

      await request(app.getHttpServer())
        .post('/users')
        .send(invalidDto)
        .expect(400);
    });
  });

  describe('/users/:id (GET)', () => {
    it('should return user by id', async () => {
      const user = await userRepository.save(
        UserAggregate.create(
          'testuser',
          'test@example.com',
          'password123',
          'tenant-123',
        ),
      );

      const response = await request(app.getHttpServer())
        .get(`/users/${user.id}`)
        .expect(200);

      expect(response.body.id).toBe(user.id);
      expect(response.body.username).toBe('testuser');
    });
  });
});
```

#### 6.6 数据库集成测试

```typescript
// 数据库集成测试
describe('UserRepository Integration', () => {
  let dataSource: DataSource;
  let userRepository: UserRepository;

  beforeAll(async () => {
    dataSource = await createTestDataSource();
    userRepository = new UserRepository(dataSource);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  beforeEach(async () => {
    await dataSource.synchronize(true);
  });

  describe('save', () => {
    it('should save user to database', async () => {
      const user = UserAggregate.create(
        'testuser',
        'test@example.com',
        'password123',
        'tenant-123',
      );

      await userRepository.save(user);

      const savedUser = await userRepository.findById(user.id);
      expect(savedUser).toBeDefined();
      expect(savedUser.username).toBe('testuser');
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const user = UserAggregate.create(
        'testuser',
        'test@example.com',
        'password123',
        'tenant-123',
      );

      await userRepository.save(user);

      const foundUser = await userRepository.findByEmail('test@example.com');
      expect(foundUser).toBeDefined();
      expect(foundUser.id).toBe(user.id);
    });
  });
});
```

### E2E 测试

#### 6.7 用户旅程测试

```typescript
// 用户注册登录E2E测试
describe('User Authentication Flow (e2e)', () => {
  let app: INestApplication;
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    browser = await puppeteer.launch();
    page = await browser.newPage();
  });

  afterAll(async () => {
    await browser.close();
    await app.close();
  });

  it('should complete user registration and login flow', async () => {
    // 1. 访问注册页面
    await page.goto('http://localhost:3000/register');

    // 2. 填写注册表单
    await page.type('#username', 'testuser');
    await page.type('#email', 'test@example.com');
    await page.type('#password', 'password123');
    await page.type('#confirmPassword', 'password123');

    // 3. 提交注册
    await page.click('#registerButton');

    // 4. 等待注册成功
    await page.waitForSelector('.success-message');

    // 5. 访问登录页面
    await page.goto('http://localhost:3000/login');

    // 6. 填写登录表单
    await page.type('#email', 'test@example.com');
    await page.type('#password', 'password123');

    // 7. 提交登录
    await page.click('#loginButton');

    // 8. 验证登录成功
    await page.waitForSelector('.dashboard');

    const dashboardText = await page.$eval('.dashboard', el => el.textContent);
    expect(dashboardText).toContain('Welcome');
  });
});
```

### 性能测试

#### 6.8 负载测试

```typescript
// 性能测试配置
export const performanceTestConfig = {
  stages: [
    { duration: '2m', target: 100 }, // 2分钟内增加到100用户
    { duration: '5m', target: 100 }, // 保持100用户5分钟
    { duration: '2m', target: 200 }, // 2分钟内增加到200用户
    { duration: '5m', target: 200 }, // 保持200用户5分钟
    { duration: '2m', target: 0 }, // 2分钟内减少到0用户
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95%的请求在500ms内完成
    http_req_failed: ['rate<0.01'], // 错误率小于1%
  },
};

// 用户创建性能测试
export default function () {
  const url = 'http://localhost:3000/api/users';
  const payload = JSON.stringify({
    username: `user_${Date.now()}`,
    email: `user_${Date.now()}@example.com`,
    password: 'password123',
    tenantId: 'tenant-123',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const response = http.post(url, payload, params);

  check(response, {
    'status is 201': r => r.status === 201,
    'response time < 500ms': r => r.timings.duration < 500,
  });
}
```

### CI/CD 流水线

#### 6.9 GitHub Actions 配置

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: saas_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

      mongodb:
        image: mongo:7.0
        ports:
          - 27017:27017

      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linting
        run: npm run lint

      - name: Run unit tests
        run: npm run test:unit
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/saas_test
          MONGODB_URL: mongodb://localhost:27017/saas_test
          REDIS_URL: redis://localhost:6379

      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/saas_test
          MONGODB_URL: mongodb://localhost:27017/saas_test
          REDIS_URL: redis://localhost:6379

      - name: Run E2E tests
        run: npm run test:e2e
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/saas_test
          MONGODB_URL: mongodb://localhost:27017/saas_test
          REDIS_URL: redis://localhost:6379

      - name: Generate coverage report
        run: npm run test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build

      - name: Build Docker image
        run: docker build -t saas-app:${{ github.sha }} .

      - name: Push to registry
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker tag saas-app:${{ github.sha }} ${{ secrets.DOCKER_USERNAME }}/saas-app:${{ github.sha }}
          docker push ${{ secrets.DOCKER_USERNAME }}/saas-app:${{ github.sha }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Deploy to staging
        run: |
          echo "Deploying to staging environment..."
          # 部署脚本

      - name: Run smoke tests
        run: |
          echo "Running smoke tests..."
          # 冒烟测试脚本

      - name: Deploy to production
        run: |
          echo "Deploying to production environment..."
          # 生产环境部署脚本
```

### 测试工具配置

#### 6.10 Jest 配置

```typescript
// jest.config.ts
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/main.ts',
    '!src/**/index.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  testTimeout: 10000,
};
```

#### 6.11 测试数据工厂

```typescript
// 测试数据工厂
export class TestDataFactory {
  static createUser(overrides: Partial<User> = {}): User {
    return {
      id: 'user-123',
      username: 'testuser',
      email: 'test@example.com',
      status: UserStatus.ACTIVE,
      tenantId: 'tenant-123',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  static createTenant(overrides: Partial<Tenant> = {}): Tenant {
    return {
      id: 'tenant-123',
      name: 'Test Tenant',
      code: 'TEST',
      status: TenantStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  static createOrganization(
    overrides: Partial<Organization> = {},
  ): Organization {
    return {
      id: 'org-123',
      name: 'Test Organization',
      code: 'TEST_ORG',
      tenantId: 'tenant-123',
      status: OrganizationStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }
}
```

---

**文档版本**: v1.0.0  
**创建日期**: 2024-12-19  
**适用范围**: SAAS平台测试策略与架构指导
