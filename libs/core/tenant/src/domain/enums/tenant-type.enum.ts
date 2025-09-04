/**
 * @file tenant-type.enum.ts
 * @description 租户类型枚举
 *
 * 该枚举定义了租户的各种类型，用于租户分类和功能配置。
 * 租户类型是业务特定的，属于租户模块内部使用。
 */

/**
 * @enum TenantType
 * @description 租户类型枚举
 *
 * 定义了租户的不同类型：
 * - ENTERPRISE: 企业级租户，功能完整，支持复杂配置
 * - ORGANIZATION: 社团组织租户，功能适中，适合非营利组织
 * - PARTNERSHIP: 合伙团队租户，协作功能，适合团队合作
 * - PERSONAL: 个人租户，基础功能，适合个人用户
 */
export enum TenantType {
  /**
   * 企业级租户
   * 功能完整，支持复杂配置，适合大型企业
   */
  ENTERPRISE = 'enterprise',

  /**
   * 社团组织租户
   * 功能适中，适合非营利组织、社团等
   */
  ORGANIZATION = 'organization',

  /**
   * 合伙团队租户
   * 协作功能，适合团队合作、项目组等
   */
  PARTNERSHIP = 'partnership',

  /**
   * 个人租户
   * 基础功能，适合个人用户
   */
  PERSONAL = 'personal',
}

/**
 * @interface TenantTypeInfo
 * @description 租户类型信息接口
 */
export interface TenantTypeInfo {
  /** 类型值 */
  type: TenantType;
  /** 类型显示名称 */
  displayName: string;
  /** 类型描述 */
  description: string;
  /** 最大用户数量 */
  maxUsers: number;
  /** 最大组织数量 */
  maxOrganizations: number;
  /** 最大存储空间（GB） */
  maxStorageGB: number;
  /** 是否支持高级功能 */
  supportsAdvancedFeatures: boolean;
  /** 是否支持自定义配置 */
  supportsCustomization: boolean;
  /** 是否支持API访问 */
  supportsApiAccess: boolean;
  /** 是否支持SSO */
  supportsSSO: boolean;
  /** 价格等级 */
  priceTier: 'basic' | 'standard' | 'premium' | 'enterprise';
  /** 类型颜色（用于UI显示） */
  color: string;
}

/**
 * @constant TENANT_TYPE_INFO
 * @description 租户类型详细信息映射
 */
export const TENANT_TYPE_INFO: Record<TenantType, TenantTypeInfo> = {
  [TenantType.ENTERPRISE]: {
    type: TenantType.ENTERPRISE,
    displayName: '企业级',
    description: '功能完整，支持复杂配置，适合大型企业',
    maxUsers: 10000,
    maxOrganizations: 100,
    maxStorageGB: 1000,
    supportsAdvancedFeatures: true,
    supportsCustomization: true,
    supportsApiAccess: true,
    supportsSSO: true,
    priceTier: 'enterprise',
    color: '#007bff', // 蓝色
  },
  [TenantType.ORGANIZATION]: {
    type: TenantType.ORGANIZATION,
    displayName: '社团组织',
    description: '功能适中，适合非营利组织、社团等',
    maxUsers: 1000,
    maxOrganizations: 20,
    maxStorageGB: 100,
    supportsAdvancedFeatures: true,
    supportsCustomization: true,
    supportsApiAccess: true,
    supportsSSO: false,
    priceTier: 'premium',
    color: '#28a745', // 绿色
  },
  [TenantType.PARTNERSHIP]: {
    type: TenantType.PARTNERSHIP,
    displayName: '合伙团队',
    description: '协作功能，适合团队合作、项目组等',
    maxUsers: 500,
    maxOrganizations: 10,
    maxStorageGB: 50,
    supportsAdvancedFeatures: true,
    supportsCustomization: false,
    supportsApiAccess: true,
    supportsSSO: false,
    priceTier: 'standard',
    color: '#fd7e14', // 橙色
  },
  [TenantType.PERSONAL]: {
    type: TenantType.PERSONAL,
    displayName: '个人',
    description: '基础功能，适合个人用户',
    maxUsers: 10,
    maxOrganizations: 1,
    maxStorageGB: 10,
    supportsAdvancedFeatures: false,
    supportsCustomization: false,
    supportsApiAccess: false,
    supportsSSO: false,
    priceTier: 'basic',
    color: '#6c757d', // 灰色
  },
};

/**
 * @class TenantTypeHelper
 * @description 租户类型辅助工具类
 */
export class TenantTypeHelper {
  /**
   * @method getTypeInfo
   * @description 获取类型详细信息
   * @param type 租户类型
   * @returns {TenantTypeInfo} 类型信息
   */
  static getTypeInfo(type: TenantType): TenantTypeInfo {
    return TENANT_TYPE_INFO[type];
  }

  /**
   * @method getDisplayName
   * @description 获取类型显示名称
   * @param type 租户类型
   * @returns {string} 类型显示名称
   */
  static getDisplayName(type: TenantType): string {
    return TENANT_TYPE_INFO[type].displayName;
  }

  /**
   * @method getDescription
   * @description 获取类型描述
   * @param type 租户类型
   * @returns {string} 类型描述
   */
  static getDescription(type: TenantType): string {
    return TENANT_TYPE_INFO[type].description;
  }

  /**
   * @method getMaxUsers
   * @description 获取最大用户数量
   * @param type 租户类型
   * @returns {number} 最大用户数量
   */
  static getMaxUsers(type: TenantType): number {
    return TENANT_TYPE_INFO[type].maxUsers;
  }

  /**
   * @method getMaxOrganizations
   * @description 获取最大组织数量
   * @param type 租户类型
   * @returns {number} 最大组织数量
   */
  static getMaxOrganizations(type: TenantType): number {
    return TENANT_TYPE_INFO[type].maxOrganizations;
  }

  /**
   * @method getMaxStorage
   * @description 获取最大存储空间
   * @param type 租户类型
   * @returns {number} 最大存储空间（GB）
   */
  static getMaxStorage(type: TenantType): number {
    return TENANT_TYPE_INFO[type].maxStorageGB;
  }

  /**
   * @method supportsFeature
   * @description 检查是否支持特定功能
   * @param type 租户类型
   * @param feature 功能名称
   * @returns {boolean} 是否支持
   */
  static supportsFeature(
    type: TenantType,
    feature: keyof Pick<
      TenantTypeInfo,
      | 'supportsAdvancedFeatures'
      | 'supportsCustomization'
      | 'supportsApiAccess'
      | 'supportsSSO'
    >,
  ): boolean {
    return TENANT_TYPE_INFO[type][feature];
  }

  /**
   * @method getPriceTier
   * @description 获取价格等级
   * @param type 租户类型
   * @returns {string} 价格等级
   */
  static getPriceTier(type: TenantType): string {
    return TENANT_TYPE_INFO[type].priceTier;
  }

  /**
   * @method getColor
   * @description 获取类型颜色
   * @param type 租户类型
   * @returns {string} 类型颜色
   */
  static getColor(type: TenantType): string {
    return TENANT_TYPE_INFO[type].color;
  }

  /**
   * @method getTypesByPriceTier
   * @description 根据价格等级获取类型列表
   * @param priceTier 价格等级
   * @returns {TenantType[]} 类型列表
   */
  static getTypesByPriceTier(priceTier: string): TenantType[] {
    return Object.values(TenantType).filter(
      type => TENANT_TYPE_INFO[type].priceTier === priceTier,
    );
  }

  /**
   * @method getTypesByFeature
   * @description 根据功能支持获取类型列表
   * @param feature 功能名称
   * @returns {TenantType[]} 类型列表
   */
  static getTypesByFeature(
    feature: keyof Pick<
      TenantTypeInfo,
      | 'supportsAdvancedFeatures'
      | 'supportsCustomization'
      | 'supportsApiAccess'
      | 'supportsSSO'
    >,
  ): TenantType[] {
    return Object.values(TenantType).filter(
      type => TENANT_TYPE_INFO[type][feature],
    );
  }

  /**
   * @method isEnterprise
   * @description 检查是否为企业级租户
   * @param type 租户类型
   * @returns {boolean} 是否为企业级
   */
  static isEnterprise(type: TenantType): boolean {
    return type === TenantType.ENTERPRISE;
  }

  /**
   * @method isOrganization
   * @description 检查是否为社团组织租户
   * @param type 租户类型
   * @returns {boolean} 是否为社团组织
   */
  static isOrganization(type: TenantType): boolean {
    return type === TenantType.ORGANIZATION;
  }

  /**
   * @method isPartnership
   * @description 检查是否为合伙团队租户
   * @param type 租户类型
   * @returns {boolean} 是否为合伙团队
   */
  static isPartnership(type: TenantType): boolean {
    return type === TenantType.PARTNERSHIP;
  }

  /**
   * @method canUpgrade
   * @description 检查是否可以升级到指定类型
   * @param fromType 当前类型
   * @param toType 目标类型
   * @returns {boolean} 是否可以升级
   */
  static canUpgrade(fromType: TenantType, toType: TenantType): boolean {
    // 个人租户可以升级到合伙团队、社团组织或企业级
    if (fromType === TenantType.PERSONAL) {
      return (
        toType === TenantType.PARTNERSHIP ||
        toType === TenantType.ORGANIZATION ||
        toType === TenantType.ENTERPRISE
      );
    }

    // 合伙团队可以升级到社团组织或企业级
    if (fromType === TenantType.PARTNERSHIP) {
      return (
        toType === TenantType.ORGANIZATION || toType === TenantType.ENTERPRISE
      );
    }

    // 社团组织可以升级到企业级
    if (fromType === TenantType.ORGANIZATION) {
      return toType === TenantType.ENTERPRISE;
    }

    // 企业级不能升级
    return false;
  }
}
