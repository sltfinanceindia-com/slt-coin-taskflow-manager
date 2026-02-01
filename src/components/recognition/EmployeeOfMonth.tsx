/**
 * Employee of the Month Component
 * Showcase and manage monthly employee recognition
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
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format, subMonths } from 'date-fns';
import { Crown, Trophy, Star, Calendar, Award, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export function EmployeeOfMonth() {
  const { profile } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isNominateOpen, setIsNominateOpen] = useState(false);

  // Fetch employees for selection
  const { data: employees } = useQuery({
    queryKey: ['employees-for-nomination', profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, department, role')
        .eq('organization_id', profile?.organization_id)
        .order('full_name');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });

  // Mock data for past winners (in real app, this would come from a dedicated table)
  const pastWinners = [
    {
      id: '1',
      name: 'Sarah Johnson',
      department: 'Engineering',
      month: subMonths(currentMonth, 0),
      reason: 'Led the successful launch of our new mobile app',
      avatar: null,
    },
    {
      id: '2',
      name: 'Michael Chen',
      department: 'Sales',
      month: subMonths(currentMonth, 1),
      reason: 'Exceeded Q4 targets by 150%',
      avatar: null,
    },
    {
      id: '3',
      name: 'Emily Davis',
      department: 'HR',
      month: subMonths(currentMonth, 2),
      reason: 'Implemented new employee wellness program',
      avatar: null,
    },
  ];

  const currentWinner = pastWinners[0];

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => {
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    if (nextMonth <= new Date()) {
      setCurrentMonth(nextMonth);
    }
  };

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
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees?.map(emp => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.full_name} - {emp.department}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Reason for Nomination</Label>
                  <Textarea placeholder="Describe why this person deserves recognition..." />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsNominateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsNominateOpen(false)}>
                  Submit Nomination
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Current Winner Spotlight */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Crown and Avatar */}
            <div className="relative">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-10">
                <Crown className="h-10 w-10 text-primary fill-primary" />
              </div>
              <Avatar className="h-32 w-32 border-4 border-primary shadow-lg">
                <AvatarImage src={currentWinner.avatar || undefined} />
                <AvatarFallback className="text-3xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
                  {currentWinner.name.split(' ').map(n => n[0]).join('')}
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
                  {format(currentWinner.month, 'MMMM yyyy')}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
                {currentWinner.name}
              </h2>
              <p className="text-muted-foreground mb-4">{currentWinner.department}</p>
              <p className="text-foreground bg-background/60 rounded-lg p-4 italic">
                "{currentWinner.reason}"
              </p>
            </div>
          </div>
        </div>
      </Card>

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pastWinners.slice(1).map((winner, idx) => (
              <Card key={winner.id} className="bg-muted/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={winner.avatar || undefined} />
                      <AvatarFallback>
                        {winner.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{winner.name}</p>
                      <p className="text-sm text-muted-foreground">{winner.department}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {format(winner.month, 'MMMM yyyy')}
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
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Trophy className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold text-foreground">12</p>
            <p className="text-sm text-muted-foreground">Total Winners This Year</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Star className="h-8 w-8 mx-auto mb-2 text-accent-foreground" />
            <p className="text-2xl font-bold text-foreground">47</p>
            <p className="text-sm text-muted-foreground">Nominations Received</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Award className="h-8 w-8 mx-auto mb-2 text-secondary-foreground" />
            <p className="text-2xl font-bold text-foreground">5</p>
            <p className="text-sm text-muted-foreground">Departments Represented</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
