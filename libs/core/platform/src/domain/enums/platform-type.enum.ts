/**
 * @description 平台类型枚举
 * @author 江郎
 * @since 2.1.0
 */

/**
 * @enum PlatformType
 * @description 平台类型枚举
 *
 * 定义不同类型的平台实例，用于区分平台的功能和用途
 *
 * @example
 * ```typescript
 * const type = PlatformType.SAAS;
 * console.log(type); // 'SAAS'
 * ```
 * @since 2.1.0
 */
export enum PlatformType {
  /**
   * SaaS平台 - 软件即服务平台
   */
  SAAS = 'SAAS',

  /**
   * PaaS平台 - 平台即服务平台
   */
  PAAS = 'PAAS',

  /**
   * IaaS平台 - 基础设施即服务平台
   */
  IAAS = 'IAAS',

  /**
   * 混合云平台 - 混合云管理平台
   */
  HYBRID_CLOUD = 'HYBRID_CLOUD',

  /**
   * 私有云平台 - 私有云管理平台
   */
  PRIVATE_CLOUD = 'PRIVATE_CLOUD',

  /**
   * 公有云平台 - 公有云管理平台
   */
  PUBLIC_CLOUD = 'PUBLIC_CLOUD',

  /**
   * 边缘计算平台 - 边缘计算管理平台
   */
  EDGE_COMPUTING = 'EDGE_COMPUTING',

  /**
   * 容器平台 - 容器编排和管理平台
   */
  CONTAINER = 'CONTAINER',

  /**
   * 微服务平台 - 微服务治理平台
   */
  MICROSERVICE = 'MICROSERVICE',

  /**
   * 数据平台 - 数据管理和分析平台
   */
  DATA_PLATFORM = 'DATA_PLATFORM',

  /**
   * AI平台 - 人工智能服务平台
   */
  AI_PLATFORM = 'AI_PLATFORM',

  /**
   * IoT平台 - 物联网管理平台
   */
  IOT_PLATFORM = 'IOT_PLATFORM',

  /**
   * 开发平台 - 开发工具和CI/CD平台
   */
  DEVELOPMENT = 'DEVELOPMENT',

  /**
   * 测试平台 - 测试管理和自动化平台
   */
  TESTING = 'TESTING',

  /**
   * 监控平台 - 系统监控和运维平台
   */
  MONITORING = 'MONITORING',

  /**
   * 安全平台 - 安全管理和防护平台
   */
  SECURITY = 'SECURITY',

  /**
   * 其他类型 - 未分类的平台类型
   */
  OTHER = 'OTHER',
}

/**
 * 平台类型显示名称映射
 */
export const PlatformTypeDisplayNames: Record<PlatformType, string> = {
  [PlatformType.SAAS]: 'SaaS平台',
  [PlatformType.PAAS]: 'PaaS平台',
  [PlatformType.IAAS]: 'IaaS平台',
  [PlatformType.HYBRID_CLOUD]: '混合云平台',
  [PlatformType.PRIVATE_CLOUD]: '私有云平台',
  [PlatformType.PUBLIC_CLOUD]: '公有云平台',
  [PlatformType.EDGE_COMPUTING]: '边缘计算平台',
  [PlatformType.CONTAINER]: '容器平台',
  [PlatformType.MICROSERVICE]: '微服务平台',
  [PlatformType.DATA_PLATFORM]: '数据平台',
  [PlatformType.AI_PLATFORM]: 'AI平台',
  [PlatformType.IOT_PLATFORM]: 'IoT平台',
  [PlatformType.DEVELOPMENT]: '开发平台',
  [PlatformType.TESTING]: '测试平台',
  [PlatformType.MONITORING]: '监控平台',
  [PlatformType.SECURITY]: '安全平台',
  [PlatformType.OTHER]: '其他类型',
};

/**
 * 获取平台类型显示名称
 * @param type 平台类型
 * @returns 显示名称
 */
export function getPlatformTypeDisplayName(type: PlatformType): string {
  return PlatformTypeDisplayNames[type] || type;
}

/**
 * 检查平台类型是否为云平台类型
 * @param type 平台类型
 * @returns 是否为云平台类型
 */
export function isCloudPlatformType(type: PlatformType): boolean {
  return [
    PlatformType.SAAS,
    PlatformType.PAAS,
    PlatformType.IAAS,
    PlatformType.HYBRID_CLOUD,
    PlatformType.PRIVATE_CLOUD,
    PlatformType.PUBLIC_CLOUD,
  ].includes(type);
}

/**
 * 检查平台类型是否为基础设施类型
 * @param type 平台类型
 * @returns 是否为基础设施类型
 */
export function isInfrastructurePlatformType(type: PlatformType): boolean {
  return [
    PlatformType.IAAS,
    PlatformType.CONTAINER,
    PlatformType.EDGE_COMPUTING,
  ].includes(type);
}

/**
 * 检查平台类型是否为应用平台类型
 * @param type 平台类型
 * @returns 是否为应用平台类型
 */
export function isApplicationPlatformType(type: PlatformType): boolean {
  return [
    PlatformType.SAAS,
    PlatformType.PAAS,
    PlatformType.MICROSERVICE,
    PlatformType.DATA_PLATFORM,
    PlatformType.AI_PLATFORM,
    PlatformType.IOT_PLATFORM,
  ].includes(type);
}
