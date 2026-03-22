import { FeaturePlaceholder } from '@/components/common/FeaturePlaceholder';
import {
  Receipt, Wallet, TrendingUp, Coins, Shield, FileText, HeartPulse, FileBox,
  UserCheck, Users2, Clock, BookOpen, MessageCircle, AlertTriangle, BarChart3,
  GitBranch, Inbox, Users, Building2
} from 'lucide-react';

export function TaxManagementTab() {
  return (
    <FeaturePlaceholder
      title="Tax Management"
      description="Manage TDS, PF, ESI calculations and employee tax declarations"
      icon={Receipt}
      category="finance"
      features={[
        'TDS calculation and deduction',
        'PF contribution management',
        'ESI calculation',
        'Professional tax handling',
        'Tax regime selection',
        'Quarterly tax reports',
        'Form 24Q generation',
        'Tax compliance tracking'
      ]}
    />
  );
}

// Salary Structure
export function SalaryStructureTab() {
  return (
    <FeaturePlaceholder
      title="Salary Structure"
      description="Define and manage salary components like Basic, HRA, DA, and allowances"
      icon={Wallet}
      category="finance"
      features={[
        'Basic salary configuration',
        'HRA calculation rules',
        'DA and allowances setup',
        'Deduction components',
        'CTC breakdown',
        'Salary templates',
        'Grade-wise structures',
        'Component percentages'
      ]}
    />
  );
}

// Salary Revisions
export function SalaryRevisionsTab() {
  return (
    <FeaturePlaceholder
      title="Salary Revisions"
      description="Track salary history and manage increment cycles"
      icon={TrendingUp}
      category="finance"
      features={[
        'Annual increment processing',
        'Promotion-based revisions',
        'Salary history tracking',
        'Comparison reports',
        'Approval workflows',
        'Effective date management',
        'Bulk revision processing',
        'Revision letter generation'
      ]}
    />
  );
}

// Bonus Management
export function BonusManagementTab() {
  return (
    <FeaturePlaceholder
      title="Bonus Management"
      description="Configure and process performance bonuses and incentives"
      icon={Coins}
      category="finance"
      features={[
        'Performance bonus calculation',
        'Festival bonus processing',
        'Incentive management',
        'Bonus eligibility rules',
        'Payout scheduling',
        'Tax implications',
        'Approval workflows',
        'Bonus reports'
      ]}
    />
  );
}

// Reimbursements
export function ReimbursementsTab() {
  return (
    <FeaturePlaceholder
      title="Reimbursements"
      description="Handle medical, travel, and other expense reimbursements"
      icon={Receipt}
      category="finance"
      features={[
        'Medical reimbursement',
        'Travel expense claims',
        'Fuel reimbursement',
        'Mobile/Internet allowance',
        'Document uploads',
        'Approval workflows',
        'Reimbursement limits',
        'Tax-exempt handling'
      ]}
    />
  );
}

// Compliance
export function ComplianceTab() {
  return (
    <FeaturePlaceholder
      title="Statutory Compliance"
      description="Manage PF, ESI, PT, and LWF compliance and filings"
      icon={Shield}
      category="finance"
      features={[
        'PF monthly returns',
        'ESI contribution reports',
        'Professional tax filings',
        'LWF compliance',
        'Challan generation',
        'Compliance calendar',
        'Audit trail',
        'Penalty tracking'
      ]}
    />
  );
}

// Form 16
export function Form16Tab() {
  return (
    <FeaturePlaceholder
      title="Form 16 Generator"
      description="Generate annual tax statements for employees"
      icon={FileText}
      category="finance"
      features={[
        'Part A generation',
        'Part B generation',
        'Bulk Form 16 creation',
        'Digital signatures',
        'Email distribution',
        'Amendment handling',
        'Historical forms',
        'Verification reports'
      ]}
    />
  );
}

// Investments
export function InvestmentsTab() {
  return (
    <FeaturePlaceholder
      title="Investment Declarations"
      description="Collect and manage 80C, 80D tax-saving declarations"
      icon={Coins}
      category="finance"
      features={[
        'Section 80C investments',
        '80D health insurance',
        'HRA declarations',
        'Housing loan interest',
        'Other income declaration',
        'Proof submission',
        'Declaration deadlines',
        'Auto-reminder system'
      ]}
    />
  );
}

// Benefits
export function BenefitsTab() {
  return (
    <FeaturePlaceholder
      title="Employee Benefits"
      description="Track insurance, health benefits, and other perks"
      icon={HeartPulse}
      category="hr"
      features={[
        'Health insurance tracking',
        'Life insurance policies',
        'Dental/Vision benefits',
        'Wellness programs',
        'Flexible benefits',
        'Dependent coverage',
        'Claims management',
        'Benefits enrollment'
      ]}
    />
  );
}

// F&F Settlement
export function FnFTab() {
  return (
    <FeaturePlaceholder
      title="Full & Final Settlement"
      description="Calculate and process exit clearance and final payments"
      icon={FileBox}
      category="hr"
      features={[
        'Notice period calculation',
        'Leave encashment',
        'Pending salary',
        'Gratuity calculation',
        'Asset recovery',
        'Clearance checklist',
        'Final settlement letter',
        'Tax handling on F&F'
      ]}
    />
  );
}

// Gratuity
export function GratuityTab() {
  return (
    <FeaturePlaceholder
      title="Gratuity Calculator"
      description="Automatic gratuity calculation based on tenure"
      icon={Coins}
      category="finance"
      features={[
        'Tenure-based calculation',
        'Eligibility tracking',
        'Gratuity provisioning',
        'Payment processing',
        'Tax implications',
        'Forfeiture rules',
        'Gratuity insurance',
        'Statutory compliance'
      ]}
    />
  );
}

// Onboarding
export function OnboardingTab() {
  return (
    <FeaturePlaceholder
      title="Employee Onboarding"
      description="Manage document collection, IT setup, and onboarding checklists"
      icon={UserCheck}
      category="hr"
      features={[
        'Document collection',
        'ID card generation',
        'IT asset assignment',
        'Access provisioning',
        'Training schedule',
        'Buddy assignment',
        'Onboarding checklist',
        'Welcome kit tracking'
      ]}
    />
  );
}

// Exit Management
export function ExitManagementTab() {
  return (
    <FeaturePlaceholder
      title="Exit Management"
      description="Handle resignation, notice period, and clearance workflows"
      icon={Users2}
      category="hr"
      features={[
        'Resignation submission',
        'Notice period tracking',
        'Exit interviews',
        'Knowledge transfer',
        'Asset return',
        'Access revocation',
        'Clearance approvals',
        'Exit documentation'
      ]}
    />
  );
}

// Contracts
export function ContractsTab() {
  return (
    <FeaturePlaceholder
      title="Employee Contracts"
      description="Manage offer letters, employment contracts, and agreements"
      icon={FileText}
      category="hr"
      features={[
        'Offer letter generation',
        'Contract templates',
        'Digital signing',
        'NDA management',
        'Contract renewal',
        'Amendment tracking',
        'Expiry alerts',
        'Compliance checks'
      ]}
    />
  );
}

// Verification
export function VerificationTab() {
  return (
    <FeaturePlaceholder
      title="Background Verification"
      description="Track background verification status for employees"
      icon={Shield}
      category="hr"
      features={[
        'Education verification',
        'Employment history',
        'Criminal background',
        'Address verification',
        'Reference checks',
        'Document authentication',
        'Vendor management',
        'Status tracking'
      ]}
    />
  );
}

// Probation
export function ProbationTab() {
  return (
    <FeaturePlaceholder
      title="Probation Tracking"
      description="Manage probation periods and confirmation processes"
      icon={Clock}
      category="hr"
      features={[
        'Probation period setup',
        'Performance tracking',
        'Extension handling',
        'Confirmation criteria',
        'Manager feedback',
        'Auto-reminders',
        'Confirmation letter',
        'Probation reports'
      ]}
    />
  );
}

// Confirmations
export function ConfirmationsTab() {
  return (
    <FeaturePlaceholder
      title="Confirmation Letters"
      description="Auto-generate and manage confirmation letters"
      icon={FileText}
      category="hr"
      features={[
        'Letter generation',
        'Template management',
        'Approval workflows',
        'Digital delivery',
        'Acknowledgment tracking',
        'Salary revision linking',
        'Historical records',
        'Bulk processing'
      ]}
    />
  );
}

// Handbook
export function HandbookTab() {
  return (
    <FeaturePlaceholder
      title="Employee Handbook"
      description="Manage policy documents and employee acknowledgments"
      icon={BookOpen}
      category="hr"
      features={[
        'Policy documentation',
        'Version control',
        'Employee acknowledgments',
        'Policy updates',
        'Searchable content',
        'Category organization',
        'Compliance tracking',
        'Multi-language support'
      ]}
    />
  );
}

// Grievances
export function GrievancesTab() {
  return (
    <FeaturePlaceholder
      title="Grievance Management"
      description="Employee grievance portal for complaints and resolutions"
      icon={MessageCircle}
      category="hr"
      features={[
        'Anonymous submissions',
        'Category-based routing',
        'Investigation workflow',
        'Resolution tracking',
        'Escalation matrix',
        'Confidentiality controls',
        'Analytics dashboard',
        'POSH compliance'
      ]}
    />
  );
}

// Disciplinary
export function DisciplinaryTab() {
  return (
    <FeaturePlaceholder
      title="Disciplinary Actions"
      description="Manage warnings, suspensions, and disciplinary processes"
      icon={AlertTriangle}
      category="hr"
      features={[
        'Warning letters',
        'Show cause notices',
        'Inquiry proceedings',
        'Suspension handling',
        'Termination process',
        'Appeal management',
        'Documentation trail',
        'Legal compliance'
      ]}
    />
  );
}

// HR Analytics
export function HRAnalyticsTab() {
  return (
    <FeaturePlaceholder
      title="HR Analytics"
      description="Attrition, headcount, and cost analytics dashboard"
      icon={BarChart3}
      category="hr"
      features={[
        'Attrition analysis',
        'Headcount trends',
        'Cost per employee',
        'Diversity metrics',
        'Hiring analytics',
        'Turnover prediction',
        'Compensation analysis',
        'Custom dashboards'
      ]}
    />
  );
}

// Benchmarking
export function BenchmarkingTab() {
  return (
    <FeaturePlaceholder
      title="Compensation Benchmarking"
      description="Market salary comparisons and pay equity analysis"
      icon={TrendingUp}
      category="hr"
      features={[
        'Market data integration',
        'Industry comparisons',
        'Pay band analysis',
        'Equity assessment',
        'Regional adjustments',
        'Role-based benchmarks',
        'Trend analysis',
        'Recommendation engine'
      ]}
    />
  );
}

// Succession
export function SuccessionTab() {
  return (
    <FeaturePlaceholder
      title="Succession Planning"
      description="Key position backup and leadership pipeline planning"
      icon={Users2}
      category="hr"
      features={[
        'Critical role identification',
        'Successor mapping',
        'Readiness assessment',
        'Development plans',
        'Risk analysis',
        'Talent pools',
        'Leadership pipeline',
        'Progress tracking'
      ]}
    />
  );
}

// Career Paths
export function CareerPathsTab() {
  return (
    <FeaturePlaceholder
      title="Career Pathing"
      description="Define career progression paths and growth frameworks"
      icon={GitBranch}
      category="hr"
      features={[
        'Career ladder definition',
        'Skill requirements',
        'Competency mapping',
        'Role transitions',
        'Promotion criteria',
        'Lateral moves',
        'Development resources',
        'Progress visualization'
      ]}
    />
  );
}

// Job Postings
export function JobPostingsTab() {
  return (
    <FeaturePlaceholder
      title="Job Postings"
      description="Internal job board for open positions"
      icon={Inbox}
      category="hr"
      features={[
        'Internal job board',
        'Posting management',
        'Application portal',
        'Referral tracking',
        'Position approvals',
        'Requisition workflow',
        'Job descriptions',
        'Candidate sourcing'
      ]}
    />
  );
}

// Recruitment
export function RecruitmentTab() {
  return (
    <FeaturePlaceholder
      title="Recruitment Pipeline"
      description="Complete candidate tracking and hiring workflow"
      icon={Users}
      category="hr"
      features={[
        'Candidate database',
        'Resume parsing',
        'Stage-based pipeline',
        'Interview scheduling',
        'Feedback collection',
        'Offer management',
        'Onboarding handoff',
        'Recruitment analytics'
      ]}
    />
  );
}

// Interviews
export function InterviewsTab() {
  return (
    <FeaturePlaceholder
      title="Interview Scheduling"
      description="Calendar integration for interview coordination"
      icon={UserCheck}
      category="hr"
      features={[
        'Calendar integration',
        'Panel scheduling',
        'Video conferencing',
        'Availability matching',
        'Reminder system',
        'Rescheduling workflow',
        'Interview kits',
        'Feedback forms'
      ]}
    />
  );
}

// Offers
export function OffersTab() {
  return (
    <FeaturePlaceholder
      title="Offer Management"
      description="Offer letter generation and tracking system"
      icon={FileText}
      category="hr"
      features={[
        'Offer letter templates',
        'Compensation packages',
        'Approval workflow',
        'E-signature integration',
        'Negotiation tracking',
        'Acceptance monitoring',
        'Counter-offer handling',
        'Joining confirmation'
      ]}
    />
  );
}

// Budget Planning
export function BudgetPlanningTab() {
  return (
    <FeaturePlaceholder
      title="Budget Planning"
      description="Financial planning and budget allocation"
      icon={Wallet}
      category="finance"
      features={[
        'Annual budget creation',
        'Department allocation',
        'Forecast modeling',
        'Variance analysis',
        'Approval workflows',
        'Revision tracking',
        'Spend monitoring',
        'Budget reports'
      ]}
    />
  );
}

// Cost Centers
export function CostCentersTab() {
  return (
    <FeaturePlaceholder
      title="Cost Center Management"
      description="Cost allocation and departmental accounting"
      icon={Building2}
      category="finance"
      features={[
        'Cost center hierarchy',
        'Expense allocation',
        'Budget assignment',
        'Reporting structure',
        'Inter-department charges',
        'Overhead distribution',
        'Profitability analysis',
        'Cost tracking'
      ]}
    />
  );
}
