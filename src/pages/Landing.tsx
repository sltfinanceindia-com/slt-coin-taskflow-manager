import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Users, 
  BarChart3, 
  MessageSquare, 
  BookOpen, 
  Award, 
  ArrowRight, 
  CheckCircle, 
  Gift, 
  Sparkles, 
  IndianRupee, 
  Coins,
  Clock,
  Calendar,
  Target,
  Zap,
  Globe,
  HeadphonesIcon,
  Layers
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SEOHead, generateOrganizationSchema } from '@/components/SEOHead';
import { PublicHeader } from '@/components/public/PublicHeader';
import { PublicFooter } from '@/components/public/PublicFooter';

// Import images
import dashboardPreview from '@/assets/dashboard-preview.jpg';
import bgPatternFeatures from '@/assets/bg-pattern-features.jpg';

export default function Landing() {
  // Fetch real statistics using RPC function that bypasses RLS
  const { data: statsData, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['landing-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_public_stats');
      if (error) {
        console.error('Stats fetch error:', error);
        throw error;
      }
      return data as { totalOrganizations: number; completedTasks: number; totalCoins: number };
    },
    staleTime: 30000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    retry: 3,
  });

  const features = [
    {
      icon: BarChart3,
      title: 'Task & Project Management',
      description: 'Kanban boards, task tracking, and project organization to keep your team aligned and productive',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30'
    },
    {
      icon: MessageSquare,
      title: 'Team Communication',
      description: 'Real-time messaging, channels, and collaboration tools to keep your team connected',
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950/30'
    },
    {
      icon: Coins,
      title: 'Reward & Recognition',
      description: 'Motivate your team with customizable coin rewards for task completion and achievements',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50 dark:bg-amber-950/30'
    },
    {
      icon: BookOpen,
      title: 'Training Center',
      description: 'Create and manage training modules, assessments, and track employee development',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950/30'
    },
    {
      icon: Clock,
      title: 'Time & Attendance',
      description: 'Track work hours, manage shifts, and monitor attendance with geo-fencing support',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/30'
    },
    {
      icon: Calendar,
      title: 'Leave Management',
      description: 'Streamlined leave requests, approvals, and balance tracking for your entire team',
      color: 'text-pink-600',
      bgColor: 'bg-pink-50 dark:bg-pink-950/30'
    },
    {
      icon: Shield,
      title: 'Role-Based Access',
      description: 'Fine-grained permissions and role management to secure your organization data',
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-950/30'
    },
    {
      icon: Award,
      title: 'Certificates & Achievements',
      description: 'Generate professional certificates and track achievements for completed training',
      color: 'text-teal-600',
      bgColor: 'bg-teal-50 dark:bg-teal-950/30'
    },
    {
      icon: Target,
      title: 'Performance Analytics',
      description: 'Comprehensive dashboards and reports to track team and individual performance',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950/30'
    }
  ];

  const stats = [
    {
      value: statsLoading ? "..." : (statsError ? "N/A" : statsData?.totalOrganizations?.toString() || '0'),
      label: 'Organizations'
    },
    {
      value: statsLoading ? "..." : (statsError ? "N/A" : `${statsData?.completedTasks || 0}+`),
      label: 'Tasks Completed'
    },
    {
      value: statsLoading ? "..." : (statsError ? "N/A" : `${statsData?.totalCoins?.toLocaleString() || '0'}`),
      label: 'Rewards Distributed'
    },
    {
      value: '24/7',
      label: 'Support'
    }
  ];

  return (
    <>
      <SEOHead 
        title="Tenexa - Complete Workplace Management Platform"
        description="All-in-one workplace management platform with task tracking, team collaboration, training, attendance, and a rewarding coin system to boost productivity. Start free trial today."
        keywords="workplace management, task management, team collaboration, employee training, attendance tracking, HR software, project management, Tenexa"
        canonical="https://tenexa.lovable.app/"
        structuredData={generateOrganizationSchema()}
      />
      <div className="min-h-screen bg-background">
        {/* Shared Header */}
        <PublicHeader />

        {/* Hero Section with Background Image */}
        <section 
          aria-labelledby="hero-heading" 
          className="relative overflow-hidden py-16 sm:py-24 lg:py-32"
          style={{
            backgroundImage: `url(${bgPatternFeatures})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-background/85 dark:bg-background/90" aria-hidden="true" />
          
          {/* Decorative Background Shapes */}
          <div className="absolute top-0 left-0 w-72 h-72 bg-emerald-400/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" aria-hidden="true" />
          <div className="absolute top-1/3 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl translate-x-1/2" aria-hidden="true" />
          <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl translate-y-1/2" aria-hidden="true" />
          
          <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl text-center">
              <Badge className="mb-4 sm:mb-6 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-700 animate-bounce-subtle text-xs sm:text-sm">
                <Zap className="mr-1 h-3 w-3" aria-hidden="true" />
                All-in-One Workplace Platform
              </Badge>
              <h1 id="hero-heading" className="mb-4 sm:mb-6 text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-foreground leading-tight animate-fade-in">
                Empower Your Team.
                <span className="block text-emerald-600 dark:text-emerald-400">Streamline Your Work.</span>
              </h1>
              <p className="mb-8 sm:mb-10 text-base sm:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-fade-in px-4" style={{
                animationDelay: '100ms'
              }}>
                The complete workplace management platform with task tracking, team collaboration, 
                training, attendance, and a rewarding coin system to boost productivity.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 justify-center px-4 animate-fade-in" style={{
                animationDelay: '200ms'
              }}>
                <Link to="/signup" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 h-12 sm:h-14 px-8 sm:px-10 text-base sm:text-lg transition-all duration-200 hover-grow focus-ring shadow-lg shadow-emerald-600/25">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                  </Button>
                </Link>
                <Link to="/auth" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 sm:h-14 px-8 sm:px-10 text-base sm:text-lg transition-all duration-200 hover-lift focus-ring">
                    Sign In
                  </Button>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="mt-12 sm:mt-16 flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-muted-foreground animate-fade-in" style={{ animationDelay: '300ms' }}>
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="h-5 w-5 text-emerald-600" />
                  <span>Enterprise Security</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-5 w-5 text-emerald-600" />
                  <span>Cloud-Based</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <HeadphonesIcon className="h-5 w-5 text-emerald-600" />
                  <span>24/7 Support</span>
                </div>
              </div>

              {/* Dashboard Preview Image */}
              <div className="mt-12 sm:mt-16 px-4 animate-fade-in" style={{ animationDelay: '400ms' }}>
                <div className="relative mx-auto max-w-5xl">
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
                  <img 
                    src={dashboardPreview}
                    alt="Tenexa Dashboard Preview"
                    className="w-full rounded-xl shadow-2xl border border-border/50"
                    width="1920"
                    height="1080"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 sm:py-24 bg-muted/30 relative overflow-hidden" aria-labelledby="features-heading">
          {/* Background decoration */}
          <div className="absolute top-1/2 right-0 w-64 h-64 bg-emerald-400/5 rounded-full blur-3xl" aria-hidden="true" />
          
          <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
            <header className="text-center mb-12 sm:mb-16">
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
                <Layers className="h-3 w-3 mr-1" />
                Complete Solution
              </Badge>
              <h2 id="features-heading" className="text-2xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">
                Everything Your Team Needs
              </h2>
              <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                From task management to training, all the tools to build a productive workplace
              </p>
            </header>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6" role="list">
              {features.map((feature, index) => (
                <Card 
                  key={index} 
                  className="hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-border bg-card group" 
                  style={{ animationDelay: `${index * 50}ms` }} 
                  role="listitem"
                >
                  <CardContent className="p-5 sm:p-6">
                    <div className={`h-12 w-12 rounded-xl ${feature.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`} aria-hidden="true">
                      <feature.icon className={`h-6 w-6 ${feature.color}`} />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Feedback Rewards Section */}
        <section className="py-16 sm:py-24 relative overflow-hidden" aria-labelledby="feedback-heading">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-background to-indigo-50 dark:from-purple-950/20 dark:via-background dark:to-indigo-950/20" aria-hidden="true" />
          <div className="absolute top-0 right-1/4 w-72 h-72 bg-purple-400/10 rounded-full blur-3xl" aria-hidden="true" />
          
          <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <Badge className="mb-4 bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-700 text-xs sm:text-sm">
                <Gift className="mr-1 h-3 w-3" aria-hidden="true" />
                Limited Time Offer
              </Badge>
              <h2 id="feedback-heading" className="text-2xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">
                Share Your Feedback & Win
                <span className="block text-purple-600 dark:text-purple-400">Exciting Rewards!</span>
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed">
                Help us improve Tenexa by providing your valuable feedback and get a chance to win 
                exclusive scratch cards with amazing prizes!
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10">
                <Card className="border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/30 dark:to-background">
                  <CardContent className="p-4 sm:p-6 text-center">
                    <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" aria-hidden="true" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">Submit Feedback</h3>
                    <p className="text-sm text-muted-foreground">Share your thoughts on our features</p>
                  </CardContent>
                </Card>
                <Card className="border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/30 dark:to-background">
                  <CardContent className="p-4 sm:p-6 text-center">
                    <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center mx-auto mb-4">
                      <Gift className="h-6 w-6 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">Get Scratch Card</h3>
                    <p className="text-sm text-muted-foreground">Receive an exclusive reward card</p>
                  </CardContent>
                </Card>
                <Card className="border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/30 dark:to-background">
                  <CardContent className="p-4 sm:p-6 text-center">
                    <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center mx-auto mb-4">
                      <IndianRupee className="h-6 w-6 text-green-600 dark:text-green-400" aria-hidden="true" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">Win Prizes</h3>
                    <p className="text-sm text-muted-foreground">Scratch to reveal cash prizes up to ₹10,000!</p>
                  </CardContent>
                </Card>
              </div>
              <Link to="/feedback">
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700 h-12 sm:h-14 px-8 sm:px-10 text-base sm:text-lg shadow-lg shadow-purple-600/25">
                  Share Your Feedback Now
                  <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-16 sm:py-24 bg-muted/30" aria-labelledby="pricing-heading">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <header className="text-center mb-12 sm:mb-16">
              <Badge className="mb-4 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-700">
                <IndianRupee className="h-3 w-3 mr-1" />
                Simple Pricing
              </Badge>
              <h2 id="pricing-heading" className="text-2xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">
                Choose Your Plan
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                Start free and scale as your team grows
              </p>
            </header>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
              <Card className="border-border text-center bg-card hover:shadow-lg transition-shadow">
                <CardContent className="p-6 sm:p-8">
                  <h3 className="font-semibold text-lg mb-2 text-foreground">Free</h3>
                  <div className="text-3xl sm:text-4xl font-bold text-foreground mb-4">₹0<span className="text-sm font-normal text-muted-foreground">/month</span></div>
                  <p className="text-sm text-muted-foreground mb-6">For small teams getting started</p>
                  <ul className="text-sm text-muted-foreground space-y-3 mb-8">
                    <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-600" /> Up to 5 users</li>
                    <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-600" /> Basic features</li>
                    <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-600" /> Email support</li>
                  </ul>
                  <Link to="/signup">
                    <Button variant="outline" className="w-full h-11">Start Free</Button>
                  </Link>
                </CardContent>
              </Card>
              <Card className="border-emerald-500 border-2 text-center relative bg-card shadow-xl shadow-emerald-500/10">
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 shadow-lg">Popular</Badge>
                <CardContent className="p-6 sm:p-8">
                  <h3 className="font-semibold text-lg mb-2 text-foreground">Professional</h3>
                  <div className="text-3xl sm:text-4xl font-bold text-foreground mb-4">₹7,999<span className="text-sm font-normal text-muted-foreground">/month</span></div>
                  <p className="text-sm text-muted-foreground mb-6">For growing businesses</p>
                  <ul className="text-sm text-muted-foreground space-y-3 mb-8">
                    <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-600" /> Up to 100 users</li>
                    <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-600" /> All features</li>
                    <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-600" /> Priority support</li>
                  </ul>
                  <Link to="/signup">
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700 h-11">Start Trial</Button>
                  </Link>
                </CardContent>
              </Card>
              <Card className="border-border text-center sm:col-span-2 lg:col-span-1 bg-card hover:shadow-lg transition-shadow">
                <CardContent className="p-6 sm:p-8">
                  <h3 className="font-semibold text-lg mb-2 text-foreground">Enterprise</h3>
                  <div className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Custom</div>
                  <p className="text-sm text-muted-foreground mb-6">For large organizations</p>
                  <ul className="text-sm text-muted-foreground space-y-3 mb-8">
                    <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-600" /> Unlimited users</li>
                    <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-600" /> Custom features</li>
                    <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-600" /> Dedicated support</li>
                  </ul>
                  <Link to="/pricing">
                    <Button variant="outline" className="w-full h-11">Contact Sales</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
            <div className="text-center mt-8">
              <Link to="/pricing" className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium">
                View full pricing details →
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 sm:py-20 bg-gradient-to-r from-emerald-600 to-emerald-500 relative overflow-hidden" aria-labelledby="stats-heading">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" aria-hidden="true" />
          
          <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
            <h2 id="stats-heading" className="sr-only">Platform statistics</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-10 text-center" role="list">
              {stats.map((stat, index) => (
                <div key={index} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }} role="listitem">
                  <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-2">
                    {stat.value}
                  </div>
                  <div className="text-emerald-100 text-sm sm:text-base">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 sm:py-24 bg-background relative overflow-hidden" aria-labelledby="cta-heading">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-blue-50/50 dark:from-emerald-950/20 dark:to-blue-950/20" aria-hidden="true" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl" aria-hidden="true" />
          
          <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="max-w-4xl mx-auto bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-950/40 dark:to-blue-950/40 border-2 border-emerald-200 dark:border-emerald-800 shadow-2xl shadow-emerald-500/10">
              <CardContent className="p-8 sm:p-12 lg:p-16 text-center">
                <CheckCircle className="h-16 w-16 sm:h-20 sm:w-20 text-emerald-600 dark:text-emerald-400 mx-auto mb-6 animate-bounce-subtle" aria-hidden="true" />
                <h2 id="cta-heading" className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4 leading-tight">
                  Ready to Transform Your Workplace?
                </h2>
                <p className="text-base sm:text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                  Join thousands of teams already using Tenexa to manage tasks, 
                  collaborate effectively, and reward productivity.
                </p>
                <Link to="/signup">
                  <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 h-12 sm:h-14 px-8 sm:px-10 text-base sm:text-lg transition-all duration-200 hover-grow focus-ring shadow-lg shadow-emerald-600/25">
                    Start Your Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Shared Footer */}
        <PublicFooter />
      </div>
    </>
  );
}
