/**
 * @file tenant-management.controller.integration.spec.ts
 * @description 租户管理控制器集成测试
 * @since 1.0.0
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import * as request from 'supertest';
import { TenantManagementController } from './tenant-management.controller';
import { ITenantManagementService } from '../../application/interfaces/tenant-management.interface';
import { TenantType, TenantStatus } from '../../domain/enums';
import { PinoLoggerService } from '@aiofix/logging';

describe('TenantManagementController (Integration)', () => {
  let app: INestApplication;
  let mockTenantManagementService: jest.Mocked<ITenantManagementService>;
  let mockEventBus: jest.Mocked<EventBus>;
  let mockLogger: jest.Mocked<PinoLoggerService>;

  beforeEach(async () => {
    const mockService = {
      createTenant: jest.fn(),
      updateTenant: jest.fn(),
      getTenant: jest.fn(),
      deleteTenant: jest.fn(),
      queryTenants: jest.fn(),
      activateTenant: jest.fn(),
      suspendTenant: jest.fn(),
      resumeTenant: jest.fn(),
      updateTenantConfig: jest.fn(),
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
      controllers: [TenantManagementController],
      providers: [
        {
          provide: 'ITenantManagementService',
          useValue: mockService,
        },
        {
          provide: EventBus,
          useValue: mockEventBusInstance,
        },
        {
          provide: PinoLoggerService,
          useValue: mockLoggerInstance,
        },
      ],
    }).compile();

    app = module.createNestApplication();
    mockTenantManagementService = module.get('ITenantManagementService');
    mockEventBus = module.get(EventBus);
    mockLogger = module.get(PinoLoggerService);

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /api/tenants', () => {
    const createTenantDto = {
      id: 'tenant-123',
      name: '测试租户',
      code: 'TEST',
      domain: 'test.example.com',
      type: TenantType.ENTERPRISE,
      createdBy: 'admin-456',
    };

    it('should create tenant successfully', async () => {
      const expectedResponse = {
        success: true,
        tenantId: 'tenant-123',
        message: '租户创建成功',
      };

      mockTenantManagementService.createTenant.mockResolvedValue(
        expectedResponse,
      );

      const response = await request(app.getHttpServer())
        .post('/api/tenants')
        .send(createTenantDto)
        .expect(201);

      expect(response.body).toEqual(expectedResponse);
      expect(mockTenantManagementService.createTenant).toHaveBeenCalledWith({
        ...createTenantDto,
        currentUserId: undefined, // 从req.user中提取
      });
    });

    it('should return 400 for invalid data', async () => {
      const invalidDto = {
        id: '',
        name: '',
        code: '',
        domain: '',
        type: TenantType.ENTERPRISE,
        createdBy: '',
      };

      const errorResponse = {
        success: false,
        error: '租户ID不能为空',
        message: '租户创建失败',
      };

      mockTenantManagementService.createTenant.mockResolvedValue(errorResponse);

      const response = await request(app.getHttpServer())
        .post('/api/tenants')
        .send(invalidDto)
        .expect(400);

      expect(response.body).toEqual(errorResponse);
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Service error');
      mockTenantManagementService.createTenant.mockRejectedValue(serviceError);

      await request(app.getHttpServer())
        .post('/api/tenants')
        .send(createTenantDto)
        .expect(500);
    });
  });

  describe('GET /api/tenants', () => {
    it('should return tenant list', async () => {
      const expectedResponse = {
        success: true,
        tenants: [
          {
            id: 'tenant-1',
            name: '租户1',
            code: 'T1',
            domain: 't1.example.com',
            type: TenantType.ENTERPRISE,
            status: TenantStatus.ACTIVE,
            config: {},
            maxUsers: 100,
            maxOrganizations: 10,
            maxStorageGB: 1000,
            subscriptionPlan: 'BASIC',
            features: [],
            settings: {},
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: 'admin',
            description: 'Test tenant 1',
          },
          {
            id: 'tenant-2',
            name: '租户2',
            code: 'T2',
            domain: 't2.example.com',
            type: TenantType.ORGANIZATION,
            status: TenantStatus.ACTIVE,
            config: {},
            maxUsers: 50,
            maxOrganizations: 5,
            maxStorageGB: 500,
            subscriptionPlan: 'BASIC',
            features: [],
            settings: {},
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: 'admin',
            description: 'Test tenant 2',
          },
        ],
        total: 2,
        page: 1,
        size: 20,
        message: '查询成功',
      };

      mockTenantManagementService.queryTenants.mockResolvedValue(
        expectedResponse,
      );

      const response = await request(app.getHttpServer())
        .get('/api/tenants')
        .query({ page: 1, size: 20 })
        .expect(200);

      expect(response.body).toEqual(expectedResponse);
      expect(mockTenantManagementService.queryTenants).toHaveBeenCalledWith({
        page: 1,
        size: 20,
        currentUserId: undefined,
      });
    });

    it('should handle query parameters', async () => {
      const queryParams = {
        page: 2,
        size: 10,
        status: TenantStatus.ACTIVE,
        type: TenantType.ENTERPRISE,
        search: 'test',
      };

      mockTenantManagementService.queryTenants.mockResolvedValue({
        success: true,
        tenants: [],
        total: 0,
        page: 2,
        size: 10,
        message: '查询成功',
      });

      await request(app.getHttpServer())
        .get('/api/tenants')
        .query(queryParams)
        .expect(200);

      expect(mockTenantManagementService.queryTenants).toHaveBeenCalledWith({
        ...queryParams,
        currentUserId: undefined,
      });
    });
  });

  describe('GET /api/tenants/:id', () => {
    it('should return tenant by ID', async () => {
      const tenantId = 'tenant-123';
      const expectedResponse = {
        success: true,
        tenant: {
          id: tenantId,
          name: '测试租户',
          code: 'TEST',
          domain: 'test.example.com',
          type: TenantType.ENTERPRISE,
          status: TenantStatus.ACTIVE,
          config: {},
          maxUsers: 100,
          maxOrganizations: 10,
          maxStorageGB: 1000,
          subscriptionPlan: 'BASIC',
          features: [],
          settings: {},
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'admin',
          description: 'Test tenant',
        },
        message: '查询成功',
      };

      mockTenantManagementService.getTenant.mockResolvedValue(expectedResponse);

      const response = await request(app.getHttpServer())
        .get(`/api/tenants/${tenantId}`)
        .expect(200);

      expect(response.body).toEqual(expectedResponse);
      expect(mockTenantManagementService.getTenant).toHaveBeenCalledWith({
        tenantId,
        currentUserId: undefined,
      });
    });

    it('should return 404 for non-existent tenant', async () => {
      const tenantId = 'non-existent';
      const errorResponse = {
        success: false,
        error: '租户不存在',
        message: '查询失败',
      };

      mockTenantManagementService.getTenant.mockResolvedValue(errorResponse);

      const response = await request(app.getHttpServer())
        .get(`/api/tenants/${tenantId}`)
        .expect(404);

      expect(response.body).toEqual(errorResponse);
    });
  });

  describe('PUT /api/tenants/:id', () => {
    it('should update tenant successfully', async () => {
      const tenantId = 'tenant-123';
      const updateDto = {
        name: '更新后的租户名称',
        description: '更新后的描述',
      };

      const expectedResponse = {
        success: true,
        message: '租户更新成功',
      };

      mockTenantManagementService.updateTenant.mockResolvedValue(
        expectedResponse,
      );

      const response = await request(app.getHttpServer())
        .put(`/api/tenants/${tenantId}`)
        .send(updateDto)
        .expect(200);

      expect(response.body).toEqual(expectedResponse);
      expect(mockTenantManagementService.updateTenant).toHaveBeenCalledWith(
        tenantId,
        {
          ...updateDto,
          currentUserId: undefined,
        },
      );
    });

    it('should return 400 for invalid update data', async () => {
      const tenantId = 'tenant-123';
      const invalidDto = {
        name: '', // 空名称
      };

      const errorResponse = {
        success: false,
        error: '租户名称不能为空',
        message: '租户更新失败',
      };

      mockTenantManagementService.updateTenant.mockResolvedValue(errorResponse);

      const response = await request(app.getHttpServer())
        .put(`/api/tenants/${tenantId}`)
        .send(invalidDto)
        .expect(400);

      expect(response.body).toEqual(errorResponse);
    });
  });

  describe('DELETE /api/tenants/:id', () => {
    it('should delete tenant successfully', async () => {
      const tenantId = 'tenant-123';
      const expectedResponse = {
        success: true,
        message: '租户删除成功',
      };

      mockTenantManagementService.deleteTenant.mockResolvedValue(
        expectedResponse,
      );

      const response = await request(app.getHttpServer())
        .delete(`/api/tenants/${tenantId}`)
        .expect(200);

      expect(response.body).toEqual(expectedResponse);
      expect(mockTenantManagementService.deleteTenant).toHaveBeenCalledWith({
        tenantId,
        currentUserId: undefined,
      });
    });

    it('should return 404 for non-existent tenant', async () => {
      const tenantId = 'non-existent';
      const errorResponse = {
        success: false,
        error: '租户不存在',
        message: '租户删除失败',
      };

      mockTenantManagementService.deleteTenant.mockResolvedValue(errorResponse);

      const response = await request(app.getHttpServer())
        .delete(`/api/tenants/${tenantId}`)
        .expect(404);

      expect(response.body).toEqual(errorResponse);
    });
  });

  describe('POST /api/tenants/:id/activate', () => {
    it('should activate tenant successfully', async () => {
      const tenantId = 'tenant-123';
      const expectedResponse = {
        success: true,
        message: '租户激活成功',
      };

      mockTenantManagementService.activateTenant.mockResolvedValue(
        expectedResponse,
      );

      const response = await request(app.getHttpServer())
        .post(`/api/tenants/${tenantId}/activate`)
        .expect(200);

      expect(response.body).toEqual(expectedResponse);
      expect(mockTenantManagementService.activateTenant).toHaveBeenCalledWith({
        tenantId,
        currentUserId: undefined,
      });
    });
  });

  describe('POST /api/tenants/:id/suspend', () => {
    it('should suspend tenant successfully', async () => {
      const tenantId = 'tenant-123';
      const expectedResponse = {
        success: true,
        message: '租户暂停成功',
      };

      mockTenantManagementService.suspendTenant.mockResolvedValue(
        expectedResponse,
      );

      const response = await request(app.getHttpServer())
        .post(`/api/tenants/${tenantId}/suspend`)
        .expect(200);

      expect(response.body).toEqual(expectedResponse);
      expect(mockTenantManagementService.suspendTenant).toHaveBeenCalledWith({
        tenantId,
        currentUserId: undefined,
      });
    });
  });

  describe('POST /api/tenants/:id/resume', () => {
    it('should resume tenant successfully', async () => {
      const tenantId = 'tenant-123';
      const expectedResponse = {
        success: true,
        message: '租户恢复成功',
      };

      mockTenantManagementService.resumeTenant.mockResolvedValue(
        expectedResponse,
      );

      const response = await request(app.getHttpServer())
        .post(`/api/tenants/${tenantId}/resume`)
        .expect(200);

      expect(response.body).toEqual(expectedResponse);
      expect(mockTenantManagementService.resumeTenant).toHaveBeenCalledWith({
        tenantId,
        currentUserId: undefined,
      });
    });
  });

  describe('PUT /api/tenants/:id/config', () => {
    it('should update tenant config successfully', async () => {
      const tenantId = 'tenant-123';
      const configDto = {
        theme: 'dark',
        language: 'zh-CN',
        timezone: 'Asia/Shanghai',
      };

      const expectedResponse = {
        success: true,
        message: '租户配置更新成功',
      };

      mockTenantManagementService.updateTenantConfig.mockResolvedValue(
        expectedResponse,
      );

      const response = await request(app.getHttpServer())
        .put(`/api/tenants/${tenantId}/config`)
        .send(configDto)
        .expect(200);

      expect(response.body).toEqual(expectedResponse);
      expect(
        mockTenantManagementService.updateTenantConfig,
      ).toHaveBeenCalledWith({
        tenantId,
        config: configDto,
        currentUserId: undefined,
      });
    });

    it('should return 400 for invalid config data', async () => {
      const tenantId = 'tenant-123';
      const invalidConfigDto = {
        theme: 'invalid-theme', // 无效主题
        language: 'invalid-lang', // 无效语言
      };

      const errorResponse = {
        success: false,
        error: '无效的主题设置',
        message: '租户配置更新失败',
      };

      mockTenantManagementService.updateTenantConfig.mockResolvedValue(
        errorResponse,
      );

      const response = await request(app.getHttpServer())
        .put(`/api/tenants/${tenantId}/config`)
        .send(invalidConfigDto)
        .expect(400);

      expect(response.body).toEqual(errorResponse);
    });
  });

  describe('Error handling', () => {
    it('should handle internal server errors', async () => {
      const createTenantDto = {
        id: 'tenant-123',
        name: '测试租户',
        code: 'TEST',
        domain: 'test.example.com',
        type: TenantType.ENTERPRISE,
        createdBy: 'admin-456',
      };

      mockTenantManagementService.createTenant.mockRejectedValue(
        new Error('Internal server error'),
      );

      await request(app.getHttpServer())
        .post('/api/tenants')
        .send(createTenantDto)
        .expect(500);
    });

    it('should handle service timeout', async () => {
      const tenantId = 'tenant-123';
      mockTenantManagementService.getTenant.mockRejectedValue(
        new Error('Service timeout'),
      );

      await request(app.getHttpServer())
        .get(`/api/tenants/${tenantId}`)
        .expect(500);
    });
  });
});
