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
  Divider,
  Space,
  DatePicker,
  Flex,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import {
  Sparkles,
  Cpu,
  MapPin,
  Layers,
  Users,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  AlertCircle,
  Route
} from "lucide-react";
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
import { bulkUpdateJobDate } from "@/apis/jobs.api";
import DepotForm from "@/app/depot/_components/DepotForm";
import TeamMemberForm from "@/app/team/_components/TeamMemberForm";
import { DepotPayload } from "@/apis/depots.api";

interface CreateRouteModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedJobIds: number[];
  hasMixedDates?: boolean;
}

const CreateRouteModal = ({
  open,
  setOpen,
  selectedJobIds,
  hasMixedDates = false,
}: CreateRouteModalProps) => {
  const [form] = Form.useForm();
  const router = useRouter();
  const { depots, createDepot, isSaving: isDepotSaving } = useDepotStore();
  const { teams } = useTeamStore();
  const { routes, initializeRoutes, fetchRoutes, setSelectedStatus } = useRouteStore();
  const { refreshDraftJobs } = useJobsStore();
  const {
    startOptimization,
    currentOptimization,
    isPolling,
    error,
    clearOptimization,
  } = useOptimizationStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick action modal states
  const [showDepotModal, setShowDepotModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);

  useOptimizationCleanup();

  // Prefill route name when modal opens: "route - {total_routes_for_that_tenant + 1}"
  useEffect(() => {
    if (open) {
      initializeRoutes();
      const currentRoutesCount = routes.length;
      const defaultRouteName = `route - ${currentRoutesCount + 1}`;
      form.setFieldsValue({
        route_name: defaultRouteName,
        optimization_logic: "minimum_time",
        ...(hasMixedDates ? { scheduled_date: dayjs() } : {}),
      });
    }
  }, [open, routes.length, initializeRoutes, form, hasMixedDates]);

  // Get status message based on optimization status
  const getStatusMessage = () => {
    if (!currentOptimization) return "";

    switch (currentOptimization.status) {
      case "queued":
        return "Preparing route optimization...";
      case "processing":
        return "Generating optimal routes for your team...";
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

    const scheduledDate = values.scheduled_date
      ? dayjs(values.scheduled_date).format("YYYY-MM-DD")
      : dayjs().format("YYYY-MM-DD");

    try {
      // If coming from the All tab, update all selected jobs' dates first
      if (hasMixedDates) {
        await bulkUpdateJobDate(selectedJobIds, scheduledDate);
      }

      await startOptimization({
        route_name: values.route_name,
        depot_id: values.depot_id,
        job_ids: selectedJobIds,
        team_member_ids: values.team_ids,
        scheduled_date: scheduledDate,
        optimization_goal: values.optimization_logic,
      });
    } catch (err) {
      console.error("Optimization error:", err);
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (
      (!isPolling && !isSubmitting) ||
      currentOptimization?.status === "failed" ||
      error
    ) {
      setOpen(false);
      form.resetFields();
      setIsSubmitting(false);
      clearOptimization();
    }
  };

  const handleRetry = () => {
    clearOptimization();
    setIsSubmitting(false);
  };

  const isCompleted =
    currentOptimization?.status === "completed" || currentOptimization?.status === "success";
  const isFailed = currentOptimization?.status === "failed" || Boolean(error);

  return (
    <Modal
      centered
      footer={null}
      title={<span className="text-base font-bold text-gray-900">Create New Route</span>}
      open={open}
      onCancel={handleCancel}
      width={600}
      closable={true}
      maskClosable={false}
      className="create-route-modal"
      styles={{
        body: { borderRadius: 0 },
        mask: { backdropFilter: "blur(4px)" },
      }}
    >
      {isFailed ? (
        <div className="py-8 px-4 flex flex-col items-center justify-center text-center">
          {/* Error Icon Badge */}
          <div className="w-14 h-14 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mb-4 shrink-0">
            <AlertCircle size={28} />
          </div>

          {/* Title & Description */}
          <h3 className="text-base font-bold text-gray-900 mb-1.5">
            Unable to Generate Routes
          </h3>
          <p className="text-xs text-gray-600 max-w-md mb-5 leading-relaxed">
            {error || "Could not find a feasible route solution for the selected jobs."}
          </p>

          {/* Suggestions Card */}
          <div className="w-full max-w-md bg-amber-50/70 border border-amber-200/80 p-3.5 text-left mb-6 rounded-none">
            <div className="text-xs font-bold text-amber-950 mb-1.5">
              Suggested Adjustments:
            </div>
            <ul className="text-[11px] text-amber-900 space-y-1 list-disc list-inside leading-normal">
              <li>Assign additional team members / drivers to distribute the stop load.</li>
              <li>Check vehicle capacity limits and driver shift hours in Settings.</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <Flex gap={10} className="w-full max-w-md">
            <Button onClick={handleCancel} className="w-1/3 rounded-none">
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={handleRetry}
              className="w-2/3 rounded-none bg-[#003220] hover:bg-[#002417] font-semibold"
            >
              Modify Parameters & Retry
            </Button>
          </Flex>
        </div>
      ) : isSubmitting || isPolling ? (
        <div className="py-10 px-4 flex flex-col items-center justify-center text-center">
          {/* Animated Visualizer Aura */}
          <div className="relative mb-6 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-dashed border-emerald-600/50 animate-spin flex items-center justify-center" />
            <div className="absolute w-11 h-11 rounded-full bg-[#003220] text-white flex items-center justify-center shadow-md">
              <Route size={20} className="animate-pulse text-white" />
            </div>
          </div>

          {/* Title & Subtitle */}
          <h3 className="text-base font-bold text-gray-900 mb-1.5">
            {isCompleted ? "Routes Optimized Successfully!" : "Optimizing Routes"}
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mb-6 leading-relaxed">
            {isCompleted
              ? "Your optimal routes have been generated. Redirecting now..."
              : "Generating optimal route sequences and driver assignments. This may take a moment."}
          </p>

          {/* Simple Clean Progress Line */}
          <div className="w-full max-w-xs">
            <Progress
              percent={isCompleted ? 100 : 70}
              status={isCompleted ? "success" : "active"}
              showInfo={false}
              strokeColor={{
                "0%": "#059669",
                "100%": "#003220",
              }}
              size={["100%", 6]}
              className="m-0"
            />
          </div>
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
            initialValues={{
              optimization_logic: "minimum_time",
              ...(hasMixedDates ? { scheduled_date: dayjs() } : {}),
            }}
          >
            {/* 1st Row: Route Name & Scheduled Date */}
            <Row gutter={16}>
              <Col span={hasMixedDates ? 14 : 24}>
                <Form.Item
                  name="route_name"
                  label="Route Name"
                  rules={[
                    { required: true, message: "Please enter a route name" },
                  ]}
                >
                  <Input placeholder="Enter route name" />
                </Form.Item>
              </Col>
              {hasMixedDates && (
                <Col span={10}>
                  <Form.Item
                    name="scheduled_date"
                    label="Scheduled Date"
                    rules={[
                      { required: true, message: "Please select a date" },
                    ]}
                    tooltip="All selected jobs will be updated to this date"
                  >
                    <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
                  </Form.Item>
                </Col>
              )}
            </Row>

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
                  <Select
                    placeholder="Select depot"
                    dropdownRender={(menu) => (
                      <>
                        {menu}
                        <Divider style={{ margin: "8px 0" }} />
                        <Space style={{ padding: "0 8px 8px" }}>
                          <Button
                            size="small"
                            type="text"
                            icon={<PlusOutlined />}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setShowDepotModal(true);
                            }}
                          >
                            Add New Depot
                          </Button>
                        </Space>
                      </>
                    )}
                  >
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
                dropdownRender={(menu) => (
                  <>
                    {menu}
                    <Divider style={{ margin: "8px 0" }} />
                    <Space style={{ padding: "0 8px 8px" }}>
                      <Button
                        size="small"
                        type="text"
                        icon={<PlusOutlined />}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowTeamModal(true);
                        }}
                        style={{ width: "100%", textAlign: "left" }}
                      >
                        Add New Team Member
                      </Button>
                    </Space>
                  </>
                )}
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
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={isSubmitting || isPolling}
                disabled={isSubmitting || isPolling}
              >
                Create and Optimize Route
              </Button>
            </Form.Item>
          </Form>
        </>
      )}

      {/* Quick Action: Add Depot Modal */}
      <Modal
        title="Add New Depot"
        open={showDepotModal}
        onCancel={() => setShowDepotModal(false)}
        footer={null}
        width={700}
        centered
        destroyOnHidden
        styles={{ body: { overflow: "hidden", height: "450px" } }}
      >
        <DepotForm
          onSubmit={async (values: DepotPayload) => {
            const success = await createDepot(values);
            if (success) {
              setShowDepotModal(false);
              // Get the newly created depot (last one in list)
              const newDepot = useDepotStore.getState().depots.slice(-1)[0];
              if (newDepot) {
                form.setFieldValue("depot_id", newDepot.id);
              }
            }
            return success;
          }}
          isLoading={isDepotSaving}
          onCancel={() => setShowDepotModal(false)}
        />
      </Modal>

      {/* Quick Action: Add Team Member Modal */}
      <Modal
        title="Add New Team Member"
        open={showTeamModal}
        onCancel={() => setShowTeamModal(false)}
        footer={null}
        width={900}
        centered
        destroyOnHidden
        styles={{ body: { overflow: "hidden", height: "80vh" } }}
      >
        <div style={{ height: "100%" }}>
          <TeamMemberForm
            onSubmit={async () => {
              setShowTeamModal(false);
              // Get the newly created team member (first one in list, newest)
              const newTeam = useTeamStore.getState().teams[0];
              if (newTeam) {
                const currentTeamIds = form.getFieldValue("team_ids") || [];
                form.setFieldValue("team_ids", [...currentTeamIds, newTeam.id]);
              }
            }}
          />
        </div>
      </Modal>
    </Modal>
  );
};

export default CreateRouteModal;
