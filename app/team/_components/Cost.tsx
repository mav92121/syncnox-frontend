import { Form, InputNumber, Row, Col } from "antd";

const Cost = () => {
  return (
    <>
      <h3 className="text-lg font-medium mb-4">Cost</h3>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Fixed cost for Driver" name="fixed_cost_for_driver">
            <InputNumber
              className="w-full"
              placeholder="0"
              min={0}
              prefix="$"
              precision={2}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Cost Per Kilometer" name="cost_per_km">
            <InputNumber
              className="w-full"
              placeholder="1"
              min={0}
              prefix="$"
              precision={2}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Cost Per Hour" name="cost_per_hr">
            <InputNumber
              className="w-full"
              placeholder="20"
              min={0}
              prefix="$"
              precision={2}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Cost Per Hour For Overtime"
            name="cost_per_hr_overtime"
          >
            <InputNumber
              className="w-full"
              placeholder="30"
              min={0}
              prefix="$"
              precision={2}
            />
          </Form.Item>
        </Col>
      </Row>
    </>
  );
};

export default Cost;
