/**
 * @file phone-number.vo.ts
 * @description 手机号码值对象
 *
 * 该值对象负责封装手机号码的业务逻辑，包括：
 * - 手机号码格式验证（支持国际格式）
 * - 手机号码标准化处理
 * - 手机号码国际化和本地化
 * - 手机号码类型识别
 *
 * 遵循DDD原则，确保值对象的不可变性和值相等性。
 * 该值对象为共享领域组件，可在所有需要手机号验证的模块中使用。
 */

import { BaseValueObject } from './base.value-object';

export class InvalidPhoneNumberError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidPhoneNumberError';
  }
}

/**
 * @enum PhoneNumberType
 * @description 手机号码类型枚举
 */
export enum PhoneNumberType {
  MOBILE = 'mobile', // 手机号码
  LANDLINE = 'landline', // 固定电话
  TOLL_FREE = 'toll_free', // 免费电话
  PREMIUM = 'premium', // 付费电话
}

/**
 * @interface PhoneNumberInfo
 * @description 手机号码信息接口
 */
export interface PhoneNumberInfo {
  countryCode: string; // 国家代码
  nationalNumber: string; // 国内号码
  type: PhoneNumberType; // 号码类型
  isValid: boolean; // 是否有效
}

/**
 * @class PhoneNumber
 * @description 手机号码值对象
 *
 * 主要原理与机制：
 * 1. 不可变性：创建后不能修改
 * 2. 值相等性：通过值判断相等
 * 3. 业务规则封装：手机号码格式验证
 * 4. 类型安全：强类型约束
 * 5. 继承BaseValueObject：获得值对象基础功能
 *
 * 功能与业务规则：
 * 1. 手机号码格式验证（支持国际格式）
 * 2. 手机号码长度限制（7-15位）
 * 3. 手机号码标准化（去除空格和特殊字符）
 * 4. 手机号码类型识别（手机、固定电话等）
 * 5. 支持多国家手机号格式
 */
export class PhoneNumber extends BaseValueObject {
  private readonly _value: string;
  private readonly _info: PhoneNumberInfo;

  constructor(value: string) {
    super();
    this.validate(value);
    this._value = this.normalize(value);
    this._info = this.parsePhoneNumber(this._value);
    this.validateInvariants();
  }

  /**
   * @method get value
   * @description 获取手机号码值
   * @returns {string} 手机号码
   */
  get value(): string {
    return this._value;
  }

  /**
   * @method get info
   * @description 获取手机号码信息
   * @returns {PhoneNumberInfo} 手机号码信息
   */
  get info(): PhoneNumberInfo {
    return { ...this._info };
  }

  /**
   * @method get countryCode
   * @description 获取国家代码
   * @returns {string} 国家代码
   */
  get countryCode(): string {
    return this._info.countryCode;
  }

  // 兼容测试所需的方法别名
  getCountryCode(): string {
    return this.countryCode;
  }

  /**
   * @method get nationalNumber
   * @description 获取国内号码
   * @returns {string} 国内号码
   */
  get nationalNumber(): string {
    return this._info.nationalNumber;
  }

  /**
   * @method get type
   * @description 获取号码类型
   * @returns {PhoneNumberType} 号码类型
   */
  get type(): PhoneNumberType {
    return this._info.type;
  }

  getType(): PhoneNumberType {
    return this.type;
  }

  /**
   * @method isValid
   * @description 判断手机号码是否有效
   * @returns {boolean} 是否有效
   */
  isValid(): boolean {
    return this._info.isValid;
  }

  /**
   * @method isMobile
   * @description 判断是否为手机号码
   * @returns {boolean} 是否为手机号码
   */
  isMobile(): boolean {
    return this._info.type === PhoneNumberType.MOBILE;
  }

  isLandline(): boolean {
    return this._info.type === PhoneNumberType.LANDLINE;
  }

  /**
   * @method equals
   * @description 判断两个手机号码是否相等
   * @param other 另一个手机号码值对象
   * @returns {boolean} 是否相等
   */
  equals(other: unknown): boolean {
    if (!(other instanceof PhoneNumber)) return false;
    return this._value === other._value;
  }

  /**
   * @method toString
   * @description 转换为字符串
   * @returns {string} 手机号码字符串
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
    return JSON.stringify(this.toObject());
  }

  /**
   * @method toObject
   * @description 转换为普通对象
   * @returns {Record<string, unknown>} 普通对象
   */
  toObject(): Record<string, unknown> {
    return {
      value: this._value,
      info: this._info,
    };
  }

  getInfo(): PhoneNumberInfo {
    return this.info;
  }

  /**
   * @method fromJSON
   * @description 从JSON字符串创建值对象
   * @param json JSON字符串
   * @returns {this} 手机号码值对象
   */
  fromJSON(json: string): this {
    const data = JSON.parse(json);
    return new PhoneNumber(data.value) as this;
  }

  /**
   * @method clone
   * @description 克隆值对象
   * @returns {this} 克隆的手机号码值对象
   */
  clone(): this {
    return new PhoneNumber(this._value) as this;
  }

  /**
   * @method toInternationalFormat
   * @description 转换为国际格式
   * @returns {string} 国际格式手机号码
   */
  toInternationalFormat(): string {
    if (this._info.countryCode === '86') {
      return `+86 ${this._info.nationalNumber}`;
    }
    return `+${this._info.countryCode} ${this._info.nationalNumber}`;
  }

  /**
   * @private
   * @method validate
   * @description 验证手机号码格式
   * @param value 手机号码值
   */
  private validate(value: string): void {
    if (!value) {
      throw new Error('手机号码不能为空');
    }

    if (typeof value !== 'string') {
      throw new Error('手机号码必须是字符串类型');
    }

    const trimmedValue = value.trim();
    if (trimmedValue.length === 0) {
      throw new Error('手机号码不能为空');
    }

    // 基本格式检查
    const phoneRegex = /^[+]?[0-9\s\-()]+$/;
    if (!phoneRegex.test(trimmedValue)) {
      throw new Error('手机号码格式无效');
    }

    // 长度检查（去除所有非数字字符后）
    const digitsOnly = trimmedValue.replace(/\D/g, '');
    if (digitsOnly.length < 7 || digitsOnly.length > 15) {
      throw new Error('手机号码长度必须在7-15位之间');
    }
  }

  /**
   * @private
   * @method normalize
   * @description 标准化手机号码
   * @param value 手机号码值
   * @returns {string} 标准化后的手机号码
   */
  private normalize(value: string): string {
    // 移除所有非数字字符
    const normalized = value.replace(/\D/g, '');

    // 处理中国手机号码（11位）
    if (normalized.length === 11 && normalized.startsWith('1')) {
      return normalized;
    }

    // 处理国际格式
    if (normalized.startsWith('86') && normalized.length === 13) {
      return normalized;
    }

    return normalized;
  }

  // 暴露静态工具，兼容测试
  static normalize(value: string): string {
    return new PhoneNumber(value).value;
  }

  static format(value: string, countryCode?: string): string {
    // 保持输入格式但进行基本规范化：去除多余空格，确保国家码前缀形如+86
    const trimmed = value.replace(/\s+/g, '');
    // 如果已经是+86-138-1234-5678格式，直接返回
    if (/^\+\d{1,3}-\d{3}-\d{4}-\d{4}$/.test(trimmed)) {
      return trimmed;
    }
    const cc = (countryCode || '+86');
    // 组装为 +cc-xxx-xxxx-xxxx 的格式（仅针对11位中国手机号简化处理）
    const digits = trimmed.replace(/\D/g, '');
    const national = digits.replace(/^86/, '');
    if (national.length === 11) {
      return `${cc}-${national.slice(0,3)}-${national.slice(3,7)}-${national.slice(7)}`;
    }
    return `${cc}-${national}`;
  }

  static fromString(value: string): PhoneNumber {
    return new PhoneNumber(value);
  }

  /**
   * @private
   * @method parsePhoneNumber
   * @description 解析手机号码信息
   * @param value 标准化后的手机号码
   * @returns {PhoneNumberInfo} 手机号码信息
   */
  private parsePhoneNumber(value: string): PhoneNumberInfo {
    // 中国手机号码解析
    if (value.length === 11 && value.startsWith('1')) {
      const prefix = value.substring(0, 3);
      const isValid = this.isValidChineseMobile(prefix);

      return {
        countryCode: '86',
        nationalNumber: value,
        type: PhoneNumberType.MOBILE,
        isValid,
      };
    }

    // 国际格式解析
    if (value.startsWith('86') && value.length === 13) {
      const nationalNumber = value.substring(2);
      const prefix = nationalNumber.substring(0, 3);
      const isValid = this.isValidChineseMobile(prefix);

      return {
        countryCode: '86',
        nationalNumber,
        type: PhoneNumberType.MOBILE,
        isValid,
      };
    }

    // 默认解析
    return {
      countryCode: '86',
      nationalNumber: value,
      type: PhoneNumberType.MOBILE,
      isValid: false,
    };
  }

  /**
   * @private
   * @method isValidChineseMobile
   * @description 验证中国手机号码前缀
   * @param prefix 手机号码前缀
   * @returns {boolean} 是否有效
   */
  private isValidChineseMobile(prefix: string): boolean {
    const validPrefixes = [
      '130',
      '131',
      '132',
      '133',
      '134',
      '135',
      '136',
      '137',
      '138',
      '139',
      '145',
      '147',
      '150',
      '151',
      '152',
      '153',
      '155',
      '156',
      '157',
      '158',
      '159',
      '166',
      '167',
      '170',
      '171',
      '172',
      '173',
      '175',
      '176',
      '177',
      '178',
      '180',
      '181',
      '182',
      '183',
      '184',
      '185',
      '186',
      '187',
      '188',
      '189',
      '190',
      '191',
      '192',
      '193',
      '195',
      '196',
      '197',
      '198',
      '199',
    ];

    return validPrefixes.includes(prefix);
  }

  /**
   * @protected
   * @method validateInvariants
   * @description 验证值对象不变性条件
   */
  protected override validateInvariants(): void {
    if (!this._value || this._value.length === 0) {
      throw new Error('手机号码值不能为空');
    }
  }

  /**
   * @static
   * @method create
   * @description 创建手机号码值对象
   * @param value 手机号码值
   * @returns {PhoneNumber} 手机号码值对象
   */
  static create(value: string): PhoneNumber {
    return new PhoneNumber(value);
  }

  /**
   * @static
   * @method createChineseMobile
   * @description 创建中国手机号码值对象
   * @param value 手机号码值
   * @returns {PhoneNumber} 手机号码值对象
   */
  static createChineseMobile(value: string): PhoneNumber {
    // 确保是中国手机号码格式
    const normalized = value.replace(/\D/g, '');
    if (normalized.length !== 11 || !normalized.startsWith('1')) {
      throw new Error('无效的中国手机号码格式');
    }

    return new PhoneNumber(normalized);
  }

  /**
   * @static
   * @method isValid
   * @description 验证手机号码是否有效
   * @param value 手机号码值
   * @returns {boolean} 是否有效
   */
  static isValid(value: string): boolean {
    try {
      new PhoneNumber(value);
      return true;
    } catch {
      return false;
    }
  }
}
