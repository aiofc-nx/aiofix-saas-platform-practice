/**
 * @file email-notification-failed.event.spec.ts
 * @description 邮件通知失败事件单元测试
 *
 * 测试覆盖范围：
 * - 事件创建和属性设置
 * - 事件数据序列化
 * - 静态创建方法
 * - 事件继承关系
 * - 边界情况处理
 */

import {
  EmailNotificationFailedEvent,
  EmailFailureInfo,
} from './email-notification-failed.event';
import { NotificationType } from '@aiofix/shared';

describe('EmailNotificationFailedEvent', () => {
  const mockNotificationId = 'notification-123';
  const mockTenantId = 'tenant-456';
  const mockErrorCode = 'SMTP_ERROR';
  const mockErrorMessage = 'Connection timeout';
  const mockRetryCount = 2;
  const mockMaxRetries = 3;
  const mockCanRetry = true;
  const mockProvider = 'smtp-provider';
  const mockFailedAt = new Date('2024-01-01T10:00:00Z');
  const mockErrorDetails = {
    host: 'smtp.example.com',
    port: 587,
    timeout: 30000,
  };
  const mockOperatorId = 'operator-123';

  describe('创建事件', () => {
    it('应该成功创建事件实例', () => {
      const event = new EmailNotificationFailedEvent(
        mockNotificationId,
        mockTenantId,
        mockErrorCode,
        mockErrorMessage,
        mockRetryCount,
        mockMaxRetries,
        mockCanRetry,
        mockProvider,
        mockFailedAt,
        mockErrorDetails,
        mockOperatorId,
      );

      expect(event.notificationId).toBe(mockNotificationId);
      expect(event.tenantId).toBe(mockTenantId);
      expect(event.type).toBe(NotificationType.EMAIL);
      expect(event.errorCode).toBe(mockErrorCode);
      expect(event.errorMessage).toBe(mockErrorMessage);
      expect(event.errorDetails).toEqual(mockErrorDetails);
      expect(event.retryCount).toBe(mockRetryCount);
      expect(event.maxRetries).toBe(mockMaxRetries);
      expect(event.canRetry).toBe(mockCanRetry);
      expect(event.provider).toBe(mockProvider);
      expect(event.failedAt).toEqual(mockFailedAt);
      // operatorId 在 BaseEvent 中处理，这里不直接暴露
    });

    it('应该成功创建不带错误详情的事件', () => {
      const event = new EmailNotificationFailedEvent(
        mockNotificationId,
        mockTenantId,
        mockErrorCode,
        mockErrorMessage,
        mockRetryCount,
        mockMaxRetries,
        mockCanRetry,
        mockProvider,
        mockFailedAt,
        undefined,
        mockOperatorId,
      );

      expect(event.errorDetails).toBeUndefined();
    });

    it('应该成功创建不带操作者ID的事件', () => {
      const event = new EmailNotificationFailedEvent(
        mockNotificationId,
        mockTenantId,
        mockErrorCode,
        mockErrorMessage,
        mockRetryCount,
        mockMaxRetries,
        mockCanRetry,
        mockProvider,
        mockFailedAt,
        mockErrorDetails,
      );

      // operatorId 在 BaseEvent 中处理，这里不直接暴露
    });

    it('应该成功创建最小参数的事件', () => {
      const event = new EmailNotificationFailedEvent(
        mockNotificationId,
        mockTenantId,
        mockErrorCode,
        mockErrorMessage,
        mockRetryCount,
        mockMaxRetries,
        mockCanRetry,
        mockProvider,
        mockFailedAt,
      );

      expect(event.notificationId).toBe(mockNotificationId);
      expect(event.tenantId).toBe(mockTenantId);
      expect(event.type).toBe(NotificationType.EMAIL);
      expect(event.errorCode).toBe(mockErrorCode);
      expect(event.errorMessage).toBe(mockErrorMessage);
      expect(event.errorDetails).toBeUndefined();
      expect(event.retryCount).toBe(mockRetryCount);
      expect(event.maxRetries).toBe(mockMaxRetries);
      expect(event.canRetry).toBe(mockCanRetry);
      expect(event.provider).toBe(mockProvider);
      expect(event.failedAt).toEqual(mockFailedAt);
      // operatorId 在 BaseEvent 中处理，这里不直接暴露
    });
  });

  describe('事件属性', () => {
    let event: EmailNotificationFailedEvent;

    beforeEach(() => {
      event = new EmailNotificationFailedEvent(
        mockNotificationId,
        mockTenantId,
        mockErrorCode,
        mockErrorMessage,
        mockRetryCount,
        mockMaxRetries,
        mockCanRetry,
        mockProvider,
        mockFailedAt,
        mockErrorDetails,
        mockOperatorId,
      );
    });

    it('应该正确设置所有属性', () => {
      expect(event.notificationId).toBe(mockNotificationId);
      expect(event.tenantId).toBe(mockTenantId);
      expect(event.type).toBe(NotificationType.EMAIL);
      expect(event.errorCode).toBe(mockErrorCode);
      expect(event.errorMessage).toBe(mockErrorMessage);
      expect(event.errorDetails).toEqual(mockErrorDetails);
      expect(event.retryCount).toBe(mockRetryCount);
      expect(event.maxRetries).toBe(mockMaxRetries);
      expect(event.canRetry).toBe(mockCanRetry);
      expect(event.provider).toBe(mockProvider);
      expect(event.failedAt).toEqual(mockFailedAt);
      // operatorId 在 BaseEvent 中处理，这里不直接暴露
    });

    it('应该正确设置事件类型', () => {
      expect(event.type).toBe(NotificationType.EMAIL);
    });

    it('应该正确设置失败时间', () => {
      expect(event.failedAt).toEqual(mockFailedAt);
      expect(event.failedAt).toBeInstanceOf(Date);
    });

    it('应该正确设置重试信息', () => {
      expect(event.retryCount).toBe(mockRetryCount);
      expect(event.maxRetries).toBe(mockMaxRetries);
      expect(event.canRetry).toBe(mockCanRetry);
      expect(typeof event.retryCount).toBe('number');
      expect(typeof event.maxRetries).toBe('number');
      expect(typeof event.canRetry).toBe('boolean');
    });

    it('应该正确设置错误详情', () => {
      expect(event.errorDetails).toEqual(mockErrorDetails);
      expect(event.errorDetails).not.toBe(mockErrorDetails); // 应该是副本
    });
  });

  describe('事件数据序列化', () => {
    let event: EmailNotificationFailedEvent;

    beforeEach(() => {
      event = new EmailNotificationFailedEvent(
        mockNotificationId,
        mockTenantId,
        mockErrorCode,
        mockErrorMessage,
        mockRetryCount,
        mockMaxRetries,
        mockCanRetry,
        mockProvider,
        mockFailedAt,
        mockErrorDetails,
        mockOperatorId,
      );
    });

    it('应该正确序列化事件数据', () => {
      const eventData = event.getEventData();

      expect(eventData.notificationId).toBe(mockNotificationId);
      expect(eventData.tenantId).toBe(mockTenantId);
      expect(eventData.type).toBe(NotificationType.EMAIL);
      expect(eventData.errorCode).toBe(mockErrorCode);
      expect(eventData.errorMessage).toBe(mockErrorMessage);
      expect(eventData.errorDetails).toEqual(mockErrorDetails);
      expect(eventData.retryCount).toBe(mockRetryCount);
      expect(eventData.maxRetries).toBe(mockMaxRetries);
      expect(eventData.canRetry).toBe(mockCanRetry);
      expect(eventData.provider).toBe(mockProvider);
      expect(eventData.failedAt).toBe(mockFailedAt.toISOString());
    });

    it('应该处理undefined值的序列化', () => {
      const eventWithoutOptional = new EmailNotificationFailedEvent(
        mockNotificationId,
        mockTenantId,
        mockErrorCode,
        mockErrorMessage,
        mockRetryCount,
        mockMaxRetries,
        mockCanRetry,
        mockProvider,
        mockFailedAt,
      );

      const eventData = eventWithoutOptional.getEventData();

      expect(eventData.errorDetails).toBeUndefined();
    });
  });

  describe('事件继承', () => {
    let event: EmailNotificationFailedEvent;

    beforeEach(() => {
      event = new EmailNotificationFailedEvent(
        mockNotificationId,
        mockTenantId,
        mockErrorCode,
        mockErrorMessage,
        mockRetryCount,
        mockMaxRetries,
        mockCanRetry,
        mockProvider,
        mockFailedAt,
        mockErrorDetails,
        mockOperatorId,
      );
    });

    it('应该继承BaseEvent的基本属性', () => {
      expect(event.eventId).toBeDefined();
      expect(event.occurredOn).toBeInstanceOf(Date);
      expect(event.eventType).toBe('EmailNotificationFailedEvent');
    });

    it('应该生成唯一的事件ID', () => {
      const event1 = new EmailNotificationFailedEvent(
        mockNotificationId,
        mockTenantId,
        mockErrorCode,
        mockErrorMessage,
        mockRetryCount,
        mockMaxRetries,
        mockCanRetry,
        mockProvider,
        mockFailedAt,
      );
      const event2 = new EmailNotificationFailedEvent(
        mockNotificationId,
        mockTenantId,
        mockErrorCode,
        mockErrorMessage,
        mockRetryCount,
        mockMaxRetries,
        mockCanRetry,
        mockProvider,
        mockFailedAt,
      );

      expect(event1.eventId).not.toBe(event2.eventId);
    });

    it('应该设置正确的事件类型名称', () => {
      expect(event.eventType).toBe('EmailNotificationFailedEvent');
    });
  });

  describe('静态创建方法', () => {
    it('应该通过静态方法创建事件', () => {
      const failureInfo: EmailFailureInfo = {
        errorCode: mockErrorCode,
        errorMessage: mockErrorMessage,
        errorDetails: mockErrorDetails,
        retryCount: mockRetryCount,
        maxRetries: mockMaxRetries,
        canRetry: mockCanRetry,
        provider: mockProvider,
        failedAt: mockFailedAt,
      };

      const event = EmailNotificationFailedEvent.create(
        mockNotificationId,
        mockTenantId,
        mockErrorCode,
        mockErrorMessage,
        mockRetryCount,
        mockMaxRetries,
        mockCanRetry,
        mockProvider,
        mockFailedAt,
        mockErrorDetails,
        mockOperatorId,
      );

      expect(event.notificationId).toBe(mockNotificationId);
      expect(event.tenantId).toBe(mockTenantId);
      expect(event.errorCode).toBe(mockErrorCode);
      expect(event.errorMessage).toBe(mockErrorMessage);
      expect(event.errorDetails).toEqual(mockErrorDetails);
      expect(event.retryCount).toBe(mockRetryCount);
      expect(event.maxRetries).toBe(mockMaxRetries);
      expect(event.canRetry).toBe(mockCanRetry);
      expect(event.provider).toBe(mockProvider);
      expect(event.failedAt).toEqual(mockFailedAt);
      // operatorId 在 BaseEvent 中处理，这里不直接暴露
    });

    it('应该通过静态方法创建最小参数事件', () => {
      const failureInfo: EmailFailureInfo = {
        errorCode: mockErrorCode,
        errorMessage: mockErrorMessage,
        retryCount: mockRetryCount,
        maxRetries: mockMaxRetries,
        canRetry: mockCanRetry,
        provider: mockProvider,
        failedAt: mockFailedAt,
      };

      const event = EmailNotificationFailedEvent.create(
        mockNotificationId,
        mockTenantId,
        mockErrorCode,
        mockErrorMessage,
        mockRetryCount,
        mockMaxRetries,
        mockCanRetry,
        mockProvider,
        mockFailedAt,
      );

      expect(event.notificationId).toBe(mockNotificationId);
      expect(event.tenantId).toBe(mockTenantId);
      expect(event.errorDetails).toBeUndefined();
      // operatorId 在 BaseEvent 中处理，这里不直接暴露
    });
  });

  describe('边界情况', () => {
    it('应该处理空错误详情对象', () => {
      const event = new EmailNotificationFailedEvent(
        mockNotificationId,
        mockTenantId,
        mockErrorCode,
        mockErrorMessage,
        mockRetryCount,
        mockMaxRetries,
        mockCanRetry,
        mockProvider,
        mockFailedAt,
        {},
        mockOperatorId,
      );

      expect(event.errorDetails).toEqual({});
    });

    it('应该处理特殊字符在错误信息中', () => {
      const specialErrorMessage = '错误信息包含特殊字符: <>&"\'';
      const event = new EmailNotificationFailedEvent(
        mockNotificationId,
        mockTenantId,
        mockErrorCode,
        specialErrorMessage,
        mockRetryCount,
        mockMaxRetries,
        mockCanRetry,
        mockProvider,
        mockFailedAt,
        mockErrorDetails,
        mockOperatorId,
      );

      expect(event.errorMessage).toBe(specialErrorMessage);
    });

    it('应该处理不同的重试状态', () => {
      const retryStates = [
        { retryCount: 0, maxRetries: 3, canRetry: true },
        { retryCount: 2, maxRetries: 3, canRetry: true },
        { retryCount: 3, maxRetries: 3, canRetry: false },
        { retryCount: 5, maxRetries: 3, canRetry: false },
      ];

      retryStates.forEach(({ retryCount, maxRetries, canRetry }) => {
        const event = new EmailNotificationFailedEvent(
          mockNotificationId,
          mockTenantId,
          mockErrorCode,
          mockErrorMessage,
          retryCount,
          maxRetries,
          canRetry,
          mockProvider,
          mockFailedAt,
          mockErrorDetails,
          mockOperatorId,
        );

        expect(event.retryCount).toBe(retryCount);
        expect(event.maxRetries).toBe(maxRetries);
        expect(event.canRetry).toBe(canRetry);
      });
    });

    it('应该处理不同的错误代码', () => {
      const errorCodes = [
        'SMTP_ERROR',
        'CONNECTION_TIMEOUT',
        'AUTHENTICATION_FAILED',
        'INVALID_RECIPIENT',
        'QUOTA_EXCEEDED',
      ];

      errorCodes.forEach(errorCode => {
        const event = new EmailNotificationFailedEvent(
          mockNotificationId,
          mockTenantId,
          errorCode,
          mockErrorMessage,
          mockRetryCount,
          mockMaxRetries,
          mockCanRetry,
          mockProvider,
          mockFailedAt,
          mockErrorDetails,
          mockOperatorId,
        );

        expect(event.errorCode).toBe(errorCode);
      });
    });

    it('应该处理Unicode字符在错误信息中', () => {
      const unicodeErrorMessage = '错误信息包含Unicode字符: 测试数据 🚀';
      const event = new EmailNotificationFailedEvent(
        mockNotificationId,
        mockTenantId,
        mockErrorCode,
        unicodeErrorMessage,
        mockRetryCount,
        mockMaxRetries,
        mockCanRetry,
        mockProvider,
        mockFailedAt,
        mockErrorDetails,
        mockOperatorId,
      );

      expect(event.errorMessage).toBe(unicodeErrorMessage);
    });
  });
});
