/**
 * @class TenantAggregate
 * @description
 * 租户聚合根，负责管理租户实体和相关的业务规则。
 *
 * 原理与机制：
 * 1. 作为聚合根，TenantAggregate管理租户实体的一致性边界
 * 2. 封装租户相关的业务规则和验证逻辑
 * 3. 使用AggregateRoot基类的事件管理功能
 * 4. 确保租户数据的完整性和一致性
 *
 * 功能与职责：
 * 1. 管理租户实体的生命周期
 * 2. 执行租户相关的业务规则
 * 3. 发布领域事件
 * 4. 维护租户数据的一致性
 *
 * @example
 * ```typescript
 * const tenantAggregate = TenantAggregate.createEnterprise(
 *   'tenant-123',
 *   'Acme Corporation',
 *   'ACME',
 *   'acme.example.com'
 * );
 * tenantAggregate.activate();
 * tenantAggregate.updateConfig({ theme: 'dark' });
 * ```
 * @since 1.0.0
 */

import { AggregateRoot } from '@aiofix/shared';
import { TenantEntity } from '../entities/tenant.entity';
import { TenantId, TenantName, TenantCode, TenantDomain } from '@aiofix/shared';
import { TenantType, TenantStatus } from '../enums';
import {
  TenantCreatedEvent,
  TenantActivatedEvent,
  TenantSuspendedEvent,
  TenantResumedEvent,
  TenantDeletedEvent,
  TenantConfigChangedEvent,
} from '../domain-events';

/**
 * 租户聚合根类
 * @description 管理租户实体和相关的业务规则，支持事件溯源
 */
export class TenantAggregate extends AggregateRoot<string> {
  private _tenant!: TenantEntity;

  constructor(id: string) {
    super(id);
    // 聚合根构造函数，用于事件溯源重建
  }

  /**
   * 静态工厂方法，创建企业级租户聚合根
   * @description 创建新的企业级租户聚合根实例
   * @param {TenantId} id 租户ID
   * @param {TenantName} name 租户名称
   * @param {TenantCode} code 租户代码
   * @param {TenantDomain} domain 租户域名
   * @param {string} [description] 租户描述
   * @returns {TenantAggregate} 租户聚合根实例
   */
  static createEnterprise(
    id: TenantId,
    name: TenantName,
    code: TenantCode,
    domain: TenantDomain,
    description?: string,
  ): TenantAggregate {
    const aggregate = new TenantAggregate(id.toString());

    // 创建租户实体
    aggregate._tenant = TenantEntity.createEnterprise(
      id,
      name,
      code,
      domain,
      description,
    );

    // 应用租户创建事件
    aggregate.addDomainEvent(
      new TenantCreatedEvent(
        id.toString(),
        name.toString(),
        code.toString(),
        domain.toString(),
        TenantType.ENTERPRISE,
        TenantStatus.PENDING,
        description,
      ),
    );

    return aggregate;
  }

  /**
   * 静态工厂方法，创建社团组织租户聚合根
   * @description 创建新的社团组织租户聚合根实例
   * @param {TenantId} id 租户ID
   * @param {TenantName} name 租户名称
   * @param {TenantCode} code 租户代码
   * @param {TenantDomain} domain 租户域名
   * @param {string} [description] 租户描述
   * @returns {TenantAggregate} 租户聚合根实例
   */
  static createOrganization(
    id: TenantId,
    name: TenantName,
    code: TenantCode,
    domain: TenantDomain,
    description?: string,
  ): TenantAggregate {
    const aggregate = new TenantAggregate(id.toString());

    // 创建租户实体
    aggregate._tenant = TenantEntity.createOrganization(
      id,
      name,
      code,
      domain,
      description,
    );

    // 应用租户创建事件
    aggregate.addDomainEvent(
      new TenantCreatedEvent(
        id.toString(),
        name.toString(),
        code.toString(),
        domain.toString(),
        TenantType.ORGANIZATION,
        TenantStatus.PENDING,
        description,
      ),
    );

    return aggregate;
  }

  /**
   * 静态工厂方法，创建合伙团队租户聚合根
   * @description 创建新的合伙团队租户聚合根实例
   * @param {TenantId} id 租户ID
   * @param {TenantName} name 租户名称
   * @param {TenantCode} code 租户代码
   * @param {TenantDomain} domain 租户域名
   * @param {string} [description] 租户描述
   * @returns {TenantAggregate} 租户聚合根实例
   */
  static createPartnership(
    id: TenantId,
    name: TenantName,
    code: TenantCode,
    domain: TenantDomain,
    description?: string,
  ): TenantAggregate {
    const aggregate = new TenantAggregate(id.toString());

    // 创建租户实体
    aggregate._tenant = TenantEntity.createPartnership(
      id,
      name,
      code,
      domain,
      description,
    );

    // 应用租户创建事件
    aggregate.addDomainEvent(
      new TenantCreatedEvent(
        id.toString(),
        name.toString(),
        code.toString(),
        domain.toString(),
        TenantType.PARTNERSHIP,
        TenantStatus.PENDING,
        description,
      ),
    );

    return aggregate;
  }

  /**
   * 静态工厂方法，创建个人租户聚合根
   * @description 创建新的个人租户聚合根实例
   * @param {TenantId} id 租户ID
   * @param {TenantName} name 租户名称
   * @param {TenantCode} code 租户代码
   * @param {TenantDomain} domain 租户域名
   * @param {string} [description] 租户描述
   * @returns {TenantAggregate} 租户聚合根实例
   */
  static createPersonal(
    id: TenantId,
    name: TenantName,
    code: TenantCode,
    domain: TenantDomain,
    description?: string,
  ): TenantAggregate {
    const aggregate = new TenantAggregate(id.toString());

    // 创建租户实体
    aggregate._tenant = TenantEntity.createPersonal(
      id,
      name,
      code,
      domain,
      description,
    );

    // 应用租户创建事件
    aggregate.addDomainEvent(
      new TenantCreatedEvent(
        id.toString(),
        name.toString(),
        code.toString(),
        domain.toString(),
        TenantType.PERSONAL,
        TenantStatus.PENDING,
        description,
      ),
    );

    return aggregate;
  }

  /**
   * 激活租户
   * @description 将租户状态从待激活改为激活
   * @throws {Error} 当租户状态不允许激活时抛出异常
   */
  activate(): void {
    this._tenant.activate();

    // 应用租户激活事件
    this.addDomainEvent(
      new TenantActivatedEvent(
        this.id,
        TenantStatus.PENDING,
        TenantStatus.ACTIVE,
      ),
    );
  }

  /**
   * 暂停租户
   * @description 将租户状态改为暂停
   * @throws {Error} 当租户状态不允许暂停时抛出异常
   */
  suspend(): void {
    const previousStatus = this._tenant.status;
    this._tenant.suspend();

    // 应用租户暂停事件
    this.addDomainEvent(
      new TenantSuspendedEvent(this.id, previousStatus, TenantStatus.SUSPENDED),
    );
  }

  /**
   * 恢复租户
   * @description 将租户状态从暂停改为激活
   * @throws {Error} 当租户状态不允许恢复时抛出异常
   */
  resume(): void {
    const previousStatus = this._tenant.status;
    this._tenant.resume();

    // 应用租户恢复事件
    this.addDomainEvent(
      new TenantResumedEvent(this.id, previousStatus, TenantStatus.ACTIVE),
    );
  }

  /**
   * 删除租户
   * @description 将租户状态改为删除
   * @throws {Error} 当租户状态不允许删除时抛出异常
   */
  delete(): void {
    const previousStatus = this._tenant.status;
    this._tenant.delete();

    // 应用租户删除事件
    this.addDomainEvent(
      new TenantDeletedEvent(this.id, previousStatus, TenantStatus.DELETED),
    );
  }

  /**
   * 更新租户配置
   * @description 更新租户的配置信息
   * @param {Record<string, unknown>} config 新的配置信息
   */
  updateConfig(config: Record<string, unknown>): void {
    const previousConfig = { ...this._tenant.config };
    this._tenant.updateConfig(config);

    // 应用租户配置变更事件
    this.addDomainEvent(
      new TenantConfigChangedEvent(this.id, previousConfig, config),
    );
  }

  /**
   * 获取租户实体
   * @description 获取聚合根内的租户实体
   * @returns {TenantEntity} 租户实体
   */
  getTenant(): TenantEntity {
    return this._tenant;
  }

  /**
   * 获取租户ID
   * @description 获取租户的唯一标识
   * @returns {TenantId} 租户ID
   */
  getTenantId(): TenantId {
    return this._tenant.id;
  }

  /**
   * 获取租户名称
   * @description 获取租户的显示名称
   * @returns {TenantName} 租户名称
   */
  getTenantName(): TenantName {
    return this._tenant.name;
  }

  /**
   * 获取租户代码
   * @description 获取租户的唯一代码
   * @returns {TenantCode} 租户代码
   */
  getTenantCode(): TenantCode {
    return this._tenant.code;
  }

  /**
   * 获取租户域名
   * @description 获取租户的域名
   * @returns {TenantDomain} 租户域名
   */
  getTenantDomain(): TenantDomain {
    return this._tenant.domain;
  }

  /**
   * 获取租户类型
   * @description 获取租户的类型
   * @returns {TenantType} 租户类型
   */
  getTenantType(): TenantType {
    return this._tenant.type;
  }

  /**
   * 获取租户状态
   * @description 获取租户的当前状态
   * @returns {TenantStatus} 租户状态
   */
  getTenantStatus(): TenantStatus {
    return this._tenant.status;
  }

  /**
   * 获取租户配置
   * @description 获取租户的配置信息
   * @returns {Record<string, unknown>} 租户配置
   */
  getTenantConfig(): Record<string, unknown> {
    return this._tenant.config;
  }

  /**
   * 获取配置值
   * @description 获取租户配置中的特定值
   * @param {string} key 配置键
   * @param {unknown} defaultValue 默认值
   * @returns {unknown} 配置值
   */
  getConfig(key: string, defaultValue?: unknown): unknown {
    return this._tenant.getConfig(key, defaultValue);
  }

  /**
   * 获取租户限制信息
   * @description 获取租户的资源限制信息
   * @returns {object} 限制信息
   */
  getLimits(): {
    maxUsers: number;
    maxOrganizations: number;
    maxStorageGB: number;
    advancedFeaturesEnabled: boolean;
    customizationEnabled: boolean;
    apiAccessEnabled: boolean;
    ssoEnabled: boolean;
  } {
    return {
      maxUsers: this._tenant.maxUsers,
      maxOrganizations: this._tenant.maxOrganizations,
      maxStorageGB: this._tenant.maxStorageGB,
      advancedFeaturesEnabled: this._tenant.advancedFeaturesEnabled,
      customizationEnabled: this._tenant.customizationEnabled,
      apiAccessEnabled: this._tenant.apiAccessEnabled,
      ssoEnabled: this._tenant.ssoEnabled,
    };
  }

  /**
   * 检查租户是否有效
   * @description 检查租户是否可以正常使用
   * @returns {boolean} 是否有效
   */
  isValid(): boolean {
    return this._tenant.isValid();
  }

  /**
   * 检查租户是否过期
   * @description 检查租户订阅是否已过期
   * @returns {boolean} 是否过期
   */
  isExpired(): boolean {
    return this._tenant.isExpired();
  }

  /**
   * 检查租户是否处于维护状态
   * @description 检查租户是否处于维护状态
   * @returns {boolean} 是否处于维护状态
   */
  isInMaintenance(): boolean {
    return this._tenant.isInMaintenance();
  }

  /**
   * 检查是否可以转换到指定状态
   * @description 检查租户状态转换是否允许
   * @param {TenantStatus} targetStatus 目标状态
   * @returns {boolean} 是否可以转换
   */
  canTransitionTo(targetStatus: TenantStatus): boolean {
    return this._tenant.canTransitionTo(targetStatus);
  }
}
