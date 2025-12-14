export interface FeedbackFormData {
  // Section 1: User Profile
  role: 'super_admin' | 'org_admin' | 'manager' | 'employee' | 'intern';
  companySize: '1-10' | '11-50' | '51-200' | '201-500' | '500+';
  industry: string;
  usageDuration: string;

  // Section 2: Overall Experience
  overall_satisfaction: number; // 1-5
  nps_score: number; // 0-10
  comparison: string;
  first_impression: string;

  // Section 3: Onboarding
  signup_ease: number;
  wizard_completion: string;
  time_to_first_action: string;
  onboarding_feedback: string;

  // Section 4: Feature Ratings
  features: {
    tasks: FeatureRating;
    coins: FeatureRating;
    communication: FeatureRating;
    workforce: FeatureRating;
    performance: FeatureRating;
    training: FeatureRating;
    analytics: FeatureRating;
    admin: FeatureRating;
  };

  // Section 5: Usability
  navigation_ease: number;
  design_feeling: string;
  mobile_experience: number;
  load_speed: string;
  confusing_parts: string;

  // Section 6: Pain Points
  encountered_bugs: string;
  bug_description: string;
  frustrations: string;
  got_stuck: boolean;
  stuck_where: string;

  // Section 7: Feature Requests
  missing_features: string;
  one_feature: string;
  priority_improvement: string;
  unused_features: string;

  // Section 8: Comparison
  previous_tools: string[];
  replaced_tools: string;
  does_better: string;
  others_do_better: string;

  // Section 9: Pricing
  would_pay: string;
  fair_price: string;
  pricing_model: string;
  upgrade_for: string[];

  // Section 10: Final Thoughts
  love_most: string;
  biggest_complaint: string;
  would_use_if: string;
  other_feedback: string;

  // Section 11: Referral
  referral_source: string;
  referred_by_name?: string;

  // Section 12: Follow-up
  allow_interview: boolean;
  notify_features: boolean;
  email: string;
  name: string;
  phone?: string;
}

export interface FeatureRating {
  kanban?: number;
  creation?: number;
  priority?: number;
  comments?: number;
  timeLog?: number;
  feedback?: string;
}

export interface ScratchCard {
  id: string;
  feedback_response_id: string;
  user_email: string;
  user_name: string;
  card_type: 'high_value' | 'medium_value' | 'better_luck';
  card_value: number;
  card_code?: string;
  is_scratched: boolean;
  scratch_date?: string;
  is_claimed: boolean;
  verification_status: 'pending' | 'verified' | 'rejected' | 'expired';
  expiry_date: string;
  created_at: string;
}

export interface ScratchCardInventory {
  card_type: 'high_value' | 'medium_value' | 'better_luck';
  total_count: number;
  remaining_count: number;
  value_min: number;
  value_max: number;
}
