/**
 * @file index.ts
 * @description 通知领域模块入口文件
 *
 * 该文件是通知领域模块的主要入口点，提供：
 * - 邮件通知子领域
 * - 短信通知子领域
 * - 推送通知子领域
 * - Webhook通知子领域
 * - 模板子领域
 *
 * 遵循DDD原则，按子领域组织代码结构。
 */

// 导出邮件通知子领域
export * from './email/domain/entities/email-notification.entity';
// export * from './email/domain/value-objects'; // 值对象已移到共享领域

// 导出短信通知子领域
export * from './sms/domain/entities/sms-notification.entity';
// export * from './sms/domain/value-objects'; // 值对象已移到共享领域

// 导出推送通知子领域
export * from './push/domain/entities/push-notification.entity';
// export * from './push/domain/value-objects'; // 值对象已移到共享领域

// 导出Webhook通知子领域
export * from './webhook/domain/entities/webhook-notification.entity';
// export * from './webhook/domain/value-objects'; // 值对象已移到共享领域

// 导出模板子领域
export * from './template/domain/entities/template.entity';
export * from './template/domain/repositories/template-repository.interface';
export * from './template/domain/services/template.service';
// export * from './template/domain/value-objects'; // 值对象已移到共享领域
