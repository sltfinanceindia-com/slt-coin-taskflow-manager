import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Award, FileText, Coins, LineChart, BriefcaseBusiness, ShieldCheck, Banknote, BadgeCheck } from 'lucide-react';
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
  supervisor?: string;
  skills?: string;
}

interface CertificateGeneratorProps {
  internData?: any;
  onClose?: () => void;
}

export function CertificateGenerator({ internData, onClose }: CertificateGeneratorProps) {
  const { profile } = useAuth();
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [template, setTemplate] = useState<'emerald' | 'forest' | 'sage'>('emerald');
  const [certificateData, setCertificateData] = useState<CertificateData>({
    internName: internData?.full_name || '',
    internId: internData?.employee_id || '',
    department: internData?.department || '',
    startDate: internData?.start_date || '',
    endDate: internData?.end_date || format(new Date(), 'yyyy-MM-dd'),
    totalHours: internData?.total_hours || 0,
    totalCoins: internData?.total_coins || 0,
    completedTasks: internData?.completed_tasks || 0,
    performance: 'Excellent',
    customText: '',
    supervisor: internData?.supervisor || '',
    skills: internData?.skills || '',
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
      link.href =
        'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Cinzel:wght@400;600;700&family=Inter:wght@300;400;500;600;700&display=swap';
      link.rel = 'stylesheet';
      document.head.appendChild(link);

      await new Promise<void>((resolve) => {
        if ((document as any).fonts) {
          (document as any).fonts.ready.then(() => resolve());
        } else {
          setTimeout(() => resolve(), 2000);
        }
      });
    } catch {
      // Fallback silently
    }
  };

  // Fixed canvas size for preview and capture
  const CERT_W = 780;
  const CERT_H = 550;

  const generatePDF = async () => {
    if (!certificateRef.current) return;

    setIsGenerating(true);
    try {
      await loadFonts();
      await new Promise<void>((r) => setTimeout(r, 400));

      certificateRef.current.scrollIntoView({ behavior: 'instant', block: 'center' as ScrollLogicalPosition });

      const dpr = Math.min(2, window.devicePixelRatio || 1.5);
      const canvas = await html2canvas(certificateRef.current, {
        scale: dpr,
        useCORS: true,
        backgroundColor: '#ffffff',
        width: CERT_W,
        height: CERT_H,
        windowWidth: CERT_W,
        windowHeight: CERT_H,
        removeContainer: true,
        logging: false,
        onclone: (doc) => {
          const el = doc.getElementById('certificate-canvas-root');
          if (el) {
            el.setAttribute('style', `width:${CERT_W}px;height:${CERT_H}px;`);
          }
        },
        ignoreElements: (el) => el.tagName === 'SCRIPT',
      });

      const pdfWidth = 297;
      const pdfHeight = 210;
      const canvasAspectRatio = canvas.width / canvas.height;

      let finalWidth = pdfWidth - 16;
      let finalHeight = finalWidth / canvasAspectRatio;
      if (finalHeight > pdfHeight - 16) {
        finalHeight = pdfHeight - 16;
        finalWidth = finalHeight * canvasAspectRatio;
      }
      const x = (pdfWidth - finalWidth) / 2;
      const y = (pdfHeight - finalHeight) / 2;

      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png', 1.0);
      pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);
      pdf.save(`certificate-${(certificateData.internName || 'intern').replace(/\s+/g, '-').toLowerCase()}.pdf`);

      toast({
        title: 'Certificate Generated Successfully',
        description: 'Your certificate has been downloaded.',
      });
    } catch (error) {
      console.error('PDF Generation Error:', error);
      toast({
        title: 'PDF Generation Failed',
        description: 'There was an error generating the PDF. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const templates = {
    emerald: {
      name: 'Emerald Professional',
      bgGradient:
        'linear-gradient(135deg, #1f2937 0%, #374151 20%, #4b5563 40%, #065f46 60%, #047857 80%, #059669 100%)',
      accentColor: '#10b981',
      primaryText: '#ffffff',
      secondaryText: '#d1fae5',
      titleColor: '#34d399',
      borderColor: '#10b981',
      lightAccent: '#6ee7b7',
    },
    forest: {
      name: 'Forest Executive',
      bgGradient:
        'linear-gradient(135deg, #111827 0%, #1f2937 25%, #374151 45%, #14532d 65%, #166534 80%, #15803d 100%)',
      accentColor: '#22c55e',
      primaryText: '#ffffff',
      secondaryText: '#dcfce7',
      titleColor: '#4ade80',
      borderColor: '#16a34a',
      lightAccent: '#86efac',
    },
    sage: {
      name: 'Sage Elegant',
      bgGradient:
        'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 45%, #052e16 65%, #14532d 80%, #166534 100%)',
      accentColor: '#15803d',
      primaryText: '#f8fafc',
      secondaryText: '#dcfce7',
      titleColor: '#22c55e',
      borderColor: '#15803d',
      lightAccent: '#86efac',
    },
  };

  const currentTemplate = templates[template];

  const FinanceChip = ({
    Icon,
    label,
    color,
    value,
  }: {
    Icon: any;
    label: string;
    color: string;
    value: string | number;
  }) => (
    <div
      className="flex items-center justify-center gap-2"
      style={{
        background: 'rgba(0,0,0,0.15)',
        border: `1px solid ${color}60`,
        borderRadius: 8,
        padding: '8px 10px',
        minHeight: 48,
      }}
    >
      <Icon size={14} color={color} />
      <div className="text-center">
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            color: currentTemplate.secondaryText,
            opacity: 0.9,
            fontSize: '8px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: 2,
            lineHeight: 1,
          }}
        >
          {label}
        </p>
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            color: label === 'PERFORMANCE' ? currentTemplate.titleColor : currentTemplate.primaryText,
            fontSize: '10px',
            fontWeight: 'bold',
            lineHeight: 1.1,
          }}
        >
          {value}
        </p>
      </div>
    </div>
  );

  const HeaderFinanceRow = () => (
    <div className="flex items-center justify-center gap-8 mb-4" style={{ opacity: 0.95 }}>
      <div
        className="flex items-center gap-2 px-3 py-1 rounded-full"
        style={{
          border: `1px solid ${currentTemplate.borderColor}50`,
          background: 'rgba(0,0,0,0.15)',
        }}
      >
        <BriefcaseBusiness size={12} color={currentTemplate.lightAccent} />
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            color: currentTemplate.secondaryText,
            fontSize: 10,
            letterSpacing: '1px',
          }}
        >
          Finance Internship
        </span>
      </div>
      <div
        className="flex items-center gap-2 px-3 py-1 rounded-full"
        style={{
          border: `1px solid ${currentTemplate.borderColor}50`,
          background: 'rgba(0,0,0,0.15)',
        }}
      >
        <LineChart size={12} color={currentTemplate.lightAccent} />
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            color: currentTemplate.secondaryText,
            fontSize: 10,
            letterSpacing: '1px',
          }}
        >
          Performance & Growth
        </span>
      </div>
      <div
        className="flex items-center gap-2 px-3 py-1 rounded-full"
        style={{
          border: `1px solid ${currentTemplate.borderColor}50`,
          background: 'rgba(0,0,0,0.15)',
        }}
      >
        <Coins size={12} color={currentTemplate.lightAccent} />
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            color: currentTemplate.secondaryText,
            fontSize: 10,
            letterSpacing: '1px',
          }}
        >
          Value Creation
        </span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-8">
          {/* Certificate Form */}
          <Card className="border border-border shadow-sm">
            <CardHeader className="px-6 py-6 border-b border-border">
              <CardTitle className="flex items-center gap-3 text-xl font-semibold text-foreground">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                  <Award className="h-4 w-4 text-green-600" />
                </div>
                Advanced Certificate Generator
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground mt-2">
                Generate elegant completion certificates with sophisticated green theme design
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
              <div className="space-y-3">
                <Label htmlFor="template" className="text-sm font-medium text-foreground">
                  Certificate Template
                </Label>
                <Select value={template} onValueChange={(v) => setTemplate(v as any)}>
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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="internName" className="text-sm font-medium text-foreground">
                    Intern Name *
                  </Label>
                  <Input
                    id="internName"
                    value={certificateData.internName}
                    onChange={(e) => setCertificateData((prev) => ({ ...prev, internName: e.target.value }))}
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
                    onChange={(e) => setCertificateData((prev) => ({ ...prev, internId: e.target.value }))}
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
                    onChange={(e) => setCertificateData((prev) => ({ ...prev, department: e.target.value }))}
                    className="h-11"
                    placeholder="Enter department name"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="supervisor" className="text-sm font-medium text-foreground">
                    Supervisor Name *
                  </Label>
                  <Input
                    id="supervisor"
                    required
                    value={certificateData.supervisor || ''}
                    onChange={(e) => setCertificateData((prev) => ({ ...prev, supervisor: e.target.value }))}
                    className="h-11"
                    placeholder="Enter supervisor's full name"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="totalHours" className="text-sm font-medium text-foreground">
                    Total Hours
                  </Label>
                  <Input
                    id="totalHours"
                    type="number"
                    value={certificateData.totalHours}
                    onChange={(e) =>
                      setCertificateData((prev) => ({ ...prev, totalHours: parseInt(e.target.value) || 0 }))
                    }
                    className="h-11"
                    placeholder="Enter total hours"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="performance" className="text-sm font-medium text-foreground">
                    Performance Rating
                  </Label>
                  <Select
                    value={certificateData.performance}
                    onValueChange={(value) => setCertificateData((prev) => ({ ...prev, performance: value }))}
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
                    onChange={(e) => setCertificateData((prev) => ({ ...prev, startDate: e.target.value }))}
                    className="h-11"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="endDate" className="text-sm font-medium text-foreground">
                    End Date *
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={certificateData.endDate}
                    onChange={(e) => setCertificateData((prev) => ({ ...prev, endDate: e.target.value }))}
                    className="h-11"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="completedTasks" className="text-sm font-medium text-foreground">
                    Completed Tasks
                  </Label>
                  <Input
                    id="completedTasks"
                    type="number"
                    value={certificateData.completedTasks}
                    onChange={(e) =>
                      setCertificateData((prev) => ({ ...prev, completedTasks: parseInt(e.target.value) || 0 }))
                    }
                    className="h-11"
                    placeholder="Number of tasks completed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="skills" className="text-sm font-medium text-foreground">
                    Key Skills Acquired
                  </Label>
                  <Textarea
                    id="skills"
                    placeholder="e.g., Financial Analysis, Data Management, Client Relations..."
                    value={certificateData.skills}
                    onChange={(e) => setCertificateData((prev) => ({ ...prev, skills: e.target.value }))}
                    rows={3}
                    className="resize-none"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="customText" className="text-sm font-medium text-foreground">
                    Recognition Message (Optional)
                  </Label>
                  <Textarea
                    id="customText"
                    placeholder="Add a special recognition message or achievement note..."
                    value={certificateData.customText}
                    onChange={(e) => setCertificateData((prev) => ({ ...prev, customText: e.target.value }))}
                    rows={3}
                    className="resize-none"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-border">
                <Button
                  onClick={generatePDF}
                  disabled={
                    isGenerating ||
                    !certificateData.internName?.trim() ||
                    !certificateData.endDate ||
                    !certificateData.supervisor?.trim()
                  }
                  className="h-11 px-6 font-medium bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
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
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-green-600" />
                </div>
                Certificate Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="overflow-auto bg-slate-50 p-6 rounded-lg border border-border">
                <div
                  id="certificate-canvas-root"
                  ref={certificateRef}
                  className="mx-auto relative rounded-lg overflow-hidden"
                  style={{
                    width: `${CERT_W}px`,
                    height: `${CERT_H}px`,
                    background: currentTemplate.bgGradient,
                    fontFamily: "'Inter', 'Cinzel', Georgia, serif",
                    WebkitFontSmoothing: 'antialiased',
                    MozOsxFontSmoothing: 'grayscale',
                  }}
                >
                  {/* Decorative Border */}
                  <div className="absolute inset-0 p-3">
                    <div
                      className="w-full h-full border-2 rounded-lg relative overflow-hidden"
                      style={{
                        borderColor: currentTemplate.borderColor,
                        borderStyle: 'solid',
                      }}
                    >
                      {/* Corner decorations */}
                      <div className="absolute top-0 left-0 w-16 h-16">
                        <div
                          className="absolute inset-0 border-r-2 border-b-2 rounded-br-2xl"
                          style={{ borderColor: currentTemplate.lightAccent, opacity: 0.6 }}
                        />
                        <div
                          className="absolute top-1 left-1 w-10 h-10 border-r border-b rounded-br-xl"
                          style={{ borderColor: currentTemplate.accentColor, opacity: 0.4 }}
                        />
                      </div>
                      <div className="absolute top-0 right-0 w-16 h-16">
                        <div
                          className="absolute inset-0 border-l-2 border-b-2 rounded-bl-2xl"
                          style={{ borderColor: currentTemplate.lightAccent, opacity: 0.6 }}
                        />
                        <div
                          className="absolute top-1 right-1 w-10 h-10 border-l border-b rounded-bl-xl"
                          style={{ borderColor: currentTemplate.accentColor, opacity: 0.4 }}
                        />
                      </div>
                      <div className="absolute bottom-0 left-0 w-16 h-16">
                        <div
                          className="absolute inset-0 border-r-2 border-t-2 rounded-tr-2xl"
                          style={{ borderColor: currentTemplate.lightAccent, opacity: 0.6 }}
                        />
                        <div
                          className="absolute bottom-1 left-1 w-10 h-10 border-r border-t rounded-tr-xl"
                          style={{ borderColor: currentTemplate.accentColor, opacity: 0.4 }}
                        />
                      </div>
                      <div className="absolute bottom-0 right-0 w-16 h-16">
                        <div
                          className="absolute inset-0 border-l-2 border-t-2 rounded-tl-2xl"
                          style={{ borderColor: currentTemplate.lightAccent, opacity: 0.6 }}
                        />
                        <div
                          className="absolute bottom-1 right-1 w-10 h-10 border-l border-t rounded-tl-xl"
                          style={{ borderColor: currentTemplate.accentColor, opacity: 0.4 }}
                        />
                      </div>

                      {/* Side accents */}
                      <div className="absolute top-1/2 left-1 w-3 h-24 -translate-y-1/2">
                        <div
                          className="w-full h-full rounded-full"
                          style={{
                            background: `linear-gradient(to bottom, transparent, ${currentTemplate.accentColor}, transparent)`,
                            opacity: 0.2,
                          }}
                        />
                      </div>
                      <div className="absolute top-1/2 right-1 w-3 h-24 -translate-y-1/2">
                        <div
                          className="w-full h-full rounded-full"
                          style={{
                            background: `linear-gradient(to bottom, transparent, ${currentTemplate.accentColor}, transparent)`,
                            opacity: 0.2,
                          }}
                        />
                      </div>

                      {/* Top glyphs */}
                      <div
                        className="absolute left-0 right-0 top-0 flex items-center justify-between px-6 py-2"
                        style={{ opacity: 0.25 }}
                      >
                        <Coins size={14} color={currentTemplate.lightAccent} />
                        <LineChart size={14} color={currentTemplate.lightAccent} />
                        <BriefcaseBusiness size={14} color={currentTemplate.lightAccent} />
                        <ShieldCheck size={14} color={currentTemplate.lightAccent} />
                        <Banknote size={14} color={currentTemplate.lightAccent} />
                        <BadgeCheck size={14} color={currentTemplate.lightAccent} />
                      </div>
                    </div>
                  </div>

                  {/* Certificate Content */}
                  <div className="absolute inset-0 flex flex-col justify-between p-8">
                    {/* Header */}
                    <div className="text-center flex-shrink-0">
                      <h1
                        className="font-bold mb-2 tracking-widest"
                        style={{
                          fontFamily: "'Cinzel', Georgia, serif",
                          color: currentTemplate.titleColor,
                          fontWeight: 'bold',
                          letterSpacing: '2px',
                          textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                          fontSize: '24px',
                          lineHeight: '1.1',
                        }}
                      >
                        CERTIFICATE OF EXCELLENCE
                      </h1>

                      <HeaderFinanceRow />

                      {/* Divider */}
                      <div className="flex items-center justify-center gap-3 mb-4" style={{ opacity: 0.9 }}>
                        <div
                          className="h-0.5 rounded-full"
                          style={{
                            width: '16px',
                            background: `linear-gradient(90deg, transparent, ${currentTemplate.borderColor})`,
                            opacity: 0.8,
                          }}
                        />
                        <div
                          className="rounded-full"
                          style={{
                            width: '6px',
                            height: '6px',
                            backgroundColor: currentTemplate.accentColor,
                            boxShadow: `0 0 4px ${currentTemplate.accentColor}40`,
                          }}
                        />
                        <div
                          className="h-0.5 rounded-full"
                          style={{
                            width: '10px',
                            backgroundColor: currentTemplate.lightAccent,
                            opacity: 0.9,
                          }}
                        />
                        <div
                          className="rounded-full"
                          style={{
                            width: '4px',
                            height: '4px',
                            backgroundColor: 'transparent',
                            border: `1px solid ${currentTemplate.accentColor}`,
                          }}
                        />
                        <div
                          className="h-0.5 rounded-full"
                          style={{
                            width: '10px',
                            backgroundColor: currentTemplate.lightAccent,
                            opacity: 0.9,
                          }}
                        />
                        <div
                          className="rounded-full"
                          style={{
                            width: '6px',
                            height: '6px',
                            backgroundColor: currentTemplate.accentColor,
                            boxShadow: `0 0 4px ${currentTemplate.accentColor}40`,
                          }}
                        />
                        <div
                          className="h-0.5 rounded-full"
                          style={{
                            width: '16px',
                            background: `linear-gradient(90deg, ${currentTemplate.borderColor}, transparent)`,
                            opacity: 0.8,
                          }}
                        />
                      </div>

                      {/* Subtitle */}
                      <div className="text-center mb-6">
                        <p
                          className="tracking-wider relative inline-block"
                          style={{
                            fontFamily: "'Inter', sans-serif",
                            color: currentTemplate.secondaryText,
                            letterSpacing: '2.5px',
                            fontSize: '11px',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                            position: 'relative',
                            paddingBottom: '8px',
                          }}
                        >
                          INTERNSHIP PROGRAM COMPLETION
                          <span
                            className="absolute bottom-0 left-1/2 transform -translate-x-1/2"
                            style={{
                              width: '80%',
                              height: '1px',
                              background: `linear-gradient(90deg, transparent, ${currentTemplate.lightAccent}60, transparent)`,
                              opacity: 0.7,
                            }}
                          />
                        </p>
                      </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 flex flex-col justify-center">
                      {/* Presented to */}
                      <div className="text-center mb-4 relative">
                        <div
                          className="inline-block px-6 py-2 rounded-lg"
                          style={{
                            background: `linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))`,
                            border: `1px solid ${currentTemplate.borderColor}20`,
                          }}
                        >
                          <p
                            style={{
                              fontFamily: "'Inter', sans-serif",
                              color: currentTemplate.secondaryText,
                              letterSpacing: '1px',
                              fontSize: '13px',
                              fontWeight: 400,
                              lineHeight: 1.5,
                              fontStyle: 'italic',
                              margin: 0,
                            }}
                          >
                            This certificate is proudly presented to
                          </p>
                        </div>

                        {/* Decorative corners */}
                        <div
                          className="absolute -top-1 -left-1 w-3 h-3 border-l-2 border-t-2 rounded-tl-lg"
                          style={{ borderColor: currentTemplate.accentColor, opacity: 0.3 }}
                        />
                        <div
                          className="absolute -top-1 -right-1 w-3 h-3 border-r-2 border-t-2 rounded-tr-lg"
                          style={{ borderColor: currentTemplate.accentColor, opacity: 0.3 }}
                        />
                        <div
                          className="absolute -bottom-1 -left-1 w-3 h-3 border-l-2 border-b-2 rounded-bl-lg"
                          style={{ borderColor: currentTemplate.accentColor, opacity: 0.3 }}
                        />
                        <div
                          className="absolute -bottom-1 -right-1 w-3 h-3 border-r-2 border-b-2 rounded-br-lg"
                          style={{ borderColor: currentTemplate.accentColor, opacity: 0.3 }}
                        />
                      </div>

                      {/* Name */}
                      <div className="mb-4">
                        <div
                          className="rounded-lg p-3 mx-auto max-w-sm"
                          style={{
                            background: 'rgba(0,0,0,0.20)',
                            border: `1px solid ${currentTemplate.borderColor}60`,
                          }}
                        >
                          <h2
                            className="text-center"
                            style={{
                              fontFamily: "'Playfair Display', Georgia, serif",
                              color: currentTemplate.primaryText,
                              fontWeight: 'bold',
                              letterSpacing: '1px',
                              textShadow: '0 2px 8px rgba(0,0,0,0.3)',
                              fontSize: '30px',
                              lineHeight: 1.2,
                              margin: 0,
                              padding: '6px 0',
                            }}
                          >
                            {certificateData.internName || 'Name Surname'}
                          </h2>
                        </div>
                        <div
                          className="w-24 h-0.5 mx-auto mt-2 rounded-full"
                          style={{
                            background: `linear-gradient(90deg, transparent, ${currentTemplate.lightAccent}, transparent)`,
                          }}
                        />
                      </div>

                      {/* Achievement Text */}
                      <div className="text-center mb-4">
                        <p
                          className="mb-2"
                          style={{
                            fontFamily: "'Inter', sans-serif",
                            color: currentTemplate.secondaryText,
                            letterSpacing: '0.5px',
                            fontSize: '12px',
                          }}
                        >
                          for the successful completion of internship program at
                        </p>

                        <h3
                          className="font-bold mb-3"
                          style={{
                            fontFamily: "'Cinzel', Georgia, serif",
                            color: currentTemplate.titleColor,
                            fontWeight: 'bold',
                            letterSpacing: '1px',
                            textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                            fontSize: '20px',
                          }}
                        >
                          SLT Finance India
                        </h3>
                      </div>

                      {/* Enhanced Details Grid */}
                      <div
                        className="rounded-lg p-3 mx-4"
                        style={{
                          background: 'rgba(0,0,0,0.18)',
                          border: `1px solid ${currentTemplate.borderColor}40`,
                        }}
                      >
                        <div className="grid grid-cols-3 gap-3 mb-3">
                          <div className="text-center">
                            <p
                              style={{
                                fontFamily: "'Inter', sans-serif",
                                color: currentTemplate.secondaryText,
                                opacity: 0.9,
                                fontSize: '8px',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                marginBottom: 4,
                              }}
                            >
                              DEPARTMENT
                            </p>
                            <div className="flex items-center justify-center gap-1">
                              <BriefcaseBusiness size={12} color={currentTemplate.accentColor} />
                              <p
                                style={{
                                  fontFamily: "'Inter', sans-serif",
                                  color: currentTemplate.primaryText,
                                  fontSize: '10px',
                                  fontWeight: 'bold',
                                }}
                              >
                                {certificateData.department || '[Department]'}
                              </p>
                            </div>
                          </div>
                          <div className="text-center">
                            <p
                              style={{
                                fontFamily: "'Inter', sans-serif",
                                color: currentTemplate.secondaryText,
                                opacity: 0.9,
                                fontSize: '8px',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                marginBottom: 4,
                              }}
                            >
                              ID NUMBER
                            </p>
                            <div className="flex items-center justify-center gap-1">
                              <ShieldCheck size={12} color={currentTemplate.accentColor} />
                              <p
                                style={{
                                  fontFamily: "'Inter', sans-serif",
                                  color: currentTemplate.primaryText,
                                  fontSize: '10px',
                                  fontWeight: 'bold',
                                }}
                              >
                                {certificateData.internId || '[ID]'}
                              </p>
                            </div>
                          </div>
                          <div className="text-center">
                            <p
                              style={{
                                fontFamily: "'Inter', sans-serif",
                                color: currentTemplate.secondaryText,
                                opacity: 0.9,
                                fontSize: '8px',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                marginBottom: 4,
                              }}
                            >
                              DURATION
                            </p>
                            <div className="flex items-center justify-center gap-1">
                              <LineChart size={12} color={currentTemplate.accentColor} />
                              <p
                                style={{
                                  fontFamily: "'Inter', sans-serif",
                                  color: currentTemplate.primaryText,
                                  fontSize: '10px',
                                  fontWeight: 'bold',
                                }}
                              >
                                {certificateData.startDate && certificateData.endDate
                                  ? `${format(new Date(certificateData.startDate), 'MMM yyyy')} - ${format(
                                      new Date(certificateData.endDate),
                                      'MMM yyyy'
                                    )}`
                                  : '[Duration]'}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 mb-2">
                          <FinanceChip
                            Icon={Coins}
                            label="TOTAL HOURS"
                            color={currentTemplate.accentColor}
                            value={`${certificateData.totalHours || 0} hrs`}
                          />
                          <FinanceChip
                            Icon={BadgeCheck}
                            label="PERFORMANCE"
                            color={currentTemplate.titleColor}
                            value={certificateData.performance}
                          />
                          <FinanceChip
                            Icon={Banknote}
                            label="TASKS COMPLETED"
                            color={currentTemplate.accentColor}
                            value={certificateData.completedTasks || 0}
                          />
                        </div>

                        {(certificateData.skills || certificateData.customText) && (
                          <div
                            className="pt-2"
                            style={{
                              borderTop: `1px solid ${currentTemplate.borderColor}40`,
                            }}
                          >
                            {certificateData.skills && (
                              <div className="mb-1">
                                <p
                                  style={{
                                    fontFamily: "'Inter', sans-serif",
                                    color: currentTemplate.secondaryText,
                                    fontSize: '7px',
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    marginBottom: '2px',
                                  }}
                                >
                                  KEY SKILLS ACQUIRED:
                                </p>
                                <div className="flex items-start justify-center gap-2">
                                  <LineChart size={10} color={currentTemplate.lightAccent} />
                                  <p
                                    className="text-center"
                                    style={{
                                      fontFamily: "'Inter', sans-serif",
                                      color: currentTemplate.primaryText,
                                      fontSize: '8px',
                                      lineHeight: 1.3,
                                    }}
                                  >
                                    {certificateData.skills}
                                  </p>
                                </div>
                              </div>
                            )}
                            {certificateData.customText && (
                              <div className="flex items-center justify-center gap-2">
                                <ShieldCheck size={10} color={currentTemplate.lightAccent} />
                                <p
                                  className="text-center italic"
                                  style={{
                                    fontFamily: "'Playfair Display', Georgia, serif",
                                    color: currentTemplate.secondaryText,
                                    fontStyle: 'italic',
                                    fontSize: '8px',
                                    lineHeight: 1.3,
                                  }}
                                >
                                  "{certificateData.customText}"
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer Section - CORRECTED ALIGNMENT */}
                    <div className="flex items-end justify-between flex-shrink-0 mt-6">
                      {/* Date block */}
                      <div className="flex flex-col items-center" style={{ width: '45%' }}>
                        <div
                          style={{
                            width: '120px',
                            height: '1px',
                            backgroundColor: currentTemplate.borderColor,
                            opacity: 0.7,
                            marginBottom: '8px',
                          }}
                        />
                        <p
                          style={{
                            fontFamily: "'Inter', sans-serif",
                            color: currentTemplate.secondaryText,
                            fontSize: '7px',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            marginBottom: '4px',
                            textAlign: 'center',
                          }}
                        >
                          Date
                        </p>
                        <p
                          style={{
                            fontFamily: "'Inter', sans-serif",
                            color: currentTemplate.primaryText,
                            fontSize: '9px',
                            fontWeight: 'bold',
                            textAlign: 'center',
                            minHeight: '14px',
                          }}
                        >
                          {certificateData.endDate
                            ? format(new Date(certificateData.endDate), 'MMM dd, yyyy')
                            : format(new Date(), 'MMM dd, yyyy')}
                        </p>
                      </div>

                      {/* Supervisor block */}
                      <div className="flex flex-col items-center" style={{ width: '45%' }}>
                        <div
                          style={{
                            width: '120px',
                            height: '1px',
                            backgroundColor: currentTemplate.borderColor,
                            opacity: 0.7,
                            marginBottom: '8px',
                          }}
                        />
                        <p
                          style={{
                            fontFamily: "'Inter', sans-serif",
                            color: currentTemplate.secondaryText,
                            fontSize: '7px',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            marginBottom: '4px',
                            textAlign: 'center',
                          }}
                        >
                          Supervisor
                        </p>
                        <div className="flex items-center justify-center gap-1" style={{ minHeight: '14px' }}>
                          <BadgeCheck size={10} color={currentTemplate.accentColor} />
                          <p
                            style={{
                              fontFamily: "'Inter', sans-serif",
                              color: currentTemplate.primaryText,
                              fontSize: '9px',
                              fontWeight: 'bold',
                              textAlign: 'center',
                              maxWidth: '180px',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                            title={certificateData.supervisor || 'HR Department'}
                          >
                            {certificateData.supervisor?.trim() || 'HR Department'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Watermark */}
                  <div
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    style={{
                      fontSize: '80px',
                      color: currentTemplate.borderColor,
                      opacity: 0.04,
                      fontWeight: 'bold',
                      transform: 'rotate(-45deg)',
                      fontFamily: "'Cinzel', Georgia, serif",
                    }}
                  >
                    SLT
                  </div>

                  {/* Accent lines */}
                  <div className="absolute top-3 left-1/2 w-20 h-0.5 -translate-x-1/2" style={{ opacity: 0.25 }}>
                    <div
                      className="w-full h-full rounded-full"
                      style={{
                        background: `linear-gradient(90deg, transparent, ${currentTemplate.accentColor}, transparent)`,
                      }}
                    />
                  </div>
                  <div className="absolute bottom-3 left-1/2 w-20 h-0.5 -translate-x-1/2" style={{ opacity: 0.25 }}>
                    <div
                      className="w-full h-full rounded-full"
                      style={{
                        background: `linear-gradient(90deg, transparent, ${currentTemplate.accentColor}, transparent)`,
                      }}
                    />
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
