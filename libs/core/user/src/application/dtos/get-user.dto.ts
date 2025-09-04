/**
 * @class GetUserRequest
 * @description
 * 获取用户请求DTO，封装获取单个用户的请求参数。
 *
 * @example
 * ```typescript
 * const request = new GetUserRequest('user-123', 'current-456');
 * const user = await getUserUseCase.execute(request);
 * ```
 * @since 1.0.0
 */
export class GetUserRequest {
  constructor(
    public readonly userId: string,
    public readonly currentUserId: string,
  ) {}
}

/**
 * @class GetUserResponse
 * @description
 * 获取用户响应DTO，封装用户信息的响应数据。
 *
 * @example
 * ```typescript
 * const response = new GetUserResponse(true, {
 *   id: 'user-123',
 *   username: 'john.doe',
 *   email: 'john@example.com',
 *   status: 'ACTIVE'
 * });
 * ```
 * @since 1.0.0
 */
export class GetUserResponse {
  constructor(
    public readonly success: boolean,
    public readonly user?: UserDto,
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
