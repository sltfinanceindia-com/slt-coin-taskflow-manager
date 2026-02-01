/**
 * Help Center Page
 * Searchable FAQs, guides, tutorials, and support
 */

import { useState } from 'react';
import { StandalonePageLayout } from '@/layouts/StandalonePageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  Search, 
  BookOpen, 
  Video, 
  MessageCircle, 
  HelpCircle,
  Rocket,
  Users,
  Clock,
  FileText,
  BarChart3,
  Mail,
  Phone,
  ExternalLink
} from 'lucide-react';

const quickStartGuides = [
  {
    title: 'Getting Started',
    description: 'Learn the basics of navigating TeneXA',
    icon: Rocket,
    articles: 5,
  },
  {
    title: 'HR Management',
    description: 'Managing employees, leave, and attendance',
    icon: Users,
    articles: 12,
  },
  {
    title: 'Time Tracking',
    description: 'Log time, manage timesheets, and overtime',
    icon: Clock,
    articles: 8,
  },
  {
    title: 'Project Management',
    description: 'Projects, tasks, sprints, and Kanban boards',
    icon: FileText,
    articles: 15,
  },
  {
    title: 'Reports & Analytics',
    description: 'Generate insights from your data',
    icon: BarChart3,
    articles: 10,
  },
];

const faqs = [
  {
    question: 'How do I check in for attendance?',
    answer: 'You can check in from the Dashboard using the Quick Actions button, or navigate to Attendance > Check In. If geofencing is enabled, you\'ll need to be within the designated office area.',
  },
  {
    question: 'How do I apply for leave?',
    answer: 'Go to Leave Management > Apply Leave. Select your leave type, dates, and provide a reason. Your request will be sent to your manager for approval. You\'ll receive notifications about the status of your request.',
  },
  {
    question: 'How can I view my salary slip?',
    answer: 'Navigate to My Profile > Payroll or access My Payslips from the Finance section. You can view and download your salary slips in PDF format for any processed month.',
  },
  {
    question: 'How do I log time on a task?',
    answer: 'Open the task you\'re working on and click "Log Time". Enter the hours spent, date, and optionally add a description. Your time logs contribute to project reports and timesheets.',
  },
  {
    question: 'How do I create a project?',
    answer: 'Go to Projects > Create Project (requires Project Manager or Admin role). Fill in project details, set milestones, add team members, and optionally use a project template.',
  },
  {
    question: 'How do I submit an expense for reimbursement?',
    answer: 'Navigate to Expenses > Submit Expense. Upload receipts, select the expense category, enter the amount, and submit. Once approved by your manager and finance, it will be included in your next salary.',
  },
  {
    question: 'How do I view my team\'s attendance?',
    answer: 'Managers can view team attendance from Dashboard > Team section or Attendance > Team Attendance. You\'ll see real-time check-in status and monthly summaries.',
  },
  {
    question: 'How do I set up OKRs?',
    answer: 'Go to Performance > OKRs > Create OKR. Define your objective, add measurable key results, set the time period, and optionally align it with team or company OKRs.',
  },
];

const videoTutorials = [
  { title: 'Dashboard Overview', duration: '5:32', category: 'Getting Started' },
  { title: 'Managing Your Tasks', duration: '8:15', category: 'Project Management' },
  { title: 'Submitting Leave Requests', duration: '4:20', category: 'HR Management' },
  { title: 'Running Payroll', duration: '12:45', category: 'Finance' },
];

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <StandalonePageLayout 
      activeTab="help"
      contentClassName="max-w-6xl"
    >
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="text-center py-8 space-y-4">
          <h1 className="text-3xl font-bold text-foreground">How can we help you?</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Search our knowledge base or browse topics below
          </p>
          
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search for help articles, FAQs, tutorials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </div>

        {/* Quick Start Guides */}
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Quick Start Guides
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickStartGuides.map((guide) => (
              <Card key={guide.title} className="hover:shadow-md transition-shadow cursor-pointer group">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <guide.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{guide.title}</CardTitle>
                      <CardDescription className="text-sm">{guide.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <Badge variant="secondary">{guide.articles} articles</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* FAQs */}
          <section className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Frequently Asked Questions
            </h2>
            <Card>
              <CardContent className="pt-6">
                {filteredFaqs.length > 0 ? (
                  <Accordion type="single" collapsible className="w-full">
                    {filteredFaqs.map((faq, idx) => (
                      <AccordionItem key={idx} value={`faq-${idx}`}>
                        <AccordionTrigger className="text-left">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <HelpCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No FAQs match your search</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Video Tutorials */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  Video Tutorials
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {videoTutorials.map((video, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                    <div>
                      <p className="text-sm font-medium">{video.title}</p>
                      <p className="text-xs text-muted-foreground">{video.category}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">{video.duration}</Badge>
                  </div>
                ))}
                <Button variant="link" className="w-full text-sm">
                  View all tutorials
                  <ExternalLink className="h-3 w-3 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Contact Support */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Need More Help?
                </CardTitle>
                <CardDescription>
                  Our support team is here to assist
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Mail className="h-4 w-4" />
                  Email Support
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Phone className="h-4 w-4" />
                  Schedule a Call
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Live Chat
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </StandalonePageLayout>
  );
}
