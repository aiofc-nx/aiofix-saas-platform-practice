/**
 * @file username.vo.ts
 * @description 用户名值对象
 *
 * 该值对象封装用户名的业务规则和验证逻辑。
 * 遵循DDD原则，确保用户名的不可变性和值相等性。
 *
 * 通用性说明：
 * 1. 跨领域使用：用户、认证、权限、审计、通知等所有领域都需要
 * 2. 标准化规则：用户名格式、长度、字符限制等规则相对统一
 * 3. 无业务依赖：不依赖特定业务逻辑，纯粹的数据验证
 * 4. 频繁复用：在多个子领域中被大量使用
 */

import { BaseValueObject, InvalidValueObjectError } from './base.value-object';

/**
 * @class InvalidUsernameException
 * @description 无效用户名异常
 */
export class InvalidUsernameException extends InvalidValueObjectError {
  constructor(message: string, value?: string) {
    super(message, 'Username', value);
    this.name = 'InvalidUsernameException';
  }
}

/**
 * @class Username
 * @description 用户名值对象
 *
 * 主要原理与机制：
 * 1. 继承BaseValueObject基类，获得值对象基础功能
 * 2. 不可变对象，确保数据一致性
 * 3. 封装用户名验证规则
 * 4. 支持值相等性比较
 *
 * 功能与业务规则：
 * 1. 用户名格式验证
 * 2. 用户名长度限制
 * 3. 用户名字符限制
 * 4. 用户名唯一性保证
 */
export class Username extends BaseValueObject {
  private readonly _value: string;
  private static readonly MIN_LENGTH = 3;
  private static readonly MAX_LENGTH = 50;
  private static readonly PATTERN = /^[a-zA-Z0-9_-]+$/;

  constructor(value: string) {
    super();
    this._value = value;
    this.validate();
  }

  /**
   * @method create
   * @description 创建用户名值对象
   * @param value 用户名字符串
   * @returns {Username} 用户名值对象
   * @throws {InvalidUsernameException} 当用户名无效时抛出异常
   */
  static create(value: string): Username {
    return new Username(value);
  }

  /**
   * @getter value
   * @description 获取用户名字符串值
   * @returns {string} 用户名字符串
   */
  get value(): string {
    return this._value;
  }

  /**
   * @method validate
   * @description 验证用户名格式
   * @private
   * @throws {InvalidUsernameException} 当用户名无效时抛出异常
   */
  private validate(): void {
    if (!this._value || typeof this._value !== 'string') {
      throw new InvalidUsernameException('用户名不能为空');
    }

    const trimmedValue = this._value.trim();
    if (trimmedValue.length === 0) {
      throw new InvalidUsernameException('用户名不能为空');
    }

    if (trimmedValue.length < Username.MIN_LENGTH) {
      throw new InvalidUsernameException(
        `用户名长度不能少于${Username.MIN_LENGTH}个字符`,
      );
    }

    if (trimmedValue.length > Username.MAX_LENGTH) {
      throw new InvalidUsernameException(
        `用户名长度不能超过${Username.MAX_LENGTH}个字符`,
      );
    }

    if (!Username.PATTERN.test(trimmedValue)) {
      throw new InvalidUsernameException(
        '用户名只能包含字母、数字、下划线和连字符',
      );
    }

    // 检查是否以数字开头
    if (/^\d/.test(trimmedValue)) {
      throw new InvalidUsernameException('用户名不能以数字开头');
    }

    // 检查是否以连字符或下划线结尾
    if (/[-_]$/.test(trimmedValue)) {
      throw new InvalidUsernameException('用户名不能以连字符或下划线结尾');
    }

    // 检查连续的特殊字符
    if (/[-_]{2,}/.test(trimmedValue)) {
      throw new InvalidUsernameException('用户名不能包含连续的特殊字符');
    }
  }

  /**
   * @method normalize
   * @description 标准化用户名
   * @returns {string} 标准化后的用户名
   */
  normalize(): string {
    return this._value.trim().toLowerCase();
  }

  /**
   * @method getDisplayName
   * @description 获取显示名称
   * @returns {string} 显示名称
   */
  getDisplayName(): string {
    return this._value.trim();
  }

  /**
   * @method equals
   * @description 比较两个用户名是否相等
   * @param other 另一个用户名值对象
   * @returns {boolean} 是否相等
   */
  equals(other: unknown): boolean {
    if (!(other instanceof Username)) {
      return false;
    }
    return this.normalize() === other.normalize();
  }

  /**
   * @method toString
   * @description 转换为字符串
   * @returns {string} 用户名字符串
   */
  toString(): string {
    return this._value;
  }

  /**
   * @method toJSON
   * @description 转换为JSON字符串
   * @returns {string} JSON字符串
   */
  toJSON(): string {
    return JSON.stringify({ value: this._value });
  }

  /**
   * @method toObject
   * @description 转换为普通对象
   * @returns {Record<string, unknown>} 普通对象
   */
  toObject(): Record<string, unknown> {
    return { value: this._value };
  }

  /**
   * @method fromJSON
   * @description 从JSON字符串创建用户名
   * @param json JSON字符串
   * @returns {Username} 用户名值对象
   */
  fromJSON(json: string): this {
    try {
      const data = JSON.parse(json) as { value: string };

      if (typeof data.value !== 'string') {
        throw new Error('Invalid JSON format: value must be a string');
      }

      return new Username(data.value) as this;
    } catch {
      throw new InvalidUsernameException(
        'Invalid JSON format for Username',
        json,
      );
    }
  }

  /**
   * @method clone
   * @description 克隆用户名值对象
   * @returns {Username} 克隆的用户名值对象
   */
  clone(): this {
    return new Username(this._value) as this;
  }
}
