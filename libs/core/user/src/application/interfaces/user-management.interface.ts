/**
 * @description 用户管理应用层接口定义
 * @author 江郎
 * @since 2.1.0
 */

// 基础请求接口
export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  tenantId?: string;
  organizationId?: string;
  departmentIds?: string[];
  userType?: string;
  displayName?: string;
  phone?: string;
  currentUserId: string;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  displayName?: string;
  phone?: string;
  userType?: string;
  organizationId?: string;
  departmentIds?: string[];
  currentUserId: string;
}

export interface GetUserRequest {
  userId?: string;
  username?: string;
  email?: string;
  tenantId?: string;
  organizationId?: string;
  userType?: string;
  status?: string;
  searchTerm?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  currentUserId: string;
}

// 基础响应接口
export interface CreateUserResponse {
  success: boolean;
  userId: string;
  username: string;
  email: string;
  tenantId?: string;
  userType: string;
  message: string;
}

export interface UpdateUserResponse {
  success: boolean;
  userId: string;
  message: string;
}

export interface GetUserResponse {
  success: boolean;
  user: any;
}

// 用户管理服务接口
export interface IUserManagementService {
  createUser(request: CreateUserRequest): Promise<CreateUserResponse>;
  updateUser(
    userId: string,
    request: UpdateUserRequest,
  ): Promise<UpdateUserResponse>;
  getUser(request: GetUserRequest): Promise<GetUserResponse>;
}
