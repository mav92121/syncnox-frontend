import { ColDef } from "ag-grid-community";
import { Dropdown, Modal, message } from "antd";
import { EllipsisVertical } from "lucide-react";

export interface ActionsColumnConfig<T> {
  /**
   * Callback when edit is clicked
   */
  onEdit: (data: T) => void;

  /**
   * Callback that handles the delete operation.
   * Can be a unified action (handles API + state) or just a state update callback.
   */
  onDelete: (id: number) => void | Promise<void>;

  /**
   * (Optional) API function to delete the entity.
   * If not provided, onDelete is assumed to handle both API call and state update.
   */
  deleteApi?: (id: number) => Promise<void>;

  /**
   * Entity name for confirmation modal (e.g., "Job", "Team", "User")
   */
  entityName?: string;

  /**
   * Width of the actions column (default: 80)
   */
  width?: number;

  /**
   * Additional menu items to add
   */
  additionalMenuItems?: Array<{
    key: string;
    label: string;
    danger?: boolean;
    onClick: (data: T) => void;
  }>;
}

export const createActionsColumn = <T extends { id: number }>(
  config: ActionsColumnConfig<T>
): ColDef<T> => {
  const {
    onEdit,
    onDelete,
    deleteApi,
    entityName = "record",
    width = 80,
    additionalMenuItems = [],
  } = config;

  return {
    headerName: "Actions",
    pinned: "right",
    lockVisible: true,
    lockPosition: true,
    resizable: false,
    width,
    sortable: false,
    filter: false,
    cellRenderer: (params: any) => {
      const data: T = params.data;

      const defaultMenuItems = [
        {
          key: "edit",
          label: "Edit",
          onClick: () => {
            onEdit(data);
          },
        },
        ...additionalMenuItems.map((item) => ({
          ...item,
          onClick: () => item.onClick(data),
        })),
        {
          key: "delete",
          label: "Delete",
          danger: true,
          onClick: async () => {
            Modal.confirm({
              title: `Delete ${entityName}`,
              content: `Are you sure you want to delete this ${entityName.toLowerCase()}?`,
              okText: "Delete",
              okType: "danger",
              cancelText: "Cancel",
              onOk: async () => {
                try {
                  // If unified action (deleteApi not provided), call onDelete which handles everything
                  if (!deleteApi) {
                    await onDelete(data.id);
                    message.success(`${entityName} deleted successfully`);
                  } else {
                    // Legacy pattern: call API then update state
                    await deleteApi(data.id);
                    onDelete(data.id);
                    message.success(`${entityName} deleted successfully`);
                  }
                } catch (error) {
                  console.error(
                    `Failed to delete ${entityName.toLowerCase()}`,
                    error
                  );
                  message.error(`Failed to delete ${entityName.toLowerCase()}`);
                }
              },
            });
          },
        },
      ];

      return (
        <Dropdown
          menu={{ items: defaultMenuItems }}
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
