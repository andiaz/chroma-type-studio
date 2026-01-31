import LZString from "lz-string";
import type { ColorEntry, TypographyScale } from "@/hooks/useDesignSystem";
import type { ColorHarmonyConfig } from "@/hooks/useColorScales";

/**
 * State that can be shared via URL
 */
export interface ShareableState {
  colors: ColorEntry[];
  typography: TypographyScale;
  colorScalesConfig: ColorHarmonyConfig;
  colorScalesEnabled: boolean;
  fullSystemEnabled: boolean;
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
 * Decode a compressed string back into design system state
 */
export function decodeState(encoded: string): ShareableState | null {
  try {
    const json = LZString.decompressFromEncodedURIComponent(encoded);
    if (!json) return null;

    const state = JSON.parse(json) as ShareableState;

    // Basic validation
    if (!state.colors || !Array.isArray(state.colors)) return null;
    if (!state.typography) return null;

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
