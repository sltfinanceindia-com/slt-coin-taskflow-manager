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
      <Card>
        <CardContent className="p-6 text-center">
          <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Only administrators can generate certificates.</p>
        </CardContent>
      </Card>
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
      accentColor: 'text-blue-600',
    },
    creative: {
      name: 'Creative',
      bgColor: 'bg-gradient-to-br from-purple-50 to-pink-100',
      borderColor: 'border-purple-200',
      accentColor: 'text-purple-600',
    },
    minimalist: {
      name: 'Minimalist',
      bgColor: 'bg-white',
      borderColor: 'border-gray-300',
      accentColor: 'text-gray-700',
    },
  };

  const currentTemplate = templates[template as keyof typeof templates];

  return (
    <div className="space-y-6">
      {/* Certificate Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Certificate Generator
          </CardTitle>
          <CardDescription>
            Generate completion certificates for interns
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Template Selection */}
          <div className="space-y-2">
            <Label>Certificate Template</Label>
            <Select value={template} onValueChange={setTemplate}>
              <SelectTrigger>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="internName">Intern Name</Label>
              <Input
                id="internName"
                value={certificateData.internName}
                onChange={(e) => setCertificateData(prev => ({ ...prev, internName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="internId">Employee ID</Label>
              <Input
                id="internId"
                value={certificateData.internId}
                onChange={(e) => setCertificateData(prev => ({ ...prev, internId: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={certificateData.department}
                onChange={(e) => setCertificateData(prev => ({ ...prev, department: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="performance">Performance Rating</Label>
              <Select 
                value={certificateData.performance} 
                onValueChange={(value) => setCertificateData(prev => ({ ...prev, performance: value }))}
              >
                <SelectTrigger>
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
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={certificateData.startDate}
                onChange={(e) => setCertificateData(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={certificateData.endDate}
                onChange={(e) => setCertificateData(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customText">Custom Message (Optional)</Label>
            <Textarea
              id="customText"
              placeholder="Add a personal message or additional achievements..."
              value={certificateData.customText}
              onChange={(e) => setCertificateData(prev => ({ ...prev, customText: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={generatePDF} disabled={isGenerating || !certificateData.internName}>
              <Download className="h-4 w-4 mr-2" />
              {isGenerating ? 'Generating...' : 'Download Certificate'}
            </Button>
            {onClose && (
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Certificate Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Certificate Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto bg-gray-100 p-4 rounded-lg">
            <div
              ref={certificateRef}
              className={`w-[900px] h-[700px] mx-auto p-12 ${currentTemplate.bgColor} ${currentTemplate.borderColor} border-8 relative shadow-2xl`}
              style={{ fontFamily: 'serif' }}
            >
              {/* Watermark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-gray-200 text-8xl font-bold transform rotate-45 opacity-10 select-none">
                  SLT FINANCE INDIA
                </div>
              </div>

              {/* Decorative corner elements */}
              <div className="absolute top-6 left-6 w-16 h-16 border-l-4 border-t-4 border-current opacity-20"></div>
              <div className="absolute top-6 right-6 w-16 h-16 border-r-4 border-t-4 border-current opacity-20"></div>
              <div className="absolute bottom-6 left-6 w-16 h-16 border-l-4 border-b-4 border-current opacity-20"></div>
              <div className="absolute bottom-6 right-6 w-16 h-16 border-r-4 border-b-4 border-current opacity-20"></div>

              {/* Header with Logo */}
              <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-6">
                  <img 
                    src="/lovable-uploads/eff44302-96f7-4db7-8e46-3633f8bb8a1e.png" 
                    alt="SLT Finance India Logo" 
                    className="h-20 w-auto"
                  />
                </div>
                <div className="space-y-3">
                  <h1 className={`text-5xl font-bold ${currentTemplate.accentColor} tracking-wide`}>
                    CERTIFICATE OF COMPLETION
                  </h1>
                  <p className="text-lg text-gray-600 font-semibold tracking-wider">INTERNSHIP PROGRAM</p>
                  <div className="w-64 h-1 bg-gradient-to-r from-transparent via-current to-transparent mx-auto opacity-40"></div>
                </div>
              </div>

              {/* Content */}
              <div className="text-center space-y-8">
                <div className="space-y-4">
                  <p className="text-xl text-gray-700 font-medium italic">This is to certify that</p>
                  
                  <div className="relative py-4">
                    <h2 className="text-5xl font-bold text-gray-800 mb-4 tracking-wide">
                      {certificateData.internName || '[Intern Name]'}
                    </h2>
                    <div className="w-96 h-1 bg-gradient-to-r from-transparent via-gray-500 to-transparent mx-auto"></div>
                  </div>

                  <p className="text-xl text-gray-700 font-medium">
                    has successfully completed the internship program at
                  </p>

                  <div className="py-2">
                    <h3 className={`text-4xl font-bold ${currentTemplate.accentColor} tracking-wide`}>
                      SLT Finance India
                    </h3>
                    <p className="text-lg text-gray-600 font-medium mt-2">
                      in the {certificateData.department || '[Department]'} Department
                    </p>
                  </div>
                </div>

                {/* Enhanced Details Section */}
                <div className="bg-white/60 rounded-xl p-8 my-8 shadow-lg border border-gray-200">
                  <div className="grid grid-cols-2 gap-8 text-base">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-600 font-medium mb-2">Employee ID</p>
                      <p className="text-xl font-bold text-gray-800">{certificateData.internId || '[ID]'}</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-600 font-medium mb-2">Performance Rating</p>
                      <Badge className="text-lg font-bold px-4 py-2">{certificateData.performance}</Badge>
                    </div>
                  </div>
                  
                  <div className="mt-6 text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-gray-600 font-medium mb-2">Program Duration</p>
                    <p className="text-xl font-bold text-gray-800">
                      {certificateData.startDate && certificateData.endDate 
                        ? `${format(new Date(certificateData.startDate), 'MMM dd, yyyy')} - ${format(new Date(certificateData.endDate), 'MMM dd, yyyy')}`
                        : '[Duration]'
                      }
                    </p>
                  </div>
                  
                  {/* Achievement metrics */}
                  <div className="grid grid-cols-2 gap-6 mt-6 pt-6 border-t border-gray-300">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-blue-600">{certificateData.totalCoins}</p>
                      <p className="text-sm text-gray-600 font-medium">SLT Coins Earned</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-green-600">{certificateData.completedTasks}</p>
                      <p className="text-sm text-gray-600 font-medium">Tasks Completed</p>
                    </div>
                  </div>
                </div>

                {certificateData.customText && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-left">
                    <p className="text-sm text-gray-700 italic">
                      {certificateData.customText}
                    </p>
                  </div>
                )}
              </div>

              {/* Enhanced Footer */}
              <div className="absolute bottom-12 left-12 right-12">
                <div className="grid grid-cols-3 gap-8 items-end">
                  <div className="text-center">
                    <div className="w-40 border-b-2 border-gray-600 mb-3 mx-auto"></div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-700 font-semibold">Issue Date</p>
                      <p className="text-sm font-bold text-gray-800">
                        {format(new Date(), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mb-3 mx-auto border-2 border-blue-400 shadow-lg">
                      <div className="text-center">
                        <Award className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                        <span className="text-xs text-blue-700 font-bold">VERIFIED</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-40 border-b-2 border-gray-600 mb-3 mx-auto"></div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-700 font-semibold">Authorized Signature</p>
                      <p className="text-sm font-bold text-gray-800">HR Manager</p>
                      <p className="text-xs text-gray-600">SLT Finance India</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}