/**
 * @file data-access-control.service.ts
 * @description 数据访问控制服务
 *
 * 该文件定义了数据访问控制服务，用于在应用层实现数据隔离和访问控制。
 * 该服务提供了统一的数据访问控制接口，确保所有数据访问都符合隔离规则。
 *
 * 主要功能：
 * 1. 数据访问权限检查
 * 2. 数据隔离验证
 * 3. 跨层级数据访问控制
 * 4. 隐私级别控制
 * 5. 访问审计日志
 *
 * 业务规则：
 * 1. 所有数据访问必须通过访问控制检查
 * 2. 跨租户访问必须被拒绝
 * 3. 跨组织访问需要特殊权限
 * 4. 用户级数据只能被用户本人访问
 * 5. 公共数据可以被授权用户访问
 */

import { Injectable } from '@nestjs/common';
import { Uuid } from '../../domain/value-objects/uuid.vo';
import {
  DataIsolationAwareEntity,
  DataIsolationLevel,
  DataPrivacyLevel,
} from '../../domain/entities/data-isolation-aware.entity';
// 暂时注释掉日志服务，使用控制台日志
// import { PinoLoggerService } from '../../infrastructure/logging/pino-logger.service';

/**
 * @interface ApplicationDataAccessRequest
 * @description 应用层数据访问请求接口
 */
export interface ApplicationDataAccessRequest {
  userId: Uuid; // 请求用户ID
  tenantId: Uuid; // 请求用户租户ID
  organizationId?: Uuid; // 请求用户组织ID
  departmentIds: Uuid[]; // 请求用户部门ID列表
  targetEntity: DataIsolationAwareEntity; // 目标实体
  operation: 'read' | 'write' | 'delete'; // 操作类型
  reason?: string; // 访问原因
}

/**
 * @interface ApplicationDataAccessResult
 * @description 应用层数据访问结果接口
 */
export interface ApplicationDataAccessResult {
  allowed: boolean; // 是否允许访问
  reason?: string; // 拒绝原因
  auditLog?: DataAccessAuditLog; // 审计日志
}

/**
 * @interface DataAccessAuditLog
 * @description 数据访问审计日志接口
 */
export interface DataAccessAuditLog {
  timestamp: Date; // 访问时间
  userId: string; // 用户ID
  tenantId: string; // 租户ID
  targetEntityId: string; // 目标实体ID
  targetEntityType: string; // 目标实体类型
  operation: string; // 操作类型
  allowed: boolean; // 是否允许
  reason?: string; // 原因
  isolationLevel: DataIsolationLevel; // 数据隔离级别
  privacyLevel: DataPrivacyLevel; // 隐私级别
}

/**
 * @class DataAccessControlService
 * @description 数据访问控制服务
 */
@Injectable()
export class DataAccessControlService {
  /**
   * @method checkAccess
   * @description 检查数据访问权限
   * @param request 数据访问请求
   * @returns 数据访问结果
   */
  checkAccess(
    request: ApplicationDataAccessRequest
  ): ApplicationDataAccessResult {
    try {
      // 创建模拟的访问实体
      const accessEntity = this.createAccessEntity(request);

      // 检查访问权限
      const allowed = accessEntity.canAccess(request.targetEntity);

      // 创建审计日志
      const auditLog = this.createAuditLog(request, allowed);

      // 记录访问日志
      this.logAccess(request, allowed, auditLog);

      return {
        allowed,
        auditLog,
      };
    } catch (error) {
      console.error('数据访问控制检查失败', {
        error: error instanceof Error ? error.message : 'Unknown error',
        request,
      });

      return {
        allowed: false,
        reason: '访问控制检查失败',
      };
    }
  }

  /**
   * @method checkBulkAccess
   * @description 批量检查数据访问权限
   * @param userId 用户ID
   * @param tenantId 租户ID
   * @param organizationId 组织ID
   * @param departmentIds 部门ID列表
   * @param entities 目标实体列表
   * @param operation 操作类型
   * @returns 访问结果映射
   */
  checkBulkAccess(
    userId: Uuid,
    tenantId: Uuid,
    organizationId: Uuid | undefined,
    departmentIds: Uuid[],
    entities: DataIsolationAwareEntity[],
    operation: 'read' | 'write' | 'delete'
  ): Map<string, ApplicationDataAccessResult> {
    const results = new Map<string, ApplicationDataAccessResult>();

    for (const entity of entities) {
      const request: ApplicationDataAccessRequest = {
        userId,
        tenantId,
        organizationId,
        departmentIds,
        targetEntity: entity,
        operation,
      };

      const result = this.checkAccess(request);
      results.set(entity.id.toString(), result);
    }

    return results;
  }

  /**
   * @method filterAccessibleEntities
   * @description 过滤可访问的实体
   * @param userId 用户ID
   * @param tenantId 租户ID
   * @param organizationId 组织ID
   * @param departmentIds 部门ID列表
   * @param entities 实体列表
   * @param operation 操作类型
   * @returns 可访问的实体列表
   */
  filterAccessibleEntities(
    userId: Uuid,
    tenantId: Uuid,
    organizationId: Uuid | undefined,
    departmentIds: Uuid[],
    entities: DataIsolationAwareEntity[],
    operation: 'read' | 'write' | 'delete'
  ): DataIsolationAwareEntity[] {
    return entities.filter((entity) => {
      const request: ApplicationDataAccessRequest = {
        userId,
        tenantId,
        organizationId,
        departmentIds,
        targetEntity: entity,
        operation,
      };

      const result = this.checkAccess(request);
      return result.allowed;
    });
  }

  /**
   * @method validateTenantAccess
   * @description 验证租户访问权限
   * @param userTenantId 用户租户ID
   * @param targetTenantId 目标租户ID
   * @returns 是否允许访问
   */
  validateTenantAccess(userTenantId: Uuid, targetTenantId: Uuid): boolean {
    return userTenantId.equals(targetTenantId);
  }

  /**
   * @method validateOrganizationAccess
   * @description 验证组织访问权限
   * @param userOrganizationId 用户组织ID
   * @param targetOrganizationId 目标组织ID
   * @param userTenantId 用户租户ID
   * @param targetTenantId 目标租户ID
   * @returns 是否允许访问
   */
  validateOrganizationAccess(
    userOrganizationId: Uuid | undefined,
    targetOrganizationId: Uuid | undefined,
    userTenantId: Uuid,
    targetTenantId: Uuid
  ): boolean {
    // 首先检查租户访问权限
    if (!this.validateTenantAccess(userTenantId, targetTenantId)) {
      return false;
    }

    // 如果目标实体没有组织归属，则允许访问
    if (!targetOrganizationId) {
      return true;
    }

    // 如果用户没有组织归属，则拒绝访问
    if (!userOrganizationId) {
      return false;
    }

    // 检查组织是否匹配
    return userOrganizationId.equals(targetOrganizationId);
  }

  /**
   * @method validateDepartmentAccess
   * @description 验证部门访问权限
   * @param userDepartmentIds 用户部门ID列表
   * @param targetDepartmentIds 目标部门ID列表
   * @param userOrganizationId 用户组织ID
   * @param targetOrganizationId 目标组织ID
   * @param userTenantId 用户租户ID
   * @param targetTenantId 目标租户ID
   * @returns 是否允许访问
   */
  validateDepartmentAccess(
    userDepartmentIds: Uuid[],
    targetDepartmentIds: Uuid[],
    userOrganizationId: Uuid | undefined,
    targetOrganizationId: Uuid | undefined,
    userTenantId: Uuid,
    targetTenantId: Uuid
  ): boolean {
    // 首先检查组织访问权限
    if (
      !this.validateOrganizationAccess(
        userOrganizationId,
        targetOrganizationId,
        userTenantId,
        targetTenantId
      )
    ) {
      return false;
    }

    // 如果目标实体没有部门归属，则允许访问
    if (targetDepartmentIds.length === 0) {
      return true;
    }

    // 如果用户没有部门归属，则拒绝访问
    if (userDepartmentIds.length === 0) {
      return false;
    }

    // 检查是否有共同部门
    const commonDepartments = userDepartmentIds.filter((userDeptId) =>
      targetDepartmentIds.some((targetDeptId) =>
        userDeptId.equals(targetDeptId)
      )
    );

    return commonDepartments.length > 0;
  }

  /**
   * @method validateUserAccess
   * @description 验证用户访问权限
   * @param userId 用户ID
   * @param targetUserId 目标用户ID
   * @param userTenantId 用户租户ID
   * @param targetTenantId 目标租户ID
   * @param targetPrivacyLevel 目标隐私级别
   * @returns 是否允许访问
   */
  validateUserAccess(
    userId: Uuid,
    targetUserId: Uuid | undefined,
    userTenantId: Uuid,
    targetTenantId: Uuid,
    targetPrivacyLevel: DataPrivacyLevel
  ): boolean {
    // 首先检查租户访问权限
    if (!this.validateTenantAccess(userTenantId, targetTenantId)) {
      return false;
    }

    // 如果是公共数据，则允许访问
    if (targetPrivacyLevel === DataPrivacyLevel.SHARED) {
      return true;
    }

    // 如果是受保护数据，则只有用户本人可以访问
    if (targetPrivacyLevel === DataPrivacyLevel.PROTECTED) {
      return targetUserId ? userId.equals(targetUserId) : false;
    }

    return false;
  }

  /**
   * @private
   * @method createAccessEntity
   * @description 创建访问实体
   * @param request 数据访问请求
   * @returns 访问实体
   */
  private createAccessEntity(
    request: ApplicationDataAccessRequest
  ): DataIsolationAwareEntity {
    // 创建一个临时的访问实体来检查权限
    return new (class extends DataIsolationAwareEntity {
      constructor() {
        super(
          request.tenantId,
          DataIsolationLevel.USER, // 默认为用户级
          DataPrivacyLevel.PROTECTED,
          undefined,
          request.organizationId,
          request.departmentIds,
          request.userId
        );
      }
    })();
  }

  /**
   * @private
   * @method createAuditLog
   * @description 创建审计日志
   * @param request 数据访问请求
   * @param allowed 是否允许访问
   * @returns 审计日志
   */
  private createAuditLog(
    request: ApplicationDataAccessRequest,
    allowed: boolean
  ): DataAccessAuditLog {
    return {
      timestamp: new Date(),
      userId: request.userId.toString(),
      tenantId: request.tenantId.toString(),
      targetEntityId: request.targetEntity.id.toString(),
      targetEntityType: request.targetEntity.constructor.name,
      operation: request.operation,
      allowed,
      reason: request.reason,
      isolationLevel: request.targetEntity.dataIsolationLevel,
      privacyLevel: request.targetEntity.dataPrivacyLevel,
    };
  }

  /**
   * @private
   * @method logAccess
   * @description 记录访问日志
   * @param request 数据访问请求
   * @param allowed 是否允许访问
   * @param auditLog 审计日志
   */
  private logAccess(
    request: ApplicationDataAccessRequest,
    allowed: boolean,
    auditLog: DataAccessAuditLog
  ): void {
    const logMessage = allowed ? '数据访问成功' : '数据访问被拒绝';

    const logData = {
      userId: request.userId.toString(),
      tenantId: request.tenantId.toString(),
      targetEntityId: request.targetEntity.id.toString(),
      targetEntityType: request.targetEntity.constructor.name,
      operation: request.operation,
      isolationLevel: request.targetEntity.dataIsolationLevel,
      privacyLevel: request.targetEntity.dataPrivacyLevel,
      reason: request.reason,
      auditLog,
    };

    if (allowed) {
      console.info(logMessage, logData);
    } else {
      console.warn(logMessage, logData);
    }
  }
}
