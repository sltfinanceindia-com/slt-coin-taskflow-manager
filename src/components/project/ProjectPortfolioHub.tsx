import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Briefcase, Layers, FolderOpen, BarChart3 } from 'lucide-react';
import { PortfolioDashboard } from './PortfolioDashboard';
import { PortfolioManagement } from './PortfolioManagement';
import { ProgramManagement } from './ProgramManagement';
import { ProjectCharter } from './ProjectCharter';
import { Portfolio } from '@/hooks/usePortfolios';
import { Program } from '@/hooks/usePrograms';
import { EnhancedProject } from '@/hooks/useEnhancedProjects';

type ViewLevel = 'dashboard' | 'portfolios' | 'programs' | 'projects';

interface NavigationState {
  level: ViewLevel;
  portfolioId?: string;
  portfolioName?: string;
  programId?: string;
  programName?: string;
}

export const ProjectPortfolioHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'portfolios' | 'programs' | 'projects'>('overview');
  const [navState, setNavState] = useState<NavigationState>({ level: 'dashboard' });

  const handleSelectPortfolio = (portfolio: Portfolio) => {
    setNavState({
      level: 'programs',
      portfolioId: portfolio.id,
      portfolioName: portfolio.name,
    });
    setActiveTab('programs');
  };

  const handleSelectProgram = (program: Program) => {
    setNavState({
      ...navState,
      level: 'projects',
      programId: program.id,
      programName: program.name,
    });
    setActiveTab('projects');
  };

  const handleSelectProject = (project: EnhancedProject) => {
    // Could navigate to project details or task view
    console.log('Selected project:', project);
  };

  const handleBackToPortfolios = () => {
    setNavState({ level: 'portfolios' });
    setActiveTab('portfolios');
  };

  const handleBackToPrograms = () => {
    setNavState({
      level: 'programs',
      portfolioId: navState.portfolioId,
      portfolioName: navState.portfolioName,
    });
    setActiveTab('programs');
  };

  const resetNavigation = () => {
    setNavState({ level: 'dashboard' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Project Portfolio Hub</h1>
          <p className="text-muted-foreground mt-1">
            Manage portfolios, programs, and projects in one place
          </p>
        </div>

        <Tabs 
          value={activeTab} 
          onValueChange={(v) => {
            setActiveTab(v as typeof activeTab);
            resetNavigation();
          }}
          className="w-full"
        >
          <TabsList className="grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="overview" className="gap-1.5 px-2 sm:px-3">
              <BarChart3 className="h-4 w-4 shrink-0" />
              <span className="text-xs sm:text-sm truncate">View</span>
            </TabsTrigger>
            <TabsTrigger value="portfolios" className="gap-1.5 px-2 sm:px-3">
              <Briefcase className="h-4 w-4 shrink-0" />
              <span className="text-xs sm:text-sm truncate">Folios</span>
            </TabsTrigger>
            <TabsTrigger value="programs" className="gap-1.5 px-2 sm:px-3">
              <Layers className="h-4 w-4 shrink-0" />
              <span className="text-xs sm:text-sm truncate">Progs</span>
            </TabsTrigger>
            <TabsTrigger value="projects" className="gap-1.5 px-2 sm:px-3">
              <FolderOpen className="h-4 w-4 shrink-0" />
              <span className="text-xs sm:text-sm truncate">Projs</span>
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="overview" className="m-0">
              <PortfolioDashboard />
            </TabsContent>

            <TabsContent value="portfolios" className="m-0">
              <PortfolioManagement onSelectPortfolio={handleSelectPortfolio} />
            </TabsContent>

            <TabsContent value="programs" className="m-0">
              <ProgramManagement
                portfolioId={navState.portfolioId}
                portfolioName={navState.portfolioName}
                onBack={navState.portfolioId ? handleBackToPortfolios : undefined}
                onSelectProgram={handleSelectProgram}
              />
            </TabsContent>

            <TabsContent value="projects" className="m-0">
              <ProjectCharter
                programId={navState.programId}
                programName={navState.programName}
                onBack={navState.programId ? handleBackToPrograms : undefined}
                onSelectProject={handleSelectProject}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default ProjectPortfolioHub;
