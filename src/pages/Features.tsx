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
import featureEmployeeManagement from '@/assets/feature-employee-management.jpg';
import featureTraining from '@/assets/feature-training.jpg';
import featureAssessment from '@/assets/feature-assessment.jpg';
import featureTaskManagement from '@/assets/feature-task-management.jpg';
import featureCommunication from '@/assets/feature-communication.jpg';
import featureRewards from '@/assets/feature-rewards.jpg';
import featureAnalytics from '@/assets/feature-analytics.jpg';
import featureBranding from '@/assets/feature-branding.jpg';

// Feature images mapping
const featureImages = [
  featureEmployeeManagement,
  featureTraining,
  featureAssessment,
  featureTaskManagement,
  featureCommunication,
  featureRewards,
  featureAnalytics,
  featureBranding
];

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
        className="relative py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden"
        style={{
          backgroundImage: `url(${bgPatternFeatures})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-background/85 dark:bg-background/90" />
        
        <div className="container relative mx-auto text-center max-w-4xl">
          <Badge className="mb-4 sm:mb-6 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-700 text-xs sm:text-sm">
            <Zap className="mr-1 h-3 w-3" />
            All Features
          </Badge>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 tracking-tight text-foreground leading-tight">
            Everything You Need to
            <span className="block text-emerald-600 dark:text-emerald-400">Manage Your Team</span>
          </h1>
          <p className="text-base sm:text-xl lg:text-2xl text-muted-foreground mb-8 sm:mb-10 max-w-3xl mx-auto leading-relaxed">
            From employee management to training, assessments, task tracking, and rewards - 
            SLT Work Hub provides a complete solution for modern teams.
          </p>
          <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 h-12 sm:h-14 px-8 sm:px-10 text-base sm:text-lg" asChild>
            <Link to="/signup">
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          
          {/* Team Image */}
          <div className="mt-12 sm:mt-16">
            <div className="relative mx-auto max-w-5xl">
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
              <img 
                src={heroCollaboration}
                alt="Team collaboration"
                className="w-full rounded-xl shadow-2xl border border-border/50"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Features */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="space-y-16 sm:space-y-24">
            {features.map((feature, index) => (
              <div 
                key={feature.title}
                className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8 sm:gap-12 items-center`}
              >
                <div className="flex-1">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl ${feature.color} flex items-center justify-center mb-4 sm:mb-6`}>
                    <feature.icon className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 text-foreground">{feature.title}</h2>
                  <p className="text-base sm:text-lg text-muted-foreground mb-6 leading-relaxed">{feature.description}</p>
                  <ul className="space-y-3">
                    {feature.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                          <Check className="h-3 w-3 text-green-600" />
                        </div>
                        <span className="text-sm sm:text-base text-foreground">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex-1 w-full">
                  <Card className="border overflow-hidden shadow-lg">
                    <CardContent className="p-0">
                      <div className="aspect-video relative">
                        <img 
                          src={featureImages[index] || heroCollaboration}
                          alt={feature.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4">
                          <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center shadow-lg`}>
                            <feature.icon className="h-6 w-6 text-white" />
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
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 text-foreground">And Much More...</h2>
            <p className="text-base sm:text-xl text-muted-foreground">
              Built with enterprise-grade infrastructure to support teams of any size.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {additionalFeatures.map((feature) => (
              <Card key={feature.title} className="p-5 sm:p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">{feature.title}</h3>
                <p className="text-sm sm:text-base text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <Card className="max-w-4xl mx-auto bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-950/40 dark:to-blue-950/40 border-2 border-emerald-200 dark:border-emerald-800 shadow-2xl shadow-emerald-500/10">
            <CardContent className="p-8 sm:p-12 lg:p-16 text-center">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Ready to Transform Your Workplace?
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Start your 14-day free trial today. No credit card required.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 h-12 sm:h-14 px-8 sm:px-10 text-base sm:text-lg" asChild>
                  <Link to="/signup">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-12 sm:h-14 px-8 sm:px-10 text-base sm:text-lg" asChild>
                  <Link to="/pricing">View Pricing</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 dark:bg-slate-950 text-slate-100 py-10 sm:py-14">
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
      <div className="h-14 md:hidden" />
    </div>
  );
}