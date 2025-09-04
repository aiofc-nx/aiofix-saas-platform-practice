/**
 * @file tenant-domain.vo.ts
 * @description 租户域名值对象
 *
 * 该值对象封装租户域名的业务规则和验证逻辑。
 * 租户域名具有全局唯一性，支持子域名管理。
 *
 * 通用性说明：
 * 1. 跨领域使用：所有需要租户标识的模块都需要
 * 2. 标准化规则：租户域名格式、长度、唯一性等规则相对统一
 * 3. 无业务依赖：不依赖特定业务逻辑，纯粹的数据验证
 * 4. 频繁复用：在多个子领域中被大量使用
 */

import { BaseValueObject, InvalidValueObjectError } from './base.value-object';

/**
 * @class InvalidTenantDomainError
 * @description 租户域名格式错误
 */
export class InvalidTenantDomainError extends InvalidValueObjectError {
  constructor(message: string, value?: string) {
    super(message, 'TenantDomain', value);
    this.name = 'InvalidTenantDomainError';
  }
}

/**
 * @class TenantDomain
 * @description 租户域名值对象
 *
 * 表示租户域名，具有以下特性：
 * - 不可变性：创建后不能修改
 * - 值相等性：通过值判断相等
 * - 格式验证：确保域名格式正确
 * - 类型安全：强类型约束
 * - 子域名支持：支持多级子域名
 */
export class TenantDomain extends BaseValueObject {
  private readonly _value: string;
  private readonly _isSubdomain: boolean;
  private readonly _parentDomain?: string;

  /**
   * @constructor
   * @description 创建租户域名值对象
   * @param value 租户域名字符串
   */
  constructor(value: string) {
    super();
    this.validateTenantDomain(value);
    this._value = value.toLowerCase(); // 标准化为小写
    this._isSubdomain = this.detectSubdomain(value);
    this._parentDomain = this.extractParentDomain(value);
    this.validateInvariants();
  }

  /**
   * @getter value
   * @description 获取租户域名值
   * @returns {string} 租户域名字符串
   */
  get value(): string {
    return this._value;
  }

  /**
   * @getter isSubdomain
   * @description 检查是否为子域名
   * @returns {boolean} 是否为子域名
   */
  get isSubdomain(): boolean {
    return this._isSubdomain;
  }

  /**
   * @getter parentDomain
   * @description 获取父域名
   * @returns {string | undefined} 父域名
   */
  get parentDomain(): string | undefined {
    return this._parentDomain;
  }

  /**
   * @method toString
   * @description 转换为字符串
   * @returns {string} 租户域名字符串
   */
  toString(): string {
    return this._value;
  }

  /**
   * @method equals
   * @description 比较两个租户域名是否相等
   * @param other 另一个租户域名值对象
   * @returns {boolean} 是否相等
   */
  equals(other: unknown): boolean {
    return other instanceof TenantDomain && this._value === other._value;
  }

  /**
   * @method toJSON
   * @description 转换为JSON字符串
   * @returns {string} JSON字符串
   */
  toJSON(): string {
    return JSON.stringify({
      value: this._value,
      isSubdomain: this._isSubdomain,
      parentDomain: this._parentDomain,
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
      isSubdomain: this._isSubdomain,
      parentDomain: this._parentDomain,
    };
  }

  /**
   * @method fromJSON
   * @description 从JSON字符串创建租户域名
   * @param json JSON字符串
   * @returns {this} 租户域名值对象
   */
  fromJSON(json: string): this {
    try {
      const data = JSON.parse(json);
      return new TenantDomain(data.value) as this;
    } catch (error) {
      throw new InvalidTenantDomainError(`Invalid JSON format: ${json}`, json);
    }
  }

  /**
   * @method clone
   * @description 克隆租户域名
   * @returns {TenantDomain} 新的租户域名实例
   */
  clone(): this {
    return new TenantDomain(this._value) as this;
  }

  /**
   * @method createSubdomain
   * @description 创建子域名
   * @param subdomain 子域名前缀
   * @returns {TenantDomain} 新的子域名实例
   */
  createSubdomain(subdomain: string): TenantDomain {
    if (!subdomain || typeof subdomain !== 'string') {
      throw new InvalidTenantDomainError(
        'Subdomain must be a non-empty string',
        subdomain,
      );
    }

    // 验证子域名格式
    const validSubdomainPattern = /^[a-z0-9]([a-z0-9\-]*[a-z0-9])?$/;
    if (!validSubdomainPattern.test(subdomain.toLowerCase())) {
      throw new InvalidTenantDomainError(
        'Invalid subdomain format. Only letters, numbers, and hyphens are allowed',
        subdomain,
      );
    }

    const fullDomain = `${subdomain.toLowerCase()}.${this._value}`;
    return new TenantDomain(fullDomain);
  }

  /**
   * @method getDomainParts
   * @description 获取域名的各个部分
   * @returns {string[]} 域名部分数组
   */
  getDomainParts(): string[] {
    return this._value.split('.').reverse();
  }

  /**
   * @method getTopLevelDomain
   * @description 获取顶级域名
   * @returns {string} 顶级域名
   */
  getTopLevelDomain(): string {
    const parts = this.getDomainParts();
    return parts[0];
  }

  /**
   * @method getSecondLevelDomain
   * @description 获取二级域名
   * @returns {string | undefined} 二级域名
   */
  getSecondLevelDomain(): string | undefined {
    const parts = this.getDomainParts();
    return parts.length > 1 ? parts[1] : undefined;
  }

  /**
   * @method getSubdomainLevel
   * @description 获取子域名层级
   * @returns {number} 子域名层级
   */
  getSubdomainLevel(): number {
    const parts = this._value.split('.');
    return Math.max(0, parts.length - 2);
  }

  /**
   * @method isWildcardDomain
   * @description 检查是否为通配符域名
   * @returns {boolean} 是否为通配符域名
   */
  isWildcardDomain(): boolean {
    return this._value.startsWith('*.');
  }

  /**
   * @method matchesWildcard
   * @description 检查是否匹配通配符域名
   * @param wildcardDomain 通配符域名
   * @returns {boolean} 是否匹配
   */
  matchesWildcard(wildcardDomain: TenantDomain): boolean {
    if (!wildcardDomain.isWildcardDomain()) {
      return false;
    }

    const wildcardParts = wildcardDomain._value.split('.');
    const domainParts = this._value.split('.');

    if (wildcardParts.length !== domainParts.length) {
      return false;
    }

    for (let i = 0; i < wildcardParts.length; i++) {
      if (wildcardParts[i] === '*') {
        continue;
      }
      if (wildcardParts[i] !== domainParts[i]) {
        return false;
      }
    }

    return true;
  }

  /**
   * @private
   * @method detectSubdomain
   * @description 检测是否为子域名
   * @param value 域名值
   * @returns {boolean} 是否为子域名
   */
  private detectSubdomain(value: string): boolean {
    const parts = value.split('.');
    return parts.length > 2;
  }

  /**
   * @private
   * @method extractParentDomain
   * @description 提取父域名
   * @param value 域名值
   * @returns {string | undefined} 父域名
   */
  private extractParentDomain(value: string): string | undefined {
    if (!this.detectSubdomain(value)) {
      return undefined;
    }

    const parts = value.split('.');
    // 移除第一个部分（子域名），保留剩余部分作为父域名
    return parts.slice(1).join('.');
  }

  /**
   * @private
   * @method validateTenantDomain
   * @description 验证租户域名格式
   * @param value 租户域名值
   * @throws {InvalidTenantDomainError} 当域名无效时抛出异常
   */
  private validateTenantDomain(value: string): void {
    if (!value || typeof value !== 'string') {
      throw new InvalidTenantDomainError(
        'Tenant domain must be a non-empty string',
        value,
      );
    }

    const trimmedValue = value.trim();
    if (trimmedValue.length === 0) {
      throw new InvalidTenantDomainError(
        'Tenant domain cannot be empty or only whitespace',
        value,
      );
    }

    // 租户域名长度限制：3-253个字符（符合RFC标准）
    if (trimmedValue.length < 3) {
      throw new InvalidTenantDomainError(
        'Tenant domain must be at least 3 characters long',
        value,
      );
    }

    if (trimmedValue.length > 253) {
      throw new InvalidTenantDomainError(
        'Tenant domain cannot exceed 253 characters',
        value,
      );
    }

    // 域名格式验证：符合RFC 1123标准
    const validDomainPattern =
      /^[a-zA-Z0-9]([a-zA-Z0-9\-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]*[a-zA-Z0-9])?)*$/;
    if (!validDomainPattern.test(trimmedValue)) {
      throw new InvalidTenantDomainError(
        'Invalid domain format. Domain must follow RFC 1123 standard',
        value,
      );
    }

    // 检查域名部分长度（每个部分不超过63个字符）
    const parts = trimmedValue.split('.');
    for (const part of parts) {
      if (part.length > 63) {
        throw new InvalidTenantDomainError(
          `Domain part '${part}' exceeds 63 characters`,
          value,
        );
      }
    }

    // 顶级域名至少2个字符
    const topLevelDomain = parts[parts.length - 1];
    if (topLevelDomain.length < 2) {
      throw new InvalidTenantDomainError(
        'Top-level domain must be at least 2 characters long',
        value,
      );
    }

    // 不允许连续的连字符
    if (/--/.test(trimmedValue)) {
      throw new InvalidTenantDomainError(
        'Domain cannot contain consecutive hyphens',
        value,
      );
    }

    // 不允许以连字符开头或结尾
    if (trimmedValue.startsWith('-') || trimmedValue.endsWith('-')) {
      throw new InvalidTenantDomainError(
        'Domain cannot start or end with a hyphen',
        value,
      );
    }
  }

  /**
   * @protected
   * @method validateInvariants
   * @description 验证值对象不变性条件
   * @throws {InvalidTenantDomainError} 当违反业务规则时抛出
   */
  protected validateInvariants(): void {
    // 确保域名不为空
    if (!this._value || this._value.length === 0) {
      throw new InvalidTenantDomainError(
        'Tenant domain cannot be empty after validation',
        this._value,
      );
    }

    // 确保域名长度在有效范围内
    if (this._value.length < 3 || this._value.length > 253) {
      throw new InvalidTenantDomainError(
        'Tenant domain length must be between 3 and 253 characters',
        this._value,
      );
    }

    // 确保域名格式正确
    const validDomainPattern =
      /^[a-z0-9]([a-z0-9\-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9\-]*[a-z0-9])?)*$/;
    if (!validDomainPattern.test(this._value)) {
      throw new InvalidTenantDomainError(
        'Tenant domain format is invalid after validation',
        this._value,
      );
    }
  }
}
