/**
 * @file organization-name.vo.ts
 * @description 组织名称值对象
 *
 * 该值对象封装组织名称的业务规则和验证逻辑。
 * 组织名称具有全局唯一性，支持国际化。
 *
 * 通用性说明：
 * 1. 跨领域使用：所有需要组织标识的模块都需要
 * 2. 标准化规则：组织名称格式、长度、唯一性等规则相对统一
 * 3. 无业务依赖：不依赖特定业务逻辑，纯粹的数据验证
 * 4. 频繁复用：在多个子领域中被大量使用
 */

import { BaseValueObject, InvalidValueObjectError } from './base.value-object';

/**
 * @class InvalidOrganizationNameError
 * @description 组织名称格式错误
 */
export class InvalidOrganizationNameError extends InvalidValueObjectError {
  constructor(message: string, value?: string) {
    super(message, 'OrganizationName', value);
    this.name = 'InvalidOrganizationNameError';
  }
}

/**
 * @class OrganizationName
 * @description 组织名称值对象
 *
 * 表示组织名称，具有以下特性：
 * - 不可变性：创建后不能修改
 * - 值相等性：通过值判断相等
 * - 格式验证：确保名称格式正确
 * - 类型安全：强类型约束
 * - 国际化支持：支持多语言名称
 */
export class OrganizationName extends BaseValueObject {
  private readonly _value: string;
  private readonly _locale?: string;

  /**
   * @constructor
   * @description 创建组织名称值对象
   * @param value 组织名称字符串
   * @param locale 语言代码（可选）
   */
  constructor(value: string, locale?: string) {
    super();
    this.validateOrganizationName(value);
    this._value = value.trim();
    this._locale = locale;
  }

  /**
   * 获取组织名称值
   * @returns 组织名称字符串
   */
  get value(): string {
    return this._value;
  }

  /**
   * 获取语言代码
   * @returns 语言代码
   */
  get locale(): string | undefined {
    return this._locale;
  }

  /**
   * 获取组织名称的字符串表示
   * @returns 组织名称字符串
   */
  toString(): string {
    return this._value;
  }

  /**
   * 比较两个组织名称是否相等
   * @param other 另一个组织名称
   * @returns 是否相等
   */
  equals(other: unknown): boolean {
    return (
      other instanceof OrganizationName &&
      this._value === other._value &&
      this._locale === other._locale
    );
  }

  /**
   * 转换为JSON字符串
   * @returns JSON字符串
   */
  toJSON(): string {
    return JSON.stringify({ value: this._value, locale: this._locale });
  }

  /**
   * 转换为普通对象
   * @returns 普通对象
   */
  toObject(): Record<string, unknown> {
    return { value: this._value, locale: this._locale };
  }

  /**
   * 从JSON字符串创建值对象
   * @param json JSON字符串
   * @returns 值对象实例
   */
  fromJSON(json: string): this {
    const data = JSON.parse(json) as { value: string; locale?: string };
    return new OrganizationName(data.value, data.locale) as this;
  }

  /**
   * 克隆值对象
   * @returns 克隆的值对象
   */
  clone(): this {
    return new OrganizationName(this._value, this._locale) as this;
  }

  /**
   * 验证组织名称格式
   * @param value 组织名称字符串
   * @throws InvalidOrganizationNameError 当名称格式不正确时
   */
  private validateOrganizationName(value: string): void {
    if (!value || typeof value !== 'string') {
      throw new InvalidOrganizationNameError('组织名称不能为空', value);
    }

    const trimmedValue = value.trim();
    if (trimmedValue.length === 0) {
      throw new InvalidOrganizationNameError('组织名称不能为空', value);
    }

    if (trimmedValue.length < 2) {
      throw new InvalidOrganizationNameError('组织名称至少需要2个字符', value);
    }

    if (trimmedValue.length > 100) {
      throw new InvalidOrganizationNameError(
        '组织名称不能超过100个字符',
        value,
      );
    }

    // 检查是否包含非法字符
    const invalidChars = /[<>:"/\\|?*]/;
    if (invalidChars.test(trimmedValue)) {
      throw new InvalidOrganizationNameError(
        '组织名称不能包含以下字符: < > : " / \\ | ? *',
        value,
      );
    }

    // 检查是否包含控制字符
    for (let i = 0; i < trimmedValue.length; i++) {
      const charCode = trimmedValue.charCodeAt(i);
      if (charCode < 32 || charCode === 127) {
        throw new InvalidOrganizationNameError(
          '组织名称不能包含控制字符',
          value,
        );
      }
    }
  }

  /**
   * 创建新的组织名称实例
   * @param value 组织名称值
   * @param locale 语言代码（可选）
   * @returns 组织名称实例
   */
  static create(value: string, locale?: string): OrganizationName {
    return new OrganizationName(value, locale);
  }
}
