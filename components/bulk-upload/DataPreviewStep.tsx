"use client";

import { useMemo, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { Button, Badge, Space, message } from "antd";
import {
  CheckCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";

import { useBulkUploadStore } from "@/zustand/bulkUploadStore";
import { useJobsStore } from "@/zustand/jobs.store";
import { importBulkJobs } from "@/apis/bulk-upload.api";
import type { ColDef } from "ag-grid-community";

interface DataPreviewStepProps {
  onFinish: () => void;
}

const DataPreviewStep = ({ onFinish }: DataPreviewStepProps) => {
  const gridRef = useRef<AgGridReact>(null);
  const [isImporting, setIsImporting] = useState(false);

  const { geocodedData, columnMapping, saveAsDefault, defaultScheduledDate } =
    useBulkUploadStore();
  const { refreshDraftJobs } = useJobsStore();

  const rowData = useMemo(() => {
    return geocodedData.map((row, index) => ({
      id: index,
      address: row.geocode_result.address,
      lat: row.geocode_result.lat,
      lng: row.geocode_result.lng,
      formattedAddress: row.geocode_result.formatted_address,
      error: row.geocode_result.error,
      warning: row.geocode_result.warning,
      isDuplicate: row.is_duplicate,
      firstName: row.original_data.first_name || "",
      lastName: row.original_data.last_name || "",
      phone: row.original_data.phone_number || "",
      ...row.original_data,
    }));
  }, [geocodedData]);

  const columnDefs: ColDef[] = useMemo(() => {
    const columns: ColDef[] = [
      {
        headerName: "Status",
        field: "status",
        width: 100,
        pinned: "left",
        cellRenderer: (params: any) => {
          // Show error only if there's an error message or no coordinates
          if (
            params.data.error ||
            params.data.lat == null ||
            params.data.lng == null
          ) {
            return (
              <CloseCircleOutlined
                style={{ color: "red", fontSize: 18 }}
                title={params.data.error || "Invalid address - no coordinates"}
              />
            );
          }
          if (params.data.isDuplicate) {
            return (
              <WarningOutlined
                style={{ color: "blue", fontSize: 18 }}
                title="Duplicate address"
              />
            );
          }
          return (
            <CheckCircleOutlined style={{ color: "green", fontSize: 18 }} />
          );
        },
      },
    ];

    // Add geocoding result columns
    columns.push(
      {
        headerName: "Address",
        field: "address",
        width: 250,
        pinned: "left",
        cellStyle: (params: any) => {
          if (params.data.error) return { backgroundColor: "#fff1f0" };
          if (params.data.isDuplicate) return { backgroundColor: "#e6f7ff" };
          return undefined;
        },
      },
      {
        headerName: "Lat",
        field: "lat",
        width: 100,
      },
      {
        headerName: "Lng",
        field: "lng",
        width: 100,
      },
      {
        headerName: "Formatted Address",
        field: "formattedAddress",
        width: 250,
      }
    );

    // Dynamically add columns for all mapped fields
    // Create a mapping of field identifiers to user-friendly names
    const fieldLabels: Record<string, string> = {
      first_name: "First Name",
      last_name: "Last Name",
      phone_number: "Phone",
      email: "Email",
      business_name: "Business Name",
      time_window_start: "Time Start",
      time_window_end: "Time End",
      service_duration: "Duration (min)",
      additional_notes: "Notes",
      customer_preferences: "Preferences",
      priority_level: "Priority",
      job_type: "Job Type",
      scheduled_date: "Scheduled Date",
    };

    // Get all mapped fields from columnMapping (excluding address since we already show it)
    Object.keys(columnMapping).forEach((identifier) => {
      if (identifier !== "address_formatted" && columnMapping[identifier]) {
        columns.push({
          headerName: fieldLabels[identifier] || identifier,
          field: identifier,
          width: 150,
          valueGetter: (params) => {
            return params.data[identifier] || "";
          },
        });
      }
    });

    return columns;
  }, [columnMapping]);

  const handleImport = async () => {
    setIsImporting(true);

    try {
      // Build jobs array from geocoded data
      // Only include rows with valid lat/lng (exclude invalid addresses)
      const jobs = geocodedData
        .filter(
          (row) =>
            !row.geocode_result.error &&
            row.geocode_result.lat != null &&
            row.geocode_result.lng != null
        )
        .map((row) => {
          const jobData: any = {
            ...row.original_data,
            location: {
              lat: row.geocode_result.lat!,
              lng: row.geocode_result.lng!,
            },
            address_formatted:
              row.geocode_result.formatted_address ||
              row.geocode_result.address,
          };

          // Apply default scheduled date if not present in original data
          // Excel date takes priority over default date
          if (!jobData.scheduled_date && defaultScheduledDate) {
            jobData.scheduled_date = defaultScheduledDate;
          }

          return jobData;
        });

      const response = await importBulkJobs({
        jobs,
        save_mapping: saveAsDefault,
        mapping_config: saveAsDefault ? columnMapping : null,
      });

      message.success(`Successfully imported ${response.created} jobs!`);

      // Refresh draft jobs to update the jobs list and draftJobDates
      await refreshDraftJobs();

      onFinish();
    } catch (error: any) {
      message.error(error.response?.data?.detail || "Failed to import jobs");
    } finally {
      setIsImporting(false);
    }
  };

  const errorsCount = geocodedData.filter(
    (row) =>
      row.geocode_result.error ||
      row.geocode_result.lat == null ||
      row.geocode_result.lng == null
  ).length;
  const warningsCount = 0; // No warnings, only errors or success
  const duplicatesCount = geocodedData.filter((row) => row.is_duplicate).length;
  const successCount = geocodedData.length - errorsCount;

  return (
    <div className="flex flex-col" style={{ height: "calc(70vh - 120px)" }}>
      {/* Info Section */}
      <Space size="middle" className="mb-4">
        <Badge
          count={errorsCount}
          showZero
          color="red"
          style={{ backgroundColor: "red" }}
        >
          <span className="text-sm font-medium">Errors</span>
        </Badge>
        <Badge count={warningsCount} showZero color="orange">
          <span className="text-sm font-medium">Warnings</span>
        </Badge>
        <Badge count={duplicatesCount} showZero color="blue">
          <span className="text-sm font-medium">Duplicates</span>
        </Badge>
        <Badge count={successCount} showZero color="green">
          <span className="text-sm font-medium">Success</span>
        </Badge>
      </Space>

      {/* Scrollable AG Grid Container */}
      <div className="flex-1 overflow-hidden mb-4">
        <div
          className="ag-theme-alpine h-full custom-scrollbar"
          style={{ overflow: "auto" }}
        >
          <AgGridReact
            ref={gridRef}
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={{
              sortable: true,
              filter: true,
              resizable: true,
            }}
            animateRows={true}
            rowSelection="multiple"
            domLayout="autoHeight"
          />
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="flex justify-end gap-2 pt-4 border-t bg-white">
        <Button onClick={onFinish}>Cancel</Button>
        <Button
          type="primary"
          onClick={handleImport}
          loading={isImporting}
          disabled={errorsCount === geocodedData.length}
        >
          Import Orders
        </Button>
      </div>
    </div>
  );
};

export default DataPreviewStep;
