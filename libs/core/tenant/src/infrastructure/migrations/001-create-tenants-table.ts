/**
 * @file 001-create-tenants-table.ts
 * @description 创建租户表的数据库迁移
 * @since 1.0.0
 */

import { Migration } from '@mikro-orm/migrations';

export class Migration20241219001 extends Migration {
  async up(): Promise<void> {
    this.addSql(`
      CREATE TABLE tenants (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(50) NOT NULL UNIQUE,
        domain VARCHAR(255) NOT NULL UNIQUE,
        type VARCHAR(20) NOT NULL CHECK (type IN ('ENTERPRISE', 'ORGANIZATION', 'PARTNERSHIP', 'PERSONAL')),
        status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'MAINTENANCE', 'DELETED', 'PENDING')),
        description TEXT,
        
        -- 租户限制配置
        max_users INTEGER NOT NULL DEFAULT 100,
        max_organizations INTEGER NOT NULL DEFAULT 10,
        max_storage_gb INTEGER NOT NULL DEFAULT 10,
        
        -- 功能开关
        advanced_features_enabled BOOLEAN NOT NULL DEFAULT false,
        customization_enabled BOOLEAN NOT NULL DEFAULT false,
        api_access_enabled BOOLEAN NOT NULL DEFAULT false,
        sso_enabled BOOLEAN NOT NULL DEFAULT false,
        
        -- 订阅信息
        subscription_start_date TIMESTAMP,
        subscription_end_date TIMESTAMP,
        subscription_expires_at TIMESTAMP,
        
        -- 配置信息 (JSON)
        config JSONB DEFAULT '{}',
        
        -- 数据隔离配置
        data_isolation_level VARCHAR(20) NOT NULL DEFAULT 'TENANT' CHECK (data_isolation_level IN ('PLATFORM', 'TENANT', 'ORGANIZATION', 'DEPARTMENT', 'USER')),
        data_privacy_level VARCHAR(20) NOT NULL DEFAULT 'PROTECTED' CHECK (data_privacy_level IN ('PUBLIC', 'PROTECTED', 'PRIVATE', 'CONFIDENTIAL')),
        
        -- 审计字段
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        created_by VARCHAR(36),
        updated_by VARCHAR(36),
        
        -- 软删除
        deleted_at TIMESTAMP,
        deleted_by VARCHAR(36)
      );
    `);

    // 创建索引
    this.addSql(`
      CREATE INDEX idx_tenants_code ON tenants(code);
      CREATE INDEX idx_tenants_domain ON tenants(domain);
      CREATE INDEX idx_tenants_type ON tenants(type);
      CREATE INDEX idx_tenants_status ON tenants(status);
      CREATE INDEX idx_tenants_created_at ON tenants(created_at);
      CREATE INDEX idx_tenants_updated_at ON tenants(updated_at);
      CREATE INDEX idx_tenants_deleted_at ON tenants(deleted_at);
      CREATE INDEX idx_tenants_data_isolation ON tenants(data_isolation_level);
      CREATE INDEX idx_tenants_subscription ON tenants(subscription_expires_at);
    `);

    // 创建复合索引
    this.addSql(`
      CREATE INDEX idx_tenants_status_type ON tenants(status, type);
      CREATE INDEX idx_tenants_created_by_status ON tenants(created_by, status);
    `);

    // 创建触发器用于自动更新 updated_at
    this.addSql(`
      CREATE OR REPLACE FUNCTION update_tenants_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
      
      CREATE TRIGGER trigger_update_tenants_updated_at
        BEFORE UPDATE ON tenants
        FOR EACH ROW
        EXECUTE FUNCTION update_tenants_updated_at();
    `);
  }

  async down(): Promise<void> {
    this.addSql(
      `DROP TRIGGER IF EXISTS trigger_update_tenants_updated_at ON tenants;`,
    );
    this.addSql(`DROP FUNCTION IF EXISTS update_tenants_updated_at();`);
    this.addSql(`DROP TABLE IF EXISTS tenants;`);
  }
}
