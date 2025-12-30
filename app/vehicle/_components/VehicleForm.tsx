"use client";
import { useEffect } from "react";
import {
  Form,
  Input,
  Select,
  InputNumber,
  Button,
  Row,
  Col,
  message,
  Flex,
} from "antd";
import { PlusCircleOutlined } from "@ant-design/icons";
import { Vehicle, VehicleType } from "@/types/vehicle.type";
import { useVehicleStore } from "@/zustand/vehicle.store";

interface VehicleFormProps {
  initialData?: Vehicle | null;
  onSubmit?: () => void;
}

const VEHICLE_TYPES: { value: VehicleType; label: string }[] = [
  { value: "car", label: "Car" },
  { value: "small_truck", label: "Small Truck" },
  { value: "truck", label: "Truck" },
  { value: "scooter", label: "Scooter" },
  { value: "foot", label: "Foot" },
  { value: "bike", label: "Bike" },
  { value: "mountain_bike", label: "Mountain Bike" },
];

const VehicleForm = ({ initialData = null, onSubmit }: VehicleFormProps) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const { createVehicleAction, updateVehicleAction, isLoading, vehicles } =
    useVehicleStore();

  const defaultValues = {
    name: `Vehicle ${
      vehicles.length > 0 ? Math.max(...vehicles.map((v) => v.id)) + 1 : 1
    }`,
    type: "car" as VehicleType,
  };

  // prefill form
  useEffect(() => {
    if (initialData) {
      form.setFieldsValue({
        name: initialData.name,
        license_plate: initialData.license_plate,
        make: initialData.make,
        model: initialData.model,
        type: initialData.type,
        capacity_weight: initialData.capacity_weight,
        capacity_volume: initialData.capacity_volume,
      });
    } else {
      form.resetFields();
    }
  }, [initialData, form]);

  const onFinish = async (values: any) => {
    try {
      if (initialData?.id) {
        await updateVehicleAction({
          ...initialData,
          ...values,
        });
        messageApi.success("Vehicle updated successfully");
      } else {
        await createVehicleAction(values);
        messageApi.success("Vehicle created successfully");
      }
      form.resetFields();
      onSubmit?.();
    } catch (e: any) {
      console.error(e?.detail);
      messageApi.error(e?.detail ?? "Something went wrong");
    }
  };

  return (
    <Flex vertical style={{ height: "100%" }}>
      {contextHolder}

      {/* Scrollable Form Area */}
      <Flex
        vertical
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          paddingRight: "8px",
        }}
        className="custom-scrollbar"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          requiredMark={false}
          initialValues={initialData ? undefined : defaultValues}
        >
          {/* Row 1: Name, License Plate */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Name"
                name="name"
                rules={[
                  { required: true, message: "Please enter vehicle name" },
                ]}
              >
                <Input placeholder="Enter vehicle name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="License Plate" name="license_plate">
                <Input placeholder="Enter license plate" />
              </Form.Item>
            </Col>
          </Row>

          {/* Row 2: Make, Model */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Make" name="make">
                <Input placeholder="Enter vehicle make" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Model" name="model">
                <Input placeholder="Enter vehicle model" />
              </Form.Item>
            </Col>
          </Row>

          {/* Row 3: Type */}
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item label="Type" name="type">
                <Select
                  placeholder="Select vehicle type"
                  options={VEHICLE_TYPES}
                  allowClear
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Row 4: Weight Capacity, Volume Capacity */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Weight Capacity (kg)" name="capacity_weight">
                <InputNumber
                  placeholder="Enter weight capacity"
                  style={{ width: "100%" }}
                  min={0}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Volume Capacity (m³)" name="capacity_volume">
                <InputNumber
                  placeholder="Enter volume capacity"
                  style={{ width: "100%" }}
                  min={0}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Flex>

      {/* Fixed Button at Bottom */}
      <Flex>
        <Button
          loading={isLoading}
          type="primary"
          htmlType="submit"
          block
          icon={<PlusCircleOutlined />}
          onClick={() => form.submit()}
        >
          {initialData ? "Update Vehicle" : "Add Vehicle"}
        </Button>
      </Flex>
    </Flex>
  );
};

export default VehicleForm;
