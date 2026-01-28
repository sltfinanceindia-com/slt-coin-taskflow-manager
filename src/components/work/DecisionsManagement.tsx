import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Scale, Plus, Calendar, User, FileText, Edit, Trash2, Search, ThumbsUp } from 'lucide-react';
import { format } from 'date-fns';
import { useDecisions } from '@/hooks/useDecisions';

export function DecisionsManagement() {
  const { decisions, isLoading, createDecision, deleteDecision, isCreating } = useDecisions();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    context: '',
    alternatives: '',
    rationale: '',
    impact: 'medium' as 'low' | 'medium' | 'high',
    decision_maker_id: null as string | null,
    stakeholders: ''
  });

  const handleSubmit = async () => {
    if (!formData.title) return;
    
    await createDecision({
      title: formData.title,
      description: formData.description || null,
      context: formData.context || null,
      alternatives: formData.alternatives ? formData.alternatives.split('\n').filter(Boolean) : null,
      rationale: formData.rationale || null,
      impact: formData.impact,
      status: 'pending',
      decision_maker_id: formData.decision_maker_id,
      stakeholders: formData.stakeholders ? formData.stakeholders.split(',').map(s => s.trim()) : null,
      decision_date: format(new Date(), 'yyyy-MM-dd'),
      created_by: null,
    });
    
    setIsDialogOpen(false);
    setFormData({
      title: '',
      description: '',
      context: '',
      alternatives: '',
      rationale: '',
      impact: 'medium',
      decision_maker_id: null,
      stakeholders: ''
    });
  };

  const handleDelete = async (id: string) => {
    await deleteDecision(id);
  };

  const getStatusBadge = (status: string | null) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'secondary',
      approved: 'default',
      implemented: 'outline',
      rejected: 'destructive'
    };
    return <Badge variant={variants[status || 'pending'] || 'outline'}>{status || 'pending'}</Badge>;
  };

  const getImpactBadge = (impact: string | null) => {
    const colors: Record<string, string> = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    };
    return <Badge className={colors[impact || 'medium'] || colors.medium}>{impact || 'medium'} impact</Badge>;
  };

  const filteredDecisions = decisions?.filter(d => 
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.description?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Scale className="h-6 w-6" />
            Decision Log
          </h2>
          <p className="text-muted-foreground">Track and document project decisions</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Record Decision
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Record Decision</DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[70vh]">
              <div className="space-y-4 py-4 pr-4">
                <div className="space-y-2">
                  <Label>Decision Title</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Adopt TypeScript for Frontend"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="What was decided..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Context / Problem Statement</Label>
                  <Textarea
                    value={formData.context}
                    onChange={(e) => setFormData({ ...formData, context: e.target.value })}
                    placeholder="Why was this decision needed..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Alternatives Considered (one per line)</Label>
                  <Textarea
                    value={formData.alternatives}
                    onChange={(e) => setFormData({ ...formData, alternatives: e.target.value })}
                    placeholder="Alternative 1&#10;Alternative 2"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Rationale</Label>
                  <Textarea
                    value={formData.rationale}
                    onChange={(e) => setFormData({ ...formData, rationale: e.target.value })}
                    placeholder="Why this option was chosen..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Impact Level</Label>
                    <Select value={formData.impact} onValueChange={(v: 'low' | 'medium' | 'high') => setFormData({ ...formData, impact: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Stakeholders (comma separated)</Label>
                  <Input
                    value={formData.stakeholders}
                    onChange={(e) => setFormData({ ...formData, stakeholders: e.target.value })}
                    placeholder="Frontend Team, DevOps"
                  />
                </div>
                <Button onClick={handleSubmit} className="w-full" disabled={isCreating}>
                  {isCreating ? 'Saving...' : 'Record Decision'}
                </Button>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search decisions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Decisions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{decisions?.length || 0}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Implemented</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <ThumbsUp className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">
                {decisions?.filter(d => d.status === 'implemented').length || 0}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">High Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-red-500" />
              <span className="text-2xl font-bold">
                {decisions?.filter(d => d.impact === 'high').length || 0}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <Card>
            <CardContent className="py-8 text-center">Loading decisions...</CardContent>
          </Card>
        ) : filteredDecisions?.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No decisions found. Record your first decision to get started.
            </CardContent>
          </Card>
        ) : (
          filteredDecisions?.map((decision) => (
            <Card key={decision.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{decision.title}</CardTitle>
                      {getStatusBadge(decision.status)}
                      {getImpactBadge(decision.impact)}
                    </div>
                    <CardDescription className="flex items-center gap-4">
                      {decision.decision_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(decision.decision_date), 'MMM d, yyyy')}
                        </span>
                      )}
                      {decision.decision_maker && (
                        <span className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {decision.decision_maker.full_name}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleDelete(decision.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {decision.description && (
                  <div>
                    <p className="text-sm font-medium mb-1">Description</p>
                    <p className="text-sm text-muted-foreground">{decision.description}</p>
                  </div>
                )}
                {decision.context && (
                  <div>
                    <p className="text-sm font-medium mb-1">Context</p>
                    <p className="text-sm text-muted-foreground">{decision.context}</p>
                  </div>
                )}
                {decision.alternatives && decision.alternatives.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-1">Alternatives Considered</p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                      {decision.alternatives.map((alt, i) => (
                        <li key={i}>{alt}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {decision.rationale && (
                  <div>
                    <p className="text-sm font-medium mb-1">Rationale</p>
                    <p className="text-sm text-muted-foreground">{decision.rationale}</p>
                  </div>
                )}
                {decision.stakeholders && decision.stakeholders.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-1">Stakeholders</p>
                    <div className="flex flex-wrap gap-1">
                      {decision.stakeholders.map((s, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">{s}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
