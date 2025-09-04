/**
 * @class UserRelationshipOrmEntity
 * @description
 * PostgreSQL用户关系ORM实体，用于管理用户之间的各种关系。
 *
 * 原理与机制：
 * 1. 继承MikroORM的BaseEntity，提供基础的数据库操作能力
 * 2. 使用装饰器定义表结构、字段类型、索引和约束
 * 3. 支持PostgreSQL特有的数据类型和功能
 * 4. 实现用户关系的多对多映射
 *
 * 功能与职责：
 * 1. 定义用户关系表结构
 * 2. 提供用户关系字段映射
 * 3. 支持关系查询和索引优化
 * 4. 实现关系数据验证和约束
 *
 * @example
 * ```typescript
 * const relationshipOrm = new UserRelationshipOrmEntity();
 * relationshipOrm.sourceUserId = 'user-123';
 * relationshipOrm.targetUserId = 'user-456';
 * relationshipOrm.relationshipType = 'COLLEAGUE';
 * await em.persistAndFlush(relationshipOrm);
 * ```
 * @since 1.0.0
 */

import {
  Entity,
  PrimaryKey,
  Property,
  Index,
  Unique,
  Enum,
} from '@mikro-orm/core';
import { BaseEntity } from '@mikro-orm/core';

/**
 * 用户关系类型枚举
 */
export enum UserRelationshipType {
  /** 同事关系 */
  COLLEAGUE = 'colleague',
  /** 上下级关系 */
  MANAGER_SUBORDINATE = 'manager_subordinate',
  /** 导师学生关系 */
  MENTOR_MENTEE = 'mentor_mentee',
  /** 朋友关系 */
  FRIEND = 'friend',
  /** 家庭成员关系 */
  FAMILY = 'family',
  /** 合作伙伴关系 */
  PARTNER = 'partner',
  /** 客户关系 */
  CLIENT = 'client',
  /** 供应商关系 */
  SUPPLIER = 'supplier',
  /** 校友关系 */
  ALUMNI = 'alumni',
  /** 其他关系 */
  OTHER = 'other',
}

/**
 * 关系状态枚举
 */
export enum RelationshipStatus {
  /** 活跃状态 */
  ACTIVE = 'active',
  /** 待确认状态 */
  PENDING = 'pending',
  /** 已拒绝状态 */
  REJECTED = 'rejected',
  /** 已暂停状态 */
  SUSPENDED = 'suspended',
  /** 已结束状态 */
  ENDED = 'ended',
}

/**
 * PostgreSQL用户关系ORM实体
 */
@Entity({ tableName: 'user_relationships' })
@Index({
  name: 'idx_user_relationships_source_user_id',
  properties: ['sourceUserId'],
})
@Index({
  name: 'idx_user_relationships_target_user_id',
  properties: ['targetUserId'],
})
@Index({ name: 'idx_user_relationships_tenant_id', properties: ['tenantId'] })
@Index({
  name: 'idx_user_relationships_type',
  properties: ['relationshipType'],
})
@Index({ name: 'idx_user_relationships_status', properties: ['status'] })
@Index({ name: 'idx_user_relationships_created_at', properties: ['createdAt'] })
@Unique({
  name: 'uq_user_relationships_source_target_type',
  properties: ['sourceUserId', 'targetUserId', 'relationshipType'],
})
export class UserRelationshipOrmEntity extends BaseEntity<
  UserRelationshipOrmEntity,
  'id'
> {
  /**
   * 关系唯一标识
   * @description 主键，使用UUID类型
   */
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  /**
   * 源用户ID
   * @description 关系的发起方用户ID
   */
  @Property({ type: 'uuid', nullable: false })
  sourceUserId!: string;

  /**
   * 目标用户ID
   * @description 关系的接收方用户ID
   */
  @Property({ type: 'uuid', nullable: false })
  targetUserId!: string;

  /**
   * 租户ID
   * @description 用户所属的租户，用于数据隔离
   */
  @Property({ type: 'uuid', nullable: false })
  tenantId!: string;

  /**
   * 关系类型
   * @description 用户关系的类型
   */
  @Enum({
    items: () => UserRelationshipType,
    type: 'varchar',
    length: 30,
    nullable: false,
  })
  relationshipType!: UserRelationshipType;

  /**
   * 关系状态
   * @description 用户关系的当前状态
   */
  @Enum({
    items: () => RelationshipStatus,
    type: 'varchar',
    length: 20,
    nullable: false,
    default: RelationshipStatus.PENDING,
  })
  status!: RelationshipStatus;

  /**
   * 关系强度
   * @description 关系的强度等级（1-10）
   */
  @Property({ type: 'int', nullable: true, default: 5 })
  strength?: number;

  /**
   * 关系描述
   * @description 关系的详细描述
   */
  @Property({ type: 'text', nullable: true })
  description?: string;

  /**
   * 关系标签
   * @description 关系的标签，JSON格式存储
   */
  @Property({ type: 'jsonb', nullable: true, default: '[]' })
  tags?: string[];

  /**
   * 关系开始时间
   * @description 关系开始的时间
   */
  @Property({ type: 'timestamp', nullable: true })
  startDate?: Date;

  /**
   * 关系结束时间
   * @description 关系结束的时间
   */
  @Property({ type: 'timestamp', nullable: true })
  endDate?: Date;

  /**
   * 关系持续时间
   * @description 关系的持续时间（天数）
   */
  @Property({ type: 'int', nullable: true })
  duration?: number;

  /**
   * 关系频率
   * @description 关系的互动频率，JSON格式存储
   */
  @Property({ type: 'jsonb', nullable: true, default: '{}' })
  frequency?: {
    daily?: boolean;
    weekly?: boolean;
    monthly?: boolean;
    quarterly?: boolean;
    yearly?: boolean;
    custom?: string;
  };

  /**
   * 关系质量评分
   * @description 关系的质量评分（1-10）
   */
  @Property({ type: 'int', nullable: true, default: 5 })
  qualityScore?: number;

  /**
   * 关系重要性
   * @description 关系的重要性等级（1-10）
   */
  @Property({ type: 'int', nullable: true, default: 5 })
  importance?: number;

  /**
   * 关系可见性
   * @description 关系的可见性设置
   */
  @Property({ type: 'varchar', length: 20, nullable: false, default: 'public' })
  visibility!: 'public' | 'private' | 'contacts' | 'team' | 'organization';

  /**
   * 关系权限
   * @description 关系相关的权限设置，JSON格式存储
   */
  @Property({ type: 'jsonb', nullable: true, default: '{}' })
  permissions?: {
    canViewProfile?: boolean;
    canSendMessage?: boolean;
    canInviteToMeeting?: boolean;
    canShareDocument?: boolean;
    canCollaborate?: boolean;
  };

  /**
   * 关系历史
   * @description 关系的历史记录，JSON格式存储
   */
  @Property({ type: 'jsonb', nullable: true, default: '[]' })
  history?: Array<{
    action: string;
    timestamp: string;
    description: string;
    metadata?: Record<string, unknown>;
  }>;

  /**
   * 关系统计
   * @description 关系的统计信息，JSON格式存储
   */
  @Property({ type: 'jsonb', nullable: true, default: '{}' })
  statistics?: {
    interactionCount?: number;
    lastInteractionDate?: string;
    meetingCount?: number;
    documentShareCount?: number;
    collaborationCount?: number;
  };

  /**
   * 关系备注
   * @description 关于关系的备注信息
   */
  @Property({ type: 'text', nullable: true })
  notes?: string;

  /**
   * 关系元数据
   * @description 关系的额外元数据信息，JSON格式存储
   */
  @Property({ type: 'jsonb', nullable: true, default: '{}' })
  metadata?: Record<string, unknown>;

  /**
   * 创建时间
   * @description 关系记录的创建时间
   */
  @Property({
    type: 'timestamp',
    nullable: false,
    defaultRaw: 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date;

  /**
   * 更新时间
   * @description 关系记录的最后更新时间
   */
  @Property({
    type: 'timestamp',
    nullable: false,
    defaultRaw: 'CURRENT_TIMESTAMP',
  })
  updatedAt!: Date;

  /**
   * 确认时间
   * @description 关系被确认的时间
   */
  @Property({ type: 'timestamp', nullable: true })
  confirmedAt?: Date;

  /**
   * 版本号
   * @description 用于乐观锁的版本号
   */
  @Property({ type: 'int', nullable: false, default: 1 })
  version!: number;

  /**
   * 构造函数
   * @description 初始化用户关系ORM实体
   */
  constructor() {
    super();
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.version = 1;
  }

  /**
   * 确认关系
   * @description 确认用户关系
   */
  confirm(): void {
    this.status = RelationshipStatus.ACTIVE;
    this.confirmedAt = new Date();
    this.updatedAt = new Date();
    this.version++;
  }

  /**
   * 拒绝关系
   * @description 拒绝用户关系
   */
  reject(): void {
    this.status = RelationshipStatus.REJECTED;
    this.updatedAt = new Date();
    this.version++;
  }

  /**
   * 暂停关系
   * @description 暂停用户关系
   */
  suspend(): void {
    this.status = RelationshipStatus.SUSPENDED;
    this.updatedAt = new Date();
    this.version++;
  }

  /**
   * 结束关系
   * @description 结束用户关系
   */
  end(): void {
    this.status = RelationshipStatus.ENDED;
    this.endDate = new Date();
    this.updatedAt = new Date();
    this.version++;
  }

  /**
   * 更新关系强度
   * @description 更新关系的强度等级
   * @param {number} strength 新的强度等级
   */
  updateStrength(strength: number): void {
    if (strength >= 1 && strength <= 10) {
      this.strength = strength;
      this.updatedAt = new Date();
      this.version++;
    }
  }

  /**
   * 更新关系质量评分
   * @description 更新关系的质量评分
   * @param {number} qualityScore 新的质量评分
   */
  updateQualityScore(qualityScore: number): void {
    if (qualityScore >= 1 && qualityScore <= 10) {
      this.qualityScore = qualityScore;
      this.updatedAt = new Date();
      this.version++;
    }
  }

  /**
   * 添加关系标签
   * @description 添加新的关系标签
   * @param {string} tag 新的标签
   */
  addTag(tag: string): void {
    if (!this.tags) {
      this.tags = [];
    }
    if (!this.tags.includes(tag)) {
      this.tags.push(tag);
      this.updatedAt = new Date();
      this.version++;
    }
  }

  /**
   * 移除关系标签
   * @description 移除指定的关系标签
   * @param {string} tag 要移除的标签
   */
  removeTag(tag: string): void {
    if (this.tags) {
      this.tags = this.tags.filter(t => t !== tag);
      this.updatedAt = new Date();
      this.version++;
    }
  }

  /**
   * 记录关系历史
   * @description 记录关系的历史操作
   * @param {string} action 操作类型
   * @param {string} description 操作描述
   * @param {Record<string, unknown>} metadata 操作元数据
   */
  recordHistory(
    action: string,
    description: string,
    metadata?: Record<string, unknown>,
  ): void {
    if (!this.history) {
      this.history = [];
    }
    this.history.push({
      action,
      timestamp: new Date().toISOString(),
      description,
      metadata,
    });
    this.updatedAt = new Date();
    this.version++;
  }

  /**
   * 更新关系统计
   * @description 更新关系的统计信息
   * @param {Record<string, unknown>} statistics 新的统计信息
   */
  updateStatistics(statistics: Record<string, unknown>): void {
    this.statistics = { ...this.statistics, ...statistics };
    this.updatedAt = new Date();
    this.version++;
  }

  /**
   * 检查关系是否活跃
   * @description 检查关系状态是否为活跃状态
   * @returns {boolean} 是否活跃
   */
  isActive(): boolean {
    return this.status === RelationshipStatus.ACTIVE;
  }

  /**
   * 检查关系是否待确认
   * @description 检查关系状态是否为待确认状态
   * @returns {boolean} 是否待确认
   */
  isPending(): boolean {
    return this.status === RelationshipStatus.PENDING;
  }

  /**
   * 检查关系是否已结束
   * @description 检查关系状态是否为已结束状态
   * @returns {boolean} 是否已结束
   */
  isEnded(): boolean {
    return this.status === RelationshipStatus.ENDED;
  }

  /**
   * 获取关系持续时间
   * @description 计算关系的持续时间
   * @returns {number} 持续时间（天数）
   */
  getDuration(): number {
    if (this.startDate && this.endDate) {
      const start = new Date(this.startDate);
      const end = new Date(this.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    return 0;
  }
}
