import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PublicHeader } from '@/components/public/PublicHeader';
import { PublicFooter } from '@/components/public/PublicFooter';
import { Check, Sparkles, Building2, Users, ArrowRight, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { SEOHead, generateFAQSchema } from '@/components/SEOHead';

// Import images
import bgPatternFeatures from '@/assets/bg-pattern-features.jpg';
import teamSuccess from '@/assets/team-success.jpg';

interface SubscriptionPlan {
  id: string;
  name: string;
  code: string;
  price_monthly: number;
  price_yearly: number | null;
  max_users: number;
  features: string[];
  is_active: boolean;
}

const faqs = [
  {
    question: 'Can I change plans later?',
    answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and billing is prorated.',
  },
  {
    question: 'What happens when I reach my user limit?',
    answer: 'You\'ll receive a notification when you\'re approaching your limit. You can upgrade your plan to add more users or remove inactive users.',
  },
  {
    question: 'Is there a contract?',
    answer: 'No, all plans are month-to-month with no long-term commitment. You can cancel anytime.',
  },
  {
    question: 'Do you offer discounts for annual billing?',
    answer: 'Yes! Pay annually and get 2 months free. That\'s a 20% discount on all paid plans.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards, debit cards, UPI, and net banking for Indian customers.',
  },
  {
    question: 'Can I get a refund?',
    answer: 'Yes, we offer a 30-day money-back guarantee on all paid plans. No questions asked.',
  },
];

const getPlanColor = (code: string) => {
  switch (code) {
    case 'free': return 'border-border';
    case 'starter': return 'border-emerald-500';
    case 'professional': return 'border-blue-500';
    case 'enterprise': return 'border-purple-500';
    default: return 'border-border';
  }
};

const formatPrice = (price: number) => {
  if (price === 0) return '₹0';
  return `₹${price.toLocaleString('en-IN')}`;
};

export default function Pricing() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price_monthly', { ascending: true });

      if (error) throw error;

      const transformedPlans: SubscriptionPlan[] = (data || []).map(plan => ({
        ...plan,
        features: Array.isArray(plan.features) ? plan.features as string[] : [],
      }));

      setPlans(transformedPlans);
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SEOHead 
        title="Pricing - Tenexa | Affordable Workplace Management Plans"
        description="Choose the perfect plan for your team. Tenexa offers flexible pricing from free to enterprise plans. Start your 14-day free trial today."
        keywords="pricing, Tenexa pricing, workplace software pricing, HR software cost, team management pricing"
        canonical="https://tenexa.lovable.app/pricing"
        structuredData={generateFAQSchema(faqs)}
      />
      <div className="min-h-screen bg-background">
        {/* Shared Header */}
        <PublicHeader />

        {/* Hero with Background */}
        <section 
          className="relative py-16 sm:py-24 lg:py-32 text-center overflow-hidden"
          style={{
            backgroundImage: `url(${bgPatternFeatures})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-background/85 dark:bg-background/90" />
          
          {/* Decorative Background Shapes */}
          <div className="absolute top-0 left-0 w-72 h-72 bg-emerald-400/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" aria-hidden="true" />
          <div className="absolute top-1/3 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl translate-x-1/2" aria-hidden="true" />
          <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl translate-y-1/2" aria-hidden="true" />
          
          <div className="container relative mx-auto px-4">
            <Badge className="mb-4 sm:mb-6 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-700 text-xs sm:text-sm animate-bounce-subtle">
              <Sparkles className="h-3 w-3 mr-1" />
              Simple, Transparent Pricing
            </Badge>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-4 sm:mb-6 tracking-tight leading-tight animate-fade-in">
              Choose Your
              <span className="block text-emerald-600 dark:text-emerald-400">Perfect Plan</span>
            </h1>
            <p className="text-base sm:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto px-4 leading-relaxed animate-fade-in" style={{ animationDelay: '100ms' }}>
              Select the perfect plan for your team size and needs. All plans include a 14-day free trial.
            </p>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-12 sm:py-20">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-7xl mx-auto">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="flex flex-col">
                    <CardHeader className="text-center pb-3 sm:pb-4">
                      <Skeleton className="h-6 w-24 mx-auto mb-2" />
                      <Skeleton className="h-4 w-32 mx-auto mb-4" />
                      <Skeleton className="h-10 w-28 mx-auto" />
                    </CardHeader>
                    <CardContent className="flex-1">
                      <div className="space-y-3">
                        {[...Array(6)].map((_, j) => (
                          <Skeleton key={j} className="h-4 w-full" />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : plans.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No plans available at the moment.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-7xl mx-auto">
                {plans.map((plan, index) => {
                  const isPopular = plan.code === 'starter';
                  const isEnterprise = plan.code === 'enterprise';
                  
                  return (
                    <Card 
                      key={plan.id} 
                      className={`relative flex flex-col ${getPlanColor(plan.code)} ${isPopular ? 'border-2 shadow-lg' : ''}`}
                    >
                      {isPopular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <Badge className="bg-emerald-600 text-white text-xs">
                            Most Popular
                          </Badge>
                        </div>
                      )}
                      <CardHeader className="text-center pb-3 sm:pb-4 px-4 sm:px-6">
                        <CardTitle className="text-lg sm:text-xl">{plan.name}</CardTitle>
                        <CardDescription className="text-xs sm:text-sm">
                          {isEnterprise ? 'For large organizations' : `For ${plan.max_users === -1 ? 'unlimited' : `up to ${plan.max_users}`} users`}
                        </CardDescription>
                        <div className="pt-3 sm:pt-4">
                          <span className="text-2xl sm:text-4xl font-bold text-foreground">
                            {isEnterprise ? 'Custom' : formatPrice(plan.price_monthly)}
                          </span>
                          {!isEnterprise && <span className="text-muted-foreground text-xs sm:text-sm">/month</span>}
                        </div>
                        <div className="flex items-center justify-center gap-1 text-xs sm:text-sm text-muted-foreground pt-2">
                          <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          {plan.max_users === -1 ? 'Unlimited users' : `${plan.max_users} users`}
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col px-4 sm:px-6 pb-4 sm:pb-6">
                        <ul className="space-y-2 sm:space-y-3 flex-1">
                          {plan.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <Check className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 shrink-0 mt-0.5" />
                              <span className="text-xs sm:text-sm text-foreground">
                                {feature}
                              </span>
                            </li>
                          ))}
                        </ul>
                        <Link to={isEnterprise ? '/contact' : '/signup'} className="mt-4 sm:mt-6">
                          <Button 
                            className={`w-full min-h-[44px] text-sm ${isPopular ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                            variant={isPopular ? 'default' : 'outline'}
                          >
                            {isEnterprise ? 'Contact Sales' : plan.price_monthly === 0 ? 'Start Free' : 'Start Trial'}
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 sm:py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-muted-foreground text-base sm:text-lg">
                Got questions? We've got answers.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
              {faqs.map((faq, idx) => (
                <Card key={idx}>
                  <CardHeader className="pb-2 px-4 sm:px-6 pt-4 sm:pt-6">
                    <CardTitle className="text-sm sm:text-base">{faq.question}</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                    <p className="text-xs sm:text-sm text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section with Image */}
        <section className="py-12 sm:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 items-center">
              {/* Image */}
              <div className="order-2 md:order-1">
                <img 
                  src={teamSuccess}
                  alt="Team celebrating success"
                  className="w-full rounded-xl shadow-xl"
                />
              </div>
              
              {/* Content */}
              <div className="order-1 md:order-2 text-center md:text-left">
                <Building2 className="h-10 w-10 sm:h-12 sm:w-12 text-emerald-600 mx-auto md:mx-0 mb-3 sm:mb-4" />
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-3 sm:mb-4">
                  Still have questions?
                </h2>
                <p className="text-muted-foreground mb-4 sm:mb-6 text-sm sm:text-base">
                  Our team is here to help you choose the right plan for your organization.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                  <Link to="/signup" className="w-full sm:w-auto">
                    <Button className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 min-h-[44px]">
                      Start Free Trial
                    </Button>
                  </Link>
                  <Link to="/contact" className="w-full sm:w-auto">
                    <Button variant="outline" className="w-full min-h-[44px]">
                      Contact Sales
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Shared Footer */}
        <PublicFooter />
      </div>
    </>
  );
}
