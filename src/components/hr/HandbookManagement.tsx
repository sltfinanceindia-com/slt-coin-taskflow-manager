import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { BookOpen, Plus, Search, FileText, Users, Clock, Edit, Eye } from 'lucide-react';

interface Policy {
  id: string;
  title: string;
  category: string;
  version: string;
  last_updated: string;
  status: 'draft' | 'published' | 'archived';
  acknowledgments: number;
  total_employees: number;
  content: string;
}

export function HandbookManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Mock data
  const policies: Policy[] = [
    { id: '1', title: 'Code of Conduct', category: 'General', version: '3.0', last_updated: '2024-01-15', status: 'published', acknowledgments: 145, total_employees: 150, content: 'All employees are expected to maintain professional conduct...' },
    { id: '2', title: 'Leave Policy', category: 'HR', version: '2.1', last_updated: '2024-02-01', status: 'published', acknowledgments: 148, total_employees: 150, content: 'Employees are entitled to various types of leave...' },
    { id: '3', title: 'Remote Work Policy', category: 'Work', version: '1.5', last_updated: '2024-03-10', status: 'published', acknowledgments: 120, total_employees: 150, content: 'Guidelines for working from home...' },
    { id: '4', title: 'Data Security Policy', category: 'IT', version: '2.0', last_updated: '2024-02-20', status: 'published', acknowledgments: 142, total_employees: 150, content: 'Security protocols for handling company data...' },
    { id: '5', title: 'Travel & Expense Policy', category: 'Finance', version: '1.8', last_updated: '2024-01-25', status: 'published', acknowledgments: 135, total_employees: 150, content: 'Guidelines for business travel and expense claims...' },
    { id: '6', title: 'Anti-Harassment Policy', category: 'Compliance', version: '2.2', last_updated: '2024-03-01', status: 'published', acknowledgments: 150, total_employees: 150, content: 'Zero tolerance policy for harassment...' },
    { id: '7', title: 'Performance Review Process', category: 'HR', version: '1.0', last_updated: '2024-04-01', status: 'draft', acknowledgments: 0, total_employees: 150, content: 'Draft: Performance evaluation guidelines...' },
  ];

  const categories = ['General', 'HR', 'Work', 'IT', 'Finance', 'Compliance'];

  const filteredPolicies = policies.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getStatusBadge = (status: Policy['status']) => {
    const config: Record<Policy['status'], { variant: 'default' | 'secondary' | 'outline' }> = {
      draft: { variant: 'secondary' },
      published: { variant: 'default' },
      archived: { variant: 'outline' },
    };
    return <Badge variant={config[status].variant}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
  };

  const getAcknowledgmentRate = (ack: number, total: number) => {
    const rate = Math.round((ack / total) * 100);
    return { rate, color: rate === 100 ? 'text-green-600' : rate >= 80 ? 'text-yellow-600' : 'text-red-600' };
  };

  const groupedPolicies = categories.reduce((acc, category) => {
    acc[category] = filteredPolicies.filter(p => p.category === category);
    return acc;
  }, {} as Record<string, Policy[]>);

  const stats = {
    total: policies.length,
    published: policies.filter(p => p.status === 'published').length,
    drafts: policies.filter(p => p.status === 'draft').length,
    fullAcknowledgment: policies.filter(p => p.acknowledgments === p.total_employees && p.status === 'published').length,
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
              <Input placeholder="Policy Title" />
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Textarea placeholder="Policy content..." rows={10} />
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setIsDialogOpen(false)}>Save as Draft</Button>
                <Button className="flex-1" onClick={() => setIsDialogOpen(false)}>Publish</Button>
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
                <p className="text-sm text-muted-foreground">100% Acknowledged</p>
                <p className="text-2xl font-bold text-blue-600">{stats.fullAcknowledgment}</p>
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
              <Input
                placeholder="Search policies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
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
          <Accordion type="multiple" className="w-full">
            {categories.map(category => {
              const categoryPolicies = groupedPolicies[category] || [];
              if (categoryPolicies.length === 0 && categoryFilter !== 'all') return null;
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
                      {categoryPolicies.map(policy => {
                        const ackInfo = getAcknowledgmentRate(policy.acknowledgments, policy.total_employees);
                        return (
                          <div key={policy.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-4">
                              <FileText className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{policy.title}</p>
                                <p className="text-sm text-muted-foreground">v{policy.version} • Updated {policy.last_updated}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              {policy.status === 'published' && (
                                <span className={`text-sm font-medium ${ackInfo.color}`}>
                                  {ackInfo.rate}% acknowledged
                                </span>
                              )}
                              {getStatusBadge(policy.status)}
                              <div className="flex gap-1">
                                <Button size="sm" variant="ghost"><Eye className="h-4 w-4" /></Button>
                                <Button size="sm" variant="ghost"><Edit className="h-4 w-4" /></Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
