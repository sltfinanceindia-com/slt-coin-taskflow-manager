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
              className="w-[1200px] h-[800px] mx-auto bg-white relative shadow-2xl"
              style={{ fontFamily: 'serif' }}
            >
              {/* Certificate Border */}
              <div className="absolute inset-8 border-2 border-blue-600"></div>
              
              {/* Header Section */}
              <div className="relative z-10 px-12 pt-12">
                {/* Logo and Title */}
                <div className="flex items-start justify-between mb-8">
                  <div className="flex items-center">
                    <img 
                      src="/lovable-uploads/eff44302-96f7-4db7-8e46-3633f8bb8a1e.png" 
                      alt="SLT Finance India Logo" 
                      className="h-16 w-auto mr-4"
                    />
                    <div className="text-left">
                      <div className="text-xl font-bold text-blue-600">SLT Finance</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <h1 className="text-4xl font-bold text-blue-700 tracking-wider leading-tight">
                      CERTIFICATE OF<br />COMPLETION
                    </h1>
                    <p className="text-base text-gray-600 font-semibold tracking-widest mt-2">
                      INTERNSHIP PROGRAM
                    </p>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="relative z-10 px-12 text-center space-y-8 mt-12">
                <p className="text-lg text-gray-700">This is to certify that</p>
                
                {/* Intern Name - Large and Bold */}
                <div className="py-6">
                  <h2 className="text-6xl font-bold text-blue-700 tracking-wide uppercase">
                    {certificateData.internName || 'VYSHNAVI'}
                  </h2>
                </div>

                <div className="space-y-4">
                  <p className="text-lg text-gray-700">
                    has successfully completed the internship program at
                  </p>

                  {/* Company Name - Blue Highlight */}
                  <div className="bg-blue-600 text-white py-3 px-8 inline-block rounded">
                    <h3 className="text-2xl font-bold tracking-wide">
                      SLT Finance India
                    </h3>
                  </div>

                  <p className="text-base text-gray-700">
                    in the <strong>{certificateData.department || '[Department]'}</strong> Department
                  </p>

                  <p className="text-base text-gray-700">
                    Employee ID: <strong>{certificateData.internId || '[ID]'}</strong>
                  </p>
                </div>
              </div>

              {/* Bottom Section */}
              <div className="absolute bottom-16 left-12 right-12 z-10">
                <div className="border-t-2 border-blue-600 pt-6">
                  <div className="flex justify-between items-end">
                    {/* Left: Performance Rating */}
                    <div className="text-left">
                      <p className="text-sm text-gray-600 font-medium mb-2">Performance Rating:</p>
                      <div className="flex space-x-1 mb-2">
                        {[1, 2, 3, 4].map((star) => (
                          <span key={star} className="text-yellow-500 text-xl">⭐</span>
                        ))}
                        <span className="text-gray-300 text-xl">☆</span>
                      </div>
                      <p className="text-sm text-gray-700">
                        <strong>SLT Coins Earned: {certificateData.totalCoins || '120'}</strong>
                      </p>
                    </div>
                    
                    {/* Right: Signature and Seal */}
                    <div className="text-right">
                      <p className="text-sm text-gray-600 font-medium mb-2">Authorized Signature</p>
                      <div className="w-48 border-b-2 border-gray-800 mb-2"></div>
                      <div className="flex items-center justify-end space-x-4">
                        <div className="text-sm text-gray-700">
                          <p className="font-bold">HR Manager</p>
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
                <div className="bg-blue-700 text-white text-center py-3 mt-8 -mx-12">
                  <p className="text-base font-semibold tracking-wide">
                    SLT Finance India – Building Future in Finance & Technology
                  </p>
                </div>

                {certificateData.customText && (
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-4 text-left">
                    <p className="text-sm text-gray-700 italic">
                      {certificateData.customText}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}