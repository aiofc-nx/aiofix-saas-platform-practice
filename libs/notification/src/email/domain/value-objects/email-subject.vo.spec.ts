/**
 * @file email-subject.vo.spec.ts
 * @description 邮件主题值对象单元测试
 */

import { EmailSubject } from './email-subject.vo';

describe('EmailSubject', () => {
  describe('创建邮件主题', () => {
    it('应该成功创建有效的邮件主题', () => {
      const subject = EmailSubject.create('测试邮件主题');
      expect(subject.value).toBe('测试邮件主题');
      expect(subject.length).toBe(6);
      expect(subject.isEmpty()).toBe(false);
    });

    it('应该成功创建空邮件主题', () => {
      const subject = EmailSubject.createEmpty();
      expect(subject.value).toBe('无主题');
      expect(subject.isEmpty()).toBe(false);
    });

    it('应该通过构造函数创建邮件主题', () => {
      const subject = new EmailSubject('直接创建的主题');
      expect(subject.value).toBe('直接创建的主题');
    });
  });

  describe('验证邮件主题格式', () => {
    it('应该拒绝空字符串', () => {
      expect(() => EmailSubject.create('')).toThrow('邮件主题不能为空');
    });

    it('应该拒绝只包含空格的字符串', () => {
      expect(() => EmailSubject.create('   ')).toThrow('邮件主题不能为空');
    });

    it('应该拒绝非字符串类型', () => {
      expect(() => EmailSubject.create(null as unknown)).toThrow(
        '邮件主题必须是字符串类型',
      );
      expect(() => EmailSubject.create(undefined as unknown)).toThrow(
        '邮件主题必须是字符串类型',
      );
      expect(() => EmailSubject.create(123 as unknown)).toThrow(
        '邮件主题必须是字符串类型',
      );
    });

    it('应该拒绝超过998字符的主题', () => {
      const longSubject = 'a'.repeat(999);
      expect(() => EmailSubject.create(longSubject)).toThrow(
        '邮件主题长度不能超过998字符',
      );
    });

    it('应该接受998字符的主题', () => {
      const maxLengthSubject = 'a'.repeat(998);
      const subject = EmailSubject.create(maxLengthSubject);
      expect(subject.length).toBe(998);
    });

    it('应该拒绝包含危险字符的主题', () => {
      const dangerousChars = ['<', '>', '"', "'", '&'];
      dangerousChars.forEach(char => {
        expect(() => EmailSubject.create(`测试${char}主题`)).toThrow(
          '邮件主题包含不允许的字符',
        );
      });
    });

    it('应该拒绝包含控制字符的主题', () => {
      const controlChars = [0x00, 0x08, 0x0b, 0x0c, 0x0e, 0x1f, 0x7f];
      controlChars.forEach(charCode => {
        const controlChar = String.fromCharCode(charCode);
        expect(() => EmailSubject.create(`测试${controlChar}主题`)).toThrow(
          '邮件主题包含控制字符',
        );
      });
    });
  });

  describe('标准化处理', () => {
    it('应该去除首尾空格', () => {
      const subject = EmailSubject.create('  测试主题  ');
      expect(subject.value).toBe('测试主题');
    });

    it('应该合并多个空格为单个空格', () => {
      const subject = EmailSubject.create('测试    主题');
      expect(subject.value).toBe('测试 主题');
    });

    it('应该处理制表符和换行符', () => {
      const subject = EmailSubject.create('测试\t主题\n内容');
      expect(subject.value).toBe('测试 主题 内容');
    });
  });

  describe('值相等性', () => {
    it('应该正确判断相等性', () => {
      const subject1 = EmailSubject.create('测试主题');
      const subject2 = EmailSubject.create('测试主题');
      const subject3 = EmailSubject.create('不同主题');

      expect(subject1.equals(subject2)).toBe(true);
      expect(subject1.equals(subject3)).toBe(false);
      expect(subject1.equals(null)).toBe(false);
      expect(subject1.equals(undefined)).toBe(false);
    });

    it('应该支持字符串比较', () => {
      const subject = EmailSubject.create('测试主题');
      expect(subject.toString()).toBe('测试主题');
    });
  });

  describe('边界情况', () => {
    it('应该处理单个字符的主题', () => {
      const subject = EmailSubject.create('a');
      expect(subject.value).toBe('a');
      expect(subject.length).toBe(1);
    });

    it('应该处理包含特殊字符的主题', () => {
      const specialChars = '测试主题123!@#$%^*-+=()[]{}|\\:;?/~`';
      const subject = EmailSubject.create(specialChars);
      expect(subject.value).toBe(specialChars);
    });

    it('应该处理Unicode字符', () => {
      const unicodeSubject = '测试主题🎉🚀💻';
      const subject = EmailSubject.create(unicodeSubject);
      expect(subject.value).toBe(unicodeSubject);
    });
  });
});
