import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Employee {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  role: string;
  department_id: string | null;
  department?: {
    id: string;
    name: string;
    color: string;
  } | null;
  is_active: boolean;
  total_coins: number;
  created_at: string;
}

interface Department {
  id: string;
  name: string;
  description: string | null;
  color: string;
  head_id: string | null;
  head?: {
    full_name: string;
    avatar_url: string | null;
  } | null;
}

export function useEmployeeDirectory() {
  const { profile } = useAuth();

  // Fetch employees
  const { data: employees, isLoading: employeesLoading } = useQuery({
    queryKey: ['employees', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          department:departments(id, name, color)
        `)
        .eq('organization_id', profile.organization_id)
        .eq('is_active', true)
        .order('full_name', { ascending: true });

      if (error) throw error;
      return data as Employee[];
    },
    enabled: !!profile?.organization_id,
  });

  // Fetch departments
  const { data: departments, isLoading: departmentsLoading } = useQuery({
    queryKey: ['departments', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .from('departments')
        .select(`
          *,
          head:profiles!departments_head_id_fkey(full_name, avatar_url)
        `)
        .eq('organization_id', profile.organization_id)
        .order('name', { ascending: true });

      if (error) throw error;
      return data as Department[];
    },
    enabled: !!profile?.organization_id,
  });

  // Get employees by department
  const getEmployeesByDepartment = (departmentId: string | null) => {
    if (!departmentId) {
      return employees?.filter((e) => !e.department_id) || [];
    }
    return employees?.filter((e) => e.department_id === departmentId) || [];
  };

  // Get unique roles
  const roles = [...new Set(employees?.map((e) => e.role) || [])];

  return {
    employees: employees || [],
    departments: departments || [],
    isLoading: employeesLoading || departmentsLoading,
    getEmployeesByDepartment,
    roles,
  };
}
