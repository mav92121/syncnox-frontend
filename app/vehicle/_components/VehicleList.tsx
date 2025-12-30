"use client";
import BaseTable from "@/components/Table/BaseTable";
import { Vehicle } from "@/types/vehicle.type";
import { useVehicleStore } from "@/zustand/vehicle.store";
import { useTeamStore } from "@/zustand/team.store";
import { ColDef } from "ag-grid-community";
import { Typography, Flex, Button, message } from "antd";
import { createActionsColumn } from "@/components/Table/ActionsColumn";

const { Title } = Typography;

const formatVehicleType = (type: string | null): string => {
  if (!type) return "-";
  return type
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const VehicleList = () => {
  const { isLoading, vehicles, deleteVehicleAction } = useVehicleStore();
  const { getTeamsMap } = useTeamStore();
  const teamsMap = getTeamsMap();

  const columns: ColDef<Vehicle>[] = [
    {
      checkboxSelection: true,
      headerCheckboxSelection: true,
      width: 50,
      pinned: "left",
      lockPosition: true,
      filter: false,
      resizable: false,
      sortable: false,
    },
    {
      field: "id",
      headerName: "ID",
      width: 80,
      minWidth: 80,
    },
    {
      field: "name",
      headerName: "Name",
      width: 200,
    },
    {
      field: "team_member_id",
      headerName: "Team Member",
      width: 180,
      valueGetter: (params) => {
        const teamMemberId = params.data?.team_member_id;
        if (teamMemberId == null) return "-";
        return teamsMap[teamMemberId] || "-";
      },
    },
    {
      field: "type",
      headerName: "Type",
      width: 120,
      valueFormatter: (params) => formatVehicleType(params.value),
    },
    {
      field: "license_plate",
      headerName: "License Plate",
      width: 200,
    },
    {
      field: "make",
      headerName: "Make",
      width: 180,
    },
    {
      field: "model",
      headerName: "Model",
      width: 180,
    },
    {
      field: "capacity_weight",
      headerName: "Capacity (Weight)",
      width: 200,
      valueFormatter: (params) =>
        params.value != null ? `${params.value} kg` : "-",
    },
    {
      field: "capacity_volume",
      headerName: "Capacity (Volume)",
      width: 200,
      valueFormatter: (params) =>
        params.value != null ? `${params.value} m³` : "-",
    },
    createActionsColumn<Vehicle>({
      actions: [
        {
          key: "edit",
          label: "Edit",
          onClick: (vehicle: Vehicle) => {
            // TODO: Implement edit functionality
            message.info(`Edit vehicle ${vehicle.name}`);
          },
        },
        {
          key: "delete",
          label: "Delete",
          type: "delete",
          onClick: async (vehicle: Vehicle) => {
            await deleteVehicleAction(vehicle.id);
          },
        },
      ],
      entityName: "Vehicle",
    }),
  ];

  return (
    <div className="flex flex-col h-full">
      <Flex justify="space-between">
        <Title className="m-0 mb-2 pt-2" level={5}>
          Vehicles
        </Title>
        <Button
          type="primary"
          size="small"
          onClick={() => {
            // TODO: Implement add vehicle functionality
            message.info("Add vehicle functionality coming soon");
          }}
        >
          Add Vehicle
        </Button>
      </Flex>
      <div className="flex-1 min-h-0">
        <BaseTable<Vehicle>
          columnDefs={columns}
          rowData={vehicles}
          rowSelection="multiple"
          loading={isLoading}
          emptyMessage="No vehicles to show"
          containerStyle={{ height: "100%" }}
        />
      </div>
    </div>
  );
};

export default VehicleList;
