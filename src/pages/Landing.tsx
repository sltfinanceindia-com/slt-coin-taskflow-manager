import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, TrendingDown, Shield, Users, BarChart3, MessageSquare, BookOpen, Award, ArrowRight, CheckCircle, Menu, Building2, Gift, Sparkles, IndianRupee, Coins } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BottomNavigation } from '@/components/BottomNavigation';

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<string>('all');

  // Fetch organizations with coin rates using public RPC function
  const { data: coinRates } = useQuery({
    queryKey: ['public-coin-rates'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_public_coin_rates');
      if (error) throw error;
      return data || [];
    }
  });

  // Get the selected rate based on organization selection
  const selectedRate = selectedOrgId === 'all' 
    ? coinRates?.[0] 
    : coinRates?.find((r: any) => r.organization_id === selectedOrgId);

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
      value: statsLoading ? "..." : (statsError ? "N/A" : statsData?.totalOrganizations?.toString() || '0'),
      label: 'Organizations'
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
      value: '24/7',
      label: 'Support'
    }
  ];

  const NavLinks = () => (
    <>
      <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
        <Button variant="ghost" className="w-full justify-start sm:w-auto transition-all duration-200 hover-lift focus-ring text-muted">
          Sign In
        </Button>
      </Link>
      <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
        <Button className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 transition-all duration-200 hover-grow focus-ring">
          Start Free Trial
          <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
        </Button>
      </Link>
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/50">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-sm" role="banner">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex h-14 sm:h-16 items-center justify-between" aria-label="Main navigation">
            <div className="flex items-center gap-2 sm:gap-3">
              <img 
                src="/slt-hub-icon.png" 
                alt="SLT work HuB"
                className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg object-contain"
              />
              <span className="text-sm sm:text-lg font-bold text-foreground">
                <span className="font-black">SLT</span>
                <span className="font-normal text-muted-foreground"> work </span>
                <span className="font-black">HuB</span>
              </span>
            </div>

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

      {/* Hero Section */}
      <section aria-labelledby="hero-heading" className="relative overflow-hidden py-12 sm:py-20 lg:py-32 bg-background">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-background to-blue-50/50 dark:from-emerald-950/20 dark:via-background dark:to-blue-950/20 opacity-70" aria-hidden="true" />
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <Badge className="mb-3 sm:mb-4 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-700 animate-bounce-subtle text-xs sm:text-sm">
              <TrendingUp className="mr-1 h-3 w-3" aria-hidden="true" />
              Now Live - Real-time Coin Trading
            </Badge>
            <h1 id="hero-heading" className="mb-4 sm:mb-6 text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-foreground leading-tight animate-fade-in">
              The Complete Workplace
              <span className="block text-emerald-600 dark:text-emerald-400">Management Platform</span>
            </h1>
            <p className="mb-6 sm:mb-8 text-sm sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-in px-4" style={{
              animationDelay: '100ms'
            }}>
              Streamline your workflow with task management, team collaboration, 
              and a revolutionary coin rewards system.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 animate-fade-in" style={{
              animationDelay: '200ms'
            }}>
              <Link to="/signup" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 h-11 sm:h-12 px-6 sm:px-8 text-sm sm:text-base transition-all duration-200 hover-grow focus-ring">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                </Button>
              </Link>
              <Link to="/auth" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-11 sm:h-12 px-6 sm:px-8 text-sm sm:text-base transition-all duration-200 hover-lift focus-ring">
                  Sign In
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Compact Coin Rate Display with Organization Selector */}
          <div className="mt-10 sm:mt-16 mx-auto max-w-sm sm:max-w-md animate-fade-in px-4" style={{
            animationDelay: '300ms'
          }}>
            <Card className="border-2 border-emerald-200 shadow-xl overflow-hidden hover-lift" role="region" aria-label="Current SLT coin rate">
              <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 p-4 sm:p-6 text-white text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Coins className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
                  <h3 className="text-base sm:text-lg font-semibold">SLT Coin Rate</h3>
                </div>
                
                {/* Organization Dropdown */}
                {coinRates && coinRates.length > 0 && (
                  <div className="mb-4">
                    <Select value={selectedOrgId} onValueChange={setSelectedOrgId}>
                      <SelectTrigger className="bg-white/20 border-white/30 text-white w-full max-w-[200px] mx-auto text-sm">
                        <Building2 className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Select Company" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Companies</SelectItem>
                        {coinRates.map((rate: any) => (
                          <SelectItem key={rate.organization_id} value={rate.organization_id}>
                            {rate.organization_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {selectedRate ? (
                  <div>
                    {selectedOrgId !== 'all' && (
                      <p className="text-xs text-emerald-100 mb-1">{selectedRate.organization_name}</p>
                    )}
                    <div className="text-2xl sm:text-4xl font-bold mb-2" aria-label={`Current rate: ${Number(selectedRate.rate).toFixed(4)} rupees`}>
                      ₹{Number(selectedRate.rate).toFixed(4)}
                    </div>
                    <Badge 
                      variant={Number(selectedRate.change_percentage) >= 0 ? 'success' : 'destructive'} 
                      className="text-xs sm:text-sm"
                      aria-label={`24 hour change: ${Number(selectedRate.change_percentage) >= 0 ? 'increased' : 'decreased'} by ${Math.abs(Number(selectedRate.change_percentage)).toFixed(2)} percent`}
                    >
                      {Number(selectedRate.change_percentage) >= 0 ? (
                        <TrendingUp className="h-3 w-3 mr-1 inline" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-1 inline" />
                      )}
                      {Number(selectedRate.change_percentage) >= 0 ? '+' : ''}
                      {Number(selectedRate.change_percentage).toFixed(2)}% (24h)
                    </Badge>
                  </div>
                ) : (
                  <p className="text-sm text-emerald-100">No rate available</p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Feedback Rewards Section */}
      <section className="py-12 sm:py-20 bg-gradient-to-br from-purple-50 via-background to-indigo-50 dark:from-purple-950/20 dark:via-background dark:to-indigo-950/20" aria-labelledby="feedback-heading">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-700 text-xs sm:text-sm">
              <Gift className="mr-1 h-3 w-3" aria-hidden="true" />
              Limited Time Offer
            </Badge>
            <h2 id="feedback-heading" className="text-xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4 leading-tight">
              Share Your Feedback & Win
              <span className="block text-purple-600 dark:text-purple-400">Exciting Rewards!</span>
            </h2>
            <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-6 sm:mb-8 leading-relaxed px-4">
              Complete our feedback survey and get a chance to win scratch cards with exclusive rewards including cash prizes, discounts, and special prizes!
            </p>
            
            {/* How It Works - 4 Step Process */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-foreground mb-6">How It Works</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                <div className="relative">
                  <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-3 border-2 border-purple-300 dark:border-purple-700">
                    <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="absolute top-6 left-[60%] w-[80%] h-0.5 bg-purple-200 dark:bg-purple-800 hidden sm:block" />
                  <p className="font-semibold text-foreground text-sm mb-1">1. Sign Up</p>
                  <p className="text-xs text-muted-foreground">Create your free account</p>
                </div>
                <div className="relative">
                  <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-3 border-2 border-blue-300 dark:border-blue-700">
                    <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="absolute top-6 left-[60%] w-[80%] h-0.5 bg-blue-200 dark:bg-blue-800 hidden sm:block" />
                  <p className="font-semibold text-foreground text-sm mb-1">2. Complete Survey</p>
                  <p className="text-xs text-muted-foreground">Share honest feedback (~15 min)</p>
                </div>
                <div className="relative">
                  <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-3 border-2 border-amber-300 dark:border-amber-700">
                    <Gift className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="absolute top-6 left-[60%] w-[80%] h-0.5 bg-amber-200 dark:bg-amber-800 hidden sm:block" />
                  <p className="font-semibold text-foreground text-sm mb-1">3. Scratch Card</p>
                  <p className="text-xs text-muted-foreground">Get instant reward card</p>
                </div>
                <div>
                  <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-3 border-2 border-green-300 dark:border-green-700">
                    <IndianRupee className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="font-semibold text-foreground text-sm mb-1">4. Claim Prize</p>
                  <p className="text-xs text-muted-foreground">Win ₹10 - ₹500 cash</p>
                </div>
              </div>
            </div>

            {/* Reward Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 max-w-3xl mx-auto">
              <Card className="bg-card border-purple-200 dark:border-purple-800">
                <CardContent className="p-4 sm:p-6 text-center">
                  <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-3">
                    <IndianRupee className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1 text-sm sm:text-base">Cash Rewards</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">Win up to ₹500</p>
                </CardContent>
              </Card>
              <Card className="bg-card border-purple-200 dark:border-purple-800">
                <CardContent className="p-4 sm:p-6 text-center">
                  <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-3">
                    <Award className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1 text-sm sm:text-base">Discounts</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">Get exclusive discounts</p>
                </CardContent>
              </Card>
              <Card className="bg-card border-purple-200 dark:border-purple-800 sm:col-span-1">
                <CardContent className="p-4 sm:p-6 text-center">
                  <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1 text-sm sm:text-base">Special Prizes</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">Mystery rewards await</p>
                </CardContent>
              </Card>
            </div>

            <Link to="/signup">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700 h-11 sm:h-12 px-6 sm:px-8 text-sm sm:text-base transition-all duration-200 hover-grow focus-ring">
                <Gift className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Sign Up & Participate
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-20 bg-background" aria-labelledby="features-heading">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <header className="text-center mb-10 sm:mb-16">
            <h2 id="features-heading" className="text-xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4 leading-tight">
              Everything You Need to Succeed
            </h2>
            <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4">
              Powerful features designed to boost productivity and engagement
            </p>
          </header>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8" role="list">
            {features.map((feature, index) => (
              <Card key={index} className="hover-scale border-border transition-all duration-200 animate-fade-in bg-card" style={{
                animationDelay: `${index * 100}ms`
              }} role="listitem">
                <CardContent className="p-4 sm:p-6">
                  <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-lg ${feature.bgColor} dark:opacity-80 flex items-center justify-center mb-3 sm:mb-4 transition-transform duration-200`} aria-hidden="true">
                    <feature.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1.5 sm:mb-2 leading-snug">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview Section */}
      <section className="py-12 sm:py-20 bg-muted/30" aria-labelledby="pricing-heading">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <header className="text-center mb-8 sm:mb-12">
            <h2 id="pricing-heading" className="text-xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Start free and scale as you grow
            </p>
          </header>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-5xl mx-auto">
            <Card className="border-border text-center bg-card">
              <CardContent className="p-4 sm:p-6">
                <h3 className="font-semibold text-base sm:text-lg mb-2 text-foreground">Free</h3>
                <div className="text-2xl sm:text-3xl font-bold text-foreground mb-3 sm:mb-4">₹0<span className="text-xs sm:text-sm font-normal text-muted-foreground">/month</span></div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">For small teams getting started</p>
                <ul className="text-xs sm:text-sm text-muted-foreground space-y-1.5 sm:space-y-2 mb-4 sm:mb-6">
                  <li>Up to 5 users</li>
                  <li>Basic features</li>
                </ul>
                <Link to="/signup">
                  <Button variant="outline" className="w-full text-sm">Start Free</Button>
                </Link>
              </CardContent>
            </Card>
            <Card className="border-emerald-500 border-2 text-center relative bg-card">
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-xs">Popular</Badge>
              <CardContent className="p-4 sm:p-6">
                <h3 className="font-semibold text-base sm:text-lg mb-2 text-foreground">Professional</h3>
                <div className="text-2xl sm:text-3xl font-bold text-foreground mb-3 sm:mb-4">₹7,999<span className="text-xs sm:text-sm font-normal text-muted-foreground">/month</span></div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">For growing businesses</p>
                <ul className="text-xs sm:text-sm text-muted-foreground space-y-1.5 sm:space-y-2 mb-4 sm:mb-6">
                  <li>Up to 100 users</li>
                  <li>All features</li>
                </ul>
                <Link to="/signup">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-sm">Start Trial</Button>
                </Link>
              </CardContent>
            </Card>
            <Card className="border-border text-center sm:col-span-2 lg:col-span-1 bg-card">
              <CardContent className="p-4 sm:p-6">
                <h3 className="font-semibold text-base sm:text-lg mb-2 text-foreground">Enterprise</h3>
                <div className="text-2xl sm:text-3xl font-bold text-foreground mb-3 sm:mb-4">Custom</div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">For large organizations</p>
                <ul className="text-xs sm:text-sm text-muted-foreground space-y-1.5 sm:space-y-2 mb-4 sm:mb-6">
                  <li>Unlimited users</li>
                  <li>Custom features</li>
                </ul>
                <Link to="/pricing">
                  <Button variant="outline" className="w-full text-sm">Contact Sales</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
          <div className="text-center mt-6 sm:mt-8">
            <Link to="/pricing" className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium text-sm sm:text-base">
              View full pricing details →
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-20 bg-gradient-to-r from-emerald-600 to-emerald-500" aria-labelledby="stats-heading">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 id="stats-heading" className="sr-only">Platform statistics</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 text-center" role="list">
            {stats.map((stat, index) => (
              <div key={index} className="animate-fade-in" style={{
                animationDelay: `${index * 100}ms`
              }} role="listitem">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1 sm:mb-2 count-up">
                  {stat.value}
                </div>
                <div className="text-emerald-100 text-xs sm:text-sm lg:text-base">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* CTA Section */}
      <section className="py-12 sm:py-20 bg-muted/50" aria-labelledby="cta-heading">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="max-w-4xl mx-auto bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-950/30 dark:to-blue-950/30 border-2 border-emerald-200 dark:border-emerald-800 hover-lift animate-fade-in">
            <CardContent className="p-6 sm:p-8 lg:p-12 text-center">
              <CheckCircle className="h-12 w-12 sm:h-16 sm:w-16 text-emerald-600 dark:text-emerald-400 mx-auto mb-4 sm:mb-6 animate-bounce-subtle" aria-hidden="true" />
              <h2 id="cta-heading" className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-3 sm:mb-4 leading-tight">
                Ready to Transform Your Workflow?
              </h2>
              <p className="text-sm sm:text-base lg:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed">
                Join thousands of teams already using SLTwork Hub to manage tasks, 
                collaborate effectively, and reward productivity.
              </p>
              <Link to="/signup">
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 h-11 sm:h-12 px-6 sm:px-8 text-sm sm:text-base transition-all duration-200 hover-grow focus-ring">
                  Start Your Free Trial
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 dark:bg-slate-950 text-slate-100 py-8 sm:py-12" role="contentinfo">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-6 text-center md:text-left md:flex-row md:justify-between">
            <div className="flex flex-col items-center md:items-start gap-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <img 
                  src="/slt-hub-icon.png" 
                  alt="SLT work HuB"
                  className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg object-contain"
                />
                <span className="text-sm sm:text-lg font-bold">
                  <span className="font-black">SLT</span>
                  <span className="font-normal text-slate-400"> work </span>
                  <span className="font-black">HuB</span>
                </span>
              </div>
              <span className="text-emerald-400 font-medium flex items-center gap-2 text-xs sm:text-sm">
                <span>Made with ❤️ in</span>
                <span className="font-bold">భారత్ 🇮🇳</span>
              </span>
            </div>
            
            <div className="flex flex-col items-center md:items-end gap-2">
              <div className="text-slate-400 text-xs sm:text-sm">
                © 2025 SLT work HuB. All rights reserved.
              </div>
              <div className="flex gap-4 text-xs text-slate-500">
                <Link to="/privacy" className="hover:text-slate-300 transition-colors">Privacy</Link>
                <Link to="/terms" className="hover:text-slate-300 transition-colors">Terms</Link>
                <Link to="/pricing" className="hover:text-slate-300 transition-colors">Pricing</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Bottom Navigation for Mobile */}
      <BottomNavigation variant="public" />
      
      {/* Add padding at bottom for mobile nav */}
      <div className="h-16 md:hidden" />
    </div>
  );
}