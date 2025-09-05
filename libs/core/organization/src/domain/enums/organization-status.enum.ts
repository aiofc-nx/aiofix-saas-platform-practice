/**
 * @enum OrganizationStatus
 * @description
 * 组织状态枚举，定义组织在系统中的各种状态。
 *
 * 原理与机制：
 * 1. 使用TypeScript枚举类型确保类型安全
 * 2. 每个状态都有明确的业务含义和转换规则
 * 3. 状态转换遵循预定义的业务规则
 *
 * 功能与职责：
 * 1. 定义组织的所有可能状态
 * 2. 提供状态转换的业务规则
 * 3. 确保状态管理的一致性
 *
 * @example
 * ```typescript
 * if (organization.status === OrganizationStatus.ACTIVE) {
 *   // 处理激活组织逻辑
 * }
 * ```
 * @since 2.1.0
 */

/**
 * 组织状态枚举
 * @description 定义组织在系统中的各种状态
 */
export enum OrganizationStatus {
  /**
   * 初始化状态
   * @description 组织刚创建，尚未完成初始化
   */
  INITIALIZING = 'INITIALIZING',

  /**
   * 激活状态
   * @description 组织已激活，可以正常使用系统
   */
  ACTIVE = 'ACTIVE',

  /**
   * 暂停状态
   * @description 组织被暂停，暂时无法使用系统
   */
  SUSPENDED = 'SUSPENDED',

  /**
   * 停用状态
   * @description 组织被停用，不再提供服务
   */
  INACTIVE = 'INACTIVE',

  /**
   * 维护状态
   * @description 组织处于维护模式，暂停服务
   */
  MAINTENANCE = 'MAINTENANCE',

  /**
   * 删除状态
   * @description 组织被标记为删除
   */
  DELETED = 'DELETED',
}

/**
 * 组织状态显示名称映射
 */
export const OrganizationStatusDisplayNames: Record<
  OrganizationStatus,
  string
> = {
  [OrganizationStatus.INITIALIZING]: '初始化中',
  [OrganizationStatus.ACTIVE]: '运行中',
  [OrganizationStatus.SUSPENDED]: '已暂停',
  [OrganizationStatus.INACTIVE]: '已停用',
  [OrganizationStatus.MAINTENANCE]: '维护中',
  [OrganizationStatus.DELETED]: '已删除',
};

/**
 * 获取组织状态显示名称
 * @param status 组织状态
 * @returns 显示名称
 */
export function getOrganizationStatusDisplayName(
  status: OrganizationStatus,
): string {
  return OrganizationStatusDisplayNames[status] || status;
}

/**
 * 检查组织状态是否为有效状态（非删除状态）
 * @param status 组织状态
 * @returns 是否为有效状态
 */
export function isValidOrganizationStatus(status: OrganizationStatus): boolean {
  return status !== OrganizationStatus.DELETED;
}

/**
 * 检查组织状态是否为活跃状态（可以提供服务）
 * @param status 组织状态
 * @returns 是否为活跃状态
 */
export function isActiveOrganizationStatus(
  status: OrganizationStatus,
): boolean {
  return status === OrganizationStatus.ACTIVE;
}

/**
 * 检查组织状态是否可以提供服务
 * @param status 组织状态
 * @returns 是否可以提供服务
 */
export function canProvideService(status: OrganizationStatus): boolean {
  return status === OrganizationStatus.ACTIVE;
}

/**
 * 检查组织状态是否可以转换到目标状态
 * @param currentStatus 当前状态
 * @param targetStatus 目标状态
 * @returns 是否可以转换
 */
export function canTransitionTo(
  currentStatus: OrganizationStatus,
  targetStatus: OrganizationStatus,
): boolean {
  const validTransitions: Record<OrganizationStatus, OrganizationStatus[]> = {
    [OrganizationStatus.INITIALIZING]: [
      OrganizationStatus.ACTIVE,
      OrganizationStatus.INACTIVE,
    ],
    [OrganizationStatus.ACTIVE]: [
      OrganizationStatus.SUSPENDED,
      OrganizationStatus.MAINTENANCE,
      OrganizationStatus.INACTIVE,
    ],
    [OrganizationStatus.MAINTENANCE]: [
      OrganizationStatus.ACTIVE,
      OrganizationStatus.SUSPENDED,
      OrganizationStatus.INACTIVE,
    ],
    [OrganizationStatus.SUSPENDED]: [
      OrganizationStatus.ACTIVE,
      OrganizationStatus.MAINTENANCE,
      OrganizationStatus.INACTIVE,
    ],
    [OrganizationStatus.INACTIVE]: [OrganizationStatus.ACTIVE],
    [OrganizationStatus.DELETED]: [], // 删除状态不能转换到其他状态
  };

  return validTransitions[currentStatus].includes(targetStatus);
}
