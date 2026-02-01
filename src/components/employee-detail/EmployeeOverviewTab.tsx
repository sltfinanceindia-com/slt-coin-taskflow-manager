/**
 * Employee Overview Tab
 * Profile card, quick stats, employment summary, recent activity
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Mail, Phone, Building, MapPin, Calendar, Users } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface EmployeeOverviewTabProps {
  employee: any;
  stats: any;
}

export function EmployeeOverviewTab({ employee, stats }: EmployeeOverviewTabProps) {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      {/* Profile Card */}
      <Card className="md:col-span-1">
        <CardHeader className="text-center pb-2">
          <Avatar className="h-24 w-24 mx-auto">
            <AvatarImage src={employee.avatar_url || ''} />
            <AvatarFallback className="text-2xl">{employee.full_name?.charAt(0) || 'E'}</AvatarFallback>
          </Avatar>
          <CardTitle className="mt-4">{employee.full_name}</CardTitle>
          <CardDescription>{employee.role || 'Employee'}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="truncate">{employee.email}</span>
          </div>
          {employee.department && (
            <div className="flex items-center gap-2 text-sm">
              <Building className="h-4 w-4 text-muted-foreground" />
              <span>{employee.department}</span>
            </div>
          )}
          {employee.employee_id && (
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>ID: {employee.employee_id}</span>
            </div>
          )}
          {employee.start_date && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Joined {format(parseISO(employee.start_date), 'MMM dd, yyyy')}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Employment Summary */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg">Employment Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Role</p>
              <p className="font-medium capitalize">{employee.role?.replace('_', ' ') || 'Employee'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Department</p>
              <p className="font-medium">{employee.department || 'Not assigned'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Employee ID</p>
              <p className="font-medium">{employee.employee_id || 'Not set'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant={employee.is_active !== false ? 'default' : 'destructive'}>
                {employee.is_active !== false ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Start Date</p>
              <p className="font-medium">
                {employee.start_date 
                  ? format(parseISO(employee.start_date), 'MMM dd, yyyy') 
                  : 'Not set'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Coins</p>
              <p className="font-medium">{employee.total_coins || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="md:col-span-3">
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
          <CardDescription>Latest updates and actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No recent activity to display</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
