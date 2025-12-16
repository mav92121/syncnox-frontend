import * as XLSX from "xlsx";

interface ExportOptions {
  fileName: string;
  sheetName?: string;
  metadata?: Record<string, string | number>;
  columnWidths?: number[];
}

/**
 * Generic function to export data to Excel with optional metadata headers
 * @param data Array of objects containing the row data
 * @param options Export configuration options
 */
export const exportToExcel = (data: any[], options: ExportOptions) => {
  const {
    fileName,
    sheetName = "Sheet1",
    metadata = {},
    columnWidths = [],
  } = options;

  // Create a new workbook
  const wb = XLSX.utils.book_new();

  // Create array of arrays for the sheet content
  const sheetData: any[][] = [];

  // Add metadata rows if present
  if (Object.keys(metadata).length > 0) {
    Object.entries(metadata).forEach(([key, value]) => {
      // Format keys to be more readable (e.g., "route_name" -> "Route Name")
      const formattedKey = key
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      sheetData.push([formattedKey, value]);
    });
    // Add an empty row after metadata
    sheetData.push([]);
  }

  // Convert the data array to sheet rows (headers + values)
  if (data.length > 0) {
    // Get headers from first object
    const headers = Object.keys(data[0]);
    sheetData.push(headers);

    // Add data rows
    data.forEach((row) => {
      sheetData.push(Object.values(row));
    });
  }

  // Create sheet from AoA (Array of Arrays)
  const ws = XLSX.utils.aoa_to_sheet(sheetData);

  // Set column widths if provided
  if (columnWidths.length > 0) {
    ws["!cols"] = columnWidths.map((w) => ({ wch: w }));
  } else {
    // Auto-calculate widths based on headers (basic estimation)
    const headerRow = sheetData.find(
      (row, i) =>
        i ===
        (Object.keys(metadata).length > 0
          ? Object.keys(metadata).length + 1
          : 0)
    );
    if (headerRow) {
      ws["!cols"] = headerRow.map((header: string) => ({
        wch: Math.max(header.toString().length + 5, 15),
      }));
    }
  }

  // Add sheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // Generate Excel file
  XLSX.writeFile(wb, `${fileName}.xlsx`);
};
