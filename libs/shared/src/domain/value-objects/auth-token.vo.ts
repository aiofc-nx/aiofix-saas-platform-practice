/**
 * @file auth-token.vo.ts
 * @description 认证令牌值对象
 *
 * 该值对象负责封装认证令牌的业务逻辑，包括：
 * - 认证令牌格式验证
 * - 认证令牌过期时间管理
 * - 认证令牌类型识别
 *
 * 遵循DDD原则，确保值对象的不可变性和值相等性。
 * 该值对象为共享领域组件，可在所有需要令牌管理的模块中使用。
 */

import { BaseValueObject } from './base.value-object';

/**
 * @enum TokenType
 * @description 令牌类型枚举
 */
export enum TokenType {
  JWT = 'jwt', // JWT令牌
  ACCESS = 'access', // 访问令牌
  REFRESH = 'refresh', // 刷新令牌
  API = 'api', // API令牌
  SESSION = 'session', // 会话令牌
}

/**
 * @class AuthToken
 * @description 认证令牌值对象
 *
 * 主要原理与机制：
 * 1. 不可变性：创建后不能修改
 * 2. 值相等性：通过值判断相等
 * 3. 业务规则封装：令牌格式验证和过期管理
 * 4. 类型安全：强类型约束
 * 5. 继承BaseValueObject：获得值对象基础功能
 *
 * 功能与业务规则：
 * 1. 认证令牌格式验证（长度、字符类型、唯一性等）
 * 2. 认证令牌生成和转换
 * 3. 认证令牌比较和相等性判断
 * 4. 认证令牌过期时间管理
 */
export class AuthToken extends BaseValueObject {
  private readonly _value: string;
  private readonly _type: TokenType;
  private readonly _expiresAt: Date;

  constructor(
    value: string,
    type: TokenType | string = TokenType.JWT,
    expiresAt?: Date
  ) {
    super();
    this.validate(value);
    this._value = value;
    this._type = (typeof type === 'string'
      ? (type as TokenType)
      : type) ?? TokenType.JWT;
    this._expiresAt = expiresAt ?? new Date(Date.now() + 24 * 60 * 60 * 1000); // 默认24小时
    this.validateInvariants();
  }

  /**
   * @method get value
   * @description 获取认证令牌字符串值
   * @returns {string} 认证令牌
   */
  get value(): string {
    return this._value;
  }

  /**
   * @method get type
   * @description 获取令牌类型
   * @returns {TokenType} 令牌类型
   */
  get type(): TokenType {
    return this._type;
  }

  /**
   * @method get expiresAt
   * @description 获取过期时间
   * @returns {Date} 过期时间
   */
  get expiresAt(): Date {
    return new Date(this._expiresAt);
  }

  /**
   * @method toString
   * @description 转换为字符串
   * @returns {string} 认证令牌字符串
   */
  toString(): string {
    return this._value;
  }

  /**
   * @method equals
   * @description 比较两个认证令牌是否相等
   * @param other 另一个认证令牌值对象
   * @returns {boolean} 是否相等
   */
  equals(other: unknown): boolean {
    return other instanceof AuthToken && this._value === other._value;
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
      type: this._type,
      expiresAt: this._expiresAt.toISOString(),
    };
  }

  /**
   * @method fromJSON
   * @description 从JSON字符串创建值对象
   * @param json JSON字符串
   * @returns {this} 认证令牌值对象
   */
  fromJSON(json: string): this {
    const data = JSON.parse(json);
    return new AuthToken(
      data.value,
      data.type,
      new Date(data.expiresAt)
    ) as this;
  }

  /**
   * @method clone
   * @description 克隆值对象
   * @returns {this} 克隆的认证令牌值对象
   */
  clone(): this {
    return new AuthToken(
      this._value,
      this._type,
      new Date(this._expiresAt)
    ) as this;
  }

  /**
   * @method isExpired
   * @description 检查令牌是否已过期
   * @returns {boolean} 是否已过期
   */
  isExpired(): boolean {
    return new Date() > this._expiresAt;
  }

  /**
   * @method isExpiringSoon
   * @description 检查令牌是否即将过期
   * @param minutes 提前多少分钟算即将过期
   * @returns {boolean} 是否即将过期
   */
  isExpiringSoon(minutes = 30): boolean {
    const now = new Date();
    const expiringTime = new Date(
      this._expiresAt.getTime() - minutes * 60 * 1000
    );
    return now > expiringTime;
  }

  /**
   * @method getRemainingTime
   * @description 获取剩余时间（毫秒）
   * @returns {number} 剩余时间
   */
  getRemainingTime(): number {
    const now = new Date();
    return Math.max(0, this._expiresAt.getTime() - now.getTime());
  }

  /**
   * @method getRemainingMinutes
   * @description 获取剩余分钟数
   * @returns {number} 剩余分钟数
   */
  getRemainingMinutes(): number {
    return Math.floor(this.getRemainingTime() / (60 * 1000));
  }

  /**
   * @method isJWT
   * @description 判断是否为JWT令牌
   * @returns {boolean} 是否为JWT令牌
   */
  isJWT(): boolean {
    return this._type === TokenType.JWT;
  }

  /**
   * @method isAccessToken
   * @description 判断是否为访问令牌
   * @returns {boolean} 是否为访问令牌
   */
  isAccessToken(): boolean {
    return this._type === TokenType.ACCESS;
  }

  /**
   * @method isRefreshToken
   * @description 判断是否为刷新令牌
   * @returns {boolean} 是否为刷新令牌
   */
  isRefreshToken(): boolean {
    return this._type === TokenType.REFRESH;
  }

  /**
   * @method isApiToken
   * @description 判断是否为API令牌
   * @returns {boolean} 是否为API令牌
   */
  isApiToken(): boolean {
    return this._type === TokenType.API;
  }

  /**
   * @method isSessionToken
   * @description 判断是否为会话令牌
   * @returns {boolean} 是否为会话令牌
   */
  isSessionToken(): boolean {
    return this._type === TokenType.SESSION;
  }

  /**
   * @private
   * @method validate
   * @description 验证认证令牌格式
   * @param value 认证令牌字符串
   */
  private validate(value: string): void {
    if (!value || typeof value !== 'string') {
      throw new Error('认证令牌不能为空');
    }

    const trimmedValue = value.trim();
    if (trimmedValue.length === 0) {
      throw new Error('认证令牌不能为空');
    }

    // 检查长度
    if (trimmedValue.length < 32) {
      throw new Error('认证令牌长度不能少于32个字符');
    }

    if (trimmedValue.length > 512) {
      throw new Error('认证令牌长度不能超过512个字符');
    }

    // 检查字符类型（JWT格式：base64编码的字符）
    const validPattern = /^[A-Za-z0-9\-_.=]+$/;
    if (!validPattern.test(trimmedValue)) {
      throw new Error('认证令牌只能包含字母、数字、连字符、下划线、点号和等号');
    }

    // 检查是否包含空格
    if (trimmedValue.includes(' ')) {
      throw new Error('认证令牌不能包含空格');
    }

    // 检查是否为纯数字
    if (/^\d+$/.test(trimmedValue)) {
      throw new Error('认证令牌不能是纯数字');
    }
  }

  /**
   * @static
   * @method create
   * @description 从字符串创建认证令牌值对象
   * @param value 认证令牌字符串
   * @param type 令牌类型
   * @param expiresAt 过期时间
   * @returns {AuthToken} 认证令牌值对象
   */
  static create(
    value: string,
    type: TokenType = TokenType.JWT,
    expiresAt?: Date
  ): AuthToken {
    return new AuthToken(value, type, expiresAt);
  }

  /**
   * @static
   * @method generate
   * @description 生成随机认证令牌
   * @param type 令牌类型
   * @param expiresInMinutes 过期时间（分钟）
   * @returns {AuthToken} 认证令牌值对象
   */
  static generate(
    type: TokenType = TokenType.JWT,
    expiresInMinutes = 1440
  ): AuthToken {
    // 生成随机字符串
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';

    // 生成第一部分（头部）
    for (let i = 0; i < 8; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    token += '.';

    // 生成第二部分（载荷）
    for (let i = 0; i < 16; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    token += '.';

    // 生成第三部分（签名）
    for (let i = 0; i < 8; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);
    return new AuthToken(token, type, expiresAt);
  }

  /**
   * @static
   * @method generateAccessToken
   * @description 生成访问令牌
   * @param expiresInMinutes 过期时间（分钟）
   * @returns {AuthToken} 认证令牌值对象
   */
  static generateAccessToken(expiresInMinutes = 60): AuthToken {
    return AuthToken.generate(TokenType.ACCESS, expiresInMinutes);
  }

  /**
   * @static
   * @method generateRefreshToken
   * @description 生成刷新令牌
   * @param expiresInMinutes 过期时间（分钟）
   * @returns {AuthToken} 认证令牌值对象
   */
  static generateRefreshToken(expiresInMinutes = 1440): AuthToken {
    return AuthToken.generate(TokenType.REFRESH, expiresInMinutes);
  }

  /**
   * @static
   * @method generateApiToken
   * @description 生成API令牌
   * @param expiresInMinutes 过期时间（分钟）
   * @returns {AuthToken} 认证令牌值对象
   */
  static generateApiToken(expiresInMinutes = 1440): AuthToken {
    return AuthToken.generate(TokenType.API, expiresInMinutes);
  }

  /**
   * @static
   * @method generateSessionToken
   * @description 生成会话令牌
   * @param expiresInMinutes 过期时间（分钟）
   * @returns {AuthToken} 认证令牌值对象
   */
  static generateSessionToken(expiresInMinutes = 480): AuthToken {
    return AuthToken.generate(TokenType.SESSION, expiresInMinutes);
  }
}
