/**
 * @fileoverview
 * 组织基础设施映射器导出
 *
 * 导出所有数据库相关的映射器类
 */

// PostgreSQL映射器导出
export { OrganizationMapper as PostgresOrganizationMapper } from './postgresql';

// MongoDB映射器导出
export { OrganizationMapper as MongoOrganizationMapper } from './mongodb';
