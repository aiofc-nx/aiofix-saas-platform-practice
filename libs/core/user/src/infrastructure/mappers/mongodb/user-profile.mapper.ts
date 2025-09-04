/**
 * @class MongoUserProfileMapper
 * @description
 * MongoDB用户档案映射器，负责在领域实体和MongoDB文档之间进行转换。
 *
 * 原理与机制：
 * 1. 实现领域实体与MongoDB文档的双向映射
 * 2. 处理复杂属性的转换和验证
 * 3. 确保数据完整性和类型安全
 * 4. 支持批量映射操作
 * 5. 处理可选字段和默认值
 *
 * 功能与职责：
 * 1. 领域实体到MongoDB文档的转换
 * 2. MongoDB文档到领域实体的转换
 * 3. 批量映射操作
 * 4. 数据验证和清理
 * 5. 类型安全保证
 *
 * @example
 * ```typescript
 * const mapper = new MongoUserProfileMapper();
 * const document = mapper.toDocument(domainEntity);
 * const domainEntity = mapper.toDomainEntity(document);
 * ```
 * @since 1.0.0
 */

import { Injectable } from '@nestjs/common';
import { UserProfileEntity } from '../../../domain/entities/user-profile.entity';
import { UserProfileDocument } from '../../entities/mongodb/user-profile.document';

/**
 * MongoDB用户档案映射器
 */
@Injectable()
export class MongoUserProfileMapper {
  /**
   * 将领域实体转换为MongoDB文档
   * @param profile 用户档案领域实体
   * @returns MongoDB文档
   */
  toDocument(profile: UserProfileEntity): Partial<UserProfileDocument> {
    if (!profile) {
      return {};
    }

    return {
      profileId: profile.id,
      userId: profile.userId,
      firstName: profile.firstName,
      lastName: profile.lastName,
      displayName: profile.displayName,
      avatar: profile.avatar,
      bio: profile.bio,
      location: profile.location,
      timezone: profile.timezone,
      language: profile.language,
      dateOfBirth: profile.dateOfBirth,
      gender: profile.gender,
      website: profile.website,
      socialLinks: profile.socialLinks,
      preferences: profile.preferences,
      skills: profile.skills,
      interests: profile.interests,
      education: profile.education,
      experience: profile.experience,
      certifications: profile.certifications,
      tenantId: profile.tenantId,
      organizationId: profile.organizationId,
      departmentIds: profile.departmentIds,
      dataIsolationLevel: profile.dataIsolationLevel,
      dataPrivacyLevel: profile.dataPrivacyLevel,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
      version: profile.version,
    };
  }

  /**
   * 将MongoDB文档转换为领域实体
   * @param profileDoc MongoDB文档
   * @returns 用户档案领域实体
   */
  toDomainEntity(profileDoc: UserProfileDocument): UserProfileEntity {
    if (!profileDoc) {
      throw new Error('Profile document cannot be null');
    }

    // 创建领域实体
    const profile = new UserProfileEntity(
      profileDoc.userId,
      profileDoc.firstName,
      profileDoc.lastName,
      profileDoc.displayName,
      profileDoc.avatar,
      profileDoc.bio,
      profileDoc.location,
      profileDoc.timezone,
      profileDoc.language,
      profileDoc.dateOfBirth,
      profileDoc.gender,
      profileDoc.website,
      profileDoc.socialLinks,
      profileDoc.preferences,
      profileDoc.skills,
      profileDoc.interests,
      profileDoc.education,
      profileDoc.experience,
      profileDoc.certifications,
      profileDoc.profileId || profileDoc._id?.toString(),
    );

    // 设置时间戳和版本
    if (profileDoc.createdAt) {
      profile.createdAt = profileDoc.createdAt;
    }
    if (profileDoc.updatedAt) {
      profile.updatedAt = profileDoc.updatedAt;
    }
    if (profileDoc.version) {
      profile.version = profileDoc.version;
    }

    // 设置数据隔离信息
    if (profileDoc.tenantId) {
      profile.tenantId = profileDoc.tenantId;
    }
    if (profileDoc.organizationId) {
      profile.organizationId = profileDoc.organizationId;
    }
    if (profileDoc.departmentIds) {
      profile.departmentIds = profileDoc.departmentIds;
    }
    if (profileDoc.dataIsolationLevel) {
      profile.dataIsolationLevel = profileDoc.dataIsolationLevel;
    }
    if (profileDoc.dataPrivacyLevel) {
      profile.dataPrivacyLevel = profileDoc.dataPrivacyLevel;
    }

    return profile;
  }

  /**
   * 批量转换领域实体到MongoDB文档
   * @param profiles 用户档案领域实体数组
   * @returns MongoDB文档数组
   */
  toDocuments(profiles: UserProfileEntity[]): Partial<UserProfileDocument>[] {
    if (!profiles || !Array.isArray(profiles)) {
      return [];
    }
    return profiles.map(profile => this.toDocument(profile));
  }

  /**
   * 批量转换MongoDB文档到领域实体
   * @param profileDocs MongoDB文档数组
   * @returns 用户档案领域实体数组
   */
  toDomainEntities(profileDocs: UserProfileDocument[]): UserProfileEntity[] {
    if (!profileDocs || !Array.isArray(profileDocs)) {
      return [];
    }
    return profileDocs.map(profileDoc => this.toDomainEntity(profileDoc));
  }

  /**
   * 更新MongoDB文档
   * @param profileDoc 现有MongoDB文档
   * @param updates 更新数据
   * @returns 更新后的MongoDB文档
   */
  updateDocument(
    profileDoc: UserProfileDocument,
    updates: Partial<UserProfileEntity>,
  ): Partial<UserProfileDocument> {
    if (!profileDoc || !updates) {
      return profileDoc || {};
    }

    const updateData: Partial<UserProfileDocument> = {};

    // 只更新提供的字段
    if (updates.firstName !== undefined) {
      updateData.firstName = updates.firstName;
    }
    if (updates.lastName !== undefined) {
      updateData.lastName = updates.lastName;
    }
    if (updates.displayName !== undefined) {
      updateData.displayName = updates.displayName;
    }
    if (updates.avatar !== undefined) {
      updateData.avatar = updates.avatar;
    }
    if (updates.bio !== undefined) {
      updateData.bio = updates.bio;
    }
    if (updates.location !== undefined) {
      updateData.location = updates.location;
    }
    if (updates.timezone !== undefined) {
      updateData.timezone = updates.timezone;
    }
    if (updates.language !== undefined) {
      updateData.language = updates.language;
    }
    if (updates.dateOfBirth !== undefined) {
      updateData.dateOfBirth = updates.dateOfBirth;
    }
    if (updates.gender !== undefined) {
      updateData.gender = updates.gender;
    }
    if (updates.website !== undefined) {
      updateData.website = updates.website;
    }
    if (updates.socialLinks !== undefined) {
      updateData.socialLinks = updates.socialLinks;
    }
    if (updates.preferences !== undefined) {
      updateData.preferences = updates.preferences;
    }
    if (updates.skills !== undefined) {
      updateData.skills = updates.skills;
    }
    if (updates.interests !== undefined) {
      updateData.interests = updates.interests;
    }
    if (updates.education !== undefined) {
      updateData.education = updates.education;
    }
    if (updates.experience !== undefined) {
      updateData.experience = updates.experience;
    }
    if (updates.certifications !== undefined) {
      updateData.certifications = updates.certifications;
    }
    if (updates.organizationId !== undefined) {
      updateData.organizationId = updates.organizationId;
    }
    if (updates.departmentIds !== undefined) {
      updateData.departmentIds = updates.departmentIds;
    }
    if (updates.dataIsolationLevel !== undefined) {
      updateData.dataIsolationLevel = updates.dataIsolationLevel;
    }
    if (updates.dataPrivacyLevel !== undefined) {
      updateData.dataPrivacyLevel = updates.dataPrivacyLevel;
    }

    // 更新时间戳
    updateData.updatedAt = new Date();
    if (updates.version !== undefined) {
      updateData.version = updates.version + 1;
    }

    return updateData;
  }

  /**
   * 创建部分更新数据
   * @param updates 更新数据
   * @returns 部分更新数据
   */
  toPartialUpdate(
    updates: Partial<UserProfileEntity>,
  ): Partial<UserProfileDocument> {
    if (!updates) {
      return {};
    }

    const updateData: Partial<UserProfileDocument> = {};

    // 只包含非undefined的字段
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        updateData[key] = value;
      }
    });

    // 更新时间戳
    updateData.updatedAt = new Date();

    return updateData;
  }

  /**
   * 转换为查询条件
   * @param criteria 查询条件
   * @returns MongoDB查询条件
   */
  toQueryCriteria(_criteria: unknown): any {
    if (!criteria) {
      return {};
    }

    const query: unknown = {};

    // 基本字段查询
    if (criteria.userId) {
      query.userId = criteria.userId;
    }
    if (criteria.tenantId) {
      query.tenantId = criteria.tenantId;
    }
    if (criteria.organizationId) {
      query.organizationId = criteria.organizationId;
    }
    if (criteria.departmentIds && criteria.departmentIds.length > 0) {
      query.departmentIds = { $in: criteria.departmentIds };
    }

    // 文本搜索
    if (criteria.searchTerm) {
      query.$or = [
        { firstName: { $regex: criteria.searchTerm, $options: 'i' } },
        { lastName: { $regex: criteria.searchTerm, $options: 'i' } },
        { displayName: { $regex: criteria.searchTerm, $options: 'i' } },
        { bio: { $regex: criteria.searchTerm, $options: 'i' } },
        { location: { $regex: criteria.searchTerm, $options: 'i' } },
      ];
    }

    // 技能和兴趣查询
    if (criteria.skills && criteria.skills.length > 0) {
      query.skills = { $in: criteria.skills };
    }
    if (criteria.interests && criteria.interests.length > 0) {
      query.interests = { $in: criteria.interests };
    }

    // 范围查询
    if (criteria.dateOfBirthFrom || criteria.dateOfBirthTo) {
      query.dateOfBirth = {};
      if (criteria.dateOfBirthFrom) {
        query.dateOfBirth.$gte = criteria.dateOfBirthFrom;
      }
      if (criteria.dateOfBirthTo) {
        query.dateOfBirth.$lte = criteria.dateOfBirthTo;
      }
    }

    return query;
  }

  /**
   * 转换为排序条件
   * @param sortBy 排序字段
   * @param sortOrder 排序顺序
   * @returns MongoDB排序条件
   */
  toSortCriteria(sortBy?: string, sortOrder: 'asc' | 'desc' = 'desc'): any {
    if (!sortBy) {
      return { createdAt: -1 }; // 默认按创建时间倒序
    }

    const sortOrderValue = sortOrder === 'asc' ? 1 : -1;
    return { [sortBy]: sortOrderValue };
  }

  /**
   * 转换为分页条件
   * @param page 页码
   * @param size 每页大小
   * @returns MongoDB分页条件
   */
  toPaginationCriteria(
    page: number = 1,
    size: number = 20,
  ): { skip: number; limit: number } {
    const skip = (page - 1) * size;
    return { skip, limit: size };
  }
}
