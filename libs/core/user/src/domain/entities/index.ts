/**
 * @fileoverview
 * 用户管理模块 - 领域层实体导出
 *
 * 该文件导出用户管理模块的所有领域实体，包括：
 * - UserEntity: 用户实体
 * - UserProfileEntity: 用户档案实体
 * - UserRelationshipEntity: 用户关系实体
 */

export { UserEntity } from './user.entity';
export { UserProfileEntity } from './user-profile.entity';
export {
  UserRelationshipEntity,
  RelationshipType,
  RelationshipStatus,
} from './user-relationship.entity';
