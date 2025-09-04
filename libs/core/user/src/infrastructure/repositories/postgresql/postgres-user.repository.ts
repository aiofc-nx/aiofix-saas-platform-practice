/**
 * @description PostgreSQL用户仓储实现
 * @author 江郎
 * @since 2.1.0
 */

import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { PostgresUserMapper } from '../../mappers/postgresql/user.mapper';
import { UserEntity } from '../../../domain/entities/user.entity';
import { UserId, Username, Email, TenantId } from '@aiofix/shared';
import { UserType } from '../../../domain/enums/user-type.enum';
import { UserStatus } from '../../../domain/enums/user-status.enum';
import { UserQueryCriteria } from '../../../domain/repositories/user.repository';
import { UserOrmEntity } from '../../entities/postgresql/user.orm-entity';
import { PinoLoggerService } from '@aiofix/logging';
import { LogContext } from '@aiofix/logging';

@Injectable()
export class PostgresUserRepository implements UserRepository {
  constructor(
    private readonly em: EntityManager,
    private readonly mapper: PostgresUserMapper,
    private readonly logger: PinoLoggerService,
  ) {}

  /**
   * 根据ID查找用户
   */
  async findById(id: UserId): Promise<UserEntity | null> {
    try {
      const ormEntity = await this.em.findOne(UserOrmEntity, {
        id: id.toString(),
      });
      if (!ormEntity) {
        return null;
      }
      return this.mapper.toDomain(ormEntity);
    } catch (error) {
      this.logger.error(
        `Failed to find user by ID: ${id.toString()}`,
        LogContext.INFRASTRUCTURE,
        { userId: id.toString() },
        error as Error,
      );
      throw error;
    }
  }

  /**
   * 根据用户名查找用户
   */
  async findByUsername(
    username: Username,
    tenantId: TenantId,
  ): Promise<UserEntity | null> {
    try {
      const ormEntity = await this.em.findOne(UserOrmEntity, {
        username: username.toString(),
        tenantId: tenantId.toString(),
      });
      if (!ormEntity) {
        return null;
      }
      return this.mapper.toDomain(ormEntity);
    } catch (error) {
      this.logger.error(
        `Failed to find user by username: ${username.toString()}`,
        LogContext.INFRASTRUCTURE,
        { username: username.toString(), tenantId: tenantId.toString() },
        error as Error,
      );
      throw error;
    }
  }

  /**
   * 根据邮箱查找用户
   */
  async findByEmail(
    email: Email,
    tenantId: TenantId,
  ): Promise<UserEntity | null> {
    try {
      const ormEntity = await this.em.findOne(UserOrmEntity, {
        email: email.toString(),
        tenantId: tenantId.toString(),
      });
      if (!ormEntity) {
        return null;
      }
      return this.mapper.toDomain(ormEntity);
    } catch (error) {
      this.logger.error(
        `Failed to find user by email: ${email.toString()}`,
        LogContext.INFRASTRUCTURE,
        { email: email.toString(), tenantId: tenantId.toString() },
        error as Error,
      );
      throw error;
    }
  }

  /**
   * 根据条件查询用户列表
   */
  async findByCriteria(criteria: UserQueryCriteria): Promise<UserEntity[]> {
    try {
      const whereConditions: any = {};

      if (criteria.tenantId) {
        whereConditions.tenantId = criteria.tenantId.toString();
      }

      if (criteria.organizationId) {
        whereConditions.organizationId = criteria.organizationId;
      }

      if (criteria.departmentIds && criteria.departmentIds.length > 0) {
        whereConditions.departmentIds = { $contains: criteria.departmentIds };
      }

      if (criteria.userType) {
        whereConditions.userType = criteria.userType;
      }

      if (criteria.status) {
        whereConditions.status = criteria.status;
      }

      if (criteria.email) {
        whereConditions.email = criteria.email.toString();
      }

      if (criteria.username) {
        whereConditions.username = criteria.username.toString();
      }

      if (criteria.isActive !== undefined) {
        whereConditions.isActive = criteria.isActive;
      }

      if (criteria.createdAfter) {
        whereConditions.createdAt = { $gte: criteria.createdAfter };
      }

      if (criteria.createdBefore) {
        whereConditions.createdAt = {
          ...whereConditions.createdAt,
          $lte: criteria.createdBefore,
        };
      }

      const ormEntities = await this.em.find(UserOrmEntity, whereConditions, {
        limit: criteria.limit || 100,
        offset: criteria.offset || 0,
        orderBy: { createdAt: 'DESC' },
      });

      return ormEntities.map(entity => this.mapper.toDomain(entity));
    } catch (error) {
      this.logger.error(
        'Failed to find users by criteria',
        LogContext.INFRASTRUCTURE,
        { criteria },
        error as Error,
      );
      throw error;
    }
  }

  /**
   * 根据租户ID查找用户列表
   */
  async findByTenantId(
    tenantId: TenantId,
    limit?: number,
    offset?: number,
  ): Promise<UserEntity[]> {
    try {
      const ormEntities = await this.em.find(
        UserOrmEntity,
        { tenantId: tenantId.toString() },
        {
          limit: limit || 100,
          offset: offset || 0,
          orderBy: { createdAt: 'DESC' },
        },
      );

      return ormEntities.map(entity => this.mapper.toDomain(entity));
    } catch (error) {
      this.logger.error(
        `Failed to find users by tenant ID: ${tenantId.toString()}`,
        LogContext.INFRASTRUCTURE,
        { tenantId: tenantId.toString() },
        error as Error,
      );
      throw error;
    }
  }

  /**
   * 根据组织ID查找用户列表
   */
  async findByOrganizationId(
    organizationId: string,
    tenantId: TenantId,
    limit?: number,
    offset?: number,
  ): Promise<UserEntity[]> {
    try {
      const ormEntities = await this.em.find(
        UserOrmEntity,
        {
          organizationId,
          tenantId: tenantId.toString(),
        },
        {
          limit: limit || 100,
          offset: offset || 0,
          orderBy: { createdAt: 'DESC' },
        },
      );

      return ormEntities.map(entity => this.mapper.toDomain(entity));
    } catch (error) {
      this.logger.error(
        `Failed to find users by organization ID: ${organizationId}`,
        LogContext.INFRASTRUCTURE,
        { organizationId, tenantId: tenantId.toString() },
        error as Error,
      );
      throw error;
    }
  }

  /**
   * 根据部门ID查找用户列表
   */
  async findByDepartmentId(
    departmentId: string,
    tenantId: TenantId,
    limit?: number,
    offset?: number,
  ): Promise<UserEntity[]> {
    try {
      const ormEntities = await this.em.find(
        UserOrmEntity,
        {
          departmentIds: { $contains: [departmentId] },
          tenantId: tenantId.toString(),
        },
        {
          limit: limit || 100,
          offset: offset || 0,
          orderBy: { createdAt: 'DESC' },
        },
      );

      return ormEntities.map(entity => this.mapper.toDomain(entity));
    } catch (error) {
      this.logger.error(
        `Failed to find users by department ID: ${departmentId}`,
        LogContext.INFRASTRUCTURE,
        { departmentId, tenantId: tenantId.toString() },
        error as Error,
      );
      throw error;
    }
  }

  /**
   * 保存用户
   */
  async save(user: UserEntity): Promise<UserEntity> {
    try {
      const ormEntity = this.mapper.toOrmEntity(user);

      if (ormEntity.id) {
        // 更新现有用户
        await this.em.nativeUpdate(
          UserOrmEntity,
          { id: ormEntity.id },
          ormEntity,
        );
        const updatedEntity = await this.em.findOne(UserOrmEntity, {
          id: ormEntity.id,
        });
        return this.mapper.toDomain(updatedEntity!);
      } else {
        // 创建新用户
        const newOrmEntity = this.em.create(UserOrmEntity, ormEntity);
        await this.em.persistAndFlush(newOrmEntity);
        return this.mapper.toDomain(newOrmEntity);
      }
    } catch (error) {
      this.logger.error(
        'Failed to save user',
        LogContext.INFRASTRUCTURE,
        { userId: user.id.toString() },
        error as Error,
      );
      throw error;
    }
  }

  /**
   * 批量保存用户
   */
  async saveMany(users: UserEntity[]): Promise<UserEntity[]> {
    try {
      const savedUsers: UserEntity[] = [];

      for (const user of users) {
        const savedUser = await this.save(user);
        savedUsers.push(savedUser);
      }

      return savedUsers;
    } catch (error) {
      this.logger.error(
        'Failed to save multiple users',
        LogContext.INFRASTRUCTURE,
        { userCount: users.length },
        error as Error,
      );
      throw error;
    }
  }

  /**
   * 删除用户
   */
  async delete(id: UserId): Promise<boolean> {
    try {
      const result = await this.em.nativeDelete(UserOrmEntity, {
        id: id.toString(),
      });
      return result > 0;
    } catch (error) {
      this.logger.error(
        `Failed to delete user: ${id.toString()}`,
        LogContext.INFRASTRUCTURE,
        { userId: id.toString() },
        error as Error,
      );
      throw error;
    }
  }

  /**
   * 检查用户名是否存在
   */
  async existsByUsername(
    username: Username,
    tenantId: TenantId,
    excludeUserId?: UserId,
  ): Promise<boolean> {
    try {
      const whereConditions: any = {
        username: username.toString(),
        tenantId: tenantId.toString(),
      };

      if (excludeUserId) {
        whereConditions.id = { $ne: excludeUserId.toString() };
      }

      const count = await this.em.count(UserOrmEntity, whereConditions);
      return count > 0;
    } catch (error) {
      this.logger.error(
        `Failed to check username existence: ${username.toString()}`,
        LogContext.INFRASTRUCTURE,
        { username: username.toString(), tenantId: tenantId.toString() },
        error as Error,
      );
      throw error;
    }
  }

  /**
   * 检查邮箱是否存在
   */
  async existsByEmail(
    email: Email,
    tenantId: TenantId,
    excludeUserId?: UserId,
  ): Promise<boolean> {
    try {
      const whereConditions: any = {
        email: email.toString(),
        tenantId: tenantId.toString(),
      };

      if (excludeUserId) {
        whereConditions.id = { $ne: excludeUserId.toString() };
      }

      const count = await this.em.count(UserOrmEntity, whereConditions);
      return count > 0;
    } catch (error) {
      this.logger.error(
        `Failed to check email existence: ${email.toString()}`,
        LogContext.INFRASTRUCTURE,
        { email: email.toString(), tenantId: tenantId.toString() },
        error as Error,
      );
      throw error;
    }
  }

  /**
   * 根据条件统计用户数量
   */
  async countByCriteria(criteria: UserQueryCriteria): Promise<number> {
    try {
      const whereConditions: any = {};

      if (criteria.tenantId) {
        whereConditions.tenantId = criteria.tenantId.toString();
      }

      if (criteria.organizationId) {
        whereConditions.organizationId = criteria.organizationId;
      }

      if (criteria.departmentIds && criteria.departmentIds.length > 0) {
        whereConditions.departmentIds = { $contains: criteria.departmentIds };
      }

      if (criteria.userType) {
        whereConditions.userType = criteria.userType;
      }

      if (criteria.status) {
        whereConditions.status = criteria.status;
      }

      if (criteria.isActive !== undefined) {
        whereConditions.isActive = criteria.isActive;
      }

      if (criteria.createdAfter) {
        whereConditions.createdAt = { $gte: criteria.createdAfter };
      }

      if (criteria.createdBefore) {
        whereConditions.createdAt = {
          ...whereConditions.createdAt,
          $lte: criteria.createdBefore,
        };
      }

      return await this.em.count(UserOrmEntity, whereConditions);
    } catch (error) {
      this.logger.error(
        'Failed to count users by criteria',
        LogContext.INFRASTRUCTURE,
        { criteria },
        error as Error,
      );
      throw error;
    }
  }

  /**
   * 根据租户统计用户数量
   */
  async countByTenantId(tenantId: TenantId): Promise<number> {
    try {
      return await this.em.count(UserOrmEntity, {
        tenantId: tenantId.toString(),
      });
    } catch (error) {
      this.logger.error(
        `Failed to count users by tenant ID: ${tenantId.toString()}`,
        LogContext.INFRASTRUCTURE,
        { tenantId: tenantId.toString() },
        error as Error,
      );
      throw error;
    }
  }
}
