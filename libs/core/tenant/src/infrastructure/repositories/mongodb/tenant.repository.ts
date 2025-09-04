/**
 * @class TenantMongoRepository
 * @description
 * 租户MongoDB查询仓储实现，负责租户数据在MongoDB中的查询和投影操作。
 *
 * 原理与机制：
 * 1. 专门用于查询端的MongoDB操作
 * 2. 使用MikroORM的MongoDB驱动进行文档数据库操作
 * 3. 通过TenantMapper进行领域对象与MongoDB实体的转换
 * 4. 支持复杂查询、聚合和全文搜索
 *
 * 功能与职责：
 * 1. 租户数据的查询和检索
 * 2. 支持复杂查询和聚合操作
 * 3. 提供高性能的数据检索
 * 4. 支持全文搜索和模糊查询
 *
 * @example
 * ```typescript
 * const repository = new TenantMongoRepository(
 *   entityManager,
 *   tenantMapper
 * );
 *
 * const tenants = await repository.findByCriteria(criteria);
 * ```
 * @since 1.0.0
 */

import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/mongodb';
import { TenantQueryCriteria } from '../../../domain/repositories/tenant.repository';
import { TenantDocument } from '../../entities/mongodb/tenant.document';
import { TenantMongoMapper } from '../../mappers/mongodb/tenant.mapper';

import { TenantType, TenantStatus } from '../../../domain/enums';

/**
 * 租户MongoDB查询仓储实现类
 * @description 租户数据在MongoDB中的查询实现
 */
@Injectable()
export class TenantMongoRepository {
  constructor(
    private readonly entityManager: EntityManager,
    private readonly tenantMapper: TenantMongoMapper,
  ) {}

  /**
   * 根据查询条件查找租户列表
   * @param criteria 查询条件
   * @returns 查询结果
   */
  async findByCriteria(criteria: TenantQueryCriteria): Promise<any[]> {
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
        where.name = { $regex: criteria.name, $options: 'i' };
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

      const options: any = {};

      // 排序
      if (criteria.sort) {
        options.orderBy = { [criteria.sort.field]: criteria.sort.direction };
      } else {
        options.orderBy = { createdAt: -1 };
      }

      // 分页
      if (criteria.pagination) {
        const { page, limit } = criteria.pagination;
        options.limit = limit;
        options.offset = (page - 1) * limit;
      }

      const entities = await this.entityManager.find(
        TenantDocument,
        where,
        options,
      );
      return entities.map((entity: TenantDocument) =>
        this.tenantMapper.toDto(entity),
      );
    } catch (error) {
      throw new Error(
        `Failed to find tenants by criteria: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 执行MongoDB聚合查询
   * @param pipeline 聚合管道
   * @returns 聚合结果
   */
  async aggregate(pipeline: any[]): Promise<any[]> {
    try {
      return await this.entityManager.aggregate(TenantDocument, pipeline);
    } catch (error) {
      throw new Error(
        `Failed to execute aggregation: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
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
  ): Promise<{
    tenants: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const where: any = {
        $or: [
          { name: { $regex: keyword, $options: 'i' } },
          { code: { $regex: keyword, $options: 'i' } },
          { domain: { $regex: keyword, $options: 'i' } },
          { description: { $regex: keyword, $options: 'i' } },
        ],
      };

      const options: any = {
        orderBy: { createdAt: -1 },
      };

      if (page && limit) {
        options.limit = limit;
        options.offset = (page - 1) * limit;
      }

      const entities = await this.entityManager.find(
        TenantDocument,
        where,
        options,
      );
      const total = await this.entityManager.count(TenantDocument, where);

      const tenants = entities.map((entity: TenantDocument) =>
        this.tenantMapper.toDto(entity),
      );

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
   * @returns 统计结果
   */
  async getStatistics(): Promise<any> {
    try {
      const pipeline = [
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: {
              $sum: {
                $cond: [{ $eq: ['$status', TenantStatus.ACTIVE] }, 1, 0],
              },
            },
            inactive: {
              $sum: {
                $cond: [{ $eq: ['$status', TenantStatus.INACTIVE] }, 1, 0],
              },
            },
            suspended: {
              $sum: {
                $cond: [{ $eq: ['$status', TenantStatus.SUSPENDED] }, 1, 0],
              },
            },
            deleted: {
              $sum: {
                $cond: [{ $eq: ['$status', TenantStatus.DELETED] }, 1, 0],
              },
            },
            byType: {
              $push: {
                type: '$type',
                count: 1,
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            total: 1,
            active: 1,
            inactive: 1,
            suspended: 1,
            deleted: 1,
            byType: {
              $reduce: {
                input: '$byType',
                initialValue: {},
                in: {
                  $mergeObjects: [
                    '$$value',
                    {
                      $arrayToObject: [
                        [
                          {
                            k: '$$this.type',
                            v: {
                              $add: [
                                {
                                  $ifNull: [
                                    {
                                      $getField: {
                                        field: '$$this.type',
                                        input: '$$value',
                                      },
                                    },
                                    0,
                                  ],
                                },
                                1,
                              ],
                            },
                          },
                        ],
                      ],
                    },
                  ],
                },
              },
            },
          },
        },
      ];

      const result = await this.aggregate(pipeline);
      return (
        result[0] || {
          total: 0,
          active: 0,
          inactive: 0,
          suspended: 0,
          deleted: 0,
          byType: {},
        }
      );
    } catch (error) {
      throw new Error(
        `Failed to get tenant statistics: ${error instanceof Error ? error.message : String(error)}`,
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
      return await this.entityManager.count(TenantDocument, { status });
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
      return await this.entityManager.count(TenantDocument, { type });
    } catch (error) {
      throw new Error(
        `Failed to count tenants by type: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 获取租户总数
   * @returns 租户总数
   */
  async count(): Promise<number> {
    try {
      return await this.entityManager.count(TenantDocument);
    } catch (error) {
      throw new Error(
        `Failed to count tenants: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 执行原生MongoDB查询
   * @param query MongoDB查询对象
   * @returns 查询结果
   */
  async executeRawQuery(query: any): Promise<any[]> {
    try {
      return await this.entityManager.find(TenantDocument, query);
    } catch (error) {
      throw new Error(
        `Failed to execute raw query: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 获取查询统计信息
   * @param criteria 查询条件
   * @returns 统计结果
   */
  async getQueryStatistics(criteria: TenantQueryCriteria): Promise<any> {
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
        where.name = { $regex: criteria.name, $options: 'i' };
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

      const count = await this.entityManager.count(TenantDocument, where);

      return {
        total: count,
        criteria: criteria,
      };
    } catch (error) {
      throw new Error(
        `Failed to get query statistics: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
