/**
 * @file email-notification.entity.spec.ts
 * @description 邮件通知实体单元测试
 */

// Mock EmailAddress
class MockEmailAddress {
  public readonly _value: string;
  public readonly domain: string;
  public readonly localPart: string;

  constructor(value: string) {
    this._value = value;
    const parts = value.split('@');
    this.localPart = parts[0];
    this.domain = parts[1] || '';
  }
  
  static create(email: string): MockEmailAddress {
    return new MockEmailAddress(email);
  }

  equals(other: MockEmailAddress | null | undefined): boolean {
    if (!other) return false;
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}

// Mock the EmailAddress import
jest.mock('@aiofix/shared', () => ({
  ...(jest.requireActual('@aiofix/shared') as Record<string, unknown>),
  EmailAddress: MockEmailAddress,
}));

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { EmailNotification } from './email-notification.entity';
import { EmailSubject } from '../value-objects/email-subject.vo';
import { Uuid } from '@aiofix/shared';
import { NotificationType, NotificationStatus, NotificationPriority } from '@aiofix/shared';

describe('EmailNotification', () => {
  let tenantId: Uuid;
  let templateId: Uuid;
  let recipients: MockEmailAddress[];
  let data: Record<string, unknown>;
  let priority: NotificationPriority;

  beforeEach(() => {
    tenantId = Uuid.generate();
    templateId = Uuid.generate();
    recipients = [MockEmailAddress.create('test@example.com')];
    data = { userName: '张三', company: '测试公司' };
    priority = NotificationPriority.NORMAL;
  });

  describe('创建邮件通知', () => {
    it('应该成功创建邮件通知实例', () => {
      const notification = EmailNotification.create(
        tenantId,
        templateId,
        recipients as any,
        data,
        priority
      );

      expect(notification.type).toBe(NotificationType.EMAIL);
      expect(notification.templateId).toBe(templateId);
      expect(notification.recipients).toEqual(recipients);
      expect(notification.data).toEqual(data);
      expect(notification.priority).toBe(priority);
      expect(notification.status).toBe(NotificationStatus.PENDING);
      expect(notification.retryCount).toBe(0);
      expect(notification.maxRetries).toBe(3);
    });

    it('应该成功创建带主题的邮件通知', () => {
      const subject = EmailSubject.create('测试邮件主题');
      const notification = EmailNotification.create(
        tenantId,
        templateId,
        recipients as any,
        data,
        priority,
        undefined,
        subject
      );

      expect(notification.subject).toBe(subject);
    });

    it('应该成功创建带计划时间的邮件通知', () => {
      const scheduledAt = new Date('2024-12-25T10:00:00Z');
      const notification = EmailNotification.create(
        tenantId,
        templateId,
        recipients as any,
        data,
        priority,
        scheduledAt
      );

      expect(notification.scheduledAt).toEqual(scheduledAt);
    });

    it('应该成功创建带元数据的邮件通知', () => {
      const metadata = { source: 'system', category: 'notification' };
      const notification = EmailNotification.create(
        tenantId,
        templateId,
        recipients as any,
        data,
        priority,
        undefined,
        undefined,
        metadata
      );

      expect(notification.metadata).toEqual(metadata);
    });

    it('应该通过 createFromStrings 创建邮件通知', () => {
      const recipientEmails = ['user1@example.com', 'user2@example.com'];
      const notification = EmailNotification.createFromStrings(
        tenantId,
        templateId,
        recipientEmails,
        data,
        priority
      );

      expect(notification.recipientEmails).toEqual(recipientEmails);
      expect(notification.recipient).toBe(recipientEmails.join(','));
    });

    it('应该拒绝创建没有收件人的邮件通知', () => {
      expect(() => EmailNotification.createFromStrings(
        tenantId,
        templateId,
        [],
        data,
        priority
      )).toThrow('邮件通知必须包含至少一个收件人');
    });
  });

  describe('状态管理', () => {
    let notification: EmailNotification;

    beforeEach(() => {
      notification = EmailNotification.create(
        tenantId,
        templateId,
        recipients as any,
        data,
        priority
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
        provider: 'smtp',
        providerMessageId: 'provider-msg-123',
        retryCount: 0
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
        errorCode: 'SMTP_ERROR',
        errorMessage: '连接超时',
        errorDetails: { timeout: 30000 },
        provider: 'smtp',
        retryCount: 1,
        maxRetries: 3,
        canRetry: true
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
        errorCode: 'SMTP_ERROR',
        errorMessage: '连接超时',
        provider: 'smtp',
        retryCount: 0,
        maxRetries: 3,
        canRetry: true
      });

      notification.retry();

      expect(notification.status).toBe(NotificationStatus.PENDING);
      expect(notification.errorMessage).toBeUndefined();
      expect(notification.retryCount).toBe(1);
    });

    it('应该正确重置为可重试状态', () => {
      // 先标记为失败
      notification.markAsFailed({
        errorCode: 'SMTP_ERROR',
        errorMessage: '连接超时',
        provider: 'smtp',
        retryCount: 1,
        maxRetries: 3,
        canRetry: true
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
    let notification: EmailNotification;

    beforeEach(() => {
      notification = EmailNotification.create(
        tenantId,
        templateId,
        recipients as any,
        data,
        priority
      );
    });

    it('应该拒绝从非待发送状态标记为发送中', () => {
      notification.markAsSending();
      
      expect(() => notification.markAsSending()).toThrow('只有待发送状态的通知才能标记为发送中');
    });

    it('应该拒绝从非待发送状态标记为已发送', () => {
      notification.markAsSending();
      
      expect(() => notification.markAsSent({
        messageId: 'msg-123',
        deliveryStatus: 'delivered',
        provider: 'smtp',
        retryCount: 0
      })).toThrow('只有待发送状态的通知才能标记为已发送');
    });

    it('应该拒绝从非待发送状态标记为失败', () => {
      notification.markAsSending();
      
      expect(() => notification.markAsFailed({
        errorCode: 'SMTP_ERROR',
        errorMessage: '连接超时',
        provider: 'smtp',
        retryCount: 0,
        maxRetries: 3,
        canRetry: true
      })).toThrow('只有待发送状态的通知才能标记为失败');
    });

    it('应该拒绝从非失败状态重试', () => {
      expect(() => notification.retry()).toThrow('只有失败状态的通知才能重试');
    });

    it('应该拒绝从非失败状态重置重试', () => {
      expect(() => notification.resetForRetry()).toThrow('只有失败状态的通知才能重试');
    });

    it('应该拒绝重试超过最大次数', () => {
      // 先标记为失败
      notification.markAsFailed({
        errorCode: 'SMTP_ERROR',
        errorMessage: '连接超时',
        provider: 'smtp',
        retryCount: 2,
        maxRetries: 3,
        canRetry: true
      });

      // 重试3次，达到最大次数
      notification.retry(); // 第1次
      notification.markAsFailed({
        errorCode: 'SMTP_ERROR',
        errorMessage: '连接超时',
        provider: 'smtp',
        retryCount: 3,
        maxRetries: 3,
        canRetry: true
      });

      expect(() => notification.retry()).toThrow('已达到最大重试次数');
    });

    it('应该拒绝取消已发送的通知', () => {
      notification.markAsSent({
        messageId: 'msg-123',
        deliveryStatus: 'delivered',
        provider: 'smtp',
        retryCount: 0
      });

      expect(() => notification.cancel()).toThrow('已发送的通知不能取消');
    });

    it('应该拒绝取消已失败的通知', () => {
      notification.markAsFailed({
        errorCode: 'SMTP_ERROR',
        errorMessage: '连接超时',
        provider: 'smtp',
        retryCount: 0,
        maxRetries: 3,
        canRetry: true
      });

      expect(() => notification.cancel()).toThrow('已发送的通知不能取消');
    });
  });

  describe('定时发送功能', () => {
    it('应该正确识别是否为定时发送', () => {
      const notification1 = EmailNotification.create(
        tenantId,
        templateId,
        recipients as any,
        data,
        priority
      );
      expect(notification1.isScheduled()).toBe(false);

      const scheduledAt = new Date('2024-12-25T10:00:00Z');
      const notification2 = EmailNotification.create(
        tenantId,
        templateId,
        recipients as any,
        data,
        priority,
        scheduledAt
      );
      expect(notification2.isScheduled()).toBe(true);
    });

    it('应该正确判断是否应该立即发送', () => {
      const notification1 = EmailNotification.create(
        tenantId,
        templateId,
        recipients as any,
        data,
        priority
      );
      expect(notification1.shouldSendNow()).toBe(true);

      const futureTime = new Date();
      futureTime.setHours(futureTime.getHours() + 1);
      const notification2 = EmailNotification.create(
        tenantId,
        templateId,
        recipients as any,
        data,
        priority,
        futureTime
      );
      expect(notification2.shouldSendNow()).toBe(false);

      const pastTime = new Date();
      pastTime.setHours(pastTime.getHours() - 1);
      const notification3 = EmailNotification.create(
        tenantId,
        templateId,
        recipients as any,
        data,
        priority,
        pastTime
      );
      expect(notification3.shouldSendNow()).toBe(true);
    });
  });

  describe('收件人验证', () => {
    it('应该正确验证收件人格式', () => {
      const notification = EmailNotification.create(
        tenantId,
        templateId,
        recipients as any,
        data,
        priority
      );

      expect(notification.validateRecipient()).toBe(true);
    });

    it('应该正确处理多个收件人', () => {
      const multipleRecipients = [
        MockEmailAddress.create('user1@example.com'),
        MockEmailAddress.create('user2@example.com'),
        MockEmailAddress.create('user3@example.com')
      ];

      const notification = EmailNotification.create(
        tenantId,
        templateId,
        multipleRecipients as any,
        data,
        priority
      );

      expect(notification.recipients).toEqual(multipleRecipients);
      expect(notification.recipientEmails).toEqual([
        'user1@example.com',
        'user2@example.com',
        'user3@example.com'
      ]);
      expect(notification.recipient).toBe('user1@example.com,user2@example.com,user3@example.com');
    });
  });

  describe('数据访问', () => {
    let notification: EmailNotification;

    beforeEach(() => {
      notification = EmailNotification.create(
        tenantId,
        templateId,
        recipients as any,
        data,
        priority
      );
    });

    it('应该正确返回所有属性', () => {
      expect(notification.type).toBe(NotificationType.EMAIL);
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
});

