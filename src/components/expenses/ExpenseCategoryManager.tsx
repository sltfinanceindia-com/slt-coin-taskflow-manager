import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { 
  FolderTree, 
  Plus, 
  Trash2, 
  Edit,
  Palette,
  IndianRupee,
  TrendingUp,
  BarChart3,
  Briefcase,
  Car,
  Coffee,
  Monitor,
  Plane,
  Phone,
  Building2,
  ShoppingBag
} from 'lucide-react';
import { ExpenseCategorySkeleton, EmptyState } from '@/components/ui/enhanced-skeletons';

const iconOptions = [
  { value: 'folder', icon: FolderTree, label: 'Folder' },
  { value: 'briefcase', icon: Briefcase, label: 'Business' },
  { value: 'car', icon: Car, label: 'Transport' },
  { value: 'coffee', icon: Coffee, label: 'Food & Beverage' },
  { value: 'monitor', icon: Monitor, label: 'Equipment' },
  { value: 'plane', icon: Plane, label: 'Travel' },
  { value: 'phone', icon: Phone, label: 'Communication' },
  { value: 'building', icon: Building2, label: 'Office' },
  { value: 'shopping', icon: ShoppingBag, label: 'Supplies' },
];

const colorOptions = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316', 
  '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6'
];

export function ExpenseCategoryManager() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#6366f1',
    icon: 'folder',
    budget_amount: '',
    budget_period: 'monthly',
  });

  const isAdmin = profile?.role === 'admin' || profile?.role === 'org_admin';

  // Fetch categories
  const { data: categories, isLoading } = useQuery({
    queryKey: ['expense-categories', profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expense_categories')
        .select('*')
        .eq('organization_id', profile?.organization_id)
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });

  // Fetch expense totals per category from expense_claims
  const { data: expenseTotals } = useQuery({
    queryKey: ['expense-totals', profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expense_claims')
        .select('expense_type, amount, status')
        .eq('organization_id', profile?.organization_id)
        .in('status', ['approved', 'pending']);
      
      if (error) throw error;
      
      // Aggregate by expense_type (using it as category)
      const totals: Record<string, number> = {};
      (data || []).forEach((claim: any) => {
        const category = claim.expense_type || 'other';
        totals[category] = (totals[category] || 0) + Number(claim.amount || 0);
      });
      
      return totals;
    },
    enabled: !!profile?.organization_id,
  });

  // Create/Update category mutation
  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (editingCategory) {
        const { error } = await supabase
          .from('expense_categories')
          .update({
            name: data.name,
            description: data.description,
            color: data.color,
            icon: data.icon,
            budget_amount: data.budget_amount ? parseFloat(data.budget_amount) : 0,
            budget_period: data.budget_period,
          })
          .eq('id', editingCategory.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('expense_categories')
          .insert({
            ...data,
            budget_amount: data.budget_amount ? parseFloat(data.budget_amount) : 0,
            organization_id: profile?.organization_id,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-categories'] });
      setIsCreateOpen(false);
      setEditingCategory(null);
      resetForm();
      toast({ title: `Category ${editingCategory ? 'updated' : 'created'} successfully` });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Delete category mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('expense_categories')
        .update({ is_active: false })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-categories'] });
      toast({ title: 'Category deleted' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      color: '#6366f1',
      icon: 'folder',
      budget_amount: '',
      budget_period: 'monthly',
    });
  };

  const openEditDialog = (category: any) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      color: category.color,
      icon: category.icon,
      budget_amount: category.budget_amount?.toString() || '',
      budget_period: category.budget_period,
    });
    setIsCreateOpen(true);
  };

  const getIcon = (iconName: string) => {
    const found = iconOptions.find(i => i.value === iconName);
    return found?.icon || FolderTree;
  };

  // Calculate total budget
  const totalBudget = categories?.reduce((sum, c) => sum + Number(c.budget_amount || 0), 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FolderTree className="h-6 w-6 text-primary" />
            Expense Categories & Budgets
          </h1>
          <p className="text-muted-foreground">Organize expenses and set department budgets</p>
        </div>
        
        {isAdmin && (
          <Dialog open={isCreateOpen} onOpenChange={(open) => {
            setIsCreateOpen(open);
            if (!open) {
              setEditingCategory(null);
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingCategory ? 'Edit Category' : 'Create Expense Category'}</DialogTitle>
                <DialogDescription>
                  Define expense categories and set budgets
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label>Category Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Travel, Office Supplies"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="What expenses belong in this category?"
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Icon</Label>
                    <Select
                      value={formData.icon}
                      onValueChange={(v) => setFormData(prev => ({ ...prev, icon: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {iconOptions.map(opt => {
                          const IconComp = opt.icon;
                          return (
                            <SelectItem key={opt.value} value={opt.value}>
                              <span className="flex items-center gap-2">
                                <IconComp className="h-4 w-4" />
                                {opt.label}
                              </span>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Color</Label>
                    <div className="flex gap-1 flex-wrap mt-2">
                      {colorOptions.map(color => (
                        <button
                          key={color}
                          type="button"
                          className={`w-6 h-6 rounded-full border-2 transition-transform ${
                            formData.color === color ? 'border-foreground scale-110' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => setFormData(prev => ({ ...prev, color }))}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Budget Amount (₹)</Label>
                    <Input
                      type="number"
                      value={formData.budget_amount}
                      onChange={(e) => setFormData(prev => ({ ...prev, budget_amount: e.target.value }))}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label>Budget Period</Label>
                    <Select
                      value={formData.budget_period}
                      onValueChange={(v) => setFormData(prev => ({ ...prev, budget_period: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => saveMutation.mutate(formData)}
                  disabled={saveMutation.isPending || !formData.name}
                >
                  {saveMutation.isPending ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Categories</p>
                <p className="text-2xl font-bold">{categories?.length || 0}</p>
              </div>
              <FolderTree className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Budget (Monthly)</p>
                <p className="text-2xl font-bold">₹{totalBudget.toLocaleString('en-IN')}</p>
              </div>
              <IndianRupee className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Budget Utilization</p>
                <p className="text-2xl font-bold">0%</p>
              </div>
              <BarChart3 className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories?.map((category) => {
          const IconComp = getIcon(category.icon);
          const spent = expenseTotals?.[category.name] || 0; // Match by category name
          const budget = Number(category.budget_amount) || 0;
          const utilization = budget > 0 ? (spent / budget) * 100 : 0;
          
          return (
            <Card key={category.id} className="overflow-hidden">
              <div className="h-2" style={{ backgroundColor: category.color }} />
              <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                      style={{ backgroundColor: category.color }}
                    >
                      <IconComp className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{category.name}</h3>
                      <p className="text-xs text-muted-foreground capitalize">{category.budget_period}</p>
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(category)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive"
                        onClick={() => deleteMutation.mutate(category.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                
                {category.description && (
                  <p className="text-sm text-muted-foreground mb-3">{category.description}</p>
                )}
                
                {budget > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Budget</span>
                      <span className="font-medium">₹{budget.toLocaleString('en-IN')}</span>
                    </div>
                    <Progress value={utilization} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Spent: ₹{spent.toLocaleString('en-IN')}</span>
                      <span>{utilization.toFixed(0)}% used</span>
                    </div>
                  </div>
                )}
                
                {budget === 0 && (
                  <Badge variant="outline" className="text-xs">No budget set</Badge>
                )}
              </CardContent>
            </Card>
          );
        })}
        
        {isLoading ? (
          <div className="col-span-full">
            <ExpenseCategorySkeleton />
          </div>
        ) : (!categories || categories.length === 0) && (
          <Card className="col-span-full">
            <CardContent className="p-0">
              <EmptyState
                icon={FolderTree}
                title="No Expense Categories"
                description="Organize your company expenses by creating categories with budgets. Track spending patterns and control costs effectively."
                action={isAdmin ? {
                  label: "Create Category",
                  onClick: () => setIsCreateOpen(true)
                } : undefined}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
