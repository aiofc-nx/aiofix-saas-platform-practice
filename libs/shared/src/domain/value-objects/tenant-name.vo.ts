/**
 * @file tenant-name.vo.ts
 * @description 租户名称值对象
 *
 * 该值对象封装租户名称的业务规则和验证逻辑。
 * 租户名称具有全局唯一性，支持国际化。
 *
 * 通用性说明：
 * 1. 跨领域使用：所有需要租户标识的模块都需要
 * 2. 标准化规则：租户名称格式、长度、唯一性等规则相对统一
 * 3. 无业务依赖：不依赖特定业务逻辑，纯粹的数据验证
 * 4. 频繁复用：在多个子领域中被大量使用
 */

import { BaseValueObject, InvalidValueObjectError } from './base.value-object';

/**
 * @class InvalidTenantNameError
 * @description 租户名称格式错误
 */
export class InvalidTenantNameError extends InvalidValueObjectError {
  constructor(message: string, value?: string) {
    super(message, 'TenantName', value);
    this.name = 'InvalidTenantNameError';
  }
}

/**
 * @class TenantName
 * @description 租户名称值对象
 *
 * 表示租户名称，具有以下特性：
 * - 不可变性：创建后不能修改
 * - 值相等性：通过值判断相等
 * - 格式验证：确保名称格式正确
 * - 类型安全：强类型约束
 * - 国际化支持：支持多语言名称
 */
export class TenantName extends BaseValueObject {
  private readonly _value: string;
  private readonly _locale?: string;

  /**
   * @constructor
   * @description 创建租户名称值对象
   * @param value 租户名称字符串
   * @param locale 语言代码（可选）
   */
  constructor(value: string, locale?: string) {
    super();
    this.validateTenantName(value);
    this._value = value.trim();
    this._locale = locale;
    this.validateInvariants();
  }

  /**
   * @getter value
   * @description 获取租户名称值
   * @returns {string} 租户名称字符串
   */
  get value(): string {
    return this._value;
  }

  /**
   * @getter locale
   * @description 获取语言代码
   * @returns {string | undefined} 语言代码
   */
  get locale(): string | undefined {
    return this._locale;
  }

  /**
   * @method toString
   * @description 转换为字符串
   * @returns {string} 租户名称字符串
   */
  toString(): string {
    return this._value;
  }

  /**
   * @method equals
   * @description 比较两个租户名称是否相等
   * @param other 另一个租户名称值对象
   * @returns {boolean} 是否相等
   */
  equals(other: unknown): boolean {
    return other instanceof TenantName && this._value === other._value;
  }

  /**
   * @method toJSON
   * @description 转换为JSON字符串
   * @returns {string} JSON字符串
   */
  toJSON(): string {
    return JSON.stringify({
      value: this._value,
      locale: this._locale,
    });
  }

  /**
   * @method toObject
   * @description 转换为普通对象
   * @returns {Record<string, unknown>} 普通对象
   */
  toObject(): Record<string, unknown> {
    return {
      value: this._value,
      locale: this._locale,
    };
  }

  /**
   * @method fromJSON
   * @description 从JSON字符串创建租户名称
   * @param json JSON字符串
   * @returns {this} 租户名称值对象
   */
  fromJSON(json: string): this {
    try {
      const data = JSON.parse(json);
      return new TenantName(data.value, data.locale) as this;
    } catch (error) {
      throw new InvalidTenantNameError(`Invalid JSON format: ${json}`, json);
    }
  }

  /**
   * @method clone
   * @description 克隆租户名称
   * @returns {TenantName} 新的租户名称实例
   */
  clone(): this {
    return new TenantName(this._value, this._locale) as this;
  }

  /**
   * @method withLocale
   * @description 创建指定语言的租户名称
   * @param locale 语言代码
   * @returns {TenantName} 新的租户名称实例
   */
  withLocale(locale: string): TenantName {
    return new TenantName(this._value, locale);
  }

  /**
   * @method isLocalized
   * @description 检查是否为本地化名称
   * @returns {boolean} 是否为本地化名称
   */
  isLocalized(): boolean {
    return this._locale !== undefined;
  }

  /**
   * @method getDisplayName
   * @description 获取显示名称（包含语言信息）
   * @returns {string} 显示名称
   */
  getDisplayName(): string {
    if (this._locale) {
      return `${this._value} (${this._locale})`;
    }
    return this._value;
  }

  /**
   * @private
   * @method validateTenantName
   * @description 验证租户名称格式
   * @param value 租户名称值
   * @throws {InvalidTenantNameError} 当名称无效时抛出异常
   */
  private validateTenantName(value: string): void {
    if (!value || typeof value !== 'string') {
      throw new InvalidTenantNameError(
        'Tenant name must be a non-empty string',
        value,
      );
    }

    const trimmedValue = value.trim();
    if (trimmedValue.length === 0) {
      throw new InvalidTenantNameError(
        'Tenant name cannot be empty or only whitespace',
        value,
      );
    }

    // 租户名称长度限制：2-100个字符
    if (trimmedValue.length < 2) {
      throw new InvalidTenantNameError(
        'Tenant name must be at least 2 characters long',
        value,
      );
    }

    if (trimmedValue.length > 100) {
      throw new InvalidTenantNameError(
        'Tenant name cannot exceed 100 characters',
        value,
      );
    }

    // 租户名称格式验证：允许字母、数字、中文、空格、连字符、下划线
    const validNamePattern = /^[a-zA-Z0-9\u4e00-\u9fa5\s\-_]+$/;
    if (!validNamePattern.test(trimmedValue)) {
      throw new InvalidTenantNameError(
        'Tenant name contains invalid characters. Only letters, numbers, Chinese characters, spaces, hyphens, and underscores are allowed',
        value,
      );
    }

    // 不允许连续的空格
    if (/\s{2,}/.test(trimmedValue)) {
      throw new InvalidTenantNameError(
        'Tenant name cannot contain consecutive spaces',
        value,
      );
    }

    // 不允许以空格开头或结尾
    if (trimmedValue.startsWith(' ') || trimmedValue.endsWith(' ')) {
      throw new InvalidTenantNameError(
        'Tenant name cannot start or end with spaces',
        value,
      );
    }
  }

  /**
   * @protected
   * @method validateInvariants
   * @description 验证值对象不变性条件
   * @throws {InvalidTenantNameError} 当违反业务规则时抛出
   */
  protected validateInvariants(): void {
    // 确保名称不为空
    if (!this._value || this._value.length === 0) {
      throw new InvalidTenantNameError(
        'Tenant name cannot be empty after validation',
        this._value,
      );
    }

    // 确保名称长度在有效范围内
    if (this._value.length < 2 || this._value.length > 100) {
      throw new InvalidTenantNameError(
        'Tenant name length must be between 2 and 100 characters',
        this._value,
      );
    }
  }
}
