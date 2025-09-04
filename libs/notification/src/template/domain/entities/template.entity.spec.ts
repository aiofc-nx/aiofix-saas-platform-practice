/**
 * @file template.entity.spec.ts
 * @description 模板实体单元测试
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { Template, ReviewStatus } from './template.entity';
import { NotificationType, TemplateStatus } from '@aiofix/shared';
import { Uuid } from '@aiofix/shared';

describe('Template Entity', () => {
  const tenantId = Uuid.generate();
  const createdBy = Uuid.generate();
  const updatedBy = Uuid.generate();
  const reviewerId = Uuid.generate();

  describe('模板创建', () => {
    it('应该成功创建基本模板', () => {
      const template = Template.create(
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
      );

      expect(template.name).toBe('测试模板');
      expect(template.type).toBe(NotificationType.EMAIL);
      expect(template.content).toBe(
        'Hello {{userName}}, welcome to {{company}}!',
      );
      expect(template.variables).toEqual(['userName', 'company']);
      expect(template.status).toBe(TemplateStatus.DRAFT);
      expect(template.reviewStatus).toBe(ReviewStatus.PENDING);
      expect(template.createdBy).toBe(createdBy);
    });

    it('应该成功创建带标签的模板', () => {
      const tags = ['welcome', 'notification', 'system'];
      const template = Template.create(
        tenantId,
        '测试模板',
        NotificationType.EMAIL,
        'Hello {{userName}}, welcome to {{company}}!',
        ['userName', 'company'],
        'zh-CN',
        'email-template',
        '{{subject}}',
        tags,
        {},
        createdBy,
      );

      expect(template.tags).toEqual(tags);
    });

    it('应该成功创建带变量的模板', () => {
      const variables = ['userName', 'company', 'date'];
      const template = Template.create(
        tenantId,
        '测试模板',
        NotificationType.EMAIL,
        'Hello {{userName}}, welcome to {{company}}!',
        variables,
        'zh-CN',
        'email-template',
        '{{subject}}',
        [],
        {},
        createdBy,
      );

      expect(template.variables).toEqual(variables);
    });

    it('应该成功创建带元数据的模板', () => {
      const metadata = { category: 'notification', priority: 'high' };
      const template = Template.create(
        tenantId,
        '测试模板',
        NotificationType.EMAIL,
        'Hello {{userName}}, welcome to {{company}}!',
        ['userName', 'company'],
        'zh-CN',
        'email-template',
        '{{subject}}',
        [],
        metadata,
        createdBy,
      );

      expect(template.metadata).toEqual(metadata);
    });
  });

  describe('模板内容更新', () => {
    let template: Template;

    beforeEach(() => {
      template = Template.create(
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
      );
    });

    it('应该成功更新模板内容', () => {
      const newContent = '{{newBody}}';
      const newVariables = ['userName', 'company', 'date'];

      template.updateContent(newContent, newVariables, undefined, updatedBy);

      expect(template.content).toEqual(newContent);
      expect(template.variables).toEqual(newVariables);
      expect(template.updatedBy).toBe(updatedBy);
      expect(template.updatedAt).toBeDefined();
    });

    it('应该正确处理内容更新但变量不变的情况', () => {
      const newContent = '{{newBody}}';

      template.updateContent(
        newContent,
        template.variables,
        undefined,
        updatedBy,
      );

      expect(template.variables).toEqual(['userName', 'company']); // 保持原有变量
      expect(template.content).toEqual(newContent);
    });

    it('应该正确处理变量更新但内容不变的情况', () => {
      const newVariables = ['userName', 'company', 'date'];

      template.updateContent(
        template.content,
        newVariables,
        undefined,
        updatedBy,
      );

      expect(template.content).toEqual(
        'Hello {{userName}}, welcome to {{company}}!',
      ); // 保持原有内容
      expect(template.variables).toEqual(newVariables);
    });
  });

  describe('审核管理', () => {
    let template: Template;

    beforeEach(() => {
      template = Template.create(
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
      );
    });

    it('应该成功提交审核', () => {
      template.submitForReview();
      expect(template.reviewStatus).toBe(ReviewStatus.UNDER_REVIEW);
    });

    it('应该成功通过审核', () => {
      template.submitForReview();
      template.approve(reviewerId, '审核通过');

      expect(template.reviewStatus).toBe(ReviewStatus.APPROVED);
      expect(template.reviewerId).toBe(reviewerId);
      expect(template.reviewComments).toBe('审核通过');
      expect(template.reviewedAt).toBeDefined();
    });

    it('应该成功拒绝审核', () => {
      template.submitForReview();
      template.reject(reviewerId, '内容不符合规范');

      expect(template.reviewStatus).toBe(ReviewStatus.REJECTED);
      expect(template.reviewerId).toBe(reviewerId);
      expect(template.reviewComments).toBe('内容不符合规范');
      expect(template.reviewedAt).toBeDefined();
    });

    it('应该拒绝审核非待审核状态的模板', () => {
      expect(() => template.approve(reviewerId, '审核通过')).toThrow(
        '只有审核中的模板才能通过审核',
      );
    });
  });

  describe('模板状态管理', () => {
    let template: Template;

    beforeEach(() => {
      template = Template.create(
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
      );
    });

    it('应该成功激活模板', () => {
      template.submitForReview();
      template.approve(reviewerId, '审核通过');
      template.activate();

      expect(template.status).toBe(TemplateStatus.ACTIVE);
    });

    it('应该成功停用模板', () => {
      template.submitForReview();
      template.approve(reviewerId, '审核通过');
      template.activate();
      template.deactivate();

      expect(template.status).toBe(TemplateStatus.INACTIVE);
    });

    it('应该成功归档模板', () => {
      template.submitForReview();
      template.approve(reviewerId, '审核通过');
      template.activate();
      template.deactivate();
      template.archive();

      expect(template.status).toBe(TemplateStatus.ARCHIVED);
    });
  });

  describe('模板版本管理', () => {
    let template: Template;

    beforeEach(() => {
      template = Template.create(
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
      );
    });

    it('应该正确返回模板版本信息', () => {
      const versionInfo = template.templateVersion;

      expect(versionInfo.version).toBe(1);
      expect(versionInfo.content).toEqual(
        'Hello {{userName}}, welcome to {{company}}!',
      );
      expect(versionInfo.createdBy).toBe(createdBy);
      expect(versionInfo.updatedBy).toBeDefined();
      expect(versionInfo.status).toBe(TemplateStatus.DRAFT);
    });
  });

  describe('边界情况', () => {
    it('应该处理空标签数组', () => {
      const template = Template.create(
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
      );

      expect(template.tags).toEqual([]);
    });

    it('应该处理空变量数组', () => {
      const template = Template.create(
        tenantId,
        '测试模板',
        NotificationType.EMAIL,
        'Hello {{userName}}, welcome to {{company}}!',
        [],
        'zh-CN',
        'email-template',
        '{{subject}}',
        [],
        {},
        createdBy,
      );

      expect(template.variables).toEqual([]);
    });

    it('应该处理空元数据对象', () => {
      const template = Template.create(
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
      );

      expect(template.metadata).toEqual({});
    });

    it('应该处理特殊字符在模板名称中', () => {
      const template = Template.create(
        tenantId,
        '测试模板🎉🚀',
        NotificationType.EMAIL,
        'Hello {{userName}}, welcome to {{company}}!',
        ['userName', 'company'],
        'zh-CN',
        'email-template',
        '{{subject}}',
        [],
        {},
        createdBy,
      );

      expect(template.name).toBe('测试模板🎉🚀');
    });

    it('应该处理特殊字符在模板内容中', () => {
      const specialContent =
        'Hello {{userName}}, welcome to {{company}}! 🚀\n包含换行符和特殊字符: !@#$%^&*()';

      const template = Template.create(
        tenantId,
        '测试模板',
        NotificationType.EMAIL,
        specialContent,
        ['userName', 'company'],
        'zh-CN',
        'email-template',
        '{{subject}} 🎉',
        [],
        {},
        createdBy,
      );

      expect(template.content).toEqual(specialContent);
    });
  });
});
