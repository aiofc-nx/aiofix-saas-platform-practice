/**
 * @description MongoDB用户档案文档实体
 * @author 江郎
 * @since 2.1.0
 */

import { Entity, PrimaryKey, Property, Index } from '@mikro-orm/core';
import { UuidType } from '@mikro-orm/core';

@Entity({ collection: 'user_profiles' })
@Index({ properties: ['userId'] })
export class UserProfileDocument {
  @PrimaryKey({ type: UuidType })
  id!: string;

  @Property({ type: UuidType, nullable: false })
  userId!: string;

  @Property({ type: 'string', length: 255, nullable: true })
  displayName?: string;

  @Property({ type: 'string', nullable: true })
  bio?: string;

  @Property({ type: 'string', length: 255, nullable: true })
  avatar?: string;

  @Property({ type: 'string', length: 255, nullable: true })
  location?: string;

  @Property({ type: 'string', length: 255, nullable: true })
  website?: string;

  @Property({ type: 'object', nullable: true })
  preferences?: Record<string, unknown>;

  @Property({ type: 'object', nullable: true })
  socialLinks?: Record<string, unknown>;

  @Property({ type: 'string', length: 20, nullable: true })
  phone?: string;

  @Property({ type: 'string', length: 255, nullable: true })
  company?: string;

  @Property({ type: 'string', length: 255, nullable: true })
  jobTitle?: string;

  @Property({ type: 'string', length: 255, nullable: true })
  department?: string;

  @Property({ type: 'string', length: 255, nullable: true })
  manager?: string;

  @Property({ type: 'date', nullable: true })
  hireDate?: Date;

  @Property({ type: 'date', nullable: true })
  birthDate?: Date;

  @Property({ type: 'string', length: 255, nullable: true })
  emergencyContact?: string;

  @Property({ type: 'string', length: 255, nullable: true })
  emergencyPhone?: string;

  @Property({ type: 'array', nullable: true })
  skills?: string[];

  @Property({ type: 'array', nullable: true })
  certifications?: string[];

  @Property({ type: 'array', nullable: true })
  languages?: string[];

  @Property({ type: 'string', length: 255, nullable: true })
  timezone?: string;

  @Property({ type: 'string', length: 10, nullable: true })
  locale?: string;

  @Property({ type: 'string', length: 50, nullable: true })
  language?: string;

  @Property({ type: 'boolean', default: true })
  isActive!: boolean;

  @Property({ type: 'date', defaultRaw: 'new Date()' })
  createdAt!: Date;

  @Property({
    type: 'date',
    defaultRaw: 'new Date()',
    onUpdate: () => new Date(),
  })
  updatedAt!: Date;

  @Property({ type: 'boolean', default: false })
  isDeleted!: boolean;

  @Property({ type: 'date', nullable: true })
  deletedAt?: Date;

  @Property({ type: 'string', length: 255, nullable: true })
  deletedBy?: string;

  @Property({ type: 'string', nullable: true })
  deletionReason?: string;
}
