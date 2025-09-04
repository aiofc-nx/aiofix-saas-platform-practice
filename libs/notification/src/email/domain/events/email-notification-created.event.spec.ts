/**
 * @file email-notification-created.event.spec.ts
 * @description 邮件通知创建事件单元测试
 */

import { EmailNotificationCreatedEvent } from './email-notification-created.event';
import {
  NotificationType,
  NotificationStatus,
  NotificationPriority,
} from '@aiofix/shared';

describe('EmailNotificationCreatedEvent', () => {
  let event: EmailNotificationCreatedEvent;
  let notificationId: string;
  let tenantId: string;
  let templateId: string;
  let recipients: string[];
  let data: Record<string, unknown>;
  let priority: NotificationPriority;
  let status: NotificationStatus;
  let subject: string;
  let scheduledAt: Date;
  let metadata: Record<string, unknown>;
  let operatorId: string;

  beforeEach(() => {
    notificationId = 'notification-123';
    tenantId = 'tenant-123';
    templateId = 'template-123';
    recipients = ['user1@example.com', 'user2@example.com'];
    data = { userName: '张三', company: '测试公司' };
    priority = NotificationPriority.HIGH;
    status = NotificationStatus.PENDING;
    subject = '测试邮件主题';
    scheduledAt = new Date('2024-12-25T10:00:00Z');
    metadata = { source: 'system', category: 'notification' };
    operatorId = 'operator-123';
  });

  describe('创建事件', () => {
    it('应该成功创建事件实例', () => {
      event = new EmailNotificationCreatedEvent(
        notificationId,
        tenantId,
        templateId,
        recipients,
        data,
        priority,
        status,
        subject,
        scheduledAt,
        metadata,
        operatorId,
      );

      expect(event.notificationId).toBe(notificationId);
      expect(event.tenantId).toBe(tenantId);
      expect(event.type).toBe(NotificationType.EMAIL);
      expect(event.templateId).toBe(templateId);
      expect(event.recipients).toEqual(recipients);
      expect(event.subject).toBe(subject);
      expect(event.data).toEqual(data);
      expect(event.priority).toBe(priority);
      expect(event.status).toBe(status);
      expect(event.scheduledAt).toEqual(scheduledAt);
      expect(event.eventMetadata).toEqual(metadata);
    });

    it('应该成功创建不带主题的事件', () => {
      event = new EmailNotificationCreatedEvent(
        notificationId,
        tenantId,
        templateId,
        recipients,
        data,
        priority,
        status,
        undefined,
        scheduledAt,
        metadata,
        operatorId,
      );

      expect(event.subject).toBeUndefined();
    });

    it('应该成功创建不带计划时间的事件', () => {
      event = new EmailNotificationCreatedEvent(
        notificationId,
        tenantId,
        templateId,
        recipients,
        data,
        priority,
        status,
        subject,
        undefined,
        metadata,
        operatorId,
      );

      expect(event.scheduledAt).toBeUndefined();
    });

    it('应该成功创建不带元数据的事件', () => {
      event = new EmailNotificationCreatedEvent(
        notificationId,
        tenantId,
        templateId,
        recipients,
        data,
        priority,
        status,
        subject,
        scheduledAt,
        undefined,
        operatorId,
      );

      expect(event.eventMetadata).toEqual({});
    });

    it('应该成功创建不带操作者ID的事件', () => {
      event = new EmailNotificationCreatedEvent(
        notificationId,
        tenantId,
        templateId,
        recipients,
        data,
        priority,
        status,
        subject,
        scheduledAt,
        metadata,
      );

      expect(event.eventMetadata).toEqual(metadata);
    });

    it('应该成功创建最小参数的事件', () => {
      event = new EmailNotificationCreatedEvent(
        notificationId,
        tenantId,
        templateId,
        recipients,
        data,
        priority,
        status,
      );

      expect(event.notificationId).toBe(notificationId);
      expect(event.tenantId).toBe(tenantId);
      expect(event.templateId).toBe(templateId);
      expect(event.recipients).toEqual(recipients);
      expect(event.data).toEqual(data);
      expect(event.priority).toBe(priority);
      expect(event.status).toBe(status);
      expect(event.subject).toBeUndefined();
      expect(event.scheduledAt).toBeUndefined();
      expect(event.eventMetadata).toEqual({});
    });
  });

  describe('事件属性', () => {
    beforeEach(() => {
      event = new EmailNotificationCreatedEvent(
        notificationId,
        tenantId,
        templateId,
        recipients,
        data,
        priority,
        status,
        subject,
        scheduledAt,
        metadata,
        operatorId,
      );
    });

    it('应该正确设置所有属性', () => {
      expect(event.notificationId).toBe(notificationId);
      expect(event.tenantId).toBe(tenantId);
      expect(event.type).toBe(NotificationType.EMAIL);
      expect(event.templateId).toBe(templateId);
      expect(event.recipients).toEqual(recipients);
      expect(event.subject).toBe(subject);
      expect(event.data).toEqual(data);
      expect(event.priority).toBe(priority);
      expect(event.status).toBe(status);
      expect(event.scheduledAt).toEqual(scheduledAt);
      expect(event.eventMetadata).toEqual(metadata);
    });

    it('应该正确设置事件类型', () => {
      expect(event.type).toBe(NotificationType.EMAIL);
    });

    it('应该正确设置收件人列表', () => {
      expect(event.recipients).toEqual(recipients);
      expect(event.recipients).not.toBe(recipients); // 应该是副本
    });

    it('应该正确设置数据', () => {
      expect(event.data).toEqual(data);
      expect(event.data).not.toBe(data); // 应该是副本
    });

    it('应该正确设置元数据', () => {
      expect(event.eventMetadata).toEqual(metadata);
      expect(event.eventMetadata).not.toBe(metadata); // 应该是副本
    });
  });

  describe('事件数据序列化', () => {
    beforeEach(() => {
      event = new EmailNotificationCreatedEvent(
        notificationId,
        tenantId,
        templateId,
        recipients,
        data,
        priority,
        status,
        subject,
        scheduledAt,
        metadata,
        operatorId,
      );
    });

    it('应该正确序列化事件数据', () => {
      const eventData = event.getEventData();

      expect(eventData).toEqual({
        notificationId,
        tenantId,
        type: NotificationType.EMAIL,
        templateId,
        recipients,
        subject,
        data,
        priority,
        status,
        scheduledAt: scheduledAt.toISOString(),
        metadata,
      });
    });

    it('应该处理undefined值的序列化', () => {
      const eventWithoutOptionals = new EmailNotificationCreatedEvent(
        notificationId,
        tenantId,
        templateId,
        recipients,
        data,
        priority,
        status,
      );

      const eventData = eventWithoutOptionals.getEventData();

      expect(eventData).toEqual({
        notificationId,
        tenantId,
        type: NotificationType.EMAIL,
        templateId,
        recipients,
        subject: undefined,
        data,
        priority,
        status,
        scheduledAt: undefined,
        metadata: {},
      });
    });
  });

  describe('事件继承', () => {
    beforeEach(() => {
      event = new EmailNotificationCreatedEvent(
        notificationId,
        tenantId,
        templateId,
        recipients,
        data,
        priority,
        status,
        subject,
        scheduledAt,
        metadata,
        operatorId,
      );
    });

    it('应该继承BaseEvent的基本属性', () => {
      expect(event.occurredOn).toBeInstanceOf(Date);
      expect(event.eventId).toBeDefined();
      expect(event.eventVersion).toBe('1.0.0');
      expect(event.eventType).toBe('EmailNotificationCreatedEvent');
      expect(event.metadata).toEqual({});
    });

    it('应该生成唯一的事件ID', () => {
      const event2 = new EmailNotificationCreatedEvent(
        'notification-456',
        tenantId,
        templateId,
        recipients,
        data,
        priority,
        status,
      );

      expect(event.eventId).not.toBe(event2.eventId);
    });

    it('应该设置正确的事件类型名称', () => {
      expect(event.eventType).toBe('EmailNotificationCreatedEvent');
    });
  });

  describe('静态创建方法', () => {
    it('应该通过静态方法创建事件', () => {
      event = EmailNotificationCreatedEvent.create(
        notificationId,
        tenantId,
        templateId,
        recipients,
        data,
        priority,
        status,
        subject,
        scheduledAt,
        metadata,
        operatorId,
      );

      expect(event).toBeInstanceOf(EmailNotificationCreatedEvent);
      expect(event.notificationId).toBe(notificationId);
      expect(event.tenantId).toBe(tenantId);
      expect(event.templateId).toBe(templateId);
    });

    it('应该通过静态方法创建最小参数事件', () => {
      event = EmailNotificationCreatedEvent.create(
        notificationId,
        tenantId,
        templateId,
        recipients,
        data,
        priority,
        status,
      );

      expect(event).toBeInstanceOf(EmailNotificationCreatedEvent);
      expect(event.notificationId).toBe(notificationId);
      expect(event.tenantId).toBe(tenantId);
      expect(event.templateId).toBe(templateId);
    });
  });

  describe('边界情况', () => {
    it('应该处理空收件人列表', () => {
      event = new EmailNotificationCreatedEvent(
        notificationId,
        tenantId,
        templateId,
        [],
        data,
        priority,
        status,
      );

      expect(event.recipients).toEqual([]);
    });

    it('应该处理空数据对象', () => {
      event = new EmailNotificationCreatedEvent(
        notificationId,
        tenantId,
        templateId,
        recipients,
        {},
        priority,
        status,
      );

      expect(event.data).toEqual({});
    });

    it('应该处理空元数据对象', () => {
      event = new EmailNotificationCreatedEvent(
        notificationId,
        tenantId,
        templateId,
        recipients,
        data,
        priority,
        status,
        subject,
        scheduledAt,
        {},
      );

      expect(event.eventMetadata).toEqual({});
    });

    it('应该处理特殊字符在数据中', () => {
      const specialData = {
        userName: '张三🎉',
        company: '测试公司🚀',
        message: '包含特殊字符: !@#$%^&*()',
      };

      event = new EmailNotificationCreatedEvent(
        notificationId,
        tenantId,
        templateId,
        recipients,
        specialData,
        priority,
        status,
      );

      expect(event.data).toEqual(specialData);
    });
  });
});
