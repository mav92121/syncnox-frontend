"use client";
import { useEffect, useRef } from "react";
import { Form, Input, Select, message, Typography, Flex } from "antd";
import type { FormInstance } from "antd";
import {
  LocationMapping,
  LOCATION_TYPE_OPTIONS,
  LocationTypeEnum,
} from "@/apis/location-mapping.api";
import { useLocationMappingStore } from "@/store/location-mapping.store";

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
}

const LocationMappingForm = ({
  initialData = null,
  form: externalForm,
}: LocationMappingFormProps) => {
  const [internalForm] = Form.useForm();
  const form = externalForm || internalForm;
  const { updateLocationMapping } = useLocationMappingStore();

  // Auto-save refs (mirrors VehicleForm behaviour)
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

  // Cleanup auto-save timer on unmount or initialData change
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [initialData?.id]);

  // Pre-fill the form whenever a different mapping is selected
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

  return (
    <Flex vertical gap={4}>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        className="space-y-1"
      >
        <Form.Item
          label="Station / Location Name"
          name="name"
          rules={[{ required: true, message: "Please enter station/location name" }]}
        >
          <Input
            placeholder="e.g. Montmorency Metro"
            className="rounded-none text-xs"
            onChange={() => triggerAutoSave()}
          />
        </Form.Item>

        <Form.Item label="Location Type" name="type">
          <Select
            placeholder="Select location type (optional)"
            allowClear
            options={LOCATION_TYPE_OPTIONS}
            className="rounded-none text-xs"
            onChange={() => triggerAutoSave()}
          />
        </Form.Item>

        <Form.Item label="Street Address / Location" name="address">
          <Input
            placeholder="e.g. 5300 Henri-Bourassa Blvd W, Montreal"
            className="rounded-none text-xs"
            onChange={() => triggerAutoSave()}
          />
        </Form.Item>

        <Form.Item label="City" name="city">
          <Input
            placeholder="e.g. Laval, QC"
            className="rounded-none text-xs"
            onChange={() => triggerAutoSave()}
          />
        </Form.Item>

        <Form.Item label="Country" name="country">
          <Input
            placeholder="e.g. Canada"
            className="rounded-none text-xs"
            onChange={() => triggerAutoSave()}
          />
        </Form.Item>

        <Form.Item label="Aliases / Station Codes (comma separated)" name="aliases">
          <Input
            placeholder="e.g. MTR-01, Montmorency"
            className="rounded-none text-xs font-mono"
            onChange={() => triggerAutoSave()}
          />
        </Form.Item>
      </Form>
    </Flex>
  );
};

export default LocationMappingForm;
