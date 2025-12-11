import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  Users, 
  GraduationCap, 
  ClipboardCheck, 
  ListTodo, 
  MessageSquare, 
  Trophy,
  BarChart3,
  Palette,
  Shield,
  Zap,
  Globe,
  Headphones,
  ArrowRight,
  Check,
  Menu
} from 'lucide-react';

const features = [
  {
    icon: Users,
    title: 'Employee Management',
    description: 'Organize employees, departments, and roles in one centralized hub. Track performance, manage profiles, and maintain a complete overview of your workforce.',
    benefits: [
      'Centralized employee directory',
      'Department organization',
      'Role-based access control',
      'Employee performance tracking',
      'Bulk import/export capabilities'
    ],
    color: 'bg-blue-500'
  },
  {
    icon: GraduationCap,
    title: 'Training & Development',
    description: 'Create engaging training modules with videos, documents, and interactive content. Track employee progress and ensure compliance with mandatory training.',
    benefits: [
      'Video and document hosting',
      'Progress tracking',
      'Completion certificates',
      'Training analytics',
      'Self-paced learning'
    ],
    color: 'bg-purple-500'
  },
  {
    icon: ClipboardCheck,
    title: 'Assessments & Testing',
    description: 'Build custom assessments with multiple question types. Auto-grade tests, analyze results, and identify knowledge gaps across your organization.',
    benefits: [
      'Custom quiz builder',
      'Auto-grading system',
      'Detailed analytics',
      'Time-limited tests',
      'Question bank management'
    ],
    color: 'bg-green-500'
  },
  {
    icon: ListTodo,
    title: 'Task Management',
    description: 'Assign tasks, set deadlines, and monitor team productivity. Visual Kanban boards help track progress from assignment to completion.',
    benefits: [
      'Kanban board view',
      'Task assignment',
      'Priority levels',
      'Due date tracking',
      'Progress monitoring'
    ],
    color: 'bg-orange-500'
  },
  {
    icon: MessageSquare,
    title: 'Team Communication',
    description: 'Built-in messaging keeps your team connected. Create channels, send direct messages, and share files - all within the platform.',
    benefits: [
      'Direct messaging',
      'Channel-based communication',
      'File sharing',
      'Message reactions',
      'Read receipts'
    ],
    color: 'bg-pink-500'
  },
  {
    icon: Trophy,
    title: 'Rewards & Gamification',
    description: 'Motivate your team with a coin-based reward system. Employees earn coins for completing tasks, which can be tracked and redeemed.',
    benefits: [
      'Coin reward system',
      'Leaderboards',
      'Achievement badges',
      'Reward redemption',
      'Performance incentives'
    ],
    color: 'bg-amber-500'
  },
  {
    icon: BarChart3,
    title: 'Analytics & Reporting',
    description: 'Get insights into your organization\'s performance with comprehensive dashboards. Track KPIs, identify trends, and make data-driven decisions.',
    benefits: [
      'Real-time dashboards',
      'Custom reports',
      'Trend analysis',
      'Export capabilities',
      'KPI tracking'
    ],
    color: 'bg-cyan-500'
  },
  {
    icon: Palette,
    title: 'Custom Branding',
    description: 'Make the platform your own with custom branding options. Add your logo, choose brand colors, and create a cohesive experience for your team.',
    benefits: [
      'Logo customization',
      'Brand colors',
      'Custom domain support',
      'White-label options',
      'Personalized experience'
    ],
    color: 'bg-indigo-500'
  }
];

const additionalFeatures = [
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Bank-grade security with data encryption, role-based access, and audit logs.'
  },
  {
    icon: Zap,
    title: 'Fast Performance',
    description: 'Lightning-fast load times and responsive design for seamless user experience.'
  },
  {
    icon: Globe,
    title: 'Multi-Tenant Architecture',
    description: 'Complete data isolation between organizations ensures privacy and security.'
  },
  {
    icon: Headphones,
    title: 'Priority Support',
    description: 'Dedicated support team ready to help you get the most out of the platform.'
  }
];

export default function Features() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <span className="text-primary-foreground font-bold">S</span>
            </div>
            <span className="text-lg sm:text-xl">
              <span className="font-black">SLT</span>
              <span className="font-normal text-muted-foreground"> work </span>
              <span className="font-black">HuB</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">Home</Link>
            <Link to="/features" className="text-foreground font-medium">Features</Link>
            <Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
          </nav>
          
          {/* Desktop Actions */}
          <div className="hidden sm:flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link to="/auth">Login</Link>
            </Button>
            <Button asChild>
              <Link to="/signup">Start Free Trial</Link>
            </Button>
          </div>

          {/* Mobile Menu */}
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
                  <Link to="/" onClick={() => setMobileMenuOpen(false)} className="text-foreground hover:text-primary transition-colors py-2">
                    Home
                  </Link>
                  <Link to="/features" onClick={() => setMobileMenuOpen(false)} className="text-primary font-medium py-2">
                    Features
                  </Link>
                  <Link to="/pricing" onClick={() => setMobileMenuOpen(false)} className="text-foreground hover:text-primary transition-colors py-2">
                    Pricing
                  </Link>
                  <hr className="my-2" />
                  <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">Login</Button>
                  </Link>
                  <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full">Start Free Trial</Button>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 px-4 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto text-center max-w-3xl">
          <Badge variant="secondary" className="mb-4">All Features</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Everything You Need to Manage Your Team
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            From employee management to training, assessments, task tracking, and rewards - 
            SLT Work Hub provides a complete solution for modern teams.
          </p>
          <Button size="lg" asChild>
            <Link to="/signup">
              Start Free Trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Main Features */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="space-y-24">
            {features.map((feature, index) => (
              <div 
                key={feature.title}
                className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-12 items-center`}
              >
                <div className="flex-1">
                  <div className={`w-14 h-14 rounded-xl ${feature.color} flex items-center justify-center mb-6`}>
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold mb-4">{feature.title}</h2>
                  <p className="text-lg text-muted-foreground mb-6">{feature.description}</p>
                  <ul className="space-y-3">
                    {feature.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                          <Check className="h-3 w-3 text-green-600" />
                        </div>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex-1">
                  <Card className="border-2">
                    <CardContent className="p-8">
                      <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 rounded-lg flex items-center justify-center">
                        <feature.icon className="h-20 w-20 text-muted-foreground/50" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features Grid */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4">And Much More...</h2>
            <p className="text-muted-foreground">
              Built with enterprise-grade infrastructure to support teams of any size.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {additionalFeatures.map((feature) => (
              <Card key={feature.title}>
                <CardHeader>
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <Card className="bg-gradient-to-r from-primary to-primary/80 border-0">
            <CardContent className="py-16 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
                Ready to Transform Your Workplace?
              </h2>
              <p className="text-primary-foreground/80 text-lg mb-8 max-w-2xl mx-auto">
                Start your 14-day free trial today. No credit card required.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" asChild>
                  <Link to="/signup">Start Free Trial</Link>
                </Button>
                <Button size="lg" variant="outline" className="bg-transparent text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/10" asChild>
                  <Link to="/pricing">View Pricing</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <span className="text-primary-foreground font-bold">S</span>
              </div>
              <span className="font-bold">
                <span className="font-black">SLT</span>
                <span className="font-normal text-muted-foreground"> work </span>
                <span className="font-black">HuB</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} SLT Work Hub. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}