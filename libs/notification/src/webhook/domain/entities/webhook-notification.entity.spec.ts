/**
 * @file webhook-notification.entity.spec.ts
 * @description Webhook通知实体单元测试
 */

import { WebhookNotification } from './webhook-notification.entity';
import { Uuid } from '@aiofix/shared';
import {
  NotificationType,
  NotificationStatus,
  NotificationPriority,
} from '@aiofix/shared';

// Mock WebhookUrl
class MockWebhookUrl {
  constructor(public readonly value: string) {}

  static create(url: string): MockWebhookUrl {
    return new MockWebhookUrl(url);
  }
}

// Mock the WebhookUrl import
jest.mock('@aiofix/shared', () => ({
  ...jest.requireActual('@aiofix/shared'),
  WebhookUrl: MockWebhookUrl,
}));

describe('WebhookNotification', () => {
  let tenantId: Uuid;
  let templateId: Uuid;
  let recipients: MockWebhookUrl[];
  let data: Record<string, unknown>;
  let priority: NotificationPriority;

  beforeEach(() => {
    tenantId = Uuid.generate();
    templateId = Uuid.generate();
    recipients = [MockWebhookUrl.create('https://api.example.com/webhook')];
    data = { userName: '张三', company: '测试公司' };
    priority = NotificationPriority.NORMAL;
  });

  describe('创建Webhook通知', () => {
    it('应该成功创建Webhook通知实例', () => {
      const notification = WebhookNotification.create(
        tenantId,
        templateId,
        recipients,
        data,
        priority,
      );

      expect(notification.type).toBe(NotificationType.WEBHOOK);
      expect(notification.templateId).toBe(templateId);
      expect(notification.recipients).toEqual(recipients);
      expect(notification.data).toEqual(data);
      expect(notification.priority).toBe(priority);
      expect(notification.status).toBe(NotificationStatus.PENDING);
      expect(notification.retryCount).toBe(0);
      expect(notification.maxRetries).toBe(3);
    });

    it('应该成功创建带计划时间的Webhook通知', () => {
      const scheduledAt = new Date('2024-12-25T10:00:00Z');
      const notification = WebhookNotification.create(
        tenantId,
        templateId,
        recipients,
        data,
        priority,
        scheduledAt,
      );

      expect(notification.scheduledAt).toEqual(scheduledAt);
    });

    it('应该成功创建带元数据的Webhook通知', () => {
      const metadata = { source: 'system', category: 'notification' };
      const notification = WebhookNotification.create(
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

    it('应该通过 createFromStrings 创建Webhook通知', () => {
      const recipientUrls = [
        'https://api.example.com/webhook1',
        'https://api.example.com/webhook2',
      ];
      const notification = WebhookNotification.createFromStrings(
        tenantId,
        templateId,
        recipientUrls,
        data,
        priority,
      );

      expect(notification.recipientUrls).toEqual(recipientUrls);
      expect(notification.recipient).toBe(recipientUrls.join(','));
    });

    it('应该拒绝创建没有收件人的Webhook通知', () => {
      expect(() =>
        WebhookNotification.createFromStrings(
          tenantId,
          templateId,
          [],
          data,
          priority,
        ),
      ).toThrow('Webhook通知必须包含至少一个收件人');
    });
  });

  describe('状态管理', () => {
    let notification: WebhookNotification;

    beforeEach(() => {
      notification = WebhookNotification.create(
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
        provider: 'http-client',
        providerMessageId: 'provider-msg-123',
        retryCount: 0,
        responseStatus: 200,
        responseBody: '{"success": true}',
      };

      notification.markAsSent(sendParams);

      expect(notification.status).toBe(NotificationStatus.SENT);
      expect(notification.sentAt).toBeDefined();
      expect(notification.messageId).toBe(sendParams.messageId);
      expect(notification.deliveryStatus).toBe(sendParams.deliveryStatus);
      expect(notification.provider).toBe(sendParams.provider);
      expect(notification.providerMessageId).toBe(sendParams.providerMessageId);
      expect(notification.retryCount).toBe(sendParams.retryCount);
      expect(notification.responseStatus).toBe(sendParams.responseStatus);
      expect(notification.responseBody).toBe(sendParams.responseBody);
    });

    it('应该正确标记为发送失败', () => {
      const failParams = {
        errorCode: 'HTTP_ERROR',
        errorMessage: '连接超时',
        errorDetails: { timeout: 30000, statusCode: 500 },
        provider: 'http-client',
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
        errorCode: 'HTTP_ERROR',
        errorMessage: '连接超时',
        provider: 'http-client',
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
        errorCode: 'HTTP_ERROR',
        errorMessage: '连接超时',
        provider: 'http-client',
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
    let notification: WebhookNotification;

    beforeEach(() => {
      notification = WebhookNotification.create(
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
          provider: 'http-client',
          retryCount: 0,
        }),
      ).toThrow('只有待发送状态的通知才能标记为已发送');
    });

    it('应该拒绝从非待发送状态标记为失败', () => {
      notification.markAsSending();

      expect(() =>
        notification.markAsFailed({
          errorCode: 'HTTP_ERROR',
          errorMessage: '连接超时',
          provider: 'http-client',
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
        errorCode: 'HTTP_ERROR',
        errorMessage: '连接超时',
        provider: 'http-client',
        retryCount: 2,
        maxRetries: 3,
        canRetry: true,
      });

      // 重试3次，达到最大次数
      notification.retry(); // 第1次
      notification.markAsFailed({
        errorCode: 'HTTP_ERROR',
        errorMessage: '连接超时',
        provider: 'http-client',
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
        provider: 'http-client',
        retryCount: 0,
      });

      expect(() => notification.cancel()).toThrow('已发送的通知不能取消');
    });

    it('应该拒绝取消已失败的通知', () => {
      notification.markAsFailed({
        errorCode: 'HTTP_ERROR',
        errorMessage: '连接超时',
        provider: 'http-client',
        retryCount: 0,
        maxRetries: 3,
        canRetry: true,
      });

      expect(() => notification.cancel()).toThrow('已发送的通知不能取消');
    });
  });

  describe('定时发送功能', () => {
    it('应该正确识别是否为定时发送', () => {
      const notification1 = WebhookNotification.create(
        tenantId,
        templateId,
        recipients,
        data,
        priority,
      );
      expect(notification1.isScheduled()).toBe(false);

      const scheduledAt = new Date('2024-12-25T10:00:00Z');
      const notification2 = WebhookNotification.create(
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
      const notification1 = WebhookNotification.create(
        tenantId,
        templateId,
        recipients,
        data,
        priority,
      );
      expect(notification1.shouldSendNow()).toBe(true);

      const futureTime = new Date();
      futureTime.setHours(futureTime.getHours() + 1);
      const notification2 = WebhookNotification.create(
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
      const notification3 = WebhookNotification.create(
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
      const notification = WebhookNotification.create(
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
        MockWebhookUrl.create('https://api.example.com/webhook1'),
        MockWebhookUrl.create('https://api.example.com/webhook2'),
        MockWebhookUrl.create('https://api.example.com/webhook3'),
      ];

      const notification = WebhookNotification.create(
        tenantId,
        templateId,
        multipleRecipients,
        data,
        priority,
      );

      expect(notification.recipients).toEqual(multipleRecipients);
      expect(notification.recipientUrls).toEqual([
        'https://api.example.com/webhook1',
        'https://api.example.com/webhook2',
        'https://api.example.com/webhook3',
      ]);
      expect(notification.recipient).toBe(
        'https://api.example.com/webhook1,https://api.example.com/webhook2,https://api.example.com/webhook3',
      );
    });

    it('应该处理不同协议的Webhook URL', () => {
      const differentProtocolUrls = [
        MockWebhookUrl.create('https://api.example.com/webhook'),
        MockWebhookUrl.create('http://internal.example.com/webhook'),
        MockWebhookUrl.create('https://webhook.site/abc123'),
      ];

      const notification = WebhookNotification.create(
        tenantId,
        templateId,
        differentProtocolUrls,
        data,
        priority,
      );

      expect(notification.recipients).toEqual(differentProtocolUrls);
      expect(notification.recipientUrls).toEqual([
        'https://api.example.com/webhook',
        'http://internal.example.com/webhook',
        'https://webhook.site/abc123',
      ]);
    });
  });

  describe('数据访问', () => {
    let notification: WebhookNotification;

    beforeEach(() => {
      notification = WebhookNotification.create(
        tenantId,
        templateId,
        recipients,
        data,
        priority,
      );
    });

    it('应该正确返回所有属性', () => {
      expect(notification.type).toBe(NotificationType.WEBHOOK);
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
      expect(notification.responseStatus).toBeUndefined();
      expect(notification.responseBody).toBeUndefined();
    });
  });

  describe('Webhook特定功能', () => {
    let notification: WebhookNotification;

    beforeEach(() => {
      notification = WebhookNotification.create(
        tenantId,
        templateId,
        recipients,
        data,
        priority,
      );
    });

    it('应该正确设置Webhook类型', () => {
      expect(notification.type).toBe(NotificationType.WEBHOOK);
    });

    it('应该正确处理Webhook特有的错误代码', () => {
      const webhookErrorCodes = [
        'HTTP_ERROR',
        'TIMEOUT_ERROR',
        'SSL_ERROR',
        'INVALID_URL',
        'RATE_LIMIT_EXCEEDED',
        'AUTHENTICATION_FAILED',
        'INVALID_RESPONSE',
      ];

      webhookErrorCodes.forEach(errorCode => {
        notification.markAsFailed({
          errorCode,
          errorMessage: 'Webhook发送失败',
          provider: 'http-client',
          retryCount: 0,
          maxRetries: 3,
          canRetry: true,
        });

        expect(notification.errorCode).toBe(errorCode);

        // 重置状态以便下次测试
        notification.resetForRetry();
      });
    });

    it('应该正确处理Webhook特有的提供商', () => {
      const webhookProviders = [
        'http-client',
        'axios',
        'fetch',
        'got',
        'superagent',
        'request',
      ];

      webhookProviders.forEach(provider => {
        notification.markAsSent({
          messageId: 'msg-123',
          deliveryStatus: 'delivered',
          provider,
          retryCount: 0,
        });

        expect(notification.provider).toBe(provider);

        // 重置状态以便下次测试
        notification = WebhookNotification.create(
          tenantId,
          templateId,
          recipients,
          data,
          priority,
        );
      });
    });

    it('应该正确处理HTTP响应状态码', () => {
      const responseStatuses = [
        200, 201, 204, 400, 401, 403, 404, 500, 502, 503,
      ];

      responseStatuses.forEach(status => {
        notification.markAsSent({
          messageId: 'msg-123',
          deliveryStatus:
            status >= 200 && status < 300 ? 'delivered' : 'failed',
          provider: 'http-client',
          retryCount: 0,
          responseStatus: status,
          responseBody: `Response with status ${status}`,
        });

        expect(notification.responseStatus).toBe(status);
        expect(notification.responseBody).toBe(
          `Response with status ${status}`,
        );

        // 重置状态以便下次测试
        notification = WebhookNotification.create(
          tenantId,
          templateId,
          recipients,
          data,
          priority,
        );
      });
    });

    it('应该正确处理Webhook请求头', () => {
      const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Bearer token123',
        'X-Custom-Header': 'custom-value',
      };

      const notificationWithHeaders = WebhookNotification.create(
        tenantId,
        templateId,
        recipients,
        { ...data, headers },
        priority,
      );

      expect(notificationWithHeaders.data.headers).toEqual(headers);
    });

    it('应该正确处理Webhook请求方法', () => {
      const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

      methods.forEach(method => {
        const notificationWithMethod = WebhookNotification.create(
          tenantId,
          templateId,
          recipients,
          { ...data, method },
          priority,
        );

        expect(notificationWithMethod.data.method).toBe(method);
      });
    });
  });

  describe('边界情况', () => {
    it('应该处理空收件人列表', () => {
      expect(() =>
        WebhookNotification.create(tenantId, templateId, [], data, priority),
      ).toThrow('Webhook通知必须包含至少一个收件人');
    });

    it('应该处理空数据对象', () => {
      const notification = WebhookNotification.create(
        tenantId,
        templateId,
        recipients,
        {},
        priority,
      );

      expect(notification.data).toEqual({});
    });

    it('应该处理空元数据对象', () => {
      const notification = WebhookNotification.create(
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

      const notification = WebhookNotification.create(
        tenantId,
        templateId,
        recipients,
        specialData,
        priority,
      );

      expect(notification.data).toEqual(specialData);
    });

    it('应该处理超长消息内容', () => {
      const longMessage = 'a'.repeat(10000); // Webhook通常有更大的长度限制
      const longData = { message: longMessage };

      const notification = WebhookNotification.create(
        tenantId,
        templateId,
        recipients,
        longData,
        priority,
      );

      expect(notification.data).toEqual(longData);
    });

    it('应该处理复杂的JSON数据结构', () => {
      const complexData = {
        user: {
          id: 123,
          name: '张三',
          email: 'zhangsan@example.com',
          profile: {
            avatar: 'https://example.com/avatar.jpg',
            bio: '这是一个测试用户',
            preferences: {
              language: 'zh-CN',
              timezone: 'Asia/Shanghai',
              notifications: {
                email: true,
                sms: false,
                push: true,
              },
            },
          },
        },
        event: {
          type: 'user_registration',
          timestamp: new Date().toISOString(),
          metadata: {
            source: 'web',
            ip: '192.168.1.1',
            userAgent: 'Mozilla/5.0...',
          },
        },
      };

      const notification = WebhookNotification.create(
        tenantId,
        templateId,
        recipients,
        complexData,
        priority,
      );

      expect(notification.data).toEqual(complexData);
    });

    it('应该处理Webhook URL格式变化', () => {
      const differentFormatUrls = [
        MockWebhookUrl.create('https://api.example.com/webhook'),
        MockWebhookUrl.create('https://webhook.site/abc123'),
        MockWebhookUrl.create(
          'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX',
        ),
        MockWebhookUrl.create(
          'https://discord.com/api/webhooks/123456789/abcdefghijklmnopqrstuvwxyz',
        ),
      ];

      const notification = WebhookNotification.create(
        tenantId,
        templateId,
        differentFormatUrls,
        data,
        priority,
      );

      expect(notification.recipients).toEqual(differentFormatUrls);
      expect(notification.recipientUrls).toEqual([
        'https://api.example.com/webhook',
        'https://webhook.site/abc123',
        'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX',
        'https://discord.com/api/webhooks/123456789/abcdefghijklmnopqrstuvwxyz',
      ]);
    });
  });
});
