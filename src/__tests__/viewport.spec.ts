import { describe, it, expect, beforeEach } from 'vitest';
import WebMercatorViewport from '../viewport/viewport';
import { PROJECTION_MODE, COORDINATE_SYSTEM } from '../viewport/viewport';

describe('WebMercatorViewport', () => {
  describe('constructor', () => {
    it('should create viewport with default values', () => {
      const viewport = new WebMercatorViewport();

      expect(viewport.width).toBe(1);
      expect(viewport.height).toBe(1);
      expect(viewport.latitude).toBe(0);
      expect(viewport.longitude).toBe(0);
      expect(viewport.zoom).toBe(0);
      expect(viewport.pitch).toBe(0);
      expect(viewport.bearing).toBe(0);
      expect(viewport.altitude).toBe(1.5);
    });

    it('should create viewport with custom values', () => {
      const viewport = new WebMercatorViewport({
        width: 800,
        height: 600,
        latitude: 40.7128,
        longitude: -74.0060,
        zoom: 10,
        pitch: 30,
        bearing: 45,
        altitude: 2.0
      });

      expect(viewport.width).toBe(800);
      expect(viewport.height).toBe(600);
      expect(viewport.latitude).toBe(40.7128);
      expect(viewport.longitude).toBe(-74.0060);
      expect(viewport.zoom).toBe(10);
      expect(viewport.pitch).toBe(30);
      expect(viewport.bearing).toBe(45);
      expect(viewport.altitude).toBe(2.0);
    });
  });

  describe('projection mode', () => {
    it('should default to WEB_MERCATOR projection mode', () => {
      const viewport = new WebMercatorViewport();
      expect(viewport.projectionMode).toBe(PROJECTION_MODE.WEB_MERCATOR);
    });

    it('should allow setting projection mode', () => {
      const viewport = new WebMercatorViewport({
        projectionMode: PROJECTION_MODE.GLOBE
      });
      expect(viewport.projectionMode).toBe(PROJECTION_MODE.GLOBE);
    });
  });

  describe('coordinate system', () => {
    it('should default to LNGLAT coordinate system', () => {
      const viewport = new WebMercatorViewport();
      expect(viewport.coordinateSystem).toBe(COORDINATE_SYSTEM.LNGLAT);
    });

    it('should allow setting coordinate system', () => {
      const viewport = new WebMercatorViewport({
        coordinateSystem: COORDINATE_SYSTEM.CARTESIAN
      });
      expect(viewport.coordinateSystem).toBe(COORDINATE_SYSTEM.CARTESIAN);
    });
  });

  describe('project method', () => {
    it('should project lng/lat to screen coordinates', () => {
      const viewport = new WebMercatorViewport({
        width: 800,
        height: 600,
        latitude: 0,
        longitude: 0,
        zoom: 0
      });

      const screenCoords = viewport.project([0, 0]);

      expect(screenCoords).toHaveLength(2);
      expect(screenCoords[0]).toBeCloseTo(400, 10); // Center X
      expect(screenCoords[1]).toBeCloseTo(300, 10); // Center Y
    });

    it('should handle different zoom levels', () => {
      const viewport0 = new WebMercatorViewport({
        width: 800,
        height: 600,
        latitude: 0,
        longitude: 0,
        zoom: 0
      });

      const viewport10 = new WebMercatorViewport({
        width: 800,
        height: 600,
        latitude: 0,
        longitude: 0,
        zoom: 10
      });

      const coords0 = viewport0.project([0, 0]);
      const coords10 = viewport10.project([0, 0]);

      expect(coords0).not.toEqual(coords10);
    });

    it('should handle different pitches', () => {
      const viewport0 = new WebMercatorViewport({
        width: 800,
        height: 600,
        latitude: 0,
        longitude: 0,
        zoom: 0,
        pitch: 0
      });

      const viewport45 = new WebMercatorViewport({
        width: 800,
        height: 600,
        latitude: 0,
        longitude: 0,
        zoom: 0,
        pitch: 45
      });

      const coords0 = viewport0.project([0, 0]);
      const coords45 = viewport45.project([0, 0]);

      expect(coords0).not.toEqual(coords45);
    });

    it('should handle different bearings', () => {
      const viewport0 = new WebMercatorViewport({
        width: 800,
        height: 600,
        latitude: 0,
        longitude: 0,
        zoom: 0,
        bearing: 0
      });

      const viewport90 = new WebMercatorViewport({
        width: 800,
        height: 600,
        latitude: 0,
        longitude: 0,
        zoom: 0,
        bearing: 90
      });

      const coords0 = viewport0.project([0, 0]);
      const coords90 = viewport90.project([0, 0]);

      expect(coords0).not.toEqual(coords90);
    });
  });

  describe('unproject method', () => {
    it('should unproject screen coordinates to lng/lat', () => {
      const viewport = new WebMercatorViewport({
        width: 800,
        height: 600,
        latitude: 0,
        longitude: 0,
        zoom: 0
      });

      const lngLat = viewport.unproject([400, 300]);

      expect(lngLat).toHaveLength(2);
      expect(lngLat[0]).toBeCloseTo(0, 10); // Longitude
      expect(lngLat[1]).toBeCloseTo(0, 10); // Latitude
    });

    it('should be symmetric with project', () => {
      const viewport = new WebMercatorViewport({
        width: 800,
        height: 600,
        latitude: 0,
        longitude: 0,
        zoom: 0
      });

      const originalLngLat = [45, 30];
      const screenCoords = viewport.project(originalLngLat);
      const backToLngLat = viewport.unproject(screenCoords);

      expect(backToLngLat[0]).toBeCloseTo(originalLngLat[0], 10);
      expect(backToLngLat[1]).toBeCloseTo(originalLngLat[1], 10);
    });

    it('should handle edge coordinates', () => {
      const viewport = new WebMercatorViewport({
        width: 800,
        height: 600,
        latitude: 0,
        longitude: 0,
        zoom: 0
      });

      const topLeft = viewport.unproject([0, 0]);
      const bottomRight = viewport.unproject([800, 600]);

      expect(topLeft[0]).toBeLessThan(bottomRight[0]);
      expect(topLeft[1]).toBeGreaterThan(bottomRight[1]);
    });
  });

  describe('getBounds method', () => {
    it('should return viewport bounds', () => {
      const viewport = new WebMercatorViewport({
        width: 800,
        height: 600,
        latitude: 0,
        longitude: 0,
        zoom: 0
      });

      const bounds = viewport.getBounds();

      expect(bounds).toHaveLength(4);
      bounds.forEach(bound => {
        expect(bound).toHaveLength(2); // [lng, lat]
      });
    });

    it('should return bounds with correct structure', () => {
      const viewport = new WebMercatorViewport({
        width: 800,
        height: 600,
        latitude: 0,
        longitude: 0,
        zoom: 0
      });

      const bounds = viewport.getBounds();

      // Check that bounds form a proper quad
      expect(bounds[0][0]).toBeLessThan(bounds[1][0]); // left < right
      expect(bounds[0][1]).toBeLessThan(bounds[3][1]); // bottom < top
    });
  });

  describe('getDistanceScales method', () => {
    it('should return distance scales', () => {
      const viewport = new WebMercatorViewport({
        latitude: 0,
        longitude: 0
      });

      const scales = viewport.getDistanceScales();

      expect(scales).toHaveProperty('degreesPerUnit');
      expect(scales).toHaveProperty('metersPerUnit');
      expect(scales).toHaveProperty('unitsPerDegree');
      expect(scales).toHaveProperty('unitsPerMeter');
    });

    it('should return scales for different latitudes', () => {
      const viewport0 = new WebMercatorViewport({
        latitude: 0,
        longitude: 0
      });

      const viewport45 = new WebMercatorViewport({
        latitude: 45,
        longitude: 0
      });

      const scales0 = viewport0.getDistanceScales();
      const scales45 = viewport45.getDistanceScales();

      expect(scales0).not.toEqual(scales45);
    });
  });

  describe('getZoom method', () => {
    it('should return current zoom level', () => {
      const viewport = new WebMercatorViewport({
        zoom: 5
      });

      expect(viewport.getZoom()).toBe(5);
    });
  });

  describe('getCenter method', () => {
    it('should return center coordinates', () => {
      const viewport = new WebMercatorViewport({
        latitude: 40.7128,
        longitude: -74.0060
      });

      const center = viewport.getCenter();

      expect(center).toHaveLength(2);
      expect(center[0]).toBe(-74.0060);
      expect(center[1]).toBe(40.7128);
    });
  });

  describe('getBearing method', () => {
    it('should return current bearing', () => {
      const viewport = new WebMercatorViewport({
        bearing: 45
      });

      expect(viewport.getBearing()).toBe(45);
    });
  });

  describe('getPitch method', () => {
    it('should return current pitch', () => {
      const viewport = new WebMercatorViewport({
        pitch: 30
      });

      expect(viewport.getPitch()).toBe(30);
    });
  });

  describe('getAltitude method', () => {
    it('should return current altitude', () => {
      const viewport = new WebMercatorViewport({
        altitude: 2.0
      });

      expect(viewport.getAltitude()).toBe(2.0);
    });
  });

  describe('getDistanceScales method', () => {
    it('should return distance scales for current position', () => {
      const viewport = new WebMercatorViewport({
        latitude: 40.7128,
        longitude: -74.0060
      });

      const scales = viewport.getDistanceScales();

      expect(scales).toHaveProperty('degreesPerUnit');
      expect(scales).toHaveProperty('metersPerUnit');
      expect(scales).toHaveProperty('unitsPerDegree');
      expect(scales).toHaveProperty('unitsPerMeter');
    });
  });

  describe('getProjectionMatrix method', () => {
    it('should return projection matrix', () => {
      const viewport = new WebMercatorViewport({
        width: 800,
        height: 600
      });

      const matrix = viewport.getProjectionMatrix();

      expect(matrix).toHaveLength(16);
      expect(matrix[0]).toBeCloseTo(1, 10);
      expect(matrix[5]).toBeCloseTo(1, 10);
      expect(matrix[10]).toBeCloseTo(1, 10);
      expect(matrix[15]).toBeCloseTo(1, 10);
    });
  });

  describe('getViewMatrix method', () => {
    it('should return view matrix', () => {
      const viewport = new WebMercatorViewport({
        latitude: 0,
        longitude: 0,
        zoom: 0,
        pitch: 0,
        bearing: 0
      });

      const matrix = viewport.getViewMatrix();

      expect(matrix).toHaveLength(16);
    });
  });

  describe('getViewMatrixInverse method', () => {
    it('should return inverse view matrix', () => {
      const viewport = new WebMercatorViewport({
        latitude: 0,
        longitude: 0,
        zoom: 0,
        pitch: 0,
        bearing: 0
      });

      const matrix = viewport.getViewMatrixInverse();

      expect(matrix).toHaveLength(16);
    });
  });

  describe('getPixelUnprojectionMatrix method', () => {
    it('should return pixel unprojection matrix', () => {
      const viewport = new WebMercatorViewport({
        width: 800,
        height: 600
      });

      const matrix = viewport.getPixelUnprojectionMatrix();

      expect(matrix).toHaveLength(16);
    });
  });

  describe('getUniforms method', () => {
    it('should return uniforms for shader', () => {
      const viewport = new WebMercatorViewport({
        width: 800,
        height: 600,
        latitude: 0,
        longitude: 0,
        zoom: 0
      });

      const uniforms = viewport.getUniforms();

      expect(uniforms).toHaveProperty('projectionMatrix');
      expect(uniforms).toHaveProperty('viewMatrix');
      expect(uniforms).toHaveProperty('viewMatrixInverse');
      expect(uniforms).toHaveProperty('pixelUnprojectionMatrix');
    });
  });

  describe('edge cases', () => {
    it('should handle zero dimensions', () => {
      const viewport = new WebMercatorViewport({
        width: 0,
        height: 0
      });

      expect(viewport.width).toBe(0);
      expect(viewport.height).toBe(0);
    });

    it('should handle extreme coordinates', () => {
      const viewport = new WebMercatorViewport({
        latitude: 89,
        longitude: 179
      });

      const coords = viewport.project([179, 89]);
      expect(coords).toHaveLength(2);
    });

    it('should handle extreme zoom levels', () => {
      const viewport = new WebMercatorViewport({
        zoom: 20
      });

      expect(viewport.getZoom()).toBe(20);
    });

    it('should handle extreme pitch values', () => {
      const viewport = new WebMercatorViewport({
        pitch: 89
      });

      expect(viewport.getPitch()).toBe(89);
    });

    it('should handle extreme bearing values', () => {
      const viewport = new WebMercatorViewport({
        bearing: 360
      });

      expect(viewport.getBearing()).toBe(360);
    });
  });

  describe('coordinate system handling', () => {
    it('should handle LNGLAT coordinate system', () => {
      const viewport = new WebMercatorViewport({
        coordinateSystem: COORDINATE_SYSTEM.LNGLAT
      });

      expect(viewport.coordinateSystem).toBe(COORDINATE_SYSTEM.LNGLAT);
    });

    it('should handle CARTESIAN coordinate system', () => {
      const viewport = new WebMercatorViewport({
        coordinateSystem: COORDINATE_SYSTEM.CARTESIAN
      });

      expect(viewport.coordinateSystem).toBe(COORDINATE_SYSTEM.CARTESIAN);
    });

    it('should handle METER_OFFSETS coordinate system', () => {
      const viewport = new WebMercatorViewport({
        coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS
      });

      expect(viewport.coordinateSystem).toBe(COORDINATE_SYSTEM.METER_OFFSETS);
    });

    it('should handle LNGLAT_OFFSETS coordinate system', () => {
      const viewport = new WebMercatorViewport({
        coordinateSystem: COORDINATE_SYSTEM.LNGLAT_OFFSETS
      });

      expect(viewport.coordinateSystem).toBe(COORDINATE_SYSTEM.LNGLAT_OFFSETS);
    });
  });
});
