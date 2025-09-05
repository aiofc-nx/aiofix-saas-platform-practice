/**
 * @class UpdateTenantConfigUseCase
 * @description
 * 更新租户配置用例，负责处理租户配置变更的业务逻辑。
 *
 * 原理与机制：
 * 1. 验证租户当前状态是否允许配置变更
 * 2. 验证新配置的有效性
 * 3. 执行租户配置更新操作
 * 4. 发布租户配置变更事件
 *
 * 功能与职责：
 * 1. 验证租户配置变更的业务规则
 * 2. 验证配置数据的有效性
 * 3. 执行租户配置更新操作
 * 4. 发布领域事件
 * 5. 返回标准化的响应
 *
 * @example
 * ```typescript
 * const useCase = new UpdateTenantConfigUseCase(
 *   tenantRepository,
 *   eventBus,
 *   logger
 * );
 *
 * const result = await useCase.execute({
 *   tenantId: 'tenant-123',
 *   config: { theme: 'dark', language: 'zh-CN' },
 *   updatedBy: 'admin-456'
 * });
 * ```
 * @since 1.0.0
 */

import { Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { PinoLoggerService } from '@aiofix/logging';
import { LogContext } from '@aiofix/logging';
import { ITenantRepository } from '../../domain/repositories/tenant.repository';
import { TenantId } from '@aiofix/shared';
import { TenantConfigChangedEvent } from '../../domain/domain-events';
import { TenantStatus } from '../../domain/enums/tenant-status.enum';

/**
 * 租户配置接口
 */
export interface TenantConfig {
  theme?: string;
  language?: string;
  timezone?: string;
  dateFormat?: string;
  currency?: string;
  features?: Record<string, boolean>;
  limits?: Record<string, number>;
  customSettings?: Record<string, unknown>;
}

/**
 * 更新租户配置请求接口
 */
export interface UpdateTenantConfigRequest {
  tenantId: string;
  config: TenantConfig;
  updatedBy: string;
  updatedAt?: Date;
}

/**
 * 更新租户配置响应接口
 */
export interface UpdateTenantConfigResponse {
  success: boolean;
  tenantId?: string;
  message: string;
  error?: string;
}

/**
 * 更新租户配置用例类
 * @description 处理租户配置变更的业务逻辑
 */
@Injectable()
export class UpdateTenantConfigUseCase {
  constructor(
    private readonly tenantRepository: ITenantRepository,
    private readonly eventBus: EventBus,
    private readonly logger: PinoLoggerService,
  ) {}

  /**
   * 执行更新租户配置用例
   * @param request 更新请求
   * @returns 更新结果
   */
  async execute(
    request: UpdateTenantConfigRequest,
  ): Promise<UpdateTenantConfigResponse> {
    try {
      this.logger.info(
        `Executing UpdateTenantConfigUseCase for tenant: ${request.tenantId}`,
        LogContext.BUSINESS,
        { request },
      );

      // 1. 验证请求
      this.validateRequest(request);

      // 2. 获取租户聚合根
      const tenantId = new TenantId(request.tenantId);
      const tenantAggregate = await this.tenantRepository.findById(tenantId);

      if (!tenantAggregate) {
        return {
          success: false,
          error: '租户不存在',
          message: '更新租户配置失败：租户不存在',
        };
      }

      // 3. 检查租户状态
      const currentStatus = tenantAggregate.getTenantStatus();
      if (currentStatus === TenantStatus.DELETED) {
        return {
          success: false,
          error: '无法更新已删除租户的配置',
          message: '更新租户配置失败：无法更新已删除租户的配置',
        };
      }

      // 4. 验证配置数据
      this.validateConfig(request.config);

      // 5. 获取当前配置
      const currentConfig = tenantAggregate.getTenantConfig();

      // 6. 执行配置更新操作
      tenantAggregate.updateConfig(request.config as Record<string, unknown>);

      // 7. 保存到仓储
      await this.tenantRepository.save(tenantAggregate);

      // 8. 发布领域事件
      await this.eventBus.publish(
        new TenantConfigChangedEvent(
          request.tenantId,
          currentConfig,
          request.config as Record<string, unknown>,
        ),
      );

      this.logger.info(
        `Successfully updated tenant config: ${request.tenantId}`,
        LogContext.BUSINESS,
      );

      return {
        success: true,
        tenantId: request.tenantId,
        message: '租户配置更新成功',
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to execute UpdateTenantConfigUseCase: ${errorMessage}`,
        LogContext.BUSINESS,
        { error: errorMessage, request },
      );

      return {
        success: false,
        error: errorMessage,
        message: '更新租户配置失败',
      };
    }
  }

  /**
   * 验证请求参数
   * @param request 更新请求
   */
  private validateRequest(request: UpdateTenantConfigRequest): void {
    if (!request.tenantId || request.tenantId.trim().length === 0) {
      throw new Error('租户ID不能为空');
    }

    if (!request.config || Object.keys(request.config).length === 0) {
      throw new Error('配置数据不能为空');
    }

    if (!request.updatedBy || request.updatedBy.trim().length === 0) {
      throw new Error('操作人不能为空');
    }
  }

  /**
   * 验证配置数据的有效性
   * @param config 租户配置
   */
  private validateConfig(config: TenantConfig): void {
    // 验证主题
    if (config.theme && !['light', 'dark', 'auto'].includes(config.theme)) {
      throw new Error('无效的主题设置，支持的值：light, dark, auto');
    }

    // 验证语言
    if (config.language && !this.isValidLanguage(config.language)) {
      throw new Error('无效的语言设置');
    }

    // 验证时区
    if (config.timezone && !this.isValidTimezone(config.timezone)) {
      throw new Error('无效的时区设置');
    }

    // 验证日期格式
    if (config.dateFormat && !this.isValidDateFormat(config.dateFormat)) {
      throw new Error('无效的日期格式设置');
    }

    // 验证货币
    if (config.currency && !this.isValidCurrency(config.currency)) {
      throw new Error('无效的货币设置');
    }

    // 验证功能开关
    if (config.features) {
      for (const [key, value] of Object.entries(config.features)) {
        if (typeof value !== 'boolean') {
          throw new Error(`功能开关 ${key} 的值必须是布尔类型`);
        }
      }
    }

    // 验证限制设置
    if (config.limits) {
      for (const [key, value] of Object.entries(config.limits)) {
        if (typeof value !== 'number' || value < 0) {
          throw new Error(`限制设置 ${key} 的值必须是非负数`);
        }
      }
    }
  }

  /**
   * 验证语言代码是否有效
   * @param language 语言代码
   * @returns 是否有效
   */
  private isValidLanguage(language: string): boolean {
    const validLanguages = [
      'zh-CN',
      'zh-TW',
      'en-US',
      'en-GB',
      'ja-JP',
      'ko-KR',
      'fr-FR',
      'de-DE',
      'es-ES',
      'pt-BR',
    ];
    return validLanguages.includes(language);
  }

  /**
   * 验证时区是否有效
   * @param timezone 时区
   * @returns 是否有效
   */
  private isValidTimezone(timezone: string): boolean {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: timezone });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 验证日期格式是否有效
   * @param dateFormat 日期格式
   * @returns 是否有效
   */
  private isValidDateFormat(dateFormat: string): boolean {
    const validFormats = [
      'YYYY-MM-DD',
      'MM/DD/YYYY',
      'DD/MM/YYYY',
      'DD-MM-YYYY',
    ];
    return validFormats.includes(dateFormat);
  }

  /**
   * 验证货币代码是否有效
   * @param currency 货币代码
   * @returns 是否有效
   */
  private isValidCurrency(currency: string): boolean {
    const validCurrencies = ['CNY', 'USD', 'EUR', 'JPY', 'GBP', 'KRW', 'HKD'];
    return validCurrencies.includes(currency);
  }
}
