/**
 * @class PostgresUserRelationshipRepository
 * @description
 * PostgreSQL用户关系仓储实现，负责用户关系实体的数据持久化操作。
 *
 * 原理与机制：
 * 1. 实现UserRelationshipRepository接口，提供用户关系实体的CRUD操作
 * 2. 使用MikroORM进行对象关系映射，简化数据库操作
 * 3. 实现连接池管理，提高数据库访问性能
 * 4. 使用事务确保数据一致性
 * 5. 支持多租户数据隔离和查询
 *
 * 功能与职责：
 * 1. 用户关系数据的增删改查操作
 * 2. 数据库连接管理和事务处理
 * 3. 查询优化和性能监控
 * 4. 数据迁移和版本管理
 * 5. 多租户数据隔离支持
 *
 * @example
 * ```typescript
 * const repository = new PostgresUserRelationshipRepository(em);
 * const relationships = await repository.findByUserId('user-123');
 * ```
 * @since 1.0.0
 */

import { Injectable, Logger } from '@nestjs/common';
import { EntityManager, FilterQuery } from '@mikro-orm/core';
import { UserRelationshipRepository } from '../../../domain/repositories/user-relationship.repository';
import { UserRelationshipEntity } from '../../../domain/entities/user-relationship.entity';
import { UserRelationshipOrmEntity } from '../../entities/postgresql/user-relationship.orm-entity';
import { UserRelationshipMapper } from '../../mappers/postgresql/user-relationship.mapper';
import { UserRelationshipQueryCriteria } from '../../../domain/repositories/user-relationship.repository';
import { PaginatedResult } from '@aiofix/shared';

/**
 * PostgreSQL用户关系仓储实现
 */
@Injectable()
export class PostgresUserRelationshipRepository
  implements UserRelationshipRepository
{
  private readonly logger = new Logger(PostgresUserRelationshipRepository.name);

  constructor(
    private readonly em: EntityManager,
    private readonly mapper: UserRelationshipMapper,
  ) {}

  /**
   * 根据ID查找用户关系
   * @param id 关系ID
   * @returns 用户关系实体或null
   */
  async findById(id: string): Promise<UserRelationshipEntity | null> {
    try {
      const relationshipOrm = await this.em.findOne(UserRelationshipOrmEntity, {
        id,
      });
      if (!relationshipOrm) {
        return null;
      }
      return this.mapper.toDomainEntity(relationshipOrm);
    } catch (error) {
      this.logger.error(`Failed to find user relationship by id: ${id}`, error);
      throw error;
    }
  }

  /**
   * 根据用户ID查找用户关系
   * @param userId 用户ID
   * @returns 用户关系实体数组
   */
  async findByUserId(userId: string): Promise<UserRelationshipEntity[]> {
    try {
      const relationshipOrms = await this.em.find(UserRelationshipOrmEntity, {
        $or: [{ sourceUserId: userId }, { targetUserId: userId }],
      });
      return relationshipOrms.map(relationship =>
        this.mapper.toDomainEntity(relationship),
      );
    } catch (error) {
      this.logger.error(
        `Failed to find user relationships by userId: ${userId}`,
        error,
      );
      throw error;
    }
  }

  /**
   * 根据源用户ID查找用户关系
   * @param sourceUserId 源用户ID
   * @returns 用户关系实体数组
   */
  async findBySourceUserId(
    sourceUserId: string,
  ): Promise<UserRelationshipEntity[]> {
    try {
      const relationshipOrms = await this.em.find(UserRelationshipOrmEntity, {
        sourceUserId,
      });
      return relationshipOrms.map(relationship =>
        this.mapper.toDomainEntity(relationship),
      );
    } catch (error) {
      this.logger.error(
        `Failed to find user relationships by sourceUserId: ${sourceUserId}`,
        error,
      );
      throw error;
    }
  }

  /**
   * 根据目标用户ID查找用户关系
   * @param targetUserId 目标用户ID
   * @returns 用户关系实体数组
   */
  async findByTargetUserId(
    targetUserId: string,
  ): Promise<UserRelationshipEntity[]> {
    try {
      const relationshipOrms = await this.em.find(UserRelationshipOrmEntity, {
        targetUserId,
      });
      return relationshipOrms.map(relationship =>
        this.mapper.toDomainEntity(relationship),
      );
    } catch (error) {
      this.logger.error(
        `Failed to find user relationships by targetUserId: ${targetUserId}`,
        error,
      );
      throw error;
    }
  }

  /**
   * 保存用户关系
   * @param relationship 用户关系实体
   * @returns 保存后的用户关系实体
   */
  async save(
    relationship: UserRelationshipEntity,
  ): Promise<UserRelationshipEntity> {
    try {
      const relationshipOrm = this.mapper.toOrmEntity(relationship);

      if (relationshipOrm.id) {
        // 更新现有关系
        await this.em.nativeUpdate(
          UserRelationshipOrmEntity,
          { id: relationshipOrm.id },
          relationshipOrm,
        );
      } else {
        // 创建新关系
        await this.em.persistAndFlush(relationshipOrm);
        relationship.id = relationshipOrm.id;
      }

      return relationship;
    } catch (error) {
      this.logger.error(
        `Failed to save user relationship: ${relationship.id}`,
        error,
      );
      throw error;
    }
  }

  /**
   * 删除用户关系
   * @param id 关系ID
   * @returns 是否删除成功
   */
  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.em.nativeDelete(UserRelationshipOrmEntity, {
        id,
      });
      return result > 0;
    } catch (error) {
      this.logger.error(`Failed to delete user relationship: ${id}`, error);
      throw error;
    }
  }

  /**
   * 根据条件查询用户关系
   * @param criteria 查询条件
   * @param page 页码
   * @param size 每页大小
   * @returns 分页结果
   */
  async findByCriteria(
    criteria: UserRelationshipQueryCriteria,
    page: number = 1,
    size: number = 20,
  ): Promise<PaginatedResult<UserRelationshipEntity>> {
    try {
      const where: FilterQuery<UserRelationshipOrmEntity> = {};

      // 构建查询条件
      if (criteria.sourceUserId) {
        where.sourceUserId = criteria.sourceUserId;
      }

      if (criteria.targetUserId) {
        where.targetUserId = criteria.targetUserId;
      }

      if (criteria.relationshipType) {
        where.relationshipType = criteria.relationshipType;
      }

      if (criteria.status) {
        where.status = criteria.status;
      }

      if (criteria.tenantId) {
        where.tenantId = criteria.tenantId;
      }

      // 分页查询
      const [relationships, total] = await this.em.findAndCount(
        UserRelationshipOrmEntity,
        where,
        {
          limit: size,
          offset: (page - 1) * size,
          orderBy: { createdAt: 'DESC' },
        },
      );

      // 转换为领域实体
      const domainRelationships = relationships.map(relationship =>
        this.mapper.toDomainEntity(relationship),
      );

      return {
        data: domainRelationships,
        total,
        page,
        size,
        totalPages: Math.ceil(total / size),
      };
    } catch (error) {
      this.logger.error('Failed to find user relationships by criteria', error);
      throw error;
    }
  }

  /**
   * 批量保存用户关系
   * @param relationships 用户关系实体数组
   * @returns 保存后的用户关系实体数组
   */
  async saveMany(
    relationships: UserRelationshipEntity[],
  ): Promise<UserRelationshipEntity[]> {
    try {
      const relationshipOrms = relationships.map(relationship =>
        this.mapper.toOrmEntity(relationship),
      );

      await this.em.persistAndFlush(relationshipOrms);

      // 更新ID
      relationships.forEach((relationship, index) => {
        if (!relationship.id) {
          relationship.id = relationshipOrms[index].id;
        }
      });

      return relationships;
    } catch (error) {
      this.logger.error('Failed to save many user relationships', error);
      throw error;
    }
  }

  /**
   * 检查用户关系是否存在
   * @param sourceUserId 源用户ID
   * @param targetUserId 目标用户ID
   * @param relationshipType 关系类型
   * @returns 是否存在
   */
  async exists(
    sourceUserId: string,
    targetUserId: string,
    relationshipType: string,
  ): Promise<boolean> {
    try {
      const count = await this.em.count(UserRelationshipOrmEntity, {
        sourceUserId,
        targetUserId,
        relationshipType,
      });
      return count > 0;
    } catch (error) {
      this.logger.error(
        `Failed to check user relationship existence: ${sourceUserId} -> ${targetUserId}`,
        error,
      );
      throw error;
    }
  }

  /**
   * 统计用户关系数量
   * @param criteria 查询条件
   * @returns 关系数量
   */
  async count(criteria?: UserRelationshipQueryCriteria): Promise<number> {
    try {
      const where: FilterQuery<UserRelationshipOrmEntity> = {};

      if (criteria) {
        if (criteria.sourceUserId) {
          where.sourceUserId = criteria.sourceUserId;
        }
        if (criteria.targetUserId) {
          where.targetUserId = criteria.targetUserId;
        }
        if (criteria.relationshipType) {
          where.relationshipType = criteria.relationshipType;
        }
        if (criteria.status) {
          where.status = criteria.status;
        }
        if (criteria.tenantId) {
          where.tenantId = criteria.tenantId;
        }
      }

      return await this.em.count(UserRelationshipOrmEntity, where);
    } catch (error) {
      this.logger.error('Failed to count user relationships', error);
      throw error;
    }
  }

  /**
   * 删除用户的所有关系
   * @param userId 用户ID
   * @returns 删除的关系数量
   */
  async deleteByUserId(userId: string): Promise<number> {
    try {
      const result = await this.em.nativeDelete(UserRelationshipOrmEntity, {
        $or: [{ sourceUserId: userId }, { targetUserId: userId }],
      });
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to delete user relationships by userId: ${userId}`,
        error,
      );
      throw error;
    }
  }
}
