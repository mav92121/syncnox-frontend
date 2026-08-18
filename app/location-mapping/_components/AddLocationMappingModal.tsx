"use client";
import { Modal, Form, Input, Select, Button, message } from "antd";
import { useLocationMappingStore } from "@/store/location-mapping.store";
import {
  LOCATION_TYPE_OPTIONS,
  LocationTypeEnum,
} from "@/apis/location-mapping.api";

interface AddLocationMappingModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

interface AddLocationMappingFormValues {
  name: string;
  type?: LocationTypeEnum;
  address?: string;
  aliases?: string;
}

export default function AddLocationMappingModal({
  open,
  setOpen,
}: AddLocationMappingModalProps) {
  const [form] = Form.useForm();
  const { createLocationMapping, isSaving } = useLocationMappingStore();

  const handleFinish = async (values: AddLocationMappingFormValues) => {
    const success = await createLocationMapping({
      name: values.name.trim(),
      type: values.type,
      location_type: values.type,
      address: values.address?.trim() || values.name.trim(),
      aliases: values.aliases ? values.aliases.split(",").map((a: string) => a.trim()).filter(Boolean) : undefined,
      is_active: true,
    });

    if (success) {
      message.success("Location reference mapping created!");
      form.resetFields();
      setOpen(false);
    } else {
      message.error("Failed to create location mapping");
    }
  };

  return (
    <Modal
      title="Add Location Reference Mapping"
      open={open}
      onCancel={() => setOpen(false)}
      footer={null}
      centered
      className="rounded-none"
      maskClosable={false}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        className="mt-4 space-y-3"
      >
        <Form.Item
          label="Station / Location Name"
          name="name"
          rules={[{ required: true, message: "Please enter station/location name" }]}
        >
          <Input placeholder="e.g. Montmorency Metro" className="rounded-none text-xs" />
        </Form.Item>

        <Form.Item label="Location Type" name="type">
          <Select
            placeholder="Select location type (optional)"
            allowClear
            options={LOCATION_TYPE_OPTIONS}
            className="rounded-none text-xs"
          />
        </Form.Item>

        <Form.Item
          label="Street Address / Location"
          name="address"
        >
          <Input placeholder="e.g. 5300 Henri-Bourassa Blvd W, Montreal" className="rounded-none text-xs" />
        </Form.Item>

        <Form.Item
          label="Aliases / Station Codes (comma separated)"
          name="aliases"
        >
          <Input placeholder="e.g. MTR-01, Montmorency" className="rounded-none text-xs font-mono" />
        </Form.Item>

        <div className="flex justify-end gap-2 pt-3 border-t">
          <Button onClick={() => setOpen(false)} className="rounded-none">
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={isSaving}
            className="rounded-none bg-[#003220] hover:bg-[#003220]/90"
          >
            Save Location Mapping
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
