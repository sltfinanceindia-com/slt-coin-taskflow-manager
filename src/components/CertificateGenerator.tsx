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
            Professional Certificate Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-lg">
            <div
              ref={certificateRef}
              className="w-[1400px] h-[990px] mx-auto bg-white relative shadow-2xl"
              style={{ 
                fontFamily: 'Times New Roman, serif',
                border: '2px solid #1e40af'
              }}
            >
              {/* Header Section with Logo and Title */}
              <div className="relative z-10 px-12 py-6 border-b-2 border-blue-600">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <img 
                      src="/lovable-uploads/eff44302-96f7-4db7-8e46-3633f8bb8a1e.png" 
                      alt="SLT Finance India Logo" 
                      className="h-12 w-auto mr-4"
                    />
                    <div className="text-left">
                      <h1 className="text-lg font-bold text-blue-600 tracking-wider">SLT FINANCE INDIA</h1>
                      <p className="text-xs text-gray-600 tracking-wide">BUILDING FUTURE IN FINANCE & TECHNOLOGY</p>
                    </div>
                  </div>
                </div>
                
                <div className="text-center mt-6">
                  <h2 className="text-3xl font-bold text-blue-700 tracking-widest mb-2">
                    CERTIFICATE OF COMPLETION
                  </h2>
                  <p className="text-base text-gray-600 font-semibold tracking-wider">
                    INTERNSHIP PROGRAM
                  </p>
                </div>
              </div>

              {/* Main Content Section */}
              <div className="relative z-10 px-12 py-8 text-center">
                <div className="mb-4">
                  <p className="text-base text-gray-700">This is to certify that</p>
                </div>
                
                {/* Intern Name with Elegant Styling */}
                <div className="py-4 mb-6">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 py-3 px-6 border-l-4 border-blue-500 max-w-2xl mx-auto">
                    <h3 className="text-3xl font-bold text-blue-800 tracking-wide uppercase mb-1">
                      {certificateData.internName || 'NAKKALA NAVEEN'}
                    </h3>
                    <p className="text-sm text-blue-600 font-medium">
                      Employee ID: {certificateData.internId || '101'}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <p className="text-base text-gray-700">
                    has successfully completed the internship program
                  </p>

                  <p className="text-base text-gray-700">
                    in the <span className="font-bold text-blue-700">{certificateData.department || 'Testing'}</span> Department
                  </p>

                  <div className="text-sm text-gray-600 mt-4">
                    <p><strong>Duration:</strong> {certificateData.startDate ? format(new Date(certificateData.startDate), 'MMM dd, yyyy') : 'Start Date: Sep 10, 2025'} - {certificateData.endDate ? format(new Date(certificateData.endDate), 'MMM dd, yyyy') : 'Dec 10, 2025'}</p>
                  </div>
                </div>
              </div>

              {/* Bottom Section - Fixed Position */}
              <div className="relative z-10 px-12 pb-16">
                <div className="grid grid-cols-2 gap-8 items-end">
                  {/* Left: Performance Rating */}
                  <div className="text-left">
                    <h5 className="text-sm font-bold text-gray-700 mb-3 uppercase">Performance Assessment</h5>
                    <div className="mb-2">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-gray-600">Rating:</span>
                        <span className="font-bold text-yellow-600">{certificateData.performance}</span>
                      </div>
                      <div className="flex space-x-1 mb-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star} className={star <= 4 ? "text-yellow-500 text-base" : "text-gray-300 text-base"}>
                            ⭐
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="bg-blue-50 p-2 rounded border border-blue-200">
                      <p className="text-sm font-bold text-blue-700">
                        SLT Coins Earned: <span className="text-base">{certificateData.totalCoins || '445'}</span>
                      </p>
                    </div>
                  </div>
                  
                  {/* Right: Signature Section */}
                  <div className="text-center">
                    <h5 className="text-sm font-bold text-gray-700 mb-3 uppercase">Authorized Signature</h5>
                    <div className="w-48 border-b-2 border-gray-800 mb-3 mx-auto"></div>
                    <div className="flex items-center justify-center gap-3">
                      <div className="text-center">
                        <p className="text-sm font-bold text-gray-800 mb-1">{certificateData.authorityName || 'Rajesh Kumar'}</p>
                        <p className="text-xs text-gray-600">{certificateData.signatureAuthority || 'HR Manager'}</p>
                        <p className="text-xs text-gray-500">SLT Finance India</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-blue-100 border-2 border-blue-300 flex items-center justify-center ml-3">
                        <span className="text-xs font-bold text-blue-600">SLT</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Border */}
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-blue-600 flex items-center justify-center">
                <p className="text-white text-xs font-bold tracking-widest">CERTIFICATE OF ACHIEVEMENT • SLT</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
