/**
 * @description 部门管理应用层接口定义
 * @author 江郎
 * @since 1.0.0
 */

import { CreateDepartmentResponse, UpdateDepartmentResponse } from '../dtos';

// 基础响应接口
export interface BaseResponse {
  success: boolean;
  message: string;
  error?: string;
}

// 基础请求接口
export interface CreateDepartmentRequest {
  id: string;
  name: string;
  code: string;
  type: string;
  tenantId: string;
  organizationId: string;
  description?: string;
  parentDepartmentId?: string;
  managerId?: string;
  createdBy: string;
}

export interface UpdateDepartmentRequest {
  name?: string;
  code?: string;
  type?: string;
  description?: string;
  parentDepartmentId?: string;
  managerId?: string;
  status?: string;
  currentUserId: string;
}

export interface GetDepartmentRequest {
  departmentId: string;
  tenantId: string;
  currentUserId: string;
}

export interface GetDepartmentsRequest {
  tenantId: string;
  organizationId?: string;
  currentUserId: string;
  page?: number;
  size?: number;
  status?: string;
  type?: string;
  parentDepartmentId?: string;
  managerId?: string;
  searchText?: string;
}

export interface DeleteDepartmentRequest {
  departmentId: string;
  currentUserId: string;
  reason?: string;
}

// 部门管理服务接口
export interface IDepartmentManagementService {
  createDepartment(
    request: CreateDepartmentRequest,
  ): Promise<CreateDepartmentResponse>;
  updateDepartment(
    departmentId: string,
    request: UpdateDepartmentRequest,
  ): Promise<UpdateDepartmentResponse>;
  getDepartment(request: GetDepartmentRequest): Promise<BaseResponse>;
  getDepartments(request: GetDepartmentsRequest): Promise<BaseResponse>;
  deleteDepartment(request: DeleteDepartmentRequest): Promise<BaseResponse>;
}
