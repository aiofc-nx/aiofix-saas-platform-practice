/**
 * @description PostgreSQL用户关系映射器
 * @author 江郎
 * @since 2.1.0
 */

import { Injectable } from '@nestjs/common';
import { UserRelationshipOrmEntity } from '../../entities/postgresql/user-relationship.orm-entity';

@Injectable()
export class PostgresUserRelationshipMapper {
  /**
   * 将ORM实体转换为DTO
   * @param ormEntity ORM实体
   * @returns DTO对象
   */
  toDto(ormEntity: UserRelationshipOrmEntity): any {
    return {
      id: ormEntity.id,
      sourceUserId: ormEntity.sourceUserId,
      targetUserId: ormEntity.targetUserId,
      relationshipType: ormEntity.relationshipType,
      status: ormEntity.status,
      metadata: ormEntity.metadata,
      createdAt: ormEntity.createdAt,
      updatedAt: ormEntity.updatedAt,
      isActive: ormEntity.isActive,
      isDeleted: ormEntity.isDeleted,
      deletedAt: ormEntity.deletedAt,
      deletedBy: ormEntity.deletedBy,
      deletionReason: ormEntity.deletionReason,
    };
  }

  /**
   * 将DTO转换为ORM实体
   * @param dto DTO对象
   * @returns ORM实体
   */
  toOrmEntity(dto: any): Partial<UserRelationshipOrmEntity> {
    return {
      id: dto.id,
      sourceUserId: dto.sourceUserId,
      targetUserId: dto.targetUserId,
      relationshipType: dto.relationshipType,
      status: dto.status,
      metadata: dto.metadata,
      isActive: dto.isActive,
      isDeleted: dto.isDeleted,
      deletedAt: dto.deletedAt,
      deletedBy: dto.deletedBy,
      deletionReason: dto.deletionReason,
    };
  }
}
