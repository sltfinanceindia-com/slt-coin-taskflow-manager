import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Search, Users, Grid3X3, List, Mail, MessageSquare, 
  Coins, Calendar, Building2, User
} from 'lucide-react';
import { useEmployeeDirectory } from '@/hooks/useEmployeeDirectory';
import { useAchievements } from '@/hooks/useAchievements';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface EmployeeProfileModalProps {
  employee: any;
  open: boolean;
  onClose: () => void;
}

function EmployeeProfileModal({ employee, open, onClose }: EmployeeProfileModalProps) {
  const { getUserAchievements } = useAchievements();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Employee Profile</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={employee?.avatar_url || undefined} />
              <AvatarFallback className="text-lg">
                {employee?.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">{employee?.full_name}</h3>
              <Badge variant="outline" className="capitalize">{employee?.role}</Badge>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{employee?.email}</span>
            </div>
            {employee?.department && (
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span>{employee.department.name}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <Coins className="h-4 w-4 text-yellow-500" />
              <span>{employee?.total_coins?.toLocaleString() || 0} coins earned</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Joined {employee?.created_at ? format(new Date(employee.created_at), 'MMM yyyy') : 'N/A'}</span>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button className="flex-1" size="sm">
              <MessageSquare className="h-4 w-4 mr-2" />
              Message
            </Button>
            <Button variant="outline" className="flex-1" size="sm">
              <User className="h-4 w-4 mr-2" />
              View Full Profile
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function EmployeeDirectory() {
  const { employees, departments, isLoading, roles } = useEmployeeDirectory();
  const [search, setSearch] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const matchesSearch = 
        employee.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        employee.email?.toLowerCase().includes(search.toLowerCase());
      const matchesDepartment = 
        selectedDepartment === 'all' || 
        employee.department_id === selectedDepartment ||
        (selectedDepartment === 'none' && !employee.department_id);
      const matchesRole = 
        selectedRole === 'all' || 
        employee.role === selectedRole;
      
      return matchesSearch && matchesDepartment && matchesRole;
    });
  }, [employees, search, selectedDepartment, selectedRole]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Employee Directory
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse p-4 rounded-lg bg-muted/50">
                <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-3" />
                <div className="h-4 bg-muted rounded w-2/3 mx-auto mb-2" />
                <div className="h-3 bg-muted rounded w-1/2 mx-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Employee Directory
              <Badge variant="secondary">{employees.length}</Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="none">No Department</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {roles.map((role) => (
                  <SelectItem key={role} value={role} className="capitalize">{role}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Employee Grid/List */}
          <ScrollArea className="h-[500px]">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredEmployees.map((employee) => (
                  <div
                    key={employee.id}
                    className="p-4 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer transition-all text-center"
                    onClick={() => setSelectedEmployee(employee)}
                  >
                    <Avatar className="h-16 w-16 mx-auto mb-3">
                      <AvatarImage src={employee.avatar_url || undefined} />
                      <AvatarFallback>
                        {employee.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <h4 className="font-medium text-sm truncate">{employee.full_name}</h4>
                    <Badge variant="outline" className="text-xs capitalize mt-1">
                      {employee.role}
                    </Badge>
                    {employee.department && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {employee.department.name}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredEmployees.map((employee) => (
                  <div
                    key={employee.id}
                    className="flex items-center gap-4 p-3 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer transition-all"
                    onClick={() => setSelectedEmployee(employee)}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={employee.avatar_url || undefined} />
                      <AvatarFallback>
                        {employee.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{employee.full_name}</h4>
                      <p className="text-sm text-muted-foreground truncate">{employee.email}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <Badge variant="outline" className="capitalize">{employee.role}</Badge>
                      {employee.department && (
                        <p className="text-xs text-muted-foreground mt-1">{employee.department.name}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {filteredEmployees.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No employees found</p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <EmployeeProfileModal
        employee={selectedEmployee}
        open={!!selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
      />
    </>
  );
}
