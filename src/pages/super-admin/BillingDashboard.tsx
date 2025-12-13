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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, TrendingUp, CreditCard, AlertTriangle, Search, Download, RefreshCw, Eye, TrendingDown } from "lucide-react";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { toast } from "sonner";

interface Payment {
  id: string;
  organization_id: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  stripe_payment_id: string | null;
  created_at: string;
  organization?: {
    name: string;
  };
}

interface RevenueStats {
  mrr: number;
  arr: number;
  activeSubscriptions: number;
  growthRate: number | null;
  previousMrr: number | null;
  failedPayments: number;
}

const BillingDashboard = () => {
  const navigate = useNavigate();
  const { isSuperAdmin, isLoading: roleLoading } = useIsSuperAdmin();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<RevenueStats>({
    mrr: 0,
    arr: 0,
    activeSubscriptions: 0,
    growthRate: null,
    previousMrr: null,
    failedPayments: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (!roleLoading && !isSuperAdmin) {
      navigate("/");
    }
  }, [isSuperAdmin, roleLoading, navigate]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch payments with organization names
      const { data: paymentsData, error: paymentsError } = await supabase
        .from("payments")
        .select(`
          *,
          organization:organizations(name)
        `)
        .order("created_at", { ascending: false })
        .limit(100);

      if (paymentsError) throw paymentsError;
      setPayments(paymentsData || []);

      // Calculate current MRR
      const { data: orgsData } = await supabase
        .from("organizations")
        .select(`
          id,
          subscription_status,
          subscription_plan:subscription_plans(price_monthly)
        `)
        .eq("subscription_status", "active");

      const activeOrgs = orgsData || [];
      const mrr = activeOrgs.reduce((sum, org) => {
        const price = org.subscription_plan?.price_monthly || 0;
        return sum + price;
      }, 0);

      // Calculate previous month's MRR from payments
      const lastMonth = subMonths(new Date(), 1);
      const lastMonthStart = startOfMonth(lastMonth);
      const lastMonthEnd = endOfMonth(lastMonth);

      const { data: lastMonthPayments } = await supabase
        .from("payments")
        .select("amount")
        .eq("status", "succeeded")
        .gte("created_at", lastMonthStart.toISOString())
        .lte("created_at", lastMonthEnd.toISOString());

      const previousMrr = lastMonthPayments?.reduce((sum, p) => sum + p.amount, 0) || null;
      
      // Calculate growth rate
      let growthRate: number | null = null;
      if (previousMrr && previousMrr > 0) {
        growthRate = ((mrr - previousMrr) / previousMrr) * 100;
      }

      const failedCount = (paymentsData || []).filter(p => p.status === "failed").length;

      setStats({
        mrr,
        arr: mrr * 12,
        activeSubscriptions: activeOrgs.length,
        growthRate,
        previousMrr,
        failedPayments: failedCount,
      });
    } catch (error) {
      console.error("Error fetching billing data:", error);
      toast.error("Failed to load billing data");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      succeeded: "default",
      pending: "secondary",
      failed: "destructive",
      refunded: "outline",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch = payment.organization?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.stripe_payment_id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const exportToCSV = () => {
    const headers = ["Date", "Organization", "Amount", "Status", "Payment Method", "Stripe ID"];
    const rows = filteredPayments.map(p => [
      format(new Date(p.created_at), "yyyy-MM-dd HH:mm"),
      p.organization?.name || "Unknown",
      `${p.currency} ${p.amount.toFixed(2)}`,
      p.status,
      p.payment_method,
      p.stripe_payment_id || "",
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payments-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    toast.success("Exported to CSV");
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
            <h1 className="text-2xl sm:text-3xl font-bold">Billing Dashboard</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Monitor revenue, payments, and subscriptions</p>
          </div>
          <Button onClick={fetchData} variant="outline" size="sm" className="w-fit">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Revenue Stats - Responsive Grid */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
              {isLoading ? (
                <Skeleton className="h-6 sm:h-8 w-20 sm:w-24" />
              ) : (
                <>
                  <div className="text-lg sm:text-2xl font-bold">${stats.mrr.toLocaleString()}</div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">MRR</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Annual Revenue</CardTitle>
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
              {isLoading ? (
                <Skeleton className="h-6 sm:h-8 w-20 sm:w-24" />
              ) : (
                <>
                  <div className="text-lg sm:text-2xl font-bold">${stats.arr.toLocaleString()}</div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">ARR</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Subscriptions</CardTitle>
              <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
              {isLoading ? (
                <Skeleton className="h-6 sm:h-8 w-12 sm:w-16" />
              ) : (
                <>
                  <div className="text-lg sm:text-2xl font-bold">{stats.activeSubscriptions}</div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Paying orgs</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Growth Rate</CardTitle>
              {stats.growthRate !== null && stats.growthRate >= 0 ? (
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-destructive" />
              )}
            </CardHeader>
            <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
              {isLoading ? (
                <Skeleton className="h-6 sm:h-8 w-12 sm:w-16" />
              ) : stats.growthRate !== null ? (
                <>
                  <div className={`text-lg sm:text-2xl font-bold ${stats.growthRate >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                    {stats.growthRate >= 0 ? '+' : ''}{stats.growthRate.toFixed(1)}%
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">vs last month</p>
                </>
              ) : (
                <>
                  <div className="text-lg sm:text-2xl font-bold text-muted-foreground">N/A</div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">No prior data</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className={`col-span-2 sm:col-span-1 ${stats.failedPayments > 0 ? "border-destructive" : ""}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Failed Payments</CardTitle>
              <AlertTriangle className={`h-3 w-3 sm:h-4 sm:w-4 ${stats.failedPayments > 0 ? "text-destructive" : "text-muted-foreground"}`} />
            </CardHeader>
            <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
              {isLoading ? (
                <Skeleton className="h-6 sm:h-8 w-12 sm:w-16" />
              ) : (
                <>
                  <div className={`text-lg sm:text-2xl font-bold ${stats.failedPayments > 0 ? "text-destructive" : ""}`}>
                    {stats.failedPayments}
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Needs attention</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Payments Section */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">Recent Payments</CardTitle>
            <CardDescription className="text-xs sm:text-sm">All payment transactions across organizations</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            {/* Filters - Responsive */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[150px]">
                    <SelectValue placeholder="Filter status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="succeeded">Succeeded</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={exportToCSV} className="shrink-0">
                  <Download className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Export</span>
                </Button>
              </div>
            </div>

            {isLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : filteredPayments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No payments found</p>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Organization</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Stripe ID</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPayments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>{format(new Date(payment.created_at), "MMM d, yyyy HH:mm")}</TableCell>
                          <TableCell className="font-medium">{payment.organization?.name || "Unknown"}</TableCell>
                          <TableCell>
                            {payment.currency.toUpperCase()} {payment.amount.toFixed(2)}
                          </TableCell>
                          <TableCell>{getStatusBadge(payment.status)}</TableCell>
                          <TableCell className="capitalize">{payment.payment_method}</TableCell>
                          <TableCell className="font-mono text-xs">
                            {payment.stripe_payment_id?.slice(0, 20)}...
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/super-admin/organizations/${payment.organization_id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-3">
                  {filteredPayments.map((payment) => (
                    <Card key={payment.id} className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{payment.organization?.name || "Unknown"}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(payment.created_at), "MMM d, yyyy HH:mm")}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-semibold">
                            {payment.currency.toUpperCase()} {payment.amount.toFixed(2)}
                          </p>
                          {getStatusBadge(payment.status)}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t">
                        <div className="text-xs text-muted-foreground">
                          <span className="capitalize">{payment.payment_method}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/super-admin/organizations/${payment.organization_id}`)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </SuperAdminLayout>
  );
};

export default BillingDashboard;