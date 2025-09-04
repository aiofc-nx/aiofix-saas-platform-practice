/**
 * @file platform-configuration.entity.ts
 * @description 平台配置实体
 *
 * 该文件定义了平台配置实体，展示如何使用PlatformAwareEntity基类。
 * 平台配置实体用于管理平台级别的配置信息。
 *
 * 主要功能：
 * 1. 平台级配置管理
 * 2. 平台级数据隔离
 * 3. 隐私级别控制
 * 4. 平台级访问控制
 *
 * 遵循DDD和Clean Architecture原则，提供统一的平台配置管理。
 */

import { PlatformAwareEntity } from './platform-aware.entity';
import { DataPrivacyLevel } from './data-isolation-aware.entity';
import { Uuid } from '../value-objects/uuid.vo';

/**
 * @interface PlatformConfigurationData
 * @description 平台配置数据接口
 */
export interface PlatformConfigurationData {
  key: string;
  value: unknown;
  description?: string;
  category: string;
  isSystem: boolean;
}

/**
 * @class PlatformConfiguration
 * @description 平台配置实体
 *
 * 平台配置实体用于管理平台级别的配置信息，包括：
 * - 系统配置
 * - 功能开关
 * - 平台设置
 * - 全局参数
 *
 * 使用场景：
 * - 平台级系统配置
 * - 全局功能开关
 * - 平台级安全设置
 * - 系统级参数管理
 */
export class PlatformConfiguration extends PlatformAwareEntity {
  private readonly _key: string;
  private _value: unknown;
  private _description?: string;
  private readonly _category: string;
  private readonly _isSystem: boolean;

  /**
   * @constructor
   * @description 创建平台配置实体
   * @param key 配置键
   * @param value 配置值
   * @param category 配置分类
   * @param isSystem 是否为系统配置
   * @param description 配置描述
   * @param dataPrivacyLevel 数据隐私级别
   * @param id 实体唯一标识符
   */
  constructor(
    key: string,
    value: unknown,
    category: string,
    isSystem = false,
    description?: string,
    dataPrivacyLevel: DataPrivacyLevel = DataPrivacyLevel.PROTECTED,
    id?: Uuid,
  ) {
    super(id, dataPrivacyLevel);
    this._key = key;
    this._value = value;
    this._description = description;
    this._category = category;
    this._isSystem = isSystem;
  }

  /**
   * @getter key
   * @description 获取配置键
   * @returns {string} 配置键
   */
  get key(): string {
    return this._key;
  }

  /**
   * @getter value
   * @description 获取配置值
   * @returns {unknown} 配置值
   */
  get value(): unknown {
    return this._value;
  }

  /**
   * @getter description
   * @description 获取配置描述
   * @returns {string|undefined} 配置描述
   */
  get description(): string | undefined {
    return this._description;
  }

  /**
   * @getter category
   * @description 获取配置分类
   * @returns {string} 配置分类
   */
  get category(): string {
    return this._category;
  }

  /**
   * @getter isSystem
   * @description 获取是否为系统配置
   * @returns {boolean} 是否为系统配置
   */
  get isSystem(): boolean {
    return this._isSystem;
  }

  /**
   * @method updateValue
   * @description 更新配置值
   * @param newValue 新的配置值
   */
  public updateValue(newValue: unknown): void {
    this._value = newValue;
    this.updateTimestamp();
  }

  /**
   * @method updateDescription
   * @description 更新配置描述
   * @param description 新的配置描述
   */
  public updateDescription(description: string): void {
    this._description = description;
    this.updateTimestamp();
  }

  /**
   * @method toData
   * @description 转换为数据对象
   * @returns {PlatformConfigurationData} 配置数据对象
   */
  public toData(): PlatformConfigurationData {
    return {
      key: this._key,
      value: this._value,
      description: this._description,
      category: this._category,
      isSystem: this._isSystem,
    };
  }

  /**
   * @method isPlatformAdmin
   * @description 实现平台管理员权限检查
   * @returns {boolean} 是否具有平台管理员权限
   */
  protected isPlatformAdmin(): boolean {
    // 这里可以根据具体的业务逻辑来判断
    // 例如：检查用户角色、权限等
    // 暂时返回false，需要在实际使用时实现
    return false;
  }

  /**
   * @static
   * @method createSystemConfig
   * @description 创建系统配置
   * @param key 配置键
   * @param value 配置值
   * @param category 配置分类
   * @param description 配置描述
   * @returns {PlatformConfiguration} 平台配置实体
   */
  static createSystemConfig(
    key: string,
    value: unknown,
    category: string,
    description?: string,
  ): PlatformConfiguration {
    return new PlatformConfiguration(
      key,
      value,
      category,
      true, // isSystem = true
      description,
      DataPrivacyLevel.PROTECTED, // 系统配置默认为受保护
    );
  }

  /**
   * @static
   * @method createPublicConfig
   * @description 创建公共配置
   * @param key 配置键
   * @param value 配置值
   * @param category 配置分类
   * @param description 配置描述
   * @returns {PlatformConfiguration} 平台配置实体
   */
  static createPublicConfig(
    key: string,
    value: unknown,
    category: string,
    description?: string,
  ): PlatformConfiguration {
    return new PlatformConfiguration(
      key,
      value,
      category,
      false, // isSystem = false
      description,
      DataPrivacyLevel.SHARED, // 公共配置为可共享
    );
  }
}
