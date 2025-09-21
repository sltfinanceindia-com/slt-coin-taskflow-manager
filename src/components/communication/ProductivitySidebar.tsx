import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  FileText, 
  Clock, 
  Bell, 
  Languages, 
  Shield, 
  Search, 
  ChevronDown, 
  ChevronRight 
} from 'lucide-react';
import MessageTemplates from './MessageTemplates';
import ScheduledMessages from './ScheduledMessages';
import MessageReminders from './MessageReminders';
import AutoTranslation from './AutoTranslation';
import MessageCompliance from './MessageCompliance';
import AdvancedSearch from './AdvancedSearch';

interface ProductivitySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  teamMembers: Array<{ id: string; full_name: string }>;
  channels: Array<{ id: string; name: string }>;
  onInsertTemplate: (content: string) => void;
  onScheduleMessage: (content: string, scheduledFor: Date, channelId?: string) => void;
  onSetReminder: (messageId: string, reminderTime: Date) => void;
  onTranslate: (text: string, targetLang: string) => Promise<string>;
  onSearch: (filters: any) => void;
}

export default function ProductivitySidebar({
  isOpen,
  onClose,
  teamMembers,
  channels,
  onInsertTemplate,
  onScheduleMessage,
  onSetReminder,
  onTranslate,
  onSearch
}: ProductivitySidebarProps) {
  const [activeSection, setActiveSection] = useState<string | null>('templates');

  const sections = [
    {
      id: 'search',
      title: 'Advanced Search',
      icon: Search,
      component: (
        <AdvancedSearch
          onSearch={onSearch}
          teamMembers={teamMembers}
          channels={channels}
        />
      )
    },
    {
      id: 'templates',
      title: 'Message Templates',
      icon: FileText,
      component: <MessageTemplates onInsertTemplate={onInsertTemplate} />
    },
    {
      id: 'scheduled',
      title: 'Scheduled Messages',
      icon: Clock,
      component: <ScheduledMessages onScheduleMessage={onScheduleMessage} />
    },
    {
      id: 'reminders',
      title: 'Message Reminders',
      icon: Bell,
      component: <MessageReminders onSetReminder={onSetReminder} />
    },
    {
      id: 'translation',
      title: 'Auto Translation',
      icon: Languages,
      component: <AutoTranslation onTranslate={onTranslate} />
    },
    {
      id: 'compliance',
      title: 'Message Compliance',
      icon: Shield,
      component: <MessageCompliance />
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:relative lg:inset-auto">
      {/* Mobile overlay */}
      <div 
        className="absolute inset-0 bg-black/50 lg:hidden" 
        onClick={onClose}
      />
      
      {/* Sidebar content */}
      <Card className="absolute right-0 top-0 h-full w-80 lg:w-full lg:relative lg:h-auto border-l bg-background">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Productivity Tools</h2>
              <Button variant="ghost" size="sm" onClick={onClose} className="lg:hidden">
                ×
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto">
            <div className="p-4 space-y-2">
              {sections.map((section) => (
                <Collapsible
                  key={section.id}
                  open={activeSection === section.id}
                  onOpenChange={(open) => setActiveSection(open ? section.id : null)}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-between hover:bg-accent"
                    >
                      <div className="flex items-center gap-2">
                        <section.icon className="h-4 w-4" />
                        <span className="text-sm">{section.title}</span>
                      </div>
                      {activeSection === section.id ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2">
                    <div className="pl-6 pr-2">
                      {section.component}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}