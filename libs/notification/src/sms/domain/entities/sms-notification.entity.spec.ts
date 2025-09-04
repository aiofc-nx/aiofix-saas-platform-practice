/**
 * @file sms-notification.entity.spec.ts
 * @description SMS通知实体单元测试
 */

import { SmsNotification } from './sms-notification.entity';
import { Uuid } from '@aiofix/shared';
import {
  NotificationType,
  NotificationStatus,
  NotificationPriority,
} from '@aiofix/shared';

// Mock PhoneNumber
class MockPhoneNumber {
  constructor(public readonly value: string) {}

  static create(phone: string): MockPhoneNumber {
    return new MockPhoneNumber(phone);
  }
}

// Mock the PhoneNumber import
jest.mock('@aiofix/shared', () => ({
  ...jest.requireActual('@aiofix/shared'),
  PhoneNumber: MockPhoneNumber,
}));

describe('SmsNotification', () => {
  let tenantId: Uuid;
  let templateId: Uuid;
  let recipients: MockPhoneNumber[];
  let data: Record<string, unknown>;
  let priority: NotificationPriority;

  beforeEach(() => {
    tenantId = Uuid.generate();
    templateId = Uuid.generate();
    recipients = [MockPhoneNumber.create('+8613800138000')];
    data = { userName: '张三', company: '测试公司' };
    priority = NotificationPriority.NORMAL;
  });

  describe('创建SMS通知', () => {
    it('应该成功创建SMS通知实例', () => {
      const notification = SmsNotification.create(
        tenantId,
        templateId,
        recipients,
        data,
        priority,
      );

      expect(notification.type).toBe(NotificationType.SMS);
      expect(notification.templateId).toBe(templateId);
      expect(notification.recipients).toEqual(recipients);
      expect(notification.data).toEqual(data);
      expect(notification.priority).toBe(priority);
      expect(notification.status).toBe(NotificationStatus.PENDING);
      expect(notification.retryCount).toBe(0);
      expect(notification.maxRetries).toBe(3);
    });

    it('应该成功创建带计划时间的SMS通知', () => {
      const scheduledAt = new Date('2024-12-25T10:00:00Z');
      const notification = SmsNotification.create(
        tenantId,
        templateId,
        recipients,
        data,
        priority,
        scheduledAt,
      );

      expect(notification.scheduledAt).toEqual(scheduledAt);
    });

    it('应该成功创建带元数据的SMS通知', () => {
      const metadata = { source: 'system', category: 'notification' };
      const notification = SmsNotification.create(
        tenantId,
        templateId,
        recipients,
        data,
        priority,
        undefined,
        metadata,
      );

      expect(notification.metadata).toEqual(metadata);
    });

    it('应该通过 createFromStrings 创建SMS通知', () => {
      const recipientPhones = ['+8613800138000', '+8613800138001'];
      const notification = SmsNotification.createFromStrings(
        tenantId,
        templateId,
        recipientPhones,
        data,
        priority,
      );

      expect(notification.recipientPhones).toEqual(recipientPhones);
      expect(notification.recipient).toBe(recipientPhones.join(','));
    });

    it('应该拒绝创建没有收件人的SMS通知', () => {
      expect(() =>
        SmsNotification.createFromStrings(
          tenantId,
          templateId,
          [],
          data,
          priority,
        ),
      ).toThrow('SMS通知必须包含至少一个收件人');
    });
  });

  describe('状态管理', () => {
    let notification: SmsNotification;

    beforeEach(() => {
      notification = SmsNotification.create(
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
        provider: 'sms-gateway',
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
        errorCode: 'SMS_GATEWAY_ERROR',
        errorMessage: '网关连接失败',
        errorDetails: { timeout: 30000 },
        provider: 'sms-gateway',
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
        errorCode: 'SMS_GATEWAY_ERROR',
        errorMessage: '网关连接失败',
        provider: 'sms-gateway',
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
        errorCode: 'SMS_GATEWAY_ERROR',
        errorMessage: '网关连接失败',
        provider: 'sms-gateway',
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
    let notification: SmsNotification;

    beforeEach(() => {
      notification = SmsNotification.create(
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
          provider: 'sms-gateway',
          retryCount: 0,
        }),
      ).toThrow('只有待发送状态的通知才能标记为已发送');
    });

    it('应该拒绝从非待发送状态标记为失败', () => {
      notification.markAsSending();

      expect(() =>
        notification.markAsFailed({
          errorCode: 'SMS_GATEWAY_ERROR',
          errorMessage: '网关连接失败',
          provider: 'sms-gateway',
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
        errorCode: 'SMS_GATEWAY_ERROR',
        errorMessage: '网关连接失败',
        provider: 'sms-gateway',
        retryCount: 2,
        maxRetries: 3,
        canRetry: true,
      });

      // 重试3次，达到最大次数
      notification.retry(); // 第1次
      notification.markAsFailed({
        errorCode: 'SMS_GATEWAY_ERROR',
        errorMessage: '网关连接失败',
        provider: 'sms-gateway',
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
        provider: 'sms-gateway',
        retryCount: 0,
      });

      expect(() => notification.cancel()).toThrow('已发送的通知不能取消');
    });

    it('应该拒绝取消已失败的通知', () => {
      notification.markAsFailed({
        errorCode: 'SMS_GATEWAY_ERROR',
        errorMessage: '网关连接失败',
        provider: 'sms-gateway',
        retryCount: 0,
        maxRetries: 3,
        canRetry: true,
      });

      expect(() => notification.cancel()).toThrow('已发送的通知不能取消');
    });
  });

  describe('定时发送功能', () => {
    it('应该正确识别是否为定时发送', () => {
      const notification1 = SmsNotification.create(
        tenantId,
        templateId,
        recipients,
        data,
        priority,
      );
      expect(notification1.isScheduled()).toBe(false);

      const scheduledAt = new Date('2024-12-25T10:00:00Z');
      const notification2 = SmsNotification.create(
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
      const notification1 = SmsNotification.create(
        tenantId,
        templateId,
        recipients,
        data,
        priority,
      );
      expect(notification1.shouldSendNow()).toBe(true);

      const futureTime = new Date();
      futureTime.setHours(futureTime.getHours() + 1);
      const notification2 = SmsNotification.create(
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
      const notification3 = SmsNotification.create(
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
      const notification = SmsNotification.create(
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
        MockPhoneNumber.create('+8613800138000'),
        MockPhoneNumber.create('+8613800138001'),
        MockPhoneNumber.create('+8613800138002'),
      ];

      const notification = SmsNotification.create(
        tenantId,
        templateId,
        multipleRecipients,
        data,
        priority,
      );

      expect(notification.recipients).toEqual(multipleRecipients);
      expect(notification.recipientPhones).toEqual([
        '+8613800138000',
        '+8613800138001',
        '+8613800138002',
      ]);
      expect(notification.recipient).toBe(
        '+8613800138000,+8613800138001,+8613800138002',
      );
    });

    it('应该处理国际电话号码格式', () => {
      const internationalRecipients = [
        MockPhoneNumber.create('+1-555-123-4567'),
        MockPhoneNumber.create('+44-20-7946-0958'),
        MockPhoneNumber.create('+81-3-1234-5678'),
      ];

      const notification = SmsNotification.create(
        tenantId,
        templateId,
        internationalRecipients,
        data,
        priority,
      );

      expect(notification.recipients).toEqual(internationalRecipients);
      expect(notification.recipientPhones).toEqual([
        '+1-555-123-4567',
        '+44-20-7946-0958',
        '+81-3-1234-5678',
      ]);
    });
  });

  describe('数据访问', () => {
    let notification: SmsNotification;

    beforeEach(() => {
      notification = SmsNotification.create(
        tenantId,
        templateId,
        recipients,
        data,
        priority,
      );
    });

    it('应该正确返回所有属性', () => {
      expect(notification.type).toBe(NotificationType.SMS);
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

  describe('SMS特定功能', () => {
    let notification: SmsNotification;

    beforeEach(() => {
      notification = SmsNotification.create(
        tenantId,
        templateId,
        recipients,
        data,
        priority,
      );
    });

    it('应该正确设置SMS类型', () => {
      expect(notification.type).toBe(NotificationType.SMS);
    });

    it('应该正确处理SMS特有的错误代码', () => {
      const smsErrorCodes = [
        'SMS_GATEWAY_ERROR',
        'INVALID_PHONE_NUMBER',
        'MESSAGE_TOO_LONG',
        'RATE_LIMIT_EXCEEDED',
        'INSUFFICIENT_CREDITS',
      ];

      smsErrorCodes.forEach(errorCode => {
        notification.markAsFailed({
          errorCode,
          errorMessage: 'SMS发送失败',
          provider: 'sms-gateway',
          retryCount: 0,
          maxRetries: 3,
          canRetry: true,
        });

        expect(notification.errorCode).toBe(errorCode);

        // 重置状态以便下次测试
        notification.resetForRetry();
      });
    });

    it('应该正确处理SMS特有的提供商', () => {
      const smsProviders = [
        'sms-gateway',
        'twilio',
        'nexmo',
        'aws-sns',
        'aliyun-sms',
      ];

      smsProviders.forEach(provider => {
        notification.markAsSent({
          messageId: 'msg-123',
          deliveryStatus: 'delivered',
          provider,
          retryCount: 0,
        });

        expect(notification.provider).toBe(provider);

        // 重置状态以便下次测试
        notification = SmsNotification.create(
          tenantId,
          templateId,
          recipients,
          data,
          priority,
        );
      });
    });
  });

  describe('边界情况', () => {
    it('应该处理空收件人列表', () => {
      expect(() =>
        SmsNotification.create(tenantId, templateId, [], data, priority),
      ).toThrow('SMS通知必须包含至少一个收件人');
    });

    it('应该处理空数据对象', () => {
      const notification = SmsNotification.create(
        tenantId,
        templateId,
        recipients,
        {},
        priority,
      );

      expect(notification.data).toEqual({});
    });

    it('应该处理空元数据对象', () => {
      const notification = SmsNotification.create(
        tenantId,
        templateId,
        recipients,
        data,
        priority,
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

      const notification = SmsNotification.create(
        tenantId,
        templateId,
        recipients,
        specialData,
        priority,
      );

      expect(notification.data).toEqual(specialData);
    });

    it('应该处理超长消息内容', () => {
      const longMessage = 'a'.repeat(1000);
      const longData = { message: longMessage };

      const notification = SmsNotification.create(
        tenantId,
        templateId,
        recipients,
        longData,
        priority,
      );

      expect(notification.data).toEqual(longData);
    });
  });
});
