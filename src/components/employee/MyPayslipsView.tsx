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
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Download, FileText, TrendingUp, Wallet, Calendar, Eye } from 'lucide-react';
import { PageHeader } from '@/components/layouts/PageHeader';

export function MyPayslipsView() {
  const { profile } = useAuth();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  // Fetch payroll records for the employee
  const { data: payrollRecords, isLoading } = useQuery({
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

  // Calculate total deductions from JSON
  const calculateTotalDeductions = (record: any) => {
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
    // TODO: Implement PDF generation/download
    console.log('Download payslip:', recordId);
  };

  const handleViewPayslip = (recordId: string) => {
    // TODO: Open payslip modal with full details
    console.log('View payslip:', recordId);
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
          {isLoading ? (
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
            <Button variant="outline" className="flex-1">
              <FileText className="h-4 w-4 mr-2" />
              View Tax Deductions
            </Button>
            <Button variant="outline" className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download Form 16
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
