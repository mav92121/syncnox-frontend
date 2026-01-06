"use client";

import { useMemo, useRef, useState, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import { Button, message, Tooltip, Alert } from "antd";
import {
  CheckCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";

import { useBulkUploadStore } from "@/store/bulkUpload.store";
import type { JobCreate } from "@/types/bulk-upload.type";
import { useJobsStore } from "@/store/jobs.store";
import { importBulkJobs } from "@/apis/bulk-upload.api";
import type { ColDef, RowClassParams } from "ag-grid-community";

interface DataPreviewStepProps {
  onFinish: () => void;
}

// Row status types for clarity
type RowStatus =
  | "success"
  | "geocoding_error"
  | "validation_error"
  | "duplicate";

interface ProcessedRow {
  id: number;
  address: string;
  lat: number | null;
  lng: number | null;
  formattedAddress: string | null;
  geocodingError: string | null;
  warning: string | null;
  isDuplicate: boolean;
  validationErrors: string[];
  status: RowStatus;
  statusMessage: string;
  [key: string]: any;
}

const DataPreviewStep = ({ onFinish }: DataPreviewStepProps) => {
  const gridRef = useRef<AgGridReact>(null);
  const [isImporting, setIsImporting] = useState(false);

  const { geocodedData, columnMapping, saveAsDefault, defaultScheduledDate } =
    useBulkUploadStore();
  const { refreshDraftJobs } = useJobsStore();

  // Process and categorize row data
  const { rowData, stats } = useMemo(() => {
    let geocodingErrors = 0;
    let validationErrors = 0;
    let duplicates = 0;
    let readyToImport = 0;

    const rows: ProcessedRow[] = geocodedData.map((row, index) => {
      const hasGeocodingError =
        row.geocode_result.error ||
        row.geocode_result.lat == null ||
        row.geocode_result.lng == null;

      const hasValidationErrors =
        row.validation_errors && row.validation_errors.length > 0;

      // Determine status and message
      let status: RowStatus = "success";
      let statusMessage = "Ready to import";

      if (hasGeocodingError) {
        status = "geocoding_error";
        statusMessage =
          row.geocode_result.error || "Invalid address - could not geocode";
        geocodingErrors++;
      } else if (hasValidationErrors) {
        status = "validation_error";
        statusMessage = row.validation_errors.join("\n");
        validationErrors++;
      } else if (row.is_duplicate) {
        status = "duplicate";
        statusMessage = "Duplicate address detected";
        duplicates++;
        readyToImport++; // Duplicates can still be imported
      } else {
        readyToImport++;
      }

      return {
        id: index,
        address: row.geocode_result.address,
        lat: row.geocode_result.lat,
        lng: row.geocode_result.lng,
        formattedAddress: row.geocode_result.formatted_address,
        geocodingError: row.geocode_result.error,
        warning: row.geocode_result.warning,
        isDuplicate: row.is_duplicate,
        validationErrors: row.validation_errors || [],
        status,
        statusMessage,
        ...row.original_data,
      };
    });

    return {
      rowData: rows,
      stats: {
        total: geocodedData.length,
        geocodingErrors,
        validationErrors,
        duplicates,
        readyToImport,
        hasErrors: geocodingErrors > 0 || validationErrors > 0,
      },
    };
  }, [geocodedData]);

  // Column definitions with enhanced styling
  const columnDefs: ColDef[] = useMemo(() => {
    const columns: ColDef[] = [
      {
        headerName: "",
        field: "status",
        width: 50,
        pinned: "left",
        sortable: false,
        filter: false,
        cellRenderer: (params: { data: ProcessedRow }) => {
          const { status, statusMessage } = params.data;

          const iconStyle = { fontSize: 16 };

          switch (status) {
            case "geocoding_error":
              return (
                <Tooltip title={statusMessage} overlayStyle={{ maxWidth: 400 }}>
                  <CloseCircleOutlined
                    style={{ ...iconStyle, color: "#ff4d4f" }}
                  />
                </Tooltip>
              );
            case "validation_error":
              return (
                <Tooltip
                  title={
                    <div style={{ whiteSpace: "pre-line" }}>
                      {statusMessage}
                    </div>
                  }
                  overlayStyle={{ maxWidth: 400 }}
                >
                  <ExclamationCircleOutlined
                    style={{ ...iconStyle, color: "#fa8c16" }}
                  />
                </Tooltip>
              );
            case "duplicate":
              return (
                <Tooltip title={statusMessage}>
                  <WarningOutlined style={{ ...iconStyle, color: "#1890ff" }} />
                </Tooltip>
              );
            default:
              return (
                <Tooltip title="Ready to import">
                  <CheckCircleOutlined
                    style={{ ...iconStyle, color: "#52c41a" }}
                  />
                </Tooltip>
              );
          }
        },
      },
      {
        headerName: "Address",
        field: "address",
        flex: 2,
        minWidth: 200,
        pinned: "left",
      },
      {
        headerName: "Formatted Address",
        field: "formattedAddress",
        flex: 2,
        minWidth: 200,
      },
      {
        headerName: "Lat",
        field: "lat",
        width: 100,
        valueFormatter: (params) =>
          params.value != null ? params.value.toFixed(5) : "-",
      },
      {
        headerName: "Lng",
        field: "lng",
        width: 100,
        valueFormatter: (params) =>
          params.value != null ? params.value.toFixed(5) : "-",
      },
    ];

    // Field labels for dynamic columns
    const fieldLabels: Record<string, string> = {
      first_name: "First Name",
      last_name: "Last Name",
      phone_number: "Phone",
      email: "Email",
      business_name: "Business",
      time_window_start: "Time Start",
      time_window_end: "Time End",
      service_duration: "Duration",
      additional_notes: "Notes",
      customer_preferences: "Preferences",
      priority_level: "Priority",
      job_type: "Job Type",
      scheduled_date: "Date",
    };

    // Add dynamic columns for mapped fields
    Object.keys(columnMapping).forEach((identifier) => {
      if (identifier !== "address_formatted" && columnMapping[identifier]) {
        columns.push({
          headerName: fieldLabels[identifier] || identifier,
          field: identifier,
          width: 120,
          valueGetter: (params) => params.data?.[identifier] || "",
        });
      }
    });

    return columns;
  }, [columnMapping]);

  // Row styling based on status
  const getRowClass = useCallback((params: RowClassParams<ProcessedRow>) => {
    if (!params.data) return "";

    switch (params.data.status) {
      case "geocoding_error":
        return "bg-red-50";
      case "validation_error":
        return "bg-orange-50";
      case "duplicate":
        return "bg-blue-50";
      default:
        return "";
    }
  }, []);

  // Import handler
  const handleImport = async () => {
    setIsImporting(true);

    try {
      const validRows = geocodedData.filter(
        (row) =>
          !row.geocode_result.error &&
          row.geocode_result.lat != null &&
          row.geocode_result.lng != null &&
          (!row.validation_errors || row.validation_errors.length === 0)
      );

      const jobs = validRows.map((row) => {
        const jobData: JobCreate = {
          ...row.original_data,
          location: {
            lat: row.geocode_result.lat!,
            lng: row.geocode_result.lng!,
          },
          address_formatted:
            row.geocode_result.formatted_address || row.geocode_result.address,
        };

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
      await refreshDraftJobs();
      onFinish();
    } catch (error: any) {
      message.error(error.response?.data?.detail || "Failed to import jobs");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div
      className="flex flex-col h-full"
      style={{ height: "calc(70vh - 100px)" }}
    >
      {/* Stats Summary */}
      <div className="flex flex-wrap items-center gap-4 mb-4 p-3 bg-gray-50 rounded-lg border">
        <div className="flex items-center gap-2">
          <InfoCircleOutlined className="text-gray-500" />
          <span className="text-sm text-gray-600">
            <strong>{stats.total}</strong> total rows
          </span>
        </div>
        <div className="h-4 w-px bg-gray-300" />

        {stats.geocodingErrors > 0 && (
          <div className="flex items-center gap-1.5">
            <CloseCircleOutlined style={{ color: "#ff4d4f" }} />
            <span className="text-sm">
              <strong className="text-red-600">{stats.geocodingErrors}</strong>
              <span className="text-gray-600 ml-1">geocoding errors</span>
            </span>
          </div>
        )}

        {stats.validationErrors > 0 && (
          <div className="flex items-center gap-1.5">
            <ExclamationCircleOutlined style={{ color: "#fa8c16" }} />
            <span className="text-sm">
              <strong className="text-orange-600">
                {stats.validationErrors}
              </strong>
              <span className="text-gray-600 ml-1">validation errors</span>
            </span>
          </div>
        )}

        {stats.duplicates > 0 && (
          <div className="flex items-center gap-1.5">
            <WarningOutlined style={{ color: "#1890ff" }} />
            <span className="text-sm">
              <strong className="text-blue-600">{stats.duplicates}</strong>
              <span className="text-gray-600 ml-1">duplicates</span>
            </span>
          </div>
        )}

        <div className="flex items-center gap-1.5 ml-auto">
          <CheckCircleOutlined style={{ color: "#52c41a" }} />
          <span className="text-sm">
            <strong className="text-green-600">{stats.readyToImport}</strong>
            <span className="text-gray-600 ml-1">ready to import</span>
          </span>
        </div>
      </div>

      {/* Error Alerts */}
      {stats.hasErrors && (
        <Alert
          type="warning"
          showIcon
          icon={<ExclamationCircleOutlined />}
          className="mb-4"
          message={
            <span>
              <strong>
                {stats.geocodingErrors + stats.validationErrors} rows
              </strong>{" "}
              have errors and will be skipped during import. Hover over the
              status icon to see details.
            </span>
          }
        />
      )}

      {/* Data Grid */}
      <div className="flex-1 overflow-hidden rounded-lg border">
        <div className="ag-theme-alpine h-full w-full">
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
            suppressRowClickSelection={true}
            getRowClass={getRowClass}
            headerHeight={40}
            rowHeight={36}
          />
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-4 border-t mt-4">
        <span className="text-sm text-gray-500">
          {stats.readyToImport > 0
            ? `${stats.readyToImport} jobs will be imported`
            : "No valid jobs to import"}
        </span>

        <div className="flex gap-2">
          <Button onClick={onFinish}>Cancel</Button>
          <Button
            type="primary"
            onClick={handleImport}
            loading={isImporting}
            disabled={stats.readyToImport === 0}
          >
            Import{" "}
            {stats.readyToImport > 0 ? `${stats.readyToImport} Jobs` : ""}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DataPreviewStep;
