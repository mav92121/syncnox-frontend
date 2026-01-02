"use client";
import { useState } from "react";
import { Button, Typography, message } from "antd";
import { ArrowRight, Plus, Trash2, Truck } from "lucide-react";
import VehicleForm from "@/app/vehicle/_components/VehicleForm";
import { useVehicleStore } from "@/zustand/vehicle.store";

const { Text } = Typography;

interface FleetStepProps {
  onNext: () => void;
}

const FleetStep = ({ onNext }: FleetStepProps) => {
  const { vehicles } = useVehicleStore();
  const [showForm, setShowForm] = useState(vehicles.length === 0);

  const handleVehicleAdded = () => {
    setShowForm(false);
    message.success("Vehicle added");
  };

  const handleContinue = () => {
    if (vehicles.length === 0) {
      message.error("Please add at least one vehicle");
      return;
    }
    onNext();
  };

  return (
    <div className="h-full p-3 flex flex-col">
      {/* Scrollable Content Area */}
      <div className="custom-scrollbar flex-1 overflow-auto pr-1">
        {/* Added Vehicles List */}
        {vehicles.length > 0 && (
          <div className="mb-3">
            <Text strong className="block mb-2 text-[13px]">
              Added Vehicles ({vehicles.length})
            </Text>
            {vehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className="py-2.5 px-3 bg-gray-50 mb-1.5 flex items-center gap-2"
              >
                <Truck size={14} />
                <span className="text-[13px]">{vehicle.name}</span>
                {vehicle.type && (
                  <Text type="secondary" className="text-xs">
                    ({vehicle.type})
                  </Text>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Vehicle Form or Add Button */}
        {showForm ? (
          <div className="border border-gray-200">
            {/* Card Header with Close Button */}
            {vehicles.length > 0 && (
              <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 bg-gray-50">
                <Text className="text-[13px] text-gray-600">New Vehicle</Text>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                  title="Cancel"
                >
                  <Trash2 size={14} className="text-red-500 cursor-pointer" />
                </button>
              </div>
            )}
            {/* Form Content */}
            <div className="p-3">
              <VehicleForm onSubmit={handleVehicleAdded} />
            </div>
          </div>
        ) : (
          <Button
            type="dashed"
            icon={<Plus size={14} />}
            onClick={() => setShowForm(true)}
            className="h-10 w-full"
          >
            Add {vehicles.length > 0 ? "another" : "a"} vehicle
          </Button>
        )}
      </div>

      {/* Footer */}
      <div className="pt-3 flex justify-end shrink-0">
        <Button
          type="primary"
          onClick={handleContinue}
          disabled={vehicles.length === 0}
          icon={<ArrowRight size={14} />}
          iconPosition="end"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default FleetStep;
