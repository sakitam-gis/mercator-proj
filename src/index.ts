import {
  WebMercatorViewport,
  getDistanceScales,
} from '@math.gl/web-mercator';

import projectShader from './project.glsl';
import fp32shader from './fp32.glsl';

export type vec4 = [number, number, number, number] | Float32Array;
export type mat4 = number[]
  | [number, number, number, number,
  number, number, number, number,
  number, number, number, number,
  number, number, number, number]
  | Float32Array;

export interface IOptions {
  viewport: WebMercatorViewport;
  devicePixelRatio: number;
  modelMatrix: number[] | null;
  projectOffsetZoom: number;
}

// To quickly set a vector to zero
const ZERO_VECTOR: [number, number, number, number] | Float32Array = [0, 0, 0, 0];
const VECTOR_TO_POINT_MATRIX = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0];
const IDENTITY_MATRIX = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
const INITIAL_MODULE_OPTIONS = {
  devicePixelRatio: 1,
};

export function isEqual(a: any, b: any): boolean {
  if (a === b) {
    return true;
  }
  if (Array.isArray(a)) {
    // Special treatment for arrays: compare 1-level deep
    // This is to support equality of matrix/coordinate props
    const len = a.length;
    if (!b || b.length !== len) {
      return false;
    }

    for (let i = 0; i < len; i++) {
      if (a[i] !== b[i]) {
        return false;
      }
    }
    return true;
  }
  return false;
}

/**
 * Speed up consecutive function calls by caching the result of calls with identical input
 * https://en.wikipedia.org/wiki/Memoization
 * @param {function} compute - the function to be memoized
 */
export function memoize(compute: (args: any) => any) {
  let cachedArgs: {
    [key: string]: any;
  } = {};
  let cachedResult: {
    [key: string]: any;
  };

  return (args: any) => {
    // eslint-disable-next-line no-restricted-syntax
    for (const key in args) {
      if (!isEqual(args[key], cachedArgs[key])) {
        cachedResult = compute(args);
        cachedArgs = args;
        break;
      }
    }
    return cachedResult;
  };
}

/**
 * Multiplies two mat4s
 * @param {mat4} out the receiving matrix
 * @param {ReadonlyMat4} a the first operand
 * @param {ReadonlyMat4} b the second operand
 * @returns {mat4} out
 */
export function multiply(out: mat4, a: mat4 | number[], b: mat4 | number[]) {
  const a00 = a[0];
  const a01 = a[1];
  const a02 = a[2];
  const a03 = a[3];
  const a10 = a[4];
  const a11 = a[5];
  const a12 = a[6];
  const a13 = a[7];
  const a20 = a[8];
  const a21 = a[9];
  const a22 = a[10];
  const a23 = a[11];
  const a30 = a[12];
  const a31 = a[13];
  const a32 = a[14];
  const a33 = a[15]; // Cache only the current line of the second matrix

  let b0 = b[0];
  let b1 = b[1];
  let b2 = b[2];
  let b3 = b[3];
  out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  b0 = b[4];
  b1 = b[5];
  b2 = b[6];
  b3 = b[7];
  out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  b0 = b[8];
  b1 = b[9];
  b2 = b[10];
  b3 = b[11];
  out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  b0 = b[12];
  b1 = b[13];
  b2 = b[14];
  b3 = b[15];
  out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  return out;
}

/**
 * Transforms the vec4 with a mat4.
 * @param {vec4} out the receiving vector
 * @param {ReadonlyVec4} a the vector to transform
 * @param {ReadonlyMat4} m matrix to transform with
 * @returns {vec4} out
 */
export function transformMat4(out: vec4, a: vec4, m: mat4 | number[]) {
  const x = a[0];
  const y = a[1];
  const z = a[2];
  const w = a[3];
  out[0] = m[0] * x + m[4] * y + m[8] * z + m[12] * w;
  out[1] = m[1] * x + m[5] * y + m[9] * z + m[13] * w;
  out[2] = m[2] * x + m[6] * y + m[10] * z + m[14] * w;
  out[3] = m[3] * x + m[7] * y + m[11] * z + m[15] * w;
  return out;
}

const getMemoizedViewportUniforms = memoize(calculateViewportUniforms);

function calculateMatrixAndOffset(viewport: WebMercatorViewport, offsetMode: boolean) {
  // @ts-ignore
  const { viewMatrixUncentered, projectionMatrix } = viewport;
  let { viewMatrix, viewProjectionMatrix } = viewport;

  let projectionCenter = ZERO_VECTOR;
  let shaderCoordinateOrigin = [0, 0, 0];

  const geospatialOrigin = [Math.fround(viewport.longitude), Math.fround(viewport.latitude), 0];

  if (offsetMode) {
    // viewport center in world space
    shaderCoordinateOrigin = geospatialOrigin;
    // @ts-ignore
    const positionCommonSpace = viewport?.projectPosition(geospatialOrigin || shaderCoordinateOrigin);

    positionCommonSpace[3] = 1;

    // projectionCenter = new Matrix4(viewProjectionMatrix)
    //   .transformVector([positionPixels[0], positionPixels[1], 0.0, 1.0]);
    // @ts-ignore
    projectionCenter = transformMat4([], positionCommonSpace, viewProjectionMatrix);

    // Always apply uncentered projection matrix if available (shader adds center)
    viewMatrix = viewMatrixUncentered || viewMatrix;

    // Zero out 4th coordinate ("after" model matrix) - avoids further translations
    // viewMatrix = new Matrix4(viewMatrixUncentered || viewMatrix)
    //   .multiplyRight(VECTOR_TO_POINT_MATRIX);
    // @ts-ignore
    viewProjectionMatrix = multiply([], projectionMatrix, viewMatrix);
    // @ts-ignore
    viewProjectionMatrix = multiply([], viewProjectionMatrix, VECTOR_TO_POINT_MATRIX);
  }

  return {
    viewMatrix,
    viewProjectionMatrix,
    projectionCenter,
    geospatialOrigin,
    shaderCoordinateOrigin
  };
}

function calculateViewportUniforms(options: IOptions) {
  const {
    viewport,
    devicePixelRatio,
    projectOffsetZoom = 7,
  } = options;

  const offsetMode = viewport.zoom >= projectOffsetZoom;

  const {
    projectionCenter,
    viewProjectionMatrix,
    shaderCoordinateOrigin,
    geospatialOrigin,
  } = calculateMatrixAndOffset(viewport, offsetMode);

  // Calculate projection pixels per unit
  const { distanceScales } = viewport;
  const distanceScalesAtOrigin = getDistanceScales({
    longitude: geospatialOrigin[0],
    latitude: geospatialOrigin[1],
    highPrecision: true
  });

  const viewportSize = [viewport.width * devicePixelRatio, viewport.height * devicePixelRatio];

  return {
    project_uCoordinateOrigin: shaderCoordinateOrigin,
    // Projection mode values
    // project_lngLatCenter: geospatialOrigin,
    project_uCenter: projectionCenter,
    project_uAntimeridian: (viewport.longitude || 0) - 180,

    // Screen size
    project_uViewportSize: viewportSize,
    project_uDevicePixelRatio: devicePixelRatio,

    // Distance at which screen pixels are projected
    // @ts-ignore
    project_uFocalDistance: viewport.focalDistance || 1,
    project_uCommonUnitsPerMeter: distanceScales.unitsPerMeter,
    project_uCommonUnitsPerWorldUnit: distanceScalesAtOrigin.unitsPerDegree,
    project_uCommonUnitsPerWorldUnit2: distanceScalesAtOrigin.unitsPerDegree2,
    project_uScale: viewport.scale, // This is the mercator scale (2 ** zoom)
    project_uViewProjectionMatrix: viewProjectionMatrix,
    // @ts-ignore
    project_metersPerPixel: distanceScales.metersPerUnit[2] / viewport.scale,
  };
}

/**
 * Returns uniforms for shaders based on current projection
 * includes: projection matrix suitable for shaders
 *
 * TODO - Ensure this works with any viewport, not just WebMercatorViewports
 *
 * @param viewport
 * @param devicePixelRatio
 * @param modelMatrix
 * @param projectOffsetZoom
 * @return {Float32Array} - 4x4 projection matrix that can be used in shaders
 */
export function getUniformsFromViewport({
  viewport,
  devicePixelRatio = 1,
  modelMatrix = null,
  projectOffsetZoom = 7,
}: Partial<IOptions> = {}) {
  const uniforms = getMemoizedViewportUniforms({
    viewport,
    devicePixelRatio,
    projectOffsetZoom,
  });

  uniforms.project_uModelMatrix = modelMatrix || IDENTITY_MATRIX;

  return uniforms;
}

export function getUniformKeys() {
  return [
    'project_uCoordinateOrigin',
    'project_uCenter',
    'project_uAntimeridian',
    'project_uViewportSize',
    'project_uDevicePixelRatio',
    'project_uFocalDistance',
    'project_uCommonUnitsPerMeter',
    'project_uCommonUnitsPerWorldUnit',
    'project_uCommonUnitsPerWorldUnit2',
    'project_uScale',
    'project_uViewProjectionMatrix',
    'project_metersPerPixel',
    'project_uModelMatrix'
  ];
}

export function getUniforms(opts: Partial<IOptions> = INITIAL_MODULE_OPTIONS) {
  if (opts.viewport) {
    return getUniformsFromViewport(opts);
  }
  return {};
}

export function highPrecisionLngLat(lngLat: number[], offset = 0, stride = 2) {
  let numElements = Math.ceil((lngLat.length - offset) / stride);
  let precisionData = new Float32Array(numElements * 2);
  for (let i = 0; i < numElements; ++i) {
    let lli = offset + i * stride;
    let pi = i * 2;

    precisionData[pi]     = lngLat[lli]     - Math.fround(lngLat[lli]);
    precisionData[pi + 1] = lngLat[lli + 1] - Math.fround(lngLat[lli + 1]);
  }

  return precisionData;
}

export function injectMercatorGLSL(vsSource: string): string {
  const versionMatch = vsSource.match(/#version \d+(\s+es)?\s*\n/);
  const versionLine = versionMatch ? versionMatch[0] : '';

  return vsSource.replace(versionLine, `${versionLine}\n${fp32shader}\n${projectShader}\n`);
}

export const fp32 = {
  name: 'fp32',
  vs: fp32shader,
  fs: null
};

export const project = {
  name: 'project',
  vs: projectShader,
  fs: null,
  inject: {},
  dependencies: [fp32],
  deprecations: [],
  getUniforms,
};

export {
  WebMercatorViewport
}
