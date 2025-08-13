import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Download, Award, FileText, Share2, Palette, Eye, Shield } from 'lucide-react';
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <style jsx>{`
          .workfront-access-denied {
            background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
            border: 1px solid #e2e8f0;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            border-radius: 12px;
          }
          .workfront-metric-icon {
            background: linear-gradient(135deg, #667eea 20%, #764ba2 80%);
            color: white;
            padding: 12px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
          }
        `}</style>
        
        <div className="container mx-auto p-6 max-w-2xl">
          <Card className="workfront-access-denied border-0 overflow-hidden">
            <CardContent className="p-12 text-center">
              <div className="workfront-metric-icon mx-auto mb-6">
                <Shield className="h-12 w-12" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Access Restricted
              </h3>
              <p className="text-gray-600 dark:text-gray-300 font-medium">
                Certificate generation is only available to administrators.
              </p>
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Contact your administrator for certificate generation requests
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
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
      name: 'Formal Business',
      bgColor: 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50',
      borderColor: 'border-blue-300',
      accentColor: 'text-blue-700',
      description: 'Classic professional design',
    },
    creative: {
      name: 'Creative Modern',
      bgColor: 'bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50',
      borderColor: 'border-purple-300',
      accentColor: 'text-purple-700',
      description: 'Vibrant and contemporary',
    },
    minimalist: {
      name: 'Minimalist Clean',
      bgColor: 'bg-gradient-to-br from-gray-50 to-slate-50',
      borderColor: 'border-gray-400',
      accentColor: 'text-gray-800',
      description: 'Simple and elegant',
    },
    workfront: {
      name: 'Workfront Elite',
      bgColor: 'bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100',
      borderColor: 'border-indigo-400',
      accentColor: 'text-indigo-800',
      description: 'Premium enterprise style',
    },
  };

  const currentTemplate = templates[template as keyof typeof templates];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Enhanced Custom Styles */}
      <style jsx>{`
        .workfront-gradient {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .workfront-card {
          background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .workfront-card:hover {
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          transform: translateY(-2px);
        }
        .workfront-card-dark {
          background: linear-gradient(145deg, #1e293b 0%, #334155 100%);
          border: 1px solid #475569;
        }
        .workfront-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 2.5rem;
          border-radius: 12px;
          margin-bottom: 2rem;
          box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
        }
        .workfront-metric-icon {
          background: linear-gradient(135deg, #667eea 20%, #764ba2 80%);
          color: white;
          padding: 12px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }
        .workfront-badge {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          font-weight: 600;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
        }
        .workfront-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          color: white;
          font-weight: 600;
          padding: 12px 24px;
          border-radius: 8px;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
          transition: all 0.3s ease;
        }
        .workfront-button:hover {
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
          transform: translateY(-2px);
        }
        .workfront-button:disabled {
          opacity: 0.6;
          transform: none;
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
        }
        .workfront-button-outline {
          background: transparent;
          border: 2px solid #667eea;
          color: #667eea;
          font-weight: 600;
          padding: 10px 20px;
          border-radius: 8px;
          transition: all 0.3s ease;
        }
        .workfront-button-outline:hover {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }
        .workfront-input {
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          transition: all 0.3s ease;
          background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
        }
        .workfront-input:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        .certificate-preview-container {
          background: linear-gradient(145deg, #f1f5f9 0%, #e2e8f0 100%);
          border: 2px solid #cbd5e1;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        .template-card {
          background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          padding: 1rem;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .template-card:hover {
          border-color: #667eea;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.1);
          transform: translateY(-2px);
        }
        .template-card.selected {
          border-color: #667eea;
          background: linear-gradient(145deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.2);
        }
        .form-section {
          background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }
        .certificate-border {
          border: 8px solid transparent;
          border-image: linear-gradient(135deg, #667eea 0%, #764ba2 100%) 1;
          background: linear-gradient(white, white) padding-box, linear-gradient(135deg, #667eea 0%, #764ba2 100%) border-box;
        }
      `}</style>

      <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl">
        {/* Enhanced Header */}
        <div className="workfront-header">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-3">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                Certificate Generator
              </h1>
              <p className="text-sm sm:text-base opacity-90 font-medium">
                Create professional completion certificates for intern programs
              </p>
              <div className="flex items-center space-x-4 text-sm opacity-80">
                <span className="flex items-center">
                  <Award className="h-4 w-4 mr-1" />
                  Professional Templates
                </span>
                <span>•</span>
                <span className="flex items-center">
                  <FileText className="h-4 w-4 mr-1" />
                  PDF Generation
                </span>
                <span>•</span>
                <span className="flex items-center">
                  <Palette className="h-4 w-4 mr-1" />
                  Custom Styling
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className="workfront-badge">
                Admin Only
              </Badge>
              <div className="text-right">
                <p className="text-xs opacity-75">For</p>
                <p className="text-sm font-semibold">{certificateData.internName || 'Intern'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Certificate Form */}
        <Card className="workfront-card dark:workfront-card-dark border-0 overflow-hidden">
          <CardHeader className="border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
            <CardTitle className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
              <div className="workfront-metric-icon mr-3">
                <Award className="h-5 w-5" />
              </div>
              Certificate Configuration
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              Configure certificate details and select template design
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-8">
            {/* Template Selection */}
            <div className="form-section">
              <Label className="text-base font-semibold text-gray-900 dark:text-white mb-4 block">
                Certificate Template
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(templates).map(([key, tmpl]) => (
                  <div
                    key={key}
                    className={`template-card ${template === key ? 'selected' : ''}`}
                    onClick={() => setTemplate(key)}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="workfront-metric-icon !p-2">
                        <Palette className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">{tmpl.name}</h4>
                        <p className="text-xs text-gray-500">{tmpl.description}</p>
                      </div>
                    </div>
                    <div className={`w-full h-16 rounded-lg ${tmpl.bgColor} ${tmpl.borderColor} border-2`}></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Certificate Data Form */}
            <div className="form-section">
              <Label className="text-base font-semibold text-gray-900 dark:text-white mb-4 block">
                Intern Information
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="internName" className="text-sm font-medium">Intern Name</Label>
                  <Input
                    id="internName"
                    className="workfront-input"
                    value={certificateData.internName}
                    onChange={(e) => setCertificateData(prev => ({ ...prev, internName: e.target.value }))}
                    placeholder="Enter full name"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="internId" className="text-sm font-medium">Employee ID</Label>
                  <Input
                    id="internId"
                    className="workfront-input"
                    value={certificateData.internId}
                    onChange={(e) => setCertificateData(prev => ({ ...prev, internId: e.target.value }))}
                    placeholder="Enter employee ID"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="department" className="text-sm font-medium">Department</Label>
                  <Input
                    id="department"
                    className="workfront-input"
                    value={certificateData.department}
                    onChange={(e) => setCertificateData(prev => ({ ...prev, department: e.target.value }))}
                    placeholder="Enter department"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="performance" className="text-sm font-medium">Performance Rating</Label>
                  <Select 
                    value={certificateData.performance} 
                    onValueChange={(value) => setCertificateData(prev => ({ ...prev, performance: value }))}
                  >
                    <SelectTrigger className="workfront-input">
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
                  <Label htmlFor="startDate" className="text-sm font-medium">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    className="workfront-input"
                    value={certificateData.startDate}
                    onChange={(e) => setCertificateData(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="endDate" className="text-sm font-medium">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    className="workfront-input"
                    value={certificateData.endDate}
                    onChange={(e) => setCertificateData(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Custom Message */}
            <div className="form-section">
              <Label htmlFor="customText" className="text-base font-semibold text-gray-900 dark:text-white mb-4 block">
                Custom Message (Optional)
              </Label>
              <Textarea
                id="customText"
                className="workfront-input"
                placeholder="Add a personal message, special achievements, or additional recognition..."
                value={certificateData.customText}
                onChange={(e) => setCertificateData(prev => ({ ...prev, customText: e.target.value }))}
                rows={4}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-200">
              <Button 
                onClick={generatePDF} 
                disabled={isGenerating || !certificateData.internName}
                className="workfront-button flex-1 sm:flex-none"
              >
                <Download className="h-4 w-4 mr-2" />
                {isGenerating ? 'Generating PDF...' : 'Download Certificate'}
              </Button>
              {onClose && (
                <Button 
                  variant="outline" 
                  onClick={onClose}
                  className="workfront-button-outline flex-1 sm:flex-none"
                >
                  Close
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Certificate Preview */}
        <Card className="workfront-card dark:workfront-card-dark border-0 overflow-hidden">
          <CardHeader className="border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
            <CardTitle className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
              <div className="workfront-metric-icon mr-3">
                <Eye className="h-5 w-5" />
              </div>
              Certificate Preview
            </CardTitle>
            <div className="flex items-center justify-between">
              <CardDescription className="text-gray-600 dark:text-gray-300">
                Live preview of your certificate design
              </CardDescription>
              <Badge className="workfront-badge text-xs">
                {currentTemplate.name}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="certificate-preview-container">
              <div
                ref={certificateRef}
                className={`w-[800px] h-[600px] mx-auto p-12 ${currentTemplate.bgColor} certificate-border relative shadow-2xl`}
                style={{ fontFamily: 'serif' }}
              >
                {/* Enhanced Header */}
                <div className="text-center mb-8">
                  <h1 className={`text-4xl font-bold ${currentTemplate.accentColor} mb-4`}>
                    Certificate of Completion
                  </h1>
                  <div className={`w-32 h-1 mx-auto opacity-60`} style={{
                    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
                  }}></div>
                </div>

                {/* Enhanced Content */}
                <div className="text-center space-y-6">
                  <p className="text-lg text-gray-600">This is to certify that</p>
                  
                  <h2 className="text-3xl font-bold text-gray-800 border-b-2 border-gray-300 pb-2 inline-block px-4">
                    {certificateData.internName || '[Intern Name]'}
                  </h2>
                  
                  <p className="text-lg text-gray-600">
                    has successfully completed the internship program at
                  </p>
                  
                  <h3 className={`text-2xl font-bold ${currentTemplate.accentColor}`}>
                    SLT Finance India
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-8 my-8 text-sm">
                    <div className="p-4 bg-white/50 rounded-lg">
                      <p className="text-gray-600 font-medium">Department:</p>
                      <p className="font-bold text-gray-800">{certificateData.department || '[Department]'}</p>
                    </div>
                    <div className="p-4 bg-white/50 rounded-lg">
                      <p className="text-gray-600 font-medium">Employee ID:</p>
                      <p className="font-bold text-gray-800">{certificateData.internId || '[ID]'}</p>
                    </div>
                    <div className="p-4 bg-white/50 rounded-lg">
                      <p className="text-gray-600 font-medium">Duration:</p>
                      <p className="font-bold text-gray-800">
                        {certificateData.startDate && certificateData.endDate 
                          ? `${format(new Date(certificateData.startDate), 'MMM dd, yyyy')} - ${format(new Date(certificateData.endDate), 'MMM dd, yyyy')}`
                          : '[Duration]'
                        }
                      </p>
                    </div>
                    <div className="p-4 bg-white/50 rounded-lg">
                      <p className="text-gray-600 font-medium">Performance:</p>
                      <p className="font-bold text-gray-800">{certificateData.performance}</p>
                    </div>
                  </div>
                  
                  {certificateData.customText && (
                    <div className="border-t pt-6 mt-6">
                      <p className="text-sm text-gray-600 italic bg-white/30 p-4 rounded-lg">
                        "{certificateData.customText}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Enhanced Footer */}
                <div className="absolute bottom-12 left-12 right-12">
                  <div className="flex justify-between items-end">
                    <div className="text-center">
                      <div className="w-32 border-b-2 border-gray-400 mb-2"></div>
                      <p className="text-sm text-gray-600 font-medium">Date Issued</p>
                      <p className="text-sm font-bold text-gray-800">
                        {format(new Date(), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-32 border-b-2 border-gray-400 mb-2"></div>
                      <p className="text-sm text-gray-600 font-medium">Authorized Signature</p>
                      <p className="text-sm font-bold text-gray-800">HR Department</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
