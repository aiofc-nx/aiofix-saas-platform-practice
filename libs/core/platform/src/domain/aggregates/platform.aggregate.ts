/**
 * @description 平台聚合根
 * @author 江郎
 * @since 2.1.0
 */

import { AggregateRoot } from '@aiofix/shared';
import { PlatformId, PlatformName, PlatformVersion } from '../value-objects';
import { PlatformStatus, PlatformType } from '../enums';
import { PlatformEntity, PlatformConfigEntity } from '../entities';
import {
  PlatformCreatedEvent,
  PlatformActivatedEvent,
  PlatformSuspendedEvent,
  PlatformDeactivatedEvent,
  PlatformUpdatedEvent,
  PlatformConfigUpdatedEvent,
  PlatformConfigRemovedEvent,
  PlatformMetadataUpdatedEvent,
} from '../domain-events';

/**
 * @class PlatformAggregate
 * @description 平台聚合根
 *
 * 功能与职责：
 * 1. 管理平台实体的生命周期
 * 2. 执行相关的业务规则
 * 3. 发布领域事件
 * 4. 维护数据的一致性
 *
 * @example
 * ```typescript
 * const aggregate = PlatformAggregate.create(
 *   new PlatformId('550e8400-e29b-41d4-a716-446655440000'),
 *   new PlatformName('Aiofix SaaS Platform'),
 *   new PlatformVersion('1.0.0'),
 *   PlatformType.SAAS,
 *   'tenant-123'
 * );
 * ```
 * @since 2.1.0
 */
export class PlatformAggregate extends AggregateRoot<string> {
  private _platform!: PlatformEntity;
  private _configs: Map<string, PlatformConfigEntity> = new Map();

  constructor(id: string) {
    super(id);
    // 聚合根构造函数，用于事件溯源重建
  }

  /**
   * 静态工厂方法 - 创建平台聚合根
   * @param platformId 平台ID
   * @param name 平台名称
   * @param version 平台版本
   * @param type 平台类型
   * @param tenantId 租户ID
   * @param organizationId 组织ID（可选）
   * @param departmentIds 部门ID列表（可选）
   * @param description 平台描述（可选）
   * @param createdBy 创建者
   * @returns 平台聚合根
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
  ): PlatformAggregate {
    const aggregate = new PlatformAggregate(platformId.toString());

    // 创建平台实体
    aggregate._platform = PlatformEntity.create(
      platformId,
      name,
      version,
      type,
      tenantId,
      organizationId,
      departmentIds,
      description,
      createdBy,
    );

    // 应用创建事件
    aggregate.addDomainEvent(
      new PlatformCreatedEvent(
        platformId.toString(),
        name.toString(),
        version.toString(),
        type,
        tenantId,
        organizationId,
        departmentIds,
        description,
        createdBy,
      ),
    );

    return aggregate;
  }

  /**
   * 激活平台
   * @param updatedBy 更新者
   */
  activate(updatedBy: string): void {
    // 业务规则验证
    if (!this._platform.isValid()) {
      throw new Error('平台必须处于有效状态才能激活');
    }

    // 执行业务逻辑
    const previousStatus = this._platform.status;
    this._platform.activate(updatedBy);

    // 发布事件（只有在状态实际改变时才发布）
    if (previousStatus !== this._platform.status) {
      this.addDomainEvent(
        new PlatformActivatedEvent(
          this._platform.platformId.toString(),
          previousStatus,
          this._platform.status,
          updatedBy,
        ),
      );
    }
  }

  /**
   * 暂停平台
   * @param updatedBy 更新者
   */
  suspend(updatedBy: string): void {
    // 业务规则验证
    if (!this._platform.canProvideService()) {
      throw new Error('平台必须处于可服务状态才能暂停');
    }

    // 执行业务逻辑
    const previousStatus = this._platform.status;
    this._platform.suspend(updatedBy);

    // 发布事件（只有在状态实际改变时才发布）
    if (previousStatus !== this._platform.status) {
      this.addDomainEvent(
        new PlatformSuspendedEvent(
          this._platform.platformId.toString(),
          previousStatus,
          this._platform.status,
          updatedBy,
        ),
      );
    }
  }

  /**
   * 停用平台
   * @param updatedBy 更新者
   */
  deactivate(updatedBy: string): void {
    // 业务规则验证
    if (this._platform.status === PlatformStatus.DELETED) {
      throw new Error('已删除的平台不能停用');
    }

    // 执行业务逻辑
    const previousStatus = this._platform.status;
    this._platform.deactivate(updatedBy);

    // 发布事件（只有在状态实际改变时才发布）
    if (previousStatus !== this._platform.status) {
      this.addDomainEvent(
        new PlatformDeactivatedEvent(
          this._platform.platformId.toString(),
          previousStatus,
          this._platform.status,
          updatedBy,
        ),
      );
    }
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
    // 业务规则验证
    if (this._platform.status === PlatformStatus.DELETED) {
      throw new Error('已删除的平台不能更新信息');
    }

    // 执行业务逻辑
    this._platform.updateInfo(name, version, description, updatedBy);

    // 发布事件
    this.addDomainEvent(
      new PlatformUpdatedEvent(
        this._platform.platformId.toString(),
        {
          name: name?.toString(),
          version: version?.toString(),
          description,
        },
        updatedBy,
      ),
    );
  }

  /**
   * 设置配置项
   * @param config 配置实体
   * @param updatedBy 更新者
   */
  setConfig(config: PlatformConfigEntity, updatedBy: string = 'system'): void {
    // 业务规则验证
    if (this._platform.status === PlatformStatus.DELETED) {
      throw new Error('已删除的平台不能设置配置');
    }

    // 执行业务逻辑
    this._platform.setConfig(config, updatedBy);
    this._configs.set(config.key, config);

    // 发布事件
    this.addDomainEvent(
      new PlatformConfigUpdatedEvent(
        this._platform.platformId.toString(),
        config.key,
        config.value,
        updatedBy,
      ),
    );
  }

  /**
   * 删除配置项
   * @param key 配置键
   * @param updatedBy 更新者
   */
  removeConfig(key: string, updatedBy: string = 'system'): void {
    // 业务规则验证
    if (this._platform.status === PlatformStatus.DELETED) {
      throw new Error('已删除的平台不能删除配置');
    }

    const config = this._platform.getConfig(key);
    if (!config) {
      throw new Error(`配置项 ${key} 不存在`);
    }

    // 执行业务逻辑
    this._platform.removeConfig(key, updatedBy);
    this._configs.delete(key);

    // 发布事件
    this.addDomainEvent(
      new PlatformConfigRemovedEvent(
        this._platform.platformId.toString(),
        key,
        updatedBy,
      ),
    );
  }

  /**
   * 设置元数据
   * @param key 元数据键
   * @param value 元数据值
   * @param updatedBy 更新者
   */
  setMetadata(key: string, value: any, updatedBy: string = 'system'): void {
    // 业务规则验证
    if (this._platform.status === PlatformStatus.DELETED) {
      throw new Error('已删除的平台不能设置元数据');
    }

    // 执行业务逻辑
    this._platform.setMetadata(key, value, updatedBy);

    // 发布事件
    this.addDomainEvent(
      new PlatformMetadataUpdatedEvent(
        this._platform.platformId.toString(),
        key,
        value,
        updatedBy,
      ),
    );
  }

  /**
   * 获取平台实体
   * @returns 平台实体
   */
  get platform(): PlatformEntity {
    return this._platform;
  }

  /**
   * 获取平台ID
   * @returns 平台ID
   */
  get platformId(): PlatformId {
    return this._platform.platformId;
  }

  /**
   * 获取平台名称
   * @returns 平台名称
   */
  get name(): PlatformName {
    return this._platform.name;
  }

  /**
   * 获取平台版本
   * @returns 平台版本
   */
  get version(): PlatformVersion {
    return this._platform.version;
  }

  /**
   * 获取平台类型
   * @returns 平台类型
   */
  get type(): PlatformType {
    return this._platform.type;
  }

  /**
   * 获取平台状态
   * @returns 平台状态
   */
  get status(): PlatformStatus {
    return this._platform.status;
  }

  /**
   * 获取所有配置
   * @returns 配置映射
   */
  get configs(): Map<string, PlatformConfigEntity> {
    return new Map(this._configs);
  }

  /**
   * 检查平台是否有效
   * @returns 是否有效
   */
  get isValid(): boolean {
    return this._platform.isValid();
  }

  /**
   * 检查平台是否可以提供服务
   * @returns 是否可以提供服务
   */
  get canProvideService(): boolean {
    return this._platform.canProvideService();
  }
}
