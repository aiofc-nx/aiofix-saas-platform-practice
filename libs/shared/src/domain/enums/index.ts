/**
 * @fileoverview
 * 共享领域模块 - 枚举导出
 *
 * 枚举定义领域中的固定值集合。
 * 枚举提供类型安全和业务语义。
 */

// 数据隔离相关枚举
export {
  DataIsolationLevel,
  DataPrivacyLevel,
} from '../entities/data-isolation-aware.entity';

// 通知相关枚举 - 从 types 目录导入
export {
  NotificationType,
  NotificationStatus,
  NotificationPriority,
  TemplateStatus,
  NotificationFrequency,
} from '../../types/notification.types';
