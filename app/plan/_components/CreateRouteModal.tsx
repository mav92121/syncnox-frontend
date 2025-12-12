import { Form, Input, Modal, Select, Button, Row, Col } from "antd";
import { useDepotStore } from "@/zustand/depots.store";
import { useTeamStore } from "@/zustand/team.store";
import { useEffect } from "react";

interface CreateRouteModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const CreateRouteModal = ({ open, setOpen }: CreateRouteModalProps) => {
  const [form] = Form.useForm();
  const { depots } = useDepotStore();
  const { teams } = useTeamStore();

  const handleFinish = (values: any) => {
    console.log("Form values:", values);
    // TODO: Implement submission logic
  };

  return (
    <Modal
      centered
      footer={null}
      title="Create New Route"
      open={open}
      onCancel={() => setOpen(false)}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{ optimization_logic: "minimum_time" }}
      >
        {/* 1st Row: Route Name */}
        <Form.Item
          name="route_name"
          label="Route Name"
          rules={[{ required: true, message: "Please enter a route name" }]}
        >
          <Input placeholder="Enter route name" />
        </Form.Item>

        {/* 2nd Row: Optimization Logic & Depot */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="optimization_logic"
              label="Optimization Logic"
              rules={[
                { required: true, message: "Please select optimization logic" },
              ]}
            >
              <Select placeholder="Select logic">
                <Select.Option value="minimum_time">Minimum Time</Select.Option>
                <Select.Option value="minimum_distance">Minimum Distance</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="depot_id"
              label="Select Depot"
              rules={[{ required: true, message: "Please select a depot" }]}
            >
              <Select placeholder="Select depot">
                {depots.map((depot) => (
                  <Select.Option key={depot.id} value={depot.id}>
                    {depot.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* 3rd Row: Assign Team */}
        <Form.Item
          name="team_ids"
          label="Assign Team"
          rules={[
            {
              required: true,
              message: "Please select at least one team member",
            },
          ]}
        >
          <Select
            mode="multiple"
            placeholder="Select team members"
            optionFilterProp="children"
          >
            {teams.map((team) => (
              <Select.Option key={team.id} value={team.id}>
                {team.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* 4th Row: Submit Button */}
        <Form.Item className="mb-0">
          <Button type="primary" htmlType="submit" block>
            Create and Optimize Route
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateRouteModal;
