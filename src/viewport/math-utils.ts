// @ts-ignore
import * as vec4 from 'gl-matrix/vec4';

export interface FrustumPlane {
  distance: number;
  normal: number[];
}

function lengthSquared(arr: number[]) {
  let length = 0;
  // eslint-disable-next-line @typescript-eslint/prefer-for-of
  for (let i = 0; i < arr.length; ++i) {
    length += arr[i] * arr[i];
  }
  return length;
}

// eslint-disable-next-line max-params
function getFrustumPlane(a: number, b: number, c: number, d: number): FrustumPlane {
  const scratchVector = [a, b, c];
  const L = Math.sqrt(lengthSquared(scratchVector));
  return {
    distance: d / L,
    normal: [-a / L, -b / L, -c / L]
  };
}

// Helper, avoids low-precision 32 bit matrices from gl-matrix mat4.create()
export function createMat4(): number[] {
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
}

export function mod(value: number, divisor: number): number {
  const modulus = value % divisor;
  return modulus < 0 ? divisor + modulus : modulus;
}

export function getCameraPosition(viewMatrixInverse: number[] | Float32Array | Float64Array) {
  // Read the translation from the inverse view matrix
  return [viewMatrixInverse[12], viewMatrixInverse[13], viewMatrixInverse[14]];
}

export interface FrustumPlanesInterface {
  left: FrustumPlane;
  right: FrustumPlane;
  bottom: FrustumPlane;
  top: FrustumPlane;
  near: FrustumPlane;
  far: FrustumPlane;
}

// https://www.gamedevs.org/uploads/fast-extraction-viewing-frustum-planes-from-world-view-projection-matrix.pdf
export function getFrustumPlanes(viewProjectionMatrix: number[] | Float32Array | Float64Array) {
  // @ts-ignore
  const planes: FrustumPlanesInterface = {};

  planes.left = getFrustumPlane(
    viewProjectionMatrix[3] + viewProjectionMatrix[0],
    viewProjectionMatrix[7] + viewProjectionMatrix[4],
    viewProjectionMatrix[11] + viewProjectionMatrix[8],
    viewProjectionMatrix[15] + viewProjectionMatrix[12]
  );
  planes.right = getFrustumPlane(
    viewProjectionMatrix[3] - viewProjectionMatrix[0],
    viewProjectionMatrix[7] - viewProjectionMatrix[4],
    viewProjectionMatrix[11] - viewProjectionMatrix[8],
    viewProjectionMatrix[15] - viewProjectionMatrix[12]
  );
  planes.bottom = getFrustumPlane(
    viewProjectionMatrix[3] + viewProjectionMatrix[1],
    viewProjectionMatrix[7] + viewProjectionMatrix[5],
    viewProjectionMatrix[11] + viewProjectionMatrix[9],
    viewProjectionMatrix[15] + viewProjectionMatrix[13]
  );
  planes.top = getFrustumPlane(
    viewProjectionMatrix[3] - viewProjectionMatrix[1],
    viewProjectionMatrix[7] - viewProjectionMatrix[5],
    viewProjectionMatrix[11] - viewProjectionMatrix[9],
    viewProjectionMatrix[15] - viewProjectionMatrix[13]
  );
  planes.near = getFrustumPlane(
    viewProjectionMatrix[3] + viewProjectionMatrix[2],
    viewProjectionMatrix[7] + viewProjectionMatrix[6],
    viewProjectionMatrix[11] + viewProjectionMatrix[10],
    viewProjectionMatrix[15] + viewProjectionMatrix[14]
  );
  planes.far = getFrustumPlane(
    viewProjectionMatrix[3] - viewProjectionMatrix[2],
    viewProjectionMatrix[7] - viewProjectionMatrix[6],
    viewProjectionMatrix[11] - viewProjectionMatrix[10],
    viewProjectionMatrix[15] - viewProjectionMatrix[14]
  );

  return planes;
}

export function transformVector(matrix: number[], vector: number[]) {
  const result = vec4.transformMat4([], vector, matrix);
  vec4.scale(result, result, 1 / result[3]);
  return result;
}
