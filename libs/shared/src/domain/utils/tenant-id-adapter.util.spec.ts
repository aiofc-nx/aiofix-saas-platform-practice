/**
 * @file tenant-id-adapter.util.spec.ts
 * @description TenantIdAdapter单元测试
 *
 * 测试覆盖范围：
 * 1. 基本类型转换功能
 * 2. 数组类型转换功能
 * 3. 安全转换功能（处理undefined）
 * 4. 边界情况和异常处理
 */

import { TenantIdAdapter } from './tenant-id-adapter.util';
import { Uuid, TenantId } from '../value-objects';

describe('TenantIdAdapter', () => {
  describe('fromUuid', () => {
    it('应该正确将Uuid转换为TenantId', () => {
      // Arrange
      const uuid = new Uuid('123e4567-e89b-12d3-a456-426614174000');

      // Act
      const result = TenantIdAdapter.fromUuid(uuid);

      // Assert
      expect(result).toBeInstanceOf(TenantId);
      expect(result.toString()).toBe('123e4567-e89b-12d3-a456-426614174000');
    });

    it('应该保持UUID值的完整性', () => {
      // Arrange
      const uuidValue = '987fcdeb-51a2-43d1-9f12-345678901234';
      const uuid = new Uuid(uuidValue);

      // Act
      const result = TenantIdAdapter.fromUuid(uuid);

      // Assert
      expect(result.toString()).toBe(uuidValue);
    });
  });

  describe('fromUuidArray', () => {
    it('应该正确将Uuid数组转换为TenantId数组', () => {
      // Arrange
      const uuids = [
        new Uuid('11111111-1111-1111-1111-111111111111'),
        new Uuid('22222222-2222-2222-2222-222222222222'),
        new Uuid('33333333-3333-3333-3333-333333333333'),
      ];

      // Act
      const result = TenantIdAdapter.fromUuidArray(uuids);

      // Assert
      expect(result).toHaveLength(3);
      expect(result[0]).toBeInstanceOf(TenantId);
      expect(result[1]).toBeInstanceOf(TenantId);
      expect(result[2]).toBeInstanceOf(TenantId);
      expect(result[0].toString()).toBe('11111111-1111-1111-1111-111111111111');
      expect(result[1].toString()).toBe('22222222-2222-2222-2222-222222222222');
      expect(result[2].toString()).toBe('33333333-3333-3333-3333-333333333333');
    });

    it('应该正确处理空数组', () => {
      // Arrange
      const uuids: Uuid[] = [];

      // Act
      const result = TenantIdAdapter.fromUuidArray(uuids);

      // Assert
      expect(result).toHaveLength(0);
      expect(Array.isArray(result)).toBe(true);
    });

    it('应该保持数组顺序', () => {
      // Arrange
      const uuids = [
        new Uuid('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
        new Uuid('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
      ];

      // Act
      const result = TenantIdAdapter.fromUuidArray(uuids);

      // Assert
      expect(result[0].toString()).toBe('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
      expect(result[1].toString()).toBe('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');
    });
  });

  describe('toUuid', () => {
    it('应该正确将TenantId转换为Uuid', () => {
      // Arrange
      const tenantId = new TenantId('456e7890-e89b-12d3-a456-426614174000');

      // Act
      const result = TenantIdAdapter.toUuid(tenantId);

      // Assert
      expect(result).toBeInstanceOf(Uuid);
      expect(result.toString()).toBe('456e7890-e89b-12d3-a456-426614174000');
    });

    it('应该保持UUID值的完整性', () => {
      // Arrange
      const uuidValue = 'abcdef12-3456-7890-abcd-ef1234567890';
      const tenantId = new TenantId(uuidValue);

      // Act
      const result = TenantIdAdapter.toUuid(tenantId);

      // Assert
      expect(result.toString()).toBe(uuidValue);
    });
  });

  describe('toUuidArray', () => {
    it('应该正确将TenantId数组转换为Uuid数组', () => {
      // Arrange
      const tenantIds = [
        new TenantId('44444444-4444-4444-4444-444444444444'),
        new TenantId('55555555-5555-5555-5555-555555555555'),
      ];

      // Act
      const result = TenantIdAdapter.toUuidArray(tenantIds);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Uuid);
      expect(result[1]).toBeInstanceOf(Uuid);
      expect(result[0].toString()).toBe('44444444-4444-4444-4444-444444444444');
      expect(result[1].toString()).toBe('55555555-5555-5555-5555-555555555555');
    });

    it('应该正确处理空数组', () => {
      // Arrange
      const tenantIds: TenantId[] = [];

      // Act
      const result = TenantIdAdapter.toUuidArray(tenantIds);

      // Assert
      expect(result).toHaveLength(0);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('fromUuidSafe', () => {
    it('应该正确处理有效的Uuid', () => {
      // Arrange
      const uuid = new Uuid('66666666-6666-4666-8666-666666666666');

      // Act
      const result = TenantIdAdapter.fromUuidSafe(uuid);

      // Assert
      expect(result).toBeInstanceOf(TenantId);
      expect(result?.toString()).toBe('66666666-6666-4666-8666-666666666666');
    });

    it('应该正确处理undefined', () => {
      // Arrange
      const uuid = undefined;

      // Act
      const result = TenantIdAdapter.fromUuidSafe(uuid);

      // Assert
      expect(result).toBeUndefined();
    });

    it('应该正确处理null（转换为undefined）', () => {
      // Arrange
      const uuid = null as any;

      // Act
      const result = TenantIdAdapter.fromUuidSafe(uuid);

      // Assert
      expect(result).toBeUndefined();
    });
  });

  describe('toUuidSafe', () => {
    it('应该正确处理有效的TenantId', () => {
      // Arrange
      const tenantId = new TenantId('77777777-7777-4777-8777-777777777777');

      // Act
      const result = TenantIdAdapter.toUuidSafe(tenantId);

      // Assert
      expect(result).toBeInstanceOf(Uuid);
      expect(result?.toString()).toBe('77777777-7777-4777-8777-777777777777');
    });

    it('应该正确处理undefined', () => {
      // Arrange
      const tenantId = undefined;

      // Act
      const result = TenantIdAdapter.toUuidSafe(tenantId);

      // Assert
      expect(result).toBeUndefined();
    });
  });

  describe('转换一致性', () => {
    it('应该保持双向转换的一致性', () => {
      // Arrange
      const originalUuid = new Uuid('88888888-8888-4888-8888-888888888888');

      // Act
      const tenantId = TenantIdAdapter.fromUuid(originalUuid);
      const convertedUuid = TenantIdAdapter.toUuid(tenantId);

      // Assert
      expect(convertedUuid.toString()).toBe(originalUuid.toString());
      expect(convertedUuid.equals(originalUuid)).toBe(true);
    });

    it('应该保持数组转换的一致性', () => {
      // Arrange
      const originalUuids = [
        new Uuid('99999999-9999-4999-8999-999999999999'),
        new Uuid('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
      ];

      // Act
      const tenantIds = TenantIdAdapter.fromUuidArray(originalUuids);
      const convertedUuids = TenantIdAdapter.toUuidArray(tenantIds);

      // Assert
      expect(convertedUuids).toHaveLength(originalUuids.length);
      for (let i = 0; i < originalUuids.length; i++) {
        expect(convertedUuids[i].toString()).toBe(originalUuids[i].toString());
        expect(convertedUuids[i].equals(originalUuids[i])).toBe(true);
      }
    });
  });

  describe('边界情况', () => {
    it('应该处理最小UUID值', () => {
      // Arrange
      const minUuid = new Uuid('00000000-0000-4000-8000-000000000000');

      // Act
      const result = TenantIdAdapter.fromUuid(minUuid);

      // Assert
      expect(result.toString()).toBe('00000000-0000-4000-8000-000000000000');
    });

    it('应该处理最大UUID值', () => {
      // Arrange
      const maxUuid = new Uuid('ffffffff-ffff-4fff-8fff-ffffffffffff');

      // Act
      const result = TenantIdAdapter.fromUuid(maxUuid);

      // Assert
      expect(result.toString()).toBe('ffffffff-ffff-4fff-8fff-ffffffffffff');
    });
  });
});
