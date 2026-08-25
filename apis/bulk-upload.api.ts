import apiClient from "@/config/apiClient.config";
import {
  BulkUploadResponse,
  BulkGeocodeRequest,
  BulkGeocodeResponse,
  BulkImportRequest,
  BulkImportResponse,
  BulkResolveRowResponse,
  UserMappingConfig,
} from "@/types/bulk-upload.type";

export const uploadBulkFile = async (
  file: File
): Promise<BulkUploadResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post<BulkUploadResponse>(
    "/jobs/bulk/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

export const geocodeBulkData = async (
  file: File,
  columnMapping: Record<string, string>,
  defaultScheduledDate: string | null = null
): Promise<BulkGeocodeResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("column_mapping", JSON.stringify(columnMapping));
  formData.append("data", JSON.stringify([])); // Empty, backend re-parses file

  if (defaultScheduledDate) {
    formData.append("default_scheduled_date", defaultScheduledDate);
  }

  const response = await apiClient.post<BulkGeocodeResponse>(
    "/jobs/bulk/geocode",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

export const importBulkJobs = async (
  request: BulkImportRequest
): Promise<BulkImportResponse> => {
  const response = await apiClient.post<BulkImportResponse>(
    "/jobs/bulk/import",
    request
  );
  return response.data;
};

/**
 * Re-resolve a single edited row's coordinates.
 *
 * Grid edits change address text only — the lat/lng resolved during step 2
 * still belong to the address that was there before. This returns freshly
 * resolved coordinates to overlay onto the row.
 *
 * `knownClientAddress` / `knownClientLocation` let a coordinate the row already
 * has (hand-typed into the Lat/Lng columns, or picked from autocomplete) survive
 * an edit to an unrelated column. The backend only reuses it if the address it
 * belongs to is still the row's address.
 */
export const resolveBulkRow = async (
  rowData: Record<string, any>,
  knownClientAddress?: string | null,
  knownClientLocation?: { lat: number; lng: number } | null
): Promise<BulkResolveRowResponse> => {
  const response = await apiClient.post<BulkResolveRowResponse>(
    "/jobs/bulk/resolve-row",
    {
      row_data: rowData,
      known_client_address: knownClientAddress ?? null,
      known_client_location: knownClientLocation ?? null,
    }
  );
  return response.data;
};

export const getUserMapping = async (
  entityType: string
): Promise<UserMappingConfig | null> => {
  try {
    const response = await apiClient.get<UserMappingConfig>(
      `/user-mappings/${entityType}`
    );
    return response.data;
  } catch (error: any) {
    // Return null if no mapping found (404)
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

export const saveUserMapping = async (
  entityType: string,
  mappingConfig: Record<string, string>
): Promise<UserMappingConfig> => {
  const response = await apiClient.post<UserMappingConfig>("/user-mappings", {
    entity_type: entityType,
    mapping_config: mappingConfig,
  });
  return response.data;
};
