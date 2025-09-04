/**
 * @description PostgreSQL用户档案映射器
 * @author 江郎
 * @since 2.1.0
 */

import { Injectable } from '@nestjs/common';
import { UserProfileOrmEntity } from '../../entities/postgresql/user-profile.orm-entity';

@Injectable()
export class PostgresUserProfileMapper {
  /**
   * 将ORM实体转换为DTO
   * @param ormEntity ORM实体
   * @returns DTO对象
   */
  toDto(ormEntity: UserProfileOrmEntity): any {
    return {
      id: ormEntity.id,
      userId: ormEntity.userId,
      displayName: ormEntity.displayName,
      bio: ormEntity.bio,
      avatar: ormEntity.avatar,
      location: ormEntity.location,
      website: ormEntity.website,
      preferences: ormEntity.preferences,
      phone: ormEntity.phone,
      company: ormEntity.company,
      jobTitle: ormEntity.jobTitle,
      department: ormEntity.department,
      manager: ormEntity.manager,
      hireDate: ormEntity.hireDate,
      birthDate: ormEntity.birthDate,
      emergencyContact: ormEntity.emergencyContact,
      emergencyPhone: ormEntity.emergencyPhone,
      skills: ormEntity.skills,
      certifications: ormEntity.certifications,
      languages: ormEntity.languages,
      timezone: ormEntity.timezone,
      locale: ormEntity.locale,
      language: ormEntity.language,
      isActive: ormEntity.isActive,
      createdAt: ormEntity.createdAt,
      updatedAt: ormEntity.updatedAt,
    };
  }

  /**
   * 将DTO转换为ORM实体
   * @param dto DTO对象
   * @returns ORM实体
   */
  toOrmEntity(dto: any): Partial<UserProfileOrmEntity> {
    return {
      id: dto.id,
      userId: dto.userId,
      displayName: dto.displayName,
      bio: dto.bio,
      avatar: dto.avatar,
      location: dto.location,
      website: dto.website,
      preferences: dto.preferences,
      phone: dto.phone,
      company: dto.company,
      jobTitle: dto.jobTitle,
      department: dto.department,
      manager: dto.manager,
      hireDate: dto.hireDate,
      birthDate: dto.birthDate,
      emergencyContact: dto.emergencyContact,
      emergencyPhone: dto.emergencyPhone,
      skills: dto.skills,
      certifications: dto.certifications,
      languages: dto.languages,
      timezone: dto.timezone,
      locale: dto.locale,
      language: dto.language,
      isActive: dto.isActive,
    };
  }
}
