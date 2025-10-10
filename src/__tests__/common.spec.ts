import { describe, it, expect } from 'vitest';
import { isArray, equals } from '../viewport/common';

describe('common', () => {
  describe('isArray', () => {
    it('should return true for regular arrays', () => {
      expect(isArray([1, 2, 3])).toBe(true);
      expect(isArray([])).toBe(true);
      expect(isArray(['a', 'b', 'c'])).toBe(true);
    });

    it('should return true for typed arrays', () => {
      expect(isArray(new Float32Array([1, 2, 3]))).toBe(true);
      expect(isArray(new Float64Array([1, 2, 3]))).toBe(true);
      expect(isArray(new Int32Array([1, 2, 3]))).toBe(true);
      expect(isArray(new Uint8Array([1, 2, 3]))).toBe(true);
      expect(isArray(new Uint16Array([1, 2, 3]))).toBe(true);
      expect(isArray(new Uint32Array([1, 2, 3]))).toBe(true);
      expect(isArray(new Int8Array([1, 2, 3]))).toBe(true);
      expect(isArray(new Int16Array([1, 2, 3]))).toBe(true);
    });

    it('should return false for DataView', () => {
      const buffer = new ArrayBuffer(8);
      const dataView = new DataView(buffer);
      expect(isArray(dataView)).toBe(false);
    });

    it('should return false for non-array values', () => {
      expect(isArray(null)).toBe(false);
      expect(isArray(undefined)).toBe(false);
      expect(isArray(123)).toBe(false);
      expect(isArray('string')).toBe(false);
      expect(isArray({})).toBe(false);
      expect(isArray(true)).toBe(false);
      expect(isArray(false)).toBe(false);
      expect(isArray(() => {})).toBe(false);
    });
  });

  describe('equals', () => {
    describe('number comparison', () => {
      it('should return true for identical numbers', () => {
        expect(equals(1, 1)).toBe(true);
        expect(equals(0, 0)).toBe(true);
        expect(equals(-1, -1)).toBe(true);
        expect(equals(3.14, 3.14)).toBe(true);
      });

      it('should return true for numbers within epsilon', () => {
        expect(equals(1.0, 1.000000000000001)).toBe(true);
        expect(equals(0.1 + 0.2, 0.3)).toBe(true);
      });

      it('should return false for numbers outside epsilon', () => {
        expect(equals(1.0, 1.1)).toBe(false);
        expect(equals(0, 0.1)).toBe(false);
      });

      it('should handle infinity correctly', () => {
        expect(equals(Infinity, Infinity)).toBe(true);
        expect(equals(-Infinity, -Infinity)).toBe(true);
        expect(equals(Infinity, -Infinity)).toBe(false);
        expect(equals(Infinity, 1)).toBe(false);
      });

      it('should handle NaN correctly', () => {
        expect(equals(NaN, NaN)).toBe(false);
        expect(equals(NaN, 1)).toBe(false);
      });

      it('should use custom epsilon when provided', () => {
        expect(equals(1.0, 1.01, 0.1)).toBe(true);
        expect(equals(1.0, 1.01, 0.001)).toBe(false);
      });

      it('should handle zero values correctly', () => {
        expect(equals(0, 0)).toBe(true);
        expect(equals(0, -0)).toBe(true);
      });
    });

    describe('array comparison', () => {
      it('should return true for identical arrays', () => {
        expect(equals([1, 2, 3], [1, 2, 3])).toBe(true);
        expect(equals([], [])).toBe(true);
        expect(equals([1.1, 2.2], [1.1, 2.2])).toBe(true);
      });

      it('should return false for different length arrays', () => {
        expect(equals([1, 2], [1, 2, 3])).toBe(false);
        expect(equals([1, 2, 3], [1, 2])).toBe(false);
      });

      it('should return false for different values', () => {
        expect(equals([1, 2, 3], [1, 2, 4])).toBe(false);
        expect(equals([1, 2, 3], [2, 2, 3])).toBe(false);
      });

      it('should handle typed arrays', () => {
        const arr1 = new Float32Array([1, 2, 3]);
        const arr2 = new Float32Array([1, 2, 3]);
        const arr3 = new Float32Array([1, 2, 4]);

        expect(equals(arr1, arr2)).toBe(true);
        expect(equals(arr1, arr3)).toBe(false);
      });

      it('should handle mixed array types', () => {
        const regularArray = [1, 2, 3];
        const typedArray = new Float32Array([1, 2, 3]);

        expect(equals(regularArray, typedArray)).toBe(true);
      });

      it('should handle arrays with floating point precision', () => {
        expect(equals([1.1, 2.2], [1.11, 2.21])).toBe(false);
      });
    });

    describe('edge cases', () => {
      it('should handle empty arrays', () => {
        expect(equals([], [])).toBe(true);
        expect(equals([], [1])).toBe(false);
        expect(equals([1], [])).toBe(false);
      });

      it('should handle single element arrays', () => {
        expect(equals([1], [1])).toBe(true);
        expect(equals([1], [2])).toBe(false);
      });
    });

    describe('epsilon handling', () => {
      it('should restore original epsilon after test', () => {
        const originalEpsilon = 1e-12;

        // Test with custom epsilon
        equals(1.0, 1.01, 0.1);

        // Epsilon should be restored
        expect(equals(1.0, 1.0000001)).toBe(false);
      });

      it('should handle very small epsilon', () => {
        expect(equals(1.0, 1.0000001, 1e-15)).toBe(false);
      });

      it('should handle large epsilon', () => {
        expect(equals(1.0, 2.0, 2.0)).toBe(true);
        expect(equals(1.0, 2.0, 0.5)).toBe(true);
      });
    });
  });
});
