/**
 * @file 002-create-tenants-mongodb-collection.ts
 * @description 创建租户MongoDB集合的迁移
 * @since 1.0.0
 */

import { Migration } from '@mikro-orm/migrations';

export class Migration20241219002 extends Migration {
  async up(): Promise<void> {
    // MongoDB集合会在第一次插入数据时自动创建
    // 这里我们创建索引来优化查询性能

    this.addSql(`
      db.tenants.createIndex(
        {
          "tenantId": 1
        },
        {
          "unique": true,
          "name": "idx_tenant_id_unique"
        }
      );
    `);

    this.addSql(`
      db.tenants.createIndex(
        {
          "code": 1
        },
        {
          "unique": true,
          "name": "idx_code_unique"
        }
      );
    `);

    this.addSql(`
      db.tenants.createIndex(
        {
          "domain": 1
        },
        {
          "unique": true,
          "name": "idx_domain_unique"
        }
      );
    `);

    this.addSql(`
      db.tenants.createIndex(
        {
          "name": 1
        },
        {
          "name": "idx_name"
        }
      );
    `);

    this.addSql(`
      db.tenants.createIndex(
        {
          "type": 1
        },
        {
          "name": "idx_type"
        }
      );
    `);

    this.addSql(`
      db.tenants.createIndex(
        {
          "status": 1
        },
        {
          "name": "idx_status"
        }
      );
    `);

    this.addSql(`
      db.tenants.createIndex(
        {
          "createdAt": -1
        },
        {
          "name": "idx_created_at_desc"
        }
      );
    `);

    this.addSql(`
      db.tenants.createIndex(
        {
          "updatedAt": -1
        },
        {
          "name": "idx_updated_at_desc"
        }
      );
    `);

    // 复合索引
    this.addSql(`
      db.tenants.createIndex(
        {
          "status": 1,
          "type": 1
        },
        {
          "name": "idx_status_type"
        }
      );
    `);

    this.addSql(`
      db.tenants.createIndex(
        {
          "type": 1,
          "status": 1,
          "createdAt": -1
        },
        {
          "name": "idx_type_status_created"
        }
      );
    `);

    // 文本搜索索引
    this.addSql(`
      db.tenants.createIndex(
        {
          "name": "text",
          "description": "text"
        },
        {
          "name": "idx_text_search",
          "default_language": "none"
        }
      );
    `);

    // 部分索引 - 只对活跃租户创建索引
    this.addSql(`
      db.tenants.createIndex(
        {
          "subscriptionExpiresAt": 1
        },
        {
          "name": "idx_subscription_expires",
          "partialFilterExpression": {
            "status": "ACTIVE"
          }
        }
      );
    `);

    // TTL索引 - 自动删除已删除的租户记录（30天后）
    this.addSql(`
      db.tenants.createIndex(
        {
          "deletedAt": 1
        },
        {
          "name": "idx_deleted_at_ttl",
          "expireAfterSeconds": 2592000,
          "partialFilterExpression": {
            "status": "DELETED"
          }
        }
      );
    `);
  }

  async down(): Promise<void> {
    this.addSql(`db.tenants.dropIndex("idx_tenant_id_unique");`);
    this.addSql(`db.tenants.dropIndex("idx_code_unique");`);
    this.addSql(`db.tenants.dropIndex("idx_domain_unique");`);
    this.addSql(`db.tenants.dropIndex("idx_name");`);
    this.addSql(`db.tenants.dropIndex("idx_type");`);
    this.addSql(`db.tenants.dropIndex("idx_status");`);
    this.addSql(`db.tenants.dropIndex("idx_created_at_desc");`);
    this.addSql(`db.tenants.dropIndex("idx_updated_at_desc");`);
    this.addSql(`db.tenants.dropIndex("idx_status_type");`);
    this.addSql(`db.tenants.dropIndex("idx_type_status_created");`);
    this.addSql(`db.tenants.dropIndex("idx_text_search");`);
    this.addSql(`db.tenants.dropIndex("idx_subscription_expires");`);
    this.addSql(`db.tenants.dropIndex("idx_deleted_at_ttl");`);
  }
}
