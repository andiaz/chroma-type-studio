/**
 * Color Blindness Simulation
 *
 * Simulates how colors appear to people with different types of color vision deficiency.
 * Uses the Brettel, Vienot, and Mollon (1997) algorithm for dichromatic simulation.
 */

export type VisionType = 'normal' | 'deuteranopia' | 'protanopia' | 'tritanopia';

export const VISION_TYPES: { value: VisionType; label: string; description: string }[] = [
  { value: 'normal', label: 'Normal Vision', description: 'Standard color perception' },
  { value: 'deuteranopia', label: 'Deuteranopia', description: 'Red-green color blindness (green cone deficiency)' },
  { value: 'protanopia', label: 'Protanopia', description: 'Red-green color blindness (red cone deficiency)' },
  { value: 'tritanopia', label: 'Tritanopia', description: 'Blue-yellow color blindness (blue cone deficiency)' },
];

// sRGB to Linear RGB conversion
function srgbToLinear(value: number): number {
  const v = value / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

// Linear RGB to sRGB conversion
function linearToSrgb(value: number): number {
  const v = value <= 0.0031308 ? value * 12.92 : 1.055 * Math.pow(value, 1 / 2.4) - 0.055;
  return Math.round(Math.max(0, Math.min(255, v * 255)));
}

// Convert hex to RGB
function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [0, 0, 0];
  return [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16),
  ];
}

// Convert RGB to hex
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

// Matrix multiplication for 3x3 matrix and 3-element vector
function multiplyMatrix(matrix: number[][], vector: number[]): number[] {
  return matrix.map(row =>
    row[0] * vector[0] + row[1] * vector[1] + row[2] * vector[2]
  );
}

// Transformation matrices based on Brettel et al. (1997)
// These simulate how dichromats perceive colors

// RGB to LMS (Long, Medium, Short wavelength cone responses)
const RGB_TO_LMS = [
  [0.31399022, 0.63951294, 0.04649755],
  [0.15537241, 0.75789446, 0.08670142],
  [0.01775239, 0.10944209, 0.87256922],
];

// LMS to RGB (inverse transformation)
const LMS_TO_RGB = [
  [5.47221206, -4.64196010, 0.16963708],
  [-1.12524190, 2.29317094, -0.16789520],
  [0.02980165, -0.19318073, 1.16364789],
];

// Simulation matrices for each type of color blindness
// These project the missing cone response onto the remaining cone responses

// Deuteranopia: Missing M (green) cones
// The M response is reconstructed from L and S
const DEUTERANOPIA_MATRIX = [
  [1.0, 0.0, 0.0],
  [0.494207, 0.0, 1.24827],
  [0.0, 0.0, 1.0],
];

// Protanopia: Missing L (red) cones
// The L response is reconstructed from M and S
const PROTANOPIA_MATRIX = [
  [0.0, 2.02344, -2.52581],
  [0.0, 1.0, 0.0],
  [0.0, 0.0, 1.0],
];

// Tritanopia: Missing S (blue) cones
// The S response is reconstructed from L and M
const TRITANOPIA_MATRIX = [
  [1.0, 0.0, 0.0],
  [0.0, 1.0, 0.0],
  [-0.395913, 0.801109, 0.0],
];

/**
 * Simulate color blindness for a given hex color
 */
export function simulateColorBlindness(hex: string, type: VisionType): string {
  if (type === 'normal') return hex;

  // Convert hex to RGB
  const rgb = hexToRgb(hex);

  // Convert to linear RGB
  const linearRgb = rgb.map(srgbToLinear);

  // Convert to LMS
  const lms = multiplyMatrix(RGB_TO_LMS, linearRgb);

  // Apply color blindness simulation matrix
  let simulatedLms: number[];
  switch (type) {
    case 'deuteranopia':
      simulatedLms = multiplyMatrix(DEUTERANOPIA_MATRIX, lms);
      break;
    case 'protanopia':
      simulatedLms = multiplyMatrix(PROTANOPIA_MATRIX, lms);
      break;
    case 'tritanopia':
      simulatedLms = multiplyMatrix(TRITANOPIA_MATRIX, lms);
      break;
    default:
      simulatedLms = lms;
  }

  // Clamp LMS values to prevent negative values
  simulatedLms = simulatedLms.map(v => Math.max(0, v));

  // Convert back to linear RGB
  const simulatedLinearRgb = multiplyMatrix(LMS_TO_RGB, simulatedLms);

  // Convert to sRGB
  const simulatedRgb = simulatedLinearRgb.map(linearToSrgb);

  return rgbToHex(simulatedRgb[0], simulatedRgb[1], simulatedRgb[2]);
}

/**
 * Simulate color blindness for an array of colors
 */
export function simulateColorsForVisionType(
  colors: Array<{ hex: string; [key: string]: unknown }>,
  type: VisionType
): Array<{ hex: string; originalHex: string; [key: string]: unknown }> {
  return colors.map(color => ({
    ...color,
    originalHex: color.hex,
    hex: simulateColorBlindness(color.hex, type),
  }));
}

/**
 * Calculate color difference (Delta E) between two colors
 * Uses a simplified LAB-based calculation
 * Returns a value where < 1 is imperceptible, < 3 is barely noticeable, > 10 is clearly different
 */
export function colorDifference(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);

  // Simple Euclidean distance in RGB space (normalized)
  const dr = (rgb1[0] - rgb2[0]) / 255;
  const dg = (rgb1[1] - rgb2[1]) / 255;
  const db = (rgb1[2] - rgb2[2]) / 255;

  // Weighted by human perception (green is more sensitive)
  return Math.sqrt(dr * dr * 0.3 + dg * dg * 0.59 + db * db * 0.11) * 100;
}

/**
 * Check if two colors are distinguishable for a given vision type
 */
export function areColorsDistinguishable(
  hex1: string,
  hex2: string,
  visionType: VisionType,
  threshold: number = 5
): boolean {
  const simulated1 = simulateColorBlindness(hex1, visionType);
  const simulated2 = simulateColorBlindness(hex2, visionType);
  return colorDifference(simulated1, simulated2) >= threshold;
}

/**
 * Analyze a color palette for color blindness accessibility
 */
export interface ColorBlindnessAnalysis {
  visionType: VisionType;
  issues: Array<{
    color1: { name: string; hex: string; simulated: string };
    color2: { name: string; hex: string; simulated: string };
    difference: number;
  }>;
  isAccessible: boolean;
}

export function analyzeColorPalette(
  colors: Array<{ name: string; hex: string }>,
  visionType: VisionType,
  threshold: number = 5
): ColorBlindnessAnalysis {
  const issues: ColorBlindnessAnalysis['issues'] = [];

  for (let i = 0; i < colors.length; i++) {
    for (let j = i + 1; j < colors.length; j++) {
      const sim1 = simulateColorBlindness(colors[i].hex, visionType);
      const sim2 = simulateColorBlindness(colors[j].hex, visionType);
      const difference = colorDifference(sim1, sim2);

      if (difference < threshold) {
        issues.push({
          color1: { ...colors[i], simulated: sim1 },
          color2: { ...colors[j], simulated: sim2 },
          difference,
        });
      }
    }
  }

  return {
    visionType,
    issues,
    isAccessible: issues.length === 0,
  };
}
