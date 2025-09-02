/**
 * @class GetUsersByTenantQuery
 * @description
 * 根据租户获取用户列表查询，封装用户查询的请求数据。
 *
 * 原理与机制：
 * 1. 作为CQRS模式中的查询，GetUsersByTenantQuery封装了根据租户查询用户的请求数据
 * 2. 查询是不可变的，一旦创建就不能修改
 * 3. 包含分页、过滤和排序选项
 * 4. 支持关联数据的预加载
 *
 * 功能与职责：
 * 1. 封装租户用户查询请求数据
 * 2. 提供查询验证方法
 * 3. 支持查询审计和追踪
 * 4. 确保查询的不可变性
 *
 * @example
 * ```typescript
 * const query = new GetUsersByTenantQuery('tenant-123', {
 *   includeProfile: true,
 *   limit: 20,
 *   offset: 0
 * });
 * ```
 * @since 1.0.0
 */

import { TenantId } from '@aiofix/shared';

/**
 * 租户用户查询选项接口
 */
export interface GetUsersByTenantQueryOptions {
  includeProfile?: boolean;
  includeRelationships?: boolean;
  includeSensitiveData?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filterByStatus?: string;
  filterByUserType?: string;
  filterByOrganization?: string;
  filterByDepartment?: string;
}

/**
 * 根据租户获取用户列表查询
 * @description 封装根据租户查询用户的请求数据
 */
export class GetUsersByTenantQuery {
  public readonly queryId: string;
  public readonly timestamp: Date;
  public readonly occurredOn: Date;
  public readonly tenantId: TenantId;
  public readonly options: GetUsersByTenantQueryOptions;
  public readonly requestUserId?: string; // 请求用户的ID，用于权限控制

  constructor(tenantId: string, options: GetUsersByTenantQueryOptions = {}, requestUserId?: string) {
    this.queryId = `qry-tenant-users-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.timestamp = new Date();
    this.occurredOn = new Date();
    this.tenantId = TenantId.create(tenantId);
    this.options = { ...options }; // 创建选项的副本
    this.requestUserId = requestUserId;

    // 设置默认值
    this.options.limit = this.options.limit || 20;
    this.options.offset = this.options.offset || 0;
    this.options.sortOrder = this.options.sortOrder || 'asc';

    // 验证查询数据
    this.validate();
  }

  /**
   * 验证查询数据
   * @description 验证查询数据的有效性
   * @throws {Error} 当查询数据无效时抛出异常
   */
  private validate(): void {
    if (!this.tenantId) {
      throw new Error('租户ID是必填字段');
    }

    if (this.tenantId.toString().trim().length === 0) {
      throw new Error('租户ID不能为空');
    }

    if (this.options.limit && this.options.limit < 1) {
      throw new Error('限制数量必须大于0');
    }

    if (this.options.limit && this.options.limit > 100) {
      throw new Error('限制数量不能超过100');
    }

    if (this.options.offset && this.options.offset < 0) {
      throw new Error('偏移量不能为负数');
    }

    if (this.options.sortOrder && !['asc', 'desc'].includes(this.options.sortOrder)) {
      throw new Error('排序顺序必须是 asc 或 desc');
    }
  }

  /**
   * 获取查询摘要
   * @description 返回查询的简要描述
   * @returns {string} 查询摘要
   */
  getSummary(): string {
    return `查询租户用户: ${this.tenantId.toString()} (限制: ${this.options.limit}, 偏移: ${this.options.offset})`;
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
      occurredOn: this.occurredOn,
      tenantId: this.tenantId.toString(),
      options: this.options,
      requestUserId: this.requestUserId
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
   * @returns {GetUsersByTenantQuery} 查询副本
   */
  clone(): GetUsersByTenantQuery {
    return new GetUsersByTenantQuery(
      this.tenantId.toString(),
      { ...this.options },
      this.requestUserId
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

  /**
   * 获取分页信息
   * @description 返回分页相关信息
   * @returns {object} 分页信息
   */
  getPaginationInfo(): { limit: number; offset: number } {
    return {
      limit: this.options.limit || 20,
      offset: this.options.offset || 0
    };
  }

  /**
   * 获取排序信息
   * @description 返回排序相关信息
   * @returns {object} 排序信息
   */
  getSortInfo(): { sortBy?: string; sortOrder: 'asc' | 'desc' } {
    return {
      sortBy: this.options.sortBy,
      sortOrder: this.options.sortOrder || 'asc'
    };
  }

  /**
   * 获取过滤条件
   * @description 返回所有过滤条件
   * @returns {object} 过滤条件
   */
  getFilterConditions(): object {
    const filters: any = {};
    
    if (this.options.filterByStatus) filters.status = this.options.filterByStatus;
    if (this.options.filterByUserType) filters.userType = this.options.filterByUserType;
    if (this.options.filterByOrganization) filters.organization = this.options.filterByOrganization;
    if (this.options.filterByDepartment) filters.department = this.options.filterByDepartment;

    return filters;
  }

  /**
   * 检查是否有过滤条件
   * @description 检查是否设置了任何过滤条件
   * @returns {boolean} 是否有过滤条件
   */
  hasFilters(): boolean {
    return !!(this.options.filterByStatus || 
              this.options.filterByUserType || 
              this.options.filterByOrganization || 
              this.options.filterByDepartment);
  }
}
