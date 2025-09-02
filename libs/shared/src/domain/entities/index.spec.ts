/**
 * @file index.spec.ts
 * @description 实体集成测试
 *
 * 测试实体模块的整体功能，包括：
 * - 实体继承关系
 * - 实体间交互
 * - 数据隔离机制
 * - 访问控制
 */

import { BaseEntity } from './base-entity';
import { PlatformAwareEntity, PlatformAccessDeniedError } from './platform-aware.entity';
import {
  DataIsolationAwareEntity,
  DataIsolationLevel,
  DataPrivacyLevel,
  TenantAccessDeniedError,
} from './data-isolation-aware.entity';
import { PlatformConfiguration } from './platform-configuration.entity';
import { UserProfile } from './user-profile.entity';
import { Uuid } from '../value-objects/uuid.vo';

describe('Entities Integration', () => {
  let tenantId1: Uuid;
  let tenantId2: Uuid;
  let userId1: Uuid;
  let userId2: Uuid;
  let organizationId1: Uuid;
  let organizationId2: Uuid;

  beforeEach(() => {
    tenantId1 = Uuid.generate();
    tenantId2 = Uuid.generate();
    userId1 = Uuid.generate();
    userId2 = Uuid.generate();
    organizationId1 = Uuid.generate();
    organizationId2 = Uuid.generate();
  });

  describe('inheritance hierarchy', () => {
    it('should have correct inheritance chain', () => {
      // BaseEntity -> PlatformAwareEntity -> PlatformConfiguration
      const platformConfig = new PlatformConfiguration(
        'test.key',
        'test-value',
        'test-category'
      );
      expect(platformConfig).toBeInstanceOf(PlatformConfiguration);
              expect(platformConfig).toBeInstanceOf(PlatformAwareEntity);
      expect(platformConfig).toBeInstanceOf(BaseEntity);

      // BaseEntity -> DataIsolationAwareEntity -> UserProfile
      const userProfile = new UserProfile(tenantId1, userId1, 'Test User');
      expect(userProfile).toBeInstanceOf(UserProfile);
      expect(userProfile).toBeInstanceOf(DataIsolationAwareEntity);
      expect(userProfile).toBeInstanceOf(BaseEntity);
    });

    it('should have common BaseEntity properties', () => {
      const platformConfig = new PlatformConfiguration(
        'test.key',
        'test-value',
        'test-category'
      );
      const userProfile = new UserProfile(tenantId1, userId1, 'Test User');

      // Both should have BaseEntity properties
      expect(platformConfig.id).toBeInstanceOf(Uuid);
      expect(platformConfig.createdAt).toBeInstanceOf(Date);
      expect(platformConfig.updatedAt).toBeInstanceOf(Date);
      expect(typeof platformConfig.version).toBe('number');

      expect(userProfile.id).toBeInstanceOf(Uuid);
      expect(userProfile.createdAt).toBeInstanceOf(Date);
      expect(userProfile.updatedAt).toBeInstanceOf(Date);
      expect(typeof userProfile.version).toBe('number');
    });

    it('should have common BaseEntity methods', () => {
      const platformConfig = new PlatformConfiguration(
        'test.key',
        'test-value',
        'test-category'
      );
      const userProfile = new UserProfile(tenantId1, userId1, 'Test User');

      // Both should have BaseEntity methods
      expect(typeof platformConfig.equals).toBe('function');
      expect(typeof platformConfig.isNew).toBe('function');
      expect(typeof platformConfig.getAge).toBe('function');
      expect(typeof platformConfig.getTimeSinceLastUpdate).toBe('function');

      expect(typeof userProfile.equals).toBe('function');
      expect(typeof userProfile.isNew).toBe('function');
      expect(typeof userProfile.getAge).toBe('function');
      expect(typeof userProfile.getTimeSinceLastUpdate).toBe('function');
    });
  });

  describe('data isolation levels', () => {
    it('should have correct isolation levels', () => {
      const platformConfig = new PlatformConfiguration(
        'test.key',
        'test-value',
        'test-category'
      );
      const userProfile = new UserProfile(tenantId1, userId1, 'Test User');

              // PlatformAwareEntity should have platform-level access control
      expect(platformConfig.dataPrivacyLevel).toBe(DataPrivacyLevel.PROTECTED);

      // UserProfile should have user-level isolation
      expect(userProfile.dataIsolationLevel).toBe(DataIsolationLevel.USER);
      expect(userProfile.dataPrivacyLevel).toBe(DataPrivacyLevel.PROTECTED);
    });

    it('should handle different privacy levels', () => {
      const sharedConfig = PlatformConfiguration.createPublicConfig(
        'shared.key',
        'shared-value',
        'shared-category'
      );
      const protectedConfig = PlatformConfiguration.createSystemConfig(
        'protected.key',
        'protected-value',
        'protected-category'
      );
      const publicProfile = UserProfile.createPublicProfile(
        tenantId1,
        userId1,
        'Public User'
      );
      const privateProfile = UserProfile.createPrivateProfile(
        tenantId1,
        userId1,
        'Private User'
      );

      expect(sharedConfig.isSharedData()).toBe(true);
      expect(protectedConfig.isProtectedData()).toBe(true);
      expect(publicProfile.isSharedData()).toBe(true);
      expect(privateProfile.isProtectedData()).toBe(true);
    });
  });

  describe('access control', () => {
    it('should enforce platform-level access control', () => {
      const sharedConfig = PlatformConfiguration.createPublicConfig(
        'shared.key',
        'shared-value',
        'shared-category'
      );
      const protectedConfig = PlatformConfiguration.createSystemConfig(
        'protected.key',
        'protected-value',
        'protected-category'
      );

      // Shared data should be accessible
      expect(sharedConfig.canAccess(sharedConfig)).toBe(true);

      // Protected data should not be accessible without admin permission
      expect(protectedConfig.canAccess(protectedConfig)).toBe(false);
    });

    it('should enforce tenant-level access control', () => {
      const profile1 = new UserProfile(tenantId1, userId1, 'User 1');
      const profile2 = new UserProfile(tenantId2, userId2, 'User 2');

      // Same tenant should be accessible
      expect(profile1.canAccess(profile1)).toBe(true);

      // Different tenant should not be accessible
      expect(profile1.canAccess(profile2)).toBe(false);
    });

    it('should throw appropriate access denied errors', () => {
      const profile1 = new UserProfile(tenantId1, userId1, 'User 1');
      const profile2 = new UserProfile(tenantId2, userId2, 'User 2');

      // Platform access denied
      const protectedConfig = PlatformConfiguration.createSystemConfig(
        'protected.key',
        'protected-value',
        'protected-category'
      );
      expect(protectedConfig.canAccess(protectedConfig)).toBe(false);

      // Tenant access denied
      expect(() => {
        profile1.assertSameTenant(profile2);
      }).toThrow(TenantAccessDeniedError);
    });
  });

  describe('entity creation and factory methods', () => {
    it('should create entities with factory methods', () => {
      const systemConfig = PlatformConfiguration.createSystemConfig(
        'system.key',
        'system-value',
        'system-category',
        'System configuration'
      );

      const publicConfig = PlatformConfiguration.createPublicConfig(
        'public.key',
        'public-value',
        'public-category',
        'Public configuration'
      );

      const publicProfile = UserProfile.createPublicProfile(
        tenantId1,
        userId1,
        'Public User',
        organizationId1,
        [Uuid.generate()]
      );

      const privateProfile = UserProfile.createPrivateProfile(
        tenantId1,
        userId1,
        'Private User',
        organizationId1,
        [Uuid.generate()]
      );

      expect(systemConfig.isSystem).toBe(true);
      expect(systemConfig.dataPrivacyLevel).toBe(DataPrivacyLevel.PROTECTED);

      expect(publicConfig.isSystem).toBe(false);
      expect(publicConfig.dataPrivacyLevel).toBe(DataPrivacyLevel.SHARED);

      expect(publicProfile.dataPrivacyLevel).toBe(DataPrivacyLevel.SHARED);
      expect(privateProfile.dataPrivacyLevel).toBe(DataPrivacyLevel.PROTECTED);
    });
  });

  describe('data transformation', () => {
    it('should convert entities to data objects', () => {
      const platformConfig = new PlatformConfiguration(
        'test.key',
        'test-value',
        'test-category',
        true,
        'Test configuration'
      );

      const userProfile = new UserProfile(tenantId1, userId1, 'Test User');
      userProfile.updateAvatar('https://example.com/avatar.jpg');
      userProfile.updateBio('Test bio');
      userProfile.addSocialLink('twitter', 'https://twitter.com/testuser');
      userProfile.setPreference('theme', 'dark');

      const configData = platformConfig.toData();
      const profileData = userProfile.toData();

      expect(configData).toEqual({
        key: 'test.key',
        value: 'test-value',
        description: 'Test configuration',
        category: 'test-category',
        isSystem: true,
      });

      expect(profileData).toEqual({
        displayName: 'Test User',
        avatar: 'https://example.com/avatar.jpg',
        bio: 'Test bio',
        location: undefined,
        website: undefined,
        socialLinks: {
          twitter: 'https://twitter.com/testuser',
        },
        preferences: {
          theme: 'dark',
        },
      });
    });
  });

  describe('entity lifecycle', () => {
    it('should handle entity lifecycle correctly', () => {
      const platformConfig = new PlatformConfiguration(
        'test.key',
        'test-value',
        'test-category'
      );
      const userProfile = new UserProfile(tenantId1, userId1, 'Test User');

      // New entities should have version 1
      expect(platformConfig.isNew()).toBe(true);
      expect(userProfile.isNew()).toBe(true);

      // Update should increment version
      platformConfig.updateValue('updated-value');
      userProfile.updateDisplayName('Updated User');

      expect(platformConfig.isNew()).toBe(false);
      expect(userProfile.isNew()).toBe(false);
      expect(platformConfig.version).toBe(2);
      expect(userProfile.version).toBe(2);
    });

    it('should track entity age correctly', () => {
      const oldDate = new Date('2020-01-01T00:00:00Z');
      const platformConfig = new PlatformConfiguration(
        'test.key',
        'test-value',
        'test-category'
      );

      // Mock createdAt for testing
      (platformConfig as any)._createdAt = oldDate;

      const age = platformConfig.getAge();
      expect(age).toBeGreaterThan(0);
    });
  });

  describe('entity equality', () => {
    it('should compare entities correctly', () => {
      const id = Uuid.generate();
      const config1 = new PlatformConfiguration(
        'test.key',
        'test-value',
        'test-category',
        false,
        undefined,
        DataPrivacyLevel.PROTECTED,
        id
      );
      const config2 = new PlatformConfiguration(
        'test.key',
        'test-value',
        'test-category',
        false,
        undefined,
        DataPrivacyLevel.PROTECTED,
        id
      );
      const config3 = new PlatformConfiguration(
        'test.key',
        'test-value',
        'test-category',
        false,
        undefined,
        DataPrivacyLevel.PROTECTED,
        Uuid.generate()
      );

      expect(config1.equals(config2)).toBe(true);
      expect(config1.equals(config3)).toBe(false);
      expect(config1.equals(config1)).toBe(true);
    });
  });

  describe('cross-entity interactions', () => {
    it('should handle cross-entity access control', () => {
      const sharedConfig = PlatformConfiguration.createPublicConfig(
        'shared.key',
        'shared-value',
        'shared-category'
      );
      const userProfile = UserProfile.createPublicProfile(
        tenantId1,
        userId1,
        'Test User',
        organizationId1
      );

      // Shared entities should be accessible across different types
      expect(sharedConfig.canAccess(sharedConfig)).toBe(true);
      // Public UserProfile should be accessible within same organization
      expect(userProfile.canAccess(userProfile)).toBe(true);
    });

    it('should maintain data isolation across entity types', () => {
      const protectedConfig = PlatformConfiguration.createSystemConfig(
        'protected.key',
        'protected-value',
        'protected-category'
      );
      const privateProfile = UserProfile.createPrivateProfile(
        tenantId1,
        userId1,
        'Test User'
      );

      // Protected entities should maintain their isolation
      expect(protectedConfig.isProtectedData()).toBe(true);
      expect(privateProfile.isProtectedData()).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should handle access denied scenarios gracefully', () => {
      const protectedConfig = PlatformConfiguration.createSystemConfig(
        'protected.key',
        'protected-value',
        'protected-category'
      );
      const profile1 = new UserProfile(tenantId1, userId1, 'User 1');
      const profile2 = new UserProfile(tenantId2, userId2, 'User 2');

      // Should throw appropriate errors
      expect(protectedConfig.canAccess(protectedConfig)).toBe(false);

      expect(() => {
        profile1.assertSameTenant(profile2);
      }).toThrow(TenantAccessDeniedError);
    });
  });
});
