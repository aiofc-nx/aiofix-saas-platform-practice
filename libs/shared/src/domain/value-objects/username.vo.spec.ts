/**
 * @file username.vo.spec.ts
 * @description 用户名值对象单元测试
 */

import { Username, InvalidUsernameException } from './username.vo';

describe('Username', () => {
  const validUsername = 'john_doe';
  const validUsernameWithHyphen = 'john-doe';
  const validUsernameMixed = 'John_Doe123';
  const invalidUsername = 'a'; // 太短
  const invalidUsernameTooLong = 'a'.repeat(51); // 太长
  const invalidUsernameWithSpaces = 'john doe';
  const invalidUsernameWithSpecialChars = 'john@doe';
  const invalidUsernameStartingWithNumber = '123john';
  const invalidUsernameEndingWithHyphen = 'john-';
  const invalidUsernameEndingWithUnderscore = 'john_';
  const invalidUsernameConsecutiveHyphens = 'john--doe';
  const invalidUsernameConsecutiveUnderscores = 'john__doe';

  describe('constructor', () => {
    it('should create valid username value object', () => {
      const username = new Username(validUsername);
      expect(username.value).toBe(validUsername);
    });

    it('should create valid username with hyphen', () => {
      const username = new Username(validUsernameWithHyphen);
      expect(username.value).toBe(validUsernameWithHyphen);
    });

    it('should create valid username with mixed characters', () => {
      const username = new Username(validUsernameMixed);
      expect(username.value).toBe(validUsernameMixed);
    });

    it('should throw error for empty username', () => {
      expect(() => new Username('')).toThrow(InvalidUsernameException);
      expect(() => new Username('')).toThrow('用户名不能为空');
    });

    it('should throw error for null username', () => {
      expect(() => new Username(null as any)).toThrow(InvalidUsernameException);
      expect(() => new Username(null as any)).toThrow('用户名不能为空');
    });

    it('should throw error for undefined username', () => {
      expect(() => new Username(undefined as any)).toThrow(InvalidUsernameException);
      expect(() => new Username(undefined as any)).toThrow('用户名不能为空');
    });

    it('should throw error for username with only spaces', () => {
      expect(() => new Username('   ')).toThrow(InvalidUsernameException);
      expect(() => new Username('   ')).toThrow('用户名不能为空');
    });

    it('should throw error for username too short', () => {
      expect(() => new Username(invalidUsername)).toThrow(InvalidUsernameException);
      expect(() => new Username(invalidUsername)).toThrow('用户名长度不能少于3个字符');
    });

    it('should throw error for username too long', () => {
      expect(() => new Username(invalidUsernameTooLong)).toThrow(InvalidUsernameException);
      expect(() => new Username(invalidUsernameTooLong)).toThrow('用户名长度不能超过50个字符');
    });

    it('should throw error for username with spaces', () => {
      expect(() => new Username(invalidUsernameWithSpaces)).toThrow(InvalidUsernameException);
      expect(() => new Username(invalidUsernameWithSpaces)).toThrow('用户名只能包含字母、数字、下划线和连字符');
    });

    it('should throw error for username with special characters', () => {
      expect(() => new Username(invalidUsernameWithSpecialChars)).toThrow(InvalidUsernameException);
      expect(() => new Username(invalidUsernameWithSpecialChars)).toThrow('用户名只能包含字母、数字、下划线和连字符');
    });

    it('should throw error for username starting with number', () => {
      expect(() => new Username(invalidUsernameStartingWithNumber)).toThrow(InvalidUsernameException);
      expect(() => new Username(invalidUsernameStartingWithNumber)).toThrow('用户名不能以数字开头');
    });

    it('should throw error for username ending with hyphen', () => {
      expect(() => new Username(invalidUsernameEndingWithHyphen)).toThrow(InvalidUsernameException);
      expect(() => new Username(invalidUsernameEndingWithHyphen)).toThrow('用户名不能以连字符或下划线结尾');
    });

    it('should throw error for username ending with underscore', () => {
      expect(() => new Username(invalidUsernameEndingWithUnderscore)).toThrow(InvalidUsernameException);
      expect(() => new Username(invalidUsernameEndingWithUnderscore)).toThrow('用户名不能以连字符或下划线结尾');
    });

    it('should throw error for username with consecutive hyphens', () => {
      expect(() => new Username(invalidUsernameConsecutiveHyphens)).toThrow(InvalidUsernameException);
      expect(() => new Username(invalidUsernameConsecutiveHyphens)).toThrow('用户名不能包含连续的特殊字符');
    });

    it('should throw error for username with consecutive underscores', () => {
      expect(() => new Username(invalidUsernameConsecutiveUnderscores)).toThrow(InvalidUsernameException);
      expect(() => new Username(invalidUsernameConsecutiveUnderscores)).toThrow('用户名不能包含连续的特殊字符');
    });

    it('should accept username with minimum length', () => {
      const minLengthUsername = 'abc';
      const username = new Username(minLengthUsername);
      expect(username.value).toBe(minLengthUsername);
    });

    it('should accept username with maximum length', () => {
      const maxLengthUsername = 'a'.repeat(50);
      const username = new Username(maxLengthUsername);
      expect(username.value).toBe(maxLengthUsername);
    });

    it('should trim whitespace from username', () => {
      const usernameWithSpaces = '  john_doe  ';
      const username = new Username(usernameWithSpaces);
      expect(username.value).toBe(usernameWithSpaces);
      expect(username.getDisplayName()).toBe('john_doe');
    });
  });

  describe('static create', () => {
    it('should create username using static method', () => {
      const username = Username.create(validUsername);
      expect(username).toBeInstanceOf(Username);
      expect(username.value).toBe(validUsername);
    });

    it('should throw error for invalid username using static method', () => {
      expect(() => Username.create('')).toThrow(InvalidUsernameException);
    });
  });

  describe('equals', () => {
    it('should return true for same usernames', () => {
      const username1 = new Username(validUsername);
      const username2 = new Username(validUsername);
      expect(username1.equals(username2)).toBe(true);
    });

    it('should return true for usernames with different case', () => {
      const username1 = new Username('John_Doe');
      const username2 = new Username('john_doe');
      expect(username1.equals(username2)).toBe(true);
    });

    it('should return true for usernames with different whitespace', () => {
      const username1 = new Username('  john_doe  ');
      const username2 = new Username('john_doe');
      expect(username1.equals(username2)).toBe(true);
    });

    it('should return false for different usernames', () => {
      const username1 = new Username('john_doe');
      const username2 = new Username('jane_doe');
      expect(username1.equals(username2)).toBe(false);
    });

    it('should return false for different types', () => {
      const username = new Username(validUsername);
      expect(username.equals(validUsername)).toBe(false);
      expect(username.equals({ value: validUsername })).toBe(false);
    });

    it('should return false for null', () => {
      const username = new Username(validUsername);
      expect(username.equals(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      const username = new Username(validUsername);
      expect(username.equals(undefined)).toBe(false);
    });
  });

  describe('normalize', () => {
    it('should normalize username to lowercase', () => {
      const username = new Username('John_Doe');
      expect(username.normalize()).toBe('john_doe');
    });

    it('should normalize username and trim whitespace', () => {
      const username = new Username('  John_Doe  ');
      expect(username.normalize()).toBe('john_doe');
    });

    it('should normalize mixed case username', () => {
      const username = new Username('JoHn_DoE123');
      expect(username.normalize()).toBe('john_doe123');
    });
  });

  describe('getDisplayName', () => {
    it('should return trimmed username', () => {
      const username = new Username('  john_doe  ');
      expect(username.getDisplayName()).toBe('john_doe');
    });

    it('should return original case for display', () => {
      const username = new Username('John_Doe');
      expect(username.getDisplayName()).toBe('John_Doe');
    });
  });

  describe('toString', () => {
    it('should return username string', () => {
      const username = new Username(validUsername);
      expect(username.toString()).toBe(validUsername);
    });

    it('should return username with original whitespace', () => {
      const usernameWithSpaces = '  john_doe  ';
      const username = new Username(usernameWithSpaces);
      expect(username.toString()).toBe(usernameWithSpaces);
    });
  });

  describe('toJSON', () => {
    it('should return valid JSON string', () => {
      const username = new Username(validUsername);
      const json = username.toJSON();
      const parsed = JSON.parse(json);
      expect(parsed).toEqual({ value: validUsername });
    });

    it('should handle username with special characters in JSON', () => {
      const username = new Username('john-doe_123');
      const json = username.toJSON();
      const parsed = JSON.parse(json);
      expect(parsed).toEqual({ value: 'john-doe_123' });
    });
  });

  describe('toObject', () => {
    it('should return plain object', () => {
      const username = new Username(validUsername);
      const obj = username.toObject();
      expect(obj).toEqual({ value: validUsername });
    });

    it('should return object with correct structure', () => {
      const username = new Username('john-doe_123');
      const obj = username.toObject();
      expect(obj).toHaveProperty('value');
      expect(obj.value).toBe('john-doe_123');
    });
  });

  describe('fromJSON', () => {
    it('should create username from valid JSON', () => {
      const json = JSON.stringify({ value: validUsername });
      const username = new Username(validUsername).fromJSON(json);
      expect(username.value).toBe(validUsername);
    });

    it('should throw error for invalid JSON', () => {
      const username = new Username(validUsername);
      expect(() => username.fromJSON('invalid json')).toThrow(InvalidUsernameException);
      expect(() => username.fromJSON('invalid json')).toThrow('Invalid JSON format for Username');
    });

    it('should throw error for JSON without value property', () => {
      const username = new Username(validUsername);
      expect(() => username.fromJSON('{"invalid": "data"}')).toThrow(InvalidUsernameException);
    });

    it('should throw error for JSON with invalid username value', () => {
      const username = new Username(validUsername);
      const json = JSON.stringify({ value: '' });
      expect(() => username.fromJSON(json)).toThrow(InvalidUsernameException);
    });
  });

  describe('clone', () => {
    it('should create identical copy', () => {
      const original = new Username(validUsername);
      const cloned = original.clone();

      expect(cloned).not.toBe(original);
      expect(cloned.value).toBe(original.value);
      expect(cloned.equals(original)).toBe(true);
    });

    it('should create independent copy', () => {
      const original = new Username('john_doe');
      const cloned = original.clone();

      // 验证克隆对象是独立的
      expect(cloned).toBeInstanceOf(Username);
      expect(cloned.value).toBe(original.value);
      expect(cloned.normalize()).toBe(original.normalize());
    });
  });

  describe('value getter', () => {
    it('should return the username value', () => {
      const username = new Username(validUsername);
      expect(username.value).toBe(validUsername);
    });

    it('should return value with original formatting', () => {
      const usernameWithSpaces = '  john_doe  ';
      const username = new Username(usernameWithSpaces);
      expect(username.value).toBe(usernameWithSpaces);
    });
  });

  describe('edge cases', () => {
    it('should handle username with only letters', () => {
      const username = new Username('john');
      expect(username.value).toBe('john');
    });

    it('should handle username with only numbers', () => {
      const username = new Username('john123');
      expect(username.value).toBe('john123');
    });

    it('should handle username with only underscores', () => {
      const username = new Username('john_doe');
      expect(username.value).toBe('john_doe');
    });

    it('should handle username with only hyphens', () => {
      const username = new Username('john-doe');
      expect(username.value).toBe('john-doe');
    });

    it('should handle username with mixed valid characters', () => {
      const username = new Username('john_doe-123');
      expect(username.value).toBe('john_doe-123');
    });

    it('should reject username with only numbers', () => {
      expect(() => new Username('123')).toThrow(InvalidUsernameException);
      expect(() => new Username('123')).toThrow('用户名不能以数字开头');
    });

    it('should reject username with only special characters', () => {
      expect(() => new Username('__')).toThrow(InvalidUsernameException);
      expect(() => new Username('__')).toThrow('用户名长度不能少于3个字符');
    });
  });

  describe('InvalidUsernameException', () => {
    it('should have correct name', () => {
      try {
        new Username('');
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidUsernameException);
        expect((error as Error).name).toBe('InvalidUsernameException');
      }
    });

    it('should include value in error message', () => {
      try {
        new Username('invalid@username');
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidUsernameException);
        expect((error as Error).message).toContain('用户名只能包含字母、数字、下划线和连字符');
      }
    });
  });
});
