/**
 * @file template-name.vo.spec.ts
 * @description 模板名称值对象单元测试
 *
 * 测试覆盖范围：
 * - 构造函数验证
 * - 公共方法功能
 * - 边界情况处理
 * - 错误情况处理
 * - 静态方法功能
 */

import { TemplateName } from './template-name.vo';

describe('TemplateName', () => {
  describe('构造函数', () => {
    it('应该成功创建有效的模板名称', () => {
      const templateName = new TemplateName('测试模板');
      expect(templateName.value).toBe('测试模板');
      expect(templateName.length).toBe(4);
    });

    it('应该拒绝空字符串', () => {
      expect(() => new TemplateName('')).toThrow('模板名称不能为空');
    });

    it('应该拒绝null值', () => {
      expect(() => new TemplateName(null as unknown)).toThrow(
        '模板名称不能为空',
      );
    });

    it('应该拒绝undefined值', () => {
      expect(() => new TemplateName(undefined as unknown)).toThrow(
        '模板名称不能为空',
      );
    });

    it('应该拒绝非字符串类型', () => {
      expect(() => new TemplateName(123 as unknown)).toThrow(
        '模板名称必须是字符串类型',
      );
    });

    it('应该拒绝只包含空格的字符串', () => {
      expect(() => new TemplateName('   ')).toThrow('模板名称不能为空');
    });

    it('应该拒绝长度少于2个字符的名称', () => {
      expect(() => new TemplateName('a')).toThrow(
        '模板名称长度不能少于2个字符',
      );
    });

    it('应该拒绝长度超过100个字符的名称', () => {
      const longName = 'a'.repeat(101);
      expect(() => new TemplateName(longName)).toThrow(
        '模板名称长度不能超过100个字符',
      );
    });

    it('应该拒绝包含不允许字符的名称', () => {
      expect(() => new TemplateName('test<template')).toThrow(
        '模板名称包含不允许的字符',
      );
      expect(() => new TemplateName('test>template')).toThrow(
        '模板名称包含不允许的字符',
      );
      expect(() => new TemplateName('test"template')).toThrow(
        '模板名称包含不允许的字符',
      );
      expect(() => new TemplateName("test'template")).toThrow(
        '模板名称包含不允许的字符',
      );
      expect(() => new TemplateName('test&template')).toThrow(
        '模板名称包含不允许的字符',
      );
    });

    it('应该拒绝包含控制字符的名称', () => {
      expect(() => new TemplateName('test\u0000template')).toThrow(
        '模板名称包含控制字符',
      );
      expect(() => new TemplateName('test\u0007template')).toThrow(
        '模板名称包含控制字符',
      );
      expect(() => new TemplateName('test\u007ftemplate')).toThrow(
        '模板名称包含控制字符',
      );
    });

    it('应该拒绝以数字开头的名称', () => {
      expect(() => new TemplateName('1test')).toThrow('模板名称不能以数字开头');
      expect(() => new TemplateName('123test')).toThrow(
        '模板名称不能以数字开头',
      );
    });

    it('应该拒绝包含连续空格的名称', () => {
      expect(() => new TemplateName('test  template')).toThrow(
        '模板名称不能包含连续的空格',
      );
      expect(() => new TemplateName('test   template')).toThrow(
        '模板名称不能包含连续的空格',
      );
    });
  });

  describe('标准化处理', () => {
    it('应该去除首尾空格', () => {
      const templateName = new TemplateName('  测试模板  ');
      expect(templateName.value).toBe('测试模板');
    });

    it('应该将多个空格合并为单个空格', () => {
      const templateName = new TemplateName('测试 模板');
      expect(templateName.value).toBe('测试 模板');
    });

    it('应该保持中文字符不变', () => {
      const templateName = new TemplateName('测试模板名称');
      expect(templateName.value).toBe('测试模板名称');
    });

    it('应该保持英文字符不变', () => {
      const templateName = new TemplateName('Test Template');
      expect(templateName.value).toBe('Test Template');
    });

    it('应该保持数字字符不变', () => {
      const templateName = new TemplateName('Template 123');
      expect(templateName.value).toBe('Template 123');
    });

    it('应该保持下划线和连字符不变', () => {
      const templateName = new TemplateName('test-template_name');
      expect(templateName.value).toBe('test-template_name');
    });
  });

  describe('公共方法', () => {
    let templateName: TemplateName;

    beforeEach(() => {
      templateName = new TemplateName('测试模板');
    });

    describe('value getter', () => {
      it('应该返回模板名称值', () => {
        expect(templateName.value).toBe('测试模板');
      });
    });

    describe('length getter', () => {
      it('应该返回模板名称长度', () => {
        expect(templateName.length).toBe(4);
      });

      it('应该正确处理中英文混合名称的长度', () => {
        const mixedName = new TemplateName('Test模板');
        expect(mixedName.length).toBe(6);
      });
    });

    describe('isEmpty', () => {
      it('应该正确判断非空名称', () => {
        expect(templateName.isEmpty()).toBe(false);
      });

      it('应该正确判断空名称', () => {
        expect(() => new TemplateName('  ')).toThrow('模板名称不能为空');
      });
    });

    describe('equals', () => {
      it('应该正确判断相等的名称', () => {
        const otherName = new TemplateName('测试模板');
        expect(templateName.equals(otherName)).toBe(true);
      });

      it('应该正确判断不相等的名称', () => {
        const otherName = new TemplateName('其他模板');
        expect(templateName.equals(otherName)).toBe(false);
      });

      it('应该正确处理null值', () => {
        expect(templateName.equals(null)).toBe(false);
      });

      it('应该正确处理undefined值', () => {
        expect(templateName.equals(undefined)).toBe(false);
      });

      it('应该正确处理大小写敏感的比较', () => {
        const upperName = new TemplateName('TEST模板');
        expect(templateName.equals(upperName)).toBe(false);
      });
    });

    describe('toString', () => {
      it('应该返回模板名称字符串', () => {
        expect(templateName.toString()).toBe('测试模板');
      });
    });

    describe('toSlug', () => {
      it('应该正确转换为slug格式', () => {
        expect(templateName.toSlug()).toBe('测试模板');
      });

      it('应该处理包含特殊字符的名称', () => {
        const specialName = new TemplateName('Test Template 123!');
        expect(specialName.toSlug()).toBe('test-template-123');
      });

      it('应该处理包含中英文混合的名称', () => {
        const mixedName = new TemplateName('Test模板名称');
        expect(mixedName.toSlug()).toBe('test模板名称');
      });

      it('应该处理首尾连字符', () => {
        const nameWithHyphens = new TemplateName('!Test Template!');
        expect(nameWithHyphens.toSlug()).toBe('test-template');
      });
    });

    describe('toUpperCase', () => {
      it('应该正确转换为大写', () => {
        const englishName = new TemplateName('test template');
        expect(englishName.toUpperCase()).toBe('TEST TEMPLATE');
      });

      it('应该保持中文字符不变', () => {
        expect(templateName.toUpperCase()).toBe('测试模板');
      });
    });

    describe('toLowerCase', () => {
      it('应该正确转换为小写', () => {
        const englishName = new TemplateName('TEST TEMPLATE');
        expect(englishName.toLowerCase()).toBe('test template');
      });

      it('应该保持中文字符不变', () => {
        expect(templateName.toLowerCase()).toBe('测试模板');
      });
    });
  });

  describe('静态方法', () => {
    describe('create', () => {
      it('应该成功创建模板名称', () => {
        const templateName = TemplateName.create('测试模板');
        expect(templateName.value).toBe('测试模板');
      });

      it('应该与构造函数行为一致', () => {
        const name1 = new TemplateName('测试模板');
        const name2 = TemplateName.create('测试模板');
        expect(name1.equals(name2)).toBe(true);
      });
    });

    describe('createFromSlug', () => {
      it('应该从slug创建模板名称', () => {
        const templateName = TemplateName.createFromSlug('test-template');
        expect(templateName.value).toBe('Test Template');
      });

      it('应该处理多个连字符', () => {
        const templateName = TemplateName.createFromSlug('test-template-name');
        expect(templateName.value).toBe('Test Template Name');
      });

      it('应该处理单个连字符', () => {
        const templateName = TemplateName.createFromSlug('test');
        expect(templateName.value).toBe('Test');
      });

      it('应该处理空slug', () => {
        expect(() => TemplateName.createFromSlug('')).toThrow(
          '模板名称不能为空',
        );
      });
    });

    describe('isValid', () => {
      it('应该正确验证有效的名称', () => {
        expect(TemplateName.isValid('测试模板')).toBe(true);
        expect(TemplateName.isValid('Test Template')).toBe(true);
        expect(TemplateName.isValid('template_123')).toBe(true);
      });

      it('应该正确验证无效的名称', () => {
        expect(TemplateName.isValid('')).toBe(false);
        expect(TemplateName.isValid('a')).toBe(false);
        expect(TemplateName.isValid('1test')).toBe(false);
        expect(TemplateName.isValid('test<template')).toBe(false);
        expect(TemplateName.isValid('a'.repeat(101))).toBe(false);
      });

      it('应该处理null和undefined', () => {
        expect(TemplateName.isValid(null as unknown)).toBe(false);
        expect(TemplateName.isValid(undefined as unknown)).toBe(false);
      });
    });
  });

  describe('边界情况', () => {
    it('应该接受最小长度的名称', () => {
      const minName = new TemplateName('ab');
      expect(minName.value).toBe('ab');
      expect(minName.length).toBe(2);
    });

    it('应该接受最大长度的名称', () => {
      const maxName = new TemplateName('a'.repeat(100));
      expect(maxName.value).toBe('a'.repeat(100));
      expect(maxName.length).toBe(100);
    });

    it('应该处理包含emoji的名称', () => {
      const emojiName = new TemplateName('测试模板🎉');
      expect(emojiName.value).toBe('测试模板🎉');
      expect(emojiName.length).toBe(6); // emoji通常占用2个字符位置
    });

    it('应该处理包含特殊Unicode字符的名称', () => {
      const unicodeName = new TemplateName('测试模板🚀✨');
      expect(unicodeName.value).toBe('测试模板🚀✨');
    });
  });

  describe('不可变性', () => {
    it('应该确保值对象的不可变性', () => {
      const templateName = new TemplateName('测试模板');
      const originalValue = templateName.value;

      // 验证没有setter方法
      expect(templateName).not.toHaveProperty('setValue');

      // 验证值对象是不可变的
      expect(templateName.value).toBe(originalValue);

      // 验证值对象的行为符合不可变性原则
      const templateName2 = new TemplateName('测试模板');
      expect(templateName.equals(templateName2)).toBe(true);
    });
  });
});
