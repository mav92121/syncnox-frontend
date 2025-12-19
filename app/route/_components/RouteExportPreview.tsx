"use client";
import React, { useRef, useMemo } from "react";
import { Modal, Typography, Button, Divider } from "antd";
import { PrinterOutlined } from "@ant-design/icons";
import { useReactToPrint } from "react-to-print";
import GoogleMaps from "@/components/GoogleMaps";
import DriverSummaryTable from "./DriverSummaryTable";
import RouteStopsTable from "./RouteStopsTable";
import { Route } from "@/types/routes.type";
import { Job } from "@/types/job.type";
import {
  prepareDriverSummary,
  prepareStopsData,
} from "@/utils/exportPreview.utils";
import {
  generateRoutePolylines,
  generateMapMarkers,
} from "./optimizationView.utils";

const { Title, Text } = Typography;

interface RouteExportPreviewProps {
  open: boolean;
  onClose: () => void;
  route: Route;
  jobs: Job[];
}

const RouteExportPreview: React.FC<RouteExportPreviewProps> = ({
  open,
  onClose,
  route,
  jobs,
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `${route.route_name}_Export`,
    pageStyle: `
      @page {
        size: A4;
        margin: 8mm;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .ant-modal-header {
          display: none !important;
        }
        .print-header {
          margin-bottom: 8px !important;
        }
        .print-header h4 {
          font-size: 16px !important;
          margin-bottom: 0 !important;
        }
        .print-header .ant-typography {
          font-size: 12px !important;
        }
        .print-map {
          height: 280px !important;
          page-break-inside: avoid;
          margin-bottom: 8px !important;
        }
        .ant-divider {
          margin: 8px 0 !important;
        }
        .driver-section {
          margin-top: 8px !important;
        }
        .driver-section h5 {
          font-size: 14px !important;
          margin-bottom: 6px !important;
        }
        .driver-summary-table,
        .route-stops-table {
          page-break-inside: avoid;
          margin-bottom: 8px !important;
        }
        .driver-summary-table table,
        .route-stops-table table {
          font-size: 11px !important;
        }
        .driver-summary-table th,
        .driver-summary-table td,
        .route-stops-table th,
        .route-stops-table td {
          padding: 4px 6px !important;
        }
        .ant-table-cell {
          font-size: 11px !important;
        }
      }
    `,
  });

  const routePolylines = useMemo(() => {
    return generateRoutePolylines(route);
  }, [route]);

  const markers = useMemo(() => {
    return generateMapMarkers(route, jobs);
  }, [route, jobs]);

  const initialCenter = useMemo<google.maps.LatLngLiteral>(() => {
    return markers[0]?.position ?? { lat: 37.7749, lng: -122.4194 };
  }, [markers]);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={900}
      centered
      footer={
        <Button
          size="small"
          type="primary"
          icon={<PrinterOutlined />}
          onClick={handlePrint}
        >
          Print / Save as PDF
        </Button>
      }
      destroyOnClose
      styles={{ body: { padding: 0, height: "70vh" } }}
      title={
        <div className="flex justify-between items-center px-6 py-3">
          <Title level={5} className="m-0">
            Route Export Preview
          </Title>
        </div>
      }
    >
      <div
        ref={printRef}
        className="custom-scrollbar"
        style={{
          height: "100%",
          overflow: "auto",
          padding: "0 5px 5px 5px",
        }}
      >
        {/* Header */}
        <div className="text-center flex gap-4 items-baseline mb-2 print-header">
          <Title level={4}>{route.route_name}</Title>
          <Text type="secondary" className="text-base">
            Scheduled Date: {route.scheduled_date}
          </Text>
        </div>

        {/* Map Section */}
        <div>
          <div
            className="print-map"
            style={{
              height: "350px",
              width: "100%",
              overflow: "hidden",
            }}
          >
            <GoogleMaps
              polylines={routePolylines}
              markers={markers}
              center={initialCenter}
              zoom={12}
              showDirectionArrows={true}
            />
          </div>
        </div>

        <Divider />

        {/* Driver Routes Sections */}
        {route.result?.routes?.map((routeItem, index) => {
          const driverSummary = prepareDriverSummary(
            routeItem,
            route.scheduled_date
          );
          const stopsData = prepareStopsData(routeItem.stops, jobs);

          return (
            <div
              key={index}
              className={`driver-section ${index > 0 ? "mt-6" : ""}`}
            >
              <Title level={5} className="mb-3">
                Driver: {routeItem.team_member_name || "Unassigned"}
              </Title>

              {/* Driver Summary Table */}
              <DriverSummaryTable driverSummary={driverSummary} />

              {/* Stops Table */}
              <div className="mt-4">
                <Text strong className="block mb-2">
                  Stop Details
                </Text>
                <RouteStopsTable stops={stopsData} />
              </div>

              {index < (route.result?.routes?.length || 0) - 1 && (
                <Divider className="my-6" />
              )}
            </div>
          );
        })}
      </div>
    </Modal>
  );
};

export default RouteExportPreview;
