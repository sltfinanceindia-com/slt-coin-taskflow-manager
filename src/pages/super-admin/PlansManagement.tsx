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
import { ScrollArea } from "@/components/ui/scroll-area";
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
      
      const transformedPlans: SubscriptionPlan[] = (data || []).map(plan => ({
        ...plan,
        description: null,
        is_default: false,
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
      <div className="space-y-4 sm:space-y-6">
        {/* Header - Responsive */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Subscription Plans</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Manage pricing plans and features</p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={fetchPlans} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreateDialog} size="sm">
                  <Plus className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Add Plan</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh]">
                <DialogHeader>
                  <DialogTitle>{editingPlan ? "Edit Plan" : "Create New Plan"}</DialogTitle>
                  <DialogDescription>
                    {editingPlan ? "Update plan details" : "Add a new subscription plan"}
                  </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[60vh] pr-4">
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm">Plan Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g., Professional"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="code" className="text-sm">Code</Label>
                        <Input
                          id="code"
                          value={formData.code}
                          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                          placeholder="e.g., pro"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-sm">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Brief description of the plan"
                        rows={2}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="price_monthly" className="text-sm">Monthly ($)</Label>
                        <Input
                          id="price_monthly"
                          type="number"
                          value={formData.price_monthly}
                          onChange={(e) => setFormData({ ...formData, price_monthly: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="price_yearly" className="text-sm">Yearly ($)</Label>
                        <Input
                          id="price_yearly"
                          type="number"
                          value={formData.price_yearly}
                          onChange={(e) => setFormData({ ...formData, price_yearly: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="max_users" className="text-sm">Max Users</Label>
                      <Input
                        id="max_users"
                        type="number"
                        value={formData.max_users}
                        onChange={(e) => setFormData({ ...formData, max_users: parseInt(e.target.value) || 0 })}
                      />
                      <p className="text-xs text-muted-foreground">Use -1 for unlimited</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="features" className="text-sm">Features (one per line)</Label>
                      <Textarea
                        id="features"
                        value={formData.features}
                        onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                        placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                        rows={4}
                      />
                    </div>

                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={formData.is_active}
                          onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                        />
                        <Label className="text-sm">Active</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={formData.is_default}
                          onCheckedChange={(checked) => setFormData({ ...formData, is_default: checked })}
                        />
                        <Label className="text-sm">Default</Label>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
                <DialogFooter className="flex-col sm:flex-row gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto">
                    {isSaving ? "Saving..." : editingPlan ? "Update" : "Create"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Plans Table/Cards */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Package className="h-4 w-4 sm:h-5 sm:w-5" />
              All Plans
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Configure subscription tiers and pricing</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
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
              <>
                {/* Desktop Table */}
                <div className="hidden lg:block rounded-md border">
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
                            <div className="flex items-center justify-end gap-1">
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

                {/* Mobile/Tablet Cards */}
                <div className="lg:hidden space-y-3">
                  {plans.map((plan) => (
                    <Card key={plan.id} className="p-3 sm:p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium">{plan.name}</span>
                            <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{plan.code}</code>
                            {plan.is_default && (
                              <Badge variant="secondary" className="text-[10px]">Default</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                            <span>${plan.price_monthly}/mo</span>
                            {plan.price_yearly && <span>${plan.price_yearly}/yr</span>}
                          </div>
                        </div>
                        <Badge variant={plan.is_active ? "default" : "secondary"} className="shrink-0">
                          {plan.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t">
                        <span className="text-xs text-muted-foreground">
                          {plan.max_users === -1 ? "Unlimited users" : `${plan.max_users} users max`}
                        </span>
                        <div className="flex items-center gap-1">
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
                      </div>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Features Preview - Responsive */}
        {plans.length > 0 && (
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {plans.filter(p => p.is_active).map((plan) => (
              <Card key={plan.id} className={plan.is_default ? "border-primary" : ""}>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center justify-between text-base sm:text-lg">
                    {plan.name}
                    {plan.is_default && <Badge className="text-[10px] sm:text-xs">Popular</Badge>}
                  </CardTitle>
                  <div className="mt-2">
                    <span className="text-2xl sm:text-3xl font-bold">${plan.price_monthly}</span>
                    <span className="text-sm text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
                  <ul className="space-y-1.5 sm:space-y-2">
                    {plan.features?.slice(0, 5).map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-xs sm:text-sm">
                        <Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mt-0.5 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                    {plan.features && plan.features.length > 5 && (
                      <li className="text-xs sm:text-sm text-muted-foreground">
                        +{plan.features.length - 5} more features
                      </li>
                    )}
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