import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, CheckSquare, Trophy, BookOpen, BarChart3, Activity, Settings, UserCheck } from 'lucide-react';
import { TaskManager } from '@/components/TaskManager';
import { InternManager } from '@/components/InternManager';
import { ProfileSettings } from '@/components/ProfileSettings';
import { TrainingAdmin } from '@/components/TrainingAdmin';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Enhanced Custom Styles */}
      <style jsx>{`
        .workfront-gradient {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .workfront-card {
          background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .workfront-card:hover {
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          transform: translateY(-2px);
        }
        .workfront-card-dark {
          background: linear-gradient(145deg, #1e293b 0%, #334155 100%);
          border: 1px solid #475569;
        }
        .workfront-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 2.5rem;
          border-radius: 12px;
          margin-bottom: 2rem;
          box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
        }
        .workfront-metric-icon {
          background: linear-gradient(135deg, #667eea 20%, #764ba2 80%);
          color: white;
          padding: 12px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }
        .workfront-badge {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          font-weight: 600;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .workfront-tab {
          background: transparent;
          border: 2px solid #e2e8f0;
          color: #64748b;
          font-weight: 600;
          transition: all 0.3s ease;
          border-radius: 8px;
          padding: 12px 20px;
          position: relative;
          overflow: hidden;
        }
        .workfront-tab:hover {
          border-color: #667eea;
          color: #667eea;
          background: rgba(102, 126, 234, 0.05);
        }
        .workfront-tab[data-state="active"] {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-color: #667eea;
          color: white;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }
        .workfront-tab[data-state="active"]::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #ffffff 0%, rgba(255,255,255,0.5) 100%);
        }
        .workfront-activity-card {
          background: linear-gradient(145deg, #f8fafc 0%, #ffffff 100%);
          border: 1px solid #e2e8f0;
          border-left: 4px solid #667eea;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
        }
        .workfront-activity-card:hover {
          border-left-color: #764ba2;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }
        .metric-number {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl">
        {/* Enhanced Header with Workfront styling */}
        <div className="workfront-header">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                Admin Dashboard
              </h1>
              <p className="text-sm sm:text-base opacity-90 font-medium">
                Comprehensive management system for interns, tasks, training, and system settings
              </p>
              <div className="flex items-center space-x-4 text-sm opacity-80">
                <span className="flex items-center">
                  <Activity className="h-4 w-4 mr-1" />
                  System Status: Active
                </span>
                <span>•</span>
                <span className="flex items-center">
                  <BarChart3 className="h-4 w-4 mr-1" />
                  Real-time Analytics
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="workfront-badge">
                Admin Panel
              </div>
              <div className="text-right">
                <p className="text-xs opacity-75">Last Updated</p>
                <p className="text-sm font-semibold">Just now</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Tab System with Workfront styling */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-0">
            <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-6 py-4">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 h-auto p-1 bg-transparent gap-2">
                <TabsTrigger value="overview" className="workfront-tab flex items-center gap-2 py-3 px-4 text-sm">
                  <BarChart3 className="h-4 w-4 shrink-0" />
                  <span className="font-semibold hidden sm:inline">Overview</span>
                </TabsTrigger>
                <TabsTrigger value="interns" className="workfront-tab flex items-center gap-2 py-3 px-4 text-sm">
                  <Users className="h-4 w-4 shrink-0" />
                  <span className="font-semibold hidden sm:inline">Interns</span>
                </TabsTrigger>
                <TabsTrigger value="tasks" className="workfront-tab flex items-center gap-2 py-3 px-4 text-sm">
                  <CheckSquare className="h-4 w-4 shrink-0" />
                  <span className="font-semibold hidden sm:inline">Tasks</span>
                </TabsTrigger>
                <TabsTrigger value="training" className="workfront-tab flex items-center gap-2 py-3 px-4 text-sm">
                  <BookOpen className="h-4 w-4 shrink-0" />
                  <span className="font-semibold hidden sm:inline">Training</span>
                </TabsTrigger>
                <TabsTrigger value="profile" className="workfront-tab flex items-center gap-2 py-3 px-4 text-sm">
                  <Settings className="h-4 w-4 shrink-0" />
                  <span className="font-semibold hidden sm:inline">Profile</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="space-y-6 mt-0 p-6">
              {/* Enhanced Metric Cards */}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="workfront-card dark:workfront-card-dark border-0 overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <div className="space-y-1">
                      <CardTitle className="text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                        Total Interns
                      </CardTitle>
                      <div className="text-3xl font-bold metric-number">-</div>
                    </div>
                    <div className="workfront-metric-icon">
                      <Users className="h-6 w-6" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        Active interns in system
                      </p>
                    </div>
                    <div className="mt-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg p-2">
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                        👥 User Management
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="workfront-card dark:workfront-card-dark border-0 overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <div className="space-y-1">
                      <CardTitle className="text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                        Active Tasks
                      </CardTitle>
                      <div className="text-3xl font-bold metric-number">-</div>
                    </div>
                    <div className="workfront-metric-icon">
                      <CheckSquare className="h-6 w-6" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        Currently assigned
                      </p>
                    </div>
                    <div className="mt-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg p-2">
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                        📋 Task Management
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="workfront-card dark:workfront-card-dark border-0 overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <div className="space-y-1">
                      <CardTitle className="text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                        Coins Distributed
                      </CardTitle>
                      <div className="text-3xl font-bold metric-number">-</div>
                    </div>
                    <div className="workfront-metric-icon">
                      <Trophy className="h-6 w-6" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        Total rewards given
                      </p>
                    </div>
                    <div className="mt-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg p-2">
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                        🏆 Reward System
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="workfront-card dark:workfront-card-dark border-0 overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <div className="space-y-1">
                      <CardTitle className="text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                        Training Modules
                      </CardTitle>
                      <div className="text-3xl font-bold metric-number">-</div>
                    </div>
                    <div className="workfront-metric-icon">
                      <BookOpen className="h-6 w-6" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        Available modules
                      </p>
                    </div>
                    <div className="mt-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg p-2">
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                        📚 Learning Management
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Enhanced System Activity Card */}
              <Card className="workfront-activity-card border-0 overflow-hidden">
                <CardHeader className="border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="workfront-metric-icon">
                        <Activity className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                          System Activity
                        </CardTitle>
                        <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                          Real-time monitoring and insights
                        </p>
                      </div>
                    </div>
                    <div className="workfront-badge">
                      Live
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center space-y-3">
                      <div className="workfront-metric-icon mx-auto">
                        <BarChart3 className="h-8 w-8" />
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 font-medium">
                        No recent system activity to display.
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        Activity feed will appear here when actions are performed
                      </p>
                    </div>
                  </div>
                  
                  {/* Activity Placeholder Cards */}
                  <div className="grid gap-3 mt-6">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        System monitoring initialized
                      </p>
                      <div className="ml-auto text-xs text-gray-400">Just now</div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Dashboard loaded successfully
                      </p>
                      <div className="ml-auto text-xs text-gray-400">1 min ago</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="interns" className="space-y-0 mt-0 p-6">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                  <UserCheck className="h-5 w-5 mr-2 text-blue-600" />
                  Intern Management
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  Manage intern profiles, assignments, and performance tracking
                </p>
              </div>
              <InternManager />
            </TabsContent>

            <TabsContent value="tasks" className="space-y-0 mt-0 p-6">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                  <CheckSquare className="h-5 w-5 mr-2 text-blue-600" />
                  Task Management
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  Create, assign, and monitor task progress across all interns
                </p>
              </div>
              <TaskManager />
            </TabsContent>

            <TabsContent value="training" className="space-y-0 mt-0 p-6">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                  Training Administration
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  Manage training modules, courses, and learning paths
                </p>
              </div>
              <TrainingAdmin />
            </TabsContent>

            <TabsContent value="profile" className="space-y-0 mt-0 p-6">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                  <Settings className="h-5 w-5 mr-2 text-blue-600" />
                  Profile Settings
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  Configure your admin profile and system preferences
                </p>
              </div>
              <ProfileSettings />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
