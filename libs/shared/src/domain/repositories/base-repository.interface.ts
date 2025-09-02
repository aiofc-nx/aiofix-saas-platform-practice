/**
 * @file base-repository.interface.ts
 * @description 基础仓储接口
 *
 * 该文件定义了所有仓储的基础接口，提供通用的数据访问方法。
 * 所有具体的仓储都应该继承自这个基础接口。
 *
 * 主要功能：
 * 1. 提供通用的CRUD操作
 * 2. 提供查询和过滤方法
 * 3. 提供分页和排序支持
 * 4. 支持多租户数据隔离
 *
 * 业务规则：
 * 1. 所有操作必须支持多租户隔离
 * 2. 查询操作必须支持分页
 * 3. 更新操作必须记录审计信息
 * 4. 删除操作必须支持软删除
 */

import { Uuid } from '../value-objects/uuid.vo';

/**
 * @interface QueryOptions
 * @description 查询选项接口
 */
export interface QueryOptions {
  page?: number; // 页码
  limit?: number; // 每页数量
  sortBy?: string; // 排序字段
  sortOrder?: 'asc' | 'desc'; // 排序方向
  tenantId?: string; // 租户ID
  includeDeleted?: boolean; // 是否包含已删除记录
}

/**
 * @interface QueryResult<T>
 * @description 查询结果接口
 */
export interface QueryResult<T> {
  data: T[]; // 数据列表
  total: number; // 总数量
  page: number; // 当前页码
  limit: number; // 每页数量
  totalPages: number; // 总页数
  hasNext: boolean; // 是否有下一页
  hasPrev: boolean; // 是否有上一页
}

/**
 * @interface FilterCriteria
 * @description 过滤条件接口
 */
export interface FilterCriteria {
  field: string; // 字段名
  operator:
    | 'eq'
    | 'ne'
    | 'gt'
    | 'gte'
    | 'lt'
    | 'lte'
    | 'in'
    | 'nin'
    | 'like'
    | 'ilike'
    | 'regex'; // 操作符
  value: unknown; // 值
}

/**
 * @interface BaseRepository<T>
 * @description 基础仓储接口
 */
export interface BaseRepository<T> {
  /**
   * @method findById
   * @description 根据ID查找实体
   * @param id 实体ID
   * @param tenantId 租户ID（可选）
   * @returns 实体实例或null
   */
  findById(id: Uuid, tenantId?: string): Promise<T | null>;

  /**
   * @method findByIds
   * @description 根据ID列表查找实体
   * @param ids 实体ID列表
   * @param tenantId 租户ID（可选）
   * @returns 实体实例列表
   */
  findByIds(ids: Uuid[], tenantId?: string): Promise<T[]>;

  /**
   * @method findAll
   * @description 查找所有实体
   * @param options 查询选项
   * @returns 查询结果
   */
  findAll(options?: QueryOptions): Promise<QueryResult<T>>;

  /**
   * @method findByCriteria
   * @description 根据条件查找实体
   * @param criteria 过滤条件列表
   * @param options 查询选项
   * @returns 查询结果
   */
  findByCriteria(
    criteria: FilterCriteria[],
    options?: QueryOptions,
  ): Promise<QueryResult<T>>;

  /**
   * @method findOne
   * @description 查找单个实体
   * @param criteria 过滤条件列表
   * @param tenantId 租户ID（可选）
   * @returns 实体实例或null
   */
  findOne(criteria: FilterCriteria[], tenantId?: string): Promise<T | null>;

  /**
   * @method count
   * @description 统计实体数量
   * @param criteria 过滤条件列表（可选）
   * @param tenantId 租户ID（可选）
   * @returns 实体数量
   */
  count(criteria?: FilterCriteria[], tenantId?: string): Promise<number>;

  /**
   * @method exists
   * @description 检查实体是否存在
   * @param id 实体ID
   * @param tenantId 租户ID（可选）
   * @returns 是否存在
   */
  exists(id: Uuid, tenantId?: string): Promise<boolean>;

  /**
   * @method save
   * @description 保存实体
   * @param entity 实体实例
   * @returns 保存后的实体实例
   */
  save(entity: T): Promise<T>;

  /**
   * @method saveMany
   * @description 批量保存实体
   * @param entities 实体实例列表
   * @returns 保存后的实体实例列表
   */
  saveMany(entities: T[]): Promise<T[]>;

  /**
   * @method update
   * @description 更新实体
   * @param id 实体ID
   * @param updates 更新数据
   * @param tenantId 租户ID（可选）
   * @returns 更新后的实体实例
   */
  update(id: Uuid, updates: Partial<T>, tenantId?: string): Promise<T | null>;

  /**
   * @method delete
   * @description 删除实体
   * @param id 实体ID
   * @param tenantId 租户ID（可选）
   * @param hardDelete 是否硬删除（默认软删除）
   * @returns 是否删除成功
   */
  delete(id: Uuid, tenantId?: string, hardDelete?: boolean): Promise<boolean>;

  /**
   * @method deleteMany
   * @description 批量删除实体
   * @param ids 实体ID列表
   * @param tenantId 租户ID（可选）
   * @param hardDelete 是否硬删除（默认软删除）
   * @returns 删除成功的数量
   */
  deleteMany(
    ids: Uuid[],
    tenantId?: string,
    hardDelete?: boolean,
  ): Promise<number>;

  /**
   * @method restore
   * @description 恢复已删除的实体
   * @param id 实体ID
   * @param tenantId 租户ID（可选）
   * @returns 是否恢复成功
   */
  restore(id: Uuid, tenantId?: string): Promise<boolean>;

  /**
   * @method restoreMany
   * @description 批量恢复已删除的实体
   * @param ids 实体ID列表
   * @param tenantId 租户ID（可选）
   * @returns 恢复成功的数量
   */
  restoreMany(ids: Uuid[], tenantId?: string): Promise<number>;

  /**
   * @method beginTransaction
   * @description 开始事务
   * @returns 事务对象
   */
  beginTransaction(): Promise<unknown>;

  /**
   * @method commitTransaction
   * @description 提交事务
   * @param transaction 事务对象
   * @returns 是否提交成功
   */
  commitTransaction(transaction: unknown): Promise<boolean>;

  /**
   * @method rollbackTransaction
   * @description 回滚事务
   * @param transaction 事务对象
   * @returns 是否回滚成功
   */
  rollbackTransaction(transaction: unknown): Promise<boolean>;
}
