import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coins, TrendingUp, TrendingDown, Shield, Users, BarChart3, MessageSquare, BookOpen, Award, ArrowRight, CheckCircle, LineChart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CoinRateChart } from '@/components/CoinRateChart';
export default function Landing() {
  // Fetch latest coin rate
  // Fetch latest coin rate
  const { data: latestRate } = useQuery({
    queryKey: ['latest-coin-rate'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coin_rates')
        .select('*')
        .order('rate_date', { ascending: false })
        .limit(1)
        .single();
      if (error) throw error;
      return data;
    }
  });

  // Fetch real statistics using RPC function that bypasses RLS
  const { data: statsData, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['landing-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_public_stats');
      if (error) {
        console.error('Stats fetch error:', error);
        throw error;
      }
      return data as { totalUsers: number; completedTasks: number; totalCoins: number };
    },
    staleTime: 30000, // 30 seconds
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    retry: 3,
  });

  const features = [{
    icon: Coins,
    title: 'SLT Coin Rewards',
    description: 'Earn valuable SLT coins for completing tasks and achieving goals',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50'
  }, {
    icon: BarChart3,
    title: 'Task Management',
    description: 'Track and manage tasks with our intuitive Kanban board system',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  }, {
    icon: MessageSquare,
    title: 'Team Communication',
    description: 'Real-time messaging and collaboration tools for your team',
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  }, {
    icon: BookOpen,
    title: 'Training Center',
    description: 'Access comprehensive training modules and resources',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  }, {
    icon: Shield,
    title: 'Secure & Reliable',
    description: 'Enterprise-grade security with role-based access control',
    color: 'text-red-600',
    bgColor: 'bg-red-50'
  }, {
    icon: Award,
    title: 'Certificates',
    description: 'Generate professional certificates for completed training',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50'
  }];
  const stats = [
    {
      value: statsLoading ? "..." : (statsError ? "N/A" : statsData?.totalUsers?.toString() || '0'),
      label: 'Active Users'
    },
    {
      value: statsLoading ? "..." : (statsError ? "N/A" : `${statsData?.completedTasks || 0}+`),
      label: 'Tasks Completed'
    },
    {
      value: statsLoading ? "..." : (statsError ? "N/A" : `${statsData?.totalCoins?.toLocaleString() || '0'}`),
      label: 'Coins Distributed'
    },
    {
      value: '99.9%',
      label: 'Uptime'
    }
  ];
  return <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/80 backdrop-blur-sm" role="banner">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex h-16 items-center justify-between" aria-label="Main navigation">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center" aria-hidden="true">
                <Coins className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">
                <span className="font-black">SLT</span>
                <span className="font-normal text-gray-600"> work </span>
                <span className="font-black">HuB</span>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/auth">
                <Button variant="ghost" className="transition-all duration-200 hover-lift focus-ring text-muted">
                  Sign In
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-emerald-600 hover:bg-emerald-700 transition-all duration-200 hover-grow focus-ring">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section aria-labelledby="hero-heading" className="relative overflow-hidden py-20 sm:py-32 bg-white">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-blue-50 opacity-70" aria-hidden="true" />
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <Badge className="mb-4 bg-emerald-100 text-emerald-800 border-emerald-200 animate-bounce-subtle">
              <TrendingUp className="mr-1 h-3 w-3" aria-hidden="true" />
              Now Live - Real-time Coin Trading
            </Badge>
            <h1 id="hero-heading" className="mb-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl leading-tight animate-fade-in">
              The Complete Workplace
              <span className="block text-emerald-600">Management Platform</span>
            </h1>
            <p className="mb-8 text-lg text-gray-600 sm:text-xl max-w-2xl mx-auto leading-relaxed animate-fade-in" style={{
            animationDelay: '100ms'
          }}>
              Streamline your workflow with task management, team collaboration, 
              and a revolutionary coin rewards system. Track progress, earn rewards, 
              and boost productivity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{
            animationDelay: '200ms'
          }}>
              <Link to="/signup">
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 h-12 px-8 transition-all duration-200 hover-grow focus-ring">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline" className="h-12 px-8 transition-all duration-200 hover-lift focus-ring">
                  Sign In
                  <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Compact Coin Rate Display */}
          <div className="mt-16 mx-auto max-w-md animate-fade-in" style={{
            animationDelay: '300ms'
          }}>
            <Card className="border-2 border-emerald-200 shadow-xl overflow-hidden hover-lift" role="region" aria-label="Current SLT coin rate">
              <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 p-6 text-white text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Coins className="h-6 w-6" aria-hidden="true" />
                  <h3 className="text-lg font-semibold">SLT Coin Rate</h3>
                </div>
                {latestRate && (
                   <div>
                    <div className="text-4xl font-bold mb-2" aria-label={`Current rate: ${Number(latestRate.rate).toFixed(4)} rupees`}>
                      ₹{Number(latestRate.rate).toFixed(4)}
                    </div>
                    <Badge 
                      variant={Number(latestRate.change_percentage) >= 0 ? 'success' : 'destructive'} 
                      className="text-sm"
                      aria-label={`24 hour change: ${Number(latestRate.change_percentage) >= 0 ? 'increased' : 'decreased'} by ${Math.abs(Number(latestRate.change_percentage)).toFixed(2)} percent`}
                    >
                      {Number(latestRate.change_percentage) >= 0 ? (
                        <TrendingUp className="h-3 w-3 mr-1 inline" />
                      ) : (
                        <></>
                      )}
                      {Number(latestRate.change_percentage) >= 0 ? '+' : ''}
                      {Number(latestRate.change_percentage).toFixed(2)}% (24h)
                    </Badge>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white" aria-labelledby="features-heading">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <header className="text-center mb-16">
            <h2 id="features-heading" className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4 leading-tight">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Powerful features designed to boost productivity and engagement
            </p>
          </header>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" role="list">
            {features.map((feature, index) => <Card key={index} className="hover-scale border-gray-200 transition-all duration-200 animate-fade-in bg-card" style={{
            animationDelay: `${index * 100}ms`
          }} role="listitem">
                <CardContent className="p-6">
                  <div className={`h-12 w-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-4 transition-transform duration-200`} aria-hidden="true">
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2 leading-snug">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Pricing Preview Section */}
      <section className="py-20 bg-white" aria-labelledby="pricing-heading">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <header className="text-center mb-12">
            <h2 id="pricing-heading" className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Start free and scale as you grow
            </p>
          </header>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border-gray-200 text-center">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2">Free</h3>
                <div className="text-3xl font-bold text-gray-900 mb-4">₹0<span className="text-sm font-normal text-gray-500">/month</span></div>
                <p className="text-sm text-gray-600 mb-4">For small teams getting started</p>
                <ul className="text-sm text-gray-600 space-y-2 mb-6">
                  <li>Up to 5 users</li>
                  <li>Basic features</li>
                </ul>
                <Link to="/signup">
                  <Button variant="outline" className="w-full">Start Free</Button>
                </Link>
              </CardContent>
            </Card>
            <Card className="border-emerald-500 border-2 text-center relative">
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600">Popular</Badge>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2">Professional</h3>
                <div className="text-3xl font-bold text-gray-900 mb-4">₹7,999<span className="text-sm font-normal text-gray-500">/month</span></div>
                <p className="text-sm text-gray-600 mb-4">For growing businesses</p>
                <ul className="text-sm text-gray-600 space-y-2 mb-6">
                  <li>Up to 100 users</li>
                  <li>All features</li>
                </ul>
                <Link to="/signup">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700">Start Trial</Button>
                </Link>
              </CardContent>
            </Card>
            <Card className="border-gray-200 text-center">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2">Enterprise</h3>
                <div className="text-3xl font-bold text-gray-900 mb-4">Custom</div>
                <p className="text-sm text-gray-600 mb-4">For large organizations</p>
                <ul className="text-sm text-gray-600 space-y-2 mb-6">
                  <li>Unlimited users</li>
                  <li>Custom features</li>
                </ul>
                <Button variant="outline" className="w-full">Contact Sales</Button>
              </CardContent>
            </Card>
          </div>
          <div className="text-center mt-8">
            <Link to="/pricing" className="text-emerald-600 hover:text-emerald-700 font-medium">
              View full pricing details →
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-emerald-500" aria-labelledby="stats-heading">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 id="stats-heading" className="sr-only">Platform statistics</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center" role="list">
            {stats.map((stat, index) => <div key={index} className="animate-fade-in" style={{
            animationDelay: `${index * 100}ms`
          }} role="listitem">
                <div className="text-4xl font-bold text-white mb-2 count-up">
                  {stat.value}
                </div>
                <div className="text-emerald-100">
                  {stat.label}
                </div>
              </div>)}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50" aria-labelledby="cta-heading">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="max-w-4xl mx-auto bg-gradient-to-br from-emerald-50 to-blue-50 border-2 border-emerald-200 hover-lift animate-fade-in">
            <CardContent className="p-12 text-center">
              <CheckCircle className="h-16 w-16 text-emerald-600 mx-auto mb-6 animate-bounce-subtle" aria-hidden="true" />
              <h2 id="cta-heading" className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
                Ready to Transform Your Workflow?
              </h2>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                Join thousands of teams already using SLTwork Hub to manage tasks, 
                collaborate effectively, and reward productivity.
              </p>
              <Link to="/signup">
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 h-12 px-8 transition-all duration-200 hover-grow focus-ring">
                  Start Your Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12" role="contentinfo">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center" aria-hidden="true">
                <Coins className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold">
                <span className="font-black">SLT</span>
                <span className="font-normal text-gray-400"> work </span>
                <span className="font-black">HuB</span>
              </span>
            </div>
            
            {/* Made in India tagline */}
            <div className="flex items-center">
              <span className="text-emerald-400 font-medium flex items-center gap-2">
                <span>Made with ❤️ in</span>
                <span className="font-bold text-lg">భారత్ 🇮🇳</span>
              </span>
            </div>
            
            <div className="text-gray-400 text-sm">
              © 2024 SLT work HuB. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>;
}