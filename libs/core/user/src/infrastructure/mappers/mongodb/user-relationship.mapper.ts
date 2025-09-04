/**
 * @class MongoUserRelationshipMapper
 * @description
 * MongoDB用户关系映射器，负责在领域实体和MongoDB文档之间进行转换。
 *
 * 原理与机制：
 * 1. 实现领域实体与MongoDB文档的双向映射
 * 2. 处理枚举类型的转换和验证
 * 3. 确保数据完整性和类型安全
 * 4. 支持批量映射操作
 * 5. 处理时间戳和状态字段
 *
 * 功能与职责：
 * 1. 领域实体到MongoDB文档的转换
 * 2. MongoDB文档到领域实体的转换
 * 3. 批量映射操作
 * 4. 数据验证和清理
 * 5. 类型安全保证
 *
 * @example
 * ```typescript
 * const mapper = new MongoUserRelationshipMapper();
 * const document = mapper.toDocument(domainEntity);
 * const domainEntity = mapper.toDomainEntity(document);
 * ```
 * @since 1.0.0
 */

import { Injectable } from '@nestjs/common';
import { UserRelationshipEntity } from '../../../domain/entities/user-relationship.entity';
import { UserRelationshipDocument } from '../../entities/mongodb/user-relationship.document';

/**
 * MongoDB用户关系映射器
 */
@Injectable()
export class MongoUserRelationshipMapper {
  /**
   * 将领域实体转换为MongoDB文档
   * @param relationship 用户关系领域实体
   * @returns MongoDB文档
   */
  toDocument(
    relationship: UserRelationshipEntity,
  ): Partial<UserRelationshipDocument> {
    if (!relationship) {
      return {};
    }

    return {
      relationshipId: relationship.id,
      sourceUserId: relationship.sourceUserId,
      targetUserId: relationship.targetUserId,
      relationshipType: relationship.relationshipType,
      status: relationship.status,
      initiatedAt: relationship.initiatedAt,
      acceptedAt: relationship.acceptedAt,
      terminatedAt: relationship.terminatedAt,
      notes: relationship.notes,
      tenantId: relationship.tenantId,
      organizationId: relationship.organizationId,
      departmentIds: relationship.departmentIds,
      dataIsolationLevel: relationship.dataIsolationLevel,
      dataPrivacyLevel: relationship.dataPrivacyLevel,
      createdAt: relationship.createdAt,
      updatedAt: relationship.updatedAt,
      version: relationship.version,
    };
  }

  /**
   * 将MongoDB文档转换为领域实体
   * @param relationshipDoc MongoDB文档
   * @returns 用户关系领域实体
   */
  toDomainEntity(
    relationshipDoc: UserRelationshipDocument,
  ): UserRelationshipEntity {
    if (!relationshipDoc) {
      throw new Error('Relationship document cannot be null');
    }

    // 创建领域实体
    const relationship = new UserRelationshipEntity(
      relationshipDoc.sourceUserId,
      relationshipDoc.targetUserId,
      relationshipDoc.relationshipType,
      relationshipDoc.status,
      relationshipDoc.tenantId,
      relationshipDoc.organizationId,
      relationshipDoc.departmentIds,
      relationshipDoc.dataIsolationLevel,
      relationshipDoc.dataPrivacyLevel,
      relationshipDoc.relationshipId || relationshipDoc._id?.toString(),
    );

    // 设置时间戳和状态
    if (relationshipDoc.initiatedAt) {
      relationship.initiatedAt = relationshipDoc.initiatedAt;
    }
    if (relationshipDoc.acceptedAt) {
      relationship.acceptedAt = relationshipDoc.acceptedAt;
    }
    if (relationshipDoc.terminatedAt) {
      relationship.terminatedAt = relationshipDoc.terminatedAt;
    }
    if (relationshipDoc.notes) {
      relationship.notes = relationshipDoc.notes;
    }
    if (relationshipDoc.createdAt) {
      relationship.createdAt = relationshipDoc.createdAt;
    }
    if (relationshipDoc.updatedAt) {
      relationship.updatedAt = relationshipDoc.updatedAt;
    }
    if (relationshipDoc.version) {
      relationship.version = relationshipDoc.version;
    }

    return relationship;
  }

  /**
   * 批量转换领域实体到MongoDB文档
   * @param relationships 用户关系领域实体数组
   * @returns MongoDB文档数组
   */
  toDocuments(
    relationships: UserRelationshipEntity[],
  ): Partial<UserRelationshipDocument>[] {
    if (!relationships || !Array.isArray(relationships)) {
      return [];
    }
    return relationships.map(relationship => this.toDocument(relationship));
  }

  /**
   * 批量转换MongoDB文档到领域实体
   * @param relationshipDocs MongoDB文档数组
   * @returns 用户关系领域实体数组
   */
  toDomainEntities(
    relationshipDocs: UserRelationshipDocument[],
  ): UserRelationshipEntity[] {
    if (!relationshipDocs || !Array.isArray(relationshipDocs)) {
      return [];
    }
    return relationshipDocs.map(relationshipDoc =>
      this.toDomainEntity(relationshipDoc),
    );
  }

  /**
   * 更新MongoDB文档
   * @param relationshipDoc 现有MongoDB文档
   * @param updates 更新数据
   * @returns 更新后的MongoDB文档
   */
  updateDocument(
    relationshipDoc: UserRelationshipDocument,
    updates: Partial<UserRelationshipEntity>,
  ): Partial<UserRelationshipDocument> {
    if (!relationshipDoc || !updates) {
      return relationshipDoc || {};
    }

    const updateData: Partial<UserRelationshipDocument> = {};

    // 只更新提供的字段
    if (updates.relationshipType !== undefined) {
      updateData.relationshipType = updates.relationshipType;
    }
    if (updates.status !== undefined) {
      updateData.status = updates.status;
    }
    if (updates.initiatedAt !== undefined) {
      updateData.initiatedAt = updates.initiatedAt;
    }
    if (updates.acceptedAt !== undefined) {
      updateData.acceptedAt = updates.acceptedAt;
    }
    if (updates.terminatedAt !== undefined) {
      updateData.terminatedAt = updates.terminatedAt;
    }
    if (updates.notes !== undefined) {
      updateData.notes = updates.notes;
    }
    if (updates.organizationId !== undefined) {
      updateData.organizationId = updates.organizationId;
    }
    if (updates.departmentIds !== undefined) {
      updateData.departmentIds = updates.departmentIds;
    }
    if (updates.dataIsolationLevel !== undefined) {
      updateData.dataIsolationLevel = updates.dataIsolationLevel;
    }
    if (updates.dataPrivacyLevel !== undefined) {
      updateData.dataPrivacyLevel = updates.dataPrivacyLevel;
    }

    // 更新时间戳
    updateData.updatedAt = new Date();
    if (updates.version !== undefined) {
      updateData.version = updates.version + 1;
    }

    return updateData;
  }

  /**
   * 创建部分更新数据
   * @param updates 更新数据
   * @returns 部分更新数据
   */
  toPartialUpdate(
    updates: Partial<UserRelationshipEntity>,
  ): Partial<UserRelationshipDocument> {
    if (!updates) {
      return {};
    }

    const updateData: Partial<UserRelationshipDocument> = {};

    // 只包含非undefined的字段
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        updateData[key] = value;
      }
    });

    // 更新时间戳
    updateData.updatedAt = new Date();

    return updateData;
  }

  /**
   * 转换为查询条件
   * @param criteria 查询条件
   * @returns MongoDB查询条件
   */
  toQueryCriteria(_criteria: unknown): any {
    if (!criteria) {
      return {};
    }

    const query: unknown = {};

    // 基本字段查询
    if (criteria.sourceUserId) {
      query.sourceUserId = criteria.sourceUserId;
    }
    if (criteria.targetUserId) {
      query.targetUserId = criteria.targetUserId;
    }
    if (criteria.relationshipType) {
      query.relationshipType = criteria.relationshipType;
    }
    if (criteria.status) {
      query.status = criteria.status;
    }
    if (criteria.tenantId) {
      query.tenantId = criteria.tenantId;
    }
    if (criteria.organizationId) {
      query.organizationId = criteria.organizationId;
    }
    if (criteria.departmentIds && criteria.departmentIds.length > 0) {
      query.departmentIds = { $in: criteria.departmentIds };
    }

    // 用户关系查询（支持双向查询）
    if (criteria.userId) {
      query.$or = [
        { sourceUserId: criteria.userId },
        { targetUserId: criteria.userId },
      ];
    }

    // 关系类型查询
    if (criteria.relationshipTypes && criteria.relationshipTypes.length > 0) {
      query.relationshipType = { $in: criteria.relationshipTypes };
    }

    // 状态查询
    if (criteria.statuses && criteria.statuses.length > 0) {
      query.status = { $in: criteria.statuses };
    }

    // 时间范围查询
    if (criteria.initiatedAtFrom || criteria.initiatedAtTo) {
      query.initiatedAt = {};
      if (criteria.initiatedAtFrom) {
        query.initiatedAt.$gte = criteria.initiatedAtFrom;
      }
      if (criteria.initiatedAtTo) {
        query.initiatedAt.$lte = criteria.initiatedAtTo;
      }
    }

    if (criteria.acceptedAtFrom || criteria.acceptedAtTo) {
      query.acceptedAt = {};
      if (criteria.acceptedAtFrom) {
        query.acceptedAt.$gte = criteria.acceptedAtFrom;
      }
      if (criteria.acceptedAtTo) {
        query.acceptedAt.$lte = criteria.acceptedAtTo;
      }
    }

    return query;
  }

  /**
   * 转换为排序条件
   * @param sortBy 排序字段
   * @param sortOrder 排序顺序
   * @returns MongoDB排序条件
   */
  toSortCriteria(sortBy?: string, sortOrder: 'asc' | 'desc' = 'desc'): any {
    if (!sortBy) {
      return { createdAt: -1 }; // 默认按创建时间倒序
    }

    const sortOrderValue = sortOrder === 'asc' ? 1 : -1;
    return { [sortBy]: sortOrderValue };
  }

  /**
   * 转换为分页条件
   * @param page 页码
   * @param size 每页大小
   * @returns MongoDB分页条件
   */
  toPaginationCriteria(
    page: number = 1,
    size: number = 20,
  ): { skip: number; limit: number } {
    const skip = (page - 1) * size;
    return { skip, limit: size };
  }

  /**
   * 转换为聚合管道
   * @param aggregationType 聚合类型
   * @param criteria 查询条件
   * @returns MongoDB聚合管道
   */
  toAggregationPipeline(aggregationType: string, criteria?: any): any[] {
    const pipeline: any[] = [];

    // 匹配阶段
    if (criteria) {
      const matchStage = this.toQueryCriteria(criteria);
      if (Object.keys(matchStage).length > 0) {
        pipeline.push({ $match: matchStage });
      }
    }

    // 根据聚合类型添加相应的管道阶段
    switch (aggregationType) {
      case 'relationshipTypeDistribution':
        pipeline.push(
          {
            $group: {
              _id: '$relationshipType',
              count: { $sum: 1 },
              acceptedCount: {
                $sum: { $cond: [{ $eq: ['$status', 'ACCEPTED'] }, 1, 0] },
              },
              pendingCount: {
                $sum: { $cond: [{ $eq: ['$status', 'PENDING'] }, 1, 0] },
              },
            },
          },
          { $sort: { count: -1 } },
        );
        break;

      case 'statusDistribution':
        pipeline.push(
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1 } },
        );
        break;

      case 'userRelationshipCount':
        pipeline.push(
          {
            $group: {
              _id: {
                $cond: [
                  { $eq: ['$sourceUserId', criteria.userId] },
                  '$targetUserId',
                  '$sourceUserId',
                ],
              },
              relationshipCount: { $sum: 1 },
            },
          },
          { $sort: { relationshipCount: -1 } },
        );
        break;

      case 'relationshipTimeline':
        pipeline.push(
          {
            $group: {
              _id: {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' },
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { '_id.year': 1, '_id.month': 1 } },
        );
        break;

      default:
        // 默认聚合管道
        pipeline.push({
          $group: {
            _id: null,
            totalCount: { $sum: 1 },
          },
        });
    }

    return pipeline;
  }
}
