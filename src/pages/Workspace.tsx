import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Palette,
  Type,
  CheckCircle2,
  Download,
  ArrowLeft,
  Monitor,
  Tablet,
  Smartphone,
  RotateCcw,
  Paintbrush,
  Eye,
} from 'lucide-react';
import { PalettePanel } from '@/components/workspace/PalettePanel';
import { TypographyPanel } from '@/components/workspace/TypographyPanel';
import { AccessibilityPanel } from '@/components/workspace/AccessibilityPanel';
import { ExportPanel } from '@/components/workspace/ExportPanel';
import { LivePreview } from '@/components/workspace/LivePreview';
import { useDesignSystem } from '@/hooks/useDesignSystem';

type PreviewSize = 'desktop' | 'tablet' | 'mobile';

export default function Workspace() {
  const [activeTab, setActiveTab] = useState('palette');
  const [previewSize, setPreviewSize] = useState<PreviewSize>('desktop');
  const [isMobile, setIsMobile] = useState(false);
  const [mobileView, setMobileView] = useState<'controls' | 'preview'>(
    'controls',
  );
  const designSystem = useDesignSystem();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const previewWidths: Record<PreviewSize, string> = {
    desktop: '100%',
    tablet: '768px',
    mobile: '375px',
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className="h-14 border-b border-border flex items-center justify-between px-4 flex-shrink-0 bg-card">
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
              variant={previewSize === 'desktop' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => setPreviewSize('desktop')}
              title="Desktop preview"
            >
              <Monitor className="w-4 h-4" />
            </Button>
            <Button
              variant={previewSize === 'tablet' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => setPreviewSize('tablet')}
              title="Tablet preview"
            >
              <Tablet className="w-4 h-4" />
            </Button>
            <Button
              variant={previewSize === 'mobile' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => setPreviewSize('mobile')}
              title="Mobile preview"
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
      <div className="flex-1 min-h-0">
        {isMobile ? (
          // Mobile: Tab-based view
          <div className="h-full flex flex-col">
            {/* Mobile Tab Switcher */}
            <div className="flex border-b border-border bg-card">
              <button
                onClick={() => setMobileView('controls')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-medium text-sm transition-colors ${
                  mobileView === 'controls'
                    ? 'bg-muted/50 text-foreground border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                }`}
              >
                <Paintbrush className="w-4 h-4" />
                <span>Controls</span>
              </button>
              <button
                onClick={() => setMobileView('preview')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-medium text-sm transition-colors ${
                  mobileView === 'preview'
                    ? 'bg-muted/50 text-foreground border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                }`}
              >
                <Eye className="w-4 h-4" />
                <span>Preview</span>
              </button>
            </div>

            {/* Mobile Content */}
            <div className="flex-1 min-h-0">
              {mobileView === 'controls' ? (
                <div className="h-full bg-card flex flex-col">
                  <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="flex-1 flex flex-col min-h-0"
                  >
                    <div className="border-b border-border px-4 pt-3 pb-0 flex-shrink-0">
                      <TabsList className="w-full grid grid-cols-4 h-10">
                        <TabsTrigger
                          value="palette"
                          className="gap-1.5 text-xs"
                        >
                          <Palette className="w-4 h-4" />
                        </TabsTrigger>
                        <TabsTrigger
                          value="typography"
                          className="gap-1.5 text-xs"
                        >
                          <Type className="w-4 h-4" />
                        </TabsTrigger>
                        <TabsTrigger
                          value="accessibility"
                          className="gap-1.5 text-xs"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </TabsTrigger>
                        <TabsTrigger value="export" className="gap-1.5 text-xs">
                          <Download className="w-4 h-4" />
                        </TabsTrigger>
                      </TabsList>
                    </div>

                    <div className="flex-1 min-h-0 overflow-hidden">
                      <TabsContent
                        value="palette"
                        className="h-full m-0 overflow-y-auto"
                      >
                        <PalettePanel designSystem={designSystem} />
                      </TabsContent>
                      <TabsContent
                        value="typography"
                        className="h-full m-0 overflow-y-auto"
                      >
                        <TypographyPanel designSystem={designSystem} />
                      </TabsContent>
                      <TabsContent
                        value="accessibility"
                        className="h-full m-0 overflow-y-auto"
                      >
                        <AccessibilityPanel designSystem={designSystem} />
                      </TabsContent>
                      <TabsContent
                        value="export"
                        className="h-full m-0 overflow-y-auto"
                      >
                        <ExportPanel designSystem={designSystem} />
                      </TabsContent>
                    </div>
                  </Tabs>
                </div>
              ) : (
                <div className="h-full flex flex-col bg-muted/30">
                  <div className="flex-1 p-4 overflow-auto">
                    <div className="bg-card border border-border rounded-xl shadow-lg overflow-hidden h-full min-h-[500px]">
                      <LivePreview designSystem={designSystem} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Floating Action Button */}
            <button
              onClick={() =>
                setMobileView(
                  mobileView === 'controls' ? 'preview' : 'controls',
                )
              }
              className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform z-50"
              aria-label={
                mobileView === 'controls' ? 'View Preview' : 'View Controls'
              }
            >
              {mobileView === 'controls' ? (
                <Eye className="w-6 h-6" />
              ) : (
                <Paintbrush className="w-6 h-6" />
              )}
            </button>
          </div>
        ) : (
          // Desktop: Resizable panels
          <ResizablePanelGroup direction="horizontal" className="h-full">
            {/* Control Panel */}
            <ResizablePanel
              defaultSize={35}
              minSize={25}
              maxSize={50}
              className="bg-card flex flex-col"
            >
              {/* Panel Header */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
                <Paintbrush className="w-4 h-4 text-primary" />
                <span className="font-medium text-sm">
                  Design System Builder
                </span>
              </div>

              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="flex-1 flex flex-col min-h-0"
              >
                <div className="border-b border-border px-4 pt-3 pb-0 flex-shrink-0">
                  <TabsList className="w-full grid grid-cols-4 h-10">
                    <TabsTrigger value="palette" className="gap-1.5 text-xs">
                      <Palette className="w-4 h-4" />
                      <span className="hidden lg:inline">Palette</span>
                    </TabsTrigger>
                    <TabsTrigger value="typography" className="gap-1.5 text-xs">
                      <Type className="w-4 h-4" />
                      <span className="hidden lg:inline">Type</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="accessibility"
                      className="gap-1.5 text-xs"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="hidden lg:inline">A11y</span>
                    </TabsTrigger>
                    <TabsTrigger value="export" className="gap-1.5 text-xs">
                      <Download className="w-4 h-4" />
                      <span className="hidden lg:inline">Export</span>
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="flex-1 min-h-0 overflow-hidden">
                  <TabsContent
                    value="palette"
                    className="h-full m-0 overflow-y-auto"
                  >
                    <PalettePanel designSystem={designSystem} />
                  </TabsContent>
                  <TabsContent
                    value="typography"
                    className="h-full m-0 overflow-y-auto"
                  >
                    <TypographyPanel designSystem={designSystem} />
                  </TabsContent>
                  <TabsContent
                    value="accessibility"
                    className="h-full m-0 overflow-y-auto"
                  >
                    <AccessibilityPanel designSystem={designSystem} />
                  </TabsContent>
                  <TabsContent
                    value="export"
                    className="h-full m-0 overflow-y-auto"
                  >
                    <ExportPanel designSystem={designSystem} />
                  </TabsContent>
                </div>
              </Tabs>
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Preview Panel */}
            <ResizablePanel
              defaultSize={65}
              minSize={40}
              className="flex flex-col"
            >
              {/* Preview Header */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
                <Eye className="w-4 h-4 text-accent" />
                <span className="font-medium text-sm">Live Preview</span>
                <span className="text-xs text-muted-foreground ml-2">
                  Changes update in real-time
                </span>
              </div>

              <div className="flex-1 bg-muted/30 p-6 overflow-auto">
                <motion.div
                  className="mx-auto h-full"
                  style={{ maxWidth: previewWidths[previewSize] }}
                  layout
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  <div className="bg-card border border-border rounded-xl shadow-lg overflow-hidden h-full min-h-[600px]">
                    <LivePreview designSystem={designSystem} />
                  </div>
                </motion.div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </div>
    </div>
  );
}
