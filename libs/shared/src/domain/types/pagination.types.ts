/**
 * @fileoverview
 * 分页相关类型定义
 */

/**
 * 分页结果接口
 * @description 用于表示分页查询的结果
 */
export interface PaginatedResult<T> {
  /** 数据列表 */
  data: T[];
  /** 总记录数 */
  total: number;
  /** 当前页码 */
  page: number;
  /** 每页大小 */
  size: number;
  /** 总页数 */
  totalPages: number;
  /** 是否有下一页 */
  hasNext: boolean;
  /** 是否有上一页 */
  hasPrev: boolean;
}

/**
 * 分页查询参数接口
 * @description 用于表示分页查询的参数
 */
export interface PaginationParams {
  /** 页码，从1开始 */
  page: number;
  /** 每页大小 */
  size: number;
}

/**
 * 分页查询结果接口
 * @description 用于表示分页查询的结果，包含成功标志和消息
 */
export interface PaginatedResponse<T> {
  /** 是否成功 */
  success: boolean;
  /** 数据 */
  data: PaginatedResult<T>;
  /** 消息 */
  message?: string;
}
