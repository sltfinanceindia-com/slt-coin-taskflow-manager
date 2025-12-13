import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Check, X, Coins, ArrowRight, Sparkles, Building2, Users, Menu } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  const NavLinks = () => (
    <>
      <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
        <Button variant="ghost" className="w-full justify-start sm:w-auto">
          Sign In
        </Button>
      </Link>
      <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
        <Button className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700">
          Start Free Trial
        </Button>
      </Link>
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex h-14 sm:h-16 items-center justify-between">
            <Link to="/" className="flex items-center gap-2 sm:gap-3">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                <Coins className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <span className="text-sm sm:text-lg font-bold">
                <span className="font-black">SLT</span>
                <span className="font-normal text-muted-foreground"> work </span>
                <span className="font-black">HuB</span>
              </span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden sm:flex items-center gap-3">
              <NavLinks />
            </div>

            {/* Mobile Navigation */}
            <div className="sm:hidden">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] pt-12">
                  <div className="flex flex-col gap-4">
                    <NavLinks />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="py-10 sm:py-16 text-center">
        <div className="container mx-auto px-4">
          <Badge className="mb-3 sm:mb-4 bg-emerald-100 text-emerald-800 border-emerald-200 text-xs sm:text-sm">
            <Sparkles className="h-3 w-3 mr-1" />
            Simple, Transparent Pricing
          </Badge>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4">
            Choose Your Plan
          </h1>
          <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Select the perfect plan for your team size and needs. All plans include a 14-day free trial.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-12 sm:pb-20">
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
            <h2 className="text-xl sm:text-3xl font-bold text-foreground mb-2 sm:mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
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

      {/* CTA Section */}
      <section className="py-12 sm:py-20">
        <div className="container mx-auto px-4 text-center">
          <Card className="max-w-2xl mx-auto bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-950/20 dark:to-blue-950/20 border-emerald-200 dark:border-emerald-800">
            <CardContent className="p-6 sm:p-8">
              <Building2 className="h-10 w-10 sm:h-12 sm:w-12 text-emerald-600 mx-auto mb-3 sm:mb-4" />
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4">
                Still have questions?
              </h2>
              <p className="text-muted-foreground mb-4 sm:mb-6 text-sm sm:text-base">
                Our team is here to help you choose the right plan for your organization.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
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
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/80 dark:bg-muted/20 border-t border-border py-8 sm:py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between sm:gap-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                <Coins className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <span className="text-sm sm:text-lg font-bold text-foreground">
                <span className="font-black">SLT</span>
                <span className="font-normal text-muted-foreground"> work </span>
                <span className="font-black">HuB</span>
              </span>
            </div>
          <div className="text-muted-foreground text-xs sm:text-sm text-center">
              © 2025 SLT work HuB. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}