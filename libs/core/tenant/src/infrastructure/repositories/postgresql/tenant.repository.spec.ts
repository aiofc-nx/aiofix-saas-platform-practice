/**
 * @file tenant.repository.spec.ts
 * @description PostgreSQL租户仓储单元测试
 * @since 1.0.0
 */

import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager } from '@mikro-orm/core';
import { TenantPostgresRepository } from './tenant.repository';
import { TenantPostgresMapper } from '../../mappers/postgresql/tenant.mapper';
import { TenantAggregate } from '../../../domain/aggregates/tenant.aggregate';
import { TenantOrmEntity } from '../../entities/postgresql/tenant.orm-entity';
import { TenantType, TenantStatus } from '../../../domain/enums';
import { TenantId, TenantCode, TenantDomain, TenantName } from '@aiofix/shared';

describe('TenantPostgresRepository', () => {
  let repository: TenantPostgresRepository;
  let mockEntityManager: jest.Mocked<EntityManager>;
  let mockMapper: jest.Mocked<TenantPostgresMapper>;

  beforeEach(async () => {
    const mockEntityManagerInstance = {
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      persistAndFlush: jest.fn(),
      nativeUpdate: jest.fn(),
      nativeDelete: jest.fn(),
      count: jest.fn(),
    };

    const mockMapperInstance = {
      toDomain: jest.fn(),
      toPersistence: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantPostgresRepository,
        {
          provide: EntityManager,
          useValue: mockEntityManagerInstance,
        },
        {
          provide: TenantPostgresMapper,
          useValue: mockMapperInstance,
        },
      ],
    }).compile();

    repository = module.get<TenantPostgresRepository>(TenantPostgresRepository);
    mockEntityManager = module.get(EntityManager);
    mockMapper = module.get(TenantPostgresMapper);
  });

  describe('findById', () => {
    it('should find tenant by ID', async () => {
      const tenantId = new TenantId('550e8400-e29b-41d4-a716-446655440000');
      const mockOrmEntity = new TenantOrmEntity();
      const mockAggregate = TenantAggregate.createEnterprise(
        new TenantId('550e8400-e29b-41d4-a716-446655440000'),
        new TenantName('Test Tenant'),
        new TenantCode('TEST'),
        new TenantDomain('test.example.com'),
      );

      mockEntityManager.findOne.mockResolvedValue(mockOrmEntity);
      mockMapper.toDomain.mockReturnValue(mockAggregate.getTenant());

      const result = await repository.findById(tenantId);

      expect(mockEntityManager.findOne).toHaveBeenCalledWith(TenantOrmEntity, {
        id: '550e8400-e29b-41d4-a716-446655440000',
      });
      expect(mockMapper.toDomain).toHaveBeenCalledWith(mockOrmEntity);
      expect(result).toBeInstanceOf(TenantAggregate);
      expect(result!.getTenantId().toString()).toBe(
        mockAggregate.getTenantId().toString(),
      );
    });

    it('should return null if tenant not found', async () => {
      const tenantId = new TenantId('550e8400-e29b-41d4-a716-446655440999');
      mockEntityManager.findOne.mockResolvedValue(null);

      const result = await repository.findById(tenantId);

      expect(result).toBeNull();
      expect(mockMapper.toDomain).not.toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      const tenantId = new TenantId('550e8400-e29b-41d4-a716-446655440000');
      const dbError = new Error('Database connection failed');
      mockEntityManager.findOne.mockRejectedValue(dbError);

      await expect(repository.findById(tenantId)).rejects.toThrow(
        'Failed to find tenant by ID: Database connection failed',
      );
    });
  });

  describe('save', () => {
    it('should save new tenant', async () => {
      const mockAggregate = TenantAggregate.createEnterprise(
        new TenantId('550e8400-e29b-41d4-a716-446655440000'),
        new TenantName('Test Tenant'),
        new TenantCode('TEST'),
        new TenantDomain('test.example.com'),
      );
      const mockOrmEntity = new TenantOrmEntity();

      mockMapper.toPersistence.mockReturnValue(mockOrmEntity);
      mockEntityManager.persistAndFlush.mockResolvedValue();

      await repository.save(mockAggregate);

      expect(mockMapper.toPersistence).toHaveBeenCalledWith(
        mockAggregate.getTenant(),
      );
      expect(mockEntityManager.persistAndFlush).toHaveBeenCalledWith(
        mockOrmEntity,
      );
    });

    it('should update existing tenant', async () => {
      const mockAggregate = TenantAggregate.createEnterprise(
        new TenantId('550e8400-e29b-41d4-a716-446655440000'),
        new TenantName('Test Tenant'),
        new TenantCode('TEST'),
        new TenantDomain('test.example.com'),
      );
      const mockOrmEntity = new TenantOrmEntity();
      mockOrmEntity.id = '550e8400-e29b-41d4-a716-446655440000';

      mockMapper.toPersistence.mockReturnValue(mockOrmEntity);
      mockEntityManager.nativeUpdate.mockResolvedValue(1);

      await repository.save(mockAggregate);

      expect(mockMapper.toPersistence).toHaveBeenCalledWith(
        mockAggregate.getTenant(),
      );
      expect(mockEntityManager.nativeUpdate).toHaveBeenCalledWith(
        TenantOrmEntity,
        { id: '550e8400-e29b-41d4-a716-446655440000' },
        mockOrmEntity,
      );
    });

    it('should handle save errors', async () => {
      const mockAggregate = TenantAggregate.createEnterprise(
        new TenantId('550e8400-e29b-41d4-a716-446655440000'),
        new TenantName('Test Tenant'),
        new TenantCode('TEST'),
        new TenantDomain('test.example.com'),
      );
      const mockTenantEntity = mockAggregate.getTenant();
      const mockPersistenceEntity = new TenantOrmEntity();
      mockPersistenceEntity.id = '';
      mockPersistenceEntity.name = 'Test Tenant';

      mockMapper.toPersistence.mockReturnValue(mockPersistenceEntity);
      const saveError = new Error('Save operation failed');
      mockEntityManager.persistAndFlush.mockRejectedValue(saveError);

      await expect(repository.save(mockAggregate)).rejects.toThrow(
        'Failed to save tenant: Save operation failed',
      );
    });
  });

  describe('findByCriteria', () => {
    it('should find tenants by criteria', async () => {
      const criteria = {
        tenantId: new TenantId('550e8400-e29b-41d4-a716-446655440000'),
        status: TenantStatus.ACTIVE,
        type: TenantType.ENTERPRISE,
        limit: 10,
        offset: 0,
      };

      const mockOrmEntities = [new TenantOrmEntity(), new TenantOrmEntity()];
      const mockAggregates = [
        TenantAggregate.createEnterprise(
          new TenantId('550e8400-e29b-41d4-a716-446655440001'),
          new TenantName('Tenant 1'),
          new TenantCode('TENANT1'),
          new TenantDomain('t1.com'),
        ),
        TenantAggregate.createEnterprise(
          new TenantId('550e8400-e29b-41d4-a716-446655440002'),
          new TenantName('Tenant 2'),
          new TenantCode('TENANT2'),
          new TenantDomain('t2.com'),
        ),
      ];

      mockEntityManager.findAndCount.mockResolvedValue([mockOrmEntities, 2]);
      mockMapper.toDomain
        .mockReturnValueOnce(mockAggregates[0].getTenant())
        .mockReturnValueOnce(mockAggregates[1].getTenant());

      const result = await repository.findByCriteria(criteria);

      expect(mockEntityManager.findAndCount).toHaveBeenCalledWith(
        TenantOrmEntity,
        {
          status: TenantStatus.ACTIVE,
          type: TenantType.ENTERPRISE,
        },
        {
          orderBy: { createdAt: 'DESC' },
        },
      );
      expect(result.tenants).toHaveLength(2);
    });

    it('should handle empty results', async () => {
      const criteria = { status: TenantStatus.ACTIVE };
      mockEntityManager.findAndCount.mockResolvedValue([[], 0]);

      const result = await repository.findByCriteria(criteria);

      expect(result.tenants).toHaveLength(0);
      expect(mockMapper.toDomain).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete tenant by ID', async () => {
      const tenantId = new TenantId('550e8400-e29b-41d4-a716-446655440000');
      mockEntityManager.nativeDelete.mockResolvedValue(1);

      await repository.delete(tenantId);

      expect(mockEntityManager.nativeDelete).toHaveBeenCalledWith(
        TenantOrmEntity,
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
        },
      );
    });

    it('should handle delete errors', async () => {
      const tenantId = new TenantId('550e8400-e29b-41d4-a716-446655440000');
      const deleteError = new Error('Delete operation failed');
      mockEntityManager.nativeDelete.mockRejectedValue(deleteError);

      await expect(repository.delete(tenantId)).rejects.toThrow(
        'Failed to delete tenant: Delete operation failed',
      );
    });
  });

  describe('existsByCode', () => {
    it('should return true if tenant code exists', async () => {
      const tenantCode = new TenantCode('TEST');
      mockEntityManager.count.mockResolvedValue(1);

      const result = await repository.existsByCode(tenantCode);

      expect(mockEntityManager.count).toHaveBeenCalledWith(TenantOrmEntity, {
        code: 'TEST',
      });
      expect(result).toBe(true);
    });

    it('should return false if tenant code does not exist', async () => {
      const tenantCode = new TenantCode('NONEXISTENT');
      mockEntityManager.count.mockResolvedValue(0);

      const result = await repository.existsByCode(tenantCode);

      expect(result).toBe(false);
    });
  });

  describe('existsByDomain', () => {
    it('should return true if tenant domain exists', async () => {
      const tenantDomain = new TenantDomain('test.example.com');
      mockEntityManager.count.mockResolvedValue(1);

      const result = await repository.existsByDomain(tenantDomain);

      expect(mockEntityManager.count).toHaveBeenCalledWith(TenantOrmEntity, {
        domain: 'test.example.com',
      });
      expect(result).toBe(true);
    });

    it('should return false if tenant domain does not exist', async () => {
      const tenantDomain = new TenantDomain('nonexistent.com');
      mockEntityManager.count.mockResolvedValue(0);

      const result = await repository.existsByDomain(tenantDomain);

      expect(result).toBe(false);
    });
  });
});
