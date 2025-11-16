import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Download, Award, FileText, Share2, Calendar } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format, differenceInMonths } from 'date-fns';

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
  const [eligibility, setEligibility] = useState<{
    eligible: boolean;
    monthsCompleted: number;
    monthsRemaining: number;
  } | null>(null);
  
  const [certificateData, setCertificateData] = useState<CertificateData>({
    internName: internData?.full_name || profile?.full_name || '',
    internId: internData?.employee_id || profile?.employee_id || '',
    department: internData?.department || profile?.department || '',
    startDate: internData?.start_date || profile?.start_date || '',
    endDate: internData?.end_date || profile?.end_date || format(new Date(), 'yyyy-MM-dd'),
    totalHours: 0,
    totalCoins: internData?.total_coins || profile?.total_coins || 0,
    completedTasks: 0,
    performance: 'Excellent',
    customText: '',
    signatureAuthority: 'HR Manager',
    authorityName: 'Rajesh Kumar',
  });

  const isAdmin = profile?.role === 'admin';
  const isIntern = profile?.role === 'intern';
  
  // Check eligibility for interns
  useState(() => {
    if (isIntern && profile?.start_date) {
      const startDate = new Date(profile.start_date);
      const endDate = profile.end_date ? new Date(profile.end_date) : new Date();
      const monthsCompleted = differenceInMonths(endDate, startDate);
      const eligible = monthsCompleted >= 6;
      
      setEligibility({
        eligible,
        monthsCompleted,
        monthsRemaining: eligible ? 0 : 6 - monthsCompleted
      });
    }
  });

  const downloadCertificate = async () => {
    if (!profile?.id) return;
    
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-certificate', {
        body: { internId: profile.id }
      });

      if (error) throw error;

      if (!data.eligible) {
        toast({
          title: "Not Eligible Yet",
          description: `You need ${data.monthsRemaining} more month(s) to complete your 6-month internship.`,
          variant: "destructive",
        });
        return;
      }

      // Download the certificate
      if (data.url) {
        window.open(data.url, '_blank');
        toast({
          title: "Certificate Downloaded",
          description: "Your certificate has been generated successfully.",
        });
      }
    } catch (error: any) {
      console.error('Error downloading certificate:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate certificate.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Intern view - show eligibility and download option
  if (isIntern) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            My Certificate
          </CardTitle>
          <CardDescription>
            Download your completion certificate after completing 6 months
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {eligibility && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span className="font-medium">Internship Duration</span>
                </div>
                <Badge variant={eligibility.eligible ? "default" : "secondary"}>
                  {eligibility.monthsCompleted} / 6 months
                </Badge>
              </div>
              
              {eligibility.eligible ? (
                <div className="text-center space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-800 font-medium">
                      🎉 Congratulations! You're eligible to download your certificate.
                    </p>
                  </div>
                  <Button 
                    onClick={downloadCertificate} 
                    disabled={isGenerating}
                    size="lg"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {isGenerating ? 'Generating...' : 'Download My Certificate'}
                  </Button>
                </div>
              ) : (
                <div className="text-center space-y-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 font-medium">
                    You need {eligibility.monthsRemaining} more month(s) to be eligible.
                  </p>
                  <p className="text-sm text-yellow-700">
                    Keep up the great work! Your certificate will be available after completing 6 months.
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Admin view - full certificate generation UI
  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Certificate generation is available for administrators and interns.</p>
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
      
      const imgWidth = 297;
      const imgHeight = 210;
      
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
      bgColor: 'bg-gradient-to-br from-green-50 to-green-100',
      borderColor: 'border-green-600',
      accentColor: 'text-green-700',
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
                className="w-[1400px] h-[990px] bg-white relative shadow-2xl"
                style={{ 
                  fontFamily: 'serif',
                  minWidth: '1400px',
                  border: '6px solid #374151', // Dark grey outer border
                }}
              >
                {/* Green Inner Border */}
                <div className="absolute inset-3 border-4 border-green-600 rounded-lg">
                  {/* Secondary inner border */}
                  <div className="absolute inset-3 border-2 border-gray-300 rounded-lg"></div>
                </div>

                {/* Decorative Corner Elements with Green Theme */}
                <div className="absolute top-0 left-0 w-32 h-32 z-10">
                  <div className="w-full h-full border-r-4 border-b-4 border-green-500 rounded-br-3xl bg-gradient-to-br from-green-50 to-green-100"></div>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 z-10">
                  <div className="w-full h-full border-l-4 border-b-4 border-green-500 rounded-bl-3xl bg-gradient-to-bl from-green-50 to-green-100"></div>
                </div>
                <div className="absolute bottom-0 left-0 w-32 h-32 z-10">
                  <div className="w-full h-full border-r-4 border-t-4 border-green-500 rounded-tr-3xl bg-gradient-to-tr from-green-50 to-green-100"></div>
                </div>
                <div className="absolute bottom-0 right-0 w-32 h-32 z-10">
                  <div className="w-full h-full border-l-4 border-t-4 border-green-500 rounded-tl-3xl bg-gradient-to-tl from-green-50 to-green-100"></div>
                </div>

                {/* Header Section with Green Theme - FIXED ALIGNMENT */}
                <div className="relative z-20 px-16 py-8">
                  <div className="grid grid-cols-3 items-start gap-4 mb-6">
                    {/* Left: Logo */}
                    <div className="flex items-center justify-start">
                      <img 
                        src="/lovable-uploads/eff44302-96f7-4db7-8e46-3633f8bb8a1e.png" 
                        alt="SLT Finance India Logo" 
                        className="h-16 w-auto"
                      />
                    </div>
                    
                    {/* Center: Company Name - FIXED WITHOUT TRANSFORM */}
                    <div className="flex flex-col items-center justify-center text-center">
                      <h1 className="text-2xl font-bold text-green-700 tracking-wider whitespace-nowrap">SLT FINANCE INDIA</h1>
                      <p className="text-sm text-gray-600 tracking-wide mt-1">Your Wealth Is Our Future</p>
                    </div>
                    
                    {/* Right: Certificate Number */}
                    <div className="flex items-center justify-end">
                      <div className="bg-green-50 px-4 py-2 rounded-lg border-2 border-green-300">
                        <p className="text-xs text-green-700 font-semibold">Certificate No.</p>
                        <p className="text-sm font-bold text-gray-800">SLT-{new Date().getFullYear()}-{String(Math.floor(Math.random() * 1000)).padStart(3, '0')}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center mt-8">
                    <h2 className="text-4xl font-bold text-gray-700 tracking-widest mb-3">
                      CERTIFICATE OF COMPLETION
                    </h2>
                    <p className="text-lg text-gray-600 font-semibold tracking-wider">
                      INTERNSHIP PROGRAM
                    </p>
                  </div>
                </div>

                {/* Main Content Section */}
                <div className="relative z-20 px-16 py-12 text-center">
                  <div className="mb-8">
                    <p className="text-lg text-gray-700 font-medium">This is to certify that</p>
                  </div>
                  
                  {/* Intern Name with Green Styling */}
                  <div className="py-6 mb-8">
                    <div className="bg-gradient-to-r from-green-50 via-green-100 to-green-50 py-6 px-8 border-l-6 border-green-600 max-w-3xl mx-auto rounded-r-lg shadow-lg border-2 border-gray-300">
                      <h3 className="text-4xl font-bold text-gray-800 tracking-wide uppercase mb-2">
                        {certificateData.internName || 'INTERN NAME'}
                      </h3>
                      <p className="text-base text-green-700 font-medium">
                        Employee ID: {certificateData.internId || 'EMP001'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    <p className="text-lg text-gray-700 font-medium">
                      has successfully completed the internship program
                    </p>
                    <p className="text-lg text-gray-700 font-medium">
                      in the <span className="font-bold text-green-700 text-xl">{certificateData.department || 'Technology'}</span> Department
                    </p>
                    <div className="text-base text-gray-600 mt-6 bg-gray-50 py-3 px-6 rounded-lg max-w-lg mx-auto border-2 border-gray-300">
                      <p><strong>Program Duration:</strong></p>
                      <p className="mt-1">
                        {certificateData.startDate ? format(new Date(certificateData.startDate), 'MMMM dd, yyyy') : 'Start Date'} to {certificateData.endDate ? format(new Date(certificateData.endDate), 'MMMM dd, yyyy') : 'End Date'}
                      </p>
                    </div>
                  </div>

                  {/* Custom Message */}
                  {certificateData.customText && (
                    <div className="mb-6">
                      <div className="bg-green-25 border-2 border-green-300 rounded-lg p-4 max-w-2xl mx-auto">
                        <p className="text-sm text-green-800 italic font-medium">{certificateData.customText}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Section - Performance and Signature */}
                <div className="absolute bottom-24 left-0 right-0 px-16 z-20">
                  <div className="grid grid-cols-3 gap-8 items-end">
                    {/* Left: Performance Rating */}
                    <div className="text-center">
                      <h5 className="text-sm font-bold text-gray-700 mb-4 uppercase">Performance Rating</h5>
                      <div className="bg-yellow-50 border-3 border-yellow-400 rounded-lg p-4 shadow-md">
                        <div className="flex items-center justify-center gap-2 mb-3">
                          <span className="text-lg font-bold text-yellow-700">{certificateData.performance}</span>
                        </div>
                        <div className="flex justify-center space-x-1 mb-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star} className={star <= 4 ? "text-yellow-500 text-lg" : "text-gray-300 text-lg"}>
                              ⭐
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Center: SLT Coins */}
                    <div className="text-center">
                      <h5 className="text-sm font-bold text-gray-700 mb-4 uppercase">Achievement</h5>
                      <div className="bg-green-50 border-3 border-green-400 rounded-lg p-4 shadow-md">
                        <div className="text-center">
                          <p className="text-xs text-green-700 mb-1 font-medium">SLT Coins Earned</p>
                          <p className="text-2xl font-bold text-green-800">{certificateData.totalCoins || '0'}</p>
                          <p className="text-xs text-green-600 mt-1 font-medium">Excellence Points</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Right: Signature Section */}
                    <div className="text-center">
                      <h5 className="text-sm font-bold text-gray-700 mb-4 uppercase">Authorized By</h5>
                      <div className="relative">
                        <div className="w-40 border-b-3 border-gray-800 mb-4 mx-auto"></div>
                        <div className="flex items-center justify-center">
                          <div className="text-center mr-3">
                            <p className="text-sm font-bold text-gray-800 mb-1">{certificateData.authorityName || 'Authority Name'}</p>
                            <p className="text-xs text-gray-600">{certificateData.signatureAuthority || 'Position'}</p>
                            <p className="text-xs text-gray-500">SLT Finance India</p>
                          </div>
                          <div className="w-12 h-12 rounded-full bg-green-100 border-3 border-green-400 flex items-center justify-center shadow-md">
                            <span className="text-sm font-bold text-green-700">SLT</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Date Issued */}
                <div className="absolute bottom-12 left-16 right-16 text-center z-20">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Date Issued:</span> {format(new Date(), 'MMMM dd, yyyy')}
                  </p>
                </div>

                {/* Bottom Border with Green Theme */}
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-r from-gray-700 to-green-700 flex items-center justify-center z-20">
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
