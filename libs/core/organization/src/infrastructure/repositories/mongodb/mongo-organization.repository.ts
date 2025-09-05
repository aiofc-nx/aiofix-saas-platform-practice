/**
 * @file mongo-organization.repository.ts
 * @description MongoDB组织查询仓储实现
 *
 * 该文件实现了组织查询仓储接口的MongoDB版本。
 * 使用MikroORM的MongoDB驱动进行查询操作，支持复杂聚合查询。
 *
 * 主要功能：
 * 1. 组织数据的复杂查询操作
 * 2. 聚合查询和统计
 * 3. 全文搜索支持
 * 4. 查询性能优化
 *
 * 遵循DDD和Clean Architecture原则，作为基础设施层的查询仓储实现。
 */

import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import {
  OrganizationRepository,
  OrganizationQueryCriteria,
} from '../../../domain/repositories/organization.repository';
import { OrganizationEntity } from '../../../domain/entities/organization.entity';
import { OrganizationId } from '../../../domain/value-objects';
import { OrganizationDocument } from '../../entities/mongodb/organization.document';
import { OrganizationMapper } from '../../mappers/mongodb/organization.mapper';
import { OrganizationStatus } from '../../../domain/enums';

/**
 * MongoDB组织查询仓储实现类
 */
@Injectable()
export class MongoOrganizationRepository implements OrganizationRepository {
  constructor(private readonly entityManager: EntityManager) {}

  /**
   * 根据ID查找组织
   * @param id 组织ID
   * @returns 组织实体或null
   */
  async findById(id: OrganizationId): Promise<OrganizationEntity | null> {
    try {
      const document = await this.entityManager.findOne(OrganizationDocument, {
        id: id.toString(),
      });

      if (!document) {
        return null;
      }

      return OrganizationMapper.toDomain(document);
    } catch (error) {
      throw new Error(
        `Failed to find organization by ID: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 保存组织（查询端通常不需要实现）
   * @param entity 组织实体
   */
  async save(_entity: OrganizationEntity): Promise<void> {
    // MongoDB查询仓储通常不实现写操作
    throw new Error('MongoDB organization repository is read-only');
  }

  /**
   * 删除组织（查询端通常不需要实现）
   * @param id 组织ID
   */
  async delete(_id: OrganizationId): Promise<void> {
    // MongoDB查询仓储通常不实现写操作
    throw new Error('MongoDB organization repository is read-only');
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
        where.name = { $regex: criteria.name, $options: 'i' };
      }

      if (criteria.code) {
        where.code = { $regex: criteria.code, $options: 'i' };
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

      const findOptions: Record<string, unknown> = {
        orderBy: { createdAt: -1 },
      };

      if (criteria.limit) {
        findOptions.limit = criteria.limit;
      }

      if (criteria.offset) {
        findOptions.offset = criteria.offset;
      }

      const documents = await this.entityManager.find(
        OrganizationDocument,
        where,
        findOptions,
      );
      return OrganizationMapper.toDomainMany(documents);
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
      const documents = await this.entityManager.find(
        OrganizationDocument,
        { tenantId },
        { orderBy: { createdAt: -1 } },
      );

      return OrganizationMapper.toDomainMany(documents);
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
      const documents = await this.entityManager.find(
        OrganizationDocument,
        { managerId },
        { orderBy: { createdAt: -1 } },
      );

      return OrganizationMapper.toDomainMany(documents);
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
      const documents = await this.entityManager.find(
        OrganizationDocument,
        { parentOrganizationId: parentOrganizationId.toString() },
        { orderBy: { createdAt: -1 } },
      );

      return OrganizationMapper.toDomainMany(documents);
    } catch (error) {
      throw new Error(
        `Failed to find organizations by parent organization ID: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 批量保存组织（查询端通常不需要实现）
   * @param entities 组织实体数组
   */
  async saveMany(_entities: OrganizationEntity[]): Promise<void> {
    // MongoDB查询仓储通常不实现写操作
    throw new Error('MongoDB organization repository is read-only');
  }

  /**
   * 批量删除组织（查询端通常不需要实现）
   * @param ids 组织ID数组
   */
  async deleteMany(_ids: OrganizationId[]): Promise<void> {
    // MongoDB查询仓储通常不实现写操作
    throw new Error('MongoDB organization repository is read-only');
  }

  /**
   * 根据租户ID统计组织数量
   * @param tenantId 租户ID
   * @returns 组织数量
   */
  async countByTenantId(tenantId: string): Promise<number> {
    try {
      return await this.entityManager.count(OrganizationDocument, {
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
        where.name = { $regex: criteria.name, $options: 'i' };
      }

      if (criteria.code) {
        where.code = { $regex: criteria.code, $options: 'i' };
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

      return await this.entityManager.count(OrganizationDocument, where);
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
      const document = await this.entityManager.findOne(OrganizationDocument, {
        name,
        tenantId,
      });

      if (!document) {
        return null;
      }

      return OrganizationMapper.toDomain(document);
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
      const document = await this.entityManager.findOne(OrganizationDocument, {
        code,
        tenantId,
      });

      if (!document) {
        return null;
      }

      return OrganizationMapper.toDomain(document);
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
      const documents = await this.entityManager.find(
        OrganizationDocument,
        { tenantId, status: OrganizationStatus.ACTIVE },
        { orderBy: { createdAt: -1 } },
      );

      return OrganizationMapper.toDomainMany(documents);
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
      const documents = await this.entityManager.find(
        OrganizationDocument,
        {
          tenantId,
          status: {
            $in: [OrganizationStatus.INACTIVE, OrganizationStatus.SUSPENDED],
          },
        },
        { orderBy: { createdAt: -1 } },
      );

      return OrganizationMapper.toDomainMany(documents);
    } catch (error) {
      throw new Error(
        `Failed to find inactive organizations by tenant: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 全文搜索
   * @param searchText 搜索文本
   * @param tenantId 租户ID
   * @param limit 限制数量
   * @returns 搜索结果
   */
  async fullTextSearch(
    searchText: string,
    tenantId: string,
    limit: number = 20,
  ): Promise<OrganizationEntity[]> {
    try {
      const documents = await this.entityManager.find(
        OrganizationDocument,
        {
          tenantId,
          searchText: new RegExp(searchText, 'i'),
        },
        {
          limit,
          orderBy: { createdAt: -1 },
        },
      );

      return OrganizationMapper.toDomainMany(documents);
    } catch (error) {
      throw new Error(
        `Failed to perform full text search: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 根据标签查找组织
   * @param tags 标签数组
   * @param tenantId 租户ID
   * @returns 组织实体列表
   */
  async findByTags(
    tags: string[],
    tenantId: string,
  ): Promise<OrganizationEntity[]> {
    try {
      const documents = await this.entityManager.find(
        OrganizationDocument,
        {
          tenantId,
          tags: { $in: tags },
        },
        { orderBy: { createdAt: -1 } },
      );

      return OrganizationMapper.toDomainMany(documents);
    } catch (error) {
      throw new Error(
        `Failed to find organizations by tags: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
