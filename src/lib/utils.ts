import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Escape a string for safe interpolation into HTML.
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const HEX_COLOR_REGEX = /^#[0-9a-fA-F]{3,8}$/;

/**
 * Validate that a string is a safe hex color value.
 */
export function isValidHex(hex: string): boolean {
  return HEX_COLOR_REGEX.test(hex);
}

/**
 * Sanitize a hex color — returns the value if valid, fallback otherwise.
 */
export function sanitizeHex(hex: string, fallback = "#808080"): string {
  return isValidHex(hex) ? hex : fallback;
}

const VALID_COLOR_ROLES = [
  "background",
  "surface",
  "text",
  "textMuted",
  "primary",
  "secondary",
  "accent",
] as const;

/**
 * Check if a value is a valid color role.
 */
export function isValidColorRole(role: string): boolean {
  return (VALID_COLOR_ROLES as readonly string[]).includes(role);
}

/**
 * Validate that a URL uses http or https scheme.
 */
export function isValidHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}
