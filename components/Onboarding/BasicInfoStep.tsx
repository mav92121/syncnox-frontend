"use client";
import { useState } from "react";
import { message, Tooltip } from "antd";
import {
  ShoppingCart,
  Truck,
  Wrench,
  UtensilsCrossed,
  Package,
  Pill,
  Building2,
  Sparkles,
  LucideIcon,
  ArrowRight,
  ArrowLeft,
  Info,
} from "lucide-react";

import { Industry, INDUSTRY_OPTIONS } from "@/types/onboarding.type";
import { useOnboardingStore } from "@/store/onboarding.store";

// Professional Lucide icons for industry chips
const INDUSTRY_ICONS: Record<Industry, LucideIcon> = {
  e_commerce: ShoppingCart,
  logistics_freight: Truck,
  field_service: Wrench,
  food_grocery: UtensilsCrossed,
  courier_express: Package,
  medical_pharmacy: Pill,
  construction: Building2,
  other: Sparkles,
};

interface BasicInfoStepProps {
  onNext: () => void;
  onBack: () => void;
}

const BasicInfoStep = ({ onNext, onBack }: BasicInfoStepProps) => {
  const { saveBasicInfoAction, isLoading, onboarding } = useOnboardingStore();
  const [companyName, setCompanyName] = useState(onboarding?.company_name || "");
  const [selectedIndustry, setSelectedIndustry] = useState<Industry | null>(
    (onboarding?.industry as Industry) || null
  );

  const canContinue = companyName.trim().length > 0 && selectedIndustry !== null;

  const handleContinue = async () => {
    if (!companyName.trim()) {
      message.error("Please enter your company name");
      return;
    }
    if (!selectedIndustry) {
      message.error("Please select your industry");
      return;
    }

    try {
      await saveBasicInfoAction({
        company_name: companyName.trim(),
        industry: selectedIndustry,
      });
      onNext();
    } catch {
      // Error handled in store
    }
  };

  return (
    <div className="flex flex-col h-screen p-6 md:p-10 w-full mx-auto overflow-hidden bg-white justify-between">
      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto pr-1">
        {/* Progress */}
        <div className="h-1.5 bg-gray-200 w-full mb-5 rounded-none overflow-hidden">
          <div className="h-full bg-[#003220] transition-all duration-400 w-1/4 rounded-none" />
        </div>

        <div className="text-[11px] font-bold tracking-widest uppercase text-[#003220] mb-1.5">
          Step 1 of 4 · About you
        </div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight leading-snug mb-5 flex items-center gap-2">
          <span>Tell us about your business.</span>
          <Tooltip title="We use this to preconfigure the right defaults for your operations." placement="right" getPopupContainer={() => document.body}>
            <Info size={16} className="text-gray-400 hover:text-[#003220] cursor-pointer shrink-0 transition-colors" />
          </Tooltip>
        </h1>


        {/* Company name */}
        <div className="mb-6 max-w-[540px]">
          <label htmlFor="ob-company" className="block text-xs font-semibold text-gray-900 mb-1.5">
            Company name <span className="text-red-600">*</span>
          </label>
          <input
            id="ob-company"
            className="w-full px-3.5 py-2 border border-gray-300 rounded-none text-xs text-gray-900 bg-white focus:outline-none focus:border-[#003220] focus:ring-2 focus:ring-[#ecfdf5] transition-all"
            placeholder="Acme Logistics Inc."
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            autoFocus
          />
        </div>

        {/* Industry */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-gray-900 mb-1.5">
            Industry <span className="text-red-600">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
            {INDUSTRY_OPTIONS.map((opt) => {
              const IconComp = INDUSTRY_ICONS[opt.value];
              const isSelected = selectedIndustry === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  className={`p-3 text-xs font-medium rounded-none border transition-all flex items-center gap-2.5 cursor-pointer text-left ${
                    isSelected
                      ? "bg-[#003220] text-white border-[#003220] shadow-2xs"
                      : "bg-white text-gray-800 border-gray-200 hover:border-[#003220] hover:bg-[#ecfdf5] hover:text-[#003220]"
                  }`}
                  onClick={() => setSelectedIndustry(opt.value)}
                >
                  <IconComp size={16} className={isSelected ? "text-white" : "text-[#003220]"} />
                  <span className="font-medium text-xs truncate">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Action bar */}
      <div className="flex items-center gap-3 py-3 border-t border-gray-200 mt-3 bg-white shrink-0 rounded-none">
        <button
          className="px-4 py-2 text-xs font-medium text-gray-600 hover:text-gray-900 bg-transparent border-none cursor-pointer rounded-none flex items-center gap-1.5"
          onClick={onBack}
        >
          <ArrowLeft size={14} /> Back
        </button>
        <button
          className="px-5 py-2.5 bg-[#003220] text-white border border-[#003220] rounded-none font-semibold text-xs hover:bg-[#002a00] transition-colors cursor-pointer flex items-center gap-2 disabled:bg-gray-400 disabled:border-gray-400 disabled:cursor-not-allowed"
          onClick={handleContinue}
          disabled={!canContinue || isLoading}
          id="ob-basics-continue"
        >
          {isLoading ? "Saving…" : "Continue"} <ArrowRight size={14} />
        </button>
        <button
          className="ml-auto text-xs font-semibold text-gray-500 hover:text-gray-900 bg-transparent border-none cursor-pointer underline rounded-none"
          onClick={onNext}
        >
          Skip for now
        </button>
      </div>
    </div>

  );
};

export default BasicInfoStep;
