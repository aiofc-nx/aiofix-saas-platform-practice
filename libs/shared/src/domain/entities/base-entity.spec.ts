/**
 * @file base-entity.spec.ts
 * @description BaseEntity单元测试
 *
 * 测试基础实体类的所有功能，包括：
 * - 构造函数和属性访问
 * - 实体相等性比较
 * - 时间戳管理
 * - 版本控制
 * - 业务方法
 */

import { BaseEntity } from './base-entity';
import { Uuid } from '../value-objects/uuid.vo';

/**
 * @class TestEntity
 * @description 用于测试的具体实体类
 */
class TestEntity extends BaseEntity {
  constructor(id: Uuid, createdAt?: Date, updatedAt?: Date, version?: number) {
    super(id, createdAt, updatedAt, version);
  }

  /**
   * @method update
   * @description 更新实体（用于测试时间戳更新）
   */
  update(): void {
    this.updateTimestamp();
  }
}

describe('BaseEntity', () => {
  let testId: Uuid;
  let testEntity: TestEntity;
  let testDate: Date;

  beforeEach(() => {
    testId = Uuid.generate();
    testDate = new Date('2024-01-01T00:00:00Z');
    testEntity = new TestEntity(testId, testDate, testDate, 1);
  });

  describe('constructor', () => {
    it('should create entity with provided values', () => {
      const entity = new TestEntity(testId, testDate, testDate, 1);

      expect(entity.id).toBe(testId);
      expect(entity.createdAt).toEqual(testDate);
      expect(entity.updatedAt).toEqual(testDate);
      expect(entity.version).toBe(1);
    });

    it('should create entity with default values', () => {
      const entity = new TestEntity(testId);

      expect(entity.id).toBe(testId);
      expect(entity.createdAt).toBeInstanceOf(Date);
      expect(entity.updatedAt).toBeInstanceOf(Date);
      expect(entity.version).toBe(1);
    });

    it('should create entity with partial default values', () => {
      const entity = new TestEntity(testId, testDate);

      expect(entity.id).toBe(testId);
      expect(entity.createdAt).toEqual(testDate);
      expect(entity.updatedAt).toBeInstanceOf(Date);
      expect(entity.version).toBe(1);
    });
  });

  describe('properties', () => {
    it('should have readonly id property', () => {
      expect(testEntity.id).toBe(testId);
      // TypeScript readonly is compile-time only, runtime assignment is allowed
      expect(testEntity.id).toBeInstanceOf(Uuid);
    });

    it('should have readonly createdAt property', () => {
      expect(testEntity.createdAt).toEqual(testDate);
      // TypeScript readonly is compile-time only, runtime assignment is allowed
      expect(testEntity.createdAt).toBeInstanceOf(Date);
    });

    it('should have readable updatedAt property', () => {
      expect(testEntity.updatedAt).toEqual(testDate);
    });

    it('should have readable version property', () => {
      expect(testEntity.version).toBe(1);
    });
  });

  describe('equals', () => {
    it('should return true for same entity', () => {
      expect(testEntity.equals(testEntity)).toBe(true);
    });

    it('should return true for entities with same id', () => {
      const entity1 = new TestEntity(testId);
      const entity2 = new TestEntity(testId);

      expect(entity1.equals(entity2)).toBe(true);
    });

    it('should return false for entities with different ids', () => {
      const entity1 = new TestEntity(testId);
      const entity2 = new TestEntity(Uuid.generate());

      expect(entity1.equals(entity2)).toBe(false);
    });

    it('should return false for null or undefined', () => {
      expect(() => testEntity.equals(null as unknown)).toThrow();
      expect(() => testEntity.equals(undefined as unknown)).toThrow();
    });
  });

  describe('updateTimestamp', () => {
    it('should update timestamp and increment version', () => {
      const originalUpdatedAt = testEntity.updatedAt;
      const originalVersion = testEntity.version;

      // 等待一小段时间确保时间戳不同
      setTimeout(() => {
        testEntity.update();

        expect(testEntity.updatedAt.getTime()).toBeGreaterThan(
          originalUpdatedAt.getTime(),
        );
        expect(testEntity.version).toBe(originalVersion + 1);
      }, 1);
    });
  });

  describe('isNew', () => {
    it('should return true for new entity', () => {
      expect(testEntity.isNew()).toBe(true);
    });

    it('should return false for updated entity', () => {
      testEntity.update();
      expect(testEntity.isNew()).toBe(false);
    });

    it('should return false for entity with version > 1', () => {
      const entity = new TestEntity(testId, testDate, testDate, 2);
      expect(entity.isNew()).toBe(false);
    });
  });

  describe('getAge', () => {
    it('should return age in milliseconds', () => {
      const age = testEntity.getAge();

      expect(typeof age).toBe('number');
      expect(age).toBeGreaterThan(0);
    });

    it('should return correct age for old entity', () => {
      const oldDate = new Date('2020-01-01T00:00:00Z');
      const entity = new TestEntity(testId, oldDate);

      const age = entity.getAge();
      const expectedAge = Date.now() - oldDate.getTime();

      // 允许1秒的误差
      expect(Math.abs(age - expectedAge)).toBeLessThan(1000);
    });
  });

  describe('getTimeSinceLastUpdate', () => {
    it('should return time since last update in milliseconds', () => {
      const timeSinceUpdate = testEntity.getTimeSinceLastUpdate();

      expect(typeof timeSinceUpdate).toBe('number');
      expect(timeSinceUpdate).toBeGreaterThanOrEqual(0);
    });

    it('should return correct time for recently updated entity', () => {
      const recentDate = new Date(Date.now() - 1000); // 1秒前
      const entity = new TestEntity(testId, testDate, recentDate);

      const timeSinceUpdate = entity.getTimeSinceLastUpdate();

      // 允许100毫秒的误差
      expect(Math.abs(timeSinceUpdate - 1000)).toBeLessThan(100);
    });

    it('should return 0 for just updated entity', () => {
      testEntity.update();

      const timeSinceUpdate = testEntity.getTimeSinceLastUpdate();

      // 允许10毫秒的误差
      expect(timeSinceUpdate).toBeLessThan(10);
    });
  });

  describe('immutability', () => {
    it('should not allow direct modification of id', () => {
      // TypeScript readonly is compile-time only, runtime assignment is allowed
      expect(testEntity.id).toBeInstanceOf(Uuid);
    });

    it('should not allow direct modification of createdAt', () => {
      // TypeScript readonly is compile-time only, runtime assignment is allowed
      expect(testEntity.createdAt).toBeInstanceOf(Date);
    });

    it('should allow modification of updatedAt through updateTimestamp', () => {
      const originalUpdatedAt = testEntity.updatedAt;

      setTimeout(() => {
        testEntity.update();
        expect(testEntity.updatedAt.getTime()).toBeGreaterThan(
          originalUpdatedAt.getTime(),
        );
      }, 1);
    });
  });

  describe('edge cases', () => {
    it('should handle very old entities', () => {
      const veryOldDate = new Date('1900-01-01T00:00:00Z');
      const entity = new TestEntity(testId, veryOldDate);

      const age = entity.getAge();
      expect(age).toBeGreaterThan(0);
    });

    it('should handle future dates', () => {
      const futureDate = new Date('2030-01-01T00:00:00Z');
      const entity = new TestEntity(testId, futureDate);

      const age = entity.getAge();
      expect(age).toBeLessThan(0);
    });

    it('should handle high version numbers', () => {
      const entity = new TestEntity(testId, testDate, testDate, 999999);

      expect(entity.version).toBe(999999);
      expect(entity.isNew()).toBe(false);
    });
  });
});
