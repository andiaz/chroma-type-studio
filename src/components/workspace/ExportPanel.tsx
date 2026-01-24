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
  FileJson
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
    <div className="relative rounded-lg border border-border overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-muted/50 border-b border-border">
        <span className="text-xs text-muted-foreground font-mono">{language}</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs gap-1.5"
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
      <pre className="p-4 overflow-x-auto text-xs font-mono bg-muted/30">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export function ExportPanel({ designSystem }: ExportPanelProps) {
  const { colors, typography, getContrastResults } = designSystem;
  const [exportFormat, setExportFormat] = useState("css");

  const contrastResults = useMemo(() => getContrastResults(), [getContrastResults]);
  const hasIssues = contrastResults.some(r => !r.aa);
  const failingCount = contrastResults.filter(r => !r.aaLarge).length;

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

    return `:root {
  /* Colors */
${colorVars}

  /* Fonts */
${fontVars}

  /* Type Scale */
${scaleVars}

  /* Line Heights */
${lineHeightVars}
}`;
  }, [colors, typography]);

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

    return `// Colors
${colorVars}

// Fonts
${fontVars}

// Type Scale
${scaleVars}`;
  }, [colors, typography]);

  // Generate JSON
  const jsonCode = useMemo(() => {
    return JSON.stringify({
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
    }, null, 2);
  }, [colors, typography]);

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
      <div className="p-4 space-y-6">
        {/* Header */}
        <div>
          <h2 className="font-display font-semibold text-lg mb-1">Export</h2>
          <p className="text-sm text-muted-foreground">
            Export your design system as code.
          </p>
        </div>

        {/* Status */}
        <div className={cn(
          "p-4 rounded-lg border flex items-start gap-3",
          hasIssues 
            ? "bg-warning/10 border-warning/30" 
            : "bg-success/10 border-success/30"
        )}>
          {hasIssues ? (
            <>
              <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0" />
              <div>
                <p className="font-medium text-warning-foreground">Accessibility Issues</p>
                <p className="text-sm text-warning-foreground/90">
                  {failingCount} color combination{failingCount !== 1 ? "s" : ""} fail WCAG requirements.
                  Review the A11y tab before exporting.
                </p>
              </div>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
              <div>
                <p className="font-medium text-success-foreground">Ready to Export</p>
                <p className="text-sm text-success-foreground/90">
                  All color combinations meet WCAG AA standards.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Export Tabs */}
        <Tabs value={exportFormat} onValueChange={setExportFormat}>
          <TabsList className="w-full grid grid-cols-3">
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
