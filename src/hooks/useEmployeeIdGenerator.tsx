import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

/**
 * Hook to generate the next employee ID for an organization
 */
export function useEmployeeIdGenerator() {
  const { profile } = useAuth();

  const { data: nextEmployeeId, refetch } = useQuery({
    queryKey: ['next-employee-id', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return 'EMP-001';

      // Default prefix
      const prefix = 'EMP';
      
      // Get the highest employee ID
      const { data: employees } = await supabase
        .from('profiles')
        .select('employee_id')
        .eq('organization_id', profile.organization_id)
        .not('employee_id', 'is', null)
        .order('employee_id', { ascending: false });

      if (!employees || employees.length === 0) {
        return `${prefix}-001`;
      }

      // Find the highest number
      let maxNumber = 0;
      const pattern = new RegExp(`^${prefix}-(\\d+)$`, 'i');
      
      for (const emp of employees) {
        if (emp.employee_id) {
          const match = emp.employee_id.match(pattern);
          if (match) {
            const num = parseInt(match[1], 10);
            if (num > maxNumber) {
              maxNumber = num;
            }
          }
        }
      }

      // Generate next ID
      const nextNumber = maxNumber + 1;
      const paddedNumber = String(nextNumber).padStart(3, '0');
      return `${prefix}-${paddedNumber}`;
    },
    enabled: !!profile?.organization_id,
    staleTime: 0, // Always refetch to get the latest
  });

  return {
    nextEmployeeId: nextEmployeeId || 'EMP-001',
    refetch,
  };
}

/**
 * Validate employee ID format
 */
export function validateEmployeeId(employeeId: string): boolean {
  // Basic format: PREFIX-XXX where XXX is a number
  const pattern = /^[A-Z]{2,5}-\d{3,6}$/;
  return pattern.test(employeeId);
}

/**
 * Check if employee ID is unique in the organization
 */
export async function checkEmployeeIdUnique(
  employeeId: string, 
  organizationId: string, 
  excludeUserId?: string
): Promise<boolean> {
  let query = supabase
    .from('profiles')
    .select('id')
    .eq('organization_id', organizationId)
    .eq('employee_id', employeeId);

  if (excludeUserId) {
    query = query.neq('id', excludeUserId);
  }

  const { data } = await query;
  return !data || data.length === 0;
}
