import { ColDef } from "ag-grid-community";
import { Dropdown, Modal, message } from "antd";
import { EllipsisVertical } from "lucide-react";
import { deleteJob } from "@/apis/jobs.api";
import { Job } from "@/types/job.type";

export const formatTimeWindow = (timeWindow: string | null) => {
  if (!timeWindow) return "";
  const [hours, minutes] = timeWindow.split("T")[1].split(":");
  return `${hours}:${minutes}`;
};

export const priorityStyleMap: Record<string, string> = {
  low: "bg-green-100 text-green-700 border border-green-200 py-1 ",
  medium: "bg-yellow-100 text-yellow-800 border border-yellow-200 py-1 ",
  high: "bg-red-100 text-red-800 border border-red-200 py-1 ",
  default: "bg-gray-100 text-gray-700 border border-gray-200 py-1 ",
};

export const paymentStyleMap: Record<string, string> = {
  paid: "bg-green-100 text-green-700 border border-green-200 py-1.5 ",
  unpaid: "bg-red-100 text-red-800 border border-red-200 py-1.5 ",
  default: "bg-gray-100 text-gray-700 border border-gray-200 py-1.5 ",
};

export const statusStyleMap: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700 border border-gray-200 py-1.5 ",
  assigned: "bg-yellow-100 text-yellow-800 border border-yellow-200 py-1.5 ",
  in_transit: "bg-blue-100 text-blue-800 border border-blue-200 py-1.5 ",
  completed: "bg-green-100 text-green-700 border border-green-200 py-1.5 ",
  default: "bg-gray-100 text-gray-700 border border-gray-200 py-1.5 ",
};

interface ActionsColumnConfig {
  onEdit: (job: Job) => void;
  onDelete: (jobId: number) => void;
}

/**
 * Creates a reusable Actions column definition for AG Grid
 * @param config - Configuration object with onEdit and onDelete callbacks
 * @returns ColDef for Actions column
 */
export const createActionsColumn = (
  config: ActionsColumnConfig
): ColDef<Job> => {
  const { onEdit, onDelete } = config;

  return {
    headerName: "Actions",
    pinned: "right",
    lockVisible: true,
    lockPosition: true,
    resizable: false,
    width: 80,
    sortable: false,
    filter: false,
    cellRenderer: (params: any) => {
      const menuItems = [
        {
          key: "edit",
          label: "Edit",
          onClick: () => {
            onEdit(params.data);
          },
        },
        {
          key: "delete",
          label: "Delete",
          danger: true,
          onClick: async () => {
            Modal.confirm({
              title: "Delete Job",
              content: "Are you sure you want to delete this job?",
              okText: "Delete",
              okType: "danger",
              cancelText: "Cancel",
              onOk: async () => {
                try {
                  await deleteJob(params.data.id);
                  onDelete(params.data.id);
                  message.success("Job deleted successfully");
                } catch (error) {
                  console.error("Failed to delete job", error);
                  message.error("Failed to delete job");
                }
              },
            });
          },
        },
      ];

      return (
        <Dropdown
          menu={{ items: menuItems }}
          trigger={["click"]}
          placement="bottomRight"
        >
          <div className="flex items-center justify-center h-full cursor-pointer">
            <EllipsisVertical size={18} />
          </div>
        </Dropdown>
      );
    },
  };
};
