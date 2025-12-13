import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useIsSuperAdmin } from "@/hooks/useUserRole";
import SuperAdminLayout from "@/components/super-admin/SuperAdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, TrendingUp, Users, Clock, AlertCircle, 
  Calendar, RefreshCw, ArrowUpRight, ArrowDownRight 
} from "lucide-react";
import { format, differenceInDays, addDays } from "date-fns";
import { toast } from "sonner";

interface AnalyticsData {
  planDistribution: { plan: string; count: number; revenue: number }[];
  trialStats: {
    active: number;
    expiringSoon: number;
    expired: number;
    converted: number;
    conversionRate: number;
  };
  expiringTrials: {
    id: string;
    name: string;
    trial_ends_at: string;
    daysLeft: number;
  }[];
  monthlyTrend: { month: string; mrr: number; subscribers: number }[];
  churnRate: number;
  arpu: number;
}

const SubscriptionAnalytics = () => {
  const navigate = useNavigate();
  const { isSuperAdmin, isLoading: roleLoading } = useIsSuperAdmin();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!roleLoading && !isSuperAdmin) {
      navigate("/");
    }
  }, [isSuperAdmin, roleLoading, navigate]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      // Fetch organizations with subscription data
      const { data: orgs, error: orgsError } = await supabase
        .from("organizations")
        .select(`
          id,
          name,
          subscription_status,
          trial_ends_at,
          created_at,
          subscription_plan:subscription_plans(name, price_monthly)
        `);

      if (orgsError) throw orgsError;

      const now = new Date();

      // Calculate plan distribution
      const planCounts: Record<string, { count: number; revenue: number }> = {};
      orgs?.forEach(org => {
        const planName = org.subscription_plan?.name || "Free";
        if (!planCounts[planName]) {
          planCounts[planName] = { count: 0, revenue: 0 };
        }
        planCounts[planName].count++;
        if (org.subscription_status === "active") {
          planCounts[planName].revenue += org.subscription_plan?.price_monthly || 0;
        }
      });

      const planDistribution = Object.entries(planCounts).map(([plan, data]) => ({
        plan,
        count: data.count,
        revenue: data.revenue,
      }));

      // Calculate trial stats
      const trialingOrgs = orgs?.filter(o => o.subscription_status === "trialing") || [];
      const activeTrials = trialingOrgs.filter(o => {
        if (!o.trial_ends_at) return true;
        return new Date(o.trial_ends_at) > now;
      });
      
      const expiringSoon = activeTrials.filter(o => {
        if (!o.trial_ends_at) return false;
        const daysLeft = differenceInDays(new Date(o.trial_ends_at), now);
        return daysLeft <= 7 && daysLeft > 0;
      });

      const expiredTrials = trialingOrgs.filter(o => {
        if (!o.trial_ends_at) return false;
        return new Date(o.trial_ends_at) <= now;
      });

      const convertedOrgs = orgs?.filter(o => o.subscription_status === "active") || [];
      const totalPastTrials = expiredTrials.length + convertedOrgs.length;
      const conversionRate = totalPastTrials > 0 
        ? (convertedOrgs.length / totalPastTrials) * 100 
        : 0;

      // Get expiring trials list
      const expiringTrials = activeTrials
        .filter(o => o.trial_ends_at)
        .map(o => ({
          id: o.id,
          name: o.name,
          trial_ends_at: o.trial_ends_at!,
          daysLeft: differenceInDays(new Date(o.trial_ends_at!), now),
        }))
        .filter(o => o.daysLeft <= 14 && o.daysLeft >= 0)
        .sort((a, b) => a.daysLeft - b.daysLeft);

      // Calculate ARPU
      const activeOrgs = orgs?.filter(o => o.subscription_status === "active") || [];
      const totalRevenue = activeOrgs.reduce((sum, o) => sum + (o.subscription_plan?.price_monthly || 0), 0);
      const arpu = activeOrgs.length > 0 ? totalRevenue / activeOrgs.length : 0;

      // Mock monthly trend (would come from historical data)
      const monthlyTrend = [
        { month: "Jul", mrr: 8500, subscribers: 42 },
        { month: "Aug", mrr: 9200, subscribers: 48 },
        { month: "Sep", mrr: 10100, subscribers: 52 },
        { month: "Oct", mrr: 11500, subscribers: 58 },
        { month: "Nov", mrr: 12800, subscribers: 64 },
        { month: "Dec", mrr: totalRevenue || 14200, subscribers: activeOrgs.length || 70 },
      ];

      setAnalytics({
        planDistribution,
        trialStats: {
          active: activeTrials.length,
          expiringSoon: expiringSoon.length,
          expired: expiredTrials.length,
          converted: convertedOrgs.length,
          conversionRate,
        },
        expiringTrials,
        monthlyTrend,
        churnRate: 2.5, // Placeholder
        arpu,
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast.error("Failed to load analytics");
    } finally {
      setIsLoading(false);
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

  const maxMRR = Math.max(...(analytics?.monthlyTrend.map(m => m.mrr) || [1]));

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Subscription Analytics</h1>
            <p className="text-muted-foreground">Insights into subscriptions, trials, and revenue trends</p>
          </div>
          <Button onClick={fetchAnalytics} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold text-green-600">
                    {analytics?.trialStats.conversionRate.toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">Trial to paid</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Trials</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{analytics?.trialStats.active}</div>
                  <p className="text-xs text-muted-foreground">
                    {analytics?.trialStats.expiringSoon} expiring soon
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
              <ArrowDownRight className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{analytics?.churnRate}%</div>
                  <p className="text-xs text-muted-foreground">Monthly</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ARPU</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">${analytics?.arpu.toFixed(0)}</div>
                  <p className="text-xs text-muted-foreground">Per organization</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* MRR Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                MRR Trend
              </CardTitle>
              <CardDescription>Monthly recurring revenue over time</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-48 w-full" />
              ) : (
                <div className="space-y-4">
                  {analytics?.monthlyTrend.map((month, index) => (
                    <div key={month.month} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{month.month}</span>
                        <span className="text-muted-foreground">
                          ${month.mrr.toLocaleString()} • {month.subscribers} orgs
                        </span>
                      </div>
                      <Progress value={(month.mrr / maxMRR) * 100} className="h-2" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Plan Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Plan Distribution
              </CardTitle>
              <CardDescription>Organizations by subscription plan</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-48 w-full" />
              ) : (
                <div className="space-y-4">
                  {analytics?.planDistribution.map((plan) => {
                    const totalOrgs = analytics.planDistribution.reduce((sum, p) => sum + p.count, 0);
                    const percentage = totalOrgs > 0 ? (plan.count / totalOrgs) * 100 : 0;
                    
                    return (
                      <div key={plan.plan} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant={plan.plan === "Free" ? "secondary" : "default"}>
                              {plan.plan}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {plan.count} organizations
                            </span>
                          </div>
                          <span className="text-sm font-medium">
                            ${plan.revenue.toLocaleString()}/mo
                          </span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Expiring Trials Alert */}
        <Card className={analytics?.expiringTrials.length ? "border-amber-500" : ""}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Expiring Trials
            </CardTitle>
            <CardDescription>Organizations with trials ending within 14 days</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : analytics?.expiringTrials.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No trials expiring soon</p>
              </div>
            ) : (
              <div className="space-y-3">
                {analytics?.expiringTrials.map((org) => (
                  <div
                    key={org.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/super-admin/organizations/${org.id}`)}
                  >
                    <div>
                      <p className="font-medium">{org.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Expires: {format(new Date(org.trial_ends_at), "MMM d, yyyy")}
                      </p>
                    </div>
                    <Badge variant={org.daysLeft <= 3 ? "destructive" : "secondary"}>
                      {org.daysLeft === 0 ? "Expires today" : `${org.daysLeft} days left`}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </SuperAdminLayout>
  );
};

export default SubscriptionAnalytics;
