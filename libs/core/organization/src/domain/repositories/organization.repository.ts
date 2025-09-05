/**
 * @interface OrganizationRepository
 * @description 组织仓储接口
 *
 * 功能与职责：
 * 1. 组织的增删改查操作
 * 2. 支持多租户数据隔离
 * 3. 提供复杂查询和过滤功能
 * 4. 支持批量操作
 *
 * @example
 * ```typescript
 * class PostgresOrganizationRepository implements OrganizationRepository {
 *   async findById(id: OrganizationId): Promise<OrganizationEntity | null> {
 *     // 实现查找逻辑
 *   }
 * }
 * ```
 * @since 2.1.0
 */

import { OrganizationEntity } from '../entities/organization.entity';
import { OrganizationId } from '../value-objects';
import { OrganizationStatus, OrganizationType } from '../enums';

/**
 * 组织查询条件接口
 */
export interface OrganizationQueryCriteria {
  tenantId?: string;
  organizationId?: string;
  status?: OrganizationStatus;
  type?: OrganizationType;
  name?: string;
  code?: string;
  managerId?: string;
  parentOrganizationId?: string;
  createdAfter?: Date;
  createdBefore?: Date;
  limit?: number;
  offset?: number;
}

/**
 * 组织仓储接口
 */
export interface OrganizationRepository {
  // 基本CRUD操作
  findById(id: OrganizationId): Promise<OrganizationEntity | null>;
  save(entity: OrganizationEntity): Promise<void>;
  delete(id: OrganizationId): Promise<void>;

  // 查询操作
  findByCriteria(
    criteria: OrganizationQueryCriteria,
  ): Promise<OrganizationEntity[]>;
  findByTenantId(tenantId: string): Promise<OrganizationEntity[]>;
  findByManagerId(managerId: string): Promise<OrganizationEntity[]>;
  findByParentOrganizationId(
    parentOrganizationId: OrganizationId,
  ): Promise<OrganizationEntity[]>;

  // 批量操作
  saveMany(entities: OrganizationEntity[]): Promise<void>;
  deleteMany(ids: OrganizationId[]): Promise<void>;

  // 统计操作
  countByTenantId(tenantId: string): Promise<number>;
  countByCriteria(criteria: OrganizationQueryCriteria): Promise<number>;

  // 业务查询
  findByNameAndTenant(
    name: string,
    tenantId: string,
  ): Promise<OrganizationEntity | null>;
  findByCodeAndTenant(
    code: string,
    tenantId: string,
  ): Promise<OrganizationEntity | null>;
  findActiveByTenant(tenantId: string): Promise<OrganizationEntity[]>;
  findInactiveByTenant(tenantId: string): Promise<OrganizationEntity[]>;
}
