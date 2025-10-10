import { describe, it, expect, vi } from 'vitest';
import getBounds from '../viewport/get-bounds';

describe('getBounds', () => {
  const createMockViewport = (overrides = {}) => ({
    width: 800,
    height: 600,
    altitude: 1.5,
    pitch: 0,
    unproject: vi.fn(),
    pixelUnprojectionMatrix: [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ],
    distanceScales: {
      unitsPerMeter: [1, 1, 1]
    },
    ...overrides
  });

  describe('basic functionality', () => {
    it('should return bounds for default viewport', () => {
      const viewport = createMockViewport();
      viewport.unproject.mockReturnValue([0, 0, 0]);

      const bounds = getBounds(viewport);

      expect(bounds).toHaveLength(4);
      expect(bounds[0]).toEqual([0, 0, 0]); // bottomLeft
      expect(bounds[1]).toEqual([0, 0, 0]); // bottomRight
      expect(bounds[2]).toEqual([0, 0, 0]); // topRight
      expect(bounds[3]).toEqual([0, 0, 0]); // topLeft
    });

    it('should call unproject for all four corners', () => {
      const viewport = createMockViewport();
      viewport.unproject.mockReturnValue([0, 0, 0]);

      getBounds(viewport);

      expect(viewport.unproject).toHaveBeenCalledTimes(4);
      expect(viewport.unproject).toHaveBeenCalledWith([0, 600], { targetZ: 0 });
      expect(viewport.unproject).toHaveBeenCalledWith([800, 600], { targetZ: 0 });
      expect(viewport.unproject).toHaveBeenCalledWith([0, 0], { targetZ: 0 });
      expect(viewport.unproject).toHaveBeenCalledWith([800, 0], { targetZ: 0 });
    });

    it('should handle custom target Z', () => {
      const viewport = createMockViewport();
      viewport.unproject.mockReturnValue([0, 0, 100]);

      const bounds = getBounds(viewport, 100);

      expect(viewport.unproject).toHaveBeenCalledWith([0, 600], { targetZ: 100 });
      expect(viewport.unproject).toHaveBeenCalledWith([800, 600], { targetZ: 100 });
      expect(viewport.unproject).toHaveBeenCalledWith([0, 0], { targetZ: 100 });
      expect(viewport.unproject).toHaveBeenCalledWith([800, 0], { targetZ: 100 });
    });
  });

  describe('high pitch scenarios', () => {
    it('should use far plane intersection for high pitch', () => {
      const viewport = createMockViewport({
        pitch: 80, // High pitch
        altitude: 0.1 // Low altitude
      });
      viewport.unproject.mockReturnValue([0, 0, 0]);

      // Mock transformVector for far plane calculation
      const mockTransformVector = vi.fn()
        .mockReturnValueOnce([0, 0, 1, 1]) // coord0
        .mockReturnValueOnce([0, 0, 2, 1]); // coord1

      // Mock worldToLngLat
      const mockWorldToLngLat = vi.fn().mockReturnValue([0, 0, 0]);

      // We need to mock the internal functions
      vi.doMock('../viewport/math-utils', () => ({
        transformVector: mockTransformVector
      }));
      vi.doMock('../viewport/web-mercator-utils', () => ({
        worldToLngLat: mockWorldToLngLat
      }));

      const bounds = getBounds(viewport);

      expect(bounds).toHaveLength(4);
    });

    it('should use top plane intersection for normal pitch', () => {
      const viewport = createMockViewport({
        pitch: 30, // Normal pitch
        altitude: 1.5 // Normal altitude
      });
      viewport.unproject.mockReturnValue([0, 0, 0]);

      const bounds = getBounds(viewport);

      expect(bounds).toHaveLength(4);
      expect(viewport.unproject).toHaveBeenCalledWith([0, 0], { targetZ: 0 });
      expect(viewport.unproject).toHaveBeenCalledWith([800, 0], { targetZ: 0 });
    });
  });

  describe('different viewport configurations', () => {
    it('should handle different viewport sizes', () => {
      const viewport = createMockViewport({
        width: 1920,
        height: 1080
      });
      viewport.unproject.mockReturnValue([0, 0, 0]);

      const bounds = getBounds(viewport);

      expect(viewport.unproject).toHaveBeenCalledWith([0, 1080], { targetZ: 0 });
      expect(viewport.unproject).toHaveBeenCalledWith([1920, 1080], { targetZ: 0 });
      expect(viewport.unproject).toHaveBeenCalledWith([0, 0], { targetZ: 0 });
      expect(viewport.unproject).toHaveBeenCalledWith([1920, 0], { targetZ: 0 });
    });

    it('should handle different altitudes', () => {
      const viewport = createMockViewport({
        altitude: 0.5
      });
      viewport.unproject.mockReturnValue([0, 0, 0]);

      const bounds = getBounds(viewport);

      expect(bounds).toHaveLength(4);
    });

    it('should handle different pitches', () => {
      const viewport = createMockViewport({
        pitch: 45
      });
      viewport.unproject.mockReturnValue([0, 0, 0]);

      const bounds = getBounds(viewport);

      expect(bounds).toHaveLength(4);
    });
  });

  describe('edge cases', () => {
    it('should handle zero dimensions', () => {
      const viewport = createMockViewport({
        width: 0,
        height: 0
      });
      viewport.unproject.mockReturnValue([0, 0, 0]);

      const bounds = getBounds(viewport);

      expect(bounds).toHaveLength(4);
      expect(viewport.unproject).toHaveBeenCalledWith([0, 0], { targetZ: 0 });
      expect(viewport.unproject).toHaveBeenCalledWith([0, 0], { targetZ: 0 });
    });

    it('should handle very high pitch', () => {
      const viewport = createMockViewport({
        pitch: 89, // Very high pitch
        altitude: 0.01 // Very low altitude
      });
      viewport.unproject.mockReturnValue([0, 0, 0]);

      const bounds = getBounds(viewport);

      expect(bounds).toHaveLength(4);
    });

    it('should handle very low pitch', () => {
      const viewport = createMockViewport({
        pitch: 0, // Very low pitch
        altitude: 10 // High altitude
      });
      viewport.unproject.mockReturnValue([0, 0, 0]);

      const bounds = getBounds(viewport);

      expect(bounds).toHaveLength(4);
    });

    it('should handle negative target Z', () => {
      const viewport = createMockViewport();
      viewport.unproject.mockReturnValue([0, 0, -100]);

      const bounds = getBounds(viewport, -100);

      expect(viewport.unproject).toHaveBeenCalledWith([0, 600], { targetZ: -100 });
      expect(viewport.unproject).toHaveBeenCalledWith([800, 600], { targetZ: -100 });
      expect(viewport.unproject).toHaveBeenCalledWith([0, 0], { targetZ: -100 });
      expect(viewport.unproject).toHaveBeenCalledWith([800, 0], { targetZ: -100 });
    });
  });

  describe('return value structure', () => {
    it('should return bounds in correct order', () => {
      const viewport = createMockViewport();
      viewport.unproject
        .mockReturnValueOnce([-1, -1, 0]) // bottomLeft
        .mockReturnValueOnce([1, -1, 0])   // bottomRight
        .mockReturnValueOnce([1, 1, 0])    // topRight
        .mockReturnValueOnce([-1, 1, 0]);  // topLeft

      const bounds = getBounds(viewport);

      expect(bounds[0]).toEqual([-1, -1, 0]); // bottomLeft
      expect(bounds[1]).toEqual([1, -1, 0]);  // bottomRight
      expect(bounds[2]).toEqual([-1, 1, 0]);   // topRight
      expect(bounds[3]).toEqual([1, 1, 0]);  // topLeft
    });

    it('should return bounds with correct number of elements', () => {
      const viewport = createMockViewport();
      viewport.unproject.mockReturnValue([0, 0, 0]);

      const bounds = getBounds(viewport);

      expect(bounds).toHaveLength(4);
      bounds.forEach(bound => {
        expect(bound).toHaveLength(3); // [lng, lat, z]
      });
    });
  });

  describe('mathematical edge cases', () => {
    it('should handle very small altitude', () => {
      const viewport = createMockViewport({
        altitude: 0.001
      });
      viewport.unproject.mockReturnValue([0, 0, 0]);

      const bounds = getBounds(viewport);

      expect(bounds).toHaveLength(4);
    });

    it('should handle very large altitude', () => {
      const viewport = createMockViewport({
        altitude: 1000
      });
      viewport.unproject.mockReturnValue([0, 0, 0]);

      const bounds = getBounds(viewport);

      expect(bounds).toHaveLength(4);
    });

    it('should handle extreme pitch values', () => {
      const viewport = createMockViewport({
        pitch: 90 // Maximum pitch
      });
      viewport.unproject.mockReturnValue([0, 0, 0]);

      const bounds = getBounds(viewport);

      expect(bounds).toHaveLength(4);
    });
  });
});
