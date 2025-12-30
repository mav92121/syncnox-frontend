import apiClient from "@/config/apiClient.config";
import { Vehicle } from "@/types/vehicle.type";

const url = "/vehicles";

export const fetchVehicles = async (): Promise<Vehicle[]> => {
  const response = await apiClient.get<Vehicle[]>(url);
  return response.data;
};

export const createVehicle = async (
  vehicle: Partial<Vehicle>
): Promise<Vehicle> => {
  const response = await apiClient.post<Vehicle>(url, vehicle);
  return response.data;
};

export const updateVehicle = async (vehicle: Vehicle): Promise<Vehicle> => {
  const response = await apiClient.put<Vehicle>(
    `${url}/${vehicle.id}`,
    vehicle
  );
  return response.data;
};

export const deleteVehicle = async (vehicleId: number): Promise<void> => {
  await apiClient.delete(`${url}/${vehicleId}`);
};
