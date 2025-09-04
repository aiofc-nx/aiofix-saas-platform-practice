/**
 * @interface GetTenantRequest
 * @description 获取租户请求DTO
 *
 * 功能与职责：
 * 1. 定义获取租户的请求数据结构
 * 2. 提供数据验证规则
 * 3. 确保数据完整性
 *
 * @example
 * ```typescript
 * const request: GetTenantRequest = {
 *   tenantId: 'tenant-123',
 *   currentUserId: 'user-456'
 * };
 * ```
 * @since 1.0.0
 */

import { TenantType } from '../../domain/enums/tenant-type.enum';
import { TenantStatus } from '../../domain/enums/tenant-status.enum';

/**
 * 获取租户请求DTO
 * @description 获取租户时需要的所有信息
 */
export interface GetTenantRequest {
  /** 租户ID */
  tenantId: string;
  /** 当前用户ID */
  currentUserId: string;
}

/**
 * 租户DTO
 * @description 租户数据传输对象
 */
export interface TenantDto {
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
  /** 租户状态 */
  status: TenantStatus;
  /** 租户描述 */
  description?: string;
  /** 租户配置 */
  config: Record<string, unknown>;
  /** 订阅方案 */
  subscriptionPlan?: string;
  /** 订阅到期时间 */
  subscriptionExpiresAt?: Date;
  /** 最大用户数量 */
  maxUsers: number;
  /** 最大组织数量 */
  maxOrganizations: number;
  /** 最大存储空间（GB） */
  maxStorageGB: number;
  /** 是否启用高级功能 */
  advancedFeaturesEnabled: boolean;
  /** 是否启用自定义配置 */
  customizationEnabled: boolean;
  /** 是否启用API访问 */
  apiAccessEnabled: boolean;
  /** 是否启用SSO */
  ssoEnabled: boolean;
  /** 联系人信息 */
  contactInfo: {
    contactPerson?: string;
    contactEmail?: string;
    contactPhone?: string;
    address?: string;
  };
  /** 创建时间 */
  createdAt: Date;
  /** 更新时间 */
  updatedAt: Date;
}

/**
 * 获取租户响应DTO
 * @description 获取租户操作的结果
 */
export interface GetTenantResponse {
  /** 操作是否成功 */
  success: boolean;
  /** 租户信息 */
  tenant?: TenantDto;
  /** 响应消息 */
  message: string;
  /** 错误信息 */
  error?: string;
}
