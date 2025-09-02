/**
 * @file user-id.vo.ts
 * @description 用户ID值对象
 *
 * 该值对象封装用户ID的业务规则和验证逻辑。
 * 继承shared模块中的UUID值对象，确保ID的唯一性和有效性。
 * 
 * 跨领域使用场景：
 * - IAM领域：用户实体主键、会话外键
 * - 订单管理：订单创建者、分配者外键
 * - 任务管理：任务负责人、创建者外键
 * - 通知管理：接收者、发送者外键
 * - 审计日志：操作者、被操作者外键
 *
 * 原理与机制：
 * 1. 继承UUID值对象，获得UUID的基础功能
 * 2. 不可变对象，确保数据一致性
 * 3. 封装用户ID特定的业务规则
 * 4. 支持值相等性比较
 * 5. 跨领域类型安全保证
 *
 * 功能与业务规则：
 * 1. 用户ID格式验证
 * 2. 用户ID唯一性保证
 * 3. 用户ID生成规则
 * 4. 跨领域一致性保证
 */

import { Uuid, InvalidUuidError } from './uuid.vo';

/**
 * @class UserId
 * @description 用户ID值对象
 *
 * 继承UUID值对象，提供用户ID特定的业务规则和验证逻辑。
 * 作为跨领域共享的标识符，确保所有领域模块使用统一的用户ID类型。
 */
export class UserId extends Uuid {
  /**
   * @method create
   * @description 创建用户ID值对象
   * @param value 用户ID字符串
   * @returns {UserId} 用户ID值对象
   * @throws {InvalidUuidError} 当用户ID无效时抛出异常
   */
  static create(value: string): UserId {
    return new UserId(value);
  }

  /**
   * @method generate
   * @description 生成新的用户ID
   * @returns {UserId} 新生成的用户ID值对象
   */
  static generate(): UserId {
    return new UserId(Uuid.generate().toString());
  }

  /**
   * @method fromUuid
   * @description 从UUID创建用户ID
   * @param uuid UUID值对象
   * @returns {UserId} 用户ID值对象
   */
  static fromUuid(uuid: Uuid): UserId {
    return new UserId(uuid.toString());
  }

  /**
   * @method equals
   * @description 比较两个用户ID是否相等
   * @param other 另一个用户ID值对象
   * @returns {boolean} 是否相等
   */
  equals(other: unknown): boolean {
    if (!(other instanceof UserId)) {
      return false;
    }
    return this.toString() === other.toString();
  }

  /**
   * @method toString
   * @description 转换为字符串
   * @returns {string} 用户ID字符串
   */
  toString(): string {
    return this.value;
  }

  /**
   * @method toUuid
   * @description 转换为UUID值对象
   * @returns {Uuid} UUID值对象
   */
  toUuid(): Uuid {
    return new Uuid(this.value);
  }

  /**
   * @method clone
   * @description 克隆用户ID值对象
   * @returns {UserId} 克隆的用户ID值对象
   */
  clone(): this {
    return new UserId(this.value) as this;
  }
}

// 重新导出异常类型，保持一致性
export { InvalidUuidError as InvalidUserIdError } from './uuid.vo';
