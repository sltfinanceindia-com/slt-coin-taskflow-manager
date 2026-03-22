import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

export interface ExportResult {
  success: boolean;
  message: string;
  recordCount?: number;
}

export interface ExportColumn {
  key: string;
  label: string;
}

export interface PDFReportOptions {
  title: string;
  subtitle?: string;
  organizationName?: string;
  columns: ExportColumn[];
  data: Record<string, any>[];
  summary?: Record<string, string | number>;
  orientation?: 'portrait' | 'landscape';
}

export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  columns?: { key: keyof T; label: string }[]
): ExportResult {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return { success: false, message: 'No data available to export' };
  }

  try {
    const cols = columns || Object.keys(data[0]).map(key => ({ key: key as keyof T, label: key as string }));
    const header = cols.map(col => `"${col.label}"`).join(',');
    const rows = data.map(row => 
      cols.map(col => {
        const value = row[col.key];
        if (value === null || value === undefined) return '""';
        if (typeof value === 'object') return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`;
        return `"${value}"`;
      }).join(',')
    ).join('\n');
    
    const csv = `${header}\n${rows}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    triggerDownload(blob, `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    
    return { success: true, message: `Exported ${data.length} records`, recordCount: data.length };
  } catch (error) {
    console.error('Export failed:', error);
    return { success: false, message: 'Export failed. Please try again.' };
  }
}

export function exportToExcel<T extends Record<string, any>>(
  data: T[],
  filename: string,
  options?: {
    sheetName?: string;
    columns?: { key: keyof T; label: string }[];
    organizationName?: string;
  }
): ExportResult {
  if (!data || data.length === 0) {
    return { success: false, message: 'No data available to export' };
  }

  try {
    const cols = options?.columns || Object.keys(data[0]).map(key => ({ key: key as keyof T, label: key as string }));
    const headerRow = cols.map(col => col.label);
    const dataRows = data.map(row =>
      cols.map(col => {
        const value = row[col.key];
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') return JSON.stringify(value);
        return value;
      })
    );

    const wsData: any[][] = [];

    if (options?.organizationName) {
      wsData.push([options.organizationName]);
      wsData.push([`Generated: ${new Date().toLocaleDateString()}`]);
      wsData.push([]);
    }

    wsData.push(headerRow);
    wsData.push(...dataRows);

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    const colWidths = cols.map((col, i) => {
      const maxDataLen = Math.max(
        col.label.length,
        ...dataRows.map(row => String(row[i] ?? '').length)
      );
      return { wch: Math.min(Math.max(maxDataLen + 2, 10), 50) };
    });
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, options?.sheetName || 'Report');

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    triggerDownload(blob, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);

    return { success: true, message: `Exported ${data.length} records`, recordCount: data.length };
  } catch (error) {
    console.error('Excel export failed:', error);
    return { success: false, message: 'Excel export failed. Please try again.' };
  }
}

export function generatePDFReport(options: PDFReportOptions): ExportResult {
  const { title, subtitle, organizationName, columns, data, summary, orientation } = options;

  if (!data || data.length === 0) {
    return { success: false, message: 'No data available to export' };
  }

  try {
    const doc = new jsPDF({ orientation: orientation || 'landscape' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - margin * 2;
    let yPos = margin;

    const drawHeader = () => {
      doc.setFillColor(16, 185, 129);
      doc.rect(0, 0, pageWidth, 35, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(organizationName || 'Report', pageWidth / 2, 15, { align: 'center' });
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(title, pageWidth / 2, 23, { align: 'center' });
      if (subtitle) {
        doc.setFontSize(9);
        doc.text(subtitle, pageWidth / 2, 30, { align: 'center' });
      }
      doc.setTextColor(0, 0, 0);
      return 42;
    };

    const drawFooter = (pageNum: number, totalPages: number) => {
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Generated on ${new Date().toLocaleDateString()} | Page ${pageNum} of ${totalPages}`,
        pageWidth / 2,
        pageHeight - 8,
        { align: 'center' }
      );
      doc.setTextColor(0, 0, 0);
    };

    yPos = drawHeader();

    if (summary && Object.keys(summary).length > 0) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Summary', margin, yPos);
      yPos += 6;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      const summaryEntries = Object.entries(summary);
      const summaryColWidth = contentWidth / Math.min(summaryEntries.length, 4);
      summaryEntries.forEach(([key, value], i) => {
        const col = i % 4;
        const row = Math.floor(i / 4);
        const xPos = margin + col * summaryColWidth;
        doc.setFillColor(245, 245, 245);
        doc.rect(xPos, yPos + row * 14 - 3, summaryColWidth - 4, 12, 'F');
        doc.setFont('helvetica', 'normal');
        doc.text(key, xPos + 3, yPos + row * 14 + 2);
        doc.setFont('helvetica', 'bold');
        doc.text(String(value), xPos + 3, yPos + row * 14 + 8);
      });
      yPos += Math.ceil(summaryEntries.length / 4) * 14 + 6;
    }

    const colCount = columns.length;
    const colWidth = contentWidth / colCount;
    const rowHeight = 8;

    doc.setFillColor(16, 185, 129);
    doc.rect(margin, yPos - 2, contentWidth, rowHeight + 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    columns.forEach((col, i) => {
      const text = doc.splitTextToSize(col.label, colWidth - 4);
      doc.text(text[0], margin + i * colWidth + 2, yPos + 4);
    });
    doc.setTextColor(0, 0, 0);
    yPos += rowHeight + 2;

    let pageNum = 1;
    const pages: number[] = [1];

    data.forEach((row, rowIndex) => {
      if (yPos + rowHeight > pageHeight - 20) {
        doc.addPage();
        pageNum++;
        pages.push(pageNum);
        yPos = drawHeader();
        doc.setFillColor(16, 185, 129);
        doc.rect(margin, yPos - 2, contentWidth, rowHeight + 2, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        columns.forEach((col, i) => {
          const text = doc.splitTextToSize(col.label, colWidth - 4);
          doc.text(text[0], margin + i * colWidth + 2, yPos + 4);
        });
        doc.setTextColor(0, 0, 0);
        yPos += rowHeight + 2;
      }

      if (rowIndex % 2 === 0) {
        doc.setFillColor(249, 250, 251);
        doc.rect(margin, yPos - 2, contentWidth, rowHeight, 'F');
      }

      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      columns.forEach((col, i) => {
        const cellValue = String(row[col.key] ?? '');
        const truncated = cellValue.length > 30 ? cellValue.substring(0, 27) + '...' : cellValue;
        doc.text(truncated, margin + i * colWidth + 2, yPos + 4);
      });
      yPos += rowHeight;
    });

    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      drawFooter(i, totalPages);
    }

    const safeTitle = title.replace(/[^a-zA-Z0-9]/g, '_');
    doc.save(`${safeTitle}_${new Date().toISOString().split('T')[0]}.pdf`);

    return { success: true, message: `Exported ${data.length} records as PDF`, recordCount: data.length };
  } catch (error) {
    console.error('PDF export failed:', error);
    return { success: false, message: 'PDF export failed. Please try again.' };
  }
}

export function generatePayslipPDF(record: {
  id: string;
  employee: { full_name: string; email: string };
  pay_period_start: string;
  pay_period_end: string;
  basic_salary: number;
  bonus: number;
  tax_deduction: number;
  pf_deduction: number;
  net_salary: number;
  payment_status: string;
}, organizationName: string = 'Work HuB'): Uint8Array {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });

  doc.setFillColor(16, 185, 129);
  doc.rect(0, 0, pageWidth, 45, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(organizationName, pageWidth / 2, 20, { align: 'center' });
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('PAYSLIP', pageWidth / 2, 32, { align: 'center' });
  doc.setFontSize(10);
  doc.text(`Pay Period: ${formatDate(record.pay_period_start)} - ${formatDate(record.pay_period_end)}`, pageWidth / 2, 40, { align: 'center' });
  doc.setTextColor(0, 0, 0);

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

  yPos += 25;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Earnings', 20, yPos);
  doc.line(20, yPos + 2, pageWidth - 20, yPos + 2);
  yPos += 15;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
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

  yPos += 25;
  doc.setFillColor(16, 185, 129);
  doc.rect(20, yPos - 5, pageWidth - 40, 20, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.text('NET SALARY', 25, yPos + 7);
  doc.setFontSize(16);
  doc.text(`₹ ${record.net_salary.toLocaleString('en-IN')}`, pageWidth - 60, yPos + 7);
  doc.setTextColor(0, 0, 0);

  yPos = doc.internal.pageSize.getHeight() - 30;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(128, 128, 128);
  doc.text('This is a computer-generated payslip and does not require a signature.', pageWidth / 2, yPos, { align: 'center' });
  doc.text(`Generated on ${new Date().toLocaleDateString()} via ${organizationName}`, pageWidth / 2, yPos + 8, { align: 'center' });

  return doc.output('arraybuffer') as unknown as Uint8Array;
}

export function formatDateForExport(date: string | Date | null | undefined): string {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}

export function flattenForExport<T extends Record<string, any>>(
  data: T[],
  nestedKeys: { sourceKey: keyof T; targetKey: string; accessor: (obj: any) => any }[]
): Record<string, any>[] {
  return data.map(item => {
    const flattened: Record<string, any> = { ...item };
    nestedKeys.forEach(({ sourceKey, targetKey, accessor }) => {
      flattened[targetKey] = accessor(item[sourceKey]);
      delete flattened[sourceKey as string];
    });
    return flattened;
  });
}

function triggerDownload(blob: Blob, filename: string) {
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
