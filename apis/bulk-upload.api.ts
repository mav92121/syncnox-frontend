import apiClient from "@/config/apiClient.config";
import {
  BulkUploadResponse,
  BulkGeocodeRequest,
  BulkGeocodeResponse,
  BulkImportRequest,
  BulkImportResponse,
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
  columnMapping: Record<string, string>
): Promise<BulkGeocodeResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("column_mapping", JSON.stringify(columnMapping));
  formData.append("data", JSON.stringify([])); // Empty, backend re-parses file

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
