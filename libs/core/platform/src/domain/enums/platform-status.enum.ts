/**
 * @description 平台状态枚举
 * @author 江郎
 * @since 2.1.0
 */

/**
 * @enum PlatformStatus
 * @description 平台状态枚举
 *
 * 定义平台实例可能的状态，用于管理平台的生命周期
 *
 * @example
 * ```typescript
 * const status = PlatformStatus.ACTIVE;
 * console.log(status); // 'ACTIVE'
 * ```
 * @since 2.1.0
 */
export enum PlatformStatus {
  /**
   * 初始化状态 - 平台实例刚创建，尚未完成初始化
   */
  INITIALIZING = 'INITIALIZING',

  /**
   * 激活状态 - 平台实例正常运行，可以提供服务
   */
  ACTIVE = 'ACTIVE',

  /**
   * 维护状态 - 平台实例处于维护模式，暂停服务
   */
  MAINTENANCE = 'MAINTENANCE',

  /**
   * 暂停状态 - 平台实例被暂停，不提供服务
   */
  SUSPENDED = 'SUSPENDED',

  /**
   * 停用状态 - 平台实例被停用，不再提供服务
   */
  INACTIVE = 'INACTIVE',

  /**
   * 删除状态 - 平台实例被标记为删除
   */
  DELETED = 'DELETED',
}

/**
 * 平台状态显示名称映射
 */
export const PlatformStatusDisplayNames: Record<PlatformStatus, string> = {
  [PlatformStatus.INITIALIZING]: '初始化中',
  [PlatformStatus.ACTIVE]: '运行中',
  [PlatformStatus.MAINTENANCE]: '维护中',
  [PlatformStatus.SUSPENDED]: '已暂停',
  [PlatformStatus.INACTIVE]: '已停用',
  [PlatformStatus.DELETED]: '已删除',
};

/**
 * 获取平台状态显示名称
 * @param status 平台状态
 * @returns 显示名称
 */
export function getPlatformStatusDisplayName(status: PlatformStatus): string {
  return PlatformStatusDisplayNames[status] || status;
}

/**
 * 检查平台状态是否为有效状态（非删除状态）
 * @param status 平台状态
 * @returns 是否为有效状态
 */
export function isValidPlatformStatus(status: PlatformStatus): boolean {
  return status !== PlatformStatus.DELETED;
}

/**
 * 检查平台状态是否为活跃状态（可以提供服务）
 * @param status 平台状态
 * @returns 是否为活跃状态
 */
export function isActivePlatformStatus(status: PlatformStatus): boolean {
  return status === PlatformStatus.ACTIVE;
}

/**
 * 检查平台状态是否可以提供服务
 * @param status 平台状态
 * @returns 是否可以提供服务
 */
export function canProvideService(status: PlatformStatus): boolean {
  return status === PlatformStatus.ACTIVE;
}
