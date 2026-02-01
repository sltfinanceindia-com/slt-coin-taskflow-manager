/**
 * Employee Employment Tab
 * Current position, employment type, reporting structure, history
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Edit, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO } from 'date-fns';

interface EmployeeEmploymentTabProps {
  employeeId: string;
}

export function EmployeeEmploymentTab({ employeeId }: EmployeeEmploymentTabProps) {
  const { data: employee } = useQuery({
    queryKey: ['employee-employment', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', employeeId)
        .single();
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      {/* Current Position */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Current Position</CardTitle>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Designation</p>
              <p className="font-medium capitalize">{employee?.role?.replace('_', ' ') || 'Not set'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Department</p>
              <p className="font-medium">{employee?.department || 'Not assigned'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Employee ID</p>
              <p className="font-medium">{employee?.employee_id || 'Not set'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Employment Type</p>
              <Badge variant="outline">Full-time</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Join Date</p>
              <p className="font-medium">
                {employee?.start_date 
                  ? format(parseISO(employee.start_date), 'MMM dd, yyyy') 
                  : 'Not set'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Confirmation Date</p>
              <p className="font-medium">Not set</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reporting Structure */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Reporting Structure</CardTitle>
          <CardDescription>Manager and direct reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Reports To
              </h4>
              <p className="text-muted-foreground">No manager assigned</p>
            </div>
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Direct Reports
              </h4>
              <p className="text-muted-foreground">No direct reports</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employment History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Employment History</CardTitle>
          <CardDescription>Position changes within the organization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No employment history records</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
