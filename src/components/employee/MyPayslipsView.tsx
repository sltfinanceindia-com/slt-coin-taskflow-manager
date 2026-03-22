/**
 * My Payslips View
 * Employee self-service view for salary slips
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Download, FileText, TrendingUp, Wallet, Calendar, Eye, Construction, AlertCircle } from 'lucide-react';
import { PageHeader } from '@/components/layouts/PageHeader';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type PayrollRecord = Database['public']['Tables']['payroll_records']['Row'];

export function MyPayslipsView() {
  const { profile } = useAuth();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [viewingRecord, setViewingRecord] = useState<PayrollRecord | null>(null);

  // Fetch payroll records for the employee
  const { data: payrollRecords, isLoading, error: queryError } = useQuery({
    queryKey: ['my-payslips', profile?.id, selectedYear],
    queryFn: async () => {
      if (!profile?.id) return [];
      
      const startDate = `${selectedYear}-01-01`;
      const endDate = `${selectedYear}-12-31`;
      
      const { data, error } = await supabase
        .from('payroll_records')
        .select('*')
        .eq('employee_id', profile.id)
        .gte('pay_period_start', startDate)
        .lte('pay_period_end', endDate)
        .order('pay_period_start', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.id,
  });

  const calculateTotalDeductions = (record: PayrollRecord) => {
    let total = Number(record.pf_deduction || 0) + 
                Number(record.tax_deduction || 0) + 
                Number(record.other_deductions || 0);
    return total;
  };

  // Calculate YTD totals
  const ytdTotals = payrollRecords?.reduce((acc, record) => ({
    grossPay: acc.grossPay + Number(record.gross_salary || 0),
    netPay: acc.netPay + Number(record.net_salary || 0),
    deductions: acc.deductions + calculateTotalDeductions(record),
  }), { grossPay: 0, netPay: 0, deductions: 0 }) || { grossPay: 0, netPay: 0, deductions: 0 };

  const handleDownloadPayslip = async (recordId: string) => {
    toast.info('PDF download will be available in a future update', {
      description: 'You can view payslip details using the eye icon.',
      icon: <Construction className="h-4 w-4" />,
    });
  };

  const handleViewPayslip = (recordId: string) => {
    const record = payrollRecords?.find(r => r.id === recordId);
    if (record) setViewingRecord(record);
  };

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());

  const getStatusVariant = (status: string | null) => {
    if (status === 'paid') return 'default';
    if (status === 'pending') return 'secondary';
    return 'outline';
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Payslips"
        description="View and download your salary slips"
        actions={
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map(year => (
                <SelectItem key={year} value={year}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      {/* YTD Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              YTD Gross Pay
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">
              ₹{ytdTotals.grossPay.toLocaleString('en-IN')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              YTD Net Pay
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">
              ₹{ytdTotals.netPay.toLocaleString('en-IN')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              YTD Deductions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-muted-foreground">
              ₹{ytdTotals.deductions.toLocaleString('en-IN')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payslips Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Salary Slips - {selectedYear}
          </CardTitle>
          <CardDescription>
            {payrollRecords?.length || 0} payslips available
          </CardDescription>
        </CardHeader>
        <CardContent>
          {queryError ? (
            <div className="text-center py-12 text-muted-foreground" data-testid="error-payslips">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive opacity-70" />
              <p className="font-medium text-foreground">Failed to load payslips</p>
              <p className="text-sm mt-1">There was an error retrieving your salary data. Please try again later.</p>
            </div>
          ) : isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
              <p className="mt-4 text-muted-foreground">Loading payslips...</p>
            </div>
          ) : payrollRecords && payrollRecords.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead className="text-right">Gross Pay</TableHead>
                  <TableHead className="text-right">Deductions</TableHead>
                  <TableHead className="text-right">Net Pay</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payrollRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">
                      {format(new Date(record.pay_period_start), 'MMM d')} -{' '}
                      {format(new Date(record.pay_period_end), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      ₹{Number(record.gross_salary || 0).toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      ₹{calculateTotalDeductions(record).toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-primary">
                      ₹{Number(record.net_salary || 0).toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(record.payment_status)}>
                        {record.payment_status || 'pending'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleViewPayslip(record.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDownloadPayslip(record.id)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">No payslips available</p>
              <p className="text-sm mt-1">Salary slips will appear here after payroll is processed</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tax Information */}
      <Card>
        <CardHeader>
          <CardTitle>Tax Information</CardTitle>
          <CardDescription>View your tax deductions and Form 16</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="outline" className="flex-1" onClick={() => toast.info('Tax deductions view coming soon')}>
              <FileText className="h-4 w-4 mr-2" />
              View Tax Deductions
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => toast.info('Form 16 download coming soon')}>
              <Download className="h-4 w-4 mr-2" />
              Download Form 16
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payslip Detail Dialog */}
      <Dialog open={!!viewingRecord} onOpenChange={(open) => { if (!open) setViewingRecord(null); }}>
        <DialogContent className="max-w-lg" data-testid="dialog-payslip-detail">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Payslip Details
            </DialogTitle>
          </DialogHeader>
          {viewingRecord && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Pay Period</span>
                <span className="font-medium">
                  {format(new Date(viewingRecord.pay_period_start), 'MMM d')} - {format(new Date(viewingRecord.pay_period_end), 'MMM d, yyyy')}
                </span>
              </div>
              <Separator />
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Earnings</h4>
                <div className="flex justify-between text-sm">
                  <span>Gross Salary</span>
                  <span className="font-medium">₹{Number(viewingRecord.gross_salary || 0).toLocaleString('en-IN')}</span>
                </div>
                {viewingRecord.basic_salary && (
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Basic Salary</span>
                    <span>₹{Number(viewingRecord.basic_salary || 0).toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>
              <Separator />
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Deductions</h4>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>PF Deduction</span>
                  <span>₹{Number(viewingRecord.pf_deduction || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Tax Deduction</span>
                  <span>₹{Number(viewingRecord.tax_deduction || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Other Deductions</span>
                  <span>₹{Number(viewingRecord.other_deductions || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm font-medium">
                  <span>Total Deductions</span>
                  <span>₹{calculateTotalDeductions(viewingRecord).toLocaleString('en-IN')}</span>
                </div>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="font-semibold">Net Pay</span>
                <span className="text-lg font-bold text-primary">₹{Number(viewingRecord.net_salary || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={getStatusVariant(viewingRecord.payment_status)}>
                  {viewingRecord.payment_status || 'pending'}
                </Badge>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
