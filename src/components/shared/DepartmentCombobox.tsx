import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Command, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem, 
  CommandList,
  CommandSeparator
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown, Plus, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface DepartmentComboboxProps {
  value: string | null;
  onValueChange: (value: string | null) => void;
  placeholder?: string;
  className?: string;
  allowCreate?: boolean;
}

export function DepartmentCombobox({ 
  value, 
  onValueChange, 
  placeholder = "Select department...",
  className,
  allowCreate = true
}: DepartmentComboboxProps) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');

  // Fetch departments
  const { data: departments } = useQuery({
    queryKey: ['departments', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      const { data, error } = await supabase
        .from('departments')
        .select('id, name, color, description')
        .eq('organization_id', profile.organization_id)
        .order('name', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.organization_id,
  });

  // Create department mutation
  const createDepartment = useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from('departments')
        .insert({
          name,
          organization_id: profile?.organization_id,
          color: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'),
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      onValueChange(data.id);
      setIsCreating(false);
      setNewDeptName('');
      setOpen(false);
      toast.success('Department created');
    },
    onError: () => {
      toast.error('Failed to create department');
    },
  });

  const selectedDepartment = departments?.find(d => d.id === value);

  const filteredDepartments = departments?.filter(d =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateDepartment = () => {
    if (!newDeptName.trim()) {
      toast.error('Please enter a department name');
      return;
    }
    createDepartment.mutate(newDeptName.trim());
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between font-normal", className)}
        >
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className={!selectedDepartment ? "text-muted-foreground" : ""}>
              {selectedDepartment?.name || placeholder}
            </span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        {isCreating ? (
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <Label>New Department Name</Label>
              <Input
                value={newDeptName}
                onChange={(e) => setNewDeptName(e.target.value)}
                placeholder="e.g., Engineering, Marketing..."
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={handleCreateDepartment}
                disabled={createDepartment.isPending}
              >
                Create
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => {
                  setIsCreating(false);
                  setNewDeptName('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Command>
            <CommandInput 
              placeholder="Search departments..." 
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              <CommandEmpty>
                <div className="py-4 text-center text-sm">
                  <p className="text-muted-foreground mb-2">No department found</p>
                  {allowCreate && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setNewDeptName(searchQuery);
                        setIsCreating(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create "{searchQuery}"
                    </Button>
                  )}
                </div>
              </CommandEmpty>
              <CommandGroup>
                <CommandItem
                  value="none"
                  onSelect={() => {
                    onValueChange(null);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      !value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="text-muted-foreground">No Department</span>
                </CommandItem>
                {filteredDepartments?.map((dept) => (
                  <CommandItem
                    key={dept.id}
                    value={dept.name}
                    onSelect={() => {
                      onValueChange(dept.id);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === dept.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: dept.color || '#94a3b8' }}
                    />
                    {dept.name}
                  </CommandItem>
                ))}
              </CommandGroup>
              {allowCreate && (
                <>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => setIsCreating(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Create New Department
                    </CommandItem>
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        )}
      </PopoverContent>
    </Popover>
  );
}
