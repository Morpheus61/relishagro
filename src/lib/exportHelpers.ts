/**
 * CSV/Excel Export Helper Functions
 * Generates downloadable CSV files from data arrays
 */

export function downloadCSV(data: any[], filename: string): void {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  // Convert data to CSV format
  const csv = convertToCSV(data);
  
  // Create blob and download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function convertToCSV(data: any[]): string {
  if (data.length === 0) return '';

  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Create CSV header row
  const headerRow = headers.map(escapeCSVValue).join(',');
  
  // Create CSV data rows
  const dataRows = data.map(row => {
    return headers.map(header => {
      const value = row[header];
      return escapeCSVValue(value);
    }).join(',');
  });
  
  // Combine header and data rows
  return [headerRow, ...dataRows].join('\n');
}

function escapeCSVValue(value: any): string {
  if (value === null || value === undefined) return '';
  
  const stringValue = String(value);
  
  // Escape quotes and wrap in quotes if contains comma, quote, or newline
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  
  return stringValue;
}

// Export attendance records
export function exportAttendanceCSV(records: any[]): void {
  const formattedData = records.map(record => ({
    'Date': new Date(record.check_in).toLocaleDateString(),
    'Time In': new Date(record.check_in).toLocaleTimeString(),
    'Time Out': record.check_out ? new Date(record.check_out).toLocaleTimeString() : 'N/A',
    'Worker ID': record.worker_id,
    'Worker Name': record.worker_name,
    'Method': record.method,
    'Override': record.override_reason || 'N/A',
    'Location': record.location ? `${record.location.latitude}, ${record.location.longitude}` : 'N/A'
  }));
  
  downloadCSV(formattedData, 'attendance_records');
}

// Export wage records
export function exportWagesCSV(records: any[]): void {
  const formattedData = records.map(record => ({
    'Date': new Date(record.date).toLocaleDateString(),
    'Worker ID': record.worker_id,
    'Worker Name': record.worker_name,
    'Hours Worked': record.hours_worked,
    'Hourly Rate': record.hourly_rate,
    'Total Amount': record.total_amount,
    'Status': record.status,
    'Payment Date': record.payment_date ? new Date(record.payment_date).toLocaleDateString() : 'Pending'
  }));
  
  downloadCSV(formattedData, 'wage_records');
}

// Export vendor records
export function exportVendorCSV(records: any[]): void {
  const formattedData = records.map(record => ({
    'Vendor ID': record.vendor_id,
    'Vendor Name': record.vendor_name,
    'Contact': record.contact_number,
    'Item': record.item_name,
    'Quantity': record.quantity,
    'Unit Price': record.unit_price,
    'Total Amount': record.total_amount,
    'Date': new Date(record.date).toLocaleDateString(),
    'Payment Status': record.payment_status
  }));
  
  downloadCSV(formattedData, 'vendor_records');
}

// Export lot yield data
export function exportYieldCSV(records: any[]): void {
  const formattedData = records.map(record => ({
    'Lot ID': record.lot_id,
    'Date': new Date(record.date_harvested).toLocaleDateString(),
    'Crop': record.crop,
    'Raw Weight (kg)': record.raw_weight,
    'Threshed Weight (kg)': record.threshed_weight,
    'HF Yield (%)': record.estate_yield_pct,
    'Final Product (kg)': record.final_weight || 'N/A',
    'FC Yield F→R (%)': record.fc_yield_raw || 'N/A',
    'FC Yield F→T (%)': record.fc_yield_threshed || 'N/A'
  }));
  
  downloadCSV(formattedData, 'yield_records');
}