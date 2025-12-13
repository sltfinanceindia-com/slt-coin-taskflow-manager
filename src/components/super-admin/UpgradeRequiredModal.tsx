import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Users, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Plan {
  id: string;
  name: string;
  price_monthly: number;
  max_users: number;
  features: string[];
}

interface UpgradeRequiredModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlan: string;
  currentUsers: number;
  maxUsers: number;
  organizationId: string;
  onUpgradeSuccess?: () => void;
}

export function UpgradeRequiredModal({
  open,
  onOpenChange,
  currentPlan,
  currentUsers,
  maxUsers,
  organizationId,
  onUpgradeSuccess
}: UpgradeRequiredModalProps) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [upgrading, setUpgrading] = useState(false);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('id, name, price_monthly, max_users, features')
        .eq('is_active', true)
        .gt('max_users', maxUsers)
        .order('price_monthly', { ascending: true });

      if (error) throw error;
      setPlans((data || []).map(p => ({
        ...p,
        features: Array.isArray(p.features) ? (p.features as string[]) : []
      })));
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    if (!selectedPlan) return;

    setUpgrading(true);
    try {
      const plan = plans.find(p => p.id === selectedPlan);
      if (!plan) throw new Error('Plan not found');

      const { error } = await supabase
        .from('organizations')
        .update({
          subscription_plan: plan.name,
          subscription_status: 'active',
          max_users: plan.max_users
        })
        .eq('id', organizationId);

      if (error) throw error;

      toast({
        title: "Subscription Upgraded",
        description: `Successfully upgraded to ${plan.name} plan`
      });

      onOpenChange(false);
      onUpgradeSuccess?.();
    } catch (error: any) {
      console.error('Error upgrading:', error);
      toast({
        title: "Upgrade Failed",
        description: error.message || "Failed to upgrade subscription",
        variant: "destructive"
      });
    } finally {
      setUpgrading(false);
    }
  };

  if (open && plans.length === 0 && !loading) {
    fetchPlans();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            User Limit Reached
          </DialogTitle>
          <DialogDescription>
            Your organization has reached the maximum number of users ({maxUsers}) allowed on the {currentPlan} plan.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="flex items-center justify-center gap-2 p-4 bg-muted rounded-lg mb-4">
            <Users className="h-5 w-5 text-muted-foreground" />
            <span className="text-lg font-semibold">{currentUsers} / {maxUsers} users</span>
          </div>

          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : plans.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No upgrade options available. Contact support.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {plans.map((plan) => (
                <Card 
                  key={plan.id}
                  className={`cursor-pointer transition-all ${
                    selectedPlan === plan.id ? 'border-primary ring-2 ring-primary/20' : 'hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold">{plan.name}</p>
                        <p className="text-2xl font-bold">${plan.price_monthly}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                      </div>
                      <Badge variant="secondary">{plan.max_users === -1 ? 'Unlimited' : `${plan.max_users} users`}</Badge>
                    </div>
                    {plan.features.length > 0 && (
                      <ul className="space-y-1 mt-2">
                        {plan.features.slice(0, 3).map((feature, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Check className="h-3 w-3 text-green-500" />{feature}
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleUpgrade} disabled={!selectedPlan || upgrading}>
            {upgrading ? 'Upgrading...' : 'Upgrade Now'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
