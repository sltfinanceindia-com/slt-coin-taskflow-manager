import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Shield, Users, UserCheck, User, GraduationCap, Wand2, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RolePermissionMatrix, ModulePermission, PERMISSION_TEMPLATES } from './RolePermissionMatrix';
import { toast } from 'sonner';

const roleFormSchema = z.object({
  name: z.string().min(2, 'Role name must be at least 2 characters'),
  description: z.string().optional(),
  role_type: z.enum(['super_admin', 'org_admin', 'admin', 'hr_admin', 'project_manager', 'finance_manager', 'manager', 'team_lead', 'employee', 'intern']),
  hierarchy_level: z.number().min(1).max(10),
});

type RoleFormValues = z.infer<typeof roleFormSchema>;

const ROLE_TYPES = [
  { value: 'super_admin', label: 'Super Admin', icon: Crown, level: 10, color: 'bg-red-500', systemOnly: true },
  { value: 'org_admin', label: 'Organization Admin', icon: Shield, level: 9, color: 'bg-purple-500' },
  { value: 'admin', label: 'Admin', icon: Shield, level: 9, color: 'bg-indigo-500' },
  { value: 'hr_admin', label: 'HR Admin', icon: Shield, level: 8, color: 'bg-pink-500' },
  { value: 'project_manager', label: 'Project Manager', icon: Users, level: 8, color: 'bg-blue-500' },
  { value: 'finance_manager', label: 'Finance Manager', icon: Shield, level: 8, color: 'bg-cyan-500' },
  { value: 'manager', label: 'Manager', icon: Users, level: 7, color: 'bg-blue-500' },
  { value: 'team_lead', label: 'Team Lead', icon: UserCheck, level: 6, color: 'bg-sky-500' },
  { value: 'employee', label: 'Employee', icon: User, level: 5, color: 'bg-amber-500' },
  { value: 'intern', label: 'Intern', icon: GraduationCap, level: 4, color: 'bg-gray-500' },
] as const;

interface RoleEditorProps {
  initialData?: {
    id?: string;
    name: string;
    description?: string;
    role_type: string;
    hierarchy_level: number;
    is_system_role?: boolean;
    permissions?: ModulePermission[];
  };
  onSave: (data: RoleFormValues & { permissions: ModulePermission[] }) => Promise<void>;
  onCancel: () => void;
}

export function RoleEditor({ initialData, onSave, onCancel }: RoleEditorProps) {
  const [permissions, setPermissions] = useState<ModulePermission[]>(
    initialData?.permissions || PERMISSION_TEMPLATES.employee
  );
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      role_type: (initialData?.role_type as RoleFormValues['role_type']) || 'employee',
      hierarchy_level: initialData?.hierarchy_level || 2,
    },
  });

  const selectedRoleType = form.watch('role_type');
  const isSystemRole = initialData?.is_system_role;

  const applyTemplate = (template: string) => {
    const templatePerms = PERMISSION_TEMPLATES[template];
    if (templatePerms) {
      setPermissions(templatePerms);
      toast.success(`Applied ${template.replace('_', ' ')} template`);
    }
  };

  const handleRoleTypeChange = (value: string) => {
    form.setValue('role_type', value as RoleFormValues['role_type']);
    const roleConfig = ROLE_TYPES.find((r) => r.value === value);
    if (roleConfig) {
      form.setValue('hierarchy_level', roleConfig.level);
      // Auto-apply template for new roles
      if (!initialData?.id) {
        applyTemplate(value);
      }
    }
  };

  const handleSubmit = async (values: RoleFormValues) => {
    setIsSaving(true);
    try {
      await onSave({ ...values, permissions });
      toast.success(initialData?.id ? 'Role updated successfully' : 'Role created successfully');
    } catch (error) {
      toast.error('Failed to save role');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{initialData?.id ? 'Edit Role' : 'Create New Role'}</CardTitle>
          <CardDescription>
            {isSystemRole
              ? 'This is a system role. Only permissions can be modified.'
              : 'Configure the role details and permissions.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Project Manager"
                          {...field}
                          disabled={isSystemRole}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base Role Type</FormLabel>
                      <Select
                        onValueChange={handleRoleTypeChange}
                        defaultValue={field.value}
                        disabled={isSystemRole}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ROLE_TYPES.filter(role => !('systemOnly' in role && role.systemOnly) || initialData?.role_type === role.value).map((role) => (
                            <SelectItem key={role.value} value={role.value}>
                              <div className="flex items-center gap-2">
                                <role.icon className="h-4 w-4" />
                                <span>{role.label}</span>
                                <Badge variant="outline" className="ml-2">
                                  Level {role.level}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        This determines the base hierarchy level
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the responsibilities of this role..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              {/* Permission Templates */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Quick Templates</h3>
                    <p className="text-sm text-muted-foreground">
                      Apply a preset permission configuration
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {ROLE_TYPES.filter(role => !('systemOnly' in role && role.systemOnly)).map((role) => (
                    <Button
                      key={role.value}
                      type="button"
                      variant={selectedRoleType === role.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => applyTemplate(role.value)}
                      data-testid={`template-${role.value}`}
                    >
                      <Wand2 className="h-3 w-3 mr-1" />
                      {role.label}
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Permission Matrix */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">Permissions</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure what this role can access and modify
                  </p>
                </div>
                <RolePermissionMatrix
                  permissions={permissions}
                  onChange={setPermissions}
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? 'Saving...' : initialData?.id ? 'Update Role' : 'Create Role'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
