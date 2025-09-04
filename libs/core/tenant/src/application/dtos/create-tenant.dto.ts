/**
 * @interface CreateTenantRequest
 * @description 创建租户请求DTO
 *
 * 功能与职责：
 * 1. 定义创建租户的请求数据结构
 * 2. 提供数据验证规则
 * 3. 确保数据完整性
 *
 * @example
 * ```typescript
 * const request: CreateTenantRequest = {
 *   id: 'tenant-123',
 *   name: 'Acme Corporation',
 *   code: 'ACME',
 *   domain: 'acme.example.com',
 *   type: 'ENTERPRISE',
 *   description: '企业级租户'
 * };
 * ```
 * @since 1.0.0
 */

import { TenantType } from '../../domain/enums/tenant-type.enum';

/**
 * 创建租户请求DTO
 * @description 创建租户时需要的所有信息
 */
export interface CreateTenantRequest {
  /** 租户ID */
  id: string;
  /** 租户名称 */
  name: string;
  /** 租户代码 */
  code: string;
  /** 租户域名 */
  domain: string;
  /** 租户类型 */
  type: TenantType;
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
 * 创建租户响应DTO
 * @description 创建租户操作的结果
 */
export interface CreateTenantResponse {
  /** 操作是否成功 */
  success: boolean;
  /** 租户ID */
  tenantId?: string;
  /** 响应消息 */
  message: string;
  /** 错误信息 */
  error?: string;
}
