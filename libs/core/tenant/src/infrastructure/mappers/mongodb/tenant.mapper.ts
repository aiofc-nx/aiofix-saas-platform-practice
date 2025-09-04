/**
 * @class TenantMongoMapper
 * @description
 * 租户MongoDB映射器，负责领域对象与MongoDB文档之间的转换。
 *
 * 原理与机制：
 * 1. 实现领域对象与MongoDB文档的双向转换
 * 2. 处理数据类型转换和字段映射
 * 3. 确保映射的完整性和一致性
 * 4. 支持MongoDB特有的数据类型和查询
 *
 * 功能与职责：
 * 1. 领域对象与MongoDB文档的转换
 * 2. 处理MongoDB特有的数据类型
 * 3. 确保映射的完整性
 * 4. 支持MongoDB的索引和聚合
 *
 * @example
 * ```typescript
 * const mapper = new TenantMongoMapper();
 * const domainEntity = mapper.toDomain(persistenceEntity);
 * const persistenceEntity = mapper.toPersistence(domainEntity);
 * ```
 * @since 1.0.0
 */

import { TenantEntity } from '../../../domain/entities/tenant.entity';
import { TenantDocument } from '../../entities/mongodb/tenant.document';
import { TenantId, TenantName, TenantCode, TenantDomain } from '@aiofix/shared';
import { TenantType, TenantStatus } from '../../../domain/enums';

/**
 * 租户MongoDB映射器类
 * @description 负责租户领域对象与MongoDB文档之间的转换
 */
export class TenantMongoMapper {
  /**
   * MongoDB文档转换为领域对象
   * @param persistence MongoDB持久化文档
   * @returns 领域实体
   */
  toDomain(persistence: TenantDocument): TenantEntity {
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
   * 领域对象转换为MongoDB文档
   * @param domain 领域实体
   * @returns MongoDB持久化文档
   */
  toPersistence(domain: TenantEntity): TenantDocument {
    const entity = new TenantDocument();
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
   * MongoDB文档转换为DTO
   * @param persistence MongoDB持久化文档
   * @returns DTO对象
   */
  toDto(persistence: TenantDocument): any {
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
