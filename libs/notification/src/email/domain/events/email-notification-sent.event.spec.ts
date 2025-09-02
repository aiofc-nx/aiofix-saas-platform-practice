/**
 * @file email-notification-sent.event.spec.ts
 * @description 邮件通知发送事件单元测试
 *
 * 测试覆盖范围：
 * - 事件创建和属性设置
 * - 事件数据序列化
 * - 静态创建方法
 * - 事件继承关系
 * - 边界情况处理
 */

import { EmailNotificationSentEvent, EmailSendResult } from './email-notification-sent.event';
import { NotificationType } from '@aiofix/shared';

describe('EmailNotificationSentEvent', () => {
  const mockNotificationId = 'notification-123';
  const mockTenantId = 'tenant-456';
  const mockSentAt = new Date('2024-01-01T10:00:00Z');
  const mockMessageId = 'msg-789';
  const mockDeliveryStatus = 'delivered';
  const mockProvider = 'smtp-provider';
  const mockRetryCount = 0;
  const mockProviderMessageId = 'provider-msg-123';
  const mockMetadata = { key: 'value' };
  const mockOperatorId = 'operator-123';

  describe('创建事件', () => {
    it('应该成功创建事件实例', () => {
      const event = new EmailNotificationSentEvent(
        mockNotificationId,
        mockTenantId,
        mockSentAt,
        mockMessageId,
        mockDeliveryStatus,
        mockProvider,
        mockRetryCount,
        mockProviderMessageId,
        mockMetadata,
        mockOperatorId
      );

      expect(event.notificationId).toBe(mockNotificationId);
      expect(event.tenantId).toBe(mockTenantId);
      expect(event.type).toBe(NotificationType.EMAIL);
      expect(event.sentAt).toEqual(mockSentAt);
      expect(event.messageId).toBe(mockMessageId);
      expect(event.deliveryStatus).toBe(mockDeliveryStatus);
      expect(event.provider).toBe(mockProvider);
      expect(event.providerMessageId).toBe(mockProviderMessageId);
      expect(event.retryCount).toBe(mockRetryCount);
      expect(event.eventMetadata).toEqual(mockMetadata);
      // operatorId 在 BaseEvent 中处理，这里不直接暴露
    });

    it('应该成功创建不带提供者消息ID的事件', () => {
      const event = new EmailNotificationSentEvent(
        mockNotificationId,
        mockTenantId,
        mockSentAt,
        mockMessageId,
        mockDeliveryStatus,
        mockProvider,
        mockRetryCount,
        undefined,
        mockMetadata,
        mockOperatorId
      );

      expect(event.providerMessageId).toBeUndefined();
    });

    it('应该成功创建不带元数据的事件', () => {
      const event = new EmailNotificationSentEvent(
        mockNotificationId,
        mockTenantId,
        mockSentAt,
        mockMessageId,
        mockDeliveryStatus,
        mockProvider,
        mockRetryCount,
        mockProviderMessageId,
        undefined,
        mockOperatorId
      );

      expect(event.eventMetadata).toEqual({});
    });

    it('应该成功创建不带操作者ID的事件', () => {
      const event = new EmailNotificationSentEvent(
        mockNotificationId,
        mockTenantId,
        mockSentAt,
        mockMessageId,
        mockDeliveryStatus,
        mockProvider,
        mockRetryCount,
        mockProviderMessageId,
        mockMetadata
      );

      // operatorId 在 BaseEvent 中处理，这里不直接暴露
    });

    it('应该成功创建最小参数的事件', () => {
      const event = new EmailNotificationSentEvent(
        mockNotificationId,
        mockTenantId,
        mockSentAt,
        mockMessageId,
        mockDeliveryStatus,
        mockProvider,
        mockRetryCount
      );

      expect(event.notificationId).toBe(mockNotificationId);
      expect(event.tenantId).toBe(mockTenantId);
      expect(event.type).toBe(NotificationType.EMAIL);
      expect(event.sentAt).toEqual(mockSentAt);
      expect(event.messageId).toBe(mockMessageId);
      expect(event.deliveryStatus).toBe(mockDeliveryStatus);
      expect(event.provider).toBe(mockProvider);
      expect(event.retryCount).toBe(mockRetryCount);
      expect(event.providerMessageId).toBeUndefined();
      expect(event.eventMetadata).toEqual({});
      // operatorId 在 BaseEvent 中处理，这里不直接暴露
    });
  });

  describe('事件属性', () => {
    let event: EmailNotificationSentEvent;

    beforeEach(() => {
      event = new EmailNotificationSentEvent(
        mockNotificationId,
        mockTenantId,
        mockSentAt,
        mockMessageId,
        mockDeliveryStatus,
        mockProvider,
        mockRetryCount,
        mockProviderMessageId,
        mockMetadata,
        mockOperatorId
      );
    });

    it('应该正确设置所有属性', () => {
      expect(event.notificationId).toBe(mockNotificationId);
      expect(event.tenantId).toBe(mockTenantId);
      expect(event.type).toBe(NotificationType.EMAIL);
      expect(event.sentAt).toEqual(mockSentAt);
      expect(event.messageId).toBe(mockMessageId);
      expect(event.deliveryStatus).toBe(mockDeliveryStatus);
      expect(event.provider).toBe(mockProvider);
      expect(event.providerMessageId).toBe(mockProviderMessageId);
      expect(event.retryCount).toBe(mockRetryCount);
      expect(event.eventMetadata).toEqual(mockMetadata);
      // operatorId 在 BaseEvent 中处理，这里不直接暴露
    });

    it('应该正确设置事件类型', () => {
      expect(event.type).toBe(NotificationType.EMAIL);
    });

    it('应该正确设置发送时间', () => {
      expect(event.sentAt).toEqual(mockSentAt);
      expect(event.sentAt).toBeInstanceOf(Date);
    });

    it('应该正确设置重试次数', () => {
      expect(event.retryCount).toBe(mockRetryCount);
      expect(typeof event.retryCount).toBe('number');
    });

    it('应该正确设置元数据', () => {
      expect(event.eventMetadata).toEqual(mockMetadata);
      expect(event.eventMetadata).not.toBe(mockMetadata); // 应该是副本
    });
  });

  describe('事件数据序列化', () => {
    let event: EmailNotificationSentEvent;

    beforeEach(() => {
      event = new EmailNotificationSentEvent(
        mockNotificationId,
        mockTenantId,
        mockSentAt,
        mockMessageId,
        mockDeliveryStatus,
        mockProvider,
        mockRetryCount,
        mockProviderMessageId,
        mockMetadata,
        mockOperatorId
      );
    });

    it('应该正确序列化事件数据', () => {
      const eventData = event.getEventData();

      expect(eventData.notificationId).toBe(mockNotificationId);
      expect(eventData.tenantId).toBe(mockTenantId);
      expect(eventData.type).toBe(NotificationType.EMAIL);
      expect(eventData.sentAt).toBe(mockSentAt.toISOString());
      expect(eventData.messageId).toBe(mockMessageId);
      expect(eventData.deliveryStatus).toBe(mockDeliveryStatus);
      expect(eventData.provider).toBe(mockProvider);
      expect(eventData.providerMessageId).toBe(mockProviderMessageId);
      expect(eventData.retryCount).toBe(mockRetryCount);
      expect(eventData.metadata).toEqual(mockMetadata);
    });

    it('应该处理undefined值的序列化', () => {
      const eventWithoutOptional = new EmailNotificationSentEvent(
        mockNotificationId,
        mockTenantId,
        mockSentAt,
        mockMessageId,
        mockDeliveryStatus,
        mockProvider,
        mockRetryCount
      );

      const eventData = eventWithoutOptional.getEventData();

      expect(eventData.providerMessageId).toBeUndefined();
      expect(eventData.metadata).toEqual({});
    });
  });

  describe('事件继承', () => {
    let event: EmailNotificationSentEvent;

    beforeEach(() => {
      event = new EmailNotificationSentEvent(
        mockNotificationId,
        mockTenantId,
        mockSentAt,
        mockMessageId,
        mockDeliveryStatus,
        mockProvider,
        mockRetryCount,
        mockProviderMessageId,
        mockMetadata,
        mockOperatorId
      );
    });

    it('应该继承BaseEvent的基本属性', () => {
      expect(event.eventId).toBeDefined();
      expect(event.occurredOn).toBeInstanceOf(Date);
      expect(event.eventType).toBe('EmailNotificationSentEvent');
    });

    it('应该生成唯一的事件ID', () => {
      const event1 = new EmailNotificationSentEvent(
        mockNotificationId,
        mockTenantId,
        mockSentAt,
        mockMessageId,
        mockDeliveryStatus,
        mockProvider,
        mockRetryCount
      );
      const event2 = new EmailNotificationSentEvent(
        mockNotificationId,
        mockTenantId,
        mockSentAt,
        mockMessageId,
        mockDeliveryStatus,
        mockProvider,
        mockRetryCount
      );

      expect(event1.eventId).not.toBe(event2.eventId);
    });

    it('应该设置正确的事件类型名称', () => {
      expect(event.eventType).toBe('EmailNotificationSentEvent');
    });
  });

  describe('静态创建方法', () => {
    it('应该通过静态方法创建事件', () => {
      const sendResult: EmailSendResult = {
        messageId: mockMessageId,
        sentAt: mockSentAt,
        deliveryStatus: mockDeliveryStatus as any,
        provider: mockProvider,
        providerMessageId: mockProviderMessageId,
        retryCount: mockRetryCount,
        metadata: mockMetadata,
      };

      const event = EmailNotificationSentEvent.create(
        mockNotificationId,
        mockTenantId,
        mockSentAt,
        mockMessageId,
        mockDeliveryStatus,
        mockProvider,
        mockRetryCount,
        mockProviderMessageId,
        mockMetadata,
        mockOperatorId
      );

      expect(event.notificationId).toBe(mockNotificationId);
      expect(event.tenantId).toBe(mockTenantId);
      expect(event.sentAt).toEqual(mockSentAt);
      expect(event.messageId).toBe(mockMessageId);
      expect(event.deliveryStatus).toBe(mockDeliveryStatus);
      expect(event.provider).toBe(mockProvider);
      expect(event.providerMessageId).toBe(mockProviderMessageId);
      expect(event.retryCount).toBe(mockRetryCount);
      expect(event.eventMetadata).toEqual(mockMetadata);
      // operatorId 在 BaseEvent 中处理，这里不直接暴露
    });

    it('应该通过静态方法创建最小参数事件', () => {
      const sendResult: EmailSendResult = {
        messageId: mockMessageId,
        sentAt: mockSentAt,
        deliveryStatus: mockDeliveryStatus as any,
        provider: mockProvider,
        retryCount: mockRetryCount,
        metadata: {},
      };

      const event = EmailNotificationSentEvent.create(
        mockNotificationId,
        mockTenantId,
        mockSentAt,
        mockMessageId,
        mockDeliveryStatus,
        mockProvider,
        mockRetryCount
      );

      expect(event.notificationId).toBe(mockNotificationId);
      expect(event.tenantId).toBe(mockTenantId);
      expect(event.providerMessageId).toBeUndefined();
      expect(event.eventMetadata).toEqual({});
      // operatorId 在 BaseEvent 中处理，这里不直接暴露
    });
  });

  describe('边界情况', () => {
    it('应该处理空元数据对象', () => {
      const event = new EmailNotificationSentEvent(
        mockNotificationId,
        mockTenantId,
        mockSentAt,
        mockMessageId,
        mockDeliveryStatus,
        mockProvider,
        mockRetryCount,
        mockProviderMessageId,
        {},
        mockOperatorId
      );

      expect(event.eventMetadata).toEqual({});
    });

    it('应该处理特殊字符在元数据中', () => {
      const specialMetadata = {
        'special-key': 'special-value',
        'unicode': '测试数据',
        'number': 123,
        'boolean': true,
        'null': null,
      };

      const event = new EmailNotificationSentEvent(
        mockNotificationId,
        mockTenantId,
        mockSentAt,
        mockMessageId,
        mockDeliveryStatus,
        mockProvider,
        mockRetryCount,
        mockProviderMessageId,
        specialMetadata,
        mockOperatorId
      );

      expect(event.eventMetadata).toEqual(specialMetadata);
    });

    it('应该处理不同的发送状态', () => {
      const statuses = ['delivered', 'pending', 'bounced', 'failed'];
      
      statuses.forEach(status => {
        const event = new EmailNotificationSentEvent(
          mockNotificationId,
          mockTenantId,
          mockSentAt,
          mockMessageId,
          status,
          mockProvider,
          mockRetryCount,
          mockProviderMessageId,
          mockMetadata,
          mockOperatorId
        );

        expect(event.deliveryStatus).toBe(status);
      });
    });

    it('应该处理不同的重试次数', () => {
      const retryCounts = [0, 1, 3, 5];
      
      retryCounts.forEach(count => {
        const event = new EmailNotificationSentEvent(
          mockNotificationId,
          mockTenantId,
          mockSentAt,
          mockMessageId,
          mockDeliveryStatus,
          mockProvider,
          count,
          mockProviderMessageId,
          mockMetadata,
          mockOperatorId
        );

        expect(event.retryCount).toBe(count);
      });
    });
  });
});
