/**
 * @interface UpdateTenantRequest
 * @description 更新租户请求DTO
 *
 * 功能与职责：
 * 1. 定义更新租户的请求数据结构
 * 2. 提供数据验证规则
 * 3. 确保数据完整性
 *
 * @example
 * ```typescript
 * const request: UpdateTenantRequest = {
 *   name: 'Updated Corporation',
 *   description: 'Updated description',
 *   config: { theme: 'dark' }
 * };
 * ```
 * @since 1.0.0
 */

/**
 * 更新租户请求DTO
 * @description 更新租户时需要的所有信息
 */
export interface UpdateTenantRequest {
  /** 租户名称 */
  name?: string;
  /** 租户描述 */
  description?: string;
  /** 租户配置 */
  config?: Record<string, unknown>;
  /** 订阅方案 */
  subscriptionPlan?: string;
  /** 订阅到期时间 */
  subscriptionExpiresAt?: Date;
  /** 联系人信息 */
  contactInfo?: {
    contactPerson?: string;
    contactEmail?: string;
    contactPhone?: string;
    address?: string;
  };
}

/**
 * 更新租户响应DTO
 * @description 更新租户操作的结果
 */
export interface UpdateTenantResponse {
  /** 操作是否成功 */
  success: boolean;
  /** 响应消息 */
  message: string;
  /** 错误信息 */
  error?: string;
}
