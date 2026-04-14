/**
 * DitherLab — Custom Dithering Shader
 *
 * This shader replaces smooth gradients with structured dithering patterns.
 * It works by:
 *   1. Computing diffuse lighting from a directional light
 *   2. Converting the brightness into a threshold value
 *   3. Comparing each pixel against a dithering pattern (Bayer matrix,
 *      halftone dots, or noise) to decide if the pixel is "on" or "off"
 *   4. Mixing the base color with the dither result
 */

export const vertexShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    // Transform normal to world space for lighting calculations
    vNormal = normalize(normalMatrix * normal);
    // World position used for shadow/grid calculations
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const fragmentShader = /* glsl */ `
  precision highp float;

  uniform vec3 baseColor;
  uniform vec3 lightDirection;
  uniform int ditherType;    // 0=ordered, 1=fine halftone, 2=coarse halftone, 3=noise
  uniform float ditherScale;
  uniform float outlineStrength; // 0.0 = no outlines, 1.0 = full outlines

  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying vec2 vUv;

  // ---------------------------------------------------------------
  // Bayer 8x8 dithering matrix (classic ordered dithering)
  // Values are normalized to [0, 1]. Each pixel's brightness is
  // compared against its corresponding matrix entry to decide on/off.
  // ---------------------------------------------------------------
  float bayerMatrix(vec2 coord) {
    // 8x8 Bayer matrix threshold lookup
    int x = int(mod(coord.x, 8.0));
    int y = int(mod(coord.y, 8.0));

    // Flattened 8x8 Bayer matrix
    int index = x + y * 8;
    float value = 0.0;

    // Row 0
    if (index == 0) value = 0.0;
    else if (index == 1) value = 32.0;
    else if (index == 2) value = 8.0;
    else if (index == 3) value = 40.0;
    else if (index == 4) value = 2.0;
    else if (index == 5) value = 34.0;
    else if (index == 6) value = 10.0;
    else if (index == 7) value = 42.0;
    // Row 1
    else if (index == 8) value = 48.0;
    else if (index == 9) value = 16.0;
    else if (index == 10) value = 56.0;
    else if (index == 11) value = 24.0;
    else if (index == 12) value = 50.0;
    else if (index == 13) value = 18.0;
    else if (index == 14) value = 58.0;
    else if (index == 15) value = 26.0;
    // Row 2
    else if (index == 16) value = 12.0;
    else if (index == 17) value = 44.0;
    else if (index == 18) value = 4.0;
    else if (index == 19) value = 36.0;
    else if (index == 20) value = 14.0;
    else if (index == 21) value = 46.0;
    else if (index == 22) value = 6.0;
    else if (index == 23) value = 38.0;
    // Row 3
    else if (index == 24) value = 60.0;
    else if (index == 25) value = 28.0;
    else if (index == 26) value = 52.0;
    else if (index == 27) value = 20.0;
    else if (index == 28) value = 62.0;
    else if (index == 29) value = 30.0;
    else if (index == 30) value = 54.0;
    else if (index == 31) value = 22.0;
    // Row 4
    else if (index == 32) value = 3.0;
    else if (index == 33) value = 35.0;
    else if (index == 34) value = 11.0;
    else if (index == 35) value = 43.0;
    else if (index == 36) value = 1.0;
    else if (index == 37) value = 33.0;
    else if (index == 38) value = 9.0;
    else if (index == 39) value = 41.0;
    // Row 5
    else if (index == 40) value = 51.0;
    else if (index == 41) value = 19.0;
    else if (index == 42) value = 59.0;
    else if (index == 43) value = 27.0;
    else if (index == 44) value = 49.0;
    else if (index == 45) value = 17.0;
    else if (index == 46) value = 57.0;
    else if (index == 47) value = 25.0;
    // Row 6
    else if (index == 48) value = 15.0;
    else if (index == 49) value = 47.0;
    else if (index == 50) value = 7.0;
    else if (index == 51) value = 39.0;
    else if (index == 52) value = 13.0;
    else if (index == 53) value = 45.0;
    else if (index == 54) value = 5.0;
    else if (index == 55) value = 37.0;
    // Row 7
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
  // Halftone pattern: simulates traditional print halftone dots
  // by using distance-from-center of each cell to create circles.
  // ---------------------------------------------------------------
  float halftone(vec2 coord, float cellSize) {
    vec2 cell = mod(coord, vec2(cellSize));
    vec2 center = vec2(cellSize * 0.5);
    float dist = distance(cell, center) / (cellSize * 0.5);
    return dist;
  }

  // ---------------------------------------------------------------
  // Pseudo-random hash for noise-based dithering.
  // Gives a different random value per pixel for organic look.
  // ---------------------------------------------------------------
  float hash(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  void main() {
    // --- Lighting ---
    // Normalize light direction and surface normal
    vec3 lightDir = normalize(lightDirection);
    vec3 normal = normalize(vNormal);

    // Lambertian diffuse: dot(N, L) clamped to [0,1]
    float diffuse = dot(normal, lightDir);
    // Add ambient so shadows aren't pure black
    float brightness = clamp(diffuse * 0.5 + 0.5, 0.0, 1.0);

    // Add slight Fresnel-like rim for depth
    float rim = 1.0 - max(dot(normal, vec3(0.0, 0.0, 1.0)), 0.0);
    rim = pow(rim, 3.0) * 0.15;

    // --- Dithering ---
    // Work in screen-space pixel coordinates for consistent pattern size
    vec2 screenCoord = gl_FragCoord.xy / ditherScale;

    float threshold = 0.5;

    if (ditherType == 0) {
      // Ordered dithering: structured Bayer matrix pattern
      threshold = bayerMatrix(screenCoord);
    } else if (ditherType == 1) {
      // Fine halftone: small dots
      threshold = halftone(screenCoord, 3.0);
    } else if (ditherType == 2) {
      // Coarse halftone: large dots
      threshold = halftone(screenCoord, 6.0);
    } else {
      // Noise-based: random per-pixel threshold
      threshold = hash(floor(screenCoord * 2.0));
    }

    // Compare brightness against threshold to get binary dither
    // brightness > threshold → lit pixel, else → shadow pixel
    float dither = step(threshold, brightness + rim);

    // Mix between shadow color (darkened base) and lit color (base)
    vec3 shadowColor = baseColor * 0.25;
    vec3 litColor = baseColor;
    vec3 color = mix(shadowColor, litColor, dither);

    // Optional: add a subtle mid-tone for smoother appearance
    float midDither = step(threshold * 0.7, brightness);
    vec3 midColor = baseColor * 0.55;
    color = mix(color, midColor, (1.0 - dither) * midDither * 0.6);

    gl_FragColor = vec4(color, 1.0);
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
    default: return 0;
  }
}
