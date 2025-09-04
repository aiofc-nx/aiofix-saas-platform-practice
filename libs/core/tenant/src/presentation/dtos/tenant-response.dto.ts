/**
 * @class TenantResponseDto
 * @description 租户响应DTO
 *
 * 功能与职责：
 * 1. 定义租户响应数据结构
 * 2. 提供统一的响应格式
 * 3. 支持序列化和反序列化
 *
 * @example
 * ```typescript
 * const response = new TenantResponseDto({
 *   id: 'tenant-123',
 *   name: 'Acme Corporation',
 *   code: 'ACME',
 *   domain: 'acme.example.com',
 *   type: 'ENTERPRISE',
 *   status: 'ACTIVE'
 * });
 * ```
 * @since 1.0.0
 */

import { Expose, Type } from 'class-transformer';
import { TenantType } from '../../domain/enums/tenant-type.enum';
import { TenantStatus } from '../../domain/enums/tenant-status.enum';

/**
 * 租户响应DTO类
 * @description 租户信息的响应格式
 */
export class TenantResponseDto {
  @Expose()
  id!: string;

  @Expose()
  name!: string;

  @Expose()
  code!: string;

  @Expose()
  domain!: string;

  @Expose()
  @Type(() => String)
  type!: TenantType;

  @Expose()
  @Type(() => String)
  status!: TenantStatus;

  @Expose()
  description?: string;

  @Expose()
  config?: Record<string, unknown>;

  @Expose()
  limits?: {
    maxUsers: number;
    maxOrganizations: number;
    maxStorageGB: number;
    advancedFeaturesEnabled: boolean;
    customizationEnabled: boolean;
    apiAccessEnabled: boolean;
    ssoEnabled: boolean;
  };

  @Expose()
  createdAt!: Date;

  @Expose()
  updatedAt!: Date;

  constructor(partial: Partial<TenantResponseDto>) {
    Object.assign(this, partial);
  }
}

/**
 * 租户列表响应DTO类
 * @description 租户列表的响应格式
 */
export class TenantListResponseDto {
  @Expose()
  @Type(() => TenantResponseDto)
  tenants!: TenantResponseDto[];

  @Expose()
  total!: number;

  @Expose()
  page!: number;

  @Expose()
  size!: number;

  @Expose()
  totalPages!: number;

  constructor(partial: Partial<TenantListResponseDto>) {
    Object.assign(this, partial);
  }
}

/**
 * 租户操作响应DTO类
 * @description 租户操作的响应格式
 */
export class TenantOperationResponseDto {
  @Expose()
  success!: boolean;

  @Expose()
  message!: string;

  @Expose()
  error?: string;

  @Expose()
  tenantId?: string;

  constructor(partial: Partial<TenantOperationResponseDto>) {
    Object.assign(this, partial);
  }
}
