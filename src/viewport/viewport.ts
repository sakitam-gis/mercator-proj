// @ts-ignore
import * as mat4 from 'gl-matrix/mat4';
// @ts-ignore
import { transformMat4 } from 'gl-matrix/vec3';
// @ts-ignore
import * as vec2 from 'gl-matrix/vec2';
import { equals } from './common';
import { createMat4, getCameraPosition, getFrustumPlanes, FrustumPlanesInterface } from './math-utils';

import {
  getBounds,
  addMetersToLngLat,
  getDistanceScales,
  getMeterZoom,
  getProjectionParameters,
  getViewMatrix,
  lngLatToWorld,
  pixelsToWorld,
  worldToLngLat,
  worldToPixels
} from './web-mercator-utils';


export enum PROJECTION_MODE {
  WEB_MERCATOR = 1,
  GLOBE = 2,

  // This is automatically assigned by the project module
  WEB_MERCATOR_AUTO_OFFSET = 4,

  IDENTITY = 0
}

export enum COORDINATE_SYSTEM {
// `LNGLAT` if rendering into a geospatial viewport, `CARTESIAN` otherwise
  DEFAULT = -1,
  // Positions are interpreted as [lng, lat, elevation]
  // lng lat are degrees, elevation is meters. distances as meters.
  LNGLAT = 1,

  // Positions are interpreted as meter offsets, distances as meters
  METER_OFFSETS = 2,

  // Positions are interpreted as lng lat offsets: [deltaLng, deltaLat, elevation]
  // deltaLng, deltaLat are delta degrees, elevation is meters.
  // distances as meters.
  LNGLAT_OFFSETS = 3,

  // Non-geospatial
  CARTESIAN = 0
}

const DEGREES_TO_RADIANS = Math.PI / 180;

const IDENTITY = createMat4();

const ZERO_VECTOR = [0, 0, 0];

const DEFAULT_ZOOM = 0;

const DEFAULT_DISTANCE_SCALES = {
  unitsPerMeter: [1, 1, 1],
  metersPerUnit: [1, 1, 1]
};

export interface IDistanceScales {
  unitsPerMeter: number[];
  metersPerUnit: number[];
  unitsPerMeter2?: number[];
  unitsPerDegree: number[];
  degreesPerUnit: number[];
  unitsPerDegree2?: number[];
}

export interface IViewportOpts {
  width: number;
  height: number;

  viewMatrix: number[];
  longitude: number;
  latitude: number;
  zoom: number;

  distanceScales: IDistanceScales;

  // projection matrix parameters
  orthographic: boolean;
  fovyRadians: number;
  aspect: number;
  // TODO WebMercatorViewport is already carefully set up to "focus" on ground, so can't use focal distance
  focalDistance: number;
  near: number;
  far: number;
  fovy?: number;
  position?: number[];
  projectionMatrix?: number[];
  modelMatrix?: number[];
}

export interface IViewport extends IViewportOpts {
  id: string | number;
  x: number;
  y: number;
  pitch: number;
  bearing: number;
  nearZMultiplier: number;
  farZMultiplier: number;
  altitude: number;
  worldOffset: number;
  projectOffsetZoom: number;
  repeat: boolean;
}

export default class WebMercatorViewport {
  public id: string | number;
  public latitude: number;
  public altitude: number;
  public longitude: number;
  public zoom: number;
  public pitch: number;
  public bearing: number;
  public isGeospatial: boolean;
  public scale: number;
  public width: number;
  public height: number;
  public center: number[];

  public modelMatrix: number[];
  public viewMatrix: number[];
  public viewMatrixInverse: number[];
  public viewMatrixUncentered: number[];
  public projectionMatrix: number[] | Float32Array;
  public pixelProjectionMatrix: number[];
  public pixelUnprojectionMatrix: number[];
  public viewportMatrix: number[];
  public viewProjectionMatrix: number[];

  public cameraPosition: number[];
  public focalDistance: number;
  public distanceScales: IDistanceScales;
  public position: number[];
  public projectOffsetZoom: number;

  private readonly _subViewports: WebMercatorViewport[] | undefined;
  private meterOffset: number[];
  private x: number;
  private y: number;
  private _frustumPlanes: FrustumPlanesInterface;
  private orthographic: boolean;

  /**
   * Manages coordinate system transformations for deck.gl.
   * Note: The WebMercatorViewport is immutable in the sense that it only has accessors.
   * A new viewport instance should be created if any parameters have changed.
   */
  constructor(opts: Partial<IViewport>) {
    const {
      id,
      // Window width/height in pixels (for pixel projection)
      x = 0,
      y = 0,
      latitude = 0,
      longitude = 0,
      zoom = 11,
      pitch = 0,
      bearing = 0,
      nearZMultiplier = 0.1,
      farZMultiplier = 1.01,
      orthographic = false,

      repeat = false,
      worldOffset = 0,
      projectOffsetZoom = 12,
    } = opts;

    let {width, height, altitude = 1.5} = opts;
    const scale = Math.pow(2, zoom);

    // Silently allow apps to send in 0,0 to facilitate isomorphic render etc
    width = width || 1;
    height = height || 1;

    // Altitude - prevent division by 0
    // TODO - just throw an Error instead?
    altitude = Math.max(0.75, altitude);

    const {fov, aspect, focalDistance, near, far} = getProjectionParameters({
      width,
      height,
      pitch,
      altitude,
      nearZMultiplier,
      farZMultiplier
    });

    // The uncentered matrix allows us two move the center addition to the
    // shader (cheap) which gives a coordinate system that has its center in
    // the layer's center position. This makes rotations and other modelMatrx
    // transforms much more useful.
    let viewMatrixUncentered = getViewMatrix({
      height,
      pitch,
      bearing,
      scale,
      altitude,
      // @ts-ignore center typedef is incorrect
      center: null
    });

    if (worldOffset) {
      const m = createMat4();
      const viewOffset = mat4.translate(m, m, [512 * worldOffset, 0, 0]);
      viewMatrixUncentered = mat4.multiply(viewOffset, viewMatrixUncentered, viewOffset);
    }

    this.id = id || 'viewport';

    const viewportOpts = {
      ...opts,
      // x, y,
      width,
      height,

      // view matrix
      viewMatrix: viewMatrixUncentered,
      longitude,
      latitude,
      zoom,

      // projection matrix parameters
      orthographic,
      fovyRadians: fov,
      aspect,
      // TODO WebMercatorViewport is already carefully set up to "focus" on ground, so can't use focal distance
      focalDistance: orthographic ? focalDistance : 1,
      near,
      far
    };

    // Save parameters
    this.latitude = latitude;
    this.longitude = longitude;
    this.zoom = zoom;
    this.pitch = pitch;
    this.bearing = bearing;
    this.altitude = altitude;
    this.projectOffsetZoom = projectOffsetZoom;

    this.orthographic = orthographic;

    this._subViewports = repeat ? [] : undefined;

    this.x = x;
    this.y = y;
    // Silently allow apps to send in w,h = 0,0
    this.width = width || 1;
    this.height = height || 1;

    // @ts-ignore
    this._initViewMatrix(viewportOpts);
    // @ts-ignore
    this._initProjectionMatrix(viewportOpts);
    this._initPixelMatrices();

    // Bind methods for easy access
    this.equals = this.equals.bind(this);
    this.project = this.project.bind(this);
    this.unproject = this.unproject.bind(this);
    this.projectPosition = this.projectPosition.bind(this);
    this.unprojectPosition = this.unprojectPosition.bind(this);
    this.projectFlat = this.projectFlat.bind(this);
    this.unprojectFlat = this.unprojectFlat.bind(this);
  }

  get metersPerPixel() {
    return this.distanceScales.metersPerUnit[2] / this.scale;
  }

  get projectionMode() {
    if (this.isGeospatial) {
      return this.zoom < this.projectOffsetZoom
        ? PROJECTION_MODE.WEB_MERCATOR
        : PROJECTION_MODE.WEB_MERCATOR_AUTO_OFFSET;
    }
    return PROJECTION_MODE.IDENTITY;
  }

  /**
   * Two viewports are equal if width and height are identical, and if
      their view and projection matrices are (approximately) equal.
   * @param viewport
   */
  equals(viewport: any): boolean {
    if (!(viewport instanceof WebMercatorViewport)) {
      return false;
    }
    if (this === viewport) {
      return true;
    }

    return (
      viewport.width === this.width &&
      viewport.height === this.height &&
      viewport.scale === this.scale &&
      equals(viewport.projectionMatrix, this.projectionMatrix) &&
      equals(viewport.viewMatrix, this.viewMatrix)
    );
  }

  /**
   * Projects xyz (possibly latitude and longitude) to pixel coordinates in window
   * using viewport projection parameters
   * - [longitude, latitude] to [x, y]
   * - [longitude, latitude, Z] => [x, y, z]
   * Note: By default, returns top-left coordinates for canvas/SVG type render
   *
   * @param {Array} lngLatZ - [lng, lat] or [lng, lat, Z]
   * @param {Object} opts.topLeft=true - Whether projected coords are top left
   * @return {Array} - [x, y] or [x, y, z] in top left coords
   * @param xyz
   */
  project(
    xyz: number[],
    {
      topLeft = true
    }: {
      topLeft?: boolean;
    } = {}): number[] {
    const worldPosition = this.projectPosition(xyz);
    const coord = worldToPixels(worldPosition, this.pixelProjectionMatrix);

    const [x, y] = coord;
    const y2 = topLeft ? y : this.height - y;
    return xyz.length === 2 ? [x, y2] : [x, y2, coord[2]];
  }

  /**
   * Unproject pixel coordinates on screen onto world coordinates,
   * (possibly [lon, lat]) on map.
   * - [x, y] => [lng, lat]
   * - [x, y, z] => [lng, lat, Z]
   * @param {Array} xyz -
   * @param {Object} opts - options
   * @param {Object} opts.topLeft=true - Whether origin is top left
   * @return {Array|null} - [lng, lat, Z] or [X, Y, Z]
   */
  unproject(
    xyz: number[],
    {
      topLeft = true,
      targetZ
    }: {
      topLeft?: boolean;
      targetZ?: number
    } = {}): (number | undefined)[] {
    const [x, y, z] = xyz;

    const y2 = topLeft ? y : this.height - y;
    const targetZWorld = targetZ && targetZ * this.distanceScales.unitsPerMeter[2];
    const coord = pixelsToWorld([x, y2, z], this.pixelUnprojectionMatrix, targetZWorld);
    const [X, Y, Z] = this.unprojectPosition(coord);

    if (Number.isFinite(z)) {
      return [X, Y, Z];
    }
    return Number.isFinite(targetZ) ? [X, Y, targetZ] : [X, Y];
  }

  // NON_LINEAR PROJECTION HOOKS
  // Used for web meractor projection
  projectPosition(xyz: number[]): number[] {
    const [X, Y] = this.projectFlat(xyz);
    const Z = (xyz[2] || 0) * this.distanceScales.unitsPerMeter[2];
    return [X, Y, Z];
  }

  unprojectPosition(xyz: number[]): number[] {
    const [X, Y] = this.unprojectFlat(xyz);
    const Z = (xyz[2] || 0) * this.distanceScales.metersPerUnit[2];
    return [X, Y, Z];
  }

  /**
   * Project [lng,lat] on sphere onto [x,y] on 512*512 Mercator Zoom 0 tile.
   * Performs the nonlinear part of the web mercator projection.
   * Remaining projection is done with 4x4 matrices which also handles
   * perspective.
   *   Specifies a point on the sphere to project onto the map.
   * @return {Array} [x,y] coordinates.
   * @param xyz
   */
  projectFlat(xyz: number[]): number[] {
    if (this.isGeospatial) {
      return lngLatToWorld(xyz);
    }
    return xyz;
  }

  /**
   * Unproject world point [x,y] on map onto {lat, lon} on sphere
   *  representing point on projected map plane
   * @return {GeoCoordinates} - object with {lat,lon} of point on sphere.
   *   Has toArray method if you need a GeoJSON Array.
   *   Per cartographic tradition, lat and lon are specified as degrees.
   * @param xyz
   */
  unprojectFlat(xyz: number[]): number[] {
    if (this.isGeospatial) {
      return worldToLngLat(xyz);
    }
    return xyz;
  }

  getDistanceScales(coordinateOrigin: null | number[]) {
    if (coordinateOrigin && Array.isArray(coordinateOrigin)) {
      return getDistanceScales({
        longitude: coordinateOrigin[0] as number,
        latitude: coordinateOrigin[1] as number,
        highPrecision: true
      });
    }
    return this.distanceScales;
  }

  /**
   * Judge whether the position is in the range
   * @param x
   * @param y
   * @param width
   * @param height
   */
  containsPixel({x, y, width = 1, height = 1}: {
    x: number;
    y: number;
    width?: number;
    height?: number;
  }) {
    return (
      x < this.x + this.width &&
      this.x < x + width &&
      y < this.y + this.height &&
      this.y < y + height
    );
  }

  /**
   * Extract frustum planes in common space
   */
  getFrustumPlanes(): FrustumPlanesInterface {
    if (this._frustumPlanes?.near) {
      return this._frustumPlanes;
    }

    this._frustumPlanes = getFrustumPlanes(this.viewProjectionMatrix);

    return this._frustumPlanes;
  }

  // EXPERIMENTAL METHODS
  getCameraPosition() {
    return this.cameraPosition;
  }

  // INTERNAL METHODS
  _createProjectionMatrix({
    orthographic,
    fovyRadians,
    aspect,
    focalDistance,
    near,
    far
  }: {
    fovyRadians: number;
    aspect: number;
    focalDistance: number;
    orthographic?: boolean;
    near?: number;
    far?: number;
  }) {
    const m = createMat4();
    if (orthographic) {
      if (fovyRadians > Math.PI * 2) {
        throw Error('radians');
      }
      const halfY = fovyRadians / 2;
      const top = focalDistance * Math.tan(halfY); // focus_plane is the distance from the camera
      const right = top * aspect;

      mat4.ortho(m, -right, right, -top, top, near, far);
    } else {
      mat4.perspective(m, fovyRadians, aspect, near, far);
    }
    return m;
  }

  _initViewMatrix(opts: IViewportOpts) {
    const {
      // view matrix
      viewMatrix = IDENTITY,

      longitude, // Anchor: lng lat zoom makes viewport work w/ geospatial coordinate systems
      latitude,
      zoom,

      position = null, // Anchor position offset (in meters for geospatial viewports)
      modelMatrix = null, // A model matrix to be applied to position, to match the layer props API
      focalDistance = 1, // Only needed for orthographic views

      distanceScales
    } = opts;

    // Check if we have a geospatial anchor
    this.isGeospatial = Number.isFinite(latitude) && Number.isFinite(longitude);

    this.zoom = zoom;
    if (!Number.isFinite(this.zoom)) {
      this.zoom = this.isGeospatial
        ? getMeterZoom({latitude}) + Math.log2(focalDistance)
        : DEFAULT_ZOOM;
    }
    this.scale = Math.pow(2, this.zoom);

    // Calculate distance scales if lng/lat/zoom are provided
    this.distanceScales = this.isGeospatial
      ? getDistanceScales({latitude, longitude})
      : distanceScales || DEFAULT_DISTANCE_SCALES;

    this.focalDistance = focalDistance;

    this.position = ZERO_VECTOR;
    this.meterOffset = ZERO_VECTOR;
    if (position && modelMatrix) {
      // Apply model matrix if supplied
      this.position = position;
      this.modelMatrix = modelMatrix;
      this.meterOffset = modelMatrix ? transformMat4([-0, -0, -0], position, modelMatrix) : position;
    }

    if (this.isGeospatial) {
      // Determine camera center
      this.longitude = longitude;
      this.latitude = latitude;
      this.center = this._getCenterInWorld({longitude, latitude});
    } else {
      this.center = position ? this.projectPosition(position) : [0, 0, 0];
    }
    this.viewMatrixUncentered = viewMatrix;
    // Make a centered version of the matrix for projection modes without an offset
    this.viewMatrix = createMat4();
    mat4.multiply(this.viewMatrix, this.viewMatrixUncentered, this.viewMatrix);
    mat4.translate(this.viewMatrix, this.viewMatrix, (this.center || ZERO_VECTOR).map(i => -i));
  }

  _initProjectionMatrix(opts: IViewportOpts) {
    const {
      // Projection matrix
      projectionMatrix = null,

      // Projection matrix parameters, used if projectionMatrix not supplied
      orthographic = false,
      fovyRadians,
      fovy = 75,
      near = 0.1, // Distance of near clipping plane
      far = 1000, // Distance of far clipping plane
      focalDistance = 1
    } = opts;

    this.projectionMatrix =
      projectionMatrix ||
      this._createProjectionMatrix({
        orthographic,
        fovyRadians: fovyRadians || fovy * DEGREES_TO_RADIANS,
        aspect: this.width / this.height,
        focalDistance,
        near,
        far
      });
  }

  _initPixelMatrices() {
    // Note: As usual, matrix operations should be applied in "reverse" order
    // since vectors will be multiplied in from the right during transformation
    const vpm = createMat4();
    mat4.multiply(vpm, vpm, this.projectionMatrix);
    mat4.multiply(vpm, vpm, this.viewMatrix);
    this.viewProjectionMatrix = vpm;

    // console.log('VPM', this.viewMatrix, this.projectionMatrix, this.viewProjectionMatrix);

    // Calculate inverse view matrix
    this.viewMatrixInverse = mat4.invert([], this.viewMatrix) || this.viewMatrix;

    // Decompose camera parameters
    this.cameraPosition = getCameraPosition(this.viewMatrixInverse);

    /*
     * Builds matrices that converts preprojected lngLats to screen pixels
     * and vice versa.
     * Note: Currently returns bottom-left coordinates!
     * Note: Starts with the GL projection matrix and adds steps to the
     *       scale and translate that matrix onto the window.
     * Note: WebGL controls clip space to screen projection with gl.viewport
     *       and does not need this step.
     */

    // matrix for conversion from world location to screen (pixel) coordinates
    const viewportMatrix = createMat4(); // matrix from NDC to viewport.
    const pixelProjectionMatrix = createMat4(); // matrix from world space to viewport.
    mat4.scale(viewportMatrix, viewportMatrix, [this.width / 2, -this.height / 2, 1]);
    mat4.translate(viewportMatrix, viewportMatrix, [1, -1, 0]);
    mat4.multiply(pixelProjectionMatrix, viewportMatrix, this.viewProjectionMatrix);
    this.pixelProjectionMatrix = pixelProjectionMatrix;
    this.viewportMatrix = viewportMatrix;

    const m = createMat4();

    this.pixelUnprojectionMatrix = mat4.invert(m, this.pixelProjectionMatrix);
    if (!this.pixelUnprojectionMatrix) {
      console.warn('Pixel project matrix not invertible');
    }
  }

  _getCenterInWorld({longitude, latitude}: {
    longitude:number;
    latitude: number;
  }) {
    const {meterOffset, distanceScales} = this;

    // Make a centered version of the matrix for projection modes without an offset
    const center = this.projectPosition([longitude, latitude, 0]);

    if (meterOffset) {
      const commonPosition = meterOffset;
      // Convert to pixels in current zoom
      for (let i = 0; i < commonPosition.length; ++i) {
        commonPosition[i] *= distanceScales.unitsPerMeter[i];
      }
      for (let i = 0; i < center.length; ++i) {
        center[i] += commonPosition[i];
      }
      // center.add(commonPosition);
    }

    return center;
  }

  get subViewports() {
    if (this._subViewports && !this._subViewports.length) {
      // Cache sub viewports so that we only calculate them once
      const bounds = this.getBounds();

      const minOffset = Math.floor((bounds[0] + 180) / 360);
      const maxOffset = Math.ceil((bounds[2] - 180) / 360);

      for (let x = minOffset; x <= maxOffset; x++) {
        const offsetViewport = x
          // @ts-ignore
          ? new WebMercatorViewport({ ...this, worldOffset: x })
          : this;
        this._subViewports.push(offsetViewport);
      }
    }
    return this._subViewports;
  }

  /**
   * Add a meter delta to a base lnglat coordinate, returning a new lnglat array
   *
   * Note: Uses simple linear approximation around the viewport center
   * Error increases with size of offset (roughly 1% per 100km)
   *
   * @return {[Number,Number]|[Number,Number,Number]) array of [lng,lat,z] deltas
   * @param lngLatZ
   * @param xyz
   */
  addMetersToLngLat(lngLatZ: number[], xyz: [number, number, number]) {
    return addMetersToLngLat(lngLatZ, xyz);
  }

  /**
   * Get the map center that place a given [lng, lat] coordinate at screen
   * point [x, y]
   *
   * @param {Array} lngLat - [lng,lat] coordinates
   *   Specifies a point on the sphere.
   * @param {Array} pos - [x,y] coordinates
   *   Specifies a point on the screen.
   * @return {Array} [lng,lat] new map center.
   */
  getMapCenterByLngLatPosition({lngLat, pos}: {
    lngLat: number[];
    pos: number[];
  }): number[] {
    const fromLocation = pixelsToWorld(pos, this.pixelUnprojectionMatrix);
    const toLocation = this.projectFlat(lngLat);

    const translate = vec2.add([], toLocation, vec2.negate([], fromLocation));
    const newCenter = vec2.add([], this.center, translate);

    return this.unprojectFlat(newCenter);
  }

  getBounds(options = {}) {
    // @ts-ignore
    const corners = getBounds(this, options.z || 0);

    return [
      Math.min(corners[0][0], corners[1][0], corners[2][0], corners[3][0]),
      Math.min(corners[0][1], corners[1][1], corners[2][1], corners[3][1]),
      Math.max(corners[0][0], corners[1][0], corners[2][0], corners[3][0]),
      Math.max(corners[0][1], corners[1][1], corners[2][1], corners[3][1])
    ];
  }
}
