/**
 * @file postgres-organization.repository.ts
 * @description PostgreSQL组织仓储实现
 *
 * 该文件实现了组织仓储接口的PostgreSQL版本。
 * 使用MikroORM进行数据库操作，支持事务和复杂查询。
 *
 * 主要功能：
 * 1. 组织数据的增删改查操作
 * 2. 多租户数据隔离
 * 3. 复杂查询和过滤
 * 4. 批量操作支持
 *
 * 遵循DDD和Clean Architecture原则，作为基础设施层的仓储实现。
 */

import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import {
  OrganizationRepository,
  OrganizationQueryCriteria,
} from '../../../domain/repositories/organization.repository';
import { OrganizationEntity } from '../../../domain/entities/organization.entity';
import { OrganizationId } from '../../../domain/value-objects';
import { OrganizationOrmEntity } from '../../entities/postgresql/organization.orm-entity';
import { OrganizationMapper } from '../../mappers/postgresql/organization.mapper';
import { OrganizationStatus } from '../../../domain/enums';

/**
 * PostgreSQL组织仓储实现类
 */
@Injectable()
export class PostgresOrganizationRepository implements OrganizationRepository {
  constructor(private readonly entityManager: EntityManager) {}

  /**
   * 根据ID查找组织
   * @param id 组织ID
   * @returns 组织实体或null
   */
  async findById(id: OrganizationId): Promise<OrganizationEntity | null> {
    try {
      const ormEntity = await this.entityManager.findOne(
        OrganizationOrmEntity,
        { id: id.toString() },
      );

      if (!ormEntity) {
        return null;
      }

      return OrganizationMapper.toDomain(ormEntity);
    } catch (error) {
      throw new Error(
        `Failed to find organization by ID: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 保存组织
   * @param entity 组织实体
   */
  async save(entity: OrganizationEntity): Promise<void> {
    try {
      const ormEntity = OrganizationMapper.toPersistence(entity);
      await this.entityManager.persistAndFlush(ormEntity);
    } catch (error) {
      throw new Error(
        `Failed to save organization: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 删除组织
   * @param id 组织ID
   */
  async delete(id: OrganizationId): Promise<void> {
    try {
      await this.entityManager.nativeDelete(OrganizationOrmEntity, {
        id: id.toString(),
      });
    } catch (error) {
      throw new Error(
        `Failed to delete organization: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 根据条件查询组织
   * @param criteria 查询条件
   * @returns 组织实体列表
   */
  async findByCriteria(
    criteria: OrganizationQueryCriteria,
  ): Promise<OrganizationEntity[]> {
    try {
      const where: Record<string, unknown> = {};

      if (criteria.tenantId) {
        where.tenantId = criteria.tenantId;
      }

      if (criteria.organizationId) {
        where.organizationId = criteria.organizationId;
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

      if (criteria.parentOrganizationId) {
        where.parentOrganizationId = criteria.parentOrganizationId;
      }

      if (criteria.createdAfter) {
        where.createdAt = { $gte: criteria.createdAfter };
      }

      if (criteria.createdBefore) {
        where.createdAt = where.createdAt
          ? { ...where.createdAt, $lte: criteria.createdBefore }
          : { $lte: criteria.createdBefore };
      }

      const ormEntities = await this.entityManager.find(
        OrganizationOrmEntity,
        where,
        {
          orderBy: { createdAt: 'DESC' },
          limit: criteria.limit,
          offset: criteria.offset,
        },
      );
      return OrganizationMapper.toDomainMany(ormEntities);
    } catch (error) {
      throw new Error(
        `Failed to find organizations by criteria: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 根据租户ID查找组织
   * @param tenantId 租户ID
   * @returns 组织实体列表
   */
  async findByTenantId(tenantId: string): Promise<OrganizationEntity[]> {
    try {
      const ormEntities = await this.entityManager.find(
        OrganizationOrmEntity,
        { tenantId },
        { orderBy: { createdAt: 'DESC' } },
      );

      return OrganizationMapper.toDomainMany(ormEntities);
    } catch (error) {
      throw new Error(
        `Failed to find organizations by tenant ID: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 根据管理员ID查找组织
   * @param managerId 管理员ID
   * @returns 组织实体列表
   */
  async findByManagerId(managerId: string): Promise<OrganizationEntity[]> {
    try {
      const ormEntities = await this.entityManager.find(
        OrganizationOrmEntity,
        { managerId },
        { orderBy: { createdAt: 'DESC' } },
      );

      return OrganizationMapper.toDomainMany(ormEntities);
    } catch (error) {
      throw new Error(
        `Failed to find organizations by manager ID: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 根据父组织ID查找组织
   * @param parentOrganizationId 父组织ID
   * @returns 组织实体列表
   */
  async findByParentOrganizationId(
    parentOrganizationId: OrganizationId,
  ): Promise<OrganizationEntity[]> {
    try {
      const ormEntities = await this.entityManager.find(
        OrganizationOrmEntity,
        { parentOrganizationId: parentOrganizationId.toString() },
        { orderBy: { createdAt: 'DESC' } },
      );

      return OrganizationMapper.toDomainMany(ormEntities);
    } catch (error) {
      throw new Error(
        `Failed to find organizations by parent organization ID: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 批量保存组织
   * @param entities 组织实体数组
   */
  async saveMany(entities: OrganizationEntity[]): Promise<void> {
    try {
      const ormEntities = OrganizationMapper.toPersistenceMany(entities);
      await this.entityManager.persistAndFlush(ormEntities);
    } catch (error) {
      throw new Error(
        `Failed to save organizations: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 批量删除组织
   * @param ids 组织ID数组
   */
  async deleteMany(ids: OrganizationId[]): Promise<void> {
    try {
      const idStrings = ids.map(id => id.toString());
      await this.entityManager.nativeDelete(OrganizationOrmEntity, {
        id: { $in: idStrings },
      });
    } catch (error) {
      throw new Error(
        `Failed to delete organizations: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 根据租户ID统计组织数量
   * @param tenantId 租户ID
   * @returns 组织数量
   */
  async countByTenantId(tenantId: string): Promise<number> {
    try {
      return await this.entityManager.count(OrganizationOrmEntity, {
        tenantId,
      });
    } catch (error) {
      throw new Error(
        `Failed to count organizations by tenant ID: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 根据条件统计组织数量
   * @param criteria 查询条件
   * @returns 组织数量
   */
  async countByCriteria(criteria: OrganizationQueryCriteria): Promise<number> {
    try {
      const where: Record<string, unknown> = {};

      if (criteria.tenantId) {
        where.tenantId = criteria.tenantId;
      }

      if (criteria.organizationId) {
        where.organizationId = criteria.organizationId;
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

      if (criteria.parentOrganizationId) {
        where.parentOrganizationId = criteria.parentOrganizationId;
      }

      if (criteria.createdAfter) {
        where.createdAt = { $gte: criteria.createdAfter };
      }

      if (criteria.createdBefore) {
        where.createdAt = where.createdAt
          ? { ...where.createdAt, $lte: criteria.createdBefore }
          : { $lte: criteria.createdBefore };
      }

      return await this.entityManager.count(OrganizationOrmEntity, where);
    } catch (error) {
      throw new Error(
        `Failed to count organizations by criteria: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 根据名称和租户ID查找组织
   * @param name 组织名称
   * @param tenantId 租户ID
   * @returns 组织实体或null
   */
  async findByNameAndTenant(
    name: string,
    tenantId: string,
  ): Promise<OrganizationEntity | null> {
    try {
      const ormEntity = await this.entityManager.findOne(
        OrganizationOrmEntity,
        { name, tenantId },
      );

      if (!ormEntity) {
        return null;
      }

      return OrganizationMapper.toDomain(ormEntity);
    } catch (error) {
      throw new Error(
        `Failed to find organization by name and tenant: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 根据代码和租户ID查找组织
   * @param code 组织代码
   * @param tenantId 租户ID
   * @returns 组织实体或null
   */
  async findByCodeAndTenant(
    code: string,
    tenantId: string,
  ): Promise<OrganizationEntity | null> {
    try {
      const ormEntity = await this.entityManager.findOne(
        OrganizationOrmEntity,
        { code, tenantId },
      );

      if (!ormEntity) {
        return null;
      }

      return OrganizationMapper.toDomain(ormEntity);
    } catch (error) {
      throw new Error(
        `Failed to find organization by code and tenant: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 查找租户下的活跃组织
   * @param tenantId 租户ID
   * @returns 活跃组织实体列表
   */
  async findActiveByTenant(tenantId: string): Promise<OrganizationEntity[]> {
    try {
      const ormEntities = await this.entityManager.find(
        OrganizationOrmEntity,
        { tenantId, status: OrganizationStatus.ACTIVE },
        { orderBy: { createdAt: 'DESC' } },
      );

      return OrganizationMapper.toDomainMany(ormEntities);
    } catch (error) {
      throw new Error(
        `Failed to find active organizations by tenant: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 查找租户下的非活跃组织
   * @param tenantId 租户ID
   * @returns 非活跃组织实体列表
   */
  async findInactiveByTenant(tenantId: string): Promise<OrganizationEntity[]> {
    try {
      const ormEntities = await this.entityManager.find(
        OrganizationOrmEntity,
        {
          tenantId,
          status: {
            $in: [OrganizationStatus.INACTIVE, OrganizationStatus.SUSPENDED],
          },
        },
        { orderBy: { createdAt: 'DESC' } },
      );

      return OrganizationMapper.toDomainMany(ormEntities);
    } catch (error) {
      throw new Error(
        `Failed to find inactive organizations by tenant: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
