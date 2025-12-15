"use client";
import BaseTable from "@/components/Table/BaseTable";
import { AllRoutes } from "@/types/routes.type";
import { useRouteStore } from "@/zustand/routes.store";
import { Typography, Progress, Button } from "antd";
import { ColDef } from "ag-grid-community";
import { useRouter } from "next/navigation";

const { Title } = Typography;

export default function RoutesView() {
  const router = useRouter();
  const { routes, isLoading } = useRouteStore();
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
      width: 150,
    },
    {
      headerName: "View",
      cellRenderer: (params: any) => {
        return (
          <Button
            type="link"
            size="small"
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
      headerName: "Total Distance (km)",
      field: "total_distance",
      width: 180,
    },
    {
      headerName: "Total Time (min)",
      field: "total_time",
      width: 150,
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
  ];
  return (
    <div className="flex flex-col h-full">
      <Title level={5} className="m-0">
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
