import { ReactNode } from "react";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { useUserRole } from "@/hooks/useUserRole";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Lock, AlertTriangle, CreditCard, Clock, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

interface SubscriptionGateProps {
  children: ReactNode;
  feature?: string;
  fallback?: ReactNode;
  showBanner?: boolean;
}

export const SubscriptionGate = ({ 
  children, 
  feature,
  fallback,
  showBanner = true 
}: SubscriptionGateProps) => {
  const { 
    status, 
    plan, 
    canAccessFeature, 
    isServiceSuspended,
    isTrialExpired,
    daysLeftInTrial,
    shouldShowUpgradePrompt,
    paymentFailedAt
  } = useSubscriptionStatus();
  const { isSuperAdmin } = useUserRole();

  if (isSuperAdmin) {
    return <>{children}</>;
  }

  if (isServiceSuspended) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-8">
        <Card className="max-w-md w-full border-destructive">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 rounded-full bg-destructive/10">
              <Lock className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle>Service Suspended</CardTitle>
            <CardDescription>
              Your service has been suspended due to payment issues.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Please update your payment method to restore access to your account.
            </p>
            <Link to="/dashboard?tab=billing" className="block">
              <Button className="w-full">
                <CreditCard className="mr-2 h-4 w-4" />
                Update Payment Method
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Trial expired without payment
  if (status === "trialing" && isTrialExpired) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-8">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 rounded-full bg-warning/10">
              <Clock className="h-8 w-8 text-warning" />
            </div>
            <CardTitle>Trial Expired</CardTitle>
            <CardDescription>
              Your 14-day free trial has ended.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Upgrade to a paid plan to continue using all features.
            </p>
            <Link to="/pricing" className="block">
              <Button className="w-full">
                <Sparkles className="mr-2 h-4 w-4" />
                View Plans & Upgrade
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check feature access
  if (feature && !canAccessFeature(feature)) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    return (
      <div className="flex items-center justify-center min-h-[200px] p-8">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 rounded-full bg-muted">
              <Lock className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle className="text-lg">Feature Not Available</CardTitle>
            <CardDescription>
              This feature requires a higher plan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/pricing" className="block">
              <Button variant="outline" className="w-full">
                Upgrade Plan
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show children with optional warning banner
  return (
    <>
      {showBanner && shouldShowUpgradePrompt && (
        <SubscriptionBanner 
          status={status}
          daysLeftInTrial={daysLeftInTrial}
          paymentFailedAt={paymentFailedAt}
        />
      )}
      {children}
    </>
  );
};

interface SubscriptionBannerProps {
  status: string;
  daysLeftInTrial: number;
  paymentFailedAt: Date | null;
}

export const SubscriptionBanner = ({ 
  status, 
  daysLeftInTrial,
  paymentFailedAt 
}: SubscriptionBannerProps) => {
  if (status === "past_due" || paymentFailedAt) {
    return (
      <Alert variant="destructive" className="mb-4 rounded-none border-x-0 border-t-0">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Payment Failed</AlertTitle>
        <AlertDescription className="flex items-center justify-between">
          <span>Your last payment failed. Please update your payment method.</span>
          <Link to="/dashboard?tab=billing">
            <Button size="sm" variant="outline" className="ml-4">
              Update Payment
            </Button>
          </Link>
        </AlertDescription>
      </Alert>
    );
  }

  if (status === "trialing" && daysLeftInTrial <= 3) {
    return (
      <Alert className="mb-4 rounded-none border-x-0 border-t-0 border-warning bg-warning/10">
        <Clock className="h-4 w-4" />
        <AlertTitle className="flex items-center gap-2">
          Trial Ending Soon
          <Badge variant="secondary">{daysLeftInTrial} days left</Badge>
        </AlertTitle>
        <AlertDescription className="flex items-center justify-between">
          <span>Upgrade now to keep all your data and features.</span>
          <Link to="/pricing">
            <Button size="sm" className="ml-4">
              Upgrade Now
            </Button>
          </Link>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};

export default SubscriptionGate;
