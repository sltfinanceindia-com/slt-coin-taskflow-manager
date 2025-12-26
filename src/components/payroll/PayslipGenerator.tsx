import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FileText, Download, Printer, Building2, Calendar, User, IndianRupee } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';

interface PayslipData {
  id: string;
  employee: {
    full_name: string;
    email: string;
  };
  pay_period_start: string;
  pay_period_end: string;
  basic_salary: number;
  bonus: number;
  tax_deduction: number;
  pf_deduction: number;
  net_salary: number;
  payment_status: string;
  payment_date?: string;
}

interface PayslipGeneratorProps {
  record: PayslipData;
  organizationName?: string;
}

export function PayslipGenerator({ record, organizationName = 'Work HuB' }: PayslipGeneratorProps) {
  const { profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const generatePDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Header with gradient effect
      doc.setFillColor(16, 185, 129);
      doc.rect(0, 0, pageWidth, 45, 'F');
      
      // Company Logo placeholder
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text(organizationName, pageWidth / 2, 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('PAYSLIP', pageWidth / 2, 32, { align: 'center' });
      
      doc.setFontSize(10);
      doc.text(`Pay Period: ${format(new Date(record.pay_period_start), 'MMM dd')} - ${format(new Date(record.pay_period_end), 'MMM dd, yyyy')}`, pageWidth / 2, 40, { align: 'center' });
      
      // Reset text color
      doc.setTextColor(0, 0, 0);
      
      // Employee Details Section
      let yPos = 60;
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Employee Details', 20, yPos);
      
      doc.setDrawColor(200, 200, 200);
      doc.line(20, yPos + 2, pageWidth - 20, yPos + 2);
      
      yPos += 15;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      
      doc.text('Employee Name:', 20, yPos);
      doc.setFont('helvetica', 'bold');
      doc.text(record.employee.full_name, 80, yPos);
      
      yPos += 10;
      doc.setFont('helvetica', 'normal');
      doc.text('Email:', 20, yPos);
      doc.text(record.employee.email, 80, yPos);
      
      yPos += 10;
      doc.text('Payslip ID:', 20, yPos);
      doc.text(record.id.substring(0, 8).toUpperCase(), 80, yPos);
      
      // Earnings Section
      yPos += 25;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Earnings', 20, yPos);
      doc.line(20, yPos + 2, pageWidth - 20, yPos + 2);
      
      yPos += 15;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      
      // Table header
      doc.setFillColor(245, 245, 245);
      doc.rect(20, yPos - 5, pageWidth - 40, 10, 'F');
      doc.text('Description', 25, yPos);
      doc.text('Amount (₹)', pageWidth - 60, yPos);
      
      yPos += 12;
      doc.text('Basic Salary', 25, yPos);
      doc.text(record.basic_salary.toLocaleString('en-IN'), pageWidth - 60, yPos);
      
      yPos += 10;
      doc.text('Bonus', 25, yPos);
      doc.setTextColor(34, 197, 94);
      doc.text(`+ ${record.bonus.toLocaleString('en-IN')}`, pageWidth - 60, yPos);
      doc.setTextColor(0, 0, 0);
      
      yPos += 12;
      doc.setFont('helvetica', 'bold');
      doc.text('Total Earnings', 25, yPos);
      doc.text((record.basic_salary + record.bonus).toLocaleString('en-IN'), pageWidth - 60, yPos);
      
      // Deductions Section
      yPos += 25;
      doc.setFontSize(14);
      doc.text('Deductions', 20, yPos);
      doc.line(20, yPos + 2, pageWidth - 20, yPos + 2);
      
      yPos += 15;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      
      doc.setFillColor(245, 245, 245);
      doc.rect(20, yPos - 5, pageWidth - 40, 10, 'F');
      doc.text('Description', 25, yPos);
      doc.text('Amount (₹)', pageWidth - 60, yPos);
      
      yPos += 12;
      doc.text('Income Tax (TDS)', 25, yPos);
      doc.setTextColor(239, 68, 68);
      doc.text(`- ${record.tax_deduction.toLocaleString('en-IN')}`, pageWidth - 60, yPos);
      doc.setTextColor(0, 0, 0);
      
      yPos += 10;
      doc.text('Provident Fund (PF)', 25, yPos);
      doc.setTextColor(239, 68, 68);
      doc.text(`- ${record.pf_deduction.toLocaleString('en-IN')}`, pageWidth - 60, yPos);
      doc.setTextColor(0, 0, 0);
      
      yPos += 12;
      doc.setFont('helvetica', 'bold');
      doc.text('Total Deductions', 25, yPos);
      doc.setTextColor(239, 68, 68);
      doc.text((record.tax_deduction + record.pf_deduction).toLocaleString('en-IN'), pageWidth - 60, yPos);
      doc.setTextColor(0, 0, 0);
      
      // Net Salary Section
      yPos += 25;
      doc.setFillColor(16, 185, 129);
      doc.rect(20, yPos - 5, pageWidth - 40, 20, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.text('NET SALARY', 25, yPos + 7);
      doc.setFontSize(16);
      doc.text(`₹ ${record.net_salary.toLocaleString('en-IN')}`, pageWidth - 60, yPos + 7);
      doc.setTextColor(0, 0, 0);
      
      // Footer
      yPos = doc.internal.pageSize.getHeight() - 30;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(128, 128, 128);
      doc.text('This is a computer-generated payslip and does not require a signature.', pageWidth / 2, yPos, { align: 'center' });
      doc.text(`Generated on ${format(new Date(), 'PPP')} via ${organizationName}`, pageWidth / 2, yPos + 8, { align: 'center' });
      
      // Save PDF
      const fileName = `Payslip_${record.employee.full_name.replace(/\s+/g, '_')}_${format(new Date(record.pay_period_end), 'MMM_yyyy')}.pdf`;
      doc.save(fileName);
      
      toast({
        title: 'Payslip Downloaded',
        description: `${fileName} has been downloaded successfully.`,
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate payslip PDF.',
        variant: 'destructive',
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <FileText className="h-4 w-4" />
          View Payslip
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Employee Payslip
          </DialogTitle>
          <DialogDescription>
            Pay Period: {format(new Date(record.pay_period_start), 'MMM dd')} - {format(new Date(record.pay_period_end), 'MMM dd, yyyy')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4" id="payslip-content">
          {/* Company Header */}
          <div className="text-center bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg p-4">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Building2 className="h-6 w-6" />
              <h2 className="text-xl font-bold">{organizationName}</h2>
            </div>
            <p className="text-sm opacity-90">PAYSLIP</p>
          </div>
          
          {/* Employee Details */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold">Employee Details</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Name:</span>
                  <p className="font-medium">{record.employee.full_name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Email:</span>
                  <p className="font-medium">{record.employee.email}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Pay Period:</span>
                  <p className="font-medium flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(record.pay_period_start), 'MMM dd')} - {format(new Date(record.pay_period_end), 'MMM dd, yyyy')}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <Badge 
                    variant={record.payment_status === 'paid' ? 'default' : 'secondary'}
                    className={record.payment_status === 'paid' ? 'bg-green-100 text-green-800' : ''}
                  >
                    {record.payment_status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Earnings & Deductions */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Earnings */}
            <Card className="border-green-200 dark:border-green-900">
              <CardContent className="pt-4">
                <h3 className="font-semibold text-green-700 dark:text-green-400 mb-3">Earnings</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Basic Salary</span>
                    <span className="font-medium">₹{record.basic_salary.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bonus</span>
                    <span className="font-medium text-green-600">+₹{record.bonus.toLocaleString('en-IN')}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>Total Earnings</span>
                    <span>₹{(record.basic_salary + record.bonus).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Deductions */}
            <Card className="border-red-200 dark:border-red-900">
              <CardContent className="pt-4">
                <h3 className="font-semibold text-red-700 dark:text-red-400 mb-3">Deductions</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Income Tax (TDS)</span>
                    <span className="font-medium text-red-600">-₹{record.tax_deduction.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Provident Fund (PF)</span>
                    <span className="font-medium text-red-600">-₹{record.pf_deduction.toLocaleString('en-IN')}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>Total Deductions</span>
                    <span className="text-red-600">₹{(record.tax_deduction + record.pf_deduction).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Net Salary */}
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <IndianRupee className="h-5 w-5 text-primary" />
                  <span className="text-lg font-semibold">Net Salary</span>
                </div>
                <span className="text-2xl font-bold text-primary">
                  ₹{record.net_salary.toLocaleString('en-IN')}
                </span>
              </div>
            </CardContent>
          </Card>
          
          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={handlePrint} className="gap-2">
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button onClick={generatePDF} className="gap-2">
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
          </div>
          
          {/* Footer */}
          <p className="text-xs text-center text-muted-foreground">
            This is a computer-generated payslip and does not require a signature.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
