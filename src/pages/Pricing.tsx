import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, Coins, ArrowRight, Sparkles, Building2, Users, Zap } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: '₹0',
    period: '/month',
    description: 'Perfect for trying out',
    users: '5 users',
    features: [
      { text: 'Up to 5 users', included: true },
      { text: 'Basic employee management', included: true },
      { text: '5 training modules', included: true },
      { text: 'Basic assessments', included: true },
      { text: 'Task management', included: true },
      { text: 'Community support', included: true },
      { text: 'Advanced analytics', included: false },
      { text: 'Custom branding', included: false },
      { text: 'Priority support', included: false },
    ],
    cta: 'Start Free',
    popular: false,
    color: 'border-border',
  },
  {
    name: 'Starter',
    price: '₹2,499',
    period: '/month',
    description: 'For small teams',
    users: '25 users',
    features: [
      { text: 'Up to 25 users', included: true },
      { text: 'Full employee management', included: true },
      { text: 'Unlimited training modules', included: true },
      { text: 'Advanced assessments', included: true },
      { text: 'Task management', included: true },
      { text: 'Team communication', included: true },
      { text: 'Rewards system', included: true },
      { text: 'Email support', included: true },
      { text: 'Custom branding', included: false },
    ],
    cta: 'Start Trial',
    popular: true,
    color: 'border-emerald-500',
  },
  {
    name: 'Professional',
    price: '₹7,999',
    period: '/month',
    description: 'For growing businesses',
    users: '100 users',
    features: [
      { text: 'Up to 100 users', included: true },
      { text: 'Everything in Starter', included: true },
      { text: 'Advanced analytics', included: true },
      { text: 'Custom branding', included: true },
      { text: 'Department management', included: true },
      { text: 'Advanced reporting', included: true },
      { text: 'API access', included: true },
      { text: 'Priority email support', included: true },
      { text: 'Onboarding assistance', included: true },
    ],
    cta: 'Start Trial',
    popular: false,
    color: 'border-blue-500',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large organizations',
    users: 'Unlimited',
    features: [
      { text: 'Unlimited users', included: true },
      { text: 'Everything in Professional', included: true },
      { text: 'Dedicated account manager', included: true },
      { text: 'Custom integrations', included: true },
      { text: 'Advanced security features', included: true },
      { text: 'SLA guarantee', included: true },
      { text: '24/7 phone support', included: true },
      { text: 'Custom training', included: true },
      { text: 'White-label options', included: true },
    ],
    cta: 'Contact Sales',
    popular: false,
    color: 'border-purple-500',
  },
];

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

export default function Pricing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                <Coins className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold">
                <span className="font-black">SLT</span>
                <span className="font-normal text-muted-foreground"> work </span>
                <span className="font-black">HuB</span>
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <Link to="/auth">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  Start Free Trial
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 text-center">
        <div className="container mx-auto px-4">
          <Badge className="mb-4 bg-emerald-100 text-emerald-800 border-emerald-200">
            <Sparkles className="h-3 w-3 mr-1" />
            Simple, Transparent Pricing
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Choose Your Plan
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Select the perfect plan for your team size and needs. All plans include a 14-day free trial.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {plans.map((plan) => (
              <Card 
                key={plan.name} 
                className={`relative flex flex-col ${plan.color} ${plan.popular ? 'border-2 shadow-lg' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-emerald-600 text-white">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="pt-4">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground pt-2">
                    <Users className="h-4 w-4" />
                    {plan.users}
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <ul className="space-y-3 flex-1">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        {feature.included ? (
                          <Check className="h-5 w-5 text-emerald-600 shrink-0" />
                        ) : (
                          <X className="h-5 w-5 text-muted-foreground/50 shrink-0" />
                        )}
                        <span className={feature.included ? 'text-foreground' : 'text-muted-foreground/50'}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Link to={plan.name === 'Enterprise' ? '/contact' : '/signup'} className="mt-6">
                    <Button 
                      className={`w-full ${plan.popular ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                      variant={plan.popular ? 'default' : 'outline'}
                    >
                      {plan.cta}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground">
              Got questions? We've got answers.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {faqs.map((faq, idx) => (
              <Card key={idx}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <Card className="max-w-2xl mx-auto bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-950/20 dark:to-blue-950/20 border-emerald-200 dark:border-emerald-800">
            <CardContent className="p-8">
              <Building2 className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Still have questions?
              </h2>
              <p className="text-muted-foreground mb-6">
                Our team is here to help you choose the right plan for your organization.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/signup">
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    Start Free Trial
                  </Button>
                </Link>
                <Button variant="outline">
                  Contact Sales
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                <Coins className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold">
                <span className="font-black">SLT</span>
                <span className="font-normal text-gray-400"> work </span>
                <span className="font-black">HuB</span>
              </span>
            </div>
            <div className="text-gray-400 text-sm">
              © 2024 SLT work HuB. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
