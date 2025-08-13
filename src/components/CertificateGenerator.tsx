import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Download, Award, FileText, Share2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';

interface CertificateData {
  internName: string;
  internId: string;
  department: string;
  startDate: string;
  endDate: string;
  totalHours: number;
  totalCoins: number;
  completedTasks: number;
  performance: string;
  customText?: string;
}

interface CertificateGeneratorProps {
  internData?: any;
  onClose?: () => void;
}

export function CertificateGenerator({ internData, onClose }: CertificateGeneratorProps) {
  const { profile } = useAuth();
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [template, setTemplate] = useState('formal');
  const [certificateData, setCertificateData] = useState<CertificateData>({
    internName: internData?.full_name || '',
    internId: internData?.employee_id || '',
    department: internData?.department || '',
    startDate: internData?.start_date || '',
    endDate: internData?.end_date || format(new Date(), 'yyyy-MM-dd'),
    totalHours: 0,
    totalCoins: internData?.total_coins || 0,
    completedTasks: 0,
    performance: 'Excellent',
    customText: '',
  });

  const isAdmin = profile?.role === 'admin';

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="w-full max-w-md border border-border shadow-sm">
          <CardContent className="p-8 text-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <Award className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Access Restricted</h3>
            <p className="text-muted-foreground leading-relaxed">
              Only administrators can generate certificates.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const generatePDF = async () => {
    if (!certificateRef.current) return;

    setIsGenerating(true);
    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      
      const imgWidth = 297; // A4 landscape width
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`certificate-${certificateData.internName.replace(/\s+/g, '-').toLowerCase()}.pdf`);
      
      toast({
        title: "Certificate Generated",
        description: "Certificate has been downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Error Generating Certificate",
        description: "Failed to generate certificate PDF.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const templates = {
    formal: {
      name: 'Formal',
      bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100',
      borderColor: 'border-blue-200',
      accentColor: 'text-blue-700',
      primaryText: 'text-slate-800',
      secondaryText: 'text-slate-600',
    },
    creative: {
      name: 'Creative',
      bgColor: 'bg-gradient-to-br from-purple-50 to-pink-100',
      borderColor: 'border-purple-200',
      accentColor: 'text-purple-700',
      primaryText: 'text-slate-800',
      secondaryText: 'text-slate-600',
    },
    minimalist: {
      name: 'Minimalist',
      bgColor: 'bg-white',
      borderColor: 'border-gray-300',
      accentColor: 'text-gray-800',
      primaryText: 'text-slate-900',
      secondaryText: 'text-slate-600',
    },
  };

  const currentTemplate = templates[template as keyof typeof templates];

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-8">
          {/* Certificate Form */}
          <Card className="border border-border shadow-sm">
            <CardHeader className="px-6 py-6 border-b border-border">
              <CardTitle className="flex items-center gap-3 text-xl font-semibold text-foreground">
                <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center">
                  <Award className="h-4 w-4 text-blue-600" />
                </div>
                Certificate Generator
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground mt-2">
                Generate professional completion certificates for interns
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
              {/* Template Selection */}
              <div className="space-y-3">
                <Label htmlFor="template" className="text-sm font-medium text-foreground">
                  Certificate Template
                </Label>
                <Select value={template} onValueChange={setTemplate}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(templates).map(([key, tmpl]) => (
                      <SelectItem key={key} value={key}>
                        {tmpl.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Certificate Data Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="internName" className="text-sm font-medium text-foreground">
                    Intern Name *
                  </Label>
                  <Input
                    id="internName"
                    value={certificateData.internName}
                    onChange={(e) => setCertificateData(prev => ({ ...prev, internName: e.target.value }))}
                    className="h-11"
                    placeholder="Enter intern's full name"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="internId" className="text-sm font-medium text-foreground">
                    Employee ID
                  </Label>
                  <Input
                    id="internId"
                    value={certificateData.internId}
                    onChange={(e) => setCertificateData(prev => ({ ...prev, internId: e.target.value }))}
                    className="h-11"
                    placeholder="Enter employee ID"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="department" className="text-sm font-medium text-foreground">
                    Department
                  </Label>
                  <Input
                    id="department"
                    value={certificateData.department}
                    onChange={(e) => setCertificateData(prev => ({ ...prev, department: e.target.value }))}
                    className="h-11"
                    placeholder="Enter department name"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="performance" className="text-sm font-medium text-foreground">
                    Performance Rating
                  </Label>
                  <Select 
                    value={certificateData.performance} 
                    onValueChange={(value) => setCertificateData(prev => ({ ...prev, performance: value }))}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Outstanding">Outstanding</SelectItem>
                      <SelectItem value="Excellent">Excellent</SelectItem>
                      <SelectItem value="Good">Good</SelectItem>
                      <SelectItem value="Satisfactory">Satisfactory</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="startDate" className="text-sm font-medium text-foreground">
                    Start Date
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={certificateData.startDate}
                    onChange={(e) => setCertificateData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="h-11"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="endDate" className="text-sm font-medium text-foreground">
                    End Date
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={certificateData.endDate}
                    onChange={(e) => setCertificateData(prev => ({ ...prev, endDate: e.target.value }))}
                    className="h-11"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="customText" className="text-sm font-medium text-foreground">
                  Custom Message (Optional)
                </Label>
                <Textarea
                  id="customText"
                  placeholder="Add a personal message, additional achievements, or special recognitions..."
                  value={certificateData.customText}
                  onChange={(e) => setCertificateData(prev => ({ ...prev, customText: e.target.value }))}
                  rows={4}
                  className="resize-none"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-border">
                <Button 
                  onClick={generatePDF} 
                  disabled={isGenerating || !certificateData.internName}
                  className="h-11 px-6 font-medium"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {isGenerating ? 'Generating...' : 'Download Certificate'}
                </Button>
                {onClose && (
                  <Button variant="outline" onClick={onClose} className="h-11 px-6 font-medium">
                    Close
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Certificate Preview */}
          <Card className="border border-border shadow-sm">
            <CardHeader className="px-6 py-6 border-b border-border">
              <CardTitle className="flex items-center gap-3 text-xl font-semibold text-foreground">
                <div className="h-8 w-8 rounded-full bg-green-50 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-green-600" />
                </div>
                Certificate Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="overflow-auto bg-slate-50 p-6 rounded-lg border border-border">
                <div
                  ref={certificateRef}
                  className={`w-[800px] h-[600px] mx-auto p-12 ${currentTemplate.bgColor} ${currentTemplate.borderColor} border-8 relative shadow-lg`}
                  style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}
                >
                  {/* Decorative Corner Elements */}
                  <div className="absolute top-4 left-4 w-12 h-12 border-l-4 border-t-4 border-current opacity-20"></div>
                  <div className="absolute top-4 right-4 w-12 h-12 border-r-4 border-t-4 border-current opacity-20"></div>
                  <div className="absolute bottom-4 left-4 w-12 h-12 border-l-4 border-b-4 border-current opacity-20"></div>
                  <div className="absolute bottom-4 right-4 w-12 h-12 border-r-4 border-b-4 border-current opacity-20"></div>

                  {/* Header */}
                  <div className="text-center mb-8">
                    <h1 className={`text-4xl font-bold ${currentTemplate.accentColor} mb-3 tracking-wide`} style={{ fontFamily: "'Playfair Display', serif" }}>
                      Certificate of Completion
                    </h1>
                    <div className={`w-32 h-1 ${currentTemplate.accentColor.replace('text-', 'bg-')} mx-auto opacity-60 rounded-full`}></div>
                    <div className={`w-16 h-0.5 ${currentTemplate.accentColor.replace('text-', 'bg-')} mx-auto mt-2 opacity-40 rounded-full`}></div>
                  </div>

                  {/* Content */}
                  <div className="text-center space-y-6">
                    <p className={`text-lg ${currentTemplate.secondaryText} font-medium tracking-wide`} style={{ fontFamily: "'Inter', sans-serif" }}>
                      This is to certify that
                    </p>
                    
                    <h2 className={`text-3xl font-bold ${currentTemplate.primaryText} border-b-3 border-current pb-3 inline-block tracking-wide`} style={{ fontFamily: "'Playfair Display', serif" }}>
                      {certificateData.internName || '[Intern Name]'}
                    </h2>
                    
                    <p className={`text-lg ${currentTemplate.secondaryText} font-medium leading-relaxed`} style={{ fontFamily: "'Inter', sans-serif" }}>
                      has successfully completed the internship program at
                    </p>
                    
                    <h3 className={`text-2xl font-bold ${currentTemplate.accentColor} tracking-wide`} style={{ fontFamily: "'Playfair Display', serif" }}>
                      SLT Finance India
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-8 my-8 text-sm px-8">
                      <div className="text-left">
                        <p className={`${currentTemplate.secondaryText} font-medium uppercase tracking-wider text-xs mb-1`} style={{ fontFamily: "'Inter', sans-serif" }}>
                          Department:
                        </p>
                        <p className={`font-semibold text-base ${currentTemplate.primaryText}`} style={{ fontFamily: "'Inter', sans-serif" }}>
                          {certificateData.department || '[Department]'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`${currentTemplate.secondaryText} font-medium uppercase tracking-wider text-xs mb-1`} style={{ fontFamily: "'Inter', sans-serif" }}>
                          Employee ID:
                        </p>
                        <p className={`font-semibold text-base ${currentTemplate.primaryText}`} style={{ fontFamily: "'Inter', sans-serif" }}>
                          {certificateData.internId || '[ID]'}
                        </p>
                      </div>
                      <div className="text-left">
                        <p className={`${currentTemplate.secondaryText} font-medium uppercase tracking-wider text-xs mb-1`} style={{ fontFamily: "'Inter', sans-serif" }}>
                          Program Duration:
                        </p>
                        <p className={`font-semibold text-base ${currentTemplate.primaryText}`} style={{ fontFamily: "'Inter', sans-serif" }}>
                          {certificateData.startDate && certificateData.endDate 
                            ? `${format(new Date(certificateData.startDate), 'MMM dd, yyyy')} - ${format(new Date(certificateData.endDate), 'MMM dd, yyyy')}`
                            : '[Duration]'
                          }
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`${currentTemplate.secondaryText} font-medium uppercase tracking-wider text-xs mb-1`} style={{ fontFamily: "'Inter', sans-serif" }}>
                          Performance Rating:
                        </p>
                        <p className={`font-semibold text-base ${currentTemplate.accentColor}`} style={{ fontFamily: "'Inter', sans-serif" }}>
                          {certificateData.performance}
                        </p>
                      </div>
                    </div>
                    
                    {certificateData.customText && (
                      <div className="border-t border-current border-opacity-20 pt-6 mx-8">
                        <p className={`text-sm ${currentTemplate.secondaryText} italic leading-relaxed font-medium`} style={{ fontFamily: "'Inter', sans-serif" }}>
                          {certificateData.customText}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="absolute bottom-12 left-12 right-12">
                    <div className="flex justify-between items-end">
                      <div className="text-center">
                        <div className={`w-32 border-b-2 ${currentTemplate.primaryText} border-opacity-40 mb-3`}></div>
                        <p className={`text-xs ${currentTemplate.secondaryText} font-medium uppercase tracking-wider mb-1`} style={{ fontFamily: "'Inter', sans-serif" }}>
                          Issue Date
                        </p>
                        <p className={`text-sm font-semibold ${currentTemplate.primaryText}`} style={{ fontFamily: "'Inter', sans-serif" }}>
                          {format(new Date(), 'MMMM dd, yyyy')}
                        </p>
                      </div>
                      <div className="text-center">
                        <div className={`w-32 border-b-2 ${currentTemplate.primaryText} border-opacity-40 mb-3`}></div>
                        <p className={`text-xs ${currentTemplate.secondaryText} font-medium uppercase tracking-wider mb-1`} style={{ fontFamily: "'Inter', sans-serif" }}>
                          Authorized Signature
                        </p>
                        <p className={`text-sm font-semibold ${currentTemplate.primaryText}`} style={{ fontFamily: "'Inter', sans-serif" }}>
                          HR Department
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Watermark */}
                  <div className={`absolute inset-0 flex items-center justify-center pointer-events-none`}>
                    <div className={`text-6xl ${currentTemplate.accentColor} opacity-5 font-bold transform rotate-12`} style={{ fontFamily: "'Playfair Display', serif" }}>
                      SLT FINANCE
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
