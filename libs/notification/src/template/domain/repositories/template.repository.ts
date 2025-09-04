/**
 * @file template.repository.ts
 * @description 模板仓储接口
 *
 * 该接口定义模板的数据访问契约，包括：
 * - 基础的CRUD操作
 * - 业务查询方法
 * - 统计分析方法
 * - 批量操作方法
 *
 * 遵循DDD原则，定义领域层的数据访问需求。
 */

import { Template, ReviewStatus } from '../entities/template.entity';
import { Uuid } from '@aiofix/shared';
import { NotificationType, TemplateStatus } from '@aiofix/shared';

/**
 * @interface TemplateRepository
 * @description 模板仓储接口
 *
 * 主要原理与机制：
 * 1. 定义模板数据访问的契约
 * 2. 隔离领域层和基础设施层
 * 3. 支持不同的存储实现
 * 4. 保持领域逻辑的纯粹性
 *
 * 功能与业务规则：
 * 1. 基础CRUD操作
 * 2. 业务查询方法
 * 3. 事务管理支持
 * 4. 并发控制支持
 */
export interface TemplateRepository {
  /**
   * @method save
   * @description 保存模板
   */
  save(template: Template): Promise<void>;

  /**
   * @method findById
   * @description 根据ID查找模板
   */
  findById(id: Uuid): Promise<Template | null>;

  /**
   * @method findByName
   * @description 根据名称查找模板
   */
  findByName(name: string, tenantId: string): Promise<Template | null>;

  /**
   * @method findByTenant
   * @description 查找租户下的模板
   */
  findByTenant(
    tenantId: string,
    limit?: number,
    offset?: number,
  ): Promise<Template[]>;

  /**
   * @method findByType
   * @description 根据类型查找模板
   */
  findByType(
    type: NotificationType,
    tenantId?: string,
    limit?: number,
    offset?: number,
  ): Promise<Template[]>;

  /**
   * @method findByStatus
   * @description 根据状态查找模板
   */
  findByStatus(
    status: TemplateStatus,
    tenantId?: string,
    limit?: number,
    offset?: number,
  ): Promise<Template[]>;

  /**
   * @method findByCategory
   * @description 根据分类查找模板
   */
  findByCategory(
    category: string,
    tenantId?: string,
    limit?: number,
    offset?: number,
  ): Promise<Template[]>;

  /**
   * @method findByLanguage
   * @description 根据语言查找模板
   */
  findByLanguage(
    language: string,
    tenantId?: string,
    limit?: number,
    offset?: number,
  ): Promise<Template[]>;

  /**
   * @method findByTags
   * @description 根据标签查找模板
   */
  findByTags(
    tags: string[],
    tenantId?: string,
    limit?: number,
    offset?: number,
  ): Promise<Template[]>;

  /**
   * @method findByReviewStatus
   * @description 根据审核状态查找模板
   */
  findByReviewStatus(
    reviewStatus: ReviewStatus,
    tenantId?: string,
    limit?: number,
    offset?: number,
  ): Promise<Template[]>;

  /**
   * @method findActiveTemplates
   * @description 查找激活的模板
   */
  findActiveTemplates(
    tenantId?: string,
    limit?: number,
    offset?: number,
  ): Promise<Template[]>;

  /**
   * @method findTemplatesForReview
   * @description 查找待审核的模板
   */
  findTemplatesForReview(
    tenantId?: string,
    limit?: number,
    offset?: number,
  ): Promise<Template[]>;

  /**
   * @method search
   * @description 搜索模板
   */
  search(
    tenantId: string,
    searchCriteria: {
      keyword?: string;
      type?: NotificationType;
      status?: TemplateStatus;
      category?: string;
      language?: string;
      tags?: string[];
      reviewStatus?: ReviewStatus;
    },
    limit?: number,
    offset?: number,
  ): Promise<Template[]>;

  /**
   * @method delete
   * @description 删除模板
   */
  delete(id: Uuid): Promise<void>;

  /**
   * @method exists
   * @description 检查模板是否存在
   */
  exists(id: Uuid): Promise<boolean>;

  /**
   * @method count
   * @description 统计模板数量
   */
  count(tenantId?: string, status?: TemplateStatus): Promise<number>;

  /**
   * @method countByType
   * @description 按类型统计模板数量
   */
  countByType(tenantId?: string): Promise<Record<NotificationType, number>>;

  /**
   * @method countByStatus
   * @description 按状态统计模板数量
   */
  countByStatus(tenantId?: string): Promise<Record<TemplateStatus, number>>;

  /**
   * @method countByCategory
   * @description 按分类统计模板数量
   */
  countByCategory(tenantId?: string): Promise<Record<string, number>>;

  /**
   * @method countByLanguage
   * @description 按语言统计模板数量
   */
  countByLanguage(tenantId?: string): Promise<Record<string, number>>;

  /**
   * @method getStatistics
   * @description 获取模板统计信息
   */
  getStatistics(
    tenantId?: string,
    fromDate?: Date,
    toDate?: Date,
  ): Promise<{
    total: number;
    active: number;
    draft: number;
    inactive: number;
    archived: number;
  }>;

  /**
   * @method getMostUsedTemplates
   * @description 获取最常用的模板
   */
  getMostUsedTemplates(
    tenantId?: string,
    limit?: number,
  ): Promise<
    Array<{
      templateId: string;
      name: string;
      usageCount: number;
    }>
  >;
}
