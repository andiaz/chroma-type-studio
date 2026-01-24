import { useEffect } from "react";
import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DesignSystem, SCALE_RATIOS, GOOGLE_FONTS } from "@/hooks/useDesignSystem";

interface TypographyPanelProps {
  designSystem: DesignSystem;
}

export function TypographyPanel({ designSystem }: TypographyPanelProps) {
  const { typography, updateTypography } = designSystem;

  // Load fonts dynamically
  useEffect(() => {
    const fonts = [typography.headingFont, typography.bodyFont].filter(Boolean);
    const uniqueFonts = [...new Set(fonts)];
    
    uniqueFonts.forEach(font => {
      const link = document.createElement("link");
      link.href = `https://fonts.googleapis.com/css2?family=${font.replace(/ /g, "+")}:wght@400;500;600;700&display=swap`;
      link.rel = "stylesheet";
      
      // Check if already loaded
      if (!document.querySelector(`link[href="${link.href}"]`)) {
        document.head.appendChild(link);
      }
    });
  }, [typography.headingFont, typography.bodyFont]);

  const scaleRatioName = Object.entries(SCALE_RATIOS).find(
    ([, value]) => Math.abs(value - typography.scaleRatio) < 0.01
  )?.[0] || "Custom";

  return (
    <ScrollArea className="flex-1">
      <div className="p-4 space-y-6">
        {/* Header */}
        <div>
          <h2 className="font-display font-semibold text-lg mb-1">Typography Scale</h2>
          <p className="text-sm text-muted-foreground">
            Configure fonts and generate a modular type scale.
          </p>
        </div>

        {/* Font Selection */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Fonts
          </h3>
          
          <div className="space-y-3">
            <div className="space-y-2">
              <Label className="text-xs">Heading Font</Label>
              <Select
                value={typography.headingFont}
                onValueChange={(value) => updateTypography({ headingFont: value })}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {GOOGLE_FONTS.map((font) => (
                    <SelectItem key={font} value={font}>
                      <span style={{ fontFamily: font }}>{font}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Body Font</Label>
              <Select
                value={typography.bodyFont}
                onValueChange={(value) => updateTypography({ bodyFont: value })}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {GOOGLE_FONTS.map((font) => (
                    <SelectItem key={font} value={font}>
                      <span style={{ fontFamily: font }}>{font}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Scale Settings */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Scale
          </h3>

          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-xs">Base Size</Label>
                <span className="text-xs text-muted-foreground font-mono">{typography.baseSize}px</span>
              </div>
              <Slider
                value={[typography.baseSize]}
                min={12}
                max={24}
                step={1}
                onValueChange={([baseSize]) => updateTypography({ baseSize })}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Scale Ratio</Label>
              <Select
                value={typography.scaleRatio.toString()}
                onValueChange={(value) => updateTypography({ scaleRatio: parseFloat(value) })}
              >
                <SelectTrigger className="h-9">
                  <SelectValue>
                    {scaleRatioName} ({typography.scaleRatio.toFixed(3)})
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SCALE_RATIOS).map(([name, value]) => (
                    <SelectItem key={name} value={value.toString()}>
                      {name} ({value})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Type Scale Preview */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Generated Scale
          </h3>

          <div className="space-y-3 p-4 rounded-lg bg-muted/50 border border-border">
            {typography.steps.slice().reverse().map((step, index) => (
              <motion.div
                key={step.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-baseline gap-3"
              >
                <span className="text-[10px] font-mono text-muted-foreground w-8 text-right flex-shrink-0">
                  {step.name}
                </span>
                <span
                  className="truncate"
                  style={{
                    fontFamily: step.name.includes("xl") || step.name === "lg" 
                      ? typography.headingFont 
                      : typography.bodyFont,
                    fontSize: `${step.size}px`,
                    lineHeight: step.lineHeight,
                    fontWeight: step.name.includes("xl") ? 600 : 400,
                  }}
                >
                  Aa
                </span>
                <span className="text-[10px] font-mono text-muted-foreground ml-auto flex-shrink-0">
                  {step.size.toFixed(1)}px
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Font Preview */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Preview
          </h3>

          <div className="space-y-4 p-4 rounded-lg bg-muted/50 border border-border">
            <div>
              <p 
                className="text-2xl font-semibold mb-1"
                style={{ fontFamily: typography.headingFont }}
              >
                The quick brown fox
              </p>
              <p 
                className="text-sm text-muted-foreground"
                style={{ fontFamily: typography.bodyFont }}
              >
                Jumps over the lazy dog. Pack my box with five dozen liquor jugs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
