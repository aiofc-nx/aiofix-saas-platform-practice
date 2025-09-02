/**
 * @file password.vo.ts
 * @description 密码值对象
 *
 * 该值对象负责封装密码的业务逻辑，包括：
 * - 密码格式验证和强度评估
 * - 密码安全性检查
 * - 密码生成和哈希处理
 *
 * 遵循DDD原则，确保值对象的不可变性和值相等性。
 * 该值对象为共享领域组件，可在所有需要密码验证的模块中使用。
 */

import { BaseValueObject, InvalidValueObjectError } from './base.value-object';

/**
 * @class InvalidPasswordError
 * @description 密码格式错误
 */
export class InvalidPasswordError extends InvalidValueObjectError {
  constructor(message: string, value?: string) {
    super(message, 'Password', value);
    this.name = 'InvalidPasswordError';
  }
}

/**
 * @enum PasswordStrength
 * @description 密码强度等级
 */
export enum PasswordStrength {
  WEAK = 'weak', // 弱密码
  MEDIUM = 'medium', // 中等密码
  STRONG = 'strong', // 强密码
}

/**
 * @class Password
 * @description 密码值对象
 *
 * 主要原理与机制：
 * 1. 不可变性：创建后不能修改
 * 2. 值相等性：通过值判断相等
 * 3. 业务规则封装：密码格式验证和强度评估
 * 4. 类型安全：强类型约束
 * 5. 继承BaseValueObject：获得值对象基础功能
 *
 * 功能与业务规则：
 * 1. 密码格式验证（长度、字符类型、复杂度等）
 * 2. 密码强度评估
 * 3. 密码安全性检查
 * 4. 密码生成和哈希处理
 */
export class Password extends BaseValueObject {
  private readonly _value: string;
  private readonly _hashedValue: string;

  constructor(value: string) {
    super();
    this.validate(value);
    this._value = value;
    this._hashedValue = this.hashPassword(value);
    this.validateInvariants();
  }

  /**
   * @method get value
   * @description 获取密码字符串值（仅用于验证，不建议直接使用）
   * @returns {string} 密码
   */
  get value(): string {
    return this._value;
  }

  /**
   * @method get hashedValue
   * @description 获取密码哈希值
   * @returns {string} 密码哈希值
   */
  get hashedValue(): string {
    return this._hashedValue;
  }

  /**
   * @method toString
   * @description 转换为字符串（返回哈希值）
   * @returns {string} 密码哈希值
   */
  toString(): string {
    return this._hashedValue;
  }

  /**
   * @method equals
   * @description 比较两个密码是否相等
   * @param other 另一个密码值对象
   * @returns {boolean} 是否相等
   */
  equals(other: unknown): boolean {
    return (
      other instanceof Password && this._hashedValue === other._hashedValue
    );
  }

  /**
   * @method toJSON
   * @description 转换为JSON字符串（只返回哈希值，不包含明文密码）
   * @returns {string} JSON字符串
   */
  toJSON(): string {
    return JSON.stringify({
      hashedValue: this._hashedValue,
      strength: this.getStrengthLevel(),
      isStrong: this.isStrong(),
    });
  }

  /**
   * @method toObject
   * @description 转换为普通对象（只返回哈希值，不包含明文密码）
   * @returns {Record<string, unknown>} 普通对象
   */
  toObject(): Record<string, unknown> {
    return {
      hashedValue: this._hashedValue,
      strength: this.getStrengthLevel(),
      isStrong: this.isStrong(),
      strengthScore: this.getStrength(),
    };
  }

  /**
   * @method fromJSON
   * @description 从JSON字符串创建密码（注意：无法从哈希值恢复明文密码）
   * @param json JSON字符串
   * @returns {this} 密码值对象
   */
  fromJSON(json: string): this {
    try {
      JSON.parse(json);
      // 注意：这里无法从哈希值恢复明文密码，所以抛出一个错误
      throw new InvalidPasswordError(
        'Cannot create Password from JSON (password is hashed)',
        json
      );
    } catch (error) {
      if (error instanceof InvalidPasswordError) {
        throw error;
      }
      throw new InvalidPasswordError('Invalid JSON format for Password', json);
    }
  }

  /**
   * @method clone
   * @description 克隆密码值对象
   * @returns {this} 克隆的密码值对象
   */
  clone(): this {
    return new Password(this._value) as this;
  }

  /**
   * @method verify
   * @description 验证密码是否匹配
   * @param plainPassword 明文密码
   * @returns {boolean} 是否匹配
   */
  verify(plainPassword: string): boolean {
    return this._hashedValue === this.hashPassword(plainPassword);
  }

  /**
   * @method getStrength
   * @description 获取密码强度
   * @returns {number} 密码强度分数（0-100）
   */
  getStrength(): number {
    let score = 0;
    const password = this._value;

    // 长度分数
    if (password.length >= 8) score += 10;
    if (password.length >= 12) score += 10;
    if (password.length >= 16) score += 10;

    // 字符类型分数
    if (/[a-z]/.test(password)) score += 10;
    if (/[A-Z]/.test(password)) score += 10;
    if (/[0-9]/.test(password)) score += 10;
    if (/[^a-zA-Z0-9]/.test(password)) score += 10;

    // 复杂度分数
    const uniqueChars = new Set(password).size;
    score += Math.min(uniqueChars * 2, 20);

    // 模式检测扣分
    if (this.hasCommonPatterns(password)) score -= 20;
    if (this.hasKeyboardSequences(password)) score -= 15;
    if (this.hasRepeatingChars(password)) score -= 10;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * @method getStrengthLevel
   * @description 获取密码强度等级
   * @returns {PasswordStrength} 密码强度等级
   */
  getStrengthLevel(): PasswordStrength {
    const score = this.getStrength();
    if (score < 40) return PasswordStrength.WEAK;
    if (score < 70) return PasswordStrength.MEDIUM;
    return PasswordStrength.STRONG;
  }

  /**
   * @method isStrong
   * @description 判断密码是否为强密码
   * @returns {boolean} 是否为强密码
   */
  isStrong(): boolean {
    return this.getStrengthLevel() === PasswordStrength.STRONG;
  }

  /**
   * @method isWeak
   * @description 判断密码是否为弱密码
   * @returns {boolean} 是否为弱密码
   */
  isWeak(): boolean {
    return this.getStrengthLevel() === PasswordStrength.WEAK;
  }

  /**
   * @method isMedium
   * @description 判断密码是否为中等强度
   * @returns {boolean} 是否为中等强度
   */
  isMedium(): boolean {
    return this.getStrengthLevel() === PasswordStrength.MEDIUM;
  }

  /**
   * @method getStrengthDescription
   * @description 获取密码强度描述
   * @returns {string} 强度描述
   */
  getStrengthDescription(): string {
    const level = this.getStrengthLevel();
    switch (level) {
      case PasswordStrength.WEAK:
        return '弱密码，建议使用更复杂的密码';
      case PasswordStrength.MEDIUM:
        return '中等强度密码，可以进一步提高安全性';
      case PasswordStrength.STRONG:
        return '强密码，安全性良好';
      default:
        return '未知强度';
    }
  }

  /**
   * @private
   * @method validate
   * @description 验证密码格式
   * @param value 密码字符串
   */
  private validate(value: string): void {
    if (!value || typeof value !== 'string') {
      throw new InvalidPasswordError('密码不能为空', value);
    }

    const trimmedValue = value.trim();
    if (trimmedValue.length === 0) {
      throw new InvalidPasswordError('密码不能为空', value);
    }

    // 检查长度
    if (trimmedValue.length < 8) {
      throw new InvalidPasswordError('密码长度不能少于8个字符', value);
    }

    if (trimmedValue.length > 128) {
      throw new InvalidPasswordError('密码长度不能超过128个字符', value);
    }

    // 检查字符类型
    if (!/[a-z]/.test(trimmedValue)) {
      throw new InvalidPasswordError('密码必须包含至少一个小写字母', value);
    }

    if (!/[A-Z]/.test(trimmedValue)) {
      throw new InvalidPasswordError('密码必须包含至少一个大写字母', value);
    }

    if (!/[0-9]/.test(trimmedValue)) {
      throw new InvalidPasswordError('密码必须包含至少一个数字', value);
    }

    // 检查常见密码
    if (this.isCommonPassword(trimmedValue)) {
      throw new InvalidPasswordError('密码不能使用常见密码', value);
    }

    // 检查连续字符
    if (this.hasRepeatingChars(trimmedValue)) {
      throw new InvalidPasswordError('密码不能包含连续重复的字符', value);
    }

    // 检查键盘序列
    if (this.hasKeyboardSequences(trimmedValue)) {
      throw new InvalidPasswordError('密码不能包含键盘序列', value);
    }
  }

  /**
   * @private
   * @method hashPassword
   * @description 哈希密码（简单实现，实际应使用bcrypt等）
   * @param password 明文密码
   * @returns {string} 哈希值
   */
  private hashPassword(password: string): string {
    // 这里使用简单的哈希算法，实际项目中应使用bcrypt等安全算法
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // 转换为32位整数
    }
    return hash.toString(16);
  }

  /**
   * @private
   * @method isCommonPassword
   * @description 检查是否为常见密码
   * @param password 密码
   * @returns {boolean} 是否为常见密码
   */
  private isCommonPassword(password: string): boolean {
    const commonPasswords = [
      'password',
      '123456',
      '123456789',
      'qwerty',
      'abc123',
      'password123',
      'admin',
      'letmein',
      'welcome',
      'monkey',
      'dragon',
      'master',
      'hello',
      'freedom',
      'whatever',
      'qwerty123',
      'trustno1',
      'jordan',
      'harley',
      'ranger',
      'iwantu',
      'jennifer',
      'hunter',
      'buster',
      'soccer',
      'baseball',
      'tiger',
      'charlie',
      'andrew',
      'michelle',
      'love',
      'sunshine',
      'jessica',
      'asshole',
      '696969',
      'pepper',
      'daniel',
      'access',
      '1234567',
      'maggie',
      '654321',
      'pussy',
      'george',
      'horses',
      'thunder',
      'cooper',
      'internet',
      'mercedes',
      'bigtits',
      'marine',
      'chicago',
      'rangers',
      'gandalf',
      'winter',
      'bigtiger',
      'barney',
      'edward',
      'raiders',
      'porn',
      'badass',
      'blowme',
      'spanky',
      'bigdaddy',
      'johnson',
      'chester',
      'london',
      'midnight',
      'blue',
      'fishing',
      '000000',
      'hacker',
      'slayer',
      'matt',
      'qwe',
      'tester',
      'jordan23',
      '123123',
      'donkey',
      'bitch',
      'white',
      'peter',
      'pacific',
      'amanda',
      'cookie',
      'orange',
      'ginger',
      'hammer',
      'silver',
      '222222',
      'yankees',
      'diablo',
      'asdf',
      'tiger1',
      'doctor',
      'gateway',
      'golfer',
      'heaven',
      'mother',
      'winner',
      'hello123',
    ];

    return commonPasswords.includes(password.toLowerCase());
  }

  /**
   * @private
   * @method hasRepeatingChars
   * @description 检查是否包含连续重复字符
   * @param password 密码
   * @returns {boolean} 是否包含连续重复字符
   */
  private hasRepeatingChars(password: string): boolean {
    for (let i = 0; i < password.length - 2; i++) {
      if (password[i] === password[i + 1] && password[i] === password[i + 2]) {
        return true;
      }
    }
    return false;
  }

  /**
   * @private
   * @method hasKeyboardSequences
   * @description 检查是否包含键盘序列
   * @param password 密码
   * @returns {boolean} 是否包含键盘序列
   */
  private hasKeyboardSequences(password: string): boolean {
    const sequences = [
      'qwerty',
      'asdfgh',
      'zxcvbn',
      '123456',
      '654321',
      'abcdef',
      'fedcba',
      'qazwsx',
      'edcrfv',
      'tgbyhn',
      'ujmikl',
      'plokij',
      'mnbvcx',
      'lkjhgf',
      'poiuyt',
      'rewq',
      'asdf',
      'zxcv',
      'qwe',
      'asd',
      'zxc',
    ];

    const lowerPassword = password.toLowerCase();
    return sequences.some((seq) => lowerPassword.includes(seq));
  }

  /**
   * @private
   * @method hasCommonPatterns
   * @description 检查是否包含常见模式
   * @param password 密码
   * @returns {boolean} 是否包含常见模式
   */
  private hasCommonPatterns(password: string): boolean {
    const patterns = [
      /(.)\1{2,}/, // 连续重复字符
      /(.)(.)\1\2/, // 重复模式
      /(.)(.)(.)\1\2\3/, // 三字符重复
    ];

    return patterns.some((pattern) => pattern.test(password));
  }

  /**
   * @protected
   * @method validateInvariants
   * @description 验证值对象不变性条件
   */
  protected override validateInvariants(): void {
    if (!this._value || this._value.length === 0) {
      throw new InvalidPasswordError('Password value cannot be empty');
    }
  }

  /**
   * @static
   * @method create
   * @description 从字符串创建密码值对象
   * @param value 密码字符串
   * @returns {Password} 密码值对象
   */
  static create(value: string): Password {
    return new Password(value);
  }

  /**
   * @static
   * @method fromString
   * @description 兼容测试：从字符串创建密码
   */
  static fromString(value: string): Password {
    return new Password(value);
  }

  /**
   * @static
   * @method generate
   * @description 生成随机密码
   * @param length 密码长度
   * @param includeSpecialChars 是否包含特殊字符
   * @returns {Password} 密码值对象
   */
  static generate(length = 16, includeSpecialChars = true): Password {
    if (length < 8 || length > 128) {
      length = 16;
    }

    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    let chars = lowercase + uppercase + numbers;
    if (includeSpecialChars) {
      chars += special;
    }

    let password = '';

    // 确保包含至少一个大写字母、一个小写字母、一个数字
    password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
    password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
    password += numbers.charAt(Math.floor(Math.random() * numbers.length));

    if (includeSpecialChars) {
      password += special.charAt(Math.floor(Math.random() * special.length));
    }

    // 填充剩余长度
    for (let i = password.length; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // 打乱密码字符顺序
    password = password
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');

    return new Password(password);
  }

  /**
   * @static
   * @method isValid
   * @description 验证字符串是否为有效的密码
   * @param value 待验证的字符串
   * @returns {boolean} 是否为有效的密码
   */
  static isValid(value: string): boolean {
    try {
      new Password(value);
      return true;
    } catch {
      return false;
    }
  }
}
