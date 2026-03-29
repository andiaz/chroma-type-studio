import LZString from "lz-string";
import type { ColorEntry, TypographyScale } from "@/hooks/useDesignSystem";
import type { ColorHarmonyConfig } from "@/hooks/useColorScales";
import { isValidHex, isValidColorRole } from "@/lib/utils";

/**
 * State that can be shared via URL
 */
export interface ShareableState {
  colors: ColorEntry[];
  typography: TypographyScale;
  colorScalesConfig: ColorHarmonyConfig;
  colorScalesEnabled: boolean;
  fullSystemEnabled: boolean;
  logoText?: string;
}

/**
 * Encode the design system state into a URL-safe compressed string
 */
export function encodeState(state: ShareableState): string {
  try {
    const json = JSON.stringify(state);
    const compressed = LZString.compressToEncodedURIComponent(json);
    return compressed;
  } catch (error) {
    console.error("Failed to encode state:", error);
    return "";
  }
}

/**
 * Validate a color entry from untrusted input
 */
function isValidColorEntry(c: unknown): c is ColorEntry {
  if (!c || typeof c !== "object") return false;
  const entry = c as Record<string, unknown>;
  return (
    typeof entry.id === "string" &&
    typeof entry.role === "string" &&
    isValidColorRole(entry.role) &&
    typeof entry.name === "string" &&
    entry.name.length <= 50 &&
    typeof entry.hex === "string" &&
    isValidHex(entry.hex) &&
    entry.hsl != null &&
    typeof entry.hsl === "object" &&
    typeof (entry.hsl as Record<string, unknown>).h === "number" &&
    typeof (entry.hsl as Record<string, unknown>).s === "number" &&
    typeof (entry.hsl as Record<string, unknown>).l === "number"
  );
}

/**
 * Validate typography data from untrusted input
 */
function isValidTypography(t: unknown): t is TypographyScale {
  if (!t || typeof t !== "object") return false;
  const typo = t as Record<string, unknown>;
  return (
    typeof typo.baseSize === "number" &&
    typo.baseSize >= 4 && typo.baseSize <= 100 &&
    typeof typo.scaleRatio === "number" &&
    typo.scaleRatio >= 1 && typo.scaleRatio <= 3 &&
    typeof typo.headingFont === "string" &&
    typo.headingFont.length <= 100 &&
    typeof typo.bodyFont === "string" &&
    typo.bodyFont.length <= 100
  );
}

/**
 * Decode a compressed string back into design system state
 */
export function decodeState(encoded: string): ShareableState | null {
  try {
    const json = LZString.decompressFromEncodedURIComponent(encoded);
    if (!json) return null;

    // Reject excessively large payloads (max ~50KB decompressed)
    if (json.length > 50000) return null;

    const state = JSON.parse(json) as ShareableState;

    // Validate colors
    if (!state.colors || !Array.isArray(state.colors)) return null;
    if (state.colors.length > 50) return null;
    if (!state.colors.every(isValidColorEntry)) return null;

    // Validate typography
    if (!isValidTypography(state.typography)) return null;

    // Validate optional logoText
    if (state.logoText !== undefined) {
      if (typeof state.logoText !== "string" || state.logoText.length > 100) {
        return null;
      }
    }

    // Validate optional color scales config
    if (state.colorScalesConfig !== undefined) {
      const cfg = state.colorScalesConfig as Record<string, unknown>;
      const validTypes = ["complementary", "analogous", "triadic", "split-complementary"];
      if (typeof cfg.type !== "string" || !validTypes.includes(cfg.type)) return null;
      if (typeof cfg.baseHue !== "number" || cfg.baseHue < 0 || cfg.baseHue > 360) return null;
      if (typeof cfg.saturation !== "number" || cfg.saturation < 0 || cfg.saturation > 100) return null;
    }

    return state;
  } catch (error) {
    console.error("Failed to decode state:", error);
    return null;
  }
}

/**
 * Generate a shareable URL with the current state
 */
export function generateShareUrl(state: ShareableState): string {
  const encoded = encodeState(state);
  // Use the base URL from Vite config (handles GitHub Pages subpath)
  const basePath = import.meta.env.BASE_URL || "/";
  const workspacePath = basePath.endsWith("/")
    ? `${basePath}workspace`
    : `${basePath}/workspace`;

  if (!encoded) return `${window.location.origin}${workspacePath}`;
  return `${window.location.origin}${workspacePath}#${encoded}`;
}

/**
 * Extract state from the current URL hash
 */
export function getStateFromUrl(): ShareableState | null {
  const hash = window.location.hash.slice(1); // Remove the '#'
  if (!hash) return null;
  return decodeState(hash);
}

/**
 * Update the URL hash with the current state (without page reload)
 */
export function updateUrlHash(state: ShareableState): void {
  const encoded = encodeState(state);
  if (encoded) {
    window.history.replaceState(null, "", `#${encoded}`);
  }
}

/**
 * Clear the URL hash
 */
export function clearUrlHash(): void {
  window.history.replaceState(null, "", window.location.pathname);
}
