/**
 * @enum UserType
 * @description
 * 用户类型枚举，定义用户在系统中的类型分类。
 *
 * 原理与机制：
 * 1. 使用TypeScript枚举类型确保类型安全
 * 2. 每种类型都有明确的业务含义和权限范围
 * 3. 类型决定了用户的数据隔离级别和访问权限
 *
 * 功能与职责：
 * 1. 定义用户的所有可能类型
 * 2. 提供类型相关的业务规则
 * 3. 确保类型管理的一致性
 *
 * @example
 * ```typescript
 * if (user.userType === UserType.PLATFORM_USER) {
 *   // 处理平台用户逻辑
 * }
 * ```
 * @since 1.0.0
 */

/**
 * 用户类型枚举
 * @description 定义用户在系统中的类型分类
 */
export enum UserType {
  /**
   * 平台用户
   * @description 平台级用户，可以管理整个SaaS平台
   */
  PLATFORM_USER = 'PLATFORM_USER',

  /**
   * 租户用户
   * @description 租户级用户，属于特定租户
   */
  TENANT_USER = 'TENANT_USER',

  /**
   * 系统用户
   * @description 系统级用户，用于系统内部操作
   */
  SYSTEM_USER = 'SYSTEM_USER',

  /**
   * 服务用户
   * @description 服务级用户，用于服务间通信
   */
  SERVICE_USER = 'SERVICE_USER',

  /**
   * 访客用户
   * @description 访客级用户，具有有限的访问权限
   */
  GUEST_USER = 'GUEST_USER'
}

/**
 * 用户类型权限映射
 * @description 定义每种用户类型对应的权限级别
 */
export const UserTypePermissions = {
  [UserType.PLATFORM_USER]: {
    level: 'PLATFORM',
    description: '平台级权限，可以管理整个系统',
    canManageTenants: true,
    canManageUsers: true,
    canAccessAllData: true
  },
  [UserType.TENANT_USER]: {
    level: 'TENANT',
    description: '租户级权限，可以管理租户内资源',
    canManageTenants: false,
    canManageUsers: true,
    canAccessAllData: false
  },
  [UserType.SYSTEM_USER]: {
    level: 'SYSTEM',
    description: '系统级权限，用于系统内部操作',
    canManageTenants: false,
    canManageUsers: false,
    canAccessAllData: true
  },
  [UserType.SERVICE_USER]: {
    level: 'SERVICE',
    description: '服务级权限，用于服务间通信',
    canManageTenants: false,
    canManageUsers: false,
    canAccessAllData: false
  },
  [UserType.GUEST_USER]: {
    level: 'GUEST',
    description: '访客级权限，具有有限的访问权限',
    canManageTenants: false,
    canManageUsers: false,
    canAccessAllData: false
  }
} as const;

/**
 * 获取用户类型的显示名称
 * @description 获取用户类型的中文显示名称
 * @param {UserType} userType 用户类型
 * @returns {string} 类型的中文显示名称
 */
export function getUserTypeDisplayName(userType: UserType): string {
  const displayNames: Record<UserType, string> = {
    [UserType.PLATFORM_USER]: '平台用户',
    [UserType.TENANT_USER]: '租户用户',
    [UserType.SYSTEM_USER]: '系统用户',
    [UserType.SERVICE_USER]: '服务用户',
    [UserType.GUEST_USER]: '访客用户'
  };
  return displayNames[userType];
}

/**
 * 获取用户类型的权限级别
 * @description 获取用户类型对应的权限级别
 * @param {UserType} userType 用户类型
 * @returns {string} 权限级别
 */
export function getUserTypePermissionLevel(userType: UserType): string {
  return UserTypePermissions[userType].level;
}

/**
 * 检查用户类型是否可以管理租户
 * @description 判断指定用户类型是否具有管理租户的权限
 * @param {UserType} userType 用户类型
 * @returns {boolean} 如果可以管理租户返回true，否则返回false
 */
export function canUserTypeManageTenants(userType: UserType): boolean {
  return UserTypePermissions[userType].canManageTenants;
}

/**
 * 检查用户类型是否可以管理用户
 * @description 判断指定用户类型是否具有管理用户的权限
 * @param {UserType} userType 用户类型
 * @returns {boolean} 如果可以管理用户返回true，否则返回false
 */
export function canUserTypeManageUsers(userType: UserType): boolean {
  return UserTypePermissions[userType].canManageUsers;
}

/**
 * 检查用户类型是否可以访问所有数据
 * @description 判断指定用户类型是否具有访问所有数据的权限
 * @param {UserType} userType 用户类型
 * @returns {boolean} 如果可以访问所有数据返回true，否则返回false
 */
export function canUserTypeAccessAllData(userType: UserType): boolean {
  return UserTypePermissions[userType].canAccessAllData;
}
