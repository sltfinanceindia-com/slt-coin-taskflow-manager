/**
 * Employee Payroll Tab
 * Salary structure, recent payslips, YTD earnings
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Download, FileText } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO } from 'date-fns';

interface EmployeePayrollTabProps {
  employeeId: string;
}

export function EmployeePayrollTab({ employeeId }: EmployeePayrollTabProps) {
  const { data: payrollRecords = [] } = useQuery({
    queryKey: ['employee-payroll', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payroll_records')
        .select('*')
        .eq('employee_id', employeeId)
        .order('pay_period_start', { ascending: false })
        .limit(6);
      if (error) throw error;
      return data || [];
    },
  });

  // Calculate YTD totals
  const ytdEarnings = payrollRecords.reduce((sum: number, record: any) => sum + (record.gross_pay || 0), 0);
  const ytdDeductions = payrollRecords.reduce((sum: number, record: any) => sum + (record.total_deductions || 0), 0);
  const ytdNet = payrollRecords.reduce((sum: number, record: any) => sum + (record.net_pay || 0), 0);

  return (
    <div className="space-y-6">
      {/* YTD Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">YTD Gross Earnings</p>
            <p className="text-2xl font-bold mt-1 text-green-600">
              ${ytdEarnings.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">YTD Deductions</p>
            <p className="text-2xl font-bold mt-1 text-red-600">
              ${ytdDeductions.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">YTD Net Pay</p>
            <p className="text-2xl font-bold mt-1">
              ${ytdNet.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Salary Structure */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Current Salary Structure</CardTitle>
          <CardDescription>Monthly breakdown of earnings and deductions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Salary structure not configured</p>
          </div>
        </CardContent>
      </Card>

      {/* Recent Payslips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Payslips</CardTitle>
          <CardDescription>Last 6 months of payroll</CardDescription>
        </CardHeader>
        <CardContent>
          {payrollRecords.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No payroll records found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {payrollRecords.map((record: any) => (
                <div key={record.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">
                      {format(parseISO(record.pay_period_start), 'MMMM yyyy')}
                    </p>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span>Gross: ${(record.gross_pay || 0).toLocaleString()}</span>
                      <span>Net: ${(record.net_pay || 0).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">{record.status}</Badge>
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
