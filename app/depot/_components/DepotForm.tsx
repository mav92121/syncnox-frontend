"use client";
import { useState, useEffect, useMemo } from "react";
import { ArrowRight } from "lucide-react";
import GoogleMaps from "@/components/GoogleMaps";
import { Button, message, Input } from "antd";
import AddressAutocomplete, {
  AddressData,
} from "@/components/AddressAutocomplete";
import { DepotPayload } from "@/apis/depots.api";
import { Depot } from "@/types/depots.type";

interface DepotFormProps {
  initialValues?: Depot;
  onSubmit: (values: DepotPayload) => Promise<boolean>;
  isLoading: boolean;
  onCancel: () => void;
  submitLabel?: string;
  isOnboarding?: boolean;
}

const DepotForm = ({
  initialValues,
  onSubmit,
  isLoading,
  onCancel,
  submitLabel,
  isOnboarding = false,
}: DepotFormProps) => {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );

  useEffect(() => {
    if (initialValues) {
      setName(initialValues.name || "");
      setAddress(initialValues.address?.formatted_address || "");
      if (initialValues.location) {
        setLocation({
          lat: initialValues.location.lat,
          lng: initialValues.location.lng,
        });
      }
    } else {
      // Reset form
      setName("");
      setAddress("");
      setLocation(null);
    }
  }, [initialValues]);

  const hasChanges = useMemo(() => {
    if (!initialValues) return !!name && !!location; // Enable if all fields filled for new

    const originalName = initialValues.name || "";
    const originalAddress = initialValues.address?.formatted_address || "";
    const originalLat = initialValues.location?.lat;
    const originalLng = initialValues.location?.lng;

    return (
      name !== originalName ||
      address !== originalAddress ||
      location?.lat !== originalLat ||
      location?.lng !== originalLng
    );
  }, [initialValues, name, address, location]);

  const handleSave = async () => {
    if (!name.trim()) {
      message.error("Please enter a depot name");
      return;
    }
    if (!location) {
      message.error("Please select a location");
      return;
    }

    const success = await onSubmit({
      name: name,
      address: {
        formatted_address: address,
      },
      location: location,
    });

    if (success) {
      message.success(
        initialValues
          ? "Depot updated successfully"
          : "Depot created successfully"
      );
      onCancel(); // Close form on success
    } else {
      message.error("Failed to save depot");
    }
  };

  // Prepare marker for the map
  const depotMarker =
    location || initialValues?.location
      ? [
          {
            id: "depot",
            position: location || initialValues?.location || { lat: 0, lng: 0 },
            title: name || initialValues?.name || "Depot",
            isDepot: true,
            description:
              address || initialValues?.address?.formatted_address || "Depot",
            draggable: true,
          },
        ]
      : [];

  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-2 w-full mb-2">
        <div className="w-1/3">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter depot name"
          />
        </div>
        <div className="w-2/3">
          <AddressAutocomplete
            value={address}
            placeholder="Search depot address..."
            onChange={() => {
              setLocation(null);
            }}
            onSelect={(addressData: AddressData) => {
              setAddress(addressData.address_formatted);
              setLocation(addressData.location);
            }}
          />
        </div>
      </div>

      <div className="flex-1 w-full overflow-hidden bg-gray-50">
        <GoogleMaps
          showMapTypeControl={true}
          showZoomControl={true}
          zoom={10}
          center={
            location ||
            initialValues?.location || {
              lat: 37.7749,
              lng: -122.4194,
            }
          }
          markers={depotMarker}
          onMarkerDragEnd={(_, newPosition) => {
            setLocation(newPosition);
          }}
        />
      </div>

      <div className={isOnboarding ? "pt-4 flex justify-end" : "pt-2"}>
        <Button
          type="primary"
          onClick={handleSave}
          loading={isLoading}
          disabled={!hasChanges}
          block={!isOnboarding}
          icon={isOnboarding ? <ArrowRight size={14} /> : undefined}
          iconPosition="end"
        >
          {submitLabel || (initialValues ? "Update" : "Create")}
        </Button>
      </div>
    </div>
  );
};

export default DepotForm;
