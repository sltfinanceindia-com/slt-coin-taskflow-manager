import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { BookOpen, Plus, Search, FileText, Users, Clock, Edit, Eye, Loader2, FileX } from 'lucide-react';
import { useHandbookPolicies, HandbookPolicy } from '@/hooks/useHandbookPolicies';

const CATEGORIES = ['General', 'HR', 'Work', 'IT', 'Finance', 'Compliance'];

export function HandbookManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    content: '',
    version: '1.0',
    status: 'draft' as HandbookPolicy['status'],
    acknowledgment_required: false,
  });

  const { policies, isLoading, error, createPolicy } = useHandbookPolicies();

  const handleSubmit = (publish: boolean) => {
    createPolicy.mutate({
      title: formData.title,
      category: formData.category,
      content: formData.content,
      version: formData.version || null,
      status: publish ? 'published' : 'draft',
      effective_date: publish ? new Date().toISOString().split('T')[0] : null,
      acknowledgment_required: formData.acknowledgment_required,
      created_by: null,
      organization_id: null,
    });
    setIsDialogOpen(false);
    setFormData({ title: '', category: '', content: '', version: '1.0', status: 'draft', acknowledgment_required: false });
  };

  const filteredPolicies = policies.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getStatusBadge = (status: HandbookPolicy['status']) => {
    const config: Record<HandbookPolicy['status'], { variant: 'default' | 'secondary' | 'outline' }> = {
      draft: { variant: 'secondary' },
      published: { variant: 'default' },
      archived: { variant: 'outline' },
    };
    return <Badge variant={config[status].variant}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
  };

  const groupedPolicies = CATEGORIES.reduce((acc, category) => {
    acc[category] = filteredPolicies.filter(p => p.category === category);
    return acc;
  }, {} as Record<string, HandbookPolicy[]>);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center border-destructive">
        <FileX className="h-12 w-12 mx-auto text-destructive" />
        <h3 className="mt-4 font-semibold">Error loading policies</h3>
        <p className="text-muted-foreground">{error.message}</p>
      </Card>
    );
  }

  const stats = {
    total: policies.length,
    published: policies.filter(p => p.status === 'published').length,
    drafts: policies.filter(p => p.status === 'draft').length,
    requireAck: policies.filter(p => p.acknowledgment_required).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Employee Handbook</h2>
          <p className="text-muted-foreground">Manage policy documents and employee acknowledgments</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Policy
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Policy</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Policy Title</Label>
                <Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="e.g., Code of Conduct" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Version</Label>
                  <Input value={formData.version} onChange={(e) => setFormData({...formData, version: e.target.value})} placeholder="1.0" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} placeholder="Policy content..." rows={10} />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="ack_required" checked={formData.acknowledgment_required} onChange={(e) => setFormData({...formData, acknowledgment_required: e.target.checked})} />
                <label htmlFor="ack_required" className="text-sm">Require employee acknowledgment</label>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => handleSubmit(false)} disabled={createPolicy.isPending || !formData.title || !formData.category}>
                  {createPolicy.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Save as Draft
                </Button>
                <Button className="flex-1" onClick={() => handleSubmit(true)} disabled={createPolicy.isPending || !formData.title || !formData.category}>
                  {createPolicy.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Publish
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Policies</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Published</p>
                <p className="text-2xl font-bold text-green-600">{stats.published}</p>
              </div>
              <FileText className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Drafts</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.drafts}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Require Ack.</p>
                <p className="text-2xl font-bold text-blue-600">{stats.requireAck}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search policies..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Policies Accordion */}
      <Card>
        <CardHeader>
          <CardTitle>Policy Documents</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPolicies.length === 0 ? (
            <div className="text-center py-8">
              <FileX className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">No policies found</p>
              <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />Add Policy
              </Button>
            </div>
          ) : (
            <Accordion type="multiple" className="w-full">
              {CATEGORIES.map(category => {
                const categoryPolicies = groupedPolicies[category] || [];
                if (categoryPolicies.length === 0) return null;
                
                return (
                  <AccordionItem key={category} value={category}>
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <span>{category}</span>
                        <Badge variant="secondary">{categoryPolicies.length}</Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        {categoryPolicies.map(policy => (
                          <div key={policy.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-4">
                              <FileText className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{policy.title}</p>
                                <p className="text-sm text-muted-foreground">v{policy.version || '1.0'} • Updated {policy.updated_at ? new Date(policy.updated_at).toLocaleDateString() : 'N/A'}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              {getStatusBadge(policy.status)}
                              <div className="flex gap-1">
                                <Button size="sm" variant="ghost"><Eye className="h-4 w-4" /></Button>
                                <Button size="sm" variant="ghost"><Edit className="h-4 w-4" /></Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
