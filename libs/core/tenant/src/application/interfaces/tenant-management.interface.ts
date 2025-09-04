/**
 * @interface ITenantManagementService
 * @description 租户管理服务接口
 *
 * 功能与职责：
 * 1. 定义租户管理的核心业务操作
 * 2. 提供统一的租户管理接口
 * 3. 支持租户生命周期管理
 * 4. 支持租户配置和状态管理
 *
 * @example
 * ```typescript
 * class TenantManagementService implements ITenantManagementService {
 *   async createTenant(request: CreateTenantRequest): Promise<CreateTenantResponse> {
 *     // 实现租户创建逻辑
 *   }
 * }
 * ```
 * @since 1.0.0
 */

import {
  CreateTenantRequest,
  CreateTenantResponse,
} from '../dtos/create-tenant.dto';
import {
  UpdateTenantRequest,
  UpdateTenantResponse,
} from '../dtos/update-tenant.dto';
import { GetTenantRequest, GetTenantResponse } from '../dtos/get-tenant.dto';
import {
  DeleteTenantRequest,
  DeleteTenantResponse,
} from '../dtos/delete-tenant.dto';
import {
  TenantQueryRequest,
  TenantQueryResponse,
} from '../dtos/tenant-query.dto';

/**
 * 租户管理服务接口
 * @description 定义租户管理的核心业务操作
 */
export interface ITenantManagementService {
  /**
   * 创建租户
   * @param request 创建租户请求
   * @returns 创建租户响应
   */
  createTenant(request: CreateTenantRequest): Promise<CreateTenantResponse>;

  /**
   * 更新租户
   * @param id 租户ID
   * @param request 更新租户请求
   * @returns 更新租户响应
   */
  updateTenant(
    id: string,
    request: UpdateTenantRequest,
  ): Promise<UpdateTenantResponse>;

  /**
   * 获取租户详情
   * @param request 获取租户请求
   * @returns 获取租户响应
   */
  getTenant(request: GetTenantRequest): Promise<GetTenantResponse>;

  /**
   * 删除租户
   * @param request 删除租户请求
   * @returns 删除租户响应
   */
  deleteTenant(request: DeleteTenantRequest): Promise<DeleteTenantResponse>;

  /**
   * 查询租户列表
   * @param request 查询租户请求
   * @returns 查询租户响应
   */
  queryTenants(request: TenantQueryRequest): Promise<TenantQueryResponse>;

  /**
   * 激活租户
   * @param id 租户ID
   * @returns 激活结果
   */
  activateTenant(id: string): Promise<{ success: boolean; message: string }>;

  /**
   * 暂停租户
   * @param id 租户ID
   * @returns 暂停结果
   */
  suspendTenant(id: string): Promise<{ success: boolean; message: string }>;

  /**
   * 恢复租户
   * @param id 租户ID
   * @returns 恢复结果
   */
  resumeTenant(id: string): Promise<{ success: boolean; message: string }>;

  /**
   * 更新租户配置
   * @param id 租户ID
   * @param config 配置信息
   * @returns 更新结果
   */
  updateTenantConfig(
    id: string,
    config: Record<string, unknown>,
  ): Promise<{ success: boolean; message: string }>;
}
