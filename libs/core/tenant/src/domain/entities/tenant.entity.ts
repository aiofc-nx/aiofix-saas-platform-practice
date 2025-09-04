/**
 * @class TenantEntity
 * @description
 * 租户领域实体，代表系统中的租户对象，包含租户的核心属性和行为。
 *
 * 原理与机制：
 * 1. 作为领域层的实体，TenantEntity聚合了与租户相关的属性（如名称、代码、域名、状态等）和业务方法（如激活、暂停、删除等）。
 * 2. 继承DataIsolationAwareEntity，支持多层级数据隔离，租户本身是平台级数据隔离。
 * 3. 实体的唯一性由id属性保证，所有与租户相关的业务规则应在该实体内实现，确保领域一致性。
 * 4. 使用值对象封装复杂属性，确保领域概念的完整性。
 *
 * 功能与职责：
 * 1. 表达租户的核心业务属性和行为
 * 2. 封装与租户相关的业务规则
 * 3. 保证租户实体的一致性和完整性
 * 4. 提供领域事件发布能力
 * 5. 支持多层级数据隔离和访问控制
 *
 * @example
 * ```typescript
 * const tenant = new TenantEntity(
 *   'tenant-123',
 *   'Acme Corporation',
 *   'ACME',
 *   'acme.example.com',
 *   TenantType.ENTERPRISE,
 *   TenantStatus.PENDING
 * );
 * tenant.activate();
 * tenant.suspend();
 * ```
 * @since 1.0.0
 */

import {
  DataIsolationAwareEntity,
  TenantId,
  TenantName,
  TenantCode,
  TenantDomain,
  DataIsolationLevel,
  DataPrivacyLevel,
  Uuid,
} from '@aiofix/shared';
import { TenantType, TenantStatus } from '../enums';

/**
 * 租户实体类
 * @description 继承DataIsolationAwareEntity，支持多层级数据隔离
 */
export class TenantEntity extends DataIsolationAwareEntity {
  /**
   * 租户名称
   * @description 租户的显示名称，支持国际化
   */
  private readonly _name: TenantName;

  /**
   * 租户代码
   * @description 租户的唯一代码，用于系统内部标识
   */
  private readonly _code: TenantCode;

  /**
   * 租户域名
   * @description 租户的域名，支持子域名管理
   */
  private readonly _domain: TenantDomain;

  /**
   * 租户类型
   * @description 租户的类型，如企业级、中小企业、个人等
   */
  private readonly _type: TenantType;

  /**
   * 租户状态
   * @description 租户的当前状态，如待激活、激活、暂停、删除等
   */
  private _status: TenantStatus;

  /**
   * 租户描述
   * @description 租户的详细描述信息
   */
  private readonly _description?: string;

  /**
   * 租户配置
   * @description 租户的配置信息，如功能开关、限制等
   */
  private _config: Record<string, unknown> = {};

  /**
   * 订阅方案
   * @description 租户的订阅方案信息
   */
  private _subscriptionPlan?: string;

  /**
   * 订阅到期时间
   * @description 租户订阅的到期时间
   */
  private _subscriptionExpiresAt?: Date;

  /**
   * 最大用户数量
   * @description 租户允许的最大用户数量
   */
  private readonly _maxUsers: number;

  /**
   * 最大组织数量
   * @description 租户允许的最大组织数量
   */
  private readonly _maxOrganizations: number;

  /**
   * 最大存储空间（GB）
   * @description 租户允许的最大存储空间
   */
  private readonly _maxStorageGB: number;

  /**
   * 是否启用高级功能
   * @description 租户是否启用高级功能
   */
  private readonly _advancedFeaturesEnabled: boolean;

  /**
   * 是否启用自定义配置
   * @description 租户是否启用自定义配置
   */
  private readonly _customizationEnabled: boolean;

  /**
   * 是否启用API访问
   * @description 租户是否启用API访问
   */
  private readonly _apiAccessEnabled: boolean;

  /**
   * 是否启用SSO
   * @description 租户是否启用单点登录
   */
  private readonly _ssoEnabled: boolean;

  /**
   * 联系人信息
   * @description 租户的主要联系人信息
   */
  private _contactInfo: {
    contactPerson?: string;
    contactEmail?: string;
    contactPhone?: string;
    address?: string;
  } = {};

  /**
   * 构造函数，初始化租户实体
   * @description 创建租户实体实例，设置基本属性并验证数据有效性
   * @param {TenantId} id 租户唯一标识，必须为非空
   * @param {TenantName} name 租户名称，必须唯一
   * @param {TenantCode} code 租户代码，必须唯一
   * @param {TenantDomain} domain 租户域名，必须唯一
   * @param {TenantType} type 租户类型，决定功能和限制
   * @param {TenantStatus} status 租户状态，默认为待激活
   * @param {string} [description] 租户描述，可选
   * @param {Record<string, unknown>} [config] 租户配置，可选
   * @param {string} [subscriptionPlan] 订阅方案，可选
   * @param {Date} [subscriptionExpiresAt] 订阅到期时间，可选
   * @throws {InvalidArgumentException} 当参数无效时抛出异常
   */
  constructor(
    id: TenantId,
    name: TenantName,
    code: TenantCode,
    domain: TenantDomain,
    type: TenantType,
    status: TenantStatus = TenantStatus.PENDING,
    description?: string,
    config: Record<string, unknown> = {},
    subscriptionPlan?: string,
    subscriptionExpiresAt?: Date,
  ) {
    // 租户是平台级数据隔离，不需要租户ID
    // 使用特殊的UUID来代表平台租户
    const platformTenantId = new Uuid('00000000-0000-4000-8000-000000000000');

    // 调用父类构造函数，设置数据隔离信息
    super(
      platformTenantId, // 平台级租户ID
      DataIsolationLevel.PLATFORM, // 平台级隔离
      DataPrivacyLevel.PROTECTED, // 受保护的数据
      id,
      undefined, // 组织ID
      [], // 部门ID列表
      id, // 用户ID与实体ID相同
    );

    this._name = name;
    this._code = code;
    this._domain = domain;
    this._type = type;
    this._status = status;
    this._description = description;
    this._config = { ...config };
    this._subscriptionPlan = subscriptionPlan;
    this._subscriptionExpiresAt = subscriptionExpiresAt;

    // 根据租户类型设置默认限制
    this._maxUsers = this.getDefaultMaxUsers(type);
    this._maxOrganizations = this.getDefaultMaxOrganizations(type);
    this._maxStorageGB = this.getDefaultMaxStorage(type);
    this._advancedFeaturesEnabled = this.getDefaultAdvancedFeatures(type);
    this._customizationEnabled = this.getDefaultCustomization(type);
    this._apiAccessEnabled = this.getDefaultApiAccess(type);
    this._ssoEnabled = this.getDefaultSSO(type);
  }

  /**
   * 静态工厂方法，创建企业级租户
   * @description 创建企业级租户实体
   * @param {TenantId} id 租户ID
   * @param {TenantName} name 租户名称
   * @param {TenantCode} code 租户代码
   * @param {TenantDomain} domain 租户域名
   * @param {string} [description] 租户描述
   * @returns {TenantEntity} 企业级租户实体
   */
  static createEnterprise(
    id: TenantId,
    name: TenantName,
    code: TenantCode,
    domain: TenantDomain,
    description?: string,
  ): TenantEntity {
    return new TenantEntity(
      id,
      name,
      code,
      domain,
      TenantType.ENTERPRISE,
      TenantStatus.PENDING,
      description,
    );
  }

  /**
   * 静态工厂方法，创建社团组织租户
   * @description 创建社团组织租户实体
   * @param {TenantId} id 租户ID
   * @param {TenantName} name 租户名称
   * @param {TenantCode} code 租户代码
   * @param {TenantDomain} domain 租户域名
   * @param {string} [description] 租户描述
   * @returns {TenantEntity} 社团组织租户实体
   */
  static createOrganization(
    id: TenantId,
    name: TenantName,
    code: TenantCode,
    domain: TenantDomain,
    description?: string,
  ): TenantEntity {
    return new TenantEntity(
      id,
      name,
      code,
      domain,
      TenantType.ORGANIZATION,
      TenantStatus.PENDING,
      description,
    );
  }

  /**
   * 静态工厂方法，创建个人租户
   * @description 创建个人租户实体
   * @param {TenantId} id 租户ID
   * @param {TenantName} name 租户名称
   * @param {TenantCode} code 租户代码
   * @param {TenantDomain} domain 租户域名
   * @param {string} [description] 租户描述
   * @returns {TenantEntity} 个人租户实体
   */
  static createPersonal(
    id: TenantId,
    name: TenantName,
    code: TenantCode,
    domain: TenantDomain,
    description?: string,
  ): TenantEntity {
    return new TenantEntity(
      id,
      name,
      code,
      domain,
      TenantType.PERSONAL,
      TenantStatus.PENDING,
      description,
    );
  }

  /**
   * 静态工厂方法，创建合伙团队租户
   * @description 创建合伙团队租户实体
   * @param {TenantId} id 租户ID
   * @param {TenantName} name 租户名称
   * @param {TenantCode} code 租户代码
   * @param {TenantDomain} domain 租户域名
   * @param {string} [description] 租户描述
   * @returns {TenantEntity} 合伙团队租户实体
   */
  static createPartnership(
    id: TenantId,
    name: TenantName,
    code: TenantCode,
    domain: TenantDomain,
    description?: string,
  ): TenantEntity {
    return new TenantEntity(
      id,
      name,
      code,
      domain,
      TenantType.PARTNERSHIP,
      TenantStatus.PENDING,
      description,
    );
  }

  /**
   * 激活租户
   * @description 将租户状态从待激活改为激活
   * @throws {InvalidTenantStateException} 当租户状态不允许激活时抛出异常
   */
  activate(): void {
    if (this._status !== TenantStatus.PENDING) {
      throw new Error(`租户状态为 ${this._status}，不能激活`);
    }

    this._status = TenantStatus.ACTIVE;
  }

  /**
   * 暂停租户
   * @description 将租户状态改为暂停
   * @throws {InvalidTenantStateException} 当租户状态不允许暂停时抛出异常
   */
  suspend(): void {
    if (!this.canTransitionTo(TenantStatus.SUSPENDED)) {
      throw new Error(`租户状态为 ${this._status}，不能暂停`);
    }

    this._status = TenantStatus.SUSPENDED;
  }

  /**
   * 恢复租户
   * @description 将租户状态从暂停改为激活
   * @throws {InvalidTenantStateException} 当租户状态不允许恢复时抛出异常
   */
  resume(): void {
    if (this._status !== TenantStatus.SUSPENDED) {
      throw new Error(`租户状态为 ${this._status}，不能恢复`);
    }

    this._status = TenantStatus.ACTIVE;
  }

  /**
   * 删除租户
   * @description 将租户状态改为删除
   * @throws {InvalidTenantStateException} 当租户状态不允许删除时抛出异常
   */
  delete(): void {
    if (!this.canTransitionTo(TenantStatus.DELETED)) {
      throw new Error(`租户状态为 ${this._status}，不能删除`);
    }

    this._status = TenantStatus.DELETED;
  }

  /**
   * 更新租户配置
   * @description 更新租户的配置信息
   * @param {Record<string, unknown>} config 新的配置信息
   */
  updateConfig(config: Record<string, unknown>): void {
    this._config = { ...this._config, ...config };
  }

  /**
   * 获取配置值
   * @description 获取租户配置中的特定值
   * @param {string} key 配置键
   * @param {unknown} defaultValue 默认值
   * @returns {unknown} 配置值
   */
  getConfig(key: string, defaultValue?: unknown): unknown {
    return this._config[key] !== undefined ? this._config[key] : defaultValue;
  }

  /**
   * 设置订阅信息
   * @description 设置租户的订阅方案和到期时间
   * @param {string} plan 订阅方案
   * @param {Date} expiresAt 到期时间
   */
  setSubscription(plan: string, expiresAt: Date): void {
    this._subscriptionPlan = plan;
    this._subscriptionExpiresAt = expiresAt;
  }

  /**
   * 更新联系人信息
   * @description 更新租户的联系人信息
   * @param {object} contactInfo 联系人信息
   */
  updateContactInfo(contactInfo: {
    contactPerson?: string;
    contactEmail?: string;
    contactPhone?: string;
    address?: string;
  }): void {
    this._contactInfo = { ...this._contactInfo, ...contactInfo };
  }

  /**
   * 检查是否可以转换到指定状态
   * @description 检查租户状态转换是否允许
   * @param {TenantStatus} targetStatus 目标状态
   * @returns {boolean} 是否可以转换
   */
  canTransitionTo(targetStatus: TenantStatus): boolean {
    // 这里可以调用TenantStatusHelper的方法
    // 暂时使用简单的逻辑
    if (this._status === TenantStatus.DELETED) {
      return false; // 删除状态不能转换
    }

    if (this._status === TenantStatus.PENDING) {
      return (
        targetStatus === TenantStatus.ACTIVE ||
        targetStatus === TenantStatus.DELETED
      );
    }

    if (this._status === TenantStatus.ACTIVE) {
      return [
        TenantStatus.SUSPENDED,
        TenantStatus.EXPIRED,
        TenantStatus.MAINTENANCE,
        TenantStatus.DELETED,
      ].includes(targetStatus);
    }

    if (this._status === TenantStatus.SUSPENDED) {
      return (
        targetStatus === TenantStatus.ACTIVE ||
        targetStatus === TenantStatus.DELETED
      );
    }

    return false;
  }

  /**
   * 检查租户是否过期
   * @description 检查租户订阅是否已过期
   * @returns {boolean} 是否过期
   */
  isExpired(): boolean {
    if (!this._subscriptionExpiresAt) {
      return false;
    }
    return new Date() > this._subscriptionExpiresAt;
  }

  /**
   * 检查租户是否处于维护状态
   * @description 检查租户是否处于维护状态
   * @returns {boolean} 是否处于维护状态
   */
  isInMaintenance(): boolean {
    return this._status === TenantStatus.MAINTENANCE;
  }

  /**
   * 检查租户是否有效
   * @description 检查租户是否可以正常使用
   * @returns {boolean} 是否有效
   */
  isValid(): boolean {
    return this._status === TenantStatus.ACTIVE && !this.isExpired();
  }

  // Getter方法
  public get id(): TenantId {
    return this._id as TenantId;
  }

  public get name(): TenantName {
    return this._name;
  }

  public get code(): TenantCode {
    return this._code;
  }

  public get domain(): TenantDomain {
    return this._domain;
  }

  public get type(): TenantType {
    return this._type;
  }

  public get status(): TenantStatus {
    return this._status;
  }

  public get description(): string | undefined {
    return this._description;
  }

  public get config(): Record<string, unknown> {
    return { ...this._config };
  }

  public get subscriptionPlan(): string | undefined {
    return this._subscriptionPlan;
  }

  public get subscriptionExpiresAt(): Date | undefined {
    return this._subscriptionExpiresAt;
  }

  public get maxUsers(): number {
    return this._maxUsers;
  }

  public get maxOrganizations(): number {
    return this._maxOrganizations;
  }

  public get maxStorageGB(): number {
    return this._maxStorageGB;
  }

  public get advancedFeaturesEnabled(): boolean {
    return this._advancedFeaturesEnabled;
  }

  public get customizationEnabled(): boolean {
    return this._customizationEnabled;
  }

  public get apiAccessEnabled(): boolean {
    return this._apiAccessEnabled;
  }

  public get ssoEnabled(): boolean {
    return this._ssoEnabled;
  }

  public get contactInfo(): {
    contactPerson?: string;
    contactEmail?: string;
    contactPhone?: string;
    address?: string;
  } {
    return { ...this._contactInfo };
  }

  // 私有方法：根据租户类型获取默认值
  private getDefaultMaxUsers(type: TenantType): number {
    switch (type) {
      case TenantType.ENTERPRISE:
        return 10000;
      case TenantType.ORGANIZATION:
        return 1000;
      case TenantType.PARTNERSHIP:
        return 500;
      case TenantType.PERSONAL:
        return 10;
      default:
        return 100;
    }
  }

  private getDefaultMaxOrganizations(type: TenantType): number {
    switch (type) {
      case TenantType.ENTERPRISE:
        return 100;
      case TenantType.ORGANIZATION:
        return 20;
      case TenantType.PARTNERSHIP:
        return 10;
      case TenantType.PERSONAL:
        return 1;
      default:
        return 10;
    }
  }

  private getDefaultMaxStorage(type: TenantType): number {
    switch (type) {
      case TenantType.ENTERPRISE:
        return 1000;
      case TenantType.ORGANIZATION:
        return 100;
      case TenantType.PARTNERSHIP:
        return 50;
      case TenantType.PERSONAL:
        return 10;
      default:
        return 50;
    }
  }

  private getDefaultAdvancedFeatures(type: TenantType): boolean {
    return (
      type === TenantType.ENTERPRISE ||
      type === TenantType.ORGANIZATION ||
      type === TenantType.PARTNERSHIP
    );
  }

  private getDefaultCustomization(type: TenantType): boolean {
    return type === TenantType.ENTERPRISE || type === TenantType.ORGANIZATION;
  }

  private getDefaultApiAccess(type: TenantType): boolean {
    return (
      type === TenantType.ENTERPRISE ||
      type === TenantType.ORGANIZATION ||
      type === TenantType.PARTNERSHIP
    );
  }

  private getDefaultSSO(type: TenantType): boolean {
    return type === TenantType.ENTERPRISE;
  }
}
