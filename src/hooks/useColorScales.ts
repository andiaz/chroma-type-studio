import { useState, useCallback, useMemo } from "react";
import { Hsluv } from "hsluv";

// Shade steps following Tailwind convention
const SHADE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

export interface ColorShade {
  step: number;
  lightness: number;
  hex: string;
}

export interface ColorScale {
  name: string;
  baseHue: number;
  saturation: number;
  shades: ColorShade[];
}

export type HarmonyType = "complementary" | "analogous" | "triadic" | "split-complementary";

export interface ColorHarmonyConfig {
  type: HarmonyType;
  baseHue: number;
  saturation: number;
  spacing: number; // For analogous harmony
}

export interface ColorHarmonyResult {
  config: ColorHarmonyConfig;
  scales: ColorScale[];
}

// Generate a single color scale from HSLuv
function generateScale(hue: number, saturation: number, name: string): ColorScale {
  const shades: ColorShade[] = [];

  for (const step of SHADE_STEPS) {
    // Map step to lightness (50 = ~97%, 950 = ~5%)
    // This creates a smooth gradient from light to dark
    const lightness = step === 50
      ? 97
      : step === 950
        ? 5
        : 100 - (step / 10);

    const conv = new Hsluv();
    conv.hsluv_h = hue;
    conv.hsluv_s = saturation;
    conv.hsluv_l = lightness;
    conv.hsluvToHex();

    shades.push({
      step,
      lightness,
      hex: conv.hex,
    });
  }

  return {
    name,
    baseHue: hue,
    saturation,
    shades,
  };
}

// Get complementary hue (opposite on color wheel)
function getComplementaryHue(hue: number): number {
  return (hue + 180) % 360;
}

// Get analogous hues (adjacent on color wheel)
function getAnalogousHues(hue: number, spacing: number): number[] {
  return [
    (hue + spacing) % 360,
    (hue - spacing + 360) % 360,
  ];
}

// Get triadic hues (3 equidistant on color wheel)
function getTriadicHues(hue: number): number[] {
  return [
    (hue + 120) % 360,
    (hue + 240) % 360,
  ];
}

// Get split-complementary hues (adjacent to complement)
function getSplitComplementaryHues(hue: number, spacing: number = 30): number[] {
  const complement = getComplementaryHue(hue);
  return [
    (complement + spacing) % 360,
    (complement - spacing + 360) % 360,
  ];
}

// Generate harmony scales based on type
export function generateHarmony(config: ColorHarmonyConfig): ColorHarmonyResult {
  const { type, baseHue, saturation, spacing } = config;
  const scales: ColorScale[] = [];

  // Always include the primary scale
  scales.push(generateScale(baseHue, saturation, "primary"));

  switch (type) {
    case "complementary": {
      const complementHue = getComplementaryHue(baseHue);
      scales.push(generateScale(complementHue, saturation, "complementary"));
      break;
    }
    case "analogous": {
      const [hue1, hue2] = getAnalogousHues(baseHue, spacing);
      scales.push(generateScale(hue1, saturation, "analogous-1"));
      scales.push(generateScale(hue2, saturation, "analogous-2"));
      break;
    }
    case "triadic": {
      const [hue1, hue2] = getTriadicHues(baseHue);
      scales.push(generateScale(hue1, saturation, "triadic-1"));
      scales.push(generateScale(hue2, saturation, "triadic-2"));
      break;
    }
    case "split-complementary": {
      const [hue1, hue2] = getSplitComplementaryHues(baseHue, spacing);
      scales.push(generateScale(hue1, saturation, "split-1"));
      scales.push(generateScale(hue2, saturation, "split-2"));
      break;
    }
  }

  return { config, scales };
}

// Semantic color definitions for full system export
export interface SemanticColorConfig {
  brandHue: number;
  brandSaturation: number;
  accentHue: number;
  accentSaturation: number;
}

export interface FullColorSystem {
  brand: ColorScale;
  accent: ColorScale;
  neutral: ColorScale;
  error: ColorScale;
  warning: ColorScale;
  success: ColorScale;
  info: ColorScale;
}

// Generate a complete semantic color system
export function generateFullColorSystem(config: SemanticColorConfig): FullColorSystem {
  const { brandHue, brandSaturation, accentHue, accentSaturation } = config;

  return {
    brand: generateScale(brandHue, brandSaturation, "brand"),
    accent: generateScale(accentHue, accentSaturation, "accent"),
    neutral: generateScale(0, 5, "neutral"), // Very low saturation for neutral grays
    error: generateScale(12, 85, "error"),   // Red
    warning: generateScale(45, 90, "warning"), // Yellow/Orange
    success: generateScale(145, 75, "success"), // Green
    info: generateScale(215, 80, "info"),    // Blue
  };
}

// Hook for managing color scales state
export function useColorScales() {
  const [config, setConfig] = useState<ColorHarmonyConfig>({
    type: "complementary",
    baseHue: 250,
    saturation: 80,
    spacing: 30,
  });

  const [enabled, setEnabled] = useState(false);

  const harmony = useMemo(() => {
    if (!enabled) return null;
    return generateHarmony(config);
  }, [config, enabled]);

  const updateConfig = useCallback((updates: Partial<ColorHarmonyConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  const toggleEnabled = useCallback(() => {
    setEnabled((prev) => !prev);
  }, []);

  return {
    config,
    enabled,
    harmony,
    updateConfig,
    setEnabled,
    toggleEnabled,
  };
}

export type ColorScalesState = ReturnType<typeof useColorScales>;
