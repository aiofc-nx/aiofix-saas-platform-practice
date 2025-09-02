/**
 * @file email-notification-aggregate.spec.ts
 * @description 邮件通知聚合单元测试
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
// Mock EmailAddress
class MockEmailAddress {
  constructor(public readonly value: string) {}
  
  static create(email: string): MockEmailAddress {
    return new MockEmailAddress(email);
  }
}

// Mock EmailSubject
class MockEmailSubject {
  constructor(public readonly value: string) {}
  
  static create(subject: string): MockEmailSubject {
    return new MockEmailSubject(subject);
  }
}

// Mock the imports
jest.mock('@aiofix/shared', () => ({
  ...(jest.requireActual('@aiofix/shared') as Record<string, unknown>),
  EmailAddress: MockEmailAddress,
}));

import { EmailNotificationAggregate, CreateEmailNotificationCommand, SendEmailNotificationCommand, FailEmailNotificationCommand } from './email-notification-aggregate';
import { EmailNotification } from '../entities/email-notification.entity';
import { EmailNotificationRepository } from '../repositories/email-notification.repository';
import { Uuid } from '@aiofix/shared';
import { NotificationStatus, NotificationPriority } from '@aiofix/shared';

jest.mock('../entities/email-notification.entity', () => ({
  EmailNotification: {
    create: jest.fn(),
  },
}));

  describe('EmailNotificationAggregate', () => {
    let aggregate: EmailNotificationAggregate;
    let mockRepository: jest.Mocked<EmailNotificationRepository>;
    let tenantId: Uuid;
    let templateId: Uuid;
    let mockNotification: jest.Mocked<EmailNotification>;

    // Helper functions for creating test commands
    const createSendCommand = (): SendEmailNotificationCommand => ({
      notificationId: mockNotification.id.toString(),
      provider: 'smtp',
      messageId: 'msg-123',
      deliveryStatus: 'delivered',
      providerMessageId: 'provider-msg-123',
      retryCount: 1
    });

    const createFailCommand = (): FailEmailNotificationCommand => ({
      notificationId: mockNotification.id.toString(),
      errorCode: 'SMTP_ERROR',
      errorMessage: '连接超时',
      errorDetails: { timeout: 30000 },
      provider: 'smtp',
      retryCount: 1,
      maxRetries: 3,
      canRetry: true
    });

  beforeEach(() => {
    mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      delete: jest.fn(),
    } as any;

    aggregate = new EmailNotificationAggregate(mockRepository);

    tenantId = Uuid.generate();
    templateId = Uuid.generate();

    // Mock EmailNotification
    mockNotification = {
      id: Uuid.generate(),
      status: NotificationStatus.PENDING,
      canRetry: true,
      retryCount: 0,
      maxRetries: 3,
      markAsSent: jest.fn(),
      markAsFailed: jest.fn(),
      resetForRetry: jest.fn(),
      markAsCancelled: jest.fn(),
    } as any;

    (EmailNotification.create as jest.Mock).mockReturnValue(mockNotification);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('创建邮件通知', () => {
    it('应该成功创建邮件通知', async () => {
      const createCommand: CreateEmailNotificationCommand = {
        tenantId: tenantId.toString(),
        templateId: templateId.toString(),
        recipients: ['user1@example.com', 'user2@example.com'],
        data: { userName: '张三', company: '测试公司' },
        priority: NotificationPriority.HIGH,
        scheduledAt: new Date('2024-12-25T10:00:00Z'),
        metadata: { source: 'system', category: 'notification' }
      };

      const result = await aggregate.createEmailNotification(createCommand);

      expect(EmailNotification.create).toHaveBeenCalledWith(
        expect.any(Uuid), // tenantId
        expect.any(Uuid), // templateId
        expect.arrayContaining([
          expect.any(MockEmailAddress),
          expect.any(MockEmailAddress)
        ]), // recipients
        createCommand.data,
        createCommand.priority,
        createCommand.scheduledAt,
        undefined, // subject
        createCommand.metadata
      );

      expect(mockRepository.save).toHaveBeenCalledWith(mockNotification);
      expect(result).toBe(mockNotification);
    });

    it('应该成功创建带主题的邮件通知', async () => {
      const createCommand: CreateEmailNotificationCommand = {
        tenantId: tenantId.toString(),
        templateId: templateId.toString(),
        recipients: ['user1@example.com', 'user2@example.com'],
        data: { userName: '张三', company: '测试公司' },
        priority: NotificationPriority.HIGH,
        scheduledAt: new Date('2024-12-25T10:00:00Z'),
        metadata: { source: 'system', category: 'notification' }
      };

      const commandWithSubject = {
        ...createCommand,
        subject: '测试邮件主题'
      };

      await aggregate.createEmailNotification(commandWithSubject);

      expect(EmailNotification.create).toHaveBeenCalledWith(
        expect.any(Uuid),
        expect.any(Uuid),
        expect.any(Array),
        commandWithSubject.data,
        commandWithSubject.priority,
        commandWithSubject.scheduledAt,
        expect.objectContaining({ _value: '测试邮件主题' }), // subject
        commandWithSubject.metadata
      );
    });

    it('应该成功创建不带计划时间的邮件通知', async () => {
      const createCommand: CreateEmailNotificationCommand = {
        tenantId: tenantId.toString(),
        templateId: templateId.toString(),
        recipients: ['user1@example.com', 'user2@example.com'],
        data: { userName: '张三', company: '测试公司' },
        priority: NotificationPriority.HIGH,
        scheduledAt: new Date('2024-12-25T10:00:00Z'),
        metadata: { source: 'system', category: 'notification' }
      };

      const commandWithoutSchedule = {
        ...createCommand,
        scheduledAt: undefined
      };

      await aggregate.createEmailNotification(commandWithoutSchedule);

      expect(EmailNotification.create).toHaveBeenCalledWith(
        expect.any(Uuid),
        expect.any(Uuid),
        expect.any(Array),
        commandWithoutSchedule.data,
        commandWithoutSchedule.priority,
        undefined, // scheduledAt
        undefined, // subject
        commandWithoutSchedule.metadata
      );
    });

    it('应该成功创建不带元数据的邮件通知', async () => {
      const createCommand: CreateEmailNotificationCommand = {
        tenantId: tenantId.toString(),
        templateId: templateId.toString(),
        recipients: ['user1@example.com', 'user2@example.com'],
        data: { userName: '张三', company: '测试公司' },
        priority: NotificationPriority.HIGH,
        scheduledAt: new Date('2024-12-25T10:00:00Z'),
        metadata: { source: 'system', category: 'notification' }
      };

      const commandWithoutMetadata = {
        ...createCommand,
        metadata: undefined
      };

      await aggregate.createEmailNotification(commandWithoutMetadata);

      expect(EmailNotification.create).toHaveBeenCalledWith(
        expect.any(Uuid),
        expect.any(Uuid),
        expect.any(Array),
        commandWithoutMetadata.data,
        commandWithoutMetadata.priority,
        commandWithoutMetadata.scheduledAt,
        undefined, // subject
        undefined // metadata
      );
    });
  });

  describe('发送邮件通知', () => {
    beforeEach(() => {
      aggregate['notification'] = mockNotification;
    });

    it('应该成功发送邮件通知', async () => {
      const sendCommand = createSendCommand();

      await aggregate.sendEmailNotification(sendCommand);

      expect(mockNotification.markAsSent).toHaveBeenCalledWith({
        messageId: sendCommand.messageId,
        deliveryStatus: sendCommand.deliveryStatus,
        provider: sendCommand.provider,
        providerMessageId: sendCommand.providerMessageId,
        retryCount: sendCommand.retryCount,
      });

      expect(mockRepository.save).toHaveBeenCalledWith(mockNotification);
    });

    it('应该拒绝发送不存在的通知', async () => {
      const sendCommand = createSendCommand();

      aggregate['notification'] = null;

      await expect(aggregate.sendEmailNotification(sendCommand))
        .rejects.toThrow('邮件通知不存在');
    });

    it('应该拒绝发送非待发送状态的通知', async () => {
      const sendCommand = createSendCommand();
      (mockNotification as any).status = NotificationStatus.SENT;

      await expect(aggregate.sendEmailNotification(sendCommand))
        .rejects.toThrow('无法发送状态为 SENT 的邮件通知');
    });

    it('应该拒绝发送非待发送状态的通知（其他状态）', async () => {
      const sendCommand = createSendCommand();
      (mockNotification as any).status = NotificationStatus.FAILED;

      await expect(aggregate.sendEmailNotification(sendCommand))
        .rejects.toThrow('无法发送状态为 FAILED 的邮件通知');
    });
  });

  describe('邮件通知发送失败', () => {
    beforeEach(() => {
      aggregate['notification'] = mockNotification;
    });

    it('应该成功标记邮件通知为失败', async () => {
      const failCommand = createFailCommand();

      await aggregate.failEmailNotification(failCommand);

      expect(mockNotification.markAsFailed).toHaveBeenCalledWith({
        errorCode: failCommand.errorCode,
        errorMessage: failCommand.errorMessage,
        errorDetails: failCommand.errorDetails,
        provider: failCommand.provider,
        retryCount: failCommand.retryCount,
        maxRetries: failCommand.maxRetries,
        canRetry: failCommand.canRetry,
      });

      expect(mockRepository.save).toHaveBeenCalledWith(mockNotification);
    });

    it('应该拒绝标记不存在的通知为失败', async () => {
      const failCommand = createFailCommand();
      aggregate['notification'] = null;

      await expect(aggregate.failEmailNotification(failCommand))
        .rejects.toThrow('邮件通知不存在');
    });

    it('应该拒绝标记非待发送状态的通知为失败', async () => {
      const failCommand = createFailCommand();
      (mockNotification as any).status = NotificationStatus.SENT;

      await expect(aggregate.failEmailNotification(failCommand))
        .rejects.toThrow('无法标记状态为 SENT 的邮件通知为失败');
    });
  });

  describe('重试邮件通知', () => {
    beforeEach(() => {
      aggregate['notification'] = mockNotification;
    });

    it('应该成功重试邮件通知', async () => {
      await aggregate.retryEmailNotification();

      expect(mockNotification.resetForRetry).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalledWith(mockNotification);
    });

    it('应该拒绝重试不存在的通知', async () => {
      aggregate['notification'] = null;

      await expect(aggregate.retryEmailNotification())
        .rejects.toThrow('邮件通知不存在');
    });

    it('应该拒绝重试无法重试的通知', async () => {
      (mockNotification as any).canRetry = false;

      await expect(aggregate.retryEmailNotification())
        .rejects.toThrow('邮件通知无法重试');
    });

    it('应该拒绝重试超过最大次数的通知', async () => {
      (mockNotification as any).retryCount = 3;
      (mockNotification as any).maxRetries = 3;

      await expect(aggregate.retryEmailNotification())
        .rejects.toThrow('邮件通知已达到最大重试次数');
    });
  });

  describe('取消邮件通知', () => {
    beforeEach(() => {
      aggregate['notification'] = mockNotification;
    });

    it('应该成功取消邮件通知', async () => {
      await aggregate.cancelEmailNotification();

      expect(mockNotification.markAsCancelled).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalledWith(mockNotification);
    });

    it('应该拒绝取消不存在的通知', async () => {
      aggregate['notification'] = null;

      await expect(aggregate.cancelEmailNotification())
        .rejects.toThrow('邮件通知不存在');
    });

    it('应该拒绝取消已发送的通知', async () => {
      (mockNotification as any).status = NotificationStatus.SENT;

      await expect(aggregate.cancelEmailNotification())
        .rejects.toThrow('已发送的邮件通知无法取消');
    });

    it('应该拒绝取消已失败的通知', async () => {
      (mockNotification as any).status = NotificationStatus.FAILED;

      await expect(aggregate.cancelEmailNotification())
        .rejects.toThrow('已失败的邮件通知无法取消');
    });
  });

  describe('加载邮件通知', () => {
    it('应该成功加载邮件通知', async () => {
      const notificationId = mockNotification.id.toString();
      mockRepository.findById.mockResolvedValue(mockNotification);

      await aggregate.loadEmailNotification(notificationId);

      expect(mockRepository.findById).toHaveBeenCalledWith(expect.any(Uuid));
      expect(aggregate['notification']).toBe(mockNotification);
    });

    it('应该处理找不到通知的情况', async () => {
      const notificationId = mockNotification.id.toString();
      mockRepository.findById.mockResolvedValue(null);

      await aggregate.loadEmailNotification(notificationId);

      expect(aggregate['notification']).toBe(null);
    });
  });

  describe('删除邮件通知', () => {
    beforeEach(() => {
      aggregate['notification'] = mockNotification;
    });

    it('应该成功删除邮件通知', async () => {
      (mockNotification as any).status = NotificationStatus.SENT;
      
      await aggregate.deleteEmailNotification();

      expect(mockRepository.delete).toHaveBeenCalledWith(mockNotification.id);
      expect(aggregate['notification']).toBe(null);
    });

    it('应该拒绝删除不存在的通知', async () => {
      aggregate['notification'] = null;

      await expect(aggregate.deleteEmailNotification())
        .rejects.toThrow('邮件通知不存在');
    });

    it('应该拒绝删除待发送状态的通知', async () => {
      (mockNotification as any).status = NotificationStatus.PENDING;

      await expect(aggregate.deleteEmailNotification())
        .rejects.toThrow('待发送的邮件通知无法删除');
    });
  });

  describe('获取邮件通知', () => {
    it('应该返回当前通知', () => {
      aggregate['notification'] = mockNotification;

      const result = aggregate.getEmailNotification();

      expect(result).toBe(mockNotification);
    });

    it('应该返回null当没有通知时', () => {
      aggregate['notification'] = null;

      const result = aggregate.getEmailNotification();

      expect(result).toBe(null);
    });
  });

  describe('领域事件', () => {
    it('应该正确管理领域事件', () => {
      const events = aggregate.domainEvents;
      expect(Array.isArray(events)).toBe(true);
      expect(events.length).toBe(0);

      aggregate.clearDomainEvents();
      expect(aggregate.domainEvents.length).toBe(0);
    });
  });
});

