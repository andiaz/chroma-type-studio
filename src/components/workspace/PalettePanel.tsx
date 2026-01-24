import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Plus, Trash2, ChevronDown, Copy, Check } from "lucide-react";
import { DesignSystem, ColorRole, ColorEntry } from "@/hooks/useDesignSystem";
import { cn } from "@/lib/utils";

interface PalettePanelProps {
  designSystem: DesignSystem;
}

const ROLE_LABELS: Record<ColorRole, string> = {
  background: "Background",
  surface: "Surface",
  text: "Text",
  textMuted: "Text Muted",
  primary: "Primary",
  secondary: "Secondary",
  accent: "Accent",
};

const ROLE_DESCRIPTIONS: Record<ColorRole, string> = {
  background: "Main page background",
  surface: "Cards and elevated surfaces",
  text: "Primary text color",
  textMuted: "Secondary/muted text",
  primary: "Primary brand color",
  secondary: "Secondary brand color",
  accent: "Accent for highlights",
};

function ColorCard({ 
  color, 
  onUpdate, 
  onRemove,
  canRemove 
}: { 
  color: ColorEntry;
  onUpdate: (updates: Partial<Omit<ColorEntry, "id">>) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const copyHex = () => {
    navigator.clipboard.writeText(color.hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group"
    >
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button className="w-full p-3 rounded-lg border border-border bg-card hover:border-primary/30 transition-all text-left">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-lg shadow-sm border border-border flex-shrink-0"
                style={{ backgroundColor: color.hex }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm truncate">{color.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                    {ROLE_LABELS[color.role]}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground font-mono uppercase">
                  {color.hex}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </div>
          </button>
        </PopoverTrigger>
        
        <PopoverContent className="w-80" align="start">
          <div className="space-y-4">
            {/* Color preview */}
            <div 
              className="h-20 rounded-lg border border-border"
              style={{ backgroundColor: color.hex }}
            />

            {/* Name input */}
            <div className="space-y-2">
              <Label className="text-xs">Name</Label>
              <Input
                value={color.name}
                onChange={(e) => onUpdate({ name: e.target.value })}
                className="h-8 text-sm"
              />
            </div>

            {/* Role select */}
            <div className="space-y-2">
              <Label className="text-xs">Role</Label>
              <Select
                value={color.role}
                onValueChange={(value: ColorRole) => onUpdate({ role: value })}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(ROLE_LABELS) as ColorRole[]).map((role) => (
                    <SelectItem key={role} value={role}>
                      <div>
                        <div className="font-medium">{ROLE_LABELS[role]}</div>
                        <div className="text-xs text-muted-foreground">{ROLE_DESCRIPTIONS[role]}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Hex input */}
            <div className="space-y-2">
              <Label className="text-xs">Hex</Label>
              <div className="flex gap-2">
                <Input
                  value={color.hex}
                  onChange={(e) => onUpdate({ hex: e.target.value })}
                  className="h-8 text-sm font-mono uppercase"
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 flex-shrink-0"
                  onClick={copyHex}
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </Button>
              </div>
            </div>

            {/* HSL sliders */}
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-xs">Hue</Label>
                  <span className="text-xs text-muted-foreground">{color.hsl.h}°</span>
                </div>
                <Slider
                  value={[color.hsl.h]}
                  min={0}
                  max={360}
                  step={1}
                  onValueChange={([h]) => onUpdate({ hsl: { ...color.hsl, h } })}
                  className="h-2"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-xs">Saturation</Label>
                  <span className="text-xs text-muted-foreground">{color.hsl.s}%</span>
                </div>
                <Slider
                  value={[color.hsl.s]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={([s]) => onUpdate({ hsl: { ...color.hsl, s } })}
                  className="h-2"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-xs">Lightness</Label>
                  <span className="text-xs text-muted-foreground">{color.hsl.l}%</span>
                </div>
                <Slider
                  value={[color.hsl.l]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={([l]) => onUpdate({ hsl: { ...color.hsl, l } })}
                  className="h-2"
                />
              </div>
            </div>

            {/* Delete button */}
            {canRemove && (
              <Button
                variant="destructive"
                size="sm"
                className="w-full"
                onClick={() => {
                  onRemove();
                  setIsOpen(false);
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Remove Color
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </motion.div>
  );
}

export function PalettePanel({ designSystem }: PalettePanelProps) {
  const { colors, updateColor, addColor, removeColor } = designSystem;

  // Group colors by category
  const bgColors = colors.filter(c => c.role === "background" || c.role === "surface");
  const textColors = colors.filter(c => c.role === "text" || c.role === "textMuted");
  const brandColors = colors.filter(c => 
    c.role === "primary" || c.role === "secondary" || c.role === "accent"
  );

  return (
    <ScrollArea className="flex-1">
      <div className="p-4 space-y-6">
        {/* Header */}
        <div>
          <h2 className="font-display font-semibold text-lg mb-1">Color Palette</h2>
          <p className="text-sm text-muted-foreground">
            Define colors with semantic roles for your design system.
          </p>
        </div>

        {/* Background Colors */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Backgrounds
          </h3>
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {bgColors.map((color) => (
                <ColorCard
                  key={color.id}
                  color={color}
                  onUpdate={(updates) => updateColor(color.id, updates)}
                  onRemove={() => removeColor(color.id)}
                  canRemove={bgColors.length > 1}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Text Colors */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Text
          </h3>
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {textColors.map((color) => (
                <ColorCard
                  key={color.id}
                  color={color}
                  onUpdate={(updates) => updateColor(color.id, updates)}
                  onRemove={() => removeColor(color.id)}
                  canRemove={textColors.length > 1}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Brand Colors */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Brand
          </h3>
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {brandColors.map((color) => (
                <ColorCard
                  key={color.id}
                  color={color}
                  onUpdate={(updates) => updateColor(color.id, updates)}
                  onRemove={() => removeColor(color.id)}
                  canRemove={brandColors.length > 1}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Add color button */}
        <Button
          variant="outline"
          className="w-full"
          onClick={() => addColor("accent")}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Color
        </Button>
      </div>
    </ScrollArea>
  );
}
