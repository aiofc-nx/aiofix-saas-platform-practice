/**
 * @file tenant-status.enum.ts
 * @description 租户状态枚举
 *
 * 该枚举定义了租户的各种状态，用于租户生命周期管理。
 * 租户状态具有全局通用性，所有模块都需要使用。
 *
 * 通用性说明：
 * 1. 跨领域使用：所有需要租户状态管理的模块都需要
 * 2. 标准化规则：租户状态定义和流转规则相对统一
 * 3. 无业务依赖：不依赖特定业务逻辑，纯粹的状态定义
 * 4. 频繁复用：在多个子领域中被大量使用
 */

/**
 * @enum TenantStatus
 * @description 租户状态枚举
 *
 * 定义了租户的完整生命周期状态：
 * - PENDING: 待激活状态，租户已创建但未激活
 * - ACTIVE: 激活状态，租户正常使用
 * - SUSPENDED: 暂停状态，租户被临时暂停
 * - DELETED: 删除状态，租户被标记删除
 * - EXPIRED: 过期状态，租户订阅已过期
 * - MAINTENANCE: 维护状态，租户处于系统维护中
 */
export enum TenantStatus {
  /**
   * 待激活状态
   * 租户已创建但未激活，需要完成激活流程
   */
  PENDING = 'pending',

  /**
   * 激活状态
   * 租户正常使用，所有功能可用
   */
  ACTIVE = 'active',

  /**
   * 暂停状态
   * 租户被临时暂停，部分功能受限
   */
  SUSPENDED = 'suspended',

  /**
   * 删除状态
   * 租户被标记删除，数据保留但功能不可用
   */
  DELETED = 'deleted',

  /**
   * 过期状态
   * 租户订阅已过期，需要续费
   */
  EXPIRED = 'expired',

  /**
   * 维护状态
   * 租户处于系统维护中，功能暂时不可用
   */
  MAINTENANCE = 'maintenance',
}

/**
 * @interface TenantStatusInfo
 * @description 租户状态信息接口
 */
export interface TenantStatusInfo {
  /** 状态值 */
  status: TenantStatus;
  /** 状态显示名称 */
  displayName: string;
  /** 状态描述 */
  description: string;
  /** 是否为有效状态（可正常使用） */
  isValid: boolean;
  /** 是否为临时状态（会自动转换） */
  isTemporary: boolean;
  /** 允许的状态转换 */
  allowedTransitions: TenantStatus[];
  /** 状态颜色（用于UI显示） */
  color: string;
}

/**
 * @constant TENANT_STATUS_INFO
 * @description 租户状态详细信息映射
 */
export const TENANT_STATUS_INFO: Record<TenantStatus, TenantStatusInfo> = {
  [TenantStatus.PENDING]: {
    status: TenantStatus.PENDING,
    displayName: '待激活',
    description: '租户已创建但未激活，需要完成激活流程',
    isValid: false,
    isTemporary: true,
    allowedTransitions: [TenantStatus.ACTIVE, TenantStatus.DELETED],
    color: '#ffa500', // 橙色
  },
  [TenantStatus.ACTIVE]: {
    status: TenantStatus.ACTIVE,
    displayName: '激活',
    description: '租户正常使用，所有功能可用',
    isValid: true,
    isTemporary: false,
    allowedTransitions: [
      TenantStatus.SUSPENDED,
      TenantStatus.EXPIRED,
      TenantStatus.MAINTENANCE,
      TenantStatus.DELETED,
    ],
    color: '#28a745', // 绿色
  },
  [TenantStatus.SUSPENDED]: {
    status: TenantStatus.SUSPENDED,
    displayName: '暂停',
    description: '租户被临时暂停，部分功能受限',
    isValid: false,
    isTemporary: true,
    allowedTransitions: [TenantStatus.ACTIVE, TenantStatus.DELETED],
    color: '#ffc107', // 黄色
  },
  [TenantStatus.DELETED]: {
    status: TenantStatus.DELETED,
    displayName: '删除',
    description: '租户被标记删除，数据保留但功能不可用',
    isValid: false,
    isTemporary: false,
    allowedTransitions: [], // 删除状态不允许转换
    color: '#dc3545', // 红色
  },
  [TenantStatus.EXPIRED]: {
    status: TenantStatus.EXPIRED,
    displayName: '过期',
    description: '租户订阅已过期，需要续费',
    isValid: false,
    isTemporary: true,
    allowedTransitions: [
      TenantStatus.ACTIVE,
      TenantStatus.SUSPENDED,
      TenantStatus.DELETED,
    ],
    color: '#fd7e14', // 深橙色
  },
  [TenantStatus.MAINTENANCE]: {
    status: TenantStatus.MAINTENANCE,
    displayName: '维护',
    description: '租户处于系统维护中，功能暂时不可用',
    isValid: false,
    isTemporary: true,
    allowedTransitions: [TenantStatus.ACTIVE, TenantStatus.SUSPENDED],
    color: '#6c757d', // 灰色
  },
};

/**
 * @class TenantStatusHelper
 * @description 租户状态辅助工具类
 */
export class TenantStatusHelper {
  /**
   * @method isValidStatus
   * @description 检查状态是否为有效状态
   * @param status 租户状态
   * @returns {boolean} 是否为有效状态
   */
  static isValidStatus(status: TenantStatus): boolean {
    return TENANT_STATUS_INFO[status].isValid;
  }

  /**
   * @method isTemporaryStatus
   * @description 检查状态是否为临时状态
   * @param status 租户状态
   * @returns {boolean} 是否为临时状态
   */
  static isTemporaryStatus(status: TenantStatus): boolean {
    return TENANT_STATUS_INFO[status].isTemporary;
  }

  /**
   * @method canTransitionTo
   * @description 检查是否可以从当前状态转换到目标状态
   * @param fromStatus 当前状态
   * @param toStatus 目标状态
   * @returns {boolean} 是否可以转换
   */
  static canTransitionTo(
    fromStatus: TenantStatus,
    toStatus: TenantStatus,
  ): boolean {
    const allowedTransitions =
      TENANT_STATUS_INFO[fromStatus].allowedTransitions;
    return allowedTransitions.includes(toStatus);
  }

  /**
   * @method getAllowedTransitions
   * @description 获取当前状态允许转换的所有状态
   * @param status 当前状态
   * @returns {TenantStatus[]} 允许转换的状态列表
   */
  static getAllowedTransitions(status: TenantStatus): TenantStatus[] {
    return [...TENANT_STATUS_INFO[status].allowedTransitions];
  }

  /**
   * @method getStatusInfo
   * @description 获取状态详细信息
   * @param status 租户状态
   * @returns {TenantStatusInfo} 状态信息
   */
  static getStatusInfo(status: TenantStatus): TenantStatusInfo {
    return TENANT_STATUS_INFO[status];
  }

  /**
   * @method getDisplayName
   * @description 获取状态显示名称
   * @param status 租户状态
   * @returns {string} 状态显示名称
   */
  static getDisplayName(status: TenantStatus): string {
    return TENANT_STATUS_INFO[status].displayName;
  }

  /**
   * @method getDescription
   * @description 获取状态描述
   * @param status 租户状态
   * @returns {string} 状态描述
   */
  static getDescription(status: TenantStatus): string {
    return TENANT_STATUS_INFO[status].description;
  }

  /**
   * @method getColor
   * @description 获取状态颜色
   * @param status 租户状态
   * @returns {string} 状态颜色
   */
  static getColor(status: TenantStatus): string {
    return TENANT_STATUS_INFO[status].color;
  }

  /**
   * @method getValidStatuses
   * @description 获取所有有效状态
   * @returns {TenantStatus[]} 有效状态列表
   */
  static getValidStatuses(): TenantStatus[] {
    return Object.values(TenantStatus).filter(status =>
      TenantStatusHelper.isValidStatus(status),
    );
  }

  /**
   * @method getTemporaryStatuses
   * @description 获取所有临时状态
   * @returns {TenantStatus[]} 临时状态列表
   */
  static getTemporaryStatuses(): TenantStatus[] {
    return Object.values(TenantStatus).filter(status =>
      TenantStatusHelper.isTemporaryStatus(status),
    );
  }

  /**
   * @method getFinalStatuses
   * @description 获取所有最终状态（不可转换的状态）
   * @returns {TenantStatus[]} 最终状态列表
   */
  static getFinalStatuses(): TenantStatus[] {
    return Object.values(TenantStatus).filter(
      status => TENANT_STATUS_INFO[status].allowedTransitions.length === 0,
    );
  }
}
