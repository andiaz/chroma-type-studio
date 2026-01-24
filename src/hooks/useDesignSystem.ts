import { useState, useCallback, useEffect } from "react";
import chroma from "chroma-js";

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

export function useDesignSystem() {
  const [colors, setColors] = useState<ColorEntry[]>(DEFAULT_COLORS);
  const [typography, setTypography] = useState<TypographyScale>(() => ({
    ...DEFAULT_TYPOGRAPHY,
    steps: generateTypographySteps(DEFAULT_TYPOGRAPHY.baseSize, DEFAULT_TYPOGRAPHY.scaleRatio),
  }));

  // Load from localStorage on mount
  useEffect(() => {
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
      } catch (e) {
        console.error("Failed to parse saved design system:", e);
      }
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem("chromaType-designSystem", JSON.stringify({ colors, typography }));
  }, [colors, typography]);

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

  // Reset to defaults
  const reset = useCallback(() => {
    setColors(DEFAULT_COLORS);
    setTypography({
      ...DEFAULT_TYPOGRAPHY,
      steps: generateTypographySteps(DEFAULT_TYPOGRAPHY.baseSize, DEFAULT_TYPOGRAPHY.scaleRatio),
    });
    localStorage.removeItem("chromaType-designSystem");
  }, []);

  return {
    colors,
    typography,
    updateColor,
    addColor,
    removeColor,
    applyPreset,
    updateTypography,
    getContrastResults,
    getColorByRole,
    reset,
  };
}

export type DesignSystem = ReturnType<typeof useDesignSystem>;
