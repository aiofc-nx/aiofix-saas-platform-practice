/**
 * @class TenantPostgresRepository
 * @description
 * 租户PostgreSQL仓储实现，负责租户聚合根在PostgreSQL数据库中的持久化操作。
 *
 * 原理与机制：
 * 1. 实现ITenantRepository接口，提供完整的仓储功能
 * 2. 使用MikroORM的EntityManager进行数据库操作
 * 3. 通过TenantMapper进行领域对象与持久化对象的转换
 * 4. 支持事务处理和批量操作
 *
 * 功能与职责：
 * 1. 租户聚合根的增删改查操作
 * 2. 支持复杂查询和分页
 * 3. 处理数据库事务
 * 4. 提供统计和计数功能
 *
 * @example
 * ```typescript
 * const repository = new TenantPostgresRepository(
 *   entityManager,
 *   tenantMapper
 * );
 *
 * const tenant = await repository.findById(new TenantId('tenant-123'));
 * ```
 * @since 1.0.0
 */

import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import {
  ITenantRepository,
  TenantQueryCriteria,
  TenantQueryResult,
} from '../../../domain/repositories/tenant.repository';
import { TenantAggregate } from '../../../domain/aggregates/tenant.aggregate';
import { TenantOrmEntity } from '../../entities/postgresql/tenant.orm-entity';
import { TenantPostgresMapper } from '../../mappers/postgresql/tenant.mapper';
import { TenantId, TenantCode, TenantDomain } from '@aiofix/shared';
import { TenantType } from '../../../domain/enums/tenant-type.enum';
import { TenantStatus } from '../../../domain/enums/tenant-status.enum';

/**
 * 租户PostgreSQL仓储实现类
 * @description 租户聚合根在PostgreSQL数据库中的持久化实现
 */
@Injectable()
export class TenantPostgresRepository implements ITenantRepository {
  constructor(
    private readonly entityManager: EntityManager,
    private readonly tenantMapper: TenantPostgresMapper,
  ) {}

  /**
   * 保存租户聚合根
   * @param tenant 租户聚合根
   */
  async save(tenant: TenantAggregate): Promise<void> {
    try {
      const tenantEntity = tenant.getTenant();
      const persistenceEntity = this.tenantMapper.toPersistence(tenantEntity);

      if (persistenceEntity.id) {
        // 更新现有租户
        await this.entityManager.nativeUpdate(
          TenantOrmEntity,
          { id: persistenceEntity.id },
          persistenceEntity,
        );
      } else {
        // 创建新租户
        await this.entityManager.persistAndFlush(persistenceEntity);
      }
    } catch (error) {
      throw new Error(
        `Failed to save tenant: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 根据ID查找租户
   * @param id 租户ID
   * @returns 租户聚合根或null
   */
  async findById(id: TenantId): Promise<TenantAggregate | null> {
    try {
      const entity = await this.entityManager.findOne(TenantOrmEntity, {
        id: id.toString(),
      });

      if (!entity) {
        return null;
      }

      const domainEntity = this.tenantMapper.toDomain(entity);
      const aggregate = new TenantAggregate(id.toString());
      (aggregate as any)._tenant = domainEntity;
      return aggregate;
    } catch (error) {
      throw new Error(
        `Failed to find tenant by ID: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 根据代码查找租户
   * @param code 租户代码
   * @returns 租户聚合根或null
   */
  async findByCode(code: TenantCode): Promise<TenantAggregate | null> {
    try {
      const entity = await this.entityManager.findOne(TenantOrmEntity, {
        code: code.toString(),
      });

      if (!entity) {
        return null;
      }

      const domainEntity = this.tenantMapper.toDomain(entity);
      const aggregate = new TenantAggregate(entity.id);
      (aggregate as any)._tenant = domainEntity;
      return aggregate;
    } catch (error) {
      throw new Error(
        `Failed to find tenant by code: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 根据域名查找租户
   * @param domain 租户域名
   * @returns 租户聚合根或null
   */
  async findByDomain(domain: TenantDomain): Promise<TenantAggregate | null> {
    try {
      const entity = await this.entityManager.findOne(TenantOrmEntity, {
        domain: domain.toString(),
      });

      if (!entity) {
        return null;
      }

      const domainEntity = this.tenantMapper.toDomain(entity);
      const aggregate = new TenantAggregate(entity.id);
      (aggregate as any)._tenant = domainEntity;
      return aggregate;
    } catch (error) {
      throw new Error(
        `Failed to find tenant by domain: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 根据名称查找租户
   * @param name 租户名称
   * @returns 租户聚合根或null
   */
  async findByName(name: string): Promise<TenantAggregate | null> {
    try {
      const entity = await this.entityManager.findOne(TenantOrmEntity, {
        name,
      });

      if (!entity) {
        return null;
      }

      const domainEntity = this.tenantMapper.toDomain(entity);
      const aggregate = new TenantAggregate(entity.id);
      (aggregate as any)._tenant = domainEntity;
      return aggregate;
    } catch (error) {
      throw new Error(
        `Failed to find tenant by name: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 检查租户代码是否存在
   * @param code 租户代码
   * @param excludeId 排除的租户ID
   * @returns 是否存在
   */
  async existsByCode(code: TenantCode, excludeId?: TenantId): Promise<boolean> {
    try {
      const where: any = { code: code.toString() };
      if (excludeId) {
        where.id = { $ne: excludeId.toString() };
      }

      const count = await this.entityManager.count(TenantOrmEntity, where);
      return count > 0;
    } catch (error) {
      throw new Error(
        `Failed to check tenant code existence: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 检查租户域名是否存在
   * @param domain 租户域名
   * @param excludeId 排除的租户ID
   * @returns 是否存在
   */
  async existsByDomain(
    domain: TenantDomain,
    excludeId?: TenantId,
  ): Promise<boolean> {
    try {
      const where: any = { domain: domain.toString() };
      if (excludeId) {
        where.id = { $ne: excludeId.toString() };
      }

      const count = await this.entityManager.count(TenantOrmEntity, where);
      return count > 0;
    } catch (error) {
      throw new Error(
        `Failed to check tenant domain existence: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 检查租户名称是否存在
   * @param name 租户名称
   * @param excludeId 排除的租户ID
   * @returns 是否存在
   */
  async existsByName(name: string, excludeId?: TenantId): Promise<boolean> {
    try {
      const where: any = { name };
      if (excludeId) {
        where.id = { $ne: excludeId.toString() };
      }

      const count = await this.entityManager.count(TenantOrmEntity, where);
      return count > 0;
    } catch (error) {
      throw new Error(
        `Failed to check tenant name existence: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 根据查询条件查找租户列表
   * @param criteria 查询条件
   * @returns 查询结果
   */
  async findByCriteria(
    criteria: TenantQueryCriteria,
  ): Promise<TenantQueryResult> {
    try {
      const where: any = {};

      if (criteria.id) {
        where.id = criteria.id.toString();
      }
      if (criteria.code) {
        where.code = criteria.code.toString();
      }
      if (criteria.domain) {
        where.domain = criteria.domain.toString();
      }
      if (criteria.name) {
        where.name = { $like: `%${criteria.name}%` };
      }
      if (criteria.type) {
        where.type = criteria.type;
      }
      if (criteria.status) {
        where.status = criteria.status;
      }
      if (criteria.createdAtRange) {
        where.createdAt = {
          $gte: criteria.createdAtRange.start,
          $lte: criteria.createdAtRange.end,
        };
      }
      if (criteria.updatedAtRange) {
        where.updatedAt = {
          $gte: criteria.updatedAtRange.start,
          $lte: criteria.updatedAtRange.end,
        };
      }

      // 排序配置
      const orderBy: any = {};
      if (criteria.sort) {
        orderBy[criteria.sort.field] = criteria.sort.direction;
      } else {
        orderBy.createdAt = 'DESC';
      }

      // 分页配置
      const options: any = { orderBy };
      if (criteria.pagination) {
        const { page, limit } = criteria.pagination;
        options.limit = limit;
        options.offset = (page - 1) * limit;
      }

      const [entities, total] = await this.entityManager.findAndCount(
        TenantOrmEntity,
        where,
        options,
      );

      const tenants = entities.map((entity: TenantOrmEntity) => {
        const domainEntity = this.tenantMapper.toDomain(entity);
        const aggregate = new TenantAggregate(entity.id);
        (aggregate as any)._tenant = domainEntity;
        return aggregate;
      });

      return {
        tenants,
        total,
        page: criteria.pagination?.page || 1,
        limit: criteria.pagination?.limit || 10,
        totalPages: Math.ceil(total / (criteria.pagination?.limit || 10)),
      };
    } catch (error) {
      throw new Error(
        `Failed to find tenants by criteria: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 删除租户
   * @param id 租户ID
   */
  async delete(id: TenantId): Promise<void> {
    try {
      await this.entityManager.nativeDelete(TenantOrmEntity, {
        id: id.toString(),
      });
    } catch (error) {
      throw new Error(
        `Failed to delete tenant: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 批量保存租户
   * @param tenants 租户列表
   */
  async saveBatch(tenants: TenantAggregate[]): Promise<void> {
    try {
      const entities = tenants.map(tenant => {
        const tenantEntity = tenant.getTenant();
        return this.tenantMapper.toPersistence(tenantEntity);
      });

      await this.entityManager.persistAndFlush(entities);
    } catch (error) {
      throw new Error(
        `Failed to save tenants batch: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 获取租户总数
   * @returns 租户总数
   */
  async count(): Promise<number> {
    try {
      return await this.entityManager.count(TenantOrmEntity);
    } catch (error) {
      throw new Error(
        `Failed to count tenants: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 根据状态获取租户数量
   * @param status 租户状态
   * @returns 租户数量
   */
  async countByStatus(status: TenantStatus): Promise<number> {
    try {
      return await this.entityManager.count(TenantOrmEntity, { status });
    } catch (error) {
      throw new Error(
        `Failed to count tenants by status: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 根据类型获取租户数量
   * @param type 租户类型
   * @returns 租户数量
   */
  async countByType(type: TenantType): Promise<number> {
    try {
      return await this.entityManager.count(TenantOrmEntity, { type });
    } catch (error) {
      throw new Error(
        `Failed to count tenants by type: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 获取所有租户（分页）
   * @param page 页码
   * @param limit 每页数量
   * @returns 查询结果
   */
  async findAll(page?: number, limit?: number): Promise<TenantQueryResult> {
    return this.findByCriteria({
      pagination: page && limit ? { page, limit } : undefined,
    });
  }

  /**
   * 根据状态获取租户列表
   * @param status 租户状态
   * @param page 页码
   * @param limit 每页数量
   * @returns 查询结果
   */
  async findByStatus(
    status: TenantStatus,
    page?: number,
    limit?: number,
  ): Promise<TenantQueryResult> {
    return this.findByCriteria({
      status,
      pagination: page && limit ? { page, limit } : undefined,
    });
  }

  /**
   * 根据类型获取租户列表
   * @param type 租户类型
   * @param page 页码
   * @param limit 每页数量
   * @returns 查询结果
   */
  async findByType(
    type: TenantType,
    page?: number,
    limit?: number,
  ): Promise<TenantQueryResult> {
    return this.findByCriteria({
      type,
      pagination: page && limit ? { page, limit } : undefined,
    });
  }

  /**
   * 搜索租户
   * @param keyword 搜索关键词
   * @param page 页码
   * @param limit 每页数量
   * @returns 查询结果
   */
  async search(
    keyword: string,
    page?: number,
    limit?: number,
  ): Promise<TenantQueryResult> {
    try {
      const where = {
        $or: [
          { name: { $like: `%${keyword}%` } },
          { code: { $like: `%${keyword}%` } },
          { domain: { $like: `%${keyword}%` } },
          { description: { $like: `%${keyword}%` } },
        ],
      };

      const options: any = { orderBy: { createdAt: 'DESC' } };
      if (page && limit) {
        options.limit = limit;
        options.offset = (page - 1) * limit;
      }

      const [entities, total] = await this.entityManager.findAndCount(
        TenantOrmEntity,
        where,
        options,
      );

      const tenants = entities.map((entity: TenantOrmEntity) => {
        const domainEntity = this.tenantMapper.toDomain(entity);
        const aggregate = new TenantAggregate(entity.id);
        (aggregate as any)._tenant = domainEntity;
        return aggregate;
      });

      return {
        tenants,
        total,
        page: page || 1,
        limit: limit || 10,
        totalPages: Math.ceil(total / (limit || 10)),
      };
    } catch (error) {
      throw new Error(
        `Failed to search tenants: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 获取租户统计信息
   * @returns 统计信息
   */
  async getStatistics(): Promise<{
    total: number;
    active: number;
    inactive: number;
    suspended: number;
    deleted: number;
    byType: Record<TenantType, number>;
  }> {
    try {
      const total = await this.count();
      const active = await this.countByStatus(TenantStatus.ACTIVE);
      const inactive = await this.countByStatus(TenantStatus.INACTIVE);
      const suspended = await this.countByStatus(TenantStatus.SUSPENDED);
      const deleted = await this.countByStatus(TenantStatus.DELETED);

      const byType: Record<TenantType, number> = {
        [TenantType.ENTERPRISE]: await this.countByType(TenantType.ENTERPRISE),
        [TenantType.ORGANIZATION]: await this.countByType(
          TenantType.ORGANIZATION,
        ),
        [TenantType.PARTNERSHIP]: await this.countByType(
          TenantType.PARTNERSHIP,
        ),
        [TenantType.PERSONAL]: await this.countByType(TenantType.PERSONAL),
      };

      return {
        total,
        active,
        inactive,
        suspended,
        deleted,
        byType,
      };
    } catch (error) {
      throw new Error(
        `Failed to get tenant statistics: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
