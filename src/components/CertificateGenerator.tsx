import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Download, Award, FileText, Share2, Star, Shield, Trophy, Medal } from 'lucide-react';
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
  skills?: string[];
  projects?: string[];
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
    totalHours: internData?.total_hours || 240,
    totalCoins: internData?.total_coins || 0,
    completedTasks: internData?.completed_tasks || 0,
    performance: 'Excellent',
    customText: '',
    signatureAuthority: 'HR Manager',
    authorityName: 'Rajesh Kumar',
    skills: ['Financial Analysis', 'Team Collaboration', 'Project Management'],
    projects: ['SLT Finance Dashboard', 'Customer Analytics System']
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
        scale: 3,
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
      pdf.save(`SLT-Finance-Certificate-${certificateData.internName.replace(/\s+/g, '-').toLowerCase()}.pdf`);
      
      toast({
        title: "🎉 Certificate Generated Successfully!",
        description: "Professional internship certificate has been downloaded.",
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

  const getPerformanceRating = (performance: string) => {
    const ratings = {
      'Outstanding': { stars: 5, color: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-400' },
      'Excellent': { stars: 4, color: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-400' },
      'Good': { stars: 3, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-400' },
      'Satisfactory': { stars: 2, color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-400' }
    };
    return ratings[performance as keyof typeof ratings] || ratings.Excellent;
  };

  const certificateNumber = `SLT-CERT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4">
      {/* Enhanced Certificate Form */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-green-100 rounded-lg">
              <Award className="h-6 w-6 text-green-700" />
            </div>
            Professional Certificate Generator
          </CardTitle>
          <CardDescription className="text-base">
            Create stunning completion certificates for intern achievements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 p-6">
          {/* Template Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Certificate Template</Label>
            <Select value={template} onValueChange={setTemplate}>
              <SelectTrigger className="h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="formal">🎓 Formal Corporate</SelectItem>
                <SelectItem value="creative">🎨 Creative Modern</SelectItem>
                <SelectItem value="minimalist">📋 Minimalist Clean</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Enhanced Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-3">
              <Label htmlFor="internName" className="text-base font-semibold">Intern Full Name</Label>
              <Input
                id="internName"
                value={certificateData.internName}
                onChange={(e) => setCertificateData(prev => ({ ...prev, internName: e.target.value }))}
                className="h-12"
                placeholder="Enter full name"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="internId" className="text-base font-semibold">Employee ID</Label>
              <Input
                id="internId"
                value={certificateData.internId}
                onChange={(e) => setCertificateData(prev => ({ ...prev, internId: e.target.value }))}
                className="h-12"
                placeholder="EMP001"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="department" className="text-base font-semibold">Department</Label>
              <Select 
                value={certificateData.department} 
                onValueChange={(value) => setCertificateData(prev => ({ ...prev, department: value }))}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Technology">💻 Technology</SelectItem>
                  <SelectItem value="Finance">💰 Finance</SelectItem>
                  <SelectItem value="Marketing">📈 Marketing</SelectItem>
                  <SelectItem value="Operations">⚙️ Operations</SelectItem>
                  <SelectItem value="Human Resources">👥 Human Resources</SelectItem>
                  <SelectItem value="Sales">💼 Sales</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label htmlFor="performance" className="text-base font-semibold">Performance Rating</Label>
              <Select 
                value={certificateData.performance} 
                onValueChange={(value) => setCertificateData(prev => ({ ...prev, performance: value }))}
              >
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Outstanding">⭐ Outstanding</SelectItem>
                  <SelectItem value="Excellent">🌟 Excellent</SelectItem>
                  <SelectItem value="Good">👍 Good</SelectItem>
                  <SelectItem value="Satisfactory">✅ Satisfactory</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label htmlFor="totalHours" className="text-base font-semibold">Total Hours</Label>
              <Input
                id="totalHours"
                type="number"
                value={certificateData.totalHours}
                onChange={(e) => setCertificateData(prev => ({ ...prev, totalHours: parseInt(e.target.value) || 0 }))}
                className="h-12"
                placeholder="240"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="totalCoins" className="text-base font-semibold">SLT Coins Earned</Label>
              <Input
                id="totalCoins"
                type="number"
                value={certificateData.totalCoins}
                onChange={(e) => setCertificateData(prev => ({ ...prev, totalCoins: parseInt(e.target.value) || 0 }))}
                className="h-12"
                placeholder="500"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="startDate" className="text-base font-semibold">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={certificateData.startDate}
                onChange={(e) => setCertificateData(prev => ({ ...prev, startDate: e.target.value }))}
                className="h-12"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="endDate" className="text-base font-semibold">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={certificateData.endDate}
                onChange={(e) => setCertificateData(prev => ({ ...prev, endDate: e.target.value }))}
                className="h-12"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="authorityName" className="text-base font-semibold">Authority Name</Label>
              <Input
                id="authorityName"
                value={certificateData.authorityName}
                onChange={(e) => setCertificateData(prev => ({ ...prev, authorityName: e.target.value }))}
                className="h-12"
                placeholder="Rajesh Kumar"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="customText" className="text-base font-semibold">Achievement Message (Optional)</Label>
            <Textarea
              id="customText"
              placeholder="Add special achievements, recognitions, or personalized message..."
              value={certificateData.customText}
              onChange={(e) => setCertificateData(prev => ({ ...prev, customText: e.target.value }))}
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="flex gap-4">
            <Button 
              onClick={generatePDF} 
              disabled={isGenerating || !certificateData.internName}
              className="h-12 px-8 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
              size="lg"
            >
              <Download className="h-5 w-5 mr-2" />
              {isGenerating ? 'Generating...' : 'Download Professional Certificate'}
            </Button>
            {onClose && (
              <Button variant="outline" onClick={onClose} className="h-12 px-8" size="lg">
                Close
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Certificate Preview */}
      <Card className="shadow-xl">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-700" />
            </div>
            Professional Certificate Preview
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="bg-gradient-to-br from-slate-100 via-slate-50 to-white p-8">
            <div className="flex justify-center">
              <div
                ref={certificateRef}
                className="w-[1400px] h-[990px] bg-white relative shadow-2xl"
                style={{ 
                  fontFamily: 'serif',
                  minWidth: '1400px',
                }}
              >
                {/* Elegant Multi-Layer Border System */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-900 via-green-800 to-green-900 p-2 rounded-lg">
                  <div className="w-full h-full bg-gradient-to-br from-gray-700 via-gray-600 to-gray-700 p-1 rounded-lg">
                    <div className="w-full h-full bg-white p-3 rounded-lg">
                      <div className="w-full h-full border-4 border-green-600 rounded-lg relative">
                        <div className="absolute inset-4 border-2 border-gray-300 rounded-lg">
                          <div className="absolute inset-2 border border-green-200 rounded-lg"></div>
                        </div>

                        {/* Premium Corner Decorations */}
                        <div className="absolute top-0 left-0 w-40 h-40 z-10">
                          <div className="w-full h-full bg-gradient-to-br from-green-100 via-green-50 to-white rounded-br-[80px] border-r-4 border-b-4 border-green-500 flex items-center justify-center">
                            <div className="text-green-700">
                              <Trophy className="h-8 w-8" />
                            </div>
                          </div>
                        </div>
                        <div className="absolute top-0 right-0 w-40 h-40 z-10">
                          <div className="w-full h-full bg-gradient-to-bl from-green-100 via-green-50 to-white rounded-bl-[80px] border-l-4 border-b-4 border-green-500 flex items-center justify-center">
                            <div className="text-green-700">
                              <Star className="h-8 w-8" />
                            </div>
                          </div>
                        </div>
                        <div className="absolute bottom-0 left-0 w-40 h-40 z-10">
                          <div className="w-full h-full bg-gradient-to-tr from-green-100 via-green-50 to-white rounded-tr-[80px] border-r-4 border-t-4 border-green-500 flex items-center justify-center">
                            <div className="text-green-700">
                              <Medal className="h-8 w-8" />
                            </div>
                          </div>
                        </div>
                        <div className="absolute bottom-0 right-0 w-40 h-40 z-10">
                          <div className="w-full h-full bg-gradient-to-tl from-green-100 via-green-50 to-white rounded-tl-[80px] border-l-4 border-t-4 border-green-500 flex items-center justify-center">
                            <div className="text-green-700">
                              <Shield className="h-8 w-8" />
                            </div>
                          </div>
                        </div>

                        {/* Premium Header Section */}
                        <div className="relative z-20 px-20 py-10 border-b-4 border-gray-600">
                          <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center">
                              <div className="bg-white p-2 rounded-lg shadow-lg border-2 border-green-200">
                                <img 
                                  src="/lovable-uploads/eff44302-96f7-4db7-8e46-3633f8bb8a1e.png" 
                                  alt="SLT Finance India Logo" 
                                  className="h-16 w-auto"
                                />
                              </div>
                            </div>
                            
                            <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
                              <div className="bg-gradient-to-r from-green-50 to-green-100 px-6 py-3 rounded-xl border-2 border-green-200 shadow-lg">
                                <h1 className="text-2xl font-bold text-green-800 tracking-wider">SLT FINANCE INDIA</h1>
                                <div className="w-32 h-0.5 bg-gradient-to-r from-green-500 to-green-700 mx-auto my-2"></div>
                                <p className="text-sm text-gray-700 tracking-wide font-medium">Your Wealth Is Our Future</p>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className="bg-gradient-to-br from-green-50 to-green-100 px-6 py-4 rounded-xl border-2 border-green-300 shadow-lg">
                                <p className="text-xs text-green-700 font-bold uppercase tracking-wide">Certificate No.</p>
                                <p className="text-sm font-bold text-gray-800 mt-1">{certificateNumber}</p>
                                <div className="w-full h-0.5 bg-green-300 mt-2"></div>
                                <p className="text-xs text-gray-600 mt-1">Verified & Authentic</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-center mt-12">
                            <div className="bg-gradient-to-r from-gray-100 via-white to-gray-100 px-8 py-6 rounded-2xl shadow-lg border-2 border-gray-200">
                              <h2 className="text-5xl font-bold text-gray-800 tracking-widest mb-4">
                                CERTIFICATE OF COMPLETION
                              </h2>
                              <div className="flex items-center justify-center gap-4 mb-4">
                                <div className="w-16 h-1 bg-gradient-to-r from-green-500 to-green-700"></div>
                                <Trophy className="h-6 w-6 text-yellow-600" />
                                <div className="w-16 h-1 bg-gradient-to-r from-green-500 to-green-700"></div>
                              </div>
                              <p className="text-xl text-gray-600 font-semibold tracking-wider">
                                PROFESSIONAL INTERNSHIP PROGRAM
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Enhanced Main Content */}
                        <div className="relative z-20 px-20 py-16 text-center">
                          <div className="mb-10">
                            <p className="text-2xl text-gray-700 font-medium">This is to proudly certify that</p>
                          </div>
                          
                          {/* Premium Name Section */}
                          <div className="py-8 mb-12">
                            <div className="bg-gradient-to-r from-green-50 via-green-100 to-green-50 py-8 px-12 border-l-8 border-green-600 max-w-4xl mx-auto rounded-r-2xl shadow-xl border-4 border-gray-200 relative overflow-hidden">
                              <div className="absolute top-0 right-0 w-20 h-20 bg-green-200 opacity-20 rounded-full -mr-10 -mt-10"></div>
                              <div className="absolute bottom-0 left-0 w-16 h-16 bg-green-300 opacity-20 rounded-full -ml-8 -mb-8"></div>
                              <h3 className="text-6xl font-bold text-gray-800 tracking-wide uppercase mb-4 relative z-10">
                                {certificateData.internName || 'INTERN NAME'}
                              </h3>
                              <div className="flex items-center justify-center gap-4 mb-3">
                                <Badge className="bg-green-100 text-green-800 px-4 py-2 text-base font-semibold border-2 border-green-300">
                                  Employee ID: {certificateData.internId || 'EMP001'}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-8 mb-12">
                            <p className="text-2xl text-gray-700 font-medium">
                              has successfully completed the professional internship program
                            </p>
                            <div className="flex items-center justify-center gap-4">
                              <p className="text-2xl text-gray-700 font-medium">
                                in the
                              </p>
                              <div className="bg-gradient-to-r from-green-100 to-green-200 px-8 py-3 rounded-xl border-2 border-green-400 shadow-lg">
                                <span className="font-bold text-green-800 text-3xl tracking-wide">
                                  {certificateData.department || 'Technology'}
                                </span>
                              </div>
                              <p className="text-2xl text-gray-700 font-medium">Department</p>
                            </div>
                            
                            {/* Enhanced Duration & Stats */}
                            <div className="flex items-center justify-center gap-8 mt-10">
                              <div className="bg-gray-50 border-4 border-gray-300 py-6 px-8 rounded-2xl shadow-lg min-w-[200px]">
                                <p className="text-lg font-bold text-gray-700 mb-2">Program Duration</p>
                                <div className="space-y-2">
                                  <p className="text-base text-gray-600">
                                    {certificateData.startDate ? format(new Date(certificateData.startDate), 'MMM dd, yyyy') : 'Start Date'}
                                  </p>
                                  <div className="w-full h-0.5 bg-gray-400"></div>
                                  <p className="text-base text-gray-600">
                                    {certificateData.endDate ? format(new Date(certificateData.endDate), 'MMM dd, yyyy') : 'End Date'}
                                  </p>
                                </div>
                              </div>
                              <div className="bg-blue-50 border-4 border-blue-300 py-6 px-8 rounded-2xl shadow-lg min-w-[200px]">
                                <p className="text-lg font-bold text-blue-700 mb-2">Total Hours</p>
                                <p className="text-3xl font-bold text-blue-800">{certificateData.totalHours || '240'}</p>
                                <p className="text-sm text-blue-600 font-medium">Hours Completed</p>
                              </div>
                            </div>
                          </div>

                          {/* Skills & Achievements */}
                          {certificateData.skills && certificateData.skills.length > 0 && (
                            <div className="mb-8">
                              <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-4 border-blue-200 rounded-2xl p-6 max-w-4xl mx-auto shadow-lg">
                                <h4 className="text-lg font-bold text-blue-800 mb-4">Skills & Competencies Acquired</h4>
                                <div className="flex flex-wrap justify-center gap-3">
                                  {certificateData.skills.map((skill, index) => (
                                    <Badge key={index} className="bg-blue-100 text-blue-800 px-4 py-2 text-sm font-medium border-2 border-blue-300">
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Custom Message */}
                          {certificateData.customText && (
                            <div className="mb-8">
                              <div className="bg-gradient-to-r from-green-25 to-green-50 border-4 border-green-300 rounded-2xl p-6 max-w-3xl mx-auto shadow-lg">
                                <h4 className="text-lg font-bold text-green-800 mb-3">Special Recognition</h4>
                                <p className="text-base text-green-800 italic font-medium leading-relaxed">{certificateData.customText}</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Premium Bottom Section */}
                        <div className="absolute bottom-32 left-0 right-0 px-20 z-20">
                          <div className="grid grid-cols-3 gap-12 items-center">
                            {/* Performance Rating */}
                            <div className="text-center">
                              <h5 className="text-lg font-bold text-gray-700 mb-6 uppercase tracking-wide">Performance Rating</h5>
                              <div className={`${getPerformanceRating(certificateData.performance).bg} border-4 ${getPerformanceRating(certificateData.performance).border} rounded-2xl p-6 shadow-xl`}>
                                <div className="flex items-center justify-center gap-2 mb-4">
                                  <span className="text-2xl font-bold text-yellow-700">{certificateData.performance}</span>
                                </div>
                                <div className="flex justify-center space-x-2 mb-3">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <span key={star} className={star <= getPerformanceRating(certificateData.performance).stars ? "text-yellow-500 text-2xl" : "text-gray-300 text-2xl"}>
                                      ⭐
                                    </span>
                                  ))}
                                </div>
                                <p className="text-sm font-bold text-yellow-700">Exceptional Work</p>
                              </div>
                            </div>

                            {/* SLT Coins Achievement */}
                            <div className="text-center">
                              <h5 className="text-lg font-bold text-gray-700 mb-6 uppercase tracking-wide">Achievement</h5>
                              <div className="bg-green-50 border-4 border-green-400 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-200 opacity-30 rounded-full -mr-8 -mt-8"></div>
                                <Trophy className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                                <p className="text-sm text-green-700 mb-2 font-bold uppercase">SLT Coins Earned</p>
                                <p className="text-4xl font-bold text-green-800 mb-2">{certificateData.totalCoins || '0'}</p>
                                <p className="text-sm text-green-600 font-bold">Excellence Points</p>
                                <div className="mt-3 flex justify-center">
                                  <Badge className="bg-yellow-100 text-yellow-800 border-2 border-yellow-400">
                                    🏆 High Achiever
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            
                            {/* Signature Section */}
                            <div className="text-center">
                              <h5 className="text-lg font-bold text-gray-700 mb-6 uppercase tracking-wide">Authorized By</h5>
                              <div className="bg-gray-50 border-4 border-gray-300 rounded-2xl p-6 shadow-xl">
                                <div className="w-48 border-b-4 border-gray-800 mb-6 mx-auto"></div>
                                <div className="flex items-center justify-center gap-4">
                                  <div className="text-center">
                                    <p className="text-lg font-bold text-gray-800 mb-2">{certificateData.authorityName || 'Authority Name'}</p>
                                    <p className="text-base text-gray-600 font-semibold mb-1">{certificateData.signatureAuthority || 'HR Manager'}</p>
                                    <p className="text-sm text-gray-500 font-medium">SLT Finance India</p>
                                  </div>
                                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-100 to-green-200 border-4 border-green-400 flex items-center justify-center shadow-lg">
                                    <span className="text-lg font-bold text-green-700">SLT</span>
                                  </div>
                                </div>
                                <div className="mt-4">
                                  <Badge className="bg-green-100 text-green-800 border-2 border-green-300 text-xs">
                                    ✓ Digitally Verified
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Date Issued */}
                        <div className="absolute bottom-16 left-20 right-20 text-center z-20">
                          <div className="bg-gray-100 px-8 py-3 rounded-xl border-2 border-gray-300 shadow-lg inline-block">
                            <p className="text-base text-gray-700">
                              <span className="font-bold">Certificate Issued:</span> {format(new Date(), 'MMMM dd, yyyy')}
                            </p>
                          </div>
                        </div>

                        {/* Premium Bottom Accent */}
                        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-r from-gray-800 via-green-700 to-gray-800 flex items-center justify-center z-20 rounded-b-lg">
                          <div className="flex items-center gap-4">
                            <Shield className="h-5 w-5 text-white" />
                            <p className="text-white text-sm font-bold tracking-widest uppercase">
                              Certificate of Professional Achievement • SLT Finance India
                            </p>
                            <Trophy className="h-5 w-5 text-yellow-400" />
                          </div>
                        </div>
                      </div>
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
