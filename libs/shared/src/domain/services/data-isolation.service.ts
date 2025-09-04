/**
 * @file data-isolation.service.ts
 * @description 数据隔离服务
 *
 * 该文件定义了数据隔离服务，提供多层级数据隔离的业务逻辑。
 * 数据隔离服务是确保多租户SaaS平台数据安全的核心服务。
 *
 * 主要功能：
 * 1. 多层级数据隔离策略管理
 * 2. 数据访问权限验证
 * 3. 跨层级数据访问控制
 * 4. 数据隔离审计和监控
 *
 * 遵循DDD和Clean Architecture原则，提供统一的数据隔离服务。
 */

import { Injectable } from '@nestjs/common';

import { DataIsolationAwareEntity } from '../entities/data-isolation-aware.entity';
import {
  DataIsolationLevel,
  DataPrivacyLevel,
  TenantContext,
} from '../entities/data-isolation-aware.entity';
import { PinoLoggerService, LogContext } from '@aiofix/logging';

/**
 * @interface DataAccessRequest
 * @description 数据访问请求
 */
export interface DataAccessRequest {
  source: DataIsolationAwareEntity;
  target: DataIsolationAwareEntity;
  requestedLevel: DataIsolationLevel;
}

/**
 * @interface DataAccessResult
 * @description 数据访问结果
 */
export interface DataAccessResult {
  isAllowed: boolean;
  reason: string;
  auditInfo?: {
    timestamp: Date;
    sourceId: string;
    targetId: string;
    accessAllowed: boolean;
    reason: string;
  };
}

/**
 * @interface ValidationResult
 * @description 验证结果
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  reason?: string;
}

/**
 * @interface IsolationPolicy
 * @description 数据隔离策略
 */
export interface IsolationPolicy {
  allowCrossLevelAccess: boolean;
  allowCrossTenantAccess: boolean;
  auditAllAccess: boolean;
  auditEnabled?: boolean;
}

/**
 * @class DataIsolationService
 * @description 数据隔离服务
 *
 * 提供多层级数据隔离的核心业务逻辑，包括：
 * - 数据访问权限验证
 * - 跨层级数据访问控制
 * - 数据隔离策略管理
 * - 数据隔离审计
 */
@Injectable()
export class DataIsolationService {
  private readonly logger: PinoLoggerService;
  private isolationPolicy: IsolationPolicy = {
    allowCrossLevelAccess: false,
    allowCrossTenantAccess: false,
    auditAllAccess: false,
    auditEnabled: true,
  };

  constructor(logger: PinoLoggerService) {
    this.logger = logger;
  }

  /**
   * @method validateDataAccess
   * @description 验证数据访问权限
   * @param request 数据访问请求
   * @returns 数据访问结果
   */
  public validateDataAccess(request: DataAccessRequest): DataAccessResult {
    const { source, target, requestedLevel } = request;

    // 1. 检查租户级隔离
    if (!source.isInSameTenant(target)) {
      return {
        isAllowed: false,
        reason: '跨租户访问被拒绝',
      };
    }

    // 2. 检查是否为权限升级场景（从更严格的级别到更宽松的级别）
    const sourceLevel = source.dataIsolationLevel;

    // 如果源实体的隔离级别比目标实体更严格，且请求的级别是租户级，则允许权限升级
    if (
      this.isMoreStrictLevel(sourceLevel, requestedLevel) &&
      requestedLevel === DataIsolationLevel.TENANT
    ) {
      return {
        isAllowed: true,
        reason: '权限升级访问',
      };
    }

    // 3. 根据请求的隔离级别进行验证
    switch (requestedLevel) {
      case DataIsolationLevel.PLATFORM:
        return this.validatePlatformAccess(source, target);
      case DataIsolationLevel.TENANT:
        return {
          isAllowed: true,
          reason: '同一租户内访问',
        };

      case DataIsolationLevel.ORGANIZATION:
        if (source.isInSameOrganization(target)) {
          return {
            isAllowed: true,
            reason: '同一组织内访问',
          };
        } else {
          return {
            isAllowed: false,
            reason: '跨组织访问被拒绝',
          };
        }

      case DataIsolationLevel.DEPARTMENT:
        if (source.isInSameDepartment(target)) {
          return {
            isAllowed: true,
            reason: '同一部门内访问',
          };
        } else {
          return {
            isAllowed: false,
            reason: '跨部门访问被拒绝',
          };
        }

      case DataIsolationLevel.SUB_DEPARTMENT:
        if (source.isInSameDepartment(target)) {
          return {
            isAllowed: true,
            reason: '同一子部门内访问',
          };
        } else {
          return {
            isAllowed: false,
            reason: '跨子部门访问被拒绝',
          };
        }

      case DataIsolationLevel.USER:
        return this.validateUserAccess(source, target);

      default:
        return {
          isAllowed: false,
          reason: '未知的隔离级别',
        };
    }
  }

  /**
   * @method validateByIsolationLevel
   * @description 根据隔离级别验证访问权限
   * @param source 源实体
   * @param target 目标实体
   * @param level 隔离级别
   * @returns 验证结果
   */
  public validateByIsolationLevel(
    source: DataIsolationAwareEntity,
    target: DataIsolationAwareEntity,
    level: DataIsolationLevel,
  ): ValidationResult {
    const errors: string[] = [];

    // 检查租户级隔离
    if (!source.isInSameTenant(target)) {
      errors.push('跨租户访问被拒绝');
    }

    // 根据隔离级别进行额外检查
    switch (level) {
      case DataIsolationLevel.ORGANIZATION:
        if (!source.isInSameOrganization(target)) {
          errors.push('跨组织访问被拒绝');
        }
        break;

      case DataIsolationLevel.DEPARTMENT:
        if (!source.isInSameDepartment(target)) {
          errors.push('跨部门访问被拒绝');
        }
        break;

      case DataIsolationLevel.SUB_DEPARTMENT:
        if (!source.isInSameDepartment(target)) {
          errors.push('跨子部门访问被拒绝');
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * @method isCrossLevelAccess
   * @description 判断是否为跨层级访问
   * @param sourceEntity 源实体
   * @param targetEntity 目标实体
   * @returns 是否为跨层级访问
   */
  public isCrossLevelAccess(
    sourceEntity: DataIsolationAwareEntity,
    targetEntity: DataIsolationAwareEntity,
  ): boolean {
    const sourceLevel = sourceEntity.dataIsolationLevel;
    const targetLevel = targetEntity.dataIsolationLevel;

    return sourceLevel !== targetLevel;
  }

  /**
   * @method validateCrossLevelAccess
   * @description 验证跨层级访问权限
   * @param sourceEntity 源实体
   * @param targetEntity 目标实体
   * @returns 验证结果
   */
  public validateCrossLevelAccess(
    sourceEntity: DataIsolationAwareEntity,
    targetEntity: DataIsolationAwareEntity,
  ): ValidationResult {
    // 检查是否在同一租户内
    if (!sourceEntity.isInSameTenant(targetEntity)) {
      return {
        isValid: false,
        reason: '跨租户跨层级访问被拒绝',
        errors: ['跨租户跨层级访问被拒绝'],
      };
    }

    // 检查是否允许跨层级访问
    if (!this.isolationPolicy.allowCrossLevelAccess) {
      return {
        isValid: false,
        reason: '跨层级访问策略被禁用',
        errors: ['跨层级访问策略被禁用'],
      };
    }

    return {
      isValid: true,
      reason: '跨层级访问验证通过',
      errors: [],
    };
  }

  /**
   * @method setIsolationPolicy
   * @description 设置数据隔离策略
   * @param policy 隔离策略
   */
  public setIsolationPolicy(policy: IsolationPolicy): void {
    this.isolationPolicy = { ...policy };
  }

  /**
   * @method getIsolationPolicy
   * @description 获取数据隔离策略
   * @returns 隔离策略
   */
  public getIsolationPolicy(): IsolationPolicy {
    return { ...this.isolationPolicy };
  }

  /**
   * @method validateTenantContext
   * @description 验证租户上下文
   * @param context 租户上下文
   * @returns 验证结果
   */
  public validateTenantContext(context: TenantContext): ValidationResult {
    const errors: string[] = [];

    // 检查租户ID
    if (!context.tenantId || context.tenantId.trim() === '') {
      errors.push('租户ID不能为空');
    }

    // 检查组织级隔离需要组织ID
    if (
      context.isolationLevel === DataIsolationLevel.ORGANIZATION &&
      !context.organizationId
    ) {
      errors.push('组织级隔离需要组织ID');
    }

    // 检查部门级隔离需要部门ID
    if (
      context.isolationLevel === DataIsolationLevel.DEPARTMENT &&
      (!context.departmentIds || context.departmentIds.length === 0)
    ) {
      errors.push('部门级隔离需要部门ID');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * @method getEffectiveIsolationLevel
   * @description 获取实体的有效隔离级别
   * @param entity 实体
   * @returns 隔离级别
   */
  public getEffectiveIsolationLevel(
    entity: DataIsolationAwareEntity,
  ): DataIsolationLevel {
    return entity.dataIsolationLevel;
  }

  /**
   * @method auditDataAccess
   * @description 审计数据访问
   * @param accessRequest 访问请求
   * @param accessResult 访问结果
   * @returns 审计记录
   */
  public auditDataAccess(
    accessRequest: DataAccessRequest,
    accessResult: DataAccessResult,
  ): DataAccessResult['auditInfo'] {
    const auditInfo = {
      timestamp: new Date(),
      sourceId: accessRequest.source.id.value,
      targetId: accessRequest.target.id.value,
      accessAllowed: accessResult.isAllowed,
      reason: accessResult.reason,
    };

    // 如果启用了审计，记录日志
    if (this.isolationPolicy.auditEnabled) {
      this.logger.info('数据访问审计', LogContext.SYSTEM, auditInfo);
    }

    return auditInfo;
  }

  /**
   * @method clearPolicies
   * @description 清除所有策略（主要用于测试）
   */
  public clearPolicies(): void {
    this.isolationPolicy = {
      allowCrossLevelAccess: false,
      allowCrossTenantAccess: false,
      auditAllAccess: false,
      auditEnabled: true,
    };
  }

  /**
   * @method isMoreStrictLevel
   * @description 判断一个隔离级别是否比另一个更严格
   * @param level1 第一个级别
   * @param level2 第二个级别
   * @returns 是否更严格
   */
  private isMoreStrictLevel(
    level1: DataIsolationLevel,
    level2: DataIsolationLevel,
  ): boolean {
    const levelOrder = {
      [DataIsolationLevel.PLATFORM]: -1,
      [DataIsolationLevel.TENANT]: 0,
      [DataIsolationLevel.ORGANIZATION]: 1,
      [DataIsolationLevel.DEPARTMENT]: 2,
      [DataIsolationLevel.SUB_DEPARTMENT]: 3,
      [DataIsolationLevel.USER]: 4,
    };

    return levelOrder[level1] > levelOrder[level2];
  }

  /**
   * @method validatePlatformAccess
   * @description 验证平台级访问权限
   * @param source 源实体
   * @param target 目标实体
   * @returns 验证结果
   */
  private validatePlatformAccess(
    source: DataIsolationAwareEntity,
    target: DataIsolationAwareEntity,
  ): DataAccessResult {
    // 平台级数据访问逻辑
    if (target.dataPrivacyLevel === DataPrivacyLevel.SHARED) {
      return {
        isAllowed: true,
        reason: '平台级可共享数据访问允许',
      };
    }
    // 受保护的平台数据，需要平台管理员权限
    if (source.isPlatformAdmin()) {
      return {
        isAllowed: true,
        reason: '平台管理员访问允许',
      };
    }
    return {
      isAllowed: false,
      reason: '平台级受保护数据访问被拒绝',
    };
  }

  /**
   * @method validateUserAccess
   * @description 验证用户级访问权限
   * @param source 源实体
   * @param target 目标实体
   * @returns 验证结果
   */
  private validateUserAccess(
    source: DataIsolationAwareEntity,
    target: DataIsolationAwareEntity,
  ): DataAccessResult {
    // 用户级数据访问逻辑
    if (target.dataPrivacyLevel === DataPrivacyLevel.SHARED) {
      // 可共享的用户数据，同组织内可访问
      if (source.isInSameOrganization(target)) {
        return {
          isAllowed: true,
          reason: '用户级可共享数据访问允许',
        };
      }
      return {
        isAllowed: false,
        reason: '跨组织用户级数据访问被拒绝',
      };
    }
    // 受保护的用户数据，只能用户本人访问
    if (source.userId && target.userId && source.userId.equals(target.userId)) {
      return {
        isAllowed: true,
        reason: '用户本人访问允许',
      };
    }
    return {
      isAllowed: false,
      reason: '用户级受保护数据访问被拒绝',
    };
  }
}
