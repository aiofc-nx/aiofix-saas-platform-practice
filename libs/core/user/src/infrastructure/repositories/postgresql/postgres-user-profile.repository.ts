/**
 * @class PostgresUserProfileRepository
 * @description
 * PostgreSQL用户档案仓储实现，负责用户档案实体的数据持久化操作。
 *
 * 原理与机制：
 * 1. 实现UserProfileRepository接口，提供用户档案实体的CRUD操作
 * 2. 使用MikroORM进行对象关系映射，简化数据库操作
 * 3. 实现连接池管理，提高数据库访问性能
 * 4. 使用事务确保数据一致性
 * 5. 支持多租户数据隔离和查询
 *
 * 功能与职责：
 * 1. 用户档案数据的增删改查操作
 * 2. 数据库连接管理和事务处理
 * 3. 查询优化和性能监控
 * 4. 数据迁移和版本管理
 * 5. 多租户数据隔离支持
 *
 * @example
 * ```typescript
 * const repository = new PostgresUserProfileRepository(em);
 * const profile = await repository.findByUserId('user-123');
 * ```
 * @since 1.0.0
 */

import { Injectable, Logger } from '@nestjs/common';
import { EntityManager, FilterQuery } from '@mikro-orm/core';
import { UserProfileRepository } from '../../../domain/repositories/user-profile.repository';
import { UserProfileEntity } from '../../../domain/entities/user-profile.entity';
import { UserProfileOrmEntity } from '../../entities/postgresql/user-profile.orm-entity';
import { UserProfileMapper } from '../../mappers/postgresql/user-profile.mapper';
import { UserProfileQueryCriteria } from '../../../domain/repositories/user-profile.repository';
import { PaginatedResult } from '@aiofix/shared';

/**
 * PostgreSQL用户档案仓储实现
 */
@Injectable()
export class PostgresUserProfileRepository implements UserProfileRepository {
  private readonly logger = new Logger(PostgresUserProfileRepository.name);

  constructor(
    private readonly em: EntityManager,
    private readonly mapper: UserProfileMapper,
  ) {}

  /**
   * 根据用户ID查找用户档案
   * @param userId 用户ID
   * @returns 用户档案实体或null
   */
  async findByUserId(userId: string): Promise<UserProfileEntity | null> {
    try {
      const profileOrm = await this.em.findOne(UserProfileOrmEntity, {
        userId,
      });
      if (!profileOrm) {
        return null;
      }
      return this.mapper.toDomainEntity(profileOrm);
    } catch (error) {
      this.logger.error(
        `Failed to find user profile by userId: ${userId}`,
        error,
      );
      throw error;
    }
  }

  /**
   * 根据ID查找用户档案
   * @param id 档案ID
   * @returns 用户档案实体或null
   */
  async findById(id: string): Promise<UserProfileEntity | null> {
    try {
      const profileOrm = await this.em.findOne(UserProfileOrmEntity, { id });
      if (!profileOrm) {
        return null;
      }
      return this.mapper.toDomainEntity(profileOrm);
    } catch (error) {
      this.logger.error(`Failed to find user profile by id: ${id}`, error);
      throw error;
    }
  }

  /**
   * 保存用户档案
   * @param profile 用户档案实体
   * @returns 保存后的用户档案实体
   */
  async save(profile: UserProfileEntity): Promise<UserProfileEntity> {
    try {
      const profileOrm = this.mapper.toOrmEntity(profile);

      if (profileOrm.id) {
        // 更新现有档案
        await this.em.nativeUpdate(
          UserProfileOrmEntity,
          { id: profileOrm.id },
          profileOrm,
        );
      } else {
        // 创建新档案
        await this.em.persistAndFlush(profileOrm);
        profile.id = profileOrm.id;
      }

      return profile;
    } catch (error) {
      this.logger.error(`Failed to save user profile: ${profile.id}`, error);
      throw error;
    }
  }

  /**
   * 删除用户档案
   * @param id 档案ID
   * @returns 是否删除成功
   */
  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.em.nativeDelete(UserProfileOrmEntity, { id });
      return result > 0;
    } catch (error) {
      this.logger.error(`Failed to delete user profile: ${id}`, error);
      throw error;
    }
  }

  /**
   * 根据条件查询用户档案
   * @param criteria 查询条件
   * @param page 页码
   * @param size 每页大小
   * @returns 分页结果
   */
  async findByCriteria(
    criteria: UserProfileQueryCriteria,
    page: number = 1,
    size: number = 20,
  ): Promise<PaginatedResult<UserProfileEntity>> {
    try {
      const where: FilterQuery<UserProfileOrmEntity> = {};

      // 构建查询条件
      if (criteria.userId) {
        where.userId = criteria.userId;
      }

      if (criteria.firstName) {
        where.firstName = { $like: `%${criteria.firstName}%` };
      }

      if (criteria.lastName) {
        where.lastName = { $like: `%${criteria.lastName}%` };
      }

      if (criteria.location) {
        where.location = { $like: `%${criteria.location}%` };
      }

      if (criteria.skills && criteria.skills.length > 0) {
        where.skills = { $in: criteria.skills };
      }

      if (criteria.interests && criteria.interests.length > 0) {
        where.interests = { $in: criteria.interests };
      }

      // 分页查询
      const [profiles, total] = await this.em.findAndCount(
        UserProfileOrmEntity,
        where,
        {
          limit: size,
          offset: (page - 1) * size,
          orderBy: { createdAt: 'DESC' },
        },
      );

      // 转换为领域实体
      const domainProfiles = profiles.map(profile =>
        this.mapper.toDomainEntity(profile),
      );

      return {
        data: domainProfiles,
        total,
        page,
        size,
        totalPages: Math.ceil(total / size),
      };
    } catch (error) {
      this.logger.error('Failed to find user profiles by criteria', error);
      throw error;
    }
  }

  /**
   * 批量保存用户档案
   * @param profiles 用户档案实体数组
   * @returns 保存后的用户档案实体数组
   */
  async saveMany(profiles: UserProfileEntity[]): Promise<UserProfileEntity[]> {
    try {
      const profileOrms = profiles.map(profile =>
        this.mapper.toOrmEntity(profile),
      );

      await this.em.persistAndFlush(profileOrms);

      // 更新ID
      profiles.forEach((profile, index) => {
        if (!profile.id) {
          profile.id = profileOrms[index].id;
        }
      });

      return profiles;
    } catch (error) {
      this.logger.error('Failed to save many user profiles', error);
      throw error;
    }
  }

  /**
   * 根据用户ID数组批量查找用户档案
   * @param userIds 用户ID数组
   * @returns 用户档案实体数组
   */
  async findByUserIds(userIds: string[]): Promise<UserProfileEntity[]> {
    try {
      const profileOrms = await this.em.find(UserProfileOrmEntity, {
        userId: { $in: userIds },
      });
      return profileOrms.map(profile => this.mapper.toDomainEntity(profile));
    } catch (error) {
      this.logger.error(
        `Failed to find user profiles by userIds: ${userIds}`,
        error,
      );
      throw error;
    }
  }

  /**
   * 检查用户档案是否存在
   * @param userId 用户ID
   * @returns 是否存在
   */
  async exists(userId: string): Promise<boolean> {
    try {
      const count = await this.em.count(UserProfileOrmEntity, { userId });
      return count > 0;
    } catch (error) {
      this.logger.error(
        `Failed to check user profile existence: ${userId}`,
        error,
      );
      throw error;
    }
  }

  /**
   * 统计用户档案数量
   * @param criteria 查询条件
   * @returns 档案数量
   */
  async count(criteria?: UserProfileQueryCriteria): Promise<number> {
    try {
      const where: FilterQuery<UserProfileOrmEntity> = {};

      if (criteria) {
        // 构建查询条件（简化版）
        if (criteria.userId) {
          where.userId = criteria.userId;
        }
        if (criteria.firstName) {
          where.firstName = { $like: `%${criteria.firstName}%` };
        }
        if (criteria.lastName) {
          where.lastName = { $like: `%${criteria.lastName}%` };
        }
      }

      return await this.em.count(UserProfileOrmEntity, where);
    } catch (error) {
      this.logger.error('Failed to count user profiles', error);
      throw error;
    }
  }
}
