import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCanExport } from '@/hooks/useDeviceDetection';
import { Download, FileSpreadsheet, FileText, FileDown } from 'lucide-react';
import { exportToCSV, exportToExcel, generatePDFReport, type ExportColumn } from '@/lib/export';
import { toast } from 'sonner';

interface ExportDropdownProps {
  data: Record<string, any>[];
  columns: ExportColumn[];
  filename: string;
  title: string;
  organizationName?: string;
  summary?: Record<string, string | number>;
  disabled?: boolean;
}

export function ExportDropdown({
  data,
  columns,
  filename,
  title,
  organizationName,
  summary,
  disabled,
}: ExportDropdownProps) {
  const canExport = useCanExport();
  const [isExporting, setIsExporting] = useState(false);

  if (!canExport) return null;

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    if (!data || data.length === 0) {
      toast.error('No data available to export');
      return;
    }

    setIsExporting(true);

    try {
      let result;
      const colsForCSV = columns.map(c => ({ key: c.key as string, label: c.label }));

      switch (format) {
        case 'csv':
          result = exportToCSV(data, filename, colsForCSV);
          break;
        case 'excel':
          result = exportToExcel(data, filename, {
            columns: colsForCSV,
            organizationName,
          });
          break;
        case 'pdf':
          result = generatePDFReport({
            title,
            organizationName,
            columns,
            data,
            summary,
          });
          break;
      }

      if (result?.success) {
        toast.success(result.message);
      } else {
        toast.error(result?.message || 'Export failed');
      }
    } catch {
      toast.error('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || isExporting || !data || data.length === 0}
          data-testid="button-export-dropdown"
        >
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? 'Exporting...' : 'Export'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport('csv')} data-testid="button-export-csv">
          <FileDown className="h-4 w-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('excel')} data-testid="button-export-excel">
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export as Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('pdf')} data-testid="button-export-pdf">
          <FileText className="h-4 w-4 mr-2" />
          Export as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
