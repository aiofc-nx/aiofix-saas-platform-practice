/**
 * @description 测试数据工厂，用于生成测试数据
 * @author 技术架构师
 * @since 2.1.0
 */

import { UserId, Username, Email, PhoneNumber, TenantId } from '@aiofix/shared';
import { UserType } from '../../domain/enums/user-type.enum';
import { UserStatus } from '../../domain/enums/user-status.enum';
import { DataPrivacyLevel } from '@aiofix/shared';

/**
 * 用户测试数据工厂
 */
export class UserTestFactory {
  /**
   * 创建测试用户ID - 使用有效的UUID v4格式
   */
  static createUserId(): string {
    return UserId.generate().toString();
  }

  /**
   * 创建测试租户ID - 使用有效的UUID v4格式
   */
  static createTenantId(): string {
    return TenantId.generate().toString();
  }

  /**
   * 创建测试组织ID - 使用有效的UUID v4格式
   */
  static createOrganizationId(): string {
    return TenantId.generate().toString();
  }

  /**
   * 创建测试部门ID - 使用有效的UUID v4格式
   */
  static createDepartmentId(): string {
    return TenantId.generate().toString();
  }

  /**
   * 创建有效的用户名
   */
  static createValidUsername(): string {
    return `testuser_${Date.now()}`;
  }

  /**
   * 创建有效的邮箱
   */
  static createValidEmail(): string {
    return `test_${Date.now()}@example.com`;
  }

  /**
   * 创建有效的电话号码
   */
  static createValidPhone(): string {
    return `+86${Math.floor(Math.random() * 9000000000) + 1000000000}`;
  }

  /**
   * 创建测试用户数据
   */
  static createUserData(overrides: Partial<any> = {}) {
    return {
      id: this.createUserId(),
      username: this.createValidUsername(),
      email: this.createValidEmail(),
      phone: this.createValidPhone(),
      userType: UserType.TENANT_USER,
      status: UserStatus.ACTIVE,
      tenantId: this.createTenantId(),
      organizationId: this.createOrganizationId(),
      departmentIds: [this.createDepartmentId()],
      dataPrivacyLevel: DataPrivacyLevel.PROTECTED,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides
    };
  }

  /**
   * 创建测试用户档案数据
   */
  static createUserProfileData(overrides: Partial<any> = {}) {
    return {
      id: `profile-${this.createUserId()}`,
      userId: this.createUserId(),
      displayName: `Test User ${Date.now()}`,
      avatar: `https://example.com/avatar-${Date.now()}.jpg`,
      bio: `This is a test user bio ${Date.now()}`,
      location: `Test City ${Date.now()}`,
      website: `https://example-${Date.now()}.com`,
      phone: this.createValidPhone(),
      dateOfBirth: new Date('1990-01-01'),
      gender: 'male',
      language: 'zh-CN',
      timezone: 'Asia/Shanghai',
      preferences: {
        notifications: {
          email: true,
          sms: false,
          push: true
        },
        privacy: {
          profileVisibility: 'public',
          contactVisibility: 'private'
        },
        theme: 'light'
      },
      socialLinks: {
        linkedin: `https://linkedin.com/in/test-${Date.now()}`,
        twitter: `https://twitter.com/test-${Date.now()}`,
        github: `https://github.com/test-${Date.now()}`,
        facebook: `https://facebook.com/test-${Date.now()}`
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
      ...overrides
    };
  }

  /**
   * 创建测试命令数据
   */
  static createCreateUserCommandData(overrides: Partial<any> = {}) {
    return {
      username: this.createValidUsername(),
      email: this.createValidEmail(),
      phone: this.createValidPhone(),
      userType: UserType.TENANT_USER,
      dataPrivacyLevel: DataPrivacyLevel.PROTECTED,
      tenantId: this.createTenantId(),
      organizationId: this.createOrganizationId(),
      departmentIds: [this.createDepartmentId()],
      profile: {
        displayName: `Test User ${Date.now()}`,
        avatar: `https://example.com/avatar-${Date.now()}.jpg`,
        bio: `This is a test user bio ${Date.now()}`,
        location: `Test City ${Date.now()}`,
        website: `https://example-${Date.now()}.com`
      },
      ...overrides
    };
  }

  /**
   * 创建测试查询数据
   */
  static createGetUserQueryData(overrides: Partial<any> = {}) {
    return {
      userId: this.createUserId(),
      options: {
        includeProfile: true,
        includeRelationships: false,
        includeSensitiveData: false
      },
      requestUserId: this.createUserId(),
      ...overrides
    };
  }

  /**
   * 创建测试事件数据
   */
  static createUserCreatedEventData(overrides: Partial<any> = {}) {
    return {
      userId: this.createUserId(),
      username: this.createValidUsername(),
      email: this.createValidEmail(),
      tenantId: this.createTenantId(),
      organizationId: this.createOrganizationId(),
      departmentIds: [this.createDepartmentId()],
      userType: UserType.TENANT_USER,
      dataPrivacyLevel: DataPrivacyLevel.PROTECTED,
      createdAt: new Date(),
      ...overrides
    };
  }
}
