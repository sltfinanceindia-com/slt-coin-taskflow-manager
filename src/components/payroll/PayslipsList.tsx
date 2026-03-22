import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { FileText, CheckCircle, Clock, AlertCircle, Download, Loader2 } from 'lucide-react';
import { PayslipGenerator } from './PayslipGenerator';
import { ExportDropdown } from '@/components/ExportDropdown';
import { generatePayslipPDF } from '@/lib/export';
import { useCanExport } from '@/hooks/useDeviceDetection';
import { toast } from 'sonner';
import JSZip from 'jszip';

export function PayslipsList() {
  const { profile } = useAuth();
  const canExport = useCanExport();
  const [isBatchExporting, setIsBatchExporting] = useState(false);

  const { data: payrollRecords, isLoading } = useQuery({
    queryKey: ['payroll-records-for-payslips', profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payroll_records')
        .select(`
          *,
          employee:profiles!payroll_records_employee_id_fkey(id, full_name, email)
        `)
        .eq('organization_id', profile?.organization_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30"><CheckCircle className="h-3 w-3 mr-1" />Paid</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30"><Clock className="h-3 w-3 mr-1" />Processing</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30"><AlertCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  const handleBatchExport = async () => {
    if (!payrollRecords || payrollRecords.length === 0) return;

    setIsBatchExporting(true);
    try {
      const zip = new JSZip();

      payrollRecords.forEach((record) => {
        const payslipData = {
          id: record.id,
          employee: {
            full_name: (record.employee as any)?.full_name || 'Unknown',
            email: (record.employee as any)?.email || '',
          },
          pay_period_start: record.pay_period_start,
          pay_period_end: record.pay_period_end,
          basic_salary: Number(record.basic_salary),
          bonus: Number(record.bonus),
          tax_deduction: Number(record.tax_deduction),
          pf_deduction: Number(record.pf_deduction),
          net_salary: Number(record.net_salary),
          payment_status: record.payment_status,
        };

        const pdfBytes = generatePayslipPDF(payslipData);
        const fileName = `Payslip_${payslipData.employee.full_name.replace(/\s+/g, '_')}_${format(new Date(record.pay_period_end), 'MMM_yyyy')}.pdf`;
        zip.file(fileName, pdfBytes);
      });

      const blob = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.download = `Payslips_Batch_${format(new Date(), 'yyyy-MM-dd')}.zip`;
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Downloaded ${payrollRecords.length} payslips as ZIP`);
    } catch (error) {
      console.error('Batch export failed:', error);
      toast.error('Failed to generate batch payslips. Please try again.');
    } finally {
      setIsBatchExporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Payslips
            </CardTitle>
            <CardDescription>View and download employee payslips</CardDescription>
          </div>
          {canExport && payrollRecords && payrollRecords.length > 0 && (
            <div className="flex gap-2">
              <ExportDropdown
                data={(payrollRecords || []).map(r => ({
                  Employee: (r.employee as any)?.full_name || 'Unknown',
                  Email: (r.employee as any)?.email || '',
                  Period: `${format(new Date(r.pay_period_start), 'MMM dd')} - ${format(new Date(r.pay_period_end), 'MMM dd, yyyy')}`,
                  'Basic Salary': Number(r.basic_salary),
                  Bonus: Number(r.bonus),
                  'Tax Deduction': Number(r.tax_deduction),
                  'PF Deduction': Number(r.pf_deduction),
                  'Net Salary': Number(r.net_salary),
                  Status: r.payment_status,
                }))}
                columns={[
                  { key: 'Employee', label: 'Employee' },
                  { key: 'Email', label: 'Email' },
                  { key: 'Period', label: 'Pay Period' },
                  { key: 'Basic Salary', label: 'Basic Salary (₹)' },
                  { key: 'Bonus', label: 'Bonus (₹)' },
                  { key: 'Tax Deduction', label: 'Tax (₹)' },
                  { key: 'PF Deduction', label: 'PF (₹)' },
                  { key: 'Net Salary', label: 'Net Salary (₹)' },
                  { key: 'Status', label: 'Status' },
                ]}
                filename="payroll_summary"
                title="Payroll Summary"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleBatchExport}
                disabled={isBatchExporting}
                data-testid="button-batch-export-payslips"
              >
                {isBatchExporting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                {isBatchExporting ? 'Generating...' : 'Download All Payslips'}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : payrollRecords && payrollRecords.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead className="text-right">Net Salary</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payrollRecords.map((record) => {
                  const payslipData = {
                    id: record.id,
                    employee: {
                      full_name: (record.employee as any)?.full_name || 'Unknown',
                      email: (record.employee as any)?.email || '',
                    },
                    pay_period_start: record.pay_period_start,
                    pay_period_end: record.pay_period_end,
                    basic_salary: Number(record.basic_salary),
                    bonus: Number(record.bonus),
                    tax_deduction: Number(record.tax_deduction),
                    pf_deduction: Number(record.pf_deduction),
                    net_salary: Number(record.net_salary),
                    payment_status: record.payment_status,
                    payment_date: record.payment_date,
                  };

                  return (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        {(record.employee as any)?.full_name || 'Unknown'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(record.pay_period_start), 'MMM dd')} - {format(new Date(record.pay_period_end), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        ₹{Number(record.net_salary).toLocaleString()}
                      </TableCell>
                      <TableCell>{getStatusBadge(record.payment_status)}</TableCell>
                      <TableCell>
                        <PayslipGenerator record={payslipData} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No payroll records found</p>
            <p className="text-sm">Payslips will appear here once payroll records are created</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
