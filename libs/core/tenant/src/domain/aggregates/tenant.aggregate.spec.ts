/**
 * @file tenant.aggregate.spec.ts
 * @description 租户聚合根单元测试
 * @since 1.0.0
 */

import { TenantAggregate } from './tenant.aggregate';
import { TenantEntity } from '../entities/tenant.entity';
import { TenantId, TenantName, TenantCode, TenantDomain } from '@aiofix/shared';
import { TenantType, TenantStatus } from '../enums';
import {
  TenantCreatedEvent,
  TenantActivatedEvent,
  TenantSuspendedEvent,
  TenantDeletedEvent,
  TenantConfigChangedEvent,
} from '../domain-events';

describe('TenantAggregate', () => {
  let tenantAggregate: TenantAggregate;
  const tenantId = '550e8400-e29b-41d4-a716-446655440000';
  const tenantName = '测试租户';
  const tenantCode = 'TEST';
  const tenantDomain = 'test.example.com';

  beforeEach(() => {
    tenantAggregate = TenantAggregate.createEnterprise(
      new TenantId(tenantId),
      new TenantName(tenantName),
      new TenantCode(tenantCode),
      new TenantDomain(tenantDomain),
    );
  });

  describe('static factory methods', () => {
    describe('createEnterprise', () => {
      it('should create enterprise tenant aggregate', () => {
        const aggregate = TenantAggregate.createEnterprise(
          new TenantId(tenantId),
          new TenantName(tenantName),
          new TenantCode(tenantCode),
          new TenantDomain(tenantDomain),
        );

        expect(aggregate).toBeDefined();
        expect(aggregate.getTenantId().value).toBe(tenantId);
        expect(aggregate.getTenantName().value).toBe(tenantName);
        expect(aggregate.getTenantCode().value).toBe(tenantCode);
        expect(aggregate.getTenantDomain().value).toBe(tenantDomain);
        expect(aggregate.getTenantType()).toBe(TenantType.ENTERPRISE);
        expect(aggregate.getTenantStatus()).toBe(TenantStatus.PENDING);
      });

      it('should publish TenantCreatedEvent', () => {
        const aggregate = TenantAggregate.createEnterprise(
          new TenantId(tenantId),
          new TenantName(tenantName),
          new TenantCode(tenantCode),
          new TenantDomain(tenantDomain),
        );

        const events = aggregate.uncommittedEvents;
        expect(events).toHaveLength(1);
        expect(events[0]).toBeInstanceOf(TenantCreatedEvent);
        expect((events[0] as TenantCreatedEvent).getTenantId()).toBe(tenantId);
      });
    });

    describe('createOrganization', () => {
      it('should create organization tenant aggregate', () => {
        const aggregate = TenantAggregate.createOrganization(
          new TenantId(tenantId),
          new TenantName(tenantName),
          new TenantCode(tenantCode),
          new TenantDomain(tenantDomain),
        );

        expect(aggregate.getTenantType()).toBe(TenantType.ORGANIZATION);
        expect(aggregate.getTenantStatus()).toBe(TenantStatus.PENDING);
      });
    });

    describe('createPartnership', () => {
      it('should create partnership tenant aggregate', () => {
        const aggregate = TenantAggregate.createPartnership(
          new TenantId(tenantId),
          new TenantName(tenantName),
          new TenantCode(tenantCode),
          new TenantDomain(tenantDomain),
        );

        expect(aggregate.getTenantType()).toBe(TenantType.PARTNERSHIP);
        expect(aggregate.getTenantStatus()).toBe(TenantStatus.PENDING);
      });
    });

    describe('createPersonal', () => {
      it('should create personal tenant aggregate', () => {
        const aggregate = TenantAggregate.createPersonal(
          new TenantId(tenantId),
          new TenantName(tenantName),
          new TenantCode(tenantCode),
          new TenantDomain(tenantDomain),
        );

        expect(aggregate.getTenantType()).toBe(TenantType.PERSONAL);
        expect(aggregate.getTenantStatus()).toBe(TenantStatus.PENDING);
      });
    });
  });

  describe('business methods', () => {
    describe('activate', () => {
      it('should activate tenant and publish event', () => {
        // 先清除创建事件
        tenantAggregate.clearEvents();

        // 从PENDING状态激活
        tenantAggregate.activate();

        expect(tenantAggregate.getTenantStatus()).toBe(TenantStatus.ACTIVE);

        const events = tenantAggregate.uncommittedEvents;
        expect(events).toHaveLength(1);
        expect(events[0]).toBeInstanceOf(TenantActivatedEvent);
        expect((events[0] as TenantActivatedEvent).getTenantId()).toBe(
          tenantId,
        );
      });

      it('should not publish event if already active', () => {
        // 先激活租户
        tenantAggregate.activate();
        tenantAggregate.clearEvents();

        // 再次激活应该不发布事件
        tenantAggregate.activate();

        const events = tenantAggregate.uncommittedEvents;
        expect(events).toHaveLength(0);
      });
    });

    describe('suspend', () => {
      it('should suspend tenant and publish event', () => {
        // 先激活租户
        tenantAggregate.activate();
        tenantAggregate.clearEvents();

        // 然后暂停
        tenantAggregate.suspend();

        expect(tenantAggregate.getTenantStatus()).toBe(TenantStatus.SUSPENDED);

        const events = tenantAggregate.uncommittedEvents;
        expect(events).toHaveLength(1);
        expect(events[0]).toBeInstanceOf(TenantSuspendedEvent);
        expect((events[0] as TenantSuspendedEvent).getTenantId()).toBe(
          tenantId,
        );
      });

      it('should not publish event if already suspended', () => {
        // 先激活然后暂停租户
        tenantAggregate.activate();
        tenantAggregate.suspend();
        tenantAggregate.clearEvents();

        // 再次暂停应该不发布事件
        tenantAggregate.suspend();

        const events = tenantAggregate.uncommittedEvents;
        expect(events).toHaveLength(0);
      });
    });

    describe('resume', () => {
      it('should resume suspended tenant', () => {
        // 先激活然后暂停租户
        tenantAggregate.activate();
        tenantAggregate.suspend();
        tenantAggregate.clearEvents();

        // 然后恢复
        tenantAggregate.resume();

        expect(tenantAggregate.getTenantStatus()).toBe(TenantStatus.ACTIVE);
      });

      it('should not change status if not suspended', () => {
        tenantAggregate.clearEvents();

        // PENDING状态的租户不能恢复，应该抛出错误
        expect(() => tenantAggregate.resume()).toThrow();

        expect(tenantAggregate.getTenantStatus()).toBe(TenantStatus.PENDING);
      });
    });

    describe('delete', () => {
      it('should delete tenant and publish event', () => {
        tenantAggregate.clearEvents();

        tenantAggregate.delete();

        expect(tenantAggregate.getTenantStatus()).toBe(TenantStatus.DELETED);

        const events = tenantAggregate.uncommittedEvents;
        expect(events).toHaveLength(1);
        expect(events[0]).toBeInstanceOf(TenantDeletedEvent);
        expect((events[0] as TenantDeletedEvent).getTenantId()).toBe(tenantId);
      });
    });

    describe('updateConfig', () => {
      it('should update tenant configuration and publish event', () => {
        const newConfig = { theme: 'dark', language: 'zh-CN' };
        tenantAggregate.clearEvents();

        tenantAggregate.updateConfig(newConfig);

        expect(tenantAggregate.getTenantConfig()).toEqual(newConfig);

        const events = tenantAggregate.uncommittedEvents;
        expect(events).toHaveLength(1);
        expect(events[0]).toBeInstanceOf(TenantConfigChangedEvent);
        expect((events[0] as TenantConfigChangedEvent).getTenantId()).toBe(
          tenantId,
        );
      });
    });
  });

  describe('getter methods', () => {
    it('should return correct tenant entity', () => {
      const tenant = tenantAggregate.getTenant();
      expect(tenant).toBeDefined();
      expect(tenant.id.toString()).toBe(tenantId);
      expect(tenant.name.toString()).toBe(tenantName);
    });

    it('should return correct tenant ID', () => {
      expect(tenantAggregate.getTenantId().value).toBe(tenantId);
    });

    it('should return correct tenant name', () => {
      expect(tenantAggregate.getTenantName().value).toBe(tenantName);
    });

    it('should return correct tenant code', () => {
      expect(tenantAggregate.getTenantCode().value).toBe(tenantCode);
    });

    it('should return correct tenant domain', () => {
      expect(tenantAggregate.getTenantDomain().value).toBe(tenantDomain);
    });

    it('should return correct tenant type', () => {
      expect(tenantAggregate.getTenantType()).toBe(TenantType.ENTERPRISE);
    });

    it('should return correct tenant status', () => {
      expect(tenantAggregate.getTenantStatus()).toBe(TenantStatus.PENDING);
    });

    it('should return correct tenant configuration', () => {
      const config = { theme: 'light' };
      tenantAggregate.updateConfig(config);
      expect(tenantAggregate.getTenantConfig()).toEqual(config);
    });

    it('should return correct limits', () => {
      const limits = tenantAggregate.getLimits();
      expect(limits).toBeDefined();
      expect(limits.maxUsers).toBeGreaterThan(0);
      expect(limits.maxOrganizations).toBeGreaterThan(0);
      expect(limits.maxStorageGB).toBeGreaterThan(0);
    });
  });

  describe('validation methods', () => {
    describe('isValid', () => {
      it('should return true for valid tenant', () => {
        expect(tenantAggregate.isValid()).toBe(true);
      });

      it('should return false for deleted tenant', () => {
        tenantAggregate.delete();
        expect(tenantAggregate.isValid()).toBe(false);
      });
    });

    describe('isExpired', () => {
      it('should return false for tenant without expiration', () => {
        expect(tenantAggregate.isExpired()).toBe(false);
      });

      it('should return true for expired tenant', () => {
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 1);
        // 使用业务方法设置过期时间 - 通过构造函数创建新的聚合根
        const expiredTenant = TenantAggregate.createEnterprise(
          new TenantId('550e8400-e29b-41d4-a716-446655440001'),
          new TenantName('Expired Tenant'),
          new TenantCode('EXP'),
          new TenantDomain('expired.com'),
        );
        // 模拟设置过期时间
        const expiredEntity = new TenantEntity(
          new TenantId('550e8400-e29b-41d4-a716-446655440001'),
          new TenantName('Expired Tenant'),
          new TenantCode('EXP'),
          new TenantDomain('expired.com'),
          TenantType.ENTERPRISE,
          TenantStatus.ACTIVE,
          undefined, // description
          {}, // config
          undefined, // subscriptionPlan
          pastDate, // subscriptionExpiresAt
        );
        expiredTenant['_tenant'] = expiredEntity;

        expect(expiredTenant.isExpired()).toBe(true);
      });
    });

    describe('isInMaintenance', () => {
      it('should return false for normal tenant', () => {
        expect(tenantAggregate.isInMaintenance()).toBe(false);
      });

      it('should return true for tenant in maintenance', () => {
        // 使用业务方法改变状态 - 通过构造函数创建新的聚合根
        const maintenanceTenant = TenantAggregate.createEnterprise(
          new TenantId('550e8400-e29b-41d4-a716-446655440002'),
          new TenantName('Maintenance Tenant'),
          new TenantCode('MAINT'),
          new TenantDomain('maintenance.com'),
        );
        // 模拟设置维护状态
        const maintenanceEntity = new TenantEntity(
          new TenantId('550e8400-e29b-41d4-a716-446655440002'),
          new TenantName('Maintenance Tenant'),
          new TenantCode('MAINT'),
          new TenantDomain('maintenance.com'),
          TenantType.ENTERPRISE,
          TenantStatus.MAINTENANCE,
          undefined, // description
          {}, // config
          undefined, // subscriptionPlan
          undefined, // subscriptionExpiresAt
        );
        maintenanceTenant['_tenant'] = maintenanceEntity;
        expect(maintenanceTenant.isInMaintenance()).toBe(true);
      });
    });

    describe('canTransitionTo', () => {
      it('should allow transition from ACTIVE to SUSPENDED', () => {
        // 先激活租户
        tenantAggregate.activate();
        expect(tenantAggregate.canTransitionTo(TenantStatus.SUSPENDED)).toBe(
          true,
        );
      });

      it('should allow transition from SUSPENDED to ACTIVE', () => {
        // 先激活然后暂停租户
        tenantAggregate.activate();
        tenantAggregate.suspend();
        expect(tenantAggregate.canTransitionTo(TenantStatus.ACTIVE)).toBe(true);
      });

      it('should allow transition to DELETED from any status', () => {
        expect(tenantAggregate.canTransitionTo(TenantStatus.DELETED)).toBe(
          true,
        );
      });

      it('should not allow transition from DELETED to any other status', () => {
        tenantAggregate.delete();
        expect(tenantAggregate.canTransitionTo(TenantStatus.ACTIVE)).toBe(
          false,
        );
        expect(tenantAggregate.canTransitionTo(TenantStatus.SUSPENDED)).toBe(
          false,
        );
      });
    });
  });

  describe('event management', () => {
    it('should track uncommitted events', () => {
      const initialEvents = tenantAggregate.uncommittedEvents;
      expect(initialEvents).toHaveLength(1); // TenantCreatedEvent

      tenantAggregate.activate();
      const eventsAfterActivate = tenantAggregate.uncommittedEvents;
      expect(eventsAfterActivate).toHaveLength(2); // TenantCreatedEvent + TenantActivatedEvent
    });

    it('should clear events after marking as committed', () => {
      const initialEvents = tenantAggregate.uncommittedEvents;
      expect(initialEvents).toHaveLength(1);

      tenantAggregate.clearEvents();
      const eventsAfterCommit = tenantAggregate.uncommittedEvents;
      expect(eventsAfterCommit).toHaveLength(0);
    });
  });
});
