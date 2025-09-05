/**
 * @interface DepartmentRepository
 * @description 部门仓储接口
 *
 * 功能与职责：
 * 1. 部门的增删改查操作
 * 2. 支持多租户数据隔离
 * 3. 提供复杂查询和过滤功能
 * 4. 支持批量操作
 *
 * @example
 * ```typescript
 * class PostgresDepartmentRepository implements DepartmentRepository {
 *   async findById(id: DepartmentId): Promise<DepartmentEntity | null> {
 *     // 实现查找逻辑
 *   }
 * }
 * ```
 * @since 2.1.0
 */

import { DepartmentEntity } from '../entities';
import { DepartmentId, TenantId, OrganizationId } from '@aiofix/shared';
import { DepartmentStatus, DepartmentType } from '../enums';

/**
 * 部门查询条件接口
 */
export interface DepartmentQueryCriteria {
  tenantId?: TenantId;
  organizationId?: OrganizationId;
  parentDepartmentId?: DepartmentId;
  status?: DepartmentStatus;
  type?: DepartmentType;
  name?: string;
  code?: string;
  managerId?: string;
  level?: number;
  createdAfter?: Date;
  createdBefore?: Date;
  limit?: number;
  offset?: number;
}

/**
 * 部门仓储接口
 */
export interface DepartmentRepository {
  // 基本CRUD操作
  findById(id: DepartmentId): Promise<DepartmentEntity | null>;
  save(entity: DepartmentEntity): Promise<void>;
  delete(id: DepartmentId): Promise<void>;

  // 查询操作
  findByCriteria(
    criteria: DepartmentQueryCriteria,
  ): Promise<DepartmentEntity[]>;
  findByTenantId(tenantId: TenantId): Promise<DepartmentEntity[]>;
  findByOrganizationId(
    organizationId: OrganizationId,
  ): Promise<DepartmentEntity[]>;
  findByParentDepartmentId(
    parentDepartmentId: DepartmentId,
  ): Promise<DepartmentEntity[]>;
  findByManagerId(managerId: string): Promise<DepartmentEntity[]>;

  // 批量操作
  saveMany(entities: DepartmentEntity[]): Promise<void>;
  deleteMany(ids: DepartmentId[]): Promise<void>;

  // 统计操作
  countByTenantId(tenantId: TenantId): Promise<number>;
  countByCriteria(criteria: DepartmentQueryCriteria): Promise<number>;

  // 验证操作
  findByNameAndTenant(
    name: string,
    tenantId: TenantId,
  ): Promise<DepartmentEntity | null>;
  findByCodeAndTenant(
    code: string,
    tenantId: TenantId,
  ): Promise<DepartmentEntity | null>;
  findActiveByTenant(tenantId: TenantId): Promise<DepartmentEntity[]>;
  findInactiveByTenant(tenantId: TenantId): Promise<DepartmentEntity[]>;
}
