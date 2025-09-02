/**
 * @file user-id.vo.spec.ts
 * @description 用户ID值对象单元测试
 */

import { UserId, InvalidUserIdError } from './user-id.vo';
import { Uuid } from './uuid.vo';

describe('UserId', () => {
  const validUuid = '123e4567-e89b-4d3a-a456-426614174000';
  const invalidUuid = 'invalid-uuid';

  describe('constructor', () => {
    it('should create valid UserId value object', () => {
      const userId = new UserId(validUuid);
      expect(userId.value).toBe(validUuid);
    });

    it('should throw error for empty UserId', () => {
      expect(() => new UserId('')).toThrow(InvalidUserIdError);
      expect(() => new UserId('')).toThrow('UUID cannot be empty');
    });

    it('should throw error for null UserId', () => {
      expect(() => new UserId(null as any)).toThrow(InvalidUserIdError);
      expect(() => new UserId(null as any)).toThrow('UUID cannot be empty');
    });

    it('should throw error for invalid UserId format', () => {
      expect(() => new UserId(invalidUuid)).toThrow(InvalidUserIdError);
      expect(() => new UserId(invalidUuid)).toThrow('Invalid UUID v4 format');
    });

    it('should throw error for non-v4 UUID', () => {
      // UUID v1 format
      const v1Uuid = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
      expect(() => new UserId(v1Uuid)).toThrow(InvalidUserIdError);
    });

    it('should accept valid UserId with uppercase', () => {
      const upperUuid = '123E4567-E89B-4D3A-A456-426614174000';
      const userId = new UserId(upperUuid);
      expect(userId.value).toBe(upperUuid);
    });
  });

  describe('static create', () => {
    it('should create UserId using static method', () => {
      const userId = UserId.create(validUuid);
      expect(userId).toBeInstanceOf(UserId);
      expect(userId.value).toBe(validUuid);
    });

    it('should throw error for invalid UserId using static method', () => {
      expect(() => UserId.create('')).toThrow(InvalidUserIdError);
    });
  });

  describe('static generate', () => {
    it('should generate valid UserId', () => {
      const userId = UserId.generate();
      expect(userId).toBeInstanceOf(UserId);
      expect(Uuid.isValid(userId.value)).toBe(true);
    });

    it('should generate different UserIds', () => {
      const userId1 = UserId.generate();
      const userId2 = UserId.generate();
      expect(userId1.value).not.toBe(userId2.value);
    });

    it('should generate UUID v4 format', () => {
      const userId = UserId.generate();
      const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(uuidV4Regex.test(userId.value)).toBe(true);
    });
  });

  describe('static fromUuid', () => {
    it('should create UserId from Uuid', () => {
      const uuid = new Uuid(validUuid);
      const userId = UserId.fromUuid(uuid);
      expect(userId).toBeInstanceOf(UserId);
      expect(userId.value).toBe(validUuid);
    });

    it('should create UserId from generated Uuid', () => {
      const uuid = Uuid.generate();
      const userId = UserId.fromUuid(uuid);
      expect(userId).toBeInstanceOf(UserId);
      expect(userId.value).toBe(uuid.value);
    });
  });

  describe('equals', () => {
    it('should return true for same UserIds', () => {
      const userId1 = new UserId(validUuid);
      const userId2 = new UserId(validUuid);
      expect(userId1.equals(userId2)).toBe(true);
    });

    it('should return false for different UserIds', () => {
      const userId1 = new UserId(validUuid);
      const userId2 = new UserId('123e4567-e89b-4d3a-a456-426614174001');
      expect(userId1.equals(userId2)).toBe(false);
    });

    it('should return false for different types', () => {
      const userId = new UserId(validUuid);
      expect(userId.equals(validUuid)).toBe(false);
      expect(userId.equals({ value: validUuid })).toBe(false);
    });

    it('should return false for Uuid type', () => {
      const userId = new UserId(validUuid);
      const uuid = new Uuid(validUuid);
      expect(userId.equals(uuid)).toBe(false);
    });

    it('should return false for null', () => {
      const userId = new UserId(validUuid);
      expect(userId.equals(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      const userId = new UserId(validUuid);
      expect(userId.equals(undefined)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return UserId string', () => {
      const userId = new UserId(validUuid);
      expect(userId.toString()).toBe(validUuid);
    });

    it('should return same value as value property', () => {
      const userId = new UserId(validUuid);
      expect(userId.toString()).toBe(userId.value);
    });
  });

  describe('toUuid', () => {
    it('should convert UserId to Uuid', () => {
      const userId = new UserId(validUuid);
      const uuid = userId.toUuid();
      expect(uuid).toBeInstanceOf(Uuid);
      expect(uuid.value).toBe(validUuid);
    });

    it('should create independent Uuid instance', () => {
      const userId = new UserId(validUuid);
      const uuid1 = userId.toUuid();
      const uuid2 = userId.toUuid();
      expect(uuid1).not.toBe(uuid2);
      expect(uuid1.value).toBe(uuid2.value);
    });
  });

  describe('inheritance from Uuid', () => {
    it('should inherit Uuid methods', () => {
      const userId = new UserId(validUuid);
      
      // 测试继承的方法
      expect(typeof userId.toJSON).toBe('function');
      expect(typeof userId.toObject).toBe('function');
      expect(typeof userId.fromJSON).toBe('function');
      expect(typeof userId.clone).toBe('function');
    });

    it('should work with Uuid static methods', () => {
      const userId = new UserId(validUuid);
      expect(Uuid.isValid(userId.value)).toBe(true);
    });

    it('should be compatible with Uuid type checking', () => {
      const userId = new UserId(validUuid);
      expect(userId instanceof Uuid).toBe(true);
    });
  });

  describe('toJSON', () => {
    it('should return valid JSON string', () => {
      const userId = new UserId(validUuid);
      const json = userId.toJSON();
      const parsed = JSON.parse(json);
      expect(parsed).toEqual({ value: validUuid });
    });
  });

  describe('toObject', () => {
    it('should return plain object', () => {
      const userId = new UserId(validUuid);
      const obj = userId.toObject();
      expect(obj).toEqual({ value: validUuid });
    });
  });

  describe('fromJSON', () => {
    it('should create UserId from valid JSON', () => {
      const json = JSON.stringify({ value: validUuid });
      const userId = new UserId(validUuid).fromJSON(json);
      expect(userId.value).toBe(validUuid);
    });

    it('should throw error for invalid JSON', () => {
      const userId = new UserId(validUuid);
      expect(() => userId.fromJSON('invalid json')).toThrow(InvalidUserIdError);
    });

    it('should throw error for JSON without value property', () => {
      const userId = new UserId(validUuid);
      expect(() => userId.fromJSON('{"invalid": "data"}')).toThrow(InvalidUserIdError);
    });
  });

  describe('clone', () => {
    it('should create identical copy', () => {
      const original = new UserId(validUuid);
      const cloned = original.clone();

      expect(cloned).not.toBe(original);
      expect(cloned.value).toBe(original.value);
      expect(cloned.equals(original)).toBe(true);
    });

    it('should create independent copy', () => {
      const original = new UserId(validUuid);
      const cloned = original.clone();

      expect(cloned).toBeInstanceOf(UserId);
      expect(cloned.value).toBe(original.value);
      expect(cloned.toString()).toBe(original.toString());
    });
  });

  describe('value getter', () => {
    it('should return the UserId value', () => {
      const userId = new UserId(validUuid);
      expect(userId.value).toBe(validUuid);
    });

    it('should return readonly value', () => {
      const userId = new UserId(validUuid);
      expect(() => {
        (userId as any).value = 'new-value';
      }).toThrow();
    });
  });

  describe('type safety', () => {
    it('should be distinct from Uuid type', () => {
      const userId = new UserId(validUuid);
      const uuid = new Uuid(validUuid);
      
      // 类型检查
      expect(userId).toBeInstanceOf(UserId);
      expect(userId).toBeInstanceOf(Uuid);
      expect(uuid).toBeInstanceOf(Uuid);
      expect(uuid).not.toBeInstanceOf(UserId);
    });

    it('should provide type safety for UserId specific operations', () => {
      const userId = new UserId(validUuid);
      
      // UserId特有的方法
      expect(typeof userId.toUuid).toBe('function');
      expect(typeof UserId.fromUuid).toBe('function');
    });
  });

  describe('InvalidUserIdError', () => {
    it('should have correct name', () => {
      try {
        new UserId('');
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidUserIdError);
        expect((error as Error).name).toBe('InvalidUuidError'); // 继承自Uuid的错误类型
      }
    });

    it('should include value in error message', () => {
      try {
        new UserId(invalidUuid);
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidUserIdError);
        expect((error as Error).message).toContain('Invalid UUID v4 format');
      }
    });
  });

  describe('cross-domain usage scenarios', () => {
    it('should work as primary key in User entity', () => {
      const userId = UserId.generate();
      // 模拟在用户实体中使用
      const userEntity = {
        id: userId,
        username: 'john_doe'
      };
      expect(userEntity.id).toBeInstanceOf(UserId);
      expect(userEntity.id.value).toBe(userId.value);
    });

    it('should work as foreign key in Order entity', () => {
      const userId = UserId.generate();
      // 模拟在订单实体中使用
      const orderEntity = {
        id: 'order-123',
        createdBy: userId,
        assignedTo: userId
      };
      expect(orderEntity.createdBy).toBeInstanceOf(UserId);
      expect(orderEntity.assignedTo).toBeInstanceOf(UserId);
    });

    it('should work as foreign key in Task entity', () => {
      const userId = UserId.generate();
      // 模拟在任务实体中使用
      const taskEntity = {
        id: 'task-123',
        assigneeId: userId,
        createdBy: userId
      };
      expect(taskEntity.assigneeId).toBeInstanceOf(UserId);
      expect(taskEntity.createdBy).toBeInstanceOf(UserId);
    });

    it('should work as foreign key in Notification entity', () => {
      const userId = UserId.generate();
      // 模拟在通知实体中使用
      const notificationEntity = {
        id: 'notification-123',
        recipientId: userId,
        senderId: userId
      };
      expect(notificationEntity.recipientId).toBeInstanceOf(UserId);
      expect(notificationEntity.senderId).toBeInstanceOf(UserId);
    });

    it('should work as foreign key in AuditLog entity', () => {
      const userId = UserId.generate();
      // 模拟在审计日志中使用
      const auditLogEntity = {
        id: 'audit-123',
        userId: userId,
        targetUserId: userId
      };
      expect(auditLogEntity.userId).toBeInstanceOf(UserId);
      expect(auditLogEntity.targetUserId).toBeInstanceOf(UserId);
    });
  });
});
