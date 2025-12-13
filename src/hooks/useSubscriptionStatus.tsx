import { useMemo } from "react";
import { useOrganization } from "./useOrganization";

export type SubscriptionStatus = 
  | "trialing" 
  | "active" 
  | "past_due" 
  | "canceled" 
  | "suspended" 
  | "unpaid";

export type PlanType = "free" | "starter" | "professional" | "enterprise";

interface SubscriptionInfo {
  status: SubscriptionStatus;
  plan: PlanType;
  trialEndsAt: Date | null;
  isTrialExpired: boolean;
  daysLeftInTrial: number;
  canAccessFeature: (feature: string) => boolean;
  shouldShowUpgradePrompt: boolean;
  isServiceSuspended: boolean;
  paymentFailedAt: Date | null;
}

const PLAN_FEATURES: Record<PlanType, string[]> = {
  free: ["basic_tasks", "basic_chat"],
  starter: [
    "basic_tasks", "basic_chat", "team_management", 
    "time_tracking", "basic_reports"
  ],
  professional: [
    "basic_tasks", "basic_chat", "team_management",
    "time_tracking", "basic_reports", "advanced_analytics",
    "api_access", "integrations", "custom_fields"
  ],
  enterprise: [
    "basic_tasks", "basic_chat", "team_management",
    "time_tracking", "basic_reports", "advanced_analytics",
    "api_access", "integrations", "custom_fields",
    "sso", "audit_logs", "custom_branding", "dedicated_support"
  ],
};

export const useSubscriptionStatus = (): SubscriptionInfo => {
  const { organization, isLoading } = useOrganization();
  
  const subscriptionInfo = useMemo<SubscriptionInfo>(() => {
    if (isLoading || !organization) {
      return {
        status: "trialing",
        plan: "free",
        trialEndsAt: null,
        isTrialExpired: false,
        daysLeftInTrial: 14,
        canAccessFeature: () => true,
        shouldShowUpgradePrompt: false,
        isServiceSuspended: false,
        paymentFailedAt: null,
      };
    }

    // Use type assertion to access potentially new columns
    const org = organization as typeof organization & {
      subscription_status?: string;
      payment_failed_at?: string;
      service_suspended_at?: string;
    };

    const status = (org.subscription_status || "trialing") as SubscriptionStatus;
    const plan = (organization.subscription_plan || "free") as PlanType;
    const trialEndsAt = organization.trial_ends_at 
      ? new Date(organization.trial_ends_at) 
      : null;
    const paymentFailedAt = org.payment_failed_at
      ? new Date(org.payment_failed_at)
      : null;
    const serviceSuspendedAt = org.service_suspended_at
      ? new Date(org.service_suspended_at)
      : null;

    const now = new Date();
    const isTrialExpired = trialEndsAt ? now > trialEndsAt : false;
    const daysLeftInTrial = trialEndsAt 
      ? Math.max(0, Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      : 0;

    const isServiceSuspended = !!serviceSuspendedAt;

    const canAccessFeature = (feature: string): boolean => {
      if (isServiceSuspended) return false;
      if (status === "canceled" || status === "unpaid") return false;
      if (status === "trialing" && isTrialExpired) return false;
      
      return PLAN_FEATURES[plan]?.includes(feature) ?? false;
    };

    const shouldShowUpgradePrompt = 
      (status === "trialing" && daysLeftInTrial <= 3) ||
      status === "past_due" ||
      isTrialExpired;

    return {
      status,
      plan,
      trialEndsAt,
      isTrialExpired,
      daysLeftInTrial,
      canAccessFeature,
      shouldShowUpgradePrompt,
      isServiceSuspended,
      paymentFailedAt,
    };
  }, [organization, isLoading]);

  return subscriptionInfo;
};

export default useSubscriptionStatus;
