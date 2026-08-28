import React, { useState } from "react";
import { Tag, Button, App, message, Input, InputNumber, TimePicker } from "antd";
import {
  CloseOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  EditOutlined,
  SaveOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import {
  User,
  Users,
  MapPin,
  Clock,
  Building2,
  Phone,
  Mail,
  Flag,
  Calendar,
  Timer,
  FileText,
  Activity,
  Repeat,
  Hash,
  Navigation,
  Fingerprint,
  ArrowRightLeft,
  Tag as TagIcon,
} from "lucide-react";
import dayjs from "dayjs";
import type { Job, JobStatus } from "@/types/job.type";
import { STATUS_COLORS, formatJobTypeLabel } from "@/utils/jobs.utils";
import { updateJobStatus, updateJob } from "@/apis/jobs.api";
import { useJobsStore } from "@/store/jobs.store";
import { useRouteStore } from "@/store/routes.store";

interface JobDetailsCardProps {
  stopData: any | null;
  job: Job | null;
  stopIndex?: number;
  driverName?: string;
  leg?: string;
  onClose: () => void;
  onRemoveJob?: () => void;
  onJobSaved?: () => void;
}

/** Pickup / drop-off / depot / break badge shown in the card header. */
const STOP_TYPE_BADGES: Record<string, { label: string; className: string }> = {
  pickup: {
    label: "Pickup",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  dropoff: {
    label: "Drop-off",
    className: "bg-sky-50 text-sky-700 border-sky-200",
  },
  drop_off: {
    label: "Drop-off",
    className: "bg-sky-50 text-sky-700 border-sky-200",
  },
  depot: {
    label: "Depot",
    className: "bg-slate-100 text-slate-700 border-slate-200",
  },
  depot_start: {
    label: "Depot Start",
    className: "bg-slate-100 text-slate-700 border-slate-200",
  },
  depot_end: {
    label: "Depot End",
    className: "bg-slate-100 text-slate-700 border-slate-200",
  },
  break: {
    label: "Break",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
};

const LEG_LABELS: Record<string, string> = {
  GO: "Go",
  RETURN: "Return",
};

const Field: React.FC<{
  icon: React.ReactNode;
  label: string;
  valueClassName?: string;
  children: React.ReactNode;
}> = ({ icon, label, valueClassName, children }) => (
  <div className="flex flex-col gap-0.5">
    <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-900">
      {icon}
      <span>{label}</span>
    </div>
    <div
      className={
        valueClassName ?? "text-xs text-gray-600 font-medium truncate pl-4.5"
      }
    >
      {children}
    </div>
  </div>
);

const JobDetailsCard: React.FC<JobDetailsCardProps> = ({
  stopData,
  job,
  stopIndex = 0,
  driverName,
  leg,
  onClose,
  onRemoveJob,
  onJobSaved,
}) => {
  const { patchJobLocally } = useJobsStore();
  const { modal } = App.useApp();
  const { fetchRoutes, selectedStatus } = useRouteStore();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [jobSaved, setJobSaved] = useState(false);

  if (!stopData && !job) return null;

  const jobId = job?.id || stopData?.job_id;
  const status = job?.status || stopData?.status || "assigned";
  const priority = (
    job?.priority_level ||
    (job as any)?.priority ||
    "medium"
  ).toLowerCase();

  // ── Edit state initialised from current job values ──────────────────────
  const [editValues, setEditValues] = useState({
    time_window_start: job?.time_window_start ?? "",
    time_window_end: job?.time_window_end ?? "",
    service_duration: job?.service_duration ?? 0,
    client_pick_up_time:
      (job?.worker_shuttle_detail as any)?.client_pick_up_time ??
      job?.client_pick_up_time ??
      "",
    reach_before_minutes:
      (job?.worker_shuttle_detail as any)?.reach_before_minutes ??
      job?.reach_before_minutes ??
      10,
  });

  const stopType = String(stopData?.stop_type || "").toLowerCase();
  const isDepotStop = stopType.includes("depot");
  const isPickupStop = stopType === "pickup";
  const isDropoffStop = stopType === "dropoff" || stopType === "drop_off";
  const stopBadge = STOP_TYPE_BADGES[stopType];

  // Worker-shuttle jobs carry a different field set, and each job appears twice
  // in the route (once as a pickup stop, once as a drop-off stop).
  const isShuttle =
    job?.template_type === "worker_shuttle" ||
    Boolean(job?.worker_shuttle_detail) ||
    isPickupStop ||
    isDropoffStop;

  const arrivalTime = stopData?.arrival_time
    ? dayjs(stopData.arrival_time).format("hh:mm A")
    : "--:--";
  const serviceDuration =
    stopData?.service_duration_minutes || job?.service_duration || 0;

  const customerName =
    job?.first_name || job?.last_name
      ? `${job.first_name || ""} ${job.last_name || ""}`.trim()
      : (job as any)?.customer_name || "-";
  const phone = job?.phone_number || (job as any)?.customer_phone || "-";
  const email = job?.email || (job as any)?.customer_email || "-";
  const companyName = job?.business_name || "-";
  const timeWindow =
    job?.time_window_start && job?.time_window_end
      ? `${job.time_window_start} - ${job.time_window_end}`
      : "-";

  const driverLabel = driverName
    ? driverName.split(" ")[0].toUpperCase()
    : "DR1";

  /**
   * Shuttle values arrive flattened on the job, nested under
   * `worker_shuttle_detail`, or inside `custom_fields` depending on how the job
   * was created (form, bulk upload, or written back by the optimizer).
   */
  const shuttleValue = (...keys: string[]): string | undefined => {
    for (const key of keys) {
      const candidates = [
        (job as any)?.[key],
        (job?.worker_shuttle_detail as any)?.[key],
        (job?.custom_fields as any)?.[key],
      ];
      const hit = candidates.find(
        (v) => v !== undefined && v !== null && v !== "",
      );
      if (hit !== undefined) return String(hit);
    }
    return undefined;
  };

  const dash = (value?: string | number | null) =>
    value === undefined || value === null || value === "" ? "-" : String(value);

  const tripType = job?.job_type || shuttleValue("pickup_type");
  const isReturnTrip = String(tripType || "").toLowerCase() === "return_only";

  const candidateName = shuttleValue("candidate_name");
  const candidatePhone = shuttleValue("candidate_phone");
  const candidateId = shuttleValue("candidate_id");
  const passengerName = shuttleValue("client_name", "first_name");
  const passengerPhone = shuttleValue("client_phone", "phone_number");
  const clientId = shuttleValue("client_id");
  const quantId = shuttleValue("quant_id", "quart_id");
  const pickUpAddress = shuttleValue(
    "pick_up_address",
    "go_pickup_point",
    "candidate_address",
  );
  const dropOffAddress = shuttleValue(
    "drop_off_address",
    "return_dropoff_point",
    "client_address",
  );
  // Return trips are scheduled off the shift end hour, one-way/round trips off
  // the start hour — mirrors the Client Pickup Time column on the jobs grid.
  const clientPickUpTime = isReturnTrip
    ? shuttleValue("end_hour", "client_pick_up_time", "start_hour")
    : shuttleValue("client_pick_up_time", "start_hour", "end_hour");
  const candidatePickupEta = shuttleValue(
    "candidate_pickup_eta",
    "go_pickup_time_output",
    "return_pickup_time_output",
  );
  const reachBeforeMinutes =
    job?.reach_before_minutes ??
    (job?.worker_shuttle_detail as any)?.reach_before_minutes ??
    (job?.custom_fields as any)?.reach_before_minutes;
  const reachWindow =
    reachBeforeMinutes === undefined || reachBeforeMinutes === null
      ? "-"
      : `${Number(reachBeforeMinutes) > 0 ? "+" : ""}${reachBeforeMinutes}m`;

  const notes = isShuttle
    ? dash(
        shuttleValue("notes", "additional_notes", "dress_code") ||
          job?.additional_notes,
      )
    : job?.additional_notes || (job as any)?.notes || "-";

  // Prefer the address the optimizer resolved for this specific stop, so a
  // drop-off stop shows the drop-off address rather than the pickup address.
  const address =
    (isShuttle
      ? stopData?.address_formatted ||
        (isPickupStop ? pickUpAddress : undefined) ||
        (isDropoffStop ? dropOffAddress : undefined)
      : job?.address_formatted || stopData?.address_formatted) ||
    job?.address_formatted ||
    stopData?.address_formatted ||
    "Address not specified";

  const stopAddressLabel = isPickupStop
    ? "Pickup Address"
    : isDropoffStop
      ? "Drop-off Address"
      : "Address";

  const getPriorityBadgeClass = (p: string) => {
    switch (p) {
      case "high":
      case "urgent":
        return "bg-red-50 text-red-700 border-red-200";
      case "medium":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "low":
        return "bg-slate-100 text-slate-700 border-slate-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!jobId) return;

    const isComplete = newStatus === "completed";
    modal.confirm({
      title: isComplete ? "Mark Job as Completed?" : "Skip this Job?",
      content: isComplete
        ? `Are you sure you want to mark Job #${jobId} as completed?`
        : `Are you sure you want to skip Job #${jobId}?`,
      okText: isComplete ? "Mark Completed" : "Skip Job",
      okType: isComplete ? "primary" : "danger",
      onOk: async () => {
        try {
          setIsUpdating(true);
          const updated = await updateJobStatus(jobId, newStatus);
          patchJobLocally(updated);
          await fetchRoutes(selectedStatus);
          message.success(
            isComplete ? "Job marked as completed" : "Job skipped",
          );
          onClose();
        } catch (err) {
          message.error("Failed to update job status");
        } finally {
          setIsUpdating(false);
        }
      },
    });
  };

  const handleSaveJob = async () => {
    if (!job || !jobId) return;
    try {
      setIsSaving(true);
      const payload: any = { ...job };
      if (isShuttle) {
        payload.worker_shuttle_detail = {
          ...(job.worker_shuttle_detail ?? {}),
          client_pick_up_time: editValues.client_pick_up_time || undefined,
          reach_before_minutes: editValues.reach_before_minutes,
        };
      } else {
        payload.time_window_start = editValues.time_window_start || undefined;
        payload.time_window_end = editValues.time_window_end || undefined;
        payload.service_duration = editValues.service_duration;
      }
      const updated = await updateJob(payload);
      patchJobLocally(updated);
      setIsEditing(false);
      setJobSaved(true);
      message.success("Job updated — click Re-Optimize to apply changes");
      onJobSaved?.();
    } catch (err) {
      message.error("Failed to save job");
    } finally {
      setIsSaving(false);
    }
  };

  const statusField = (
    <Field
      icon={<Activity size={13} className="text-gray-400 shrink-0" />}
      label="Status"
      valueClassName="pl-4.5 pt-0.5"
    >
      <Tag
        color={STATUS_COLORS[status as JobStatus] || "blue"}
        className="capitalize font-semibold border-none text-[10.5px] px-2 py-0.5 m-0 rounded"
      >
        {(status || "assigned").replace("_", " ")}
      </Tag>
    </Field>
  );

  const arrivalField = (
    <Field
      icon={<Clock size={13} className="text-gray-400 shrink-0" />}
      label="ETA / Arrival"
      valueClassName="text-xs text-gray-900 font-bold pl-4.5"
    >
      {arrivalTime}
    </Field>
  );

  const notesField = (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-900">
        <FileText size={13} className="text-gray-400 shrink-0" />
        <span>Notes</span>
      </div>
      <div className="text-xs text-gray-700 leading-relaxed break-words bg-gray-50/80 p-2.5 border border-gray-200 rounded text-[11.5px] ml-4.5">
        {notes}
      </div>
    </div>
  );

  return (
    <div className="absolute top-3 right-3 z-50 w-88 h-[calc(78%-24px)] max-h-[600px] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col overflow-hidden text-xs transition-all animate-in fade-in slide-in-from-right-4 duration-200">
      {/* Header */}
      <div className="p-3.5 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="font-bold text-gray-900 text-sm truncate">
            {isDepotStop
              ? "Depot Station"
              : `Stop No - ${stopIndex} (${driverLabel})`}
          </div>
          {stopBadge && !isDepotStop && (
            <span
              className={`shrink-0 text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 border rounded ${stopBadge.className}`}
            >
              {stopBadge.label}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Edit / Save / Cancel toggle — only for job stops, not depot */}
          {!isDepotStop && job && (
            isEditing ? (
              <>
                <button
                  onClick={handleSaveJob}
                  disabled={isSaving}
                  title="Save changes"
                  className="text-green-600 hover:text-green-800 transition-colors p-1 rounded hover:bg-green-50 cursor-pointer disabled:opacity-50"
                >
                  <SaveOutlined className="text-sm" />
                </button>
                <button
                  onClick={() => { setIsEditing(false); }}
                  title="Cancel edit"
                  className="text-gray-400 hover:text-gray-700 transition-colors p-1 rounded hover:bg-gray-100 cursor-pointer"
                >
                  <CloseOutlined className="text-sm" />
                </button>
              </>
            ) : (
              <button
                onClick={() => { setIsEditing(true); setJobSaved(false); }}
                title="Edit job"
                className="text-gray-400 hover:text-[#003220] transition-colors p-1 rounded hover:bg-gray-100 cursor-pointer"
              >
                <EditOutlined className="text-sm" />
              </button>
            )
          )}
          {onRemoveJob && !isDepotStop && (
            <button
              onClick={onRemoveJob}
              title="Remove from Route"
              className="text-red-500 hover:text-red-700 transition-colors p-1 rounded hover:bg-red-50 cursor-pointer"
            >
              <DeleteOutlined className="text-sm" />
            </button>
          )}
          <button
            onClick={onClose}
            title="Close"
            className="text-gray-400 hover:text-gray-700 transition-colors p-1 rounded hover:bg-gray-100 cursor-pointer"
          >
            <CloseOutlined className="text-sm" />
          </button>
        </div>
      </div>

      {/* Scrollable Key-Value Grid */}
      <div className="p-3.5 space-y-3 flex-1 overflow-y-auto custom-scrollbar">
        {isShuttle ? (
          <>
            {/* Row 1: Candidate Name & Status */}
            <div className="grid grid-cols-2 gap-3 border-b border-gray-100 pb-3">
              <Field
                icon={<User size={13} className="text-gray-400 shrink-0" />}
                label="Candidate Name"
              >
                {dash(candidateName)}
              </Field>
              {statusField}
            </div>

            {/* Row 2: This stop's address & ETA / Arrival */}
            <div className="grid grid-cols-2 gap-3 border-b border-gray-100 pb-3">
              <Field
                icon={
                  isDropoffStop ? (
                    <Flag size={13} className="text-gray-400 shrink-0" />
                  ) : (
                    <Navigation size={13} className="text-gray-400 shrink-0" />
                  )
                }
                label={stopAddressLabel}
                valueClassName="text-xs text-gray-600 font-medium leading-snug line-clamp-2 pl-4.5"
              >
                {address}
              </Field>
              {arrivalField}
            </div>

            {/* Row 3: Candidate Phone & Candidate ID */}
            <div className="grid grid-cols-2 gap-3 border-b border-gray-100 pb-3">
              <Field
                icon={<Phone size={13} className="text-gray-400 shrink-0" />}
                label="Candidate Phone"
              >
                {dash(candidatePhone)}
              </Field>
              <Field
                icon={
                  <Fingerprint size={13} className="text-gray-400 shrink-0" />
                }
                label="Candidate ID"
              >
                {dash(candidateId)}
              </Field>
            </div>

            {/* Row 4: Passenger Name & Passenger Phone */}
            <div className="grid grid-cols-2 gap-3 border-b border-gray-100 pb-3">
              <Field
                icon={<Users size={13} className="text-gray-400 shrink-0" />}
                label="Client Name"
              >
                {dash(passengerName)}
              </Field>
              <Field
                icon={<Phone size={13} className="text-gray-400 shrink-0" />}
                label="Client Phone"
              >
                {dash(passengerPhone)}
              </Field>
            </div>

            {/* Row 5: Trip Type & Quant / Shift Ref */}
            <div className="grid grid-cols-2 gap-3 border-b border-gray-100 pb-3">
              <Field
                icon={<Repeat size={13} className="text-gray-400 shrink-0" />}
                label="Trip Type"
              >
                {tripType ? formatJobTypeLabel(tripType) : "-"}
              </Field>
              <Field
                icon={<Hash size={13} className="text-gray-400 shrink-0" />}
                label="Quant / Shift Ref"
              >
                {dash(quantId)}
              </Field>
            </div>

            {/* Row 6: Client Pick Up Time & Candidate Pickup ETA */}
            <div className="grid grid-cols-2 gap-3 border-b border-gray-100 pb-3">
              <Field
                icon={<Calendar size={13} className="text-gray-400 shrink-0" />}
                label="Client Pick Up Time"
              >
                {dash(clientPickUpTime)}
              </Field>
              <Field
                icon={<Clock size={13} className="text-gray-400 shrink-0" />}
                label="Candidate Pickup ETA"
              >
                {dash(candidatePickupEta)}
              </Field>
            </div>

            {/* Row 7: Reach Window & Client / Worker ID */}
            <div className="grid grid-cols-2 gap-3 border-b border-gray-100 pb-3">
              <Field
                icon={<Timer size={13} className="text-gray-400 shrink-0" />}
                label="Reach Window"
              >
                {reachWindow}
              </Field>
              <Field
                icon={<TagIcon size={13} className="text-gray-400 shrink-0" />}
                label="Client / Worker ID"
              >
                {dash(clientId)}
              </Field>
            </div>

            {/* Row 8: Full journey — Pick Up & Drop Off addresses */}
            <div className="grid grid-cols-2 gap-3 border-b border-gray-100 pb-3">
              <Field
                icon={
                  <Navigation size={13} className="text-gray-400 shrink-0" />
                }
                label="Pick Up Address"
                valueClassName="text-xs text-gray-600 font-medium leading-snug line-clamp-2 pl-4.5"
              >
                {dash(pickUpAddress)}
              </Field>
              <Field
                icon={<Flag size={13} className="text-gray-400 shrink-0" />}
                label="Drop Off Address"
                valueClassName="text-xs text-gray-600 font-medium leading-snug line-clamp-2 pl-4.5"
              >
                {dash(dropOffAddress)}
              </Field>
            </div>

            {/* Row 9: Driver & Trip Leg */}
            <div className="grid grid-cols-2 gap-3 border-b border-gray-100 pb-3">
              <Field
                icon={<User size={13} className="text-gray-400 shrink-0" />}
                label="Driver"
              >
                {dash(driverName)}
              </Field>
              <Field
                icon={
                  <ArrowRightLeft
                    size={13}
                    className="text-gray-400 shrink-0"
                  />
                }
                label="Trip Leg"
              >
                {leg ? LEG_LABELS[leg.toUpperCase()] || leg : "-"}
              </Field>
            </div>

            {/* Row 10: Notes */}
            {notesField}
          </>
        ) : (
          <>
            {/* Row 1: Contact Name & Status */}
            <div className="grid grid-cols-2 gap-3 border-b border-gray-100 pb-3">
              <Field
                icon={<User size={13} className="text-gray-400 shrink-0" />}
                label="Contact Name"
              >
                {customerName}
              </Field>
              {statusField}
            </div>

            {/* Row 2: Address & ETA / Arrival */}
            <div className="grid grid-cols-2 gap-3 border-b border-gray-100 pb-3">
              <Field
                icon={<MapPin size={13} className="text-gray-400 shrink-0" />}
                label="Address"
                valueClassName="text-xs text-gray-600 font-medium leading-snug line-clamp-2 pl-4.5"
              >
                {address}
              </Field>
              {arrivalField}
            </div>

            {/* Row 3: Company Name & Phone */}
            <div className="grid grid-cols-2 gap-3 border-b border-gray-100 pb-3">
              <Field
                icon={
                  <Building2 size={13} className="text-gray-400 shrink-0" />
                }
                label="Company Name"
              >
                {companyName}
              </Field>
              <Field
                icon={<Phone size={13} className="text-gray-400 shrink-0" />}
                label="Phone"
              >
                {phone}
              </Field>
            </div>

            {/* Row 4: Email & Priority */}
            <div className="grid grid-cols-2 gap-3 border-b border-gray-100 pb-3">
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-900">
                  <Mail size={13} className="text-gray-400 shrink-0" />
                  <span>Email</span>
                </div>
                <div
                  className="text-xs text-gray-600 font-medium truncate pl-4.5"
                  title={email}
                >
                  {email}
                </div>
              </div>

              <Field
                icon={<Flag size={13} className="text-gray-400 shrink-0" />}
                label="Priority"
                valueClassName="pl-4.5 pt-0.5"
              >
                <span
                  className={`inline-block text-[10.5px] font-bold capitalize px-2 py-0.5 border rounded ${getPriorityBadgeClass(
                    priority,
                  )}`}
                >
                  {priority}
                </span>
              </Field>
            </div>

            {/* Row 5: Time Window & Service Duration */}
            <div className="grid grid-cols-2 gap-3 border-b border-gray-100 pb-3">
              <Field
                icon={<Calendar size={13} className="text-gray-400 shrink-0" />}
                label="Time Window"
              >
                {timeWindow}
              </Field>
              <Field
                icon={<Timer size={13} className="text-gray-400 shrink-0" />}
                label="Service Duration"
              >
                {serviceDuration} min
              </Field>
            </div>

            {/* Row 6: Notes */}
            {notesField}
          </>
        )}
      </div>

      {/* Quick Action Footer */}
      {!isDepotStop && (
        <div className="p-3 bg-gray-50 border-t border-gray-100 flex flex-col gap-2 shrink-0">
          {/* Edit form fields (shown in edit mode) */}
          {isEditing && (
            <div className="space-y-2 bg-white border border-amber-200 rounded p-2.5 text-xs">
              <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-1">Edit Timing Fields</div>
              {isShuttle ? (
                <>
                  <div>
                    <div className="text-[10px] text-gray-500 mb-0.5">Client Pick-Up Time (HH:MM)</div>
                    <Input
                      size="small"
                      placeholder="e.g. 08:30"
                      value={editValues.client_pick_up_time}
                      onChange={(e) => setEditValues(v => ({ ...v, client_pick_up_time: e.target.value }))}
                      className="text-xs"
                    />
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-500 mb-0.5">Reach Before (minutes)</div>
                    <InputNumber
                      size="small"
                      className="w-full text-xs"
                      value={editValues.reach_before_minutes}
                      onChange={(val) => setEditValues(v => ({ ...v, reach_before_minutes: val ?? 0 }))}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <div className="text-[10px] text-gray-500 mb-0.5">Time Window Start (HH:MM)</div>
                    <Input
                      size="small"
                      placeholder="e.g. 09:00"
                      value={editValues.time_window_start}
                      onChange={(e) => setEditValues(v => ({ ...v, time_window_start: e.target.value }))}
                      className="text-xs"
                    />
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-500 mb-0.5">Time Window End (HH:MM)</div>
                    <Input
                      size="small"
                      placeholder="e.g. 17:00"
                      value={editValues.time_window_end}
                      onChange={(e) => setEditValues(v => ({ ...v, time_window_end: e.target.value }))}
                      className="text-xs"
                    />
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-500 mb-0.5">Service Duration (min)</div>
                    <InputNumber
                      size="small"
                      className="w-full text-xs"
                      min={0}
                      value={editValues.service_duration}
                      onChange={(val) => setEditValues(v => ({ ...v, service_duration: val ?? 0 }))}
                    />
                  </div>
                </>
              )}
              <Button
                type="primary"
                size="small"
                icon={<SaveOutlined />}
                loading={isSaving}
                onClick={handleSaveJob}
                className="w-full bg-[#003220] text-xs font-semibold h-7 mt-1"
              >
                Save Changes
              </Button>
            </div>
          )}

          {/* Job-saved banner — prompts user to re-optimize */}
          {jobSaved && !isEditing && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded px-2.5 py-1.5 text-[11px] text-amber-800">
              <ReloadOutlined className="shrink-0" />
              <span className="flex-1">Job updated. Re-Optimize the route to apply changes.</span>
            </div>
          )}

          {/* Status action buttons */}
          {!isEditing && (
            <div className="flex gap-2">
              <Button
                type="primary"
                size="small"
                icon={<CheckCircleOutlined />}
                loading={isUpdating}
                disabled={status === "completed"}
                onClick={() => handleUpdateStatus("completed")}
                className="w-1/2 bg-[#003220] hover:bg-[#002417] text-xs font-semibold h-8"
              >
                Mark Completed
              </Button>
              <Button
                type="default"
                size="small"
                disabled={status === "skipped" || status === "failed"}
                onClick={() => handleUpdateStatus("failed")}
                className="w-1/2 text-xs font-semibold h-8"
              >
                Skip Stop
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default JobDetailsCard;
