import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Coins, TrendingUp, Users, Target, Award, Clock } from 'lucide-react';
import { useCoinTransactions } from '@/hooks/useCoinTransactions';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';

export function LandingPage() {
  const { profile } = useAuth();
  const { transactions } = useCoinTransactions();
  const [totalCoins, setTotalCoins] = useState(0);

  useEffect(() => {
    const approved = transactions
      .filter(t => t.status === 'approved')
      .reduce((sum, t) => sum + t.coins_earned, 0);
    setTotalCoins(approved);
  }, [transactions]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="container mx-auto max-w-6xl relative">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
              <Coins className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-sm font-medium">
                Total SLT Coins Distributed: <span className="text-primary font-bold">{totalCoins.toLocaleString()}</span>
              </span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-gradient">
                SLT WorkHub
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Your comprehensive workspace for task management, time tracking, team communication, and professional growth.
            </p>

            {profile && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button size="lg" className="text-lg px-8" onClick={() => window.location.href = '/dashboard'}>
                  Go to Dashboard
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8" onClick={() => window.location.href = '/profile'}>
                  View Profile
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Everything You Need to Succeed</h2>
            <p className="text-muted-foreground">Powerful tools to manage your work efficiently</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="card-hover border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Task Management</h3>
                </div>
                <p className="text-muted-foreground">
                  Organize and track your tasks with our intuitive Kanban board. Visualize your workflow and boost productivity.
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover border-secondary/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-secondary/10 rounded-lg">
                    <Coins className="h-6 w-6 text-secondary" />
                  </div>
                  <h3 className="text-xl font-semibold">SLT Coin Rewards</h3>
                </div>
                <p className="text-muted-foreground">
                  Earn SLT coins for completing tasks and achieving milestones. Track your earnings and celebrate success.
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover border-blue-500/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <Clock className="h-6 w-6 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-semibold">Time Tracking</h3>
                </div>
                <p className="text-muted-foreground">
                  Log your work hours, track attendance, and monitor productivity with comprehensive time management tools.
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover border-green-500/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-green-500/10 rounded-lg">
                    <Users className="h-6 w-6 text-green-500" />
                  </div>
                  <h3 className="text-xl font-semibold">Team Communication</h3>
                </div>
                <p className="text-muted-foreground">
                  Stay connected with your team through real-time messaging, channels, and direct messages.
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover border-purple-500/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-purple-500/10 rounded-lg">
                    <Award className="h-6 w-6 text-purple-500" />
                  </div>
                  <h3 className="text-xl font-semibold">Training & Growth</h3>
                </div>
                <p className="text-muted-foreground">
                  Access training materials, complete assessments, and track your professional development journey.
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover border-orange-500/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-orange-500/10 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-orange-500" />
                  </div>
                  <h3 className="text-xl font-semibold">Analytics & Reports</h3>
                </div>
                <p className="text-muted-foreground">
                  Gain insights into your performance with detailed analytics, charts, and customizable reports.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {profile && (
        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Platform Statistics</h2>
              <p className="text-muted-foreground">Real-time insights into our growing community</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="hover-scale">
                <CardContent className="pt-6 text-center">
                  <Coins className="h-12 w-12 text-coin-gold mx-auto mb-4" />
                  <p className="text-4xl font-bold text-coin-gold mb-2">{totalCoins.toLocaleString()}</p>
                  <p className="text-muted-foreground">Total Coins Earned</p>
                </CardContent>
              </Card>

              <Card className="hover-scale">
                <CardContent className="pt-6 text-center">
                  <Target className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                  <p className="text-4xl font-bold mb-2">{transactions.length}</p>
                  <p className="text-muted-foreground">Tasks Completed</p>
                </CardContent>
              </Card>

              <Card className="hover-scale">
                <CardContent className="pt-6 text-center">
                  <Users className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-4xl font-bold mb-2">Active</p>
                  <p className="text-muted-foreground">Team Members</p>
                </CardContent>
              </Card>

              <Card className="hover-scale">
                <CardContent className="pt-6 text-center">
                  <TrendingUp className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                  <p className="text-4xl font-bold mb-2">100%</p>
                  <p className="text-muted-foreground">Success Rate</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}