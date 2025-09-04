/**
 * @interface TenantQueryRequest
 * @description 租户查询请求DTO
 *
 * 功能与职责：
 * 1. 定义租户查询的请求数据结构
 * 2. 提供数据验证规则
 * 3. 确保数据完整性
 *
 * @example
 * ```typescript
 * const request: TenantQueryRequest = {
 *   currentUserId: 'user-456',
 *   page: 1,
 *   size: 20,
 *   name: 'Acme'
 * };
 * ```
 * @since 1.0.0
 */

import { TenantType } from '../../domain/enums/tenant-type.enum';
import { TenantStatus } from '../../domain/enums/tenant-status.enum';
import { TenantDto } from './get-tenant.dto';

/**
 * 租户查询请求DTO
 * @description 查询租户时需要的所有信息
 */
export interface TenantQueryRequest {
  /** 当前用户ID */
  currentUserId: string;
  /** 页码 */
  page?: number;
  /** 每页数量 */
  size?: number;
  /** 租户名称（模糊查询） */
  name?: string;
  /** 租户代码（模糊查询） */
  code?: string;
  /** 租户域名（模糊查询） */
  domain?: string;
  /** 租户类型 */
  type?: TenantType;
  /** 租户状态 */
  status?: TenantStatus;
  /** 创建时间范围 */
  createdAtRange?: {
    start: Date;
    end: Date;
  };
  /** 更新时间范围 */
  updatedAtRange?: {
    start: Date;
    end: Date;
  };
  /** 排序字段 */
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
}

/**
 * 租户查询响应DTO
 * @description 查询租户操作的结果
 */
export interface TenantQueryResponse {
  /** 操作是否成功 */
  success: boolean;
  /** 租户列表 */
  tenants?: TenantDto[];
  /** 总数量 */
  total?: number;
  /** 当前页码 */
  page?: number;
  /** 每页数量 */
  size?: number;
  /** 总页数 */
  totalPages?: number;
  /** 响应消息 */
  message: string;
  /** 错误信息 */
  error?: string;
}
