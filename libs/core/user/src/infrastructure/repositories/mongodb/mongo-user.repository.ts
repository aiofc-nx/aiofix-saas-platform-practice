/**
 * @class MongoUserRepository
 * @description
 * MongoDB用户仓储实现，基于MikroORM，负责查询端的用户数据快速访问。
 *
 * 原理与机制：
 * 1. 实现UserRepository接口，提供用户实体的查询操作
 * 2. 使用MikroORM的EntityManager，支持复杂的查询和聚合操作
 * 3. 通过事件投影机制保持与命令端数据的一致性
 * 4. 优化查询性能，支持索引和分页
 * 5. 专门用于读模型的快速访问
 *
 * 功能与职责：
 * 1. 用户数据的快速查询操作
 * 2. 复杂查询和聚合支持
 * 3. 查询性能优化
 * 4. 读模型数据管理
 * 5. 事件投影支持
 *
 * @example
 * ```typescript
 * const repository = new MongoUserRepository(em, mapper);
 * const users = await repository.findByTenant('tenant-123');
 * ```
 * @since 1.0.0
 */

import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import {
  UserRepository,
  UserQueryCriteria,
} from '../../../domain/repositories/user.repository';
import { UserEntity } from '../../../domain/entities/user.entity';
import { UserDocument } from '../../entities/mongodb/user.document';
import { MongoUserMapper } from '../../mappers/mongodb/user.mapper';
import { PaginatedResult } from '@aiofix/shared';
import { UserId, TenantId, Username, Email } from '@aiofix/shared';
import { PinoLoggerService, LogContext } from '@aiofix/logging';

/**
 * MongoDB用户仓储实现
 */
@Injectable()
export class MongoUserRepository implements UserRepository {
  private readonly logger: PinoLoggerService;

  constructor(
    private readonly em: EntityManager,
    private readonly mapper: MongoUserMapper,
    logger: PinoLoggerService,
  ) {
    this.logger = logger;
  }

  /**
   * 根据ID查找用户
   * @param id 用户ID
   * @returns 用户实体或null
   */
  async findById(id: UserId): Promise<UserEntity | null> {
    try {
      this.logger.debug('根据ID查找用户', LogContext.DATABASE, {
        userId: id.toString(),
      });

      const userDoc = await this.em.findOne(UserDocument, {
        id: id.toString(),
      });
      if (!userDoc) {
        return null;
      }
      return this.mapper.toDomainEntity(userDoc);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to find user by id: ${id.toString()}`,
        LogContext.DATABASE,
        {
          userId: id.toString(),
          error: errorMessage,
        },
      );
      throw error;
    }
  }

  /**
   * 根据用户名查找用户
   * @param username 用户名
   * @param tenantId 租户ID
   * @returns 用户实体或null
   */
  async findByUsername(
    username: Username,
    tenantId: TenantId,
  ): Promise<UserEntity | null> {
    try {
      this.logger.debug('根据用户名查找用户', LogContext.DATABASE, {
        username: username.toString(),
        tenantId: tenantId.toString(),
      });

      const userDoc = await this.em.findOne(UserDocument, {
        username: username.toString(),
        tenantId: tenantId.toString(),
      });
      if (!userDoc) {
        return null;
      }
      return this.mapper.toDomainEntity(userDoc);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to find user by username: ${username.toString()}`,
        LogContext.DATABASE,
        {
          username: username.toString(),
          tenantId: tenantId.toString(),
          error: errorMessage,
        },
      );
      throw error;
    }
  }

  /**
   * 根据邮箱查找用户
   * @param email 邮箱
   * @param tenantId 租户ID
   * @returns 用户实体或null
   */
  async findByEmail(
    email: Email,
    tenantId: TenantId,
  ): Promise<UserEntity | null> {
    try {
      this.logger.debug('根据邮箱查找用户', LogContext.DATABASE, {
        email: email.toString(),
        tenantId: tenantId.toString(),
      });

      const userDoc = await this.em.findOne(UserDocument, {
        email: email.toString(),
        tenantId: tenantId.toString(),
      });
      if (!userDoc) {
        return null;
      }
      return this.mapper.toDomainEntity(userDoc);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to find user by email: ${email.toString()}`,
        LogContext.DATABASE,
        {
          email: email.toString(),
          tenantId: tenantId.toString(),
          error: errorMessage,
        },
      );
      throw error;
    }
  }

  /**
   * 根据租户ID查找用户
   * @param tenantId 租户ID
   * @param limit 限制数量
   * @param offset 偏移量
   * @returns 用户实体数组
   */
  async findByTenantId(
    tenantId: TenantId,
    limit?: number,
    offset?: number,
  ): Promise<UserEntity[]> {
    try {
      this.logger.debug('根据租户ID查找用户', LogContext.DATABASE, {
        tenantId: tenantId.toString(),
        limit,
        offset,
      });

      const options: any = {};
      if (limit) options.limit = limit;
      if (offset) options.offset = offset;

      const users = await this.em.find(
        UserDocument,
        { tenantId: tenantId.toString() },
        {
          orderBy: { createdAt: 'DESC' },
          ...options,
        },
      );

      return users.map(user => this.mapper.toDomainEntity(user));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to find users by tenant: ${tenantId.toString()}`,
        LogContext.DATABASE,
        {
          tenantId: tenantId.toString(),
          error: errorMessage,
        },
      );
      throw error;
    }
  }

  /**
   * 根据组织ID查找用户
   * @param organizationId 组织ID
   * @param tenantId 租户ID
   * @param limit 限制数量
   * @param offset 偏移量
   * @returns 用户实体数组
   */
  async findByOrganizationId(
    organizationId: string,
    tenantId: TenantId,
    limit?: number,
    offset?: number,
  ): Promise<UserEntity[]> {
    try {
      this.logger.debug('根据组织ID查找用户', LogContext.DATABASE, {
        organizationId,
        tenantId: tenantId.toString(),
        limit,
        offset,
      });

      const options: any = {};
      if (limit) options.limit = limit;
      if (offset) options.offset = offset;

      const users = await this.em.find(
        UserDocument,
        {
          organizationId,
          tenantId: tenantId.toString(),
        },
        {
          orderBy: { createdAt: 'DESC' },
          ...options,
        },
      );

      return users.map(user => this.mapper.toDomainEntity(user));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to find users by organization: ${organizationId}`,
        LogContext.DATABASE,
        {
          organizationId,
          tenantId: tenantId.toString(),
          error: errorMessage,
        },
      );
      throw error;
    }
  }

  /**
   * 根据部门ID查找用户
   * @param departmentId 部门ID
   * @param tenantId 租户ID
   * @param limit 限制数量
   * @param offset 偏移量
   * @returns 用户实体数组
   */
  async findByDepartmentId(
    departmentId: string,
    tenantId: TenantId,
    limit?: number,
    offset?: number,
  ): Promise<UserEntity[]> {
    try {
      const options: any = {};
      if (limit) options.limit = limit;
      if (offset) options.offset = offset;

      const users = await this.em.find(
        UserDocument,
        {
          departmentIds: departmentId,
          tenantId: tenantId.toString(),
        },
        {
          orderBy: { createdAt: 'DESC' },
          ...options,
        },
      );

      return users.map(user => this.mapper.toDomainEntity(user));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to find users by department: ${departmentId}`,
        LogContext.DATABASE,
        {
          departmentId,
          tenantId: tenantId.toString(),
          error: errorMessage,
        },
      );
      throw error;
    }
  }

  /**
   * 根据条件查询用户
   * @param criteria 查询条件
   * @returns 用户实体数组
   */
  async findByCriteria(criteria: UserQueryCriteria): Promise<UserEntity[]> {
    try {
      const query: Record<string, any> = {};

      // 构建查询条件
      if (criteria.tenantId) {
        query.tenantId = criteria.tenantId.toString();
      }

      if (criteria.organizationId) {
        query.organizationId = criteria.organizationId;
      }

      if (criteria.departmentIds && criteria.departmentIds.length > 0) {
        query.departmentIds = { $in: criteria.departmentIds };
      }

      if (criteria.status) {
        query.status = criteria.status;
      }

      if (criteria.userType) {
        query.userType = criteria.userType;
      }

      const users = await this.em.find(UserDocument, query, {
        orderBy: { createdAt: 'DESC' },
        limit: criteria.limit,
        offset: criteria.offset,
      });

      return users.map(user => this.mapper.toDomainEntity(user));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        'Failed to find users by criteria',
        LogContext.DATABASE,
        {
          criteria,
          error: errorMessage,
        },
      );
      throw error;
    }
  }

  /**
   * 搜索用户
   * @param searchTerm 搜索词
   * @param tenantId 租户ID
   * @param page 页码
   * @param size 每页大小
   * @returns 分页结果
   */
  async searchUsers(
    searchTerm: string,
    tenantId?: string,
    page: number = 1,
    size: number = 20,
  ): Promise<PaginatedResult<UserEntity>> {
    try {
      const skip = (page - 1) * size;

      const searchQuery: Record<string, any> = {
        $or: [
          { username: { $regex: searchTerm, $options: 'i' } },
          { email: { $regex: searchTerm, $options: 'i' } },
        ],
      };

      if (tenantId) {
        searchQuery.tenantId = tenantId;
      }

      const [users, total] = await Promise.all([
        this.em.find(UserDocument, searchQuery, {
          orderBy: { createdAt: 'DESC' },
          limit: size,
          offset: skip,
        }),
        this.em.count(UserDocument, searchQuery),
      ]);

      const domainUsers = users.map(user => this.mapper.toDomainEntity(user));

      return {
        data: domainUsers,
        total,
        page,
        size,
        totalPages: Math.ceil(total / size),
        hasNext: page < Math.ceil(total / size),
        hasPrev: page > 1,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to search users: ${searchTerm}`,
        LogContext.DATABASE,
        {
          searchTerm,
          tenantId,
          page,
          size,
          error: errorMessage,
        },
      );
      throw error;
    }
  }

  /**
   * 统计用户数量
   * @param criteria 查询条件
   * @returns 用户数量
   */
  async count(criteria?: UserQueryCriteria): Promise<number> {
    try {
      if (!criteria) {
        return await this.em.count(UserDocument);
      }

      const query: Record<string, any> = {};

      if (criteria.tenantId) {
        query.tenantId = criteria.tenantId.toString();
      }

      if (criteria.organizationId) {
        query.organizationId = criteria.organizationId;
      }

      if (criteria.departmentIds && criteria.departmentIds.length > 0) {
        query.departmentIds = { $in: criteria.departmentIds };
      }

      if (criteria.status) {
        query.status = criteria.status;
      }

      if (criteria.userType) {
        query.userType = criteria.userType;
      }

      return await this.em.count(UserDocument, query);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error('Failed to count users', LogContext.DATABASE, {
        criteria,
        error: errorMessage,
      });
      throw error;
    }
  }

  /**
   * 检查用户名是否存在
   * @param username 用户名
   * @param tenantId 租户ID
   * @returns 是否存在
   */
  async existsByUsername(
    username: Username,
    tenantId: TenantId,
  ): Promise<boolean> {
    try {
      const count = await this.em.count(UserDocument, {
        username: username.toString(),
        tenantId: tenantId.toString(),
      });
      return count > 0;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to check username existence: ${username.toString()}`,
        LogContext.DATABASE,
        {
          username: username.toString(),
          tenantId: tenantId.toString(),
          error: errorMessage,
        },
      );
      throw error;
    }
  }

  /**
   * 检查邮箱是否存在
   * @param email 邮箱
   * @param tenantId 租户ID
   * @returns 是否存在
   */
  async existsByEmail(email: Email, tenantId: TenantId): Promise<boolean> {
    try {
      const count = await this.em.count(UserDocument, {
        email: email.toString(),
        tenantId: tenantId.toString(),
      });
      return count > 0;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to check email existence: ${email.toString()}`,
        LogContext.DATABASE,
        {
          email: email.toString(),
          tenantId: tenantId.toString(),
          error: errorMessage,
        },
      );
      throw error;
    }
  }

  /**
   * 获取活跃用户数量
   * @param tenantId 租户ID
   * @returns 活跃用户数量
   */
  async getActiveUserCount(tenantId?: string): Promise<number> {
    try {
      const query: Record<string, any> = { status: 'ACTIVE' };
      if (tenantId) {
        query.tenantId = tenantId;
      }
      return await this.em.count(UserDocument, query);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        'Failed to get active user count',
        LogContext.DATABASE,
        {
          tenantId,
          error: errorMessage,
        },
      );
      throw error;
    }
  }

  /**
   * 获取用户统计信息
   * @param tenantId 租户ID
   * @returns 用户统计信息
   */
  async getUserStatistics(tenantId?: string): Promise<any> {
    try {
      const matchStage: Record<string, any> = {};
      if (tenantId) {
        matchStage.tenantId = tenantId;
      }

      // 使用简单的查询替代聚合查询
      const totalUsers = await this.em.count(UserDocument, matchStage);
      const activeUsers = await this.em.count(UserDocument, {
        ...matchStage,
        status: 'ACTIVE',
      });
      const inactiveUsers = await this.em.count(UserDocument, {
        ...matchStage,
        status: 'INACTIVE',
      });
      const suspendedUsers = await this.em.count(UserDocument, {
        ...matchStage,
        status: 'SUSPENDED',
      });
      const platformUsers = await this.em.count(UserDocument, {
        ...matchStage,
        userType: 'PLATFORM',
      });
      const tenantUsers = await this.em.count(UserDocument, {
        ...matchStage,
        userType: 'TENANT',
      });

      return {
        totalUsers,
        activeUsers,
        inactiveUsers,
        suspendedUsers,
        platformUsers,
        tenantUsers,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error('Failed to get user statistics', LogContext.DATABASE, {
        tenantId,
        error: errorMessage,
      });
      throw error;
    }
  }

  /**
   * 根据条件统计用户数量
   * @param criteria 查询条件
   * @returns 用户数量
   */
  async countByCriteria(criteria: UserQueryCriteria): Promise<number> {
    try {
      const query: Record<string, any> = {};

      if (criteria.tenantId) {
        query.tenantId = criteria.tenantId.toString();
      }

      if (criteria.organizationId) {
        query.organizationId = criteria.organizationId;
      }

      if (criteria.departmentIds && criteria.departmentIds.length > 0) {
        query.departmentIds = { $in: criteria.departmentIds };
      }

      if (criteria.status) {
        query.status = criteria.status;
      }

      if (criteria.userType) {
        query.userType = criteria.userType;
      }

      return await this.em.count(UserDocument, query);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        'Failed to count users by criteria',
        LogContext.DATABASE,
        {
          criteria,
          error: errorMessage,
        },
      );
      throw error;
    }
  }

  /**
   * 根据租户统计用户数量
   * @param tenantId 租户ID
   * @returns 用户数量
   */
  async countByTenantId(tenantId: TenantId): Promise<number> {
    try {
      return await this.em.count(UserDocument, {
        tenantId: tenantId.toString(),
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to count users by tenantId: ${tenantId.toString()}`,
        LogContext.DATABASE,
        {
          tenantId: tenantId.toString(),
          error: errorMessage,
        },
      );
      throw error;
    }
  }

  // 以下方法在MongoDB查询端仓储中通常不需要实现，因为它们是写操作
  // 但为了接口兼容性，我们提供空实现

  /**
   * 保存用户（MongoDB查询端通常不需要实现）
   */
  async save(user: UserEntity): Promise<UserEntity> {
    try {
      this.logger.debug('保存用户', LogContext.DATABASE, {
        userId: user.id.toString(),
      });

      const userDoc = this.mapper.toDocument(user);
      await this.em.persistAndFlush(userDoc);

      this.logger.debug('用户保存成功', LogContext.DATABASE, {
        userId: user.id.toString(),
      });
      return user;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error('保存用户失败', LogContext.DATABASE, {
        userId: user.id.toString(),
        error: errorMessage,
      });
      throw error;
    }
  }

  /**
   * 删除用户（MongoDB查询端通常不需要实现）
   */
  async delete(_id: UserId): Promise<boolean> {
    throw new Error(
      'Delete operation not supported in MongoDB query repository',
    );
  }

  /**
   * 批量保存用户（MongoDB查询端通常不需要实现）
   */
  async saveMany(_users: UserEntity[]): Promise<UserEntity[]> {
    throw new Error(
      'SaveMany operation not supported in MongoDB query repository',
    );
  }
}
