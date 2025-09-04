/**
 * @class TenantPostgresMapper
 * @description
 * 租户PostgreSQL映射器，负责领域对象与PostgreSQL实体之间的转换。
 *
 * 原理与机制：
 * 1. 实现领域对象与PostgreSQL实体的双向转换
 * 2. 处理数据类型转换和字段映射
 * 3. 确保映射的完整性和一致性
 * 4. 支持PostgreSQL特有的数据类型和约束
 *
 * 功能与职责：
 * 1. 领域对象与PostgreSQL实体的转换
 * 2. 处理PostgreSQL特有的数据类型
 * 3. 确保映射的完整性
 * 4. 支持PostgreSQL的索引和约束
 *
 * @example
 * ```typescript
 * const mapper = new TenantPostgresMapper();
 * const domainEntity = mapper.toDomain(persistenceEntity);
 * const persistenceEntity = mapper.toPersistence(domainEntity);
 * ```
 * @since 1.0.0
 */

import { TenantEntity } from '../../../domain/entities/tenant.entity';
import { TenantOrmEntity } from '../../entities/postgresql/tenant.orm-entity';
import { TenantId, TenantName, TenantCode, TenantDomain } from '@aiofix/shared';
import { TenantType, TenantStatus } from '../../../domain/enums';

/**
 * 租户PostgreSQL映射器类
 * @description 负责租户领域对象与PostgreSQL实体之间的转换
 */
export class TenantPostgresMapper {
  /**
   * PostgreSQL实体转换为领域对象
   * @param persistence PostgreSQL持久化实体
   * @returns 领域实体
   */
  toDomain(persistence: TenantOrmEntity): TenantEntity {
    const entity = new TenantEntity(
      new TenantId(persistence.id),
      new TenantName(persistence.name),
      new TenantCode(persistence.code),
      new TenantDomain(persistence.domain),
      persistence.type as TenantType,
      persistence.status as TenantStatus,
      persistence.description,
      persistence.config,
    );

    // 设置其他属性
    (entity as any)._maxUsers = persistence.maxUsers;
    (entity as any)._maxOrganizations = persistence.maxOrganizations;
    (entity as any)._maxStorageGB = persistence.maxStorageGB;
    (entity as any)._advancedFeaturesEnabled =
      persistence.advancedFeaturesEnabled;
    (entity as any)._customizationEnabled = persistence.customizationEnabled;
    (entity as any)._apiAccessEnabled = persistence.apiAccessEnabled;
    (entity as any)._ssoEnabled = persistence.ssoEnabled;
    (entity as any)._subscriptionExpiresAt = persistence.subscriptionEndDate;
    (entity as any)._createdAt = persistence.createdAt;
    (entity as any)._updatedAt = persistence.updatedAt;

    return entity;
  }

  /**
   * 领域对象转换为PostgreSQL实体
   * @param domain 领域实体
   * @returns PostgreSQL持久化实体
   */
  toPersistence(domain: TenantEntity): TenantOrmEntity {
    const entity = new TenantOrmEntity();
    entity.id = domain.id.toString();
    entity.name = domain.name.toString();
    entity.code = domain.code.toString();
    entity.domain = domain.domain.toString();
    entity.type = domain.type;
    entity.status = domain.status;
    entity.description = domain.description;
    entity.config = domain.config;
    entity.maxUsers = domain.maxUsers;
    entity.maxOrganizations = domain.maxOrganizations;
    entity.maxStorageGB = domain.maxStorageGB;
    entity.advancedFeaturesEnabled = domain.advancedFeaturesEnabled;
    entity.customizationEnabled = domain.customizationEnabled;
    entity.apiAccessEnabled = domain.apiAccessEnabled;
    entity.ssoEnabled = domain.ssoEnabled;
    entity.subscriptionStartDate = undefined; // TenantEntity没有这个属性
    entity.subscriptionEndDate = (domain as any)._subscriptionExpiresAt;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }

  /**
   * PostgreSQL实体转换为DTO
   * @param persistence PostgreSQL持久化实体
   * @returns DTO对象
   */
  toDto(persistence: TenantOrmEntity): any {
    return {
      id: persistence.id,
      name: persistence.name,
      code: persistence.code,
      domain: persistence.domain,
      type: persistence.type,
      status: persistence.status,
      description: persistence.description,
      config: persistence.config,
      maxUsers: persistence.maxUsers,
      maxOrganizations: persistence.maxOrganizations,
      maxStorageGB: persistence.maxStorageGB,
      advancedFeaturesEnabled: persistence.advancedFeaturesEnabled,
      customizationEnabled: persistence.customizationEnabled,
      apiAccessEnabled: persistence.apiAccessEnabled,
      ssoEnabled: persistence.ssoEnabled,
      subscriptionStartDate: persistence.subscriptionStartDate,
      subscriptionEndDate: persistence.subscriptionEndDate,
      createdAt: persistence.createdAt,
      updatedAt: persistence.updatedAt,
      version: persistence.version,
    };
  }
}
