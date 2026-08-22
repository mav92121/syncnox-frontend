import { useEffect, useState } from "react";
import dayjs from "dayjs";
import {
  Form,
  Input,
  Select,
  DatePicker,
  TimePicker,
  Button,
  message,
  Flex,
  Row,
  Col,
} from "antd";
import { PlusCircleOutlined } from "@ant-design/icons";
import { Job } from "@/types/job.type";
import { COUNTRY_CODES } from "@/constants/country";
import AddressAutocomplete, {
  AddressData,
} from "@/components/AddressAutocomplete";
import {
  JOB_TYPES,
  PAYMENT_STATUS_OPTIONS,
  PRIORITY_OPTIONS,
  RECURRENCE_OPTIONS,
} from "./jobForm.constants";
import {
  validateTimeWindowStart,
  validateTimeWindowEnd,
  phoneNumberPattern,
  validateJobDuration,
} from "./jobs.validation";
import { useJobsStore } from "@/store/jobs.store";
import { filterCountryOptions } from "@/utils/jobs.utils";
import { useTeamStore } from "@/store/team.store";
import { CustomFieldDefinition } from "@/apis/custom-fields.api";
import { DynamicCustomFieldsForm } from "@/components/DynamicCustomFieldsForm";
import { useFieldConfig } from "@/hooks/useFieldConfig";

interface JobFormProps {
  initialData?: Job | null;
  onSubmit?: (job?: Job) => void;
}

const JobForm = ({ initialData = null, onSubmit }: JobFormProps) => {
  const [messageApi, contextHolder] = message.useMessage();
  const { isLoading, createJobAction, updateJobAction } = useJobsStore();
  const { teams } = useTeamStore();
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, any>>({});

  const [activeTemplate, setActiveTemplate] = useState<string>("pickup_delivery_job");

  useEffect(() => {
    const storedTemplate = localStorage.getItem("syncnox_active_job_template");
    if (storedTemplate) {
      setActiveTemplate(storedTemplate);
    }
  }, []);

  const { getFieldConfig, customFields: customFieldDefs } = useFieldConfig("job", activeTemplate);

  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    // Transform the form values to match API requirements
    const transformedValues: any = {
      ...values,
      id: initialData?.id,
      template_type: activeTemplate,
    };

    // 1. Transform scheduled_date: dayjs object -> local date string (YYYY-MM-DD)
    if (values.scheduled_date) {
      transformedValues.scheduled_date = dayjs(values.scheduled_date).format(
        "YYYY-MM-DD",
      );
    }

    // 2. Transform time windows: dayjs object -> local time string (HH:mm:ss)
    if (values.time_window_start) {
      transformedValues.time_window_start = dayjs(
        values.time_window_start,
      ).format("HH:mm");
    }
    if (values.time_window_end) {
      transformedValues.time_window_end = dayjs(values.time_window_end).format(
        "HH:mm",
      );
    }

    // 3. Transform phone: object {countryCode, number} -> string phone_number
    if (values.phone && values.phone.number) {
      const { countryCode, number } = values.phone;
      const codeOnly = countryCode.match(/\+\d+/)?.[0] || "";
      transformedValues.phone_number = `${codeOnly}-${number}`;
      transformedValues.client_phone = `${codeOnly}-${number}`;
    }
    delete transformedValues.phone;

    // 4. Attach dynamic custom fields
    transformedValues.custom_fields = customFieldValues;

    try {
      if (initialData?.id) {
        const updatedJob = await updateJobAction(transformedValues);
        messageApi.success("Job updated successfully");
        form.resetFields();
        setCustomFieldValues({});
        onSubmit?.(updatedJob);
      } else {
        const newJob = await createJobAction(transformedValues);
        messageApi.success("Job created successfully");
        form.resetFields();
        setCustomFieldValues({});
        onSubmit?.(Array.isArray(newJob) ? newJob[0] : newJob);
      }
    } catch (e: any) {
      const error = e;
      console.error(error?.detail);
      messageApi.error(error?.detail ?? "Something went wrong");
    }
  };

  // Prefill form when initialData changes (for editing)
  useEffect(() => {
    if (initialData) {
      const formValues: any = { ...initialData };
      if (initialData.custom_fields) {
        setCustomFieldValues(initialData.custom_fields);
      }

      // 1. Transform scheduled_date: string (YYYY-MM-DD) -> dayjs object
      if (formValues.scheduled_date) {
        formValues.scheduled_date = dayjs(formValues.scheduled_date);
      }

      // 2. Transform time windows: string (HH:mm) -> dayjs object
      if (formValues.time_window_start) {
        formValues.time_window_start = dayjs(
          formValues.time_window_start,
          "HH:mm",
        );
      }
      if (formValues.time_window_end) {
        formValues.time_window_end = dayjs(formValues.time_window_end, "HH:mm");
      }

      // 3. Transform phone_number: string "+1-298372138" -> object {countryCode, number}
      if (formValues.phone_number) {
        const [code, number] = formValues.phone_number.split("-");
        // Find the country with matching code to get flag
        const country = COUNTRY_CODES.find((c) => c.code === code);
        formValues.phone = {
          countryCode: country ? `${country.flag} ${code}` : `🇺🇸 ${code}`,
          number: number,
        };
        delete formValues.phone_number;
      }

      // Set all form fields with the transformed values
      form.setFieldsValue(formValues);
    }
  }, [initialData]);

  return (
    <Flex vertical style={{ height: "100%", overflow: "hidden" }}>
      {contextHolder}

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
          onFinish={onFinish}
          initialValues={{
            scheduled_date: dayjs(),
            priority_level: "medium",
            recurrence_type: "one_time",
            payment_status: "paid",
            job_type: activeTemplate === "worker_shuttle" ? "round_trip" : "pickup",
            service_duration: 5,
            reach_before_minutes: -15,
          }}
        >
          {activeTemplate === "worker_shuttle" ? (
            <>
              {/* Worker Shuttle Header Row: Date & Job Type */}
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Scheduled Date"
                    name="scheduled_date"
                    rules={[{ required: true, message: "Date is required" }]}
                  >
                    <DatePicker format="DD-MM-YYYY" className="w-full" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Trip Type"
                    name="job_type"
                    rules={[{ required: true, message: "Trip type is required" }]}
                  >
                    <Select
                      placeholder="Select Trip Type"
                      options={[
                        { value: "one_way", label: "One Way (Pick Up Only)" },
                        { value: "return_only", label: "Return Only (Drop Off)" },
                        { value: "round_trip", label: "Round Trip (Creates 2 Jobs)" },
                      ]}
                    />
                  </Form.Item>
                </Col>
              </Row>

              {/* Quant ID & Assign Drivers */}
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Quant / Shift Ref ID" name="quant_id">
                    <Input placeholder="e.g. SHIFT-101" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Assign Driver / Team" name="assigned_to">
                    <Select placeholder="Select" allowClear>
                      {teams.map((team) => (
                        <Select.Option key={team.id} value={team.id}>
                          {team.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              {/* Driver Reach Time & Reach Window */}
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Driver Reach Time" name="driver_reach_time">
                    <TimePicker format="HH:mm" className="w-full" needConfirm={false} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Reach Window (mins)"
                    name="reach_before_minutes"
                    tooltip="Negative value allows arrival buffer (e.g. -15 mins for 6:00pm allows 6:00pm - 6:15pm)"
                  >
                    <Input type="number" placeholder="e.g. -15" />
                  </Form.Item>
                </Col>
              </Row>

              {/* Client Pick Up Time */}
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Client Pick Up Time" name="client_pick_up_time">
                    <TimePicker format="HH:mm" className="w-full" needConfirm={false} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Client / Worker ID" name="client_id">
                    <Input placeholder="e.g. EMP-992" />
                  </Form.Item>
                </Col>
              </Row>

              {/* Pick Up Address */}
              <Form.Item
                label="Pick Up Address"
                name="pick_up_address"
                rules={[{ required: true, message: "Pick up address is required" }]}
              >
                <AddressAutocomplete
                  value={form.getFieldValue("pick_up_address")}
                  placeholder="Type to search pickup address"
                  onChange={() => {
                    form.setFieldsValue({ pick_up_address: undefined, pick_up_location: undefined });
                  }}
                  onSelect={(addressData: AddressData) => {
                    form.setFieldsValue({
                      pick_up_address: addressData.address_formatted,
                      pick_up_location: addressData.location,
                    });
                  }}
                />
              </Form.Item>

              {/* Drop Off Address */}
              <Form.Item
                label="Drop Off Address"
                name="drop_off_address"
                rules={[{ required: true, message: "Drop off address is required" }]}
              >
                <AddressAutocomplete
                  value={form.getFieldValue("drop_off_address")}
                  placeholder="Type to search dropoff address"
                  onChange={() => {
                    form.setFieldsValue({ drop_off_address: undefined, drop_off_location: undefined });
                  }}
                  onSelect={(addressData: AddressData) => {
                    form.setFieldsValue({
                      drop_off_address: addressData.address_formatted,
                      drop_off_location: addressData.location,
                    });
                  }}
                />
              </Form.Item>

              {/* Client Name & Phone */}
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Passenger Name" name="client_name">
                    <Input placeholder="Client / Passenger Name" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Passenger Phone" name="client_phone">
                    <Input placeholder="Customer Phone Number" />
                  </Form.Item>
                </Col>
              </Row>

              {/* Shuttle Notes */}
              <Form.Item label="Shuttle Notes" name="notes">
                <Input.TextArea rows={3} placeholder="Special instructions or pickup details" />
              </Form.Item>
            </>
          ) : (
            <>
              {/* Date and Job Type */}
              <Row gutter={16}>
                {getFieldConfig("scheduled_date").isVisible && (
                  <Col span={12}>
                    <Form.Item
                      label={getFieldConfig("scheduled_date").label}
                      name="scheduled_date"
                      required={getFieldConfig("scheduled_date").isRequired}
                      rules={
                        getFieldConfig("scheduled_date").isRequired
                          ? [{ required: true, message: `${getFieldConfig("scheduled_date").label} is required` }]
                          : []
                      }
                    >
                      <DatePicker format="DD-MM-YYYY" className="w-full" />
                    </Form.Item>
                  </Col>
                )}
                {getFieldConfig("job_type").isVisible && (
                  <Col span={12}>
                    <Form.Item
                      label={getFieldConfig("job_type").label}
                      name="job_type"
                      required={getFieldConfig("job_type").isRequired}
                      rules={
                        getFieldConfig("job_type").isRequired
                          ? [{ required: true, message: `${getFieldConfig("job_type").label} is required` }]
                          : []
                      }
                    >
                      <Select placeholder="Select" options={JOB_TYPES} />
                    </Form.Item>
                  </Col>
                )}
              </Row>

              {/* Priority and Assign Drivers */}
              <Row gutter={16}>
                {getFieldConfig("priority_level").isVisible && (
                  <Col span={12}>
                    <Form.Item
                      label={getFieldConfig("priority_level").label}
                      name="priority_level"
                      required={getFieldConfig("priority_level").isRequired}
                      rules={
                        getFieldConfig("priority_level").isRequired
                          ? [{ required: true, message: `${getFieldConfig("priority_level").label} is required` }]
                          : []
                      }
                    >
                      <Select placeholder="Select" options={PRIORITY_OPTIONS} />
                    </Form.Item>
                  </Col>
                )}
                <Col span={12}>
                  <Form.Item label="Assign Drivers" name="assigned_to">
                    <Select placeholder="Select" allowClear>
                      {teams.map((team) => (
                        <Select.Option key={team.id} value={team.id}>
                          {team.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              {/* Address */}
              {getFieldConfig("address_formatted").isVisible && (
                <Form.Item
                  label={getFieldConfig("address_formatted").label}
                  name="address_formatted"
                  required={getFieldConfig("address_formatted").isRequired}
                  rules={
                    getFieldConfig("address_formatted").isRequired
                      ? [{ required: true, message: `${getFieldConfig("address_formatted").label} is required` }]
                      : []
                  }
                >
                  <AddressAutocomplete
                    value={form.getFieldValue("address_formatted")}
                    placeholder="Type to search address"
                    onChange={(value: string) => {
                      form.setFieldsValue({
                        address_formatted: undefined,
                        location: undefined,
                      });
                    }}
                    onSelect={(addressData: AddressData) => {
                      form.setFieldsValue({
                        address_formatted: addressData.address_formatted,
                        location: addressData.location,
                      });
                    }}
                  />
                </Form.Item>
              )}

              {/* Lat / Lng */}
              {getFieldConfig("location").isVisible && (
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="Latitude"
                      name={["location", "lat"]}
                      required={getFieldConfig("location").isRequired}
                      rules={[
                        ...(getFieldConfig("location").isRequired
                          ? [{ required: true, message: "Latitude is required" }]
                          : []),
                        {
                          validator: (_, value) =>
                            value === undefined ||
                            value === null ||
                            value === "" ||
                            (!isNaN(Number(value)) &&
                              Number(value) >= -90 &&
                              Number(value) <= 90)
                              ? Promise.resolve()
                              : Promise.reject("Enter a valid latitude (-90 to 90)"),
                        },
                      ]}
                    >
                      <Input type="number" placeholder="e.g. 37.7749" step="any" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Longitude"
                      name={["location", "lng"]}
                      required={getFieldConfig("location").isRequired}
                      rules={[
                        ...(getFieldConfig("location").isRequired
                          ? [{ required: true, message: "Longitude is required" }]
                          : []),
                        {
                          validator: (_, value) =>
                            value === undefined ||
                            value === null ||
                            value === "" ||
                            (!isNaN(Number(value)) &&
                              Number(value) >= -180 &&
                              Number(value) <= 180)
                              ? Promise.resolve()
                              : Promise.reject(
                                  "Enter a valid longitude (-180 to 180)",
                                ),
                        },
                      ]}
                    >
                      <Input type="number" placeholder="e.g. -122.4194" step="any" />
                    </Form.Item>
                  </Col>
                </Row>
              )}

              {/* Phone Number */}
              {getFieldConfig("phone_number").isVisible && (
                <Form.Item
                  label={getFieldConfig("phone_number").label}
                  required={getFieldConfig("phone_number").isRequired}
                  rules={
                    getFieldConfig("phone_number").isRequired
                      ? [
                          {
                            validator: (_, __) => {
                              const phoneObj = form.getFieldValue("phone");
                              if (!phoneObj || !phoneObj.number) {
                                return Promise.reject(
                                  `${getFieldConfig("phone_number").label} is required`
                                );
                              }
                              return Promise.resolve();
                            },
                          },
                        ]
                      : []
                  }
                >
                  <Row gutter={8}>
                    <Col span={8}>
                      <Form.Item
                        name={["phone", "countryCode"]}
                        noStyle
                        initialValue={`🇺🇸 +1`}
                      >
                        <Select
                          showSearch
                          className="w-full"
                          filterOption={filterCountryOptions}
                        >
                          {COUNTRY_CODES.map((item) => (
                            <Select.Option
                              key={`${item.country}-${item.code}`}
                              value={`${item.flag} ${item.code}`}
                            >
                              {item.flag} {item.code} &nbsp; {item.name}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={16}>
                      <Form.Item name={["phone", "number"]} noStyle>
                        <Input
                          type="number"
                          placeholder="8023456789"
                          maxLength={15}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Form.Item>
              )}

              {/* First Name and Last Name */}
              <Row gutter={16}>
                {getFieldConfig("first_name").isVisible && (
                  <Col span={12}>
                    <Form.Item
                      label={getFieldConfig("first_name").label}
                      name="first_name"
                      required={getFieldConfig("first_name").isRequired}
                      rules={
                        getFieldConfig("first_name").isRequired
                          ? [{ required: true, message: `${getFieldConfig("first_name").label} is required` }]
                          : []
                      }
                    >
                      <Input placeholder="First Name" />
                    </Form.Item>
                  </Col>
                )}
                {getFieldConfig("last_name").isVisible && (
                  <Col span={12}>
                    <Form.Item
                      label={getFieldConfig("last_name").label}
                      name="last_name"
                      required={getFieldConfig("last_name").isRequired}
                      rules={
                        getFieldConfig("last_name").isRequired
                          ? [{ required: true, message: `${getFieldConfig("last_name").label} is required` }]
                          : []
                      }
                    >
                      <Input placeholder="Last Name" />
                    </Form.Item>
                  </Col>
                )}
              </Row>

              {/* Email and Business Name */}
              <Row gutter={16}>
                {getFieldConfig("email").isVisible && (
                  <Col span={12}>
                    <Form.Item
                      label={getFieldConfig("email").label}
                      name="email"
                      required={getFieldConfig("email").isRequired}
                      rules={
                        getFieldConfig("email").isRequired
                          ? [{ required: true, message: `${getFieldConfig("email").label} is required` }]
                          : []
                      }
                    >
                      <Input type="email" placeholder="Email" />
                    </Form.Item>
                  </Col>
                )}
                {getFieldConfig("business_name").isVisible && (
                  <Col span={12}>
                    <Form.Item
                      label={getFieldConfig("business_name").label}
                      name="business_name"
                      required={getFieldConfig("business_name").isRequired}
                      rules={
                        getFieldConfig("business_name").isRequired
                          ? [{ required: true, message: `${getFieldConfig("business_name").label} is required` }]
                          : []
                      }
                    >
                      <Input placeholder="Business Name" />
                    </Form.Item>
                  </Col>
                )}
              </Row>

              {/* Time From, To, and Duration */}
              <Row gutter={16}>
                {getFieldConfig("time_window_start").isVisible && (
                  <Col span={8}>
                    <Form.Item
                      label={getFieldConfig("time_window_start").label}
                      name="time_window_start"
                      required={getFieldConfig("time_window_start").isRequired}
                      rules={[
                        ...(getFieldConfig("time_window_start").isRequired
                          ? [{ required: true, message: `${getFieldConfig("time_window_start").label} is required` }]
                          : []),
                        validateTimeWindowStart(form),
                      ]}
                    >
                      <TimePicker
                        needConfirm={false}
                        className="w-full"
                        format="HH:mm"
                        onChange={() => {
                          form.validateFields(["time_window_end"]);
                        }}
                      />
                    </Form.Item>
                  </Col>
                )}
                {getFieldConfig("time_window_end").isVisible && (
                  <Col span={8}>
                    <Form.Item
                      label={getFieldConfig("time_window_end").label}
                      name="time_window_end"
                      required={getFieldConfig("time_window_end").isRequired}
                      rules={[
                        ...(getFieldConfig("time_window_end").isRequired
                          ? [{ required: true, message: `${getFieldConfig("time_window_end").label} is required` }]
                          : []),
                        validateTimeWindowEnd(form),
                      ]}
                    >
                      <TimePicker
                        needConfirm={false}
                        className="w-full"
                        format="HH:mm"
                        onChange={() => {
                          form.validateFields(["time_window_start"]);
                        }}
                      />
                    </Form.Item>
                  </Col>
                )}
                {getFieldConfig("service_duration").isVisible && (
                  <Col span={8}>
                    <Form.Item
                      label={getFieldConfig("service_duration").label}
                      name="service_duration"
                      required={getFieldConfig("service_duration").isRequired}
                      rules={[
                        ...(getFieldConfig("service_duration").isRequired
                          ? [{ required: true, message: `${getFieldConfig("service_duration").label} is required` }]
                          : []),
                        validateJobDuration(),
                      ]}
                    >
                      <Input
                        type="number"
                        placeholder="Enter duration"
                        className="w-full"
                        addonAfter="mins"
                        max={540}
                        min={0}
                      />
                    </Form.Item>
                  </Col>
                )}
              </Row>

              {/* Customer Preferences */}
              {getFieldConfig("customer_preferences").isVisible && (
                <Form.Item
                  label={getFieldConfig("customer_preferences").label}
                  name="customer_preferences"
                  required={getFieldConfig("customer_preferences").isRequired}
                  rules={
                    getFieldConfig("customer_preferences").isRequired
                      ? [{ required: true, message: `${getFieldConfig("customer_preferences").label} is required` }]
                      : []
                  }
                >
                  <Input.TextArea rows={3} placeholder="Type" />
                </Form.Item>
              )}

              {/* Notes */}
              {getFieldConfig("additional_notes").isVisible && (
                <Form.Item
                  label={getFieldConfig("additional_notes").label}
                  name="additional_notes"
                  required={getFieldConfig("additional_notes").isRequired}
                  rules={
                    getFieldConfig("additional_notes").isRequired
                      ? [{ required: true, message: `${getFieldConfig("additional_notes").label} is required` }]
                      : []
                  }
                >
                  <Input.TextArea rows={3} placeholder="Type" />
                </Form.Item>
              )}

              {/* Single/Recurring and Payment Status */}
              <Row gutter={16}>
                {getFieldConfig("recurrence_type").isVisible && (
                  <Col span={12}>
                    <Form.Item
                      label={getFieldConfig("recurrence_type").label}
                      name="recurrence_type"
                      required={getFieldConfig("recurrence_type").isRequired}
                      rules={
                        getFieldConfig("recurrence_type").isRequired
                          ? [{ required: true, message: `${getFieldConfig("recurrence_type").label} is required` }]
                          : []
                      }
                    >
                      <Select placeholder="Select" options={RECURRENCE_OPTIONS} />
                    </Form.Item>
                  </Col>
                )}
                {getFieldConfig("payment_status").isVisible && (
                  <Col span={12}>
                    <Form.Item
                      label={getFieldConfig("payment_status").label}
                      name="payment_status"
                      required={getFieldConfig("payment_status").isRequired}
                      rules={
                        getFieldConfig("payment_status").isRequired
                          ? [{ required: true, message: `${getFieldConfig("payment_status").label} is required` }]
                          : []
                      }
                    >
                      <Select placeholder="Select" options={PAYMENT_STATUS_OPTIONS} />
                    </Form.Item>
                  </Col>
                )}
              </Row>
            </>
          )}

          {/* Dynamic Tenant Custom Fields */}
          <DynamicCustomFieldsForm
            customFields={customFieldDefs}
            values={customFieldValues}
            onChange={(updatedVals) => setCustomFieldValues(updatedVals)}
          />
        </Form>
      </Flex>

      {/* Fixed Button at Bottom */}
      <Flex
        style={{
          paddingTop: "12px",
        }}
      >
        <Button
          type="primary"
          htmlType="submit"
          loading={isLoading}
          block
          icon={<PlusCircleOutlined />}
          onClick={() => form.submit()}
        >
          {initialData ? "Update" : "Add"}
        </Button>
      </Flex>
    </Flex>
  );
};

export default JobForm;
