import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import {
  TemplateAggregate,
  CreateTemplateCommand,
  UpdateTemplateCommand,
  ReviewTemplateCommand,
} from './template-aggregate';
import { Template, ReviewStatus } from '../entities/template.entity';
import { TemplateRepository } from '../repositories/template.repository';
import { NotificationType, TemplateStatus } from '@aiofix/shared';
import { Uuid } from '@aiofix/shared';

// Mock TemplateRepository
const mockTemplateRepository = {
  save: jest.fn(),
  findById: jest.fn(),
  findByName: jest.fn(),
  delete: jest.fn(),
} as unknown;

describe('TemplateAggregate', () => {
  let aggregate: TemplateAggregate;
  let tenantId: Uuid;
  let createdBy: Uuid;
  let updatedBy: Uuid;
  let reviewerId: Uuid;

  beforeEach(() => {
    jest.clearAllMocks();
    aggregate = new TemplateAggregate(mockTemplateRepository);
    tenantId = Uuid.generate();
    createdBy = Uuid.generate();
    updatedBy = Uuid.generate();
    reviewerId = Uuid.generate();
  });

  describe('createTemplate', () => {
    const createCommand: CreateTemplateCommand = {
      tenantId: Uuid.generate().toString(),
      name: '测试模板',
      type: NotificationType.EMAIL,
      content: 'Hello {{userName}}, welcome to {{company}}!',
      variables: ['userName', 'company'],
      language: 'zh-CN',
      category: 'email-template',
      subject: '{{subject}}',
      tags: ['welcome'],
      metadata: { category: 'notification' },
      createdBy: Uuid.generate().toString(),
    };

    it('应该成功创建模板', async () => {
      // Arrange
      mockTemplateRepository.findByName.mockResolvedValue(null);
      mockTemplateRepository.save.mockResolvedValue();

      // Act
      const result = await aggregate.createTemplate(createCommand);

      // Assert
      expect(result).toBeInstanceOf(Template);
      expect(result.name).toBe('测试模板');
      expect(result.type).toBe(NotificationType.EMAIL);
      expect(result.content).toBe(
        'Hello {{userName}}, welcome to {{company}}!',
      );
      expect(result.variables).toEqual(['userName', 'company']);
      expect(mockTemplateRepository.findByName).toHaveBeenCalledWith(
        '测试模板',
        createCommand.tenantId,
      );
      expect(mockTemplateRepository.save).toHaveBeenCalledWith(result);
    });

    it('应该拒绝创建重复名称的模板', async () => {
      // Arrange
      const existingTemplate = new Template(
        Uuid.generate(),
        tenantId,
        '测试模板',
        NotificationType.EMAIL,
        'existing content',
        ['userName'],
        'zh-CN',
        'email-template',
        'subject',
        [],
        {},
        createdBy,
        createdBy,
      );
      mockTemplateRepository.findByName.mockResolvedValue(existingTemplate);

      // Act & Assert
      await expect(aggregate.createTemplate(createCommand)).rejects.toThrow(
        '模板名称 "测试模板" 已存在',
      );
    });
  });

  describe('updateTemplate', () => {
    let template: Template;
    const updateCommand: UpdateTemplateCommand = {
      templateId: Uuid.generate().toString(),
      content: 'Updated content {{userName}}',
      variables: ['userName', 'company', 'date'],
      subject: 'Updated subject',
      updatedBy: Uuid.generate().toString(),
    };

    beforeEach(async () => {
      template = new Template(
        Uuid.generate(),
        tenantId,
        '测试模板',
        NotificationType.EMAIL,
        'Hello {{userName}}, welcome to {{company}}!',
        ['userName', 'company'],
        'zh-CN',
        'email-template',
        '{{subject}}',
        [],
        {},
        createdBy,
        createdBy,
      );
      mockTemplateRepository.findById.mockResolvedValue(template);
      await aggregate.loadTemplate(template.id.toString());
    });

    it('应该成功更新模板', async () => {
      // Arrange
      mockTemplateRepository.save.mockResolvedValue();

      // Act
      await aggregate.updateTemplate(updateCommand);

      // Assert
      const updatedTemplate = aggregate.getTemplate();
      expect(updatedTemplate?.content).toBe('Updated content {{userName}}');
      expect(updatedTemplate?.variables).toEqual([
        'userName',
        'company',
        'date',
      ]);
      expect(mockTemplateRepository.save).toHaveBeenCalledWith(
        expect.unknown(Template),
      );
    });

    it('应该拒绝更新不存在的模板', async () => {
      // Arrange
      const emptyAggregate = new TemplateAggregate(mockTemplateRepository);

      // Act & Assert
      await expect(
        emptyAggregate.updateTemplate(updateCommand),
      ).rejects.toThrow('模板不存在');
    });

    it('应该拒绝更新已归档的模板', async () => {
      // Arrange
      template.archive();
      mockTemplateRepository.save.mockResolvedValue();

      // Act & Assert
      await expect(aggregate.updateTemplate(updateCommand)).rejects.toThrow(
        '已归档的模板不能更新',
      );
    });
  });

  describe('submitForReview', () => {
    let template: Template;

    beforeEach(async () => {
      template = new Template(
        Uuid.generate(),
        tenantId,
        '测试模板',
        NotificationType.EMAIL,
        'Hello {{userName}}, welcome to {{company}}!',
        ['userName', 'company'],
        'zh-CN',
        'email-template',
        '{{subject}}',
        [],
        {},
        createdBy,
        createdBy,
      );
      mockTemplateRepository.findById.mockResolvedValue(template);
      await aggregate.loadTemplate(template.id.toString());
    });

    it('应该成功提交审核', async () => {
      // Arrange
      mockTemplateRepository.save.mockResolvedValue();

      // Act
      await aggregate.submitForReview(template.id.toString());

      // Assert
      const updatedTemplate = aggregate.getTemplate();
      expect(updatedTemplate?.reviewStatus).toBe(ReviewStatus.UNDER_REVIEW);
      expect(mockTemplateRepository.save).toHaveBeenCalledWith(
        expect.unknown(Template),
      );
    });

    it('应该拒绝提交不存在的模板', async () => {
      // Arrange
      const emptyAggregate = new TemplateAggregate(mockTemplateRepository);

      // Act & Assert
      await expect(
        emptyAggregate.submitForReview('non-existent-id'),
      ).rejects.toThrow('模板不存在');
    });

    it('应该拒绝提交非草稿状态的模板', async () => {
      // Arrange
      template.submitForReview();
      template.approve(reviewerId, 'approved');
      template.activate();
      mockTemplateRepository.save.mockResolvedValue();

      // Act & Assert
      await expect(
        aggregate.submitForReview(template.id.toString()),
      ).rejects.toThrow('只有草稿状态的模板才能提交审核');
    });
  });

  describe('reviewTemplate', () => {
    let template: Template;
    const approveCommand: ReviewTemplateCommand = {
      templateId: Uuid.generate().toString(),
      reviewerId: Uuid.generate().toString(),
      action: 'approve',
      comments: '审核通过',
    };

    const rejectCommand: ReviewTemplateCommand = {
      templateId: Uuid.generate().toString(),
      reviewerId: Uuid.generate().toString(),
      action: 'reject',
      comments: '内容不符合规范',
    };

    beforeEach(async () => {
      template = new Template(
        Uuid.generate(),
        tenantId,
        '测试模板',
        NotificationType.EMAIL,
        'Hello {{userName}}, welcome to {{company}}!',
        ['userName', 'company'],
        'zh-CN',
        'email-template',
        '{{subject}}',
        [],
        {},
        createdBy,
        createdBy,
      );
      template.submitForReview();
      mockTemplateRepository.findById.mockResolvedValue(template);
      await aggregate.loadTemplate(template.id.toString());
    });

    it('应该成功通过审核', async () => {
      // Arrange
      mockTemplateRepository.save.mockResolvedValue();

      // Act
      await aggregate.reviewTemplate(approveCommand);

      // Assert
      const updatedTemplate = aggregate.getTemplate();
      expect(updatedTemplate?.reviewStatus).toBe(ReviewStatus.APPROVED);
      expect(updatedTemplate?.reviewComments).toBe('审核通过');
      expect(mockTemplateRepository.save).toHaveBeenCalledWith(
        expect.unknown(Template),
      );
    });

    it('应该成功拒绝审核', async () => {
      // Arrange
      mockTemplateRepository.save.mockResolvedValue();

      // Act
      await aggregate.reviewTemplate(rejectCommand);

      // Assert
      const updatedTemplate = aggregate.getTemplate();
      expect(updatedTemplate?.reviewStatus).toBe(ReviewStatus.REJECTED);
      expect(updatedTemplate?.reviewComments).toBe('内容不符合规范');
      expect(mockTemplateRepository.save).toHaveBeenCalledWith(
        expect.unknown(Template),
      );
    });

    it('应该拒绝审核非审核中状态的模板', async () => {
      // Arrange
      template.approve(reviewerId, 'already approved');

      // Act & Assert
      await expect(aggregate.reviewTemplate(approveCommand)).rejects.toThrow(
        '只有审核中的模板才能进行审核操作',
      );
    });

    it('应该拒绝审核时提供拒绝原因', async () => {
      // Arrange
      const rejectWithoutComments: ReviewTemplateCommand = {
        templateId: 'test-template-id',
        reviewerId: 'test-reviewer-id',
        action: 'reject',
      };

      // Act & Assert
      await expect(
        aggregate.reviewTemplate(rejectWithoutComments),
      ).rejects.toThrow('拒绝审核必须提供拒绝原因');
    });
  });

  describe('activateTemplate', () => {
    let template: Template;

    beforeEach(async () => {
      template = new Template(
        Uuid.generate(),
        tenantId,
        '测试模板',
        NotificationType.EMAIL,
        'Hello {{userName}}, welcome to {{company}}!',
        ['userName', 'company'],
        'zh-CN',
        'email-template',
        '{{subject}}',
        [],
        {},
        createdBy,
        createdBy,
      );
      template.submitForReview();
      template.approve(reviewerId, 'approved');
      mockTemplateRepository.findById.mockResolvedValue(template);
      await aggregate.loadTemplate(template.id.toString());
    });

    it('应该成功激活模板', async () => {
      // Arrange
      mockTemplateRepository.save.mockResolvedValue();

      // Act
      await aggregate.activateTemplate(template.id.toString());

      // Assert
      const updatedTemplate = aggregate.getTemplate();
      expect(updatedTemplate?.status).toBe(TemplateStatus.ACTIVE);
      expect(mockTemplateRepository.save).toHaveBeenCalledWith(
        expect.unknown(Template),
      );
    });

    it('应该拒绝激活非审核通过状态的模板', async () => {
      // Arrange
      template.submitForReview();
      template.reject(reviewerId, 'rejected');
      mockTemplateRepository.findById.mockResolvedValue(template);
      await aggregate.loadTemplate(template.id.toString());

      // Act & Assert
      await expect(
        aggregate.activateTemplate(template.id.toString()),
      ).rejects.toThrow('只有审核通过的模板才能激活');
    });
  });

  describe('deactivateTemplate', () => {
    let template: Template;

    beforeEach(async () => {
      template = new Template(
        Uuid.generate(),
        tenantId,
        '测试模板',
        NotificationType.EMAIL,
        'Hello {{userName}}, welcome to {{company}}!',
        ['userName', 'company'],
        'zh-CN',
        'email-template',
        '{{subject}}',
        [],
        {},
        createdBy,
        createdBy,
      );
      template.submitForReview();
      template.approve(reviewerId, 'approved');
      template.activate();
      mockTemplateRepository.findById.mockResolvedValue(template);
      await aggregate.loadTemplate(template.id.toString());
    });

    it('应该成功停用模板', async () => {
      // Arrange
      mockTemplateRepository.save.mockResolvedValue();

      // Act
      await aggregate.deactivateTemplate(template.id.toString());

      // Assert
      const updatedTemplate = aggregate.getTemplate();
      expect(updatedTemplate?.status).toBe(TemplateStatus.INACTIVE);
      expect(mockTemplateRepository.save).toHaveBeenCalledWith(
        expect.unknown(Template),
      );
    });
  });

  describe('archiveTemplate', () => {
    let template: Template;

    beforeEach(async () => {
      template = new Template(
        Uuid.generate(),
        tenantId,
        '测试模板',
        NotificationType.EMAIL,
        'Hello {{userName}}, welcome to {{company}}!',
        ['userName', 'company'],
        'zh-CN',
        'email-template',
        '{{subject}}',
        [],
        {},
        createdBy,
        createdBy,
      );
      template.submitForReview();
      template.approve(reviewerId, 'approved');
      template.activate();
      template.deactivate();
      mockTemplateRepository.findById.mockResolvedValue(template);
      await aggregate.loadTemplate(template.id.toString());
    });

    it('应该成功归档模板', async () => {
      // Arrange
      mockTemplateRepository.save.mockResolvedValue();

      // Act
      await aggregate.archiveTemplate(template.id.toString());

      // Assert
      const updatedTemplate = aggregate.getTemplate();
      expect(updatedTemplate?.status).toBe(TemplateStatus.ARCHIVED);
      expect(mockTemplateRepository.save).toHaveBeenCalledWith(
        expect.unknown(Template),
      );
    });
  });

  describe('deleteTemplate', () => {
    let template: Template;

    beforeEach(async () => {
      template = new Template(
        Uuid.generate(),
        tenantId,
        '测试模板',
        NotificationType.EMAIL,
        'Hello {{userName}}, welcome to {{company}}!',
        ['userName', 'company'],
        'zh-CN',
        'email-template',
        '{{subject}}',
        [],
        {},
        createdBy,
        createdBy,
      );
      mockTemplateRepository.findById.mockResolvedValue(template);
      await aggregate.loadTemplate(template.id.toString());
    });

    it('应该成功删除模板', async () => {
      // Arrange
      mockTemplateRepository.delete.mockResolvedValue();

      // Act
      await aggregate.deleteTemplate(template.id.toString());

      // Assert
      expect(mockTemplateRepository.delete).toHaveBeenCalledWith(template.id);
      expect(aggregate.getTemplate()).toBeNull();
    });

    it('应该拒绝删除激活状态的模板', async () => {
      // Arrange
      template.submitForReview();
      template.approve(reviewerId, 'approved');
      template.activate();
      mockTemplateRepository.findById.mockResolvedValue(template);
      await aggregate.loadTemplate(template.id.toString());

      // Act & Assert
      await expect(
        aggregate.deleteTemplate(template.id.toString()),
      ).rejects.toThrow('激活状态的模板不能删除，请先停用');
    });
  });

  describe('loadTemplate', () => {
    it('应该成功加载模板', async () => {
      // Arrange
      const template = new Template(
        Uuid.generate(),
        tenantId,
        '测试模板',
        NotificationType.EMAIL,
        'Hello {{userName}}, welcome to {{company}}!',
        ['userName', 'company'],
        'zh-CN',
        'email-template',
        '{{subject}}',
        [],
        {},
        createdBy,
        createdBy,
      );

      // Act
      mockTemplateRepository.findById.mockResolvedValue(template);
      await aggregate.loadTemplate(template.id.toString());

      // Assert
      expect(aggregate.getTemplate()).toBe(template);
      expect(mockTemplateRepository.findById).toHaveBeenCalledWith(template.id);
    });

    it('应该处理模板不存在的情况', async () => {
      // Arrange
      const validUuid = Uuid.generate().toString();
      mockTemplateRepository.findById.mockResolvedValue(null);

      // Act
      await aggregate.loadTemplate(validUuid);

      // Assert
      expect(aggregate.getTemplate()).toBeNull();
    });
  });

  describe('incrementUsage', () => {
    let template: Template;

    beforeEach(async () => {
      template = new Template(
        Uuid.generate(),
        tenantId,
        '测试模板',
        NotificationType.EMAIL,
        'Hello {{userName}}, welcome to {{company}}!',
        ['userName', 'company'],
        'zh-CN',
        'email-template',
        '{{subject}}',
        [],
        {},
        createdBy,
        createdBy,
      );
      mockTemplateRepository.findById.mockResolvedValue(template);
      await aggregate.loadTemplate(template.id.toString());
    });

    it('应该成功增加使用次数', async () => {
      // Arrange
      mockTemplateRepository.save.mockResolvedValue();

      // Act
      await aggregate.incrementUsage(template.id.toString());

      // Assert
      const updatedTemplate = aggregate.getTemplate();
      expect(updatedTemplate?.usageCount).toBe(1);
      expect(mockTemplateRepository.save).toHaveBeenCalledWith(
        expect.unknown(Template),
      );
    });
  });
});
