import React, { useState } from 'react';
import { StandalonePageLayout } from '@/layouts/StandalonePageLayout';
import { useUserRole } from '@/hooks/useUserRole';
import { useOrganization } from '@/hooks/useOrganization';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  LayoutDashboard, CheckSquare, Clock, Coins, Users, BarChart3, FolderOpen, BookOpen,
  Settings, MessageSquare, Shield, CalendarDays, MapPin, Home, Palmtree, Target,
  MessageCircle, UserCheck, AlertTriangle, HeartPulse, Zap, Briefcase, TrendingUp,
  Gauge, Inbox, Wallet, Receipt, FileText, Package, ClipboardCheck, Calendar,
  Banknote, GanttChart, Play, ChevronRight, CheckCircle2, ArrowRight, Lightbulb,
  Star, Rocket, GraduationCap, MousePointer, Eye, Edit, Trash2, Plus, Search,
  Filter, Download, Upload, Bell, User, LogIn, LogOut, RefreshCw, Send,
  ThumbsUp, Award, Gift, DollarSign, PieChart, Activity, Info, HelpCircle,
  Layers, Grid3X3, List, MoreHorizontal, ExternalLink, Copy, Check, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

// Step component for tutorial steps
const TutorialStep = ({ 
  step, 
  title, 
  description, 
  children 
}: { 
  step: number; 
  title: string; 
  description?: string;
  children: React.ReactNode;
}) => (
  <div className="flex gap-4 py-4">
    <div className="flex-shrink-0">
      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
        {step}
      </div>
    </div>
    <div className="flex-1 space-y-2">
      <h4 className="font-semibold text-base">{title}</h4>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
      <div className="mt-3">{children}</div>
    </div>
  </div>
);

// Feature highlight component
const FeatureHighlight = ({
  icon: Icon,
  title,
  description,
  path,
  color = "bg-primary"
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  path?: string;
  color?: string;
}) => {
  const navigate = useNavigate();
  return (
    <div 
      className={cn(
        "p-4 rounded-lg border bg-card hover:shadow-md transition-all cursor-pointer",
        path && "hover:border-primary/50"
      )}
      onClick={() => path && navigate(path)}
    >
      <div className="flex items-start gap-3">
        <div className={cn("p-2 rounded-lg", color)}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-sm">{title}</h4>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </div>
        {path && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
      </div>
    </div>
  );
};

// Action demo component
const ActionDemo = ({
  icon: Icon,
  action,
  result,
  iconColor = "text-primary"
}: {
  icon: React.ElementType;
  action: string;
  result: string;
  iconColor?: string;
}) => (
  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 text-sm">
    <Icon className={cn("h-5 w-5 shrink-0", iconColor)} />
    <div className="flex-1">
      <span className="font-medium">{action}</span>
      <span className="text-muted-foreground"> → {result}</span>
    </div>
  </div>
);

// Keyboard shortcut component
const KeyboardShortcut = ({ keys, action }: { keys: string[]; action: string }) => (
  <div className="flex items-center justify-between py-2">
    <span className="text-sm text-muted-foreground">{action}</span>
    <div className="flex gap-1">
      {keys.map((key, i) => (
        <React.Fragment key={i}>
          <kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded border">
            {key}
          </kbd>
          {i < keys.length - 1 && <span className="text-muted-foreground">+</span>}
        </React.Fragment>
      ))}
    </div>
  </div>
);

export default function TutorialPage() {
  const { role, isAdmin, isManager, isTeamLead } = useUserRole();
  const { organization } = useOrganization();
  const [activeTab, setActiveTab] = useState('getting-started');
  const navigate = useNavigate();
  
  const coinName = organization?.coin_name || 'Coins';

  return (
    <StandalonePageLayout 
      activeTab="tutorial"
      contentClassName="p-4 md:p-6 lg:p-8"
      useContainer={false}
    >
        
      <div className="max-w-5xl mx-auto space-y-6">
              {/* Header */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <GraduationCap className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                      Complete Application Guide
                    </h1>
                    <p className="text-muted-foreground">
                      Learn how to use every feature of {organization?.name || 'Tenexa'} effectively
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  <Badge variant="outline" className="text-xs">
                    <User className="h-3 w-3 mr-1" />
                    {role?.replace('_', ' ').toUpperCase() || 'User'}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    <BookOpen className="h-3 w-3 mr-1" />
                    Interactive Guide
                  </Badge>
                </div>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <ScrollArea className="w-full">
                  <TabsList className="inline-flex w-auto h-auto p-1 gap-1 flex-wrap">
                    <TabsTrigger value="getting-started" className="gap-1.5 text-xs sm:text-sm">
                      <Rocket className="h-4 w-4" />
                      <span className="hidden sm:inline">Getting Started</span>
                      <span className="sm:hidden">Start</span>
                    </TabsTrigger>
                    <TabsTrigger value="dashboard" className="gap-1.5 text-xs sm:text-sm">
                      <LayoutDashboard className="h-4 w-4" />
                      <span className="hidden sm:inline">Dashboard</span>
                      <span className="sm:hidden">Dash</span>
                    </TabsTrigger>
                    <TabsTrigger value="tasks" className="gap-1.5 text-xs sm:text-sm">
                      <CheckSquare className="h-4 w-4" />
                      Tasks
                    </TabsTrigger>
                    <TabsTrigger value="time-attendance" className="gap-1.5 text-xs sm:text-sm">
                      <Clock className="h-4 w-4" />
                      <span className="hidden sm:inline">Time & Attendance</span>
                      <span className="sm:hidden">Time</span>
                    </TabsTrigger>
                    <TabsTrigger value="communication" className="gap-1.5 text-xs sm:text-sm">
                      <MessageSquare className="h-4 w-4" />
                      <span className="hidden sm:inline">Communication</span>
                      <span className="sm:hidden">Chat</span>
                    </TabsTrigger>
                    <TabsTrigger value="coins" className="gap-1.5 text-xs sm:text-sm">
                      <Coins className="h-4 w-4" />
                      {coinName}
                    </TabsTrigger>
                    {isAdmin && (
                      <TabsTrigger value="admin" className="gap-1.5 text-xs sm:text-sm">
                        <Shield className="h-4 w-4" />
                        Admin
                      </TabsTrigger>
                    )}
                  </TabsList>
                </ScrollArea>

                {/* Getting Started Tab */}
                <TabsContent value="getting-started" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Rocket className="h-5 w-5 text-primary" />
                        Welcome to {organization?.name || 'Tenexa'}
                      </CardTitle>
                      <CardDescription>
                        Your complete workforce management and productivity platform. Follow this guide to get started.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* What is this app */}
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          <Info className="h-5 w-5 text-blue-500" />
                          What is this application?
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                          This is an all-in-one platform designed to streamline your work experience. Whether you're 
                          tracking tasks, logging time, managing projects, or collaborating with your team - everything 
                          you need is in one place. The platform also includes a gamification system where you earn 
                          <span className="font-medium text-yellow-600"> {coinName} </span> for completing tasks, 
                          maintaining good attendance, and achieving goals.
                        </p>
                      </div>

                      <Separator />

                      {/* First Steps */}
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          <Play className="h-5 w-5 text-green-500" />
                          Your First Steps
                        </h3>

                        <TutorialStep 
                          step={1} 
                          title="Complete Your Profile"
                          description="Add your photo, contact details, and skills to help your team recognize you."
                        >
                          <div className="space-y-3">
                            <div className="grid gap-2 sm:grid-cols-2">
                              <ActionDemo icon={User} action="Click your avatar" result="Open profile menu" />
                              <ActionDemo icon={Edit} action="Click 'Edit Profile'" result="Open edit form" />
                            </div>
                            <Button size="sm" onClick={() => navigate('/profile')}>
                              Go to Profile <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                          </div>
                        </TutorialStep>

                        <TutorialStep 
                          step={2} 
                          title="Explore the Dashboard"
                          description="The dashboard shows your tasks, time logs, notifications, and key metrics at a glance."
                        >
                          <div className="grid gap-3 sm:grid-cols-3">
                            <FeatureHighlight 
                              icon={LayoutDashboard} 
                              title="Overview" 
                              description="See all your key metrics"
                              path="/dashboard?tab=overview"
                              color="bg-blue-500"
                            />
                            <FeatureHighlight 
                              icon={CheckSquare} 
                              title="Kanban Board" 
                              description="Visual task management"
                              path="/dashboard?tab=tasks"
                              color="bg-green-500"
                            />
                            <FeatureHighlight 
                              icon={Clock} 
                              title="Time Logs" 
                              description="Track your work hours"
                              path="/dashboard?tab=time"
                              color="bg-purple-500"
                            />
                          </div>
                        </TutorialStep>

                        <TutorialStep 
                          step={3} 
                          title="Check Your Assigned Tasks"
                          description="View tasks assigned to you, their priorities, due dates, and coin rewards."
                        >
                          <Alert>
                            <Lightbulb className="h-4 w-4" />
                            <AlertTitle>Pro Tip</AlertTitle>
                            <AlertDescription>
                              Tasks with higher priority usually have more {coinName} attached. Complete them on time 
                              to maximize your earnings!
                            </AlertDescription>
                          </Alert>
                        </TutorialStep>

                        <TutorialStep 
                          step={4} 
                          title="Clock In/Out"
                          description="Track your daily attendance by clocking in when you start work."
                        >
                          <div className="space-y-3">
                            <ActionDemo icon={LogIn} action="Click 'Clock In'" result="Start tracking your work day" iconColor="text-green-500" />
                            <ActionDemo icon={LogOut} action="Click 'Clock Out'" result="End your work session" iconColor="text-red-500" />
                            <p className="text-xs text-muted-foreground">
                              Your location may be recorded if geo-fencing is enabled for your organization.
                            </p>
                          </div>
                        </TutorialStep>
                      </div>

                      <Separator />

                      {/* Navigation Guide */}
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          <Layers className="h-5 w-5 text-indigo-500" />
                          How to Navigate
                        </h3>
                        <div className="grid gap-4 md:grid-cols-2">
                          <Card className="border-dashed">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-sm font-medium">Sidebar Navigation</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm text-muted-foreground">
                              <p>• Use the left sidebar to access different sections</p>
                              <p>• Click group headers to expand/collapse sections</p>
                              <p>• Your current section is highlighted</p>
                              <p>• On mobile, tap the menu icon to open sidebar</p>
                            </CardContent>
                          </Card>
                          <Card className="border-dashed">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-sm font-medium">Top Header</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm text-muted-foreground">
                              <p>• <Bell className="h-3 w-3 inline" /> Notifications - View alerts and updates</p>
                              <p>• <Search className="h-3 w-3 inline" /> Search - Find anything quickly</p>
                              <p>• <User className="h-3 w-3 inline" /> Profile - Access your settings</p>
                              <p>• Theme toggle for dark/light mode</p>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Role-based features */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        Features Available to You
                      </CardTitle>
                      <CardDescription>
                        Based on your role: <Badge variant="outline">{role?.replace('_', ' ') || 'User'}</Badge>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        <FeatureHighlight icon={CheckSquare} title="Task Management" description="View and update your tasks" path="/dashboard?tab=tasks" color="bg-green-500" />
                        <FeatureHighlight icon={Clock} title="Time Tracking" description="Log hours spent on work" path="/dashboard?tab=time" color="bg-blue-500" />
                        <FeatureHighlight icon={MapPin} title="Attendance" description="Clock in/out daily" path="/dashboard?tab=attendance" color="bg-purple-500" />
                        <FeatureHighlight icon={Palmtree} title="Leave Requests" description="Apply for time off" path="/dashboard?tab=leave" color="bg-teal-500" />
                        <FeatureHighlight icon={MessageSquare} title="Communication" description="Chat with your team" path="/dashboard?tab=communication" color="bg-pink-500" />
                        <FeatureHighlight icon={Coins} title={`My ${coinName}`} description="View your rewards" path="/dashboard?tab=my-coins" color="bg-yellow-500" />
                        <FeatureHighlight icon={HeartPulse} title="Kudos Wall" description="Recognize teammates" path="/kudos" color="bg-red-500" />
                        <FeatureHighlight icon={Target} title="My Goals" description="Personal goal tracking" path="/my-goals" color="bg-indigo-500" />
                        <FeatureHighlight icon={BookOpen} title="Training" description="Access learning materials" path="/training" color="bg-orange-500" />
                        
                        {isAdmin && (
                          <>
                            <FeatureHighlight icon={Users} title="Team Management" description="Manage employees" path="/dashboard?tab=interns" color="bg-slate-500" />
                            <FeatureHighlight icon={PieChart} title="Reports" description="Generate analytics" path="/dashboard?tab=reports" color="bg-cyan-500" />
                            <FeatureHighlight icon={Zap} title="Automation" description="Create workflow rules" path="/dashboard?tab=automation" color="bg-amber-500" />
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Dashboard Tab */}
                <TabsContent value="dashboard" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <LayoutDashboard className="h-5 w-5 text-primary" />
                        Understanding Your Dashboard
                      </CardTitle>
                      <CardDescription>
                        The dashboard is your central hub for all work activities and information.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Dashboard Overview */}
                      <div className="space-y-4">
                        <h3 className="font-semibold">Dashboard Sections Explained</h3>
                        
                        <Accordion type="single" collapsible className="space-y-2">
                          <AccordionItem value="overview" className="border rounded-lg px-4">
                            <AccordionTrigger className="hover:no-underline">
                              <div className="flex items-center gap-3">
                                <LayoutDashboard className="h-5 w-5 text-blue-500" />
                                <span>Overview Tab</span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="space-y-4 pt-2">
                              <p className="text-muted-foreground">
                                The Overview shows your key metrics and quick stats at a glance:
                              </p>
                              <div className="grid gap-3 sm:grid-cols-2">
                                <div className="p-3 rounded-lg bg-muted/50">
                                  <h4 className="font-medium text-sm flex items-center gap-2">
                                    <CheckSquare className="h-4 w-4 text-green-500" />
                                    Task Summary
                                  </h4>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    See pending, in-progress, and completed tasks
                                  </p>
                                </div>
                                <div className="p-3 rounded-lg bg-muted/50">
                                  <h4 className="font-medium text-sm flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-blue-500" />
                                    Time Today
                                  </h4>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Hours logged today and this week
                                  </p>
                                </div>
                                <div className="p-3 rounded-lg bg-muted/50">
                                  <h4 className="font-medium text-sm flex items-center gap-2">
                                    <Coins className="h-4 w-4 text-yellow-500" />
                                    {coinName} Earned
                                  </h4>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Your total {coinName} and recent earnings
                                  </p>
                                </div>
                                <div className="p-3 rounded-lg bg-muted/50">
                                  <h4 className="font-medium text-sm flex items-center gap-2">
                                    <Activity className="h-4 w-4 text-purple-500" />
                                    Recent Activity
                                  </h4>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Latest updates and notifications
                                  </p>
                                </div>
                              </div>
                              <Button size="sm" variant="outline" onClick={() => navigate('/dashboard?tab=overview')}>
                                Go to Overview <ArrowRight className="h-4 w-4 ml-2" />
                              </Button>
                            </AccordionContent>
                          </AccordionItem>

                          <AccordionItem value="projects" className="border rounded-lg px-4">
                            <AccordionTrigger className="hover:no-underline">
                              <div className="flex items-center gap-3">
                                <FolderOpen className="h-5 w-5 text-purple-500" />
                                <span>Projects Tab</span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="space-y-4 pt-2">
                              <p className="text-muted-foreground">
                                View all projects you're involved in, track progress, and see deadlines.
                              </p>
                              <div className="space-y-2">
                                <ActionDemo icon={Eye} action="View Project" result="See full project details, tasks, and team" />
                                <ActionDemo icon={BarChart3} action="Project Progress" result="Visual progress bar and completion %" />
                                <ActionDemo icon={Calendar} action="Timeline View" result="See project milestones and deadlines" />
                              </div>
                              <Button size="sm" variant="outline" onClick={() => navigate('/dashboard?tab=projects')}>
                                Go to Projects <ArrowRight className="h-4 w-4 ml-2" />
                              </Button>
                            </AccordionContent>
                          </AccordionItem>

                          <AccordionItem value="updates" className="border rounded-lg px-4">
                            <AccordionTrigger className="hover:no-underline">
                              <div className="flex items-center gap-3">
                                <Activity className="h-5 w-5 text-green-500" />
                                <span>Updates Tab</span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="space-y-4 pt-2">
                              <p className="text-muted-foreground">
                                Stay informed with project updates, announcements, and team activities.
                              </p>
                              <div className="space-y-2">
                                <ActionDemo icon={Send} action="Post Update" result="Share progress with your team" />
                                <ActionDemo icon={ThumbsUp} action="React to Updates" result="Like and comment on posts" />
                                <ActionDemo icon={Filter} action="Filter Updates" result="View by project or team" />
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </div>

                      <Separator />

                      {/* Quick Actions */}
                      <div className="space-y-4">
                        <h3 className="font-semibold">Quick Actions from Dashboard</h3>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="p-4 rounded-lg border bg-gradient-to-r from-green-500/10 to-transparent">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-green-500">
                                <Plus className="h-4 w-4 text-white" />
                              </div>
                              <div>
                                <h4 className="font-medium text-sm">Create New Task</h4>
                                <p className="text-xs text-muted-foreground">Click + button or use keyboard shortcut</p>
                              </div>
                            </div>
                          </div>
                          <div className="p-4 rounded-lg border bg-gradient-to-r from-blue-500/10 to-transparent">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-blue-500">
                                <Clock className="h-4 w-4 text-white" />
                              </div>
                              <div>
                                <h4 className="font-medium text-sm">Log Time</h4>
                                <p className="text-xs text-muted-foreground">Record work hours against tasks</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Tasks Tab */}
                <TabsContent value="tasks" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckSquare className="h-5 w-5 text-primary" />
                        Task Management Guide
                      </CardTitle>
                      <CardDescription>
                        Learn how to efficiently manage your tasks using the Kanban board and task system.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Kanban Board Explanation */}
                      <div className="space-y-4">
                        <h3 className="font-semibold flex items-center gap-2">
                          <Grid3X3 className="h-5 w-5 text-indigo-500" />
                          The Kanban Board
                        </h3>
                        <p className="text-muted-foreground">
                          The Kanban board provides a visual way to manage your tasks. Tasks are organized into columns 
                          based on their status.
                        </p>
                        
                        <div className="grid grid-cols-4 gap-2 p-4 rounded-lg bg-muted/30">
                          <div className="p-3 rounded-lg bg-slate-200 dark:bg-slate-700 text-center">
                            <div className="w-4 h-4 mx-auto mb-2 rounded-full bg-slate-400" />
                            <span className="text-xs font-medium">To Do</span>
                          </div>
                          <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-center">
                            <div className="w-4 h-4 mx-auto mb-2 rounded-full bg-blue-500" />
                            <span className="text-xs font-medium">In Progress</span>
                          </div>
                          <div className="p-3 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-center">
                            <div className="w-4 h-4 mx-auto mb-2 rounded-full bg-amber-500" />
                            <span className="text-xs font-medium">Review</span>
                          </div>
                          <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30 text-center">
                            <div className="w-4 h-4 mx-auto mb-2 rounded-full bg-green-500" />
                            <span className="text-xs font-medium">Done</span>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* How to use tasks */}
                      <div className="space-y-4">
                        <h3 className="font-semibold">How to Work with Tasks</h3>

                        <TutorialStep step={1} title="Viewing Task Details">
                          <div className="space-y-2">
                            <ActionDemo icon={MousePointer} action="Click on any task card" result="Opens task detail panel" />
                            <p className="text-sm text-muted-foreground">
                              You'll see the full description, due date, priority, assigned {coinName}, attachments, 
                              and comments.
                            </p>
                          </div>
                        </TutorialStep>

                        <TutorialStep step={2} title="Moving Tasks (Updating Status)">
                          <div className="space-y-2">
                            <ActionDemo icon={MousePointer} action="Drag and drop task card" result="Moves to new column" />
                            <Alert className="mt-3">
                              <Info className="h-4 w-4" />
                              <AlertDescription>
                                <strong>Example:</strong> When you start working on a task, drag it from "To Do" to 
                                "In Progress". When finished, drag to "Review" or "Done".
                              </AlertDescription>
                            </Alert>
                          </div>
                        </TutorialStep>

                        <TutorialStep step={3} title="Logging Time Against Tasks">
                          <div className="space-y-2">
                            <ActionDemo icon={Clock} action="Click clock icon on task" result="Opens time log dialog" />
                            <ActionDemo icon={Edit} action="Enter hours worked" result="Time recorded against task" />
                            <p className="text-sm text-muted-foreground">
                              Always log time after completing work. This helps track project progress and your productivity.
                            </p>
                          </div>
                        </TutorialStep>

                        <TutorialStep step={4} title="Task Completion & Verification">
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                              When you mark a task as "Done":
                            </p>
                            <div className="space-y-2 mt-2">
                              <ActionDemo icon={CheckCircle2} action="Move to Done column" result="Task marked complete" iconColor="text-green-500" />
                              <ActionDemo icon={UserCheck} action="Manager verifies" result="Task approved" iconColor="text-blue-500" />
                              <ActionDemo icon={Coins} action="Verification approved" result={`${coinName} credited to your account!`} iconColor="text-yellow-500" />
                            </div>
                          </div>
                        </TutorialStep>
                      </div>

                      <Separator />

                      {/* Task Filters */}
                      <div className="space-y-4">
                        <h3 className="font-semibold flex items-center gap-2">
                          <Filter className="h-5 w-5 text-purple-500" />
                          Filtering & Searching Tasks
                        </h3>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="p-3 rounded-lg border">
                            <h4 className="font-medium text-sm mb-2">Filter by Status</h4>
                            <p className="text-xs text-muted-foreground">Show only tasks in specific columns</p>
                          </div>
                          <div className="p-3 rounded-lg border">
                            <h4 className="font-medium text-sm mb-2">Filter by Priority</h4>
                            <p className="text-xs text-muted-foreground">High, Medium, Low priority tasks</p>
                          </div>
                          <div className="p-3 rounded-lg border">
                            <h4 className="font-medium text-sm mb-2">Filter by Project</h4>
                            <p className="text-xs text-muted-foreground">See tasks for specific projects</p>
                          </div>
                          <div className="p-3 rounded-lg border">
                            <h4 className="font-medium text-sm mb-2">Search by Name</h4>
                            <p className="text-xs text-muted-foreground">Type to find specific tasks</p>
                          </div>
                        </div>
                      </div>

                      <Button onClick={() => navigate('/dashboard?tab=tasks')}>
                        Open Kanban Board <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Time & Attendance Tab */}
                <TabsContent value="time-attendance" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-primary" />
                        Time & Attendance Guide
                      </CardTitle>
                      <CardDescription>
                        Track your work hours, attendance, leave, and work from home requests.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Attendance */}
                      <div className="space-y-4">
                        <h3 className="font-semibold flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-green-500" />
                          Daily Attendance
                        </h3>
                        
                        <div className="p-4 rounded-lg border bg-gradient-to-r from-green-500/10 via-transparent to-red-500/10">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-4 rounded-lg bg-green-500/20">
                              <LogIn className="h-8 w-8 mx-auto text-green-600 mb-2" />
                              <h4 className="font-semibold">Clock In</h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                Start of your work day
                              </p>
                            </div>
                            <div className="text-center p-4 rounded-lg bg-red-500/20">
                              <LogOut className="h-8 w-8 mx-auto text-red-600 mb-2" />
                              <h4 className="font-semibold">Clock Out</h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                End of your work day
                              </p>
                            </div>
                          </div>
                        </div>

                        <Alert>
                          <MapPin className="h-4 w-4" />
                          <AlertTitle>Location Tracking</AlertTitle>
                          <AlertDescription>
                            If geo-fencing is enabled, your location is recorded when clocking in/out. 
                            This helps verify you're at an approved work location.
                          </AlertDescription>
                        </Alert>
                      </div>

                      <Separator />

                      {/* Time Logging */}
                      <div className="space-y-4">
                        <h3 className="font-semibold flex items-center gap-2">
                          <Clock className="h-5 w-5 text-blue-500" />
                          Time Logging
                        </h3>
                        <p className="text-muted-foreground">
                          Log time spent on specific tasks to track productivity and project progress.
                        </p>

                        <TutorialStep step={1} title="How to Log Time">
                          <div className="space-y-2">
                            <ActionDemo icon={Clock} action="Go to Time Logs tab" result="View time log interface" />
                            <ActionDemo icon={Plus} action="Click 'Log Time'" result="Opens time entry form" />
                            <ActionDemo icon={CheckSquare} action="Select task" result="Associate time with task" />
                            <ActionDemo icon={Edit} action="Enter duration & notes" result="Save your time entry" />
                          </div>
                        </TutorialStep>

                        <div className="p-4 rounded-lg bg-muted/50">
                          <h4 className="font-medium text-sm mb-3">Time Log Entry Fields:</h4>
                          <div className="grid gap-2 sm:grid-cols-2 text-sm">
                            <div className="flex items-center gap-2">
                              <CheckSquare className="h-4 w-4 text-green-500" />
                              <span>Task (required)</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-blue-500" />
                              <span>Duration in hours</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-purple-500" />
                              <span>Date worked</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Edit className="h-4 w-4 text-orange-500" />
                              <span>Description/Notes</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Leave Requests */}
                      <div className="space-y-4">
                        <h3 className="font-semibold flex items-center gap-2">
                          <Palmtree className="h-5 w-5 text-teal-500" />
                          Leave Requests
                        </h3>
                        
                        <TutorialStep step={1} title="Applying for Leave">
                          <div className="space-y-3">
                            <ActionDemo icon={Palmtree} action="Go to Leave tab" result="View leave dashboard" />
                            <ActionDemo icon={Plus} action="Click 'Request Leave'" result="Opens leave form" />
                            
                            <div className="p-4 rounded-lg bg-muted/50 mt-3">
                              <h4 className="font-medium text-sm mb-2">Leave Types:</h4>
                              <div className="grid gap-2 sm:grid-cols-2 text-sm text-muted-foreground">
                                <span>• Sick Leave</span>
                                <span>• Casual Leave</span>
                                <span>• Annual Leave</span>
                                <span>• Emergency Leave</span>
                                <span>• Maternity/Paternity</span>
                                <span>• Unpaid Leave</span>
                              </div>
                            </div>
                          </div>
                        </TutorialStep>
                      </div>

                      <Separator />

                      {/* WFH */}
                      <div className="space-y-4">
                        <h3 className="font-semibold flex items-center gap-2">
                          <Home className="h-5 w-5 text-indigo-500" />
                          Work From Home (WFH)
                        </h3>
                        <p className="text-muted-foreground">
                          Request to work remotely on specific days.
                        </p>
                        <div className="space-y-2">
                          <ActionDemo icon={Home} action="Go to WFH tab" result="View WFH requests" />
                          <ActionDemo icon={Plus} action="New WFH Request" result="Select dates and reason" />
                          <ActionDemo icon={Send} action="Submit for approval" result="Manager notified" />
                        </div>
                      </div>

                      <div className="flex gap-3 flex-wrap">
                        <Button variant="outline" onClick={() => navigate('/dashboard?tab=attendance')}>
                          <MapPin className="h-4 w-4 mr-2" /> Attendance
                        </Button>
                        <Button variant="outline" onClick={() => navigate('/dashboard?tab=leave')}>
                          <Palmtree className="h-4 w-4 mr-2" /> Leave
                        </Button>
                        <Button variant="outline" onClick={() => navigate('/dashboard?tab=wfh')}>
                          <Home className="h-4 w-4 mr-2" /> WFH
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Communication Tab */}
                <TabsContent value="communication" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-primary" />
                        Communication Guide
                      </CardTitle>
                      <CardDescription>
                        Stay connected with your team through channels, direct messages, and kudos.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Communication Hub */}
                      <div className="space-y-4">
                        <h3 className="font-semibold flex items-center gap-2">
                          <MessageSquare className="h-5 w-5 text-blue-500" />
                          Team Communication
                        </h3>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="p-4 rounded-lg border">
                            <h4 className="font-medium flex items-center gap-2 mb-2">
                              <Users className="h-4 w-4 text-green-500" />
                              Channels
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                              Group conversations organized by team, project, or topic.
                            </p>
                            <div className="space-y-2 text-sm">
                              <ActionDemo icon={Plus} action="Join a channel" result="Access group chat" />
                              <ActionDemo icon={Send} action="Send message" result="Visible to all members" />
                            </div>
                          </div>
                          
                          <div className="p-4 rounded-lg border">
                            <h4 className="font-medium flex items-center gap-2 mb-2">
                              <User className="h-4 w-4 text-purple-500" />
                              Direct Messages
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                              Private one-on-one conversations with teammates.
                            </p>
                            <div className="space-y-2 text-sm">
                              <ActionDemo icon={Search} action="Search for user" result="Open DM chat" />
                              <ActionDemo icon={Send} action="Send private message" result="Only you both can see" />
                            </div>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Kudos Wall */}
                      <div className="space-y-4">
                        <h3 className="font-semibold flex items-center gap-2">
                          <HeartPulse className="h-5 w-5 text-red-500" />
                          Kudos Wall - Recognize Your Team
                        </h3>
                        <p className="text-muted-foreground">
                          The Kudos Wall is where you publicly recognize and celebrate team achievements.
                        </p>

                        <TutorialStep step={1} title="Giving Kudos">
                          <div className="space-y-3">
                            <ActionDemo icon={HeartPulse} action="Go to Kudos Wall" result="View recent kudos" />
                            <ActionDemo icon={Plus} action="Click 'Give Kudos'" result="Opens kudos form" />
                            <ActionDemo icon={User} action="Select recipient" result="Choose team member" />
                            <ActionDemo icon={Edit} action="Write your message" result="Describe their achievement" />
                            <ActionDemo icon={Award} action="Choose badge/category" result="Teamwork, Innovation, etc." />
                            <ActionDemo icon={Send} action="Submit" result="Kudos posted publicly!" />
                          </div>
                        </TutorialStep>

                        <Alert className="border-yellow-500/50 bg-yellow-500/10">
                          <Award className="h-4 w-4 text-yellow-500" />
                          <AlertTitle>Kudos = {coinName}!</AlertTitle>
                          <AlertDescription>
                            Both the giver and receiver may earn {coinName} when kudos are given. 
                            Spread positivity and grow together!
                          </AlertDescription>
                        </Alert>

                        <Button onClick={() => navigate('/kudos')}>
                          <HeartPulse className="h-4 w-4 mr-2" /> Go to Kudos Wall
                        </Button>
                      </div>

                      <Separator />

                      {/* Pulse Surveys */}
                      <div className="space-y-4">
                        <h3 className="font-semibold flex items-center gap-2">
                          <MessageCircle className="h-5 w-5 text-pink-500" />
                          Pulse Surveys
                        </h3>
                        <p className="text-muted-foreground">
                          Quick surveys to share your feedback and help improve the workplace.
                        </p>
                        <div className="space-y-2">
                          <ActionDemo icon={MessageCircle} action="View active survey" result="See survey questions" />
                          <ActionDemo icon={ThumbsUp} action="Rate items 1-5" result="Submit your feedback" />
                          <ActionDemo icon={Edit} action="Add comments" result="Share detailed thoughts" />
                        </div>

                        <Button variant="outline" onClick={() => navigate('/pulse-surveys')}>
                          <MessageCircle className="h-4 w-4 mr-2" /> View Pulse Surveys
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Coins Tab */}
                <TabsContent value="coins" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Coins className="h-5 w-5 text-yellow-500" />
                        {coinName} Rewards System
                      </CardTitle>
                      <CardDescription>
                        Understand how to earn and use {coinName} in your organization.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* What are coins */}
                      <div className="space-y-4">
                        <h3 className="font-semibold flex items-center gap-2">
                          <HelpCircle className="h-5 w-5 text-blue-500" />
                          What are {coinName}?
                        </h3>
                        <p className="text-muted-foreground">
                          {coinName} are virtual rewards you earn by being productive, completing tasks, 
                          maintaining good attendance, and contributing positively to your team. They represent 
                          your achievements and can potentially be redeemed for rewards.
                        </p>
                      </div>

                      <Separator />

                      {/* How to earn */}
                      <div className="space-y-4">
                        <h3 className="font-semibold flex items-center gap-2">
                          <Star className="h-5 w-5 text-yellow-500" />
                          How to Earn {coinName}
                        </h3>
                        
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="p-4 rounded-lg border bg-gradient-to-r from-green-500/10 to-transparent">
                            <div className="flex items-start gap-3">
                              <CheckSquare className="h-5 w-5 text-green-500 mt-1" />
                              <div>
                                <h4 className="font-medium">Complete Tasks</h4>
                                <p className="text-sm text-muted-foreground">
                                  Each task has {coinName} attached. Complete and get verified to earn.
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="p-4 rounded-lg border bg-gradient-to-r from-blue-500/10 to-transparent">
                            <div className="flex items-start gap-3">
                              <MapPin className="h-5 w-5 text-blue-500 mt-1" />
                              <div>
                                <h4 className="font-medium">Perfect Attendance</h4>
                                <p className="text-sm text-muted-foreground">
                                  Maintain attendance streaks for bonus {coinName}.
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="p-4 rounded-lg border bg-gradient-to-r from-red-500/10 to-transparent">
                            <div className="flex items-start gap-3">
                              <HeartPulse className="h-5 w-5 text-red-500 mt-1" />
                              <div>
                                <h4 className="font-medium">Give & Receive Kudos</h4>
                                <p className="text-sm text-muted-foreground">
                                  Recognition rewards both parties with {coinName}.
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="p-4 rounded-lg border bg-gradient-to-r from-purple-500/10 to-transparent">
                            <div className="flex items-start gap-3">
                              <BookOpen className="h-5 w-5 text-purple-500 mt-1" />
                              <div>
                                <h4 className="font-medium">Complete Training</h4>
                                <p className="text-sm text-muted-foreground">
                                  Finish courses and pass assessments.
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="p-4 rounded-lg border bg-gradient-to-r from-orange-500/10 to-transparent">
                            <div className="flex items-start gap-3">
                              <Target className="h-5 w-5 text-orange-500 mt-1" />
                              <div>
                                <h4 className="font-medium">Achieve Goals</h4>
                                <p className="text-sm text-muted-foreground">
                                  Hit personal and team objectives.
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="p-4 rounded-lg border bg-gradient-to-r from-teal-500/10 to-transparent">
                            <div className="flex items-start gap-3">
                              <Clock className="h-5 w-5 text-teal-500 mt-1" />
                              <div>
                                <h4 className="font-medium">On-Time Submissions</h4>
                                <p className="text-sm text-muted-foreground">
                                  Submit timesheets and expenses promptly.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Task coins flow */}
                      <div className="space-y-4">
                        <h3 className="font-semibold">Task to {coinName} Flow</h3>
                        
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-4 rounded-lg bg-muted/30">
                          <div className="flex-1 p-3 rounded-lg bg-card text-center">
                            <CheckSquare className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                            <span className="text-xs font-medium">Task Assigned</span>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground hidden sm:block" />
                          <div className="flex-1 p-3 rounded-lg bg-card text-center">
                            <Activity className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                            <span className="text-xs font-medium">Work on Task</span>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground hidden sm:block" />
                          <div className="flex-1 p-3 rounded-lg bg-card text-center">
                            <Check className="h-6 w-6 mx-auto mb-2 text-green-500" />
                            <span className="text-xs font-medium">Mark Done</span>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground hidden sm:block" />
                          <div className="flex-1 p-3 rounded-lg bg-card text-center">
                            <UserCheck className="h-6 w-6 mx-auto mb-2 text-indigo-500" />
                            <span className="text-xs font-medium">Verified</span>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground hidden sm:block" />
                          <div className="flex-1 p-3 rounded-lg bg-yellow-500/20 text-center">
                            <Coins className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
                            <span className="text-xs font-medium">{coinName} Earned!</span>
                          </div>
                        </div>
                      </div>

                      <Button onClick={() => navigate('/dashboard?tab=my-coins')}>
                        <Coins className="h-4 w-4 mr-2" /> View My {coinName}
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Admin Tab */}
                {isAdmin && (
                  <TabsContent value="admin" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="h-5 w-5 text-red-500" />
                          Admin Features Guide
                        </CardTitle>
                        <CardDescription>
                          Advanced features available to administrators and managers.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Team Management */}
                        <div className="space-y-4">
                          <h3 className="font-semibold flex items-center gap-2">
                            <Users className="h-5 w-5 text-blue-500" />
                            Team Management
                          </h3>
                          
                          <div className="space-y-3">
                            <ActionDemo icon={Users} action="Employees Tab" result="View all team members" />
                            <ActionDemo icon={Plus} action="Add Employee" result="Create new user account" />
                            <ActionDemo icon={Edit} action="Edit Profile" result="Update user details and role" />
                            <ActionDemo icon={UserCheck} action="Verify Tasks" result="Approve completed work" />
                          </div>
                        </div>

                        <Separator />

                        {/* Task Creation */}
                        <div className="space-y-4">
                          <h3 className="font-semibold flex items-center gap-2">
                            <CheckSquare className="h-5 w-5 text-green-500" />
                            Creating & Assigning Tasks
                          </h3>
                          
                          <TutorialStep step={1} title="Create a New Task">
                            <div className="space-y-3">
                              <ActionDemo icon={Plus} action="Click '+' button" result="Open task creation form" />
                              <div className="p-4 rounded-lg bg-muted/50">
                                <h4 className="font-medium text-sm mb-2">Task Fields:</h4>
                                <div className="grid gap-2 sm:grid-cols-2 text-sm text-muted-foreground">
                                  <span>• Title (required)</span>
                                  <span>• Description</span>
                                  <span>• Assignee</span>
                                  <span>• Project</span>
                                  <span>• Priority (Low/Medium/High)</span>
                                  <span>• Due Date</span>
                                  <span>• {coinName} Reward</span>
                                  <span>• Attachments</span>
                                </div>
                              </div>
                            </div>
                          </TutorialStep>
                        </div>

                        <Separator />

                        {/* Reports & Analytics */}
                        <div className="space-y-4">
                          <h3 className="font-semibold flex items-center gap-2">
                            <PieChart className="h-5 w-5 text-purple-500" />
                            Reports & Analytics
                          </h3>
                          
                          <div className="grid gap-3 sm:grid-cols-2">
                            <FeatureHighlight 
                              icon={BarChart3} 
                              title="Team Analytics" 
                              description="Performance metrics and trends"
                              path="/dashboard?tab=analytics"
                              color="bg-blue-500"
                            />
                            <FeatureHighlight 
                              icon={PieChart} 
                              title="Custom Reports" 
                              description="Build and schedule reports"
                              path="/dashboard?tab=reports"
                              color="bg-purple-500"
                            />
                            <FeatureHighlight 
                              icon={Activity} 
                              title="Work Health" 
                              description="Team wellness metrics"
                              path="/dashboard?tab=work-health"
                              color="bg-green-500"
                            />
                            <FeatureHighlight 
                              icon={ClipboardCheck} 
                              title="Audit Logs" 
                              description="Track all system activities"
                              path="/dashboard?tab=audit"
                              color="bg-orange-500"
                            />
                          </div>
                        </div>

                        <Separator />

                        {/* Other Admin Features */}
                        <div className="space-y-4">
                          <h3 className="font-semibold">Other Admin Tools</h3>
                          
                          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            <FeatureHighlight 
                              icon={Zap} 
                              title="Automation" 
                              description="Create workflow rules"
                              path="/dashboard?tab=automation"
                              color="bg-yellow-500"
                            />
                            <FeatureHighlight 
                              icon={Shield} 
                              title="Roles & Permissions" 
                              description="Manage access levels"
                              path="/dashboard?tab=roles"
                              color="bg-red-500"
                            />
                            <FeatureHighlight 
                              icon={Wallet} 
                              title="Payroll" 
                              description="Process salaries"
                              path="/dashboard?tab=payroll"
                              color="bg-emerald-500"
                            />
                            <FeatureHighlight 
                              icon={Coins} 
                              title={`${coinName} Management`}
                              description="Configure rewards"
                              path="/dashboard?tab=coins"
                              color="bg-amber-500"
                            />
                            <FeatureHighlight 
                              icon={Settings} 
                              title="Organization Settings" 
                              description="Configure your org"
                              path="/admin/settings"
                              color="bg-slate-500"
                            />
                            <FeatureHighlight 
                              icon={Users} 
                              title="Org Chart" 
                              description="Reporting structure"
                              path="/organization/chart"
                              color="bg-indigo-500"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                )}
              </Tabs>

              {/* Help Section */}
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="p-3 rounded-full bg-primary/10">
                      <HelpCircle className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">Need More Help?</h3>
                      <p className="text-sm text-muted-foreground">
                        Contact your manager or admin if you have questions. You can also submit feedback 
                        through the App Feedback section.
                      </p>
                    </div>
                    <Button variant="outline" onClick={() => navigate('/dashboard?tab=app-feedback')}>
                      <MessageCircle className="h-4 w-4 mr-2" /> Submit Feedback
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </StandalonePageLayout>
  );
}
