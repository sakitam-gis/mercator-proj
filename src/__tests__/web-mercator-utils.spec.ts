import { describe, it, expect } from 'vitest';
import {
  zoomToScale,
  scaleToZoom,
  lngLatToWorld,
  worldToLngLat,
  getMeterZoom,
  getDistanceScales,
  getProjectionParameters,
  getViewMatrix,
  pixelsToWorld,
  worldToPixels,
  addMetersToLngLat
} from '../viewport/web-mercator-utils';

describe('web-mercator-utils', () => {
  describe('zoomToScale', () => {
    it('should convert zoom levels to scales correctly', () => {
      expect(zoomToScale(0)).toBe(1);
      expect(zoomToScale(1)).toBe(2);
      expect(zoomToScale(2)).toBe(4);
      expect(zoomToScale(3)).toBe(8);
      expect(zoomToScale(10)).toBe(1024);
    });

    it('should handle negative zoom levels', () => {
      expect(zoomToScale(-1)).toBe(0.5);
      expect(zoomToScale(-2)).toBe(0.25);
      expect(zoomToScale(-10)).toBeCloseTo(0.0009765625, 10);
    });

    it('should handle decimal zoom levels', () => {
      expect(zoomToScale(0.5)).toBeCloseTo(1.4142135623730951, 10);
      expect(zoomToScale(1.5)).toBeCloseTo(2.8284271247461903, 10);
    });
  });

  describe('scaleToZoom', () => {
    it('should convert scales to zoom levels correctly', () => {
      expect(scaleToZoom(1)).toBe(0);
      expect(scaleToZoom(2)).toBe(1);
      expect(scaleToZoom(4)).toBe(2);
      expect(scaleToZoom(8)).toBe(3);
      expect(scaleToZoom(1024)).toBe(10);
    });

    it('should handle fractional scales', () => {
      expect(scaleToZoom(0.5)).toBe(-1);
      expect(scaleToZoom(0.25)).toBe(-2);
      expect(scaleToZoom(0.0009765625)).toBeCloseTo(-10, 10);
    });

    it('should handle decimal scales', () => {
      expect(scaleToZoom(1.4142135623730951)).toBeCloseTo(0.5, 10);
      expect(scaleToZoom(2.8284271247461903)).toBeCloseTo(1.5, 10);
    });

    it('should be inverse of zoomToScale', () => {
      const zoom = 5.5;
      const scale = zoomToScale(zoom);
      const backToZoom = scaleToZoom(scale);
      expect(backToZoom).toBeCloseTo(zoom, 10);
    });
  });

  describe('lngLatToWorld', () => {
    it('should project coordinates to world space correctly', () => {
      // Test known coordinates
      const result = lngLatToWorld([0, 0]); // Equator, Prime Meridian
      expect(result[0]).toBeCloseTo(256, 10); // Center of tile
      expect(result[1]).toBeCloseTo(256, 10); // Center of tile
    });

    it('should handle longitude wrapping', () => {
      const result1 = lngLatToWorld([180, 0]);
      const result2 = lngLatToWorld([-180, 0]);
      expect(result1[0]).toBeCloseTo(result2[0], 10);
      expect(result1[1]).toBeCloseTo(result2[1], 10);
    });

    it('should handle extreme latitudes', () => {
      const result = lngLatToWorld([0, 85]); // High latitude
      expect(result[0]).toBeCloseTo(256, 10);
      expect(result[1]).toBeGreaterThan(0);
      expect(result[1]).toBeLessThan(512);
    });

    it('should handle negative coordinates', () => {
      const result = lngLatToWorld([-90, -45]);
      expect(result[0]).toBeGreaterThan(0);
      expect(result[0]).toBeLessThan(512);
      expect(result[1]).toBeGreaterThan(0);
      expect(result[1]).toBeLessThan(512);
    });

    it('should be symmetric with worldToLngLat', () => {
      const original = [45, 30];
      const world = lngLatToWorld(original);
      const back = worldToLngLat(world);
      expect(back[0]).toBeCloseTo(original[0], 10);
      expect(back[1]).toBeCloseTo(original[1], 10);
    });

    it('should handle edge cases', () => {
      // North pole
      const northPole = lngLatToWorld([0, 90]);
      expect(northPole[0]).toBeCloseTo(256, 10);
      expect(northPole[1]).toBeCloseTo(0, 10);

      // South pole
      const southPole = lngLatToWorld([0, -90]);
      expect(southPole[0]).toBeCloseTo(256, 10);
      expect(southPole[1]).toBeCloseTo(512, 10);
    });
  });

  describe('worldToLngLat', () => {
    it('should unproject world coordinates correctly', () => {
      const result = worldToLngLat([256, 256]); // Center of tile
      expect(result[0]).toBeCloseTo(0, 10);
      expect(result[1]).toBeCloseTo(0, 10);
    });

    it('should handle edge coordinates', () => {
      const result = worldToLngLat([0, 0]);
      expect(result[0]).toBeCloseTo(-180, 10);
      expect(result[1]).toBeCloseTo(85.0511287798, 10);
    });

    it('should be symmetric with lngLatToWorld', () => {
      const original = [100, 200];
      const world = lngLatToWorld(original);
      const back = worldToLngLat(world);
      expect(back[0]).toBeCloseTo(original[0], 10);
      expect(back[1]).toBeCloseTo(original[1], 10);
    });

    it('should handle coordinates at tile boundaries', () => {
      const result = worldToLngLat([512, 256]);
      expect(result[0]).toBeCloseTo(180, 10);
      expect(result[1]).toBeCloseTo(0, 10);
    });
  });

  describe('getMeterZoom', () => {
    it('should calculate correct zoom for equator', () => {
      const zoom = getMeterZoom({ latitude: 0 });
      expect(zoom).toBeCloseTo(9, 1);
    });

    it('should calculate correct zoom for different latitudes', () => {
      const zoom45 = getMeterZoom({ latitude: 45 });
      const zoom60 = getMeterZoom({ latitude: 60 });
      const zoom80 = getMeterZoom({ latitude: 80 });

      expect(zoom45).toBeLessThan(9);
      expect(zoom60).toBeLessThan(zoom45);
      expect(zoom80).toBeLessThan(zoom60);
    });

    it('should handle extreme latitudes', () => {
      const zoom90 = getMeterZoom({ latitude: 90 });
      const zoomNeg90 = getMeterZoom({ latitude: -90 });

      expect(zoom90).toBeLessThan(0);
      expect(zoomNeg90).toBeLessThan(0);
    });

    it('should be symmetric for positive and negative latitudes', () => {
      const zoom45 = getMeterZoom({ latitude: 45 });
      const zoomNeg45 = getMeterZoom({ latitude: -45 });

      expect(zoom45).toBeCloseTo(zoomNeg45, 10);
    });
  });

  describe('getDistanceScales', () => {
    it('should calculate distance scales for equator', () => {
      const scales = getDistanceScales({ latitude: 0, longitude: 0 });

      expect(scales).toHaveProperty('degreesPerUnit');
      expect(scales).toHaveProperty('metersPerUnit');
      expect(scales).toHaveProperty('unitsPerDegree');
      expect(scales).toHaveProperty('unitsPerMeter');

      expect(scales.degreesPerUnit).toHaveLength(2);
      expect(scales.metersPerUnit).toHaveLength(2);
      expect(scales.unitsPerDegree).toHaveLength(2);
      expect(scales.unitsPerMeter).toHaveLength(2);
    });

    it('should calculate distance scales for different latitudes', () => {
      const scales0 = getDistanceScales({ latitude: 0, longitude: 0 });
      const scales45 = getDistanceScales({ latitude: 45, longitude: 0 });
      const scales80 = getDistanceScales({ latitude: 80, longitude: 0 });

      // Y scales should be different due to latitude
      expect(scales0.unitsPerDegree[1]).toBeCloseTo(scales0.unitsPerDegree[0], 10);
      expect(scales45.unitsPerDegree[1]).toBeGreaterThan(scales45.unitsPerDegree[0]);
      expect(scales80.unitsPerDegree[1]).toBeGreaterThan(scales80.unitsPerDegree[0]);
    });

    it('should handle high precision mode', () => {
      const scales = getDistanceScales({ latitude: 0, longitude: 0, highPrecision: true });

      expect(scales).toHaveProperty('degreesPerUnit');
      expect(scales).toHaveProperty('metersPerUnit');
      expect(scales).toHaveProperty('unitsPerDegree');
      expect(scales).toHaveProperty('unitsPerMeter');
    });

    it('should be consistent for same latitude', () => {
      const scales1 = getDistanceScales({ latitude: 45, longitude: 0 });
      const scales2 = getDistanceScales({ latitude: 45, longitude: 180 });

      expect(scales1.unitsPerDegree[0]).toBeCloseTo(scales2.unitsPerDegree[0], 10);
      expect(scales1.unitsPerDegree[1]).toBeCloseTo(scales2.unitsPerDegree[1], 10);
    });
  });

  describe('getProjectionParameters', () => {
    it('should calculate projection parameters correctly', () => {
      const params = getProjectionParameters({
        latitude: 0,
        longitude: 0,
        zoom: 0,
        pitch: 0,
        bearing: 0
      });

      expect(params).toHaveProperty('fov');
      expect(params).toHaveProperty('aspect');
      expect(params).toHaveProperty('near');
      expect(params).toHaveProperty('far');
      expect(params).toHaveProperty('focalDistance');

      expect(params.fov).toBeGreaterThan(0);
      expect(params.aspect).toBeGreaterThan(0);
      expect(params.near).toBeGreaterThan(0);
      expect(params.far).toBeGreaterThan(params.near);
    });

    it('should handle different zoom levels', () => {
      const params0 = getProjectionParameters({
        latitude: 0,
        longitude: 0,
        zoom: 0,
        pitch: 0,
        bearing: 0
      });

      const params10 = getProjectionParameters({
        latitude: 0,
        longitude: 0,
        zoom: 10,
        pitch: 0,
        bearing: 0
      });

      expect(params10.focalDistance).toBeGreaterThan(params0.focalDistance);
    });

    it('should handle different pitches', () => {
      const params0 = getProjectionParameters({
        latitude: 0,
        longitude: 0,
        zoom: 0,
        pitch: 0,
        bearing: 0
      });

      const params45 = getProjectionParameters({
        latitude: 0,
        longitude: 0,
        zoom: 0,
        pitch: 45,
        bearing: 0
      });

      expect(params45.focalDistance).toBeGreaterThan(params0.focalDistance);
    });
  });

  describe('getViewMatrix', () => {
    it('should create view matrix for basic parameters', () => {
      const matrix = getViewMatrix({
        latitude: 0,
        longitude: 0,
        zoom: 0,
        pitch: 0,
        bearing: 0
      });

      expect(matrix).toHaveLength(16);
      expect(matrix[0]).toBeCloseTo(1, 10);
      expect(matrix[5]).toBeCloseTo(1, 10);
      expect(matrix[10]).toBeCloseTo(1, 10);
      expect(matrix[15]).toBeCloseTo(1, 10);
    });

    it('should handle different zoom levels', () => {
      const matrix0 = getViewMatrix({
        latitude: 0,
        longitude: 0,
        zoom: 0,
        pitch: 0,
        bearing: 0
      });

      const matrix10 = getViewMatrix({
        latitude: 0,
        longitude: 0,
        zoom: 10,
        pitch: 0,
        bearing: 0
      });

      // Higher zoom should have different translation
      expect(matrix0[12]).not.toBeCloseTo(matrix10[12], 10);
      expect(matrix0[13]).not.toBeCloseTo(matrix10[13], 10);
    });

    it('should handle different pitches', () => {
      const matrix0 = getViewMatrix({
        latitude: 0,
        longitude: 0,
        zoom: 0,
        pitch: 0,
        bearing: 0
      });

      const matrix45 = getViewMatrix({
        latitude: 0,
        longitude: 0,
        zoom: 0,
        pitch: 45,
        bearing: 0
      });

      // Different pitch should result in different matrix
      expect(matrix0).not.toEqual(matrix45);
    });

    it('should handle different bearings', () => {
      const matrix0 = getViewMatrix({
        latitude: 0,
        longitude: 0,
        zoom: 0,
        pitch: 0,
        bearing: 0
      });

      const matrix90 = getViewMatrix({
        latitude: 0,
        longitude: 0,
        zoom: 0,
        pitch: 0,
        bearing: 90
      });

      // Different bearing should result in different matrix
      expect(matrix0).not.toEqual(matrix90);
    });
  });

  describe('pixelsToWorld', () => {
    it('should convert pixels to world coordinates', () => {
      const viewport = {
        width: 800,
        height: 600,
        latitude: 0,
        longitude: 0,
        zoom: 0,
        pitch: 0,
        bearing: 0
      };

      const world = pixelsToWorld([400, 300], viewport);

      expect(world).toHaveLength(2);
      expect(world[0]).toBeCloseTo(256, 10); // Center of world
      expect(world[1]).toBeCloseTo(256, 10); // Center of world
    });

    it('should handle corner pixels', () => {
      const viewport = {
        width: 800,
        height: 600,
        latitude: 0,
        longitude: 0,
        zoom: 0,
        pitch: 0,
        bearing: 0
      };

      const topLeft = pixelsToWorld([0, 0], viewport);
      const bottomRight = pixelsToWorld([800, 600], viewport);

      expect(topLeft[0]).toBeLessThan(bottomRight[0]);
      expect(topLeft[1]).toBeLessThan(bottomRight[1]);
    });

    it('should handle different zoom levels', () => {
      const viewport0 = {
        width: 800,
        height: 600,
        latitude: 0,
        longitude: 0,
        zoom: 0,
        pitch: 0,
        bearing: 0
      };

      const viewport10 = {
        width: 800,
        height: 600,
        latitude: 0,
        longitude: 0,
        zoom: 10,
        pitch: 0,
        bearing: 0
      };

      const world0 = pixelsToWorld([400, 300], viewport0);
      const world10 = pixelsToWorld([400, 300], viewport10);

      expect(world0).not.toEqual(world10);
    });
  });

  describe('worldToPixels', () => {
    it('should convert world coordinates to pixels', () => {
      const viewport = {
        width: 800,
        height: 600,
        latitude: 0,
        longitude: 0,
        zoom: 0,
        pitch: 0,
        bearing: 0
      };

      const pixels = worldToPixels([256, 256], viewport);

      expect(pixels).toHaveLength(2);
      expect(pixels[0]).toBeCloseTo(400, 10); // Center of screen
      expect(pixels[1]).toBeCloseTo(300, 10); // Center of screen
    });

    it('should be symmetric with pixelsToWorld', () => {
      const viewport = {
        width: 800,
        height: 600,
        latitude: 0,
        longitude: 0,
        zoom: 0,
        pitch: 0,
        bearing: 0
      };

      const originalPixels = [400, 300];
      const world = pixelsToWorld(originalPixels, viewport);
      const backToPixels = worldToPixels(world, viewport);

      expect(backToPixels[0]).toBeCloseTo(originalPixels[0], 10);
      expect(backToPixels[1]).toBeCloseTo(originalPixels[1], 10);
    });

    it('should handle edge cases', () => {
      const viewport = {
        width: 800,
        height: 600,
        latitude: 0,
        longitude: 0,
        zoom: 0,
        pitch: 0,
        bearing: 0
      };

      const pixels = worldToPixels([0, 0], viewport);

      expect(pixels[0]).toBeGreaterThanOrEqual(0);
      expect(pixels[1]).toBeGreaterThanOrEqual(0);
      expect(pixels[0]).toBeLessThanOrEqual(viewport.width);
      expect(pixels[1]).toBeLessThanOrEqual(viewport.height);
    });
  });

  describe('addMetersToLngLat', () => {
    it('should add meters to lng/lat coordinates', () => {
      const result = addMetersToLngLat([0, 0], [1000, 1000]);

      expect(result).toHaveLength(2);
      expect(result[0]).toBeGreaterThan(0); // East
      expect(result[1]).toBeGreaterThan(0); // North
    });

    it('should handle negative offsets', () => {
      const result = addMetersToLngLat([0, 0], [-1000, -1000]);

      expect(result[0]).toBeLessThan(0); // West
      expect(result[1]).toBeLessThan(0); // South
    });

    it('should handle zero offsets', () => {
      const result = addMetersToLngLat([45, 30], [0, 0]);

      expect(result[0]).toBeCloseTo(45, 10);
      expect(result[1]).toBeCloseTo(30, 10);
    });

    it('should be consistent for same latitude', () => {
      const result1 = addMetersToLngLat([0, 0], [1000, 0]);
      const result2 = addMetersToLngLat([0, 0], [1000, 0]);

      expect(result1[0]).toBeCloseTo(result2[0], 10);
      expect(result1[1]).toBeCloseTo(result2[1], 10);
    });

    it('should handle large offsets', () => {
      const result = addMetersToLngLat([0, 0], [100000, 100000]);

      expect(result[0]).toBeGreaterThan(0);
      expect(result[1]).toBeGreaterThan(0);
      expect(result[0]).toBeLessThan(180);
      expect(result[1]).toBeLessThan(90);
    });
  });
});
