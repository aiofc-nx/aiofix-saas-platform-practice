/**
 * @file email-notification-domain.service.spec.ts
 * @description 邮件通知领域服务单元测试
 *
 * 测试覆盖范围：
 * - 邮件通知验证功能
 * - 邮件路由策略
 * - 重试策略计算
 * - 批量发送优化
 * - 邮件统计功能
 */

import { EmailNotificationDomainService } from './email-notification-domain.service';
import { EmailNotification } from '../entities/email-notification.entity';
import { EmailAddress, NotificationStatus, NotificationPriority, Uuid } from '@aiofix/shared';

// 模拟 EmailNotificationRepository 接口
interface EmailNotificationRepository {
  getStatistics(tenantId: string, fromDate?: Date, toDate?: Date): Promise<any>;
  countByPriority(tenantId: string): Promise<Record<NotificationPriority, number>>;
  countByStatus(tenantId: string): Promise<Record<NotificationStatus, number>>;
}

describe('EmailNotificationDomainService', () => {
  let service: EmailNotificationDomainService;
  let mockEmailNotificationRepository: jest.Mocked<EmailNotificationRepository>;

  beforeEach(async () => {
    const mockRepository = {
      getStatistics: jest.fn(),
      countByPriority: jest.fn(),
      countByStatus: jest.fn(),
    };

    service = new EmailNotificationDomainService(mockRepository as any);
    mockEmailNotificationRepository = mockRepository as any;
  });

  describe('validateEmailNotification', () => {
    let validNotification: EmailNotification;

    beforeEach(() => {
      validNotification = EmailNotification.create(
        Uuid.generate(),
        Uuid.generate(),
        [EmailAddress.create('test@example.com')],
        { userName: 'John' },
        NotificationPriority.NORMAL
      );
    });

    it('应该验证有效的邮件通知', () => {
      const result = service.validateEmailNotification(validNotification);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    it('应该检测空的收件人列表', () => {
      const notificationWithNoRecipients = EmailNotification.create(
        Uuid.generate(),
        Uuid.generate(),
        [],
        { userName: 'John' },
        NotificationPriority.NORMAL
      );

      const result = service.validateEmailNotification(notificationWithNoRecipients);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('邮件通知必须包含至少一个收件人');
    });

    it('应该检测无效的邮箱地址', () => {
      // 创建一个有效的通知，然后修改收件人
      const notificationWithInvalidEmail = {
        ...validNotification,
        recipients: [{ value: 'invalid-email' } as any],
        data: validNotification.data,
        templateId: validNotification.templateId,
        priority: validNotification.priority,
      } as any;

      const result = service.validateEmailNotification(notificationWithInvalidEmail);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('无效的邮箱地址: invalid-email');
    });

    it('应该检测无效的优先级', () => {
      const notificationWithInvalidPriority = {
        ...validNotification,
        priority: 'INVALID_PRIORITY' as any,
        recipients: validNotification.recipients,
        data: validNotification.data,
      } as any;

      const result = service.validateEmailNotification(notificationWithInvalidPriority);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('邮件通知必须包含有效的优先级');
    });

    it('应该检测过去的计划发送时间', () => {
      const pastDate = new Date();
      pastDate.setHours(pastDate.getHours() - 1);

      const notificationWithPastSchedule = {
        ...validNotification,
        scheduledAt: pastDate,
        recipients: validNotification.recipients,
        data: validNotification.data,
      } as any;

      const result = service.validateEmailNotification(notificationWithPastSchedule);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('计划发送时间必须晚于当前时间');
    });

    it('应该检测过大的数据', () => {
      const largeData = { largeField: 'x'.repeat(10000) };
      const notificationWithLargeData = {
        ...validNotification,
        data: largeData,
        recipients: validNotification.recipients,
        templateId: validNotification.templateId,
        priority: validNotification.priority,
      } as any;

      const result = service.validateEmailNotification(notificationWithLargeData);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('邮件数据过大，可能影响发送性能');
    });

    it('应该检测过多的收件人', () => {
      const manyRecipients = Array.from({ length: 101 }, (_, i) => 
        EmailAddress.create(`user${i}@example.com`)
      );
      const notificationWithManyRecipients = {
        ...validNotification,
        recipients: manyRecipients,
        data: validNotification.data,
        templateId: validNotification.templateId,
        priority: validNotification.priority,
      } as any;

      const result = service.validateEmailNotification(notificationWithManyRecipients);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('收件人数量过多，建议分批发送');
    });
  });

  describe('determineEmailRouting', () => {
    let validNotification: EmailNotification;

    beforeEach(() => {
      validNotification = EmailNotification.create(
        Uuid.generate(),
        Uuid.generate(),
        [EmailAddress.create('test@example.com')],
        { userName: 'John' },
        NotificationPriority.NORMAL
      );
    });

    it('应该立即发送高优先级邮件', () => {
      const highPriorityNotification = {
        ...validNotification,
        priority: NotificationPriority.HIGH,
      } as EmailNotification;

      const result = service.determineEmailRouting(highPriorityNotification);

      expect(result.shouldSend).toBe(true);
      expect(result.priority).toBe(NotificationPriority.HIGH);
      expect(result.reason).toBeUndefined();
    });

    it('应该延迟发送计划邮件', () => {
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 1);

      const scheduledNotification = {
        ...validNotification,
        scheduledAt: futureDate,
      } as EmailNotification;

      const result = service.determineEmailRouting(scheduledNotification);

      expect(result.shouldSend).toBe(false);
      expect(result.reason).toBe('邮件计划在将来发送');
      expect(result.scheduledAt).toEqual(futureDate);
    });

    it('应该正常发送普通优先级邮件', () => {
      const result = service.determineEmailRouting(validNotification);

      expect(result.shouldSend).toBe(true);
      expect(result.priority).toBe(NotificationPriority.NORMAL);
      expect(result.reason).toBeUndefined();
    });
  });

  describe('calculateRetryStrategy', () => {
    let validNotification: EmailNotification;

    beforeEach(() => {
      validNotification = EmailNotification.create(
        Uuid.generate(),
        Uuid.generate(),
        [EmailAddress.create('test@example.com')],
        { userName: 'John' },
        NotificationPriority.NORMAL
      );
    });

    it('应该允许重试临时错误', () => {
      const result = service.calculateRetryStrategy(validNotification, 'TEMPORARY_FAILURE');

      expect(result.shouldRetry).toBe(true);
      expect(result.retryDelay).toBeGreaterThan(0);
      expect(result.maxRetries).toBe(validNotification.maxRetries);
    });

    it('应该允许重试频率限制错误', () => {
      const result = service.calculateRetryStrategy(validNotification, 'RATE_LIMIT_EXCEEDED');

      expect(result.shouldRetry).toBe(true);
      expect(result.retryDelay).toBeGreaterThan(0);
    });

    it('不应该重试永久错误', () => {
      const result = service.calculateRetryStrategy(validNotification, 'INVALID_EMAIL');

      expect(result.shouldRetry).toBe(false);
      expect(result.retryDelay).toBe(0);
    });

    it('不应该重试已达到最大重试次数的邮件', () => {
      const notificationWithMaxRetries = {
        ...validNotification,
        retryCount: 3,
        maxRetries: 3,
      } as EmailNotification;

      const result = service.calculateRetryStrategy(notificationWithMaxRetries, 'TEMPORARY_FAILURE');

      expect(result.shouldRetry).toBe(false);
      expect(result.retryDelay).toBe(0);
    });

    it('应该使用指数退避策略', () => {
      const notificationWithRetryCount = {
        ...validNotification,
        retryCount: 2,
      } as EmailNotification;

      const result = service.calculateRetryStrategy(notificationWithRetryCount, 'TEMPORARY_FAILURE');

      expect(result.shouldRetry).toBe(true);
      expect(result.retryDelay).toBe(240000); // 4分钟 (60 * 2^2)
    });
  });

  describe('optimizeBatchSending', () => {
    let notifications: EmailNotification[];

    beforeEach(() => {
      notifications = [
        EmailNotification.create(
          Uuid.generate(),
          Uuid.generate(),
          [EmailAddress.create('user1@example.com')],
          {},
          NotificationPriority.HIGH
        ),
        EmailNotification.create(
          Uuid.generate(),
          Uuid.generate(),
          [EmailAddress.create('user2@example.com')],
          {},
          NotificationPriority.NORMAL
        ),
        EmailNotification.create(
          Uuid.generate(),
          Uuid.generate(),
          [EmailAddress.create('user3@example.com')],
          {},
          NotificationPriority.LOW
        ),
      ];
    });

    it('应该按优先级分组邮件', async () => {
      const batches = await service.optimizeBatchSending(notifications, 2);

      expect(batches).toHaveLength(2);
      expect(batches[0]).toHaveLength(2); // 高优先级 + 普通优先级
      expect(batches[1]).toHaveLength(1); // 低优先级
      expect(batches[0][0].priority).toBe(NotificationPriority.HIGH);
      expect(batches[0][1].priority).toBe(NotificationPriority.NORMAL);
      expect(batches[1][0].priority).toBe(NotificationPriority.LOW);
    });

    it('应该处理空的通知列表', async () => {
      const batches = await service.optimizeBatchSending([], 10);

      expect(batches).toHaveLength(0);
    });

    it('应该处理单个通知', async () => {
      const batches = await service.optimizeBatchSending([notifications[0]], 10);

      expect(batches).toHaveLength(1);
      expect(batches[0]).toHaveLength(1);
      expect(batches[0][0]).toBe(notifications[0]);
    });
  });

  describe('getEmailStatistics', () => {
    const tenantId = 'tenant-123';

    beforeEach(() => {
      mockEmailNotificationRepository.getStatistics.mockResolvedValue({
        total: 100,
        sent: 80,
        failed: 10,
        pending: 10,
        successRate: 0.8,
        averageDeliveryTime: 5000,
      });

      mockEmailNotificationRepository.countByPriority.mockResolvedValue({
        [NotificationPriority.HIGH]: 20,
        [NotificationPriority.NORMAL]: 60,
        [NotificationPriority.LOW]: 20,
        [NotificationPriority.URGENT]: 0,
      });

      mockEmailNotificationRepository.countByStatus.mockResolvedValue({
        [NotificationStatus.SENT]: 80,
        [NotificationStatus.FAILED]: 10,
        [NotificationStatus.PENDING]: 10,
        [NotificationStatus.SENDING]: 0,
        [NotificationStatus.CANCELLED]: 0,
      });
    });

    it('应该获取完整的邮件统计信息', async () => {
      const result = await service.getEmailStatistics(tenantId);

      expect(result.total).toBe(100);
      expect(result.sent).toBe(80);
      expect(result.failed).toBe(10);
      expect(result.pending).toBe(10);
      expect(result.successRate).toBe(0.8);
      expect(result.averageDeliveryTime).toBe(5000);
      expect(result.byPriority[NotificationPriority.HIGH]).toBe(20);
      expect(result.byPriority[NotificationPriority.NORMAL]).toBe(60);
      expect(result.byPriority[NotificationPriority.LOW]).toBe(20);
      expect(result.byStatus[NotificationStatus.SENT]).toBe(80);
      expect(result.byStatus[NotificationStatus.FAILED]).toBe(10);
      expect(result.byStatus[NotificationStatus.PENDING]).toBe(10);
    });

    it('应该支持日期范围查询', async () => {
      const fromDate = new Date('2024-01-01');
      const toDate = new Date('2024-12-31');

      await service.getEmailStatistics(tenantId, fromDate, toDate);

      expect(mockEmailNotificationRepository.getStatistics).toHaveBeenCalledWith(
        tenantId,
        fromDate,
        toDate
      );
    });
  });

  describe('边界情况', () => {
    it('应该处理无效的邮件通知对象', () => {
      const invalidNotification = {} as EmailNotification;

      expect(() => service.validateEmailNotification(invalidNotification)).toThrow();
    });

    it('应该处理空的路由设置', () => {
      const validNotification = EmailNotification.create(
        Uuid.generate(),
        Uuid.generate(),
        [EmailAddress.create('test@example.com')],
        {},
        NotificationPriority.NORMAL
      );

      const result = service.determineEmailRouting(validNotification, {});

      expect(result.shouldSend).toBe(true);
      expect(result.priority).toBe(NotificationPriority.NORMAL);
    });

    it('应该处理未知的错误代码', () => {
      const validNotification = EmailNotification.create(
        Uuid.generate(),
        Uuid.generate(),
        [EmailAddress.create('test@example.com')],
        {},
        NotificationPriority.NORMAL
      );

      const result = service.calculateRetryStrategy(validNotification, 'UNKNOWN_ERROR');

      expect(result.shouldRetry).toBe(false);
      expect(result.retryDelay).toBe(0);
    });
  });
});
