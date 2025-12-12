import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OnboardingDashboard } from './OnboardingDashboard';
import { OffboardingDashboard } from './OffboardingDashboard';
import { PlaybookBuilder } from './PlaybookBuilder';
import { AssetTracker } from './AssetTracker';
import { UserPlus, UserMinus, BookOpen, Laptop } from 'lucide-react';

export function LifecycleHub() {
  const [activeTab, setActiveTab] = useState('onboarding');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Employee Lifecycle</h1>
        <p className="text-muted-foreground">
          Manage onboarding, offboarding playbooks and asset tracking
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="onboarding" className="gap-2">
            <UserPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Onboarding</span>
          </TabsTrigger>
          <TabsTrigger value="offboarding" className="gap-2">
            <UserMinus className="h-4 w-4" />
            <span className="hidden sm:inline">Offboarding</span>
          </TabsTrigger>
          <TabsTrigger value="playbooks" className="gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Playbooks</span>
          </TabsTrigger>
          <TabsTrigger value="assets" className="gap-2">
            <Laptop className="h-4 w-4" />
            <span className="hidden sm:inline">Assets</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="onboarding" className="mt-0">
          <OnboardingDashboard />
        </TabsContent>

        <TabsContent value="offboarding" className="mt-0">
          <OffboardingDashboard />
        </TabsContent>

        <TabsContent value="playbooks" className="mt-0">
          <PlaybookBuilder />
        </TabsContent>

        <TabsContent value="assets" className="mt-0">
          <AssetTracker />
        </TabsContent>
      </Tabs>
    </div>
  );
}
