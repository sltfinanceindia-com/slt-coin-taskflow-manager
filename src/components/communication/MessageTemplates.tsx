import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit2, Trash2, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  category: 'greeting' | 'status' | 'closing' | 'custom';
  created_at: string;
}

interface MessageTemplatesProps {
  onInsertTemplate: (content: string) => void;
}

export default function MessageTemplates({ onInsertTemplate }: MessageTemplatesProps) {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<MessageTemplate[]>([
    {
      id: '1',
      name: 'Daily Standup',
      content: 'Good morning team! Here\'s my update for today:\n• Yesterday: \n• Today: \n• Blockers: ',
      category: 'status',
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Meeting Follow-up',
      content: 'Thanks for the productive meeting! Here are the key action items:\n\n• \n• \n• \n\nLet me know if I missed anything.',
      category: 'closing',
      created_at: new Date().toISOString()
    },
    {
      id: '3',
      name: 'Quick Thanks',
      content: 'Thank you for your help with this! Really appreciate your quick response.',
      category: 'closing',
      created_at: new Date().toISOString()
    }
  ]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [newTemplate, setNewTemplate] = useState<{
    name: string;
    content: string; 
    category: 'greeting' | 'status' | 'closing' | 'custom';
  }>({
    name: '',
    content: '',
    category: 'custom'
  });

  const handleSaveTemplate = () => {
    if (!newTemplate.name.trim() || !newTemplate.content.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both name and content",
        variant: "destructive"
      });
      return;
    }

    const template: MessageTemplate = {
      id: editingTemplate?.id || Date.now().toString(),
      name: newTemplate.name,
      content: newTemplate.content,
      category: newTemplate.category,
      created_at: editingTemplate?.created_at || new Date().toISOString()
    };

    if (editingTemplate) {
      setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? template : t));
      toast({ title: "Template updated successfully" });
    } else {
      setTemplates(prev => [...prev, template]);
      toast({ title: "Template created successfully" });
    }

    setIsDialogOpen(false);
    setEditingTemplate(null);
    setNewTemplate({ name: '', content: '', category: 'custom' });
  };

  const handleEditTemplate = (template: MessageTemplate) => {
    setEditingTemplate(template);
    setNewTemplate({
      name: template.name,
      content: template.content,
      category: template.category
    });
    setIsDialogOpen(true);
  };

  const handleDeleteTemplate = (templateId: string) => {
    setTemplates(prev => prev.filter(t => t.id !== templateId));
    toast({ title: "Template deleted successfully" });
  };

  const groupedTemplates = templates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, MessageTemplate[]>);

  const categoryLabels = {
    greeting: 'Greetings',
    status: 'Status Updates',
    closing: 'Closings',
    custom: 'Custom Templates'
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Message Templates
        </h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={() => {
              setEditingTemplate(null);
              setNewTemplate({ name: '', content: '', category: 'custom' });
            }}>
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingTemplate ? 'Edit Template' : 'Create Template'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Template name"
                value={newTemplate.name}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
              />
              <Textarea
                placeholder="Template content"
                value={newTemplate.content}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, content: e.target.value }))}
                rows={6}
              />
              <select
                className="w-full p-2 border rounded-md"
                value={newTemplate.category}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, category: e.target.value as 'greeting' | 'status' | 'closing' | 'custom' }))}
              >
                <option value="greeting">Greeting</option>
                <option value="status">Status Update</option>
                <option value="closing">Closing</option>
                <option value="custom">Custom</option>
              </select>
              <div className="flex gap-2">
                <Button onClick={handleSaveTemplate} className="flex-1">
                  {editingTemplate ? 'Update' : 'Create'}
                </Button>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => (
          <div key={category}>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              {categoryLabels[category as keyof typeof categoryLabels]}
            </h4>
            <div className="grid gap-2">
              {categoryTemplates.map((template) => (
                <Card key={template.id} className="cursor-pointer hover:bg-accent/50 transition-colors">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{template.name}</CardTitle>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditTemplate(template);
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTemplate(template.id);
                          }}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent 
                    className="pt-0"
                    onClick={() => onInsertTemplate(template.content)}
                  >
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {template.content}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}