import apiClient from "@/config/apiClient.config";
import { Onboarding, BasicInfoPayload } from "@/types/onboarding.type";

const url = "/onboarding";

export const getOnboardingStatus = async (): Promise<Onboarding> => {
  const response = await apiClient.get<Onboarding>(url);
  return response.data;
};

export const saveBasicInfo = async (
  payload: BasicInfoPayload
): Promise<Onboarding> => {
  const response = await apiClient.post<Onboarding>(
    `${url}/basic-info`,
    payload
  );
  return response.data;
};

export const advanceOnboardingStep = async (
  step: number
): Promise<Onboarding> => {
  const response = await apiClient.post<Onboarding>(`${url}/advance-step`, {
    step,
  });
  return response.data;
};

export const completeOnboarding = async (): Promise<Onboarding> => {
  const response = await apiClient.post<Onboarding>(`${url}/complete`);
  return response.data;
};
