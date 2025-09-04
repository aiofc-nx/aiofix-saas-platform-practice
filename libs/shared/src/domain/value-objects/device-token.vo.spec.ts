/**
 * @file device-token.vo.spec.ts
 * @description 设备令牌值对象单元测试
 */

import { DeviceToken, DeviceType } from './device-token.vo';

describe('DeviceToken', () => {
  // 有效的设备令牌
  const validIOSToken = 'a'.repeat(64); // 64位十六进制
  const validAndroidToken = 'b'.repeat(140); // Firebase FCM格式
  const validWebToken = 'c'.repeat(87); // Web Push格式
  const validCustomToken = 'd'.repeat(50); // 自定义格式

  // 无效的设备令牌
  const invalidTokenTooShort = 'a'.repeat(31);
  const invalidTokenTooLong = 'a'.repeat(257);
  const invalidTokenWithControlChars = 'a'.repeat(32) + '\x00' + 'b'.repeat(32);

  describe('constructor', () => {
    it('should create valid iOS device token', () => {
      const token = new DeviceToken(validIOSToken);
      expect(token.value).toBe(validIOSToken);
      expect(token.type).toBe(DeviceType.IOS);
      expect(token.isValid()).toBe(true);
    });

    it('should create valid Android device token', () => {
      const token = new DeviceToken(validAndroidToken);
      expect(token.value).toBe(validAndroidToken);
      expect(token.type).toBe(DeviceType.ANDROID);
      expect(token.isValid()).toBe(true);
    });

    it('should create valid Web device token', () => {
      const token = new DeviceToken(validWebToken);
      expect(token.value).toBe(validWebToken);
      expect(token.type).toBe(DeviceType.WEB);
      expect(token.isValid()).toBe(true);
    });

    it('should create valid custom device token', () => {
      const token = new DeviceToken(validCustomToken);
      expect(token.value).toBe(validCustomToken);
      expect(token.type).toBe(DeviceType.UNKNOWN);
      expect(token.isValid()).toBe(true);
    });

    it('should throw error for empty token', () => {
      expect(() => new DeviceToken('')).toThrow('设备令牌不能为空');
    });

    it('should throw error for null token', () => {
      expect(() => new DeviceToken(null as unknown)).toThrow(
        '设备令牌不能为空',
      );
    });

    it('should throw error for undefined token', () => {
      expect(() => new DeviceToken(undefined as unknown)).toThrow(
        '设备令牌不能为空',
      );
    });

    it('should throw error for token with only spaces', () => {
      expect(() => new DeviceToken('   ')).toThrow('设备令牌不能为空');
    });

    it('should throw error for token too short', () => {
      expect(() => new DeviceToken(invalidTokenTooShort)).toThrow(
        '设备令牌长度不能少于32个字符',
      );
    });

    it('should throw error for token too long', () => {
      expect(() => new DeviceToken(invalidTokenTooLong)).toThrow(
        '设备令牌长度不能超过256个字符',
      );
    });

    it('should throw error for token with control characters', () => {
      expect(() => new DeviceToken(invalidTokenWithControlChars)).toThrow(
        '设备令牌包含控制字符',
      );
    });

    it('should trim whitespace from token', () => {
      const tokenWithSpaces = '  ' + validIOSToken + '  ';
      const token = new DeviceToken(tokenWithSpaces);
      expect(token.value).toBe(validIOSToken);
    });
  });

  describe('static create', () => {
    it('should create device token using static method', () => {
      const token = DeviceToken.create(validIOSToken);
      expect(token).toBeInstanceOf(DeviceToken);
      expect(token.value).toBe(validIOSToken);
    });

    it('should throw error for invalid token using static method', () => {
      expect(() => DeviceToken.create('')).toThrow('设备令牌不能为空');
    });
  });

  describe('static createIOS', () => {
    it('should create valid iOS device token', () => {
      const token = DeviceToken.createIOS(validIOSToken);
      expect(token.type).toBe(DeviceType.IOS);
      expect(token.isValid()).toBe(true);
    });

    it('should throw error for non-iOS token', () => {
      expect(() => DeviceToken.createIOS(validAndroidToken)).toThrow(
        '无效的iOS设备令牌格式',
      );
    });
  });

  describe('static createAndroid', () => {
    it('should create valid Android device token', () => {
      const token = DeviceToken.createAndroid(validAndroidToken);
      expect(token.type).toBe(DeviceType.ANDROID);
      expect(token.isValid()).toBe(true);
    });

    it('should throw error for non-Android token', () => {
      expect(() => DeviceToken.createAndroid(validIOSToken)).toThrow(
        '无效的Android设备令牌格式',
      );
    });
  });

  describe('static createWeb', () => {
    it('should create valid Web device token', () => {
      const token = DeviceToken.createWeb(validWebToken);
      expect(token.type).toBe(DeviceType.WEB);
      expect(token.isValid()).toBe(true);
    });

    it('should throw error for non-Web token', () => {
      expect(() => DeviceToken.createWeb(validIOSToken)).toThrow(
        '无效的Web设备令牌格式',
      );
    });
  });

  describe('device type detection', () => {
    it('should detect iOS device correctly', () => {
      const token = new DeviceToken(validIOSToken);
      expect(token.isIOS()).toBe(true);
      expect(token.isAndroid()).toBe(false);
      expect(token.isWeb()).toBe(false);
    });

    it('should detect Android device correctly', () => {
      const token = new DeviceToken(validAndroidToken);
      expect(token.isIOS()).toBe(false);
      expect(token.isAndroid()).toBe(true);
      expect(token.isWeb()).toBe(false);
    });

    it('should detect Web device correctly', () => {
      const token = new DeviceToken(validWebToken);
      expect(token.isIOS()).toBe(false);
      expect(token.isAndroid()).toBe(false);
      expect(token.isWeb()).toBe(true);
    });

    it('should detect unknown device correctly', () => {
      const token = new DeviceToken(validCustomToken);
      expect(token.isIOS()).toBe(false);
      expect(token.isAndroid()).toBe(false);
      expect(token.isWeb()).toBe(false);
    });
  });

  describe('equals', () => {
    it('should return true for same tokens', () => {
      const token1 = new DeviceToken(validIOSToken);
      const token2 = new DeviceToken(validIOSToken);
      expect(token1.equals(token2)).toBe(true);
    });

    it('should return false for different tokens', () => {
      const token1 = new DeviceToken(validIOSToken);
      const token2 = new DeviceToken(validAndroidToken);
      expect(token1.equals(token2)).toBe(false);
    });

    it('should return false for different types', () => {
      const token = new DeviceToken(validIOSToken);
      expect(token.equals(validIOSToken)).toBe(false);
      expect(token.equals({ value: validIOSToken })).toBe(false);
    });

    it('should return false for null', () => {
      const token = new DeviceToken(validIOSToken);
      expect(token.equals(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      const token = new DeviceToken(validIOSToken);
      expect(token.equals(undefined)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return token string', () => {
      const token = new DeviceToken(validIOSToken);
      expect(token.toString()).toBe(validIOSToken);
    });
  });

  describe('toJSON', () => {
    it('should return valid JSON string', () => {
      const token = new DeviceToken(validIOSToken);
      const json = token.toJSON();
      const parsed = JSON.parse(json);
      expect(parsed).toHaveProperty('value');
      expect(parsed).toHaveProperty('info');
      expect(parsed.value).toBe(validIOSToken);
    });
  });

  describe('toObject', () => {
    it('should return plain object', () => {
      const token = new DeviceToken(validIOSToken);
      const obj = token.toObject();
      expect(obj).toHaveProperty('value');
      expect(obj).toHaveProperty('info');
      expect(obj.value).toBe(validIOSToken);
    });
  });

  describe('fromJSON', () => {
    it('should create token from valid JSON', () => {
      const json = JSON.stringify({ value: validIOSToken });
      const token = new DeviceToken(validIOSToken).fromJSON(json);
      expect(token.value).toBe(validIOSToken);
    });

    it('should throw error for invalid JSON', () => {
      const token = new DeviceToken(validIOSToken);
      expect(() => token.fromJSON('invalid json')).toThrow();
    });
  });

  describe('clone', () => {
    it('should create identical copy', () => {
      const original = new DeviceToken(validIOSToken);
      const cloned = original.clone();

      expect(cloned).not.toBe(original);
      expect(cloned.value).toBe(original.value);
      expect(cloned.equals(original)).toBe(true);
    });

    it('should create independent copy', () => {
      const original = new DeviceToken(validIOSToken);
      const cloned = original.clone();

      expect(cloned).toBeInstanceOf(DeviceToken);
      expect(cloned.value).toBe(original.value);
      expect(cloned.type).toBe(original.type);
    });
  });

  describe('info property', () => {
    it('should return device token info', () => {
      const token = new DeviceToken(validIOSToken);
      const info = token.info;

      expect(info).toHaveProperty('type');
      expect(info).toHaveProperty('isValid');
      expect(info).toHaveProperty('length');
      expect(info.type).toBe(DeviceType.IOS);
      expect(info.isValid).toBe(true);
      expect(info.length).toBe(validIOSToken.length);
    });

    it('should return immutable info object', () => {
      const token = new DeviceToken(validIOSToken);
      const info1 = token.info;
      const info2 = token.info;

      expect(info1).not.toBe(info2);
      expect(info1).toEqual(info2);
    });
  });

  describe('length property', () => {
    it('should return correct token length', () => {
      const token = new DeviceToken(validIOSToken);
      expect(token.length).toBe(validIOSToken.length);
    });
  });

  describe('value getter', () => {
    it('should return the token value', () => {
      const token = new DeviceToken(validIOSToken);
      expect(token.value).toBe(validIOSToken);
    });

    it('should return readonly value', () => {
      const token = new DeviceToken(validIOSToken);
      expect(() => {
        (token as unknown).value = 'new-value';
      }).toThrow();
    });
  });

  describe('edge cases', () => {
    it('should handle minimum length token', () => {
      const minLengthToken = 'a'.repeat(32);
      const token = new DeviceToken(minLengthToken);
      expect(token.value).toBe(minLengthToken);
      expect(token.isValid()).toBe(true);
    });

    it('should handle maximum length token', () => {
      const maxLengthToken = 'a'.repeat(256);
      const token = new DeviceToken(maxLengthToken);
      expect(token.value).toBe(maxLengthToken);
      expect(token.isValid()).toBe(true);
    });

    it('should handle token with special characters', () => {
      const specialToken = 'a'.repeat(32) + '_-.' + 'b'.repeat(32);
      const token = new DeviceToken(specialToken);
      expect(token.value).toBe(specialToken);
      expect(token.isValid()).toBe(true);
    });
  });

  describe('DeviceType enum', () => {
    it('should have correct enum values', () => {
      expect(DeviceType.IOS).toBe('ios');
      expect(DeviceType.ANDROID).toBe('android');
      expect(DeviceType.WEB).toBe('web');
      expect(DeviceType.UNKNOWN).toBe('unknown');
    });
  });
});
