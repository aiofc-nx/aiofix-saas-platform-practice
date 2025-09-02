/**
 * @file device-token.vo.ts
 * @description 设备令牌值对象
 *
 * 该值对象负责封装设备令牌的业务逻辑，包括：
 * - 设备令牌格式验证
 * - 设备令牌标准化处理
 * - 设备令牌类型识别
 *
 * 遵循DDD原则，确保值对象的不可变性和值相等性。
 * 该值对象为共享领域组件，可在所有需要设备识别的模块中使用。
 */

import { BaseValueObject } from './base.value-object';

/**
 * @enum DeviceType
 * @description 设备类型枚举
 */
export enum DeviceType {
  IOS = 'ios', // iOS设备
  ANDROID = 'android', // Android设备
  WEB = 'web', // Web浏览器
  UNKNOWN = 'unknown', // 未知设备
}

/**
 * @interface DeviceTokenInfo
 * @description 设备令牌信息接口
 */
export interface DeviceTokenInfo {
  type: DeviceType; // 设备类型
  isValid: boolean; // 是否有效
  length: number; // 令牌长度
}

/**
 * @class DeviceToken
 * @description 设备令牌值对象
 *
 * 主要原理与机制：
 * 1. 不可变性：创建后不能修改
 * 2. 值相等性：通过值判断相等
 * 3. 业务规则封装：设备令牌格式验证
 * 4. 类型安全：强类型约束
 * 5. 继承BaseValueObject：获得值对象基础功能
 *
 * 功能与业务规则：
 * 1. 设备令牌格式验证（支持iOS、Android、Web）
 * 2. 设备令牌长度验证
 * 3. 设备令牌类型识别
 * 4. 设备令牌标准化处理
 */
export class DeviceToken extends BaseValueObject {
  private readonly _value: string;
  private readonly _info: DeviceTokenInfo;

  constructor(value: string, _platform?: string) {
    super();
    this.validate(value);
    this._value = this.normalize(value);
    this._info = this.parseDeviceToken(this._value);
    this.validateInvariants();
  }

  /**
   * @method get value
   * @description 获取设备令牌值
   * @returns {string} 设备令牌
   */
  get value(): string {
    return this._value;
  }

  /**
   * @method get info
   * @description 获取设备令牌信息
   * @returns {DeviceTokenInfo} 设备令牌信息
   */
  get info(): DeviceTokenInfo {
    return { ...this._info };
  }

  /**
   * @method get type
   * @description 获取设备类型
   * @returns {DeviceType} 设备类型
   */
  get type(): DeviceType {
    return this._info.type;
  }

  /**
   * @method get length
   * @description 获取令牌长度
   * @returns {number} 令牌长度
   */
  get length(): number {
    return this._info.length;
  }

  /**
   * @method isValid
   * @description 判断设备令牌是否有效
   * @returns {boolean} 是否有效
   */
  isValid(): boolean {
    return this._info.isValid;
  }

  /**
   * @method isIOS
   * @description 判断是否为iOS设备
   * @returns {boolean} 是否为iOS设备
   */
  isIOS(): boolean {
    return this._info.type === DeviceType.IOS;
  }

  /**
   * @method isAndroid
   * @description 判断是否为Android设备
   * @returns {boolean} 是否为Android设备
   */
  isAndroid(): boolean {
    return this._info.type === DeviceType.ANDROID;
  }

  /**
   * @method isWeb
   * @description 判断是否为Web设备
   * @returns {boolean} 是否为Web设备
   */
  isWeb(): boolean {
    return this._info.type === DeviceType.WEB;
  }

  /**
   * @method equals
   * @description 判断两个设备令牌是否相等
   * @param other 另一个设备令牌值对象
   * @returns {boolean} 是否相等
   */
  equals(other: unknown): boolean {
    return other instanceof DeviceToken && this._value === other._value;
  }

  /**
   * @method toString
   * @description 转换为字符串
   * @returns {string} 设备令牌字符串
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

  /**
   * @method fromJSON
   * @description 从JSON字符串创建值对象
   * @param json JSON字符串
   * @returns {this} 设备令牌值对象
   */
  fromJSON(json: string): this {
    const data = JSON.parse(json);
    return new DeviceToken(data.value) as this;
  }

  /**
   * @method clone
   * @description 克隆值对象
   * @returns {this} 克隆的设备令牌值对象
   */
  clone(): this {
    return new DeviceToken(this._value) as this;
  }

  /**
   * @private
   * @method validate
   * @description 验证设备令牌格式
   * @param value 设备令牌值
   */
  private validate(value: string): void {
    if (!value) {
      throw new Error('设备令牌不能为空');
    }

    if (typeof value !== 'string') {
      throw new Error('设备令牌必须是字符串类型');
    }

    const trimmedValue = value.trim();
    if (trimmedValue.length === 0) {
      throw new Error('设备令牌不能为空');
    }

    if (trimmedValue.length < 32) {
      throw new Error('设备令牌长度不能少于32个字符');
    }

    if (trimmedValue.length > 256) {
      throw new Error('设备令牌长度不能超过256个字符');
    }

    // 检查是否包含控制字符
    for (let i = 0; i < trimmedValue.length; i++) {
      const charCode = trimmedValue.charCodeAt(i);
      if (
        (charCode >= 0x00 && charCode <= 0x08) ||
        charCode === 0x0b ||
        charCode === 0x0c ||
        (charCode >= 0x0e && charCode <= 0x1f) ||
        charCode === 0x7f
      ) {
        throw new Error('设备令牌包含控制字符');
      }
    }
  }

  /**
   * @private
   * @method normalize
   * @description 标准化设备令牌
   * @param value 设备令牌值
   * @returns {string} 标准化后的设备令牌
   */
  private normalize(value: string): string {
    return value.trim();
  }

  /**
   * @private
   * @method parseDeviceToken
   * @description 解析设备令牌信息
   * @param value 标准化后的设备令牌
   * @returns {DeviceTokenInfo} 设备令牌信息
   */
  private parseDeviceToken(value: string): DeviceTokenInfo {
    // iOS设备令牌格式 (64位十六进制)
    if (/^[a-fA-F0-9]{64}$/.test(value)) {
      return {
        type: DeviceType.IOS,
        isValid: true,
        length: value.length,
      };
    }

    // Android设备令牌格式 (Firebase FCM)
    if (/^[a-zA-Z0-9:_-]{140,}$/.test(value)) {
      return {
        type: DeviceType.ANDROID,
        isValid: true,
        length: value.length,
      };
    }

    // Web设备令牌格式 (Web Push)
    if (/^[a-zA-Z0-9_-]{87}$/.test(value)) {
      return {
        type: DeviceType.WEB,
        isValid: true,
        length: value.length,
      };
    }

    // 通用格式（可能是自定义令牌）
    if (/^[a-zA-Z0-9._-]+$/.test(value)) {
      return {
        type: DeviceType.UNKNOWN,
        isValid: true,
        length: value.length,
      };
    }

    // 无效格式
    return {
      type: DeviceType.UNKNOWN,
      isValid: false,
      length: value.length,
    };
  }

  /**
   * @static
   * @method create
   * @description 创建设备令牌值对象
   * @param value 设备令牌值
   * @returns {DeviceToken} 设备令牌值对象
   */
  static create(value: string): DeviceToken {
    return new DeviceToken(value);
  }

  /**
   * @static
   * @method createIOS
   * @description 创建iOS设备令牌值对象
   * @param value iOS设备令牌值
   * @returns {DeviceToken} 设备令牌值对象
   */
  static createIOS(value: string): DeviceToken {
    const token = new DeviceToken(value);
    if (token.type !== DeviceType.IOS) {
      throw new Error('无效的iOS设备令牌格式');
    }
    return token;
  }

  /**
   * @static
   * @method createAndroid
   * @description 创建Android设备令牌值对象
   * @param value Android设备令牌值
   * @returns {DeviceToken} 设备令牌值对象
   */
  static createAndroid(value: string): DeviceToken {
    const token = new DeviceToken(value);
    if (token.type !== DeviceType.ANDROID) {
      throw new Error('无效的Android设备令牌格式');
    }
    return token;
  }

  /**
   * @static
   * @method createWeb
   * @description 创建Web设备令牌值对象
   * @param value Web设备令牌值
   * @returns {DeviceToken} 设备令牌值对象
   */
  static createWeb(value: string): DeviceToken {
    const token = new DeviceToken(value);
    if (token.type !== DeviceType.WEB) {
      throw new Error('无效的Web设备令牌格式');
    }
    return token;
  }
}
