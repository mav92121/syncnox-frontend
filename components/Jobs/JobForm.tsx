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
import { useJobsStore } from "@/zustand/jobs.store";
import { createJob, updateJob } from "@/apis/jobs.api";

interface JobFormProps {
  initialData?: Job | null;
}

const JobForm = ({ initialData = null }: JobFormProps) => {
  const [messageApi, contextHolder] = message.useMessage();
  const { upsertJob } = useJobsStore();
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    console.log("Form submitted (raw)", values);

    // Transform the form values to match API requirements
    const transformedValues: any = { ...values };

    // 1. Transform scheduled_date: dayjs object -> local date string (YYYY-MM-DD)
    if (values.scheduled_date) {
      transformedValues.scheduled_date = dayjs(values.scheduled_date).format(
        "YYYY-MM-DD"
      );
    }

    // 2. Transform time windows: dayjs object -> local time string (HH:mm:ss)
    if (values.time_window_start) {
      transformedValues.time_window_start = dayjs(
        values.time_window_start
      ).format("HH:mm");
    }
    if (values.time_window_end) {
      transformedValues.time_window_end = dayjs(values.time_window_end).format(
        "HH:mm"
      );
    }

    // 3. Transform phone: object {countryCode, number} -> string phone_number
    if (values.phone) {
      const { countryCode, number } = values.phone;
      // Extract just the code part (e.g., "+1" from "🇺🇸 +1")
      const codeOnly = countryCode.match(/\+\d+/)?.[0] || "";
      transformedValues.phone_number = `${codeOnly}-${number}`;
      delete transformedValues.phone;
    }

    console.log("Form submitted (transformed)", transformedValues);

    try {
      if (transformedValues.id) {
        const newJob = await updateJob(transformedValues);
        console.log("new Job -> ", newJob);
        upsertJob(newJob);
        messageApi.success("Job updated successfully");
      } else {
        const newJob = await createJob(transformedValues);
        console.log("new Job -> ", newJob);
        upsertJob(newJob);
        messageApi.success("Job created successfully");
      }
    } catch (e) {
      const error = e as Error;
      console.error(error.message);
      messageApi.error("Something went wrong");
    }
  };

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
          requiredMark={false}
          initialValues={{
            scheduled_date: dayjs(),
            priority_level: "medium",
            recurrence_type: "one_time",
            payment_status: "paid",
            job_type: "pickup",
            service_duration: 5,
          }}
        >
          {/* Date and Job Type */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Date"
                name="scheduled_date"
                rules={[{ required: true, message: "Date is required" }]}
              >
                <DatePicker format="DD-MM-YYYY" className="w-full" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Job Type"
                name="job_type"
                rules={[{ required: true, message: "Type is required" }]}
              >
                <Select placeholder="Select" options={JOB_TYPES} />
              </Form.Item>
            </Col>
          </Row>

          {/* Priority and Assign Drivers */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Priority" name="priority_level">
                <Select placeholder="Select" options={PRIORITY_OPTIONS} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Assign Drivers" name="drivers">
                <Select placeholder="Select">
                  <Select.Option value="rahul">Rahul +1</Select.Option>
                  {/* Add more options as needed */}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Address */}
          <Form.Item
            label="Address"
            name="address_formatted"
            rules={[{ required: true, message: "Address is required" }]}
          >
            <AddressAutocomplete
              value={form.getFieldValue("address_formatted")}
              placeholder="Type to search address"
              onChange={(value: string) => {
                // Always clear form fields when user is typing
                // Fields will only be set when user selects from dropdown
                form.setFieldsValue({
                  address_formatted: undefined,
                  location: undefined,
                });
              }}
              onSelect={(addressData: AddressData) => {
                // Update form with location data only when user selects from dropdown
                form.setFieldsValue({
                  address_formatted: addressData.address_formatted,
                  location: addressData.location,
                });
              }}
            />
          </Form.Item>

          {/* Hidden location fields */}
          <Form.Item name={["location", "lat"]} hidden>
            <Input />
          </Form.Item>
          <Form.Item name={["location", "lng"]} hidden>
            <Input />
          </Form.Item>

          {/* Phone Number */}
          <Form.Item
            label="Phone Number"
            rules={[{ required: true, message: "Phone number is required" }]}
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
                    optionFilterProp="children"
                    className="w-full"
                  >
                    {COUNTRY_CODES.map((item) => (
                      <Select.Option
                        key={item.code}
                        value={`${item.flag} ${item.code}`}
                      >
                        {item.flag} {item.code} &nbsp; {item.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={16}>
                <Form.Item
                  name={["phone", "number"]}
                  noStyle
                  rules={[
                    { required: true, message: "Phone number is required" },
                    phoneNumberPattern,
                  ]}
                >
                  <Input
                    type="number"
                    placeholder="8023456789"
                    maxLength={15}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form.Item>

          {/* First Name and Last Name */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="First Name" name="first_name">
                <Input placeholder="First Name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Last Name" name="last_name">
                <Input placeholder="Last Name" />
              </Form.Item>
            </Col>
          </Row>

          {/* Email and Business Name */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Email" name="email">
                <Input type="email" placeholder="Email" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Business Name" name="business_name">
                <Input placeholder="Business Name" />
              </Form.Item>
            </Col>
          </Row>

          {/* Time From, To, and Duration */}
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="From"
                name="time_window_start"
                rules={[validateTimeWindowStart(form)]}
              >
                <TimePicker
                  className="w-full"
                  format="HH:mm"
                  onChange={() => {
                    // Trigger validation on end time when start time changes
                    form.validateFields(["time_window_end"]);
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="To"
                name="time_window_end"
                rules={[validateTimeWindowEnd(form)]}
              >
                <TimePicker
                  className="w-full"
                  format="HH:mm"
                  onChange={() => {
                    // Trigger validation on start time when end time changes
                    form.validateFields(["time_window_start"]);
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Job Duration"
                name="service_duration"
                rules={[validateJobDuration()]}
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
          </Row>

          {/* Customer Preferences */}
          <Form.Item label="Customer Preferences" name="customer_preferences">
            <Input.TextArea rows={3} placeholder="Type" />
          </Form.Item>

          {/* Notes */}
          <Form.Item label="Notes" name="additional_notes">
            <Input.TextArea rows={3} placeholder="Type" />
          </Form.Item>

          {/* Single/Recurring and Payment Status */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Single or Recurring" name="recurrence_type">
                <Select placeholder="Select" options={RECURRENCE_OPTIONS} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Paid/Unpaid" name="payment_status">
                <Select placeholder="Select" options={PAYMENT_STATUS_OPTIONS} />
              </Form.Item>
            </Col>
          </Row>

          {/* File Attachment */}
          {/* <Form.Item label="Attach Files" name="files">
            <Upload.Dragger multiple>
              <Space direction="horizontal" align="center">
                <PlusOutlined />
                <Text>Attach Files</Text>
              </Space>
            </Upload.Dragger>
          </Form.Item> */}
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
