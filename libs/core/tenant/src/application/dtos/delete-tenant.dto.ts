/**
 * @interface DeleteTenantRequest
 * @description 删除租户请求DTO
 *
 * 功能与职责：
 * 1. 定义删除租户的请求数据结构
 * 2. 提供数据验证规则
 * 3. 确保数据完整性
 *
 * @example
 * ```typescript
 * const request: DeleteTenantRequest = {
 *   tenantId: 'tenant-123',
 *   currentUserId: 'user-456'
 * };
 * ```
 * @since 1.0.0
 */

/**
 * 删除租户请求DTO
 * @description 删除租户时需要的所有信息
 */
export interface DeleteTenantRequest {
  /** 租户ID */
  tenantId: string;
  /** 当前用户ID */
  currentUserId: string;
}

/**
 * 删除租户响应DTO
 * @description 删除租户操作的结果
 */
export interface DeleteTenantResponse {
  /** 操作是否成功 */
  success: boolean;
  /** 响应消息 */
  message: string;
  /** 错误信息 */
  error?: string;
}
