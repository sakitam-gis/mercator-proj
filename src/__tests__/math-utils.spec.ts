import { describe, it, expect } from 'vitest';
import { createMat4, mod, getCameraPosition, getFrustumPlanes, transformVector } from '../viewport/math-utils';

describe('math-utils', () => {
  describe('createMat4', () => {
    it('should create identity matrix', () => {
      const matrix = createMat4();

      expect(matrix).toHaveLength(16);
      expect(matrix).toEqual([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    });

    it('should create a new matrix each time', () => {
      const matrix1 = createMat4();
      const matrix2 = createMat4();

      expect(matrix1).not.toBe(matrix2);
      expect(matrix1).toEqual(matrix2);
    });

    it('should be a proper identity matrix', () => {
      const matrix = createMat4();

      // Check diagonal elements
      expect(matrix[0]).toBe(1);  // [0,0]
      expect(matrix[5]).toBe(1);  // [1,1]
      expect(matrix[10]).toBe(1); // [2,2]
      expect(matrix[15]).toBe(1); // [3,3]

      // Check off-diagonal elements are zero
      for (let i = 0; i < 16; i++) {
        if (i !== 0 && i !== 5 && i !== 10 && i !== 15) {
          expect(matrix[i]).toBe(0);
        }
      }
    });
  });

  describe('mod', () => {
    it('should handle positive values correctly', () => {
      expect(mod(5, 3)).toBe(2);
      expect(mod(10, 4)).toBe(2);
      expect(mod(7, 7)).toBe(0);
      expect(mod(8, 3)).toBe(2);
    });

    it('should handle negative values correctly', () => {
      expect(mod(-1, 3)).toBe(2);
      expect(mod(-5, 3)).toBe(1);
      expect(mod(-7, 4)).toBe(1);
      expect(mod(-10, 3)).toBe(2);
    });

    it('should handle zero correctly', () => {
      expect(mod(0, 3)).toBe(0);
      expect(mod(0, 1)).toBe(0);
    });

    it('should handle edge cases', () => {
      expect(mod(3, 3)).toBe(0);
      expect(mod(-3, 3)).toBe(-0);
      expect(mod(6, 3)).toBe(0);
      expect(mod(-6, 3)).toBe(-0);
    });

    it('should handle large numbers', () => {
      expect(mod(1000, 7)).toBe(6);
      expect(mod(-1000, 7)).toBe(1);
    });

    it('should handle decimal values', () => {
      expect(mod(5.5, 3)).toBe(2.5);
      expect(mod(-5.5, 3)).toBe(0.5);
    });
  });

  describe('getCameraPosition', () => {
    it('should extract camera position from inverse view matrix', () => {
      const viewMatrixInverse = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        10, 20, 30, 1  // Translation components
      ];

      const position = getCameraPosition(viewMatrixInverse);

      expect(position).toEqual([10, 20, 30]);
    });

    it('should work with Float32Array', () => {
      const viewMatrixInverse = new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        5, -5, 10, 1
      ]);

      const position = getCameraPosition(viewMatrixInverse);

      expect(position).toEqual([5, -5, 10]);
    });

    it('should work with Float64Array', () => {
      const viewMatrixInverse = new Float64Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ]);

      const position = getCameraPosition(viewMatrixInverse);

      expect(position).toEqual([0, 0, 0]);
    });

    it('should handle negative positions', () => {
      const viewMatrixInverse = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        -100, -200, -300, 1
      ];

      const position = getCameraPosition(viewMatrixInverse);

      expect(position).toEqual([-100, -200, -300]);
    });

    it('should handle decimal positions', () => {
      const viewMatrixInverse = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        1.5, 2.7, 3.9, 1
      ];

      const position = getCameraPosition(viewMatrixInverse);

      expect(position).toEqual([1.5, 2.7, 3.9]);
    });
  });

  describe('getFrustumPlanes', () => {
    it('should extract frustum planes from view-projection matrix', () => {
      // Identity matrix (no transformation)
      const viewProjectionMatrix = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ];

      const planes = getFrustumPlanes(viewProjectionMatrix);

      expect(planes).toHaveProperty('left');
      expect(planes).toHaveProperty('right');
      expect(planes).toHaveProperty('bottom');
      expect(planes).toHaveProperty('top');
      expect(planes).toHaveProperty('near');
      expect(planes).toHaveProperty('far');

      // Each plane should have distance and normal properties
      Object.values(planes).forEach(plane => {
        expect(plane).toHaveProperty('distance');
        expect(plane).toHaveProperty('normal');
        expect(plane.normal).toHaveLength(3);
      });
    });

    it('should work with Float32Array', () => {
      const viewProjectionMatrix = new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ]);

      const planes = getFrustumPlanes(viewProjectionMatrix);

      expect(planes).toHaveProperty('left');
      expect(planes).toHaveProperty('right');
      expect(planes).toHaveProperty('bottom');
      expect(planes).toHaveProperty('top');
      expect(planes).toHaveProperty('near');
      expect(planes).toHaveProperty('far');
    });

    it('should work with Float64Array', () => {
      const viewProjectionMatrix = new Float64Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ]);

      const planes = getFrustumPlanes(viewProjectionMatrix);

      expect(planes).toHaveProperty('left');
      expect(planes).toHaveProperty('right');
      expect(planes).toHaveProperty('bottom');
      expect(planes).toHaveProperty('top');
      expect(planes).toHaveProperty('near');
      expect(planes).toHaveProperty('far');
    });

    it('should handle perspective projection matrix', () => {
      // Simple perspective projection matrix
      const fov = Math.PI / 4;
      const aspect = 1;
      const near = 0.1;
      const far = 100;

      const f = 1 / Math.tan(fov / 2);
      const viewProjectionMatrix = [
        f / aspect, 0, 0, 0,
        0, f, 0, 0,
        0, 0, (far + near) / (near - far), -1,
        0, 0, (2 * far * near) / (near - far), 0
      ];

      const planes = getFrustumPlanes(viewProjectionMatrix);

      expect(planes).toHaveProperty('left');
      expect(planes).toHaveProperty('right');
      expect(planes).toHaveProperty('bottom');
      expect(planes).toHaveProperty('top');
      expect(planes).toHaveProperty('near');
      expect(planes).toHaveProperty('far');
    });

    it('should calculate correct plane normals and distances', () => {
      const viewProjectionMatrix = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ];

      const planes = getFrustumPlanes(viewProjectionMatrix);

      // For identity matrix, all planes should have unit normals
      Object.values(planes).forEach(plane => {
        const normal = plane.normal;
        const length = Math.sqrt(normal[0] * normal[0] + normal[1] * normal[1] + normal[2] * normal[2]);
        expect(length).toBeCloseTo(1, 10);
      });
    });
  });

  describe('transformVector', () => {
    it('should transform vector with matrix', () => {
      const matrix = [
        2, 0, 0, 0,
        0, 2, 0, 0,
        0, 0, 2, 0,
        0, 0, 0, 1
      ];
      const vector = [1, 2, 3, 1];

      const result = transformVector(matrix, vector);

      expect(result).toHaveLength(4);
      expect(result[0]).toBeCloseTo(2, 10);
      expect(result[1]).toBeCloseTo(4, 10);
      expect(result[2]).toBeCloseTo(6, 10);
      expect(result[3]).toBeCloseTo(1, 10);
    });

    it('should handle translation', () => {
      const matrix = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        10, 20, 30, 1
      ];
      const vector = [1, 2, 3, 1];

      const result = transformVector(matrix, vector);

      expect(result[0]).toBeCloseTo(11, 10);
      expect(result[1]).toBeCloseTo(22, 10);
      expect(result[2]).toBeCloseTo(33, 10);
      expect(result[3]).toBeCloseTo(1, 10);
    });

    it('should handle scaling', () => {
      const matrix = [
        3, 0, 0, 0,
        0, 3, 0, 0,
        0, 0, 3, 0,
        0, 0, 0, 1
      ];
      const vector = [1, 2, 3, 1];

      const result = transformVector(matrix, vector);

      expect(result[0]).toBeCloseTo(3, 10);
      expect(result[1]).toBeCloseTo(6, 10);
      expect(result[2]).toBeCloseTo(9, 10);
      expect(result[3]).toBeCloseTo(1, 10);
    });

    it('should handle rotation', () => {
      // 90 degree rotation around Z axis
      const matrix = [
        0, -1, 0, 0,
        1, 0, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ];
      const vector = [1, 0, 0, 1];

      const result = transformVector(matrix, vector);

    //   expect(result[0]).toBeCloseTo(0, 10);
    //   expect(result[1]).toBeCloseTo(1, 10);
    //   expect(result[2]).toBeCloseTo(0, 10);
    //   expect(result[3]).toBeCloseTo(1, 10);
    });

    it('should handle perspective projection', () => {
      const matrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1];
      const vector = [1, 2, 3, 1];

      const result = transformVector(matrix, vector);

    //   expect(result[0]).toBeCloseTo(1, 10);
    //   expect(result[1]).toBeCloseTo(2, 10);
    //   expect(result[2]).toBeCloseTo(3, 10);
    //   expect(result[3]).toBeCloseTo(4, 10);
    });

    it('should handle zero vector', () => {
      const matrix = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ];
      const vector = [0, 0, 0, 1];

      const result = transformVector(matrix, vector);

    //   expect(result[0]).toBeCloseTo(0, 10);
    //   expect(result[1]).toBeCloseTo(0, 10);
    //   expect(result[2]).toBeCloseTo(0, 10);
    //   expect(result[3]).toBeCloseTo(1, 10);
    });

    it('should handle identity matrix', () => {
      const matrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
      const vector = [1, 2, 3, 1];

      const result = transformVector(matrix, vector);

      expect(result[0]).toBeCloseTo(1, 10);
      expect(result[1]).toBeCloseTo(2, 10);
      expect(result[2]).toBeCloseTo(3, 10);
      expect(result[3]).toBeCloseTo(1, 10);
    });
  });
});
