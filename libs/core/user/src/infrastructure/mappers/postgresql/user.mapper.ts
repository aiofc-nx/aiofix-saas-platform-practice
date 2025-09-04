/**
 * @description PostgreSQL用户映射器
 * @author 江郎
 * @since 2.1.0
 */

import { Injectable } from '@nestjs/common';
import { UserOrmEntity } from '../../entities/postgresql/user.orm-entity';
import { UserEntity } from '../../../domain/entities/user.entity';
import { UserId, Username, Email, PhoneNumber, TenantId } from '@aiofix/shared';
import { UserType } from '../../../domain/enums/user-type.enum';
import { UserStatus } from '../../../domain/enums/user-status.enum';
import { DataPrivacyLevel, DataIsolationLevel } from '@aiofix/shared';

@Injectable()
export class PostgresUserMapper {
  /**
   * 将ORM实体转换为领域实体
   * @param ormEntity ORM实体
   * @returns 领域实体
   */
  toDomain(ormEntity: UserOrmEntity): UserEntity {
    const userEntity = UserEntity.createTenantUser(
      new UserId(ormEntity.id),
      new Username(ormEntity.username),
      new Email(ormEntity.email),
      new TenantId(ormEntity.tenantId),
      ormEntity.organizationId
        ? new TenantId(ormEntity.organizationId)
        : undefined,
      ormEntity.departmentIds
        ? ormEntity.departmentIds.map(id => new TenantId(id))
        : [],
      ormEntity.userType as UserType,
      ormEntity.dataPrivacyLevel as DataPrivacyLevel,
    );

    // 设置其他属性
    if (ormEntity.displayName) {
      userEntity.updateDisplayName(ormEntity.displayName);
    }

    if (ormEntity.phone) {
      userEntity.updatePhone(new PhoneNumber(ormEntity.phone));
    }

    if (ormEntity.avatar) {
      userEntity.updateAvatar(ormEntity.avatar);
    }

    // 设置状态
    if (ormEntity.status) {
      userEntity.updateStatus(ormEntity.status as UserStatus);
    }

    // 设置元数据
    if (ormEntity.metadata) {
      userEntity.updateMetadata(ormEntity.metadata);
    }

    // 设置时间相关属性
    if (ormEntity.lastLoginAt) {
      userEntity.updateLastLoginAt(ormEntity.lastLoginAt);
    }

    if (ormEntity.emailVerifiedAt) {
      userEntity.markEmailAsVerified(ormEntity.emailVerifiedAt);
    }

    if (ormEntity.phoneVerifiedAt) {
      userEntity.markPhoneAsVerified(ormEntity.phoneVerifiedAt);
    }

    // 设置验证状态
    if (ormEntity.isEmailVerified) {
      userEntity.markEmailAsVerified();
    }

    if (ormEntity.isPhoneVerified) {
      userEntity.markPhoneAsVerified();
    }

    // 设置MFA配置
    if (ormEntity.isMfaEnabled && ormEntity.mfaConfig) {
      userEntity.enableMFA(ormEntity.mfaConfig);
    }

    // 设置偏好和设置
    if (ormEntity.preferences) {
      userEntity.updatePreferences(ormEntity.preferences);
    }

    if (ormEntity.settings) {
      userEntity.updateSettings(ormEntity.settings);
    }

    // 设置本地化信息
    if (ormEntity.timezone) {
      userEntity.updateTimezone(ormEntity.timezone);
    }

    if (ormEntity.locale) {
      userEntity.updateLocale(ormEntity.locale);
    }

    if (ormEntity.language) {
      userEntity.updateLanguage(ormEntity.language);
    }

    return userEntity;
  }

  /**
   * 将领域实体转换为ORM实体
   * @param domainEntity 领域实体
   * @returns ORM实体
   */
  toOrmEntity(domainEntity: UserEntity): Partial<UserOrmEntity> {
    return {
      id: domainEntity.id.toString(),
      username: domainEntity.username.toString(),
      email: domainEntity.email.toString(),
      tenantId: domainEntity.tenantId.toString(),
      organizationId: domainEntity.organizationId?.toString(),
      departmentIds: domainEntity.departmentIds?.map(id => id.toString()),
      status: domainEntity.status,
      userType: domainEntity.userType,
      dataPrivacyLevel: domainEntity.dataPrivacyLevel,
      dataIsolationLevel: domainEntity.dataIsolationLevel,
      displayName: domainEntity.displayName,
      phone: domainEntity.phone?.toString(),
      avatar: domainEntity.avatar,
      metadata: domainEntity.metadata,
      lastLoginAt: domainEntity.lastLoginAt,
      emailVerifiedAt: domainEntity.emailVerifiedAt,
      phoneVerifiedAt: domainEntity.phoneVerifiedAt,
      isEmailVerified: domainEntity.isEmailVerified,
      isPhoneVerified: domainEntity.isPhoneVerified,
      isMfaEnabled: domainEntity.isMfaEnabled,
      mfaConfig: domainEntity.mfaConfig,
      loginHistory: domainEntity.loginHistory,
      failedLoginAttempts: domainEntity.failedLoginAttempts,
      passwordResetToken: domainEntity.passwordResetToken,
      passwordResetExpiresAt: domainEntity.passwordResetExpiresAt,
      emailVerificationToken: domainEntity.emailVerificationToken,
      emailVerificationExpiresAt: domainEntity.emailVerificationExpiresAt,
      phoneVerificationToken: domainEntity.phoneVerificationToken,
      phoneVerificationExpiresAt: domainEntity.phoneVerificationExpiresAt,
      preferences: domainEntity.preferences,
      settings: domainEntity.settings,
      timezone: domainEntity.timezone,
      locale: domainEntity.locale,
      language: domainEntity.language,
      isActive: domainEntity.isActive,
      isDeleted: domainEntity.isDeleted,
      deletedAt: domainEntity.deletedAt,
      deletedBy: domainEntity.deletedBy?.toString(),
      deletionReason: domainEntity.deletionReason,
    };
  }

  /**
   * 将ORM实体转换为DTO
   * @param ormEntity ORM实体
   * @returns DTO对象
   */
  toDto(ormEntity: UserOrmEntity): any {
    return {
      id: ormEntity.id,
      username: ormEntity.username,
      email: ormEntity.email,
      tenantId: ormEntity.tenantId,
      organizationId: ormEntity.organizationId,
      departmentIds: ormEntity.departmentIds,
      status: ormEntity.status,
      userType: ormEntity.userType,
      dataPrivacyLevel: ormEntity.dataPrivacyLevel,
      dataIsolationLevel: ormEntity.dataIsolationLevel,
      displayName: ormEntity.displayName,
      phone: ormEntity.phone,
      avatar: ormEntity.avatar,
      metadata: ormEntity.metadata,
      createdAt: ormEntity.createdAt,
      updatedAt: ormEntity.updatedAt,
      lastLoginAt: ormEntity.lastLoginAt,
      emailVerifiedAt: ormEntity.emailVerifiedAt,
      phoneVerifiedAt: ormEntity.phoneVerifiedAt,
      isEmailVerified: ormEntity.isEmailVerified,
      isPhoneVerified: ormEntity.isPhoneVerified,
      isMfaEnabled: ormEntity.isMfaEnabled,
      mfaConfig: ormEntity.mfaConfig,
      loginHistory: ormEntity.loginHistory,
      failedLoginAttempts: ormEntity.failedLoginAttempts,
      passwordResetToken: ormEntity.passwordResetToken,
      passwordResetExpiresAt: ormEntity.passwordResetExpiresAt,
      emailVerificationToken: ormEntity.emailVerificationToken,
      emailVerificationExpiresAt: ormEntity.emailVerificationExpiresAt,
      phoneVerificationToken: ormEntity.phoneVerificationToken,
      phoneVerificationExpiresAt: ormEntity.phoneVerificationExpiresAt,
      preferences: ormEntity.preferences,
      settings: ormEntity.settings,
      timezone: ormEntity.timezone,
      locale: ormEntity.locale,
      language: ormEntity.language,
      isActive: ormEntity.isActive,
      isDeleted: ormEntity.isDeleted,
      deletedAt: ormEntity.deletedAt,
      deletedBy: ormEntity.deletedBy,
      deletionReason: ormEntity.deletionReason,
    };
  }
}
