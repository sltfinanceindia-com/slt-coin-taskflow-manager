import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { CreditCard, Calendar, Users, DollarSign, Clock, Globe, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format, differenceInDays, addDays } from "date-fns";

interface BillingTabProps {
  organizationId: string;
  organizationName: string;
}

export function BillingTab({ organizationId, organizationName }: BillingTabProps) {
  const [loading, setLoading] = useState(true);
  const [organization, setOrganization] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [domain, setDomain] = useState<any>(null);
  const [extendTrialOpen, setExtendTrialOpen] = useState(false);
  const [changePlanOpen, setChangePlanOpen] = useState(false);
  const [trialDays, setTrialDays] = useState(7);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, [organizationId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select(`*, subscription_plans!left(*)`)
        .eq('id', organizationId)
        .single();

      if (orgError) throw orgError;
      setOrganization(orgData);
      setSelectedPlan(orgData.subscription_plan_id || '');

      const { data: plansData } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price_monthly', { ascending: true });

      setPlans(plansData || []);

      const { data: domainData } = await supabase
        .from('organization_domains')
        .select('*')
        .eq('organization_id', organizationId)
        .maybeSingle();

      setDomain(domainData);
    } catch (error) {
      console.error('Error fetching billing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExtendTrial = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('organizations')
        .update({ trial_ends_at: addDays(new Date(), trialDays).toISOString(), subscription_status: 'trialing' })
        .eq('id', organizationId);

      if (error) throw error;
      toast({ title: "Trial Extended", description: `Trial extended by ${trialDays} days` });
      setExtendTrialOpen(false);
      fetchData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePlan = async () => {
    if (!selectedPlan) return;
    setSaving(true);
    try {
      const plan = plans.find(p => p.name === selectedPlan);
      const { error } = await supabase
        .from('organizations')
        .update({ subscription_plan: selectedPlan, max_users: plan?.max_users || 5 })
        .eq('id', organizationId);

      if (error) throw error;
      toast({ title: "Plan Updated", description: `Plan changed to ${selectedPlan}` });
      setChangePlanOpen(false);
      fetchData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handlePublishDomain = async () => {
    try {
      const { error } = await supabase
        .from('organization_domains')
        .upsert({
          organization_id: organizationId,
          subdomain: organization?.subdomain || organizationName.toLowerCase().replace(/\s+/g, '-'),
          is_published: true,
          published_at: new Date().toISOString()
        });

      if (error) throw error;
      toast({ title: "Domain Published" });
      fetchData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  if (loading) return <div className="space-y-4"><Skeleton className="h-32 w-full" /><Skeleton className="h-48 w-full" /></div>;

  const trialDaysLeft = organization?.trial_ends_at ? differenceInDays(new Date(organization.trial_ends_at), new Date()) : 0;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><CreditCard className="h-5 w-5 text-primary" /><div><p className="text-xs text-muted-foreground">Plan</p><p className="font-semibold capitalize">{organization?.subscription_plan || 'Free'}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><Clock className="h-5 w-5 text-blue-500" /><div><p className="text-xs text-muted-foreground">Status</p><Badge variant={organization?.subscription_status === 'active' ? 'default' : 'secondary'}>{organization?.subscription_status}</Badge></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><Users className="h-5 w-5 text-green-500" /><div><p className="text-xs text-muted-foreground">Users</p><p className="font-semibold">{organization?.max_users === -1 ? 'Unlimited' : organization?.max_users}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><DollarSign className="h-5 w-5 text-purple-500" /><div><p className="text-xs text-muted-foreground">Monthly</p><p className="font-semibold">${organization?.subscription_plans?.price_monthly || 0}/mo</p></div></div></CardContent></Card>
      </div>

      {/* Trial */}
      {organization?.subscription_status === 'trialing' && (
        <Card className="border-orange-500/50"><CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3"><Calendar className="h-5 w-5 text-orange-500" /><div><p className="font-medium">Trial Period</p><p className="text-sm text-muted-foreground">{trialDaysLeft > 0 ? `${trialDaysLeft} days remaining` : 'Expired'}</p></div></div>
          <Button variant="outline" size="sm" onClick={() => setExtendTrialOpen(true)}>Extend Trial</Button>
        </CardContent></Card>
      )}

      {/* Domain */}
      <Card><CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Globe className="h-4 w-4" />Subdomain</CardTitle></CardHeader>
        <CardContent><div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div><p className="font-mono text-sm">{organization?.subdomain}.tenexa.com</p><div className="flex items-center gap-2 mt-1">{domain?.is_published ? <Badge className="gap-1"><Check className="h-3 w-3" />Published</Badge> : <Badge variant="secondary" className="gap-1"><X className="h-3 w-3" />Not Published</Badge>}</div></div>
          {!domain?.is_published && <Button size="sm" onClick={handlePublishDomain}>Publish Now</Button>}
        </div></CardContent>
      </Card>

      {/* Actions */}
      <Card><CardHeader className="pb-3"><CardTitle className="text-base">Actions</CardTitle></CardHeader>
        <CardContent><div className="flex flex-wrap gap-2"><Button variant="outline" size="sm" onClick={() => setChangePlanOpen(true)}>Change Plan</Button><Button variant="outline" size="sm" onClick={() => setExtendTrialOpen(true)}>Extend Trial</Button></div></CardContent>
      </Card>

      {/* Dialogs */}
      <Dialog open={extendTrialOpen} onOpenChange={setExtendTrialOpen}><DialogContent><DialogHeader><DialogTitle>Extend Trial</DialogTitle></DialogHeader><div className="py-4"><Label>Days to Add</Label><Input type="number" min="1" max="90" value={trialDays} onChange={(e) => setTrialDays(Number(e.target.value))} /></div><DialogFooter><Button variant="outline" onClick={() => setExtendTrialOpen(false)}>Cancel</Button><Button onClick={handleExtendTrial} disabled={saving}>{saving ? 'Extending...' : 'Extend'}</Button></DialogFooter></DialogContent></Dialog>
      <Dialog open={changePlanOpen} onOpenChange={setChangePlanOpen}><DialogContent><DialogHeader><DialogTitle>Change Plan</DialogTitle></DialogHeader><div className="py-4"><Label>Select Plan</Label><Select value={selectedPlan} onValueChange={setSelectedPlan}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{plans.map((plan) => (<SelectItem key={plan.id} value={plan.name}>{plan.name} - ${plan.price_monthly}/mo</SelectItem>))}</SelectContent></Select></div><DialogFooter><Button variant="outline" onClick={() => setChangePlanOpen(false)}>Cancel</Button><Button onClick={handleChangePlan} disabled={saving || !selectedPlan}>{saving ? 'Updating...' : 'Update'}</Button></DialogFooter></DialogContent></Dialog>
    </div>
  );
}
