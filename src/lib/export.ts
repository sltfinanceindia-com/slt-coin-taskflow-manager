// CSV Export Utility

export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  columns?: { key: keyof T; label: string }[]
) {
  if (data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Determine columns from data if not provided
  const cols = columns || Object.keys(data[0]).map(key => ({ key: key as keyof T, label: key as string }));
  
  // Create CSV header
  const header = cols.map(col => `"${col.label}"`).join(',');
  
  // Create CSV rows
  const rows = data.map(row => 
    cols.map(col => {
      const value = row[col.key];
      // Handle different value types
      if (value === null || value === undefined) return '""';
      if (typeof value === 'object') return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
      if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`;
      return `"${value}"`;
    }).join(',')
  ).join('\n');
  
  // Combine header and rows
  const csv = `${header}\n${rows}`;
  
  // Create and trigger download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

// Helper to format dates for export
export function formatDateForExport(date: string | Date | null | undefined): string {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}

// Helper to flatten nested objects for export
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
