/**
 * @class PostgresDepartmentRepository
 * @description PostgreSQL部门仓储实现
 *
 * 功能与职责：
 * 1. 实现部门仓储接口
 * 2. 处理PostgreSQL数据库操作
 * 3. 实现数据映射
 * 4. 处理事务和连接
 *
 * @example
 * ```typescript
 * const repository = new PostgresDepartmentRepository(
 *   entityManager,
 *   departmentMapper
 * );
 *
 * const department = await repository.findById(new DepartmentId('dept-123'));
 * ```
 * @since 2.1.0
 */

import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { DepartmentRepository } from '../../../domain/repositories';
import { DepartmentEntity } from '../../../domain/entities';
import { DepartmentId, TenantId, OrganizationId } from '@aiofix/shared';
import { DepartmentStatus, DepartmentType } from '../../../domain/enums';
import { PostgresDepartmentMapper } from '../../mappers';
import { DepartmentOrmEntity } from '../../entities/postgresql/department.orm-entity';

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
 * PostgreSQL部门仓储实现
 */
@Injectable()
export class PostgresDepartmentRepository implements DepartmentRepository {
  constructor(
    private readonly entityManager: EntityManager,
    private readonly departmentMapper: PostgresDepartmentMapper,
  ) {}

  /**
   * 根据ID查找部门
   * @param id 部门ID
   * @returns 部门或null
   */
  async findById(id: DepartmentId): Promise<DepartmentEntity | null> {
    try {
      const departmentData = await this.entityManager.findOne(
        DepartmentOrmEntity,
        { id: id.toString() },
        { populate: ['parentDepartment'] },
      );

      if (!departmentData) {
        return null;
      }

      return this.departmentMapper.toDomain(departmentData);
    } catch (error) {
      throw new Error(
        `Failed to find department by ID: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 保存部门
   * @param department 部门对象
   */
  async save(department: DepartmentEntity): Promise<void> {
    try {
      const departmentData = this.departmentMapper.toPersistence(department);

      if (departmentData.id) {
        // 更新现有部门
        await this.entityManager.nativeUpdate(
          DepartmentOrmEntity,
          { id: departmentData.id },
          departmentData,
        );
      } else {
        // 创建新部门
        await this.entityManager.persistAndFlush(departmentData);
      }
    } catch (error) {
      throw new Error(
        `Failed to save department: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 删除部门
   * @param id 部门ID
   */
  async delete(id: DepartmentId): Promise<void> {
    try {
      await this.entityManager.nativeDelete(DepartmentOrmEntity, {
        id: id.toString(),
      });
    } catch (error) {
      throw new Error(
        `Failed to delete department: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 根据条件查询部门
   * @param criteria 查询条件
   * @returns 部门列表
   */
  async findByCriteria(
    criteria: DepartmentQueryCriteria,
  ): Promise<DepartmentEntity[]> {
    try {
      const where: Record<string, unknown> = {};

      if (criteria.tenantId) {
        where.tenantId = criteria.tenantId.toString();
      }

      if (criteria.organizationId) {
        where.organizationId = criteria.organizationId.toString();
      }

      if (criteria.parentDepartmentId) {
        where.parentDepartmentId = criteria.parentDepartmentId.toString();
      }

      if (criteria.status) {
        where.status = criteria.status;
      }

      if (criteria.type) {
        where.type = criteria.type;
      }

      if (criteria.name) {
        where.name = { $like: `%${criteria.name}%` };
      }

      if (criteria.code) {
        where.code = { $like: `%${criteria.code}%` };
      }

      if (criteria.managerId) {
        where.managerId = criteria.managerId;
      }

      if (criteria.level !== undefined) {
        where.level = criteria.level;
      }

      if (criteria.createdAfter) {
        where.createdAt = { $gte: criteria.createdAfter };
      }

      if (criteria.createdBefore) {
        where.createdAt = where.createdAt
          ? {
              ...(where.createdAt as Record<string, unknown>),
              $lte: criteria.createdBefore,
            }
          : { $lte: criteria.createdBefore };
      }

      const departmentsData = await this.entityManager.find(
        DepartmentOrmEntity,
        where,
        { populate: ['parentDepartment'] },
      );

      return this.departmentMapper.toDomainMany(departmentsData);
    } catch (error) {
      throw new Error(
        `Failed to find departments by criteria: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 根据租户ID查找部门
   * @param tenantId 租户ID
   * @returns 部门列表
   */
  async findByTenantId(tenantId: TenantId): Promise<DepartmentEntity[]> {
    try {
      const departmentsData = await this.entityManager.find(
        DepartmentOrmEntity,
        { tenantId: tenantId.toString() },
        { populate: ['parentDepartment'] },
      );

      return this.departmentMapper.toDomainMany(departmentsData);
    } catch (error) {
      throw new Error(
        `Failed to find departments by tenant: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 根据组织ID查找部门
   * @param organizationId 组织ID
   * @returns 部门列表
   */
  async findByOrganizationId(
    organizationId: OrganizationId,
  ): Promise<DepartmentEntity[]> {
    try {
      const departmentsData = await this.entityManager.find(
        DepartmentOrmEntity,
        { organizationId: organizationId.toString() },
        { populate: ['parentDepartment'] },
      );

      return this.departmentMapper.toDomainMany(departmentsData);
    } catch (error) {
      throw new Error(
        `Failed to find departments by organization: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 根据父部门ID查找部门
   * @param parentDepartmentId 父部门ID
   * @returns 部门列表
   */
  async findByParentDepartmentId(
    parentDepartmentId: DepartmentId,
  ): Promise<DepartmentEntity[]> {
    try {
      const departmentsData = await this.entityManager.find(
        DepartmentOrmEntity,
        { parentDepartmentId: parentDepartmentId.toString() },
        { populate: ['parentDepartment'] },
      );

      return this.departmentMapper.toDomainMany(departmentsData);
    } catch (error) {
      throw new Error(
        `Failed to find departments by parent: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 根据管理员ID查找部门
   * @param managerId 管理员ID
   * @returns 部门列表
   */
  async findByManagerId(managerId: string): Promise<DepartmentEntity[]> {
    try {
      const departmentsData = await this.entityManager.find(
        DepartmentOrmEntity,
        { managerId },
        { populate: ['parentDepartment'] },
      );

      return this.departmentMapper.toDomainMany(departmentsData);
    } catch (error) {
      throw new Error(
        `Failed to find departments by manager: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 批量保存部门
   * @param departments 部门列表
   */
  async saveMany(departments: DepartmentEntity[]): Promise<void> {
    try {
      const departmentsData =
        this.departmentMapper.toPersistenceMany(departments);
      await this.entityManager.persistAndFlush(departmentsData);
    } catch (error) {
      throw new Error(
        `Failed to save departments: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 批量删除部门
   * @param ids 部门ID列表
   */
  async deleteMany(ids: DepartmentId[]): Promise<void> {
    try {
      const idStrings = ids.map(id => id.toString());
      await this.entityManager.nativeDelete(DepartmentOrmEntity, {
        id: { $in: idStrings },
      });
    } catch (error) {
      throw new Error(
        `Failed to delete departments: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 根据租户ID统计部门数量
   * @param tenantId 租户ID
   * @returns 部门数量
   */
  async countByTenantId(tenantId: TenantId): Promise<number> {
    try {
      return await this.entityManager.count(DepartmentOrmEntity, {
        tenantId: tenantId.toString(),
      });
    } catch (error) {
      throw new Error(
        `Failed to count departments by tenant: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 根据条件统计部门数量
   * @param criteria 查询条件
   * @returns 部门数量
   */
  async countByCriteria(criteria: DepartmentQueryCriteria): Promise<number> {
    try {
      const where: Record<string, unknown> = {};

      if (criteria.tenantId) {
        where.tenantId = criteria.tenantId.toString();
      }

      if (criteria.organizationId) {
        where.organizationId = criteria.organizationId.toString();
      }

      if (criteria.status) {
        where.status = criteria.status;
      }

      if (criteria.type) {
        where.type = criteria.type;
      }

      return await this.entityManager.count(DepartmentOrmEntity, where);
    } catch (error) {
      throw new Error(
        `Failed to count departments by criteria: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 根据名称和租户查找部门
   * @param name 部门名称
   * @param tenantId 租户ID
   * @returns 部门或null
   */
  async findByNameAndTenant(
    name: string,
    tenantId: TenantId,
  ): Promise<DepartmentEntity | null> {
    try {
      const departmentData = await this.entityManager.findOne(
        DepartmentOrmEntity,
        { name, tenantId: tenantId.toString() },
        { populate: ['parentDepartment'] },
      );

      if (!departmentData) {
        return null;
      }

      return this.departmentMapper.toDomain(departmentData);
    } catch (error) {
      throw new Error(
        `Failed to find department by name and tenant: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 根据代码和租户查找部门
   * @param code 部门代码
   * @param tenantId 租户ID
   * @returns 部门或null
   */
  async findByCodeAndTenant(
    code: string,
    tenantId: TenantId,
  ): Promise<DepartmentEntity | null> {
    try {
      const departmentData = await this.entityManager.findOne(
        DepartmentOrmEntity,
        { code, tenantId: tenantId.toString() },
        { populate: ['parentDepartment'] },
      );

      if (!departmentData) {
        return null;
      }

      return this.departmentMapper.toDomain(departmentData);
    } catch (error) {
      throw new Error(
        `Failed to find department by code and tenant: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 查找激活的部门
   * @param tenantId 租户ID
   * @returns 部门列表
   */
  async findActiveByTenant(tenantId: TenantId): Promise<DepartmentEntity[]> {
    try {
      const departmentsData = await this.entityManager.find(
        DepartmentOrmEntity,
        { tenantId: tenantId.toString(), status: DepartmentStatus.ACTIVE },
        { populate: ['parentDepartment'] },
      );

      return this.departmentMapper.toDomainMany(departmentsData);
    } catch (error) {
      throw new Error(
        `Failed to find active departments by tenant: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 查找非激活的部门
   * @param tenantId 租户ID
   * @returns 部门列表
   */
  async findInactiveByTenant(tenantId: TenantId): Promise<DepartmentEntity[]> {
    try {
      const departmentsData = await this.entityManager.find(
        DepartmentOrmEntity,
        {
          tenantId: tenantId.toString(),
          status: {
            $in: [DepartmentStatus.INACTIVE, DepartmentStatus.SUSPENDED],
          },
        },
        { populate: ['parentDepartment'] },
      );

      return this.departmentMapper.toDomainMany(departmentsData);
    } catch (error) {
      throw new Error(
        `Failed to find inactive departments by tenant: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
