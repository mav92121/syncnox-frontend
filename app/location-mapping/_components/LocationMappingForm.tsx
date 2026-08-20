"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Form, Input, Select, message, Typography, Flex } from "antd";
import type { FormInstance } from "antd";
import {
  LocationMapping,
  LOCATION_TYPE_OPTIONS,
  LocationTypeEnum,
} from "@/apis/location-mapping.api";
import { useLocationMappingStore } from "@/store/location-mapping.store";
import GoogleMaps from "@/components/GoogleMaps";
import AddressAutocomplete, { AddressData } from "@/components/AddressAutocomplete";

const { Text } = Typography;

interface LocationMappingFormValues {
  name: string;
  type?: LocationTypeEnum;
  address?: string;
  city?: string;
  country?: string;
  aliases?: string;
}

interface LocationMappingFormProps {
  initialData?: LocationMapping | null;
  isInline?: boolean;
  form?: FormInstance;
  existingLocations?: LocationMapping[];
}

const LocationMappingForm = ({
  initialData = null,
  form: externalForm,
  existingLocations = [],
}: LocationMappingFormProps) => {
  const [internalForm] = Form.useForm();
  const form = externalForm || internalForm;
  const { updateLocationMapping } = useLocationMappingStore();

  const [mapLocation, setMapLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Auto-save refs
  const isPrefillingRef = useRef<boolean>(true);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerAutoSave = () => {
    if (!initialData?.id || isPrefillingRef.current) return;
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    autoSaveTimerRef.current = setTimeout(() => {
      form
        .validateFields()
        .then(() => {
          form.submit();
        })
        .catch(() => {});
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [initialData?.id]);

  useEffect(() => {
    if (initialData) {
      isPrefillingRef.current = true;
      const initialType =
        (initialData.type as LocationTypeEnum) ||
        (initialData.location_type as LocationTypeEnum) ||
        undefined;

      form.setFieldsValue({
        name: initialData.name,
        type: initialType,
        address: initialData.address || undefined,
        city: initialData.city || undefined,
        country: initialData.country || undefined,
        aliases: initialData.aliases?.join(", ") || undefined,
      });

      if (initialData.latitude && initialData.longitude) {
        setMapLocation({ lat: initialData.latitude, lng: initialData.longitude });
      } else {
        setMapLocation(null);
      }

      setTimeout(() => {
        isPrefillingRef.current = false;
      }, 200);
    }
  }, [initialData, form]);

  const onFinish = async (values: LocationMappingFormValues) => {
    if (!initialData?.id) return;
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    const payload = {
      name: values.name.trim(),
      type: values.type,
      location_type: values.type,
      address: values.address?.trim() || undefined,
      city: values.city?.trim() || undefined,
      country: values.country?.trim() || undefined,
      latitude: mapLocation?.lat,
      longitude: mapLocation?.lng,
      aliases: values.aliases
        ? values.aliases
            .split(",")
            .map((a: string) => a.trim())
            .filter(Boolean)
        : undefined,
    };
    const success = await updateLocationMapping(initialData.id, payload);
    if (success) {
      message.success("Location mapping updated");
    } else {
      message.error("Failed to update location mapping");
    }
    return success;
  };

  const existingMarkers = useMemo(() => {
    return existingLocations
      .filter((m) => m.latitude && m.longitude && m.id !== initialData?.id)
      .map((m) => ({
        id: m.id,
        position: { lat: m.latitude!, lng: m.longitude! },
        title: m.name,
        description: m.address || m.name,
        isDepot: false,
        draggable: false,
      }));
  }, [existingLocations, initialData?.id]);

  const currentMarker = mapLocation
    ? [
        {
          id: initialData?.id || "location-current",
          position: mapLocation,
          title: initialData?.name || "Location",
          description: initialData?.address || initialData?.name || "Location",
          draggable: true,
        },
      ]
    : [];

  const allMarkers = [...existingMarkers, ...currentMarker];

  const defaultCenter = { lat: 45.5017, lng: -73.5673 };
  const mapCenter = mapLocation || (existingMarkers.length > 0 ? existingMarkers[0].position : defaultCenter);

  return (
    <Flex vertical gap={4} className="font-sans h-full">
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        className="flex flex-col h-full"
      >
        <div className="grid grid-cols-2 gap-3 mb-2 shrink-0">
          <Form.Item
            label="Station / Location Name"
            name="name"
            className="mb-0"
            rules={[{ required: true, message: "Please enter station/location name" }]}
          >
            <Input
              placeholder="e.g. Montmorency Metro"
              className="rounded-none text-xs"
              onChange={() => triggerAutoSave()}
            />
          </Form.Item>

          <Form.Item label="Street Address / Location" name="address" className="mb-0">
            <AddressAutocomplete
              value={form.getFieldValue("address")}
              placeholder="e.g. 5300 Henri-Bourassa Blvd W, Montreal"
              onChange={(val) => {
                form.setFieldsValue({ address: val });
                triggerAutoSave();
              }}
              onSelect={(addressData: AddressData) => {
                form.setFieldsValue({
                  address: addressData.address_formatted,
                  city: addressData.city || form.getFieldValue("city"),
                  country: addressData.country || form.getFieldValue("country"),
                });
                if (addressData.location) {
                  setMapLocation(addressData.location);
                }
                triggerAutoSave();
              }}
            />
          </Form.Item>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-2 shrink-0">
          <Form.Item label="Location Type" name="type" className="mb-0">
            <Select
              placeholder="Select location type (optional)"
              allowClear
              options={LOCATION_TYPE_OPTIONS}
              className="rounded-none text-xs"
              onChange={() => triggerAutoSave()}
            />
          </Form.Item>

          <Form.Item label="City" name="city" className="mb-0">
            <Input
              placeholder="e.g. Laval, QC"
              className="rounded-none text-xs"
              onChange={() => triggerAutoSave()}
            />
          </Form.Item>

          <Form.Item label="Aliases / Station Codes" name="aliases" className="mb-0">
            <Input
              placeholder="e.g. MTR-01, Montmorency"
              className="rounded-none text-xs font-mono"
              onChange={() => triggerAutoSave()}
            />
          </Form.Item>
        </div>

        {/* Embedded Interactive Map identical to Depots view */}
        <div className="flex-1 min-h-[260px] border border-gray-200 overflow-hidden relative rounded-none my-2">
          <GoogleMaps
            markers={allMarkers}
            center={mapCenter}
            zoom={mapLocation ? 15 : 11}
            onMarkerDragEnd={(_markerId, newPosition) => {
              if (newPosition) {
                setMapLocation(newPosition);
                triggerAutoSave();
              }
            }}
          />
        </div>
      </Form>
    </Flex>
  );
};

export default LocationMappingForm;
