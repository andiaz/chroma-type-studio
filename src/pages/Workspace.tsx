import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Palette, 
  Type, 
  CheckCircle2, 
  Download,
  ArrowLeft,
  Monitor,
  Tablet,
  Smartphone,
  RotateCcw
} from "lucide-react";
import { PalettePanel } from "@/components/workspace/PalettePanel";
import { TypographyPanel } from "@/components/workspace/TypographyPanel";
import { AccessibilityPanel } from "@/components/workspace/AccessibilityPanel";
import { ExportPanel } from "@/components/workspace/ExportPanel";
import { LivePreview } from "@/components/workspace/LivePreview";
import { useDesignSystem } from "@/hooks/useDesignSystem";

type PreviewSize = "desktop" | "tablet" | "mobile";

export default function Workspace() {
  const [activeTab, setActiveTab] = useState("palette");
  const [previewSize, setPreviewSize] = useState<PreviewSize>("desktop");
  const designSystem = useDesignSystem();

  const previewWidths: Record<PreviewSize, string> = {
    desktop: "100%",
    tablet: "768px",
    mobile: "375px",
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className="h-14 border-b border-border flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </Link>
          </Button>
          <div className="h-6 w-px bg-border" />
          <h1 className="font-display font-semibold text-lg">
            <span className="text-gradient-primary">ChromaType</span> Studio
          </h1>
        </div>

        {/* Preview size controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 rounded-lg bg-muted">
            <Button
              variant={previewSize === "desktop" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setPreviewSize("desktop")}
            >
              <Monitor className="w-4 h-4" />
            </Button>
            <Button
              variant={previewSize === "tablet" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setPreviewSize("tablet")}
            >
              <Tablet className="w-4 h-4" />
            </Button>
            <Button
              variant={previewSize === "mobile" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setPreviewSize("mobile")}
            >
              <Smartphone className="w-4 h-4" />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={designSystem.reset}
            title="Reset to defaults"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Control Panel */}
          <ResizablePanel 
            defaultSize={35} 
            minSize={25} 
            maxSize={50}
            className="bg-card"
          >
            <div className="h-full flex flex-col">
              <Tabs 
                value={activeTab} 
                onValueChange={setActiveTab}
                className="flex-1 flex flex-col"
              >
                <div className="border-b border-border px-4 pt-4">
                  <TabsList className="w-full grid grid-cols-4 h-10">
                    <TabsTrigger value="palette" className="gap-1.5 text-xs">
                      <Palette className="w-4 h-4" />
                      <span className="hidden lg:inline">Palette</span>
                    </TabsTrigger>
                    <TabsTrigger value="typography" className="gap-1.5 text-xs">
                      <Type className="w-4 h-4" />
                      <span className="hidden lg:inline">Type</span>
                    </TabsTrigger>
                    <TabsTrigger value="accessibility" className="gap-1.5 text-xs">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="hidden lg:inline">A11y</span>
                    </TabsTrigger>
                    <TabsTrigger value="export" className="gap-1.5 text-xs">
                      <Download className="w-4 h-4" />
                      <span className="hidden lg:inline">Export</span>
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="flex-1 overflow-hidden">
                  <TabsContent value="palette" className="h-full m-0 data-[state=active]:flex flex-col">
                    <PalettePanel designSystem={designSystem} />
                  </TabsContent>
                  <TabsContent value="typography" className="h-full m-0 data-[state=active]:flex flex-col">
                    <TypographyPanel designSystem={designSystem} />
                  </TabsContent>
                  <TabsContent value="accessibility" className="h-full m-0 data-[state=active]:flex flex-col">
                    <AccessibilityPanel designSystem={designSystem} />
                  </TabsContent>
                  <TabsContent value="export" className="h-full m-0 data-[state=active]:flex flex-col">
                    <ExportPanel designSystem={designSystem} />
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Preview Panel */}
          <ResizablePanel defaultSize={65} minSize={40}>
            <div className="h-full bg-muted/30 p-6 overflow-auto">
              <motion.div
                className="mx-auto h-full"
                style={{ maxWidth: previewWidths[previewSize] }}
                layout
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <div className="bg-card border border-border rounded-xl shadow-lg overflow-hidden h-full">
                  <LivePreview designSystem={designSystem} />
                </div>
              </motion.div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
