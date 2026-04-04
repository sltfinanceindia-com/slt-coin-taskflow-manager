import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { PublicHeader } from '@/components/public/PublicHeader';
import { PublicFooter } from '@/components/public/PublicFooter';
import { 
  Users, 
  Clock, 
  Kanban, 
  DollarSign,
  Target,
  BarChart3,
  ArrowRight,
  Check,
  X,
  Zap,
  Shield,
  Globe,
  Headphones,
  Sparkles,
  Building2,
  Calendar,
  FileText,
  Award,
  TrendingUp,
  PieChart
} from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import { 
  fadeInUp, 
  staggerContainer, 
  cardHover, 
  viewportOnce,
  smoothTransition
} from '@/lib/animations';

const featureTabs = [
  {
    id: 'hr',
    label: 'HR Management',
    icon: Users,
    title: 'Complete HR Lifecycle Management',
    description: 'From onboarding to offboarding, manage every aspect of your employee journey in one place.',
    features: [
      'Employee directory & profiles',
      'Organization chart visualization',
      'Document management & e-signatures',
      'Compliance tracking & reporting',
      'Employee self-service portal',
      'Multi-location support',
      'Custom fields & workflows',
      'Bulk import/export'
    ],
    stats: [
      { label: 'Time saved on HR tasks', value: '60%' },
      { label: 'Paperwork reduction', value: '80%' },
      { label: 'Onboarding speed', value: '3x' }
    ]
  },
  {
    id: 'attendance',
    label: 'Attendance',
    icon: Clock,
    title: 'Smart Attendance & Time Tracking',
    description: 'GPS-based check-in, biometric integration, and real-time tracking for distributed teams.',
    features: [
      'GPS-based clock in/out',
      'Biometric integration',
      'Shift scheduling & rosters',
      'Overtime calculation',
      'Leave management',
      'Real-time attendance dashboard',
      'Geofencing for remote teams',
      'Mobile app for field workers'
    ],
    stats: [
      { label: 'Accuracy improvement', value: '99%' },
      { label: 'Time theft reduction', value: '40%' },
      { label: 'Processing time', value: '-70%' }
    ]
  },
  {
    id: 'projects',
    label: 'Projects',
    icon: Kanban,
    title: 'Advanced Project Management',
    description: 'Kanban boards, Gantt charts, sprint planning, and resource allocation for agile teams.',
    features: [
      'Kanban board views',
      'Gantt chart timelines',
      'Sprint planning & backlog',
      'Resource allocation',
      'Task dependencies',
      'Time tracking per task',
      'Project templates',
      'Client collaboration'
    ],
    stats: [
      { label: 'Project delivery', value: '+35%' },
      { label: 'Team productivity', value: '+45%' },
      { label: 'On-time delivery', value: '92%' }
    ]
  },
  {
    id: 'payroll',
    label: 'Payroll',
    icon: DollarSign,
    title: 'Automated Payroll Processing',
    description: 'Compliance-first payroll with automatic tax calculations, salary slips, and statutory reports.',
    features: [
      'Auto salary calculation',
      'Tax compliance (TDS, PF, ESI)',
      'Digital salary slips',
      'Bank file generation',
      'Reimbursement processing',
      'Statutory reports',
      'Multi-currency support',
      'Payroll analytics'
    ],
    stats: [
      { label: 'Processing time', value: '-80%' },
      { label: 'Error reduction', value: '95%' },
      { label: 'Compliance rate', value: '100%' }
    ]
  },
  {
    id: 'performance',
    label: 'Performance',
    icon: Target,
    title: 'Performance & OKR Management',
    description: 'Goal setting, 360° feedback, performance reviews, and continuous development tracking.',
    features: [
      'OKR goal setting',
      '360° feedback cycles',
      'Performance reviews',
      'Competency frameworks',
      '1:1 meeting notes',
      'Development plans',
      'Calibration tools',
      'Performance analytics'
    ],
    stats: [
      { label: 'Goal achievement', value: '+40%' },
      { label: 'Review completion', value: '95%' },
      { label: 'Employee engagement', value: '+25%' }
    ]
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    title: 'Powerful Analytics & Insights',
    description: 'Real-time dashboards, custom reports, predictive insights, and data-driven decisions.',
    features: [
      'Real-time dashboards',
      'Custom report builder',
      'Trend analysis',
      'Predictive insights',
      'Export to Excel/PDF',
      'Scheduled reports',
      'Role-based access',
      'API access'
    ],
    stats: [
      { label: 'Decision speed', value: '+50%' },
      { label: 'Data accuracy', value: '99%' },
      { label: 'Report generation', value: '-90%' }
    ]
  }
];

const comparisonData = [
  { feature: 'Setup time', tenexa: 'Hours', legacy: 'Weeks', spreadsheets: 'Days' },
  { feature: 'Monthly cost', tenexa: 'From ₹999', legacy: '₹5000+', spreadsheets: 'Free*' },
  { feature: 'All-in-one platform', tenexa: true, legacy: false, spreadsheets: false },
  { feature: 'Mobile app', tenexa: true, legacy: 'Limited', spreadsheets: false },
  { feature: 'Real-time sync', tenexa: true, legacy: 'Slow', spreadsheets: false },
  { feature: 'GPS attendance', tenexa: true, legacy: false, spreadsheets: false },
  { feature: 'Automated payroll', tenexa: true, legacy: true, spreadsheets: false },
  { feature: 'AI-powered insights', tenexa: true, legacy: false, spreadsheets: false },
  { feature: '24/7 support', tenexa: true, legacy: 'Business hours', spreadsheets: false },
  { feature: 'Custom integrations', tenexa: true, legacy: 'Extra cost', spreadsheets: false }
];

const additionalFeatures = [
  { icon: Shield, title: 'Enterprise Security', description: 'Bank-grade encryption & SOC2 compliance' },
  { icon: Zap, title: 'Lightning Fast', description: 'Sub-second load times globally' },
  { icon: Globe, title: 'Multi-tenant', description: 'Complete data isolation' },
  { icon: Headphones, title: '24/7 Support', description: 'Dedicated success team' }
];

export default function Features() {
  const [activeTab, setActiveTab] = useState('hr');
  const location = useLocation();
  const activeFeature = featureTabs.find(tab => tab.id === activeTab) || featureTabs[0];

  // Parse URL hash to auto-select tab and scroll into view
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash && featureTabs.some(tab => tab.id === hash)) {
      setActiveTab(hash);
      setTimeout(() => {
        document.getElementById('features-tabs')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [location.hash]);

  return (
    <>
      <SEOHead 
        title="Features - Tenexa | Complete Workforce Management Platform"
        description="Discover TeneXA's powerful features: HR management, GPS attendance, project tracking, automated payroll, performance management, and real-time analytics."
        keywords="HR software features, attendance tracking, project management, payroll automation, performance management, workforce analytics"
        canonical="https://sltwork.lovable.app/features"
      />
      <div className="min-h-screen bg-background">
        <PublicHeader />

        {/* Hero Section */}
        <section className="relative py-14 overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
          
          <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
                <Sparkles className="h-3 w-3 mr-1" />
                All-in-One Platform
              </Badge>
              <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
                Powerful Features for{' '}
                <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Complete Control
                </span>
              </h1>
              <p className="text-sm md:text-base text-muted-foreground mb-6 max-w-2xl mx-auto">
                Everything you need to manage HR, attendance, projects, payroll, and performance — all in one integrated platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="h-12 px-8 text-base" asChild>
                  <Link to="/signup">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-12 px-8 text-base" asChild>
                  <Link to="/contact">Schedule Demo</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Tabbed Features Section */}
        <section id="features-tabs" className="py-16 lg:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-12"
              {...fadeInUp}
              viewport={viewportOnce}
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Explore Our Features</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Click on each module to discover how TeneXA transforms your workforce management.
              </p>
            </motion.div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="flex flex-wrap justify-center gap-2 mb-12 bg-transparent h-auto p-0">
                {featureTabs.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2.5 rounded-full border border-border data-[state=active]:border-primary transition-all duration-300"
                  >
                    <tab.icon className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              <AnimatePresence mode="wait">
                {featureTabs.map((tab) => (
                  <TabsContent key={tab.id} value={tab.id} className="mt-0">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.4 }}
                    >
                      <Card className="overflow-hidden border-2">
                        <CardContent className="p-0">
                          <div className="grid lg:grid-cols-2 gap-0">
                            {/* Left: Feature Details */}
                            <div className="p-8 lg:p-12">
                              <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                  <tab.icon className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="text-2xl lg:text-3xl font-bold">{tab.title}</h3>
                              </div>
                              <p className="text-muted-foreground text-lg mb-8">{tab.description}</p>
                              
                              <div className="grid sm:grid-cols-2 gap-3 mb-8">
                                {tab.features.map((feature, idx) => (
                                  <div key={idx} className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                                      <Check className="h-3 w-3 text-green-600" />
                                    </div>
                                    <span className="text-sm">{feature}</span>
                                  </div>
                                ))}
                              </div>

                              <Button size="lg" asChild>
                                <Link to="/signup">
                                  Try {tab.label}
                                  <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                              </Button>
                            </div>

                            {/* Right: Stats & Visual */}
                            <div className="bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5 p-8 lg:p-12 flex flex-col justify-center">
                              <h4 className="text-lg font-semibold mb-6 text-center">Impact Metrics</h4>
                              <div className="grid grid-cols-3 gap-4">
                                {tab.stats.map((stat, idx) => (
                                  <motion.div
                                    key={idx}
                                    className="text-center p-4 bg-background/80 backdrop-blur-sm rounded-xl border"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.1 }}
                                  >
                                    <div className="text-2xl lg:text-3xl font-bold text-primary mb-1">
                                      {stat.value}
                                    </div>
                                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                                  </motion.div>
                                ))}
                              </div>
                              
                              {/* Feature Icons Grid */}
                              <div className="mt-8 grid grid-cols-4 gap-4">
                                {[Calendar, FileText, Award, TrendingUp, PieChart, Building2, Users, Target].slice(0, 4).map((Icon, idx) => (
                                  <motion.div
                                    key={idx}
                                    className="aspect-square rounded-xl bg-background/50 backdrop-blur-sm border flex items-center justify-center"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 + idx * 0.1 }}
                                  >
                                    <Icon className="h-6 w-6 text-muted-foreground" />
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </TabsContent>
                ))}
              </AnimatePresence>
            </Tabs>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-16 lg:py-24 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-12"
              {...fadeInUp}
              viewport={viewportOnce}
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">TeneXA vs Traditional Solutions</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                See how TeneXA compares to legacy HR software and spreadsheet-based solutions.
              </p>
            </motion.div>

            <motion.div 
              className="max-w-4xl mx-auto overflow-x-auto"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={viewportOnce}
            >
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-left p-4 bg-muted/50 rounded-tl-lg">Feature</th>
                    <th className="text-center p-4 bg-primary text-primary-foreground font-bold">
                      <span className="flex items-center justify-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        TeneXA
                      </span>
                    </th>
                    <th className="text-center p-4 bg-muted/50">Legacy HR Software</th>
                    <th className="text-center p-4 bg-muted/50 rounded-tr-lg">Spreadsheets</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((row, idx) => (
                    <motion.tr 
                      key={idx}
                      className="border-b border-border hover:bg-muted/30 transition-colors"
                      variants={fadeInUp}
                    >
                      <td className="p-4 font-medium">{row.feature}</td>
                      <td className="p-4 text-center bg-primary/5">
                        {typeof row.tenexa === 'boolean' ? (
                          row.tenexa ? (
                            <Check className="h-5 w-5 text-green-600 mx-auto" />
                          ) : (
                            <X className="h-5 w-5 text-red-500 mx-auto" />
                          )
                        ) : (
                          <span className="text-primary font-medium">{row.tenexa}</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {typeof row.legacy === 'boolean' ? (
                          row.legacy ? (
                            <Check className="h-5 w-5 text-green-600 mx-auto" />
                          ) : (
                            <X className="h-5 w-5 text-red-500 mx-auto" />
                          )
                        ) : (
                          <span className="text-muted-foreground">{row.legacy}</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {typeof row.spreadsheets === 'boolean' ? (
                          row.spreadsheets ? (
                            <Check className="h-5 w-5 text-green-600 mx-auto" />
                          ) : (
                            <X className="h-5 w-5 text-red-500 mx-auto" />
                          )
                        ) : (
                          <span className="text-muted-foreground">{row.spreadsheets}</span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-muted-foreground mt-4 text-center">
                *Hidden costs include time spent, errors, and lack of insights
              </p>
            </motion.div>
          </div>
        </section>

        {/* Additional Features Grid */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-12"
              {...fadeInUp}
              viewport={viewportOnce}
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Built for Enterprise</h2>
              <p className="text-muted-foreground text-lg">
                Enterprise-grade infrastructure to support teams of any size.
              </p>
            </motion.div>
            
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={viewportOnce}
            >
              {additionalFeatures.map((feature, idx) => (
                <motion.div key={idx} variants={fadeInUp}>
                  <Card className="h-full p-6 hover:shadow-lg transition-shadow border-2 hover:border-primary/20">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="max-w-4xl mx-auto"
              {...fadeInUp}
              viewport={viewportOnce}
            >
              <Card className="bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10 border-2 border-primary/20 overflow-hidden">
                <CardContent className="p-8 sm:p-12 lg:p-16 text-center relative">
                  {/* Decorative elements */}
                  <div className="absolute top-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
                  <div className="absolute bottom-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl" />
                  
                  <div className="relative">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                      Ready to Transform Your Workplace?
                    </h2>
                    <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                      Start your 14-day free trial today. No credit card required.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button size="lg" className="h-12 px-8 text-base" asChild>
                        <Link to="/signup">
                          Start Free Trial
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                      </Button>
                      <Button size="lg" variant="outline" className="h-12 px-8 text-base" asChild>
                        <Link to="/pricing">View Pricing</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        <PublicFooter />
      </div>
    </>
  );
}
