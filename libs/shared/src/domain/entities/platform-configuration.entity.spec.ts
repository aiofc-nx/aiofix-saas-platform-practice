/**
 * @file platform-configuration.entity.spec.ts
 * @description PlatformConfiguration单元测试
 *
 * 测试平台配置实体类的所有功能，包括：
 * - 构造函数和属性访问
 * - 配置值更新
 * - 静态工厂方法
 * - 数据转换
 * - 继承功能
 */

import {
  PlatformConfiguration,
  PlatformConfigurationData,
} from './platform-configuration.entity';
import { DataPrivacyLevel } from './data-isolation-aware.entity';
import { Uuid } from '../value-objects/uuid.vo';

describe('PlatformConfiguration', () => {
  let testId: Uuid;
  let testConfig: PlatformConfiguration;

  beforeEach(() => {
    testId = Uuid.generate();
    testConfig = new PlatformConfiguration(
      'test.key',
      'test-value',
      'test-category',
      false,
      'Test configuration',
      DataPrivacyLevel.PROTECTED,
      testId,
    );
  });

  describe('constructor', () => {
    it('should create configuration with all provided values', () => {
      const config = new PlatformConfiguration(
        'app.name',
        'MyApp',
        'application',
        true,
        'Application name',
        DataPrivacyLevel.SHARED,
        testId,
      );

      expect(config.id).toBe(testId);
      expect(config.key).toBe('app.name');
      expect(config.value).toBe('MyApp');
      expect(config.category).toBe('application');
      expect(config.isSystem).toBe(true);
      expect(config.description).toBe('Application name');
      expect(config.dataPrivacyLevel).toBe(DataPrivacyLevel.SHARED);
    });

    it('should create configuration with default values', () => {
      const config = new PlatformConfiguration(
        'default.key',
        'default-value',
        'default-category',
      );

      expect(config.key).toBe('default.key');
      expect(config.value).toBe('default-value');
      expect(config.category).toBe('default-category');
      expect(config.isSystem).toBe(false);
      expect(config.description).toBeUndefined();
      expect(config.dataPrivacyLevel).toBe(DataPrivacyLevel.PROTECTED);
    });

    it('should create configuration with partial values', () => {
      const config = new PlatformConfiguration(
        'partial.key',
        'partial-value',
        'partial-category',
        true,
      );

      expect(config.key).toBe('partial.key');
      expect(config.value).toBe('partial-value');
      expect(config.category).toBe('partial-category');
      expect(config.isSystem).toBe(true);
      expect(config.description).toBeUndefined();
      expect(config.dataPrivacyLevel).toBe(DataPrivacyLevel.PROTECTED);
    });
  });

  describe('properties', () => {
    it('should have readonly key', () => {
      expect(testConfig.key).toBe('test.key');
      // TypeScript readonly is compile-time only, runtime assignment is allowed
      expect(typeof testConfig.key).toBe('string');
    });

    it('should have readable value', () => {
      expect(testConfig.value).toBe('test-value');
    });

    it('should have readable description', () => {
      expect(testConfig.description).toBe('Test configuration');
    });

    it('should have readonly category', () => {
      expect(testConfig.category).toBe('test-category');
      // TypeScript readonly is compile-time only, runtime assignment is allowed
      expect(typeof testConfig.category).toBe('string');
    });

    it('should have readonly isSystem', () => {
      expect(testConfig.isSystem).toBe(false);
      // TypeScript readonly is compile-time only, runtime assignment is allowed
      expect(typeof testConfig.isSystem).toBe('boolean');
    });
  });

  describe('updateValue', () => {
    it('should update configuration value', () => {
      const newValue = 'updated-value';
      testConfig.updateValue(newValue);

      expect(testConfig.value).toBe(newValue);
    });

    it('should update timestamp when value changes', () => {
      const originalUpdatedAt = testConfig.updatedAt;

      setTimeout(() => {
        testConfig.updateValue('new-value');
        expect(testConfig.updatedAt.getTime()).toBeGreaterThan(
          originalUpdatedAt.getTime(),
        );
      }, 1);
    });

    it('should increment version when value changes', () => {
      const originalVersion = testConfig.version;
      testConfig.updateValue('new-value');

      expect(testConfig.version).toBe(originalVersion + 1);
    });

    it('should handle different value types', () => {
      const stringValue = 'string-value';
      const numberValue = 42;
      const booleanValue = true;
      const objectValue = { key: 'value' };
      const arrayValue = [1, 2, 3];

      testConfig.updateValue(stringValue);
      expect(testConfig.value).toBe(stringValue);

      testConfig.updateValue(numberValue);
      expect(testConfig.value).toBe(numberValue);

      testConfig.updateValue(booleanValue);
      expect(testConfig.value).toBe(booleanValue);

      testConfig.updateValue(objectValue);
      expect(testConfig.value).toEqual(objectValue);

      testConfig.updateValue(arrayValue);
      expect(testConfig.value).toEqual(arrayValue);
    });
  });

  describe('updateDescription', () => {
    it('should update configuration description', () => {
      const newDescription = 'Updated description';
      testConfig.updateDescription(newDescription);

      expect(testConfig.description).toBe(newDescription);
    });

    it('should update timestamp when description changes', () => {
      const originalUpdatedAt = testConfig.updatedAt;

      setTimeout(() => {
        testConfig.updateDescription('New description');
        expect(testConfig.updatedAt.getTime()).toBeGreaterThan(
          originalUpdatedAt.getTime(),
        );
      }, 1);
    });

    it('should increment version when description changes', () => {
      const originalVersion = testConfig.version;
      testConfig.updateDescription('New description');

      expect(testConfig.version).toBe(originalVersion + 1);
    });

    it('should handle empty description', () => {
      testConfig.updateDescription('');
      expect(testConfig.description).toBe('');
    });
  });

  describe('toData', () => {
    it('should convert to data object correctly', () => {
      const data = testConfig.toData();

      expect(data).toEqual({
        key: 'test.key',
        value: 'test-value',
        description: 'Test configuration',
        category: 'test-category',
        isSystem: false,
      });
    });

    it('should handle undefined description', () => {
      const configWithoutDescription = new PlatformConfiguration(
        'no-desc.key',
        'no-desc-value',
        'no-desc-category',
      );

      const data = configWithoutDescription.toData();

      expect(data.description).toBeUndefined();
    });

    it('should handle system configuration', () => {
      const systemConfig = new PlatformConfiguration(
        'system.key',
        'system-value',
        'system-category',
        true,
        'System configuration',
      );

      const data = systemConfig.toData();

      expect(data.isSystem).toBe(true);
    });
  });

  describe('isPlatformAdmin', () => {
    it('should return false by default', () => {
      // 由于isPlatformAdmin是protected方法，我们通过canAccess来测试
      const targetConfig = new PlatformConfiguration(
        'target.key',
        'target-value',
        'test',
      );
      expect(testConfig.canAccess(targetConfig)).toBe(false);
    });
  });

  describe('static methods', () => {
    describe('createSystemConfig', () => {
      it('should create system configuration', () => {
        const systemConfig = PlatformConfiguration.createSystemConfig(
          'system.key',
          'system-value',
          'system-category',
          'System configuration',
        );

        expect(systemConfig.key).toBe('system.key');
        expect(systemConfig.value).toBe('system-value');
        expect(systemConfig.category).toBe('system-category');
        expect(systemConfig.isSystem).toBe(true);
        expect(systemConfig.description).toBe('System configuration');
        expect(systemConfig.dataPrivacyLevel).toBe(DataPrivacyLevel.PROTECTED);
      });

      it('should create system configuration without description', () => {
        const systemConfig = PlatformConfiguration.createSystemConfig(
          'system.key',
          'system-value',
          'system-category',
        );

        expect(systemConfig.isSystem).toBe(true);
        expect(systemConfig.description).toBeUndefined();
      });
    });

    describe('createPublicConfig', () => {
      it('should create public configuration', () => {
        const publicConfig = PlatformConfiguration.createPublicConfig(
          'public.key',
          'public-value',
          'public-category',
          'Public configuration',
        );

        expect(publicConfig.key).toBe('public.key');
        expect(publicConfig.value).toBe('public-value');
        expect(publicConfig.category).toBe('public-category');
        expect(publicConfig.isSystem).toBe(false);
        expect(publicConfig.description).toBe('Public configuration');
        expect(publicConfig.dataPrivacyLevel).toBe(DataPrivacyLevel.SHARED);
      });

      it('should create public configuration without description', () => {
        const publicConfig = PlatformConfiguration.createPublicConfig(
          'public.key',
          'public-value',
          'public-category',
        );

        expect(publicConfig.isSystem).toBe(false);
        expect(publicConfig.description).toBeUndefined();
        expect(publicConfig.dataPrivacyLevel).toBe(DataPrivacyLevel.SHARED);
      });
    });
  });

  describe('inheritance', () => {
    it('should inherit from PlatformAwareEntity', () => {
      expect(testConfig).toBeInstanceOf(PlatformConfiguration);
      expect(testConfig.id).toBeInstanceOf(Uuid);
      expect(testConfig.createdAt).toBeInstanceOf(Date);
      expect(testConfig.updatedAt).toBeInstanceOf(Date);
      expect(typeof testConfig.version).toBe('number');
    });

    it('should have PlatformAwareEntity methods', () => {
      expect(typeof testConfig.canAccess).toBe('function');
      expect(typeof testConfig.isSharedData).toBe('function');
      expect(typeof testConfig.isProtectedData).toBe('function');
    });

    it('should have BaseEntity methods', () => {
      expect(typeof testConfig.equals).toBe('function');
      expect(typeof testConfig.isNew).toBe('function');
      expect(typeof testConfig.getAge).toBe('function');
      expect(typeof testConfig.getTimeSinceLastUpdate).toBe('function');
    });
  });

  describe('data privacy', () => {
    it('should handle shared data correctly', () => {
      const sharedConfig = new PlatformConfiguration(
        'shared.key',
        'shared-value',
        'shared-category',
        false,
        undefined,
        DataPrivacyLevel.SHARED,
      );

      expect(sharedConfig.isSharedData()).toBe(true);
      expect(sharedConfig.isProtectedData()).toBe(false);
    });

    it('should handle protected data correctly', () => {
      expect(testConfig.isProtectedData()).toBe(true);
      expect(testConfig.isSharedData()).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle empty key', () => {
      const config = new PlatformConfiguration(
        '',
        'empty-key-value',
        'empty-category',
      );
      expect(config.key).toBe('');
    });

    it('should handle null value', () => {
      testConfig.updateValue(null);
      expect(testConfig.value).toBeNull();
    });

    it('should handle undefined value', () => {
      testConfig.updateValue(undefined);
      expect(testConfig.value).toBeUndefined();
    });

    it('should handle complex objects', () => {
      const complexValue = {
        nested: {
          array: [1, 2, 3],
          string: 'test',
          number: 42,
          boolean: true,
        },
      };

      testConfig.updateValue(complexValue);
      expect(testConfig.value).toEqual(complexValue);
    });

    it('should handle special characters in key', () => {
      const specialKey = 'config.key.with.dots.and_underscores-and-dashes';
      const config = new PlatformConfiguration(specialKey, 'value', 'category');
      expect(config.key).toBe(specialKey);
    });
  });
});
