import ColorThief from "colorthief";
import chroma from "chroma-js";
import type { ColorEntry, ColorRole } from "@/hooks/useDesignSystem";

const colorThief = new ColorThief();

export interface ExtractedColor {
  hex: string;
  rgb: [number, number, number];
  lightness: number;
  saturation: number;
}

/**
 * Extract dominant colors from an image URL
 */
export async function extractColorsFromUrl(
  imageUrl: string,
  count: number = 8
): Promise<ExtractedColor[]> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";

    img.onload = () => {
      try {
        const palette = colorThief.getPalette(img, count);

        const colors: ExtractedColor[] = palette.map(
          (rgb: [number, number, number]) => {
            const hex = chroma(rgb).hex();
            const [, s, l] = chroma(rgb).hsl();
            return {
              hex,
              rgb,
              lightness: l * 100,
              saturation: (s || 0) * 100,
            };
          }
        );

        resolve(colors);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error("Failed to load image. Make sure the URL is accessible and CORS-enabled."));
    };

    img.src = imageUrl;
  });
}

/**
 * Sort extracted colors by lightness
 */
export function sortByLightness(colors: ExtractedColor[]): ExtractedColor[] {
  return [...colors].sort((a, b) => a.lightness - b.lightness);
}

/**
 * Sort extracted colors by saturation
 */
export function sortBySaturation(colors: ExtractedColor[]): ExtractedColor[] {
  return [...colors].sort((a, b) => b.saturation - a.saturation);
}

/**
 * Auto-assign extracted colors to semantic roles based on lightness and saturation
 */
export function autoAssignRoles(
  colors: ExtractedColor[]
): Partial<Record<ColorRole, ExtractedColor>> {
  const sorted = sortByLightness(colors);
  const highSat = sortBySaturation(colors);

  const result: Partial<Record<ColorRole, ExtractedColor>> = {};

  // Find the lightest color for background
  const lightest = sorted[sorted.length - 1];
  if (lightest && lightest.lightness > 70) {
    result.background = lightest;
  }

  // Find second lightest for surface
  const secondLightest = sorted[sorted.length - 2];
  if (secondLightest && secondLightest.lightness > 60) {
    result.surface = secondLightest;
  }

  // Find the darkest color for text
  const darkest = sorted[0];
  if (darkest && darkest.lightness < 30) {
    result.text = darkest;
  }

  // Find second darkest for muted text
  const secondDarkest = sorted[1];
  if (secondDarkest && secondDarkest.lightness < 50) {
    result.textMuted = secondDarkest;
  }

  // Find the most saturated colors for brand colors
  const usedColors = new Set(Object.values(result).map((c) => c?.hex));
  const availableSaturated = highSat.filter((c) => !usedColors.has(c.hex));

  if (availableSaturated[0]) {
    result.primary = availableSaturated[0];
  }
  if (availableSaturated[1]) {
    result.secondary = availableSaturated[1];
  }
  if (availableSaturated[2]) {
    result.accent = availableSaturated[2];
  }

  return result;
}

/**
 * Convert extracted colors to ColorEntry array
 */
export function createColorEntries(
  assignments: Partial<Record<ColorRole, ExtractedColor>>,
  existingColors: ColorEntry[]
): ColorEntry[] {
  return existingColors.map((existing) => {
    const assigned = assignments[existing.role];
    if (assigned) {
      const [h, s, l] = chroma(assigned.hex).hsl();
      return {
        ...existing,
        hex: assigned.hex,
        hsl: {
          h: isNaN(h) ? 0 : Math.round(h),
          s: Math.round((s || 0) * 100),
          l: Math.round((l || 0) * 100),
        },
      };
    }
    return existing;
  });
}
