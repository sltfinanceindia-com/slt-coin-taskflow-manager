import React, { useState } from 'react';
import { AppSidebar } from '@/components/AppSidebar';
import { AppHeader } from '@/components/AppHeader';
import { SidebarProvider } from '@/components/ui/sidebar';
import { BottomNavigation } from '@/components/BottomNavigation';
import { useIsMobile } from '@/hooks/use-mobile';
import { useUserRole } from '@/hooks/useUserRole';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import { 
  LayoutDashboard, CheckSquare, Clock, Coins, Users, BarChart3, FolderOpen, BookOpen,
  Settings, MessageSquare, Shield, CalendarDays, MapPin, Home, Palmtree, Target,
  MessageCircle, UserCheck, AlertTriangle, HeartPulse, Zap, Briefcase, TrendingUp,
  Gauge, Inbox, Wallet, Receipt, FileText, Package, PieChart, ClipboardCheck, Calendar,
  Banknote, GanttChart, Play, ChevronRight, CheckCircle2, Circle, ArrowRight, Lightbulb,
  Star, Rocket, GraduationCap, HelpCircle, Video
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  path: string;
  roles: string[];
  duration: string;
  tips?: string[];
}

interface TutorialModule {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  steps: TutorialStep[];
  roles: string[];
}

const tutorialModules: TutorialModule[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Essential first steps to begin using the platform',
    icon: Rocket,
    color: 'bg-blue-500',
    roles: ['all'],
    steps: [
      {
        id: 'dashboard-overview',
        title: 'Dashboard Overview',
        description: 'Learn how to navigate the main dashboard and understand key metrics at a glance.',
        icon: LayoutDashboard,
        path: '/dashboard?tab=overview',
        roles: ['all'],
        duration: '3 min',
        tips: [
          'Use the sidebar to navigate between different sections',
          'Click on any widget to see detailed information',
          'Toggle between views using the tabs at the top'
        ]
      },
      {
        id: 'profile-setup',
        title: 'Complete Your Profile',
        description: 'Set up your profile with photo, contact details, and preferences.',
        icon: Settings,
        path: '/profile',
        roles: ['all'],
        duration: '5 min',
        tips: [
          'Upload a professional photo for better team recognition',
          'Add your skills and expertise for project matching',
          'Set your notification preferences'
        ]
      },
      {
        id: 'notifications',
        title: 'Understanding Notifications',
        description: 'Learn about the notification system and how to manage alerts.',
        icon: MessageCircle,
        path: '/dashboard?tab=overview',
        roles: ['all'],
        duration: '2 min',
        tips: [
          'Click the bell icon to view all notifications',
          'Mark important notifications as read',
          'Configure email notifications in settings'
        ]
      }
    ]
  },
  {
    id: 'task-management',
    title: 'Task Management',
    description: 'Master the task system for efficient work tracking',
    icon: CheckSquare,
    color: 'bg-green-500',
    roles: ['all'],
    steps: [
      {
        id: 'kanban-board',
        title: 'Kanban Board',
        description: 'Visualize and manage tasks using the drag-and-drop Kanban board.',
        icon: CheckSquare,
        path: '/dashboard?tab=tasks',
        roles: ['all'],
        duration: '5 min',
        tips: [
          'Drag tasks between columns to update status',
          'Click on a task card to view full details',
          'Use filters to find specific tasks quickly'
        ]
      },
      {
        id: 'create-tasks',
        title: 'Creating Tasks',
        description: 'Learn how to create, assign, and prioritize tasks effectively.',
        icon: CheckSquare,
        path: '/dashboard?tab=tasks',
        roles: ['admin', 'manager', 'team_lead'],
        duration: '4 min',
        tips: [
          'Set clear titles and descriptions',
          'Assign due dates and priorities',
          'Add coin rewards to motivate team members'
        ]
      },
      {
        id: 'time-logging',
        title: 'Time Logging',
        description: 'Track time spent on tasks for accurate project tracking.',
        icon: Clock,
        path: '/dashboard?tab=time',
        roles: ['all'],
        duration: '3 min',
        tips: [
          'Log time immediately after completing work',
          'Add notes to explain what was accomplished',
          'Review weekly time summaries'
        ]
      }
    ]
  },
  {
    id: 'projects',
    title: 'Project Management',
    description: 'Organize and track projects from start to finish',
    icon: FolderOpen,
    color: 'bg-purple-500',
    roles: ['admin', 'manager', 'team_lead'],
    steps: [
      {
        id: 'project-overview',
        title: 'Project Dashboard',
        description: 'View all projects, their status, and key metrics.',
        icon: FolderOpen,
        path: '/dashboard?tab=projects',
        roles: ['admin', 'manager', 'team_lead'],
        duration: '4 min',
        tips: [
          'Filter projects by status, team, or date',
          'Click on a project to see detailed progress',
          'Export project reports for stakeholders'
        ]
      },
      {
        id: 'gantt-chart',
        title: 'Gantt Chart',
        description: 'Visualize project timelines and dependencies.',
        icon: GanttChart,
        path: '/dashboard?tab=gantt',
        roles: ['admin', 'manager'],
        duration: '5 min',
        tips: [
          'Drag task bars to adjust dates',
          'Link tasks to create dependencies',
          'Identify critical path for project success'
        ]
      },
      {
        id: 'baselines',
        title: 'Project Baselines',
        description: 'Set and track project baselines for performance comparison.',
        icon: Target,
        path: '/dashboard?tab=baselines',
        roles: ['admin', 'manager'],
        duration: '4 min',
        tips: [
          'Create baseline at project start',
          'Compare current progress vs baseline',
          'Document reasons for variances'
        ]
      }
    ]
  },
  {
    id: 'work-requests',
    title: 'Work Requests',
    description: 'Submit and manage work requests efficiently',
    icon: Inbox,
    color: 'bg-orange-500',
    roles: ['all'],
    steps: [
      {
        id: 'submit-request',
        title: 'Submit a Request',
        description: 'Learn how to submit work requests through the portal.',
        icon: Inbox,
        path: '/dashboard?tab=requests',
        roles: ['all'],
        duration: '3 min',
        tips: [
          'Choose the correct request type',
          'Provide detailed descriptions',
          'Attach relevant files if needed'
        ]
      },
      {
        id: 'triage-requests',
        title: 'Triaging Requests',
        description: 'Admin view for reviewing and assigning incoming requests.',
        icon: ClipboardCheck,
        path: '/dashboard?tab=requests',
        roles: ['admin', 'manager'],
        duration: '5 min',
        tips: [
          'Review requests in priority order',
          'Assign to appropriate team members',
          'Set SLA deadlines based on priority'
        ]
      }
    ]
  },
  {
    id: 'attendance-leave',
    title: 'Attendance & Leave',
    description: 'Manage your attendance, shifts, and time off',
    icon: CalendarDays,
    color: 'bg-teal-500',
    roles: ['all'],
    steps: [
      {
        id: 'clock-in-out',
        title: 'Attendance Tracking',
        description: 'Clock in and out to track your working hours.',
        icon: MapPin,
        path: '/dashboard?tab=attendance',
        roles: ['all'],
        duration: '2 min',
        tips: [
          'Clock in when you start work',
          'Remember to clock out at end of day',
          'Check your attendance history regularly'
        ]
      },
      {
        id: 'leave-requests',
        title: 'Leave Requests',
        description: 'Apply for different types of leave.',
        icon: Palmtree,
        path: '/dashboard?tab=leave',
        roles: ['all'],
        duration: '4 min',
        tips: [
          'Check leave balance before applying',
          'Submit requests in advance when possible',
          'Add notes for context'
        ]
      },
      {
        id: 'wfh-requests',
        title: 'Work From Home',
        description: 'Request and manage work from home days.',
        icon: Home,
        path: '/dashboard?tab=wfh',
        roles: ['all'],
        duration: '3 min',
        tips: [
          'Specify WFH dates clearly',
          'Ensure you have necessary equipment',
          'Stay responsive during WFH days'
        ]
      },
      {
        id: 'shift-management',
        title: 'Shift Management',
        description: 'View and manage your work shifts.',
        icon: CalendarDays,
        path: '/dashboard?tab=shifts',
        roles: ['all'],
        duration: '3 min',
        tips: [
          'Check weekly shift schedule',
          'Request shift swaps if needed',
          'Report scheduling conflicts early'
        ]
      }
    ]
  },
  {
    id: 'performance',
    title: 'Performance Management',
    description: 'Track goals, feedback, and performance reviews',
    icon: TrendingUp,
    color: 'bg-indigo-500',
    roles: ['all'],
    steps: [
      {
        id: 'okrs',
        title: 'OKRs (Objectives & Key Results)',
        description: 'Set and track organizational and personal objectives.',
        icon: Target,
        path: '/dashboard?tab=okrs',
        roles: ['admin', 'manager', 'team_lead'],
        duration: '6 min',
        tips: [
          'Align personal OKRs with team objectives',
          'Update progress regularly',
          'Celebrate achievements'
        ]
      },
      {
        id: 'feedback-360',
        title: '360° Feedback',
        description: 'Give and receive comprehensive feedback.',
        icon: MessageCircle,
        path: '/dashboard?tab=feedback',
        roles: ['all'],
        duration: '5 min',
        tips: [
          'Provide specific, constructive feedback',
          'Request feedback from peers',
          'Review feedback for growth areas'
        ]
      },
      {
        id: 'one-on-ones',
        title: '1:1 Meetings',
        description: 'Schedule and conduct effective one-on-one meetings.',
        icon: UserCheck,
        path: '/dashboard?tab=meetings',
        roles: ['admin', 'manager', 'team_lead'],
        duration: '4 min',
        tips: [
          'Prepare agenda before meetings',
          'Document action items',
          'Follow up on previous discussions'
        ]
      },
      {
        id: 'pips',
        title: 'Performance Improvement Plans',
        description: 'Manage PIPs for underperforming team members.',
        icon: AlertTriangle,
        path: '/dashboard?tab=pips',
        roles: ['admin', 'manager'],
        duration: '5 min',
        tips: [
          'Set clear, measurable goals',
          'Provide regular check-ins',
          'Document all progress'
        ]
      }
    ]
  },
  {
    id: 'finance-hr',
    title: 'Finance & HR',
    description: 'Manage expenses, payroll, and HR documents',
    icon: Wallet,
    color: 'bg-emerald-500',
    roles: ['all'],
    steps: [
      {
        id: 'expenses',
        title: 'Expense Management',
        description: 'Submit and track expense claims.',
        icon: Receipt,
        path: '/dashboard?tab=expenses',
        roles: ['all'],
        duration: '4 min',
        tips: [
          'Upload receipts promptly',
          'Categorize expenses correctly',
          'Track reimbursement status'
        ]
      },
      {
        id: 'timesheets',
        title: 'Timesheets',
        description: 'Submit and approve weekly timesheets.',
        icon: ClipboardCheck,
        path: '/dashboard?tab=timesheets',
        roles: ['all'],
        duration: '4 min',
        tips: [
          'Submit timesheets on time',
          'Allocate hours to correct projects',
          'Review before submission'
        ]
      },
      {
        id: 'payroll',
        title: 'Payroll',
        description: 'View payslips and manage payroll (Admin).',
        icon: Wallet,
        path: '/dashboard?tab=payroll',
        roles: ['admin'],
        duration: '5 min',
        tips: [
          'Review payroll before processing',
          'Handle deductions correctly',
          'Generate payslips for distribution'
        ]
      },
      {
        id: 'loans',
        title: 'Loans & Advances',
        description: 'Apply for salary advances and loans.',
        icon: Banknote,
        path: '/dashboard?tab=loans',
        roles: ['all'],
        duration: '3 min',
        tips: [
          'Check eligibility before applying',
          'Understand repayment terms',
          'Track outstanding balance'
        ]
      },
      {
        id: 'documents',
        title: 'HR Documents',
        description: 'Access and manage HR documents and policies.',
        icon: FileText,
        path: '/dashboard?tab=documents',
        roles: ['admin', 'manager'],
        duration: '3 min',
        tips: [
          'Keep documents organized',
          'Ensure policies are up to date',
          'Make important docs easily accessible'
        ]
      },
      {
        id: 'assets',
        title: 'Asset Management',
        description: 'Track company assets assigned to employees.',
        icon: Package,
        path: '/dashboard?tab=assets',
        roles: ['admin'],
        duration: '4 min',
        tips: [
          'Record all asset assignments',
          'Track asset condition',
          'Process returns properly'
        ]
      }
    ]
  },
  {
    id: 'communication',
    title: 'Communication & Engagement',
    description: 'Stay connected with your team',
    icon: MessageSquare,
    color: 'bg-pink-500',
    roles: ['all'],
    steps: [
      {
        id: 'team-chat',
        title: 'Communication Hub',
        description: 'Use channels and direct messages for team communication.',
        icon: MessageSquare,
        path: '/dashboard?tab=communication',
        roles: ['all'],
        duration: '5 min',
        tips: [
          'Join relevant channels',
          'Use @mentions for important messages',
          'Keep conversations organized'
        ]
      },
      {
        id: 'kudos',
        title: 'Kudos Wall',
        description: 'Recognize and celebrate team achievements.',
        icon: HeartPulse,
        path: '/kudos',
        roles: ['all'],
        duration: '3 min',
        tips: [
          'Give kudos to recognize great work',
          'Be specific about achievements',
          'Celebrate team wins publicly'
        ]
      },
      {
        id: 'pulse-surveys',
        title: 'Pulse Surveys',
        description: 'Participate in quick team surveys.',
        icon: MessageCircle,
        path: '/pulse-surveys',
        roles: ['all'],
        duration: '3 min',
        tips: [
          'Respond to surveys promptly',
          'Provide honest feedback',
          'Review survey results (Admin)'
        ]
      }
    ]
  },
  {
    id: 'training',
    title: 'Training & Development',
    description: 'Learn and grow with our training resources',
    icon: GraduationCap,
    color: 'bg-yellow-500',
    roles: ['all'],
    steps: [
      {
        id: 'training-courses',
        title: 'Training Courses',
        description: 'Access and complete assigned training courses.',
        icon: BookOpen,
        path: '/training',
        roles: ['all'],
        duration: '5 min',
        tips: [
          'Complete mandatory training first',
          'Track your progress',
          'Request additional training if needed'
        ]
      },
      {
        id: 'assessments',
        title: 'Assessments',
        description: 'Take assessments to test your knowledge.',
        icon: ClipboardCheck,
        path: '/assessment',
        roles: ['all'],
        duration: '4 min',
        tips: [
          'Review material before assessments',
          'Take assessments when focused',
          'Review results for improvement areas'
        ]
      },
      {
        id: 'goals',
        title: 'Personal Goals',
        description: 'Set and track your personal development goals.',
        icon: Target,
        path: '/my-goals',
        roles: ['all'],
        duration: '4 min',
        tips: [
          'Set SMART goals',
          'Update progress regularly',
          'Celebrate achievements'
        ]
      }
    ]
  },
  {
    id: 'admin-tools',
    title: 'Admin Tools',
    description: 'Advanced administration features',
    icon: Shield,
    color: 'bg-red-500',
    roles: ['admin'],
    steps: [
      {
        id: 'roles-permissions',
        title: 'Roles & Permissions',
        description: 'Manage user roles and access permissions.',
        icon: Shield,
        path: '/dashboard?tab=roles',
        roles: ['admin'],
        duration: '6 min',
        tips: [
          'Follow least privilege principle',
          'Review permissions regularly',
          'Document role changes'
        ]
      },
      {
        id: 'org-chart',
        title: 'Organization Chart',
        description: 'View and manage organizational structure.',
        icon: Users,
        path: '/org-chart',
        roles: ['admin', 'manager'],
        duration: '4 min',
        tips: [
          'Keep reporting lines accurate',
          'Update when team changes occur',
          'Use for planning purposes'
        ]
      },
      {
        id: 'automation',
        title: 'Automation Rules',
        description: 'Set up automated workflows and notifications.',
        icon: Zap,
        path: '/dashboard?tab=automation',
        roles: ['admin'],
        duration: '8 min',
        tips: [
          'Start with simple automations',
          'Test rules before activating',
          'Monitor for unexpected behavior'
        ]
      },
      {
        id: 'reports',
        title: 'Reports & Analytics',
        description: 'Generate and customize reports.',
        icon: PieChart,
        path: '/dashboard?tab=reports',
        roles: ['admin', 'manager'],
        duration: '5 min',
        tips: [
          'Schedule recurring reports',
          'Export data for external analysis',
          'Create custom dashboards'
        ]
      },
      {
        id: 'coins-management',
        title: 'Coin Management',
        description: 'Configure and manage the rewards system.',
        icon: Coins,
        path: '/dashboard?tab=coins',
        roles: ['admin'],
        duration: '5 min',
        tips: [
          'Set fair coin values for tasks',
          'Monitor coin distribution',
          'Plan redemption options'
        ]
      }
    ]
  }
];

export default function TutorialPage() {
  const isMobile = useIsMobile();
  const { role, isAdmin, isManager, isTeamLead } = useUserRole();
  const [activeTab, setActiveTab] = useState('overview');
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);

  // Filter modules based on user role
  const getVisibleModules = () => {
    return tutorialModules.filter(module => {
      if (module.roles.includes('all')) return true;
      if (module.roles.includes('admin') && isAdmin) return true;
      if (module.roles.includes('manager') && (isManager || isAdmin)) return true;
      if (module.roles.includes('team_lead') && (isTeamLead || isManager || isAdmin)) return true;
      return false;
    });
  };

  // Filter steps based on user role
  const getVisibleSteps = (steps: TutorialStep[]) => {
    return steps.filter(step => {
      if (step.roles.includes('all')) return true;
      if (step.roles.includes('admin') && isAdmin) return true;
      if (step.roles.includes('manager') && (isManager || isAdmin)) return true;
      if (step.roles.includes('team_lead') && (isTeamLead || isManager || isAdmin)) return true;
      return false;
    });
  };

  const visibleModules = getVisibleModules();
  const totalSteps = visibleModules.reduce((acc, module) => acc + getVisibleSteps(module.steps).length, 0);
  const completedCount = completedSteps.length;
  const progressPercent = totalSteps > 0 ? (completedCount / totalSteps) * 100 : 0;

  const toggleStepComplete = (stepId: string) => {
    setCompletedSteps(prev => 
      prev.includes(stepId) 
        ? prev.filter(id => id !== stepId)
        : [...prev, stepId]
    );
  };

  const getRoleBadgeColor = (roles: string[]) => {
    if (roles.includes('admin')) return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    if (roles.includes('manager')) return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
    if (roles.includes('team_lead')) return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-background">
        <AppSidebar activeTab="tutorial" onTabChange={setActiveTab} />
        
        <div className="flex-1 flex flex-col min-w-0">
          <AppHeader />
          
          <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
                    <GraduationCap className="h-8 w-8 text-primary" />
                    Application Tutorial
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Complete guide to mastering all features based on your role
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="text-sm py-1.5 px-3">
                    {role?.replace('_', ' ').toUpperCase() || 'User'}
                  </Badge>
                </div>
              </div>

              {/* Progress Overview */}
              <Card className="border-primary/20">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-full bg-primary/10">
                        <Star className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Your Progress</h3>
                        <p className="text-sm text-muted-foreground">
                          {completedCount} of {totalSteps} steps completed
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-3xl font-bold text-primary">{Math.round(progressPercent)}%</span>
                    </div>
                  </div>
                  <Progress value={progressPercent} className="h-3" />
                </CardContent>
              </Card>

              <Tabs defaultValue="modules" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
                  <TabsTrigger value="modules" className="gap-2">
                    <BookOpen className="h-4 w-4" />
                    <span className="hidden sm:inline">Modules</span>
                  </TabsTrigger>
                  <TabsTrigger value="quick-start" className="gap-2">
                    <Rocket className="h-4 w-4" />
                    <span className="hidden sm:inline">Quick Start</span>
                  </TabsTrigger>
                  <TabsTrigger value="tips" className="gap-2">
                    <Lightbulb className="h-4 w-4" />
                    <span className="hidden sm:inline">Tips</span>
                  </TabsTrigger>
                </TabsList>

                {/* Modules Tab */}
                <TabsContent value="modules" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {visibleModules.map((module) => {
                      const ModuleIcon = module.icon;
                      const moduleSteps = getVisibleSteps(module.steps);
                      const completedModuleSteps = moduleSteps.filter(s => completedSteps.includes(s.id)).length;
                      const moduleProgress = moduleSteps.length > 0 ? (completedModuleSteps / moduleSteps.length) * 100 : 0;

                      return (
                        <Card 
                          key={module.id} 
                          className={cn(
                            "cursor-pointer transition-all hover:shadow-md hover:border-primary/30",
                            selectedModule === module.id && "border-primary ring-1 ring-primary"
                          )}
                          onClick={() => setSelectedModule(selectedModule === module.id ? null : module.id)}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className={cn("p-2 rounded-lg", module.color)}>
                                <ModuleIcon className="h-5 w-5 text-white" />
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {moduleSteps.length} steps
                              </Badge>
                            </div>
                            <CardTitle className="text-lg mt-3">{module.title}</CardTitle>
                            <CardDescription className="text-sm">{module.description}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Progress</span>
                                <span className="font-medium">{Math.round(moduleProgress)}%</span>
                              </div>
                              <Progress value={moduleProgress} className="h-2" />
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  {/* Selected Module Details */}
                  {selectedModule && (
                    <Card className="mt-6">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          {(() => {
                            const module = visibleModules.find(m => m.id === selectedModule);
                            if (!module) return null;
                            const Icon = module.icon;
                            return (
                              <>
                                <Icon className="h-5 w-5 text-primary" />
                                {module.title} - Step by Step
                              </>
                            );
                          })()}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Accordion type="single" collapsible className="space-y-2">
                          {(() => {
                            const module = visibleModules.find(m => m.id === selectedModule);
                            if (!module) return null;
                            return getVisibleSteps(module.steps).map((step, index) => {
                              const StepIcon = step.icon;
                              const isCompleted = completedSteps.includes(step.id);

                              return (
                                <AccordionItem key={step.id} value={step.id} className="border rounded-lg px-4">
                                  <AccordionTrigger className="hover:no-underline py-4">
                                    <div className="flex items-center gap-4 w-full">
                                      <div className={cn(
                                        "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors",
                                        isCompleted 
                                          ? "bg-primary border-primary text-primary-foreground" 
                                          : "border-muted-foreground/30"
                                      )}>
                                        {isCompleted ? (
                                          <CheckCircle2 className="h-5 w-5" />
                                        ) : (
                                          <span className="text-sm font-medium">{index + 1}</span>
                                        )}
                                      </div>
                                      <div className="flex-1 text-left">
                                        <div className="flex items-center gap-2">
                                          <StepIcon className="h-4 w-4 text-muted-foreground" />
                                          <span className="font-medium">{step.title}</span>
                                          <Badge variant="outline" className="text-xs ml-2">
                                            {step.duration}
                                          </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-0.5">{step.description}</p>
                                      </div>
                                    </div>
                                  </AccordionTrigger>
                                  <AccordionContent className="pb-4">
                                    <div className="pl-12 space-y-4">
                                      {step.tips && step.tips.length > 0 && (
                                        <div className="space-y-2">
                                          <h4 className="text-sm font-medium flex items-center gap-2">
                                            <Lightbulb className="h-4 w-4 text-yellow-500" />
                                            Pro Tips
                                          </h4>
                                          <ul className="space-y-1.5">
                                            {step.tips.map((tip, i) => (
                                              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                                <ChevronRight className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                                                {tip}
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                      <div className="flex items-center gap-3 pt-2">
                                        <Button
                                          variant={isCompleted ? "outline" : "default"}
                                          size="sm"
                                          onClick={() => toggleStepComplete(step.id)}
                                        >
                                          {isCompleted ? (
                                            <>
                                              <CheckCircle2 className="h-4 w-4 mr-2" />
                                              Completed
                                            </>
                                          ) : (
                                            <>
                                              <Circle className="h-4 w-4 mr-2" />
                                              Mark Complete
                                            </>
                                          )}
                                        </Button>
                                        <Button variant="ghost" size="sm" asChild>
                                          <a href={step.path}>
                                            <ArrowRight className="h-4 w-4 mr-2" />
                                            Go to Feature
                                          </a>
                                        </Button>
                                      </div>
                                    </div>
                                  </AccordionContent>
                                </AccordionItem>
                              );
                            });
                          })()}
                        </Accordion>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Quick Start Tab */}
                <TabsContent value="quick-start" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Rocket className="h-5 w-5 text-primary" />
                        Quick Start Guide
                      </CardTitle>
                      <CardDescription>
                        Get up and running in 5 minutes with these essential steps
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[
                          { step: 1, title: 'Complete Your Profile', desc: 'Add your photo and details', icon: Settings, path: '/profile' },
                          { step: 2, title: 'View Dashboard', desc: 'Explore your personalized dashboard', icon: LayoutDashboard, path: '/dashboard?tab=overview' },
                          { step: 3, title: 'Check Your Tasks', desc: 'See assigned tasks and deadlines', icon: CheckSquare, path: '/dashboard?tab=tasks' },
                          { step: 4, title: 'Log Time', desc: 'Track your work hours', icon: Clock, path: '/dashboard?tab=time' },
                          { step: 5, title: 'Join Communication', desc: 'Connect with your team', icon: MessageSquare, path: '/dashboard?tab=communication' },
                        ].map((item) => (
                          <div key={item.step} className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold">
                              {item.step}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <item.icon className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{item.title}</span>
                              </div>
                              <p className="text-sm text-muted-foreground">{item.desc}</p>
                            </div>
                            <Button variant="ghost" size="sm" asChild>
                              <a href={item.path}>
                                <ArrowRight className="h-4 w-4" />
                              </a>
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Role-specific quick actions */}
                  {isAdmin && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="h-5 w-5 text-red-500" />
                          Admin Quick Actions
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {[
                            { title: 'Manage Team', path: '/dashboard?tab=interns', icon: Users },
                            { title: 'View Reports', path: '/dashboard?tab=reports', icon: PieChart },
                            { title: 'Approve Requests', path: '/dashboard?tab=approvals', icon: ClipboardCheck },
                            { title: 'Organization Settings', path: '/admin/settings', icon: Settings },
                          ].map((action) => (
                            <Button key={action.title} variant="outline" className="justify-start h-auto py-3" asChild>
                              <a href={action.path}>
                                <action.icon className="h-4 w-4 mr-3" />
                                {action.title}
                              </a>
                            </Button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Tips Tab */}
                <TabsContent value="tips" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Lightbulb className="h-5 w-5 text-yellow-500" />
                          Productivity Tips
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {[
                          'Use keyboard shortcuts for faster navigation',
                          'Set up notification preferences to reduce distractions',
                          'Check dashboard first thing every morning',
                          'Log time as you complete tasks, not at end of day',
                          'Use the Kanban board for visual task management'
                        ].map((tip, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-500 shrink-0" />
                            <span>{tip}</span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Coins className="h-5 w-5 text-yellow-500" />
                          Earning Coins
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {[
                          'Complete tasks on time to earn bonus coins',
                          'Maintain high attendance for streak bonuses',
                          'Participate in training programs',
                          'Give and receive kudos from teammates',
                          'Submit timesheets and expenses on time'
                        ].map((tip, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm">
                            <Star className="h-4 w-4 mt-0.5 text-yellow-500 shrink-0" />
                            <span>{tip}</span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <HelpCircle className="h-5 w-5 text-blue-500" />
                          Getting Help
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {[
                          'Check the App Feedback section for common issues',
                          'Contact your manager for access-related issues',
                          'Use the communication hub for quick questions',
                          'Submit feedback to help improve the platform',
                          'Refer back to this tutorial anytime'
                        ].map((tip, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm">
                            <ChevronRight className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                            <span>{tip}</span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <TrendingUp className="h-5 w-5 text-green-500" />
                          Career Growth
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {[
                          'Set clear personal goals and track progress',
                          'Request regular feedback from peers and managers',
                          'Complete all assigned training courses',
                          'Take on challenging tasks to develop skills',
                          'Participate actively in 1:1 meetings'
                        ].map((tip, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm">
                            <ArrowRight className="h-4 w-4 mt-0.5 text-green-500 shrink-0" />
                            <span>{tip}</span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
        
        {isMobile && <BottomNavigation variant="private" activeTab="tutorial" onTabChange={() => {}} />}
      </div>
    </SidebarProvider>
  );
}
