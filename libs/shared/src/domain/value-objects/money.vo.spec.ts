/**
 * @file money.vo.spec.ts
 * @description Money值对象单元测试
 */

import { Money, Currency, InvalidMoneyError } from './money.vo';

describe('Money', () => {
  describe('constructor', () => {
    it('should create valid money value object with default currency', () => {
      const money = new Money(100.5);
      expect(money.getValue()).toBe(100.5);
      expect(money.currency).toBe(Currency.CNY);
      expect(money.precision).toBe(2);
    });

    it('should create valid money value object with custom currency', () => {
      const money = new Money(100.5, Currency.USD);
      expect(money.getValue()).toBe(100.5);
      expect(money.currency).toBe(Currency.USD);
    });

    it('should create valid money value object with custom config', () => {
      const money = new Money(100.5, Currency.EUR, {
        precision: 3,
        roundingMode: 'floor',
      });
      expect(money.getValue()).toBe(100.5);
      expect(money.currency).toBe(Currency.EUR);
      expect(money.precision).toBe(3);
    });

    it('should throw error for negative amount', () => {
      expect(() => new Money(-100)).toThrow(InvalidMoneyError);
      expect(() => new Money(-100)).toThrow('Amount cannot be negative');
    });

    it('should throw error for non-number amount', () => {
      expect(() => new Money('100' as unknown)).toThrow(InvalidMoneyError);
      expect(() => new Money(null as unknown)).toThrow(InvalidMoneyError);
      expect(() => new Money(undefined as unknown)).toThrow(InvalidMoneyError);
    });

    it('should throw error for infinite amount', () => {
      expect(() => new Money(Infinity)).toThrow(InvalidMoneyError);
      expect(() => new Money(-Infinity)).toThrow(InvalidMoneyError);
    });

    it('should throw error for NaN amount', () => {
      expect(() => new Money(NaN)).toThrow(InvalidMoneyError);
    });
  });

  describe('equals', () => {
    it('should return true for same money values', () => {
      const money1 = new Money(100.5, Currency.CNY);
      const money2 = new Money(100.5, Currency.CNY);
      expect(money1.equals(money2)).toBe(true);
    });

    it('should return false for different amounts', () => {
      const money1 = new Money(100.5, Currency.CNY);
      const money2 = new Money(100.51, Currency.CNY);
      expect(money1.equals(money2)).toBe(false);
    });

    it('should return false for different currencies', () => {
      const money1 = new Money(100.5, Currency.CNY);
      const money2 = new Money(100.5, Currency.USD);
      expect(money1.equals(money2)).toBe(false);
    });

    it('should return false for different types', () => {
      const money = new Money(100.5);
      expect(money.equals(100.5)).toBe(false);
      expect(money.equals({ amount: 100.5 })).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return formatted string', () => {
      const money = new Money(100.5, Currency.CNY);
      expect(money.toString()).toBe('CNY 100.50');
    });

    it('should handle zero amount', () => {
      const money = new Money(0, Currency.USD);
      expect(money.toString()).toBe('USD 0.00');
    });

    it('should handle custom precision', () => {
      const money = new Money(100.567, Currency.EUR, { precision: 3 });
      expect(money.toString()).toBe('EUR 100.567');
    });
  });

  describe('toJSON', () => {
    it('should return valid JSON string', () => {
      const money = new Money(100.5, Currency.CNY);
      const json = money.toJSON();
      const parsed = JSON.parse(json);
      expect(parsed).toEqual({
        amount: 10050, // 以分为单位
        currency: Currency.CNY,
        precision: 2,
        roundingMode: 'round',
      });
    });
  });

  describe('toObject', () => {
    it('should return plain object', () => {
      const money = new Money(100.5, Currency.CNY);
      const obj = money.toObject();
      expect(obj).toEqual({
        amount: 10050,
        currency: Currency.CNY,
        precision: 2,
        roundingMode: 'round',
        value: 100.5,
      });
    });
  });

  describe('fromJSON', () => {
    it('should create money from valid JSON', () => {
      const json = JSON.stringify({
        amount: 10050,
        currency: Currency.CNY,
        precision: 2,
        roundingMode: 'round',
      });
      const money = new Money(0).fromJSON(json);
      expect(money.getValue()).toBe(100.5);
      expect(money.currency).toBe(Currency.CNY);
    });

    it('should throw error for invalid JSON', () => {
      const money = new Money(100.5);
      expect(() => money.fromJSON('invalid json')).toThrow(InvalidMoneyError);
    });
  });

  describe('clone', () => {
    it('should create identical copy', () => {
      const original = new Money(100.5, Currency.CNY);
      const cloned = original.clone();

      expect(cloned).not.toBe(original);
      expect(cloned.getValue()).toBe(original.getValue());
      expect(cloned.currency).toBe(original.currency);
      expect(cloned.equals(original)).toBe(true);
    });
  });

  describe('arithmetic operations', () => {
    describe('add', () => {
      it('should add same currency amounts', () => {
        const money1 = new Money(100.5, Currency.CNY);
        const money2 = new Money(50.25, Currency.CNY);
        const result = money1.add(money2);

        expect(result.getValue()).toBe(150.75);
        expect(result.currency).toBe(Currency.CNY);
      });

      it('should throw error for different currencies', () => {
        const money1 = new Money(100.5, Currency.CNY);
        const money2 = new Money(50.25, Currency.USD);

        expect(() => money1.add(money2)).toThrow(InvalidMoneyError);
        expect(() => money1.add(money2)).toThrow(
          'Cannot add different currencies',
        );
      });
    });

    describe('subtract', () => {
      it('should subtract same currency amounts', () => {
        const money1 = new Money(100.5, Currency.CNY);
        const money2 = new Money(50.25, Currency.CNY);
        const result = money1.subtract(money2);

        expect(result.getValue()).toBe(50.25);
        expect(result.currency).toBe(Currency.CNY);
      });

      it('should throw error for different currencies', () => {
        const money1 = new Money(100.5, Currency.CNY);
        const money2 = new Money(50.25, Currency.USD);

        expect(() => money1.subtract(money2)).toThrow(InvalidMoneyError);
        expect(() => money1.subtract(money2)).toThrow(
          'Cannot subtract different currencies',
        );
      });
    });

    describe('multiply', () => {
      it('should multiply by factor', () => {
        const money = new Money(100.5, Currency.CNY);
        const result = money.multiply(2);

        expect(result.getValue()).toBe(201.0);
        expect(result.currency).toBe(Currency.CNY);
      });

      it('should handle decimal factor', () => {
        const money = new Money(100.5, Currency.CNY);
        const result = money.multiply(0.5);

        expect(result.getValue()).toBe(50.25);
        expect(result.currency).toBe(Currency.CNY);
      });
    });

    describe('divide', () => {
      it('should divide by factor', () => {
        const money = new Money(100.5, Currency.CNY);
        const result = money.divide(2);

        expect(result.getValue()).toBe(50.25);
        expect(result.currency).toBe(Currency.CNY);
      });

      it('should throw error for division by zero', () => {
        const money = new Money(100.5, Currency.CNY);
        expect(() => money.divide(0)).toThrow(InvalidMoneyError);
        expect(() => money.divide(0)).toThrow('Cannot divide by zero');
      });
    });
  });

  describe('comparison methods', () => {
    describe('isZero', () => {
      it('should return true for zero amount', () => {
        const money = new Money(0, Currency.CNY);
        expect(money.isZero()).toBe(true);
      });

      it('should return false for non-zero amount', () => {
        const money = new Money(100.5, Currency.CNY);
        expect(money.isZero()).toBe(false);
      });
    });

    describe('isPositive', () => {
      it('should return true for positive amount', () => {
        const money = new Money(100.5, Currency.CNY);
        expect(money.isPositive()).toBe(true);
      });

      it('should return false for zero amount', () => {
        const money = new Money(0, Currency.CNY);
        expect(money.isPositive()).toBe(false);
      });
    });

    describe('isNegative', () => {
      it('should return false for positive amount', () => {
        const money = new Money(100.5, Currency.CNY);
        expect(money.isNegative()).toBe(false);
      });

      it('should return false for zero amount', () => {
        const money = new Money(0, Currency.CNY);
        expect(money.isNegative()).toBe(false);
      });
    });

    describe('compareTo', () => {
      it('should return 0 for equal amounts', () => {
        const money1 = new Money(100.5, Currency.CNY);
        const money2 = new Money(100.5, Currency.CNY);
        expect(money1.compareTo(money2)).toBe(0);
      });

      it('should return -1 for smaller amount', () => {
        const money1 = new Money(100.5, Currency.CNY);
        const money2 = new Money(200.0, Currency.CNY);
        expect(money1.compareTo(money2)).toBe(-1);
      });

      it('should return 1 for larger amount', () => {
        const money1 = new Money(200.0, Currency.CNY);
        const money2 = new Money(100.5, Currency.CNY);
        expect(money1.compareTo(money2)).toBe(1);
      });

      it('should throw error for different currencies', () => {
        const money1 = new Money(100.5, Currency.CNY);
        const money2 = new Money(100.5, Currency.USD);

        expect(() => money1.compareTo(money2)).toThrow(InvalidMoneyError);
        expect(() => money1.compareTo(money2)).toThrow(
          'Cannot compare different currencies',
        );
      });
    });

    describe('isGreaterThan', () => {
      it('should return true for greater amount', () => {
        const money1 = new Money(200.0, Currency.CNY);
        const money2 = new Money(100.5, Currency.CNY);
        expect(money1.isGreaterThan(money2)).toBe(true);
      });

      it('should return false for equal or smaller amount', () => {
        const money1 = new Money(100.5, Currency.CNY);
        const money2 = new Money(100.5, Currency.CNY);
        const money3 = new Money(200.0, Currency.CNY);

        expect(money1.isGreaterThan(money2)).toBe(false);
        expect(money1.isGreaterThan(money3)).toBe(false);
      });
    });

    describe('isLessThan', () => {
      it('should return true for smaller amount', () => {
        const money1 = new Money(100.5, Currency.CNY);
        const money2 = new Money(200.0, Currency.CNY);
        expect(money1.isLessThan(money2)).toBe(true);
      });

      it('should return false for equal or larger amount', () => {
        const money1 = new Money(100.5, Currency.CNY);
        const money2 = new Money(100.5, Currency.CNY);
        const money3 = new Money(50.0, Currency.CNY);

        expect(money1.isLessThan(money2)).toBe(false);
        expect(money1.isLessThan(money3)).toBe(false);
      });
    });
  });

  describe('static methods', () => {
    describe('zero', () => {
      it('should create zero amount with default currency', () => {
        const money = Money.zero();
        expect(money.getValue()).toBe(0);
        expect(money.currency).toBe(Currency.CNY);
      });

      it('should create zero amount with custom currency', () => {
        const money = Money.zero(Currency.USD);
        expect(money.getValue()).toBe(0);
        expect(money.currency).toBe(Currency.USD);
      });
    });

    describe('fromString', () => {
      it('should create money from valid string', () => {
        const money = Money.fromString('CNY 100.50');
        expect(money.getValue()).toBe(100.5);
        expect(money.currency).toBe(Currency.CNY);
      });

      it('should throw error for invalid format', () => {
        expect(() => Money.fromString('invalid')).toThrow(InvalidMoneyError);
        expect(() => Money.fromString('100.50')).toThrow(InvalidMoneyError);
        expect(() => Money.fromString('CNY')).toThrow(InvalidMoneyError);
      });

      it('should throw error for unsupported currency', () => {
        expect(() => Money.fromString('XXX 100.50')).toThrow(InvalidMoneyError);
        expect(() => Money.fromString('XXX 100.50')).toThrow(
          'Unsupported currency',
        );
      });
    });

    describe('isValid', () => {
      it('should return true for valid amounts', () => {
        expect(Money.isValid(100.5)).toBe(true);
        expect(Money.isValid(0)).toBe(true);
        expect(Money.isValid(100.5, Currency.USD)).toBe(true);
      });

      it('should return false for invalid amounts', () => {
        expect(Money.isValid(-100.5)).toBe(false);
        expect(Money.isValid(NaN)).toBe(false);
        expect(Money.isValid(Infinity)).toBe(false);
      });
    });

    describe('fromJSON', () => {
      it('should create money from JSON string', () => {
        const json = JSON.stringify({
          amount: 10050,
          currency: Currency.CNY,
          precision: 2,
          roundingMode: 'round',
        });
        const money = Money.fromJSON(json);
        expect(money.getValue()).toBe(100.5);
        expect(money.currency).toBe(Currency.CNY);
      });

      it('should throw error for invalid JSON', () => {
        expect(() => Money.fromJSON('invalid json')).toThrow(InvalidMoneyError);
      });
    });
  });

  describe('rounding modes', () => {
    it('should round correctly with round mode', () => {
      const money = new Money(100.567, Currency.CNY, {
        precision: 2,
        roundingMode: 'round',
      });
      expect(money.getValue()).toBe(100.57);
    });

    it('should floor correctly with floor mode', () => {
      const money = new Money(100.567, Currency.CNY, {
        precision: 2,
        roundingMode: 'floor',
      });
      expect(money.getValue()).toBe(100.56);
    });

    it('should ceil correctly with ceil mode', () => {
      const money = new Money(100.561, Currency.CNY, {
        precision: 2,
        roundingMode: 'ceil',
      });
      expect(money.getValue()).toBe(100.57);
    });
  });

  describe('validateInvariants', () => {
    it('should not throw for valid money', () => {
      const money = new Money(100.5, Currency.CNY);
      expect(() => {
        (money as unknown).validateInvariants();
      }).not.toThrow();
    });
  });
});
