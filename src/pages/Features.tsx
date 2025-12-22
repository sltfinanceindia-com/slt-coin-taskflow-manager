import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { BottomNavigation } from '@/components/BottomNavigation';
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

// Import images
import bgPatternFeatures from '@/assets/bg-pattern-features.jpg';
import heroCollaboration from '@/assets/hero-collaboration.jpg';
import workspaceDesk from '@/assets/workspace-desk.jpg';

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
        <div className="container mx-auto px-3 sm:px-4 h-12 sm:h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-1.5">
            <img 
              src="/slt-hub-icon.png" 
              alt="SLT work HuB"
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-md object-contain"
            />
            <span className="text-sm sm:text-base">
              <span className="font-bold">SLT</span>
              <span className="font-normal text-muted-foreground"> work </span>
              <span className="font-bold">HuB</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-4">
            <Link to="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Home</Link>
            <Link to="/features" className="text-xs text-foreground font-medium">Features</Link>
            <Link to="/pricing" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
          </nav>
          
          {/* Desktop Actions */}
          <div className="hidden sm:flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-8 text-xs" asChild>
              <Link to="/auth">Login</Link>
            </Button>
            <Button size="sm" className="h-8 text-xs" asChild>
              <Link to="/signup">Start Free Trial</Link>
            </Button>
          </div>

          {/* Mobile Menu */}
          <div className="sm:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Menu className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[240px] pt-10">
                <div className="flex flex-col gap-3">
                  <Link to="/" onClick={() => setMobileMenuOpen(false)} className="text-sm text-foreground hover:text-primary transition-colors py-1.5">
                    Home
                  </Link>
                  <Link to="/features" onClick={() => setMobileMenuOpen(false)} className="text-sm text-primary font-medium py-1.5">
                    Features
                  </Link>
                  <Link to="/pricing" onClick={() => setMobileMenuOpen(false)} className="text-sm text-foreground hover:text-primary transition-colors py-1.5">
                    Pricing
                  </Link>
                  <hr className="my-1.5" />
                  <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full text-xs">Login</Button>
                  </Link>
                  <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                    <Button size="sm" className="w-full text-xs">Start Free Trial</Button>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Hero with Background Image */}
      <section 
        className="relative py-12 sm:py-20 px-3 sm:px-4 overflow-hidden"
        style={{
          backgroundImage: `url(${bgPatternFeatures})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-background/90 dark:bg-background/95" />
        
        <div className="container relative mx-auto text-center max-w-3xl">
          <Badge variant="secondary" className="mb-4 text-xs">All Features</Badge>
          <h1 className="text-2xl sm:text-4xl font-bold mb-4">
            Everything You Need to Manage Your Team
          </h1>
          <p className="text-sm sm:text-lg text-muted-foreground mb-6">
            From employee management to training, assessments, task tracking, and rewards - 
            SLT Work Hub provides a complete solution for modern teams.
          </p>
          <Button size="lg" className="h-11" asChild>
            <Link to="/signup">
              Start Free Trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          
          {/* Team Image */}
          <div className="mt-10 sm:mt-14">
            <img 
              src={heroCollaboration}
              alt="Team collaboration"
              className="w-full max-w-4xl mx-auto rounded-xl shadow-2xl border border-border/50"
            />
          </div>
        </div>
      </section>

      {/* Main Features */}
      <section className="py-10 sm:py-14 px-3 sm:px-4">
        <div className="container mx-auto">
          <div className="space-y-12 sm:space-y-16">
            {features.map((feature, index) => (
              <div 
                key={feature.title}
                className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-6 sm:gap-8 items-center`}
              >
                <div className="flex-1">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4`}>
                    <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold mb-2">{feature.title}</h2>
                  <p className="text-sm text-muted-foreground mb-4">{feature.description}</p>
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                          <Check className="h-2.5 w-2.5 text-green-600" />
                        </div>
                        <span className="text-xs sm:text-sm">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex-1 w-full">
                  <Card className="border overflow-hidden">
                    <CardContent className="p-0">
                      <div className="aspect-video relative">
                        <img 
                          src={index % 2 === 0 ? workspaceDesk : heroCollaboration}
                          alt={feature.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4">
                          <div className={`w-10 h-10 rounded-lg ${feature.color} flex items-center justify-center`}>
                            <feature.icon className="h-5 w-5 text-white" />
                          </div>
                        </div>
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
      <section className="py-10 sm:py-14 px-3 sm:px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h2 className="text-xl sm:text-2xl font-bold mb-2">And Much More...</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Built with enterprise-grade infrastructure to support teams of any size.
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {additionalFeatures.map((feature) => (
              <Card key={feature.title} className="p-3 sm:p-4">
                <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center mb-2">
                  <feature.icon className="h-4 w-4 text-primary" />
                </div>
                <h3 className="text-sm font-semibold mb-1">{feature.title}</h3>
                <p className="text-xs text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-10 sm:py-14 px-3 sm:px-4">
        <div className="container mx-auto">
          <Card className="bg-gradient-to-r from-primary to-primary/80 border-0">
            <CardContent className="py-10 sm:py-12 text-center px-4">
              <h2 className="text-xl sm:text-2xl font-bold text-primary-foreground mb-2">
                Ready to Transform Your Workplace?
              </h2>
              <p className="text-primary-foreground/80 text-xs sm:text-sm mb-6 max-w-xl mx-auto">
                Start your 14-day free trial today. No credit card required.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button size="sm" variant="secondary" className="h-9 text-xs" asChild>
                  <Link to="/signup">Start Free Trial</Link>
                </Button>
                <Button size="sm" variant="outline" className="h-9 text-xs bg-transparent text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/10" asChild>
                  <Link to="/pricing">View Pricing</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-3 sm:px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-1.5">
              <img 
                src="/slt-hub-icon.png" 
                alt="SLT work HuB"
                className="w-6 h-6 rounded-md object-contain"
              />
              <span className="text-sm font-bold">
                <span className="font-bold">SLT</span>
                <span className="font-normal text-muted-foreground"> work </span>
                <span className="font-bold">HuB</span>
              </span>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <span>Made with</span>
              <span className="text-red-500">❤️</span>
              <span>in భారత్</span>
            </div>
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} SLT Work Hub. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Bottom Navigation for Mobile */}
      <BottomNavigation variant="public" />
      
      {/* Add padding at bottom for mobile nav */}
      <div className="h-14 md:hidden" />
    </div>
  );
}