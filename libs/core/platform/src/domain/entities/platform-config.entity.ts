/**
 * @description 平台配置实体
 * @author 江郎
 * @since 2.1.0
 */

import { BaseValueObject } from '@aiofix/shared';

/**
 * @interface PlatformConfigData
 * @description 平台配置数据接口
 */
export interface PlatformConfigData {
  /** 配置键 */
  key: string;
  /** 配置值 */
  value: any;
  /** 配置类型 */
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  /** 配置描述 */
  description?: string;
  /** 是否必需 */
  required?: boolean;
  /** 默认值 */
  defaultValue?: any;
  /** 配置分组 */
  group?: string;
  /** 是否可编辑 */
  editable?: boolean;
  /** 验证规则 */
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    enum?: any[];
  };
}

/**
 * @class PlatformConfigEntity
 * @description 平台配置实体
 *
 * 功能与职责：
 * 1. 封装平台配置的业务规则和验证逻辑
 * 2. 管理平台的各种配置项
 * 3. 提供配置的验证和转换功能
 *
 * @example
 * ```typescript
 * const config = new PlatformConfigEntity({
 *   key: 'maxUsers',
 *   value: 1000,
 *   type: 'number',
 *   description: '最大用户数',
 *   required: true
 * });
 * ```
 * @since 2.1.0
 */
export class PlatformConfigEntity extends BaseValueObject {
  private readonly _key: string;
  private readonly _value: any;
  private readonly _type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  private readonly _description?: string;
  private readonly _required: boolean;
  private readonly _defaultValue?: any;
  private readonly _group?: string;
  private readonly _editable: boolean;
  private readonly _validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    enum?: any[];
  };

  /**
   * @constructor
   * @description 创建平台配置实体
   * @param configData 配置数据
   */
  constructor(configData: PlatformConfigData) {
    super();
    this.validateConfigData(configData);

    this._key = configData.key;
    this._value = configData.value;
    this._type = configData.type;
    this._description = configData.description;
    this._required = configData.required ?? false;
    this._defaultValue = configData.defaultValue;
    this._group = configData.group;
    this._editable = configData.editable ?? true;
    this._validation = configData.validation;
  }

  /**
   * 获取配置键
   * @returns 配置键
   */
  get key(): string {
    return this._key;
  }

  /**
   * 获取配置值
   * @returns 配置值
   */
  get value(): any {
    return this._value;
  }

  /**
   * 获取配置类型
   * @returns 配置类型
   */
  get type(): 'string' | 'number' | 'boolean' | 'object' | 'array' {
    return this._type;
  }

  /**
   * 获取配置描述
   * @returns 配置描述
   */
  get description(): string | undefined {
    return this._description;
  }

  /**
   * 是否必需
   * @returns 是否必需
   */
  get required(): boolean {
    return this._required;
  }

  /**
   * 获取默认值
   * @returns 默认值
   */
  get defaultValue(): any {
    return this._defaultValue;
  }

  /**
   * 获取配置分组
   * @returns 配置分组
   */
  get group(): string | undefined {
    return this._group;
  }

  /**
   * 是否可编辑
   * @returns 是否可编辑
   */
  get editable(): boolean {
    return this._editable;
  }

  /**
   * 获取验证规则
   * @returns 验证规则
   */
  get validation():
    | {
        min?: number;
        max?: number;
        pattern?: string;
        enum?: any[];
      }
    | undefined {
    return this._validation;
  }

  /**
   * 获取配置的字符串表示
   * @returns 配置字符串
   */
  toString(): string {
    return `${this._key}: ${this._value}`;
  }

  /**
   * 比较两个配置是否相等
   * @param other 另一个配置
   * @returns 是否相等
   */
  equals(other: PlatformConfigEntity): boolean {
    return this._key === other._key && this._value === other._value;
  }

  /**
   * 验证配置值
   * @param value 要验证的值
   * @returns 是否有效
   */
  validateValue(value: any): boolean {
    // 检查类型
    if (this._type === 'string' && typeof value !== 'string') {
      return false;
    }
    if (this._type === 'number' && typeof value !== 'number') {
      return false;
    }
    if (this._type === 'boolean' && typeof value !== 'boolean') {
      return false;
    }
    if (
      this._type === 'object' &&
      (typeof value !== 'object' || Array.isArray(value))
    ) {
      return false;
    }
    if (this._type === 'array' && !Array.isArray(value)) {
      return false;
    }

    // 检查验证规则
    if (this._validation) {
      if (this._validation.min !== undefined && value < this._validation.min) {
        return false;
      }
      if (this._validation.max !== undefined && value > this._validation.max) {
        return false;
      }
      if (this._validation.pattern && typeof value === 'string') {
        const regex = new RegExp(this._validation.pattern);
        if (!regex.test(value)) {
          return false;
        }
      }
      if (this._validation.enum && !this._validation.enum.includes(value)) {
        return false;
      }
    }

    return true;
  }

  /**
   * 验证配置数据
   * @param configData 配置数据
   * @throws Error 当配置数据无效时
   */
  private validateConfigData(configData: PlatformConfigData): void {
    if (!configData.key || typeof configData.key !== 'string') {
      throw new Error('配置键不能为空且必须是字符串');
    }

    if (configData.key.trim().length === 0) {
      throw new Error('配置键不能为空');
    }

    if (
      !['string', 'number', 'boolean', 'object', 'array'].includes(
        configData.type,
      )
    ) {
      throw new Error(
        '配置类型必须是 string、number、boolean、object 或 array 之一',
      );
    }

    // 验证配置值
    if (
      configData.value !== undefined &&
      !this.validateValue(configData.value)
    ) {
      throw new Error(
        `配置值 ${configData.value} 不符合类型 ${configData.type} 或验证规则`,
      );
    }
  }

  /**
   * 创建新的配置实体
   * @param configData 配置数据
   * @returns 配置实体
   */
  static create(configData: PlatformConfigData): PlatformConfigEntity {
    return new PlatformConfigEntity(configData);
  }
}
