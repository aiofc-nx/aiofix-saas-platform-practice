/**
 * @file webhook-notification-domain.service.spec.ts
 * @description Webhook通知领域服务单元测试
 *
 * 测试覆盖范围：
 * - Webhook通知验证功能
 * - Webhook路由策略
 * - 重试策略计算
 * - 批量发送优化
 * - Webhook统计功能
 */

import { WebhookNotificationDomainService } from './webhook-notification-domain.service';
import { WebhookNotification } from '../entities/webhook-notification.entity';
import { NotificationStatus, NotificationPriority, Uuid } from '@aiofix/shared';

// 模拟 WebhookNotificationRepository 接口
interface WebhookNotificationRepository {
  getStatistics(
    tenantId: string,
    fromDate?: Date,
    toDate?: Date,
  ): Promise<unknown>;
  countByPriority(
    tenantId: string,
  ): Promise<Record<NotificationPriority, number>>;
  countByStatus(tenantId: string): Promise<Record<NotificationStatus, number>>;
  countByProtocol(tenantId: string): Promise<Record<string, number>>;
}

describe('WebhookNotificationDomainService', () => {
  let service: WebhookNotificationDomainService;
  let mockWebhookNotificationRepository: jest.Mocked<WebhookNotificationRepository>;

  beforeEach(async () => {
    const mockRepository = {
      getStatistics: jest.fn(),
      countByPriority: jest.fn(),
      countByStatus: jest.fn(),
      countByProtocol: jest.fn(),
    };

    service = new WebhookNotificationDomainService(mockRepository as unknown);
    mockWebhookNotificationRepository = mockRepository as unknown;
  });

  describe('validateWebhookNotification', () => {
    let validNotification: WebhookNotification;

    beforeEach(() => {
      validNotification = WebhookNotification.create(
        Uuid.generate(),
        Uuid.generate(),
        ['https://api.example.com/webhook'],
        { userName: 'John' },
        NotificationPriority.NORMAL,
      );
    });

    it('应该验证有效的Webhook通知', () => {
      const result = service.validateWebhookNotification(validNotification);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    it('应该检测空的收件人列表', () => {
      const notificationWithNoRecipients = WebhookNotification.create(
        Uuid.generate(),
        Uuid.generate(),
        [],
        { userName: 'John' },
        NotificationPriority.NORMAL,
      );

      const result = service.validateWebhookNotification(
        notificationWithNoRecipients,
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Webhook通知必须包含至少一个收件人');
    });

    it('应该检测无效的Webhook URL', () => {
      const notificationWithInvalidUrl = {
        ...validNotification,
        recipients: ['invalid-url'],
        data: validNotification.data,
        templateId: validNotification.templateId,
        priority: validNotification.priority,
      } as unknown;

      const result = service.validateWebhookNotification(
        notificationWithInvalidUrl,
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('无效的Webhook URL: invalid-url');
    });

    it('应该检测无效的优先级', () => {
      const notificationWithInvalidPriority = {
        ...validNotification,
        priority: 'INVALID_PRIORITY' as unknown,
        recipients: validNotification.recipients,
        data: validNotification.data,
        templateId: validNotification.templateId,
      } as unknown;

      const result = service.validateWebhookNotification(
        notificationWithInvalidPriority,
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Webhook通知必须包含有效的优先级');
    });

    it('应该检测过去的计划发送时间', () => {
      const pastDate = new Date();
      pastDate.setHours(pastDate.getHours() - 1);

      const notificationWithPastSchedule = {
        ...validNotification,
        scheduledAt: pastDate,
        recipients: validNotification.recipients,
        data: validNotification.data,
        templateId: validNotification.templateId,
        priority: validNotification.priority,
      } as unknown;

      const result = service.validateWebhookNotification(
        notificationWithPastSchedule,
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('计划发送时间必须晚于当前时间');
    });

    it('应该检测过大的数据', () => {
      const largeData = { largeField: 'x'.repeat(100000) };
      const notificationWithLargeData = {
        ...validNotification,
        data: largeData,
        recipients: validNotification.recipients,
        templateId: validNotification.templateId,
        priority: validNotification.priority,
      } as unknown;

      const result = service.validateWebhookNotification(
        notificationWithLargeData,
      );

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Webhook数据过大，可能影响发送性能');
    });

    it('应该检测过多的收件人', () => {
      const manyRecipients = Array.from(
        { length: 101 },
        (_, i) => `https://api${i}.example.com/webhook`,
      );
      const notificationWithManyRecipients = {
        ...validNotification,
        recipients: manyRecipients,
        data: validNotification.data,
        templateId: validNotification.templateId,
        priority: validNotification.priority,
      } as unknown;

      const result = service.validateWebhookNotification(
        notificationWithManyRecipients,
      );

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('收件人数量过多，建议分批发送');
    });
  });

  describe('determineWebhookRouting', () => {
    let validNotification: WebhookNotification;

    beforeEach(() => {
      validNotification = WebhookNotification.create(
        Uuid.generate(),
        Uuid.generate(),
        ['https://api.example.com/webhook'],
        { userName: 'John' },
        NotificationPriority.NORMAL,
      );
    });

    it('应该立即发送高优先级Webhook', () => {
      const highPriorityNotification = {
        ...validNotification,
        priority: NotificationPriority.HIGH,
      } as WebhookNotification;

      const result = service.determineWebhookRouting(highPriorityNotification);

      expect(result.shouldSend).toBe(true);
      expect(result.priority).toBe(NotificationPriority.HIGH);
      expect(result.reason).toBeUndefined();
    });

    it('应该延迟发送计划Webhook', () => {
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 1);

      const scheduledNotification = {
        ...validNotification,
        scheduledAt: futureDate,
      } as WebhookNotification;

      const result = service.determineWebhookRouting(scheduledNotification);

      expect(result.shouldSend).toBe(false);
      expect(result.reason).toBe('Webhook计划在将来发送');
      expect(result.scheduledAt).toEqual(futureDate);
    });

    it('应该正常发送普通优先级Webhook', () => {
      const result = service.determineWebhookRouting(validNotification);

      expect(result.shouldSend).toBe(true);
      expect(result.priority).toBe(NotificationPriority.NORMAL);
      expect(result.reason).toBeUndefined();
    });
  });

  describe('calculateRetryStrategy', () => {
    let validNotification: WebhookNotification;

    beforeEach(() => {
      validNotification = WebhookNotification.create(
        Uuid.generate(),
        Uuid.generate(),
        ['https://api.example.com/webhook'],
        { userName: 'John' },
        NotificationPriority.NORMAL,
      );
    });

    it('应该允许重试临时错误', () => {
      const result = service.calculateRetryStrategy(
        validNotification,
        'TEMPORARY_FAILURE',
      );

      expect(result.shouldRetry).toBe(true);
      expect(result.retryDelay).toBeGreaterThan(0);
      expect(result.maxRetries).toBe(validNotification.maxRetries);
    });

    it('应该允许重试频率限制错误', () => {
      const result = service.calculateRetryStrategy(
        validNotification,
        'RATE_LIMIT_EXCEEDED',
      );

      expect(result.shouldRetry).toBe(true);
      expect(result.retryDelay).toBeGreaterThan(0);
    });

    it('不应该重试永久错误', () => {
      const result = service.calculateRetryStrategy(
        validNotification,
        'INVALID_URL',
      );

      expect(result.shouldRetry).toBe(false);
      expect(result.retryDelay).toBe(0);
    });

    it('不应该重试已达到最大重试次数的Webhook', () => {
      const notificationWithMaxRetries = {
        ...validNotification,
        retryCount: 3,
        maxRetries: 3,
      } as WebhookNotification;

      const result = service.calculateRetryStrategy(
        notificationWithMaxRetries,
        'TEMPORARY_FAILURE',
      );

      expect(result.shouldRetry).toBe(false);
      expect(result.retryDelay).toBe(0);
    });

    it('应该使用指数退避策略', () => {
      const notificationWithRetryCount = {
        ...validNotification,
        retryCount: 2,
      } as WebhookNotification;

      const result = service.calculateRetryStrategy(
        notificationWithRetryCount,
        'TEMPORARY_FAILURE',
      );

      expect(result.shouldRetry).toBe(true);
      expect(result.retryDelay).toBe(20000); // 20秒 (5 * 2^2)
    });
  });

  describe('optimizeBatchSending', () => {
    let notifications: WebhookNotification[];

    beforeEach(() => {
      notifications = [
        WebhookNotification.create(
          Uuid.generate(),
          Uuid.generate(),
          ['https://api1.example.com/webhook'],
          {},
          NotificationPriority.HIGH,
        ),
        WebhookNotification.create(
          Uuid.generate(),
          Uuid.generate(),
          ['https://api2.example.com/webhook'],
          {},
          NotificationPriority.NORMAL,
        ),
        WebhookNotification.create(
          Uuid.generate(),
          Uuid.generate(),
          ['https://api3.example.com/webhook'],
          {},
          NotificationPriority.LOW,
        ),
      ];
    });

    it('应该按优先级分组Webhook', async () => {
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
      const batches = await service.optimizeBatchSending(
        [notifications[0]],
        10,
      );

      expect(batches).toHaveLength(1);
      expect(batches[0]).toHaveLength(1);
      expect(batches[0][0]).toBe(notifications[0]);
    });
  });

  describe('getWebhookStatistics', () => {
    const tenantId = 'tenant-123';

    beforeEach(() => {
      mockWebhookNotificationRepository.getStatistics.mockResolvedValue({
        total: 100,
        sent: 80,
        failed: 10,
        pending: 10,
        successRate: 0.8,
        averageDeliveryTime: 1500,
      });

      mockWebhookNotificationRepository.countByPriority.mockResolvedValue({
        [NotificationPriority.HIGH]: 20,
        [NotificationPriority.NORMAL]: 60,
        [NotificationPriority.LOW]: 20,
        [NotificationPriority.URGENT]: 0,
      });

      mockWebhookNotificationRepository.countByStatus.mockResolvedValue({
        [NotificationStatus.SENT]: 80,
        [NotificationStatus.FAILED]: 10,
        [NotificationStatus.PENDING]: 10,
        [NotificationStatus.SENDING]: 0,
        [NotificationStatus.CANCELLED]: 0,
      });

      mockWebhookNotificationRepository.countByProtocol.mockResolvedValue({
        'http:': 30,
        'https:': 70,
      });
    });

    it('应该获取完整的Webhook统计信息', async () => {
      const result = await service.getWebhookStatistics(tenantId);

      expect(result.total).toBe(100);
      expect(result.sent).toBe(80);
      expect(result.failed).toBe(10);
      expect(result.pending).toBe(10);
      expect(result.successRate).toBe(0.8);
      expect(result.averageDeliveryTime).toBe(1500);
      expect(result.byPriority[NotificationPriority.HIGH]).toBe(20);
      expect(result.byPriority[NotificationPriority.NORMAL]).toBe(60);
      expect(result.byPriority[NotificationPriority.LOW]).toBe(20);
      expect(result.byStatus[NotificationStatus.SENT]).toBe(80);
      expect(result.byStatus[NotificationStatus.FAILED]).toBe(10);
      expect(result.byStatus[NotificationStatus.PENDING]).toBe(10);
      expect(result.byProtocol['http:']).toBe(30);
      expect(result.byProtocol['https:']).toBe(70);
    });

    it('应该支持日期范围查询', async () => {
      const fromDate = new Date('2024-01-01');
      const toDate = new Date('2024-12-31');

      await service.getWebhookStatistics(tenantId, fromDate, toDate);

      expect(
        mockWebhookNotificationRepository.getStatistics,
      ).toHaveBeenCalledWith(tenantId, fromDate, toDate);
    });
  });

  describe('边界情况', () => {
    it('应该处理无效的Webhook通知对象', () => {
      const invalidNotification = {} as WebhookNotification;

      expect(() =>
        service.validateWebhookNotification(invalidNotification),
      ).toThrow();
    });

    it('应该处理空的路由设置', () => {
      const validNotification = WebhookNotification.create(
        Uuid.generate(),
        Uuid.generate(),
        ['https://api.example.com/webhook'],
        {},
        NotificationPriority.NORMAL,
      );

      const result = service.determineWebhookRouting(validNotification, {});

      expect(result.shouldSend).toBe(true);
      expect(result.priority).toBe(NotificationPriority.NORMAL);
    });

    it('应该处理未知的错误代码', () => {
      const validNotification = WebhookNotification.create(
        Uuid.generate(),
        Uuid.generate(),
        ['https://api.example.com/webhook'],
        {},
        NotificationPriority.NORMAL,
      );

      const result = service.calculateRetryStrategy(
        validNotification,
        'UNKNOWN_ERROR',
      );

      expect(result.shouldRetry).toBe(false);
      expect(result.retryDelay).toBe(0);
    });
  });
});
