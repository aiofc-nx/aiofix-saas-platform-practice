/**
 * @file organization-id.vo.ts
 * @description 组织ID值对象
 *
 * 该值对象封装组织ID的业务规则和验证逻辑。
 * 组织ID具有全局唯一性，支持跨模块使用。
 *
 * 通用性说明：
 * 1. 跨领域使用：所有需要组织标识的模块都需要
 * 2. 标准化规则：组织ID格式、唯一性等规则相对统一
 * 3. 无业务依赖：不依赖特定业务逻辑，纯粹的数据验证
 * 4. 频繁复用：在多个子领域中被大量使用
 */

import { Uuid, InvalidUuidError } from './uuid.vo';

/**
 * @class InvalidOrganizationIdError
 * @description 组织ID格式错误
 */
export class InvalidOrganizationIdError extends InvalidUuidError {
  constructor(message: string, value?: string) {
    super(message, value);
    this.name = 'InvalidOrganizationIdError';
  }
}

/**
 * @class OrganizationId
 * @description 组织ID值对象
 *
 * 表示组织ID，具有以下特性：
 * - 不可变性：创建后不能修改
 * - 值相等性：通过值判断相等
 * - 格式验证：确保ID格式正确
 * - 类型安全：强类型约束
 * - 全局唯一性：在整个系统中唯一
 */
export class OrganizationId extends Uuid {
  /**
   * @constructor
   * @description 创建组织ID值对象
   * @param value 组织ID字符串
   */
  constructor(value: string) {
    super(value);
  }

  /**
   * 创建新的组织ID实例
   * @param value 组织ID值
   * @returns 组织ID实例
   */
  static create(value: string): OrganizationId {
    return new OrganizationId(value);
  }

  /**
   * 生成新的组织ID
   * @returns 新生成的组织ID
   */
  static generate(): OrganizationId {
    return new OrganizationId(Uuid.generate().toString());
  }

  /**
   * 从Uuid创建OrganizationId
   * @param uuid Uuid对象
   * @returns 组织ID值对象
   */
  static fromUuid(uuid: Uuid): OrganizationId {
    return new OrganizationId(uuid.toString());
  }
}
