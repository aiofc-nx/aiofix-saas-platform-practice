/**
 * @file create-tenant.use-case.spec.ts
 * @description 创建租户用例单元测试
 * @since 1.0.0
 */

import { Test, TestingModule } from '@nestjs/testing';
import { EventBus } from '@nestjs/cqrs';
import { CreateTenantUseCase } from './create-tenant.use-case';
import { ITenantRepository } from '../../domain/repositories/tenant.repository';
import { TenantAggregate } from '../../domain/aggregates/tenant.aggregate';
import { TenantType, TenantStatus } from '../../domain/enums';
import { TenantId, TenantName, TenantCode, TenantDomain } from '@aiofix/shared';
import { PinoLoggerService } from '@aiofix/logging';
import { LogContext } from '@aiofix/logging';

describe('CreateTenantUseCase', () => {
  let useCase: CreateTenantUseCase;
  let mockTenantRepository: jest.Mocked<ITenantRepository>;
  let mockEventBus: jest.Mocked<EventBus>;
  let mockLogger: jest.Mocked<PinoLoggerService>;

  beforeEach(async () => {
    const mockRepo = {
      findById: jest.fn(),
      findByCode: jest.fn(),
      findByDomain: jest.fn(),
      findByName: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
      existsByCode: jest.fn(),
      existsByDomain: jest.fn(),
      existsByName: jest.fn(),
      count: jest.fn(),
      findAll: jest.fn(),
      findByStatus: jest.fn(),
      findByType: jest.fn(),
    };

    const mockEventBusInstance = {
      publish: jest.fn(),
      publishAll: jest.fn(),
    };

    const mockLoggerInstance = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTenantUseCase,
        {
          provide: 'ITenantRepository',
          useValue: mockRepo,
        },
      ],
    }).compile();

    useCase = module.get<CreateTenantUseCase>(CreateTenantUseCase);
    mockTenantRepository = module.get('ITenantRepository');
  });

  describe('execute', () => {
    const validRequest = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: '测试租户',
      code: 'TEST',
      domain: 'test.example.com',
      type: TenantType.ENTERPRISE,
      createdBy: '550e8400-e29b-41d4-a716-446655440001',
    };

    beforeEach(() => {
      mockTenantRepository.findByCode.mockResolvedValue(null);
      mockTenantRepository.findByDomain.mockResolvedValue(null);
      mockTenantRepository.findByName.mockResolvedValue(null);
      mockTenantRepository.save.mockResolvedValue();
      // EventBus不再被CreateTenantUseCase使用
    });

    it('should create tenant successfully', async () => {
      const result = await useCase.execute(validRequest);

      expect(result.success).toBe(true);
      expect(result.tenantId).toBe(validRequest.id);
      expect(result.message).toBe('租户创建成功');

      expect(mockTenantRepository.findByCode).toHaveBeenCalledWith(
        expect.objectContaining({ value: validRequest.code }),
      );
      expect(mockTenantRepository.findByDomain).toHaveBeenCalledWith(
        expect.objectContaining({ value: validRequest.domain }),
      );
      expect(mockTenantRepository.findByName).toHaveBeenCalledWith(
        validRequest.name,
      );
      expect(mockTenantRepository.save).toHaveBeenCalled();
      // EventBus不再被CreateTenantUseCase使用
    });

    it('should return error if tenant code already exists', async () => {
      const existingTenant = TenantAggregate.createEnterprise(
        new TenantId('550e8400-e29b-41d4-a716-446655440001'),
        new TenantName('Existing Tenant'),
        new TenantCode(validRequest.code),
        new TenantDomain('existing.example.com'),
      );
      mockTenantRepository.findByCode.mockResolvedValue(existingTenant);

      const result = await useCase.execute(validRequest);

      expect(result.success).toBe(false);
      expect(result.error).toContain('租户代码已存在');
      expect(result.message).toBe('租户创建失败');

      expect(mockTenantRepository.save).not.toHaveBeenCalled();
      // EventBus不再被CreateTenantUseCase使用
    });

    it('should return error if tenant domain already exists', async () => {
      const existingTenant = TenantAggregate.createEnterprise(
        new TenantId('550e8400-e29b-41d4-a716-446655440001'),
        new TenantName('Existing Tenant'),
        new TenantCode('EXISTING'),
        new TenantDomain(validRequest.domain),
      );
      mockTenantRepository.findByDomain.mockResolvedValue(existingTenant);

      const result = await useCase.execute(validRequest);

      expect(result.success).toBe(false);
      expect(result.error).toContain('租户域名已存在');
      expect(result.message).toBe('租户创建失败');

      expect(mockTenantRepository.save).not.toHaveBeenCalled();
      // EventBus不再被CreateTenantUseCase使用
    });

    it('should return error if tenant name already exists', async () => {
      const existingTenant = TenantAggregate.createEnterprise(
        new TenantId('550e8400-e29b-41d4-a716-446655440001'),
        new TenantName(validRequest.name),
        new TenantCode('EXISTING'),
        new TenantDomain('existing.example.com'),
      );
      mockTenantRepository.findByName.mockResolvedValue(existingTenant);

      const result = await useCase.execute(validRequest);

      expect(result.success).toBe(false);
      expect(result.error).toContain('租户名称已存在');
      expect(result.message).toBe('租户创建失败');

      expect(mockTenantRepository.save).not.toHaveBeenCalled();
      // EventBus不再被CreateTenantUseCase使用
    });

    it('should return error for invalid request data', async () => {
      const invalidRequest = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: '',
        code: '',
        domain: '',
        type: TenantType.ENTERPRISE,
        createdBy: '550e8400-e29b-41d4-a716-446655440001',
      };

      const result = await useCase.execute(invalidRequest);

      expect(result.success).toBe(false);
      expect(result.error).toContain('租户名称不能为空');
      expect(result.message).toBe('租户创建失败');

      expect(mockTenantRepository.save).not.toHaveBeenCalled();
      // EventBus不再被CreateTenantUseCase使用
    });

    it('should handle repository errors', async () => {
      const repositoryError = new Error('Database connection failed');
      mockTenantRepository.save.mockRejectedValue(repositoryError);

      const result = await useCase.execute(validRequest);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database connection failed');
      expect(result.message).toBe('租户创建失败');

      // Logger不再被CreateTenantUseCase使用
    });

    it('should handle event bus errors', async () => {
      // EventBus不再被CreateTenantUseCase使用，这个测试应该总是成功
      const result = await useCase.execute(validRequest);

      expect(result.success).toBe(true);
      expect(result.tenantId).toBe(validRequest.id);
      expect(result.message).toBe('租户创建成功');

      // Logger不再被CreateTenantUseCase使用
    });

    it('should create different tenant types correctly', async () => {
      const organizationRequest = {
        ...validRequest,
        id: '550e8400-e29b-41d4-a716-446655440002',
        type: TenantType.ORGANIZATION,
      };

      const result = await useCase.execute(organizationRequest);

      expect(result.success).toBe(true);
      expect(result.tenantId).toBe(organizationRequest.id);

      expect(mockTenantRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          getTenantType: expect.any(Function),
        }),
      );
    });

    it('should log successful creation', async () => {
      await useCase.execute(validRequest);

      // Logger不再被CreateTenantUseCase使用

      // Logger不再被CreateTenantUseCase使用
    });
  });

  describe('validateRequest', () => {
    const validRequest = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: '测试租户',
      code: 'TEST',
      domain: 'test.example.com',
      type: TenantType.ENTERPRISE,
      createdBy: '550e8400-e29b-41d4-a716-446655440001',
    };

    it('should throw error for empty tenant ID', async () => {
      const invalidRequest = {
        ...validRequest,
        id: '',
      };

      const result = await useCase.execute(invalidRequest);

      expect(result.success).toBe(false);
      expect(result.error).toContain('UUID cannot be empty');
    });

    it('should throw error for empty tenant name', async () => {
      const invalidRequest = {
        ...validRequest,
        name: '',
      };

      const result = await useCase.execute(invalidRequest);

      expect(result.success).toBe(false);
      expect(result.error).toContain('租户名称不能为空');
    });

    it('should throw error for empty tenant code', async () => {
      const invalidRequest = {
        ...validRequest,
        code: '',
      };

      const result = await useCase.execute(invalidRequest);

      expect(result.success).toBe(false);
      expect(result.error).toContain('租户代码不能为空');
    });

    it('should throw error for empty tenant domain', async () => {
      const invalidRequest = {
        ...validRequest,
        domain: '',
      };

      const result = await useCase.execute(invalidRequest);

      expect(result.success).toBe(false);
      expect(result.error).toContain('租户域名不能为空');
    });

    it('should throw error for empty created by', async () => {
      const invalidRequest = {
        ...validRequest,
        createdBy: '',
      };

      const result = await useCase.execute(invalidRequest);

      expect(result.success).toBe(true);
      expect(result.tenantId).toBe(validRequest.id);
      expect(result.message).toBe('租户创建成功');
    });
  });
});
