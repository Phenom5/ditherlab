/**
 * DitherLab — Custom Dithering Shader
 *
 * This shader replaces smooth gradients with structured dithering patterns.
 * It works by:
 *   1. Computing diffuse lighting from a directional light
 *   2. Converting the brightness into a threshold value
 *   3. Comparing each pixel against a dithering pattern to decide on/off
 *   4. Mixing the base color with the dither result
 *
 * Supported dithering modes:
 *   0  — Ordered (Bayer 8x8 matrix)
 *   1  — Fine halftone (small dot grid)
 *   2  — Coarse halftone (large dot grid)
 *   3  — Noise-based (random per-pixel)
 *   4  — Crosshatch (angled lines)
 *   5  — Stipple (irregular dot pattern)
 *   6  — Scanline (horizontal lines)
 *   7  — Diamond (rotated grid)
 *   8  — Spiral (concentric rings)
 *   9  — Checkerboard (alternating squares)
 *  10  — ASCII (character-density simulation)
 */

export const vertexShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const fragmentShader = /* glsl */ `
  precision highp float;

  uniform vec3 baseColor;
  uniform vec3 lightDirection;
  uniform int ditherType;
  uniform float ditherScale;
  uniform float outlineStrength;
  uniform float opacity; // 0.0 = fully transparent, 1.0 = fully opaque

  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying vec2 vUv;

  // ---------------------------------------------------------------
  // Bayer 8x8 ordered dithering matrix — classic structured pattern
  // ---------------------------------------------------------------
  float bayerMatrix(vec2 coord) {
    int x = int(mod(coord.x, 8.0));
    int y = int(mod(coord.y, 8.0));
    int index = x + y * 8;
    float value = 0.0;

    if (index == 0) value = 0.0;
    else if (index == 1) value = 32.0;
    else if (index == 2) value = 8.0;
    else if (index == 3) value = 40.0;
    else if (index == 4) value = 2.0;
    else if (index == 5) value = 34.0;
    else if (index == 6) value = 10.0;
    else if (index == 7) value = 42.0;
    else if (index == 8) value = 48.0;
    else if (index == 9) value = 16.0;
    else if (index == 10) value = 56.0;
    else if (index == 11) value = 24.0;
    else if (index == 12) value = 50.0;
    else if (index == 13) value = 18.0;
    else if (index == 14) value = 58.0;
    else if (index == 15) value = 26.0;
    else if (index == 16) value = 12.0;
    else if (index == 17) value = 44.0;
    else if (index == 18) value = 4.0;
    else if (index == 19) value = 36.0;
    else if (index == 20) value = 14.0;
    else if (index == 21) value = 46.0;
    else if (index == 22) value = 6.0;
    else if (index == 23) value = 38.0;
    else if (index == 24) value = 60.0;
    else if (index == 25) value = 28.0;
    else if (index == 26) value = 52.0;
    else if (index == 27) value = 20.0;
    else if (index == 28) value = 62.0;
    else if (index == 29) value = 30.0;
    else if (index == 30) value = 54.0;
    else if (index == 31) value = 22.0;
    else if (index == 32) value = 3.0;
    else if (index == 33) value = 35.0;
    else if (index == 34) value = 11.0;
    else if (index == 35) value = 43.0;
    else if (index == 36) value = 1.0;
    else if (index == 37) value = 33.0;
    else if (index == 38) value = 9.0;
    else if (index == 39) value = 41.0;
    else if (index == 40) value = 51.0;
    else if (index == 41) value = 19.0;
    else if (index == 42) value = 59.0;
    else if (index == 43) value = 27.0;
    else if (index == 44) value = 49.0;
    else if (index == 45) value = 17.0;
    else if (index == 46) value = 57.0;
    else if (index == 47) value = 25.0;
    else if (index == 48) value = 15.0;
    else if (index == 49) value = 47.0;
    else if (index == 50) value = 7.0;
    else if (index == 51) value = 39.0;
    else if (index == 52) value = 13.0;
    else if (index == 53) value = 45.0;
    else if (index == 54) value = 5.0;
    else if (index == 55) value = 37.0;
    else if (index == 56) value = 63.0;
    else if (index == 57) value = 31.0;
    else if (index == 58) value = 55.0;
    else if (index == 59) value = 23.0;
    else if (index == 60) value = 61.0;
    else if (index == 61) value = 29.0;
    else if (index == 62) value = 53.0;
    else value = 21.0;

    return value / 64.0;
  }

  // ---------------------------------------------------------------
  // Halftone: circular dots in a grid — simulates print screening
  // ---------------------------------------------------------------
  float halftone(vec2 coord, float cellSize) {
    vec2 cell = mod(coord, vec2(cellSize));
    vec2 center = vec2(cellSize * 0.5);
    float dist = distance(cell, center) / (cellSize * 0.5);
    return dist;
  }

  // ---------------------------------------------------------------
  // Hash: pseudo-random value per pixel position
  // ---------------------------------------------------------------
  float hash(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  // ---------------------------------------------------------------
  // Crosshatch: two sets of diagonal lines at 45° and 135°
  // Creates a hand-drawn etching/engraving look
  // ---------------------------------------------------------------
  float crosshatch(vec2 coord) {
    float line1 = abs(mod(coord.x + coord.y, 4.0) - 2.0) / 2.0;
    float line2 = abs(mod(coord.x - coord.y, 4.0) - 2.0) / 2.0;
    return min(line1, line2);
  }

  // ---------------------------------------------------------------
  // Stipple: irregular dots using two offset hash layers
  // Mimics hand-stippled illustration
  // ---------------------------------------------------------------
  float stipple(vec2 coord) {
    float h1 = hash(floor(coord * 1.5));
    float h2 = hash(floor(coord * 1.5) + vec2(37.0, 91.0));
    return mix(h1, h2, 0.5);
  }

  // ---------------------------------------------------------------
  // Scanline: horizontal lines with alternating intensity
  // Retro CRT monitor / display effect
  // ---------------------------------------------------------------
  float scanline(vec2 coord) {
    return abs(mod(coord.y, 3.0) - 1.5) / 1.5;
  }

  // ---------------------------------------------------------------
  // Diamond: rotated 45° grid pattern
  // Creates an elegant woven/textile look
  // ---------------------------------------------------------------
  float diamond(vec2 coord) {
    vec2 c = mod(coord, vec2(6.0)) - vec2(3.0);
    return (abs(c.x) + abs(c.y)) / 3.0;
  }

  // ---------------------------------------------------------------
  // Spiral: concentric rings from screen center
  // Creates a radial wave/ripple effect
  // ---------------------------------------------------------------
  float spiral(vec2 coord, vec2 resolution) {
    vec2 center = resolution * 0.5;
    float dist = distance(coord * ditherScale, center);
    return abs(mod(dist, 8.0) - 4.0) / 4.0;
  }

  // ---------------------------------------------------------------
  // Checkerboard: alternating on/off squares
  // Classic retro/pixel art dithering
  // ---------------------------------------------------------------
  float checkerboard(vec2 coord) {
    float size = 2.0;
    float cx = step(0.5, mod(floor(coord.x / size), 2.0));
    float cy = step(0.5, mod(floor(coord.y / size), 2.0));
    return abs(cx - cy);
  }

  // ---------------------------------------------------------------
  // ASCII: simulates character-density rendering
  // Maps brightness to block density patterns resembling
  // the classic " .:-=+*#@" character ramp
  // ---------------------------------------------------------------
  float asciiDither(vec2 coord, float brightness) {
    // Each "character cell" is 6x8 pixels
    vec2 cellSize = vec2(6.0, 8.0);
    vec2 cellPos = mod(coord, cellSize);
    vec2 cellCenter = cellSize * 0.5;

    // Normalized position within cell [0,1]
    vec2 uvc = cellPos / cellSize;

    // Different density patterns based on brightness thresholds
    // Darkest → most filled, Brightest → empty
    float fill = 0.0;

    if (brightness < 0.15) {
      // '@' — nearly full block
      fill = 1.0;
    } else if (brightness < 0.25) {
      // '#' — dense cross pattern
      float h = step(0.3, uvc.x) * step(uvc.x, 0.7);
      float v = step(0.2, uvc.y) * step(uvc.y, 0.8);
      fill = max(h, v);
    } else if (brightness < 0.35) {
      // '*' — asterisk shape
      float center = 1.0 - smoothstep(0.0, 0.45, distance(uvc, vec2(0.5)));
      float hLine = step(0.4, uvc.y) * step(uvc.y, 0.6);
      fill = max(center, hLine);
    } else if (brightness < 0.5) {
      // '+' — cross
      float h = step(0.35, uvc.x) * step(uvc.x, 0.65) * step(0.15, uvc.y) * step(uvc.y, 0.85);
      float v = step(0.15, uvc.x) * step(uvc.x, 0.85) * step(0.35, uvc.y) * step(uvc.y, 0.65);
      fill = max(h, v);
    } else if (brightness < 0.65) {
      // '=' — double horizontal lines
      float l1 = step(0.15, uvc.x) * step(uvc.x, 0.85) * step(0.25, uvc.y) * step(uvc.y, 0.4);
      float l2 = step(0.15, uvc.x) * step(uvc.x, 0.85) * step(0.6, uvc.y) * step(uvc.y, 0.75);
      fill = max(l1, l2);
    } else if (brightness < 0.75) {
      // '-' — single horizontal line
      fill = step(0.15, uvc.x) * step(uvc.x, 0.85) * step(0.4, uvc.y) * step(uvc.y, 0.6);
    } else if (brightness < 0.85) {
      // ':' — two dots
      float d1 = 1.0 - smoothstep(0.0, 0.18, distance(uvc, vec2(0.5, 0.3)));
      float d2 = 1.0 - smoothstep(0.0, 0.18, distance(uvc, vec2(0.5, 0.7)));
      fill = max(d1, d2);
    } else if (brightness < 0.93) {
      // '.' — single small dot
      fill = 1.0 - smoothstep(0.0, 0.16, distance(uvc, vec2(0.5, 0.7)));
    }
    // else ' ' — empty, fill stays 0.0

    // Return: 0 means "ink here" (dark), 1 means "no ink" (light)
    // Invert so that bright areas return high threshold
    return 1.0 - fill;
  }

  void main() {
    // --- Lighting ---
    vec3 lightDir = normalize(lightDirection);
    vec3 normal = normalize(vNormal);

    float diffuse = dot(normal, lightDir);
    float brightness = clamp(diffuse * 0.5 + 0.5, 0.0, 1.0);

    // Fresnel-like rim for depth
    float rim = 1.0 - max(dot(normal, vec3(0.0, 0.0, 1.0)), 0.0);
    rim = pow(rim, 3.0) * 0.15;

    // --- Dithering ---
    vec2 screenCoord = gl_FragCoord.xy / ditherScale;
    float threshold = 0.5;

    if (ditherType == 0) {
      threshold = bayerMatrix(screenCoord);
    } else if (ditherType == 1) {
      threshold = halftone(screenCoord, 3.0);
    } else if (ditherType == 2) {
      threshold = halftone(screenCoord, 6.0);
    } else if (ditherType == 3) {
      threshold = hash(floor(screenCoord * 2.0));
    } else if (ditherType == 4) {
      threshold = crosshatch(screenCoord);
    } else if (ditherType == 5) {
      threshold = stipple(screenCoord);
    } else if (ditherType == 6) {
      threshold = scanline(screenCoord);
    } else if (ditherType == 7) {
      threshold = diamond(screenCoord);
    } else if (ditherType == 8) {
      threshold = spiral(screenCoord, vec2(800.0, 600.0));
    } else if (ditherType == 9) {
      threshold = checkerboard(screenCoord);
    } else if (ditherType == 10) {
      // ASCII mode: threshold depends on brightness directly
      threshold = asciiDither(gl_FragCoord.xy / ditherScale, brightness + rim);
    }

    float dither;
    if (ditherType == 10) {
      // ASCII: the function already mapped brightness → character fill
      dither = step(0.5, threshold);
    } else {
      dither = step(threshold, brightness + rim);
    }

    // Mix shadow and lit colors
    vec3 shadowColor = baseColor * 0.25;
    vec3 litColor = baseColor;
    vec3 color = mix(shadowColor, litColor, dither);

    // Subtle mid-tone for smoother appearance
    float midDither = step(threshold * 0.7, brightness);
    vec3 midColor = baseColor * 0.55;
    color = mix(color, midColor, (1.0 - dither) * midDither * 0.6);

    gl_FragColor = vec4(color, opacity);
  }
`;

/**
 * Maps dithering style names to shader uniform integer values.
 */
export function ditherTypeToInt(style: string): number {
  switch (style) {
    case 'ordered': return 0;
    case 'fine-halftone': return 1;
    case 'coarse-halftone': return 2;
    case 'noise': return 3;
    case 'crosshatch': return 4;
    case 'stipple': return 5;
    case 'scanline': return 6;
    case 'diamond': return 7;
    case 'spiral': return 8;
    case 'checkerboard': return 9;
    case 'ascii': return 10;
    default: return 0;
  }
}
