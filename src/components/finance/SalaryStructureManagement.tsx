import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Plus, Wallet, Edit2, Trash2, Calculator, IndianRupee, Percent } from 'lucide-react';

interface SalaryComponent {
  id: string;
  name: string;
  type: 'earning' | 'deduction';
  calculation_type: 'fixed' | 'percentage';
  value: number;
  is_taxable: boolean;
}

interface SalaryTemplate {
  id: string;
  name: string;
  grade: string;
  basic_salary: number;
  components: SalaryComponent[];
  created_at: string;
}

export function SalaryStructureManagement() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isComponentOpen, setIsComponentOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<SalaryTemplate | null>(null);

  const [newTemplate, setNewTemplate] = useState({
    name: '',
    grade: '',
    basic_salary: '',
  });

  const [newComponent, setNewComponent] = useState({
    name: '',
    type: 'earning' as 'earning' | 'deduction',
    calculation_type: 'percentage' as 'fixed' | 'percentage',
    value: '',
    is_taxable: true,
  });

  // Mock data for salary templates (stored in projects table as salary_templates type)
  const { data: templates, isLoading } = useQuery({
    queryKey: ['salary-templates', profile?.organization_id],
    queryFn: async (): Promise<SalaryTemplate[]> => {
      if (!profile?.organization_id) return [];
      
      // Using projects table to store salary templates via stage field
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, priority, budget, description, created_at')
        .eq('organization_id', profile.organization_id)
        .eq('stage', 'salary_template')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        grade: p.priority || 'Standard',
        basic_salary: p.budget || 0,
        components: (p.description ? JSON.parse(p.description) : []) as SalaryComponent[],
        created_at: p.created_at,
      }));
    },
    enabled: !!profile?.organization_id,
  });

  const createTemplateMutation = useMutation({
    mutationFn: async (template: typeof newTemplate) => {
      const defaultComponents: SalaryComponent[] = [
        { id: '1', name: 'HRA', type: 'earning', calculation_type: 'percentage', value: 40, is_taxable: true },
        { id: '2', name: 'DA', type: 'earning', calculation_type: 'percentage', value: 10, is_taxable: true },
        { id: '3', name: 'Conveyance', type: 'earning', calculation_type: 'fixed', value: 1600, is_taxable: false },
        { id: '4', name: 'Medical', type: 'earning', calculation_type: 'fixed', value: 1250, is_taxable: false },
        { id: '5', name: 'PF', type: 'deduction', calculation_type: 'percentage', value: 12, is_taxable: false },
        { id: '6', name: 'Professional Tax', type: 'deduction', calculation_type: 'fixed', value: 200, is_taxable: false },
      ];

      const insertData = {
        name: template.name,
        priority: template.grade,
        budget: parseFloat(template.basic_salary) || 0,
        description: JSON.stringify(defaultComponents),
        stage: 'salary_template',
        created_by: profile?.id || '',
        status: 'active',
      };

      const { error } = await supabase.from('projects').insert(insertData);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary-templates'] });
      setIsCreateOpen(false);
      setNewTemplate({ name: '', grade: '', basic_salary: '' });
      toast({ title: 'Salary template created successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error creating template', description: error.message, variant: 'destructive' });
    },
  });

  const updateComponentsMutation = useMutation({
    mutationFn: async ({ templateId, components }: { templateId: string; components: SalaryComponent[] }) => {
      const { error } = await supabase
        .from('projects')
        .update({ description: JSON.stringify(components) })
        .eq('id', templateId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary-templates'] });
      toast({ title: 'Components updated successfully' });
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary-templates'] });
      toast({ title: 'Template deleted successfully' });
    },
  });

  const calculateCTC = (basic: number, components: SalaryComponent[]) => {
    let ctc = basic;
    components.forEach(comp => {
      const amount = comp.calculation_type === 'percentage' 
        ? (basic * comp.value / 100) 
        : comp.value;
      if (comp.type === 'earning') ctc += amount;
    });
    return ctc;
  };

  const calculateNetSalary = (basic: number, components: SalaryComponent[]) => {
    let net = basic;
    components.forEach(comp => {
      const amount = comp.calculation_type === 'percentage' 
        ? (basic * comp.value / 100) 
        : comp.value;
      if (comp.type === 'earning') net += amount;
      else net -= amount;
    });
    return net;
  };

  const addComponent = () => {
    if (!selectedTemplate || !newComponent.name || !newComponent.value) return;
    
    const component: SalaryComponent = {
      id: Date.now().toString(),
      name: newComponent.name,
      type: newComponent.type,
      calculation_type: newComponent.calculation_type,
      value: parseFloat(newComponent.value),
      is_taxable: newComponent.is_taxable,
    };

    const updatedComponents = [...selectedTemplate.components, component];
    updateComponentsMutation.mutate({ templateId: selectedTemplate.id, components: updatedComponents });
    setNewComponent({ name: '', type: 'earning', calculation_type: 'percentage', value: '', is_taxable: true });
    setIsComponentOpen(false);
  };

  const removeComponent = (componentId: string) => {
    if (!selectedTemplate) return;
    const updatedComponents = selectedTemplate.components.filter(c => c.id !== componentId);
    updateComponentsMutation.mutate({ templateId: selectedTemplate.id, components: updatedComponents });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Salary Structure</h1>
          <p className="text-muted-foreground">Define salary components, templates, and CTC breakdowns</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Salary Template</DialogTitle>
              <DialogDescription>Define a new salary structure template</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label>Template Name</Label>
                <Input
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Senior Engineer Package"
                />
              </div>
              <div>
                <Label>Grade/Level</Label>
                <Select
                  value={newTemplate.grade}
                  onValueChange={(v) => setNewTemplate(prev => ({ ...prev, grade: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="L1">L1 - Entry Level</SelectItem>
                    <SelectItem value="L2">L2 - Junior</SelectItem>
                    <SelectItem value="L3">L3 - Mid Level</SelectItem>
                    <SelectItem value="L4">L4 - Senior</SelectItem>
                    <SelectItem value="L5">L5 - Lead</SelectItem>
                    <SelectItem value="L6">L6 - Manager</SelectItem>
                    <SelectItem value="L7">L7 - Director</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Basic Salary (₹)</Label>
                <Input
                  type="number"
                  value={newTemplate.basic_salary}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, basic_salary: e.target.value }))}
                  placeholder="Enter basic salary"
                />
              </div>
              <Button
                className="w-full"
                onClick={() => createTemplateMutation.mutate(newTemplate)}
                disabled={createTemplateMutation.isPending || !newTemplate.name || !newTemplate.basic_salary}
              >
                {createTemplateMutation.isPending ? 'Creating...' : 'Create Template'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templates?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Salary structures defined</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg CTC</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{templates?.length ? Math.round(templates.reduce((sum, t) => sum + calculateCTC(t.basic_salary, t.components), 0) / templates.length).toLocaleString() : 0}
            </div>
            <p className="text-xs text-muted-foreground">Per month average</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Grades</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Set(templates?.map(t => t.grade)).size || 0}</div>
            <p className="text-xs text-muted-foreground">Unique levels</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="breakdown">CTC Breakdown</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Salary Templates</CardTitle>
              <CardDescription>Manage salary structure templates by grade</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : templates && templates.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Template Name</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead className="text-right">Basic</TableHead>
                      <TableHead className="text-right">CTC</TableHead>
                      <TableHead className="text-right">Net Salary</TableHead>
                      <TableHead>Components</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {templates.map((template) => (
                      <TableRow key={template.id}>
                        <TableCell className="font-medium">{template.name}</TableCell>
                        <TableCell><Badge variant="outline">{template.grade}</Badge></TableCell>
                        <TableCell className="text-right">₹{template.basic_salary.toLocaleString()}</TableCell>
                        <TableCell className="text-right font-medium text-green-600">
                          ₹{calculateCTC(template.basic_salary, template.components).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          ₹{calculateNetSalary(template.basic_salary, template.components).toLocaleString()}
                        </TableCell>
                        <TableCell>{template.components.length} items</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedTemplate(template)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteTemplateMutation.mutate(template.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No salary templates defined</p>
                  <p className="text-sm">Create your first template to get started</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breakdown" className="mt-4">
          {selectedTemplate ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{selectedTemplate.name} - CTC Breakdown</CardTitle>
                    <CardDescription>Grade: {selectedTemplate.grade} | Basic: ₹{selectedTemplate.basic_salary.toLocaleString()}</CardDescription>
                  </div>
                  <Dialog open={isComponentOpen} onOpenChange={setIsComponentOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Component
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Salary Component</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div>
                          <Label>Component Name</Label>
                          <Input
                            value={newComponent.name}
                            onChange={(e) => setNewComponent(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g., Special Allowance"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Type</Label>
                            <Select
                              value={newComponent.type}
                              onValueChange={(v: 'earning' | 'deduction') => setNewComponent(prev => ({ ...prev, type: v }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="earning">Earning</SelectItem>
                                <SelectItem value="deduction">Deduction</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Calculation</Label>
                            <Select
                              value={newComponent.calculation_type}
                              onValueChange={(v: 'fixed' | 'percentage') => setNewComponent(prev => ({ ...prev, calculation_type: v }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="percentage">% of Basic</SelectItem>
                                <SelectItem value="fixed">Fixed Amount</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <Label>Value ({newComponent.calculation_type === 'percentage' ? '%' : '₹'})</Label>
                          <Input
                            type="number"
                            value={newComponent.value}
                            onChange={(e) => setNewComponent(prev => ({ ...prev, value: e.target.value }))}
                          />
                        </div>
                        <Button className="w-full" onClick={addComponent}>
                          Add Component
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Earnings */}
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800">Earnings</Badge>
                    </h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Component</TableHead>
                          <TableHead>Calculation</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead>Taxable</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">Basic Salary</TableCell>
                          <TableCell>Fixed</TableCell>
                          <TableCell className="text-right">₹{selectedTemplate.basic_salary.toLocaleString()}</TableCell>
                          <TableCell><Badge variant="secondary">Yes</Badge></TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                        {selectedTemplate.components.filter(c => c.type === 'earning').map((comp) => (
                          <TableRow key={comp.id}>
                            <TableCell>{comp.name}</TableCell>
                            <TableCell>
                              {comp.calculation_type === 'percentage' ? (
                                <span className="flex items-center gap-1"><Percent className="h-3 w-3" />{comp.value}% of Basic</span>
                              ) : (
                                <span>Fixed</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              ₹{(comp.calculation_type === 'percentage' 
                                ? (selectedTemplate.basic_salary * comp.value / 100) 
                                : comp.value).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Badge variant={comp.is_taxable ? 'secondary' : 'outline'}>
                                {comp.is_taxable ? 'Yes' : 'No'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm" onClick={() => removeComponent(comp.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Deductions */}
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Badge className="bg-red-100 text-red-800">Deductions</Badge>
                    </h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Component</TableHead>
                          <TableHead>Calculation</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedTemplate.components.filter(c => c.type === 'deduction').map((comp) => (
                          <TableRow key={comp.id}>
                            <TableCell>{comp.name}</TableCell>
                            <TableCell>
                              {comp.calculation_type === 'percentage' ? (
                                <span className="flex items-center gap-1"><Percent className="h-3 w-3" />{comp.value}% of Basic</span>
                              ) : (
                                <span>Fixed</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right text-red-600">
                              -₹{(comp.calculation_type === 'percentage' 
                                ? (selectedTemplate.basic_salary * comp.value / 100) 
                                : comp.value).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm" onClick={() => removeComponent(comp.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Summary */}
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total CTC (Monthly)</span>
                      <span className="text-green-600">₹{calculateCTC(selectedTemplate.basic_salary, selectedTemplate.components).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold mt-2">
                      <span>Net Take Home</span>
                      <span>₹{calculateNetSalary(selectedTemplate.basic_salary, selectedTemplate.components).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground mt-1">
                      <span>Annual CTC</span>
                      <span>₹{(calculateCTC(selectedTemplate.basic_salary, selectedTemplate.components) * 12).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a template from the Templates tab to view its breakdown</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
