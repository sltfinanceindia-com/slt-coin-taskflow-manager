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
        width: 1400,
        height: 990,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      
      const imgWidth = 297; // A4 landscape width
      const imgHeight = 210; // A4 landscape height
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`certificate-${certificateData.internName.replace(/\s+/g, '-').toLowerCase()}.pdf`);
      
      toast({
        title: "Certificate Generated",
        description: "Certificate has been downloaded successfully.",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
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

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4">
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
            <div className="space-y-2">
              <Label htmlFor="totalCoins">Total Coins</Label>
              <Input
                id="totalCoins"
                type="number"
                value={certificateData.totalCoins}
                onChange={(e) => setCertificateData(prev => ({ ...prev, totalCoins: parseInt(e.target.value) || 0 }))}
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
          <div className="overflow-x-auto bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-lg">
            <div className="flex justify-center">
              <div
                ref={certificateRef}
                className="w-[1400px] h-[990px] bg-white relative shadow-2xl border-4 border-blue-600"
                style={{ 
                  fontFamily: 'serif',
                  minWidth: '1400px'
                }}
              >
                {/* Decorative Corner Elements */}
                <div className="absolute top-0 left-0 w-32 h-32">
                  <div className="w-full h-full border-r-4 border-b-4 border-blue-300 rounded-br-3xl"></div>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32">
                  <div className="w-full h-full border-l-4 border-b-4 border-blue-300 rounded-bl-3xl"></div>
                </div>
                <div className="absolute bottom-0 left-0 w-32 h-32">
                  <div className="w-full h-full border-r-4 border-t-4 border-blue-300 rounded-tr-3xl"></div>
                </div>
                <div className="absolute bottom-0 right-0 w-32 h-32">
                  <div className="w-full h-full border-l-4 border-t-4 border-blue-300 rounded-tl-3xl"></div>
                </div>

                {/* Inner Border */}
                <div className="absolute inset-8 border-2 border-blue-200 rounded-lg"></div>

                {/* Header Section */}
                <div className="relative z-10 flex flex-col h-full">
                  <div className="px-16 py-12 border-b-4 border-blue-600">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <img 
                          src="/lovable-uploads/eff44302-96f7-4db7-8e46-3633f8bb8a1e.png" 
                          alt="SLT Finance India Logo" 
                          className="h-20 w-auto"
                        />
                        <div>
                          <h1 className="text-3xl font-bold text-blue-700 tracking-widest">SLT FINANCE INDIA</h1>
                          <p className="text-base text-gray-600 tracking-wide mt-2">BUILDING FUTURE IN FINANCE & TECHNOLOGY</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="bg-blue-50 px-6 py-4 rounded-lg border-2 border-blue-200">
                          <p className="text-sm text-blue-600 font-semibold">Certificate No.</p>
                          <p className="text-lg font-bold text-blue-800">SLT-{new Date().getFullYear()}-{String(Math.floor(Math.random() * 1000)).padStart(3, '0')}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-center mt-12">
                      <h2 className="text-5xl font-bold text-blue-700 tracking-widest mb-4">
                        CERTIFICATE OF COMPLETION
                      </h2>
                      <div className="w-40 h-1 bg-gradient-to-r from-blue-400 to-blue-600 mx-auto mb-4"></div>
                      <p className="text-xl text-gray-600 font-semibold tracking-wider">
                        INTERNSHIP PROGRAM
                      </p>
                    </div>
                  </div>

                  {/* Main Content Section */}
                  <div className="flex-1 px-16 py-16 flex flex-col justify-center">
                    <div className="text-center space-y-8">
                      <p className="text-2xl text-gray-700 font-medium">This is to certify that</p>
                      
                      {/* Intern Name Section */}
                      <div className="py-8">
                        <div className="bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50 py-8 px-12 border-l-8 border-blue-500 max-w-4xl mx-auto rounded-r-2xl shadow-lg">
                          <h3 className="text-6xl font-bold text-blue-800 tracking-wide uppercase mb-3">
                            {certificateData.internName || 'INTERN NAME'}
                          </h3>
                          <p className="text-xl text-blue-600 font-medium">
                            Employee ID: {certificateData.internId || 'EMP001'}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <p className="text-2xl text-gray-700 font-medium">
                          has successfully completed the internship program
                        </p>
                        <p className="text-2xl text-gray-700 font-medium">
                          in the <span className="font-bold text-blue-700 text-3xl">{certificateData.department || 'Technology'}</span> Department
                        </p>
                        
                        {/* Duration Box */}
                        <div className="bg-gray-50 border-2 border-gray-200 py-6 px-8 rounded-xl max-w-2xl mx-auto">
                          <p className="text-lg font-bold text-gray-700 mb-2">Program Duration</p>
                          <p className="text-xl text-gray-600">
                            {certificateData.startDate ? format(new Date(certificateData.startDate), 'MMMM dd, yyyy') : 'Start Date'} 
                            <span className="mx-4">to</span> 
                            {certificateData.endDate ? format(new Date(certificateData.endDate), 'MMMM dd, yyyy') : 'End Date'}
                          </p>
                        </div>

                        {/* Custom Message */}
                        {certificateData.customText && (
                          <div className="bg-blue-25 border-2 border-blue-200 rounded-xl p-6 max-w-3xl mx-auto">
                            <p className="text-lg text-blue-700 italic font-medium">{certificateData.customText}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Section */}
                  <div className="px-16 py-12 border-t-4 border-blue-600">
                    <div className="grid grid-cols-3 gap-12">
                      {/* Performance Rating */}
                      <div className="text-center">
                        <h5 className="text-lg font-bold text-gray-700 mb-6 uppercase tracking-wide">Performance Rating</h5>
                        <div className="bg-yellow-50 border-3 border-yellow-300 rounded-xl p-6">
                          <div className="text-2xl font-bold text-yellow-700 mb-3">{certificateData.performance}</div>
                          <div className="flex justify-center space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span key={star} className={star <= 4 ? "text-yellow-500 text-2xl" : "text-gray-300 text-2xl"}>
                                ⭐
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* SLT Coins */}
                      <div className="text-center">
                        <h5 className="text-lg font-bold text-gray-700 mb-6 uppercase tracking-wide">Achievement</h5>
                        <div className="bg-blue-50 border-3 border-blue-300 rounded-xl p-6">
                          <p className="text-base text-blue-600 mb-2 font-medium">SLT Coins Earned</p>
                          <p className="text-4xl font-bold text-blue-700 mb-2">{certificateData.totalCoins || '0'}</p>
                          <p className="text-sm text-blue-500 font-medium">Excellence Points</p>
                        </div>
                      </div>
                      
                      {/* Signature Section */}
                      <div className="text-center">
                        <h5 className="text-lg font-bold text-gray-700 mb-6 uppercase tracking-wide">Authorized By</h5>
                        <div className="space-y-4">
                          <div className="w-48 border-b-3 border-gray-800 mx-auto"></div>
                          <div className="flex items-center justify-center gap-4">
                            <div className="text-center">
                              <p className="text-lg font-bold text-gray-800 mb-1">{certificateData.authorityName || 'Authority Name'}</p>
                              <p className="text-base text-gray-600 mb-1">{certificateData.signatureAuthority || 'Position'}</p>
                              <p className="text-sm text-gray-500">SLT Finance India</p>
                            </div>
                            <div className="w-16 h-16 rounded-full bg-blue-100 border-3 border-blue-300 flex items-center justify-center">
                              <span className="text-lg font-bold text-blue-600">SLT</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Date Issued */}
                    <div className="text-center mt-12">
                      <p className="text-lg text-gray-600">
                        <span className="font-bold">Date Issued:</span> {format(new Date(), 'MMMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom Accent Bar */}
                <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-center">
                  <p className="text-white text-sm font-bold tracking-widest">CERTIFICATE OF ACHIEVEMENT • SLT FINANCE INDIA</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
