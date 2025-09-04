/**
 * @class GetUsersRequest
 * @description
 * 获取用户列表请求DTO，封装获取用户列表的请求参数。
 *
 * @example
 * ```typescript
 * const request = new GetUsersRequest('tenant-123', 'current-456', 1, 20);
 * const users = await getUserUseCase.getUsers(request);
 * ```
 * @since 1.0.0
 */
export class GetUsersRequest {
  constructor(
    public readonly tenantId: string,
    public readonly currentUserId: string,
    public readonly page: number = 1,
    public readonly size: number = 20,
  ) {}
}

/**
 * @class GetUsersResponse
 * @description
 * 获取用户列表响应DTO，封装用户列表的响应数据。
 *
 * @example
 * ```typescript
 * const response = new GetUsersResponse(true, [user1, user2], {
 *   page: 1,
 *   size: 20,
 *   total: 100,
 *   totalPages: 5
 * });
 * ```
 * @since 1.0.0
 */
export class GetUsersResponse {
  constructor(
    public readonly success: boolean,
    public readonly users: UserDto[],
    public readonly pagination: PaginationDto,
  ) {}
}

/**
 * @interface UserDto
 * @description
 * 用户数据传输对象，定义用户的基本信息结构。
 *
 * @since 1.0.0
 */
export interface UserDto {
  id: string;
  username: string;
  email: string;
  status: string;
  tenantId?: string;
  organizationId?: string;
  departmentIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * @interface PaginationDto
 * @description
 * 分页数据传输对象，定义分页信息结构。
 *
 * @since 1.0.0
 */
export interface PaginationDto {
  page: number;
  size: number;
  total: number;
  totalPages: number;
}
