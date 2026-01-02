import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Award, Download, Calendar, BookOpen, Printer } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

interface Certificate {
  id: string;
  courseName: string;
  courseId: string;
  completionDate: string;
  certificateNumber: string;
  score?: number;
  grade?: string;
}

interface CertificateGeneratorProps {
  courseId?: string;
  courseName?: string;
  assessmentScore?: number;
  onGenerated?: (certificate: Certificate) => void;
}

// Local storage based certificate management
function getStoredCertificates(userId: string): Certificate[] {
  const key = `certificates_${userId}`;
  const stored = localStorage.getItem(key);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }
  return [];
}

function saveCertificate(userId: string, cert: Certificate) {
  const key = `certificates_${userId}`;
  const existing = getStoredCertificates(userId);
  existing.push(cert);
  localStorage.setItem(key, JSON.stringify(existing));
}

export function CertificateGenerator({ 
  courseId, 
  courseName,
  assessmentScore,
  onGenerated 
}: CertificateGeneratorProps) {
  const { profile } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [certificates, setCertificates] = useState<Certificate[]>(() => 
    profile?.id ? getStoredCertificates(profile.id) : []
  );

  const generateCertificateNumber = () => {
    const date = format(new Date(), 'yyyyMMdd');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `CERT-${date}-${random}`;
  };

  const getGrade = (score: number) => {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    return 'D';
  };

  const generatePDF = async (cert: Certificate) => {
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Background gradient effect (light blue border)
    pdf.setFillColor(240, 248, 255);
    pdf.rect(0, 0, 297, 210, 'F');
    
    // Border
    pdf.setDrawColor(59, 130, 246);
    pdf.setLineWidth(3);
    pdf.rect(10, 10, 277, 190, 'S');
    
    // Inner border
    pdf.setLineWidth(0.5);
    pdf.rect(15, 15, 267, 180, 'S');

    // Certificate text
    pdf.setFontSize(14);
    pdf.setTextColor(100, 100, 100);
    pdf.text('CERTIFICATE OF COMPLETION', 148.5, 40, { align: 'center' });

    // Award icon placeholder
    pdf.setFontSize(40);
    pdf.text('🏆', 148.5, 60, { align: 'center' });

    // Title
    pdf.setFontSize(28);
    pdf.setTextColor(30, 30, 30);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Certificate of Achievement', 148.5, 80, { align: 'center' });

    // This is to certify
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(80, 80, 80);
    pdf.text('This is to certify that', 148.5, 95, { align: 'center' });

    // Name
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(59, 130, 246);
    pdf.text(profile?.full_name || 'Student Name', 148.5, 110, { align: 'center' });

    // Has completed
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(80, 80, 80);
    pdf.text('has successfully completed the course', 148.5, 125, { align: 'center' });

    // Course name
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(30, 30, 30);
    pdf.text(cert.courseName, 148.5, 140, { align: 'center' });

    // Score and Grade
    if (cert.score) {
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`with a score of ${cert.score}% (Grade: ${cert.grade})`, 148.5, 152, { align: 'center' });
    }

    // Date
    pdf.setFontSize(11);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Completion Date: ${format(new Date(cert.completionDate), 'MMMM dd, yyyy')}`, 148.5, 165, { align: 'center' });

    // Certificate number
    pdf.setFontSize(9);
    pdf.text(`Certificate No: ${cert.certificateNumber}`, 148.5, 175, { align: 'center' });

    // Signature line
    pdf.setLineWidth(0.3);
    pdf.line(95, 188, 202, 188);
    pdf.setFontSize(10);
    pdf.text('Authorized Signature', 148.5, 195, { align: 'center' });

    return pdf;
  };

  const handleGenerateCertificate = async () => {
    if (!courseId || !courseName || !profile?.id) {
      toast.error('Course information is required');
      return;
    }

    setIsGenerating(true);
    try {
      const certificate: Certificate = {
        id: crypto.randomUUID(),
        courseId,
        courseName,
        completionDate: new Date().toISOString(),
        certificateNumber: generateCertificateNumber(),
        score: assessmentScore,
        grade: assessmentScore ? getGrade(assessmentScore) : undefined
      };

      saveCertificate(profile.id, certificate);
      setCertificates([...certificates, certificate]);
      toast.success('Certificate generated successfully!');
      onGenerated?.(certificate);
      
      // Auto-download the PDF
      const pdf = await generatePDF(certificate);
      pdf.save(`Certificate-${certificate.certificateNumber}.pdf`);
      
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate certificate');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (cert: Certificate) => {
    const pdf = await generatePDF(cert);
    pdf.save(`Certificate-${cert.certificateNumber}.pdf`);
    toast.success('Certificate downloaded!');
  };

  const handlePrint = async (cert: Certificate) => {
    const pdf = await generatePDF(cert);
    pdf.autoPrint();
    window.open(pdf.output('bloburl'), '_blank');
  };

  return (
    <div className="space-y-4">
      {/* Generate new certificate button (if course context) */}
      {courseId && courseName && (
        <Button 
          onClick={handleGenerateCertificate}
          disabled={isGenerating}
          className="w-full"
        >
          <Award className="h-4 w-4 mr-2" />
          {isGenerating ? 'Generating...' : 'Generate Certificate'}
        </Button>
      )}

      {/* Certificates list */}
      {certificates && certificates.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Award className="h-4 w-4 text-primary" />
            Your Certificates
          </h3>
          <div className="grid gap-3">
            {certificates.map((cert) => (
              <Card key={cert.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="font-medium">{cert.courseName}</h4>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(cert.completionDate), 'MMM dd, yyyy')}
                        </span>
                        {cert.score && (
                          <Badge variant="secondary">
                            Score: {cert.score}% ({cert.grade})
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 font-mono">
                        {cert.certificateNumber}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <BookOpen className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                          <DialogHeader>
                            <DialogTitle>Certificate Preview</DialogTitle>
                          </DialogHeader>
                          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-8 rounded-lg border-2 border-primary/20">
                            <div className="text-center space-y-4">
                              <p className="text-sm text-muted-foreground uppercase tracking-widest">
                                Certificate of Completion
                              </p>
                              <div className="text-5xl">🏆</div>
                              <h2 className="text-2xl font-bold">Certificate of Achievement</h2>
                              <p className="text-muted-foreground">This is to certify that</p>
                              <p className="text-2xl font-bold text-primary">{profile?.full_name}</p>
                              <p className="text-muted-foreground">has successfully completed the course</p>
                              <p className="text-xl font-semibold">{cert.courseName}</p>
                              {cert.score && (
                                <p className="text-sm text-muted-foreground">
                                  with a score of {cert.score}% (Grade: {cert.grade})
                                </p>
                              )}
                              <div className="pt-4 space-y-1">
                                <p className="text-sm text-muted-foreground">
                                  Completion Date: {format(new Date(cert.completionDate), 'MMMM dd, yyyy')}
                                </p>
                                <p className="text-xs font-mono text-muted-foreground">
                                  Certificate No: {cert.certificateNumber}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-center gap-2 mt-4">
                            <Button onClick={() => handleDownload(cert)}>
                              <Download className="h-4 w-4 mr-2" />
                              Download PDF
                            </Button>
                            <Button variant="outline" onClick={() => handlePrint(cert)}>
                              <Printer className="h-4 w-4 mr-2" />
                              Print
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button variant="outline" size="sm" onClick={() => handleDownload(cert)}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {(!certificates || certificates.length === 0) && !courseId && (
        <Card>
          <CardContent className="py-8 text-center">
            <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No Certificates Yet</h3>
            <p className="text-sm text-muted-foreground">
              Complete training courses or pass assessments to earn certificates.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
