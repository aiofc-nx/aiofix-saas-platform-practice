/**
 * @file platform-aware.entity.spec.ts
 * @description PlatformAwareEntity单元测试
 *
 * 测试平台级实体类的所有功能，包括：
 * - 构造函数和属性访问
 * - 数据隐私级别管理
 * - 平台级访问控制
 * - 权限检查方法
 */

import {
  PlatformAwareEntity,
  PlatformAccessDeniedError,
} from './platform-aware.entity';
import { Uuid } from '../value-objects/uuid.vo';
import { DataPrivacyLevel } from './data-isolation-aware.entity';

// 创建一个具体的测试类来测试抽象类
class TestPlatformAwareEntity extends PlatformAwareEntity {
  constructor(
    id?: Uuid,
    dataPrivacyLevel: DataPrivacyLevel = DataPrivacyLevel.PROTECTED,
  ) {
    super(id, dataPrivacyLevel);
  }

  // 实现抽象方法
  protected isPlatformAdmin(): boolean {
    return true; // 测试时返回true
  }

  // 添加测试方法
  public testSetDataPrivacyLevel(level: DataPrivacyLevel): void {
    this.setDataPrivacyLevel(level);
  }

  public testAssertPlatformAccess(target: PlatformAwareEntity): void {
    this.assertPlatformAccess(target);
  }
}

describe('PlatformAwareEntity', () => {
  let entity: TestPlatformAwareEntity;
  let targetEntity: TestPlatformAwareEntity;

  beforeEach(() => {
    entity = new TestPlatformAwareEntity();
    targetEntity = new TestPlatformAwareEntity();
  });

  describe('constructor', () => {
    it('应该创建一个具有默认隐私级别的实体', () => {
      expect(entity.dataPrivacyLevel).toBe(DataPrivacyLevel.PROTECTED);
    });

    it('应该创建一个具有指定隐私级别的实体', () => {
      const sharedEntity = new TestPlatformAwareEntity(
        undefined,
        DataPrivacyLevel.SHARED,
      );
      expect(sharedEntity.dataPrivacyLevel).toBe(DataPrivacyLevel.SHARED);
    });

    it('应该生成一个UUID如果没有提供ID', () => {
      expect(entity.id).toBeDefined();
      expect(entity.id).toBeInstanceOf(Uuid);
    });

    it('应该使用提供的ID', () => {
      const customId = Uuid.generate();
      const customEntity = new TestPlatformAwareEntity(customId);
      expect(customEntity.id).toBe(customId);
    });
  });

  describe('canAccess', () => {
    it('应该允许访问可共享数据', () => {
      targetEntity.testSetDataPrivacyLevel(DataPrivacyLevel.SHARED);
      expect(entity.canAccess(targetEntity)).toBe(true);
    });

    it('应该允许平台管理员访问受保护数据', () => {
      targetEntity.testSetDataPrivacyLevel(DataPrivacyLevel.PROTECTED);
      expect(entity.canAccess(targetEntity)).toBe(true);
    });

    it('应该拒绝访问受保护数据（非管理员）', () => {
      // 创建一个非管理员的测试实体
      class NonAdminTestEntity extends PlatformAwareEntity {
        protected isPlatformAdmin(): boolean {
          return false;
        }
      }
      const nonAdminEntity = new NonAdminTestEntity();
      targetEntity.testSetDataPrivacyLevel(DataPrivacyLevel.PROTECTED);
      expect(nonAdminEntity.canAccess(targetEntity)).toBe(false);
    });
  });

  describe('isSharedData', () => {
    it('应该正确识别可共享数据', () => {
      entity.testSetDataPrivacyLevel(DataPrivacyLevel.SHARED);
      expect(entity.isSharedData()).toBe(true);
    });

    it('应该正确识别非可共享数据', () => {
      entity.testSetDataPrivacyLevel(DataPrivacyLevel.PROTECTED);
      expect(entity.isSharedData()).toBe(false);
    });
  });

  describe('isProtectedData', () => {
    it('应该正确识别受保护数据', () => {
      entity.testSetDataPrivacyLevel(DataPrivacyLevel.PROTECTED);
      expect(entity.isProtectedData()).toBe(true);
    });

    it('应该正确识别非受保护数据', () => {
      entity.testSetDataPrivacyLevel(DataPrivacyLevel.SHARED);
      expect(entity.isProtectedData()).toBe(false);
    });
  });

  describe('setDataPrivacyLevel', () => {
    it('应该能够设置数据隐私级别', () => {
      entity.testSetDataPrivacyLevel(DataPrivacyLevel.SHARED);
      expect(entity.dataPrivacyLevel).toBe(DataPrivacyLevel.SHARED);
    });

    it('应该更新时间戳', () => {
      const originalTimestamp = entity.updatedAt;
      // 等待一小段时间确保时间戳会不同
      setTimeout(() => {
        entity.testSetDataPrivacyLevel(DataPrivacyLevel.SHARED);
        expect(entity.updatedAt.getTime()).toBeGreaterThan(
          originalTimestamp.getTime(),
        );
      }, 1);
    });
  });

  describe('assertPlatformAccess', () => {
    it('应该允许访问可共享数据', () => {
      targetEntity.testSetDataPrivacyLevel(DataPrivacyLevel.SHARED);
      expect(() => entity.testAssertPlatformAccess(targetEntity)).not.toThrow();
    });

    it('应该允许平台管理员访问受保护数据', () => {
      targetEntity.testSetDataPrivacyLevel(DataPrivacyLevel.PROTECTED);
      expect(() => entity.testAssertPlatformAccess(targetEntity)).not.toThrow();
    });

    it('应该拒绝访问受保护数据（非管理员）并抛出异常', () => {
      // 创建一个非管理员的测试实体
      class NonAdminTestEntity extends PlatformAwareEntity {
        protected isPlatformAdmin(): boolean {
          return false;
        }

        // 添加测试方法
        public testAssertPlatformAccess(target: PlatformAwareEntity): void {
          this.assertPlatformAccess(target);
        }
      }
      const nonAdminEntity = new NonAdminTestEntity();
      targetEntity.testSetDataPrivacyLevel(DataPrivacyLevel.PROTECTED);
      expect(() =>
        nonAdminEntity.testAssertPlatformAccess(targetEntity),
      ).toThrow(PlatformAccessDeniedError);
    });

    it('应该抛出正确的错误消息', () => {
      // 创建一个非管理员的测试实体
      class NonAdminTestEntity extends PlatformAwareEntity {
        protected isPlatformAdmin(): boolean {
          return false;
        }

        // 添加测试方法
        public testAssertPlatformAccess(target: PlatformAwareEntity): void {
          this.assertPlatformAccess(target);
        }
      }
      const nonAdminEntity = new NonAdminTestEntity();
      targetEntity.testSetDataPrivacyLevel(DataPrivacyLevel.PROTECTED);
      expect(() =>
        nonAdminEntity.testAssertPlatformAccess(targetEntity),
      ).toThrow('平台级访问被拒绝: 目标对象隐私级别为protected');
    });
  });
});

describe('PlatformAccessDeniedError', () => {
  it('应该创建具有正确名称的错误', () => {
    const error = new PlatformAccessDeniedError('测试错误');
    expect(error.name).toBe('PlatformAccessDeniedError');
  });

  it('应该创建具有正确消息的错误', () => {
    const errorMessage = '测试错误消息';
    const error = new PlatformAccessDeniedError(errorMessage);
    expect(error.message).toBe(errorMessage);
  });
});
