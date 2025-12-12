import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sparkles,
  Clock,
  Bell,
  UserPlus,
  AlertTriangle,
  CheckCircle,
  Zap,
  ArrowRight
} from 'lucide-react';
import { useAutomation, AUTOMATION_TEMPLATES } from '@/hooks/useAutomation';

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  'Notifications': Bell,
  'Assignments': UserPlus,
  'Reminders': Clock,
  'Escalations': AlertTriangle,
};

export const RuleTemplates = () => {
  const { createRule } = useAutomation();
  const [selectedTemplate, setSelectedTemplate] = useState<typeof AUTOMATION_TEMPLATES[0] | null>(null);
  const [customName, setCustomName] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSelectTemplate = (template: typeof AUTOMATION_TEMPLATES[0]) => {
    setSelectedTemplate(template);
    setCustomName(template.name);
    setDialogOpen(true);
  };

  const handleApplyTemplate = async () => {
    if (!selectedTemplate) return;

    await createRule.mutateAsync({
      name: customName || selectedTemplate.name,
      description: selectedTemplate.description,
      trigger_event: selectedTemplate.trigger_event,
      conditions: selectedTemplate.conditions,
      actions: selectedTemplate.actions,
    });

    setDialogOpen(false);
    setSelectedTemplate(null);
    setCustomName('');
  };

  // Group templates by category
  const groupedTemplates = AUTOMATION_TEMPLATES.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, typeof AUTOMATION_TEMPLATES>);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Automation Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-6">
              {Object.entries(groupedTemplates).map(([category, templates]) => {
                const CategoryIcon = CATEGORY_ICONS[category] || Zap;
                
                return (
                  <div key={category}>
                    <div className="flex items-center gap-2 mb-3">
                      <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                      <h3 className="font-medium text-sm text-muted-foreground">{category}</h3>
                    </div>
                    <div className="grid gap-2">
                      {templates.map(template => (
                        <div
                          key={template.id}
                          className="p-3 rounded-lg border bg-card hover:bg-muted/50 cursor-pointer transition-colors"
                          onClick={() => handleSelectTemplate(template)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{template.name}</h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                {template.description}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline" className="text-xs">
                                  <Zap className="h-3 w-3 mr-1" />
                                  {template.trigger_event.replace(/_/g, ' ')}
                                </Badge>
                                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                <Badge variant="outline" className="text-xs">
                                  {template.actions.length} action(s)
                                </Badge>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">
                              Use
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply Template</DialogTitle>
          </DialogHeader>
          
          {selectedTemplate && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-muted">
                <h4 className="font-medium">{selectedTemplate.name}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedTemplate.description}
                </p>
              </div>

              <div>
                <Label>Rule Name</Label>
                <Input
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Enter a name for this rule"
                  className="mt-1.5"
                />
              </div>

              <div className="space-y-2">
                <Label>Configuration</Label>
                <div className="p-3 rounded-lg border space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="outline">
                      <Zap className="h-3 w-3 mr-1" />
                      Trigger
                    </Badge>
                    <span className="text-muted-foreground">
                      {selectedTemplate.trigger_event.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {selectedTemplate.conditions.length > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant="outline">Conditions</Badge>
                      <span className="text-muted-foreground">
                        {selectedTemplate.conditions.length} condition(s)
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="outline">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Actions
                    </Badge>
                    <span className="text-muted-foreground">
                      {selectedTemplate.actions.map(a => a.type).join(', ')}
                    </span>
                  </div>
                </div>
              </div>

              <Button 
                className="w-full" 
                onClick={handleApplyTemplate}
                disabled={createRule.isPending}
              >
                {createRule.isPending ? 'Creating...' : 'Create Rule from Template'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
