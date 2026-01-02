"use client";
import { useState } from "react";
import { Button, Typography, Input, message } from "antd";
import { ArrowRight } from "lucide-react";
import { Industry, INDUSTRY_OPTIONS } from "@/types/onboarding.type";
import { useOnboardingStore } from "@/zustand/onboarding.store";

const { Title, Text } = Typography;

interface BasicInfoStepProps {
  onNext: () => void;
}

const BasicInfoStep = ({ onNext }: BasicInfoStepProps) => {
  const { saveBasicInfoAction, isLoading } = useOnboardingStore();
  const [companyName, setCompanyName] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState<Industry | null>(
    null
  );

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
    } catch (error) {
      // Error is handled in the store
    }
  };

  return (
    <div className="h-full p-6 flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <Title level={4} className="m-0! mb-1!">
          Tell us about your business
        </Title>
        <Text className="text-gray-500 text-[13px]">
          This helps us configure the best settings for your operations.
        </Text>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-4">
        {/* Company Name */}
        <div>
          <Text strong className="block mb-1.5 text-[13px]">
            🏢 Company name
          </Text>
          <Input
            placeholder="Acme Logistics Inc."
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
        </div>

        {/* Industry Selection */}
        <div>
          <Text strong className="block mb-2 text-[13px]">
            🏭 Industry
          </Text>
          <div className="grid grid-cols-2 gap-2">
            {INDUSTRY_OPTIONS.map((option) => (
              <div
                key={option.value}
                onClick={() => setSelectedIndustry(option.value)}
                className={`p-3 border border-gray-300 cursor-pointer transition-all duration-200 ${
                  selectedIndustry === option.value
                    ? "bg-[#003220]"
                    : "bg-white hover:bg-gray-50"
                }`}
              >
                <Text
                  style={{
                    fontSize: "13px",
                    color: selectedIndustry === option.value ? "white" : "gray",
                  }}
                >
                  {option.label}
                </Text>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-4 flex justify-end">
        <Button
          type="primary"
          onClick={handleContinue}
          loading={isLoading}
          disabled={!companyName.trim() || !selectedIndustry}
          icon={<ArrowRight size={14} />}
          iconPosition="end"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default BasicInfoStep;
