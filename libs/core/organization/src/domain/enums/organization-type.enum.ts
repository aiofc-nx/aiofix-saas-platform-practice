/**
 * @enum OrganizationType
 * @description
 * 组织类型枚举，定义不同类型的组织。
 *
 * 原理与机制：
 * 1. 使用TypeScript枚举类型确保类型安全
 * 2. 每个类型都有明确的业务含义和特征
 * 3. 支持不同类型的组织管理策略
 *
 * 功能与职责：
 * 1. 定义组织的所有可能类型
 * 2. 提供类型相关的业务规则
 * 3. 确保组织分类的一致性
 *
 * @example
 * ```typescript
 * if (organization.type === OrganizationType.BUSINESS) {
 *   // 处理业务组织逻辑
 * }
 * ```
 * @since 2.1.0
 */

/**
 * 组织类型枚举
 * @description 定义不同类型的组织
 */
export enum OrganizationType {
  /**
   * 业务组织
   * @description 负责具体业务运营的组织
   */
  BUSINESS = 'BUSINESS',

  /**
   * 职能部门
   * @description 提供支持服务的职能部门
   */
  FUNCTIONAL = 'FUNCTIONAL',

  /**
   * 项目组织
   * @description 为特定项目而成立的组织
   */
  PROJECT = 'PROJECT',

  /**
   * 矩阵组织
   * @description 矩阵式管理的组织
   */
  MATRIX = 'MATRIX',

  /**
   * 虚拟组织
   * @description 虚拟的、临时的组织
   */
  VIRTUAL = 'VIRTUAL',

  /**
   * 子公司
   * @description 作为子公司的组织
   */
  SUBSIDIARY = 'SUBSIDIARY',

  /**
   * 合资企业
   * @description 合资企业组织
   */
  JOINT_VENTURE = 'JOINT_VENTURE',

  /**
   * 合作伙伴
   * @description 合作伙伴组织
   */
  PARTNER = 'PARTNER',

  /**
   * 供应商
   * @description 供应商组织
   */
  SUPPLIER = 'SUPPLIER',

  /**
   * 客户组织
   * @description 客户组织
   */
  CUSTOMER = 'CUSTOMER',

  /**
   * 其他类型
   * @description 未分类的组织类型
   */
  OTHER = 'OTHER',
}

/**
 * 组织类型显示名称映射
 */
export const OrganizationTypeDisplayNames: Record<OrganizationType, string> = {
  [OrganizationType.BUSINESS]: '业务组织',
  [OrganizationType.FUNCTIONAL]: '职能部门',
  [OrganizationType.PROJECT]: '项目组织',
  [OrganizationType.MATRIX]: '矩阵组织',
  [OrganizationType.VIRTUAL]: '虚拟组织',
  [OrganizationType.SUBSIDIARY]: '子公司',
  [OrganizationType.JOINT_VENTURE]: '合资企业',
  [OrganizationType.PARTNER]: '合作伙伴',
  [OrganizationType.SUPPLIER]: '供应商',
  [OrganizationType.CUSTOMER]: '客户组织',
  [OrganizationType.OTHER]: '其他类型',
};

/**
 * 获取组织类型显示名称
 * @param type 组织类型
 * @returns 显示名称
 */
export function getOrganizationTypeDisplayName(type: OrganizationType): string {
  return OrganizationTypeDisplayNames[type] || type;
}

/**
 * 检查组织类型是否为内部组织类型
 * @param type 组织类型
 * @returns 是否为内部组织类型
 */
export function isInternalOrganizationType(type: OrganizationType): boolean {
  return [
    OrganizationType.BUSINESS,
    OrganizationType.FUNCTIONAL,
    OrganizationType.PROJECT,
    OrganizationType.MATRIX,
    OrganizationType.VIRTUAL,
    OrganizationType.SUBSIDIARY,
  ].includes(type);
}

/**
 * 检查组织类型是否为外部组织类型
 * @param type 组织类型
 * @returns 是否为外部组织类型
 */
export function isExternalOrganizationType(type: OrganizationType): boolean {
  return [
    OrganizationType.JOINT_VENTURE,
    OrganizationType.PARTNER,
    OrganizationType.SUPPLIER,
    OrganizationType.CUSTOMER,
  ].includes(type);
}

/**
 * 检查组织类型是否为临时组织类型
 * @param type 组织类型
 * @returns 是否为临时组织类型
 */
export function isTemporaryOrganizationType(type: OrganizationType): boolean {
  return [OrganizationType.PROJECT, OrganizationType.VIRTUAL].includes(type);
}

/**
 * 检查组织类型是否为永久组织类型
 * @param type 组织类型
 * @returns 是否为永久组织类型
 */
export function isPermanentOrganizationType(type: OrganizationType): boolean {
  return [
    OrganizationType.BUSINESS,
    OrganizationType.FUNCTIONAL,
    OrganizationType.MATRIX,
    OrganizationType.SUBSIDIARY,
    OrganizationType.JOINT_VENTURE,
    OrganizationType.PARTNER,
    OrganizationType.SUPPLIER,
    OrganizationType.CUSTOMER,
  ].includes(type);
}
