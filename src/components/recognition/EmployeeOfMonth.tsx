/**
 * Employee of the Month Component
 * Showcase and manage monthly employee recognition with real database mutations
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/layouts/PageHeader';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format, subMonths, startOfMonth } from 'date-fns';
import { Crown, Trophy, Star, Calendar, Award, ChevronLeft, ChevronRight, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface Nomination {
  id: string;
  nominee_id: string;
  nominator_id: string;
  month: string;
  reason: string;
  created_at: string;
  nominee?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    department: string | null;
  };
}

interface Winner {
  id: string;
  employee_id: string;
  month: string;
  reason: string;
  announced_at: string;
  employee?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    department: string | null;
  };
}

export function EmployeeOfMonth() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isNominateOpen, setIsNominateOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [nominationReason, setNominationReason] = useState('');

  // Fetch employees for selection
  const { data: employees = [] } = useQuery({
    queryKey: ['employees-for-nomination', profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, department, role')
        .eq('organization_id', profile?.organization_id)
        .eq('is_active', true)
        .neq('id', profile?.id) // Can't nominate yourself
        .order('full_name');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });

  // Fetch nominations for current month (using kudos table with badge_type = 'employee_of_month')
  const { data: nominations = [] } = useQuery({
    queryKey: ['eom-nominations', profile?.organization_id, format(currentMonth, 'yyyy-MM')],
    queryFn: async () => {
      const monthStr = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('kudos')
        .select('id, to_user_id, from_user_id, message, created_at, is_public')
        .eq('organization_id', profile?.organization_id)
        .eq('badge_type', 'employee_of_month')
        .gte('created_at', monthStr)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (!data || data.length === 0) return [];
      
      // Get nominee profiles
      const nomineeIds = [...new Set(data.map(k => k.to_user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, department')
        .in('id', nomineeIds);
      
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      
      // Transform to nomination format
      return data.map(k => ({
        id: k.id,
        nominee_id: k.to_user_id,
        nominator_id: k.from_user_id,
        month: format(new Date(k.created_at), 'yyyy-MM'),
        reason: k.message,
        created_at: k.created_at,
        nominee: profileMap.get(k.to_user_id),
      })) as Nomination[];
    },
    enabled: !!profile?.organization_id,
  });

  // Fetch past winners (using kudos with is_public = true as "winners")
  const { data: pastWinners = [] } = useQuery({
    queryKey: ['eom-winners', profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('kudos')
        .select('id, to_user_id, message, created_at')
        .eq('organization_id', profile?.organization_id)
        .eq('badge_type', 'employee_of_month')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(12);
      
      if (error) throw error;
      
      if (!data || data.length === 0) return [];
      
      // Get winner profiles
      const winnerIds = [...new Set(data.map(k => k.to_user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, department')
        .in('id', winnerIds);
      
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      
      return data.map(k => ({
        id: k.id,
        employee_id: k.to_user_id,
        month: format(new Date(k.created_at), 'yyyy-MM'),
        reason: k.message,
        announced_at: k.created_at,
        employee: profileMap.get(k.to_user_id),
      })) as Winner[];
    },
    enabled: !!profile?.organization_id,
  });

  // Submit nomination mutation
  const submitNominationMutation = useMutation({
    mutationFn: async (data: { employeeId: string; reason: string }) => {
      if (!profile?.id || !profile?.organization_id) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('kudos')
        .insert({
          organization_id: profile.organization_id,
          to_user_id: data.employeeId,
          from_user_id: profile.id,
          badge_type: 'employee_of_month',
          message: data.reason,
          is_public: false, // Nominations are private until selected as winner
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eom-nominations'] });
      toast({
        title: 'Nomination Submitted',
        description: 'Your nomination has been recorded successfully.',
      });
      setIsNominateOpen(false);
      setSelectedEmployeeId('');
      setNominationReason('');
    },
    onError: (error: Error) => {
      toast({
        title: 'Nomination Failed',
        description: error.message || 'Failed to submit nomination',
        variant: 'destructive',
      });
    },
  });

  const handleSubmitNomination = () => {
    if (!selectedEmployeeId) {
      toast({
        title: 'Select Employee',
        description: 'Please select an employee to nominate',
        variant: 'destructive',
      });
      return;
    }
    if (!nominationReason.trim()) {
      toast({
        title: 'Add Reason',
        description: 'Please provide a reason for your nomination',
        variant: 'destructive',
      });
      return;
    }
    submitNominationMutation.mutate({
      employeeId: selectedEmployeeId,
      reason: nominationReason,
    });
  };

  const currentWinner = pastWinners[0];

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => {
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    if (nextMonth <= new Date()) {
      setCurrentMonth(nextMonth);
    }
  };

  // Calculate stats from real data
  const totalWinnersThisYear = pastWinners.filter(w => 
    new Date(w.announced_at).getFullYear() === new Date().getFullYear()
  ).length;
  
  const totalNominations = nominations.length;
  
  const uniqueDepartments = new Set(
    pastWinners.map(w => w.employee?.department).filter(Boolean)
  ).size;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employee of the Month"
        description="Recognize outstanding team members"
        actions={
          <Dialog open={isNominateOpen} onOpenChange={setIsNominateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Star className="h-4 w-4 mr-2" />
                Nominate
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nominate Employee of the Month</DialogTitle>
                <DialogDescription>
                  Recognize a team member for their exceptional contribution
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Select Employee</Label>
                  <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map(emp => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.full_name} {emp.department ? `- ${emp.department}` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Reason for Nomination</Label>
                  <Textarea 
                    placeholder="Describe why this person deserves recognition..." 
                    value={nominationReason}
                    onChange={(e) => setNominationReason(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsNominateOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmitNomination}
                  disabled={submitNominationMutation.isPending}
                >
                  {submitNominationMutation.isPending && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Submit Nomination
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Current Winner Spotlight */}
      {currentWinner ? (
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Crown and Avatar */}
              <div className="relative">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-10">
                  <Crown className="h-10 w-10 text-primary fill-primary" />
                </div>
                <Avatar className="h-32 w-32 border-4 border-primary shadow-lg">
                  <AvatarImage src={currentWinner.employee?.avatar_url || undefined} />
                  <AvatarFallback className="text-3xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
                    {currentWinner.employee?.full_name?.split(' ').map(n => n[0]).join('') || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Trophy className="h-3 w-3 mr-1" />
                    Winner
                  </Badge>
                </div>
              </div>

              {/* Winner Details */}
              <div className="text-center sm:text-left flex-1">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-primary">
                    {format(new Date(currentWinner.announced_at), 'MMMM yyyy')}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
                  {currentWinner.employee?.full_name || 'Unknown'}
                </h2>
                <p className="text-muted-foreground mb-4">{currentWinner.employee?.department || 'No department'}</p>
                <p className="text-foreground bg-background/60 rounded-lg p-4 italic">
                  &ldquo;{currentWinner.reason}&rdquo;
                </p>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Winner Selected Yet</h3>
            <p className="text-muted-foreground">
              Be the first to nominate someone for Employee of the Month!
            </p>
          </CardContent>
        </Card>
      )}

      {/* Current Month Nominations */}
      {nominations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              This Month&apos;s Nominations
            </CardTitle>
            <CardDescription>
              {nominations.length} nomination{nominations.length !== 1 ? 's' : ''} received for {format(currentMonth, 'MMMM yyyy')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {nominations.map((nomination) => (
                <Card key={nomination.id} className="bg-muted/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={nomination.nominee?.avatar_url || undefined} />
                        <AvatarFallback>
                          {nomination.nominee?.full_name?.split(' ').map(n => n[0]).join('') || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {nomination.nominee?.full_name || 'Unknown'}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {nomination.nominee?.department || 'No department'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          &ldquo;{nomination.reason}&rdquo;
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Past Winners */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Past Winners
            </CardTitle>
            <CardDescription>Previous employees of the month</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handlePrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[120px] text-center">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleNextMonth}
              disabled={currentMonth >= new Date()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {pastWinners.length > 1 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pastWinners.slice(1).map((winner, idx) => (
                <Card key={winner.id} className="bg-muted/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={winner.employee?.avatar_url || undefined} />
                        <AvatarFallback>
                          {winner.employee?.full_name?.split(' ').map(n => n[0]).join('') || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {winner.employee?.full_name || 'Unknown'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {winner.employee?.department || 'No department'}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(winner.announced_at), 'MMMM yyyy')}
                          </span>
                        </div>
                      </div>
                      <Badge variant="outline" className={cn(
                        idx === 0 ? 'bg-muted' : 'bg-accent/50'
                      )}>
                        <Trophy className="h-3 w-3 mr-1" />
                        #{idx + 2}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No past winners yet. Start nominating!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Trophy className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold text-foreground">{totalWinnersThisYear}</p>
            <p className="text-sm text-muted-foreground">Winners This Year</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Star className="h-8 w-8 mx-auto mb-2 text-accent-foreground" />
            <p className="text-2xl font-bold text-foreground">{totalNominations}</p>
            <p className="text-sm text-muted-foreground">Nominations This Month</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Award className="h-8 w-8 mx-auto mb-2 text-secondary-foreground" />
            <p className="text-2xl font-bold text-foreground">{uniqueDepartments}</p>
            <p className="text-sm text-muted-foreground">Departments Represented</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
