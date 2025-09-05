/**
 * @file organization.mapper.ts
 * @description 组织MongoDB映射器
 *
 * 该文件定义了组织领域对象与MongoDB文档之间的映射关系。
 * 负责领域对象与查询文档之间的转换。
 *
 * 主要功能：
 * 1. 领域对象到查询文档的转换
 * 2. 查询文档到领域对象的转换
 * 3. 查询优化字段处理
 * 4. 聚合查询支持
 *
 * 遵循DDD和Clean Architecture原则，作为基础设施层的映射器。
 */

import { OrganizationEntity } from '../../../domain/entities/organization.entity';
import { OrganizationDocument } from '../../entities/mongodb/organization.document';
import {
  OrganizationId,
  OrganizationName,
  OrganizationCode,
} from '../../../domain/value-objects';
import { OrganizationStatus, OrganizationType } from '../../../domain/enums';
import { DataPrivacyLevel } from '@aiofix/shared';

/**
 * 组织MongoDB映射器类
 */
export class OrganizationMapper {
  /**
   * 查询文档转换为领域对象
   * @param document MongoDB文档
   * @returns 领域实体
   */
  static toDomain(document: OrganizationDocument): OrganizationEntity {
    return new OrganizationEntity(
      new OrganizationId(document.id),
      new OrganizationName(document.name),
      new OrganizationCode(document.code),
      document.type as OrganizationType,
      document.tenantId,
      document.departmentIds ?? [],
      document.dataPrivacyLevel as DataPrivacyLevel,
      document.status as OrganizationStatus,
      document.description,
      document.parentOrganizationId
        ? new OrganizationId(document.parentOrganizationId)
        : undefined,
      document.managerId,
      document.createdBy,
    );
  }

  /**
   * 领域对象转换为查询文档
   * @param domainEntity 领域实体
   * @returns MongoDB文档
   */
  static toDocument(domainEntity: OrganizationEntity): OrganizationDocument {
    const document = new OrganizationDocument({
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

    // 生成搜索文本
    document.generateSearchText();

    return document;
  }

  /**
   * 批量转换领域对象到查询文档
   * @param domainEntities 领域实体数组
   * @returns MongoDB文档数组
   */
  static toDocumentMany(
    domainEntities: OrganizationEntity[],
  ): OrganizationDocument[] {
    return domainEntities.map(entity => this.toDocument(entity));
  }

  /**
   * 批量转换查询文档到领域对象
   * @param documents MongoDB文档数组
   * @returns 领域实体数组
   */
  static toDomainMany(documents: OrganizationDocument[]): OrganizationEntity[] {
    return documents.map(document => this.toDomain(document));
  }

  /**
   * 更新查询文档
   * @param document 现有的MongoDB文档
   * @param domainEntity 领域实体
   */
  static updateDocument(
    document: OrganizationDocument,
    domainEntity: OrganizationEntity,
  ): void {
    document.name = domainEntity.name.toString();
    document.code = domainEntity.code.toString();
    document.type = domainEntity.type;
    document.status = domainEntity.status;
    document.description = domainEntity.description;
    document.parentOrganizationId =
      domainEntity.parentOrganizationId?.toString();
    document.managerId = domainEntity.managerId;
    document.metadata = domainEntity.getAllMetadata();
    document.organizationId = domainEntity.organizationId.toString();
    document.departmentIds = domainEntity.departmentIds.map(id =>
      id.toString(),
    );
    document.dataPrivacyLevel = domainEntity.dataPrivacyLevel;
    document.updatedBy = domainEntity.updatedBy;
    document.updatedAt = domainEntity.updatedAt;
    document.version += 1;

    // 重新生成搜索文本
    document.generateSearchText();
  }

  /**
   * 转换为DTO对象（用于API响应）
   * @param document MongoDB文档
   * @returns DTO对象
   */
  static toDto(document: OrganizationDocument): Record<string, unknown> {
    return {
      id: document.id,
      name: document.name,
      code: document.code,
      type: document.type,
      status: document.status,
      description: document.description,
      parentOrganizationId: document.parentOrganizationId,
      managerId: document.managerId,
      metadata: document.metadata,
      tenantId: document.tenantId,
      organizationId: document.organizationId,
      departmentIds: document.departmentIds,
      dataPrivacyLevel: document.dataPrivacyLevel,
      createdBy: document.createdBy,
      updatedBy: document.updatedBy,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
      version: document.version,
      searchText: document.searchText,
      tags: document.tags,
      category: document.category,
      priority: document.priority,
    };
  }

  /**
   * 批量转换为DTO对象
   * @param documents MongoDB文档数组
   * @returns DTO对象数组
   */
  static toDtoMany(
    documents: OrganizationDocument[],
  ): Record<string, unknown>[] {
    return documents.map(document => this.toDto(document));
  }
}
