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
  "General Sans",
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

const DEFAULT_COLORS: ColorEntry[] = [
  { id: "1", role: "background", name: "Background", hex: "#FAFAF9", hsl: { h: 40, s: 20, l: 98 } },
  { id: "2", role: "surface", name: "Surface", hex: "#FFFFFF", hsl: { h: 0, s: 0, l: 100 } },
  { id: "3", role: "text", name: "Text", hex: "#1A1A2E", hsl: { h: 240, s: 28, l: 14 } },
  { id: "4", role: "textMuted", name: "Text Muted", hex: "#6B7280", hsl: { h: 220, s: 9, l: 46 } },
  { id: "5", role: "primary", name: "Primary", hex: "#5B4CDB", hsl: { h: 250, s: 60, l: 45 } },
  { id: "6", role: "secondary", name: "Secondary", hex: "#F97316", hsl: { h: 25, s: 95, l: 53 } },
  { id: "7", role: "accent", name: "Accent", hex: "#14B8A6", hsl: { h: 172, s: 80, l: 40 } },
];

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
    updateTypography,
    getContrastResults,
    getColorByRole,
    reset,
  };
}

export type DesignSystem = ReturnType<typeof useDesignSystem>;
