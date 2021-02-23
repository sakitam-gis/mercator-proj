export function isArray(value: any) {
  return Array.isArray(value) || (ArrayBuffer.isView(value) && !(value instanceof DataView));
}

let EPSILON = 1e-12;

export function equals(a: number[] | Float32Array | number, b: number[] | Float32Array | number, epsilon?: number) {
  const oldEpsilon = EPSILON;
  if (epsilon) {
    EPSILON = epsilon;
  }
  try {
    if (a === b) {
      return true;
    }
    if (isArray(a) && isArray(b) && typeof a !== 'number' && typeof b !== 'number') {
      if (a?.length !== b?.length) {
        return false;
      }
      for (let i = 0; i < a.length; ++i) {
        // eslint-disable-next-line max-depth
        if (!equals(a[i], b[i])) {
          return false;
        }
      }
      return true;
    }

    if (typeof a === 'number' && typeof b === 'number' && Number.isFinite(a) && Number.isFinite(b)) {
      return Math.abs(a - b) <= EPSILON * Math.max(1.0, Math.abs(a), Math.abs(b));
    }
    return false;
  } finally {
    EPSILON = oldEpsilon;
  }
}
