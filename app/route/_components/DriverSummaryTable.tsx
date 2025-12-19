import React from "react";
import { Table, Typography, Tag } from "antd";
import { DriverSummary } from "@/utils/exportPreview.utils";

const { Text } = Typography;

interface DriverSummaryTableProps {
  driverSummary: DriverSummary;
}

const DriverSummaryTable: React.FC<DriverSummaryTableProps> = ({
  driverSummary,
}) => {
  const data = [
    {
      key: "1",
      label: "Driver Name",
      value: driverSummary.driverName,
    },
    {
      key: "2",
      label: "Route Date",
      value: driverSummary.routeDate,
    },
    {
      key: "3",
      label: "Distance",
      value: driverSummary.distance,
    },
    {
      key: "4",
      label: "Total Stops",
      value: driverSummary.totalStops.toString(),
    },
    {
      key: "5",
      label: "Expected Travel Time",
      value: driverSummary.expectedTravelTime,
    },
  ];

  const columns = [
    {
      title: "Property",
      dataIndex: "label",
      key: "label",
      width: "40%",
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: "Value",
      dataIndex: "value",
      key: "value",
      width: "60%",
    },
  ];

  return (
    <div className="mb-6">
      <Table
        columns={columns}
        dataSource={data}
        pagination={false}
        size="small"
        bordered
        className="driver-summary-table"
      />
    </div>
  );
};

export default DriverSummaryTable;
