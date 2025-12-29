import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PublicHeader } from '@/components/public/PublicHeader';
import { PublicFooter } from '@/components/public/PublicFooter';
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
  Check
} from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';

// Import feature images
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
  return (
    <>
      <SEOHead 
        title="Features - SLT work HuB | Complete Workplace Management Tools"
        description="Discover all features of SLT work HuB: employee management, training, assessments, task management, team communication, rewards, and analytics."
        keywords="workplace features, employee management, training software, task management, team communication, HR software features"
        canonical="https://slthub.lovable.app/features"
      />
      <div className="min-h-screen bg-background">
        {/* Shared Header */}
        <PublicHeader />

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
          
          {/* Decorative Background Shapes */}
          <div className="absolute top-0 left-0 w-72 h-72 bg-emerald-400/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" aria-hidden="true" />
          <div className="absolute top-1/3 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl translate-x-1/2" aria-hidden="true" />
          <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl translate-y-1/2" aria-hidden="true" />
          
          <div className="container relative mx-auto text-center max-w-4xl">
            <Badge className="mb-4 sm:mb-6 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-700 text-xs sm:text-sm animate-bounce-subtle">
              <Zap className="mr-1 h-3 w-3" />
              All Features
            </Badge>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 tracking-tight text-foreground leading-tight animate-fade-in">
              Everything You Need to
              <span className="block text-emerald-600 dark:text-emerald-400">Manage Your Team</span>
            </h1>
            <p className="text-base sm:text-xl lg:text-2xl text-muted-foreground mb-8 sm:mb-10 max-w-3xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '100ms' }}>
              From employee management to training, assessments, task tracking, and rewards - 
              SLT Work Hub provides a complete solution for modern teams.
            </p>
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 h-12 sm:h-14 px-8 sm:px-10 text-base sm:text-lg shadow-lg shadow-emerald-600/25 animate-fade-in" style={{ animationDelay: '200ms' }} asChild>
              <Link to="/signup">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            
            {/* Team Image */}
            <div className="mt-12 sm:mt-16 animate-fade-in" style={{ animationDelay: '300ms' }}>
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

        {/* Shared Footer */}
        <PublicFooter />
      </div>
    </>
  );
}
