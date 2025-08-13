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
  const [template, setTemplate] = useState('elegant');
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
      link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Cinzel:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap';
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
    elegant: {
      name: 'Elegant Professional',
      bgGradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 30%, #0f3460 60%, #533a7b 100%)',
      accentColor: '#d4af37',
      primaryText: '#ffffff',
      secondaryText: '#e8e8e8',
      titleColor: '#d4af37',
      borderColor: '#d4af37',
    },
    royal: {
      name: 'Royal Blue',
      bgGradient: 'linear-gradient(135deg, #0c1426 0%, #1e3a5f 30%, #2a5298 60%, #3b82c4 100%)',
      accentColor: '#ffd700',
      primaryText: '#ffffff',
      secondaryText: '#e1e8f0',
      titleColor: '#ffd700',
      borderColor: '#ffd700',
    },
    classic: {
      name: 'Classic Navy',
      bgGradient: 'linear-gradient(135deg, #1a202c 0%, #2d3748 30%, #4a5568 60%, #718096 100%)',
      accentColor: '#e6b800',
      primaryText: '#ffffff',
      secondaryText: '#e2e8f0',
      titleColor: '#e6b800',
      borderColor: '#e6b800',
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
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center">
                  <Award className="h-4 w-4 text-yellow-600" />
                </div>
                Professional Certificate Generator
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground mt-2">
                Generate elegant completion certificates with professional design
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
                  Custom Recognition Message (Optional)
                </Label>
                <Textarea
                  id="customText"
                  placeholder="Add a special recognition message or achievement note..."
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
                  className="h-11 px-6 font-medium bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600"
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
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-yellow-600" />
                </div>
                Certificate Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="overflow-auto bg-slate-50 p-6 rounded-lg border border-border">
                <div
                  ref={certificateRef}
                  className="w-[800px] h-[600px] mx-auto relative shadow-2xl rounded-lg overflow-hidden"
                  style={{ 
                    background: currentTemplate.bgGradient,
                    fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif",
                    WebkitFontSmoothing: 'antialiased',
                    MozOsxFontSmoothing: 'grayscale'
                  }}
                >
                  {/* Decorative Border Frame - Inspired by the reference */}
                  <div className="absolute inset-0 p-6">
                    <div 
                      className="w-full h-full border-4 rounded-lg relative"
                      style={{ 
                        borderColor: currentTemplate.borderColor,
                        borderStyle: 'solid'
                      }}
                    >
                      {/* Corner decorative elements */}
                      <div className="absolute -top-2 -left-2 w-12 h-12">
                        <div 
                          className="w-full h-full border-t-4 border-l-4 rounded-tl-lg"
                          style={{ borderColor: currentTemplate.borderColor }}
                        ></div>
                        <div 
                          className="absolute top-1 left-1 w-8 h-8 border-t-2 border-l-2 rounded-tl-lg"
                          style={{ borderColor: currentTemplate.borderColor, opacity: 0.6 }}
                        ></div>
                      </div>
                      <div className="absolute -top-2 -right-2 w-12 h-12">
                        <div 
                          className="w-full h-full border-t-4 border-r-4 rounded-tr-lg"
                          style={{ borderColor: currentTemplate.borderColor }}
                        ></div>
                        <div 
                          className="absolute top-1 right-1 w-8 h-8 border-t-2 border-r-2 rounded-tr-lg"
                          style={{ borderColor: currentTemplate.borderColor, opacity: 0.6 }}
                        ></div>
                      </div>
                      <div className="absolute -bottom-2 -left-2 w-12 h-12">
                        <div 
                          className="w-full h-full border-b-4 border-l-4 rounded-bl-lg"
                          style={{ borderColor: currentTemplate.borderColor }}
                        ></div>
                        <div 
                          className="absolute bottom-1 left-1 w-8 h-8 border-b-2 border-l-2 rounded-bl-lg"
                          style={{ borderColor: currentTemplate.borderColor, opacity: 0.6 }}
                        ></div>
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-12 h-12">
                        <div 
                          className="w-full h-full border-b-4 border-r-4 rounded-br-lg"
                          style={{ borderColor: currentTemplate.borderColor }}
                        ></div>
                        <div 
                          className="absolute bottom-1 right-1 w-8 h-8 border-b-2 border-r-2 rounded-br-lg"
                          style={{ borderColor: currentTemplate.borderColor, opacity: 0.6 }}
                        ></div>
                      </div>

                      {/* Ornate corner flourishes */}
                      <div className="absolute top-4 left-4 w-16 h-16">
                        <div 
                          className="w-full h-full opacity-30"
                          style={{
                            background: `radial-gradient(circle, ${currentTemplate.borderColor}80, transparent 60%)`,
                            clipPath: 'polygon(0 0, 100% 0, 0 100%)'
                          }}
                        ></div>
                      </div>
                      <div className="absolute top-4 right-4 w-16 h-16">
                        <div 
                          className="w-full h-full opacity-30"
                          style={{
                            background: `radial-gradient(circle, ${currentTemplate.borderColor}80, transparent 60%)`,
                            clipPath: 'polygon(100% 0, 100% 100%, 0 0)'
                          }}
                        ></div>
                      </div>
                      <div className="absolute bottom-4 left-4 w-16 h-16">
                        <div 
                          className="w-full h-full opacity-30"
                          style={{
                            background: `radial-gradient(circle, ${currentTemplate.borderColor}80, transparent 60%)`,
                            clipPath: 'polygon(0 0, 100% 100%, 0 100%)'
                          }}
                        ></div>
                      </div>
                      <div className="absolute bottom-4 right-4 w-16 h-16">
                        <div 
                          className="w-full h-full opacity-30"
                          style={{
                            background: `radial-gradient(circle, ${currentTemplate.borderColor}80, transparent 60%)`,
                            clipPath: 'polygon(100% 0, 100% 100%, 0 100%)'
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Certificate Content */}
                  <div className="absolute inset-0 flex flex-col justify-between p-16">
                    
                    {/* Header Section */}
                    <div className="text-center pt-6">
                      <h1 
                        className="text-4xl font-bold mb-4 tracking-widest"
                        style={{ 
                          fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif",
                          color: currentTemplate.titleColor,
                          fontWeight: 'bold',
                          letterSpacing: '4px',
                          textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                          lineHeight: '1.2'
                        }}
                      >
                        CERTIFICATE OF ACHIEVEMENT
                      </h1>
                      
                      {/* Decorative divider */}
                      <div className="flex items-center justify-center gap-4 mb-4">
                        <div 
                          className="w-20 h-px"
                          style={{ backgroundColor: currentTemplate.borderColor, opacity: 0.8 }}
                        ></div>
                        <div 
                          className="w-3 h-3 rounded-full border-2"
                          style={{ borderColor: currentTemplate.borderColor }}
                        ></div>
                        <div 
                          className="w-20 h-px"
                          style={{ backgroundColor: currentTemplate.borderColor, opacity: 0.8 }}
                        ></div>
                      </div>

                      <p 
                        className="text-base tracking-wider mb-6"
                        style={{ 
                          fontFamily: "'Cinzel', Georgia, serif",
                          color: currentTemplate.secondaryText,
                          letterSpacing: '3px',
                          fontSize: '14px'
                        }}
                      >
                        THIS CERTIFICATE IS PROUDLY PRESENTED TO
                      </p>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 flex flex-col justify-center text-center">
                      {/* Name Section */}
                      <div className="mb-8">
                        <h2 
                          className="text-5xl font-bold mb-4"
                          style={{ 
                            fontFamily: "'Playfair Display', Georgia, serif",
                            color: currentTemplate.primaryText,
                            fontWeight: 'bold',
                            letterSpacing: '2px',
                            textShadow: '0 2px 8px rgba(0,0,0,0.3)'
                          }}
                        >
                          {certificateData.internName || 'Name Surname'}
                        </h2>
                        <div 
                          className="w-48 h-1 mx-auto rounded-full"
                          style={{ 
                            background: `linear-gradient(90deg, transparent, ${currentTemplate.borderColor}, transparent)`
                          }}
                        ></div>
                      </div>

                      {/* Achievement Text */}
                      <div className="space-y-4 mb-8">
                        <p 
                          className="text-lg"
                          style={{ 
                            fontFamily: "'Cinzel', Georgia, serif",
                            color: currentTemplate.secondaryText,
                            letterSpacing: '1px',
                            lineHeight: '1.6'
                          }}
                        >
                          For successfully completing the internship program at
                        </p>
                        
                        <h3 
                          className="text-3xl font-bold"
                          style={{ 
                            fontFamily: "'Cinzel', Georgia, serif",
                            color: currentTemplate.titleColor,
                            fontWeight: 'bold',
                            letterSpacing: '2px',
                            textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                          }}
                        >
                          SLT Finance India
                        </h3>
                      </div>

                      {/* Details Section */}
                      <div 
                        className="bg-black bg-opacity-20 rounded-lg p-6 mx-8 backdrop-blur-sm"
                        style={{
                          border: `1px solid ${currentTemplate.borderColor}40`
                        }}
                      >
                        <div className="grid grid-cols-2 gap-8">
                          <div className="text-center">
                            <p 
                              className="text-xs font-semibold uppercase tracking-widest mb-2"
                              style={{ 
                                fontFamily: "'Inter', sans-serif",
                                color: currentTemplate.secondaryText,
                                opacity: 0.9
                              }}
                            >
                              DEPARTMENT
                            </p>
                            <p 
                              className="text-lg font-bold"
                              style={{ 
                                fontFamily: "'Cinzel', Georgia, serif",
                                color: currentTemplate.primaryText
                              }}
                            >
                              {certificateData.department || '[Department]'}
                            </p>
                          </div>
                          <div className="text-center">
                            <p 
                              className="text-xs font-semibold uppercase tracking-widest mb-2"
                              style={{ 
                                fontFamily: "'Inter', sans-serif",
                                color: currentTemplate.secondaryText,
                                opacity: 0.9
                              }}
                            >
                              EMPLOYEE ID
                            </p>
                            <p 
                              className="text-lg font-bold"
                              style={{ 
                                fontFamily: "'Cinzel', Georgia, serif",
                                color: currentTemplate.primaryText
                              }}
                            >
                              {certificateData.internId || '[ID]'}
                            </p>
                          </div>
                          <div className="text-center">
                            <p 
                              className="text-xs font-semibold uppercase tracking-widest mb-2"
                              style={{ 
                                fontFamily: "'Inter', sans-serif",
                                color: currentTemplate.secondaryText,
                                opacity: 0.9
                              }}
                            >
                              PROGRAM DURATION
                            </p>
                            <p 
                              className="text-lg font-bold"
                              style={{ 
                                fontFamily: "'Cinzel', Georgia, serif",
                                color: currentTemplate.primaryText
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
                                fontFamily: "'Inter', sans-serif",
                                color: currentTemplate.secondaryText,
                                opacity: 0.9
                              }}
                            >
                              PERFORMANCE
                            </p>
                            <p 
                              className="text-lg font-bold"
                              style={{ 
                                fontFamily: "'Cinzel', Georgia, serif",
                                color: currentTemplate.titleColor
                              }}
                            >
                              {certificateData.performance}
                            </p>
                          </div>
                        </div>
                        
                        {certificateData.customText && (
                          <div 
                            className="mt-6 pt-4"
                            style={{ 
                              borderTop: `1px solid ${currentTemplate.borderColor}40`
                            }}
                          >
                            <p 
                              className="text-sm italic text-center"
                              style={{ 
                                fontFamily: "'Playfair Display', Georgia, serif",
                                color: currentTemplate.secondaryText,
                                fontStyle: 'italic',
                                lineHeight: '1.6'
                              }}
                            >
                              "{certificateData.customText}"
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer Section */}
                    <div className="flex justify-between items-end pb-4">
                      <div className="text-center">
                        <div 
                          className="w-40 h-px mb-3"
                          style={{ backgroundColor: currentTemplate.borderColor, opacity: 0.7 }}
                        ></div>
                        <p 
                          className="text-xs font-semibold uppercase tracking-widest mb-1"
                          style={{ 
                            fontFamily: "'Inter', sans-serif",
                            color: currentTemplate.secondaryText,
                            fontSize: '10px'
                          }}
                        >
                          DATE
                        </p>
                        <p 
                          className="text-sm font-bold"
                          style={{ 
                            fontFamily: "'Cinzel', Georgia, serif",
                            color: currentTemplate.primaryText
                          }}
                        >
                          {format(new Date(), 'MMMM dd, yyyy')}
                        </p>
                      </div>
                      
                      <div className="text-center">
                        <div 
                          className="w-40 h-px mb-3"
                          style={{ backgroundColor: currentTemplate.borderColor, opacity: 0.7 }}
                        ></div>
                        <p 
                          className="text-xs font-semibold uppercase tracking-widest mb-1"
                          style={{ 
                            fontFamily: "'Inter', sans-serif",
                            color: currentTemplate.secondaryText,
                            fontSize: '10px'
                          }}
                        >
                          AUTHORIZED SIGNATURE
                        </p>
                        <p 
                          className="text-sm font-bold"
                          style={{ 
                            fontFamily: "'Cinzel', Georgia, serif",
                            color: currentTemplate.primaryText
                          }}
                        >
                          HR Department
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Elegant watermark */}
                  <div 
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    style={{ 
                      fontSize: '120px',
                      color: currentTemplate.borderColor,
                      opacity: 0.08,
                      fontWeight: 'bold',
                      transform: 'rotate(-45deg)',
                      fontFamily: "'Cinzel', Georgia, serif"
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
