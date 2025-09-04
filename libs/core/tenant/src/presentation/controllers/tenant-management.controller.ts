/**
 * @class TenantManagementController
 * @description 租户管理控制器
 *
 * 功能与职责：
 * 1. 处理HTTP请求
 * 2. 参数验证和转换
 * 3. 调用应用服务
 * 4. 返回HTTP响应
 * 5. 处理认证和授权
 *
 * @example
 * ```typescript
 * const controller = new TenantManagementController(
 *   tenantManagementService
 * );
 *
 * // 通过HTTP请求调用
 * POST /api/tenants
 * GET /api/tenants/:id
 * ```
 * @since 1.0.0
 */

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Request,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ITenantManagementService } from '../../application/interfaces/tenant-management.interface';
import {
  CreateTenantRequest,
  CreateTenantResponse,
} from '../../application/dtos/create-tenant.dto';
import {
  UpdateTenantRequest,
  UpdateTenantResponse,
} from '../../application/dtos/update-tenant.dto';
import {
  GetTenantRequest,
  GetTenantResponse,
} from '../../application/dtos/get-tenant.dto';
import {
  DeleteTenantRequest,
  DeleteTenantResponse,
} from '../../application/dtos/delete-tenant.dto';
import {
  TenantQueryRequest,
  TenantQueryResponse,
} from '../../application/dtos/tenant-query.dto';

/**
 * 租户管理控制器类
 * @description 处理租户管理的HTTP请求
 */
@Controller('api/tenants')
export class TenantManagementController {
  constructor(
    private readonly tenantManagementService: ITenantManagementService,
  ) {}

  /**
   * 创建租户
   * @description 处理租户创建请求
   * @param req HTTP请求对象
   * @returns 创建结果
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createTenant(@Request() req: any): Promise<CreateTenantResponse> {
    const request: CreateTenantRequest = {
      ...req.body,
      currentUserId: req.user?.id,
    };

    return this.tenantManagementService.createTenant(request);
  }

  /**
   * 获取租户列表
   * @description 处理租户列表查询请求
   * @param req HTTP请求对象
   * @returns 租户列表
   */
  @Get()
  async getTenants(@Request() req: any): Promise<TenantQueryResponse> {
    const request: TenantQueryRequest = {
      currentUserId: req.user?.id,
      page: parseInt(req.query.page) || 1,
      size: parseInt(req.query.size) || 20,
      ...req.query,
    };

    return this.tenantManagementService.queryTenants(request);
  }

  /**
   * 获取租户详情
   * @description 处理租户详情查询请求
   * @param id 租户ID
   * @param req HTTP请求对象
   * @returns 租户详情
   */
  @Get(':id')
  async getTenant(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<GetTenantResponse> {
    const request: GetTenantRequest = {
      tenantId: id,
      currentUserId: req.user?.id,
    };

    return this.tenantManagementService.getTenant(request);
  }

  /**
   * 更新租户
   * @description 处理租户更新请求
   * @param id 租户ID
   * @param req HTTP请求对象
   * @returns 更新结果
   */
  @Put(':id')
  async updateTenant(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<UpdateTenantResponse> {
    const request: UpdateTenantRequest = {
      ...req.body,
      currentUserId: req.user?.id,
    };

    return this.tenantManagementService.updateTenant(id, request);
  }

  /**
   * 删除租户
   * @description 处理租户删除请求
   * @param id 租户ID
   * @param req HTTP请求对象
   * @returns 删除结果
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTenant(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<DeleteTenantResponse> {
    const request: DeleteTenantRequest = {
      tenantId: id,
      currentUserId: req.user?.id,
    };

    return this.tenantManagementService.deleteTenant(request);
  }

  /**
   * 激活租户
   * @description 处理租户激活请求
   * @param id 租户ID
   * @returns 激活结果
   */
  @Post(':id/activate')
  async activateTenant(
    @Param('id') id: string,
  ): Promise<{ success: boolean; message: string }> {
    return this.tenantManagementService.activateTenant(id);
  }

  /**
   * 暂停租户
   * @description 处理租户暂停请求
   * @param id 租户ID
   * @returns 暂停结果
   */
  @Post(':id/suspend')
  async suspendTenant(
    @Param('id') id: string,
  ): Promise<{ success: boolean; message: string }> {
    return this.tenantManagementService.suspendTenant(id);
  }

  /**
   * 恢复租户
   * @description 处理租户恢复请求
   * @param id 租户ID
   * @returns 恢复结果
   */
  @Post(':id/resume')
  async resumeTenant(
    @Param('id') id: string,
  ): Promise<{ success: boolean; message: string }> {
    return this.tenantManagementService.resumeTenant(id);
  }

  /**
   * 更新租户配置
   * @description 处理租户配置更新请求
   * @param id 租户ID
   * @param config 配置信息
   * @returns 更新结果
   */
  @Put(':id/config')
  async updateTenantConfig(
    @Param('id') id: string,
    @Body() config: Record<string, unknown>,
  ): Promise<{ success: boolean; message: string }> {
    return this.tenantManagementService.updateTenantConfig(id, config);
  }
}
