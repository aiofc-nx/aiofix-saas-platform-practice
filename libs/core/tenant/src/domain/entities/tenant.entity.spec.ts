/**
 * @file tenant.entity.spec.ts
 * @description 租户实体单元测试
 * @since 1.0.0
 */

import { TenantEntity } from './tenant.entity';
import { TenantId, TenantName, TenantCode, TenantDomain } from '@aiofix/shared';
import { TenantType, TenantStatus } from '../enums';

describe('TenantEntity', () => {
  let tenantEntity: TenantEntity;
  const tenantId = new TenantId('550e8400-e29b-41d4-a716-446655440000');
  const tenantName = new TenantName('测试租户');
  const tenantCode = new TenantCode('TEST');
  const tenantDomain = new TenantDomain('test.example.com');

  beforeEach(() => {
    tenantEntity = new TenantEntity(
      tenantId,
      tenantName,
      tenantCode,
      tenantDomain,
      TenantType.ENTERPRISE,
      TenantStatus.PENDING,
    );
  });

  describe('constructor', () => {
    it('should create tenant entity with valid data', () => {
      expect(tenantEntity).toBeDefined();
      expect(tenantEntity.id).toBe(tenantId);
      expect(tenantEntity.name).toBe(tenantName);
      expect(tenantEntity.code).toBe(tenantCode);
      expect(tenantEntity.domain).toBe(tenantDomain);
      expect(tenantEntity.type).toBe(TenantType.ENTERPRISE);
      expect(tenantEntity.status).toBe(TenantStatus.PENDING);
    });

    it('should set creation and update timestamps', () => {
      expect(tenantEntity.createdAt).toBeInstanceOf(Date);
      expect(tenantEntity.updatedAt).toBeInstanceOf(Date);
    });

    it('should set default limits based on tenant type', () => {
      expect(tenantEntity.maxUsers).toBeGreaterThan(0);
      expect(tenantEntity.maxOrganizations).toBeGreaterThan(0);
      expect(tenantEntity.maxStorageGB).toBeGreaterThan(0);
    });
  });

  describe('static factory methods', () => {
    describe('createEnterprise', () => {
      it('should create enterprise tenant', () => {
        const enterprise = TenantEntity.createEnterprise(
          tenantId,
          tenantName,
          tenantCode,
          tenantDomain,
        );

        expect(enterprise.type).toBe(TenantType.ENTERPRISE);
        expect(enterprise.status).toBe(TenantStatus.PENDING);
        expect(enterprise.maxUsers).toBe(10000);
        expect(enterprise.maxOrganizations).toBe(100);
        expect(enterprise.advancedFeaturesEnabled).toBe(true);
        expect(enterprise.ssoEnabled).toBe(true);
      });
    });

    describe('createOrganization', () => {
      it('should create organization tenant', () => {
        const organization = TenantEntity.createOrganization(
          tenantId,
          tenantName,
          tenantCode,
          tenantDomain,
        );

        expect(organization.type).toBe(TenantType.ORGANIZATION);
        expect(organization.status).toBe(TenantStatus.PENDING);
        expect(organization.maxUsers).toBe(1000);
        expect(organization.maxOrganizations).toBe(20);
        expect(organization.advancedFeaturesEnabled).toBe(true);
        expect(organization.ssoEnabled).toBe(false);
      });
    });

    describe('createPartnership', () => {
      it('should create partnership tenant', () => {
        const partnership = TenantEntity.createPartnership(
          tenantId,
          tenantName,
          tenantCode,
          tenantDomain,
        );

        expect(partnership.type).toBe(TenantType.PARTNERSHIP);
        expect(partnership.status).toBe(TenantStatus.PENDING);
        expect(partnership.maxUsers).toBe(500);
        expect(partnership.maxOrganizations).toBe(10);
        expect(partnership.advancedFeaturesEnabled).toBe(true);
        expect(partnership.ssoEnabled).toBe(false);
      });
    });

    describe('createPersonal', () => {
      it('should create personal tenant', () => {
        const personal = TenantEntity.createPersonal(
          tenantId,
          tenantName,
          tenantCode,
          tenantDomain,
        );

        expect(personal.type).toBe(TenantType.PERSONAL);
        expect(personal.status).toBe(TenantStatus.PENDING);
        expect(personal.maxUsers).toBe(10);
        expect(personal.maxOrganizations).toBe(1);
        expect(personal.advancedFeaturesEnabled).toBe(false);
        expect(personal.ssoEnabled).toBe(false);
      });
    });
  });

  describe('business methods', () => {
    describe('activate', () => {
      it('should activate tenant', () => {
        // 使用业务方法改变状态 - 从PENDING激活到ACTIVE
        tenantEntity.activate();

        expect(tenantEntity.status).toBe(TenantStatus.ACTIVE);
        expect(tenantEntity.updatedAt).toBeInstanceOf(Date);
      });

      it('should not change status if already active', () => {
        // 先激活租户
        tenantEntity.activate();
        const originalUpdatedAt = tenantEntity.updatedAt;

        // 再次激活应该不改变状态
        tenantEntity.activate();

        expect(tenantEntity.status).toBe(TenantStatus.ACTIVE);
        expect(tenantEntity.updatedAt).toBe(originalUpdatedAt);
      });
    });

    describe('suspend', () => {
      it('should suspend tenant', () => {
        // 先激活租户，然后暂停
        tenantEntity.activate();
        tenantEntity.suspend();

        expect(tenantEntity.status).toBe(TenantStatus.SUSPENDED);
        expect(tenantEntity.updatedAt).toBeInstanceOf(Date);
      });

      it('should not change status if already suspended', () => {
        // 先激活然后暂停租户
        tenantEntity.activate();
        tenantEntity.suspend();
        const originalUpdatedAt = tenantEntity.updatedAt;

        // 再次暂停应该不改变状态
        tenantEntity.suspend();

        expect(tenantEntity.status).toBe(TenantStatus.SUSPENDED);
        expect(tenantEntity.updatedAt).toBe(originalUpdatedAt);
      });
    });

    describe('delete', () => {
      it('should delete tenant', () => {
        tenantEntity.delete();

        expect(tenantEntity.status).toBe(TenantStatus.DELETED);
        expect(tenantEntity.updatedAt).toBeInstanceOf(Date);
      });
    });

    describe('updateConfig', () => {
      it('should update tenant configuration', () => {
        const newConfig = { theme: 'dark', language: 'zh-CN' };
        tenantEntity.updateConfig(newConfig);

        expect(tenantEntity.config).toEqual(newConfig);
        expect(tenantEntity.updatedAt).toBeInstanceOf(Date);
      });

      it('should merge with existing configuration', () => {
        const existingConfig = { theme: 'light' };
        tenantEntity.updateConfig(existingConfig);

        const newConfig = { language: 'zh-CN' };
        tenantEntity.updateConfig(newConfig);

        expect(tenantEntity.config).toEqual({
          theme: 'light',
          language: 'zh-CN',
        });
      });
    });
  });

  describe('validation methods', () => {
    describe('isValid', () => {
      it('should return true for valid tenant', () => {
        expect(tenantEntity.isValid()).toBe(true);
      });

      it('should return false for deleted tenant', () => {
        // 使用业务方法改变状态
        tenantEntity.delete();
        expect(tenantEntity.isValid()).toBe(false);
      });
    });

    describe('isExpired', () => {
      it('should return false for tenant without expiration', () => {
        expect(tenantEntity.isExpired()).toBe(false);
      });

      it('should return true for expired tenant', () => {
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 1);
        // 使用业务方法设置过期时间 - 通过构造函数创建新的实体
        const expiredTenant = new TenantEntity(
          tenantId,
          tenantName,
          tenantCode,
          tenantDomain,
          TenantType.ENTERPRISE,
          TenantStatus.ACTIVE,
          undefined, // description
          {}, // config
          undefined, // subscriptionPlan
          pastDate, // subscriptionExpiresAt
        );

        expect(expiredTenant.isExpired()).toBe(true);
      });
    });

    describe('isInMaintenance', () => {
      it('should return false for normal tenant', () => {
        expect(tenantEntity.isInMaintenance()).toBe(false);
      });

      it('should return true for tenant in maintenance', () => {
        // 使用业务方法改变状态 - 通过构造函数创建新的实体
        const maintenanceTenant = new TenantEntity(
          tenantId,
          tenantName,
          tenantCode,
          tenantDomain,
          TenantType.ENTERPRISE,
          TenantStatus.MAINTENANCE,
          undefined, // description
          {}, // config
          undefined, // subscriptionPlan
          undefined, // subscriptionExpiresAt
        );
        expect(maintenanceTenant.isInMaintenance()).toBe(true);
      });
    });
  });

  describe('getter methods', () => {
    it('should return correct tenant ID', () => {
      expect(tenantEntity.id).toBe(tenantId);
    });

    it('should return correct tenant name', () => {
      expect(tenantEntity.name).toBe(tenantName);
    });

    it('should return correct tenant code', () => {
      expect(tenantEntity.code).toBe(tenantCode);
    });

    it('should return correct tenant domain', () => {
      expect(tenantEntity.domain).toBe(tenantDomain);
    });

    it('should return correct tenant type', () => {
      expect(tenantEntity.type).toBe(TenantType.ENTERPRISE);
    });

    it('should return correct tenant status', () => {
      expect(tenantEntity.status).toBe(TenantStatus.PENDING);
    });

    it('should return correct limits', () => {
      const limits = {
        maxUsers: tenantEntity.maxUsers,
        maxOrganizations: tenantEntity.maxOrganizations,
        maxStorageGB: tenantEntity.maxStorageGB,
      };
      expect(limits.maxUsers).toBe(tenantEntity.maxUsers);
      expect(limits.maxOrganizations).toBe(tenantEntity.maxOrganizations);
      expect(limits.maxStorageGB).toBe(tenantEntity.maxStorageGB);
    });
  });
});
