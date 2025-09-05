/**
 * @enum DepartmentType
 * @description
 * 部门类型枚举，定义部门在组织中的不同类型。
 *
 * 原理与机制：
 * 1. 使用TypeScript枚举类型确保类型安全
 * 2. 每个类型都有明确的业务含义和用途
 * 3. 支持不同类型的部门有不同的权限和功能
 *
 * 功能与职责：
 * 1. 定义部门的所有可能类型
 * 2. 提供类型相关的业务规则
 * 3. 确保部门分类的一致性
 *
 * @example
 * ```typescript
 * if (department.type === DepartmentType.BUSINESS) {
 *   // 处理业务部门逻辑
 * }
 * ```
 * @since 2.1.0
 */

/**
 * 部门类型枚举
 * @description 定义部门在组织中的不同类型
 */
export enum DepartmentType {
  /**
   * 业务部门
   * @description 负责具体业务运营的部门
   */
  BUSINESS = 'BUSINESS',

  /**
   * 职能部门
   * @description 提供支持服务的部门
   */
  FUNCTIONAL = 'FUNCTIONAL',

  /**
   * 技术部门
   * @description 负责技术开发和维护的部门
   */
  TECHNICAL = 'TECHNICAL',

  /**
   * 管理部门
   * @description 负责管理和决策的部门
   */
  MANAGEMENT = 'MANAGEMENT',

  /**
   * 财务部门
   * @description 负责财务管理的部门
   */
  FINANCE = 'FINANCE',

  /**
   * 人力资源部门
   * @description 负责人力资源管理的部门
   */
  HUMAN_RESOURCES = 'HUMAN_RESOURCES',

  /**
   * 市场部门
   * @description 负责市场推广的部门
   */
  MARKETING = 'MARKETING',

  /**
   * 销售部门
   * @description 负责销售业务的部门
   */
  SALES = 'SALES',

  /**
   * 客户服务部门
   * @description 负责客户服务的部门
   */
  CUSTOMER_SERVICE = 'CUSTOMER_SERVICE',

  /**
   * 运营部门
   * @description 负责日常运营的部门
   */
  OPERATIONS = 'OPERATIONS',

  /**
   * 其他部门
   * @description 其他类型的部门
   */
  OTHER = 'OTHER',
}

/**
 * 部门类型显示名称映射
 */
export const DepartmentTypeDisplayNames: Record<DepartmentType, string> = {
  [DepartmentType.BUSINESS]: '业务部门',
  [DepartmentType.FUNCTIONAL]: '职能部门',
  [DepartmentType.TECHNICAL]: '技术部门',
  [DepartmentType.MANAGEMENT]: '管理部门',
  [DepartmentType.FINANCE]: '财务部门',
  [DepartmentType.HUMAN_RESOURCES]: '人力资源部门',
  [DepartmentType.MARKETING]: '市场部门',
  [DepartmentType.SALES]: '销售部门',
  [DepartmentType.CUSTOMER_SERVICE]: '客户服务部门',
  [DepartmentType.OPERATIONS]: '运营部门',
  [DepartmentType.OTHER]: '其他部门',
};

/**
 * 获取部门类型显示名称
 * @param type 部门类型
 * @returns 显示名称
 */
export function getDepartmentTypeDisplayName(type: DepartmentType): string {
  return DepartmentTypeDisplayNames[type] || type;
}

/**
 * 检查部门类型是否为业务部门
 * @param type 部门类型
 * @returns 是否为业务部门
 */
export function isBusinessDepartment(type: DepartmentType): boolean {
  return type === DepartmentType.BUSINESS;
}

/**
 * 检查部门类型是否为职能部门
 * @param type 部门类型
 * @returns 是否为职能部门
 */
export function isFunctionalDepartment(type: DepartmentType): boolean {
  return type === DepartmentType.FUNCTIONAL;
}

/**
 * 检查部门类型是否为技术部门
 * @param type 部门类型
 * @returns 是否为技术部门
 */
export function isTechnicalDepartment(type: DepartmentType): boolean {
  return type === DepartmentType.TECHNICAL;
}

/**
 * 检查部门类型是否为管理部门
 * @param type 部门类型
 * @returns 是否为管理部门
 */
export function isManagementDepartment(type: DepartmentType): boolean {
  return type === DepartmentType.MANAGEMENT;
}
