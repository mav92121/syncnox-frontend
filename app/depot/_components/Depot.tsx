"use client";
import { useState, useEffect, useMemo } from "react";
import GoogleMaps from "@/components/GoogleMaps";
import { Flex, Typography, Button, message, Spin, Input } from "antd";
import { useDepotStore } from "@/zustand/depots.store";
import AddressAutocomplete, {
  AddressData,
} from "@/components/AddressAutocomplete";

const { Title } = Typography;

const Depot = () => {
  const { depots, isSaving, isLoading, updateDepot } = useDepotStore();
  const depot = depots[0];

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );

  useEffect(() => {
    if (depot) {
      setName(depot.name || "");
      setAddress(depot.address?.formatted_address || "");
      if (depot.location) {
        setLocation({ lat: depot.location.lat, lng: depot.location.lng });
      }
    }
  }, [depot]);

  const hasChanges = useMemo(() => {
    if (!depot) return false;
    const originalName = depot.name || "";
    const originalAddress = depot.address?.formatted_address || "";
    const originalLat = depot.location?.lat;
    const originalLng = depot.location?.lng;

    return (
      name !== originalName ||
      address !== originalAddress ||
      location?.lat !== originalLat ||
      location?.lng !== originalLng
    );
  }, [depot, name, address, location]);

  const handleSave = async () => {
    if (!name.trim()) {
      message.error("Please enter a depot name");
      return;
    }
    if (!location) {
      message.error("Please select a location");
      return;
    }

    const success = await updateDepot(depot.id, {
      name: name,
      address: {
        formatted_address: address,
      },
      location: location,
    });

    if (success) {
      message.success("Depot updated successfully");
    } else {
      message.error("Failed to update depot");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spin size="large" />
      </div>
    );
  }

  // Prepare marker for the map
  const depotMarker =
    location || depot?.location
      ? [
          {
            id: "depot",
            position: location || depot?.location,
            title: name || depot?.name || "Depot",
            isDepot: true,
          },
        ]
      : [];

  return (
    <div className="flex flex-col h-full gap-3">
      <Flex justify="space-between" align="center">
        <Title className="m-0" level={5}>
          Depot
        </Title>
        <Button
          type="primary"
          size="small"
          onClick={handleSave}
          loading={isSaving}
          disabled={!hasChanges}
        >
          Save Depot
        </Button>
      </Flex>

      <div className="flex gap-2 w-full">
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

      <div className="flex-1 w-full overflow-hidden border">
        <GoogleMaps
          showMapTypeControl={true}
          showZoomControl={true}
          zoom={8}
          center={
            location ||
            depot?.location || {
              lat: 37.7749,
              lng: -122.4194,
            }
          }
          markers={depotMarker}
        />
      </div>
    </div>
  );
};

export default Depot;
