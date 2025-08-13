import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Award, FileText } from 'lucide-react';
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

  const loadFonts = async () => {
    try {
      const link = document.createElement('link');
      link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap';
      link.rel = 'stylesheet';
      document.head.appendChild(link);

      await new Promise(resolve => {
        if (document.fonts) {
          document.fonts.ready.then(resolve);
        } else {
          setTimeout(resolve, 2000);
        }
      });
    } catch (error) {
      console.warn('Font loading failed, using fallback fonts');
    }
  };

  const generatePDF = async () => {
    if (!certificateRef.current) return;

    setIsGenerating(true);
    try {
      await loadFonts();
      await new Promise(resolve => setTimeout(resolve, 1000));

      const canvas = await html2canvas(certificateRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        letterRendering: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      
      const imgWidth = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`certificate-${certificateData.internName.replace(/\s+/g, '-').toLowerCase()}.pdf`);
      
      toast({
        title: "Certificate Generated",
        description: "Certificate has been downloaded successfully.",
      });
    } catch (error) {
      console.error('PDF Generation Error:', error);
      toast({
        title: "Error Generating Certificate",
        description: "Failed to generate certificate PDF. Please try again.",
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
      accentColor: '#1e40af',
      primaryText: '#1f2937',
      secondaryText: '#4b5563',
    },
    creative: {
      name: 'Creative',
      bgColor: 'bg-gradient-to-br from-purple-50 to-pink-100',
      borderColor: 'border-purple-200',
      accentColor: '#7c3aed',
      primaryText: '#1f2937',
      secondaryText: '#4b5563',
    },
    minimalist: {
      name: 'Minimalist',
      bgColor: 'bg-white',
      borderColor: 'border-gray-300',
      accentColor: '#374151',
      primaryText: '#111827',
      secondaryText: '#6b7280',
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
                  {isGenerating ? 'Generating PDF...' : 'Download Certificate'}
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
                  className={`w-[800px] h-[600px] mx-auto ${currentTemplate.bgColor} relative shadow-xl rounded-lg overflow-hidden`}
                  style={{ 
                    fontFamily: "Georgia, 'Times New Roman', Times, serif",
                    WebkitFontSmoothing: 'antialiased',
                    MozOsxFontSmoothing: 'grayscale'
                  }}
                >
                  {/* Decorative Border Frame */}
                  <div 
                    className="absolute inset-6 border-2 rounded-lg"
                    style={{ borderColor: currentTemplate.accentColor, opacity: 0.2 }}
                  ></div>
                  <div 
                    className="absolute inset-8 border rounded-lg"
                    style={{ borderColor: currentTemplate.accentColor, opacity: 0.15 }}
                  ></div>

                  {/* Certificate Content Container */}
                  <div className="absolute inset-0 flex flex-col justify-between p-12">
                    
                    {/* Header Section - Perfectly Centered */}
                    <div className="flex-shrink-0 text-center pt-8">
                      <h1 
                        className="text-4xl font-bold mb-3 tracking-wide"
                        style={{ 
                          fontFamily: "Georgia, 'Times New Roman', Times, serif",
                          color: currentTemplate.accentColor,
                          fontWeight: 'bold',
                          letterSpacing: '3px',
                          lineHeight: '1.2'
                        }}
                      >
                        CERTIFICATE OF COMPLETION
                      </h1>
                      <div 
                        className="w-32 h-1 mx-auto rounded-full mb-2"
                        style={{ backgroundColor: currentTemplate.accentColor, opacity: 0.6 }}
                      ></div>
                      <div 
                        className="w-16 h-0.5 mx-auto rounded-full"
                        style={{ backgroundColor: currentTemplate.accentColor, opacity: 0.4 }}
                      ></div>
                    </div>

                    {/* Main Content - Perfectly Centered Vertically */}
                    <div className="flex-1 flex flex-col justify-center text-center">
                      <div className="space-y-6">
                        <p 
                          className="text-lg"
                          style={{ 
                            fontFamily: "Georgia, 'Times New Roman', Times, serif",
                            color: currentTemplate.secondaryText,
                            fontWeight: '400',
                            fontSize: '18px'
                          }}
                        >
                          This is to certify that
                        </p>
                        
                        <div className="my-8">
                          <h2 
                            className="text-4xl font-bold inline-block px-8 py-4"
                            style={{ 
                              fontFamily: "Georgia, 'Times New Roman', Times, serif",
                              color: currentTemplate.primaryText,
                              fontWeight: 'bold',
                              borderBottom: `3px solid ${currentTemplate.accentColor}`,
                              minWidth: '400px',
                              letterSpacing: '1px'
                            }}
                          >
                            {certificateData.internName || 'Gopi Komirisetti'}
                          </h2>
                        </div>
                        
                        <p 
                          className="text-lg"
                          style={{ 
                            fontFamily: "Georgia, 'Times New Roman', Times, serif",
                            color: currentTemplate.secondaryText,
                            fontWeight: '400',
                            fontSize: '18px'
                          }}
                        >
                          has successfully completed the internship program at
                        </p>
                        
                        <h3 
                          className="text-3xl font-bold"
                          style={{ 
                            fontFamily: "Georgia, 'Times New Roman', Times, serif",
                            color: currentTemplate.accentColor,
                            fontWeight: 'bold',
                            letterSpacing: '2px',
                            marginTop: '24px',
                            marginBottom: '32px'
                          }}
                        >
                          SLT Finance India
                        </h3>

                        {/* Information Grid - Perfectly Aligned */}
                        <div className="bg-white bg-opacity-50 rounded-lg p-6 mx-auto max-w-lg">
                          <div className="grid grid-cols-2 gap-6">
                            <div className="text-center">
                              <p 
                                className="text-xs font-semibold uppercase tracking-widest mb-2"
                                style={{ 
                                  fontFamily: "Georgia, 'Times New Roman', Times, serif",
                                  color: currentTemplate.secondaryText,
                                  fontSize: '11px',
                                  opacity: 0.8
                                }}
                              >
                                DEPARTMENT
                              </p>
                              <p 
                                className="text-base font-bold"
                                style={{ 
                                  fontFamily: "Georgia, 'Times New Roman', Times, serif",
                                  color: currentTemplate.primaryText,
                                  fontWeight: 'bold'
                                }}
                              >
                                {certificateData.department || '[Department]'}
                              </p>
                            </div>
                            <div className="text-center">
                              <p 
                                className="text-xs font-semibold uppercase tracking-widest mb-2"
                                style={{ 
                                  fontFamily: "Georgia, 'Times New Roman', Times, serif",
                                  color: currentTemplate.secondaryText,
                                  fontSize: '11px',
                                  opacity: 0.8
                                }}
                              >
                                EMPLOYEE ID
                              </p>
                              <p 
                                className="text-base font-bold"
                                style={{ 
                                  fontFamily: "Georgia, 'Times New Roman', Times, serif",
                                  color: currentTemplate.primaryText,
                                  fontWeight: 'bold'
                                }}
                              >
                                {certificateData.internId || '[ID]'}
                              </p>
                            </div>
                            <div className="text-center">
                              <p 
                                className="text-xs font-semibold uppercase tracking-widest mb-2"
                                style={{ 
                                  fontFamily: "Georgia, 'Times New Roman', Times, serif",
                                  color: currentTemplate.secondaryText,
                                  fontSize: '11px',
                                  opacity: 0.8
                                }}
                              >
                                PROGRAM DURATION
                              </p>
                              <p 
                                className="text-base font-bold"
                                style={{ 
                                  fontFamily: "Georgia, 'Times New Roman', Times, serif",
                                  color: currentTemplate.primaryText,
                                  fontWeight: 'bold'
                                }}
                              >
                                {certificateData.startDate && certificateData.endDate 
                                  ? `${format(new Date(certificateData.startDate), 'MMM yyyy')} - ${format(new Date(certificateData.endDate), 'MMM yyyy')}`
                                  : '[Duration]'
                                }
                              </p>
                            </div>
                            <div className="text-center">
                              <p 
                                className="text-xs font-semibold uppercase tracking-widest mb-2"
                                style={{ 
                                  fontFamily: "Georgia, 'Times New Roman', Times, serif",
                                  color: currentTemplate.secondaryText,
                                  fontSize: '11px',
                                  opacity: 0.8
                                }}
                              >
                                PERFORMANCE RATING
                              </p>
                              <p 
                                className="text-base font-bold"
                                style={{ 
                                  fontFamily: "Georgia, 'Times New Roman', Times, serif",
                                  color: currentTemplate.accentColor,
                                  fontWeight: 'bold'
                                }}
                              >
                                {certificateData.performance}
                              </p>
                            </div>
                          </div>
                          
                          {certificateData.customText && (
                            <div className="mt-6 pt-4" style={{ borderTop: `1px solid ${currentTemplate.secondaryText}40` }}>
                              <p 
                                className="text-sm italic text-center"
                                style={{ 
                                  fontFamily: "Georgia, 'Times New Roman', Times, serif",
                                  color: currentTemplate.secondaryText,
                                  fontStyle: 'italic',
                                  lineHeight: '1.6'
                                }}
                              >
                                {certificateData.customText}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Footer Section - Perfectly Aligned Bottom */}
                    <div className="flex-shrink-0 flex justify-between items-end pb-8">
                      <div className="text-center flex-1">
                        <div 
                          className="w-36 h-px mb-3 mx-auto"
                          style={{ backgroundColor: currentTemplate.primaryText, opacity: 0.5 }}
                        ></div>
                        <p 
                          className="text-xs font-semibold uppercase tracking-widest mb-1"
                          style={{ 
                            fontFamily: "Georgia, 'Times New Roman', Times, serif",
                            color: currentTemplate.secondaryText,
                            fontSize: '10px'
                          }}
                        >
                          ISSUE DATE
                        </p>
                        <p 
                          className="text-sm font-bold"
                          style={{ 
                            fontFamily: "Georgia, 'Times New Roman', Times, serif",
                            color: currentTemplate.primaryText,
                            fontWeight: 'bold'
                          }}
                        >
                          August 14, 2025
                        </p>
                      </div>
                      
                      <div className="text-center flex-1">
                        <div 
                          className="w-36 h-px mb-3 mx-auto"
                          style={{ backgroundColor: currentTemplate.primaryText, opacity: 0.5 }}
                        ></div>
                        <p 
                          className="text-xs font-semibold uppercase tracking-widest mb-1"
                          style={{ 
                            fontFamily: "Georgia, 'Times New Roman', Times, serif",
                            color: currentTemplate.secondaryText,
                            fontSize: '10px'
                          }}
                        >
                          AUTHORIZED SIGNATURE
                        </p>
                        <p 
                          className="text-sm font-bold"
                          style={{ 
                            fontFamily: "Georgia, 'Times New Roman', Times, serif",
                            color: currentTemplate.primaryText,
                            fontWeight: 'bold'
                          }}
                        >
                          HR Department
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Subtle Background Watermark */}
                  <div 
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    style={{ 
                      fontSize: '150px',
                      color: currentTemplate.accentColor,
                      opacity: 0.02,
                      fontWeight: 'bold',
                      transform: 'rotate(-45deg)',
                      fontFamily: "Georgia, 'Times New Roman', Times, serif"
                    }}
                  >
                    SLT
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
