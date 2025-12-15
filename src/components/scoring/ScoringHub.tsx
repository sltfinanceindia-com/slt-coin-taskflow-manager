import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScoringModelConfig } from './ScoringModelConfig';
import { ProjectScoreCard } from './ProjectScoreCard';
import { PortfolioRanking } from './PortfolioRanking';
import { PrioritizationMatrix } from './PrioritizationMatrix';
import { ScoreComparisonChart } from './ScoreComparisonChart';
import { Settings, Target, Trophy, Grid3X3, BarChart3 } from 'lucide-react';

export function ScoringHub() {
  const [activeTab, setActiveTab] = useState('models');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Portfolio Scoring & Prioritization</h1>
        <p className="text-muted-foreground">
          Configure scoring models, score projects, and prioritize your portfolio
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
          <TabsTrigger value="models" className="gap-1.5 px-2 sm:px-3">
            <Settings className="h-4 w-4 shrink-0" />
            <span className="text-xs sm:text-sm truncate">Model</span>
          </TabsTrigger>
          <TabsTrigger value="score" className="gap-1.5 px-2 sm:px-3">
            <Target className="h-4 w-4 shrink-0" />
            <span className="text-xs sm:text-sm truncate">Score</span>
          </TabsTrigger>
          <TabsTrigger value="ranking" className="gap-1.5 px-2 sm:px-3">
            <Trophy className="h-4 w-4 shrink-0" />
            <span className="text-xs sm:text-sm truncate">Rank</span>
          </TabsTrigger>
          <TabsTrigger value="matrix" className="gap-1.5 px-2 sm:px-3">
            <Grid3X3 className="h-4 w-4 shrink-0" />
            <span className="text-xs sm:text-sm truncate">Matrix</span>
          </TabsTrigger>
          <TabsTrigger value="compare" className="gap-1.5 px-2 sm:px-3">
            <BarChart3 className="h-4 w-4 shrink-0" />
            <span className="text-xs sm:text-sm truncate">Comp</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="models" className="mt-0">
          <ScoringModelConfig />
        </TabsContent>

        <TabsContent value="score" className="mt-0">
          <ProjectScoreCard />
        </TabsContent>

        <TabsContent value="ranking" className="mt-0">
          <PortfolioRanking />
        </TabsContent>

        <TabsContent value="matrix" className="mt-0">
          <PrioritizationMatrix />
        </TabsContent>

        <TabsContent value="compare" className="mt-0">
          <ScoreComparisonChart />
        </TabsContent>
      </Tabs>
    </div>
  );
}
