/**
 * @description PostgreSQL用户档案ORM实体
 * @author 技术架构师
 * @since 2.1.0
 */

import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { UuidType } from '@mikro-orm/core';

@Entity({ tableName: 'user_profiles' })
export class UserProfileOrmEntity {
  @PrimaryKey({ type: UuidType })
  id!: string;

  @Property({ type: UuidType, nullable: false })
  userId!: string;

  @Property({ type: 'varchar', length: 255, nullable: true })
  displayName?: string;

  @Property({ type: 'text', nullable: true })
  bio?: string;

  @Property({ type: 'varchar', length: 255, nullable: true })
  avatar?: string;

  @Property({ type: 'varchar', length: 255, nullable: true })
  location?: string;

  @Property({ type: 'varchar', length: 255, nullable: true })
  website?: string;

  @Property({ type: 'jsonb', nullable: true })
  preferences?: Record<string, unknown>;

  @Property({ type: 'varchar', length: 255, nullable: true })
  phone?: string;

  @Property({ type: 'varchar', length: 255, nullable: true })
  company?: string;

  @Property({ type: 'varchar', length: 255, nullable: true })
  jobTitle?: string;

  @Property({ type: 'varchar', length: 255, nullable: true })
  department?: string;

  @Property({ type: 'varchar', length: 255, nullable: true })
  manager?: string;

  @Property({ type: 'date', nullable: true })
  hireDate?: Date;

  @Property({ type: 'date', nullable: true })
  birthDate?: Date;

  @Property({ type: 'varchar', length: 255, nullable: true })
  emergencyContact?: string;

  @Property({ type: 'varchar', length: 255, nullable: true })
  emergencyPhone?: string;

  @Property({ type: 'jsonb', nullable: true })
  skills?: string[];

  @Property({ type: 'jsonb', nullable: true })
  certifications?: string[];

  @Property({ type: 'jsonb', nullable: true })
  languages?: string[];

  @Property({ type: 'varchar', length: 255, nullable: true })
  timezone?: string;

  @Property({ type: 'varchar', length: 10, nullable: true })
  locale?: string;

  @Property({ type: 'varchar', length: 50, nullable: true })
  language?: string;

  @Property({ type: 'boolean', default: true })
  isActive!: boolean;

  @Property({ type: 'timestamp', defaultRaw: 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Property({
    type: 'timestamp',
    defaultRaw: 'CURRENT_TIMESTAMP',
    onUpdate: () => new Date(),
  })
  updatedAt!: Date;
}
