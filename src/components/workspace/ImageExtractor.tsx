import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Image as ImageIcon, Check, X, Wand2, Link, Loader2 } from "lucide-react";
import {
  extractColorsFromUrl,
  autoAssignRoles,
  createColorEntries,
  ExtractedColor,
} from "@/lib/colorExtraction";
import type { ColorEntry, ColorRole } from "@/hooks/useDesignSystem";
import { cn } from "@/lib/utils";

interface ImageExtractorProps {
  colors: ColorEntry[];
  onApply: (colors: ColorEntry[]) => void;
}

const ROLE_LABELS: Record<ColorRole, string> = {
  background: "Background",
  surface: "Surface",
  text: "Text",
  textMuted: "Muted",
  primary: "Primary",
  secondary: "Secondary",
  accent: "Accent",
};

export function ImageExtractor({ colors, onApply }: ImageExtractorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [extractedColors, setExtractedColors] = useState<ExtractedColor[]>([]);
  const [assignments, setAssignments] =
    useState<Partial<Record<ColorRole, ExtractedColor>>>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processImageUrl = useCallback(async (url: string) => {
    if (!url.trim()) return;

    setIsProcessing(true);
    setError(null);
    try {
      // Extract colors
      const extracted = await extractColorsFromUrl(url, 8);
      setExtractedColors(extracted);
      setImagePreview(url);

      // Auto-assign roles
      const autoAssigned = autoAssignRoles(extracted);
      setAssignments(autoAssigned);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load image");
      setImagePreview(null);
      setExtractedColors([]);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleApply = () => {
    if (assignments) {
      const newColors = createColorEntries(assignments, colors);
      onApply(newColors);
      handleReset();
    }
  };

  const handleReset = () => {
    setImageUrl("");
    setImagePreview(null);
    setExtractedColors([]);
    setAssignments(undefined);
    setError(null);
    setIsOpen(false);
  };

  const toggleAssignment = (color: ExtractedColor, role: ColorRole) => {
    setAssignments((prev) => {
      const current = prev || {};
      if (current[role]?.hex === color.hex) {
        const { [role]: _, ...rest } = current;
        return rest;
      }
      return { ...current, [role]: color };
    });
  };

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        className="w-full gap-2"
        onClick={() => setIsOpen(true)}
      >
        <ImageIcon className="w-4 h-4" />
        Extract from Image URL
      </Button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="space-y-4 p-4 rounded-lg border border-border bg-card"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-primary" />
          <h4 className="font-medium text-sm">Extract from Image</h4>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleReset}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* URL Input */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="url"
              placeholder="Paste image URL..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && processImageUrl(imageUrl)}
              className="pl-9"
            />
          </div>
          <Button
            size="sm"
            onClick={() => processImageUrl(imageUrl)}
            disabled={isProcessing || !imageUrl.trim()}
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Load"
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Enter a publicly accessible image URL (must support CORS)
        </p>
        {error && (
          <p className="text-xs text-destructive">{error}</p>
        )}
      </div>

      {imagePreview && extractedColors.length > 0 && (
        <div className="space-y-4">
          {/* Image preview */}
          <div className="relative rounded-lg overflow-hidden">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-32 object-cover"
              crossOrigin="anonymous"
            />
          </div>

          {/* Extracted colors */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Extracted colors (hover to assign roles):
            </p>
            <div className="flex flex-wrap gap-2">
              {extractedColors.map((color, i) => {
                const assignedRole = assignments
                  ? Object.entries(assignments).find(
                      ([, c]) => c?.hex === color.hex
                    )?.[0] as ColorRole | undefined
                  : undefined;

                return (
                  <div key={i} className="relative group">
                    <button
                      className={cn(
                        "w-10 h-10 rounded-lg border-2 transition-all",
                        assignedRole
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-border hover:border-primary/50"
                      )}
                      style={{ backgroundColor: color.hex }}
                      title={color.hex}
                    />
                    {assignedRole && (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[8px] bg-primary text-primary-foreground px-1 rounded">
                        {ROLE_LABELS[assignedRole].slice(0, 3)}
                      </span>
                    )}
                    {/* Role assignment dropdown */}
                    <div className="absolute top-full mt-1 left-0 z-10 hidden group-hover:block">
                      <div className="bg-popover border border-border rounded-md shadow-lg p-1 min-w-24">
                        {(Object.keys(ROLE_LABELS) as ColorRole[]).map(
                          (role) => (
                            <button
                              key={role}
                              className={cn(
                                "w-full px-2 py-1 text-xs text-left rounded hover:bg-muted",
                                assignments?.[role]?.hex === color.hex &&
                                  "bg-primary/10 text-primary"
                              )}
                              onClick={() => toggleAssignment(color, role)}
                            >
                              {ROLE_LABELS[role]}
                              {assignments?.[role]?.hex === color.hex && (
                                <Check className="w-3 h-3 inline ml-1" />
                              )}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Current assignments preview */}
          {assignments && Object.keys(assignments).length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Assigned roles:</p>
              <div className="flex flex-wrap gap-2">
                {(Object.entries(assignments) as [ColorRole, ExtractedColor][]).map(
                  ([role, color]) => (
                    <div
                      key={role}
                      className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted text-xs"
                    >
                      <div
                        className="w-3 h-3 rounded-full border border-border"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span>{ROLE_LABELS[role]}</span>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-1"
              onClick={() => {
                const auto = autoAssignRoles(extractedColors);
                setAssignments(auto);
              }}
            >
              <Wand2 className="w-3 h-3" />
              Auto-assign
            </Button>
            <Button
              size="sm"
              className="flex-1 gap-1"
              onClick={handleApply}
              disabled={!assignments || Object.keys(assignments).length === 0}
            >
              <Check className="w-3 h-3" />
              Apply
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
