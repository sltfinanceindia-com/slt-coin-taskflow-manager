import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useScoringModels, ScoringCriterion, ScoringModel } from '@/hooks/useScoringModels';
import { Plus, Trash2, Star, Settings, GripVertical } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const DEFAULT_CRITERIA: ScoringCriterion[] = [
  { name: 'impact', label: 'Business Impact', weight: 25, scale_min: 1, scale_max: 5, description: 'Potential business value' },
  { name: 'urgency', label: 'Urgency', weight: 20, scale_min: 1, scale_max: 5, description: 'Time sensitivity' },
  { name: 'effort', label: 'Effort Required', weight: 20, scale_min: 1, scale_max: 5, description: 'Resource investment (inverse)' },
  { name: 'risk', label: 'Risk Level', weight: 15, scale_min: 1, scale_max: 5, description: 'Execution risk (inverse)' },
  { name: 'alignment', label: 'Strategic Alignment', weight: 20, scale_min: 1, scale_max: 5, description: 'Alignment with goals' },
];

export function ScoringModelConfig() {
  const { models, isLoading, createModel, isCreating, updateModel, deleteModel } = useScoringModels();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<ScoringModel | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Scoring Models</h2>
          <p className="text-muted-foreground">
            Configure criteria and weights for project prioritization
          </p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Model
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <ScoringModelForm
              onSubmit={async (data) => {
                await createModel(data);
                setIsCreateOpen(false);
              }}
              isSubmitting={isCreating}
              onCancel={() => setIsCreateOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : models.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Settings className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Scoring Models</h3>
            <p className="text-muted-foreground mb-4">
              Create a scoring model to start prioritizing projects.
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create First Model
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {models.map((model) => (
            <ModelCard
              key={model.id}
              model={model}
              onEdit={() => setEditingModel(model)}
              onDelete={() => deleteModel(model.id)}
              onSetDefault={() => updateModel(model.id, { is_default: true })}
            />
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingModel} onOpenChange={(open) => !open && setEditingModel(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {editingModel && (
            <ScoringModelForm
              model={editingModel}
              onSubmit={async (data) => {
                updateModel(editingModel.id, data);
                setEditingModel(null);
              }}
              isSubmitting={false}
              onCancel={() => setEditingModel(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ModelCard({
  model,
  onEdit,
  onDelete,
  onSetDefault,
}: {
  model: ScoringModel;
  onEdit: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
}) {
  const criteria = model.criteria || [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {model.name}
              {model.is_default && (
                <Badge variant="default" className="bg-primary">
                  <Star className="h-3 w-3 mr-1" />
                  Default
                </Badge>
              )}
            </CardTitle>
            {model.description && (
              <CardDescription className="mt-1">{model.description}</CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium mb-2">Criteria ({criteria.length})</p>
          <div className="flex flex-wrap gap-2">
            {criteria.slice(0, 5).map((c) => (
              <Badge key={c.name} variant="secondary">
                {c.label} ({c.weight}%)
              </Badge>
            ))}
            {criteria.length > 5 && (
              <Badge variant="outline">+{criteria.length - 5} more</Badge>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onEdit}>
            Edit
          </Button>
          {!model.is_default && (
            <Button variant="outline" size="sm" onClick={onSetDefault}>
              Set Default
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onDelete}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ScoringModelForm({
  model,
  onSubmit,
  isSubmitting,
  onCancel,
}: {
  model?: ScoringModel;
  onSubmit: (data: { name: string; description?: string; criteria: ScoringCriterion[]; is_default?: boolean }) => Promise<void>;
  isSubmitting: boolean;
  onCancel: () => void;
}) {
  const [name, setName] = useState(model?.name || '');
  const [description, setDescription] = useState(model?.description || '');
  const [isDefault, setIsDefault] = useState(model?.is_default || false);
  const [criteria, setCriteria] = useState<ScoringCriterion[]>(
    model?.criteria || DEFAULT_CRITERIA
  );

  const addCriterion = () => {
    setCriteria([
      ...criteria,
      { name: `criterion_${Date.now()}`, label: 'New Criterion', weight: 10, scale_min: 1, scale_max: 5 },
    ]);
  };

  const updateCriterion = (index: number, updates: Partial<ScoringCriterion>) => {
    const updated = [...criteria];
    updated[index] = { ...updated[index], ...updates };
    setCriteria(updated);
  };

  const removeCriterion = (index: number) => {
    setCriteria(criteria.filter((_, i) => i !== index));
  };

  const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);

  const handleSubmit = async () => {
    if (!name.trim() || criteria.length === 0) return;
    await onSubmit({ name, description, criteria, is_default: isDefault });
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{model ? 'Edit Scoring Model' : 'Create Scoring Model'}</DialogTitle>
        <DialogDescription>
          Define criteria and weights for project prioritization scoring.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6 py-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="model-name">Model Name</Label>
            <Input
              id="model-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Strategic Prioritization"
            />
          </div>
          <div className="flex items-center gap-2 pt-6">
            <Switch checked={isDefault} onCheckedChange={setIsDefault} />
            <Label>Set as default model</Label>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="model-desc">Description</Label>
          <Textarea
            id="model-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe when to use this model..."
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Criteria</Label>
            <div className="flex items-center gap-2">
              <Badge variant={totalWeight === 100 ? 'default' : 'destructive'}>
                Total: {totalWeight}%
              </Badge>
              <Button variant="outline" size="sm" onClick={addCriterion}>
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {criteria.map((criterion, index) => (
              <div key={criterion.name} className="border rounded-lg p-3 space-y-3">
                <div className="flex items-start gap-3">
                  <GripVertical className="h-5 w-5 text-muted-foreground mt-2 cursor-move" />
                  <div className="flex-1 grid gap-3 sm:grid-cols-3">
                    <div>
                      <Label className="text-xs">Label</Label>
                      <Input
                        value={criterion.label}
                        onChange={(e) => updateCriterion(index, { 
                          label: e.target.value,
                          name: e.target.value.toLowerCase().replace(/\s+/g, '_')
                        })}
                        placeholder="Criterion name"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Weight (%)</Label>
                      <div className="flex items-center gap-2">
                        <Slider
                          value={[criterion.weight]}
                          onValueChange={([v]) => updateCriterion(index, { weight: v })}
                          max={100}
                          step={5}
                          className="flex-1"
                        />
                        <span className="text-sm w-8">{criterion.weight}</span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Scale</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={criterion.scale_min}
                          onChange={(e) => updateCriterion(index, { scale_min: parseInt(e.target.value) })}
                          className="w-16"
                        />
                        <span>to</span>
                        <Input
                          type="number"
                          value={criterion.scale_max}
                          onChange={(e) => updateCriterion(index, { scale_max: parseInt(e.target.value) })}
                          className="w-16"
                        />
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeCriterion(index)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          disabled={!name.trim() || criteria.length === 0 || isSubmitting}
        >
          {isSubmitting ? 'Saving...' : model ? 'Update Model' : 'Create Model'}
        </Button>
      </DialogFooter>
    </>
  );
}
