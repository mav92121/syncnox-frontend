"use client";
import BaseTable from "@/components/Table/BaseTable";
import { Route } from "@/types/routes.type";
import { useRouteStore } from "@/zustand/routes.store";
import { Typography } from "antd";

const { Title } = Typography;

export default function RoutesView() {
  const { routes, isLoading } = useRouteStore();
  console.log("routes -> ", routes);
  return (
    <div className="flex flex-col h-full">
      <Title level={5} className="m-0">
        Routes
      </Title>
      <div className="flex-1 min-h-0">
        <BaseTable<Route>
          columnDefs={[]}
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
