"use client";

import { useEffect, useState } from "react";
import {
  Drawer,
  Form,
  Input,
  Select,
  DatePicker,
  TimePicker,
  Button,
  Row,
  Col,
  message,
  Divider,
  Flex,
} from "antd";
import { PlusCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import AddressAutocomplete, { AddressData } from "@/components/AddressAutocomplete";
import { TransportJob, PickupType } from "@/types/transportJob.type";
import { useTransportJobsStore } from "@/store/transportJobs.store";

interface TransportJobFormModalProps {
  open: boolean;
  onClose: () => void;
  initialValues?: TransportJob | null;
}

export default function TransportJobFormModal({
  open,
  onClose,
  initialValues,
}: TransportJobFormModalProps) {
  const [form] = Form.useForm();
  const { createTransportJobAction, updateTransportJobAction, selectedDate } =
    useTransportJobsStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pickupType, setPickupType] = useState<PickupType>("round_trip");

  useEffect(() => {
    if (open) {
      if (initialValues) {
        setPickupType(initialValues.pickup_type || "round_trip");
        const startTime = initialValues.start_hour
          ? dayjs(initialValues.start_hour, ["HH:mm:ss", "HH:mm"])
          : dayjs("08:00", "HH:mm");
        const endTime = initialValues.end_hour
          ? dayjs(initialValues.end_hour, ["HH:mm:ss", "HH:mm"])
          : dayjs("17:00", "HH:mm");

        form.setFieldsValue({
          candidate_name: initialValues.candidate_name,
          candidate_phone: initialValues.candidate_phone,
          candidate_id: initialValues.candidate_id,
          candidate_address: initialValues.candidate_address,
          client_name: initialValues.client_name,
          client_address: initialValues.client_address,
          quart_id: initialValues.quart_id,
          scheduled_date: initialValues.scheduled_date
            ? dayjs(initialValues.scheduled_date)
            : dayjs(selectedDate),
          start_hour: startTime.isValid() ? startTime : dayjs("08:00", "HH:mm"),
          end_hour: endTime.isValid() ? endTime : dayjs("17:00", "HH:mm"),
          pickup_type: initialValues.pickup_type || "round_trip",
          go_pickup_point: initialValues.go_pickup_point,
          return_dropoff_point: initialValues.return_dropoff_point,
          dress_code: initialValues.dress_code,
        });
      } else {
        setPickupType("round_trip");
        form.resetFields();
        form.setFieldsValue({
          scheduled_date: dayjs(selectedDate),
          start_hour: dayjs("08:00", "HH:mm"),
          end_hour: dayjs("17:00", "HH:mm"),
          pickup_type: "round_trip",
        });
      }
    }
  }, [open, initialValues, selectedDate, form]);

  const handleSubmit = async (values: any) => {
    try {
      setIsSubmitting(true);

      const phone = String(values.candidate_phone || "").trim();
      const formattedPhone = phone.startsWith("+")
        ? phone
        : phone.length === 10
        ? `+1${phone}`
        : `+${phone}`;

      const dateStr = dayjs.isDayjs(values.scheduled_date)
        ? values.scheduled_date.format("YYYY-MM-DD")
        : String(values.scheduled_date);

      const startStr = dayjs.isDayjs(values.start_hour)
        ? values.start_hour.format("HH:mm:ss")
        : String(values.start_hour);

      const endStr = dayjs.isDayjs(values.end_hour)
        ? values.end_hour.format("HH:mm:ss")
        : String(values.end_hour);

      const payload = {
        candidate_name: values.candidate_name.trim(),
        candidate_phone: formattedPhone,
        candidate_id: values.candidate_id ? values.candidate_id.trim() : null,
        candidate_address: values.candidate_address
          ? values.candidate_address.trim()
          : null,

        client_name: values.client_name.trim(),
        client_address: values.client_address ? values.client_address.trim() : "",

        quart_id: values.quart_id ? values.quart_id.trim() : null,
        scheduled_date: dateStr,
        start_hour: startStr,
        end_hour: endStr,
        pickup_type: values.pickup_type as PickupType,

        go_pickup_point: values.go_pickup_point ? values.go_pickup_point.trim() : null,
        return_dropoff_point: values.return_dropoff_point
          ? values.return_dropoff_point.trim()
          : null,
        dress_code: values.dress_code ? values.dress_code.trim() : null,
      };

      if (initialValues) {
        await updateTransportJobAction(initialValues.id, payload);
        message.success("Transport job updated successfully");
      } else {
        await createTransportJobAction(payload);
        message.success("Transport job created successfully");
      }

      onClose();
    } catch (error: any) {
      if (error?.errorFields) return;
      message.error(
        error.response?.data?.detail || "Failed to save transport job"
      );
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={initialValues ? "Edit Transport Job" : "Create Transport Job"}
      size="large"
      placement="right"
      destroyOnClose
    >
      <Flex vertical style={{ height: "100%", overflow: "hidden" }}>
        {/* Scrollable Form Area */}
        <Flex
          vertical
          style={{
            width: "100%",
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            padding: "0 8px",
          }}
          className="custom-scrollbar"
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            {/* <Divider className="!text-xs !font-bold uppercase tracking-wider text-gray-500 !m-0 !mb-3">
              Passenger / Candidate Info
            </Divider> */}

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="candidate_name"
                  label="Candidate Name"
                  rules={[{ required: true, message: "Candidate name is required" }]}
                >
                  <Input placeholder="e.g. Artemia Murillo" className="rounded-none" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="candidate_phone"
                  label="Candidate Phone"
                  rules={[{ required: true, message: "Phone is required" }]}
                >
                  <Input placeholder="e.g. +1 514-473-8201" className="rounded-none" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="candidate_id" label="Candidate ID / Employee Code">
                  <Input placeholder="e.g. EMP-192" className="rounded-none" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="candidate_address" label="Home Address">
                  <AddressAutocomplete
                    value={form.getFieldValue("candidate_address")}
                    onChange={(val) => form.setFieldValue("candidate_address", val)}
                    onSelect={(d: AddressData) =>
                      form.setFieldValue("candidate_address", d.address_formatted)
                    }
                    placeholder="Search candidate home address..."
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* <Divider orientation="left" className="!text-xs !font-bold uppercase tracking-wider text-gray-500 !my-3">
              Client &amp; Workplace Details
            </Divider> */}

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="client_name"
                  label="Client / Company Name"
                  rules={[{ required: true, message: "Client name is required" }]}
                >
                  <Input placeholder="e.g. Groupe Alimentaire" className="rounded-none" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="client_address"
                  label="Client Workplace Address"
                  rules={[{ required: true, message: "Client address is required" }]}
                >
                  <AddressAutocomplete
                    value={form.getFieldValue("client_address")}
                    onChange={(val) => form.setFieldValue("client_address", val)}
                    onSelect={(d: AddressData) =>
                      form.setFieldValue("client_address", d.address_formatted)
                    }
                    placeholder="Search workplace address..."
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* <Divider orientation="left" className="!text-xs !font-bold uppercase tracking-wider text-gray-500 !my-3">
              Shift &amp; Transport Schedule
            </Divider> */}

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="scheduled_date"
                  label="Scheduled Date"
                  rules={[{ required: true, message: "Date is required" }]}
                >
                  <DatePicker className="w-full rounded-none" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="start_hour"
                  label="Shift Start Hour"
                  rules={[{ required: true, message: "Start hour is required" }]}
                >
                  <TimePicker needConfirm={false} format="HH:mm" className="w-full rounded-none" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="end_hour"
                  label="Shift End Hour"
                  rules={[{ required: true, message: "End hour is required" }]}
                >
                  <TimePicker needConfirm={false} format="HH:mm" className="w-full rounded-none" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="pickup_type"
                  label="Pickup Type"
                  rules={[{ required: true, message: "Pickup type is required" }]}
                >
                  <Select
                    onChange={(val) => setPickupType(val as PickupType)}
                    options={[
                      { label: "Round trip", value: "round_trip" },
                      { label: "One-way (go)", value: "one_way" },
                      { label: "Return only", value: "return_only" },
                    ]}
                    className="rounded-none"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="quart_id" label="Shift / Quart ID">
                  <Input placeholder="e.g. 33726" className="rounded-none" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="dress_code" label="Dress Code">
                  <Input placeholder="e.g. Safety Boots Required" className="rounded-none" />
                </Form.Item>
              </Col>
            </Row>

            {(pickupType === "round_trip" || pickupType === "one_way") && (
              <Form.Item name="go_pickup_point" label="Go Leg Pick-up Point (Metro / Station / Address)">
                <AddressAutocomplete
                  value={form.getFieldValue("go_pickup_point")}
                  onChange={(val) => form.setFieldValue("go_pickup_point", val)}
                  onSelect={(d: AddressData) =>
                    form.setFieldValue("go_pickup_point", d.address_formatted)
                  }
                  placeholder="e.g. Metro Crémazie or Pick-up Address"
                />
              </Form.Item>
            )}

            {(pickupType === "round_trip" || pickupType === "return_only") && (
              <Form.Item name="return_dropoff_point" label="Return Leg Drop-off Point (Metro / Station / Address)">
                <AddressAutocomplete
                  value={form.getFieldValue("return_dropoff_point")}
                  onChange={(val) => form.setFieldValue("return_dropoff_point", val)}
                  onSelect={(d: AddressData) =>
                    form.setFieldValue("return_dropoff_point", d.address_formatted)
                  }
                  placeholder="e.g. Metro Lionel-Groulx or Drop-off Address"
                />
              </Form.Item>
            )}
          </Form>
        </Flex>

        {/* Fixed Button at Bottom (Identical to Delivery Job edit drawer) */}
        <Flex style={{ paddingTop: "12px" }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={isSubmitting}
            block
            icon={<PlusCircleOutlined />}
            onClick={() => form.submit()}
          >
            {initialValues ? "Update" : "Add"}
          </Button>
        </Flex>
      </Flex>
    </Drawer>
  );
}
