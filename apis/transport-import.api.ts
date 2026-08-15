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

export const importTransportJobsExcel = async (
  file: File,
  sheetName?: string
): Promise<TransportImportResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  if (sheetName) {
    formData.append("sheet_name", sheetName);
  }

  const response = await apiClient.post<TransportImportResponse>(
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
