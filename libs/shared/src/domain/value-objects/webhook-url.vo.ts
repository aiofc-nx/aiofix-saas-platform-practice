/**
 * @file webhook-url.vo.ts
 * @description Webhook URL值对象
 *
 * 该值对象负责封装Webhook URL的业务逻辑，包括：
 * - Webhook URL格式验证
 * - Webhook URL安全性检查
 * - Webhook URL标准化处理
 *
 * 遵循DDD原则，确保值对象的不可变性和值相等性。
 * 该值对象为共享领域组件，可在所有需要URL验证的模块中使用。
 */

import { BaseValueObject } from './base.value-object';

/**
 * @enum WebhookProtocol
 * @description Webhook协议枚举
 */
export enum WebhookProtocol {
  HTTP = 'http',
  HTTPS = 'https',
}

/**
 * @interface WebhookUrlInfo
 * @description Webhook URL信息接口
 */
export interface WebhookUrlInfo {
  protocol: WebhookProtocol; // 协议类型
  hostname: string; // 主机名
  port?: number; // 端口号
  path: string; // 路径
  isValid: boolean; // 是否有效
  isSecure: boolean; // 是否安全（HTTPS）
}

/**
 * @class WebhookUrl
 * @description Webhook URL值对象
 *
 * 主要原理与机制：
 * 1. 不可变性：创建后不能修改
 * 2. 值相等性：通过值判断相等
 * 3. 业务规则封装：URL格式验证
 * 4. 类型安全：强类型约束
 * 5. 继承BaseValueObject：获得值对象基础功能
 *
 * 功能与业务规则：
 * 1. Webhook URL格式验证
 * 2. Webhook URL安全性检查
 * 3. Webhook URL标准化处理
 * 4. Webhook URL解析和验证
 */
export class WebhookUrl extends BaseValueObject {
  private readonly _value: string;
  private readonly _info: WebhookUrlInfo;

  constructor(value: string) {
    super();
    this.validate(value);
    this._value = this.normalize(value);
    this._info = this.parseWebhookUrl(this._value);
    this.validateInvariants();
  }

  /**
   * @method get value
   * @description 获取Webhook URL值
   * @returns {string} Webhook URL
   */
  get value(): string {
    return this._value;
  }

  /**
   * @method get info
   * @description 获取Webhook URL信息
   * @returns {WebhookUrlInfo} Webhook URL信息
   */
  get info(): WebhookUrlInfo {
    return { ...this._info };
  }

  /**
   * @method get protocol
   * @description 获取协议类型
   * @returns {WebhookProtocol} 协议类型
   */
  get protocol(): WebhookProtocol {
    return this._info.protocol;
  }

  /**
   * @method get hostname
   * @description 获取主机名
   * @returns {string} 主机名
   */
  get hostname(): string {
    return this._info.hostname;
  }

  /**
   * @method get port
   * @description 获取端口号
   * @returns {number | undefined} 端口号
   */
  get port(): number | undefined {
    return this._info.port;
  }

  /**
   * @method get path
   * @description 获取路径
   * @returns {string} 路径
   */
  get path(): string {
    return this._info.path;
  }

  /**
   * @method isValid
   * @description 判断Webhook URL是否有效
   * @returns {boolean} 是否有效
   */
  isValid(): boolean {
    return this._info.isValid;
  }

  /**
   * @method isSecure
   * @description 判断是否为安全连接
   * @returns {boolean} 是否为安全连接
   */
  isSecure(): boolean {
    return this._info.isSecure;
  }

  /**
   * @method isHTTPS
   * @description 判断是否为HTTPS协议
   * @returns {boolean} 是否为HTTPS协议
   */
  isHTTPS(): boolean {
    return this._info.protocol === WebhookProtocol.HTTPS;
  }

  /**
   * @method equals
   * @description 判断两个Webhook URL是否相等
   * @param other 另一个Webhook URL值对象
   * @returns {boolean} 是否相等
   */
  equals(other: unknown): boolean {
    return other instanceof WebhookUrl && this._value === other._value;
  }

  /**
   * @method toString
   * @description 转换为字符串
   * @returns {string} Webhook URL字符串
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
   * @returns {this} Webhook URL值对象
   */
  fromJSON(json: string): this {
    const data = JSON.parse(json) as { value: string };

    if (typeof data.value !== 'string') {
      throw new Error('Invalid JSON format: value must be a string');
    }

    return new WebhookUrl(data.value) as this;
  }

  /**
   * @method clone
   * @description 克隆值对象
   * @returns {this} 克隆的Webhook URL值对象
   */
  clone(): this {
    return new WebhookUrl(this._value) as this;
  }

  /**
   * @method toURL
   * @description 转换为URL对象
   * @returns {URL} URL对象
   */
  toURL(): URL {
    return new URL(this._value);
  }

  /**
   * @private
   * @method validate
   * @description 验证Webhook URL格式
   * @param value Webhook URL值
   */
  private validate(value: string): void {
    if (!value) {
      throw new Error('Webhook URL不能为空');
    }

    if (typeof value !== 'string') {
      throw new Error('Webhook URL必须是字符串类型');
    }

    const trimmedValue = value.trim();
    if (trimmedValue.length === 0) {
      throw new Error('Webhook URL不能为空');
    }

    if (trimmedValue.length > 2048) {
      throw new Error('Webhook URL长度不能超过2048个字符');
    }

    // 基本URL格式检查
    try {
      new URL(trimmedValue);
    } catch {
      throw new Error('Webhook URL格式无效');
    }

    // 协议检查
    const url = new URL(trimmedValue);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      throw new Error('Webhook URL只支持HTTP和HTTPS协议');
    }

    // 主机名检查
    if (!url.hostname) {
      throw new Error('Webhook URL必须包含有效的主机名');
    }

    if (url.hostname.length > 253) {
      throw new Error('Webhook URL主机名长度不能超过253个字符');
    }

    // 端口检查
    if (url.port) {
      const port = parseInt(url.port, 10);
      if (isNaN(port) || port < 1 || port > 65535) {
        throw new Error('Webhook URL端口号必须在1-65535之间');
      }
    }

    // 路径检查
    if (!url.pathname || url.pathname === '/') {
      throw new Error('Webhook URL必须包含有效的路径');
    }

    // 安全检查：不允许本地地址
    if (this.isLocalAddress(url.hostname)) {
      throw new Error('Webhook URL不能指向本地地址');
    }

    // 安全检查：不允许私有网络地址
    if (this.isPrivateAddress(url.hostname)) {
      throw new Error('Webhook URL不能指向私有网络地址');
    }
  }

  /**
   * @private
   * @method normalize
   * @description 标准化Webhook URL
   * @param value Webhook URL值
   * @returns {string} 标准化后的Webhook URL
   */
  private normalize(value: string): string {
    const url = new URL(value.trim());

    // 移除默认端口
    if (
      url.port &&
      ((url.protocol === 'https:' && url.port === '443') ||
        (url.protocol === 'http:' && url.port === '80'))
    ) {
      url.port = '';
    }

    // 移除末尾斜杠（除非是根路径）
    if (url.pathname.length > 1 && url.pathname.endsWith('/')) {
      url.pathname = url.pathname.slice(0, -1);
    }

    return url.toString();
  }

  /**
   * @private
   * @method parseWebhookUrl
   * @description 解析Webhook URL信息
   * @param value 标准化后的Webhook URL
   * @returns {WebhookUrlInfo} Webhook URL信息
   */
  private parseWebhookUrl(value: string): WebhookUrlInfo {
    const url = new URL(value);

    return {
      protocol:
        url.protocol === 'https:'
          ? WebhookProtocol.HTTPS
          : WebhookProtocol.HTTP,
      hostname: url.hostname,
      port: url.port ? parseInt(url.port, 10) : undefined,
      path: url.pathname,
      isValid: true,
      isSecure: url.protocol === 'https:',
    };
  }

  /**
   * @private
   * @method isLocalAddress
   * @description 判断是否为本地地址
   * @param hostname 主机名
   * @returns {boolean} 是否为本地地址
   */
  private isLocalAddress(hostname: string): boolean {
    const localHostnames = ['localhost', '127.0.0.1', '::1', '0.0.0.0', '::'];

    return localHostnames.includes(hostname.toLowerCase());
  }

  /**
   * @private
   * @method isPrivateAddress
   * @description 判断是否为私有网络地址
   * @param hostname 主机名
   * @returns {boolean} 是否为私有网络地址
   */
  private isPrivateAddress(hostname: string): boolean {
    // 检查是否为IP地址
    const ipRegex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const match = hostname.match(ipRegex);

    if (match) {
      const [, a, b] = match.map(Number);

      // 私有IP地址范围
      return (
        a === 10 ||
        (a === 172 && b >= 16 && b <= 31) ||
        (a === 192 && b === 168) ||
        a === 127 ||
        a === 0 ||
        (a === 169 && b === 254)
      );
    }

    return false;
  }

  /**
   * @static
   * @method create
   * @description 创建Webhook URL值对象
   * @param value Webhook URL值
   * @returns {WebhookUrl} Webhook URL值对象
   */
  static create(value: string): WebhookUrl {
    return new WebhookUrl(value);
  }

  /**
   * @static
   * @method createHTTPS
   * @description 创建HTTPS Webhook URL值对象
   * @param value HTTPS Webhook URL值
   * @returns {WebhookUrl} Webhook URL值对象
   */
  static createHTTPS(value: string): WebhookUrl {
    const url = new WebhookUrl(value);
    if (!url.isHTTPS()) {
      throw new Error('Webhook URL必须是HTTPS协议');
    }
    return url;
  }

  /**
   * @static
   * @method isValid
   * @description 验证Webhook URL是否有效
   * @param value Webhook URL值
   * @returns {boolean} 是否有效
   */
  static isValid(value: string): boolean {
    try {
      new WebhookUrl(value);
      return true;
    } catch {
      return false;
    }
  }
}
