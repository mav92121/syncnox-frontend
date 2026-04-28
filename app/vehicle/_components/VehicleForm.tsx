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
  Typography,
  Divider,
} from "antd";
import {
  PlusCircleOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Vehicle, VehicleType, ConstraintType, LoadConstraint } from "@/types/vehicle.type";
import { useVehicleStore } from "@/store/vehicle.store";

const { Text } = Typography;

interface VehicleFormProps {
  initialData?: Vehicle | null;
  onSubmit?: () => void;
}

const VEHICLE_TYPES: { value: VehicleType; label: string }[] = [
  { value: "car", label: "Car" },
  { value: "van", label: "Van" },
  { value: "bus", label: "Bus" },
  { value: "small_truck", label: "Small Truck" },
  { value: "truck", label: "Truck" },
  { value: "scooter", label: "Scooter" },
  { value: "foot", label: "Foot" },
  { value: "bike", label: "Bike" },
  { value: "mountain_bike", label: "Mountain Bike" },
];

// Maps each constraint type to its available units
const CONSTRAINT_UNITS: Record<ConstraintType, { value: string; label: string }[]> = {
  weight: [
    { value: "kg", label: "kg" },
    { value: "lb", label: "lb" },
    { value: "t", label: "t (tonne)" },
  ],
  volume: [
    { value: "m3", label: "m³" },
    { value: "L", label: "L" },
    { value: "ft3", label: "ft³" },
  ],
  item_count: [
    { value: "items", label: "items" },
    { value: "units", label: "units" },
    { value: "boxes", label: "boxes" },
  ],
  pallets: [
    { value: "pallets", label: "pallets" },
  ],
  distance: [
    { value: "km", label: "km" },
    { value: "mi", label: "mi" },
  ],
  duration: [
    { value: "min", label: "min" },
    { value: "hr", label: "hr" },
  ],
  custom: [
    { value: "units", label: "units" },
  ],
};

const CONSTRAINT_TYPES: { value: ConstraintType; label: string }[] = [
  { value: "weight", label: "Weight" },
  { value: "volume", label: "Volume" },
  { value: "item_count", label: "Item count" },
  { value: "pallets", label: "Pallets" },
  { value: "distance", label: "Distance" },
  { value: "duration", label: "Duration" },
  { value: "custom", label: "Custom" },
];

// Get default unit for a given constraint type
function getDefaultUnit(type: ConstraintType): string {
  const units = CONSTRAINT_UNITS[type];
  return units?.[0]?.value ?? "units";
}

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
    load_constraints: [],
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
        load_constraints: initialData.load_constraints ?? [],
      });
    } else {
      form.resetFields();
    }
  }, [initialData, form]);

  const onFinish = async (values: any) => {
    try {
      const payload = {
        ...values,
        load_constraints: (values.load_constraints ?? []).map(
          (c: LoadConstraint) => ({
            constraint_type: c.constraint_type,
            max_value: c.max_value,
            unit: c.unit,
            label: c.label ?? null,
          })
        ),
      };

      if (initialData?.id) {
        await updateVehicleAction({
          ...initialData,
          ...payload,
        });
        messageApi.success("Vehicle updated successfully");
      } else {
        await createVehicleAction(payload);
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

          <Divider style={{ marginTop: 4, marginBottom: 16 }} />

          {/* Dynamic Load Constraints */}
          <Text
            strong
            style={{
              display: "block",
              letterSpacing: "0.08em",
              fontSize: 11,
              color: "#8c8c8c",
              marginBottom: 4,
            }}
          >
            LOAD CONSTRAINTS
          </Text>
          <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 12 }}>
            Add one or more constraints. Orders exceeding any constraint will not be assigned to this vehicle.
          </Text>

          <Form.List name="load_constraints">
            {(fields, { add, remove }) => (
              <>
                {/* Table header */}
                {fields.length > 0 && (
                  <Row gutter={8} style={{ marginBottom: 4 }}>
                    <Col flex="160px">
                      <Text type="secondary" style={{ fontSize: 12 }}>Constraint type</Text>
                    </Col>
                    <Col flex="1">
                      <Text type="secondary" style={{ fontSize: 12 }}>Max value</Text>
                    </Col>
                    <Col flex="100px">
                      <Text type="secondary" style={{ fontSize: 12 }}>Unit</Text>
                    </Col>
                    <Col flex="32px" />
                  </Row>
                )}

                {fields.map(({ key, name, ...restField }) => (
                  <Row key={key} gutter={8} align="middle" style={{ marginBottom: 8 }}>
                    {/* Constraint type */}
                    <Col flex="160px">
                      <Form.Item
                        {...restField}
                        name={[name, "constraint_type"]}
                        style={{ margin: 0 }}
                        rules={[{ required: true, message: "Required" }]}
                      >
                        <Select
                          options={CONSTRAINT_TYPES}
                          placeholder="Type"
                          onChange={(val: ConstraintType) => {
                            // Reset unit to the first option for the new type
                            const constraints = form.getFieldValue("load_constraints");
                            constraints[name].unit = getDefaultUnit(val);
                            form.setFieldsValue({ load_constraints: constraints });
                          }}
                        />
                      </Form.Item>
                    </Col>

                    {/* Max value */}
                    <Col flex="1">
                      <Form.Item
                        {...restField}
                        name={[name, "max_value"]}
                        style={{ margin: 0 }}
                        rules={[{ required: true, message: "Required" }]}
                      >
                        <InputNumber
                          placeholder="0"
                          min={0}
                          style={{ width: "100%" }}
                        />
                      </Form.Item>
                    </Col>

                    {/* Unit */}
                    <Col flex="100px">
                      <Form.Item
                        noStyle
                        shouldUpdate={(prev, cur) =>
                          prev.load_constraints?.[name]?.constraint_type !==
                          cur.load_constraints?.[name]?.constraint_type
                        }
                      >
                        {() => {
                          const constraintType: ConstraintType =
                            form.getFieldValue(["load_constraints", name, "constraint_type"]);
                          const unitOptions = constraintType
                            ? CONSTRAINT_UNITS[constraintType]
                            : [{ value: "units", label: "units" }];

                          return (
                            <Form.Item
                              {...restField}
                              name={[name, "unit"]}
                              style={{ margin: 0 }}
                              rules={[{ required: true, message: "Required" }]}
                            >
                              <Select options={unitOptions} placeholder="Unit" />
                            </Form.Item>
                          );
                        }}
                      </Form.Item>
                    </Col>

                    {/* Delete button */}
                    <Col flex="32px">
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => remove(name)}
                        style={{ padding: 0, width: 32 }}
                      />
                    </Col>
                  </Row>
                ))}

                {/* Add constraint row */}
                <Button
                  type="dashed"
                  onClick={() =>
                    add({ constraint_type: "weight", max_value: 0, unit: "kg" })
                  }
                  icon={<PlusOutlined />}
                  block
                  style={{ marginTop: 4 }}
                >
                  Add constraint
                </Button>
              </>
            )}
          </Form.List>

          <Text
            type="secondary"
            style={{ fontSize: 11, display: "block", marginTop: 8 }}
          >
            Leave a field empty to skip that constraint.
          </Text>
        </Form>
      </Flex>

      {/* Fixed Button at Bottom */}
      <Flex style={{ paddingTop: 16 }}>
        <Button
          loading={isLoading}
          type="primary"
          htmlType="submit"
          block
          icon={<PlusCircleOutlined />}
          onClick={() => form.submit()}
        >
          {initialData ? "Update vehicle" : "Add Vehicle"}
        </Button>
      </Flex>
    </Flex>
  );
};

export default VehicleForm;
