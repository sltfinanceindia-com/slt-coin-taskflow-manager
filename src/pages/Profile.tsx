/**
 * Profile Page with 8-Tab Structure
 * Per TeneXA Specification: Overview, Employment, Documents, Payroll, 
 * Time & Attendance, Performance, Preferences, Security
 */

import { useState, Suspense, lazy } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StandalonePageLayout } from '@/layouts/StandalonePageLayout';
import { ProfileOverviewTab, ProfileSecurityTab, ProfilePreferencesTab } from '@/components/profile';
import { UserAssessmentResults } from '@/components/assessment/UserAssessmentResults';
import { 
  User, 
  Briefcase, 
  FileText, 
  Wallet, 
  Clock, 
  TrendingUp, 
  Settings, 
  Shield 
} from 'lucide-react';

// Lazy load the self-service portal
const EmployeeSelfServicePortal = lazy(() => 
  import('@/components/employee/EmployeeSelfServicePortal').then(m => ({ 
    default: m.EmployeeSelfServicePortal 
  }))
);

// Tab configuration
const profileTabs = [
  { id: 'overview', label: 'Overview', icon: User },
  { id: 'self-service', label: 'Self-Service', icon: Briefcase },
  { id: 'performance', label: 'Performance', icon: TrendingUp },
  { id: 'preferences', label: 'Preferences', icon: Settings },
  { id: 'security', label: 'Security', icon: Shield },
];

export default function Profile() {
  const { user, profile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <ProfileOverviewTab />;
      
      case 'self-service':
        return (
          <Suspense fallback={<TabLoadingFallback />}>
            <EmployeeSelfServicePortal />
          </Suspense>
        );
      
      case 'performance':
        return <UserAssessmentResults />;
      
      case 'preferences':
        return <ProfilePreferencesTab />;
      
      case 'security':
        return <ProfileSecurityTab />;
      
      default:
        return <ProfileOverviewTab />;
    }
  };

  return (
    <StandalonePageLayout 
      activeTab="profile"
      breadcrumbs={[{ label: 'My Profile' }]}
    >
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          My Profile
        </h1>
        <p className="text-muted-foreground text-[11px] sm:text-sm">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1 rounded-lg">
          {profileTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {renderTabContent()}
        </div>
      </Tabs>
    </StandalonePageLayout>
  );
}

// Loading fallback component
function TabLoadingFallback() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
