import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useShiftTypes, ShiftType } from '@/hooks/useShifts';
import { Plus, Edit, Trash2, Clock, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useForm } from 'react-hook-form';
import { toast } from '@/hooks/use-toast';

interface ShiftTypeFormData {
  name: string;
  start_time: string;
  end_time: string;
  color: string;
  description: string;
  is_active: boolean;
}

const DEFAULT_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#84CC16', // Lime
];

export function ShiftTypeManager() {
  const { shiftTypes, isLoading, createShiftType, updateShiftType, deleteShiftType } = useShiftTypes();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<ShiftType | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const { register, handleSubmit, reset, setValue, watch } = useForm<ShiftTypeFormData>({
    defaultValues: {
      name: '',
      start_time: '09:00',
      end_time: '17:00',
      color: '#3B82F6',
      description: '',
      is_active: true,
    },
  });

  const selectedColor = watch('color');

  const openEditDialog = (shift: ShiftType) => {
    setEditingShift(shift);
    setValue('name', shift.name);
    setValue('start_time', shift.start_time);
    setValue('end_time', shift.end_time);
    setValue('color', shift.color);
    setValue('description', shift.description || '');
    setValue('is_active', shift.is_active);
    setDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingShift(null);
    reset();
    setDialogOpen(true);
  };

  const onSubmit = async (data: ShiftTypeFormData) => {
    try {
      if (editingShift) {
        await updateShiftType.mutateAsync({ id: editingShift.id, ...data });
      } else {
        await createShiftType.mutateAsync(data);
      }
      setDialogOpen(false);
      reset();
      setEditingShift(null);
    } catch (error) {
      // Error handled in mutation
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteShiftType.mutateAsync(id);
      setDeleteConfirmId(null);
    } catch (error) {
      // Error handled in mutation
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Shift Types</CardTitle>
            <CardDescription>
              Define different shift types with their schedules
            </CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Add Shift Type
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <form onSubmit={handleSubmit(onSubmit)}>
                <DialogHeader>
                  <DialogTitle>
                    {editingShift ? 'Edit Shift Type' : 'Create Shift Type'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingShift
                      ? 'Update the shift type details'
                      : 'Add a new shift type to your organization'}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Shift Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Morning Shift"
                      {...register('name', { required: true })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="start_time">Start Time</Label>
                      <Input
                        id="start_time"
                        type="time"
                        {...register('start_time', { required: true })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="end_time">End Time</Label>
                      <Input
                        id="end_time"
                        type="time"
                        {...register('end_time', { required: true })}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Color</Label>
                    <div className="flex gap-2 flex-wrap">
                      {DEFAULT_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={`w-8 h-8 rounded-full border-2 transition-all ${
                            selectedColor === color
                              ? 'border-foreground scale-110'
                              : 'border-transparent'
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => setValue('color', color)}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Optional description..."
                      {...register('description')}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="is_active">Active</Label>
                    <Switch
                      id="is_active"
                      checked={watch('is_active')}
                      onCheckedChange={(checked) => setValue('is_active', checked)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createShiftType.isPending || updateShiftType.isPending}
                  >
                    {(createShiftType.isPending || updateShiftType.isPending) && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    {editingShift ? 'Update' : 'Create'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : shiftTypes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Clock className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No shift types yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first shift type to start scheduling
              </p>
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Add Shift Type
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shiftTypes.map((shift) => (
                  <TableRow key={shift.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: shift.color }}
                        />
                        <span className="font-medium">{shift.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {shift.start_time} - {shift.end_time}
                    </TableCell>
                    <TableCell>
                      <Badge variant={shift.is_active ? 'default' : 'secondary'}>
                        {shift.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {shift.description || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(shift)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Dialog
                          open={deleteConfirmId === shift.id}
                          onOpenChange={(open) => !open && setDeleteConfirmId(null)}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                              onClick={() => setDeleteConfirmId(shift.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Delete Shift Type</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to delete "{shift.name}"? This will also
                                remove all scheduled shifts of this type.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => setDeleteConfirmId(null)}
                              >
                                Cancel
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => handleDelete(shift.id)}
                                disabled={deleteShiftType.isPending}
                              >
                                {deleteShiftType.isPending && (
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                )}
                                Delete
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
