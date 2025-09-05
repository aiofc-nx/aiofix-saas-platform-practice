/**
 * @file organization.mapper.ts
 * @description 组织PostgreSQL映射器
 *
 * 该文件定义了组织领域对象与PostgreSQL实体之间的映射关系。
 * 负责领域对象与持久化对象之间的转换。
 *
 * 主要功能：
 * 1. 领域对象到持久化对象的转换
 * 2. 持久化对象到领域对象的转换
 * 3. 数据类型转换和验证
 * 4. 关系映射处理
 *
 * 遵循DDD和Clean Architecture原则，作为基础设施层的映射器。
 */

import { OrganizationEntity } from '../../../domain/entities/organization.entity';
import { OrganizationOrmEntity } from '../../entities/postgresql/organization.orm-entity';
import {
  OrganizationId,
  OrganizationName,
  OrganizationCode,
} from '../../../domain/value-objects';
import { OrganizationStatus, OrganizationType } from '../../../domain/enums';
import { DataPrivacyLevel } from '@aiofix/shared';

/**
 * 组织PostgreSQL映射器类
 */
export class OrganizationMapper {
  /**
   * 持久化对象转换为领域对象
   * @param ormEntity PostgreSQL ORM实体
   * @returns 领域实体
   */
  static toDomain(ormEntity: OrganizationOrmEntity): OrganizationEntity {
    return new OrganizationEntity(
      new OrganizationId(ormEntity.id),
      new OrganizationName(ormEntity.name),
      new OrganizationCode(ormEntity.code),
      ormEntity.type as OrganizationType,
      ormEntity.tenantId,
      ormEntity.departmentIds ?? [],
      ormEntity.dataPrivacyLevel as DataPrivacyLevel,
      ormEntity.status as OrganizationStatus,
      ormEntity.description,
      ormEntity.parentOrganizationId
        ? new OrganizationId(ormEntity.parentOrganizationId)
        : undefined,
      ormEntity.managerId,
      ormEntity.createdBy,
    );
  }

  /**
   * 领域对象转换为持久化对象
   * @param domainEntity 领域实体
   * @returns PostgreSQL ORM实体
   */
  static toPersistence(
    domainEntity: OrganizationEntity,
  ): OrganizationOrmEntity {
    return new OrganizationOrmEntity({
      id: domainEntity.organizationId.toString(),
      name: domainEntity.name.toString(),
      code: domainEntity.code.toString(),
      type: domainEntity.type,
      status: domainEntity.status,
      description: domainEntity.description,
      parentOrganizationId: domainEntity.parentOrganizationId?.toString(),
      managerId: domainEntity.managerId,
      metadata: domainEntity.getAllMetadata(),
      tenantId: domainEntity.tenantId.toString(),
      organizationId: domainEntity.organizationId.toString(),
      departmentIds: domainEntity.departmentIds.map(id => id.toString()),
      dataPrivacyLevel: domainEntity.dataPrivacyLevel,
      createdBy: domainEntity.createdBy,
      updatedBy: domainEntity.updatedBy,
      createdAt: domainEntity.createdAt,
      updatedAt: domainEntity.updatedAt,
      version: 1,
    });
  }

  /**
   * 批量转换领域对象到持久化对象
   * @param domainEntities 领域实体数组
   * @returns PostgreSQL ORM实体数组
   */
  static toPersistenceMany(
    domainEntities: OrganizationEntity[],
  ): OrganizationOrmEntity[] {
    return domainEntities.map(entity => this.toPersistence(entity));
  }

  /**
   * 批量转换持久化对象到领域对象
   * @param ormEntities PostgreSQL ORM实体数组
   * @returns 领域实体数组
   */
  static toDomainMany(
    ormEntities: OrganizationOrmEntity[],
  ): OrganizationEntity[] {
    return ormEntities.map(entity => this.toDomain(entity));
  }

  /**
   * 更新持久化对象
   * @param ormEntity 现有的PostgreSQL ORM实体
   * @param domainEntity 领域实体
   */
  static updatePersistence(
    ormEntity: OrganizationOrmEntity,
    domainEntity: OrganizationEntity,
  ): void {
    ormEntity.name = domainEntity.name.toString();
    ormEntity.code = domainEntity.code.toString();
    ormEntity.type = domainEntity.type;
    ormEntity.status = domainEntity.status;
    ormEntity.description = domainEntity.description;
    ormEntity.parentOrganizationId =
      domainEntity.parentOrganizationId?.toString();
    ormEntity.managerId = domainEntity.managerId;
    ormEntity.metadata = domainEntity.getAllMetadata();
    ormEntity.organizationId = domainEntity.organizationId.toString();
    ormEntity.departmentIds = domainEntity.departmentIds.map(id =>
      id.toString(),
    );
    ormEntity.dataPrivacyLevel = domainEntity.dataPrivacyLevel;
    ormEntity.updatedBy = domainEntity.updatedBy;
    ormEntity.updatedAt = domainEntity.updatedAt;
    ormEntity.version += 1;
  }
}
