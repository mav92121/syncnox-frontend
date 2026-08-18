"use client";

import {
  Modal,
  Form,
  Select,
  Button,
  Row,
  Col,
  Divider,
  Space,
  Progress,
  Flex,
  Tag,
} from "antd";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Route,
  Users,
  Clock,
  Car,
} from "lucide-react";
import { PlusOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import { useDepotStore } from "@/store/depots.store";
import { useTeamStore } from "@/store/team.store";
import { useTransportJobsStore } from "@/store/transportJobs.store";
import { useTransportOptimizationStore } from "@/store/transportOptimization.store";
import type { TransportLeg, LegOptimizationResult, LegAssignment } from "@/apis/transport.api";
import DepotForm from "@/app/depot/_components/DepotForm";
import TeamMemberForm from "@/app/team/_components/TeamMemberForm";
import type { DepotPayload } from "@/apis/depots.api";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface Props {
  open: boolean;
  onClose: () => void;
  scheduledDate: string; // YYYY-MM-DD — pre-filled, readonly
}

type Phase = "form" | "optimizing" | "results";

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

/** Compact table showing per-job assignments for one leg */
const AssignmentTable = ({ assignments }: { assignments: LegAssignment[] }) => {
  if (assignments.length === 0) return null;
  return (
    <div className="mt-2 border border-gray-200 divide-y divide-gray-100 text-xs">
      {/* Header */}
      <div className="grid grid-cols-3 bg-gray-50 px-3 py-1.5 font-semibold text-gray-500 uppercase tracking-wide text-[10px]">
        <span>Job #</span>
        <span>Driver</span>
        <span>Pickup Time</span>
      </div>
      {assignments.map((a) => (
        <div
          key={a.transport_job_id}
          className="grid grid-cols-3 px-3 py-2 items-center hover:bg-gray-50 transition-colors"
        >
          <span className="text-gray-800 font-medium">#{a.transport_job_id}</span>
          <span className="text-gray-700 flex items-center gap-1 truncate">
            <Car size={11} className="text-gray-400 shrink-0" />
            {a.driver_name}
          </span>
          <span className="text-emerald-700 font-semibold flex items-center gap-1">
            <Clock size={11} className="text-emerald-500 shrink-0" />
            {a.pickup_time}
          </span>
        </div>
      ))}
    </div>
  );
};

/** Summary card for a single leg's optimization result */
const LegResultCard = ({
  leg,
  result,
}: {
  leg: "GO" | "RETURN";
  result: LegOptimizationResult;
}) => {
  const isSuccess = result.status === "completed";
  const isNoSolution = result.status === "no_solution";
  const hasFailed = result.status === "failed";

  const bgClass = isSuccess
    ? "bg-emerald-50 border-emerald-200"
    : isNoSolution
    ? "bg-amber-50 border-amber-200"
    : "bg-rose-50 border-rose-200";

  const distKm = (result.total_distance_meters / 1000).toFixed(1);
  const durMin = Math.round(result.total_duration_seconds / 60);

  return (
    <div className={`border rounded-none p-3 ${bgClass}`}>
      {/* Leg header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-none ${
              leg === "GO"
                ? "bg-blue-100 text-blue-700"
                : "bg-purple-100 text-purple-700"
            }`}
          >
            {leg === "GO" ? "↗ GO Leg" : "↙ RETURN Leg"}
          </span>
          {isSuccess && (
            <CheckCircle2 size={15} className="text-emerald-600" />
          )}
          {isNoSolution && (
            <AlertTriangle size={15} className="text-amber-600" />
          )}
          {hasFailed && (
            <AlertCircle size={15} className="text-rose-600" />
          )}
        </div>

        {/* Stats chips */}
        {isSuccess && (
          <div className="flex items-center gap-2 text-[10px] text-gray-500">
            <span>{distKm} km</span>
            <span className="text-gray-300">|</span>
            <span>{durMin} min</span>
          </div>
        )}
      </div>

      {/* Status row */}
      {hasFailed ? (
        <p className="text-xs text-rose-700 font-medium">
          {result.error || "Optimization failed for this leg."}
        </p>
      ) : isNoSolution ? (
        <p className="text-xs text-amber-700 font-medium">
          No feasible solution found. Try adding more drivers or relaxing time windows.
        </p>
      ) : (
        <>
          {/* Assigned / Unassigned counts */}
          <div className="flex items-center gap-3 mb-2">
            <Tag
              color="green"
              className="text-xs font-semibold rounded-none m-0"
            >
              ✓ {result.assigned} assigned
            </Tag>
            {result.unassigned > 0 && (
              <Tag
                color="orange"
                className="text-xs font-semibold rounded-none m-0"
              >
                ⚠ {result.unassigned} unassigned
              </Tag>
            )}
          </div>

          {/* Unassigned IDs */}
          {result.unassigned_job_ids.length > 0 && (
            <div className="mb-2 text-[11px] text-amber-800 bg-amber-50 border border-amber-200 px-2 py-1.5">
              <span className="font-semibold">Unassigned job IDs: </span>
              {result.unassigned_job_ids.join(", ")}
            </div>
          )}

          {/* Assignment table */}
          <AssignmentTable assignments={result.assignments} />
        </>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// Main Modal
// ─────────────────────────────────────────────

const CreateTransportRouteModal = ({ open, onClose, scheduledDate }: Props) => {
  const [form] = Form.useForm();
  const [phase, setPhase] = useState<Phase>("form");

  const { depots, createDepot, isSaving: isDepotSaving, initializeDepots } = useDepotStore();
  const { teams, initializeTeams } = useTeamStore();
  const { fetchTransportJobs } = useTransportJobsStore();
  const { result, isOptimizing, error, optimize, clearResult } = useTransportOptimizationStore();

  // Quick-add sub-modals
  const [showDepotModal, setShowDepotModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);

  // Initialise data when modal opens
  useEffect(() => {
    if (open) {
      initializeDepots();
      initializeTeams();
      clearResult();
      setPhase("form");
      form.setFieldsValue({ leg: "BOTH" });
    }
  }, [open, initializeDepots, initializeTeams, clearResult, form]);

  // Transition to results phase when optimization completes
  useEffect(() => {
    if (result && !isOptimizing) {
      setPhase("results");
    }
  }, [result, isOptimizing]);

  // ── Handlers ──────────────────────────────

  const handleFinish = async (values: {
    depot_id: number;
    driver_ids: number[];
    leg: TransportLeg;
  }) => {
    setPhase("optimizing");
    try {
      await optimize({
        scheduled_date: scheduledDate,
        depot_id: values.depot_id,
        driver_ids: values.driver_ids,
        leg: values.leg,
      });
      // Auto-refresh transport jobs so table shows updated assignments
      fetchTransportJobs(scheduledDate);
    } catch {
      // Error is already stored in the store; keep optimizing phase
      // so the results panel can show the error
      setPhase("results");
    }
  };

  const handleClose = () => {
    clearResult();
    form.resetFields();
    setPhase("form");
    onClose();
  };

  const handleRetry = () => {
    clearResult();
    setPhase("form");
  };

  // ── Derived state ──────────────────────────

  const legsInResult = result
    ? (Object.entries(result.results) as ["GO" | "RETURN", LegOptimizationResult][])
    : [];

  const overallSuccess =
    legsInResult.length > 0 &&
    legsInResult.every(([, r]) => r.status === "completed");

  const totalAssigned = legsInResult.reduce((s, [, r]) => s + (r.assigned || 0), 0);
  const totalUnassigned = legsInResult.reduce((s, [, r]) => s + (r.unassigned || 0), 0);

  // ── Render ─────────────────────────────────

  return (
    <>
      <Modal
        centered
        footer={null}
        title={
          <span className="text-base font-bold text-gray-900">
            Optimize Transport Routes
          </span>
        }
        open={open}
        onCancel={phase === "optimizing" ? undefined : handleClose}
        closable={phase !== "optimizing"}
        maskClosable={phase === "form"}
        width={620}
        className="create-transport-route-modal"
        styles={{
          body: { borderRadius: 0 },
          mask: { backdropFilter: "blur(4px)" },
        }}
      >
        {/* ── Phase: Optimizing ─────────────────── */}
        {phase === "optimizing" && (
          <div className="py-10 px-4 flex flex-col items-center justify-center text-center">
            {/* Animated spinner — identical to delivery modal */}
            <div className="relative mb-6 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-dashed border-emerald-600/50 animate-spin flex items-center justify-center" />
              <div className="absolute w-11 h-11 rounded-full bg-[#003220] text-white flex items-center justify-center shadow-md">
                <Route size={20} className="animate-pulse text-white" />
              </div>
            </div>

            <h3 className="text-base font-bold text-gray-900 mb-1.5">
              Optimizing Transport Routes
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mb-6 leading-relaxed">
              Running OR-Tools VRP solver with capacity, time-window, and driver
              constraints. This usually takes a few seconds.
            </p>

            <div className="w-full max-w-xs">
              <Progress
                percent={70}
                status="active"
                showInfo={false}
                strokeColor={{ "0%": "#059669", "100%": "#003220" }}
                size={["100%", 6]}
                className="m-0"
              />
            </div>
          </div>
        )}

        {/* ── Phase: Results ────────────────────── */}
        {phase === "results" && (
          <div className="py-4 px-1 flex flex-col gap-4">
            {/* Header summary */}
            {error ? (
              <div className="flex flex-col items-center text-center py-4">
                <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mb-3">
                  <AlertCircle size={24} />
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">
                  Optimization Failed
                </h3>
                <p className="text-xs text-gray-500 max-w-md leading-relaxed">
                  {error}
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-3 px-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    overallSuccess
                      ? "bg-emerald-50 border border-emerald-200"
                      : "bg-amber-50 border border-amber-200"
                  }`}
                >
                  {overallSuccess ? (
                    <CheckCircle2 size={20} className="text-emerald-600" />
                  ) : (
                    <AlertTriangle size={20} className="text-amber-600" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 leading-snug">
                    {overallSuccess
                      ? "Optimization Complete"
                      : "Optimization Completed with Warnings"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {scheduledDate} &nbsp;·&nbsp;
                    <span className="text-emerald-700 font-semibold">
                      {totalAssigned} assigned
                    </span>
                    {totalUnassigned > 0 && (
                      <>
                        &nbsp;·&nbsp;
                        <span className="text-amber-600 font-semibold">
                          {totalUnassigned} unassigned
                        </span>
                      </>
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* Per-leg result cards */}
            {legsInResult.map(([leg, legResult]) => (
              <LegResultCard key={leg} leg={leg} result={legResult} />
            ))}

            {/* Info: table has been refreshed */}
            {!error && (
              <div className="text-[11px] text-gray-500 text-center leading-relaxed px-2">
                The transport jobs table has been refreshed with updated driver
                and pickup time assignments.
              </div>
            )}

            {/* Action buttons */}
            <Flex gap={10} className="mt-1">
              {error && (
                <Button onClick={handleRetry} className="flex-1 rounded-none">
                  Modify & Retry
                </Button>
              )}
              <Button
                type="primary"
                onClick={handleClose}
                className="flex-1 rounded-none bg-[#003220] hover:bg-[#002417] font-semibold"
              >
                {error ? "Cancel" : "Done"}
              </Button>
            </Flex>
          </div>
        )}

        {/* ── Phase: Form ───────────────────────── */}
        {phase === "form" && (
          <>
            {/* Date badge — read-only */}
            <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-gray-50 border border-gray-200 text-xs text-gray-600">
              <span className="font-semibold text-gray-800">Scheduled Date:</span>
              <span className="font-mono text-emerald-700 font-semibold">
                {scheduledDate}
              </span>
              <span className="ml-auto text-gray-400 text-[10px]">
                All pending jobs on this date will be optimized
              </span>
            </div>

            <Form form={form} layout="vertical" onFinish={handleFinish}>
              {/* Row 1: Leg selector */}
              <Form.Item
                name="leg"
                label="Optimization Scope (Leg)"
                rules={[{ required: true, message: "Please select a leg" }]}
              >
                <Select placeholder="Select leg">
                  <Select.Option value="BOTH">
                    <Flex align="center" gap={6}>
                      <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-none">
                        GO + RETURN
                      </span>
                      <span className="text-xs text-gray-600">
                        Optimize both legs (recommended)
                      </span>
                    </Flex>
                  </Select.Option>
                  <Select.Option value="GO">
                    <Flex align="center" gap={6}>
                      <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-none">
                        GO only
                      </span>
                      <span className="text-xs text-gray-600">
                        Morning pickup (arrive at client ≤ start − 10 min)
                      </span>
                    </Flex>
                  </Select.Option>
                  <Select.Option value="RETURN">
                    <Flex align="center" gap={6}>
                      <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded-none">
                        RETURN only
                      </span>
                      <span className="text-xs text-gray-600">
                        End-of-shift pickup (within 15 min of end hour)
                      </span>
                    </Flex>
                  </Select.Option>
                </Select>
              </Form.Item>

              {/* Row 2: Depot */}
              <Form.Item
                name="depot_id"
                label="Starting Depot"
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

              {/* Row 3: Drivers */}
              <Form.Item
                name="driver_ids"
                label={
                  <Flex align="center" gap={4}>
                    <Users size={13} />
                    <span>Assign Drivers</span>
                  </Flex>
                }
                rules={[
                  {
                    required: true,
                    message: "Please select at least one driver",
                  },
                ]}
              >
                <Select
                  mode="multiple"
                  placeholder="Select drivers for this optimization run"
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
                          Add New Driver
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

              {/* Constraint info box */}
              <div className="bg-gray-50 border border-gray-200 px-3 py-2.5 mb-4 text-[11px] text-gray-600 leading-relaxed space-y-1">
                <div className="font-semibold text-gray-700 text-xs mb-1">
                  Constraints applied automatically:
                </div>
                <div>• <strong>GO deadline</strong>: arrive at client ≤ shift start − 10 min</div>
                <div>• <strong>RETURN window</strong>: pick up within 15 min after shift end</div>
                <div>• <strong>Vehicle capacity</strong>: passenger count respected per vehicle</div>
                <div>• <strong>Round trip</strong>: GO and RETURN drivers may differ</div>
              </div>

              {/* Submit */}
              <Form.Item className="mb-0">
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  className="bg-[#003220] hover:bg-[#002417] font-semibold rounded-none h-9"
                >
                  Run Optimization
                </Button>
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>

      {/* Quick Action: Add Depot */}
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
              const newDepot = useDepotStore.getState().depots.slice(-1)[0];
              if (newDepot) form.setFieldValue("depot_id", newDepot.id);
            }
            return success;
          }}
          isLoading={isDepotSaving}
          onCancel={() => setShowDepotModal(false)}
        />
      </Modal>

      {/* Quick Action: Add Team Member */}
      <Modal
        title="Add New Driver"
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
              const newTeam = useTeamStore.getState().teams[0];
              if (newTeam) {
                const current = form.getFieldValue("driver_ids") || [];
                form.setFieldValue("driver_ids", [...current, newTeam.id]);
              }
            }}
          />
        </div>
      </Modal>
    </>
  );
};

export default CreateTransportRouteModal;
