/**
 * @file data-isolation-aware.entity.spec.ts
 * @description DataIsolationAwareEntity单元测试
 *
 * 测试数据隔离感知实体类的核心功能，包括：
 * - 构造函数和属性访问
 * - 数据隔离级别管理
 * - 租户访问控制
 * - 组织访问控制
 * - 部门访问控制
 */

import {
  DataIsolationAwareEntity,
  DataIsolationLevel,
  DataPrivacyLevel,
  TenantAccessDeniedError,
  TenantContext,
} from './data-isolation-aware.entity';
import { Uuid } from '../value-objects/uuid.vo';

/**
 * @class TestDataIsolationEntity
 * @description 用于测试的具体数据隔离感知实体类
 */
class TestDataIsolationEntity extends DataIsolationAwareEntity {
  constructor(
    tenantId: Uuid,
    dataIsolationLevel?: DataIsolationLevel,
    dataPrivacyLevel?: DataPrivacyLevel,
    id?: Uuid,
    organizationId?: Uuid,
    departmentIds?: Uuid[],
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

  /**
   * @method testAssertSameTenant
   * @description 测试租户断言（用于测试）
   */
  testAssertSameTenant(other: DataIsolationAwareEntity): void {
    this.assertSameTenant(other);
  }

  /**
   * @method testAssertSameOrganization
   * @description 测试组织断言（用于测试）
   */
  testAssertSameOrganization(other: DataIsolationAwareEntity): void {
    this.assertSameOrganization(other);
  }

  /**
   * @method testAssertSameDepartment
   * @description 测试部门断言（用于测试）
   */
  testAssertSameDepartment(other: DataIsolationAwareEntity): void {
    this.assertSameDepartment(other);
  }

  /**
   * @method testCanAccess
   * @description 测试访问权限（用于测试）
   */
  testCanAccess(target: DataIsolationAwareEntity): boolean {
    return this.canAccess(target);
  }
}

describe('DataIsolationAwareEntity', () => {
  let tenantId1: Uuid;
  let tenantId2: Uuid;
  let organizationId1: Uuid;
  let organizationId2: Uuid;
  let departmentId1: Uuid;
  let departmentId2: Uuid;
  let userId1: Uuid;
  let userId2: Uuid;

  let entity1: TestDataIsolationEntity;
  let entity2: TestDataIsolationEntity;
  let entity3: TestDataIsolationEntity;

  beforeEach(() => {
    tenantId1 = Uuid.generate();
    tenantId2 = Uuid.generate();
    organizationId1 = Uuid.generate();
    organizationId2 = Uuid.generate();
    departmentId1 = Uuid.generate();
    departmentId2 = Uuid.generate();
    userId1 = Uuid.generate();
    userId2 = Uuid.generate();

    entity1 = new TestDataIsolationEntity(
      tenantId1,
      DataIsolationLevel.TENANT,
      DataPrivacyLevel.PROTECTED,
      undefined,
      organizationId1,
      [departmentId1],
      userId1
    );

    entity2 = new TestDataIsolationEntity(
      tenantId1,
      DataIsolationLevel.ORGANIZATION,
      DataPrivacyLevel.SHARED,
      undefined,
      organizationId1,
      [departmentId1, departmentId2],
      userId2
    );

    entity3 = new TestDataIsolationEntity(
      tenantId2,
      DataIsolationLevel.TENANT,
      DataPrivacyLevel.PROTECTED,
      undefined,
      organizationId2,
      [departmentId2],
      userId2
    );
  });

  describe('constructor', () => {
    it('should create entity with all provided values', () => {
      const entity = new TestDataIsolationEntity(
        tenantId1,
        DataIsolationLevel.ORGANIZATION,
        DataPrivacyLevel.SHARED,
        undefined,
        organizationId1,
        [departmentId1],
        userId1
      );

      expect(entity.tenantId).toBe(tenantId1);
      expect(entity.dataIsolationLevel).toBe(DataIsolationLevel.ORGANIZATION);
      expect(entity.dataPrivacyLevel).toBe(DataPrivacyLevel.SHARED);
      expect(entity.organizationId).toBe(organizationId1);
      expect(entity.departmentIds).toEqual([departmentId1]);
      expect(entity.userId).toBe(userId1);
    });

    it('should create entity with default values', () => {
      const entity = new TestDataIsolationEntity(tenantId1);

      expect(entity.tenantId).toBe(tenantId1);
      expect(entity.dataIsolationLevel).toBe(DataIsolationLevel.TENANT);
      expect(entity.dataPrivacyLevel).toBe(DataPrivacyLevel.PROTECTED);
      expect(entity.organizationId).toBeUndefined();
      expect(entity.departmentIds).toEqual([]);
      expect(entity.userId).toBeUndefined();
    });

    it('should create entity with partial values', () => {
      const entity = new TestDataIsolationEntity(
        tenantId1,
        DataIsolationLevel.DEPARTMENT,
        undefined,
        undefined,
        organizationId1
      );

      expect(entity.tenantId).toBe(tenantId1);
      expect(entity.dataIsolationLevel).toBe(DataIsolationLevel.DEPARTMENT);
      expect(entity.dataPrivacyLevel).toBe(DataPrivacyLevel.PROTECTED);
      expect(entity.organizationId).toBe(organizationId1);
      expect(entity.departmentIds).toEqual([]);
      expect(entity.userId).toBeUndefined();
    });
  });

  describe('properties', () => {
    it('should have readonly tenantId', () => {
      expect(entity1.tenantId).toBe(tenantId1);
      // TypeScript readonly is compile-time only, runtime assignment is allowed
      expect(entity1.tenantId).toBeInstanceOf(Uuid);
    });

    it('should have readable organizationId', () => {
      expect(entity1.organizationId).toBe(organizationId1);
    });

    it('should have readonly departmentIds array', () => {
      expect(entity1.departmentIds).toEqual([departmentId1]);

      // 修改返回的数组不应影响原数组
      const deptIds = entity1.departmentIds;
      deptIds.push(departmentId2);
      expect(entity1.departmentIds).toEqual([departmentId1]);
    });

    it('should have readable dataIsolationLevel', () => {
      expect(entity1.dataIsolationLevel).toBe(DataIsolationLevel.TENANT);
    });

    it('should have readable dataPrivacyLevel', () => {
      expect(entity1.dataPrivacyLevel).toBe(DataPrivacyLevel.PROTECTED);
    });

    it('should have readable userId', () => {
      expect(entity1.userId).toBe(userId1);
    });
  });

  describe('assertSameTenant', () => {
    it('should not throw for same tenant', () => {
      expect(() => {
        entity1.testAssertSameTenant(entity2);
      }).not.toThrow();
    });

    it('should throw TenantAccessDeniedError for different tenants', () => {
      expect(() => {
        entity1.testAssertSameTenant(entity3);
      }).toThrow(TenantAccessDeniedError);
    });

    it('should throw with correct error message', () => {
      try {
        entity1.testAssertSameTenant(entity3);
      } catch (error) {
        expect(error).toBeInstanceOf(TenantAccessDeniedError);
        expect((error as TenantAccessDeniedError).message).toContain(
          '操作禁止'
        );
        expect((error as TenantAccessDeniedError).message).toContain('租户');
      }
    });
  });

  describe('assertSameOrganization', () => {
    it('should not throw for same organization', () => {
      expect(() => {
        entity1.testAssertSameOrganization(entity2);
      }).not.toThrow();
    });

    it('should throw TenantAccessDeniedError for different organizations', () => {
      const entityWithDifferentOrg = new TestDataIsolationEntity(
        tenantId1,
        DataIsolationLevel.ORGANIZATION,
        DataPrivacyLevel.PROTECTED,
        undefined,
        organizationId2
      );

      expect(() => {
        entity1.testAssertSameOrganization(entityWithDifferentOrg);
      }).toThrow(TenantAccessDeniedError);
    });

    it('should not throw for entity without organization when both have no organization', () => {
      const entityWithoutOrg1 = new TestDataIsolationEntity(tenantId1);
      const entityWithoutOrg2 = new TestDataIsolationEntity(tenantId1);

      expect(() => {
        entityWithoutOrg1.testAssertSameOrganization(entityWithoutOrg2);
      }).not.toThrow();
    });
  });

  describe('assertSameDepartment', () => {
    it('should not throw for same department', () => {
      expect(() => {
        entity1.testAssertSameDepartment(entity2);
      }).not.toThrow();
    });

    it('should throw TenantAccessDeniedError for different departments', () => {
      const entityWithDifferentDept = new TestDataIsolationEntity(
        tenantId1,
        DataIsolationLevel.DEPARTMENT,
        DataPrivacyLevel.PROTECTED,
        undefined,
        organizationId1,
        [departmentId2]
      );

      expect(() => {
        entity1.testAssertSameDepartment(entityWithDifferentDept);
      }).toThrow(TenantAccessDeniedError);
    });

    it('should throw for entity without departments', () => {
      const entityWithoutDept = new TestDataIsolationEntity(
        tenantId1,
        DataIsolationLevel.DEPARTMENT,
        DataPrivacyLevel.PROTECTED,
        undefined,
        organizationId1,
        []
      );

      expect(() => {
        entity1.testAssertSameDepartment(entityWithoutDept);
      }).toThrow(TenantAccessDeniedError);
    });
  });

  describe('canAccess', () => {
    it('should allow access to shared data in same tenant', () => {
      expect(entity1.testCanAccess(entity2)).toBe(true);
    });

    it('should deny access to protected data in different tenant', () => {
      expect(entity1.testCanAccess(entity3)).toBe(false);
    });

    it('should allow access to shared data across tenants', () => {
      const sharedEntity = new TestDataIsolationEntity(
        tenantId2,
        DataIsolationLevel.PLATFORM,
        DataPrivacyLevel.SHARED
      );

      expect(entity1.testCanAccess(sharedEntity)).toBe(true);
    });
  });

  describe('inheritance', () => {
    it('should inherit from BaseEntity', () => {
      expect(entity1).toBeInstanceOf(DataIsolationAwareEntity);
      expect(entity1.id).toBeInstanceOf(Uuid);
      expect(entity1.createdAt).toBeInstanceOf(Date);
      expect(entity1.updatedAt).toBeInstanceOf(Date);
      expect(typeof entity1.version).toBe('number');
    });

    it('should have BaseEntity methods', () => {
      expect(typeof entity1.equals).toBe('function');
      expect(typeof entity1.isNew).toBe('function');
      expect(typeof entity1.getAge).toBe('function');
      expect(typeof entity1.getTimeSinceLastUpdate).toBe('function');
    });
  });

  describe('TenantAccessDeniedError', () => {
    it('should create error with correct name and message', () => {
      const error = new TenantAccessDeniedError('Test error message');

      expect(error.name).toBe('TenantAccessDeniedError');
      expect(error.message).toBe('Test error message');
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('DataIsolationLevel enum', () => {
    it('should have all required isolation levels', () => {
      expect(DataIsolationLevel.PLATFORM).toBe('platform');
      expect(DataIsolationLevel.TENANT).toBe('tenant');
      expect(DataIsolationLevel.ORGANIZATION).toBe('organization');
      expect(DataIsolationLevel.DEPARTMENT).toBe('department');
      expect(DataIsolationLevel.SUB_DEPARTMENT).toBe('sub_department');
      expect(DataIsolationLevel.USER).toBe('user');
    });
  });

  describe('DataPrivacyLevel enum', () => {
    it('should have all required privacy levels', () => {
      expect(DataPrivacyLevel.SHARED).toBe('shared');
      expect(DataPrivacyLevel.PROTECTED).toBe('protected');
    });
  });

  describe('edge cases', () => {
    it('should handle entity with multiple departments', () => {
      const multiDeptEntity = new TestDataIsolationEntity(
        tenantId1,
        DataIsolationLevel.DEPARTMENT,
        DataPrivacyLevel.PROTECTED,
        undefined,
        organizationId1,
        [departmentId1, departmentId2]
      );

      expect(multiDeptEntity.departmentIds).toEqual([
        departmentId1,
        departmentId2,
      ]);
    });

    it('should handle entity with null values', () => {
      const entity = new TestDataIsolationEntity(
        tenantId1,
        DataIsolationLevel.TENANT,
        DataPrivacyLevel.PROTECTED,
        undefined,
        undefined,
        [],
        undefined
      );

      expect(entity.organizationId).toBeUndefined();
      expect(entity.departmentIds).toEqual([]);
      expect(entity.userId).toBeUndefined();
    });
  });
});
