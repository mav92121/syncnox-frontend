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
  FilterOutlined,
} from "@ant-design/icons";

import { useBulkUploadStore } from "@/store/bulkUpload.store";
import type { JobCreate } from "@/types/bulk-upload.type";
import { useJobsStore } from "@/store/jobs.store";
import { importBulkJobs } from "@/apis/bulk-upload.api";
import type { ColDef, RowClassParams, CellValueChangedEvent } from "ag-grid-community";
import AddressCellEditor from "./AddressCellEditor";

interface DataPreviewStepProps {
  onFinish: () => void;
  onBack?: () => void;
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

const DataPreviewStep = ({ onFinish, onBack }: DataPreviewStepProps) => {
  const gridRef = useRef<AgGridReact>(null);
  const [isImporting, setIsImporting] = useState(false);

  const { geocodedData, columnMapping, saveAsDefault, defaultScheduledDate, updateGeocodedRow } =
    useBulkUploadStore();
  const { refreshDraftJobs } = useJobsStore();

  type FilterType = "all" | "geocoding_error" | "validation_error" | "duplicate" | "ready";
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

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

  // Filter row data based on selected status filter
  const displayedRowData = useMemo(() => {
    if (activeFilter === "all") return rowData;
    if (activeFilter === "ready") {
      return rowData.filter((r) => r.status === "success" || r.status === "duplicate");
    }
    return rowData.filter((r) => r.status === activeFilter);
  }, [rowData, activeFilter]);

  const handleFilterClick = (filter: FilterType) => {
    setActiveFilter((prev) => (prev === filter ? "all" : filter));
  };

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
        editable: true,
        cellEditor: AddressCellEditor,
        cellEditorPopup: true,
      },
      {
        headerName: "Formatted Address",
        field: "formattedAddress",
        flex: 2,
        minWidth: 200,
        editable: true,
        cellEditor: AddressCellEditor,
        cellEditorPopup: true,
      },
      {
        headerName: "Lat",
        field: "lat",
        width: 100,
        editable: true,
        valueParser: (params) => {
          const val = parseFloat(params.newValue);
          return isNaN(val) ? null : val;
        },
        valueFormatter: (params) =>
          params.value != null ? Number(params.value).toFixed(5) : "-",
      },
      {
        headerName: "Lng",
        field: "lng",
        width: 100,
        editable: true,
        valueParser: (params) => {
          const val = parseFloat(params.newValue);
          return isNaN(val) ? null : val;
        },
        valueFormatter: (params) =>
          params.value != null ? Number(params.value).toFixed(5) : "-",
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
          editable: true,
          valueGetter: (params) => params.data?.[identifier] || "",
          valueSetter: (params) => {
            if (params.data) {
              params.data[identifier] = params.newValue;
              return true;
            }
            return false;
          }
        });
      }
    });

    return columns;
  }, [columnMapping]);

  // Handle cell edits
  const handleCellValueChanged = useCallback(
    (params: CellValueChangedEvent<ProcessedRow>) => {
      const { data, colDef, newValue, oldValue } = params;
      if (!data || newValue === oldValue) return;

      const field = colDef.field;
      const rowIndex = data.id;

      const latestStoreData = useBulkUploadStore.getState().geocodedData;
      const storeRow = latestStoreData[rowIndex];
      if (!storeRow) return;

      const updatedRow = { ...storeRow };

      if (field === "lat" || field === "lng") {
        updatedRow.geocode_result = {
          ...updatedRow.geocode_result,
          [field]: newValue,
        };
        // If both lat and lng are now present, clear the geocoding error
        if (
          updatedRow.geocode_result.lat != null &&
          updatedRow.geocode_result.lng != null
        ) {
          updatedRow.geocode_result.error = null;
        }
        updatedRow.is_duplicate = false;
      } else if (field === "address" || field === "formattedAddress") {
        updatedRow.geocode_result = {
          ...updatedRow.geocode_result,
          [field === "address" ? "address" : "formatted_address"]: newValue,
          lat: null,
          lng: null,
        };
        updatedRow.is_duplicate = false;
      } else if (field) {
        // Update original_data for dynamic columns
        updatedRow.original_data = {
          ...updatedRow.original_data,
          [field]: newValue,
        };
      }

      // Instead of wiping all validation errors, filter out errors related to the edited field
      if (field && updatedRow.validation_errors && updatedRow.validation_errors.length > 0) {
        const fieldToErrorKeyword: Record<string, string> = {
          service_duration: "Service Duration",
          time_window_start: "Time Window",
          time_window_end: "Time Window",
          scheduled_date: "Scheduled Date",
          email: "Email",
          priority_level: "Priority Level",
          job_type: "Job Type",
        };
        
        const errorKeyword = fieldToErrorKeyword[field];
        if (errorKeyword) {
          updatedRow.validation_errors = updatedRow.validation_errors.filter(
            (err) => !err.startsWith(errorKeyword)
          );
        }
      }

      updateGeocodedRow(rowIndex, updatedRow);
    },
    [updateGeocodedRow]
  );

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

      if (response.failed && response.failed > 0) {
        message.warning(`Imported ${response.created} jobs, but ${response.failed} failed.`);
      } else {
        message.success(`Successfully imported ${response.created} jobs!`);
      }

      const importedDate = jobs.find((j) => j.scheduled_date)?.scheduled_date;
      if (importedDate) {
        useJobsStore.getState().setSelectedDate(importedDate);
      }

      await refreshDraftJobs();
      onFinish();
    } catch (error: any) {
      message.error(error.response?.data?.detail || "Failed to import jobs");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0 flex-1">
      {/* Interactive Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 mb-2 p-1.5 bg-gray-50/80 border border-gray-200 rounded-none shadow-2xs">
        <div className="flex items-center gap-1.5 px-2 text-gray-500 border-r border-gray-200 pr-2.5 mr-0.5">
          <FilterOutlined className="text-xs text-gray-500" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
            Filter:
          </span>
        </div>

        {/* All Rows Filter Pill */}
        <Tooltip title={activeFilter === "all" ? "Showing all rows" : "Click to show all rows"}>
          <button
            type="button"
            onClick={() => handleFilterClick("all")}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-none cursor-pointer text-xs font-medium transition-all border ${
              activeFilter === "all"
                ? "bg-white border-gray-400 shadow-2xs text-gray-900 font-semibold"
                : "bg-white/60 border-gray-200 text-gray-600 hover:bg-white hover:border-gray-300"
            }`}
          >
            <InfoCircleOutlined className={activeFilter === "all" ? "text-gray-700" : "text-gray-400"} />
            <span>All Rows</span>
            <span
              className={`px-1.5 py-0 rounded-none text-[11px] font-bold ${
                activeFilter === "all"
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-700 border border-gray-200"
              }`}
            >
              {stats.total}
            </span>
          </button>
        </Tooltip>

        {/* Geocoding Errors Filter Pill */}
        {stats.geocodingErrors > 0 && (
          <Tooltip title={activeFilter === "geocoding_error" ? "Showing geocoding errors (Click to reset)" : `Click to filter ${stats.geocodingErrors} geocoding error(s)`}>
            <button
              type="button"
              onClick={() => handleFilterClick("geocoding_error")}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-none cursor-pointer text-xs font-medium transition-all border ${
                activeFilter === "geocoding_error"
                  ? "bg-red-50 border-red-500 text-red-900 font-semibold"
                  : "bg-white/60 border-red-200 text-red-600 hover:bg-red-50/80 hover:border-red-300"
              }`}
            >
              <CloseCircleOutlined style={{ color: "#ff4d4f" }} />
              <span>Geocoding Errors</span>
              <span
                className={`px-1.5 py-0 rounded-none text-[11px] font-bold ${
                  activeFilter === "geocoding_error"
                    ? "bg-red-600 text-white"
                    : "bg-red-100 text-red-700 border border-red-200"
                }`}
              >
                {stats.geocodingErrors}
              </span>
            </button>
          </Tooltip>
        )}

        {/* Validation Errors Filter Pill */}
        {stats.validationErrors > 0 && (
          <Tooltip title={activeFilter === "validation_error" ? "Showing validation errors (Click to reset)" : `Click to filter ${stats.validationErrors} validation error(s)`}>
            <button
              type="button"
              onClick={() => handleFilterClick("validation_error")}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-none cursor-pointer text-xs font-medium transition-all border ${
                activeFilter === "validation_error"
                  ? "bg-orange-50 border-orange-500 text-orange-900 font-semibold"
                  : "bg-white/60 border-orange-200 text-orange-600 hover:bg-orange-50/80 hover:border-orange-300"
              }`}
            >
              <ExclamationCircleOutlined style={{ color: "#fa8c16" }} />
              <span>Validation Errors</span>
              <span
                className={`px-1.5 py-0 rounded-none text-[11px] font-bold ${
                  activeFilter === "validation_error"
                    ? "bg-orange-500 text-white"
                    : "bg-orange-100 text-orange-700 border border-orange-200"
                }`}
              >
                {stats.validationErrors}
              </span>
            </button>
          </Tooltip>
        )}

        {/* Duplicates Filter Pill */}
        {stats.duplicates > 0 && (
          <Tooltip title={activeFilter === "duplicate" ? "Showing duplicate rows (Click to reset)" : `Click to filter ${stats.duplicates} duplicate row(s)`}>
            <button
              type="button"
              onClick={() => handleFilterClick("duplicate")}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-none cursor-pointer text-xs font-medium transition-all border ${
                activeFilter === "duplicate"
                  ? "bg-blue-50 border-blue-500 text-blue-900 font-semibold"
                  : "bg-white/60 border-blue-200 text-blue-600 hover:bg-blue-50/80 hover:border-blue-300"
              }`}
            >
              <WarningOutlined style={{ color: "#1890ff" }} />
              <span>Duplicates</span>
              <span
                className={`px-1.5 py-0 rounded-none text-[11px] font-bold ${
                  activeFilter === "duplicate"
                    ? "bg-blue-600 text-white"
                    : "bg-blue-100 text-blue-700 border border-blue-200"
                }`}
              >
                {stats.duplicates}
              </span>
            </button>
          </Tooltip>
        )}

        {/* Ready to Import Filter Pill */}
        <Tooltip title={activeFilter === "ready" ? "Showing ready rows (Click to reset)" : `Click to filter ${stats.readyToImport} ready row(s)`}>
          <button
            type="button"
            onClick={() => handleFilterClick("ready")}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-none cursor-pointer text-xs font-medium transition-all border ml-auto ${
              activeFilter === "ready"
                ? "bg-green-50 border-green-600 text-green-900 font-semibold"
                : "bg-white/60 border-green-200 text-green-700 hover:bg-green-50/80 hover:border-green-300"
            }`}
          >
            <CheckCircleOutlined style={{ color: "#52c41a" }} />
            <span>Ready to Import</span>
            <span
              className={`px-1.5 py-0 rounded-none text-[11px] font-bold ${
                activeFilter === "ready"
                  ? "bg-green-600 text-white"
                  : "bg-green-100 text-green-800 border border-green-200"
              }`}
            >
              {stats.readyToImport}
            </span>
          </button>
        </Tooltip>

        {/* Clear Filter Link */}
        {activeFilter !== "all" && (
          <button
            type="button"
            onClick={() => setActiveFilter("all")}
            className="text-xs text-gray-500 hover:text-gray-900 underline cursor-pointer ml-2 px-1 py-0.5"
          >
            Reset
          </button>
        )}
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

      {/* Data Grid Container */}
      <div className="flex-1 min-h-0 relative mb-3 border border-gray-200 overflow-hidden">
        <div
          className="h-full w-full [&_.ag-root-wrapper]:!border-0 [&_.ag-header]:!bg-gray-50 [&_.ag-header-cell]:!font-semibold [&_.ag-header-cell-text]:!text-xs [&_.ag-header-cell-text]:!text-gray-700"
          style={{ "--ag-wrapper-border-radius": "0" } as React.CSSProperties}
        >
          <AgGridReact
            ref={gridRef}
            rowData={displayedRowData}
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
            onCellValueChanged={handleCellValueChanged}
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
          {onBack && (
            <Button onClick={onBack} className="rounded-none">
              Back
            </Button>
          )}
          <Button onClick={onFinish} className="rounded-none">
            Cancel
          </Button>
          <Button
            type="primary"
            onClick={handleImport}
            loading={isImporting}
            disabled={stats.readyToImport === 0}
            className="rounded-none"
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
