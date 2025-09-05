/**
 * @file department-id.vo.ts
 * @description 部门ID值对象
 *
 * 该值对象封装部门ID的业务规则和验证逻辑。
 * 部门ID具有全局唯一性，用于部门的唯一标识。
 *
 * 通用性说明：
 * 1. 跨领域使用：所有需要部门标识的模块都需要
 * 2. 标准化规则：部门ID格式、唯一性等规则相对统一
 * 3. 无业务依赖：不依赖特定业务逻辑，纯粹的数据验证
 * 4. 频繁复用：在多个子领域中被大量使用
 */

import { Uuid, InvalidUuidError } from './uuid.vo';

/**
 * @class InvalidDepartmentIdError
 * @description 部门ID格式错误
 */
export class InvalidDepartmentIdError extends InvalidUuidError {
  constructor(message: string, value?: string) {
    super(message, value);
    this.name = 'InvalidDepartmentIdError';
  }
}

/**
 * @class DepartmentId
 * @description 部门ID值对象
 *
 * 表示部门ID，具有以下特性：
 * - 不可变性：创建后不能修改
 * - 值相等性：通过值判断相等
 * - 格式验证：确保ID格式正确
 * - 类型安全：强类型约束
 * - 全局唯一性：在整个系统中唯一
 */
export class DepartmentId extends Uuid {
  /**
   * @constructor
   * @description 创建部门ID值对象
   * @param value 部门ID字符串
   */
  constructor(value: string) {
    super(value);
  }

  /**
   * 创建新的部门ID实例
   * @param value 部门ID值
   * @returns 部门ID实例
   */
  static create(value: string): DepartmentId {
    return new DepartmentId(value);
  }

  /**
   * 生成新的部门ID实例
   * @returns 部门ID实例
   */
  static generate(): DepartmentId {
    return new DepartmentId(Uuid.generate().toString());
  }

  /**
   * 从Uuid创建部门ID实例
   * @param uuid Uuid实例
   * @returns 部门ID实例
   */
  static fromUuid(uuid: Uuid): DepartmentId {
    return new DepartmentId(uuid.toString());
  }
}
