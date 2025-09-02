/**
 * @enum UserStatus
 * @description
 * 用户状态枚举，定义用户在系统中的各种状态。
 *
 * 原理与机制：
 * 1. 使用TypeScript枚举类型确保类型安全
 * 2. 每个状态都有明确的业务含义和转换规则
 * 3. 状态转换遵循预定义的业务规则
 *
 * 功能与职责：
 * 1. 定义用户的所有可能状态
 * 2. 提供状态转换的业务规则
 * 3. 确保状态管理的一致性
 *
 * @example
 * ```typescript
 * if (user.status === UserStatus.ACTIVE) {
 *   // 处理激活用户逻辑
 * }
 * ```
 * @since 1.0.0
 */

/**
 * 用户状态枚举
 * @description 定义用户在系统中的各种状态
 */
export enum UserStatus {
  /**
   * 激活状态
   * @description 用户账户已激活，可以正常使用系统
   */
  ACTIVE = 'ACTIVE',

  /**
   * 未激活状态
   * @description 用户账户已创建但未激活，需要激活后才能使用
   */
  INACTIVE = 'INACTIVE',

  /**
   * 暂停状态
   * @description 用户账户被暂停，暂时无法使用系统
   */
  SUSPENDED = 'SUSPENDED',

  /**
   * 锁定状态
   * @description 用户账户被锁定，通常由于安全原因
   */
  LOCKED = 'LOCKED',

  /**
   * 待验证状态
   * @description 用户账户等待验证，如邮箱验证、手机验证等
   */
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',

  /**
   * 删除状态
   * @description 用户账户已删除，数据保留但无法访问
   */
  DELETED = 'DELETED',

  /**
   * 过期状态
   * @description 用户账户已过期，需要续期或重新激活
   */
  EXPIRED = 'EXPIRED'
}

/**
 * 用户状态转换规则
 * @description 定义用户状态之间的合法转换
 */
export const UserStatusTransitions = {
  [UserStatus.INACTIVE]: [UserStatus.ACTIVE, UserStatus.DELETED],
  [UserStatus.ACTIVE]: [UserStatus.SUSPENDED, UserStatus.LOCKED, UserStatus.DELETED, UserStatus.EXPIRED],
  [UserStatus.SUSPENDED]: [UserStatus.ACTIVE, UserStatus.DELETED],
  [UserStatus.LOCKED]: [UserStatus.ACTIVE, UserStatus.DELETED],
  [UserStatus.PENDING_VERIFICATION]: [UserStatus.ACTIVE, UserStatus.DELETED],
  [UserStatus.EXPIRED]: [UserStatus.ACTIVE, UserStatus.DELETED],
  [UserStatus.DELETED]: [] // 删除状态是终态，无法转换
} as const;

/**
 * 检查用户状态转换是否合法
 * @description 验证从当前状态转换到目标状态是否允许
 * @param {UserStatus} fromStatus 当前状态
 * @param {UserStatus} toStatus 目标状态
 * @returns {boolean} 如果转换合法返回true，否则返回false
 */
export function isStatusTransitionValid(
  fromStatus: UserStatus,
  toStatus: UserStatus
): boolean {
  const allowedTransitions = UserStatusTransitions[fromStatus];
  return (allowedTransitions as unknown as UserStatus[]).includes(toStatus);
}

/**
 * 获取用户状态的显示名称
 * @description 获取用户状态的中文显示名称
 * @param {UserStatus} status 用户状态
 * @returns {string} 状态的中文显示名称
 */
export function getUserStatusDisplayName(status: UserStatus): string {
  const displayNames: Record<UserStatus, string> = {
    [UserStatus.ACTIVE]: '激活',
    [UserStatus.INACTIVE]: '未激活',
    [UserStatus.SUSPENDED]: '暂停',
    [UserStatus.LOCKED]: '锁定',
    [UserStatus.PENDING_VERIFICATION]: '待验证',
    [UserStatus.DELETED]: '已删除',
    [UserStatus.EXPIRED]: '已过期'
  };
  return displayNames[status];
}

/**
 * 获取用户状态的颜色标识
 * @description 获取用户状态对应的UI颜色标识
 * @param {UserStatus} status 用户状态
 * @returns {string} 状态对应的颜色标识
 */
export function getUserStatusColor(status: UserStatus): string {
  const colors: Record<UserStatus, string> = {
    [UserStatus.ACTIVE]: 'success',
    [UserStatus.INACTIVE]: 'warning',
    [UserStatus.SUSPENDED]: 'warning',
    [UserStatus.LOCKED]: 'danger',
    [UserStatus.PENDING_VERIFICATION]: 'info',
    [UserStatus.DELETED]: 'secondary',
    [UserStatus.EXPIRED]: 'danger'
  };
  return colors[status];
}
