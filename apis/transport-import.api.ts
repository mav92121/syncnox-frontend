import apiClient from "@/config/apiClient.config";

export interface TransportColumnField {
  identifier: string;
  description: string;
  is_required?: boolean;
  aliases?: string[];
  [key: string]: unknown;
}

export interface TransportMappedRow {
  row_index?: number;
  status: "valid" | "warned" | "skipped" | string;
  errors?: string[];
  warnings?: string[];
  values: Record<string, unknown>;
  [key: string]: unknown;
}

export interface TransportImportPreviewResponse {
  success: boolean;
  headers: string[];
  columns: TransportColumnField[];
  auto_map: Record<string, string>;
  sample_data: Record<string, unknown>[];
  total_rows: number;
  data?: TransportMappedRow[];
  errors_count?: number;
  warnings_count?: number;
  importable_rows?: number;
}

export interface TransportImportReportRow {
  row: number;
  status: string;
  transport_job_id?: number | null;
  errors?: string[];
  warnings?: string[];
}

export interface TransportImportResultResponse {
  status: string;
  imported: number;
  skipped: number;
  warned: number;
  total_rows: number;
  success_rate: number;
  unmapped_columns: string[];
  row_results: TransportImportReportRow[];
}

export const previewTransportImport = async (
  file: File,
  sheetName?: string
): Promise<TransportImportPreviewResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  if (sheetName) {
    formData.append("sheet_name", sheetName);
  }

  const response = await apiClient.post<TransportImportPreviewResponse>(
    "/transport/import/preview",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

export const mapTransportImportPreview = async (
  file: File,
  columnMapping: Record<string, string>,
  sheetName?: string
): Promise<TransportImportPreviewResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("column_mapping", JSON.stringify(columnMapping));
  if (sheetName) {
    formData.append("sheet_name", sheetName);
  }

  const response = await apiClient.post<TransportImportPreviewResponse>(
    "/transport/import/preview/map",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

export const importTransportExcel = async (
  file: File,
  columnMapping?: Record<string, string>,
  sheetName?: string
): Promise<TransportImportResultResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  if (columnMapping) {
    formData.append("column_mapping", JSON.stringify(columnMapping));
  }
  if (sheetName) {
    formData.append("sheet_name", sheetName);
  }

  const response = await apiClient.post<TransportImportResultResponse>(
    "/transport/import/excel",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};
