import {
  Form,
  Input,
  Modal,
  Select,
  Button,
  Row,
  Col,
  Progress,
  Alert,
} from "antd";
import { useDepotStore } from "@/store/depots.store";
import { useTeamStore } from "@/store/team.store";
import {
  useOptimizationStore,
  useOptimizationCleanup,
} from "@/store/optimization.store";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import { useJobsStore } from "@/store/jobs.store";
import { useRouteStore } from "@/store/routes.store";

interface CreateRouteModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedJobIds: number[];
}

const CreateRouteModal = ({
  open,
  setOpen,
  selectedJobIds,
}: CreateRouteModalProps) => {
  const [form] = Form.useForm();
  const router = useRouter();
  const { depots } = useDepotStore();
  const { teams } = useTeamStore();
  const { fetchRoutes, setSelectedStatus } = useRouteStore();
  const { refreshDraftJobs } = useJobsStore();
  const {
    startOptimization,
    currentOptimization,
    isPolling,
    error,
    clearOptimization,
  } = useOptimizationStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useOptimizationCleanup();

  // Get status message based on optimization status
  const getStatusMessage = () => {
    if (!currentOptimization) return "";

    switch (currentOptimization.status) {
      case "queued":
        return "Your optimization request is queued...";
      case "processing":
        return "Optimizing routes... This may take a minute.";
      case "completed":
      case "success":
        return "Optimization completed! Redirecting...";
      case "failed":
        return "Optimization failed";
      default:
        return "Processing...";
    }
  };

  // Handle redirect when optimization completes
  useEffect(() => {
    if (
      currentOptimization &&
      (currentOptimization.status === "completed" ||
        currentOptimization.status === "success")
    ) {
      // Short delay to show completion message
      const timeout = setTimeout(() => {
        router.push(`/route/${currentOptimization.id}`);
        setOpen(false);
        // Reset status to scheduled and fetch corresponding routes
        setSelectedStatus("scheduled");
        // Use refreshDraftJobs to specifically update the draft jobs store
        refreshDraftJobs();
        form.resetFields();
        // Clear the optimization state to prevent auto-redirect on next modal open
        clearOptimization();
      }, 1000);

      return () => clearTimeout(timeout);
    }
  }, [
    currentOptimization,
    router,
    setOpen,
    form,
    fetchRoutes,
    refreshDraftJobs,
    setSelectedStatus,
    clearOptimization,
  ]);

  const handleFinish = async (values: any) => {
    setIsSubmitting(true);

    try {
      await startOptimization({
        route_name: values.route_name,
        depot_id: values.depot_id,
        job_ids: selectedJobIds,
        team_member_ids: values.team_ids,
        scheduled_date: dayjs().format("YYYY-MM-DD"), // Today's date
        optimization_goal: values.optimization_logic,
      });
    } catch (err) {
      console.error("Optimization error:", err);
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (!isPolling && !isSubmitting) {
      setOpen(false);
      form.resetFields();
    }
  };

  const handleRetry = () => {
    clearOptimization();
    setIsSubmitting(false);
  };

  return (
    <Modal
      centered
      footer={null}
      title="Create New Route"
      open={open}
      onCancel={handleCancel}
      width={600}
      closable={!isPolling && !isSubmitting}
      maskClosable={!isPolling && !isSubmitting}
    >
      {isSubmitting || isPolling ? (
        <div className="py-8">
          <div className="text-center mb-4">
            <p className="text-lg font-medium">{getStatusMessage()}</p>
          </div>

          <Progress
            percent={
              currentOptimization?.status === "completed" ||
              currentOptimization?.status === "success"
                ? 100
                : currentOptimization?.status === "processing"
                ? 60
                : 30
            }
            status={
              currentOptimization?.status === "failed"
                ? "exception"
                : currentOptimization?.status === "completed" ||
                  currentOptimization?.status === "success"
                ? "success"
                : "active"
            }
          />

          {error && (
            <div className="mt-4">
              <Alert
                message="Error"
                description={error}
                type="error"
                showIcon
              />
              <Button
                type="primary"
                block
                className="mt-4"
                onClick={handleRetry}
              >
                Try Again
              </Button>
            </div>
          )}
        </div>
      ) : (
        <>
          {error && (
            <Alert
              className="mb-4"
              message="Error"
              description={error}
              type="error"
              showIcon
            />
          )}
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
                    {
                      required: true,
                      message: "Please select optimization logic",
                    },
                  ]}
                >
                  <Select placeholder="Select logic">
                    <Select.Option value="minimum_time">
                      Minimum Time
                    </Select.Option>
                    <Select.Option value="minimum_distance">
                      Minimum Distance
                    </Select.Option>
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
        </>
      )}
    </Modal>
  );
};

export default CreateRouteModal;
