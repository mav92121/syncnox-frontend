import apiClient from "@/config/apiClient.config";

export interface LocationMapping {
  id: number;
  tenant_id: number;
  name: string;
  aliases?: string[] | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  is_active: boolean;
}

export interface LocationMappingCreate {
  name: string;
  aliases?: string[];
  address?: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  is_active?: boolean;
}


export const fetchLocationMappings = async (): Promise<LocationMapping[]> => {
  try {
    const response = await apiClient.get("/transport/metro-stations");
    return response.data.items || response.data || [];
  } catch (err) {
    console.error("Error fetching location mappings:", err);
    return [];
  }
};

export const createLocationMapping = async (payload: LocationMappingCreate): Promise<LocationMapping> => {
  const response = await apiClient.post("/transport/metro-stations", payload);
  return response.data;
};

export const batchCreateLocationMappings = async (stations: LocationMappingCreate[]): Promise<number> => {
  const response = await apiClient.post("/transport/metro-stations/batch", { stations });
  if (typeof response.data?.upserted === "number") {
    return response.data.upserted;
  }
  if (Array.isArray(response.data?.items)) {
    return response.data.items.length;
  }
  if (Array.isArray(response.data)) {
    return response.data.length;
  }
  return 0;
};


export const deleteLocationMapping = async (id: number): Promise<void> => {
  await apiClient.delete(`/transport/metro-stations/${id}`);
};
