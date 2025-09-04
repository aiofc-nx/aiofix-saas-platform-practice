/**
 * @description PostgreSQL用户ORM实体
 * @author 江郎
 * @since 2.1.0
 */

import { Entity, PrimaryKey, Property, Index } from '@mikro-orm/core';
import { UuidType } from '@mikro-orm/core';

@Entity({ tableName: 'users' })
@Index({ properties: ['username', 'tenantId'] })
@Index({ properties: ['email', 'tenantId'] })
@Index({ properties: ['tenantId'] })
@Index({ properties: ['organizationId'] })
@Index({ properties: ['status'] })
export class UserOrmEntity {
  @PrimaryKey({ type: UuidType })
  id!: string;

  @Property({ type: 'varchar', length: 100, nullable: false })
  username!: string;

  @Property({ type: 'varchar', length: 255, nullable: false })
  email!: string;

  @Property({ type: 'varchar', length: 255, nullable: false })
  passwordHash!: string;

  @Property({ type: UuidType, nullable: false })
  tenantId!: string;

  @Property({ type: UuidType, nullable: true })
  organizationId?: string;

  @Property({ type: 'jsonb', nullable: true })
  departmentIds?: string[];

  @Property({ type: 'varchar', length: 50, nullable: false, default: 'ACTIVE' })
  status!: string;

  @Property({
    type: 'varchar',
    length: 50,
    nullable: false,
    default: 'TENANT_USER',
  })
  userType!: string;

  @Property({
    type: 'varchar',
    length: 50,
    nullable: false,
    default: 'PROTECTED',
  })
  dataPrivacyLevel!: string;

  @Property({ type: 'varchar', length: 50, nullable: false, default: 'USER' })
  dataIsolationLevel!: string;

  @Property({ type: 'varchar', length: 255, nullable: true })
  displayName?: string;

  @Property({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @Property({ type: 'varchar', length: 255, nullable: true })
  avatar?: string;

  @Property({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;

  @Property({ type: 'timestamp', defaultRaw: 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Property({
    type: 'timestamp',
    defaultRaw: 'CURRENT_TIMESTAMP',
    onUpdate: () => new Date(),
  })
  updatedAt!: Date;

  @Property({ type: 'timestamp', nullable: true })
  lastLoginAt?: Date;

  @Property({ type: 'timestamp', nullable: true })
  emailVerifiedAt?: Date;

  @Property({ type: 'timestamp', nullable: true })
  phoneVerifiedAt?: Date;

  @Property({ type: 'boolean', default: false })
  isEmailVerified!: boolean;

  @Property({ type: 'boolean', default: false })
  isPhoneVerified!: boolean;

  @Property({ type: 'boolean', default: false })
  isMfaEnabled!: boolean;

  @Property({ type: 'jsonb', nullable: true })
  mfaConfig?: Record<string, unknown>;

  @Property({ type: 'jsonb', nullable: true })
  loginHistory?: Array<{
    timestamp: Date;
    ipAddress: string;
    userAgent: string;
    success: boolean;
  }>;

  @Property({ type: 'jsonb', nullable: true })
  failedLoginAttempts?: Array<{
    timestamp: Date;
    ipAddress: string;
    userAgent: string;
    reason: string;
  }>;

  @Property({ type: 'varchar', length: 255, nullable: true })
  passwordResetToken?: string;

  @Property({ type: 'timestamp', nullable: true })
  passwordResetExpiresAt?: Date;

  @Property({ type: 'varchar', length: 255, nullable: true })
  emailVerificationToken?: string;

  @Property({ type: 'timestamp', nullable: true })
  emailVerificationExpiresAt?: Date;

  @Property({ type: 'varchar', length: 255, nullable: true })
  phoneVerificationToken?: string;

  @Property({ type: 'timestamp', nullable: true })
  phoneVerificationExpiresAt?: Date;

  @Property({ type: 'jsonb', nullable: true })
  preferences?: Record<string, unknown>;

  @Property({ type: 'jsonb', nullable: true })
  settings?: Record<string, unknown>;

  @Property({ type: 'varchar', length: 255, nullable: true })
  timezone?: string;

  @Property({ type: 'varchar', length: 10, nullable: true })
  locale?: string;

  @Property({ type: 'varchar', length: 50, nullable: true })
  language?: string;

  @Property({ type: 'boolean', default: true })
  isActive!: boolean;

  @Property({ type: 'boolean', default: false })
  isDeleted!: boolean;

  @Property({ type: 'timestamp', nullable: true })
  deletedAt?: Date;

  @Property({ type: 'varchar', length: 255, nullable: true })
  deletedBy?: string;

  @Property({ type: 'text', nullable: true })
  deletionReason?: string;
}
