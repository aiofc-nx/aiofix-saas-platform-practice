/**
 * @file data-isolation.guard.spec.ts
 * @description 数据隔离守卫单元测试
 *
 * 测试数据隔离守卫的核心功能，包括：
 * - API请求的租户上下文验证
 * - 数据访问权限检查
 * - 跨租户访问防护
 * - 数据隔离审计
 * - 装饰器功能
 */

import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import {
  DataIsolationGuard,
  RequireDataIsolation,
  SkipDataIsolation,
  DefaultTenantContextProvider,
  TenantContextProvider,
} from './data-isolation.guard';
import { DataIsolationService } from '../../domain/services/data-isolation.service';
import {
  DataIsolationAwareEntity,
  DataIsolationLevel,
  DataPrivacyLevel,
  TenantContext,
} from '../../domain/entities/data-isolation-aware.entity';
import { Uuid } from '../../domain/value-objects/uuid.vo';

/**
 * @class TestEntity
 * @description 测试用的数据隔离感知实体
 */
class TestEntity extends DataIsolationAwareEntity {
  constructor(
    id: Uuid,
    tenantId: Uuid,
    organizationId?: Uuid,
    departmentIds: Uuid[] = [],
    dataIsolationLevel: DataIsolationLevel = DataIsolationLevel.TENANT,
    dataPrivacyLevel: DataPrivacyLevel = DataPrivacyLevel.PROTECTED,
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
  }

  getTestId(): Uuid {
    return this.id;
  }
}

describe('DataIsolationGuard', () => {
  let guard: DataIsolationGuard;
  let dataIsolationService: jest.Mocked<DataIsolationService>;
  let tenantContextProvider: jest.Mocked<unknown>;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(async () => {
    const mockDataIsolationService = {
      validateTenantContext: jest.fn(),
      validateDataAccess: jest.fn(),
      auditDataAccess: jest.fn(),
    };

    const mockTenantContextProvider = {
      getTenantContext: jest.fn(),
    };

    const mockReflector = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DataIsolationGuard,
        {
          provide: DataIsolationService,
          useValue: mockDataIsolationService,
        },
        {
          provide: 'TenantContextProvider',
          useValue: mockTenantContextProvider,
        },
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile();

    guard = module.get<DataIsolationGuard>(DataIsolationGuard);
    dataIsolationService = module.get(DataIsolationService);
    tenantContextProvider = module.get('TenantContextProvider');
    reflector = module.get(Reflector);
  });

  describe('canActivate', () => {
    it('should allow access when skipDataIsolation is true', async () => {
      const mockContext = {
        getHandler: jest.fn().mockReturnValue({}),
      } as unknown as ExecutionContext;

      reflector.get.mockReturnValue(true);

      const result = await guard.canActivate(mockContext);

      expect(result).toBe(true);
    });

    it('should deny access when tenant context is null', async () => {
      const mockContext = {
        getHandler: jest.fn().mockReturnValue({}),
      } as unknown as ExecutionContext;

      reflector.get.mockReturnValue(false);
      tenantContextProvider.getTenantContext.mockResolvedValue(null);

      const result = await guard.canActivate(mockContext);

      expect(result).toBe(false);
    });

    it('should deny access when tenant context validation fails', async () => {
      const mockContext = {
        getHandler: jest.fn().mockReturnValue({}),
      } as unknown as ExecutionContext;

      const tenantContext: TenantContext = {
        tenantId: 'tenant-123',
        organizationId: undefined,
        departmentIds: [],
        isolationLevel: DataIsolationLevel.TENANT,
      };

      reflector.get.mockReturnValue(false);
      tenantContextProvider.getTenantContext.mockResolvedValue(tenantContext);
      dataIsolationService.validateTenantContext.mockReturnValue({
        isValid: false,
        errors: ['Invalid tenant context'],
      });

      const result = await guard.canActivate(mockContext);

      expect(result).toBe(false);
    });

    it('should allow access when all validations pass', async () => {
      const mockContext = {
        getHandler: jest.fn().mockReturnValue({}),
      } as unknown as ExecutionContext;

      const tenantContext: TenantContext = {
        tenantId: 'tenant-123',
        organizationId: undefined,
        departmentIds: [],
        isolationLevel: DataIsolationLevel.TENANT,
      };

      reflector.get.mockReturnValue(false);
      tenantContextProvider.getTenantContext.mockResolvedValue(tenantContext);
      dataIsolationService.validateTenantContext.mockReturnValue({
        isValid: true,
        errors: [],
      });

      const result = await guard.canActivate(mockContext);

      expect(result).toBe(true);
    });

    it('should deny access when isolation level mismatch', async () => {
      const mockContext = {
        getHandler: jest.fn().mockReturnValue({}),
      } as unknown as ExecutionContext;

      const tenantContext: TenantContext = {
        tenantId: 'tenant-123',
        organizationId: undefined,
        departmentIds: [],
        isolationLevel: DataIsolationLevel.ORGANIZATION,
      };

      reflector.get.mockReturnValue(false);
      tenantContextProvider.getTenantContext.mockResolvedValue(tenantContext);
      dataIsolationService.validateTenantContext.mockReturnValue({
        isValid: true,
        errors: [],
      });

      const result = await guard.canActivate(mockContext);

      expect(result).toBe(false);
    });
  });

  describe('handleRequest', () => {
    it('should allow access when data access validation passes', async () => {
      const mockContext = {} as ExecutionContext;
      const user = new TestEntity(
        Uuid.generate(),
        Uuid.generate(),
        undefined,
        [],
        DataIsolationLevel.TENANT,
        DataPrivacyLevel.PROTECTED,
      );
      const target = new TestEntity(
        Uuid.generate(),
        Uuid.generate(),
        undefined,
        [],
        DataIsolationLevel.TENANT,
        DataPrivacyLevel.PROTECTED,
      );

      dataIsolationService.validateDataAccess.mockReturnValue({
        isAllowed: true,
        reason: 'Access granted',
      });
      dataIsolationService.auditDataAccess.mockReturnValue({
        timestamp: new Date(),
        sourceId: user.id.value,
        targetId: target.id.value,
        accessAllowed: true,
        reason: 'Access granted',
      });

      const result = await guard.handleRequest(
        mockContext,
        user,
        target,
        DataIsolationLevel.TENANT,
      );

      expect(result).toBe('result');
      expect(dataIsolationService.validateDataAccess).toHaveBeenCalled();
      expect(dataIsolationService.auditDataAccess).toHaveBeenCalled();
    });

    it('should throw ForbiddenException when data access validation fails', async () => {
      const mockContext = {} as ExecutionContext;
      const user = new TestEntity(
        Uuid.generate(),
        Uuid.generate(),
        undefined,
        [],
        DataIsolationLevel.TENANT,
        DataPrivacyLevel.PROTECTED,
      );
      const target = new TestEntity(
        Uuid.generate(),
        Uuid.generate(),
        undefined,
        [],
        DataIsolationLevel.TENANT,
        DataPrivacyLevel.PROTECTED,
      );

      dataIsolationService.validateDataAccess.mockReturnValue({
        isAllowed: false,
        reason: 'Access denied',
      });
      dataIsolationService.auditDataAccess.mockReturnValue({
        timestamp: new Date(),
        sourceId: user.id.value,
        targetId: target.id.value,
        accessAllowed: false,
        reason: 'Access denied',
      });

      await expect(
        guard.handleRequest(
          mockContext,
          user,
          target,
          DataIsolationLevel.TENANT,
        ),
      ).rejects.toThrow(ForbiddenException);

      expect(dataIsolationService.validateDataAccess).toHaveBeenCalled();
      expect(dataIsolationService.auditDataAccess).toHaveBeenCalled();
    });
  });

  describe('getRequiredIsolationLevel', () => {
    it('should return default isolation level when no metadata', () => {
      const mockContext = {
        getHandler: jest.fn().mockReturnValue({}),
      } as unknown as ExecutionContext;

      reflector.get.mockReturnValue(undefined);

      const result = guard.getRequiredIsolationLevel(mockContext);

      expect(result).toBe(DataIsolationLevel.TENANT);
    });

    it('should return metadata isolation level when available', () => {
      const mockContext = {
        getHandler: jest.fn().mockReturnValue({}),
      } as unknown as ExecutionContext;

      reflector.get.mockReturnValue(DataIsolationLevel.ORGANIZATION);

      const result = guard.getRequiredIsolationLevel(mockContext);

      expect(result).toBe(DataIsolationLevel.ORGANIZATION);
    });
  });
});

describe('RequireDataIsolation Decorator', () => {
  it('should set metadata for data isolation level', () => {
    class TestClass {
      @RequireDataIsolation(DataIsolationLevel.ORGANIZATION)
      testMethod() {}
    }

    const instance = new TestClass();
    const metadata = Reflect.getMetadata(
      'dataIsolationLevel',
      instance.testMethod,
    );

    expect(metadata).toBe(DataIsolationLevel.ORGANIZATION);
  });
});

describe('SkipDataIsolation Decorator', () => {
  it('should set metadata to skip data isolation', () => {
    class TestClass {
      @SkipDataIsolation()
      testMethod() {}
    }

    const instance = new TestClass();
    const metadata = Reflect.getMetadata(
      'skipDataIsolation',
      instance.testMethod,
    );

    expect(metadata).toBe(true);
  });
});

describe('DefaultTenantContextProvider', () => {
  let provider: DefaultTenantContextProvider;
  let mockExecutionContext: ExecutionContext;

  beforeEach(() => {
    provider = new DefaultTenantContextProvider();
  });

  describe('getTenantContext', () => {
    it('should extract tenant context from headers', async () => {
      const mockRequest = {
        headers: {
          'x-tenant-id': 'tenant-123',
          'x-organization-id': 'org-456',
          'x-department-ids': 'dept-1,dept-2',
          'x-isolation-level': DataIsolationLevel.ORGANIZATION,
        },
        body: {},
        query: {},
        params: {},
      };

      mockExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as unknown as ExecutionContext;

      const result = await provider.getTenantContext(mockExecutionContext);

      expect(result).toEqual({
        tenantId: 'tenant-123',
        organizationId: 'org-456',
        departmentIds: ['dept-1', 'dept-2'],
        isolationLevel: DataIsolationLevel.ORGANIZATION,
      });
    });

    it('should extract tenant context from body when headers not available', async () => {
      const mockRequest = {
        headers: {},
        body: {
          tenantId: 'tenant-123',
          organizationId: 'org-456',
          departmentIds: ['dept-1', 'dept-2'],
          isolationLevel: DataIsolationLevel.DEPARTMENT,
        },
        query: {},
        params: {},
      };

      mockExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as unknown as ExecutionContext;

      const result = await provider.getTenantContext(mockExecutionContext);

      expect(result).toEqual({
        tenantId: 'tenant-123',
        organizationId: 'org-456',
        departmentIds: ['dept-1', 'dept-2'],
        isolationLevel: DataIsolationLevel.DEPARTMENT,
      });
    });

    it('should extract tenant context from query parameters when body not available', async () => {
      const mockRequest = {
        headers: {},
        body: {},
        query: {
          tenantId: 'tenant-123',
          organizationId: 'org-456',
          departmentIds: 'dept-1,dept-2',
          isolationLevel: DataIsolationLevel.TENANT,
        },
        params: {},
      };

      mockExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as unknown as ExecutionContext;

      const result = await provider.getTenantContext(mockExecutionContext);

      expect(result).toEqual({
        tenantId: 'tenant-123',
        organizationId: 'org-456',
        departmentIds: ['dept-1', 'dept-2'],
        isolationLevel: DataIsolationLevel.TENANT,
      });
    });

    it('should extract tenant context from path parameters when query not available', async () => {
      const mockRequest = {
        headers: {},
        body: {},
        query: {},
        params: {
          tenantId: 'tenant-123',
          organizationId: 'org-456',
          departmentIds: 'dept-1,dept-2',
          isolationLevel: DataIsolationLevel.USER,
        },
      };

      mockExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as unknown as ExecutionContext;

      const result = await provider.getTenantContext(mockExecutionContext);

      expect(result).toEqual({
        tenantId: 'tenant-123',
        organizationId: 'org-456',
        departmentIds: ['dept-1', 'dept-2'],
        isolationLevel: DataIsolationLevel.USER,
      });
    });

    it('should return null when no tenant ID found', async () => {
      const mockRequest = {
        headers: {},
        body: {},
        query: {},
        params: {},
      };

      mockExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as unknown as ExecutionContext;

      const result = await provider.getTenantContext(mockExecutionContext);

      expect(result).toBeNull();
    });

    it('should handle array department IDs from query parameters', async () => {
      const mockRequest = {
        headers: {},
        body: {},
        query: {
          tenantId: 'tenant-123',
          departmentIds: ['dept-1', 'dept-2'],
        },
        params: {},
      };

      mockExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as unknown as ExecutionContext;

      const result = await provider.getTenantContext(mockExecutionContext);

      expect(result?.departmentIds).toEqual(['dept-1', 'dept-2']);
    });

    it('should use default isolation level when not specified', async () => {
      const mockRequest = {
        headers: {
          'x-tenant-id': 'tenant-123',
        },
        body: {},
        query: {},
        params: {},
      };

      mockExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as unknown as ExecutionContext;

      const result = await provider.getTenantContext(mockExecutionContext);

      expect(result?.isolationLevel).toBe(DataIsolationLevel.TENANT);
    });
  });
});
