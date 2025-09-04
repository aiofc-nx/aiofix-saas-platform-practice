/**
 * @description 租户仓储接口
 * @author 江郎
 * @since 1.0.0
 */

import { TenantAggregate } from '../aggregates/tenant.aggregate';
import { TenantId, TenantCode, TenantDomain } from '@aiofix/shared';
import { TenantType, TenantStatus } from '../enums';

/**
 * 租户查询条件接口
 */
export interface TenantQueryCriteria {
  /** 租户ID */
  id?: TenantId;
  /** 租户代码 */
  code?: TenantCode;
  /** 租户域名 */
  domain?: TenantDomain;
  /** 租户名称 */
  name?: string;
  /** 租户类型 */
  type?: TenantType;
  /** 租户状态 */
  status?: TenantStatus;
  /** 创建时间范围 */
  createdAtRange?: {
    start: Date;
    end: Date;
  };
  /** 更新时间范围 */
  updatedAtRange?: {
    start: Date;
    end: Date;
  };
  /** 分页参数 */
  pagination?: {
    page: number;
    limit: number;
  };
  /** 排序参数 */
  sort?: {
    field: string;
    direction: 'ASC' | 'DESC';
  };
}

/**
 * 租户查询结果接口
 */
export interface TenantQueryResult {
  /** 租户列表 */
  tenants: TenantAggregate[];
  /** 总数 */
  total: number;
  /** 当前页 */
  page: number;
  /** 每页数量 */
  limit: number;
  /** 总页数 */
  totalPages: number;
}

/**
 * 租户仓储接口
 * 定义租户聚合根的持久化操作
 */
export interface ITenantRepository {
  /**
   * 保存租户聚合根
   * @param tenant 租户聚合根
   * @returns Promise<void>
   */
  save(tenant: TenantAggregate): Promise<void>;

  /**
   * 根据ID查找租户
   * @param id 租户ID
   * @returns Promise<TenantAggregate | null>
   */
  findById(id: TenantId): Promise<TenantAggregate | null>;

  /**
   * 根据代码查找租户
   * @param code 租户代码
   * @returns Promise<TenantAggregate | null>
   */
  findByCode(code: TenantCode): Promise<TenantAggregate | null>;

  /**
   * 根据域名查找租户
   * @param domain 租户域名
   * @returns Promise<TenantAggregate | null>
   */
  findByDomain(domain: TenantDomain): Promise<TenantAggregate | null>;

  /**
   * 根据名称查找租户
   * @param name 租户名称
   * @returns Promise<TenantAggregate | null>
   */
  findByName(name: string): Promise<TenantAggregate | null>;

  /**
   * 检查租户代码是否存在
   * @param code 租户代码
   * @param excludeId 排除的租户ID（用于更新时检查）
   * @returns Promise<boolean>
   */
  existsByCode(code: TenantCode, excludeId?: TenantId): Promise<boolean>;

  /**
   * 检查租户域名是否存在
   * @param domain 租户域名
   * @param excludeId 排除的租户ID（用于更新时检查）
   * @returns Promise<boolean>
   */
  existsByDomain(domain: TenantDomain, excludeId?: TenantId): Promise<boolean>;

  /**
   * 检查租户名称是否存在
   * @param name 租户名称
   * @param excludeId 排除的租户ID（用于更新时检查）
   * @returns Promise<boolean>
   */
  existsByName(name: string, excludeId?: TenantId): Promise<boolean>;

  /**
   * 根据查询条件查找租户列表
   * @param criteria 查询条件
   * @returns Promise<TenantQueryResult>
   */
  findByCriteria(criteria: TenantQueryCriteria): Promise<TenantQueryResult>;

  /**
   * 删除租户
   * @param id 租户ID
   * @returns Promise<void>
   */
  delete(id: TenantId): Promise<void>;

  /**
   * 批量保存租户
   * @param tenants 租户列表
   * @returns Promise<void>
   */
  saveBatch(tenants: TenantAggregate[]): Promise<void>;

  /**
   * 获取租户总数
   * @returns Promise<number>
   */
  count(): Promise<number>;

  /**
   * 根据状态获取租户数量
   * @param status 租户状态
   * @returns Promise<number>
   */
  countByStatus(status: TenantStatus): Promise<number>;

  /**
   * 根据类型获取租户数量
   * @param type 租户类型
   * @returns Promise<number>
   */
  countByType(type: TenantType): Promise<number>;

  /**
   * 获取所有租户（分页）
   * @param page 页码
   * @param limit 每页数量
   * @returns Promise<TenantQueryResult>
   */
  findAll(page?: number, limit?: number): Promise<TenantQueryResult>;

  /**
   * 根据状态获取租户列表
   * @param status 租户状态
   * @param page 页码
   * @param limit 每页数量
   * @returns Promise<TenantQueryResult>
   */
  findByStatus(
    status: TenantStatus,
    page?: number,
    limit?: number,
  ): Promise<TenantQueryResult>;

  /**
   * 根据类型获取租户列表
   * @param type 租户类型
   * @param page 页码
   * @param limit 每页数量
   * @returns Promise<TenantQueryResult>
   */
  findByType(
    type: TenantType,
    page?: number,
    limit?: number,
  ): Promise<TenantQueryResult>;

  /**
   * 搜索租户
   * @param keyword 搜索关键词
   * @param page 页码
   * @param limit 每页数量
   * @returns Promise<TenantQueryResult>
   */
  search(
    keyword: string,
    page?: number,
    limit?: number,
  ): Promise<TenantQueryResult>;

  /**
   * 获取租户统计信息
   * @returns Promise<{
   *   total: number;
   *   active: number;
   *   inactive: number;
   *   suspended: number;
   *   deleted: number;
   *   byType: Record<TenantType, number>;
   * }>
   */
  getStatistics(): Promise<{
    total: number;
    active: number;
    inactive: number;
    suspended: number;
    deleted: number;
    byType: Record<TenantType, number>;
  }>;
}
