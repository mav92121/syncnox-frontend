import apiClient from "@/config/apiClient.config";

export interface OptimizationRules {
  include_first_stop: boolean;
  include_last_stop: boolean;
  reach_before_mins: number;
  curbside_delivery: "any" | "left_only" | "right_only";
  avoid_tolls: boolean;
  avoid_highways: boolean;
}

export interface TenantOptimizationRulesResponse {
  tenant_id: number;
  rules: OptimizationRules;
}

export const getTenantOptimizationRules = async (): Promise<TenantOptimizationRulesResponse> => {
  const response = await apiClient.get<TenantOptimizationRulesResponse>("/tenant-rules/optimization-rules");
  return response.data;
};

export const updateTenantOptimizationRules = async (rules: OptimizationRules): Promise<TenantOptimizationRulesResponse> => {
  const response = await apiClient.put<TenantOptimizationRulesResponse>("/tenant-rules/optimization-rules", { rules });
  return response.data;
};
