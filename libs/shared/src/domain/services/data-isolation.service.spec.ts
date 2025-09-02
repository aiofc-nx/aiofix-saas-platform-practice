/**
 * @file data-isolation.service.spec.ts
 * @description 数据隔离服务单元测试
 *
 * 测试数据隔离服务的核心功能，包括：
 * - 数据访问权限验证
 * - 跨层级数据访问控制
 * - 数据隔离策略管理
 * - 数据隔离审计
 */

import { Test, TestingModule } from '@nestjs/testing';
import { DataIsolationService } from './data-isolation.service';
import {
  DataIsolationAwareEntity,
  DataIsolationLevel,
  DataPrivacyLevel,
  TenantAccessDeniedError,
} from '../entities/data-isolation-aware.entity';
import { Uuid } from '../value-objects/uuid.vo';

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
    userId?: Uuid
  ) {
    super(
      tenantId,
      dataIsolationLevel,
      dataPrivacyLevel,
      id,
      organizationId,
      departmentIds,
      userId
    );
  }

  getTestId(): Uuid {
    return this.id;
  }
}

describe('DataIsolationService', () => {
  let service: DataIsolationService;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [DataIsolationService],
    }).compile();

    service = module.get<DataIsolationService>(DataIsolationService);
  });

  afterEach(async () => {
    await module.close();
  });

  describe('validateDataAccess', () => {
    it('should allow access to shared data in same tenant', () => {
      const tenantId = Uuid.generate();
      const source = new TestEntity(
        Uuid.generate(),
        tenantId,
        undefined,
        [],
        DataIsolationLevel.TENANT,
        DataPrivacyLevel.PROTECTED
      );

      const target = new TestEntity(
        Uuid.generate(),
        tenantId,
        undefined,
        [],
        DataIsolationLevel.TENANT,
        DataPrivacyLevel.SHARED
      );

      const request = {
        source,
        target,
        requestedLevel: DataIsolationLevel.TENANT,
      };

      const result = service.validateDataAccess(request);

      expect(result.isAllowed).toBe(true);
      expect(result.reason).toBe('同一租户内访问');
    });

    it('should deny access to protected data in different tenant', () => {
      const source = new TestEntity(
        Uuid.generate(),
        Uuid.generate(),
        undefined,
        [],
        DataIsolationLevel.TENANT,
        DataPrivacyLevel.PROTECTED
      );

      const target = new TestEntity(
        Uuid.generate(),
        Uuid.generate(),
        undefined,
        [],
        DataIsolationLevel.TENANT,
        DataPrivacyLevel.PROTECTED
      );

      const request = {
        source,
        target,
        requestedLevel: DataIsolationLevel.TENANT,
      };

      const result = service.validateDataAccess(request);

      expect(result.isAllowed).toBe(false);
      expect(result.reason).toContain('跨租户访问被拒绝');
    });

    it('should allow access to platform level shared data', () => {
      const tenantId = Uuid.generate();
      const source = new TestEntity(
        Uuid.generate(),
        tenantId,
        undefined,
        [],
        DataIsolationLevel.PLATFORM,
        DataPrivacyLevel.SHARED
      );

      const target = new TestEntity(
        Uuid.generate(),
        tenantId,
        undefined,
        [],
        DataIsolationLevel.PLATFORM,
        DataPrivacyLevel.SHARED
      );

      const request = {
        source,
        target,
        requestedLevel: DataIsolationLevel.PLATFORM,
      };

      const result = service.validateDataAccess(request);

      expect(result.isAllowed).toBe(true);
      expect(result.reason).toContain('平台级可共享数据访问允许');
    });

    it('should allow organization level access within same tenant', () => {
      const tenantId = Uuid.generate();
      const organizationId = Uuid.generate();

      const source = new TestEntity(
        Uuid.generate(),
        tenantId,
        organizationId,
        [],
        DataIsolationLevel.ORGANIZATION,
        DataPrivacyLevel.PROTECTED
      );

      const target = new TestEntity(
        Uuid.generate(),
        tenantId,
        organizationId,
        [],
        DataIsolationLevel.ORGANIZATION,
        DataPrivacyLevel.PROTECTED
      );

      const request = {
        source,
        target,
        requestedLevel: DataIsolationLevel.ORGANIZATION,
      };

      const result = service.validateDataAccess(request);

      expect(result.isAllowed).toBe(true);
      expect(result.reason).toContain('同一组织内访问');
    });

    it('should deny organization level access for different organizations', () => {
      const tenantId = Uuid.generate();

      const source = new TestEntity(
        Uuid.generate(),
        tenantId,
        Uuid.generate(),
        [],
        DataIsolationLevel.ORGANIZATION,
        DataPrivacyLevel.PROTECTED
      );

      const target = new TestEntity(
        Uuid.generate(),
        tenantId,
        Uuid.generate(),
        [],
        DataIsolationLevel.ORGANIZATION,
        DataPrivacyLevel.PROTECTED
      );

      const request = {
        source,
        target,
        requestedLevel: DataIsolationLevel.ORGANIZATION,
      };

      const result = service.validateDataAccess(request);

      expect(result.isAllowed).toBe(false);
      expect(result.reason).toContain('跨组织访问被拒绝');
    });

    it('should allow department level access within same organization', () => {
      const tenantId = Uuid.generate();
      const organizationId = Uuid.generate();
      const departmentId = Uuid.generate();

      const source = new TestEntity(
        Uuid.generate(),
        tenantId,
        organizationId,
        [departmentId],
        DataIsolationLevel.DEPARTMENT,
        DataPrivacyLevel.PROTECTED
      );

      const target = new TestEntity(
        Uuid.generate(),
        tenantId,
        organizationId,
        [departmentId],
        DataIsolationLevel.DEPARTMENT,
        DataPrivacyLevel.PROTECTED
      );

      const request = {
        source,
        target,
        requestedLevel: DataIsolationLevel.DEPARTMENT,
      };

      const result = service.validateDataAccess(request);

      expect(result.isAllowed).toBe(true);
      expect(result.reason).toContain('同一部门内访问');
    });

    it('should deny department level access for different departments', () => {
      const tenantId = Uuid.generate();
      const organizationId = Uuid.generate();

      const source = new TestEntity(
        Uuid.generate(),
        tenantId,
        organizationId,
        [Uuid.generate()],
        DataIsolationLevel.DEPARTMENT,
        DataPrivacyLevel.PROTECTED
      );

      const target = new TestEntity(
        Uuid.generate(),
        tenantId,
        organizationId,
        [Uuid.generate()],
        DataIsolationLevel.DEPARTMENT,
        DataPrivacyLevel.PROTECTED
      );

      const request = {
        source,
        target,
        requestedLevel: DataIsolationLevel.DEPARTMENT,
      };

      const result = service.validateDataAccess(request);

      expect(result.isAllowed).toBe(false);
      expect(result.reason).toContain('跨部门访问被拒绝');
    });

    it('should allow user level access for same user', () => {
      const tenantId = Uuid.generate();
      const userId = Uuid.generate();

      const source = new TestEntity(
        userId,
        tenantId,
        undefined,
        [],
        DataIsolationLevel.USER,
        DataPrivacyLevel.PROTECTED,
        userId
      );

      const target = new TestEntity(
        userId,
        tenantId,
        undefined,
        [],
        DataIsolationLevel.USER,
        DataPrivacyLevel.PROTECTED,
        userId
      );

      const request = {
        source,
        target,
        requestedLevel: DataIsolationLevel.USER,
      };

      const result = service.validateDataAccess(request);

      expect(result.isAllowed).toBe(true);
      expect(result.reason).toContain('用户本人访问允许');
    });

    it('should deny user level access for different users', () => {
      const tenantId = Uuid.generate();

      const source = new TestEntity(
        Uuid.generate(),
        tenantId,
        undefined,
        [],
        DataIsolationLevel.USER,
        DataPrivacyLevel.PROTECTED,
        Uuid.generate()
      );

      const target = new TestEntity(
        Uuid.generate(),
        tenantId,
        undefined,
        [],
        DataIsolationLevel.USER,
        DataPrivacyLevel.PROTECTED,
        Uuid.generate()
      );

      const request = {
        source,
        target,
        requestedLevel: DataIsolationLevel.USER,
      };

      const result = service.validateDataAccess(request);

      expect(result.isAllowed).toBe(false);
      expect(result.reason).toContain('用户级受保护数据访问被拒绝');
    });
  });

  describe('validateByIsolationLevel', () => {
    it('should validate correct isolation level', () => {
      const tenantId = Uuid.generate();
      const source = new TestEntity(
        Uuid.generate(),
        tenantId,
        undefined,
        [],
        DataIsolationLevel.TENANT,
        DataPrivacyLevel.PROTECTED
      );

      const target = new TestEntity(
        Uuid.generate(),
        tenantId,
        undefined,
        [],
        DataIsolationLevel.TENANT,
        DataPrivacyLevel.PROTECTED
      );

      const result = service.validateByIsolationLevel(
        source,
        target,
        DataIsolationLevel.TENANT
      );

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid isolation level', () => {
      const source = new TestEntity(
        Uuid.generate(),
        Uuid.generate(),
        undefined,
        [],
        DataIsolationLevel.TENANT,
        DataPrivacyLevel.PROTECTED
      );

      const target = new TestEntity(
        Uuid.generate(),
        Uuid.generate(),
        undefined,
        [],
        DataIsolationLevel.ORGANIZATION,
        DataPrivacyLevel.PROTECTED
      );

      const result = service.validateByIsolationLevel(
        source,
        target,
        DataIsolationLevel.ORGANIZATION
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors[0]).toContain('跨租户访问被拒绝');
    });
  });

  describe('setIsolationPolicy', () => {
    it('should set isolation policy correctly', () => {
      const policy = {
        allowCrossLevelAccess: true,
        allowCrossTenantAccess: false,
        auditAllAccess: true,
        auditEnabled: true,
      };

      service.setIsolationPolicy(policy);

      // 验证策略已设置（通过测试跨级别访问）
      const tenantId = Uuid.generate();
      const source = new TestEntity(
        Uuid.generate(),
        tenantId,
        undefined,
        [],
        DataIsolationLevel.TENANT,
        DataPrivacyLevel.PROTECTED
      );

      const target = new TestEntity(
        Uuid.generate(),
        tenantId,
        undefined,
        [],
        DataIsolationLevel.ORGANIZATION,
        DataPrivacyLevel.PROTECTED
      );

      const result = service.validateCrossLevelAccess(source, target);

      // 由于设置了允许跨级别访问，应该允许访问
      expect(result.isValid).toBe(true);
    });
  });

  describe('getIsolationPolicy', () => {
    it('should return current isolation policy', () => {
      const policy = service.getIsolationPolicy();

      expect(policy).toBeDefined();
      expect(policy.allowCrossLevelAccess).toBeDefined();
      expect(policy.allowCrossTenantAccess).toBeDefined();
      expect(policy.auditAllAccess).toBeDefined();
      expect(policy.auditEnabled).toBeDefined();
    });
  });

  describe('edge cases', () => {
    it('should handle entities with null organizationId', () => {
      const tenantId = Uuid.generate();

      const source = new TestEntity(
        Uuid.generate(),
        tenantId,
        undefined,
        [],
        DataIsolationLevel.TENANT,
        DataPrivacyLevel.PROTECTED
      );

      const target = new TestEntity(
        Uuid.generate(),
        tenantId,
        undefined,
        [],
        DataIsolationLevel.TENANT,
        DataPrivacyLevel.PROTECTED
      );

      const request = {
        source,
        target,
        requestedLevel: DataIsolationLevel.TENANT,
      };

      const result = service.validateDataAccess(request);

      expect(result.isAllowed).toBe(true);
      expect(result.reason).toContain('同一租户内访问');
    });

    it('should handle entities with empty departmentIds', () => {
      const tenantId = Uuid.generate();
      const organizationId = Uuid.generate();

      const source = new TestEntity(
        Uuid.generate(),
        tenantId,
        organizationId,
        [],
        DataIsolationLevel.ORGANIZATION,
        DataPrivacyLevel.PROTECTED
      );

      const target = new TestEntity(
        Uuid.generate(),
        tenantId,
        organizationId,
        [],
        DataIsolationLevel.ORGANIZATION,
        DataPrivacyLevel.PROTECTED
      );

      const request = {
        source,
        target,
        requestedLevel: DataIsolationLevel.ORGANIZATION,
      };

      const result = service.validateDataAccess(request);

      expect(result.isAllowed).toBe(true);
      expect(result.reason).toContain('同一组织内访问');
    });
  });
});
