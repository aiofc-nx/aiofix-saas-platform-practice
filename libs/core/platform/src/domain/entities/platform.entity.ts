/**
 * @description 平台实体
 * @author 江郎
 * @since 2.1.0
 */

import {
  DataIsolationAwareEntity,
  DataIsolationLevel,
  DataPrivacyLevel,
} from '@aiofix/shared';
import { PlatformId, PlatformName, PlatformVersion } from '../value-objects';
import { PlatformStatus, PlatformType } from '../enums';
import { PlatformConfigEntity } from './platform-config.entity';

/**
 * @class PlatformEntity
 * @description 平台实体
 *
 * 功能与职责：
 * 1. 封装平台实例的核心业务属性和行为
 * 2. 管理平台实例的生命周期状态
 * 3. 支持多层次数据隔离和访问控制
 * 4. 提供平台实例的业务规则验证
 *
 * @example
 * ```typescript
 * const platform = new PlatformInstanceEntity(
 *   new PlatformId('550e8400-e29b-41d4-a716-446655440000'),
 *   new PlatformName('Aiofix SaaS Platform'),
 *   new PlatformVersion('1.0.0'),
 *   PlatformType.SAAS,
 *   PlatformStatus.ACTIVE,
 *   new TenantId('tenant-123')
 * );
 * ```
 * @since 2.1.0
 */
export class PlatformEntity extends DataIsolationAwareEntity {
  private readonly _platformId: PlatformId;
  private _name: PlatformName;
  private _version: PlatformVersion;
  private _type: PlatformType;
  private _status: PlatformStatus;
  private _description?: string;
  private _config: Map<string, PlatformConfigEntity>;
  private _metadata: Record<string, any>;
  private _createdBy: string;
  private _updatedBy?: string;
  private _createdAt: Date;
  private _updatedAt: Date;

  /**
   * @constructor
   * @description 创建平台实例实体
   * @param platformId 平台ID
   * @param name 平台名称
   * @param version 平台版本
   * @param type 平台类型
   * @param status 平台状态
   * @param tenantId 租户ID
   * @param organizationId 组织ID（可选）
   * @param departmentIds 部门ID列表（可选）
   * @param dataPrivacyLevel 数据隐私级别
   * @param description 平台描述（可选）
   * @param createdBy 创建者
   */
  constructor(
    platformId: PlatformId,
    name: PlatformName,
    version: PlatformVersion,
    type: PlatformType,
    status: PlatformStatus,
    tenantId: string,
    organizationId?: string,
    departmentIds: string[] = [],
    dataPrivacyLevel: DataPrivacyLevel = DataPrivacyLevel.PROTECTED,
    description?: string,
    createdBy: string = 'system',
  ) {
    super(
      tenantId,
      DataIsolationLevel.ORGANIZATION, // 平台实例通常按组织隔离
      dataPrivacyLevel,
      platformId.toString(),
      organizationId,
      departmentIds,
    );

    this._platformId = platformId;
    this._name = name;
    this._version = version;
    this._type = type;
    this._status = status;
    this._description = description;
    this._config = new Map();
    this._metadata = {};
    this._createdBy = createdBy;
    this._createdAt = new Date();
    this._updatedAt = new Date();
  }

  /**
   * 获取平台ID
   * @returns 平台ID
   */
  get platformId(): PlatformId {
    return this._platformId;
  }

  /**
   * 获取平台名称
   * @returns 平台名称
   */
  get name(): PlatformName {
    return this._name;
  }

  /**
   * 获取平台版本
   * @returns 平台版本
   */
  get version(): PlatformVersion {
    return this._version;
  }

  /**
   * 获取平台类型
   * @returns 平台类型
   */
  get type(): PlatformType {
    return this._type;
  }

  /**
   * 获取平台状态
   * @returns 平台状态
   */
  get status(): PlatformStatus {
    return this._status;
  }

  /**
   * 获取平台描述
   * @returns 平台描述
   */
  get description(): string | undefined {
    return this._description;
  }

  /**
   * 获取创建者
   * @returns 创建者
   */
  get createdBy(): string {
    return this._createdBy;
  }

  /**
   * 获取更新者
   * @returns 更新者
   */
  get updatedBy(): string | undefined {
    return this._updatedBy;
  }

  /**
   * 获取创建时间
   * @returns 创建时间
   */
  get createdAt(): Date {
    return this._createdAt;
  }

  /**
   * 获取更新时间
   * @returns 更新时间
   */
  get updatedAt(): Date {
    return this._updatedAt;
  }

  /**
   * 检查平台是否处于有效状态
   * @returns 是否有效
   */
  isValid(): boolean {
    return (
      this._status === PlatformStatus.ACTIVE ||
      this._status === PlatformStatus.INITIALIZING
    );
  }

  /**
   * 检查平台是否可以提供服务
   * @returns 是否可以提供服务
   */
  canProvideService(): boolean {
    return this._status === PlatformStatus.ACTIVE;
  }

  /**
   * 激活平台
   * @param updatedBy 更新者
   */
  activate(updatedBy: string): void {
    if (this._status === PlatformStatus.ACTIVE) {
      return; // 已经是激活状态，直接返回
    }

    if (!this.canTransitionTo(PlatformStatus.ACTIVE)) {
      throw new Error(`平台状态为 ${this._status}，不能激活`);
    }

    this._status = PlatformStatus.ACTIVE;
    this._updatedBy = updatedBy;
    this._updatedAt = new Date();
  }

  /**
   * 暂停平台
   * @param updatedBy 更新者
   */
  suspend(updatedBy: string): void {
    if (this._status === PlatformStatus.SUSPENDED) {
      return; // 已经是暂停状态，直接返回
    }

    if (!this.canTransitionTo(PlatformStatus.SUSPENDED)) {
      throw new Error(`平台状态为 ${this._status}，不能暂停`);
    }

    this._status = PlatformStatus.SUSPENDED;
    this._updatedBy = updatedBy;
    this._updatedAt = new Date();
  }

  /**
   * 停用平台
   * @param updatedBy 更新者
   */
  deactivate(updatedBy: string): void {
    if (this._status === PlatformStatus.INACTIVE) {
      return; // 已经是停用状态，直接返回
    }

    if (!this.canTransitionTo(PlatformStatus.INACTIVE)) {
      throw new Error(`平台状态为 ${this._status}，不能停用`);
    }

    this._status = PlatformStatus.INACTIVE;
    this._updatedBy = updatedBy;
    this._updatedAt = new Date();
  }

  /**
   * 更新平台信息
   * @param name 新名称（可选）
   * @param version 新版本（可选）
   * @param description 新描述（可选）
   * @param updatedBy 更新者
   */
  updateInfo(
    name?: PlatformName,
    version?: PlatformVersion,
    description?: string,
    updatedBy: string = 'system',
  ): void {
    if (name) {
      this._name = name;
    }
    if (version) {
      this._version = version;
    }
    if (description !== undefined) {
      this._description = description;
    }

    this._updatedBy = updatedBy;
    this._updatedAt = new Date();
  }

  /**
   * 设置配置项
   * @param config 配置实体
   * @param updatedBy 更新者
   */
  setConfig(config: PlatformConfigEntity, updatedBy: string = 'system'): void {
    this._config.set(config.key, config);
    this._updatedBy = updatedBy;
    this._updatedAt = new Date();
  }

  /**
   * 获取配置项
   * @param key 配置键
   * @returns 配置实体或undefined
   */
  getConfig(key: string): PlatformConfigEntity | undefined {
    return this._config.get(key);
  }

  /**
   * 获取所有配置
   * @returns 配置映射
   */
  getAllConfigs(): Map<string, PlatformConfigEntity> {
    return new Map(this._config);
  }

  /**
   * 删除配置项
   * @param key 配置键
   * @param updatedBy 更新者
   */
  removeConfig(key: string, updatedBy: string = 'system'): void {
    this._config.delete(key);
    this._updatedBy = updatedBy;
    this._updatedAt = new Date();
  }

  /**
   * 设置元数据
   * @param key 元数据键
   * @param value 元数据值
   * @param updatedBy 更新者
   */
  setMetadata(key: string, value: any, updatedBy: string = 'system'): void {
    this._metadata[key] = value;
    this._updatedBy = updatedBy;
    this._updatedAt = new Date();
  }

  /**
   * 获取元数据
   * @param key 元数据键
   * @returns 元数据值
   */
  getMetadata(key: string): any {
    return this._metadata[key];
  }

  /**
   * 获取所有元数据
   * @returns 元数据对象
   */
  getAllMetadata(): Record<string, any> {
    return { ...this._metadata };
  }

  /**
   * 检查是否可以转换到指定状态
   * @param targetStatus 目标状态
   * @returns 是否可以转换
   */
  private canTransitionTo(targetStatus: PlatformStatus): boolean {
    const validTransitions: Record<PlatformStatus, PlatformStatus[]> = {
      [PlatformStatus.INITIALIZING]: [
        PlatformStatus.ACTIVE,
        PlatformStatus.INACTIVE,
      ],
      [PlatformStatus.ACTIVE]: [
        PlatformStatus.SUSPENDED,
        PlatformStatus.MAINTENANCE,
        PlatformStatus.INACTIVE,
      ],
      [PlatformStatus.MAINTENANCE]: [
        PlatformStatus.ACTIVE,
        PlatformStatus.SUSPENDED,
        PlatformStatus.INACTIVE,
      ],
      [PlatformStatus.SUSPENDED]: [
        PlatformStatus.ACTIVE,
        PlatformStatus.MAINTENANCE,
        PlatformStatus.INACTIVE,
      ],
      [PlatformStatus.INACTIVE]: [PlatformStatus.ACTIVE],
      [PlatformStatus.DELETED]: [], // 删除状态不能转换到其他状态
    };

    return validTransitions[this._status]?.includes(targetStatus) ?? false;
  }

  /**
   * 创建新的平台实例
   * @param platformId 平台ID
   * @param name 平台名称
   * @param version 平台版本
   * @param type 平台类型
   * @param tenantId 租户ID
   * @param organizationId 组织ID（可选）
   * @param departmentIds 部门ID列表（可选）
   * @param description 平台描述（可选）
   * @param createdBy 创建者
   * @returns 平台实体
   */
  static create(
    platformId: PlatformId,
    name: PlatformName,
    version: PlatformVersion,
    type: PlatformType,
    tenantId: string,
    organizationId?: string,
    departmentIds: string[] = [],
    description?: string,
    createdBy: string = 'system',
  ): PlatformEntity {
    return new PlatformEntity(
      platformId,
      name,
      version,
      type,
      PlatformStatus.INITIALIZING,
      tenantId,
      organizationId,
      departmentIds,
      DataPrivacyLevel.PROTECTED,
      description,
      createdBy,
    );
  }
}
