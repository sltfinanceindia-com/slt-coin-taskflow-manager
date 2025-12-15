import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChangeRequestList } from './ChangeRequestList';
import { ChangeRequestForm } from './ChangeRequestForm';
import { ScopeChangeLog } from './ScopeChangeLog';
import { List, Plus, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useProjects } from '@/hooks/useProjects';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { FolderOpen } from 'lucide-react';

export function ChangeRequestHub() {
  const [activeTab, setActiveTab] = useState('requests');
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  
  const { projects } = useProjects();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Change Requests</h1>
          <p className="text-muted-foreground">
            Manage scope changes, impact analysis, and approval workflows
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects?.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={showNewRequest} onOpenChange={setShowNewRequest}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Request
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Submit Change Request</DialogTitle>
              </DialogHeader>
              <ChangeRequestForm onSuccess={() => setShowNewRequest(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-grid">
          <TabsTrigger value="requests" className="gap-1.5 px-2 sm:px-3">
            <List className="h-4 w-4 shrink-0" />
            <span className="text-xs sm:text-sm">Requests</span>
          </TabsTrigger>
          <TabsTrigger value="log" className="gap-1.5 px-2 sm:px-3">
            <History className="h-4 w-4 shrink-0" />
            <span className="text-xs sm:text-sm">Log</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="mt-0">
          <ChangeRequestList 
            projectId={selectedProjectId === 'all' ? undefined : selectedProjectId || undefined}
          />
        </TabsContent>

        <TabsContent value="log" className="mt-0">
          {selectedProjectId && selectedProjectId !== 'all' ? (
            <ScopeChangeLog projectId={selectedProjectId} />
          ) : (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Select a Project</h3>
                  <p className="text-muted-foreground">
                    Choose a specific project to view its change log
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
