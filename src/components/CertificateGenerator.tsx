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
  signatureAuthority: string;
  authorityName: string;
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
    signatureAuthority: 'HR Manager',
    authorityName: 'Rajesh Kumar',
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
              <Label htmlFor="signatureAuthority">Signature Authority</Label>
              <Select 
                value={certificateData.signatureAuthority} 
                onValueChange={(value) => setCertificateData(prev => ({ ...prev, signatureAuthority: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HR Manager">HR Manager</SelectItem>
                  <SelectItem value="Representative">Representative</SelectItem>
                  <SelectItem value="Director">Director</SelectItem>
                  <SelectItem value="Team Lead">Team Lead</SelectItem>
                  <SelectItem value="Project Manager">Project Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="authorityName">Authority Name</Label>
              <Input
                id="authorityName"
                value={certificateData.authorityName}
                onChange={(e) => setCertificateData(prev => ({ ...prev, authorityName: e.target.value }))}
                placeholder="Enter the name of the authority"
              />
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
              className="w-[1200px] h-[850px] mx-auto bg-white relative shadow-2xl border-2 border-gray-300"
              style={{ fontFamily: 'serif' }}
            >
              {/* Header Section */}
              <div className="flex items-center justify-between p-8 border-b-2 border-blue-600">
                {/* Logo and Company Name */}
                <div className="flex items-center space-x-4">
                  <img 
                    src="/lovable-uploads/eff44302-96f7-4db7-8e46-3633f8bb8a1e.png" 
                    alt="SLT Finance India Logo" 
                    className="h-12 w-auto"
                  />
                  <div className="text-left">
                    <div className="text-lg font-bold text-blue-600">SLT Finance</div>
                  </div>
                </div>
                
                {/* Certificate Title */}
                <div className="text-right">
                  <h1 className="text-3xl font-bold text-blue-600 tracking-wide">
                    CERTIFICATE OF COMPLETION
                  </h1>
                  <p className="text-sm text-gray-600 font-medium tracking-widest mt-1">
                    INTERNSHIP PROGRAM
                  </p>
                </div>
              </div>

              {/* Main Content */}
              <div className="px-16 py-12 text-center space-y-8">
                <p className="text-lg text-gray-700">This is to certify that</p>
                
                {/* Intern Name - Large and Bold */}
                <div className="py-4">
                  <h2 className="text-5xl font-bold text-blue-600 tracking-wide uppercase">
                    {certificateData.internName || 'INTERN NAME'}
                  </h2>
                </div>

                <div className="space-y-6">
                  <p className="text-lg text-gray-700">
                    has successfully completed the internship program at
                  </p>

                  {/* Company Name - Blue Highlight */}
                  <div className="bg-blue-600 text-white py-2 px-6 inline-block rounded">
                    <h3 className="text-xl font-bold tracking-wide">
                      SLT Finance India
                    </h3>
                  </div>

                  <p className="text-base text-gray-700">
                    in the <strong>{certificateData.department || 'Testing'}</strong> Department
                  </p>

                  <p className="text-base text-gray-700">
                    Employee ID: <strong>{certificateData.internId || '101'}</strong>
                  </p>
                </div>
              </div>

              {/* Bottom Section */}
              <div className="absolute bottom-20 left-16 right-16">
                <div className="flex justify-between items-start">
                  {/* Left: Performance Rating */}
                  <div className="text-left">
                    <p className="text-sm text-gray-600 font-medium mb-2">Performance Rating:</p>
                    <div className="flex space-x-1 mb-3">
                      {[1, 2, 3, 4].map((star) => (
                        <span key={star} className="text-yellow-500 text-lg">⭐</span>
                      ))}
                      <span className="text-gray-300 text-lg">☆</span>
                    </div>
                    <p className="text-sm text-gray-700 font-medium">
                      SLT Coins Earned: <strong>{certificateData.totalCoins || '145'}</strong>
                    </p>
                  </div>
                  
                  {/* Right: Signature and Seal */}
                  <div className="text-right">
                    <p className="text-sm text-gray-600 font-medium mb-4">Authorized Signature</p>
                    <div className="w-48 border-b-2 border-gray-800 mb-4"></div>
                    <div className="flex items-center justify-end space-x-6">
                      <div className="text-sm text-gray-700 text-center">
                        <p className="font-bold text-base">{certificateData.signatureAuthority}</p>
                        <p className="text-sm mt-1">{certificateData.authorityName}</p>
                      </div>
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center border-2 border-blue-600">
                        <div className="text-center">
                          <div className="text-xs text-blue-700 font-bold leading-tight">SLT<br />Finance</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="absolute bottom-0 left-0 right-0 bg-blue-600 text-white text-center py-3">
                <p className="text-sm font-semibold tracking-wide">
                  SLT Finance India – Building Future in Finance & Technology
                </p>
              </div>

              {certificateData.customText && (
                <div className="absolute bottom-24 left-16 right-16">
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-3 text-left">
                    <p className="text-xs text-gray-700 italic">
                      {certificateData.customText}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}