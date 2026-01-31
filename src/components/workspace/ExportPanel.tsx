import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Copy,
  Check,
  Download,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  FileJson,
  FileText,
  Wind,
  Link2
} from "lucide-react";
import { DesignSystem } from "@/hooks/useDesignSystem";
import { cn } from "@/lib/utils";

interface ExportPanelProps {
  designSystem: DesignSystem;
}

function CodeBlock({
  code,
  language
}: {
  code: string;
  language: string;
}) {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative rounded-lg border border-border overflow-hidden min-w-0 w-full">
      <div className="flex items-center justify-between px-3 py-2 bg-muted/50 border-b border-border">
        <span className="text-xs text-muted-foreground font-mono">{language}</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs gap-1.5 flex-shrink-0"
          onClick={copyCode}
        >
          {copied ? (
            <>
              <Check className="w-3 h-3" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              Copy
            </>
          )}
        </Button>
      </div>
      <div className="max-h-64 overflow-auto bg-muted/30">
        <pre className="p-4 text-xs font-mono whitespace-pre-wrap break-all overflow-hidden">
          <code className="block">{code}</code>
        </pre>
      </div>
    </div>
  );
}

export function ExportPanel({ designSystem }: ExportPanelProps) {
  const { colors, typography, getContrastResults, colorScales, colorScalesEnabled, fullColorSystem, fullSystemEnabled, getShareUrl } = designSystem;
  const [exportFormat, setExportFormat] = useState("css");
  const [linkCopied, setLinkCopied] = useState(false);

  const copyShareLink = () => {
    const url = getShareUrl();
    navigator.clipboard.writeText(url);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const contrastResults = useMemo(() => getContrastResults(), [getContrastResults]);
  const failingCount = contrastResults.filter(r => !r.aa).length;
  const hasIssues = failingCount > 0;

  // Default spacing scale (based on Refactoring UI)
  const spacingScale = [4, 8, 16, 24, 32, 40, 48, 64, 96, 128, 192, 256, 384, 512, 640, 768];

  // Generate CSS variables
  const cssCode = useMemo(() => {
    const colorVars = colors.map(c =>
      `  --color-${c.role}: ${c.hex};`
    ).join("\n");

    const fontVars = `  --font-heading: "${typography.headingFont}", sans-serif;
  --font-body: "${typography.bodyFont}", sans-serif;`;

    const scaleVars = typography.steps.map(s =>
      `  --text-${s.name}: ${s.size.toFixed(2)}px;`
    ).join("\n");

    const lineHeightVars = typography.steps.map(s =>
      `  --leading-${s.name}: ${s.lineHeight};`
    ).join("\n");

    const spacingVars = spacingScale.map(s =>
      `  --space-${s}: ${s}px;`
    ).join("\n");

    // Generate color scale variables if enabled
    let colorScaleVars = "";
    if (colorScalesEnabled && colorScales) {
      const scaleLines: string[] = [];
      for (const scale of colorScales.scales) {
        scaleLines.push(`  /* ${scale.name} scale */`);
        for (const shade of scale.shades) {
          scaleLines.push(`  --${scale.name}-${shade.step}: ${shade.hex};`);
        }
      }
      colorScaleVars = `\n\n  /* Color Scales (HSLuv) */\n${scaleLines.join("\n")}`;
    }

    // Generate full color system variables if enabled
    let fullSystemVars = "";
    if (fullSystemEnabled && fullColorSystem) {
      const systemLines: string[] = ["\n\n  /* Full Color System (HSLuv) */"];
      for (const [name, scale] of Object.entries(fullColorSystem)) {
        systemLines.push(`  /* ${name} */`);
        for (const shade of scale.shades) {
          systemLines.push(`  --${name}-${shade.step}: ${shade.hex};`);
        }
      }
      fullSystemVars = systemLines.join("\n");
    }

    return `:root {
  /* Colors */
${colorVars}

  /* Fonts */
${fontVars}

  /* Type Scale */
${scaleVars}

  /* Line Heights */
${lineHeightVars}

  /* Spacing */
${spacingVars}${colorScaleVars}${fullSystemVars}
}`;
  }, [colors, typography, colorScales, colorScalesEnabled, fullColorSystem, fullSystemEnabled]);

  // Generate SCSS variables
  const scssCode = useMemo(() => {
    const colorVars = colors.map(c =>
      `$color-${c.role}: ${c.hex};`
    ).join("\n");

    const fontVars = `$font-heading: "${typography.headingFont}", sans-serif;
$font-body: "${typography.bodyFont}", sans-serif;`;

    const scaleVars = typography.steps.map(s =>
      `$text-${s.name}: ${s.size.toFixed(2)}px;`
    ).join("\n");

    const spacingVars = spacingScale.map(s =>
      `$space-${s}: ${s}px;`
    ).join("\n");

    // Generate color scale variables if enabled
    let colorScaleVars = "";
    if (colorScalesEnabled && colorScales) {
      const scaleLines: string[] = [];
      for (const scale of colorScales.scales) {
        scaleLines.push(`// ${scale.name} scale`);
        for (const shade of scale.shades) {
          scaleLines.push(`$${scale.name}-${shade.step}: ${shade.hex};`);
        }
        scaleLines.push("");
      }
      colorScaleVars = `\n// Color Scales (HSLuv)\n${scaleLines.join("\n")}`;
    }

    // Generate full color system variables if enabled
    let fullSystemVars = "";
    if (fullSystemEnabled && fullColorSystem) {
      const systemLines: string[] = ["\n// Full Color System (HSLuv)"];
      for (const [name, scale] of Object.entries(fullColorSystem)) {
        systemLines.push(`// ${name}`);
        for (const shade of scale.shades) {
          systemLines.push(`$${name}-${shade.step}: ${shade.hex};`);
        }
        systemLines.push("");
      }
      fullSystemVars = systemLines.join("\n");
    }

    return `// Colors
${colorVars}

// Fonts
${fontVars}

// Type Scale
${scaleVars}

// Spacing
${spacingVars}${colorScaleVars}${fullSystemVars}`;
  }, [colors, typography, colorScales, colorScalesEnabled, fullColorSystem, fullSystemEnabled]);

  // Generate JSON
  const jsonCode = useMemo(() => {
    const baseExport = {
      colors: colors.reduce((acc, c) => ({
        ...acc,
        [c.role]: {
          name: c.name,
          hex: c.hex,
          hsl: c.hsl,
        },
      }), {}),
      typography: {
        fonts: {
          heading: typography.headingFont,
          body: typography.bodyFont,
        },
        scale: typography.steps.reduce((acc, s) => ({
          ...acc,
          [s.name]: {
            size: s.size,
            lineHeight: s.lineHeight,
          },
        }), {}),
        baseSize: typography.baseSize,
        scaleRatio: typography.scaleRatio,
      },
      spacing: spacingScale.reduce((acc, s) => ({
        ...acc,
        [s]: `${s}px`,
      }), {}),
    };

    let result = { ...baseExport };

    // Add color scales if enabled
    if (colorScalesEnabled && colorScales) {
      const scales = colorScales.scales.reduce((acc, scale) => ({
        ...acc,
        [scale.name]: {
          baseHue: scale.baseHue,
          saturation: scale.saturation,
          shades: scale.shades.reduce((shadeAcc, shade) => ({
            ...shadeAcc,
            [shade.step]: shade.hex,
          }), {}),
        },
      }), {});

      result = {
        ...result,
        colorScales: {
          harmonyType: colorScales.config.type,
          scales,
        },
      };
    }

    // Add full color system if enabled
    if (fullSystemEnabled && fullColorSystem) {
      const fullSystem = Object.entries(fullColorSystem).reduce((acc, [name, scale]) => ({
        ...acc,
        [name]: {
          baseHue: scale.baseHue,
          saturation: scale.saturation,
          shades: scale.shades.reduce((shadeAcc, shade) => ({
            ...shadeAcc,
            [shade.step]: shade.hex,
          }), {}),
        },
      }), {});

      result = {
        ...result,
        fullColorSystem: fullSystem,
      };
    }

    return JSON.stringify(result, null, 2);
  }, [colors, typography, colorScales, colorScalesEnabled, fullColorSystem, fullSystemEnabled]);

  // Generate complete HTML demo page
  const htmlCode = useMemo(() => {
    const googleFontsUrl = `https://fonts.googleapis.com/css2?family=${typography.headingFont.replace(/ /g, "+")}:wght@400;500;600;700&family=${typography.bodyFont.replace(/ /g, "+")}:wght@400;500;600;700&display=swap`;

    const getSize = (name: string) => {
      const step = typography.steps.find(s => s.name === name);
      return step ? step.size.toFixed(2) : "16";
    };

    const getLineHeight = (name: string) => {
      const step = typography.steps.find(s => s.name === name);
      return step ? step.lineHeight : 1.5;
    };

    const bg = colors.find(c => c.role === "background")?.hex || "#FAFAF9";
    const surface = colors.find(c => c.role === "surface")?.hex || "#FFFFFF";
    const text = colors.find(c => c.role === "text")?.hex || "#1A1A2E";
    const textMuted = colors.find(c => c.role === "textMuted")?.hex || "#6B7280";
    const primary = colors.find(c => c.role === "primary")?.hex || "#5B4CDB";
    const secondary = colors.find(c => c.role === "secondary")?.hex || "#F97316";
    const accent = colors.find(c => c.role === "accent")?.hex || "#14B8A6";

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Design System Demo</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="${googleFontsUrl}" rel="stylesheet">
  <style>
${cssCode}

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      background-color: var(--color-background);
      color: var(--color-text);
      font-family: var(--font-body);
      font-size: var(--text-base);
      line-height: ${getLineHeight("base")};
    }

    /* Header */
    .header {
      position: sticky;
      top: 0;
      z-index: 10;
      padding: var(--space-16) var(--space-24);
      background-color: var(--color-surface);
      border-bottom: 1px solid ${text}15;
    }

    .header-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      max-width: 1200px;
      margin: 0 auto;
    }

    .logo {
      font-family: var(--font-heading);
      font-size: var(--text-lg);
      font-weight: 600;
      color: var(--color-primary);
    }

    .nav {
      display: flex;
      align-items: center;
      gap: var(--space-24);
    }

    .nav a {
      color: var(--color-text);
      text-decoration: none;
      font-size: var(--text-sm);
      transition: opacity 0.2s;
    }

    .nav a:hover {
      opacity: 0.7;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: var(--space-8);
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 500;
      font-size: var(--text-sm);
      text-decoration: none;
      transition: opacity 0.2s;
      border: none;
      cursor: pointer;
    }

    .btn:hover {
      opacity: 0.9;
    }

    .btn-primary {
      background-color: var(--color-primary);
      color: var(--color-surface);
    }

    .btn-outline {
      background: transparent;
      border: 1px solid ${text}20;
      color: var(--color-text);
    }

    .btn-header {
      padding: 8px 16px;
    }

    /* Hero */
    .hero {
      padding: var(--space-64) var(--space-24);
      text-align: center;
      max-width: 800px;
      margin: 0 auto;
    }

    .badge {
      display: inline-block;
      padding: var(--space-4) var(--space-16);
      border-radius: 999px;
      background-color: ${accent}20;
      color: var(--color-accent);
      font-size: var(--text-sm);
      font-weight: 500;
      margin-bottom: var(--space-16);
    }

    .hero h1 {
      font-family: var(--font-heading);
      font-size: var(--text-4xl);
      font-weight: 700;
      line-height: ${getLineHeight("4xl")};
      margin-bottom: var(--space-16);
    }

    .hero h1 span {
      color: var(--color-primary);
    }

    .hero p {
      color: var(--color-textMuted);
      font-size: var(--text-lg);
      line-height: ${getLineHeight("lg")};
      margin-bottom: var(--space-32);
    }

    .hero-buttons {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-16);
    }

    /* Features */
    .features {
      padding: var(--space-48) var(--space-24);
      background-color: ${text}05;
    }

    .features-inner {
      max-width: 1200px;
      margin: 0 auto;
    }

    .features h2 {
      font-family: var(--font-heading);
      font-size: var(--text-2xl);
      font-weight: 700;
      text-align: center;
      margin-bottom: var(--space-32);
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: var(--space-16);
    }

    .feature-card {
      padding: var(--space-24);
      background-color: var(--color-surface);
      border: 1px solid ${text}10;
      border-radius: 12px;
    }

    .feature-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: var(--space-16);
      font-size: var(--text-lg);
    }

    .feature-card h3 {
      font-family: var(--font-heading);
      font-size: var(--text-lg);
      font-weight: 600;
      margin-bottom: var(--space-8);
    }

    .feature-card p {
      color: var(--color-textMuted);
      font-size: var(--text-sm);
    }

    /* Pricing */
    .pricing {
      padding: var(--space-48) var(--space-24);
    }

    .pricing-card {
      max-width: 360px;
      margin: 0 auto;
      padding: var(--space-24);
      background-color: var(--color-surface);
      border: 2px solid var(--color-primary);
      border-radius: 16px;
    }

    .pricing-badge {
      display: inline-block;
      padding: var(--space-4) var(--space-16);
      background-color: var(--color-secondary);
      color: var(--color-surface);
      font-size: var(--text-xs);
      font-weight: 500;
      border-radius: 999px;
      margin-bottom: var(--space-16);
    }

    .pricing-card h3 {
      font-family: var(--font-heading);
      font-size: var(--text-xl);
      font-weight: 700;
      margin-bottom: var(--space-8);
    }

    .pricing-amount {
      display: flex;
      align-items: baseline;
      gap: var(--space-4);
      margin-bottom: var(--space-16);
    }

    .pricing-amount .price {
      font-family: var(--font-heading);
      font-size: var(--text-3xl);
      font-weight: 700;
    }

    .pricing-amount .period {
      color: var(--color-textMuted);
      font-size: var(--text-sm);
    }

    .pricing-features {
      list-style: none;
      margin-bottom: var(--space-24);
    }

    .pricing-features li {
      display: flex;
      align-items: center;
      gap: var(--space-8);
      font-size: var(--text-sm);
      margin-bottom: var(--space-8);
    }

    .pricing-features li svg {
      flex-shrink: 0;
    }

    .pricing-card .btn {
      width: 100%;
      justify-content: center;
      padding: var(--space-16);
    }

    /* Footer */
    .footer {
      padding: var(--space-32) var(--space-24);
      border-top: 1px solid ${text}15;
      color: var(--color-textMuted);
      font-size: var(--text-sm);
    }

    .footer-inner {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .footer-links {
      display: flex;
      gap: var(--space-16);
    }

    .footer-links a {
      color: var(--color-textMuted);
      text-decoration: none;
      transition: opacity 0.2s;
    }

    .footer-links a:hover {
      opacity: 0.7;
    }
  </style>
</head>
<body>
  <!-- Header -->
  <header class="header">
    <div class="header-inner">
      <div class="logo">Brand</div>
      <nav class="nav">
        <a href="#">Features</a>
        <a href="#">Pricing</a>
        <button class="btn btn-primary btn-header">Get Started</button>
      </nav>
    </div>
  </header>

  <!-- Hero -->
  <section class="hero">
    <span class="badge">New Release</span>
    <h1>Build something<br><span>amazing</span> today</h1>
    <p>The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.</p>
    <div class="hero-buttons">
      <button class="btn btn-primary">Get Started <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></button>
      <button class="btn btn-outline">Learn More</button>
    </div>
  </section>

  <!-- Features -->
  <section class="features">
    <div class="features-inner">
      <h2>Features</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon" style="background-color: ${primary}20;">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${primary}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          </div>
          <h3>Fast</h3>
          <p>Lightning quick performance</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon" style="background-color: ${secondary}20;">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${secondary}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          </div>
          <h3>Secure</h3>
          <p>Enterprise-grade security</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon" style="background-color: ${accent}20;">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${accent}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          </div>
          <h3>Simple</h3>
          <p>Easy to get started</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Pricing -->
  <section class="pricing">
    <div class="pricing-card">
      <span class="pricing-badge">Popular</span>
      <h3>Pro Plan</h3>
      <div class="pricing-amount">
        <span class="price">$29</span>
        <span class="period">/month</span>
      </div>
      <ul class="pricing-features">
        <li><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${accent}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Unlimited projects</li>
        <li><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${accent}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Priority support</li>
        <li><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${accent}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Advanced analytics</li>
      </ul>
      <button class="btn btn-primary">Subscribe</button>
    </div>
  </section>

  <!-- Footer -->
  <footer class="footer">
    <div class="footer-inner">
      <p>© 2025 Brand. All rights reserved.</p>
      <div class="footer-links">
        <a href="#">Privacy</a>
        <a href="#">Terms</a>
      </div>
    </div>
  </footer>
</body>
</html>`;
  }, [colors, typography, cssCode]);

  // Generate Tailwind config
  const tailwindConfig = useMemo(() => {
    const colorEntries = colors.map(c =>
      `        '${c.role}': '${c.hex}',`
    ).join("\n");

    const fontSizeEntries = typography.steps.map(s =>
      `        '${s.name}': ['${s.size.toFixed(2)}px', { lineHeight: '${s.lineHeight}' }],`
    ).join("\n");

    // Generate color scale entries if enabled
    let colorScaleEntries = "";
    if (colorScalesEnabled && colorScales) {
      const scaleLines: string[] = [];
      for (const scale of colorScales.scales) {
        scaleLines.push(`        '${scale.name}': {`);
        for (const shade of scale.shades) {
          scaleLines.push(`          '${shade.step}': '${shade.hex}',`);
        }
        scaleLines.push(`        },`);
      }
      colorScaleEntries = scaleLines.join("\n");
    }

    // Generate full color system entries if enabled
    let fullSystemEntries = "";
    if (fullSystemEnabled && fullColorSystem) {
      const systemLines: string[] = [];
      for (const [name, scale] of Object.entries(fullColorSystem)) {
        systemLines.push(`        '${name}': {`);
        for (const shade of scale.shades) {
          systemLines.push(`          '${shade.step}': '${shade.hex}',`);
        }
        systemLines.push(`        },`);
      }
      fullSystemEntries = systemLines.join("\n");
    }

    const allColorEntries = [colorEntries, colorScaleEntries, fullSystemEntries]
      .filter(Boolean)
      .join("\n");

    return `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
${allColorEntries}
      },
      fontFamily: {
        'heading': ['${typography.headingFont}', 'sans-serif'],
        'body': ['${typography.bodyFont}', 'sans-serif'],
      },
      fontSize: {
${fontSizeEntries}
      },
      spacing: {
${spacingScale.map(s => `        '${s}': '${s}px',`).join("\n")}
      },
    },
  },
  plugins: [],
};`;
  }, [colors, typography, colorScales, colorScalesEnabled, fullColorSystem, fullSystemEnabled]);

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ScrollArea className="flex-1">
      <div className="p-4 space-y-6 overflow-hidden">
        {/* Header */}
        <div>
          <h2 className="font-display font-semibold text-lg mb-1">Export</h2>
          <p className="text-sm text-muted-foreground">
            Export your design system as code.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant={linkCopied ? "default" : "outline"}
            size="sm"
            className="gap-1.5"
            onClick={copyShareLink}
          >
            {linkCopied ? (
              <>
                <Check className="w-4 h-4" />
                Link Copied!
              </>
            ) : (
              <>
                <Link2 className="w-4 h-4" />
                Share Link
              </>
            )}
          </Button>
          {hasIssues && (
            <span className="text-xs text-warning flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              {failingCount} contrast issue{failingCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Export Tabs */}
        <Tabs value={exportFormat} onValueChange={setExportFormat} className="overflow-hidden min-w-0">
          <TabsList className="w-full grid grid-cols-5">
            <TabsTrigger value="css" className="gap-1.5 text-xs">
              <FileCode className="w-4 h-4" />
              CSS
            </TabsTrigger>
            <TabsTrigger value="scss" className="gap-1.5 text-xs">
              <FileCode className="w-4 h-4" />
              SCSS
            </TabsTrigger>
            <TabsTrigger value="json" className="gap-1.5 text-xs">
              <FileJson className="w-4 h-4" />
              JSON
            </TabsTrigger>
            <TabsTrigger value="tailwind" className="gap-1.5 text-xs">
              <Wind className="w-4 h-4" />
              Tailwind
            </TabsTrigger>
            <TabsTrigger value="html" className="gap-1.5 text-xs">
              <FileText className="w-4 h-4" />
              HTML
            </TabsTrigger>
          </TabsList>

          <TabsContent value="css" className="mt-4 space-y-4">
            <CodeBlock code={cssCode} language="CSS Variables" />
            <Button 
              className="w-full" 
              onClick={() => downloadFile(cssCode, "design-system.css")}
            >
              <Download className="w-4 h-4 mr-2" />
              Download CSS
            </Button>
          </TabsContent>

          <TabsContent value="scss" className="mt-4 space-y-4">
            <CodeBlock code={scssCode} language="SCSS Variables" />
            <Button 
              className="w-full" 
              onClick={() => downloadFile(scssCode, "design-system.scss")}
            >
              <Download className="w-4 h-4 mr-2" />
              Download SCSS
            </Button>
          </TabsContent>

          <TabsContent value="json" className="mt-4 space-y-4">
            <CodeBlock code={jsonCode} language="JSON" />
            <Button
              className="w-full"
              onClick={() => downloadFile(jsonCode, "design-system.json")}
            >
              <Download className="w-4 h-4 mr-2" />
              Download JSON
            </Button>
          </TabsContent>

          <TabsContent value="tailwind" className="mt-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              Tailwind CSS configuration file. Add to your project's <code className="px-1 py-0.5 bg-muted rounded text-xs">tailwind.config.js</code>
            </p>
            <CodeBlock code={tailwindConfig} language="tailwind.config.js" />
            <Button
              className="w-full"
              onClick={() => downloadFile(tailwindConfig, "tailwind.config.js")}
            >
              <Download className="w-4 h-4 mr-2" />
              Download Tailwind Config
            </Button>
          </TabsContent>

          <TabsContent value="html" className="mt-4 space-y-4 overflow-hidden min-w-0">
            <p className="text-sm text-muted-foreground">
              Complete HTML demo page with embedded styles and fonts. Open in any browser.
            </p>
            <CodeBlock code={htmlCode} language="HTML" />
            <Button
              className="w-full"
              onClick={() => downloadFile(htmlCode, "design-system-demo.html")}
            >
              <Download className="w-4 h-4 mr-2" />
              Download HTML Demo
            </Button>
          </TabsContent>
        </Tabs>

        {/* Summary */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Summary
          </h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-muted-foreground">Colors</p>
              <p className="font-semibold">{colors.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-muted-foreground">Type Steps</p>
              <p className="font-semibold">{typography.steps.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-muted-foreground">Heading Font</p>
              <p className="font-semibold truncate">{typography.headingFont}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-muted-foreground">Body Font</p>
              <p className="font-semibold truncate">{typography.bodyFont}</p>
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
