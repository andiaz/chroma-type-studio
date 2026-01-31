import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CheckCircle2, AlertTriangle, Eye, EyeOff } from "lucide-react";
import { DesignSystem } from "@/hooks/useDesignSystem";
import {
  VisionType,
  VISION_TYPES,
  simulateColorBlindness,
  analyzeColorPalette,
} from "@/lib/colorBlindness";
import { cn } from "@/lib/utils";

interface ColorBlindnessPanelProps {
  designSystem: DesignSystem;
}

export function ColorBlindnessPanel({ designSystem }: ColorBlindnessPanelProps) {
  const { colors, visionSimulation, setVisionSimulation } = designSystem;
  const [selectedVision, setSelectedVision] = useState<VisionType>("deuteranopia");
  const [showComparison, setShowComparison] = useState(true);
  const [simulatePreview, setSimulatePreview] = useState(false);

  // Update the live preview simulation when toggled
  const handleSimulatePreviewToggle = () => {
    const newValue = !simulatePreview;
    setSimulatePreview(newValue);
    setVisionSimulation(newValue ? selectedVision : "normal");
  };

  // Update preview when vision type changes (if preview simulation is enabled)
  const handleVisionChange = (value: VisionType) => {
    setSelectedVision(value);
    if (simulatePreview) {
      setVisionSimulation(value);
    }
  };

  // Simulate colors for the selected vision type
  const simulatedColors = useMemo(() => {
    return colors.map(color => ({
      ...color,
      simulated: simulateColorBlindness(color.hex, selectedVision),
    }));
  }, [colors, selectedVision]);

  // Analyze the palette for issues
  const analysis = useMemo(() => {
    return analyzeColorPalette(
      colors.map(c => ({ name: c.name, hex: c.hex })),
      selectedVision
    );
  }, [colors, selectedVision]);

  // Analyze all vision types
  const allAnalyses = useMemo(() => {
    return VISION_TYPES.filter(v => v.value !== 'normal').map(visionType => ({
      ...visionType,
      analysis: analyzeColorPalette(
        colors.map(c => ({ name: c.name, hex: c.hex })),
        visionType.value
      ),
    }));
  }, [colors]);

  const hasAnyIssues = allAnalyses.some(a => !a.analysis.isAccessible);

  return (
    <ScrollArea className="flex-1">
      <div className="p-4 space-y-6">
        {/* Header */}
        <div>
          <h2 className="font-display font-semibold text-lg mb-1">
            Color Blindness Simulator
          </h2>
          <p className="text-sm text-muted-foreground">
            Preview how your palette appears to people with color vision deficiency.
          </p>
        </div>

        {/* Overall Status */}
        <div
          className={cn(
            "p-4 rounded-lg border flex items-start gap-3",
            hasAnyIssues
              ? "bg-warning/10 border-warning/30"
              : "bg-success/10 border-success/30"
          )}
        >
          {hasAnyIssues ? (
            <>
              <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0" />
              <div>
                <p className="font-medium text-warning-foreground">
                  Potential Issues Detected
                </p>
                <p className="text-sm text-warning-foreground/90">
                  Some colors may be hard to distinguish for people with color vision deficiency.
                </p>
              </div>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
              <div>
                <p className="font-medium text-success-foreground">
                  Palette is Accessible
                </p>
                <p className="text-sm text-success-foreground/90">
                  All colors are distinguishable across vision types.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Simulate in Preview Toggle */}
        <div className="p-3 rounded-lg border border-border bg-muted/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Simulate in Live Preview</p>
              <p className="text-xs text-muted-foreground">
                Apply simulation to the preview panel
              </p>
            </div>
            <Button
              variant={simulatePreview ? "default" : "outline"}
              size="sm"
              className="gap-2"
              onClick={handleSimulatePreviewToggle}
            >
              {simulatePreview ? (
                <>
                  <Eye className="w-4 h-4" />
                  On
                </>
              ) : (
                <>
                  <EyeOff className="w-4 h-4" />
                  Off
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Vision Type Summary */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Vision Types
          </h3>
          <div className="grid gap-2">
            {allAnalyses.map(({ value, label, description, analysis }) => (
              <button
                key={value}
                onClick={() => handleVisionChange(value)}
                className={cn(
                  "p-3 rounded-lg border text-left transition-colors",
                  selectedVision === value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{label}</p>
                    <p className="text-xs text-muted-foreground">{description}</p>
                  </div>
                  {analysis.isAccessible ? (
                    <Badge className="bg-success/20 text-success border-success/30 gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      OK
                    </Badge>
                  ) : (
                    <Badge className="bg-warning/20 text-warning border-warning/30 gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {analysis.issues.length} issue{analysis.issues.length !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Comparison Toggle */}
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Show Comparison</Label>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setShowComparison(!showComparison)}
          >
            {showComparison ? (
              <>
                <Eye className="w-4 h-4" />
                Side by Side
              </>
            ) : (
              <>
                <EyeOff className="w-4 h-4" />
                Simulated Only
              </>
            )}
          </Button>
        </div>

        {/* Color Comparison */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Palette Preview: {VISION_TYPES.find(v => v.value === selectedVision)?.label}
          </h3>
          <div className="space-y-2">
            {simulatedColors.map(color => (
              <motion.div
                key={color.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg border border-border bg-card"
              >
                <div className="flex items-center gap-3">
                  {showComparison && (
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground mb-1">Original</p>
                      <div
                        className="h-10 rounded-md border border-border"
                        style={{ backgroundColor: color.hex }}
                      />
                      <p className="text-xs font-mono mt-1 text-muted-foreground">
                        {color.hex}
                      </p>
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-1">
                      {showComparison ? "Simulated" : color.name}
                    </p>
                    <div
                      className="h-10 rounded-md border border-border"
                      style={{ backgroundColor: color.simulated }}
                    />
                    <p className="text-xs font-mono mt-1 text-muted-foreground">
                      {color.simulated}
                    </p>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm font-medium">{color.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {color.role}
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Issues Detail */}
        {analysis.issues.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Potential Issues
            </h3>
            <div className="space-y-2">
              {analysis.issues.map((issue, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg border border-warning/30 bg-warning/5"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center -space-x-1">
                      <div
                        className="w-8 h-8 rounded-lg border-2 border-card shadow-sm"
                        style={{ backgroundColor: issue.color1.simulated }}
                        title={`${issue.color1.name} (simulated)`}
                      />
                      <div
                        className="w-8 h-8 rounded-lg border-2 border-card shadow-sm"
                        style={{ backgroundColor: issue.color2.simulated }}
                        title={`${issue.color2.name} (simulated)`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">
                        {issue.color1.name} & {issue.color2.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        May appear similar ({issue.difference.toFixed(1)}% difference)
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="p-4 rounded-lg border border-border bg-muted/30">
          <h4 className="font-medium text-sm mb-2">Tips for Color Blind Accessibility</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>- Use sufficient contrast between colors</li>
            <li>- Don't rely on color alone to convey information</li>
            <li>- Add patterns, icons, or labels alongside colors</li>
            <li>- Test with real users when possible</li>
          </ul>
        </div>
      </div>
    </ScrollArea>
  );
}
