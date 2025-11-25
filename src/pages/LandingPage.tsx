import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard, 
  Coins, 
  Users, 
  TrendingUp, 
  Target,
  BarChart3,
  CheckCircle,
  Clock,
  Award,
  ArrowRight,
  Play
} from 'lucide-react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useCountUp } from '@/hooks/useCountUp';
import { useAuth } from '@/hooks/useAuth';

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const tasksCount = useCountUp(43, 2000);
  const internsCount = useCountUp(50, 2000);
  const coinsCount = useCountUp(2720, 2500);

  // Redirect authenticated users to dashboard
  if (user && !loading) {
    return <Navigate to="/dashboard" replace />;
  }

  const features = [
    {
      icon: LayoutDashboard,
      title: 'Kanban Board',
      description: 'Visual task management with drag-and-drop simplicity',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      icon: Coins,
      title: 'Coin Rewards',
      description: 'Gamified system to recognize and reward excellence',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50'
    },
    {
      icon: Users,
      title: 'Team Management',
      description: 'Comprehensive tools for managing interns and teams',
      color: 'text-green-500',
      bgColor: 'bg-green-50'
    },
    {
      icon: BarChart3,
      title: 'Analytics',
      description: 'Real-time insights into productivity and performance',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50'
    },
    {
      icon: Clock,
      title: 'Time Tracking',
      description: 'Automated session logging and attendance tracking',
      color: 'text-orange-500',
      bgColor: 'bg-orange-50'
    },
    {
      icon: Award,
      title: 'Training Center',
      description: 'Built-in training materials and assessments',
      color: 'text-pink-500',
      bgColor: 'bg-pink-50'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center">
              <Target className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">SLT WorkHub</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Button variant="ghost" className="text-sm">Features</Button>
            <Button variant="ghost" className="text-sm">Pricing</Button>
            <Button variant="ghost" onClick={() => navigate('/auth')}>Login</Button>
            <Button onClick={() => navigate('/auth')}>Sign Up</Button>
          </nav>
          <Button className="md:hidden" onClick={() => navigate('/auth')}>Get Started</Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 pb-16 text-center">
        <Badge className="mb-4 animate-fade-in">
          ✨ Trusted by leading companies
        </Badge>
        <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent">
          SLT WorkHub
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-4 max-w-2xl mx-auto animate-fade-in">
          Manage Tasks. Track Performance.
        </p>
        <p className="text-2xl md:text-3xl font-semibold mb-8 animate-fade-in bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
          Reward Excellence.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-scale-in">
          <Button size="lg" className="gap-2" onClick={() => navigate('/auth')}>
            Get Started Free
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button size="lg" variant="outline" className="gap-2">
            <Play className="h-4 w-4" />
            Watch Demo
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-16">
          <Card className="hover-scale">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <Target className="h-8 w-8 text-primary mb-2" />
                <p className="text-3xl font-bold">{tasksCount}+</p>
                <p className="text-sm text-muted-foreground">Tasks Managed</p>
              </div>
            </CardContent>
          </Card>
          <Card className="hover-scale">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <Users className="h-8 w-8 text-green-500 mb-2" />
                <p className="text-3xl font-bold">{internsCount}+</p>
                <p className="text-sm text-muted-foreground">Interns</p>
              </div>
            </CardContent>
          </Card>
          <Card className="hover-scale">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <Coins className="h-8 w-8 text-yellow-500 mb-2" />
                <p className="text-3xl font-bold">{coinsCount}+</p>
                <p className="text-sm text-muted-foreground">Coins Awarded</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to manage your team and boost productivity
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="hover-scale card-gradient group">
              <CardContent className="pt-6">
                <div className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="container mx-auto px-4 py-16 bg-muted/20 rounded-2xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Trusted by Teams</h2>
          <p className="text-lg text-muted-foreground">
            Join thousands of companies using SLT WorkHub
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="hover-scale">
              <CardContent className="pt-6">
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <CheckCircle key={star} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  "SLT WorkHub has transformed how we manage our intern program. The gamification keeps everyone motivated!"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary" />
                  <div>
                    <p className="font-semibold text-sm">Team Leader</p>
                    <p className="text-xs text-muted-foreground">Tech Company</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Join teams already using SLT WorkHub to manage tasks and reward excellence
        </p>
        <Button size="lg" className="gap-2" onClick={() => navigate('/auth')}>
          Start Free Trial
          <ArrowRight className="h-4 w-4" />
        </Button>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center">
                <Target className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">SLT WorkHub</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 SLT WorkHub. All rights reserved.
            </p>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <Button variant="link" className="h-auto p-0">Privacy</Button>
              <Button variant="link" className="h-auto p-0">Terms</Button>
              <Button variant="link" className="h-auto p-0">Contact</Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
