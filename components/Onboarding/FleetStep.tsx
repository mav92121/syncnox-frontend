"use client";
import { Truck } from "lucide-react";
import VehicleForm from "@/app/vehicle/_components/VehicleForm";
import { useVehicleStore } from "@/store/vehicle.store";
import OnboardingListStep from "./OnboardingListStep";

interface FleetStepProps {
  onNext: () => void;
  onBack: () => void;
}

const FleetStep = ({ onNext, onBack }: FleetStepProps) => {
  const { vehicles } = useVehicleStore();

  return (
    <OnboardingListStep
      stepNumber={3}
      totalSteps={4}
      progressPercent={75}
      kicker="Step 3 of 4 · Fleet"
      title="Add your vehicles"
      subtitle="Start simple — just add one or more vehicles. You can fine-tune capacity, load limits, and costs any time from Settings."
      items={vehicles}
      itemLabelSingular="vehicle"
      itemLabelPlural="Vehicles"
      entityType="vehicle"
      Icon={Truck}
      FormComponent={VehicleForm}
      getItemDisplay={(v) => ({ name: v.name, secondary: v.type ?? undefined })}
      onNext={onNext}
      onBack={onBack}
      successMessage="Vehicle added"
      emptyErrorMessage="Please add at least one vehicle"
    />
  );
};

export default FleetStep;
