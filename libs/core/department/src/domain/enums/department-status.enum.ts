/**
 * @enum DepartmentStatus
 * @description
 * 部门状态枚举，定义部门在系统中的各种状态。
 *
 * 原理与机制：
 * 1. 使用TypeScript枚举类型确保类型安全
 * 2. 每个状态都有明确的业务含义和转换规则
 * 3. 状态转换遵循预定义的业务规则
 *
 * 功能与职责：
 * 1. 定义部门的所有可能状态
 * 2. 提供状态转换的业务规则
 * 3. 确保状态管理的一致性
 *
 * @example
 * ```typescript
 * if (department.status === DepartmentStatus.ACTIVE) {
 *   // 处理激活部门逻辑
 * }
 * ```
 * @since 2.1.0
 */

/**
 * 部门状态枚举
 * @description 定义部门在系统中的各种状态
 */
export enum DepartmentStatus {
  /**
   * 初始化状态
   * @description 部门刚创建，尚未完成初始化
   */
  INITIALIZING = 'INITIALIZING',

  /**
   * 激活状态
   * @description 部门已激活，可以正常使用系统
   */
  ACTIVE = 'ACTIVE',

  /**
   * 暂停状态
   * @description 部门被暂停，暂时无法使用系统
   */
  SUSPENDED = 'SUSPENDED',

  /**
   * 停用状态
   * @description 部门被停用，不再提供服务
   */
  INACTIVE = 'INACTIVE',

  /**
   * 维护状态
   * @description 部门处于维护模式，暂停服务
   */
  MAINTENANCE = 'MAINTENANCE',

  /**
   * 删除状态
   * @description 部门被标记为删除
   */
  DELETED = 'DELETED',
}

/**
 * 部门状态显示名称映射
 */
export const DepartmentStatusDisplayNames: Record<DepartmentStatus, string> = {
  [DepartmentStatus.INITIALIZING]: '初始化中',
  [DepartmentStatus.ACTIVE]: '运行中',
  [DepartmentStatus.SUSPENDED]: '已暂停',
  [DepartmentStatus.INACTIVE]: '已停用',
  [DepartmentStatus.MAINTENANCE]: '维护中',
  [DepartmentStatus.DELETED]: '已删除',
};

/**
 * 获取部门状态显示名称
 * @param status 部门状态
 * @returns 显示名称
 */
export function getDepartmentStatusDisplayName(
  status: DepartmentStatus,
): string {
  return DepartmentStatusDisplayNames[status] || status;
}

/**
 * 检查部门状态是否为有效状态（非删除状态）
 * @param status 部门状态
 * @returns 是否为有效状态
 */
export function isValidDepartmentStatus(status: DepartmentStatus): boolean {
  return status !== DepartmentStatus.DELETED;
}

/**
 * 检查部门状态是否为活跃状态（可以提供服务）
 * @param status 部门状态
 * @returns 是否为活跃状态
 */
export function isActiveDepartmentStatus(status: DepartmentStatus): boolean {
  return status === DepartmentStatus.ACTIVE;
}

/**
 * 检查部门状态是否可以提供服务
 * @param status 部门状态
 * @returns 是否可以提供服务
 */
export function canProvideService(status: DepartmentStatus): boolean {
  return status === DepartmentStatus.ACTIVE;
}

/**
 * 检查部门状态是否可以转换到目标状态
 * @param currentStatus 当前状态
 * @param targetStatus 目标状态
 * @returns 是否可以转换
 */
export function canTransitionTo(
  currentStatus: DepartmentStatus,
  targetStatus: DepartmentStatus,
): boolean {
  const validTransitions: Record<DepartmentStatus, DepartmentStatus[]> = {
    [DepartmentStatus.INITIALIZING]: [
      DepartmentStatus.ACTIVE,
      DepartmentStatus.INACTIVE,
    ],
    [DepartmentStatus.ACTIVE]: [
      DepartmentStatus.SUSPENDED,
      DepartmentStatus.MAINTENANCE,
      DepartmentStatus.INACTIVE,
    ],
    [DepartmentStatus.MAINTENANCE]: [
      DepartmentStatus.ACTIVE,
      DepartmentStatus.SUSPENDED,
      DepartmentStatus.INACTIVE,
    ],
    [DepartmentStatus.SUSPENDED]: [
      DepartmentStatus.ACTIVE,
      DepartmentStatus.MAINTENANCE,
      DepartmentStatus.INACTIVE,
    ],
    [DepartmentStatus.INACTIVE]: [DepartmentStatus.ACTIVE],
    [DepartmentStatus.DELETED]: [], // 删除状态不能转换到其他状态
  };

  return validTransitions[currentStatus].includes(targetStatus);
}
