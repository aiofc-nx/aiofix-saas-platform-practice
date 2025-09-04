/**
 * @file push-notification.entity.spec.ts
 * @description Push通知实体单元测试
 */

import { PushNotification } from './push-notification.entity';
import { Uuid } from '@aiofix/shared';
import {
  NotificationType,
  NotificationStatus,
  NotificationPriority,
} from '@aiofix/shared';

// Mock DeviceToken
class MockDeviceToken {
  constructor(public readonly value: string) {}

  static create(token: string): MockDeviceToken {
    return new MockDeviceToken(token);
  }
}

// Mock the DeviceToken import
jest.mock('@aiofix/shared', () => ({
  ...jest.requireActual('@aiofix/shared'),
  DeviceToken: MockDeviceToken,
}));

describe('PushNotification', () => {
  let tenantId: Uuid;
  let templateId: Uuid;
  let recipients: MockDeviceToken[];
  let data: Record<string, unknown>;
  let priority: NotificationPriority;

  beforeEach(() => {
    tenantId = Uuid.generate();
    templateId = Uuid.generate();
    recipients = [MockDeviceToken.create('device-token-123')];
    data = { userName: '张三', company: '测试公司' };
    priority = NotificationPriority.NORMAL;
  });

  describe('创建Push通知', () => {
    it('应该成功创建Push通知实例', () => {
      const notification = PushNotification.create(
        tenantId,
        templateId,
        recipients,
        data,
        priority,
      );

      expect(notification.type).toBe(NotificationType.PUSH);
      expect(notification.templateId).toBe(templateId);
      expect(notification.recipients).toEqual(recipients);
      expect(notification.data).toEqual(data);
      expect(notification.priority).toBe(priority);
      expect(notification.status).toBe(NotificationStatus.PENDING);
      expect(notification.retryCount).toBe(0);
      expect(notification.maxRetries).toBe(3);
    });

    it('应该成功创建带标题的Push通知', () => {
      const title = '测试Push标题';
      const notification = PushNotification.create(
        tenantId,
        templateId,
        recipients,
        data,
        priority,
        undefined,
        title,
      );

      expect(notification.title).toBe(title);
    });

    it('应该成功创建带计划时间的Push通知', () => {
      const scheduledAt = new Date('2024-12-25T10:00:00Z');
      const notification = PushNotification.create(
        tenantId,
        templateId,
        recipients,
        data,
        priority,
        scheduledAt,
      );

      expect(notification.scheduledAt).toEqual(scheduledAt);
    });

    it('应该成功创建带元数据的Push通知', () => {
      const metadata = { source: 'system', category: 'notification' };
      const notification = PushNotification.create(
        tenantId,
        templateId,
        recipients,
        data,
        priority,
        undefined,
        undefined,
        metadata,
      );

      expect(notification.metadata).toEqual(metadata);
    });

    it('应该通过 createFromStrings 创建Push通知', () => {
      const recipientTokens = ['device-token-123', 'device-token-456'];
      const notification = PushNotification.createFromStrings(
        tenantId,
        templateId,
        recipientTokens,
        data,
        priority,
      );

      expect(notification.recipientTokens).toEqual(recipientTokens);
      expect(notification.recipient).toBe(recipientTokens.join(','));
    });

    it('应该拒绝创建没有收件人的Push通知', () => {
      expect(() =>
        PushNotification.createFromStrings(
          tenantId,
          templateId,
          [],
          data,
          priority,
        ),
      ).toThrow('Push通知必须包含至少一个收件人');
    });
  });

  describe('状态管理', () => {
    let notification: PushNotification;

    beforeEach(() => {
      notification = PushNotification.create(
        tenantId,
        templateId,
        recipients,
        data,
        priority,
      );
    });

    it('应该正确标记为发送中', () => {
      notification.markAsSending();
      expect(notification.status).toBe(NotificationStatus.SENDING);
    });

    it('应该正确标记为已发送', () => {
      const sendParams = {
        messageId: 'msg-123',
        deliveryStatus: 'delivered',
        provider: 'fcm',
        providerMessageId: 'provider-msg-123',
        retryCount: 0,
      };

      notification.markAsSent(sendParams);

      expect(notification.status).toBe(NotificationStatus.SENT);
      expect(notification.sentAt).toBeDefined();
      expect(notification.messageId).toBe(sendParams.messageId);
      expect(notification.deliveryStatus).toBe(sendParams.deliveryStatus);
      expect(notification.provider).toBe(sendParams.provider);
      expect(notification.providerMessageId).toBe(sendParams.providerMessageId);
      expect(notification.retryCount).toBe(sendParams.retryCount);
    });

    it('应该正确标记为发送失败', () => {
      const failParams = {
        errorCode: 'FCM_ERROR',
        errorMessage: '设备令牌无效',
        errorDetails: { invalidTokens: ['device-token-123'] },
        provider: 'fcm',
        retryCount: 1,
        maxRetries: 3,
        canRetry: true,
      };

      notification.markAsFailed(failParams);

      expect(notification.status).toBe(NotificationStatus.FAILED);
      expect(notification.errorMessage).toBe(failParams.errorMessage);
      expect(notification.errorCode).toBe(failParams.errorCode);
      expect(notification.errorDetails).toEqual(failParams.errorDetails);
      expect(notification.provider).toBe(failParams.provider);
      expect(notification.canRetry).toBe(failParams.canRetry);
      expect(notification.failedAt).toBeDefined();
    });

    it('应该正确重试发送', () => {
      // 先标记为失败
      notification.markAsFailed({
        errorCode: 'FCM_ERROR',
        errorMessage: '设备令牌无效',
        provider: 'fcm',
        retryCount: 0,
        maxRetries: 3,
        canRetry: true,
      });

      notification.retry();

      expect(notification.status).toBe(NotificationStatus.PENDING);
      expect(notification.errorMessage).toBeUndefined();
      expect(notification.retryCount).toBe(1);
    });

    it('应该正确重置为可重试状态', () => {
      // 先标记为失败
      notification.markAsFailed({
        errorCode: 'FCM_ERROR',
        errorMessage: '设备令牌无效',
        provider: 'fcm',
        retryCount: 1,
        maxRetries: 3,
        canRetry: true,
      });

      notification.resetForRetry();

      expect(notification.status).toBe(NotificationStatus.PENDING);
      expect(notification.errorMessage).toBeUndefined();
      expect(notification.errorCode).toBeUndefined();
      expect(notification.errorDetails).toBeUndefined();
      expect(notification.failedAt).toBeUndefined();
      expect(notification.canRetry).toBe(true);
    });

    it('应该正确取消发送', () => {
      notification.cancel();
      expect(notification.status).toBe(NotificationStatus.CANCELLED);
    });

    it('应该正确标记为已取消', () => {
      notification.markAsCancelled();
      expect(notification.status).toBe(NotificationStatus.CANCELLED);
    });
  });

  describe('业务规则验证', () => {
    let notification: PushNotification;

    beforeEach(() => {
      notification = PushNotification.create(
        tenantId,
        templateId,
        recipients,
        data,
        priority,
      );
    });

    it('应该拒绝从非待发送状态标记为发送中', () => {
      notification.markAsSending();

      expect(() => notification.markAsSending()).toThrow(
        '只有待发送状态的通知才能标记为发送中',
      );
    });

    it('应该拒绝从非待发送状态标记为已发送', () => {
      notification.markAsSending();

      expect(() =>
        notification.markAsSent({
          messageId: 'msg-123',
          deliveryStatus: 'delivered',
          provider: 'fcm',
          retryCount: 0,
        }),
      ).toThrow('只有待发送状态的通知才能标记为已发送');
    });

    it('应该拒绝从非待发送状态标记为失败', () => {
      notification.markAsSending();

      expect(() =>
        notification.markAsFailed({
          errorCode: 'FCM_ERROR',
          errorMessage: '设备令牌无效',
          provider: 'fcm',
          retryCount: 0,
          maxRetries: 3,
          canRetry: true,
        }),
      ).toThrow('只有待发送状态的通知才能标记为失败');
    });

    it('应该拒绝从非失败状态重试', () => {
      expect(() => notification.retry()).toThrow('只有失败状态的通知才能重试');
    });

    it('应该拒绝从非失败状态重置重试', () => {
      expect(() => notification.resetForRetry()).toThrow(
        '只有失败状态的通知才能重试',
      );
    });

    it('应该拒绝重试超过最大次数', () => {
      // 先标记为失败
      notification.markAsFailed({
        errorCode: 'FCM_ERROR',
        errorMessage: '设备令牌无效',
        provider: 'fcm',
        retryCount: 2,
        maxRetries: 3,
        canRetry: true,
      });

      // 重试3次，达到最大次数
      notification.retry(); // 第1次
      notification.markAsFailed({
        errorCode: 'FCM_ERROR',
        errorMessage: '设备令牌无效',
        provider: 'fcm',
        retryCount: 3,
        maxRetries: 3,
        canRetry: true,
      });

      expect(() => notification.retry()).toThrow('已达到最大重试次数');
    });

    it('应该拒绝取消已发送的通知', () => {
      notification.markAsSent({
        messageId: 'msg-123',
        deliveryStatus: 'delivered',
        provider: 'fcm',
        retryCount: 0,
      });

      expect(() => notification.cancel()).toThrow('已发送的通知不能取消');
    });

    it('应该拒绝取消已失败的通知', () => {
      notification.markAsFailed({
        errorCode: 'FCM_ERROR',
        errorMessage: '设备令牌无效',
        provider: 'fcm',
        retryCount: 0,
        maxRetries: 3,
        canRetry: true,
      });

      expect(() => notification.cancel()).toThrow('已发送的通知不能取消');
    });
  });

  describe('定时发送功能', () => {
    it('应该正确识别是否为定时发送', () => {
      const notification1 = PushNotification.create(
        tenantId,
        templateId,
        recipients,
        data,
        priority,
      );
      expect(notification1.isScheduled()).toBe(false);

      const scheduledAt = new Date('2024-12-25T10:00:00Z');
      const notification2 = PushNotification.create(
        tenantId,
        templateId,
        recipients,
        data,
        priority,
        scheduledAt,
      );
      expect(notification2.isScheduled()).toBe(true);
    });

    it('应该正确判断是否应该立即发送', () => {
      const notification1 = PushNotification.create(
        tenantId,
        templateId,
        recipients,
        data,
        priority,
      );
      expect(notification1.shouldSendNow()).toBe(true);

      const futureTime = new Date();
      futureTime.setHours(futureTime.getHours() + 1);
      const notification2 = PushNotification.create(
        tenantId,
        templateId,
        recipients,
        data,
        priority,
        futureTime,
      );
      expect(notification2.shouldSendNow()).toBe(false);

      const pastTime = new Date();
      pastTime.setHours(pastTime.getHours() - 1);
      const notification3 = PushNotification.create(
        tenantId,
        templateId,
        recipients,
        data,
        priority,
        pastTime,
      );
      expect(notification3.shouldSendNow()).toBe(true);
    });
  });

  describe('收件人验证', () => {
    it('应该正确验证收件人格式', () => {
      const notification = PushNotification.create(
        tenantId,
        templateId,
        recipients,
        data,
        priority,
      );

      expect(notification.validateRecipient()).toBe(true);
    });

    it('应该正确处理多个收件人', () => {
      const multipleRecipients = [
        MockDeviceToken.create('device-token-123'),
        MockDeviceToken.create('device-token-456'),
        MockDeviceToken.create('device-token-789'),
      ];

      const notification = PushNotification.create(
        tenantId,
        templateId,
        multipleRecipients,
        data,
        priority,
      );

      expect(notification.recipients).toEqual(multipleRecipients);
      expect(notification.recipientTokens).toEqual([
        'device-token-123',
        'device-token-456',
        'device-token-789',
      ]);
      expect(notification.recipient).toBe(
        'device-token-123,device-token-456,device-token-789',
      );
    });

    it('应该处理不同平台的设备令牌', () => {
      const platformTokens = [
        MockDeviceToken.create('fcm-token-123'), // Firebase Cloud Messaging
        MockDeviceToken.create('apns-token-456'), // Apple Push Notification Service
        MockDeviceToken.create('hms-token-789'), // Huawei Mobile Services
      ];

      const notification = PushNotification.create(
        tenantId,
        templateId,
        platformTokens,
        data,
        priority,
      );

      expect(notification.recipients).toEqual(platformTokens);
      expect(notification.recipientTokens).toEqual([
        'fcm-token-123',
        'apns-token-456',
        'hms-token-789',
      ]);
    });
  });

  describe('数据访问', () => {
    let notification: PushNotification;

    beforeEach(() => {
      notification = PushNotification.create(
        tenantId,
        templateId,
        recipients,
        data,
        priority,
      );
    });

    it('应该正确返回所有属性', () => {
      expect(notification.type).toBe(NotificationType.PUSH);
      expect(notification.templateId).toBe(templateId);
      expect(notification.recipients).toEqual(recipients);
      expect(notification.data).toEqual(data);
      expect(notification.priority).toBe(priority);
      expect(notification.status).toBe(NotificationStatus.PENDING);
      expect(notification.retryCount).toBe(0);
      expect(notification.maxRetries).toBe(3);
      expect(notification.metadata).toEqual({});
    });

    it('应该正确返回发送相关属性', () => {
      expect(notification.messageId).toBeUndefined();
      expect(notification.deliveryStatus).toBeUndefined();
      expect(notification.provider).toBeUndefined();
      expect(notification.providerMessageId).toBeUndefined();
      expect(notification.errorCode).toBeUndefined();
      expect(notification.errorDetails).toBeUndefined();
      expect(notification.canRetry).toBe(true);
      expect(notification.failedAt).toBeUndefined();
    });
  });

  describe('Push特定功能', () => {
    let notification: PushNotification;

    beforeEach(() => {
      notification = PushNotification.create(
        tenantId,
        templateId,
        recipients,
        data,
        priority,
      );
    });

    it('应该正确设置Push类型', () => {
      expect(notification.type).toBe(NotificationType.PUSH);
    });

    it('应该正确处理Push特有的错误代码', () => {
      const pushErrorCodes = [
        'FCM_ERROR',
        'APNS_ERROR',
        'HMS_ERROR',
        'INVALID_DEVICE_TOKEN',
        'DEVICE_NOT_REGISTERED',
        'MESSAGE_TOO_LARGE',
        'RATE_LIMIT_EXCEEDED',
      ];

      pushErrorCodes.forEach(errorCode => {
        notification.markAsFailed({
          errorCode,
          errorMessage: 'Push发送失败',
          provider: 'fcm',
          retryCount: 0,
          maxRetries: 3,
          canRetry: true,
        });

        expect(notification.errorCode).toBe(errorCode);

        // 重置状态以便下次测试
        notification.resetForRetry();
      });
    });

    it('应该正确处理Push特有的提供商', () => {
      const pushProviders = [
        'fcm', // Firebase Cloud Messaging
        'apns', // Apple Push Notification Service
        'hms', // Huawei Mobile Services
        'mipush', // Xiaomi Push
        'oppo', // OPPO Push
        'vivo', // VIVO Push
      ];

      pushProviders.forEach(provider => {
        notification.markAsSent({
          messageId: 'msg-123',
          deliveryStatus: 'delivered',
          provider,
          retryCount: 0,
        });

        expect(notification.provider).toBe(provider);

        // 重置状态以便下次测试
        notification = PushNotification.create(
          tenantId,
          templateId,
          recipients,
          data,
          priority,
        );
      });
    });

    it('应该正确处理Push通知的标题', () => {
      const title = '重要通知';
      const notificationWithTitle = PushNotification.create(
        tenantId,
        templateId,
        recipients,
        data,
        priority,
        undefined,
        title,
      );

      expect(notificationWithTitle.title).toBe(title);
    });

    it('应该正确处理Push通知的静默模式', () => {
      const silentData = { ...data, silent: true };
      const notification = PushNotification.create(
        tenantId,
        templateId,
        recipients,
        silentData,
        priority,
      );

      expect(notification.data).toEqual(silentData);
      expect(notification.data.silent).toBe(true);
    });
  });

  describe('边界情况', () => {
    it('应该处理空收件人列表', () => {
      expect(() =>
        PushNotification.create(tenantId, templateId, [], data, priority),
      ).toThrow('Push通知必须包含至少一个收件人');
    });

    it('应该处理空数据对象', () => {
      const notification = PushNotification.create(
        tenantId,
        templateId,
        recipients,
        {},
        priority,
      );

      expect(notification.data).toEqual({});
    });

    it('应该处理空元数据对象', () => {
      const notification = PushNotification.create(
        tenantId,
        templateId,
        recipients,
        data,
        priority,
        undefined,
        undefined,
        {},
      );

      expect(notification.metadata).toEqual({});
    });

    it('应该处理特殊字符在数据中', () => {
      const specialData = {
        userName: '张三🎉',
        company: '测试公司🚀',
        message: '包含特殊字符: !@#$%^&*()',
      };

      const notification = PushNotification.create(
        tenantId,
        templateId,
        recipients,
        specialData,
        priority,
      );

      expect(notification.data).toEqual(specialData);
    });

    it('应该处理超长消息内容', () => {
      const longMessage = 'a'.repeat(4000); // Push通知通常有长度限制
      const longData = { message: longMessage };

      const notification = PushNotification.create(
        tenantId,
        templateId,
        recipients,
        longData,
        priority,
      );

      expect(notification.data).toEqual(longData);
    });

    it('应该处理设备令牌格式变化', () => {
      const differentFormatTokens = [
        MockDeviceToken.create('fcm-token-123'),
        MockDeviceToken.create('apns-token-456'),
        MockDeviceToken.create('hms-token-789'),
      ];

      const notification = PushNotification.create(
        tenantId,
        templateId,
        differentFormatTokens,
        data,
        priority,
      );

      expect(notification.recipients).toEqual(differentFormatTokens);
      expect(notification.recipientTokens).toEqual([
        'fcm-token-123',
        'apns-token-456',
        'hms-token-789',
      ]);
    });
  });
});
