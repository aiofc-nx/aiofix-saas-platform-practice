/**
 * @file webhook-url.vo.spec.ts
 * @description Webhook URL值对象单元测试
 */

import { WebhookUrl, WebhookProtocol } from './webhook-url.vo';

describe('WebhookUrl', () => {
  // 有效的Webhook URL
  const validHttpUrl = 'http://api.example.com/webhook';
  const validHttpsUrl = 'https://api.example.com/webhook';
  const validUrlWithPort = 'https://api.example.com:8080/webhook';
  const validUrlWithPath = 'https://api.example.com/webhook/events';
  const validUrlWithQuery = 'https://api.example.com/webhook?token=123';
  const validUrlWithSubdomain = 'https://webhook.api.example.com/events';
  const validUrlWithComplexPath =
    'https://api.example.com/webhook/v1/events/user-created';

  // 无效的Webhook URL
  const invalidUrlEmpty = '';
  const invalidUrlNoProtocol = 'api.example.com/webhook';
  const invalidUrlInvalidProtocol = 'ftp://api.example.com/webhook';
  const invalidUrlNoHostname = 'https:///webhook';
  const invalidUrlNoPath = 'https://api.example.com';
  const invalidUrlLocalhost = 'https://localhost/webhook';
  const invalidUrl127001 = 'https://127.0.0.1/webhook';
  const invalidUrlPrivateIP = 'https://192.168.1.1/webhook';
  const invalidUrlTooLong = 'https://api.example.com/' + 'a'.repeat(2000);
  const invalidUrlInvalidPort = 'https://api.example.com:99999/webhook';

  describe('constructor', () => {
    it('should create valid HTTP webhook URL', () => {
      const url = new WebhookUrl(validHttpUrl);
      expect(url.value).toBe(validHttpUrl);
      expect(url.protocol).toBe(WebhookProtocol.HTTP);
      expect(url.isValid()).toBe(true);
      expect(url.isSecure()).toBe(false);
    });

    it('should create valid HTTPS webhook URL', () => {
      const url = new WebhookUrl(validHttpsUrl);
      expect(url.value).toBe(validHttpsUrl);
      expect(url.protocol).toBe(WebhookProtocol.HTTPS);
      expect(url.isValid()).toBe(true);
      expect(url.isSecure()).toBe(true);
    });

    it('should create valid URL with port', () => {
      const url = new WebhookUrl(validUrlWithPort);
      expect(url.value).toBe(validUrlWithPort);
      expect(url.port).toBe(8080);
      expect(url.isValid()).toBe(true);
    });

    it('should create valid URL with path', () => {
      const url = new WebhookUrl(validUrlWithPath);
      expect(url.value).toBe(validUrlWithPath);
      expect(url.path).toBe('/webhook/events');
      expect(url.isValid()).toBe(true);
    });

    it('should create valid URL with query parameters', () => {
      const url = new WebhookUrl(validUrlWithQuery);
      expect(url.value).toBe(validUrlWithQuery);
      expect(url.isValid()).toBe(true);
    });

    it('should create valid URL with subdomain', () => {
      const url = new WebhookUrl(validUrlWithSubdomain);
      expect(url.value).toBe(validUrlWithSubdomain);
      expect(url.hostname).toBe('webhook.api.example.com');
      expect(url.isValid()).toBe(true);
    });

    it('should create valid URL with complex path', () => {
      const url = new WebhookUrl(validUrlWithComplexPath);
      expect(url.value).toBe(validUrlWithComplexPath);
      expect(url.path).toBe('/webhook/v1/events/user-created');
      expect(url.isValid()).toBe(true);
    });

    it('should normalize URL by removing default ports', () => {
      const urlWithDefaultPort = 'https://api.example.com:443/webhook';
      const url = new WebhookUrl(urlWithDefaultPort);
      expect(url.value).toBe('https://api.example.com/webhook');
    });

    it('should normalize URL by removing trailing slash', () => {
      const urlWithTrailingSlash = 'https://api.example.com/webhook/';
      const url = new WebhookUrl(urlWithTrailingSlash);
      expect(url.value).toBe('https://api.example.com/webhook');
    });

    it('should throw error for empty URL', () => {
      expect(() => new WebhookUrl(invalidUrlEmpty)).toThrow(
        'Webhook URL不能为空',
      );
    });

    it('should throw error for null URL', () => {
      expect(() => new WebhookUrl(null as unknown)).toThrow(
        'Webhook URL不能为空',
      );
    });

    it('should throw error for undefined URL', () => {
      expect(() => new WebhookUrl(undefined as unknown)).toThrow(
        'Webhook URL不能为空',
      );
    });

    it('should throw error for URL with only spaces', () => {
      expect(() => new WebhookUrl('   ')).toThrow('Webhook URL不能为空');
    });

    it('should throw error for URL without protocol', () => {
      expect(() => new WebhookUrl(invalidUrlNoProtocol)).toThrow(
        'Webhook URL格式无效',
      );
    });

    it('should throw error for URL with invalid protocol', () => {
      expect(() => new WebhookUrl(invalidUrlInvalidProtocol)).toThrow(
        'Webhook URL只支持HTTP和HTTPS协议',
      );
    });

    it('should throw error for URL without hostname', () => {
      expect(() => new WebhookUrl(invalidUrlNoHostname)).toThrow(
        'Webhook URL必须包含有效的主机名',
      );
    });

    it('should throw error for URL without path', () => {
      expect(() => new WebhookUrl(invalidUrlNoPath)).toThrow(
        'Webhook URL必须包含有效的路径',
      );
    });

    it('should throw error for localhost URL', () => {
      expect(() => new WebhookUrl(invalidUrlLocalhost)).toThrow(
        'Webhook URL不能指向本地地址',
      );
    });

    it('should throw error for 127.0.0.1 URL', () => {
      expect(() => new WebhookUrl(invalidUrl127001)).toThrow(
        'Webhook URL不能指向本地地址',
      );
    });

    it('should throw error for private IP URL', () => {
      expect(() => new WebhookUrl(invalidUrlPrivateIP)).toThrow(
        'Webhook URL不能指向私有网络地址',
      );
    });

    it('should throw error for URL too long', () => {
      expect(() => new WebhookUrl(invalidUrlTooLong)).toThrow(
        'Webhook URL长度不能超过2048个字符',
      );
    });

    it('should throw error for URL with invalid port', () => {
      expect(() => new WebhookUrl(invalidUrlInvalidPort)).toThrow(
        'Webhook URL端口号必须在1-65535之间',
      );
    });

    it('should trim whitespace from URL', () => {
      const urlWithSpaces = '  ' + validHttpsUrl + '  ';
      const url = new WebhookUrl(urlWithSpaces);
      expect(url.value).toBe(validHttpsUrl);
    });
  });

  describe('static create', () => {
    it('should create webhook URL using static method', () => {
      const url = WebhookUrl.create(validHttpsUrl);
      expect(url).toBeInstanceOf(WebhookUrl);
      expect(url.value).toBe(validHttpsUrl);
    });

    it('should throw error for invalid URL using static method', () => {
      expect(() => WebhookUrl.create('')).toThrow('Webhook URL不能为空');
    });
  });

  describe('static createHTTPS', () => {
    it('should create valid HTTPS webhook URL', () => {
      const url = WebhookUrl.createHTTPS(validHttpsUrl);
      expect(url.protocol).toBe(WebhookProtocol.HTTPS);
      expect(url.isHTTPS()).toBe(true);
    });

    it('should throw error for non-HTTPS URL', () => {
      expect(() => WebhookUrl.createHTTPS(validHttpUrl)).toThrow(
        'Webhook URL必须是HTTPS协议',
      );
    });
  });

  describe('static isValid', () => {
    it('should return true for valid URL', () => {
      expect(WebhookUrl.isValid(validHttpsUrl)).toBe(true);
    });

    it('should return false for invalid URL', () => {
      expect(WebhookUrl.isValid('')).toBe(false);
      expect(WebhookUrl.isValid(invalidUrlNoProtocol)).toBe(false);
      expect(WebhookUrl.isValid(invalidUrlLocalhost)).toBe(false);
    });
  });

  describe('protocol detection', () => {
    it('should detect HTTP protocol correctly', () => {
      const url = new WebhookUrl(validHttpUrl);
      expect(url.protocol).toBe(WebhookProtocol.HTTP);
      expect(url.isHTTPS()).toBe(false);
      expect(url.isSecure()).toBe(false);
    });

    it('should detect HTTPS protocol correctly', () => {
      const url = new WebhookUrl(validHttpsUrl);
      expect(url.protocol).toBe(WebhookProtocol.HTTPS);
      expect(url.isHTTPS()).toBe(true);
      expect(url.isSecure()).toBe(true);
    });
  });

  describe('hostname property', () => {
    it('should return correct hostname', () => {
      const url = new WebhookUrl(validHttpsUrl);
      expect(url.hostname).toBe('api.example.com');
    });

    it('should return correct hostname with subdomain', () => {
      const url = new WebhookUrl(validUrlWithSubdomain);
      expect(url.hostname).toBe('webhook.api.example.com');
    });
  });

  describe('port property', () => {
    it('should return correct port', () => {
      const url = new WebhookUrl(validUrlWithPort);
      expect(url.port).toBe(8080);
    });

    it('should return undefined for default ports', () => {
      const url = new WebhookUrl(validHttpsUrl);
      expect(url.port).toBeUndefined();
    });
  });

  describe('path property', () => {
    it('should return correct path', () => {
      const url = new WebhookUrl(validHttpsUrl);
      expect(url.path).toBe('/webhook');
    });

    it('should return correct complex path', () => {
      const url = new WebhookUrl(validUrlWithComplexPath);
      expect(url.path).toBe('/webhook/v1/events/user-created');
    });
  });

  describe('equals', () => {
    it('should return true for same URLs', () => {
      const url1 = new WebhookUrl(validHttpsUrl);
      const url2 = new WebhookUrl(validHttpsUrl);
      expect(url1.equals(url2)).toBe(true);
    });

    it('should return false for different URLs', () => {
      const url1 = new WebhookUrl(validHttpsUrl);
      const url2 = new WebhookUrl(validHttpUrl);
      expect(url1.equals(url2)).toBe(false);
    });

    it('should return false for different types', () => {
      const url = new WebhookUrl(validHttpsUrl);
      expect(url.equals(validHttpsUrl)).toBe(false);
      expect(url.equals({ value: validHttpsUrl })).toBe(false);
    });

    it('should return false for null', () => {
      const url = new WebhookUrl(validHttpsUrl);
      expect(url.equals(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      const url = new WebhookUrl(validHttpsUrl);
      expect(url.equals(undefined)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return URL string', () => {
      const url = new WebhookUrl(validHttpsUrl);
      expect(url.toString()).toBe(validHttpsUrl);
    });
  });

  describe('toJSON', () => {
    it('should return valid JSON string', () => {
      const url = new WebhookUrl(validHttpsUrl);
      const json = url.toJSON();
      const parsed = JSON.parse(json) as { value: string; info: unknown };
      expect(parsed).toHaveProperty('value');
      expect(parsed).toHaveProperty('info');
      expect(parsed.value).toBe(validHttpsUrl);
    });
  });

  describe('toObject', () => {
    it('should return plain object', () => {
      const url = new WebhookUrl(validHttpsUrl);
      const obj = url.toObject();
      expect(obj).toHaveProperty('value');
      expect(obj).toHaveProperty('info');
      expect(obj.value).toBe(validHttpsUrl);
    });
  });

  describe('fromJSON', () => {
    it('should create URL from valid JSON', () => {
      const json = JSON.stringify({ value: validHttpsUrl });
      const url = new WebhookUrl(validHttpsUrl).fromJSON(json);
      expect(url.value).toBe(validHttpsUrl);
    });

    it('should throw error for invalid JSON', () => {
      const url = new WebhookUrl(validHttpsUrl);
      expect(() => url.fromJSON('invalid json')).toThrow();
    });
  });

  describe('clone', () => {
    it('should create identical copy', () => {
      const original = new WebhookUrl(validHttpsUrl);
      const cloned = original.clone();

      expect(cloned).not.toBe(original);
      expect(cloned.value).toBe(original.value);
      expect(cloned.equals(original)).toBe(true);
    });

    it('should create independent copy', () => {
      const original = new WebhookUrl(validHttpsUrl);
      const cloned = original.clone();

      expect(cloned).toBeInstanceOf(WebhookUrl);
      expect(cloned.value).toBe(original.value);
      expect(cloned.protocol).toBe(original.protocol);
      expect(cloned.hostname).toBe(original.hostname);
    });
  });

  describe('toURL', () => {
    it('should convert to URL object', () => {
      const webhookUrl = new WebhookUrl(validHttpsUrl);
      const url = webhookUrl.toURL();
      expect(url).toBeInstanceOf(URL);
      expect(url.toString()).toBe(validHttpsUrl);
    });
  });

  describe('info property', () => {
    it('should return webhook URL info', () => {
      const url = new WebhookUrl(validHttpsUrl);
      const info = url.info;

      expect(info).toHaveProperty('protocol');
      expect(info).toHaveProperty('hostname');
      expect(info).toHaveProperty('path');
      expect(info).toHaveProperty('isValid');
      expect(info).toHaveProperty('isSecure');
      expect(info.protocol).toBe(WebhookProtocol.HTTPS);
      expect(info.hostname).toBe('api.example.com');
      expect(info.path).toBe('/webhook');
      expect(info.isValid).toBe(true);
      expect(info.isSecure).toBe(true);
    });

    it('should return immutable info object', () => {
      const url = new WebhookUrl(validHttpsUrl);
      const info1 = url.info;
      const info2 = url.info;

      expect(info1).not.toBe(info2);
      expect(info1).toEqual(info2);
    });
  });

  describe('value getter', () => {
    it('should return the URL value', () => {
      const url = new WebhookUrl(validHttpsUrl);
      expect(url.value).toBe(validHttpsUrl);
    });

    it('should return readonly value', () => {
      const url = new WebhookUrl(validHttpsUrl);
      expect(() => {
        (url as unknown).value = 'new-value';
      }).toThrow();
    });
  });

  describe('security checks', () => {
    it('should reject localhost URLs', () => {
      const localhostUrls = [
        'https://localhost/webhook',
        'https://127.0.0.1/webhook',
        'https://::1/webhook',
        'https://0.0.0.0/webhook',
        'https://::/webhook',
      ];

      localhostUrls.forEach(urlStr => {
        expect(() => new WebhookUrl(urlStr)).toThrow(
          'Webhook URL不能指向本地地址',
        );
      });
    });

    it('should reject private network URLs', () => {
      const privateUrls = [
        'https://10.0.0.1/webhook',
        'https://172.16.0.1/webhook',
      ];

      privateUrls.forEach(urlStr => {
        expect(() => new WebhookUrl(urlStr)).toThrow(
          'Webhook URL不能指向私有网络地址',
        );
      });
    });
  });

  describe('edge cases', () => {
    it('should handle URL with maximum length', () => {
      const maxLengthUrl = 'https://api.example.com/' + 'a'.repeat(2000);
      const url = new WebhookUrl(maxLengthUrl);
      expect(url.value).toBe(maxLengthUrl);
      expect(url.isValid()).toBe(true);
    });

    it('should handle URL with complex query parameters', () => {
      const complexUrl =
        'https://api.example.com/webhook?token=123&event=user.created&timestamp=1234567890';
      const url = new WebhookUrl(complexUrl);
      expect(url.value).toBe(complexUrl);
      expect(url.isValid()).toBe(true);
    });

    it('should handle URL with fragments', () => {
      const urlWithFragment = 'https://api.example.com/webhook#section1';
      const url = new WebhookUrl(urlWithFragment);
      expect(url.value).toBe(urlWithFragment);
      expect(url.isValid()).toBe(true);
    });
  });

  describe('WebhookProtocol enum', () => {
    it('should have correct enum values', () => {
      expect(WebhookProtocol.HTTP).toBe('http');
      expect(WebhookProtocol.HTTPS).toBe('https');
    });
  });
});
