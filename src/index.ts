import WebMercatorViewport, {
  PROJECTION_MODE,
  COORDINATE_SYSTEM,
} from './viewport/viewport';
import { getPlatformShaderDefines, getApplicationDefines, FRAGMENT_SHADER_PROLOGUE } from './utils';
import projectShader from './project.glsl';
import fp32shader from './fp32.glsl';
import { createMat4 } from './viewport/math-utils';

export type vec4 = [number, number, number, number] | Float32Array | number[];
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
  coordinateSystem: COORDINATE_SYSTEM;
  coordinateOrigin?: number[];
  autoWrapLongitude?: boolean;
}

// To quickly set a vector to zero
const ZERO_VECTOR: [number, number, number, number] | Float32Array = [0, 0, 0, 0];
const VECTOR_TO_POINT_MATRIX = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0];
const IDENTITY_MATRIX = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
const DEFAULT_COORDINATE_ORIGIN = [0, 0, 0];
const DEFAULT_PIXELS_PER_UNIT2: number[] | undefined = [0, 0, 0];

const INITIAL_MODULE_OPTIONS = {
  // @ts-ignore
  devicePixelRatio: (window.devicePixelRatio || (window.screen?.deviceXDPI / window.screen?.logicalXDPI) || 1),
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

/**
 * Inverts a mat4
 * @param out
 * @param a
 */
export function invert(out: vec4, a: vec4) {
  let a00 = a[0];
  let a01 = a[1];
  let a02 = a[2];
  let a03 = a[3];
  let a10 = a[4];
  let a11 = a[5];
  let a12 = a[6];
  let a13 = a[7];
  let a20 = a[8];
  let a21 = a[9];
  let a22 = a[10];
  let a23 = a[11];
  let a30 = a[12];
  let a31 = a[13];
  let a32 = a[14];
  let a33 = a[15];

  let b00 = a00 * a11 - a01 * a10;
  let b01 = a00 * a12 - a02 * a10;
  let b02 = a00 * a13 - a03 * a10;
  let b03 = a01 * a12 - a02 * a11;
  let b04 = a01 * a13 - a03 * a11;
  let b05 = a02 * a13 - a03 * a12;
  let b06 = a20 * a31 - a21 * a30;
  let b07 = a20 * a32 - a22 * a30;
  let b08 = a20 * a33 - a23 * a30;
  let b09 = a21 * a32 - a22 * a31;
  let b10 = a21 * a33 - a23 * a31;
  let b11 = a22 * a33 - a23 * a32;

  // Calculate the determinant
  let det =
    b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

  if (!det) {
    return null;
  }
  det = 1.0 / det;

  out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
  out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
  out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
  out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
  out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
  out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
  out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
  out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
  out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
  out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
  out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
  out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
  out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
  out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
  out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
  out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

  return out;
}

const getMemoizedViewportUniforms = memoize(calculateViewportUniforms);

export function getOffsetOrigin(
  viewport: WebMercatorViewport,
  coordinateSystem: COORDINATE_SYSTEM,
  coordinateOrigin = DEFAULT_COORDINATE_ORIGIN
) {
  let shaderCoordinateOrigin = coordinateOrigin;
  let geospatialOrigin;
  let offsetMode = true;

  if (
    coordinateSystem === COORDINATE_SYSTEM.LNGLAT_OFFSETS ||
    coordinateSystem === COORDINATE_SYSTEM.METER_OFFSETS
  ) {
    geospatialOrigin = coordinateOrigin;
  } else {
    geospatialOrigin = viewport.isGeospatial
      ? [Math.fround(viewport.longitude), Math.fround(viewport.latitude), 0]
      : null;
  }

  switch (viewport.projectionMode) {
    case PROJECTION_MODE.WEB_MERCATOR:
      if (
        coordinateSystem === COORDINATE_SYSTEM.LNGLAT ||
        coordinateSystem === COORDINATE_SYSTEM.CARTESIAN
      ) {
        offsetMode = false;
      }
      break;

    case PROJECTION_MODE.WEB_MERCATOR_AUTO_OFFSET:
      if (coordinateSystem === COORDINATE_SYSTEM.LNGLAT) {
        // viewport center in world space
        shaderCoordinateOrigin = geospatialOrigin as number[];
      } else if (coordinateSystem === COORDINATE_SYSTEM.CARTESIAN) {
        // viewport center in common space
        shaderCoordinateOrigin = [
          Math.fround(viewport.center[0]),
          Math.fround(viewport.center[1]),
          0
        ];
        // Geospatial origin (wgs84) must match shaderCoordinateOrigin (common)
        geospatialOrigin = viewport.unprojectPosition(shaderCoordinateOrigin);
        shaderCoordinateOrigin[0] -= coordinateOrigin[0];
        shaderCoordinateOrigin[1] -= coordinateOrigin[1];
        shaderCoordinateOrigin[2] -= coordinateOrigin[2];
      }
      break;

    case PROJECTION_MODE.IDENTITY:
      shaderCoordinateOrigin = viewport.position.map(Math.fround);
      break;

    default:
      // Unknown projection mode
      offsetMode = false;
  }

  shaderCoordinateOrigin[2] = shaderCoordinateOrigin[2] || 0;

  return {geospatialOrigin, shaderCoordinateOrigin, offsetMode};
}

function calculateMatrixAndOffset(viewport: WebMercatorViewport, coordinateSystem: COORDINATE_SYSTEM, coordinateOrigin?: number[]) {
  const { viewMatrixUncentered, projectionMatrix } = viewport;
  // eslint-disable-next-line prefer-const
  let {viewMatrix, viewProjectionMatrix} = viewport;

  let projectionCenter = ZERO_VECTOR;
  let cameraPosCommon = viewport.cameraPosition;
  const {geospatialOrigin, shaderCoordinateOrigin, offsetMode} = getOffsetOrigin(
    viewport,
    coordinateSystem,
    coordinateOrigin
  );

  if (offsetMode) {
    // Calculate transformed projectionCenter (using 64 bit precision JS)
    // This is the key to offset mode precision
    // (avoids doing this addition in 32 bit precision in GLSL)
    // @ts-ignore
    const positionCommonSpace = viewport?.projectPosition(
      geospatialOrigin || shaderCoordinateOrigin
    );

    cameraPosCommon = [
      cameraPosCommon[0] - positionCommonSpace[0],
      cameraPosCommon[1] - positionCommonSpace[1],
      cameraPosCommon[2] - positionCommonSpace[2]
    ];

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
    viewProjectionMatrix = multiply(createMat4(), projectionMatrix, viewMatrix);
    // @ts-ignore
    viewProjectionMatrix = multiply(createMat4(), viewProjectionMatrix, VECTOR_TO_POINT_MATRIX);
  }

  return {
    viewMatrix,
    viewProjectionMatrix,
    projectionCenter,
    geospatialOrigin,
    shaderCoordinateOrigin,
    cameraPosCommon,
  };
}

function calculateViewportUniforms(options: IOptions) {
  const {
    viewport,
    devicePixelRatio,
    coordinateSystem,
    coordinateOrigin,
  } = options;

  const {
    projectionCenter,
    viewProjectionMatrix,
    shaderCoordinateOrigin,
    geospatialOrigin,
    cameraPosCommon,
  } = calculateMatrixAndOffset(viewport, coordinateSystem, coordinateOrigin);

  // Calculate projection pixels per unit
  const { distanceScales } = viewport;

  const viewportSize = [viewport.width * devicePixelRatio, viewport.height * devicePixelRatio];

  const uniforms = {
    project_uCoordinateSystem: coordinateSystem,
    project_uProjectionMode: viewport.projectionMode,

    project_uCoordinateOrigin: shaderCoordinateOrigin,
    project_uCenter: projectionCenter,
    project_uAntimeridian: (viewport.longitude || 0) - 180,

    // Screen size
    project_uViewportSize: viewportSize,
    project_uDevicePixelRatio: devicePixelRatio,

    // Distance at which screen pixels are projected
    // @ts-ignore
    project_uFocalDistance: viewport.focalDistance || 1,
    project_uCommonUnitsPerMeter: distanceScales.unitsPerMeter,

    project_uCommonUnitsPerWorldUnit: distanceScales.unitsPerMeter,
    project_uCommonUnitsPerWorldUnit2: DEFAULT_PIXELS_PER_UNIT2,

    project_uScale: viewport.scale, // This is the mercator scale (2 ** zoom)
    project_uViewProjectionMatrix: viewProjectionMatrix,
    project_uInverseViewProjectionMatrix: invert(createMat4(), viewProjectionMatrix as unknown as Float32Array),
    // @ts-ignore
    project_metersPerPixel: distanceScales.metersPerUnit[2] / viewport.scale,

    project_uCameraPosition: cameraPosCommon
  };

  if (geospatialOrigin) {
    const distanceScalesAtOrigin = viewport.getDistanceScales(geospatialOrigin);
    if (distanceScalesAtOrigin) {
      switch (coordinateSystem) {
        case COORDINATE_SYSTEM.METER_OFFSETS:
          uniforms.project_uCommonUnitsPerWorldUnit = distanceScalesAtOrigin.unitsPerMeter;
          uniforms.project_uCommonUnitsPerWorldUnit2 = distanceScalesAtOrigin.unitsPerMeter2;
          break;

        case COORDINATE_SYSTEM.LNGLAT:
        case COORDINATE_SYSTEM.LNGLAT_OFFSETS:
          uniforms.project_uCommonUnitsPerWorldUnit = distanceScalesAtOrigin.unitsPerDegree;
          uniforms.project_uCommonUnitsPerWorldUnit2 = distanceScalesAtOrigin.unitsPerDegree2;
          break;

        // a.k.a "preprojected" positions
        case COORDINATE_SYSTEM.CARTESIAN:
          uniforms.project_uCommonUnitsPerWorldUnit = [1, 1, distanceScalesAtOrigin.unitsPerMeter[2]];
          uniforms.project_uCommonUnitsPerWorldUnit2 = [
            0,
            0,
            // @ts-ignore
            distanceScalesAtOrigin.unitsPerMeter2[2]
          ];
          break;

        default:
          break;
      }
    }
  }

  return uniforms;
}

/**
 * Returns uniforms for shaders based on current projection
 * includes: projection matrix suitable for shaders
 * @param viewport
 * @param devicePixelRatio
 * @param modelMatrix
 * @param coordinateSystem
 * @param coordinateOrigin
 * @param autoWrapLongitude
 * @return {Float32Array} - 4x4 projection matrix that can be used in shaders
 */
export function getUniformsFromViewport({
  viewport,
  devicePixelRatio = INITIAL_MODULE_OPTIONS.devicePixelRatio,
  modelMatrix = null,

  coordinateSystem = COORDINATE_SYSTEM.DEFAULT,
  coordinateOrigin,

  autoWrapLongitude = false,
}: IOptions) {
  if (coordinateSystem === COORDINATE_SYSTEM.DEFAULT) {
    coordinateSystem = viewport.isGeospatial
      ? COORDINATE_SYSTEM.LNGLAT
      : COORDINATE_SYSTEM.CARTESIAN;
  }

  const uniforms = getMemoizedViewportUniforms({
    viewport,
    devicePixelRatio,
    coordinateSystem,
    coordinateOrigin
  });

  uniforms.project_uWrapLongitude = autoWrapLongitude;
  uniforms.project_uModelMatrix = modelMatrix || IDENTITY_MATRIX;

  return uniforms;
}

export type MercatorUniformKeys = [
  'project_uCoordinateSystem',
  'project_uProjectionMode',
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

export function getUniformKeys(): MercatorUniformKeys {
  return [
    'project_uCoordinateSystem',
    'project_uProjectionMode',
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

export function getUniforms(opts: IOptions) {
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

export function injectMercatorGLSL(gl: WebGLRenderingContext | WebGL2RenderingContext, source: string, defines = {
  PROJECT_OFFSET_THRESHOLD: '4096.0'
}): string {
  const versionMatch = source.match(/#version \d+(\s+es)?\s*\n/);
  const versionLine = versionMatch ? versionMatch[0] : '';

  return `\
${versionLine}
${getPlatformShaderDefines(gl)}
${getApplicationDefines(defines)}
${FRAGMENT_SHADER_PROLOGUE}
${fp32shader}
${projectShader}
${source.replace(versionLine, '')}
`;
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
};
