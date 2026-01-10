import { create } from "zustand";
import {
  getOnboardingStatus,
  saveBasicInfo,
  advanceOnboardingStep,
  completeOnboarding,
} from "@/apis/onboarding.api";
import { Onboarding, BasicInfoPayload } from "@/types/onboarding.type";

interface OnboardingStore {
  onboarding: Onboarding | null;
  isLoading: boolean;
  error: string | null;
  showCompletion: boolean;

  // Actions
  fetchOnboardingStatus: () => Promise<Onboarding>;
  saveBasicInfoAction: (payload: BasicInfoPayload) => Promise<void>;
  advanceStepAction: (step: number) => Promise<void>;
  completeOnboardingAction: () => Promise<void>;
  clearOnboarding: () => void;
  setShowCompletion: (show: boolean) => void;
}

export const useOnboardingStore = create<OnboardingStore>((set, get) => ({
  onboarding: null,
  isLoading: false,
  error: null,
  showCompletion: false,

  setShowCompletion: (show: boolean) => set({ showCompletion: show }),

  fetchOnboardingStatus: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await getOnboardingStatus();
      set({ onboarding: data, isLoading: false });
      return data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail ||
        error.message ||
        "Failed to fetch onboarding status";
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  saveBasicInfoAction: async (payload: BasicInfoPayload) => {
    set({ isLoading: true, error: null });
    try {
      const data = await saveBasicInfo(payload);
      set({ onboarding: data, isLoading: false });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail ||
        error.message ||
        "Failed to save basic info";
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  advanceStepAction: async (step: number) => {
    set({ isLoading: true, error: null });
    try {
      const data = await advanceOnboardingStep(step);
      set({ onboarding: data, isLoading: false });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail ||
        error.message ||
        "Failed to advance step";
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  completeOnboardingAction: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await completeOnboarding();
      set({ onboarding: data, isLoading: false });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail ||
        error.message ||
        "Failed to complete onboarding";
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  clearOnboarding: () => {
    set({ onboarding: null, error: null, isLoading: false });
  },
}));
