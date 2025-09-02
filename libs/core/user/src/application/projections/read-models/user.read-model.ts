/**
 * @class UserReadModel
 * @description
 * 用户读模型，定义用户查询的数据结构和操作接口。
 *
 * 原理与机制：
 * 1. 作为事件溯源架构中的读模型，UserReadModel存储用户的最新状态
 * 2. 通过投影组件保持与事件流的同步，确保数据一致性
 * 3. 优化查询性能，支持复杂的用户查询需求
 * 4. 存储在MongoDB中，提供灵活的文档查询能力
 *
 * 功能与职责：
 * 1. 定义用户查询数据结构
 * 2. 提供用户数据查询接口
 * 3. 支持分页、过滤和排序
 * 4. 维护读模型的数据一致性
 *
 * @example
 * ```typescript
 * const userReadModel = new UserReadModel(mongoCollection);
 * const users = await userReadModel.findByTenant('tenant-123', { limit: 20 });
 * ```
 * @since 1.0.0
 */

import { Injectable } from '@nestjs/common';
import { UserType } from '../../../domain/enums/user-type.enum';
import { DataPrivacyLevel } from '@aiofix/shared';

/**
 * 用户读模型数据结构
 */
export interface UserReadModelData {
  id: string;
  username: string;
  email: string;
  phone?: string;
  userType: UserType;
  status: string;
  tenantId: string;
  organizationId?: string;
  departmentIds: string[];
  dataPrivacyLevel: DataPrivacyLevel;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  deletedBy?: string;
  deleteReason?: string;
  version: number;
}

/**
 * 用户读模型查询选项
 */
export interface UserReadModelQueryOptions {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  includeDeleted?: boolean;
  includeInactive?: boolean;
}

/**
 * 用户过滤条件
 */
export interface UserFilterConditions {
  status?: string;
  userType?: UserType;
  organizationId?: string;
  departmentId?: string;
  dataPrivacyLevel?: DataPrivacyLevel;
  createdAfter?: Date;
  createdBefore?: Date;
}

/**
 * 用户读模型
 * @description 定义用户查询的数据结构和操作接口
 */
@Injectable()
export class UserReadModel {
  private collection: any; // MongoDB集合引用

  constructor(collection: any) {
    this.collection = collection;
  }

  /**
   * 创建用户读模型
   * @description 创建新的用户读模型记录
   * @param {UserReadModelData} data 用户数据
   * @returns {Promise<UserReadModelData>} 创建的用户数据
   */
  async create(data: UserReadModelData): Promise<UserReadModelData> {
    try {
      const result = await this.collection.insertOne(data);
      return { ...data, id: result.insertedId.toString() };
    } catch (error) {
      console.error('创建用户读模型失败:', error);
      throw new Error(`创建用户读模型失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 根据ID查找用户
   * @description 根据用户ID查找用户读模型
   * @param {string} id 用户ID
   * @returns {Promise<UserReadModelData | null>} 用户数据或null
   */
  async findById(id: string): Promise<UserReadModelData | null> {
    try {
      const user = await this.collection.findOne({ id });
      return user;
    } catch (error) {
      console.error('根据ID查找用户读模型失败:', error);
      throw new Error(`查找用户读模型失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 根据邮箱查找用户
   * @description 根据用户邮箱查找用户读模型
   * @param {string} email 用户邮箱
   * @param {string} tenantId 租户ID
   * @returns {Promise<UserReadModelData | null>} 用户数据或null
   */
  async findByEmail(email: string, tenantId: string): Promise<UserReadModelData | null> {
    try {
      const user = await this.collection.findOne({ 
        email, 
        tenantId,
        status: { $ne: 'DELETED' }
      });
      return user;
    } catch (error) {
      console.error('根据邮箱查找用户读模型失败:', error);
      throw new Error(`查找用户读模型失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 根据用户名查找用户
   * @description 根据用户名查找用户读模型
   * @param {string} username 用户名
   * @param {string} tenantId 租户ID
   * @returns {Promise<UserReadModelData | null>} 用户数据或null
   */
  async findByUsername(username: string, tenantId: string): Promise<UserReadModelData | null> {
    try {
      const user = await this.collection.findOne({ 
        username, 
        tenantId,
        status: { $ne: 'DELETED' }
      });
      return user;
    } catch (error) {
      console.error('根据用户名查找用户读模型失败:', error);
      throw new Error(`查找用户读模型失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 根据租户查找用户列表
   * @description 根据租户ID查找用户列表，支持分页和过滤
   * @param {string} tenantId 租户ID
   * @param {UserQueryOptions} options 查询选项
   * @param {UserFilterConditions} filters 过滤条件
   * @returns {Promise<UserReadModelData[]>} 用户列表
   */
  async findByTenant(
    tenantId: string, 
    options: UserReadModelQueryOptions = {}, 
    filters: UserFilterConditions = {}
  ): Promise<UserReadModelData[]> {
    try {
      // 构建查询条件
      const query: any = { tenantId };
      
      // 状态过滤
      if (!options.includeDeleted) {
        query.status = { $ne: 'DELETED' };
      }
      if (!options.includeInactive) {
        query.status = { $nin: ['DELETED', 'INACTIVE'] };
      }

      // 应用其他过滤条件
      if (filters.status) {
        query.status = filters.status;
      }
      if (filters.userType) {
        query.userType = filters.userType;
      }
      if (filters.organizationId) {
        query.organizationId = filters.organizationId;
      }
      if (filters.departmentId) {
        query.departmentIds = filters.departmentId;
      }
      if (filters.dataPrivacyLevel) {
        query.dataPrivacyLevel = filters.dataPrivacyLevel;
      }
      if (filters.createdAfter || filters.createdBefore) {
        query.createdAt = {};
        if (filters.createdAfter) {
          query.createdAt.$gte = filters.createdAfter;
        }
        if (filters.createdBefore) {
          query.createdAt.$lte = filters.createdBefore;
        }
      }

      // 构建查询选项
      const findOptions: any = {};
      
      // 排序
      if (options.sortBy) {
        findOptions.sort = { [options.sortBy]: options.sortOrder === 'desc' ? -1 : 1 };
      } else {
        findOptions.sort = { createdAt: -1 }; // 默认按创建时间倒序
      }

      // 分页
      if (options.offset) {
        findOptions.skip = options.offset;
      }
      if (options.limit) {
        findOptions.limit = options.limit;
      }

      const users = await this.collection.find(query, findOptions).toArray();
      return users;
    } catch (error) {
      console.error('根据租户查找用户读模型失败:', error);
      throw new Error(`查找用户读模型失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 根据组织查找用户列表
   * @description 根据组织ID查找用户列表
   * @param {string} organizationId 组织ID
   * @param {UserQueryOptions} options 查询选项
   * @returns {Promise<UserReadModelData[]>} 用户列表
   */
  async findByOrganization(
    organizationId: string, 
    options: UserReadModelQueryOptions = {}
  ): Promise<UserReadModelData[]> {
    try {
      const query = { 
        organizationId,
        status: { $ne: 'DELETED' }
      };

      const findOptions: any = {};
      if (options.sortBy) {
        findOptions.sort = { [options.sortBy]: options.sortOrder === 'desc' ? -1 : 1 };
      }
      if (options.offset) {
        findOptions.skip = options.offset;
      }
      if (options.limit) {
        findOptions.limit = options.limit;
      }

      const users = await this.collection.find(query, findOptions).toArray();
      return users;
    } catch (error) {
      console.error('根据组织查找用户读模型失败:', error);
      throw new Error(`查找用户读模型失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 根据部门查找用户列表
   * @description 根据部门ID查找用户列表
   * @param {string} departmentId 部门ID
   * @param {UserQueryOptions} options 查询选项
   * @returns {Promise<UserReadModelData[]>} 用户列表
   */
  async findByDepartment(
    departmentId: string, 
    options: UserReadModelQueryOptions = {}
  ): Promise<UserReadModelData[]> {
    try {
      const query = { 
        departmentIds: departmentId,
        status: { $ne: 'DELETED' }
      };

      const findOptions: any = {};
      if (options.sortBy) {
        findOptions.sort = { [options.sortBy]: options.sortOrder === 'desc' ? -1 : 1 };
      }
      if (options.offset) {
        findOptions.skip = options.offset;
      }
      if (options.limit) {
        findOptions.limit = options.limit;
      }

      const users = await this.collection.find(query, findOptions).toArray();
      return users;
    } catch (error) {
      console.error('根据部门查找用户读模型失败:', error);
      throw new Error(`查找用户读模型失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 更新用户读模型
   * @description 根据ID更新用户读模型
   * @param {string} id 用户ID
   * @param {Partial<UserReadModelData>} updates 更新数据
   * @returns {Promise<boolean>} 更新是否成功
   */
  async updateById(id: string, updates: Partial<UserReadModelData>): Promise<boolean> {
    try {
      updates.updatedAt = new Date();
      updates.version = (updates.version || 0) + 1;

      const result = await this.collection.updateOne(
        { id },
        { $set: updates }
      );

      return result.modifiedCount > 0;
    } catch (error) {
      console.error('更新用户读模型失败:', error);
      throw new Error(`更新用户读模型失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 删除用户读模型
   * @description 根据ID删除用户读模型
   * @param {string} id 用户ID
   * @returns {Promise<boolean>} 删除是否成功
   */
  async deleteById(id: string): Promise<boolean> {
    try {
      const result = await this.collection.deleteOne({ id });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('删除用户读模型失败:', error);
      throw new Error(`删除用户读模型失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 统计用户数量
   * @description 统计符合条件的用户数量
   * @param {object} query 查询条件
   * @returns {Promise<number>} 用户数量
   */
  async count(query: object = {}): Promise<number> {
    try {
      return await this.collection.countDocuments(query);
    } catch (error) {
      console.error('统计用户数量失败:', error);
      throw new Error(`统计用户数量失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 检查用户是否存在
   * @description 检查指定条件的用户是否存在
   * @param {object} query 查询条件
   * @returns {Promise<boolean>} 用户是否存在
   */
  async exists(query: object): Promise<boolean> {
    try {
      const count = await this.collection.countDocuments(query);
      return count > 0;
    } catch (error) {
      console.error('检查用户是否存在失败:', error);
      throw new Error(`检查用户是否存在失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }
}
