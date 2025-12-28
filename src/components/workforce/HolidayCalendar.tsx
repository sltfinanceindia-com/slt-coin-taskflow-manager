import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { format, parseISO, isFuture, isPast, isToday } from 'date-fns';
import { 
  Calendar, 
  Plus, 
  Trash2, 
  Edit, 
  PartyPopper,
  Sun,
  Umbrella,
  Star,
  Flag
} from 'lucide-react';
import { HolidayCalendarSkeleton, EmptyState } from '@/components/ui/enhanced-skeletons';

const holidayTypeConfig = {
  public: { label: 'Public Holiday', color: 'bg-red-100 text-red-800', icon: PartyPopper },
  optional: { label: 'Optional', color: 'bg-blue-100 text-blue-800', icon: Star },
  restricted: { label: 'Restricted', color: 'bg-amber-100 text-amber-800', icon: Flag },
  regional: { label: 'Regional', color: 'bg-green-100 text-green-800', icon: Sun },
};

export function HolidayCalendar() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    holiday_date: '',
    holiday_type: 'public',
    description: '',
    is_recurring: false,
  });

  const isAdmin = profile?.role === 'admin' || profile?.role === 'org_admin';

  // Fetch holidays
  const { data: holidays, isLoading } = useQuery({
    queryKey: ['holidays', profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('holidays')
        .select('*')
        .eq('organization_id', profile?.organization_id)
        .order('holiday_date', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });

  // Create/Update holiday mutation
  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (editingHoliday) {
        const { error } = await supabase
          .from('holidays')
          .update({
            name: data.name,
            holiday_date: data.holiday_date,
            holiday_type: data.holiday_type,
            description: data.description,
            is_recurring: data.is_recurring,
          })
          .eq('id', editingHoliday.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('holidays')
          .insert({
            ...data,
            organization_id: profile?.organization_id,
            created_by: profile?.id,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holidays'] });
      setIsCreateOpen(false);
      setEditingHoliday(null);
      resetForm();
      toast({ title: `Holiday ${editingHoliday ? 'updated' : 'created'} successfully` });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });

  // Delete holiday mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('holidays')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holidays'] });
      toast({ title: 'Holiday deleted successfully' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error deleting holiday', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      holiday_date: '',
      holiday_type: 'public',
      description: '',
      is_recurring: false,
    });
  };

  const openEditDialog = (holiday: any) => {
    setEditingHoliday(holiday);
    setFormData({
      name: holiday.name,
      holiday_date: holiday.holiday_date,
      holiday_type: holiday.holiday_type,
      description: holiday.description || '',
      is_recurring: holiday.is_recurring,
    });
    setIsCreateOpen(true);
  };

  // Group holidays by upcoming, today, past
  const upcomingHolidays = holidays?.filter(h => isFuture(parseISO(h.holiday_date))) || [];
  const todayHolidays = holidays?.filter(h => isToday(parseISO(h.holiday_date))) || [];
  const pastHolidays = holidays?.filter(h => isPast(parseISO(h.holiday_date)) && !isToday(parseISO(h.holiday_date))) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            Holiday Calendar
          </h1>
          <p className="text-muted-foreground">Manage organization-wide holidays</p>
        </div>
        
        {isAdmin && (
          <Dialog open={isCreateOpen} onOpenChange={(open) => {
            setIsCreateOpen(open);
            if (!open) {
              setEditingHoliday(null);
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Holiday
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingHoliday ? 'Edit Holiday' : 'Add New Holiday'}</DialogTitle>
                <DialogDescription>
                  {editingHoliday ? 'Update holiday details' : 'Create a new organization holiday'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label>Holiday Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Diwali, Christmas"
                  />
                </div>
                <div>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={formData.holiday_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, holiday_date: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Holiday Type</Label>
                  <Select
                    value={formData.holiday_type}
                    onValueChange={(v) => setFormData(prev => ({ ...prev, holiday_type: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public Holiday (Mandatory Off)</SelectItem>
                      <SelectItem value="optional">Optional Holiday</SelectItem>
                      <SelectItem value="restricted">Restricted Holiday</SelectItem>
                      <SelectItem value="regional">Regional Holiday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Description (Optional)</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Add any additional details..."
                    rows={2}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Recurring Yearly</Label>
                    <p className="text-xs text-muted-foreground">This holiday repeats every year</p>
                  </div>
                  <Switch
                    checked={formData.is_recurring}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_recurring: checked }))}
                  />
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => saveMutation.mutate(formData)}
                  disabled={saveMutation.isPending || !formData.name || !formData.holiday_date}
                >
                  {saveMutation.isPending ? 'Saving...' : editingHoliday ? 'Update Holiday' : 'Create Holiday'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Today's Holidays */}
      {todayHolidays.length > 0 && (
        <Card className="border-primary bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-primary">
              <PartyPopper className="h-5 w-5" />
              Today's Holiday
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayHolidays.map((holiday) => (
              <div key={holiday.id} className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-lg">{holiday.name}</p>
                  <p className="text-sm text-muted-foreground">{holiday.description}</p>
                </div>
                <Badge className={holidayTypeConfig[holiday.holiday_type as keyof typeof holidayTypeConfig]?.color}>
                  {holidayTypeConfig[holiday.holiday_type as keyof typeof holidayTypeConfig]?.label}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Upcoming Holidays */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upcoming Holidays</CardTitle>
          <CardDescription>{upcomingHolidays.length} holidays scheduled</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <HolidayCalendarSkeleton />
          ) : upcomingHolidays.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Holiday</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcomingHolidays.map((holiday) => {
                  const TypeIcon = holidayTypeConfig[holiday.holiday_type as keyof typeof holidayTypeConfig]?.icon || Calendar;
                  return (
                    <TableRow key={holiday.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <TypeIcon className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{holiday.name}</p>
                            {holiday.description && (
                              <p className="text-xs text-muted-foreground">{holiday.description}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{format(parseISO(holiday.holiday_date), 'EEEE')}</p>
                          <p className="text-sm text-muted-foreground">{format(parseISO(holiday.holiday_date), 'MMM dd, yyyy')}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={holidayTypeConfig[holiday.holiday_type as keyof typeof holidayTypeConfig]?.color}>
                          {holidayTypeConfig[holiday.holiday_type as keyof typeof holidayTypeConfig]?.label}
                        </Badge>
                        {holiday.is_recurring && (
                          <Badge variant="outline" className="ml-2">Yearly</Badge>
                        )}
                      </TableCell>
                      {isAdmin && (
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => openEditDialog(holiday)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-destructive"
                            onClick={() => deleteMutation.mutate(holiday.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <EmptyState
              icon={Calendar}
              title="No Upcoming Holidays"
              description="Plan ahead by adding organization holidays to the calendar. Employees will be notified of upcoming holidays."
              action={isAdmin ? {
                label: "Add Holiday",
                onClick: () => setIsCreateOpen(true)
              } : undefined}
            />
          )}
        </CardContent>
      </Card>

      {/* Past Holidays (Collapsed) */}
      {pastHolidays.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-muted-foreground">Past Holidays ({pastHolidays.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-3">
              {pastHolidays.slice(0, 6).map((holiday) => (
                <div key={holiday.id} className="p-3 bg-muted/50 rounded-lg opacity-60">
                  <p className="font-medium text-sm">{holiday.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(parseISO(holiday.holiday_date), 'MMM dd, yyyy')}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
