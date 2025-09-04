/**
 * @file data-access-control.service.spec.ts
 * @description 数据访问控制服务单元测试
 *
 * 测试数据访问控制服务的核心功能，包括：
 * - 应用层数据访问权限验证
 * - 数据访问审计日志
 * - 访问控制策略
 */

import { Test, TestingModule } from '@nestjs/testing';
import { DataAccessControlService } from './data-access-control.service';
import {
  DataIsolationAwareEntity,
  DataIsolationLevel,
  DataPrivacyLevel,
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

describe('DataAccessControlService', () => {
  let service: DataAccessControlService;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [DataAccessControlService],
    }).compile();

    service = module.get<DataAccessControlService>(DataAccessControlService);
  });

  afterEach(async () => {
    await module.close();
  });

  describe('checkAccess', () => {
    it('should allow access when entities are in same tenant', () => {
      const tenantId = Uuid.generate();
      const userId = Uuid.generate();

      const source = new TestEntity(
        Uuid.generate(),
        tenantId,
        undefined,
        [],
        DataIsolationLevel.TENANT,
        DataPrivacyLevel.PROTECTED,
      );

      const target = new TestEntity(
        Uuid.generate(),
        tenantId,
        undefined,
        [],
        DataIsolationLevel.TENANT,
        DataPrivacyLevel.PROTECTED,
      );

      const request = {
        userId,
        tenantId,
        organizationId: undefined,
        departmentIds: [],
        targetEntity: target,
        operation: 'read' as const,
        reason: 'Test access',
      };

      const result = service.checkAccess(request);

      expect(result.allowed).toBe(true);
      expect(result.auditLog).toBeDefined();
      expect(result.auditLog?.userId).toBe(userId.toString());
      expect(result.auditLog?.targetEntityId).toBe(target.id.toString());
      expect(result.auditLog?.operation).toBe('read');
      expect(result.auditLog?.allowed).toBe(true);
    });

    it('should deny access when entities are in different tenants', () => {
      const userId = Uuid.generate();

      const source = new TestEntity(
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

      const request = {
        userId,
        tenantId: Uuid.generate(),
        organizationId: undefined,
        departmentIds: [],
        targetEntity: target,
        operation: 'read' as const,
        reason: 'Test access',
      };

      const result = service.checkAccess(request);

      expect(result.allowed).toBe(false);
      expect(result.allowed).toBe(false);
      expect(result.auditLog).toBeDefined();
      expect(result.auditLog?.allowed).toBe(false);
    });

    it('should allow access to shared data across tenants', () => {
      const userId = Uuid.generate();
      const tenantId = Uuid.generate();

      const target = new TestEntity(
        Uuid.generate(),
        tenantId,
        undefined,
        [],
        DataIsolationLevel.TENANT,
        DataPrivacyLevel.SHARED,
      );

      const request = {
        userId,
        tenantId,
        organizationId: undefined,
        departmentIds: [],
        targetEntity: target,
        operation: 'read' as const,
        reason: 'Test access',
      };

      const result = service.checkAccess(request);

      expect(result.allowed).toBe(true);
      expect(result.auditLog).toBeDefined();
      expect(result.auditLog?.allowed).toBe(true);
    });

    it('should allow organization level access within same organization', () => {
      const tenantId = Uuid.generate();
      const organizationId = Uuid.generate();
      const userId = Uuid.generate();

      const source = new TestEntity(
        Uuid.generate(),
        tenantId,
        organizationId,
        [],
        DataIsolationLevel.ORGANIZATION,
        DataPrivacyLevel.PROTECTED,
      );

      const target = new TestEntity(
        Uuid.generate(),
        tenantId,
        organizationId,
        [],
        DataIsolationLevel.ORGANIZATION,
        DataPrivacyLevel.PROTECTED,
      );

      const request = {
        userId,
        tenantId,
        organizationId,
        departmentIds: [],
        targetEntity: target,
        operation: 'read' as const,
        reason: 'Test access',
      };

      const result = service.checkAccess(request);

      expect(result.allowed).toBe(true);
      expect(result.auditLog).toBeDefined();
      expect(result.auditLog?.allowed).toBe(true);
    });

    it('should deny organization level access for different organizations', () => {
      const tenantId = Uuid.generate();
      const userId = Uuid.generate();

      const source = new TestEntity(
        Uuid.generate(),
        tenantId,
        Uuid.generate(),
        [],
        DataIsolationLevel.ORGANIZATION,
        DataPrivacyLevel.PROTECTED,
      );

      const target = new TestEntity(
        Uuid.generate(),
        tenantId,
        Uuid.generate(),
        [],
        DataIsolationLevel.ORGANIZATION,
        DataPrivacyLevel.PROTECTED,
      );

      const request = {
        userId,
        tenantId,
        organizationId: Uuid.generate(),
        departmentIds: [],
        targetEntity: target,
        operation: 'read' as const,
        reason: 'Test access',
      };

      const result = service.checkAccess(request);

      expect(result.allowed).toBe(false);
      expect(result.allowed).toBe(false);
      expect(result.auditLog).toBeDefined();
      expect(result.auditLog?.allowed).toBe(false);
    });

    it('should allow department level access within same department', () => {
      const tenantId = Uuid.generate();
      const organizationId = Uuid.generate();
      const departmentId = Uuid.generate();
      const userId = Uuid.generate();

      const target = new TestEntity(
        Uuid.generate(),
        tenantId,
        organizationId,
        [departmentId],
        DataIsolationLevel.TENANT,
        DataPrivacyLevel.PROTECTED,
      );

      const request = {
        userId,
        tenantId,
        organizationId,
        departmentIds: [departmentId],
        targetEntity: target,
        operation: 'read' as const,
        reason: 'Test access',
      };

      const result = service.checkAccess(request);

      expect(result.allowed).toBe(true);
      expect(result.auditLog).toBeDefined();
      expect(result.auditLog?.allowed).toBe(true);
    });

    it('should deny department level access for different departments', () => {
      const tenantId = Uuid.generate();
      const organizationId = Uuid.generate();
      const userId = Uuid.generate();

      const source = new TestEntity(
        Uuid.generate(),
        tenantId,
        organizationId,
        [Uuid.generate()],
        DataIsolationLevel.DEPARTMENT,
        DataPrivacyLevel.PROTECTED,
      );

      const target = new TestEntity(
        Uuid.generate(),
        tenantId,
        organizationId,
        [Uuid.generate()],
        DataIsolationLevel.DEPARTMENT,
        DataPrivacyLevel.PROTECTED,
      );

      const request = {
        userId,
        tenantId,
        organizationId,
        departmentIds: [Uuid.generate()],
        targetEntity: target,
        operation: 'read' as const,
        reason: 'Test access',
      };

      const result = service.checkAccess(request);

      expect(result.allowed).toBe(false);
      expect(result.allowed).toBe(false);
      expect(result.auditLog).toBeDefined();
      expect(result.auditLog?.allowed).toBe(false);
    });

    it('should allow user level access for same user', () => {
      const tenantId = Uuid.generate();
      const userId = Uuid.generate();

      const target = new TestEntity(
        userId,
        tenantId,
        undefined,
        [],
        DataIsolationLevel.USER,
        DataPrivacyLevel.PROTECTED,
        userId,
      );

      const request = {
        userId,
        tenantId,
        organizationId: undefined,
        departmentIds: [],
        targetEntity: target,
        operation: 'read' as const,
        reason: 'Test access',
      };

      const result = service.checkAccess(request);

      expect(result.allowed).toBe(true);
      expect(result.auditLog).toBeDefined();
      expect(result.auditLog?.allowed).toBe(true);
    });

    it('should deny user level access for different users', () => {
      const tenantId = Uuid.generate();

      const target = new TestEntity(
        Uuid.generate(),
        tenantId,
        undefined,
        [],
        DataIsolationLevel.USER,
        DataPrivacyLevel.PROTECTED,
        Uuid.generate(),
      );

      const request = {
        userId: Uuid.generate(),
        tenantId,
        organizationId: undefined,
        departmentIds: [],
        targetEntity: target,
        operation: 'read' as const,
        reason: 'Test access',
      };

      const result = service.checkAccess(request);

      expect(result.allowed).toBe(false);
      expect(result.auditLog).toBeDefined();
      expect(result.auditLog?.allowed).toBe(false);
    });
  });

  describe('audit logging', () => {
    it('should create audit log with correct information', () => {
      const userId = Uuid.generate();
      const tenantId = Uuid.generate();
      const target = new TestEntity(
        Uuid.generate(),
        tenantId,
        undefined,
        [],
        DataIsolationLevel.TENANT,
        DataPrivacyLevel.PROTECTED,
      );

      const request = {
        userId,
        tenantId,
        organizationId: undefined,
        departmentIds: [],
        targetEntity: target,
        operation: 'read' as const,
        reason: 'Test audit logging',
      };

      const result = service.checkAccess(request);

      expect(result.auditLog).toBeDefined();
      expect(result.auditLog?.timestamp).toBeInstanceOf(Date);
      expect(result.auditLog?.userId).toBe(userId.toString());
      expect(result.auditLog?.targetEntityId).toBe(target.id.toString());
      expect(result.auditLog?.targetEntityType).toBe('TestEntity');
      expect(result.auditLog?.operation).toBe('read');
      expect(result.auditLog?.isolationLevel).toBe(DataIsolationLevel.TENANT);
      expect(result.auditLog?.privacyLevel).toBe(DataPrivacyLevel.PROTECTED);
    });
  });

  describe('edge cases', () => {
    it('should handle null values gracefully', () => {
      const userId = Uuid.generate();
      const tenantId = Uuid.generate();

      const result = service.checkAccess({
        userId,
        tenantId,
        organizationId: undefined,
        departmentIds: [],
        targetEntity: new TestEntity(
          Uuid.generate(),
          Uuid.generate(),
          undefined,
          [],
          DataIsolationLevel.TENANT,
          DataPrivacyLevel.PROTECTED,
        ),
        operation: 'read' as const,
        reason: undefined,
      });

      expect(result.allowed).toBe(false);
      expect(result.auditLog).toBeDefined();
    });

    it('should handle empty departmentIds array', () => {
      const tenantId = Uuid.generate();
      const userId = Uuid.generate();

      const result = service.checkAccess({
        userId,
        tenantId,
        organizationId: undefined,
        departmentIds: [],
        targetEntity: new TestEntity(
          Uuid.generate(),
          tenantId,
          undefined,
          [],
          DataIsolationLevel.DEPARTMENT,
          DataPrivacyLevel.PROTECTED,
        ),
        operation: 'read' as const,
        reason: 'Test empty departments',
      });

      expect(result.allowed).toBe(false);
      expect(result.allowed).toBe(false);
    });
  });
});
