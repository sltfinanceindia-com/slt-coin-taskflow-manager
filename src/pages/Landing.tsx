import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Coins, 
  TrendingUp, 
  Shield, 
  Users, 
  BarChart3, 
  MessageSquare,
  BookOpen,
  Award,
  ArrowRight,
  CheckCircle,
  LineChart
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CoinRateChart } from '@/components/CoinRateChart';

export default function Landing() {
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
    },
  });

  const features = [
    {
      icon: Coins,
      title: 'SLT Coin Rewards',
      description: 'Earn valuable SLT coins for completing tasks and achieving goals',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      icon: BarChart3,
      title: 'Task Management',
      description: 'Track and manage tasks with our intuitive Kanban board system',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: MessageSquare,
      title: 'Team Communication',
      description: 'Real-time messaging and collaboration tools for your team',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      icon: BookOpen,
      title: 'Training Center',
      description: 'Access comprehensive training modules and resources',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security with role-based access control',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      icon: Award,
      title: 'Certificates',
      description: 'Generate professional certificates for completed training',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
  ];

  const stats = [
    { value: '1000+', label: 'Active Users' },
    { value: '50K+', label: 'Tasks Completed' },
    { value: '100K+', label: 'Coins Distributed' },
    { value: '99.9%', label: 'Uptime' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/80 backdrop-blur-sm" role="banner">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex h-16 items-center justify-between" aria-label="Main navigation">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center" aria-hidden="true">
                <Coins className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">SLTwork Hub</span>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/auth">
                <Button variant="ghost" className="text-gray-700 transition-all duration-200 hover-lift focus-ring">
                  Sign In
                </Button>
              </Link>
              <Link to="/auth">
                <Button className="bg-emerald-600 hover:bg-emerald-700 transition-all duration-200 hover-grow focus-ring">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32" aria-labelledby="hero-heading">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-blue-50 opacity-50" aria-hidden="true" />
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
            <p className="mb-8 text-lg text-gray-600 sm:text-xl max-w-2xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '100ms' }}>
              Streamline your workflow with task management, team collaboration, 
              and a revolutionary coin rewards system. Track progress, earn rewards, 
              and boost productivity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: '200ms' }}>
              <Link to="/auth">
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 h-12 px-8 transition-all duration-200 hover-grow focus-ring">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="h-12 px-8 transition-all duration-200 hover-lift focus-ring">
                Watch Demo
                <LineChart className="ml-2 h-5 w-5" aria-hidden="true" />
              </Button>
            </div>
          </div>

          {/* Coin Rate Display */}
          <div className="mt-16 mx-auto max-w-5xl animate-fade-in" style={{ animationDelay: '300ms' }}>
            <Card className="border-2 border-emerald-200 shadow-2xl overflow-hidden hover-lift" role="region" aria-label="Live SLT coin rate information">
              <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 p-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Coins className="h-6 w-6" aria-hidden="true" />
                    <h3 className="text-lg font-semibold">SLT Coin Live Rate</h3>
                  </div>
                  {latestRate && (
                    <div className="text-right">
                      <div className="text-2xl font-bold" aria-label={`Current rate: ${Number(latestRate.rate).toFixed(4)} dollars`}>
                        ${Number(latestRate.rate).toFixed(4)}
                      </div>
                      <Badge 
                        variant={Number(latestRate.change_percentage) >= 0 ? 'success' : 'destructive'}
                        className="mt-1"
                        aria-label={`24 hour change: ${Number(latestRate.change_percentage) >= 0 ? 'increased' : 'decreased'} by ${Math.abs(Number(latestRate.change_percentage)).toFixed(2)} percent`}
                      >
                        {Number(latestRate.change_percentage) >= 0 ? '+' : ''}
                        {Number(latestRate.change_percentage).toFixed(2)}%
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
              <CardContent className="p-6">
                <CoinRateChart />
              </CardContent>
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
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="hover-scale border-gray-200 transition-all duration-200 animate-fade-in" 
                style={{ animationDelay: `${index * 100}ms` }}
                role="listitem"
              >
                <CardContent className="p-6">
                  <div className={`h-12 w-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-4 transition-transform duration-200`} aria-hidden="true">
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 leading-snug">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-emerald-500" aria-labelledby="stats-heading">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 id="stats-heading" className="sr-only">Platform statistics</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center" role="list">
            {stats.map((stat, index) => (
              <div key={index} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }} role="listitem">
                <div className="text-4xl font-bold text-white mb-2 count-up">
                  {stat.value}
                </div>
                <div className="text-emerald-100">
                  {stat.label}
                </div>
              </div>
            ))}
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
              <Link to="/auth">
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 h-12 px-8 transition-all duration-200 hover-grow focus-ring">
                  Get Started Now
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
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center" aria-hidden="true">
                <Coins className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">SLTwork Hub</span>
            </div>
            <div className="text-gray-400 text-sm">
              © 2024 SLTwork Hub. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
