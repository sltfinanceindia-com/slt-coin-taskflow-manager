import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { cn } from '@/lib/utils';
import { 
  Menu, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Maximize2,
  Minimize2,
  Settings,
  Search,
  Filter,
  MoreHorizontal,
  Sun,
  Moon,
  Monitor
} from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { useIsMobile } from '@/hooks/use-mobile';

interface ModernThreePanelProps {
  leftPanel: React.ReactNode;
  centerPanel: React.ReactNode;
  rightPanel?: React.ReactNode;
  leftPanelTitle?: string;
  centerPanelTitle?: string;
  rightPanelTitle?: string;
  leftPanelWidth?: number;
  rightPanelWidth?: number;
  showRightPanel?: boolean;
  onRightPanelToggle?: () => void;
  className?: string;
}

export default function ModernThreePanel({
  leftPanel,
  centerPanel,
  rightPanel,
  leftPanelTitle = "Channels",
  centerPanelTitle = "Messages",
  rightPanelTitle = "Details",
  leftPanelWidth = 280,
  rightPanelWidth = 320,
  showRightPanel = false,
  onRightPanelToggle,
  className
}: ModernThreePanelProps) {
  const { theme, setTheme } = useTheme();
  const isMobile = useIsMobile();
  const [leftCollapsed, setLeftCollapsed] = useState(isMobile);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [density, setDensity] = useState<'compact' | 'comfortable'>('comfortable');

  // Auto-collapse on mobile
  useEffect(() => {
    if (isMobile) {
      setLeftCollapsed(true);
    }
  }, [isMobile]);

  const toggleTheme = () => {
    const themes = ['light', 'dark', 'system'] as const;
    const currentIndex = themes.indexOf(theme as any);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    setTheme(nextTheme);
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light': return <Sun className="h-4 w-4" />;
      case 'dark': return <Moon className="h-4 w-4" />;
      default: return <Monitor className="h-4 w-4" />;
    }
  };

  return (
    <div className={cn(
      "h-screen bg-gradient-background flex flex-col overflow-hidden",
      isFullscreen && "fixed inset-0 z-50",
      className
    )}>
      {/* Global Header */}
      <div className="h-14 bg-card/95 backdrop-blur-sm border-b border-border/50 flex items-center justify-between px-4 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLeftCollapsed(!leftCollapsed)}
            className="hover-scale"
          >
            {leftCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </Button>
          
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold bg-gradient-primary bg-clip-text text-transparent">
              Team Communication
            </h1>
            <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
              Beta
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Density Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDensity(density === 'compact' ? 'comfortable' : 'compact')}
            className="hidden md:flex"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="hover-scale"
          >
            {getThemeIcon()}
          </Button>

          {/* Fullscreen Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="hidden lg:flex hover-scale"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>

          {/* Settings */}
          <Button variant="ghost" size="sm" className="hover-scale">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex-1 overflow-hidden">
        {isMobile ? (
          // Mobile Layout - Stack panels
          <div className="h-full relative">
            {/* Mobile Left Panel Overlay */}
            {!leftCollapsed && (
              <>
                <div 
                  className="absolute inset-0 bg-black/50 z-40 animate-fade-in"
                  onClick={() => setLeftCollapsed(true)}
                />
                <Card className="absolute left-0 top-0 bottom-0 w-80 z-50 rounded-none border-r shadow-xl animate-slide-in-right">
                  <div className="h-full overflow-hidden">
                    <div className="p-4 border-b border-border flex items-center justify-between">
                      <h2 className="font-semibold">{leftPanelTitle}</h2>
                      <Button variant="ghost" size="sm" onClick={() => setLeftCollapsed(true)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      {leftPanel}
                    </div>
                  </div>
                </Card>
              </>
            )}

            {/* Mobile Center Panel */}
            <div className="h-full">
              <div className="h-full overflow-hidden">
                <div className="p-4 border-b border-border bg-card/95 backdrop-blur-sm">
                  <h2 className="font-semibold">{centerPanelTitle}</h2>
                </div>
                <div className="flex-1 overflow-hidden">
                  {centerPanel}
                </div>
              </div>
            </div>

            {/* Mobile Right Panel Modal */}
            {showRightPanel && rightPanel && (
              <div className="absolute inset-0 z-50">
                <div 
                  className="absolute inset-0 bg-black/50 animate-fade-in"
                  onClick={onRightPanelToggle}
                />
                <Card className="absolute right-0 top-0 bottom-0 w-80 rounded-none border-l shadow-xl animate-slide-in-right">
                  <div className="h-full overflow-hidden">
                    <div className="p-4 border-b border-border flex items-center justify-between">
                      <h2 className="font-semibold">{rightPanelTitle}</h2>
                      <Button variant="ghost" size="sm" onClick={onRightPanelToggle}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      {rightPanel}
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        ) : (
          // Desktop Layout - Resizable panels
          <ResizablePanelGroup direction="horizontal" className="h-full">
            {/* Left Panel */}
            <ResizablePanel 
              defaultSize={leftCollapsed ? 5 : 25} 
              minSize={5}
              maxSize={40}
              className={cn(
                "transition-all duration-300 ease-in-out",
                leftCollapsed && "max-w-16"
              )}
            >
              <div className="h-full bg-card/50 backdrop-blur-sm border-r border-border/50 overflow-hidden">
                {leftCollapsed ? (
                  // Collapsed Left Panel
                  <div className="p-2 space-y-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full h-10 p-0 hover-scale"
                      onClick={() => setLeftCollapsed(false)}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>
                ) : (
                  // Expanded Left Panel
                  <div className="h-full flex flex-col">
                    <div className="p-4 border-b border-border/50 flex items-center justify-between">
                      <h2 className="font-semibold text-sm">{leftPanelTitle}</h2>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setLeftCollapsed(true)}
                        className="hover-scale"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      {leftPanel}
                    </div>
                  </div>
                )}
              </div>
            </ResizablePanel>

            <ResizableHandle className="w-1 bg-border/50 hover:bg-border transition-colors" />

            {/* Center Panel */}
            <ResizablePanel defaultSize={showRightPanel ? 50 : 75} minSize={30}>
              <div className="h-full bg-background/50 backdrop-blur-sm overflow-hidden">
                <div className="p-4 border-b border-border/50 bg-card/95 backdrop-blur-sm flex items-center justify-between">
                  <h2 className="font-semibold">{centerPanelTitle}</h2>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="hover-scale">
                      <Search className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="hover-scale">
                      <Filter className="h-4 w-4" />
                    </Button>
                    {rightPanel && (
                      <Button
                        variant={showRightPanel ? "default" : "ghost"}
                        size="sm"
                        onClick={onRightPanelToggle}
                        className="hover-scale"
                      >
                        Details
                      </Button>
                    )}
                  </div>
                </div>
                <div className="flex-1 overflow-hidden">
                  {centerPanel}
                </div>
              </div>
            </ResizablePanel>

            {/* Right Panel */}
            {showRightPanel && rightPanel && (
              <>
                <ResizableHandle className="w-1 bg-border/50 hover:bg-border transition-colors" />
                <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
                  <div className="h-full bg-card/50 backdrop-blur-sm border-l border-border/50 overflow-hidden">
                    <div className="p-4 border-b border-border/50 flex items-center justify-between">
                      <h2 className="font-semibold text-sm">{rightPanelTitle}</h2>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={onRightPanelToggle}
                        className="hover-scale"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      {rightPanel}
                    </div>
                  </div>
                </ResizablePanel>
              </>
            )}
          </ResizablePanelGroup>
        )}
      </div>

      {/* Status Bar */}
      <div className="h-6 bg-muted/50 border-t border-border/50 flex items-center justify-between px-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>Online</span>
          <Separator orientation="vertical" className="h-3" />
          <span>Connected to workspace</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Density: {density}</span>
          <Separator orientation="vertical" className="h-3" />
          <span>Theme: {theme}</span>
        </div>
      </div>
    </div>
  );
}