import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  FileText, Download, Copy, Loader2, Sparkles, 
  FileCheck, Mail, ClipboardList, GraduationCap, Users
} from 'lucide-react';

const documentTypes = [
  { 
    id: 'offer_letter', 
    label: 'Offer Letter', 
    icon: Mail,
    description: 'Generate job offer letters',
    fields: ['candidateName', 'position', 'salary', 'startDate', 'benefits']
  },
  { 
    id: 'policy_document', 
    label: 'Policy Document', 
    icon: FileCheck,
    description: 'Create company policies',
    fields: ['policyTitle', 'purpose', 'scope', 'keyPoints']
  },
  { 
    id: 'performance_review', 
    label: 'Performance Review', 
    icon: ClipboardList,
    description: 'Draft performance reviews',
    fields: ['employeeName', 'position', 'reviewPeriod', 'achievements', 'areasToImprove']
  },
  { 
    id: 'training_material', 
    label: 'Training Material', 
    icon: GraduationCap,
    description: 'Create training content',
    fields: ['topic', 'targetAudience', 'objectives', 'keyTopics']
  },
  { 
    id: 'meeting_agenda', 
    label: 'Meeting Agenda', 
    icon: Users,
    description: 'Prepare meeting agendas',
    fields: ['meetingTitle', 'date', 'attendees', 'objectives', 'topics']
  },
];

const fieldLabels: Record<string, string> = {
  candidateName: 'Candidate Name',
  position: 'Position',
  salary: 'Salary/Compensation',
  startDate: 'Start Date',
  benefits: 'Benefits Package',
  policyTitle: 'Policy Title',
  purpose: 'Purpose',
  scope: 'Scope',
  keyPoints: 'Key Points',
  employeeName: 'Employee Name',
  reviewPeriod: 'Review Period',
  achievements: 'Key Achievements',
  areasToImprove: 'Areas for Improvement',
  topic: 'Training Topic',
  targetAudience: 'Target Audience',
  objectives: 'Learning Objectives',
  keyTopics: 'Key Topics to Cover',
  meetingTitle: 'Meeting Title',
  date: 'Date & Time',
  attendees: 'Attendees',
  topics: 'Discussion Topics',
};

export function AIDocumentGenerator() {
  const { profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [generatedDoc, setGeneratedDoc] = useState('');

  const generateMutation = useMutation({
    mutationFn: async ({ documentType, details }: { documentType: string; details: Record<string, string> }) => {
      const { data, error } = await supabase.functions.invoke('ai-document-generator', {
        body: {
          documentType,
          details,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setGeneratedDoc(data.document);
      toast.success('Document generated successfully!');
    },
    onError: (error) => {
      console.error('Document generation error:', error);
      toast.error('Failed to generate document. Please try again.');
    },
  });

  const handleGenerate = () => {
    if (!selectedType) return;
    generateMutation.mutate({ documentType: selectedType, details: formData });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedDoc);
    toast.success('Copied to clipboard');
  };

  const handleDownload = () => {
    const blob = new Blob([generatedDoc], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedType?.replace('_', '-')}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Document downloaded');
  };

  const resetState = () => {
    setSelectedType(null);
    setFormData({});
    setGeneratedDoc('');
  };

  const selectedDocType = documentTypes.find(d => d.id === selectedType);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetState();
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileText className="h-4 w-4" />
          AI Document Generator
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Document Generator
          </DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-4 mt-4">
          {/* Left Panel - Selection & Form */}
          <div className="space-y-4">
            {!selectedType ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Select a document type to generate:
                </p>
                <div className="grid gap-2">
                  {documentTypes.map((doc) => (
                    <Card 
                      key={doc.id}
                      className="cursor-pointer hover:border-primary transition-colors"
                      onClick={() => setSelectedType(doc.id)}
                    >
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <doc.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">{doc.label}</h4>
                          <p className="text-xs text-muted-foreground">{doc.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {selectedDocType && <selectedDocType.icon className="h-5 w-5 text-primary" />}
                    <h4 className="font-medium">{selectedDocType?.label}</h4>
                  </div>
                  <Button variant="ghost" size="sm" onClick={resetState}>
                    Change
                  </Button>
                </div>

                <ScrollArea className="h-[350px] pr-4">
                  <div className="space-y-4">
                    {selectedDocType?.fields.map((field) => (
                      <div key={field} className="space-y-2">
                        <Label>{fieldLabels[field] || field}</Label>
                        {['keyPoints', 'achievements', 'areasToImprove', 'objectives', 'keyTopics', 'topics', 'benefits'].includes(field) ? (
                          <Textarea
                            value={formData[field] || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, [field]: e.target.value }))}
                            placeholder={`Enter ${fieldLabels[field]?.toLowerCase()}...`}
                            rows={3}
                          />
                        ) : (
                          <Input
                            value={formData[field] || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, [field]: e.target.value }))}
                            placeholder={`Enter ${fieldLabels[field]?.toLowerCase()}...`}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <Button 
                  className="w-full" 
                  onClick={handleGenerate}
                  disabled={generateMutation.isPending}
                >
                  {generateMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Document
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Right Panel - Preview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Preview</h4>
              {generatedDoc && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopy}>
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              )}
            </div>
            <Card className="h-[400px]">
              <ScrollArea className="h-full">
                <CardContent className="p-4">
                  {generatedDoc ? (
                    <pre className="whitespace-pre-wrap text-sm font-sans">{generatedDoc}</pre>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Generated document will appear here</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </ScrollArea>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
