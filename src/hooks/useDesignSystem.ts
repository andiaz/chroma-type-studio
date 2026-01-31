import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import chroma from "chroma-js";
import {
  ColorHarmonyConfig,
  ColorHarmonyResult,
  HarmonyType,
  generateHarmony,
  SemanticColorConfig,
  FullColorSystem,
  generateFullColorSystem,
} from "./useColorScales";
import {
  getStateFromUrl,
  generateShareUrl,
  clearUrlHash,
  type ShareableState,
} from "@/lib/urlStateEncoder";
import {
  simulateColorBlindness,
  type VisionType,
} from "@/lib/colorBlindness";

// Color roles for semantic organization
export type ColorRole = 
  | "background" 
  | "surface" 
  | "text" 
  | "textMuted"
  | "primary" 
  | "secondary" 
  | "accent";

export interface ColorEntry {
  id: string;
  role: ColorRole;
  name: string;
  hex: string;
  hsl: { h: number; s: number; l: number };
}

export interface TypographyScale {
  baseSize: number;
  scaleRatio: number;
  headingFont: string;
  bodyFont: string;
  steps: {
    name: string;
    size: number;
    lineHeight: number;
  }[];
}

export interface ContrastResult {
  color1: ColorEntry;
  color2: ColorEntry;
  ratio: number;
  aa: boolean;
  aaLarge: boolean;
  aaa: boolean;
  aaaLarge: boolean;
}

export interface DesignSystemState {
  colors: ColorEntry[];
  typography: TypographyScale;
}

// Scale ratio presets
export const SCALE_RATIOS = {
  "Minor Second": 1.067,
  "Major Second": 1.125,
  "Minor Third": 1.2,
  "Major Third": 1.25,
  "Perfect Fourth": 1.333,
  "Augmented Fourth": 1.414,
  "Perfect Fifth": 1.5,
  "Golden Ratio": 1.618,
} as const;

// Popular Google Fonts for design systems
export const GOOGLE_FONTS = [
  "Inter",
  "Space Grotesk",
  "Poppins",
  "Roboto",
  "Open Sans",
  "Lato",
  "Montserrat",
  "Source Sans 3",
  "Nunito",
  "Work Sans",
  "DM Sans",
  "Plus Jakarta Sans",
  "Outfit",
  "Manrope",
  "Sora",
  "IBM Plex Sans",
  "Libre Franklin",
  "Barlow",
  "Mulish",
  "Urbanist",
  "Figtree",
  "Albert Sans",
  // Serif options
  "Playfair Display",
  "Merriweather",
  "Lora",
  "Source Serif 4",
  "Crimson Text",
  "Libre Baskerville",
  "IBM Plex Serif",
  // Mono options
  "JetBrains Mono",
  "Fira Code",
  "Source Code Pro",
  "IBM Plex Mono",
];

// Preset color themes
export interface ColorPreset {
  id: string;
  name: string;
  description: string;
  colors: Omit<ColorEntry, "id">[];
}

export const COLOR_PRESETS: ColorPreset[] = [
  {
    id: "default",
    name: "Studio Default",
    description: "Clean, professional palette with indigo primary",
    colors: [
      { role: "background", name: "Background", hex: "#FAFAF9", hsl: { h: 40, s: 20, l: 98 } },
      { role: "surface", name: "Surface", hex: "#FFFFFF", hsl: { h: 0, s: 0, l: 100 } },
      { role: "text", name: "Text", hex: "#1A1A2E", hsl: { h: 240, s: 28, l: 14 } },
      { role: "textMuted", name: "Text Muted", hex: "#6B7280", hsl: { h: 220, s: 9, l: 46 } },
      { role: "primary", name: "Primary", hex: "#5B4CDB", hsl: { h: 250, s: 60, l: 45 } },
      { role: "secondary", name: "Secondary", hex: "#F97316", hsl: { h: 25, s: 95, l: 53 } },
      { role: "accent", name: "Accent", hex: "#14B8A6", hsl: { h: 172, s: 80, l: 40 } },
    ],
  },
  {
    id: "ocean",
    name: "Ocean Depths",
    description: "Cool blues and teals inspired by the sea",
    colors: [
      { role: "background", name: "Background", hex: "#F0F9FF", hsl: { h: 204, s: 100, l: 97 } },
      { role: "surface", name: "Surface", hex: "#FFFFFF", hsl: { h: 0, s: 0, l: 100 } },
      { role: "text", name: "Text", hex: "#0C4A6E", hsl: { h: 202, s: 80, l: 24 } },
      { role: "textMuted", name: "Text Muted", hex: "#64748B", hsl: { h: 215, s: 16, l: 47 } },
      { role: "primary", name: "Primary", hex: "#0284C7", hsl: { h: 200, s: 98, l: 39 } },
      { role: "secondary", name: "Secondary", hex: "#06B6D4", hsl: { h: 188, s: 95, l: 43 } },
      { role: "accent", name: "Accent", hex: "#8B5CF6", hsl: { h: 263, s: 90, l: 66 } },
    ],
  },
  {
    id: "forest",
    name: "Forest Grove",
    description: "Natural greens and earthy tones",
    colors: [
      { role: "background", name: "Background", hex: "#F5F5F4", hsl: { h: 60, s: 5, l: 96 } },
      { role: "surface", name: "Surface", hex: "#FAFAF9", hsl: { h: 60, s: 9, l: 98 } },
      { role: "text", name: "Text", hex: "#1C1917", hsl: { h: 24, s: 10, l: 10 } },
      { role: "textMuted", name: "Text Muted", hex: "#57534E", hsl: { h: 25, s: 5, l: 32 } },
      { role: "primary", name: "Primary", hex: "#16A34A", hsl: { h: 142, s: 76, l: 36 } },
      { role: "secondary", name: "Secondary", hex: "#84CC16", hsl: { h: 84, s: 81, l: 44 } },
      { role: "accent", name: "Accent", hex: "#D97706", hsl: { h: 32, s: 95, l: 44 } },
    ],
  },
  {
    id: "sunset",
    name: "Golden Sunset",
    description: "Warm oranges, pinks, and golden hues",
    colors: [
      { role: "background", name: "Background", hex: "#FFFBEB", hsl: { h: 48, s: 100, l: 96 } },
      { role: "surface", name: "Surface", hex: "#FFFFFF", hsl: { h: 0, s: 0, l: 100 } },
      { role: "text", name: "Text", hex: "#451A03", hsl: { h: 21, s: 90, l: 14 } },
      { role: "textMuted", name: "Text Muted", hex: "#78716C", hsl: { h: 30, s: 6, l: 45 } },
      { role: "primary", name: "Primary", hex: "#EA580C", hsl: { h: 21, s: 90, l: 48 } },
      { role: "secondary", name: "Secondary", hex: "#DB2777", hsl: { h: 330, s: 81, l: 50 } },
      { role: "accent", name: "Accent", hex: "#FBBF24", hsl: { h: 43, s: 96, l: 56 } },
    ],
  },
  {
    id: "midnight",
    name: "Midnight Mode",
    description: "Dark theme with vibrant accents",
    colors: [
      { role: "background", name: "Background", hex: "#0F172A", hsl: { h: 222, s: 47, l: 11 } },
      { role: "surface", name: "Surface", hex: "#1E293B", hsl: { h: 217, s: 33, l: 17 } },
      { role: "text", name: "Text", hex: "#F1F5F9", hsl: { h: 210, s: 40, l: 96 } },
      { role: "textMuted", name: "Text Muted", hex: "#94A3B8", hsl: { h: 215, s: 20, l: 65 } },
      { role: "primary", name: "Primary", hex: "#818CF8", hsl: { h: 239, s: 84, l: 67 } },
      { role: "secondary", name: "Secondary", hex: "#F472B6", hsl: { h: 330, s: 86, l: 70 } },
      { role: "accent", name: "Accent", hex: "#34D399", hsl: { h: 160, s: 64, l: 52 } },
    ],
  },
  {
    id: "lavender",
    name: "Lavender Dreams",
    description: "Soft purples and calming pastels",
    colors: [
      { role: "background", name: "Background", hex: "#FAF5FF", hsl: { h: 280, s: 100, l: 98 } },
      { role: "surface", name: "Surface", hex: "#FFFFFF", hsl: { h: 0, s: 0, l: 100 } },
      { role: "text", name: "Text", hex: "#3B0764", hsl: { h: 274, s: 87, l: 21 } },
      { role: "textMuted", name: "Text Muted", hex: "#7C3AED", hsl: { h: 263, s: 83, l: 58 } },
      { role: "primary", name: "Primary", hex: "#9333EA", hsl: { h: 271, s: 81, l: 56 } },
      { role: "secondary", name: "Secondary", hex: "#EC4899", hsl: { h: 330, s: 81, l: 60 } },
      { role: "accent", name: "Accent", hex: "#06B6D4", hsl: { h: 188, s: 95, l: 43 } },
    ],
  },
  {
    id: "monochrome",
    name: "Monochrome",
    description: "Elegant grayscale with a single accent",
    colors: [
      { role: "background", name: "Background", hex: "#FAFAFA", hsl: { h: 0, s: 0, l: 98 } },
      { role: "surface", name: "Surface", hex: "#FFFFFF", hsl: { h: 0, s: 0, l: 100 } },
      { role: "text", name: "Text", hex: "#171717", hsl: { h: 0, s: 0, l: 9 } },
      { role: "textMuted", name: "Text Muted", hex: "#737373", hsl: { h: 0, s: 0, l: 45 } },
      { role: "primary", name: "Primary", hex: "#171717", hsl: { h: 0, s: 0, l: 9 } },
      { role: "secondary", name: "Secondary", hex: "#525252", hsl: { h: 0, s: 0, l: 32 } },
      { role: "accent", name: "Accent", hex: "#EF4444", hsl: { h: 0, s: 84, l: 60 } },
    ],
  },
  {
    id: "corporate",
    name: "Corporate Blue",
    description: "Professional blues for business applications",
    colors: [
      { role: "background", name: "Background", hex: "#F8FAFC", hsl: { h: 210, s: 40, l: 98 } },
      { role: "surface", name: "Surface", hex: "#FFFFFF", hsl: { h: 0, s: 0, l: 100 } },
      { role: "text", name: "Text", hex: "#0F172A", hsl: { h: 222, s: 47, l: 11 } },
      { role: "textMuted", name: "Text Muted", hex: "#64748B", hsl: { h: 215, s: 16, l: 47 } },
      { role: "primary", name: "Primary", hex: "#2563EB", hsl: { h: 217, s: 91, l: 60 } },
      { role: "secondary", name: "Secondary", hex: "#3B82F6", hsl: { h: 217, s: 91, l: 60 } },
      { role: "accent", name: "Accent", hex: "#10B981", hsl: { h: 160, s: 84, l: 39 } },
    ],
  },
];

const DEFAULT_COLORS = COLOR_PRESETS[0].colors.map((c, i) => ({ ...c, id: String(i + 1) }));

const DEFAULT_TYPOGRAPHY: TypographyScale = {
  baseSize: 16,
  scaleRatio: 1.25, // Major Third
  headingFont: "Space Grotesk",
  bodyFont: "Inter",
  steps: [],
};

function generateTypographySteps(baseSize: number, ratio: number): TypographyScale["steps"] {
  return [
    { name: "xs", size: baseSize / (ratio * ratio), lineHeight: 1.5 },
    { name: "sm", size: baseSize / ratio, lineHeight: 1.5 },
    { name: "base", size: baseSize, lineHeight: 1.6 },
    { name: "lg", size: baseSize * ratio, lineHeight: 1.5 },
    { name: "xl", size: baseSize * ratio * ratio, lineHeight: 1.4 },
    { name: "2xl", size: baseSize * Math.pow(ratio, 3), lineHeight: 1.3 },
    { name: "3xl", size: baseSize * Math.pow(ratio, 4), lineHeight: 1.2 },
    { name: "4xl", size: baseSize * Math.pow(ratio, 5), lineHeight: 1.1 },
    { name: "5xl", size: baseSize * Math.pow(ratio, 6), lineHeight: 1.05 },
  ];
}

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  try {
    const [h, s, l] = chroma(hex).hsl();
    return { 
      h: isNaN(h) ? 0 : Math.round(h), 
      s: Math.round((s || 0) * 100), 
      l: Math.round((l || 0) * 100) 
    };
  } catch {
    return { h: 0, s: 0, l: 50 };
  }
}

function hslToHex(h: number, s: number, l: number): string {
  try {
    return chroma.hsl(h, s / 100, l / 100).hex();
  } catch {
    return "#808080";
  }
}

export function calculateContrast(hex1: string, hex2: string): number {
  try {
    return chroma.contrast(hex1, hex2);
  } catch {
    return 1;
  }
}

const DEFAULT_SCALES_CONFIG: ColorHarmonyConfig = {
  type: "complementary",
  baseHue: 250,
  saturation: 80,
  spacing: 30,
};

export type ColorMode = "light" | "dark";

/**
 * Check if a palette is already dark (background lightness < 30)
 */
function isPaletteDark(colors: ColorEntry[]): boolean {
  const bg = colors.find(c => c.role === "background");
  return bg ? bg.hsl.l < 30 : false;
}

/**
 * Generate a dark mode palette from light mode colors
 * Uses perceptual inversion that maintains contrast relationships
 */
function generateDarkPalette(lightColors: ColorEntry[]): ColorEntry[] {
  // If the palette is already dark, generate a light version instead
  const alreadyDark = isPaletteDark(lightColors);

  return lightColors.map(color => {
    const hsl = color.hsl;
    let newL: number;
    let newS = hsl.s;

    if (alreadyDark) {
      // Palette is already dark, generate light version
      switch (color.role) {
        case "background":
          newL = 98;
          newS = Math.min(hsl.s, 5);
          break;
        case "surface":
          newL = 100;
          newS = 0;
          break;
        case "text":
          newL = 10;
          newS = Math.min(hsl.s, 10);
          break;
        case "textMuted":
          newL = 40;
          newS = Math.min(hsl.s, 10);
          break;
        case "primary":
        case "secondary":
        case "accent":
          // For brand colors, adjust to work on light background
          newL = Math.max(35, Math.min(55, hsl.l));
          newS = Math.min(hsl.s, 85);
          break;
        default:
          newL = 100 - hsl.l;
      }
    } else {
      // Normal light to dark conversion
      switch (color.role) {
        case "background":
          newL = 8;
          newS = Math.min(hsl.s, 15);
          break;
        case "surface":
          newL = 12;
          newS = Math.min(hsl.s, 20);
          break;
        case "text":
          newL = 95;
          newS = Math.min(hsl.s, 5);
          break;
        case "textMuted":
          newL = 65;
          newS = Math.min(hsl.s, 10);
          break;
        case "primary":
        case "secondary":
        case "accent":
          // Brand colors: slightly lighter for dark mode visibility
          // Keep the hue, adjust lightness to be visible on dark bg
          if (hsl.l < 40) {
            newL = hsl.l + 25;
          } else if (hsl.l > 70) {
            newL = hsl.l - 15;
          } else {
            newL = Math.min(65, hsl.l + 10);
          }
          newS = Math.min(hsl.s, 80);
          break;
        default:
          newL = 100 - hsl.l;
      }
    }

    const newHex = hslToHex(hsl.h, newS, newL);
    return {
      ...color,
      hex: newHex,
      hsl: { h: hsl.h, s: newS, l: newL },
    };
  });
}

export function useDesignSystem() {
  const [colors, setColors] = useState<ColorEntry[]>(DEFAULT_COLORS);
  const [typography, setTypography] = useState<TypographyScale>(() => ({
    ...DEFAULT_TYPOGRAPHY,
    steps: generateTypographySteps(DEFAULT_TYPOGRAPHY.baseSize, DEFAULT_TYPOGRAPHY.scaleRatio),
  }));
  const [colorScalesConfig, setColorScalesConfig] = useState<ColorHarmonyConfig>(DEFAULT_SCALES_CONFIG);
  const [colorScalesEnabled, setColorScalesEnabled] = useState(false);
  const [fullSystemEnabled, setFullSystemEnabled] = useState(false);
  const [loadedFromUrl, setLoadedFromUrl] = useState(false);
  const [colorMode, setColorMode] = useState<ColorMode>("light");
  const [darkColors, setDarkColors] = useState<ColorEntry[] | null>(null);
  const [autoSyncDark, setAutoSyncDark] = useState(true);
  const [visionSimulation, setVisionSimulation] = useState<VisionType>("normal");
  const isInitialized = useRef(false);

  // Generate color harmony based on config
  const colorScales = useMemo<ColorHarmonyResult | null>(() => {
    if (!colorScalesEnabled) return null;
    return generateHarmony(colorScalesConfig);
  }, [colorScalesConfig, colorScalesEnabled]);

  // Generate full semantic color system
  const fullColorSystem = useMemo<FullColorSystem | null>(() => {
    if (!fullSystemEnabled) return null;
    // Get accent from complementary hue
    const accentHue = (colorScalesConfig.baseHue + 180) % 360;
    return generateFullColorSystem({
      brandHue: colorScalesConfig.baseHue,
      brandSaturation: colorScalesConfig.saturation,
      accentHue,
      accentSaturation: colorScalesConfig.saturation,
    });
  }, [colorScalesConfig, fullSystemEnabled]);

  // Auto-generate dark colors when light colors change and autoSyncDark is enabled
  const computedDarkColors = useMemo(() => {
    if (autoSyncDark) {
      return generateDarkPalette(colors);
    }
    return darkColors;
  }, [colors, autoSyncDark, darkColors]);

  // Get the current colors based on mode
  const currentColors = useMemo(() => {
    if (colorMode === "dark" && computedDarkColors) {
      return computedDarkColors;
    }
    return colors;
  }, [colorMode, colors, computedDarkColors]);

  // Apply vision simulation to current colors for preview
  const previewColors = useMemo(() => {
    if (visionSimulation === "normal") {
      return currentColors;
    }
    return currentColors.map(color => ({
      ...color,
      hex: simulateColorBlindness(color.hex, visionSimulation),
    }));
  }, [currentColors, visionSimulation]);

  // Load from URL hash first, then localStorage on mount
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    // Priority 1: Check URL hash for shared state
    const urlState = getStateFromUrl();
    if (urlState) {
      if (urlState.colors) setColors(urlState.colors);
      if (urlState.typography) {
        setTypography({
          ...urlState.typography,
          steps: generateTypographySteps(urlState.typography.baseSize, urlState.typography.scaleRatio),
        });
      }
      if (urlState.colorScalesConfig) setColorScalesConfig(urlState.colorScalesConfig);
      if (urlState.colorScalesEnabled !== undefined) setColorScalesEnabled(urlState.colorScalesEnabled);
      if (urlState.fullSystemEnabled !== undefined) setFullSystemEnabled(urlState.fullSystemEnabled);
      setLoadedFromUrl(true);
      // Clear the hash after loading so it doesn't persist in the URL
      clearUrlHash();
      return;
    }

    // Priority 2: Check localStorage
    const saved = localStorage.getItem("chromaType-designSystem");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.colors) setColors(parsed.colors);
        if (parsed.typography) {
          setTypography({
            ...parsed.typography,
            steps: generateTypographySteps(parsed.typography.baseSize, parsed.typography.scaleRatio),
          });
        }
        if (parsed.colorScalesConfig) setColorScalesConfig(parsed.colorScalesConfig);
        if (parsed.colorScalesEnabled !== undefined) setColorScalesEnabled(parsed.colorScalesEnabled);
        if (parsed.fullSystemEnabled !== undefined) setFullSystemEnabled(parsed.fullSystemEnabled);
      } catch (e) {
        console.error("Failed to parse saved design system:", e);
      }
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem("chromaType-designSystem", JSON.stringify({
      colors,
      typography,
      colorScalesConfig,
      colorScalesEnabled,
      fullSystemEnabled,
    }));
  }, [colors, typography, colorScalesConfig, colorScalesEnabled, fullSystemEnabled]);

  // Color operations
  const updateColor = useCallback((id: string, updates: Partial<Omit<ColorEntry, "id">>) => {
    setColors(prev => prev.map(color => {
      if (color.id !== id) return color;
      
      let newColor = { ...color, ...updates };
      
      // Sync hex <-> hsl
      if (updates.hex && !updates.hsl) {
        newColor.hsl = hexToHsl(updates.hex);
      } else if (updates.hsl && !updates.hex) {
        newColor.hex = hslToHex(updates.hsl.h, updates.hsl.s, updates.hsl.l);
      }
      
      return newColor;
    }));
  }, []);

  const addColor = useCallback((role: ColorRole = "accent") => {
    const newId = Date.now().toString();
    const randomHex = chroma.random().hex();
    setColors(prev => [...prev, {
      id: newId,
      role,
      name: `Color ${prev.length + 1}`,
      hex: randomHex,
      hsl: hexToHsl(randomHex),
    }]);
  }, []);

  const removeColor = useCallback((id: string) => {
    setColors(prev => prev.filter(c => c.id !== id));
  }, []);

  // Apply preset
  const applyPreset = useCallback((presetId: string) => {
    const preset = COLOR_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setColors(preset.colors.map((c, i) => ({ ...c, id: String(Date.now() + i) })));
    }
  }, []);

  // Typography operations
  const updateTypography = useCallback((updates: Partial<Omit<TypographyScale, "steps">>) => {
    setTypography(prev => {
      const newTypo = { ...prev, ...updates };
      return {
        ...newTypo,
        steps: generateTypographySteps(newTypo.baseSize, newTypo.scaleRatio),
      };
    });
  }, []);

  // Contrast checks
  const getContrastResults = useCallback((): ContrastResult[] => {
    const results: ContrastResult[] = [];
    const textColors = colors.filter(c => c.role === "text" || c.role === "textMuted");
    const bgColors = colors.filter(c => c.role === "background" || c.role === "surface");
    const brandColors = colors.filter(c => 
      c.role === "primary" || c.role === "secondary" || c.role === "accent"
    );

    // Text on backgrounds
    for (const text of textColors) {
      for (const bg of bgColors) {
        const ratio = calculateContrast(text.hex, bg.hex);
        results.push({
          color1: text,
          color2: bg,
          ratio,
          aa: ratio >= 4.5,
          aaLarge: ratio >= 3,
          aaa: ratio >= 7,
          aaaLarge: ratio >= 4.5,
        });
      }
    }

    // Brand colors on backgrounds
    for (const brand of brandColors) {
      for (const bg of bgColors) {
        const ratio = calculateContrast(brand.hex, bg.hex);
        results.push({
          color1: brand,
          color2: bg,
          ratio,
          aa: ratio >= 4.5,
          aaLarge: ratio >= 3,
          aaa: ratio >= 7,
          aaaLarge: ratio >= 4.5,
        });
      }
    }

    return results;
  }, [colors]);

  // Get color by role
  const getColorByRole = useCallback((role: ColorRole): ColorEntry | undefined => {
    return colors.find(c => c.role === role);
  }, [colors]);

  // Color scales operations
  const updateColorScalesConfig = useCallback((updates: Partial<ColorHarmonyConfig>) => {
    setColorScalesConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  const toggleColorScales = useCallback(() => {
    setColorScalesEnabled((prev) => !prev);
  }, []);

  // Reset to defaults
  const reset = useCallback(() => {
    setColors(DEFAULT_COLORS);
    setTypography({
      ...DEFAULT_TYPOGRAPHY,
      steps: generateTypographySteps(DEFAULT_TYPOGRAPHY.baseSize, DEFAULT_TYPOGRAPHY.scaleRatio),
    });
    setColorScalesConfig(DEFAULT_SCALES_CONFIG);
    setColorScalesEnabled(false);
    setFullSystemEnabled(false);
    localStorage.removeItem("chromaType-designSystem");
  }, []);

  // Generate shareable URL
  const getShareUrl = useCallback((): string => {
    const state: ShareableState = {
      colors,
      typography,
      colorScalesConfig,
      colorScalesEnabled,
      fullSystemEnabled,
    };
    return generateShareUrl(state);
  }, [colors, typography, colorScalesConfig, colorScalesEnabled, fullSystemEnabled]);

  // Dark mode operations
  const toggleColorMode = useCallback(() => {
    setColorMode(prev => prev === "light" ? "dark" : "light");
  }, []);

  const regenerateDarkPalette = useCallback(() => {
    setDarkColors(generateDarkPalette(colors));
  }, [colors]);

  const toggleAutoSyncDark = useCallback(() => {
    setAutoSyncDark(prev => !prev);
  }, []);

  // Update dark colors manually (when autoSyncDark is false)
  const updateDarkColor = useCallback((id: string, updates: Partial<Omit<ColorEntry, "id">>) => {
    if (!darkColors) return;
    setDarkColors(prev => {
      if (!prev) return prev;
      return prev.map(color => {
        if (color.id !== id) return color;

        let newColor = { ...color, ...updates };

        // Sync hex <-> hsl
        if (updates.hex && !updates.hsl) {
          newColor.hsl = hexToHsl(updates.hex);
        } else if (updates.hsl && !updates.hex) {
          newColor.hex = hslToHex(updates.hsl.h, updates.hsl.s, updates.hsl.l);
        }

        return newColor;
      });
    });
  }, [darkColors]);

  return {
    // Light mode colors (source of truth)
    colors,
    // Current colors based on mode (light or dark)
    currentColors,
    // Preview colors with vision simulation applied
    previewColors,
    // Dark mode colors (auto-generated or manually edited)
    darkColors: computedDarkColors,
    // Color mode state
    colorMode,
    autoSyncDark,
    // Vision simulation
    visionSimulation,
    setVisionSimulation,
    // Typography and color scales
    typography,
    colorScales,
    colorScalesConfig,
    colorScalesEnabled,
    fullColorSystem,
    fullSystemEnabled,
    loadedFromUrl,
    // Color operations (light mode)
    updateColor,
    addColor,
    removeColor,
    applyPreset,
    // Dark mode operations
    updateDarkColor,
    toggleColorMode,
    regenerateDarkPalette,
    toggleAutoSyncDark,
    setColorMode,
    // Typography operations
    updateTypography,
    // Color scales operations
    updateColorScalesConfig,
    setColorScalesEnabled,
    setFullSystemEnabled,
    toggleColorScales,
    // Utilities
    getContrastResults,
    getColorByRole,
    getShareUrl,
    reset,
  };
}

export type DesignSystem = ReturnType<typeof useDesignSystem>;

// Re-export color scale types for convenience
export type { ColorHarmonyConfig, ColorHarmonyResult, HarmonyType, ColorScale, ColorShade, SemanticColorConfig, FullColorSystem } from "./useColorScales";
