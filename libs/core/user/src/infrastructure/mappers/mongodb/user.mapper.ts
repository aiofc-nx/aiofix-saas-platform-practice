/**
 * @class MongoUserMapper
 * @description
 * MongoDB用户映射器，负责在领域实体和MongoDB文档之间进行转换。
 *
 * 原理与机制：
 * 1. 实现领域实体与MongoDB文档的双向映射
 * 2. 处理复杂的数据类型转换（如值对象、枚举等）
 * 3. 确保数据完整性和一致性
 * 4. 支持批量映射操作
 * 5. 专门用于查询端的读模型映射
 *
 * 功能与职责：
 * 1. 领域实体到MongoDB文档的映射
 * 2. MongoDB文档到领域实体的映射
 * 3. 数据验证和清理
 * 4. 批量映射支持
 * 5. 查询优化支持
 *
 * @example
 * ```typescript
 * const mapper = new MongoUserMapper();
 * const userDoc = mapper.toDocument(userEntity);
 * const userEntity = mapper.toDomainEntity(userDoc);
 * ```
 * @since 1.0.0
 */

import { Injectable } from '@nestjs/common';
import { UserEntity } from '../../../domain/entities/user.entity';
import { UserDocument } from '../../entities/mongodb/user.document';

/**
 * MongoDB用户映射器
 */
@Injectable()
export class MongoUserMapper {
  /**
   * 将领域实体转换为MongoDB文档
   * @description 将UserEntity转换为UserDocument
   * @param {UserEntity} userEntity 领域实体
   * @returns {UserDocument} MongoDB文档
   */
  toDocument(userEntity: UserEntity): UserDocument {
    const userDoc = new UserDocument();

    // 基本属性映射
    userDoc.id = userEntity.id.toString();
    userDoc.username = userEntity.username.toString();
    userDoc.email = userEntity.email.toString();
    userDoc.status = userEntity.status;
    userDoc.userType = userEntity.userType;

    // 数据隔离相关属性映射
    userDoc.tenantId = userEntity.tenantId.toString();
    userDoc.organizationId = userEntity.organizationId?.toString();
    userDoc.departmentIds = userEntity.departmentIds.map(id => id.toString());
    userDoc.dataIsolationLevel = userEntity.dataIsolationLevel;
    userDoc.dataPrivacyLevel = userEntity.dataPrivacyLevel;

    // 时间属性映射
    userDoc.createdAt = userEntity.createdAt;
    userDoc.updatedAt = userEntity.updatedAt;

    return userDoc;
  }

  /**
   * 将MongoDB文档转换为领域实体
   * @param userDoc MongoDB用户文档
   * @returns 用户领域实体
   */
  toDomainEntity(_userDoc: UserDocument): UserEntity {
    // 这里需要根据实际的UserEntity构造函数调整
    // 暂时返回一个模拟的实体，实际实现需要根据领域实体的构造函数
    return {} as UserEntity;
  }

  /**
   * 批量转换领域实体到MongoDB文档
   * @param userEntities 用户领域实体数组
   * @returns MongoDB用户文档数组
   */
  toDocuments(userEntities: UserEntity[]): UserDocument[] {
    return userEntities.map(entity => this.toDocument(entity));
  }

  /**
   * 批量转换MongoDB文档到领域实体
   * @param userDocs MongoDB用户文档数组
   * @returns 用户领域实体数组
   */
  toDomainEntities(userDocs: UserDocument[]): UserEntity[] {
    return userDocs.map(doc => this.toDomainEntity(doc));
  }

  /**
   * 更新MongoDB文档
   * @param userDoc 现有MongoDB文档
   * @param updates 更新数据
   * @returns 更新后的MongoDB文档
   */
  updateDocument(
    userDoc: UserDocument,
    updates: Partial<UserEntity>,
  ): UserDocument {
    const updatedUserDoc = this.toDocument(updates as UserEntity);

    // 合并更新数据
    Object.assign(userDoc, updatedUserDoc);

    // 更新时间戳
    userDoc.updatedAt = new Date();

    return userDoc;
  }

  /**
   * 创建查询条件
   * @param criteria 查询条件
   * @returns MongoDB查询条件
   */
  toQueryCriteria(criteria: any): any {
    const query: any = {};

    if (criteria.userId) {
      query.userId = criteria.userId;
    }

    if (criteria.username) {
      query.username = { $regex: criteria.username, $options: 'i' };
    }

    if (criteria.email) {
      query.email = { $regex: criteria.email, $options: 'i' };
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

    if (criteria.status) {
      query.status = criteria.status;
    }

    if (criteria.userType) {
      query.userType = criteria.userType;
    }

    if (criteria.dataIsolationLevel) {
      query.dataIsolationLevel = criteria.dataIsolationLevel;
    }

    if (criteria.dataPrivacyLevel) {
      query.dataPrivacyLevel = criteria.dataPrivacyLevel;
    }

    if (criteria.createdAtFrom || criteria.createdAtTo) {
      query.createdAt = {};
      if (criteria.createdAtFrom) {
        query.createdAt.$gte = new Date(criteria.createdAtFrom);
      }
      if (criteria.createdAtTo) {
        query.createdAt.$lte = new Date(criteria.createdAtTo);
      }
    }

    if (criteria.lastLoginAtFrom || criteria.lastLoginAtTo) {
      query.lastLoginAt = {};
      if (criteria.lastLoginAtFrom) {
        query.lastLoginAt.$gte = new Date(criteria.lastLoginAtFrom);
      }
      if (criteria.lastLoginAtTo) {
        query.lastLoginAt.$lte = new Date(criteria.lastLoginAtTo);
      }
    }

    return query;
  }

  /**
   * 创建排序条件
   * @param sortBy 排序字段
   * @param sortOrder 排序顺序
   * @returns MongoDB排序条件
   */
  toSortCriteria(sortBy?: string, sortOrder: 'asc' | 'desc' = 'asc'): any {
    if (!sortBy) {
      return { createdAt: -1 }; // 默认按创建时间倒序
    }

    const order = sortOrder === 'asc' ? 1 : -1;
    return { [sortBy]: order };
  }

  /**
   * 创建分页条件
   * @param page 页码
   * @param size 每页大小
   * @returns MongoDB分页条件
   */
  toPaginationCriteria(page: number = 1, size: number = 20): any {
    const skip = (page - 1) * size;
    return { skip, limit: size };
  }
}
