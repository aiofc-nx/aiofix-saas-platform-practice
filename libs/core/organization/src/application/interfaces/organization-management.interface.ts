/**
 * @description 组织管理应用层接口定义
 * @author 江郎
 * @since 2.1.0
 */

import {
  CreateOrganizationResponse,
  UpdateOrganizationResponse,
} from '../dtos';

// 基础请求接口
export interface CreateOrganizationRequest {
  name: string;
  code: string;
  type: string;
  description?: string;
  parentOrganizationId?: string;
  managerId?: string;
  tenantId: string;
  currentUserId: string;
}

export interface UpdateOrganizationRequest {
  name?: string;
  code?: string;
  type?: string;
  description?: string;
  parentOrganizationId?: string;
  managerId?: string;
  status?: string;
  currentUserId: string;
}

export interface GetOrganizationRequest {
  organizationId?: string;
  name?: string;
  code?: string;
  tenantId?: string;
  type?: string;
  status?: string;
  managerId?: string;
  parentOrganizationId?: string;
  searchTerm?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  currentUserId: string;
}

export interface ActivateOrganizationRequest {
  organizationId: string;
  currentUserId: string;
}

export interface SuspendOrganizationRequest {
  organizationId: string;
  reason?: string;
  currentUserId: string;
}

export interface DeactivateOrganizationRequest {
  organizationId: string;
  reason?: string;
  currentUserId: string;
}

// 响应接口（基础结构，具体实现在DTO中）
export interface BaseResponse {
  success: boolean;
  message: string;
}

// 组织管理服务接口
export interface IOrganizationManagementService {
  createOrganization(
    request: CreateOrganizationRequest,
  ): Promise<CreateOrganizationResponse>;
  updateOrganization(
    organizationId: string,
    request: UpdateOrganizationRequest,
  ): Promise<UpdateOrganizationResponse>;
  getOrganization(request: GetOrganizationRequest): Promise<BaseResponse>;
  activateOrganization(
    request: ActivateOrganizationRequest,
  ): Promise<BaseResponse>;
  suspendOrganization(
    request: SuspendOrganizationRequest,
  ): Promise<BaseResponse>;
  deactivateOrganization(
    request: DeactivateOrganizationRequest,
  ): Promise<BaseResponse>;
}
