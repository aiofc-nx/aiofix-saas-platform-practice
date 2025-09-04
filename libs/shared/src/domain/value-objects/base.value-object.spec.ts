/**
 * @file base.value-object.spec.ts
 * @description 基础值对象单元测试
 */

import { BaseValueObject, InvalidValueObjectError } from './base.value-object';

/**
 * @class TestValueObject
 * @description 用于测试的具体值对象实现
 */
class TestValueObject extends BaseValueObject {
  constructor(public readonly value: string) {
    super();
    this.validateValue(value);
  }

  private validateValue(value: string): void {
    if (!value || value.length === 0) {
      throw new InvalidValueObjectError(
        'Value cannot be empty',
        'TestValueObject',
        value,
      );
    }
  }

  equals(other: unknown): boolean {
    return other instanceof TestValueObject && this.value === other.value;
  }

  toJSON(): string {
    return JSON.stringify({ value: this.value });
  }

  toObject(): Record<string, unknown> {
    return { value: this.value };
  }

  fromJSON(json: string): this {
    try {
      const data = JSON.parse(json);
      return new TestValueObject(data.value) as this;
    } catch {
      throw new InvalidValueObjectError(
        'Invalid JSON format',
        'TestValueObject',
        json,
      );
    }
  }

  toString(): string {
    return this.value;
  }

  clone(): this {
    return new TestValueObject(this.value) as this;
  }
}

describe('BaseValueObject', () => {
  describe('InvalidValueObjectError', () => {
    it('should create error with correct properties', () => {
      const error = new InvalidValueObjectError(
        'Test error',
        'TestType',
        'test-value',
      );

      expect(error.message).toBe('Test error');
      expect(error.valueObjectType).toBe('TestType');
      expect(error.value).toBe('test-value');
      expect(error.name).toBe('InvalidValueObjectError');
    });

    it('should create error without value', () => {
      const error = new InvalidValueObjectError('Test error', 'TestType');

      expect(error.message).toBe('Test error');
      expect(error.valueObjectType).toBe('TestType');
      expect(error.value).toBeUndefined();
    });
  });

  describe('TestValueObject', () => {
    describe('constructor', () => {
      it('should create valid value object', () => {
        const vo = new TestValueObject('test');
        expect(vo.value).toBe('test');
      });

      it('should throw error for empty value', () => {
        expect(() => new TestValueObject('')).toThrow(InvalidValueObjectError);
        expect(() => new TestValueObject('')).toThrow('Value cannot be empty');
      });

      it('should throw error for null value', () => {
        expect(() => new TestValueObject(null as unknown)).toThrow(
          InvalidValueObjectError,
        );
      });
    });

    describe('equals', () => {
      it('should return true for same value objects', () => {
        const vo1 = new TestValueObject('test');
        const vo2 = new TestValueObject('test');
        expect(vo1.equals(vo2)).toBe(true);
      });

      it('should return false for different value objects', () => {
        const vo1 = new TestValueObject('test1');
        const vo2 = new TestValueObject('test2');
        expect(vo1.equals(vo2)).toBe(false);
      });

      it('should return false for different types', () => {
        const vo = new TestValueObject('test');
        expect(vo.equals('test')).toBe(false);
        expect(vo.equals({ value: 'test' })).toBe(false);
      });

      it('should return false for null or undefined', () => {
        const vo = new TestValueObject('test');
        expect(vo.equals(null)).toBe(false);
        expect(vo.equals(undefined)).toBe(false);
      });
    });

    describe('toJSON', () => {
      it('should return valid JSON string', () => {
        const vo = new TestValueObject('test');
        const json = vo.toJSON();
        const parsed = JSON.parse(json);
        expect(parsed).toEqual({ value: 'test' });
      });
    });

    describe('toObject', () => {
      it('should return plain object', () => {
        const vo = new TestValueObject('test');
        const obj = vo.toObject();
        expect(obj).toEqual({ value: 'test' });
      });
    });

    describe('fromJSON', () => {
      it('should create value object from valid JSON', () => {
        const json = JSON.stringify({ value: 'test' });
        const vo = new TestValueObject('test').fromJSON(json);
        expect(vo.value).toBe('test');
      });

      it('should throw error for invalid JSON', () => {
        const vo = new TestValueObject('test');
        expect(() => vo.fromJSON('invalid json')).toThrow(
          InvalidValueObjectError,
        );
      });
    });

    describe('toString', () => {
      it('should return string representation', () => {
        const vo = new TestValueObject('test');
        expect(vo.toString()).toBe('test');
      });
    });

    describe('clone', () => {
      it('should create identical copy', () => {
        const original = new TestValueObject('test');
        const cloned = original.clone();

        expect(cloned).not.toBe(original); // Different instances
        expect(cloned.value).toBe(original.value); // Same values
        expect(cloned.equals(original)).toBe(true);
      });
    });
  });
});
