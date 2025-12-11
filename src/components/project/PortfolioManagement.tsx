import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter 
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Plus, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Briefcase,
  DollarSign,
  Calendar,
  Users,
  FolderOpen,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { usePortfolios, Portfolio, CreatePortfolioData } from '@/hooks/usePortfolios';
import { useEmployeeDirectory } from '@/hooks/useEmployeeDirectory';
import { useUserRole } from '@/hooks/useUserRole';
import { formatCurrency } from '@/lib/currency';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
];

const riskOptions = [
  { value: 'low', label: 'Low', color: 'bg-green-500' },
  { value: 'medium', label: 'Medium', color: 'bg-amber-500' },
  { value: 'high', label: 'High', color: 'bg-orange-500' },
  { value: 'critical', label: 'Critical', color: 'bg-red-500' },
];

interface PortfolioFormProps {
  portfolio?: Portfolio;
  onSubmit: (data: CreatePortfolioData) => void;
  onClose: () => void;
  isLoading?: boolean;
}

const PortfolioForm: React.FC<PortfolioFormProps> = ({ portfolio, onSubmit, onClose, isLoading }) => {
  const { employees } = useEmployeeDirectory();
  const [formData, setFormData] = useState<CreatePortfolioData>({
    name: portfolio?.name || '',
    description: portfolio?.description || '',
    owner_id: portfolio?.owner_id || '',
    status: portfolio?.status || 'active',
    budget: portfolio?.budget || 0,
    target_roi: portfolio?.target_roi || undefined,
    risk_level: portfolio?.risk_level || 'low',
    start_date: portfolio?.start_date || '',
    target_end_date: portfolio?.target_end_date || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <Label htmlFor="name">Portfolio Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Q1 Marketing Initiatives"
            required
          />
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Portfolio objectives and scope..."
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="owner">Owner</Label>
          <Select
            value={formData.owner_id}
            onValueChange={(value) => setFormData({ ...formData, owner_id: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select owner" />
            </SelectTrigger>
            <SelectContent>
              {employees.map((emp) => (
                <SelectItem key={emp.id} value={emp.id}>
                  {emp.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value: Portfolio['status']) => setFormData({ ...formData, status: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="budget">Budget</Label>
          <Input
            id="budget"
            type="number"
            value={formData.budget}
            onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })}
            placeholder="100000"
          />
        </div>

        <div>
          <Label htmlFor="target_roi">Target ROI (%)</Label>
          <Input
            id="target_roi"
            type="number"
            value={formData.target_roi || ''}
            onChange={(e) => setFormData({ ...formData, target_roi: parseFloat(e.target.value) || undefined })}
            placeholder="15"
          />
        </div>

        <div>
          <Label htmlFor="risk_level">Risk Level</Label>
          <Select
            value={formData.risk_level}
            onValueChange={(value: Portfolio['risk_level']) => setFormData({ ...formData, risk_level: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {riskOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${opt.color}`} />
                    {opt.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="start_date">Start Date</Label>
          <Input
            id="start_date"
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="target_end_date">Target End Date</Label>
          <Input
            id="target_end_date"
            type="date"
            value={formData.target_end_date}
            onChange={(e) => setFormData({ ...formData, target_end_date: e.target.value })}
          />
        </div>
      </div>

      <DialogFooter className="gap-2 sm:gap-0">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading || !formData.name}>
          {isLoading ? 'Saving...' : portfolio ? 'Update Portfolio' : 'Create Portfolio'}
        </Button>
      </DialogFooter>
    </form>
  );
};

interface PortfolioCardProps {
  portfolio: Portfolio;
  onEdit: (portfolio: Portfolio) => void;
  onDelete: (id: string) => void;
  onClick: (portfolio: Portfolio) => void;
}

const PortfolioCard: React.FC<PortfolioCardProps> = ({ portfolio, onEdit, onDelete, onClick }) => {
  const riskConfig = riskOptions.find(r => r.value === portfolio.risk_level);
  const budgetUsed = portfolio.budget > 0 
    ? Math.round((portfolio.spent_budget / portfolio.budget) * 100) 
    : 0;

  return (
    <Card 
      className="group hover:shadow-md transition-all cursor-pointer"
      onClick={() => onClick(portfolio)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="shrink-0 rounded-lg bg-primary/10 p-2">
              <Briefcase className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-base sm:text-lg truncate">{portfolio.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={portfolio.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                  {statusOptions.find(s => s.value === portfolio.status)?.label}
                </Badge>
                <div className="flex items-center gap-1">
                  <div className={`h-2 w-2 rounded-full ${riskConfig?.color}`} />
                  <span className="text-xs text-muted-foreground">{riskConfig?.label}</span>
                </div>
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(portfolio); }}>
                <Edit className="h-4 w-4 mr-2" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-destructive" 
                onClick={(e) => { e.stopPropagation(); onDelete(portfolio.id); }}
              >
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {portfolio.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{portfolio.description}</p>
        )}

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-2 rounded-lg bg-muted/50">
            <p className="text-lg sm:text-xl font-bold">{portfolio.programs_count || 0}</p>
            <p className="text-xs text-muted-foreground">Programs</p>
          </div>
          <div className="p-2 rounded-lg bg-muted/50">
            <p className="text-lg sm:text-xl font-bold">{portfolio.projects_count || 0}</p>
            <p className="text-xs text-muted-foreground">Projects</p>
          </div>
          <div className="p-2 rounded-lg bg-muted/50">
            <p className="text-lg sm:text-xl font-bold">{portfolio.completion_rate || 0}%</p>
            <p className="text-xs text-muted-foreground">Complete</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <DollarSign className="h-3 w-3" /> Budget Usage
            </span>
            <span className="font-medium">{budgetUsed}%</span>
          </div>
          <Progress value={budgetUsed} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatCurrency(portfolio.spent_budget || 0)} spent</span>
            <span>{formatCurrency(portfolio.budget || 0)} total</span>
          </div>
        </div>

        {portfolio.owner && (
          <div className="flex items-center gap-2 pt-2 border-t">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Owner:</span>
            <span className="text-sm font-medium truncate">{portfolio.owner.full_name}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface PortfolioManagementProps {
  onSelectPortfolio?: (portfolio: Portfolio) => void;
}

export const PortfolioManagement: React.FC<PortfolioManagementProps> = ({ onSelectPortfolio }) => {
  const { portfolios, isLoading, createPortfolio, updatePortfolio, deletePortfolio, isCreating, isUpdating } = usePortfolios();
  const { isAdmin } = useUserRole();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPortfolio, setEditingPortfolio] = useState<Portfolio | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPortfolios = portfolios.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = (data: CreatePortfolioData) => {
    if (editingPortfolio) {
      updatePortfolio({ id: editingPortfolio.id, ...data });
    } else {
      createPortfolio(data);
    }
    setIsDialogOpen(false);
    setEditingPortfolio(null);
  };

  const handleEdit = (portfolio: Portfolio) => {
    setEditingPortfolio(portfolio);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this portfolio? This will also delete all programs and unlink projects.')) {
      deletePortfolio(id);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-40 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Briefcase className="h-6 w-6" />
            Portfolios
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage strategic portfolios and track organizational initiatives
          </p>
        </div>
        {isAdmin && (
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) setEditingPortfolio(null);
          }}>
            <DialogTrigger asChild>
              <Button className="shrink-0">
                <Plus className="h-4 w-4 mr-2" />
                New Portfolio
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingPortfolio ? 'Edit Portfolio' : 'Create Portfolio'}
                </DialogTitle>
              </DialogHeader>
              <PortfolioForm
                portfolio={editingPortfolio || undefined}
                onSubmit={handleSubmit}
                onClose={() => {
                  setIsDialogOpen(false);
                  setEditingPortfolio(null);
                }}
                isLoading={isCreating || isUpdating}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search */}
      <div className="max-w-sm">
        <Input
          placeholder="Search portfolios..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Portfolio Grid */}
      {filteredPortfolios.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title={searchQuery ? 'No portfolios found' : 'No portfolios yet'}
          description={searchQuery 
            ? 'Try adjusting your search terms' 
            : 'Create your first portfolio to start organizing programs and projects'
          }
          action={
            isAdmin && !searchQuery ? (
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Portfolio
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredPortfolios.map((portfolio) => (
            <PortfolioCard
              key={portfolio.id}
              portfolio={portfolio}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onClick={(p) => onSelectPortfolio?.(p)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PortfolioManagement;
