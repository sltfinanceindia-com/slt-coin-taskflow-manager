// src/pages/admin/CoinManagement.tsx
import { useState } from "react";
import { useCoinTransactions } from "@/hooks/useCoinTransactions";
import { useTasks } from "@/hooks/useTasks";
import { useCoinRates } from "@/hooks/useCoinRates";
import { useOrganization } from "@/hooks/useOrganization";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Coins, CheckCircle, XCircle, Clock, TrendingUp, Settings, Award } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "@/hooks/use-toast";
import { CoinRateManagement } from "./CoinRateManagement";
import { formatINR, formatCoinRate } from "@/lib/currency";

interface VerifyTaskFormData {
  feedback?: string;
  coinValue: number;
}

export function CoinManagement() {
  const { transactions, isLoading } = useCoinTransactions();
  const { tasks, verifyTask } = useTasks();
  const { latestRate } = useCoinRates();
  const { organization } = useOrganization();
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [approveAction, setApproveAction] = useState<boolean>(true);
  
  const coinName = organization?.coin_name || 'SLT Coins';

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<VerifyTaskFormData>();

  // Filter tasks that need verification
  const pendingTasks = tasks.filter((task) => task.status === "completed");
  const verifiedTasks = tasks.filter((task) => task.status === "verified");
  const rejectedTasks = tasks.filter((task) => task.status === "rejected");

  // Calculate totals
  const totalCoinsAwarded = transactions
    .filter((t) => t.status === "approved")
    .reduce((sum, t) => sum + t.coins_earned, 0);

  const pendingCoinsValue = pendingTasks.reduce((sum, task) => sum + task.slt_coin_value, 0);

  // Calculate USD values
  const currentRate = latestRate?.rate || 0;
  const totalUSDValue = totalCoinsAwarded * currentRate;
  const pendingUSDValue = pendingCoinsValue * currentRate;

  const handleVerifyClick = (task: any, approve: boolean) => {
    setSelectedTask(task);
    setApproveAction(approve);
    setValue("coinValue", task.slt_coin_value);
    setVerifyDialogOpen(true);
  };

  const onSubmit = (data: VerifyTaskFormData) => {
    if (selectedTask) {
      verifyTask(selectedTask.id, approveAction, data.feedback, approveAction ? data.coinValue : undefined);
      setVerifyDialogOpen(false);
      reset();
      setSelectedTask(null);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
          <Coins className="h-5 w-5 sm:h-7 sm:w-7 text-coin-gold" />
          {coinName} Management
        </h2>
        <p className="text-muted-foreground text-xs sm:text-sm">Manage coin rates, approve tasks, and track coin distribution</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Current Rate</CardTitle>
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="text-lg sm:text-2xl font-bold">{formatCoinRate(currentRate)}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Per {coinName}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Awarded</CardTitle>
            <Coins className="h-3 w-3 sm:h-4 sm:w-4 text-coin-gold" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="text-lg sm:text-2xl font-bold text-coin-gold">{totalCoinsAwarded}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">{formatINR(totalUSDValue)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Pending</CardTitle>
            <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="text-lg sm:text-2xl font-bold text-orange-500">{pendingTasks.length}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              {pendingCoinsValue} coins
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="text-lg sm:text-2xl font-bold text-green-500">{verifiedTasks.length}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card className="col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Avg Value</CardTitle>
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="text-lg sm:text-2xl font-bold text-blue-500">
              {verifiedTasks.length > 0 ? Math.round(totalCoinsAwarded / verifiedTasks.length) : 0}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Per task</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="approvals" className="space-y-4 sm:space-y-6">
        <div className="overflow-x-auto pb-2 -mx-2 px-2">
          <TabsList className="inline-flex w-auto min-w-full sm:w-auto lg:w-auto">
            <TabsTrigger value="approvals" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
              <Award className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Task </span>Approvals
              {pendingTasks.length > 0 && (
                <Badge variant="destructive" className="ml-1 text-[10px] sm:text-xs px-1.5">
                  {pendingTasks.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="rate-management" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
              <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Rate </span>Management
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Task Approvals Tab */}
        <TabsContent value="approvals" className="space-y-4 sm:space-y-6">
          <Tabs defaultValue="pending" className="space-y-4 sm:space-y-6">
            <div className="overflow-x-auto pb-2 -mx-2 px-2">
              <TabsList className="inline-flex w-auto min-w-full sm:w-auto">
                <TabsTrigger value="pending" className="text-xs sm:text-sm">Pending ({pendingTasks.length})</TabsTrigger>
                <TabsTrigger value="approved" className="text-xs sm:text-sm">Approved ({verifiedTasks.length})</TabsTrigger>
                <TabsTrigger value="rejected" className="text-xs sm:text-sm">Rejected ({rejectedTasks.length})</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="pending">
              <div className="space-y-4">
                {pendingTasks.length > 0 ? (
                  pendingTasks.map((task) => (
                    <Card key={task.id} className="border-orange-200 bg-orange-50/50">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">{task.title}</CardTitle>
                            <CardDescription>Assigned to: {task.assigned_profile?.full_name}</CardDescription>
                          </div>
                          <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        </div>
                      </CardHeader>
                        <CardContent className="p-3 sm:p-6">
                          <div className="space-y-3 sm:space-y-4">
                            <div>
                              <p className="text-xs sm:text-sm font-medium mb-1">Task Description:</p>
                              <p className="text-xs sm:text-sm text-muted-foreground">{task.description}</p>
                            </div>

                            {task.submission_notes && (
                              <div>
                                <p className="text-xs sm:text-sm font-medium mb-1">Submission Notes:</p>
                                <p className="text-xs sm:text-sm text-muted-foreground bg-background p-2 sm:p-3 rounded border">
                                  {task.submission_notes}
                                </p>
                              </div>
                            )}

                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                              <div className="flex items-center space-x-2">
                                <Coins className="h-4 w-4 text-coin-gold" />
                                <span className="font-semibold text-coin-gold text-sm">{task.slt_coin_value} SLT Coins</span>
                              </div>

                              <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2">
                                <Button variant="destructive" size="sm" onClick={() => handleVerifyClick(task, false)} className="min-h-[40px] text-xs sm:text-sm">
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                                <Button size="sm" onClick={() => handleVerifyClick(task, true)} className="min-h-[40px] text-xs sm:text-sm">
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No pending approvals</h3>
                      <p className="text-muted-foreground text-center">
                        All completed tasks have been reviewed. Great job staying on top of things!
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="approved">
              <div className="space-y-4">
                {verifiedTasks.length > 0 ? (
                  verifiedTasks.map((task) => (
                    <Card key={task.id} className="border-green-200 bg-green-50/50">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">{task.title}</CardTitle>
                            <CardDescription>Completed by: {task.assigned_profile?.full_name}</CardDescription>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary" className="bg-green-100 text-green-700">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Approved
                            </Badge>
                            <div className="flex items-center space-x-1">
                              <Coins className="h-4 w-4 text-coin-gold" />
                              <span className="font-semibold text-coin-gold">{task.slt_coin_value}</span>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      {task.admin_feedback && (
                        <CardContent>
                          <div>
                            <p className="text-sm font-medium mb-1">Admin Feedback:</p>
                            <p className="text-sm text-muted-foreground bg-background p-3 rounded border">
                              {task.admin_feedback}
                            </p>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No approved tasks yet</h3>
                      <p className="text-muted-foreground text-center">
                        Approved tasks will appear here once you start reviewing submissions.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="rejected">
              <div className="space-y-4">
                {rejectedTasks.length > 0 ? (
                  rejectedTasks.map((task) => (
                    <Card key={task.id} className="border-red-200 bg-red-50/50">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">{task.title}</CardTitle>
                            <CardDescription>Assigned to: {task.assigned_profile?.full_name}</CardDescription>
                          </div>
                          <Badge variant="destructive">
                            <XCircle className="h-3 w-3 mr-1" />
                            Rejected
                          </Badge>
                        </div>
                      </CardHeader>
                      {task.admin_feedback && (
                        <CardContent>
                          <div>
                            <p className="text-sm font-medium mb-1">Rejection Reason:</p>
                            <p className="text-sm text-muted-foreground bg-background p-3 rounded border">
                              {task.admin_feedback}
                            </p>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <XCircle className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No rejected tasks</h3>
                      <p className="text-muted-foreground text-center">
                        Rejected tasks will appear here if any submissions need improvements.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Coin Rate Management Tab */}
        <TabsContent value="rate-management">
          <CoinRateManagement />
        </TabsContent>
      </Tabs>

      {/* Verification Dialog */}
      <Dialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{approveAction ? "Approve Task" : "Reject Task"}</DialogTitle>
            <DialogDescription>
              {approveAction
                ? "Approve this task and award SLT coins to the employee."
                : "Reject this task and provide feedback for improvement."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {approveAction && (
              <div>
                <Label htmlFor="coinValue">SLT Coins to Award</Label>
                <Input
                  id="coinValue"
                  type="number"
                  {...register("coinValue", {
                    required: "Coin value is required",
                    min: { value: 1, message: "Must be at least 1 coin" },
                  })}
                  placeholder="Enter coin amount"
                />
                {errors.coinValue && <p className="text-sm text-destructive">{errors.coinValue.message}</p>}
              </div>
            )}

            <div>
              <Label htmlFor="feedback">{approveAction ? "Feedback (Optional)" : "Rejection Reason"}</Label>
              <Textarea
                id="feedback"
                {...register("feedback", {
                  required: !approveAction ? "Rejection reason is required" : false,
                })}
                placeholder={
                  approveAction
                    ? "Great work! Task completed successfully."
                    : "Please explain what needs to be improved..."
                }
                rows={3}
              />
              {errors.feedback && <p className="text-sm text-destructive">{errors.feedback.message}</p>}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setVerifyDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant={approveAction ? "default" : "destructive"}>
                {approveAction ? "Approve & Award Coins" : "Reject Task"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
