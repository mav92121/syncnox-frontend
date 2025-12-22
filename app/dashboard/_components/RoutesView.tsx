"use client";
import BaseTable from "@/components/Table/BaseTable";
import { AllRoutes } from "@/types/routes.type";
import { useRouteStore } from "@/zustand/routes.store";
import { Typography, Progress, Button, Select } from "antd";
import { ColDef } from "ag-grid-community";
import { useRouter } from "next/navigation";
import StatusBadge from "@/components/Jobs/StatusBanner";
import { useState } from "react";
import { createActionsColumn } from "@/components/Table/ActionsColumn";

const { Title } = Typography;

export const statusStyleMap: Record<string, string> = {
  Empty: "bg-gray-100 text-gray-700 border border-gray-200",
  Scheduled: "bg-yellow-100 text-yellow-800 border border-yellow-200",
  "In Progress": "bg-blue-100 text-blue-800 border border-blue-200",
  Completed: "bg-green-100 text-green-700 border border-green-200",
  Failed: "bg-red-100 text-red-800 border border-red-200",
  default: "bg-gray-100 text-gray-700 border border-gray-200",
};

const DistanceHeader = (props: any) => {
  const { displayName, unit, setUnit, progressSort } = props;

  const onSortRequested = (event: any) => {
    progressSort(event.shiftKey);
  };

  return (
    <div
      className="flex items-center gap-2 w-full cursor-pointer"
      onClick={onSortRequested}
    >
      <span className="grow flex items-center gap-1">{displayName}</span>
      <div onClick={(e) => e.stopPropagation()}>
        <Select
          value={unit}
          onChange={(val) => setUnit(val as "km" | "mi")}
          size="small"
          options={[
            { label: "km", value: "km" },
            { label: "mi", value: "mi" },
          ]}
          style={{ width: 60 }}
        />
      </div>
    </div>
  );
};

export default function RoutesView() {
  const router = useRouter();
  const { routes, isLoading, deleteRoute } = useRouteStore();
  const [distanceUnit, setDistanceUnit] = useState<"km" | "mi">("km");
  const columns: ColDef<AllRoutes>[] = [
    {
      headerName: "ID",
      field: "id",
      width: 100,
    },
    {
      headerName: "Name",
      field: "name",
    },
    {
      headerName: "Route Status",
      field: "status",
      cellRenderer: (params: any) => (
        <StatusBadge value={params.value} styleMap={statusStyleMap} />
      ),
      width: 150,
    },
    {
      headerName: "View",
      cellRenderer: (params: any) => {
        return (
          <Button
            type="link"
            onClick={() => {
              router.push(`/route/${params.data.optimization_id}`);
            }}
          >
            Map View
          </Button>
        );
      },
      width: 120,
    },
    {
      headerName: "Scheduled Date",
      field: "scheduled_date",
      width: 150,
    },
    {
      headerName: "Distance",
      headerComponent: DistanceHeader,
      headerComponentParams: {
        unit: distanceUnit,
        setUnit: setDistanceUnit,
      },
      field: "total_distance",
      valueFormatter: (params) => {
        if (!params.value) return "-";
        const val = params.value / 1000;
        if (distanceUnit === "km") {
          return val.toFixed(2);
        } else {
          return (val * 0.621371).toFixed(2);
        }
      },
      width: 180,
    },
    {
      headerName: "Time",
      field: "total_time",
      valueFormatter: (params) => {
        if (!params.value) return "-";
        const totalSeconds = Number(params.value);
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = Math.floor(totalSeconds % 60);
        return `${h} h ${m} m ${s} s`;
      },
      width: 120,
    },
    {
      headerName: "Progress",
      cellRenderer: (params: any) => (
        <Progress percent={params.data?.progress_percentage} />
      ),
    },
    {
      headerName: "Team Members",
      field: "assigned_team_members",
      valueFormatter: (params) =>
        params.value?.map((m: any) => m.name).join(", ") || "-",
    },
    {
      headerName: "Total Stops",
      field: "total_stops",
      width: 150,
    },
    {
      headerName: "Completed Stops",
      field: "completed_stops",
      width: 150,
    },
    {
      headerName: "Attempted Stops",
      field: "attempted_stops",
      width: 150,
    },
    {
      headerName: "Failed Stops",
      field: "failed_stops",
      width: 150,
    },
    {
      headerName: "Rating",
      field: "rating",
      width: 150,
    },
    createActionsColumn<AllRoutes>({
      onEdit: (route) => {
        router.push(`/route/${route.id}`);
      },
      onDelete: deleteRoute,
      entityName: "Route",
    }),
  ];
  return (
    <div className="flex flex-col h-full">
      <Title level={4} className="m-0">
        Routes
      </Title>
      <div className="flex-1 min-h-0">
        <BaseTable<AllRoutes>
          columnDefs={columns}
          rowData={routes}
          rowSelection="multiple"
          loading={isLoading}
          emptyMessage="No routes to show"
          pagination={true}
          containerStyle={{ height: "100%" }}
        />
      </div>
    </div>
  );
}
