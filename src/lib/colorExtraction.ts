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
 * Extracts more colors than requested to allow for better filtering
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
        // Extract more colors than requested for better selection
        // Use quality=1 for most accurate color sampling (default is 10)
        const extractCount = Math.max(count, 16);
        const quality = 1;
        const palette = colorThief.getPalette(img, extractCount, quality);

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

// Saturation threshold: colors above this are considered "chromatic" (vibrant)
const CHROMATIC_THRESHOLD = 20;

// Minimum saturation for brand colors - we'll boost colors below this
const MIN_BRAND_SATURATION = 55;

/**
 * Boost saturation of a color to make it more vibrant for brand use
 */
function boostSaturation(color: ExtractedColor): ExtractedColor {
  if (color.saturation >= MIN_BRAND_SATURATION) {
    return color;
  }

  // Boost saturation to at least MIN_BRAND_SATURATION
  const boostedSat = Math.max(color.saturation, MIN_BRAND_SATURATION);
  const [h, , l] = chroma(color.hex).hsl();
  const newHex = chroma.hsl(h || 0, boostedSat / 100, l).hex();

  return {
    ...color,
    hex: newHex,
    saturation: boostedSat,
    rgb: chroma(newHex).rgb() as [number, number, number],
  };
}

/**
 * Clean up a neutral color for background/surface use
 * Reduces saturation to create a cleaner, less muddy neutral
 */
function cleanNeutral(color: ExtractedColor, maxSat: number = 8): ExtractedColor {
  if (color.saturation <= maxSat) {
    return color;
  }

  const [h, , l] = chroma(color.hex).hsl();
  const newHex = chroma.hsl(h || 0, maxSat / 100, l).hex();

  return {
    ...color,
    hex: newHex,
    saturation: maxSat,
    rgb: chroma(newHex).rgb() as [number, number, number],
  };
}

/**
 * Auto-assign extracted colors to semantic roles based on lightness and saturation
 * Uses smart separation of chromatic (vibrant) vs neutral colors
 */
export function autoAssignRoles(
  colors: ExtractedColor[]
): Partial<Record<ColorRole, ExtractedColor>> {
  const result: Partial<Record<ColorRole, ExtractedColor>> = {};

  // Separate colors into chromatic (vibrant) and neutral
  const chromatic = colors.filter((c) => c.saturation >= CHROMATIC_THRESHOLD);
  const neutrals = colors.filter((c) => c.saturation < CHROMATIC_THRESHOLD);

  // Sort chromatic by saturation (most saturated first) for brand colors
  const chromaticBySat = [...chromatic].sort(
    (a, b) => b.saturation - a.saturation
  );

  // Sort neutrals by lightness for background/text
  const neutralsByLight = [...neutrals].sort(
    (a, b) => b.lightness - a.lightness
  );

  // Fallback: if no neutrals, use the least saturated colors
  const fallbackNeutrals =
    neutralsByLight.length > 0
      ? neutralsByLight
      : [...colors].sort((a, b) => a.saturation - b.saturation);

  // Assign background: prefer light neutrals, clean up any remaining color cast
  const bgCandidate = fallbackNeutrals.find((c) => c.lightness > 70);
  if (bgCandidate) {
    result.background = cleanNeutral(bgCandidate);
  } else {
    // No light neutral found, use lightest available and clean it
    const lightest = [...colors].sort(
      (a, b) => b.lightness - a.lightness
    )[0];
    if (lightest) result.background = cleanNeutral(lightest);
  }

  // Assign surface: second lightest neutral, slightly darker than background
  const surfaceCandidate = fallbackNeutrals.find(
    (c) => c.lightness > 60 && c.hex !== result.background?.hex
  );
  if (surfaceCandidate) {
    result.surface = cleanNeutral(surfaceCandidate, 10);
  }

  // Assign text: prefer dark neutrals
  const textCandidate = [...fallbackNeutrals]
    .sort((a, b) => a.lightness - b.lightness)
    .find((c) => c.lightness < 35);
  if (textCandidate) {
    result.text = textCandidate;
  } else {
    // No dark neutral, use darkest available
    const darkest = [...colors].sort((a, b) => a.lightness - b.lightness)[0];
    if (darkest && darkest.lightness < 50) result.text = darkest;
  }

  // Assign muted text: slightly lighter than text
  const mutedCandidate = [...fallbackNeutrals]
    .sort((a, b) => a.lightness - b.lightness)
    .find((c) => c.lightness < 50 && c.hex !== result.text?.hex);
  if (mutedCandidate) {
    result.textMuted = mutedCandidate;
  }

  // Assign brand colors from chromatic colors only (preserves vibrancy!)
  const usedHexes = new Set(Object.values(result).map((c) => c?.hex));
  const availableChromatic = chromaticBySat.filter(
    (c) => !usedHexes.has(c.hex)
  );

  // If no chromatic colors available, boost saturation of available colors
  if (availableChromatic.length === 0 && colors.length > 0) {
    // Find the most saturated colors that aren't already used
    const remaining = colors
      .filter((c) => !usedHexes.has(c.hex))
      .sort((a, b) => b.saturation - a.saturation);
    availableChromatic.push(...remaining);
  }

  // Assign primary, secondary, accent from most to least saturated
  // Boost saturation to ensure brand colors are vibrant
  if (availableChromatic[0]) {
    result.primary = boostSaturation(availableChromatic[0]);
  }

  // For secondary, try to find a color with different hue
  if (availableChromatic.length > 1) {
    const primaryHue = result.primary
      ? chroma(result.primary.hex).hsl()[0] || 0
      : 0;
    const secondaryCandidate =
      availableChromatic.find((c) => {
        const hue = chroma(c.hex).hsl()[0] || 0;
        const hueDiff = Math.abs(hue - primaryHue);
        return Math.min(hueDiff, 360 - hueDiff) > 30; // At least 30° apart
      }) || availableChromatic[1];
    result.secondary = boostSaturation(secondaryCandidate);
  }

  // For accent, try to find yet another distinct hue
  if (availableChromatic.length > 2) {
    const usedHues = [result.primary, result.secondary]
      .filter(Boolean)
      .map((c) => chroma(c!.hex).hsl()[0] || 0);

    const accentCandidate =
      availableChromatic.find((c) => {
        if (c.hex === result.primary?.hex || c.hex === result.secondary?.hex)
          return false;
        const hue = chroma(c.hex).hsl()[0] || 0;
        return usedHues.every((usedHue) => {
          const diff = Math.abs(hue - usedHue);
          return Math.min(diff, 360 - diff) > 25;
        });
      }) || availableChromatic.find(
        (c) =>
          c.hex !== result.primary?.hex && c.hex !== result.secondary?.hex
      );

    if (accentCandidate) result.accent = boostSaturation(accentCandidate);
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
