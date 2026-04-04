import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PublicHeader } from '@/components/public/PublicHeader';
import { PublicFooter } from '@/components/public/PublicFooter';
import { Check, Sparkles, Building2, Users, ArrowRight, Zap, X, HelpCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { SEOHead, generateFAQSchema } from '@/components/SEOHead';
import { fadeInUp, staggerContainer, viewportOnce } from '@/lib/animations';

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
    question: 'Can I change plans anytime?',
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
    answer: 'Yes! Pay annually and get 2 months free. That\'s approximately a 17% discount on all paid plans.',
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

const featureComparison = [
  { 
    category: 'HR Management',
    features: [
      { name: 'Employee Directory', free: true, starter: true, pro: true, enterprise: true },
      { name: 'Organization Chart', free: true, starter: true, pro: true, enterprise: true },
      { name: 'Document Management', free: '5 GB', starter: '25 GB', pro: '100 GB', enterprise: 'Unlimited' },
      { name: 'Custom Fields', free: false, starter: '10', pro: '50', enterprise: 'Unlimited' },
      { name: 'Workflow Automation', free: false, starter: false, pro: true, enterprise: true },
    ]
  },
  {
    category: 'Attendance & Time',
    features: [
      { name: 'Clock In/Out', free: true, starter: true, pro: true, enterprise: true },
      { name: 'GPS Tracking', free: false, starter: true, pro: true, enterprise: true },
      { name: 'Shift Management', free: false, starter: true, pro: true, enterprise: true },
      { name: 'Overtime Rules', free: false, starter: false, pro: true, enterprise: true },
    ]
  },
  {
    category: 'Projects & Tasks',
    features: [
      { name: 'Task Management', free: true, starter: true, pro: true, enterprise: true },
      { name: 'Kanban Boards', free: true, starter: true, pro: true, enterprise: true },
      { name: 'Gantt Charts', free: false, starter: false, pro: true, enterprise: true },
      { name: 'Resource Planning', free: false, starter: false, pro: true, enterprise: true },
      { name: 'Client Collaboration', free: false, starter: false, pro: false, enterprise: true },
    ]
  },
  {
    category: 'Analytics & Reporting',
    features: [
      { name: 'Basic Reports', free: true, starter: true, pro: true, enterprise: true },
      { name: 'Custom Dashboards', free: false, starter: true, pro: true, enterprise: true },
      { name: 'Export to Excel/PDF', free: false, starter: true, pro: true, enterprise: true },
      { name: 'API Access', free: false, starter: false, pro: true, enterprise: true },
      { name: 'White-label Reports', free: false, starter: false, pro: false, enterprise: true },
    ]
  },
  {
    category: 'Support & Security',
    features: [
      { name: 'Email Support', free: true, starter: true, pro: true, enterprise: true },
      { name: 'Priority Support', free: false, starter: false, pro: true, enterprise: true },
      { name: '24/7 Phone Support', free: false, starter: false, pro: false, enterprise: true },
      { name: 'SSO/SAML', free: false, starter: false, pro: false, enterprise: true },
      { name: 'Custom SLA', free: false, starter: false, pro: false, enterprise: true },
    ]
  }
];

const getPlanGradient = (code: string, isPopular: boolean) => {
  if (isPopular) return 'from-primary/10 via-purple-500/5 to-pink-500/10';
  switch (code) {
    case 'free': return 'from-muted/50 to-muted/30';
    case 'starter': return 'from-primary/10 to-primary/5';
    case 'enterprise': return 'from-purple-500/10 to-purple-500/5';
    default: return 'from-muted/50 to-muted/30';
  }
};

const formatPrice = (price: number) => {
  if (price === 0) return '₹0';
  return `₹${price.toLocaleString('en-IN')}`;
};

export default function Pricing() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnnual, setIsAnnual] = useState(false);

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

  const getDisplayPrice = (plan: SubscriptionPlan) => {
    if (plan.code === 'enterprise') return 'Custom';
    if (isAnnual && plan.price_yearly) {
      return formatPrice(Math.round(plan.price_yearly / 12));
    }
    return formatPrice(plan.price_monthly);
  };

  return (
    <>
      <SEOHead 
        title="Pricing - Tenexa | Transparent, Affordable Plans"
        description="Choose the perfect TeneXA plan for your team. From free to enterprise, with flexible monthly or annual billing. Start your 14-day free trial today."
        keywords="pricing, Tenexa pricing, HR software cost, workforce management pricing, affordable HR software"
        canonical="https://sltwork.lovable.app/pricing"
        structuredData={generateFAQSchema(faqs)}
      />
      <div className="min-h-screen bg-background">
        <PublicHeader />

        {/* Hero Section */}
        <section className="relative py-14 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
          
          <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
                <Sparkles className="h-3 w-3 mr-1" />
                Simple, Transparent Pricing
              </Badge>
              <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
                Choose Your{' '}
                <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Perfect Plan
                </span>
              </h1>
              <p className="text-sm md:text-base text-muted-foreground mb-6 max-w-2xl mx-auto">
                No hidden fees. No surprises. Scale as you grow. All plans include a 14-day free trial.
              </p>

              {/* Billing Toggle */}
              <div className="flex items-center justify-center gap-4 mb-8">
                <span className={`text-sm font-medium ${!isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
                  Monthly
                </span>
                <Switch 
                  checked={isAnnual} 
                  onCheckedChange={setIsAnnual}
                  className="data-[state=checked]:bg-primary"
                />
                <span className={`text-sm font-medium ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
                  Annual
                </span>
                {isAnnual && (
                  <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    Save 17%
                  </Badge>
                )}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-12 sm:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="flex flex-col">
                    <CardHeader className="text-center pb-4">
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
              <motion.div 
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto"
                variants={staggerContainer}
                initial="initial"
                whileInView="animate"
                viewport={viewportOnce}
              >
                {plans.map((plan) => {
                  const isPopular = plan.code === 'professional';
                  const isEnterprise = plan.code === 'enterprise';
                  
                  return (
                    <motion.div key={plan.id} variants={fadeInUp}>
                      <Card 
                        className={`relative flex flex-col h-full transition-all duration-300 hover:shadow-xl ${
                          isPopular ? 'border-2 border-primary shadow-lg scale-105 lg:scale-110 z-10' : 'border hover:border-primary/50'
                        }`}
                      >
                        {/* Background Gradient */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${getPlanGradient(plan.code, isPopular)} rounded-lg`} />
                        
                        {isPopular && (
                          <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                            <Badge className="bg-primary text-primary-foreground shadow-lg px-4 py-1">
                              <Sparkles className="h-3 w-3 mr-1" />
                              Most Popular
                            </Badge>
                          </div>
                        )}
                        
                        <CardHeader className="relative text-center pb-4 pt-8">
                          <CardTitle className="text-xl">{plan.name}</CardTitle>
                          <CardDescription className="text-sm">
                            {isEnterprise ? 'For large organizations' : `For ${plan.max_users === -1 ? 'unlimited' : `up to ${plan.max_users}`} users`}
                          </CardDescription>
                          <div className="pt-4">
                            <motion.span 
                              className="text-4xl font-bold"
                              key={isAnnual ? 'annual' : 'monthly'}
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              {getDisplayPrice(plan)}
                            </motion.span>
                            {!isEnterprise && (
                              <span className="text-muted-foreground text-sm">/month</span>
                            )}
                          </div>
                          {isAnnual && plan.price_yearly && !isEnterprise && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Billed {formatPrice(plan.price_yearly)}/year
                            </p>
                          )}
                          <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground pt-2">
                            <Users className="h-4 w-4" />
                            {plan.max_users === -1 ? 'Unlimited users' : `${plan.max_users} users`}
                          </div>
                        </CardHeader>
                        
                        <CardContent className="relative flex-1 flex flex-col pb-6">
                          <ul className="space-y-3 flex-1">
                            {plan.features.map((feature, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                                <span className="text-sm">{feature}</span>
                              </li>
                            ))}
                          </ul>
                          <Link to={isEnterprise ? '/contact' : '/signup'} className="mt-6 block">
                            <Button 
                              className={`w-full h-12 ${isPopular ? '' : ''}`}
                              variant={isPopular ? 'default' : 'outline'}
                            >
                              {isEnterprise ? 'Contact Sales' : plan.price_monthly === 0 ? 'Start Free' : 'Start Trial'}
                              <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </div>
        </section>

        {/* Feature Comparison Table */}
        <section className="py-14 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-10"
              {...fadeInUp}
              viewport={viewportOnce}
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-3">Compare All Features</h2>
              <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto">
                Detailed breakdown of what's included in each plan.
              </p>
            </motion.div>

            <motion.div 
              className="max-w-6xl mx-auto"
              {...fadeInUp}
              viewport={viewportOnce}
            >
              <Accordion type="multiple" className="space-y-4">
                {featureComparison.map((category, categoryIdx) => (
                  <AccordionItem 
                    key={categoryIdx} 
                    value={category.category}
                    className="bg-background rounded-lg border px-6"
                  >
                    <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                      {category.category}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-3 pr-4 font-medium">Feature</th>
                              <th className="text-center py-3 px-4 font-medium">Free</th>
                              <th className="text-center py-3 px-4 font-medium">Starter</th>
                              <th className="text-center py-3 px-4 font-medium bg-primary/5 rounded-t">Pro</th>
                              <th className="text-center py-3 px-4 font-medium">Enterprise</th>
                            </tr>
                          </thead>
                          <tbody>
                            {category.features.map((feature, featureIdx) => (
                              <tr key={featureIdx} className="border-b last:border-0">
                                <td className="py-3 pr-4 text-sm">{feature.name}</td>
                                {['free', 'starter', 'pro', 'enterprise'].map((plan) => {
                                  const value = feature[plan as keyof typeof feature];
                                  return (
                                    <td 
                                      key={plan} 
                                      className={`py-3 px-4 text-center ${plan === 'pro' ? 'bg-primary/5' : ''}`}
                                    >
                                      {typeof value === 'boolean' ? (
                                        value ? (
                                          <Check className="h-5 w-5 text-green-600 mx-auto" />
                                        ) : (
                                          <X className="h-5 w-5 text-muted-foreground/30 mx-auto" />
                                        )
                                      ) : (
                                        <span className="text-sm">{value}</span>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-12"
              {...fadeInUp}
              viewport={viewportOnce}
            >
              <div className="flex items-center justify-center gap-2 mb-4">
                <HelpCircle className="h-6 w-6 text-primary" />
                <h2 className="text-3xl sm:text-4xl font-bold">Frequently Asked Questions</h2>
              </div>
              <p className="text-muted-foreground text-lg">
                Got questions? We've got answers.
              </p>
            </motion.div>
            
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={viewportOnce}
            >
              {faqs.map((faq, idx) => (
                <motion.div key={idx} variants={fadeInUp}>
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{faq.question}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{faq.answer}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 lg:py-24 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="max-w-4xl mx-auto text-center"
              {...fadeInUp}
              viewport={viewportOnce}
            >
              <Building2 className="h-12 w-12 text-primary mx-auto mb-6" />
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Still Have Questions?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Our team is here to help you choose the right plan for your organization.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="h-12 px-8" asChild>
                  <Link to="/signup">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-12 px-8" asChild>
                  <Link to="/contact">Contact Sales</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        <PublicFooter />
      </div>
    </>
  );
}
