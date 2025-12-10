import {
  Form,
  Input,
  Select,
  TimePicker,
  Row,
  Col,
  Checkbox,
  InputNumber,
} from "antd";
import { FormInstance } from "antd/es/form";
import { COUNTRY_CODES } from "@/constants/country";
import {
  phoneNumberPattern,
  createTimeWindowStartValidator,
  createTimeWindowEndValidator,
} from "@/utils/form.validation";
import {
  ROLE_TYPE_OPTIONS,
  NAVIGATION_FORMAT_OPTIONS,
  DEFAULT_VEHICLES_OPTIONS,
} from "./teamForm.constants";

interface BasicInformationProps {
  form: FormInstance;
  scheduleBreak: boolean;
  onScheduleBreakChange: (checked: boolean) => void;
  isDriver: boolean;
}

const BasicInformation = ({
  form,
  scheduleBreak,
  onScheduleBreakChange,
  isDriver,
}: BasicInformationProps) => {
  return (
    <>
      {/* Name and Role Type */}
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Name is required" }]}
          >
            <Input placeholder="Name" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Role Type"
            name="role_type"
            rules={[{ required: true, message: "Role type is required" }]}
          >
            <Select placeholder="Select role" options={ROLE_TYPE_OPTIONS} />
          </Form.Item>
        </Col>
      </Row>

      {/* External Identifier and Email */}
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="External Identifier" name="external_identifier">
            <Input placeholder="External Identifier" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Email"
            name="email"
            rules={[{ type: "email", message: "Please enter a valid email" }]}
          >
            <Input type="email" placeholder="Email" />
          </Form.Item>
        </Col>
      </Row>

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
              <Select showSearch optionFilterProp="children" className="w-full">
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
              <Input type="number" placeholder="Phone Number" maxLength={15} />
            </Form.Item>
          </Col>
        </Row>
      </Form.Item>

      {/* Driver-specific fields - only show for drivers */}
      {isDriver && (
        <>
          {/* Navigation Link Format and Default Vehicles */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Navigation Link Format"
                name="navigation_link_format"
              >
                <Select
                  placeholder="Select"
                  options={NAVIGATION_FORMAT_OPTIONS}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Default Vehicles" name="vehicle">
                <Select
                  placeholder="Select"
                  options={DEFAULT_VEHICLES_OPTIONS}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Work Time From and To */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Work Time"
                name="work_start_time"
                rules={[
                  createTimeWindowStartValidator(
                    form,
                    "work_end_time",
                    "Work start time",
                    "Work end time"
                  ),
                ]}
              >
                <TimePicker
                  className="w-full"
                  format="HH:mm"
                  placeholder="Select time"
                  onChange={() => {
                    // Trigger validation on end time when start time changes
                    form.validateFields(["work_end_time"]);
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="To"
                name="work_end_time"
                rules={[
                  createTimeWindowEndValidator(
                    form,
                    "work_start_time",
                    "Work start time",
                    "Work end time"
                  ),
                ]}
              >
                <TimePicker
                  className="w-full"
                  format="HH:mm"
                  placeholder="Select time"
                  onChange={() => {
                    // Trigger validation on start time when end time changes
                    form.validateFields(["work_start_time"]);
                  }}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Allowed Overtime */}
          <Form.Item name="allowed_overtime" valuePropName="checked">
            <Checkbox>Allowed Overtime</Checkbox>
          </Form.Item>

          {/* Distance Limit */}
          <Form.Item label="Distance limit (km)" name="max_distance">
            <InputNumber
              className="w-full"
              placeholder="50"
              min={0}
              addonAfter="km"
            />
          </Form.Item>

          {/* Schedule Break */}
          <Form.Item>
            <Checkbox
              checked={scheduleBreak}
              onChange={(e) => onScheduleBreakChange(e.target.checked)}
            >
              Schedule a break for this driver
            </Checkbox>
          </Form.Item>

          {/* Break Time (conditional) */}
          {scheduleBreak && (
            <Form.Item label="Break must happen between">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="break_time_start"
                    noStyle
                    rules={[
                      createTimeWindowStartValidator(
                        form,
                        "break_time_end",
                        "Break start time",
                        "Break end time"
                      ),
                    ]}
                  >
                    <TimePicker
                      className="w-full"
                      format="HH:mm"
                      placeholder="Select time"
                      onChange={() => {
                        // Trigger validation on end time when start time changes
                        form.validateFields(["break_time_end"]);
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="break_time_end"
                    noStyle
                    rules={[
                      createTimeWindowEndValidator(
                        form,
                        "break_time_start",
                        "Break start time",
                        "Break end time"
                      ),
                    ]}
                  >
                    <TimePicker
                      className="w-full"
                      format="HH:mm"
                      placeholder="Select time"
                      onChange={() => {
                        // Trigger validation on start time when end time changes
                        form.validateFields(["break_time_start"]);
                      }}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form.Item>
          )}
        </>
      )}
    </>
  );
};

export default BasicInformation;
