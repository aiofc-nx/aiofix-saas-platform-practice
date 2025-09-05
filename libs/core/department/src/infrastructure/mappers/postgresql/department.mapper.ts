/**
 * @class DepartmentMapper
 * @description PostgreSQL部门映射器
 *
 * 功能与职责：
 * 1. 领域对象与PostgreSQL持久化对象之间的转换
 * 2. 处理数据类型转换
 * 3. 确保映射的完整性
 * 4. 支持批量转换操作
 *
 * @example
 * ```typescript
 * const mapper = new DepartmentMapper();
 * const domainEntity = mapper.toDomain(persistenceEntity);
 * const persistenceEntity = mapper.toPersistence(domainEntity);
 * ```
 * @since 2.1.0
 */

import { DepartmentEntity } from '../../../domain/entities';
import { DepartmentOrmEntity } from '../../entities/postgresql/department.orm-entity';
import { DepartmentStatus, DepartmentType } from '../../../domain/enums';
import {
  DepartmentId,
  DepartmentName,
  DepartmentCode,
  DataPrivacyLevel,
} from '@aiofix/shared';

/**
 * PostgreSQL部门映射器
 */
export class DepartmentMapper {
  /**
   * 持久化对象转换为领域对象
   * @param persistence 持久化实体
   * @returns 领域实体
   */
  toDomain(persistence: DepartmentOrmEntity): DepartmentEntity {
    return new DepartmentEntity(
      new DepartmentId(persistence.id),
      new DepartmentName(persistence.name),
      new DepartmentCode(persistence.code),
      persistence.type as DepartmentType,
      persistence.tenantId,
      persistence.organizationId,
      DataPrivacyLevel.PROTECTED,
      persistence.status as DepartmentStatus,
      persistence.description,
      persistence.parentDepartmentId
        ? new DepartmentId(persistence.parentDepartmentId)
        : undefined,
      persistence.managerId,
      persistence.level,
      persistence.path,
      persistence.createdBy,
    );
  }

  /**
   * 领域对象转换为持久化对象
   * @param domain 领域实体
   * @returns 持久化实体
   */
  toPersistence(domain: DepartmentEntity): DepartmentOrmEntity {
    const persistence = new DepartmentOrmEntity();
    persistence.id = domain.departmentId.toString();
    persistence.name = domain.name.toString();
    persistence.code = domain.code.toString();
    persistence.type = domain.type;
    persistence.status = domain.status;
    persistence.description = domain.description;
    persistence.tenantId = domain.tenantId.toString();
    persistence.organizationId = domain.organizationId?.toString() ?? '';
    persistence.parentDepartmentId = domain.parentDepartmentId?.toString();
    persistence.managerId = domain.managerId;
    persistence.level = domain.level;
    persistence.path = domain.path;
    persistence.metadata = domain.getAllMetadata();
    persistence.createdBy = domain.createdBy;
    persistence.updatedBy = domain.updatedBy;
    persistence.createdAt = domain.createdAt;
    persistence.updatedAt = domain.updatedAt;
    return persistence;
  }

  /**
   * 批量转换持久化对象为领域对象
   * @param persistences 持久化实体列表
   * @returns 领域实体列表
   */
  toDomainMany(persistences: DepartmentOrmEntity[]): DepartmentEntity[] {
    return persistences.map(persistence => this.toDomain(persistence));
  }

  /**
   * 批量转换领域对象为持久化对象
   * @param domains 领域实体列表
   * @returns 持久化实体列表
   */
  toPersistenceMany(domains: DepartmentEntity[]): DepartmentOrmEntity[] {
    return domains.map(domain => this.toPersistence(domain));
  }

  /**
   * 更新持久化对象
   * @param persistence 持久化实体
   * @param domain 领域实体
   */
  updatePersistence(
    persistence: DepartmentOrmEntity,
    domain: DepartmentEntity,
  ): void {
    persistence.name = domain.name.toString();
    persistence.code = domain.code.toString();
    persistence.type = domain.type;
    persistence.status = domain.status;
    persistence.description = domain.description;
    persistence.parentDepartmentId = domain.parentDepartmentId?.toString();
    persistence.managerId = domain.managerId;
    persistence.level = domain.level;
    persistence.path = domain.path;
    persistence.metadata = domain.getAllMetadata();
    persistence.updatedBy = domain.updatedBy;
    persistence.updatedAt = domain.updatedAt;
  }
}
