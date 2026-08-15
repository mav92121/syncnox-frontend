"use client";
import { MapPin } from "lucide-react";
import OnboardingListStep from "@/components/Onboarding/OnboardingListStep";
import DepotForm from "@/app/depot/_components/DepotForm";
import { useDepotStore } from "@/store/depots.store";
import { DepotPayload } from "@/apis/depots.api";

interface DepotStepProps {
  onNext: () => void;
  onBack: () => void;
}

const DepotOnboardingForm = ({ onSubmit }: { onSubmit: () => void; isInline?: boolean }) => {
  const { createDepot, isSaving, depots } = useDepotStore();

  const handleSubmit = async (values: DepotPayload): Promise<boolean> => {
    const success = await createDepot(values);
    if (success) {
      onSubmit();
    }
    return success;
  };

  return (
    <DepotForm
      onSubmit={handleSubmit}
      isLoading={isSaving}
      onCancel={() => {}}
      submitLabel="Add Depot"
      isOnboarding={true}
      existingDepots={depots}
    />
  );
};

const DepotStep = ({ onNext, onBack }: DepotStepProps) => {
  const { depots } = useDepotStore();

  return (
    <OnboardingListStep
      stepNumber={2}
      totalSteps={4}
      progressPercent={50}
      kicker="Step 2 of 4 · Depot"
      title="Where do your routes start?"
      subtitle="Add your main depot or warehouse — the default starting point for all your routes. You can add more from Settings later."
      items={depots}
      itemLabelSingular="depot"
      itemLabelPlural="Depots"
      Icon={MapPin}
      FormComponent={DepotOnboardingForm}
      getItemDisplay={(d) => ({
        name: d.name,
        secondary: d.address?.formatted_address,
      })}
      onNext={onNext}
      onBack={onBack}
      successMessage="Depot added"
      emptyErrorMessage="Please add at least one depot"
    />
  );
};

export default DepotStep;

