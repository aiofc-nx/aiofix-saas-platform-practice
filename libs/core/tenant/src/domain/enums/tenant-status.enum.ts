/**
 * @description 租户状态枚举
 * @author 江郎
 * @since 1.0.0
 */

/**
 * 租户状态枚举
 * 定义租户在系统中的各种状态
 */
export enum TenantStatus {
  /** 待激活状态 - 租户已创建但待激活 */
  PENDING = 'PENDING',

  /** 激活状态 - 租户正常使用中 */
  ACTIVE = 'ACTIVE',

  /** 非激活状态 - 租户已创建但未激活 */
  INACTIVE = 'INACTIVE',

  /** 暂停状态 - 租户被临时暂停使用 */
  SUSPENDED = 'SUSPENDED',

  /** 删除状态 - 租户已被删除（软删除） */
  DELETED = 'DELETED',

  /** 过期状态 - 租户订阅已过期 */
  EXPIRED = 'EXPIRED',

  /** 维护状态 - 租户处于维护模式 */
  MAINTENANCE = 'MAINTENANCE',
}

/**
 * 租户状态描述映射
 */
export const TENANT_STATUS_DESCRIPTIONS: Record<TenantStatus, string> = {
  [TenantStatus.PENDING]: '待激活',
  [TenantStatus.ACTIVE]: '激活',
  [TenantStatus.INACTIVE]: '非激活',
  [TenantStatus.SUSPENDED]: '暂停',
  [TenantStatus.DELETED]: '已删除',
  [TenantStatus.EXPIRED]: '已过期',
  [TenantStatus.MAINTENANCE]: '维护中',
};

/**
 * 租户状态工具类
 */
export class TenantStatusUtils {
  /**
   * 获取状态描述
   * @param status 租户状态
   * @returns 状态描述
   */
  static getDescription(status: TenantStatus): string {
    return TENANT_STATUS_DESCRIPTIONS[status] || '未知状态';
  }

  /**
   * 检查状态是否为有效状态
   * @param status 租户状态
   * @returns 是否为有效状态
   */
  static isValid(status: string): status is TenantStatus {
    return Object.values(TenantStatus).includes(status as TenantStatus);
  }

  /**
   * 检查状态是否为活跃状态
   * @param status 租户状态
   * @returns 是否为活跃状态
   */
  static isActive(status: TenantStatus): boolean {
    return status === TenantStatus.ACTIVE;
  }

  /**
   * 检查状态是否为可操作状态
   * @param status 租户状态
   * @returns 是否为可操作状态
   */
  static isOperational(status: TenantStatus): boolean {
    return [TenantStatus.ACTIVE, TenantStatus.INACTIVE].includes(status);
  }

  /**
   * 检查状态是否为已删除状态
   * @param status 租户状态
   * @returns 是否为已删除状态
   */
  static isDeleted(status: TenantStatus): boolean {
    return status === TenantStatus.DELETED;
  }

  /**
   * 获取所有状态列表
   * @returns 所有状态列表
   */
  static getAllStatuses(): TenantStatus[] {
    return Object.values(TenantStatus);
  }

  /**
   * 获取活跃状态列表
   * @returns 活跃状态列表
   */
  static getActiveStatuses(): TenantStatus[] {
    return [TenantStatus.ACTIVE];
  }

  /**
   * 获取非活跃状态列表
   * @returns 非活跃状态列表
   */
  static getInactiveStatuses(): TenantStatus[] {
    return [
      TenantStatus.PENDING,
      TenantStatus.INACTIVE,
      TenantStatus.SUSPENDED,
      TenantStatus.DELETED,
      TenantStatus.EXPIRED,
      TenantStatus.MAINTENANCE,
    ];
  }
}
