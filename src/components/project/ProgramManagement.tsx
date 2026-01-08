import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Layers,
  DollarSign,
  FolderOpen,
  ArrowLeft,
  Calendar,
  ExternalLink
} from 'lucide-react';
import { usePrograms, Program, CreateProgramData } from '@/hooks/usePrograms';
import { usePortfolios, Portfolio } from '@/hooks/usePortfolios';
import { useEmployeeDirectory } from '@/hooks/useEmployeeDirectory';
import { useUserRole } from '@/hooks/useUserRole';
import { formatINR } from '@/lib/currency';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';

const statusOptions = [
  { value: 'planned', label: 'Planned', color: 'bg-slate-500' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-blue-500' },
  { value: 'on_hold', label: 'On Hold', color: 'bg-amber-500' },
  { value: 'completed', label: 'Completed', color: 'bg-green-500' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-500' },
];

interface ProgramFormProps {
  program?: Program;
  portfolioId?: string;
  onSubmit: (data: CreateProgramData) => void;
  onClose: () => void;
  isLoading?: boolean;
}

const ProgramForm: React.FC<ProgramFormProps> = ({ program, portfolioId, onSubmit, onClose, isLoading }) => {
  const { employees } = useEmployeeDirectory();
  const { portfolios } = usePortfolios();
  const [formData, setFormData] = useState<CreateProgramData>({
    name: program?.name || '',
    description: program?.description || '',
    portfolio_id: program?.portfolio_id || portfolioId || '',
    owner_id: program?.owner_id || '',
    status: program?.status || 'planned',
    budget: program?.budget || 0,
    start_date: program?.start_date || '',
    target_end_date: program?.target_end_date || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <Label htmlFor="name">Program Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Product Launch 2025"
            required
          />
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Program objectives and scope..."
            rows={3}
          />
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="portfolio">Portfolio</Label>
          <Select
            value={formData.portfolio_id}
            onValueChange={(value) => setFormData({ ...formData, portfolio_id: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select portfolio (optional)" />
            </SelectTrigger>
            <SelectContent>
              {portfolios.map((portfolio) => (
                <SelectItem key={portfolio.id} value={portfolio.id}>
                  {portfolio.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
            onValueChange={(value: Program['status']) => setFormData({ ...formData, status: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((opt) => (
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
          <Label htmlFor="budget">Budget</Label>
          <Input
            id="budget"
            type="number"
            value={formData.budget}
            onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })}
            placeholder="50000"
          />
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
          {isLoading ? 'Saving...' : program ? 'Update Program' : 'Create Program'}
        </Button>
      </DialogFooter>
    </form>
  );
};

interface ProgramCardProps {
  program: Program;
  onEdit: (program: Program) => void;
  onDelete: (id: string) => void;
  onClick: (program: Program) => void;
}

const ProgramCard: React.FC<ProgramCardProps> = ({ program, onEdit, onDelete, onClick }) => {
  const navigate = useNavigate();
  const statusConfig = statusOptions.find(s => s.value === program.status);
  const budgetUsed = program.budget > 0 
    ? Math.round((program.spent_budget / program.budget) * 100) 
    : 0;

  const handleClick = () => {
    // Navigate to program detail page
    navigate(`/programs/${program.id}`);
    onClick(program);
  };

  return (
    <Card 
      className="group hover:shadow-md transition-all cursor-pointer"
      onClick={handleClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="shrink-0 rounded-lg bg-primary/10 p-2">
              <Layers className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-base sm:text-lg truncate">{program.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge variant="outline" className="text-xs">
                  <div className={`h-1.5 w-1.5 rounded-full ${statusConfig?.color} mr-1`} />
                  {statusConfig?.label}
                </Badge>
                {program.portfolio && (
                  <span className="text-xs text-muted-foreground truncate">
                    in {program.portfolio.name}
                  </span>
                )}
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
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(program); }}>
                <Edit className="h-4 w-4 mr-2" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-destructive" 
                onClick={(e) => { e.stopPropagation(); onDelete(program.id); }}
              >
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {program.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{program.description}</p>
        )}

        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="p-2 rounded-lg bg-muted/50">
            <p className="text-lg sm:text-xl font-bold">{program.projects_count || 0}</p>
            <p className="text-xs text-muted-foreground">Projects</p>
          </div>
          <div className="p-2 rounded-lg bg-muted/50">
            <p className="text-lg sm:text-xl font-bold">{program.completion_rate || 0}%</p>
            <p className="text-xs text-muted-foreground">Complete</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <DollarSign className="h-3 w-3" /> Budget
            </span>
            <span className="font-medium">{budgetUsed}%</span>
          </div>
          <Progress value={budgetUsed} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatINR(program.spent_budget || 0)}</span>
            <span>{formatINR(program.budget || 0)}</span>
          </div>
        </div>

        {(program.start_date || program.target_end_date) && (
          <div className="flex items-center gap-2 pt-2 border-t text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            {program.start_date && format(new Date(program.start_date), 'MMM d')}
            {program.start_date && program.target_end_date && ' - '}
            {program.target_end_date && format(new Date(program.target_end_date), 'MMM d, yyyy')}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface ProgramManagementProps {
  portfolioId?: string;
  portfolioName?: string;
  onBack?: () => void;
  onSelectProgram?: (program: Program) => void;
}

export const ProgramManagement: React.FC<ProgramManagementProps> = ({ 
  portfolioId, 
  portfolioName,
  onBack,
  onSelectProgram 
}) => {
  const { programs, isLoading, createProgram, updateProgram, deleteProgram, isCreating, isUpdating } = usePrograms(portfolioId);
  const { isAdmin } = useUserRole();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPrograms = programs.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = (data: CreateProgramData) => {
    if (editingProgram) {
      updateProgram({ id: editingProgram.id, ...data });
    } else {
      createProgram(data);
    }
    setIsDialogOpen(false);
    setEditingProgram(null);
  };

  const handleEdit = (program: Program) => {
    setEditingProgram(program);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this program? Projects will be unlinked.')) {
      deleteProgram(id);
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
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <Layers className="h-6 w-6" />
              Programs
            </h2>
            {portfolioName && (
              <p className="text-sm text-muted-foreground mt-1">
                in {portfolioName}
              </p>
            )}
          </div>
        </div>
        {isAdmin && (
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) setEditingProgram(null);
          }}>
            <DialogTrigger asChild>
              <Button className="shrink-0">
                <Plus className="h-4 w-4 mr-2" />
                New Program
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProgram ? 'Edit Program' : 'Create Program'}
                </DialogTitle>
              </DialogHeader>
              <ProgramForm
                program={editingProgram || undefined}
                portfolioId={portfolioId}
                onSubmit={handleSubmit}
                onClose={() => {
                  setIsDialogOpen(false);
                  setEditingProgram(null);
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
          placeholder="Search programs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Program Grid */}
      {filteredPrograms.length === 0 ? (
        <EmptyState
          icon={Layers}
          title={searchQuery ? 'No programs found' : 'No programs yet'}
          description={searchQuery 
            ? 'Try adjusting your search terms' 
            : 'Create your first program to start organizing projects'
          }
          actionLabel={isAdmin && !searchQuery ? 'Create Program' : undefined}
          onAction={isAdmin && !searchQuery ? () => setIsDialogOpen(true) : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredPrograms.map((program) => (
            <ProgramCard
              key={program.id}
              program={program}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onClick={(p) => onSelectProgram?.(p)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProgramManagement;
