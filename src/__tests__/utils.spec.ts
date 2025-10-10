import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FRAGMENT_SHADER_PROLOGUE, getPlatformShaderDefines, getApplicationDefines } from '../utils';

describe('utils', () => {
  describe('FRAGMENT_SHADER_PROLOGUE', () => {
    it('should return correct precision directive', () => {
      expect(FRAGMENT_SHADER_PROLOGUE).toBe('precision highp float;\n');
    });
  });

  describe('getPlatformShaderDefines', () => {
    let mockGL: any;

    beforeEach(() => {
      mockGL = {
        getExtension: vi.fn(),
        getParameter: vi.fn()
      };
    });

    it('should return NVIDIA defines for NVIDIA GPU', () => {
      mockGL.getExtension.mockReturnValue({
        UNMASKED_VENDOR_WEBGL: 0x9245,
        UNMASKED_RENDERER_WEBGL: 0x9246
      });
      mockGL.getParameter
        .mockReturnValueOnce('NVIDIA Corporation')
        .mockReturnValueOnce('NVIDIA GeForce RTX 3080')
        .mockReturnValueOnce('WebGL 2.0')
        .mockReturnValueOnce('WebGL GLSL ES 3.00');

      const result = getPlatformShaderDefines(mockGL);

      expect(result).toContain('#define NVIDIA_GPU');
      expect(result).toContain('#define LUMA_FP64_CODE_ELIMINATION_WORKAROUND 1');
    });

    it('should return INTEL defines for INTEL GPU', () => {
      mockGL.getExtension.mockReturnValue({
        UNMASKED_VENDOR_WEBGL: 0x9245,
        UNMASKED_RENDERER_WEBGL: 0x9246
      });
      mockGL.getParameter
        .mockReturnValueOnce('Intel Inc.')
        .mockReturnValueOnce('Intel(R) HD Graphics 630')
        .mockReturnValueOnce('WebGL 2.0')
        .mockReturnValueOnce('WebGL GLSL ES 3.00');

      const result = getPlatformShaderDefines(mockGL);

      expect(result).toContain('#define INTEL_GPU');
      expect(result).toContain('#define LUMA_FP64_CODE_ELIMINATION_WORKAROUND 1');
      expect(result).toContain('#define LUMA_FP32_TAN_PRECISION_WORKAROUND 1');
      expect(result).toContain('#define LUMA_FP64_HIGH_BITS_OVERFLOW_WORKAROUND 1');
    });

    it('should return AMD defines for AMD GPU', () => {
      mockGL.getExtension.mockReturnValue({
        UNMASKED_VENDOR_WEBGL: 0x9245,
        UNMASKED_RENDERER_WEBGL: 0x9246
      });
      mockGL.getParameter
        .mockReturnValueOnce('Advanced Micro Devices, Inc.')
        .mockReturnValueOnce('AMD Radeon RX 6800 XT')
        .mockReturnValueOnce('WebGL 2.0')
        .mockReturnValueOnce('WebGL GLSL ES 3.00');

      const result = getPlatformShaderDefines(mockGL);

      expect(result).toContain('#define AMD_GPU');
    });

    it('should return DEFAULT defines for unknown GPU', () => {
      mockGL.getExtension.mockReturnValue(null);
      mockGL.getParameter
        .mockReturnValueOnce('Unknown Vendor')
        .mockReturnValueOnce('Unknown Renderer')
        .mockReturnValueOnce('WebGL 2.0')
        .mockReturnValueOnce('WebGL GLSL ES 3.00');

      const result = getPlatformShaderDefines(mockGL);

      expect(result).toContain('#define DEFAULT_GPU');
      expect(result).toContain('#define LUMA_FP64_CODE_ELIMINATION_WORKAROUND 1');
      expect(result).toContain('#define LUMA_FP32_TAN_PRECISION_WORKAROUND 1');
      expect(result).toContain('#define LUMA_FP64_HIGH_BITS_OVERFLOW_WORKAROUND 1');
    });

    it('should handle case insensitive GPU detection', () => {
      mockGL.getExtension.mockReturnValue({
        UNMASKED_VENDOR_WEBGL: 0x9245,
        UNMASKED_RENDERER_WEBGL: 0x9246
      });
      mockGL.getParameter
        .mockReturnValueOnce('nvidia corporation')
        .mockReturnValueOnce('geforce rtx 3080')
        .mockReturnValueOnce('WebGL 2.0')
        .mockReturnValueOnce('WebGL GLSL ES 3.00');

      const result = getPlatformShaderDefines(mockGL);

      expect(result).toContain('#define NVIDIA_GPU');
    });
  });

  describe('getApplicationDefines', () => {
    it('should return empty defines for empty object', () => {
      const result = getApplicationDefines({});
      expect(result).toBe('\n');
    });

    it('should generate defines for truthy values', () => {
      const defines = {
        enableFeature: true,
        maxLights: 8,
        useHighPrecision: false
      };

      const result = getApplicationDefines(defines);

      expect(result).toContain('// APPLICATION DEFINES');
      expect(result).toContain('#define ENABLEFEATURE true');
      expect(result).toContain('#define MAXLIGHTS 8');
      expect(result).not.toContain('USEHIGHPRECISION');
    });

    it('should handle numeric zero as valid value', () => {
      const defines = {
        zeroValue: 0,
        falseValue: false,
        undefinedValue: undefined
      };

      const result = getApplicationDefines(defines);

      expect(result).toContain('#define ZEROVALUE 0');
      expect(result).not.toContain('FALSEVALUE');
      expect(result).not.toContain('UNDEFINEDVALUE');
    });

    it('should handle finite numbers correctly', () => {
      const defines = {
        infinity: Infinity,
        negativeInfinity: -Infinity,
        nan: NaN,
        finiteNumber: 42
      };

      const result = getApplicationDefines(defines);

      expect(result).toContain('#define FINITENUMBER 42');
      expect(result).not.toContain('INFINITY');
      expect(result).not.toContain('NEGATIVEINFINITY');
      expect(result).not.toContain('NAN');
    });

    it('should convert keys to uppercase', () => {
      const defines = {
        camelCase: true,
        snake_case: true,
        'kebab-case': true
      };

      const result = getApplicationDefines(defines);

      expect(result).toContain('#define CAMELCASE true');
      expect(result).toContain('#define SNAKE_CASE true');
      expect(result).toContain('#define KEBAB-CASE true');
    });
  });
});
