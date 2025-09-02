/**
 * @class UserProfileReadModel
 * @description
 * 用户档案读模型，定义用户档案查询的数据结构和操作接口。
 *
 * 原理与机制：
 * 1. 作为事件溯源架构中的读模型，UserProfileReadModel存储用户档案的最新状态
 * 2. 通过投影组件保持与事件流的同步，确保数据一致性
 * 3. 优化查询性能，支持用户档案的快速访问
 * 4. 存储在MongoDB中，提供灵活的文档查询能力
 *
 * 功能与职责：
 * 1. 定义用户档案查询数据结构
 * 2. 提供用户档案数据查询接口
 * 3. 支持档案数据的关联查询
 * 4. 维护读模型的数据一致性
 *
 * @example
 * ```typescript
 * const profileReadModel = new UserProfileReadModel(mongoCollection);
 * const profile = await profileReadModel.findByUserId('user-123');
 * ```
 * @since 1.0.0
 */

import { Injectable } from '@nestjs/common';

/**
 * 用户档案读模型数据结构
 */
export interface UserProfileReadModelData {
  id: string;
  userId: string;
  displayName?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  phone?: string;
  dateOfBirth?: Date;
  gender?: string;
  language?: string;
  timezone?: string;
  preferences?: {
    notifications?: {
      email?: boolean;
      sms?: boolean;
      push?: boolean;
    };
    privacy?: {
      profileVisibility?: string;
      contactVisibility?: string;
    };
    theme?: string;
  };
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    facebook?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

/**
 * 用户档案查询选项
 */
export interface UserProfileQueryOptions {
  includeSensitiveData?: boolean;
  includePreferences?: boolean;
  includeSocialLinks?: boolean;
}

/**
 * 用户档案读模型
 * @description 定义用户档案查询的数据结构和操作接口
 */
@Injectable()
export class UserProfileReadModel {
  private collection: any; // MongoDB集合引用

  constructor(collection: any) {
    this.collection = collection;
  }

  /**
   * 创建用户档案读模型
   * @description 创建新的用户档案读模型记录
   * @param {UserProfileReadModelData} data 用户档案数据
   * @returns {Promise<UserProfileReadModelData>} 创建的用户档案数据
   */
  async create(data: UserProfileReadModelData): Promise<UserProfileReadModelData> {
    try {
      const result = await this.collection.insertOne(data);
      return { ...data, id: result.insertedId.toString() };
    } catch (error) {
      console.error('创建用户档案读模型失败:', error);
      throw new Error(`创建用户档案读模型失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 根据ID查找用户档案
   * @description 根据档案ID查找用户档案读模型
   * @param {string} id 档案ID
   * @param {UserProfileQueryOptions} options 查询选项
   * @returns {Promise<UserProfileReadModelData | null>} 用户档案数据或null
   */
  async findById(id: string, options: UserProfileQueryOptions = {}): Promise<UserProfileReadModelData | null> {
    try {
      const profile = await this.collection.findOne({ id });
      
      if (!profile) {
        return null;
      }

      // 根据查询选项过滤敏感数据
      return this.filterProfileData(profile, options);
    } catch (error) {
      console.error('根据ID查找用户档案读模型失败:', error);
      throw new Error(`查找用户档案读模型失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 根据用户ID查找用户档案
   * @description 根据用户ID查找用户档案读模型
   * @param {string} userId 用户ID
   * @param {UserProfileQueryOptions} options 查询选项
   * @returns {Promise<UserProfileReadModelData | null>} 用户档案数据或null
   */
  async findByUserId(userId: string, options: UserProfileQueryOptions = {}): Promise<UserProfileReadModelData | null> {
    try {
      const profile = await this.collection.findOne({ userId });
      
      if (!profile) {
        return null;
      }

      // 根据查询选项过滤敏感数据
      return this.filterProfileData(profile, options);
    } catch (error) {
      console.error('根据用户ID查找用户档案读模型失败:', error);
      throw new Error(`查找用户档案读模型失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 根据显示名称查找用户档案
   * @description 根据显示名称查找用户档案读模型
   * @param {string} displayName 显示名称
   * @param {string} tenantId 租户ID
   * @returns {Promise<UserProfileReadModelData[]>} 用户档案列表
   */
  async findByDisplayName(displayName: string, tenantId: string): Promise<UserProfileReadModelData[]> {
    try {
      // 这里需要关联用户表来获取租户信息
      // 暂时返回空数组，后续实现关联查询
      const profiles = await this.collection.find({ 
        displayName: { $regex: displayName, $options: 'i' } // 模糊查询，不区分大小写
      }).toArray();
      
      return profiles;
    } catch (error) {
      console.error('根据显示名称查找用户档案读模型失败:', error);
      throw new Error(`查找用户档案读模型失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 根据位置查找用户档案
   * @description 根据位置查找用户档案读模型
   * @param {string} location 位置
   * @returns {Promise<UserProfileReadModelData[]>} 用户档案列表
   */
  async findByLocation(location: string): Promise<UserProfileReadModelData[]> {
    try {
      const profiles = await this.collection.find({ 
        location: { $regex: location, $options: 'i' } // 模糊查询，不区分大小写
      }).toArray();
      
      return profiles;
    } catch (error) {
      console.error('根据位置查找用户档案读模型失败:', error);
      throw new Error(`查找用户档案读模型失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 更新用户档案读模型
   * @description 根据用户ID更新用户档案读模型
   * @param {string} userId 用户ID
   * @param {Partial<UserProfileReadModelData>} updates 更新数据
   * @returns {Promise<boolean>} 更新是否成功
   */
  async updateByUserId(userId: string, updates: Partial<UserProfileReadModelData>): Promise<boolean> {
    try {
      updates.updatedAt = new Date();
      updates.version = (updates.version || 0) + 1;

      const result = await this.collection.updateOne(
        { userId },
        { $set: updates }
      );

      return result.modifiedCount > 0;
    } catch (error) {
      console.error('更新用户档案读模型失败:', error);
      throw new Error(`更新用户档案读模型失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 根据ID更新用户档案读模型
   * @description 根据档案ID更新用户档案读模型
   * @param {string} id 档案ID
   * @param {Partial<UserProfileReadModelData>} updates 更新数据
   * @returns {Promise<boolean>} 更新是否成功
   */
  async updateById(id: string, updates: Partial<UserProfileReadModelData>): Promise<boolean> {
    try {
      updates.updatedAt = new Date();
      updates.version = (updates.version || 0) + 1;

      const result = await this.collection.updateOne(
        { id },
        { $set: updates }
      );

      return result.modifiedCount > 0;
    } catch (error) {
      console.error('更新用户档案读模型失败:', error);
      throw new Error(`更新用户档案读模型失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 删除用户档案读模型
   * @description 根据用户ID删除用户档案读模型
   * @param {string} userId 用户ID
   * @returns {Promise<boolean>} 删除是否成功
   */
  async deleteByUserId(userId: string): Promise<boolean> {
    try {
      const result = await this.collection.deleteOne({ userId });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('删除用户档案读模型失败:', error);
      throw new Error(`删除用户档案读模型失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 根据ID删除用户档案读模型
   * @description 根据档案ID删除用户档案读模型
   * @param {string} id 档案ID
   * @returns {Promise<boolean>} 删除是否成功
   */
  async deleteById(id: string): Promise<boolean> {
    try {
      const result = await this.collection.deleteOne({ id });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('删除用户档案读模型失败:', error);
      throw new Error(`删除用户档案读模型失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 统计用户档案数量
   * @description 统计符合条件的用户档案数量
   * @param {object} query 查询条件
   * @returns {Promise<number>} 用户档案数量
   */
  async count(query: object = {}): Promise<number> {
    try {
      return await this.collection.countDocuments(query);
    } catch (error) {
      console.error('统计用户档案数量失败:', error);
      throw new Error(`统计用户档案数量失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 检查用户档案是否存在
   * @description 检查指定条件的用户档案是否存在
   * @param {object} query 查询条件
   * @returns {Promise<boolean>} 用户档案是否存在
   */
  async exists(query: object): Promise<boolean> {
    try {
      const count = await this.collection.countDocuments(query);
      return count > 0;
    } catch (error) {
      console.error('检查用户档案是否存在失败:', error);
      throw new Error(`检查用户档案是否存在失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 过滤档案数据
   * @description 根据查询选项过滤敏感数据
   * @param {UserProfileReadModelData} profile 原始档案数据
   * @param {UserProfileQueryOptions} options 查询选项
   * @returns {UserProfileReadModelData} 过滤后的档案数据
   */
  private filterProfileData(
    profile: UserProfileReadModelData, 
    options: UserProfileQueryOptions
  ): UserProfileReadModelData {
    const filteredProfile = { ...profile };

    // 如果不包含敏感数据，移除敏感字段
    if (!options.includeSensitiveData) {
      delete filteredProfile.dateOfBirth;
      delete filteredProfile.gender;
      delete filteredProfile.phone;
    }

    // 如果不包含偏好设置，移除偏好字段
    if (!options.includePreferences) {
      delete filteredProfile.preferences;
    }

    // 如果不包含社交链接，移除社交链接字段
    if (!options.includeSocialLinks) {
      delete filteredProfile.socialLinks;
    }

    return filteredProfile;
  }

  /**
   * 批量查找用户档案
   * @description 根据用户ID列表批量查找用户档案
   * @param {string[]} userIds 用户ID列表
   * @param {UserProfileQueryOptions} options 查询选项
   * @returns {Promise<UserProfileReadModelData[]>} 用户档案列表
   */
  async findByUserIds(userIds: string[], options: UserProfileQueryOptions = {}): Promise<UserProfileReadModelData[]> {
    try {
      const profiles = await this.collection.find({ 
        userId: { $in: userIds } 
      }).toArray();
      
      // 根据查询选项过滤敏感数据
      return profiles.map((profile: UserProfileReadModelData) => this.filterProfileData(profile, options));
    } catch (error) {
      console.error('批量查找用户档案读模型失败:', error);
      throw new Error(`批量查找用户档案读模型失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }
}
