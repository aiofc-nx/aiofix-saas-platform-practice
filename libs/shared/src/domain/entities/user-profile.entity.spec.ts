/**
 * @file user-profile.entity.spec.ts
 * @description UserProfile单元测试
 *
 * 测试用户档案实体类的所有功能，包括：
 * - 构造函数和属性访问
 * - 档案信息更新
 * - 社交链接管理
 * - 偏好设置管理
 * - 静态工厂方法
 * - 数据转换
 * - 继承功能
 */

import { UserProfile, UserProfileData } from './user-profile.entity';
import {
  DataPrivacyLevel,
  DataIsolationAwareEntity,
} from './data-isolation-aware.entity';
import { Uuid } from '../value-objects/uuid.vo';

describe('UserProfile', () => {
  let tenantId: Uuid;
  let userId: Uuid;
  let organizationId: Uuid;
  let departmentId: Uuid;
  let userProfile: UserProfile;

  beforeEach(() => {
    tenantId = Uuid.generate();
    userId = Uuid.generate();
    organizationId = Uuid.generate();
    departmentId = Uuid.generate();
    userProfile = new UserProfile(
      tenantId,
      userId,
      'John Doe',
      DataPrivacyLevel.PROTECTED,
      undefined,
      organizationId,
      [departmentId],
    );
  });

  describe('constructor', () => {
    it('should create user profile with all provided values', () => {
      const profile = new UserProfile(
        tenantId,
        userId,
        'Jane Smith',
        DataPrivacyLevel.SHARED,
        undefined,
        organizationId,
        [departmentId],
      );

      expect(profile.tenantId).toBe(tenantId);
      expect(profile.userId).toBe(userId);
      expect(profile.displayName).toBe('Jane Smith');
      expect(profile.dataPrivacyLevel).toBe(DataPrivacyLevel.SHARED);
      expect(profile.organizationId).toBe(organizationId);
      expect(profile.departmentIds).toEqual([departmentId]);
      expect(profile.dataIsolationLevel).toBe('user');
    });

    it('should create user profile with default values', () => {
      const profile = new UserProfile(tenantId, userId, 'Default User');

      expect(profile.tenantId).toBe(tenantId);
      expect(profile.userId).toBe(userId);
      expect(profile.displayName).toBe('Default User');
      expect(profile.dataPrivacyLevel).toBe(DataPrivacyLevel.PROTECTED);
      expect(profile.organizationId).toBeUndefined();
      expect(profile.departmentIds).toEqual([]);
      expect(profile.dataIsolationLevel).toBe('user');
    });

    it('should create user profile with partial values', () => {
      const profile = new UserProfile(
        tenantId,
        userId,
        'Partial User',
        DataPrivacyLevel.SHARED,
        undefined,
        organizationId,
      );

      expect(profile.displayName).toBe('Partial User');
      expect(profile.dataPrivacyLevel).toBe(DataPrivacyLevel.SHARED);
      expect(profile.organizationId).toBe(organizationId);
      expect(profile.departmentIds).toEqual([]);
    });
  });

  describe('properties', () => {
    it('should have readable displayName', () => {
      expect(userProfile.displayName).toBe('John Doe');
    });

    it('should have readable avatar', () => {
      expect(userProfile.avatar).toBeUndefined();
    });

    it('should have readable bio', () => {
      expect(userProfile.bio).toBeUndefined();
    });

    it('should have readable location', () => {
      expect(userProfile.location).toBeUndefined();
    });

    it('should have readable website', () => {
      expect(userProfile.website).toBeUndefined();
    });

    it('should have readonly socialLinks', () => {
      expect(userProfile.socialLinks).toEqual({});

      // 修改返回的对象不应影响原对象
      const socialLinks = userProfile.socialLinks;
      socialLinks['twitter'] = 'https://twitter.com/johndoe';
      expect(userProfile.socialLinks).toEqual({});
    });

    it('should have readonly preferences', () => {
      expect(userProfile.preferences).toEqual({});

      // 修改返回的对象不应影响原对象
      const preferences = userProfile.preferences;
      preferences['theme'] = 'dark';
      expect(userProfile.preferences).toEqual({});
    });
  });

  describe('updateDisplayName', () => {
    it('should update display name', () => {
      userProfile.updateDisplayName('Jane Doe');
      expect(userProfile.displayName).toBe('Jane Doe');
    });

    it('should update timestamp when display name changes', () => {
      const originalUpdatedAt = userProfile.updatedAt;

      setTimeout(() => {
        userProfile.updateDisplayName('New Name');
        expect(userProfile.updatedAt.getTime()).toBeGreaterThan(
          originalUpdatedAt.getTime(),
        );
      }, 1);
    });

    it('should increment version when display name changes', () => {
      const originalVersion = userProfile.version;
      userProfile.updateDisplayName('New Name');

      expect(userProfile.version).toBe(originalVersion + 1);
    });
  });

  describe('updateAvatar', () => {
    it('should update avatar', () => {
      const avatarUrl = 'https://example.com/avatar.jpg';
      userProfile.updateAvatar(avatarUrl);
      expect(userProfile.avatar).toBe(avatarUrl);
    });

    it('should update timestamp when avatar changes', () => {
      const originalUpdatedAt = userProfile.updatedAt;

      setTimeout(() => {
        userProfile.updateAvatar('https://example.com/new-avatar.jpg');
        expect(userProfile.updatedAt.getTime()).toBeGreaterThan(
          originalUpdatedAt.getTime(),
        );
      }, 1);
    });
  });

  describe('updateBio', () => {
    it('should update bio', () => {
      const bio = 'Software developer with 5 years of experience';
      userProfile.updateBio(bio);
      expect(userProfile.bio).toBe(bio);
    });

    it('should update timestamp when bio changes', () => {
      const originalUpdatedAt = userProfile.updatedAt;

      setTimeout(() => {
        userProfile.updateBio('New bio');
        expect(userProfile.updatedAt.getTime()).toBeGreaterThan(
          originalUpdatedAt.getTime(),
        );
      }, 1);
    });
  });

  describe('updateLocation', () => {
    it('should update location', () => {
      const location = 'San Francisco, CA';
      userProfile.updateLocation(location);
      expect(userProfile.location).toBe(location);
    });

    it('should update timestamp when location changes', () => {
      const originalUpdatedAt = userProfile.updatedAt;

      setTimeout(() => {
        userProfile.updateLocation('New York, NY');
        expect(userProfile.updatedAt.getTime()).toBeGreaterThan(
          originalUpdatedAt.getTime(),
        );
      }, 1);
    });
  });

  describe('updateWebsite', () => {
    it('should update website', () => {
      const website = 'https://johndoe.com';
      userProfile.updateWebsite(website);
      expect(userProfile.website).toBe(website);
    });

    it('should update timestamp when website changes', () => {
      const originalUpdatedAt = userProfile.updatedAt;

      setTimeout(() => {
        userProfile.updateWebsite('https://newwebsite.com');
        expect(userProfile.updatedAt.getTime()).toBeGreaterThan(
          originalUpdatedAt.getTime(),
        );
      }, 1);
    });
  });

  describe('social links management', () => {
    it('should add social link', () => {
      userProfile.addSocialLink('twitter', 'https://twitter.com/johndoe');
      expect(userProfile.socialLinks).toEqual({
        twitter: 'https://twitter.com/johndoe',
      });
    });

    it('should add multiple social links', () => {
      userProfile.addSocialLink('twitter', 'https://twitter.com/johndoe');
      userProfile.addSocialLink('linkedin', 'https://linkedin.com/in/johndoe');
      userProfile.addSocialLink('github', 'https://github.com/johndoe');

      expect(userProfile.socialLinks).toEqual({
        twitter: 'https://twitter.com/johndoe',
        linkedin: 'https://linkedin.com/in/johndoe',
        github: 'https://github.com/johndoe',
      });
    });

    it('should update existing social link', () => {
      userProfile.addSocialLink('twitter', 'https://twitter.com/johndoe');
      userProfile.addSocialLink('twitter', 'https://twitter.com/johndoe_new');

      expect(userProfile.socialLinks).toEqual({
        twitter: 'https://twitter.com/johndoe_new',
      });
    });

    it('should remove social link', () => {
      userProfile.addSocialLink('twitter', 'https://twitter.com/johndoe');
      userProfile.addSocialLink('linkedin', 'https://linkedin.com/in/johndoe');

      userProfile.removeSocialLink('twitter');

      expect(userProfile.socialLinks).toEqual({
        linkedin: 'https://linkedin.com/in/johndoe',
      });
    });

    it('should update timestamp when social links change', () => {
      const originalUpdatedAt = userProfile.updatedAt;

      setTimeout(() => {
        userProfile.addSocialLink('twitter', 'https://twitter.com/johndoe');
        expect(userProfile.updatedAt.getTime()).toBeGreaterThan(
          originalUpdatedAt.getTime(),
        );
      }, 1);
    });
  });

  describe('preferences management', () => {
    it('should set preference', () => {
      userProfile.setPreference('theme', 'dark');
      expect(userProfile.preferences).toEqual({
        theme: 'dark',
      });
    });

    it('should set multiple preferences', () => {
      userProfile.setPreference('theme', 'dark');
      userProfile.setPreference('language', 'en');
      userProfile.setPreference('notifications', true);

      expect(userProfile.preferences).toEqual({
        theme: 'dark',
        language: 'en',
        notifications: true,
      });
    });

    it('should update existing preference', () => {
      userProfile.setPreference('theme', 'light');
      userProfile.setPreference('theme', 'dark');

      expect(userProfile.preferences).toEqual({
        theme: 'dark',
      });
    });

    it('should get preference', () => {
      userProfile.setPreference('theme', 'dark');
      expect(userProfile.getPreference('theme')).toBe('dark');
    });

    it('should return undefined for non-existent preference', () => {
      expect(userProfile.getPreference('non-existent')).toBeUndefined();
    });

    it('should remove preference', () => {
      userProfile.setPreference('theme', 'dark');
      userProfile.setPreference('language', 'en');

      userProfile.removePreference('theme');

      expect(userProfile.preferences).toEqual({
        language: 'en',
      });
    });

    it('should update timestamp when preferences change', () => {
      const originalUpdatedAt = userProfile.updatedAt;

      setTimeout(() => {
        userProfile.setPreference('theme', 'dark');
        expect(userProfile.updatedAt.getTime()).toBeGreaterThan(
          originalUpdatedAt.getTime(),
        );
      }, 1);
    });
  });

  describe('toData', () => {
    it('should convert to data object correctly', () => {
      userProfile.updateDisplayName('John Doe');
      userProfile.updateAvatar('https://example.com/avatar.jpg');
      userProfile.updateBio('Software developer');
      userProfile.updateLocation('San Francisco, CA');
      userProfile.updateWebsite('https://johndoe.com');
      userProfile.addSocialLink('twitter', 'https://twitter.com/johndoe');
      userProfile.setPreference('theme', 'dark');

      const data = userProfile.toData();

      expect(data).toEqual({
        displayName: 'John Doe',
        avatar: 'https://example.com/avatar.jpg',
        bio: 'Software developer',
        location: 'San Francisco, CA',
        website: 'https://johndoe.com',
        socialLinks: {
          twitter: 'https://twitter.com/johndoe',
        },
        preferences: {
          theme: 'dark',
        },
      });
    });

    it('should handle undefined optional fields', () => {
      const data = userProfile.toData();

      expect(data.displayName).toBe('John Doe');
      expect(data.avatar).toBeUndefined();
      expect(data.bio).toBeUndefined();
      expect(data.location).toBeUndefined();
      expect(data.website).toBeUndefined();
      expect(data.socialLinks).toEqual({});
      expect(data.preferences).toEqual({});
    });
  });

  describe('static methods', () => {
    describe('createPublicProfile', () => {
      it('should create public profile', () => {
        const publicProfile = UserProfile.createPublicProfile(
          tenantId,
          userId,
          'Public User',
          organizationId,
          [departmentId],
        );

        expect(publicProfile.displayName).toBe('Public User');
        expect(publicProfile.dataPrivacyLevel).toBe(DataPrivacyLevel.SHARED);
        expect(publicProfile.tenantId).toBe(tenantId);
        expect(publicProfile.userId).toBe(userId);
        expect(publicProfile.organizationId).toBe(organizationId);
        expect(publicProfile.departmentIds).toEqual([departmentId]);
      });

      it('should create public profile without optional values', () => {
        const publicProfile = UserProfile.createPublicProfile(
          tenantId,
          userId,
          'Public User',
        );

        expect(publicProfile.displayName).toBe('Public User');
        expect(publicProfile.dataPrivacyLevel).toBe(DataPrivacyLevel.SHARED);
        expect(publicProfile.organizationId).toBeUndefined();
        expect(publicProfile.departmentIds).toEqual([]);
      });
    });

    describe('createPrivateProfile', () => {
      it('should create private profile', () => {
        const privateProfile = UserProfile.createPrivateProfile(
          tenantId,
          userId,
          'Private User',
          organizationId,
          [departmentId],
        );

        expect(privateProfile.displayName).toBe('Private User');
        expect(privateProfile.dataPrivacyLevel).toBe(
          DataPrivacyLevel.PROTECTED,
        );
        expect(privateProfile.tenantId).toBe(tenantId);
        expect(privateProfile.userId).toBe(userId);
        expect(privateProfile.organizationId).toBe(organizationId);
        expect(privateProfile.departmentIds).toEqual([departmentId]);
      });

      it('should create private profile without optional values', () => {
        const privateProfile = UserProfile.createPrivateProfile(
          tenantId,
          userId,
          'Private User',
        );

        expect(privateProfile.displayName).toBe('Private User');
        expect(privateProfile.dataPrivacyLevel).toBe(
          DataPrivacyLevel.PROTECTED,
        );
        expect(privateProfile.organizationId).toBeUndefined();
        expect(privateProfile.departmentIds).toEqual([]);
      });
    });
  });

  describe('inheritance', () => {
    it('should inherit from DataIsolationAwareEntity', () => {
      expect(userProfile).toBeInstanceOf(UserProfile);
      expect(userProfile.id).toBeInstanceOf(Uuid);
      expect(userProfile.createdAt).toBeInstanceOf(Date);
      expect(userProfile.updatedAt).toBeInstanceOf(Date);
      expect(typeof userProfile.version).toBe('number');
    });

    it('should have DataIsolationAwareEntity methods', () => {
      expect(typeof userProfile.canAccess).toBe('function');
      // Test methods are not available on UserProfile, only on TestDataIsolationEntity
      expect(userProfile).toBeInstanceOf(DataIsolationAwareEntity);
    });

    it('should have BaseEntity methods', () => {
      expect(typeof userProfile.equals).toBe('function');
      expect(typeof userProfile.isNew).toBe('function');
      expect(typeof userProfile.getAge).toBe('function');
      expect(typeof userProfile.getTimeSinceLastUpdate).toBe('function');
    });
  });

  describe('data isolation', () => {
    it('should have user-level isolation', () => {
      expect(userProfile.dataIsolationLevel).toBe('user');
    });

    it('should handle shared data correctly', () => {
      const sharedProfile = UserProfile.createPublicProfile(
        tenantId,
        userId,
        'Shared User',
      );
      expect(sharedProfile.isSharedData()).toBe(true);
      expect(sharedProfile.isProtectedData()).toBe(false);
    });

    it('should handle protected data correctly', () => {
      expect(userProfile.isProtectedData()).toBe(true);
      expect(userProfile.isSharedData()).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle empty display name', () => {
      const profile = new UserProfile(tenantId, userId, '');
      expect(profile.displayName).toBe('');
    });

    it('should handle empty social links', () => {
      userProfile.addSocialLink('empty', '');
      expect(userProfile.socialLinks).toEqual({
        empty: '',
      });
    });

    it('should handle complex preference values', () => {
      const complexValue = {
        nested: {
          array: [1, 2, 3],
          string: 'test',
          number: 42,
          boolean: true,
        },
      };

      userProfile.setPreference('complex', complexValue);
      expect(userProfile.getPreference('complex')).toEqual(complexValue);
    });

    it('should handle special characters in display name', () => {
      const specialName = 'John Doe (CEO) - @johndoe';
      userProfile.updateDisplayName(specialName);
      expect(userProfile.displayName).toBe(specialName);
    });
  });
});
