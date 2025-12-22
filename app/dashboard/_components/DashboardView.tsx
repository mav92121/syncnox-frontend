"use client";
import { Typography } from "antd";

export default function DashboardView() {
  const { Title } = Typography;
  return (
    <div>
      <Title level={4} className="m-0">
        Dashboard
      </Title>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 border rounded">
          <Title level={5}>Total Jobs</Title>
          <p className="text-2xl">0</p>
        </div>
        <div className="p-4 border rounded">
          <Title level={5}>Active Routes</Title>
          <p className="text-2xl">0</p>
        </div>
        <div className="p-4 border rounded">
          <Title level={5}>Scheduled</Title>
          <p className="text-2xl">0</p>
        </div>
      </div>
    </div>
  );
}
