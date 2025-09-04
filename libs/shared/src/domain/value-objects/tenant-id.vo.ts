/**
 * @file tenant-id.vo.ts
 * @description 租户ID值对象
 *
 * 该值对象封装租户ID的业务规则和验证逻辑。
 * 继承自Uuid，确保租户ID的全局唯一性。
 *
 * 通用性说明：
 * 1. 跨领域使用：所有需要租户隔离的模块都需要
 * 2. 标准化规则：租户ID格式、唯一性等规则相对统一
 * 3. 无业务依赖：不依赖特定业务逻辑，纯粹的数据验证
 * 4. 频繁复用：在多个子领域中被大量使用
 */

import { Uuid } from './uuid.vo';

/**
 * @class TenantId
 * @description 租户ID值对象
 *
 * 主要原理与机制：
 * 1. 继承Uuid基类，获得UUID基础功能
 * 2. 不可变对象，确保数据一致性
 * 3. 封装租户ID验证规则
 * 4. 支持值相等性比较
 *
 * 功能与业务规则：
 * 1. 租户ID格式验证
 * 2. 租户ID唯一性保证
 * 3. 租户ID类型安全
 */
export class TenantId extends Uuid {
  /**
   * @method create
   * @description 创建租户ID值对象
   * @param value 租户ID字符串
   * @returns {TenantId} 租户ID值对象
   * @throws {InvalidUuidError} 当租户ID无效时抛出异常
   */
  static create(value: string): TenantId {
    return new TenantId(value);
  }

  /**
   * @method generate
   * @description 生成新的租户ID
   * @returns {TenantId} 新生成的租户ID
   */
  static generate(): TenantId {
    return new TenantId(Uuid.generate().toString());
  }

  /**
   * @method fromUuid
   * @description 从Uuid创建TenantId
   * @param uuid Uuid对象
   * @returns {TenantId} 租户ID值对象
   */
  static fromUuid(uuid: Uuid): TenantId {
    return new TenantId(uuid.toString());
  }

  /**
   * @method fromUuidArray
   * @description 从Uuid数组创建TenantId数组
   * @param uuids Uuid对象数组
   * @returns {TenantId[]} 租户ID值对象数组
   */
  static fromUuidArray(uuids: Uuid[]): TenantId[] {
    return uuids.map(uuid => TenantId.fromUuid(uuid));
  }

  /**
   * @method equals
   * @description 比较两个租户ID是否相等
   * @param other 另一个租户ID
   * @returns {boolean} 是否相等
   */
  equals(other: unknown): boolean {
    if (!(other instanceof TenantId)) {
      return false;
    }
    return this.toString() === other.toString();
  }

  /**
   * @method toString
   * @description 获取租户ID字符串表示
   * @returns {string} 租户ID字符串
   */
  toString(): string {
    return this.value;
  }

  /**
   * @method toUuid
   * @description 转换为Uuid对象
   * @returns {Uuid} Uuid对象
   */
  toUuid(): Uuid {
    return new Uuid(this.value);
  }

  /**
   * @method clone
   * @description 克隆租户ID
   * @returns {TenantId} 新的租户ID实例
   */
  clone(): this {
    return new TenantId(this.value) as this;
  }
}

export { InvalidUuidError as InvalidTenantIdError } from './uuid.vo';
