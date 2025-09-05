/**
 * @file tenant.repository.integration.spec.ts
 * @description PostgreSQL租户仓储集成测试
 * @since 1.0.0
 */

import { Test, TestingModule } from '@nestjs/testing';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { EntityManager } from '@mikro-orm/core';
import { TenantPostgresRepository } from './tenant.repository';
import { TenantPostgresMapper } from '../../mappers/postgresql/tenant.mapper';
import { TenantOrmEntity } from '../../entities/postgresql/tenant.orm-entity';
import { TenantAggregate } from '../../../domain/aggregates/tenant.aggregate';
import { TenantType, TenantStatus } from '../../../domain/enums';
import { TenantId, TenantCode, TenantDomain } from '@aiofix/shared';

describe('TenantPostgresRepository (Integration)', () => {
  let app: TestingModule;
  let repository: TenantPostgresRepository;
  let entityManager: EntityManager;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      imports: [
        MikroOrmModule.forRoot({
          type: 'postgresql',
          host: process.env.TEST_DB_HOST || 'localhost',
          port: parseInt(process.env.TEST_DB_PORT || '5432'),
          dbName: process.env.TEST_DB_NAME || 'aiofix_saas_test',
          user: process.env.TEST_DB_USER || 'postgres',
          password: process.env.TEST_DB_PASSWORD || 'postgres',
          entities: [TenantOrmEntity],
          synchronize: true,
          dropSchema: true,
        }),
        MikroOrmModule.forFeature([TenantOrmEntity]),
      ],
      providers: [TenantPostgresRepository, TenantPostgresMapper],
    }).compile();

    repository = app.get<TenantPostgresRepository>(TenantPostgresRepository);
    entityManager = app.get<EntityManager>(EntityManager);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // 清理测试数据
    await entityManager.nativeDelete(TenantOrmEntity, {});
  });

  describe('CRUD operations', () => {
    it('should create and find tenant', async () => {
      // 创建租户聚合根
      const tenantAggregate = TenantAggregate.createEnterprise(
        'tenant-123',
        '测试租户',
        'TEST',
        'test.example.com',
      );

      // 保存到数据库
      await repository.save(tenantAggregate);

      // 从数据库查找
      const foundTenant = await repository.findById(new TenantId('tenant-123'));

      expect(foundTenant).toBeDefined();
      expect(foundTenant?.id.toString()).toBe('tenant-123');
      expect(foundTenant?.name.toString()).toBe('测试租户');
      expect(foundTenant?.code.toString()).toBe('TEST');
      expect(foundTenant?.domain.toString()).toBe('test.example.com');
      expect(foundTenant?.type).toBe(TenantType.ENTERPRISE);
      expect(foundTenant?.status).toBe(TenantStatus.ACTIVE);
    });

    it('should update tenant', async () => {
      // 创建租户
      const tenantAggregate = TenantAggregate.createEnterprise(
        'tenant-123',
        '测试租户',
        'TEST',
        'test.example.com',
      );
      await repository.save(tenantAggregate);

      // 更新租户配置
      tenantAggregate.updateConfig({ theme: 'dark', language: 'zh-CN' });
      await repository.save(tenantAggregate);

      // 验证更新
      const updatedTenant = await repository.findById(
        new TenantId('tenant-123'),
      );
      expect(updatedTenant?.config).toEqual({
        theme: 'dark',
        language: 'zh-CN',
      });
    });

    it('should delete tenant', async () => {
      // 创建租户
      const tenantAggregate = TenantAggregate.createEnterprise(
        'tenant-123',
        '测试租户',
        'TEST',
        'test.example.com',
      );
      await repository.save(tenantAggregate);

      // 删除租户
      await repository.delete(new TenantId('tenant-123'));

      // 验证删除
      const deletedTenant = await repository.findById(
        new TenantId('tenant-123'),
      );
      expect(deletedTenant).toBeNull();
    });
  });

  describe('Query operations', () => {
    beforeEach(async () => {
      // 创建测试数据
      const tenants = [
        TenantAggregate.createEnterprise(
          'tenant-1',
          '企业租户1',
          'ENT1',
          'ent1.com',
        ),
        TenantAggregate.createOrganization(
          'tenant-2',
          '组织租户1',
          'ORG1',
          'org1.com',
        ),
        TenantAggregate.createPartnership(
          'tenant-3',
          '合伙租户1',
          'PART1',
          'part1.com',
        ),
        TenantAggregate.createPersonal(
          'tenant-4',
          '个人租户1',
          'PERS1',
          'pers1.com',
        ),
      ];

      for (const tenant of tenants) {
        await repository.save(tenant);
      }
    });

    it('should find tenants by criteria', async () => {
      const criteria = {
        status: TenantStatus.ACTIVE,
        type: TenantType.ENTERPRISE,
        limit: 10,
        offset: 0,
      };

      const results = await repository.findByCriteria(criteria);

      expect(results).toHaveLength(1);
      expect(results[0].type).toBe(TenantType.ENTERPRISE);
    });

    it('should find tenants by type', async () => {
      const criteria = {
        type: TenantType.ORGANIZATION,
        limit: 10,
        offset: 0,
      };

      const results = await repository.findByCriteria(criteria);

      expect(results).toHaveLength(1);
      expect(results[0].type).toBe(TenantType.ORGANIZATION);
    });

    it('should support pagination', async () => {
      const criteria = {
        status: TenantStatus.ACTIVE,
        limit: 2,
        offset: 0,
      };

      const firstPage = await repository.findByCriteria(criteria);
      expect(firstPage).toHaveLength(2);

      const secondPageCriteria = { ...criteria, offset: 2 };
      const secondPage = await repository.findByCriteria(secondPageCriteria);
      expect(secondPage).toHaveLength(2);

      // 确保没有重复
      const firstPageIds = firstPage.map(t => t.id.toString());
      const secondPageIds = secondPage.map(t => t.id.toString());
      const intersection = firstPageIds.filter(id =>
        secondPageIds.includes(id),
      );
      expect(intersection).toHaveLength(0);
    });
  });

  describe('Existence checks', () => {
    beforeEach(async () => {
      const tenantAggregate = TenantAggregate.createEnterprise(
        'tenant-123',
        '测试租户',
        'TEST',
        'test.example.com',
      );
      await repository.save(tenantAggregate);
    });

    it('should check tenant existence by ID', async () => {
      const exists = await repository.exists(new TenantId('tenant-123'));
      expect(exists).toBe(true);

      const notExists = await repository.exists(new TenantId('non-existent'));
      expect(notExists).toBe(false);
    });

    it('should check tenant existence by code', async () => {
      const exists = await repository.existsByCode(new TenantCode('TEST'));
      expect(exists).toBe(true);

      const notExists = await repository.existsByCode(
        new TenantCode('NONEXISTENT'),
      );
      expect(notExists).toBe(false);
    });

    it('should check tenant existence by domain', async () => {
      const exists = await repository.existsByDomain(
        new TenantDomain('test.example.com'),
      );
      expect(exists).toBe(true);

      const notExists = await repository.existsByDomain(
        new TenantDomain('nonexistent.com'),
      );
      expect(notExists).toBe(false);
    });
  });

  describe('Count operations', () => {
    beforeEach(async () => {
      // 创建多个租户
      const tenants = [
        TenantAggregate.createEnterprise(
          'tenant-1',
          '企业1',
          'ENT1',
          'ent1.com',
        ),
        TenantAggregate.createEnterprise(
          'tenant-2',
          '企业2',
          'ENT2',
          'ent2.com',
        ),
        TenantAggregate.createOrganization(
          'tenant-3',
          '组织1',
          'ORG1',
          'org1.com',
        ),
      ];

      for (const tenant of tenants) {
        await repository.save(tenant);
      }
    });

    it('should count tenants by tenant ID', async () => {
      const count = await repository.countByTenantId(new TenantId('tenant-1'));
      expect(count).toBe(1);
    });

    it('should count all tenants', async () => {
      const count = await repository.count();
      expect(count).toBe(3);
    });
  });

  describe('Business logic integration', () => {
    it('should handle tenant status transitions', async () => {
      const tenantAggregate = TenantAggregate.createEnterprise(
        'tenant-123',
        '测试租户',
        'TEST',
        'test.example.com',
      );

      // 初始状态：ACTIVE
      await repository.save(tenantAggregate);
      let foundTenant = await repository.findById(new TenantId('tenant-123'));
      expect(foundTenant?.status).toBe(TenantStatus.ACTIVE);

      // 暂停租户
      tenantAggregate.suspend();
      await repository.save(tenantAggregate);
      foundTenant = await repository.findById(new TenantId('tenant-123'));
      expect(foundTenant?.status).toBe(TenantStatus.SUSPENDED);

      // 恢复租户
      tenantAggregate.resume();
      await repository.save(tenantAggregate);
      foundTenant = await repository.findById(new TenantId('tenant-123'));
      expect(foundTenant?.status).toBe(TenantStatus.ACTIVE);

      // 删除租户
      tenantAggregate.delete();
      await repository.save(tenantAggregate);
      foundTenant = await repository.findById(new TenantId('tenant-123'));
      expect(foundTenant?.status).toBe(TenantStatus.DELETED);
    });

    it('should handle tenant configuration updates', async () => {
      const tenantAggregate = TenantAggregate.createEnterprise(
        'tenant-123',
        '测试租户',
        'TEST',
        'test.example.com',
      );

      await repository.save(tenantAggregate);

      // 更新配置
      const config = {
        theme: 'dark',
        language: 'zh-CN',
        timezone: 'Asia/Shanghai',
        features: {
          advancedAnalytics: true,
          customBranding: false,
        },
        limits: {
          maxUsers: 1000,
          maxStorage: 100,
        },
      };

      tenantAggregate.updateConfig(config);
      await repository.save(tenantAggregate);

      const foundTenant = await repository.findById(new TenantId('tenant-123'));
      expect(foundTenant?.config).toEqual(config);
    });

    it('should handle different tenant types with correct limits', async () => {
      const enterpriseTenant = TenantAggregate.createEnterprise(
        'enterprise-1',
        '企业租户',
        'ENT',
        'enterprise.com',
      );
      const organizationTenant = TenantAggregate.createOrganization(
        'org-1',
        '组织租户',
        'ORG',
        'organization.com',
      );
      const personalTenant = TenantAggregate.createPersonal(
        'personal-1',
        '个人租户',
        'PERS',
        'personal.com',
      );

      await repository.save(enterpriseTenant);
      await repository.save(organizationTenant);
      await repository.save(personalTenant);

      const enterprise = await repository.findById(
        new TenantId('enterprise-1'),
      );
      const organization = await repository.findById(new TenantId('org-1'));
      const personal = await repository.findById(new TenantId('personal-1'));

      expect(enterprise?.maxUsers).toBe(10000);
      expect(enterprise?.maxOrganizations).toBe(100);
      expect(enterprise?.advancedFeaturesEnabled).toBe(true);

      expect(organization?.maxUsers).toBe(1000);
      expect(organization?.maxOrganizations).toBe(10);
      expect(organization?.advancedFeaturesEnabled).toBe(false);

      expect(personal?.maxUsers).toBe(5);
      expect(personal?.maxOrganizations).toBe(1);
      expect(personal?.advancedFeaturesEnabled).toBe(false);
    });
  });

  describe('Error handling', () => {
    it('should handle database connection errors gracefully', async () => {
      // 模拟数据库连接错误
      const originalFindOne = entityManager.findOne;
      entityManager.findOne = jest
        .fn()
        .mockRejectedValue(new Error('Connection failed'));

      await expect(
        repository.findById(new TenantId('tenant-123')),
      ).rejects.toThrow('Failed to find tenant by ID: Connection failed');

      // 恢复原始方法
      entityManager.findOne = originalFindOne;
    });

    it('should handle constraint violations', async () => {
      const tenant1 = TenantAggregate.createEnterprise(
        'tenant-1',
        '租户1',
        'DUPLICATE',
        'tenant1.com',
      );
      const tenant2 = TenantAggregate.createEnterprise(
        'tenant-2',
        '租户2',
        'DUPLICATE', // 重复的代码
        'tenant2.com',
      );

      await repository.save(tenant1);

      // 尝试保存重复代码的租户
      await expect(repository.save(tenant2)).rejects.toThrow();
    });
  });
});
