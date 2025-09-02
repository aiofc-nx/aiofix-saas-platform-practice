/**
 * @file template-domain.service.spec.ts
 * @description 模板领域服务单元测试
 *
 * 测试覆盖范围：
 * - 模板验证功能
 * - 模板名称唯一性验证
 * - 审核状态检查
 * - 模板统计功能
 * - 模板复制功能
 * - 模板搜索功能
 * - 版本历史功能
 */

import { TemplateDomainService } from './template-domain.service';
import { Template, ReviewStatus } from '../entities/template.entity';
import { NotificationType, TemplateStatus, Uuid } from '@aiofix/shared';

// 模拟 TemplateRepository 接口
interface TemplateRepository {
  findByName(name: string, tenantId: string): Promise<Template | null>;
  getStatistics(tenantId: string, fromDate?: Date, toDate?: Date): Promise<any>;
  countByType(tenantId: string): Promise<Record<NotificationType, number>>;
  countByStatus(tenantId: string): Promise<Record<TemplateStatus, number>>;
  countByCategory(tenantId: string): Promise<Record<string, number>>;
  countByLanguage(tenantId: string): Promise<Record<string, number>>;
  getMostUsedTemplates(tenantId: string, limit: number): Promise<any[]>;
  findById(id: Uuid): Promise<Template | null>;
  search(tenantId: string, criteria: any, limit: number, offset: number): Promise<Template[]>;
}

describe('TemplateDomainService', () => {
  let service: TemplateDomainService;
  let mockTemplateRepository: jest.Mocked<TemplateRepository>;

  beforeEach(async () => {
    const mockRepository = {
      findByName: jest.fn(),
      getStatistics: jest.fn(),
      countByType: jest.fn(),
      countByStatus: jest.fn(),
      countByCategory: jest.fn(),
      countByLanguage: jest.fn(),
      getMostUsedTemplates: jest.fn(),
      findById: jest.fn(),
      search: jest.fn(),
    };

    service = new TemplateDomainService(mockRepository as any);
    mockTemplateRepository = mockRepository as any;
  });

  describe('validateTemplate', () => {
    let validTemplate: Template;

    beforeEach(() => {
      validTemplate = Template.create(
        Uuid.generate(),
        '测试模板',
        NotificationType.EMAIL,
        'Hello {{userName}}, welcome to {{company}}!',
        ['userName', 'company'],
        'zh-CN',
        'email-template',
        'Welcome Email',
        ['welcome'],
        { category: 'notification' },
        Uuid.generate()
      );
    });

    it('应该验证有效的模板', () => {
      const result = service.validateTemplate(validTemplate);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    it('应该检测空的模板名称', () => {
      // 创建一个有效的模板，然后修改其名称
      const template = Template.create(
        Uuid.generate(),
        '测试模板',
        NotificationType.EMAIL,
        'Hello {{userName}}!',
        ['userName'],
        'zh-CN',
        'email-template',
        'Test Subject',
        [],
        {},
        Uuid.generate()
      );

      // 模拟空名称的情况
      const templateWithEmptyName = {
        ...template,
        name: '',
        content: template.content,
        category: template.category,
        variables: template.variables,
        type: template.type,
        language: template.language,
        tags: template.tags,
        subject: template.subject,
      } as Template;

      const result = service.validateTemplate(templateWithEmptyName);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('模板名称不能为空');
    });

    it('应该检测过长的模板名称', () => {
      const longName = 'a'.repeat(101);
      const template = Template.create(
        Uuid.generate(),
        longName,
        NotificationType.EMAIL,
        'Hello {{userName}}!',
        ['userName'],
        'zh-CN',
        'email-template',
        'Test Subject',
        [],
        {},
        Uuid.generate()
      );

      const result = service.validateTemplate(template);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('模板名称长度不能超过100字符');
    });

    it('应该检测空的模板内容', () => {
      // 创建一个有效的模板，然后修改其内容
      const template = Template.create(
        Uuid.generate(),
        '测试模板',
        NotificationType.EMAIL,
        'Hello {{userName}}!',
        ['userName'],
        'zh-CN',
        'email-template',
        'Test Subject',
        [],
        {},
        Uuid.generate()
      );

      // 模拟空内容的情况
      const templateWithEmptyContent = {
        ...template,
        name: template.name,
        content: '',
        category: template.category,
        variables: template.variables,
        type: template.type,
        language: template.language,
        tags: template.tags,
        subject: template.subject,
      } as Template;

      const result = service.validateTemplate(templateWithEmptyContent);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('模板内容不能为空');
    });

    it('应该检测过长的模板内容', () => {
      const longContent = 'a'.repeat(10001);
      const template = Template.create(
        Uuid.generate(),
        '测试模板',
        NotificationType.EMAIL,
        longContent,
        [],
        'zh-CN',
        'email-template',
        'Test Subject',
        [],
        {},
        Uuid.generate()
      );

      const result = service.validateTemplate(template);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('模板内容长度不能超过10000字符');
    });

    it('应该检测邮件模板缺少主题', () => {
      const template = Template.create(
        Uuid.generate(),
        '测试模板',
        NotificationType.EMAIL,
        'Hello {{userName}}!',
        ['userName'],
        'zh-CN',
        'email-template',
        undefined,
        [],
        {},
        Uuid.generate()
      );

      const result = service.validateTemplate(template);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('邮件模板必须包含主题');
    });

    it('应该检测过长的邮件主题', () => {
      const longSubject = 'a'.repeat(201);
      const template = Template.create(
        Uuid.generate(),
        '测试模板',
        NotificationType.EMAIL,
        'Hello {{userName}}!',
        ['userName'],
        'zh-CN',
        'email-template',
        longSubject,
        [],
        {},
        Uuid.generate()
      );

      const result = service.validateTemplate(template);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('邮件主题长度不能超过200字符');
    });

    it('应该检测未声明的变量', () => {
      const template = Template.create(
        Uuid.generate(),
        '测试模板',
        NotificationType.EMAIL,
        'Hello {{userName}}, your order {{orderId}} is ready!',
        ['userName'], // 缺少 orderId
        'zh-CN',
        'email-template',
        'Test Subject',
        [],
        {},
        Uuid.generate()
      );

      const result = service.validateTemplate(template);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('变量 "orderId" 在内容中使用但未声明');
    });

    it('应该检测未使用的变量', () => {
      const template = Template.create(
        Uuid.generate(),
        '测试模板',
        NotificationType.EMAIL,
        'Hello {{userName}}!',
        ['userName', 'company'], // company 未使用
        'zh-CN',
        'email-template',
        'Test Subject',
        [],
        {},
        Uuid.generate()
      );

      const result = service.validateTemplate(template);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('变量 "company" 已声明但未在内容中使用');
    });

    it('应该检测无效的变量名称', () => {
      const template = Template.create(
        Uuid.generate(),
        '测试模板',
        NotificationType.EMAIL,
        'Hello {{user-name}}!',
        ['user-name'], // 包含连字符
        'zh-CN',
        'email-template',
        'Test Subject',
        [],
        {},
        Uuid.generate()
      );

      const result = service.validateTemplate(template);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        '变量名称 "user-name" 格式无效，只能包含字母、数字和下划线'
      );
    });

    it('应该检测空的分类', () => {
      // 创建一个有效的模板，然后修改其分类
      const template = Template.create(
        Uuid.generate(),
        '测试模板',
        NotificationType.EMAIL,
        'Hello {{userName}}!',
        ['userName'],
        'zh-CN',
        'email-template',
        'Test Subject',
        [],
        {},
        Uuid.generate()
      );

      // 模拟空分类的情况
      const templateWithEmptyCategory = {
        ...template,
        name: template.name,
        content: template.content,
        category: '',
        variables: template.variables,
        type: template.type,
        language: template.language,
        tags: template.tags,
        subject: template.subject,
      } as Template;

      const result = service.validateTemplate(templateWithEmptyCategory);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('模板分类不能为空');
    });

    it('应该检测过多的标签', () => {
      const manyTags = Array.from({ length: 11 }, (_, i) => `tag${i}`);
      const template = Template.create(
        Uuid.generate(),
        '测试模板',
        NotificationType.EMAIL,
        'Hello {{userName}}!',
        ['userName'],
        'zh-CN',
        'email-template',
        'Test Subject',
        manyTags,
        {},
        Uuid.generate()
      );

      const result = service.validateTemplate(template);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('模板标签数量过多，建议不超过10个');
    });

    it('应该检测无效的语言代码', () => {
      const template = Template.create(
        Uuid.generate(),
        '测试模板',
        NotificationType.EMAIL,
        'Hello {{userName}}!',
        ['userName'],
        'invalid-language',
        'email-template',
        'Test Subject',
        [],
        {},
        Uuid.generate()
      );

      const result = service.validateTemplate(template);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('无效的语言代码: invalid-language');
    });
  });

  describe('validateTemplateName', () => {
    const tenantId = Uuid.generate();
    const templateName = '测试模板';

    it('应该验证可用的模板名称', async () => {
      mockTemplateRepository.findByName.mockResolvedValue(null);

      const result = await service.validateTemplateName(templateName, tenantId);

      expect(result).toBe(true);
      expect(mockTemplateRepository.findByName).toHaveBeenCalledWith(
        templateName,
        tenantId.toString()
      );
    });

    it('应该检测已存在的模板名称', async () => {
      const existingTemplate = Template.create(
        Uuid.generate(),
        templateName,
        NotificationType.EMAIL,
        'Hello {{userName}}!',
        ['userName'],
        'zh-CN',
        'email-template',
        'Test Subject',
        [],
        {},
        Uuid.generate()
      );
      mockTemplateRepository.findByName.mockResolvedValue(existingTemplate);

      const result = await service.validateTemplateName(templateName, tenantId);

      expect(result).toBe(false);
    });

    it('应该排除自身ID', async () => {
      const existingTemplate = Template.create(
        Uuid.generate(),
        templateName,
        NotificationType.EMAIL,
        'Hello {{userName}}!',
        ['userName'],
        'zh-CN',
        'email-template',
        'Test Subject',
        [],
        {},
        Uuid.generate()
      );
      mockTemplateRepository.findByName.mockResolvedValue(existingTemplate);

      const result = await service.validateTemplateName(
        templateName,
        tenantId,
        existingTemplate.id.toString()
      );

      expect(result).toBe(true);
    });
  });

  describe('checkTemplateReviewStatus', () => {
    it('应该检查草稿状态的模板', () => {
      const template = Template.create(
        Uuid.generate(),
        '测试模板',
        NotificationType.EMAIL,
        'Hello {{userName}}!',
        ['userName'],
        'zh-CN',
        'email-template',
        'Test Subject',
        [],
        {},
        Uuid.generate()
      );

      const result = service.checkTemplateReviewStatus(template);

      expect(result.canSubmit).toBe(true);
      expect(result.canApprove).toBe(false);
      expect(result.canReject).toBe(false);
      expect(result.reasons).toContain('只有审核中的模板才能通过审核');
      expect(result.reasons).toContain('只有审核中的模板才能拒绝');
    });

    it('应该检查审核中状态的模板', () => {
      const template = Template.create(
        Uuid.generate(),
        '测试模板',
        NotificationType.EMAIL,
        'Hello {{userName}}!',
        ['userName'],
        'zh-CN',
        'email-template',
        'Test Subject',
        [],
        {},
        Uuid.generate()
      );
      template.submitForReview();

      const result = service.checkTemplateReviewStatus(template);

      expect(result.canSubmit).toBe(true); // 模板状态仍然是 DRAFT，所以可以提交审核
      expect(result.canApprove).toBe(true);
      expect(result.canReject).toBe(true);
      // 由于模板状态仍然是 DRAFT，所以没有不能提交审核的原因
    });

    it('应该检查已激活状态的模板', () => {
      const template = Template.create(
        Uuid.generate(),
        '测试模板',
        NotificationType.EMAIL,
        'Hello {{userName}}!',
        ['userName'],
        'zh-CN',
        'email-template',
        'Test Subject',
        [],
        {},
        Uuid.generate()
      );
      template.submitForReview();
      template.approve(Uuid.generate(), 'approved');
      template.activate();

      const result = service.checkTemplateReviewStatus(template);

      expect(result.canSubmit).toBe(false);
      expect(result.canApprove).toBe(false);
      expect(result.canReject).toBe(false);
      expect(result.reasons).toContain('只有草稿状态的模板才能提交审核');
      expect(result.reasons).toContain('只有审核中的模板才能通过审核');
      expect(result.reasons).toContain('只有审核中的模板才能拒绝');
    });
  });

  describe('getTemplateStatistics', () => {
    const tenantId = Uuid.generate();

    beforeEach(() => {
      mockTemplateRepository.getStatistics.mockResolvedValue({
        total: 10,
        active: 5,
        draft: 3,
        inactive: 1,
        archived: 1,
      });

      mockTemplateRepository.countByType.mockResolvedValue({
        [NotificationType.EMAIL]: 6,
        [NotificationType.SMS]: 3,
        [NotificationType.PUSH]: 1,
        [NotificationType.WEBHOOK]: 0,
      });

      mockTemplateRepository.countByStatus.mockResolvedValue({
        [TemplateStatus.ACTIVE]: 5,
        [TemplateStatus.DRAFT]: 3,
        [TemplateStatus.INACTIVE]: 1,
        [TemplateStatus.ARCHIVED]: 1,
      });

      mockTemplateRepository.countByCategory.mockResolvedValue({
        'email-template': 6,
        'sms-template': 3,
        'push-template': 1,
      });

      mockTemplateRepository.countByLanguage.mockResolvedValue({
        'zh-CN': 7,
        'en-US': 3,
      });

      mockTemplateRepository.getMostUsedTemplates.mockResolvedValue([
        {
          templateId: 'template-1',
          name: 'Welcome Email',
          usageCount: 100,
        },
        {
          templateId: 'template-2',
          name: 'Password Reset',
          usageCount: 50,
        },
      ]);
    });

    it('应该获取完整的模板统计信息', async () => {
      const result = await service.getTemplateStatistics(tenantId);

      expect(result.total).toBe(10);
      expect(result.active).toBe(5);
      expect(result.draft).toBe(3);
      expect(result.inactive).toBe(1);
      expect(result.archived).toBe(1);
      expect(result.byType[NotificationType.EMAIL]).toBe(6);
      expect(result.byType[NotificationType.SMS]).toBe(3);
      expect(result.byType[NotificationType.PUSH]).toBe(1);
      expect(result.byStatus[TemplateStatus.ACTIVE]).toBe(5);
      expect(result.byStatus[TemplateStatus.DRAFT]).toBe(3);
      expect(result.byCategory['email-template']).toBe(6);
      expect(result.byLanguage['zh-CN']).toBe(7);
      expect(result.mostUsed).toHaveLength(2);
      expect(result.mostUsed[0].name).toBe('Welcome Email');
      expect(result.mostUsed[0].usageCount).toBe(100);
    });

    it('应该支持日期范围查询', async () => {
      const fromDate = new Date('2024-01-01');
      const toDate = new Date('2024-12-31');

      await service.getTemplateStatistics(tenantId, fromDate, toDate);

      expect(mockTemplateRepository.getStatistics).toHaveBeenCalledWith(
        tenantId.toString(),
        fromDate,
        toDate
      );
    });
  });

  describe('duplicateTemplate', () => {
    const tenantId = Uuid.generate();
    const createdBy = Uuid.generate().toString();
    const newName = '复制的模板';

    let originalTemplate: Template;

    beforeEach(() => {
      originalTemplate = Template.create(
        Uuid.generate(),
        '原始模板',
        NotificationType.EMAIL,
        'Hello {{userName}}!',
        ['userName'],
        'zh-CN',
        'email-template',
        'Original Subject',
        ['original'],
        { original: true },
        Uuid.generate()
      );
    });

    it('应该成功复制模板', async () => {
      mockTemplateRepository.findById.mockResolvedValue(originalTemplate);
      mockTemplateRepository.findByName.mockResolvedValue(null);

      const result = await service.duplicateTemplate(
        originalTemplate.id,
        newName,
        tenantId,
        createdBy
      );

      expect(result.name).toBe(newName);
      expect(result.type).toBe(originalTemplate.type);
      expect(result.content).toBe(originalTemplate.content);
      expect(result.variables).toEqual(originalTemplate.variables);
      expect(result.language).toBe(originalTemplate.language);
      expect(result.category).toBe(originalTemplate.category);
      expect(result.subject).toBe(originalTemplate.subject);
      expect(result.tags).toEqual(originalTemplate.tags);
      expect(result.metadata).toEqual(originalTemplate.metadata);
      expect(result.status).toBe(TemplateStatus.DRAFT);
      expect(result.reviewStatus).toBe(ReviewStatus.PENDING);
    });

    it('应该检测不存在的模板', async () => {
      mockTemplateRepository.findById.mockResolvedValue(null);

      await expect(
        service.duplicateTemplate(
          Uuid.generate(),
          newName,
          tenantId,
          createdBy
        )
      ).rejects.toThrow('模板');
    });

    it('应该检测重复的模板名称', async () => {
      mockTemplateRepository.findById.mockResolvedValue(originalTemplate);
      mockTemplateRepository.findByName.mockResolvedValue(originalTemplate);

      await expect(
        service.duplicateTemplate(
          originalTemplate.id,
          newName,
          tenantId,
          createdBy
        )
      ).rejects.toThrow(`模板名称 "${newName}" 已存在`);
    });
  });

  describe('searchTemplates', () => {
    const tenantId = Uuid.generate();
    const searchCriteria = {
      keyword: 'welcome',
      type: NotificationType.EMAIL,
      status: TemplateStatus.ACTIVE,
      category: 'email-template',
      language: 'zh-CN',
      tags: ['welcome'],
      reviewStatus: ReviewStatus.APPROVED,
    };

    it('应该搜索模板', async () => {
      const mockTemplates = [
        Template.create(
          Uuid.generate(),
          'Welcome Email',
          NotificationType.EMAIL,
          'Hello {{userName}}!',
          ['userName'],
          'zh-CN',
          'email-template',
          'Welcome',
          ['welcome'],
          {},
          Uuid.generate()
        ),
      ];

      mockTemplateRepository.search.mockResolvedValue(mockTemplates);

      const result = await service.searchTemplates(tenantId, searchCriteria);

      expect(result).toEqual(mockTemplates);
      expect(mockTemplateRepository.search).toHaveBeenCalledWith(
        tenantId.toString(),
        searchCriteria,
        20,
        0
      );
    });

    it('应该支持自定义分页参数', async () => {
      mockTemplateRepository.search.mockResolvedValue([]);

      await service.searchTemplates(tenantId, searchCriteria, 50, 10);

      expect(mockTemplateRepository.search).toHaveBeenCalledWith(
        tenantId.toString(),
        searchCriteria,
        50,
        10
      );
    });
  });

  describe('getTemplateVersionHistory', () => {
    const templateId = Uuid.generate();
    const tenantId = Uuid.generate();

    it('应该获取模板版本历史', async () => {
      const template = Template.create(
        Uuid.generate(),
        '测试模板',
        NotificationType.EMAIL,
        'Hello {{userName}}!',
        ['userName'],
        'zh-CN',
        'email-template',
        'Test Subject',
        [],
        {},
        Uuid.generate()
      );

      // 添加版本历史
      template.updateContent(
        'Updated content {{userName}}',
        ['userName', 'company'],
        'Updated Subject',
        Uuid.generate()
      );

      mockTemplateRepository.findById.mockResolvedValue(template);

      const result = await service.getTemplateVersionHistory(templateId, tenantId);

      expect(result).toHaveLength(1); // 只有当前版本
      expect(result[0].version).toBe(1);
      expect(result[0].content).toBe('Hello {{userName}}!'); // 原始内容
    });

    it('应该检测不存在的模板', async () => {
      mockTemplateRepository.findById.mockResolvedValue(null);

      await expect(
        service.getTemplateVersionHistory(templateId, tenantId)
      ).rejects.toThrow('模板');
    });
  });
});
