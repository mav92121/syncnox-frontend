import apiClient from "@/config/apiClient.config";

export interface TransportRowResult {
  row: number;
  status: "imported" | "skipped" | "warned";
  transport_job_id?: number | null;
  errors?: string[];
  warnings?: string[];
}

export interface TransportImportResponse {
  status: string;
  imported: number;
  skipped: number;
  warned: number;
  total_rows: number;
  success_rate: number;
  unmapped_columns?: string[];
  row_results?: TransportRowResult[];
}

export interface TransportColumnField {
  identifier: string;
  description: string;
}

export interface TransportImportPreview {
  success: boolean;
  headers: string[];
  columns: TransportColumnField[];
  auto_map: Record<string, string>;
  sample_data: Record<string, unknown>[];
  total_rows: number;
}

export interface TransportMappedRow {
  row_index: number;
  values: Record<string, string>;
  status: "valid" | "warned" | "skipped";
  errors: string[];
  warnings: string[];
}

export interface TransportMapPreview extends TransportImportPreview {
  data: TransportMappedRow[];
  errors_count: number;
  warnings_count: number;
  importable_rows: number;
}

const buildFormData = (
  file: File,
  opts: { columnMapping?: Record<string, string>; sheetName?: string } = {}
): FormData => {
  const formData = new FormData();
  formData.append("file", file);
  if (opts.columnMapping) {
    formData.append("column_mapping", JSON.stringify(opts.columnMapping));
  }
  if (opts.sheetName) {
    formData.append("sheet_name", opts.sheetName);
  }
  return formData;
};

/** Step 1 — Upload + parse the file and auto-detect column fields. */
export const previewTransportImport = async (
  file: File,
  sheetName?: string
): Promise<TransportImportPreview> => {
  const response = await apiClient.post<TransportImportPreview>(
    "/transport/import/preview",
    buildFormData(file, { sheetName }),
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return response.data;
};

/** Step 2 — Apply a column mapping and validate rows WITHOUT importing. */
export const mapTransportImport = async (
  file: File,
  columnMapping: Record<string, string>,
  sheetName?: string
): Promise<TransportMapPreview> => {
  const response = await apiClient.post<TransportMapPreview>(
    "/transport/import/preview/map",
    buildFormData(file, { columnMapping, sheetName }),
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return response.data;
};

/** Step 3 — Import the transport jobs from the file. */
export const importTransportJobsExcel = async (
  file: File,
  columnMapping?: Record<string, string>,
  sheetName?: string
): Promise<TransportImportResponse> => {
  const response = await apiClient.post<TransportImportResponse>(
    "/transport/import/excel",
    buildFormData(file, { columnMapping, sheetName }),
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};
