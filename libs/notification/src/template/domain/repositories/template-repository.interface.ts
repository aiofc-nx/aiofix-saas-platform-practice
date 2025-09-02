/**
 * @file template-repository.interface.ts
 * @description 模板仓储接口
 *
 * 该接口定义了模板仓储的标准操作，包括：
 * - 模板的增删改查操作
 * - 模板版本管理
 * - 模板状态管理
 * - 模板查询和过滤
 *
 * 遵循DDD原则，定义仓储的抽象接口。
 */

import { Template } from '../entities/template.entity';
import { NotificationType, TemplateStatus } from '@aiofix/shared';

/**
 * @interface TemplateRepositoryInterface
 * @description 模板仓储接口
 *
 * 提供模板仓储的标准操作。
 */
export interface TemplateRepositoryInterface {
  /**
   * @method findById
   * @description 根据ID查找模板
   * @param id 模板ID
   * @returns {Promise<Template | null>} 模板实例或null
   */
  findById(id: string): Promise<Template | null>;

  /**
   * @method save
   * @description 保存模板
   * @param template 模板实例
   * @returns {Promise<Template>} 保存后的模板实例
   */
  save(template: Template): Promise<Template>;

  /**
   * @method delete
   * @description 删除模板
   * @param id 模板ID
   * @returns {Promise<void>}
   */
  delete(id: string): Promise<void>;

  /**
   * @method count
   * @description 统计模板数量
   * @param tenantId 租户ID
   * @returns {Promise<number>} 模板数量
   */
  count(tenantId: string): Promise<number>;

  /**
   * @method findByName
   * @description 根据名称查找模板
   * @param name 模板名称
   * @param tenantId 租户ID
   * @returns {Promise<Template | null>} 模板实例或null
   */
  findByName(name: string, tenantId: string): Promise<Template | null>;

  /**
   * @method findByType
   * @description 根据类型查找模板
   * @param type 通知类型
   * @param tenantId 租户ID
   * @returns {Promise<Template[]>} 模板列表
   */
  findByType(type: NotificationType, tenantId: string): Promise<Template[]>;

  /**
   * @method findByStatus
   * @description 根据状态查找模板
   * @param status 模板状态
   * @param tenantId 租户ID
   * @returns {Promise<Template[]>} 模板列表
   */
  findByStatus(status: TemplateStatus, tenantId: string): Promise<Template[]>;

  /**
   * @method findByCategory
   * @description 根据分类查找模板
   * @param category 模板分类
   * @param tenantId 租户ID
   * @returns {Promise<Template[]>} 模板列表
   */
  findByCategory(category: string, tenantId: string): Promise<Template[]>;

  /**
   * @method findByLanguage
   * @description 根据语言查找模板
   * @param language 语言
   * @param tenantId 租户ID
   * @returns {Promise<Template[]>} 模板列表
   */
  findByLanguage(language: string, tenantId: string): Promise<Template[]>;

  /**
   * @method findByTags
   * @description 根据标签查找模板
   * @param tags 标签列表
   * @param tenantId 租户ID
   * @returns {Promise<Template[]>} 模板列表
   */
  findByTags(tags: string[], tenantId: string): Promise<Template[]>;

  /**
   * @method findActiveTemplates
   * @description 查找激活状态的模板
   * @param tenantId 租户ID
   * @returns {Promise<Template[]>} 激活的模板列表
   */
  findActiveTemplates(tenantId: string): Promise<Template[]>;

  /**
   * @method findActiveTemplateByName
   * @description 根据名称查找激活状态的模板
   * @param name 模板名称
   * @param tenantId 租户ID
   * @returns {Promise<Template | null>} 激活的模板实例或null
   */
  findActiveTemplateByName(
    name: string,
    tenantId: string
  ): Promise<Template | null>;

  /**
   * @method findActiveTemplateByTypeAndName
   * @description 根据类型和名称查找激活状态的模板
   * @param type 通知类型
   * @param name 模板名称
   * @param tenantId 租户ID
   * @returns {Promise<Template | null>} 激活的模板实例或null
   */
  findActiveTemplateByTypeAndName(
    type: NotificationType,
    name: string,
    tenantId: string
  ): Promise<Template | null>;

  /**
   * @method findTemplatesByTypeAndStatus
   * @description 根据类型和状态查找模板
   * @param type 通知类型
   * @param status 模板状态
   * @param tenantId 租户ID
   * @returns {Promise<Template[]>} 模板列表
   */
  findTemplatesByTypeAndStatus(
    type: NotificationType,
    status: TemplateStatus,
    tenantId: string
  ): Promise<Template[]>;

  /**
   * @method findTemplatesByTypeAndCategory
   * @description 根据类型和分类查找模板
   * @param type 通知类型
   * @param category 模板分类
   * @param tenantId 租户ID
   * @returns {Promise<Template[]>} 模板列表
   */
  findTemplatesByTypeAndCategory(
    type: NotificationType,
    category: string,
    tenantId: string
  ): Promise<Template[]>;

  /**
   * @method findTemplatesByTypeAndLanguage
   * @description 根据类型和语言查找模板
   * @param type 通知类型
   * @param language 语言
   * @param tenantId 租户ID
   * @returns {Promise<Template[]>} 模板列表
   */
  findTemplatesByTypeAndLanguage(
    type: NotificationType,
    language: string,
    tenantId: string
  ): Promise<Template[]>;

  /**
   * @method searchTemplates
   * @description 搜索模板
   * @param searchTerm 搜索关键词
   * @param tenantId 租户ID
   * @param filters 过滤条件
   * @returns {Promise<Template[]>} 模板列表
   */
  searchTemplates(
    searchTerm: string,
    tenantId: string,
    filters?: {
      type?: NotificationType;
      status?: TemplateStatus;
      category?: string;
      language?: string;
      tags?: string[];
    }
  ): Promise<Template[]>;

  /**
   * @method countByType
   * @description 统计指定类型的模板数量
   * @param type 通知类型
   * @param tenantId 租户ID
   * @returns {Promise<number>} 模板数量
   */
  countByType(type: NotificationType, tenantId: string): Promise<number>;

  /**
   * @method countByStatus
   * @description 统计指定状态的模板数量
   * @param status 模板状态
   * @param tenantId 租户ID
   * @returns {Promise<number>} 模板数量
   */
  countByStatus(status: TemplateStatus, tenantId: string): Promise<number>;

  /**
   * @method countByCategory
   * @description 统计指定分类的模板数量
   * @param category 模板分类
   * @param tenantId 租户ID
   * @returns {Promise<number>} 模板数量
   */
  countByCategory(category: string, tenantId: string): Promise<number>;

  /**
   * @method getCategories
   * @description 获取所有模板分类
   * @param tenantId 租户ID
   * @returns {Promise<string[]>} 分类列表
   */
  getCategories(tenantId: string): Promise<string[]>;

  /**
   * @method getLanguages
   * @description 获取所有模板语言
   * @param tenantId 租户ID
   * @returns {Promise<string[]>} 语言列表
   */
  getLanguages(tenantId: string): Promise<string[]>;

  /**
   * @method getTags
   * @description 获取所有模板标签
   * @param tenantId 租户ID
   * @returns {Promise<string[]>} 标签列表
   */
  getTags(tenantId: string): Promise<string[]>;

  /**
   * @method existsByName
   * @description 检查模板名称是否存在
   * @param name 模板名称
   * @param tenantId 租户ID
   * @param excludeId 排除的模板ID
   * @returns {Promise<boolean>} 是否存在
   */
  existsByName(
    name: string,
    tenantId: string,
    excludeId?: string
  ): Promise<boolean>;

  /**
   * @method existsByTypeAndName
   * @description 检查指定类型和名称的模板是否存在
   * @param type 通知类型
   * @param name 模板名称
   * @param tenantId 租户ID
   * @param excludeId 排除的模板ID
   * @returns {Promise<boolean>} 是否存在
   */
  existsByTypeAndName(
    type: NotificationType,
    name: string,
    tenantId: string,
    excludeId?: string
  ): Promise<boolean>;
}
