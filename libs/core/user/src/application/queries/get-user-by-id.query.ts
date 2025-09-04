/**
 * @class GetUserByIdQuery
 * @description
 * 根据ID获取用户查询，封装用户查询的请求数据。
 *
 * 原理与机制：
 * 1. 作为CQRS模式中的查询，GetUserByIdQuery封装了用户查询的请求数据
 * 2. 查询是不可变的，一旦创建就不能修改
 * 3. 包含查询用户所需的所有必要信息
 * 4. 支持查询选项和权限控制
 *
 * 功能与职责：
 * 1. 封装用户查询请求数据
 * 2. 提供查询验证方法
 * 3. 支持查询审计和追踪
 * 4. 确保查询的不可变性
 *
 * @example
 * ```typescript
 * const query = new GetUserByIdQuery('user-123', {
 *   includeProfile: true,
 *   includeRelationships: false
 * });
 * ```
 * @since 1.0.0
 */

import { UserId } from '@aiofix/shared';

/**
 * 根据ID获取用户的查询选项接口
 */
export interface GetUserByIdQueryOptions {
  includeProfile?: boolean;
  includeRelationships?: boolean;
  includeSensitiveData?: boolean;
}

/**
 * 根据ID获取用户查询
 * @description 封装根据ID查询用户的请求数据
 */
export class GetUserByIdQuery {
  public readonly queryId: string;
  public readonly timestamp: Date;
  public readonly occurredOn: Date;
  public readonly userId: UserId;
  public readonly options: GetUserByIdQueryOptions;
  public readonly requestUserId?: string; // 请求用户的ID，用于权限控制

  constructor(
    userId: string,
    options: GetUserByIdQueryOptions = {},
    requestUserId?: string,
  ) {
    this.queryId = `qry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.timestamp = new Date();
    this.occurredOn = new Date();
    this.userId = UserId.create(userId);
    this.options = { ...options }; // 创建选项的副本
    this.requestUserId = requestUserId;

    // 验证查询数据
    this.validate();
  }

  /**
   * 验证查询数据
   * @description 验证查询数据的有效性
   * @throws {Error} 当查询数据无效时抛出异常
   */
  private validate(): void {
    if (!this.userId) {
      throw new Error('用户ID是必填字段');
    }

    if (this.userId.toString().trim().length === 0) {
      throw new Error('用户ID不能为空');
    }
  }

  /**
   * 获取查询摘要
   * @description 返回查询的简要描述
   * @returns {string} 查询摘要
   */
  getSummary(): string {
    return `查询用户: ${this.userId.toString()}`;
  }

  /**
   * 获取查询详情
   * @description 返回查询的详细信息
   * @returns {object} 查询详情
   */
  getDetails(): object {
    return {
      queryId: this.queryId,
      timestamp: this.timestamp,
      userId: this.userId.toString(),
      options: this.options,
      requestUserId: this.requestUserId,
    };
  }

  /**
   * 转换为JSON
   * @description 将查询转换为JSON格式
   * @returns {string} JSON字符串
   */
  toJSON(): string {
    return JSON.stringify(this.getDetails());
  }

  /**
   * 克隆查询
   * @description 创建查询的副本
   * @returns {GetUserByIdQuery} 查询副本
   */
  clone(): GetUserByIdQuery {
    return new GetUserByIdQuery(
      this.userId.toString(),
      { ...this.options },
      this.requestUserId,
    );
  }

  /**
   * 检查是否包含敏感数据
   * @description 检查查询选项是否包含敏感数据
   * @returns {boolean} 是否包含敏感数据
   */
  includesSensitiveData(): boolean {
    return this.options.includeSensitiveData === true;
  }

  /**
   * 检查是否包含档案数据
   * @description 检查查询选项是否包含档案数据
   * @returns {boolean} 是否包含档案数据
   */
  includesProfile(): boolean {
    return this.options.includeProfile === true;
  }

  /**
   * 检查是否包含关系数据
   * @description 检查查询选项是否包含关系数据
   * @returns {boolean} 是否包含关系数据
   */
  includesRelationships(): boolean {
    return this.options.includeRelationships === true;
  }
}
