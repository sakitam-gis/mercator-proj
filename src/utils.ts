// @from https://github.com/visgl/luma.gl
const GL_VENDOR = 0x1f00;
const GL_RENDERER = 0x1f01;
const GL_VERSION = 0x1f02;
const GL_SHADING_LANGUAGE_VERSION = 0x8b8c;

type IGl = WebGLRenderingContext | WebGL2RenderingContext;
interface IDef {
  [key: string]: any;
}

// Precision prologue to inject before functions are injected in shader
// TODO - extract any existing prologue in the fragment source and move it up...
export const FRAGMENT_SHADER_PROLOGUE = `\
precision highp float;
`;

function identifyGPUVendor(vendor: string, renderer: string) {
  if (vendor.match(/NVIDIA/i) || renderer.match(/NVIDIA/i)) {
    return 'NVIDIA';
  }

  if (vendor.match(/INTEL/i) || renderer.match(/INTEL/i)) {
    return 'INTEL';
  }

  if (vendor.match(/AMD/i) || renderer.match(/AMD/i) || vendor.match(/ATI/i) || renderer.match(/ATI/i)) {
    return 'AMD';
  }

  return 'UNKNOWN GPU';
}

function getContextInfo(gl: IGl) {
  const info = gl.getExtension('WEBGL_debug_renderer_info');
  const vendor = gl.getParameter((info?.UNMASKED_VENDOR_WEBGL) || GL_VENDOR);
  const renderer = gl.getParameter((info?.UNMASKED_RENDERER_WEBGL) || GL_RENDERER);
  const gpuVendor = identifyGPUVendor(vendor, renderer);
  return {
    gpuVendor: gpuVendor,
    vendor: vendor,
    renderer: renderer,
    version: gl.getParameter(GL_VERSION),
    shadingLanguageVersion: gl.getParameter(GL_SHADING_LANGUAGE_VERSION)
  };
}

export function getPlatformShaderDefines(gl: IGl) {
  const debugInfo = getContextInfo(gl);

  switch (debugInfo.gpuVendor.toLowerCase()) {
    case 'nvidia':
      return '#define NVIDIA_GPU\n// Nvidia optimizes away the calculation necessary for emulated fp64\n#define LUMA_FP64_CODE_ELIMINATION_WORKAROUND 1\n';

    case 'intel':
      return '#define INTEL_GPU\n// Intel optimizes away the calculation necessary for emulated fp64\n#define LUMA_FP64_CODE_ELIMINATION_WORKAROUND 1\n// Intel\'s built-in \'tan\' function doesn\'t have acceptable precision\n#define LUMA_FP32_TAN_PRECISION_WORKAROUND 1\n// Intel GPU doesn\'t have full 32 bits precision in same cases, causes overflow\n#define LUMA_FP64_HIGH_BITS_OVERFLOW_WORKAROUND 1\n';

    case 'amd':
      return '#define AMD_GPU\n';

    default:
      return '#define DEFAULT_GPU\n// Prevent driver from optimizing away the calculation necessary for emulated fp64\n#define LUMA_FP64_CODE_ELIMINATION_WORKAROUND 1\n// Intel\'s built-in \'tan\' function doesn\'t have acceptable precision\n#define LUMA_FP32_TAN_PRECISION_WORKAROUND 1\n// Intel GPU doesn\'t have full 32 bits precision in same cases, causes overflow\n#define LUMA_FP64_HIGH_BITS_OVERFLOW_WORKAROUND 1\n';
  }
}

export function getApplicationDefines(defines: IDef = {}) {
  let count = 0;
  let sourceText = '';
  // eslint-disable-next-line guard-for-in
  for (const define in defines) {
    if (count === 0) {
      sourceText += '\n// APPLICATION DEFINES\n';
    }
    count++;

    const value = defines[define];
    if (value || Number.isFinite(value)) {
      sourceText += `#define ${define.toUpperCase()} ${defines[define]}\n`;
    }
  }
  if (count === 0) {
    sourceText += '\n';
  }
  return sourceText;
}
