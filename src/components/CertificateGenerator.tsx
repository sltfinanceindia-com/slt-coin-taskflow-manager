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
      name: 'Professional Gray-Green',
      bgGradient: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 25%, #a8b5a5 50%, #7d8471 75%, #5e6b5a 100%)',
      accentColor: '#2d5016',
      primaryText: '#1a1a1a',
      secondaryText: '#4a5568',
      titleColor: '#2d5016',
    },
    creative: {
      name: 'Modern Gray-Green',
      bgGradient: 'linear-gradient(45deg, #e8f4f8 0%, #d4e7dd 30%, #a8c8a8 60%, #6b8e6b 85%, #4a6741 100%)',
      accentColor: '#1a4d2e',
      primaryText: '#2d3748',
      secondaryText: '#4a5568',
      titleColor: '#1a4d2e',
    },
    minimalist: {
      name: 'Elegant Gray-Green',
      bgGradient: 'linear-gradient(180deg, #f8f9fa 0%, #e9ecef 20%, #c5d3c5 40%, #9db09d 70%, #6c7b6c 100%)',
      accentColor: '#2c5530',
      primaryText: '#212529',
      secondaryText: '#495057',
      titleColor: '#2c5530',
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
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gray-100 to-green-100 flex items-center justify-center">
                  <Award className="h-4 w-4 text-green-600" />
                </div>
                Advanced Certificate Generator
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground mt-2">
                Generate professional completion certificates with beautiful gradient designs
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

              {/* Custom Text Section */}
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
                <p className="text-xs text-muted-foreground">
                  This message will appear on the certificate as additional recognition.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-border">
                <Button 
                  onClick={generatePDF} 
                  disabled={isGenerating || !certificateData.internName}
                  className="h-11 px-6 font-medium bg-gradient-to-r from-gray-600 to-green-600 hover:from-gray-700 hover:to-green-700"
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
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gray-100 to-green-100 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-green-600" />
                </div>
                Certificate Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="overflow-auto bg-slate-50 p-6 rounded-lg border border-border">
                <div
                  ref={certificateRef}
                  className="w-[800px] h-[600px] mx-auto relative shadow-2xl rounded-xl overflow-hidden"
                  style={{ 
                    background: currentTemplate.bgGradient,
                    fontFamily: "Georgia, 'Times New Roman', Times, serif",
                    WebkitFontSmoothing: 'antialiased',
                    MozOsxFontSmoothing: 'grayscale'
                  }}
                >
                  {/* Elegant Border Frame with Gradient */}
                  <div 
                    className="absolute inset-4 rounded-lg border-2"
                    style={{ 
                      borderImage: `linear-gradient(45deg, ${currentTemplate.accentColor}40, ${currentTemplate.accentColor}80, ${currentTemplate.accentColor}40) 1`,
                      borderStyle: 'solid'
                    }}
                  ></div>
                  
                  {/* Inner decorative border */}
                  <div 
                    className="absolute inset-8 rounded-lg border"
                    style={{ 
                      borderColor: currentTemplate.accentColor,
                      opacity: 0.3
                    }}
                  ></div>

                  {/* Decorative corner elements with gradients */}
                  <div className="absolute top-6 left-6 w-16 h-16 opacity-20">
                    <div 
                      className="w-full h-full rounded-full"
                      style={{
                        background: `radial-gradient(circle, ${currentTemplate.accentColor}60, transparent 70%)`
                      }}
                    ></div>
                  </div>
                  <div className="absolute top-6 right-6 w-16 h-16 opacity-20">
                    <div 
                      className="w-full h-full rounded-full"
                      style={{
                        background: `radial-gradient(circle, ${currentTemplate.accentColor}60, transparent 70%)`
                      }}
                    ></div>
                  </div>
                  <div className="absolute bottom-6 left-6 w-16 h-16 opacity-20">
                    <div 
                      className="w-full h-full rounded-full"
                      style={{
                        background: `radial-gradient(circle, ${currentTemplate.accentColor}60, transparent 70%)`
                      }}
                    ></div>
                  </div>
                  <div className="absolute bottom-6 right-6 w-16 h-16 opacity-20">
                    <div 
                      className="w-full h-full rounded-full"
                      style={{
                        background: `radial-gradient(circle, ${currentTemplate.accentColor}60, transparent 70%)`
                      }}
                    ></div>
                  </div>

                  {/* Certificate Content Container */}
                  <div className="absolute inset-0 flex flex-col justify-between p-12">
                    
                    {/* Header Section - Enhanced with gradient text */}
                    <div className="flex-shrink-0 text-center pt-6">
                      <h1 
                        className="text-4xl font-bold mb-4 tracking-wide"
                        style={{ 
                          fontFamily: "Georgia, 'Times New Roman', Times, serif",
                          background: `linear-gradient(45deg, ${currentTemplate.titleColor}, ${currentTemplate.accentColor})`,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                          fontWeight: 'bold',
                          letterSpacing: '3px',
                          lineHeight: '1.2',
                          textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                      >
                        CERTIFICATE OF COMPLETION
                      </h1>
                      
                      {/* Enhanced decorative lines with gradients */}
                      <div className="flex justify-center items-center gap-4 mb-2">
                        <div 
                          className="w-16 h-1 rounded-full"
                          style={{ 
                            background: `linear-gradient(90deg, transparent, ${currentTemplate.accentColor}, transparent)`
                          }}
                        ></div>
                        <div 
                          className="w-8 h-2 rounded-full"
                          style={{ backgroundColor: currentTemplate.accentColor, opacity: 0.8 }}
                        ></div>
                        <div 
                          className="w-16 h-1 rounded-full"
                          style={{ 
                            background: `linear-gradient(90deg, transparent, ${currentTemplate.accentColor}, transparent)`
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Main Content - Enhanced styling */}
                    <div className="flex-1 flex flex-col justify-center text-center">
                      <div className="space-y-8">
                        <p 
                          className="text-lg font-medium"
                          style={{ 
                            fontFamily: "Georgia, 'Times New Roman', Times, serif",
                            color: currentTemplate.secondaryText,
                            fontSize: '18px',
                            letterSpacing: '1px'
                          }}
                        >
                          This is to certify that
                        </p>
                        
                        {/* Name section with enhanced styling */}
                        <div className="my-10">
                          <div 
                            className="inline-block px-8 py-4 rounded-lg"
                            style={{
                              background: `linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.6))`,
                              backdropFilter: 'blur(10px)',
                              boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                            }}
                          >
                            <h2 
                              className="text-4xl font-bold"
                              style={{ 
                                fontFamily: "Georgia, 'Times New Roman', Times, serif",
                                color: currentTemplate.primaryText,
                                fontWeight: 'bold',
                                letterSpacing: '2px',
                                textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                              }}
                            >
                              {certificateData.internName || 'Gopi Komirisetti'}
                            </h2>
                            <div 
                              className="w-32 h-1 mx-auto mt-3 rounded-full"
                              style={{ 
                                background: `linear-gradient(90deg, ${currentTemplate.accentColor}, ${currentTemplate.titleColor})`
                              }}
                            ></div>
                          </div>
                        </div>
                        
                        <p 
                          className="text-lg font-medium"
                          style={{ 
                            fontFamily: "Georgia, 'Times New Roman', Times, serif",
                            color: currentTemplate.secondaryText,
                            fontSize: '18px',
                            letterSpacing: '1px'
                          }}
                        >
                          has successfully completed the internship program at
                        </p>
                        
                        <h3 
                          className="text-3xl font-bold mb-8"
                          style={{ 
                            fontFamily: "Georgia, 'Times New Roman', Times, serif",
                            background: `linear-gradient(45deg, ${currentTemplate.titleColor}, ${currentTemplate.accentColor})`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            fontWeight: 'bold',
                            letterSpacing: '2px',
                            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}
                        >
                          SLT Finance India
                        </h3>

                        {/* Information Grid - Enhanced with gradient background */}
                        <div 
                          className="rounded-xl p-6 mx-auto max-w-lg"
                          style={{
                            background: `linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7))`,
                            backdropFilter: 'blur(15px)',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                            border: `1px solid ${currentTemplate.accentColor}20`
                          }}
                        >
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
                                DURATION
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
                                PERFORMANCE
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
                          
                          {/* Custom text section with enhanced styling */}
                          {certificateData.customText && (
                            <div 
                              className="mt-6 pt-4"
                              style={{ 
                                borderTop: `1px solid ${currentTemplate.accentColor}40`
                              }}
                            >
                              <p 
                                className="text-sm italic text-center"
                                style={{ 
                                  fontFamily: "Georgia, 'Times New Roman', Times, serif",
                                  color: currentTemplate.secondaryText,
                                  fontStyle: 'italic',
                                  lineHeight: '1.6',
                                  fontSize: '14px'
                                }}
                              >
                                "{certificateData.customText}"
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Footer Section - Enhanced with gradient elements */}
                    <div className="flex-shrink-0 flex justify-between items-end pb-6">
                      <div className="text-center flex-1">
                        <div 
                          className="w-36 h-0.5 mb-3 mx-auto rounded-full"
                          style={{ 
                            background: `linear-gradient(90deg, transparent, ${currentTemplate.primaryText}, transparent)`,
                            opacity: 0.6
                          }}
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
                          {format(new Date(), 'MMMM dd, yyyy')}
                        </p>
                      </div>
                      
                      <div className="text-center flex-1">
                        <div 
                          className="w-36 h-0.5 mb-3 mx-auto rounded-full"
                          style={{ 
                            background: `linear-gradient(90deg, transparent, ${currentTemplate.primaryText}, transparent)`,
                            opacity: 0.6
                          }}
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

                  {/* Enhanced subtle watermark with gradient */}
                  <div 
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    style={{ 
                      fontSize: '140px',
                      background: `linear-gradient(45deg, ${currentTemplate.accentColor}05, ${currentTemplate.accentColor}03)`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
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
