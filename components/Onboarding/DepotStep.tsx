"use client";
import { useEffect, useRef } from "react";
import { Typography } from "antd";
import DepotForm from "@/app/depot/_components/DepotForm";
import { useDepotStore } from "@/store/depots.store";
import { DepotPayload } from "@/apis/depots.api";

const { Title, Text } = Typography;

interface DepotStepProps {
  onNext: () => void;
}

const DepotStep = ({ onNext }: DepotStepProps) => {
  const { createDepot, isSaving, depots } = useDepotStore();
  // Track if we've already skipped to prevent infinite calls
  const hasSkippedRef = useRef(false);

  // Skip if depot already exists (only once)
  useEffect(() => {
    if (depots.length > 0 && !hasSkippedRef.current) {
      hasSkippedRef.current = true;
      onNext();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depots]);

  const handleSubmit = async (values: DepotPayload): Promise<boolean> => {
    try {
      const success = await createDepot(values);
      if (success) {
        onNext();
      }
      return success;
    } catch (error) {
      return false;
    }
  };

  return (
    <div className="h-full p-3 flex flex-col">
      {/* Header */}
      <div className="mb-2">
        <Title level={4} className="!m-0 !mb-0.5">
          Set up your depot
        </Title>
        <Text className="text-gray-500 text-xs">
          This will be the default starting point for your routes.
        </Text>
      </div>

      {/* Depot Form */}
      <div className="flex-1 overflow-hidden">
        <DepotForm
          onSubmit={handleSubmit}
          isLoading={isSaving}
          onCancel={() => {}}
          submitLabel="Continue"
          isOnboarding={true}
        />
      </div>
    </div>
  );
};

export default DepotStep;
