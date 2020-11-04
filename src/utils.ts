export function zoomToScale(zoom: number) {
  return 2 ** zoom;
}

export function scaleToZoom(scale: number) {
  return Math.log2(scale);
}
