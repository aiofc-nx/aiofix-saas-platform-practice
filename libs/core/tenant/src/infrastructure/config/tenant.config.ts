/**
 * @file tenant.config.ts
 * @description 租户模块配置
 * @since 1.0.0
 */

import { registerAs } from '@nestjs/config';
import { TenantType } from '../../domain/enums';

export interface TenantConfig {
  // 默认租户配置
  defaults: {
    maxUsers: number;
    maxOrganizations: number;
    maxStorageGB: number;
    subscriptionDays: number;
  };

  // 租户类型配置
  types: {
    [key in TenantType]: {
      maxUsers: number;
      maxOrganizations: number;
      maxStorageGB: number;
      advancedFeaturesEnabled: boolean;
      customizationEnabled: boolean;
      apiAccessEnabled: boolean;
      ssoEnabled: boolean;
      priceTier: string;
    };
  };

  // 功能开关
  features: {
    multiTenancy: boolean;
    dataIsolation: boolean;
    eventSourcing: boolean;
    auditLogging: boolean;
    configManagement: boolean;
  };

  // 安全配置
  security: {
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSpecialChars: boolean;
    };
    sessionTimeout: number; // 分钟
    maxLoginAttempts: number;
    lockoutDuration: number; // 分钟
  };

  // 通知配置
  notifications: {
    email: {
      enabled: boolean;
      fromAddress: string;
      templates: {
        tenantCreated: string;
        tenantActivated: string;
        tenantSuspended: string;
        tenantDeleted: string;
        configChanged: string;
      };
    };
    webhook: {
      enabled: boolean;
      endpoints: string[];
      retryAttempts: number;
      timeout: number;
    };
  };

  // 缓存配置
  cache: {
    enabled: boolean;
    ttl: number; // 秒
    maxSize: number;
    keyPrefix: string;
  };

  // 监控配置
  monitoring: {
    enabled: boolean;
    metrics: {
      tenantCount: boolean;
      tenantStatus: boolean;
      tenantUsage: boolean;
      performanceMetrics: boolean;
    };
    alerts: {
      tenantLimitReached: boolean;
      tenantSuspended: boolean;
      tenantDeleted: boolean;
      configChanged: boolean;
    };
  };
}

export const tenantConfig = registerAs(
  'tenant',
  (): TenantConfig => ({
    defaults: {
      maxUsers: 100,
      maxOrganizations: 10,
      maxStorageGB: 10,
      subscriptionDays: 30,
    },

    types: {
      [TenantType.ENTERPRISE]: {
        maxUsers: 10000,
        maxOrganizations: 100,
        maxStorageGB: 1000,
        advancedFeaturesEnabled: true,
        customizationEnabled: true,
        apiAccessEnabled: true,
        ssoEnabled: true,
        priceTier: 'enterprise',
      },
      [TenantType.ORGANIZATION]: {
        maxUsers: 1000,
        maxOrganizations: 10,
        maxStorageGB: 100,
        advancedFeaturesEnabled: false,
        customizationEnabled: false,
        apiAccessEnabled: true,
        ssoEnabled: false,
        priceTier: 'organization',
      },
      [TenantType.PARTNERSHIP]: {
        maxUsers: 500,
        maxOrganizations: 5,
        maxStorageGB: 50,
        advancedFeaturesEnabled: false,
        customizationEnabled: false,
        apiAccessEnabled: false,
        ssoEnabled: false,
        priceTier: 'partnership',
      },
      [TenantType.PERSONAL]: {
        maxUsers: 5,
        maxOrganizations: 1,
        maxStorageGB: 5,
        advancedFeaturesEnabled: false,
        customizationEnabled: false,
        apiAccessEnabled: false,
        ssoEnabled: false,
        priceTier: 'personal',
      },
    },

    features: {
      multiTenancy: true,
      dataIsolation: true,
      eventSourcing: true,
      auditLogging: true,
      configManagement: true,
    },

    security: {
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
      },
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      lockoutDuration: 15,
    },

    notifications: {
      email: {
        enabled: true,
        fromAddress: 'noreply@aiofix.com',
        templates: {
          tenantCreated: 'tenant-created',
          tenantActivated: 'tenant-activated',
          tenantSuspended: 'tenant-suspended',
          tenantDeleted: 'tenant-deleted',
          configChanged: 'tenant-config-changed',
        },
      },
      webhook: {
        enabled: false,
        endpoints: [],
        retryAttempts: 3,
        timeout: 5000,
      },
    },

    cache: {
      enabled: true,
      ttl: 300, // 5分钟
      maxSize: 1000,
      keyPrefix: 'tenant:',
    },

    monitoring: {
      enabled: true,
      metrics: {
        tenantCount: true,
        tenantStatus: true,
        tenantUsage: true,
        performanceMetrics: true,
      },
      alerts: {
        tenantLimitReached: true,
        tenantSuspended: true,
        tenantDeleted: true,
        configChanged: false,
      },
    },
  }),
);
