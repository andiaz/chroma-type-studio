import { useMemo } from "react";
import { motion } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertTriangle, Info } from "lucide-react";
import { DesignSystem, ContrastResult } from "@/hooks/useDesignSystem";
import { cn } from "@/lib/utils";

interface AccessibilityPanelProps {
  designSystem: DesignSystem;
}

function ContrastBadge({ 
  ratio, 
  aa, 
  aaLarge, 
  aaa 
}: { 
  ratio: number; 
  aa: boolean; 
  aaLarge: boolean; 
  aaa: boolean; 
}) {
  if (aaa) {
    return (
      <Badge className="bg-success/20 text-success border-success/30 gap-1">
        <CheckCircle2 className="w-3 h-3" />
        AAA
      </Badge>
    );
  }
  if (aa) {
    return (
      <Badge className="bg-success/20 text-success border-success/30 gap-1">
        <CheckCircle2 className="w-3 h-3" />
        AA
      </Badge>
    );
  }
  if (aaLarge) {
    return (
      <Badge className="bg-warning/20 text-warning border-warning/30 gap-1">
        <AlertTriangle className="w-3 h-3" />
        AA Large
      </Badge>
    );
  }
  return (
    <Badge className="bg-destructive/20 text-destructive border-destructive/30 gap-1">
      <XCircle className="w-3 h-3" />
      Fail
    </Badge>
  );
}

function ContrastCard({ result }: { result: ContrastResult }) {
  const isPass = result.aa;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p-3 rounded-lg border transition-colors",
        isPass 
          ? "bg-card border-border" 
          : "bg-destructive/5 border-destructive/20"
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Color swatches */}
          <div className="flex items-center -space-x-1">
            <div 
              className="w-8 h-8 rounded-lg border-2 border-card shadow-sm"
              style={{ backgroundColor: result.color1.hex }}
              title={result.color1.name}
            />
            <div 
              className="w-8 h-8 rounded-lg border-2 border-card shadow-sm"
              style={{ backgroundColor: result.color2.hex }}
              title={result.color2.name}
            />
          </div>
          
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">
              {result.color1.name} on {result.color2.name}
            </p>
            <p className="text-xs text-muted-foreground font-mono">
              {result.ratio.toFixed(2)}:1
            </p>
          </div>
        </div>

        <ContrastBadge 
          ratio={result.ratio}
          aa={result.aa}
          aaLarge={result.aaLarge}
          aaa={result.aaa}
        />
      </div>

      {/* Sample text preview */}
      <div 
        className="mt-3 p-2 rounded text-center text-sm"
        style={{ 
          backgroundColor: result.color2.hex,
          color: result.color1.hex,
        }}
      >
        Sample Text
      </div>
    </motion.div>
  );
}

export function AccessibilityPanel({ designSystem }: AccessibilityPanelProps) {
  const contrastResults = useMemo(() => designSystem.getContrastResults(), [designSystem]);

  const stats = useMemo(() => {
    const total = contrastResults.length;
    const passing = contrastResults.filter(r => r.aa).length;
    const aaaCount = contrastResults.filter(r => r.aaa).length;
    const failing = contrastResults.filter(r => !r.aaLarge).length;
    
    return { total, passing, aaaCount, failing };
  }, [contrastResults]);

  const passingResults = contrastResults.filter(r => r.aa);
  const warningResults = contrastResults.filter(r => !r.aa && r.aaLarge);
  const failingResults = contrastResults.filter(r => !r.aaLarge);

  return (
    <ScrollArea className="flex-1">
      <div className="p-4 space-y-6">
        {/* Header */}
        <div>
          <h2 className="font-display font-semibold text-lg mb-1">Accessibility (a11y)</h2>
          <p className="text-sm text-muted-foreground">
            Check if your colors meet WCAG contrast requirements for readable, inclusive design.
          </p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-success/10 border border-success/20 text-center">
            <p className="text-2xl font-bold text-success">{stats.passing}</p>
            <p className="text-xs text-foreground/70">Passing</p>
          </div>
          <div className="p-3 rounded-lg bg-warning/10 border border-warning/20 text-center">
            <p className="text-2xl font-bold text-warning-foreground">{warningResults.length}</p>
            <p className="text-xs text-warning-foreground/90">Large Only</p>
          </div>
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-center">
            <p className="text-2xl font-bold text-foreground">{stats.failing}</p>
            <p className="text-xs text-foreground/70">Failing</p>
          </div>
        </div>

        {/* Info box */}
        <div className="flex gap-3 p-3 rounded-lg bg-muted/50 border border-border">
          <Info className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
          <div className="text-xs text-muted-foreground space-y-2">
            <div>
              <p className="font-medium text-foreground mb-1">What is a11y?</p>
              <p>
                "a11y" is short for "accessibility" (a + 11 letters + y). It refers to designing products that everyone can use, including people with visual impairments.
              </p>
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">What is WCAG?</p>
              <p>
                WCAG (Web Content Accessibility Guidelines) are international standards for making web content accessible. They define minimum contrast ratios between text and backgrounds:
              </p>
              <ul className="mt-1 space-y-0.5 ml-3">
                <li><strong>AA:</strong> 4.5:1 for normal text, 3:1 for large text</li>
                <li><strong>AAA:</strong> 7:1 for normal text, 4.5:1 for large text</li>
              </ul>
            </div>
            <p>
              <a
                href="https://www.w3.org/WAI/WCAG21/quickref/#contrast-minimum"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Learn more about WCAG →
              </a>
            </p>
          </div>
        </div>

        {/* Failing Combinations */}
        {failingResults.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-destructive uppercase tracking-wide flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              Failing ({failingResults.length})
            </h3>
            <div className="space-y-2">
              {failingResults.map((result, index) => (
                <ContrastCard key={`fail-${index}`} result={result} />
              ))}
            </div>
          </div>
        )}

        {/* Warning Combinations */}
        {warningResults.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-warning uppercase tracking-wide flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Large Text Only ({warningResults.length})
            </h3>
            <div className="space-y-2">
              {warningResults.map((result, index) => (
                <ContrastCard key={`warn-${index}`} result={result} />
              ))}
            </div>
          </div>
        )}

        {/* Passing Combinations */}
        {passingResults.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-success uppercase tracking-wide flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Passing ({passingResults.length})
            </h3>
            <div className="space-y-2">
              {passingResults.map((result, index) => (
                <ContrastCard key={`pass-${index}`} result={result} />
              ))}
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
