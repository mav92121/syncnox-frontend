"use client";
import BaseTable from "@/components/Table/BaseTable";
import { AllRoutes } from "@/types/routes.type";
import { useRouteStore } from "@/zustand/routes.store";
import { Typography } from "antd";
import { ColDef } from "ag-grid-community";

const { Title } = Typography;

export default function RoutesView() {
  const { routes, isLoading } = useRouteStore();
  const columns: ColDef<AllRoutes>[] = [
    {
      headerName: "Route ID",
      field: "id",
    },
    {
      headerName: "Route Name",
      field: "name",
    },
    {
      headerName: "Team Members",
      field: "assigned_team_members",
      valueFormatter: (params) =>
        params.value?.map((m: any) => m.name).join(", ") || "-",
    },
    {
      headerName: "Route Status",
      field: "status",
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
