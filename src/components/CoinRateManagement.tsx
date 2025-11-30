import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Coins, TrendingUp, TrendingDown, Plus, History } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { CoinRateChart } from "@/components/CoinRateChart";

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
});

export function CoinRateManagement() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [isAddingRate, setIsAddingRate] = useState(false);
  const [formData, setFormData] = useState({
    rate: "",
    change_percentage: "",
    volume_24h: "",
    market_cap: "",
    notes: "",
  });

  // Fetch coin rates
  const { data: rates, isLoading } = useQuery({
    queryKey: ["coin-rates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coin_rates")
        .select("*, created_by:profiles(full_name)")
        .order("rate_date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Add new rate mutation
  const addRateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("coin_rates").insert({
        rate: parseFloat(data.rate),
        change_percentage: data.change_percentage ? parseFloat(data.change_percentage) : null,
        volume_24h: data.volume_24h ? parseFloat(data.volume_24h) : null,
        market_cap: data.market_cap ? parseFloat(data.market_cap) : null,
        notes: data.notes || null,
        created_by: profile?.id,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coin-rates"] });
      queryClient.invalidateQueries({ queryKey: ["latest-coin-rate"] });
      toast.success("Coin rate added successfully");
      setFormData({
        rate: "",
        change_percentage: "",
        volume_24h: "",
        market_cap: "",
        notes: "",
      });
      setIsAddingRate(false);
    },
    onError: (error) => {
      toast.error("Failed to add coin rate");
      console.error("Error adding rate:", error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.rate || parseFloat(formData.rate) <= 0) {
      toast.error("Please enter a valid rate");
      return;
    }

    addRateMutation.mutate(formData);
  };

  const latestRate = rates?.[0];

  return (
    <div className="space-y-6">
      {/* Current Rate Card */}
      <Card className="bg-gradient-to-br from-emerald-50 to-blue-50 border-2 border-emerald-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-6 w-6 text-emerald-600" />
            Current SLT Coin Rate
          </CardTitle>
          <CardDescription>Real-time coin rate and market statistics (INR)</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : latestRate ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm text-muted-foreground mb-1">Current Rate</p>
                <p className="text-3xl font-bold text-gray-900">{inrFormatter.format(Number(latestRate.rate))}</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm text-muted-foreground mb-1">24h Change</p>
                <div className="flex items-center gap-2">
                  {Number(latestRate.change_percentage) >= 0 ? (
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-600" />
                  )}
                  <Badge variant={Number(latestRate.change_percentage) >= 0 ? "success" : "destructive"}>
                    {Number(latestRate.change_percentage) >= 0 ? "+" : ""}
                    {Number(latestRate.change_percentage).toFixed(2)}%
                  </Badge>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm text-muted-foreground mb-1">24h Volume (INR)</p>
                <p className="text-xl font-bold text-gray-900">
                  {latestRate.volume_24h ? inrFormatter.format(Number(latestRate.volume_24h)) : inrFormatter.format(0)}
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm text-muted-foreground mb-1">Market Cap (INR)</p>
                <p className="text-xl font-bold text-gray-900">
                  {latestRate.market_cap ? inrFormatter.format(Number(latestRate.market_cap)) : inrFormatter.format(0)}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">No rate data available</p>
          )}
        </CardContent>
      </Card>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Price History (INR)</CardTitle>
        </CardHeader>
        <CardContent>
          <CoinRateChart />
        </CardContent>
      </Card>

      {/* Add New Rate Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Update Coin Rate
              </CardTitle>
              <CardDescription>Add a new SLT rate entry in INR</CardDescription>
            </div>
            <Button variant={isAddingRate ? "outline" : "default"} onClick={() => setIsAddingRate(!isAddingRate)}>
              {isAddingRate ? "Cancel" : "Add New Rate"}
            </Button>
          </div>
        </CardHeader>
        {isAddingRate && (
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rate">Rate (INR) *</Label>
                  <Input
                    id="rate"
                    type="number"
                    step="0.00000001"
                    placeholder="1.00000000"
                    value={formData.rate}
                    onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="change_percentage">24h Change (%)</Label>
                  <Input
                    id="change_percentage"
                    type="number"
                    step="0.01"
                    placeholder="2.50"
                    value={formData.change_percentage}
                    onChange={(e) => setFormData({ ...formData, change_percentage: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="volume_24h">24h Volume (INR)</Label>
                  <Input
                    id="volume_24h"
                    type="number"
                    step="0.01"
                    placeholder="100000.00"
                    value={formData.volume_24h}
                    onChange={(e) => setFormData({ ...formData, volume_24h: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="market_cap">Market Cap (INR)</Label>
                  <Input
                    id="market_cap"
                    type="number"
                    step="0.01"
                    placeholder="1000000.00"
                    value={formData.market_cap}
                    onChange={(e) => setFormData({ ...formData, market_cap: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Optional notes about this rate update..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsAddingRate(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={addRateMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {addRateMutation.isPending ? "Adding..." : "Add Rate"}
                </Button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>

      {/* Rate History Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Rate Change History
          </CardTitle>
          <CardDescription>Complete history of all SLT rate updates (INR)</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : rates && rates.length > 0 ? (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Rate (INR)</TableHead>
                    <TableHead>Change %</TableHead>
                    <TableHead>Volume 24h (INR)</TableHead>
                    <TableHead>Market Cap (INR)</TableHead>
                    <TableHead>Updated By</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rates.map((rate) => (
                    <TableRow key={rate.id}>
                      <TableCell className="font-medium">
                        {format(new Date(rate.rate_date), "MMM dd, yyyy HH:mm")}
                      </TableCell>
                      <TableCell className="font-mono font-semibold">
                        {inrFormatter.format(Number(rate.rate))}
                      </TableCell>
                      <TableCell>
                        {rate.change_percentage ? (
                          <Badge variant={Number(rate.change_percentage) >= 0 ? "success" : "destructive"}>
                            {Number(rate.change_percentage) >= 0 ? "+" : ""}
                            {Number(rate.change_percentage).toFixed(2)}%
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>{rate.volume_24h ? inrFormatter.format(Number(rate.volume_24h)) : "-"}</TableCell>
                      <TableCell>{rate.market_cap ? inrFormatter.format(Number(rate.market_cap)) : "-"}</TableCell>
                      <TableCell>{(rate.created_by as any)?.full_name || "System"}</TableCell>
                      <TableCell className="max-w-xs truncate">{rate.notes || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No rate history available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
