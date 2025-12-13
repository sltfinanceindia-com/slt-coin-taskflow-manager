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
  Calendar, RefreshCw, ArrowDownRight 
} from "lucide-react";
import { format, differenceInDays, subMonths, startOfMonth, endOfMonth } from "date-fns";
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
  churnRate: number | null;
  canceledCount: number;
  arpu: number;
  currentMrr: number;
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

      // Calculate ARPU and current MRR
      const activeOrgs = orgs?.filter(o => o.subscription_status === "active") || [];
      const currentMrr = activeOrgs.reduce((sum, o) => sum + (o.subscription_plan?.price_monthly || 0), 0);
      const arpu = activeOrgs.length > 0 ? currentMrr / activeOrgs.length : 0;

      // Calculate real churn rate
      const canceledOrgs = orgs?.filter(o => o.subscription_status === "canceled") || [];
      const lastMonth = subMonths(now, 1);
      const lastMonthStart = startOfMonth(lastMonth);
      const lastMonthEnd = endOfMonth(lastMonth);

      // Get organizations that were active at start of last month
      const { data: activeLastMonth } = await supabase
        .from("organizations")
        .select("id")
        .eq("subscription_status", "active");

      // Churn rate = canceled this month / active at start of month
      const totalActiveOrCanceled = activeOrgs.length + canceledOrgs.length;
      const churnRate = totalActiveOrCanceled > 0 
        ? (canceledOrgs.length / totalActiveOrCanceled) * 100 
        : null;

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
        churnRate,
        canceledCount: canceledOrgs.length,
        arpu,
        currentMrr,
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

  return (
    <SuperAdminLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header - Responsive */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Subscription Analytics</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Insights into subscriptions, trials, and revenue</p>
          </div>
          <Button onClick={fetchAnalytics} variant="outline" size="sm" className="w-fit">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Key Metrics - Responsive Grid */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
            </CardHeader>
            <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
              {isLoading ? (
                <Skeleton className="h-6 sm:h-8 w-16 sm:w-24" />
              ) : (
                <>
                  <div className="text-lg sm:text-2xl font-bold text-green-600">
                    {analytics?.trialStats.conversionRate.toFixed(1)}%
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Trial to paid</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Active Trials</CardTitle>
              <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
              {isLoading ? (
                <Skeleton className="h-6 sm:h-8 w-10 sm:w-16" />
              ) : (
                <>
                  <div className="text-lg sm:text-2xl font-bold">{analytics?.trialStats.active}</div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    {analytics?.trialStats.expiringSoon} expiring soon
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Churn Rate</CardTitle>
              <ArrowDownRight className="h-3 w-3 sm:h-4 sm:w-4 text-destructive" />
            </CardHeader>
            <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
              {isLoading ? (
                <Skeleton className="h-6 sm:h-8 w-10 sm:w-16" />
              ) : analytics?.churnRate !== null ? (
                <>
                  <div className="text-lg sm:text-2xl font-bold">{analytics.churnRate.toFixed(1)}%</div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">{analytics.canceledCount} canceled</p>
                </>
              ) : (
                <>
                  <div className="text-lg sm:text-2xl font-bold text-muted-foreground">N/A</div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">No data</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">ARPU</CardTitle>
              <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
              {isLoading ? (
                <Skeleton className="h-6 sm:h-8 w-16 sm:w-24" />
              ) : (
                <>
                  <div className="text-lg sm:text-2xl font-bold">${analytics?.arpu.toFixed(0)}</div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Per organization</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Responsive Grid */}
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
          {/* Current MRR Card */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
                Current MRR
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">Monthly recurring revenue breakdown</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
              {isLoading ? (
                <Skeleton className="h-32 sm:h-48 w-full" />
              ) : (
                <div className="space-y-4">
                  <div className="text-center py-4 sm:py-6">
                    <p className="text-3xl sm:text-4xl font-bold">${analytics?.currentMrr.toLocaleString()}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">Monthly Recurring Revenue</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-4 border-t">
                    <div className="text-center">
                      <p className="text-lg sm:text-xl font-semibold">${((analytics?.currentMrr || 0) * 12).toLocaleString()}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Projected ARR</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg sm:text-xl font-semibold">{analytics?.trialStats.converted || 0}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Paying Orgs</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Plan Distribution */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                Plan Distribution
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">Organizations by subscription plan</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
              {isLoading ? (
                <Skeleton className="h-32 sm:h-48 w-full" />
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {analytics?.planDistribution.map((plan) => {
                    const totalOrgs = analytics.planDistribution.reduce((sum, p) => sum + p.count, 0);
                    const percentage = totalOrgs > 0 ? (plan.count / totalOrgs) * 100 : 0;
                    
                    return (
                      <div key={plan.plan} className="space-y-1.5 sm:space-y-2">
                        <div className="flex items-center justify-between flex-wrap gap-1">
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <Badge variant={plan.plan === "Free" ? "secondary" : "default"} className="text-[10px] sm:text-xs">
                              {plan.plan}
                            </Badge>
                            <span className="text-[10px] sm:text-sm text-muted-foreground">
                              {plan.count} orgs
                            </span>
                          </div>
                          <span className="text-xs sm:text-sm font-medium">
                            ${plan.revenue.toLocaleString()}/mo
                          </span>
                        </div>
                        <Progress value={percentage} className="h-1.5 sm:h-2" />
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
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
              Expiring Trials
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Organizations with trials ending within 14 days</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            {isLoading ? (
              <Skeleton className="h-24 sm:h-32 w-full" />
            ) : analytics?.expiringTrials.length === 0 ? (
              <div className="text-center py-6 sm:py-8 text-muted-foreground">
                <Calendar className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-50" />
                <p className="text-sm sm:text-base">No trials expiring soon</p>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {analytics?.expiringTrials.map((org) => (
                  <div
                    key={org.id}
                    className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/super-admin/organizations/${org.id}`)}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm sm:text-base truncate">{org.name}</p>
                      <p className="text-[10px] sm:text-sm text-muted-foreground">
                        Expires: {format(new Date(org.trial_ends_at), "MMM d, yyyy")}
                      </p>
                    </div>
                    <Badge 
                      variant={org.daysLeft <= 3 ? "destructive" : "secondary"}
                      className="text-[10px] sm:text-xs shrink-0 ml-2"
                    >
                      {org.daysLeft === 0 ? "Today" : `${org.daysLeft}d left`}
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