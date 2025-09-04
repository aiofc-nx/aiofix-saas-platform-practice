/**
 * @description MongoDB用户文档实体
 * @author 江郎
 * @since 2.1.0
 */

import { Entity, PrimaryKey, Property, Index } from '@mikro-orm/core';
import { UuidType } from '@mikro-orm/core';

@Entity({ collection: 'users' })
@Index({ properties: ['username'] })
@Index({ properties: ['email'] })
@Index({ properties: ['tenantId'] })
@Index({ properties: ['organizationId'] })
@Index({ properties: ['status'] })
export class UserDocument {
  @PrimaryKey({ type: UuidType })
  id!: string;

  @Property({ type: 'string', length: 100, nullable: false })
  username!: string;

  @Property({ type: 'string', length: 255, nullable: false })
  email!: string;

  @Property({ type: 'string', length: 255, nullable: false })
  passwordHash!: string;

  @Property({ type: UuidType, nullable: false })
  tenantId!: string;

  @Property({ type: UuidType, nullable: true })
  organizationId?: string;

  @Property({ type: 'array', nullable: true })
  departmentIds?: string[];

  @Property({ type: 'string', length: 50, nullable: false, default: 'ACTIVE' })
  status!: string;

  @Property({
    type: 'string',
    length: 50,
    nullable: false,
    default: 'TENANT_USER',
  })
  userType!: string;

  @Property({
    type: 'string',
    length: 50,
    nullable: false,
    default: 'PROTECTED',
  })
  dataPrivacyLevel!: string;

  @Property({ type: 'string', length: 50, nullable: false, default: 'USER' })
  dataIsolationLevel!: string;

  @Property({ type: 'string', length: 255, nullable: true })
  displayName?: string;

  @Property({ type: 'string', length: 20, nullable: true })
  phone?: string;

  @Property({ type: 'string', length: 255, nullable: true })
  avatar?: string;

  @Property({ type: 'object', nullable: true })
  metadata?: Record<string, unknown>;

  @Property({ type: 'date', defaultRaw: 'new Date()' })
  createdAt!: Date;

  @Property({
    type: 'date',
    defaultRaw: 'new Date()',
    onUpdate: () => new Date(),
  })
  updatedAt!: Date;

  @Property({ type: 'date', nullable: true })
  lastLoginAt?: Date;

  @Property({ type: 'date', nullable: true })
  emailVerifiedAt?: Date;

  @Property({ type: 'date', nullable: true })
  phoneVerifiedAt?: Date;

  @Property({ type: 'boolean', default: false })
  isEmailVerified!: boolean;

  @Property({ type: 'boolean', default: false })
  isPhoneVerified!: boolean;

  @Property({ type: 'boolean', default: false })
  isMfaEnabled!: boolean;

  @Property({ type: 'object', nullable: true })
  mfaConfig?: Record<string, unknown>;

  @Property({ type: 'array', nullable: true })
  loginHistory?: Array<{
    timestamp: Date;
    ipAddress: string;
    userAgent: string;
    success: boolean;
  }>;

  @Property({ type: 'array', nullable: true })
  failedLoginAttempts?: Array<{
    timestamp: Date;
    ipAddress: string;
    userAgent: string;
    reason: string;
  }>;

  @Property({ type: 'string', length: 255, nullable: true })
  passwordResetToken?: string;

  @Property({ type: 'date', nullable: true })
  passwordResetExpiresAt?: Date;

  @Property({ type: 'string', length: 255, nullable: true })
  emailVerificationToken?: string;

  @Property({ type: 'date', nullable: true })
  emailVerificationExpiresAt?: Date;

  @Property({ type: 'string', length: 255, nullable: true })
  phoneVerificationToken?: string;

  @Property({ type: 'date', nullable: true })
  phoneVerificationExpiresAt?: Date;

  @Property({ type: 'object', nullable: true })
  preferences?: Record<string, unknown>;

  @Property({ type: 'object', nullable: true })
  settings?: Record<string, unknown>;

  @Property({ type: 'string', length: 255, nullable: true })
  timezone?: string;

  @Property({ type: 'string', length: 10, nullable: true })
  locale?: string;

  @Property({ type: 'string', length: 50, nullable: true })
  language?: string;

  @Property({ type: 'boolean', default: true })
  isActive!: boolean;

  @Property({ type: 'boolean', default: false })
  isDeleted!: boolean;

  @Property({ type: 'date', nullable: true })
  deletedAt?: Date;

  @Property({ type: 'string', length: 255, nullable: true })
  deletedBy?: string;

  @Property({ type: 'string', nullable: true })
  deletionReason?: string;
}
