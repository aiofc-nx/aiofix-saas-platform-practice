/**
 * @class DepartmentMapper
 * @description MongoDB部门映射器
 *
 * 功能与职责：
 * 1. 领域对象与MongoDB文档对象之间的转换
 * 2. 处理数据类型转换
 * 3. 确保映射的完整性
 * 4. 支持批量转换操作
 * 5. 提供DTO转换功能
 *
 * @example
 * ```typescript
 * const mapper = new DepartmentMapper();
 * const domainEntity = mapper.toDomain(documentEntity);
 * const documentEntity = mapper.toDocument(domainEntity);
 * ```
 * @since 2.1.0
 */

import { DepartmentEntity } from '../../../domain/entities';
import { DepartmentDocument } from '../../entities/mongodb/department.document';
import { DepartmentStatus, DepartmentType } from '../../../domain/enums';
import {
  DepartmentId,
  DepartmentName,
  DepartmentCode,
  DataPrivacyLevel,
} from '@aiofix/shared';

/**
 * MongoDB部门映射器
 */
export class DepartmentMapper {
  /**
   * 文档对象转换为领域对象
   * @param document 文档实体
   * @returns 领域实体
   */
  toDomain(document: DepartmentDocument): DepartmentEntity {
    return new DepartmentEntity(
      new DepartmentId(document.id),
      new DepartmentName(document.name),
      new DepartmentCode(document.code),
      document.type as DepartmentType,
      document.tenantId,
      document.organizationId,
      DataPrivacyLevel.PROTECTED,
      document.status as DepartmentStatus,
      document.description,
      document.parentDepartmentId
        ? new DepartmentId(document.parentDepartmentId)
        : undefined,
      document.managerId,
      document.level,
      document.path,
      document.createdBy,
    );
  }

  /**
   * 领域对象转换为文档对象
   * @param domain 领域实体
   * @returns 文档实体
   */
  toDocument(domain: DepartmentEntity): DepartmentDocument {
    const document = new DepartmentDocument();
    document.id = domain.departmentId.toString();
    document.name = domain.name.toString();
    document.code = domain.code.toString();
    document.type = domain.type;
    document.status = domain.status;
    document.description = domain.description;
    document.tenantId = domain.tenantId.toString();
    document.organizationId = domain.organizationId?.toString() ?? '';
    document.parentDepartmentId = domain.parentDepartmentId?.toString();
    document.managerId = domain.managerId;
    document.level = domain.level;
    document.path = domain.path;
    document.metadata = domain.getAllMetadata();
    document.createdBy = domain.createdBy;
    document.updatedBy = domain.updatedBy;
    document.createdAt = domain.createdAt;
    document.updatedAt = domain.updatedAt;

    // 设置查询优化字段
    document.searchText = this.buildSearchText(domain);
    document.tags = this.buildTags(domain);

    return document;
  }

  /**
   * 批量转换文档对象为领域对象
   * @param documents 文档实体列表
   * @returns 领域实体列表
   */
  toDomainMany(documents: DepartmentDocument[]): DepartmentEntity[] {
    return documents.map(document => this.toDomain(document));
  }

  /**
   * 批量转换领域对象为文档对象
   * @param domains 领域实体列表
   * @returns 文档实体列表
   */
  toDocumentMany(domains: DepartmentEntity[]): DepartmentDocument[] {
    return domains.map(domain => this.toDocument(domain));
  }

  /**
   * 更新文档对象
   * @param document 文档实体
   * @param domain 领域实体
   */
  updateDocument(document: DepartmentDocument, domain: DepartmentEntity): void {
    document.name = domain.name.toString();
    document.code = domain.code.toString();
    document.type = domain.type;
    document.status = domain.status;
    document.description = domain.description;
    document.parentDepartmentId = domain.parentDepartmentId?.toString();
    document.managerId = domain.managerId;
    document.level = domain.level;
    document.path = domain.path;
    document.metadata = domain.getAllMetadata();
    document.updatedBy = domain.updatedBy;
    document.updatedAt = domain.updatedAt;

    // 更新查询优化字段
    document.searchText = this.buildSearchText(domain);
    document.tags = this.buildTags(domain);
  }

  /**
   * 转换为DTO对象
   * @param document 文档实体
   * @returns DTO对象
   */
  toDto(document: DepartmentDocument): Record<string, unknown> {
    return {
      id: document.id,
      name: document.name,
      code: document.code,
      type: document.type,
      status: document.status,
      description: document.description,
      tenantId: document.tenantId,
      organizationId: document.organizationId,
      parentDepartmentId: document.parentDepartmentId,
      managerId: document.managerId,
      level: document.level,
      path: document.path,
      metadata: document.metadata,
      createdBy: document.createdBy,
      updatedBy: document.updatedBy,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    };
  }

  /**
   * 批量转换为DTO对象
   * @param documents 文档实体列表
   * @returns DTO对象列表
   */
  toDtoMany(documents: DepartmentDocument[]): Record<string, unknown>[] {
    return documents.map(document => this.toDto(document));
  }

  /**
   * 构建搜索文本
   * @param domain 领域实体
   * @returns 搜索文本
   */
  private buildSearchText(domain: DepartmentEntity): string {
    const parts = [
      domain.name.toString(),
      domain.code.toString(),
      domain.description ?? '',
      domain.type,
      domain.status,
    ];
    return parts
      .filter(part => part)
      .join(' ')
      .toLowerCase();
  }

  /**
   * 构建标签
   * @param domain 领域实体
   * @returns 标签列表
   */
  private buildTags(domain: DepartmentEntity): string[] {
    const tags = [domain.type, domain.status, `level-${domain.level}`];

    if (domain.parentDepartmentId) {
      tags.push('has-parent');
    } else {
      tags.push('root-level');
    }

    return tags;
  }
}
