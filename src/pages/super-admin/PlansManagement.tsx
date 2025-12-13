import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useIsSuperAdmin } from "@/hooks/useUserRole";
import SuperAdminLayout from "@/components/super-admin/SuperAdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Package, Plus, Edit, Trash2, Check, X, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";

interface SubscriptionPlan {
  id: string;
  name: string;
  code: string;
  description: string | null;
  price_monthly: number;
  price_yearly: number | null;
  max_users: number;
  features: string[];
  is_active: boolean;
  is_default: boolean;
  created_at: string;
}

const PlansManagement = () => {
  const navigate = useNavigate();
  const { isSuperAdmin, isLoading: roleLoading } = useIsSuperAdmin();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    price_monthly: 0,
    price_yearly: 0,
    max_users: 10,
    features: "",
    is_active: true,
    is_default: false,
  });

  useEffect(() => {
    if (!roleLoading && !isSuperAdmin) {
      navigate("/");
    }
  }, [isSuperAdmin, roleLoading, navigate]);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("*")
        .order("price_monthly", { ascending: true });

      if (error) throw error;
      
      // Transform data to match our interface
      const transformedPlans: SubscriptionPlan[] = (data || []).map(plan => ({
        ...plan,
        description: null, // Not in DB schema
        is_default: false, // Not in DB schema
        features: Array.isArray(plan.features) ? plan.features as string[] : [],
      }));
      
      setPlans(transformedPlans);
    } catch (error) {
      console.error("Error fetching plans:", error);
      toast.error("Failed to load plans");
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingPlan(null);
    setFormData({
      name: "",
      code: "",
      description: "",
      price_monthly: 0,
      price_yearly: 0,
      max_users: 10,
      features: "",
      is_active: true,
      is_default: false,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      code: plan.code,
      description: plan.description || "",
      price_monthly: plan.price_monthly,
      price_yearly: plan.price_yearly || 0,
      max_users: plan.max_users,
      features: plan.features?.join("\n") || "",
      is_active: plan.is_active,
      is_default: plan.is_default,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.code) {
      toast.error("Name and code are required");
      return;
    }

    setIsSaving(true);
    try {
      const featuresArray = formData.features.split("\n").filter(f => f.trim());
      const planCode = formData.code.toLowerCase().replace(/\s+/g, "_") as "free" | "starter" | "professional" | "enterprise";
      
      const planData = {
        name: formData.name,
        code: planCode,
        price_monthly: formData.price_monthly,
        price_yearly: formData.price_yearly || formData.price_monthly * 10,
        max_users: formData.max_users,
        features: featuresArray as unknown as Json,
        is_active: formData.is_active,
      };

      if (editingPlan) {
        const { error } = await supabase
          .from("subscription_plans")
          .update(planData)
          .eq("id", editingPlan.id);

        if (error) throw error;
        toast.success("Plan updated successfully");
      } else {
        const { error } = await supabase
          .from("subscription_plans")
          .insert([planData]);

        if (error) throw error;
        toast.success("Plan created successfully");
      }

      setIsDialogOpen(false);
      fetchPlans();
    } catch (error: any) {
      console.error("Error saving plan:", error);
      toast.error(error.message || "Failed to save plan");
    } finally {
      setIsSaving(false);
    }
  };

  const togglePlanStatus = async (plan: SubscriptionPlan) => {
    try {
      const { error } = await supabase
        .from("subscription_plans")
        .update({ is_active: !plan.is_active })
        .eq("id", plan.id);

      if (error) throw error;
      toast.success(`Plan ${plan.is_active ? "deactivated" : "activated"}`);
      fetchPlans();
    } catch (error) {
      console.error("Error toggling plan status:", error);
      toast.error("Failed to update plan status");
    }
  };

  const deletePlan = async (plan: SubscriptionPlan) => {
    if (!confirm(`Are you sure you want to delete "${plan.name}"?`)) return;

    try {
      const { error } = await supabase
        .from("subscription_plans")
        .delete()
        .eq("id", plan.id);

      if (error) throw error;
      toast.success("Plan deleted successfully");
      fetchPlans();
    } catch (error: any) {
      console.error("Error deleting plan:", error);
      toast.error(error.message || "Failed to delete plan");
    }
  };

  if (roleLoading) {
    return (
      <SuperAdminLayout>
        <div className="flex items-center justify-center h-64">
          <Skeleton className="h-12 w-12 rounded-full" />
        </div>
      </SuperAdminLayout>
    );
  }

  if (!isSuperAdmin) return null;

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Subscription Plans</h1>
            <p className="text-muted-foreground">Manage pricing plans and features</p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={fetchPlans} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreateDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Plan
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingPlan ? "Edit Plan" : "Create New Plan"}</DialogTitle>
                  <DialogDescription>
                    {editingPlan ? "Update plan details" : "Add a new subscription plan"}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Plan Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Professional"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="code">Code</Label>
                      <Input
                        id="code"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        placeholder="e.g., pro"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Brief description of the plan"
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price_monthly">Monthly Price ($)</Label>
                      <Input
                        id="price_monthly"
                        type="number"
                        value={formData.price_monthly}
                        onChange={(e) => setFormData({ ...formData, price_monthly: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price_yearly">Yearly Price ($)</Label>
                      <Input
                        id="price_yearly"
                        type="number"
                        value={formData.price_yearly}
                        onChange={(e) => setFormData({ ...formData, price_yearly: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max_users">Max Users</Label>
                    <Input
                      id="max_users"
                      type="number"
                      value={formData.max_users}
                      onChange={(e) => setFormData({ ...formData, max_users: parseInt(e.target.value) || 0 })}
                    />
                    <p className="text-xs text-muted-foreground">Use -1 for unlimited</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="features">Features (one per line)</Label>
                    <Textarea
                      id="features"
                      value={formData.features}
                      onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                      placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                      rows={4}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={formData.is_active}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                      />
                      <Label>Active</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={formData.is_default}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_default: checked })}
                      />
                      <Label>Default Plan</Label>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? "Saving..." : editingPlan ? "Update" : "Create"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Plans Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              All Plans
            </CardTitle>
            <CardDescription>Configure subscription tiers and pricing</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : plans.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No plans configured</p>
                <Button className="mt-4" onClick={openCreateDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Plan
                </Button>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Plan</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Monthly</TableHead>
                      <TableHead>Yearly</TableHead>
                      <TableHead>Max Users</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {plans.map((plan) => (
                      <TableRow key={plan.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{plan.name}</span>
                            {plan.is_default && (
                              <Badge variant="secondary" className="text-xs">Default</Badge>
                            )}
                          </div>
                          {plan.description && (
                            <p className="text-xs text-muted-foreground mt-1">{plan.description}</p>
                          )}
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-2 py-1 rounded">{plan.code}</code>
                        </TableCell>
                        <TableCell>${plan.price_monthly}</TableCell>
                        <TableCell>
                          {plan.price_yearly ? `$${plan.price_yearly}` : "-"}
                        </TableCell>
                        <TableCell>
                          {plan.max_users === -1 ? "Unlimited" : plan.max_users}
                        </TableCell>
                        <TableCell>
                          <Badge variant={plan.is_active ? "default" : "secondary"}>
                            {plan.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => togglePlanStatus(plan)}
                            >
                              {plan.is_active ? (
                                <X className="h-4 w-4 text-destructive" />
                              ) : (
                                <Check className="h-4 w-4 text-green-500" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(plan)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deletePlan(plan)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Features Preview */}
        {plans.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {plans.filter(p => p.is_active).map((plan) => (
              <Card key={plan.id} className={plan.is_default ? "border-primary" : ""}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {plan.name}
                    {plan.is_default && <Badge>Popular</Badge>}
                  </CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-4">
                    ${plan.price_monthly}
                    <span className="text-sm font-normal text-muted-foreground">/month</span>
                  </div>
                  <ul className="space-y-2">
                    {plan.features?.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500" />
                        {feature}
                      </li>
                    ))}
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      {plan.max_users === -1 ? "Unlimited users" : `Up to ${plan.max_users} users`}
                    </li>
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </SuperAdminLayout>
  );
};

export default PlansManagement;
