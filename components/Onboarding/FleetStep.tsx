"use client";
import { Truck } from "lucide-react";
import VehicleForm from "@/app/vehicle/_components/VehicleForm";
import { useVehicleStore } from "@/store/vehicle.store";
import OnboardingListStep from "./OnboardingListStep";

interface FleetStepProps {
  onNext: () => void;
}

const FleetStep = ({ onNext }: FleetStepProps) => {
  const { vehicles } = useVehicleStore();

  return (
    <OnboardingListStep
      items={vehicles}
      itemLabelSingular="vehicle"
      itemLabelPlural="Vehicles"
      Icon={Truck}
      FormComponent={VehicleForm}
      getItemDisplay={(v) => ({ name: v.name, secondary: v.type ?? undefined })}
      onNext={onNext}
      successMessage="Vehicle added"
      emptyErrorMessage="Please add at least one vehicle"
    />
  );
};

export default FleetStep;
