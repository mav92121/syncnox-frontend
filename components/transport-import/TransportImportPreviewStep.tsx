"use client";

import React, { useMemo, useRef, useState, useCallback, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import { Button, Tooltip, Alert, Tag } from "antd";
import { CheckCircle2 } from "lucide-react";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import type { ColDef, RowClassParams, CellValueChangedEvent } from "ag-grid-community";
import { TransportMappedRow } from "@/apis/transport-import.api";
import AddressAutocomplete, { AddressData } from "@/components/AddressAutocomplete";

/** Strip Excel carriage-return escape sequences (_x000D_) from cell values. */
function cleanVal(v: unknown): unknown {
  if (typeof v === "string") {
    return v.replace(/_x000D_/g, " ").replace(/\r/g, " ").replace(/\n/g, " ").replace(/\s+/g, " ").trim();
  }
  return v;
}

/**
 * AG-Grid cell editor for address columns in transport import.
 * Wraps AddressAutocomplete WITHOUT touching useBulkUploadStore.
 * Returns the selected formatted address via getValue() so
 * onCellValueChanged can handle row re-validation.
 */
const TransportAddressCellEditor = React.forwardRef(
  (props: import("ag-grid-community").ICellEditorParams & { charPress?: string }, ref: React.Ref<unknown>) => {
    // Keep the committed value (sent to AG Grid via getValue).
    // Start with the existing cell value so it is preserved if no new address is picked.
    const [val, setVal] = React.useState<string>(
      typeof props.value === "string" ? props.value : ""
    );
    // Use a ref to store the latest value and bypass React closure scope issues
    const valRef = React.useRef(typeof props.value === "string" ? props.value : "");

    // The search text shown in the input: start empty so the user can immediately
    // type a new search query.  If AG Grid passed a charPress (user started typing
    // to open the editor), seed the input with that character.
    const [searchText, setSearchText] = React.useState<string>(
      props.charPress ?? ""
    );
    const containerRef = React.useRef<HTMLDivElement>(null);

    React.useImperativeHandle(ref, () => ({
      getValue: () => valRef.current,
      // Focus the internal input when the popup is attached to the DOM
      afterGuiAttached: () => {
        const input = containerRef.current?.querySelector("input");
        if (input) {
          input.focus();
          if (props.charPress) {
            // The charPress character was already seeded in searchText state;
            // trigger the input event so AutoComplete picks it up.
            const nativeInputSetter = Object.getOwnPropertyDescriptor(
              window.HTMLInputElement.prototype, "value"
            )?.set;
            if (nativeInputSetter) {
              nativeInputSetter.call(input, props.charPress);
              input.dispatchEvent(new Event("input", { bubbles: true }));
            }
          }
        }
      },
    }));

    const handleChange = (v: string) => {
      setSearchText(v);
      // Keep val in sync so that if the user types a raw address without
      // picking from the dropdown, it is still captured.
      valRef.current = v;
      setVal(v);
    };

    const handleSelect = (d: AddressData) => {
      valRef.current = d.address_formatted;
      setVal(d.address_formatted);
      setSearchText(d.address_formatted);
      setTimeout(() => props.stopEditing(), 0);
    };

    return (
      <div
        ref={containerRef}
        style={{
          width: 420,
          background: "#fff",
          padding: 8,
          borderRadius: 4,
          boxShadow: "0 4px 16px rgba(0,0,0,.15)",
          border: "1px solid #d9d9d9",
        }}
      >
        <AddressAutocomplete
          value={searchText}
          onChange={handleChange}
          onSelect={handleSelect}
          placeholder={val || "Search for an address…"}
        />
      </div>
    );
  }
);

interface TransportImportPreviewStepProps {
  rows: TransportMappedRow[];
  totalRows: number;
  importableRows: number;
  errorsCount: number;
  warningsCount: number;
  fieldLabels: Record<string, string>;
  isImporting: boolean;
  onBack: () => void;
  onCancel: () => void;
  onImport: () => void;
}

type RowStatus = "valid" | "warned" | "skipped";

interface ProcessedRow {
  id: number;
  status: RowStatus;
  statusMessage: string;
  values: TransportMappedRow["values"];
}

type FilterType = "all" | "warned" | "skipped" | "ready";

export default function TransportImportPreviewStep({
  rows: initialRows,
  fieldLabels,
  isImporting,
  onBack,
  onCancel,
  onImport,
}: TransportImportPreviewStepProps) {
  const gridRef = useRef<AgGridReact>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [rowsState, setRowsState] = useState<TransportMappedRow[]>(initialRows);

  useEffect(() => {
    setRowsState(initialRows);
  }, [initialRows]);

  // Build processed rows + stats from local rowsState
  const { rowData, stats } = useMemo(() => {
    const data: ProcessedRow[] = rowsState.map((r, index) => {
      const status = r.status as RowStatus;
      const statusMessage = [...(r.errors || []), ...(r.warnings || [])].join("\n");
      // Clean _x000D_ from all displayed values (safety net for any data that slipped through)
      const cleanedValues: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(r.values || {})) {
        cleanedValues[k] = cleanVal(v);
      }
      return { id: index, status, statusMessage, values: cleanedValues as TransportMappedRow["values"] };
    });

    const warned = data.filter((r) => r.status === "warned").length;
    const skipped = data.filter((r) => r.status === "skipped").length;
    // Only 'valid' rows with 0 errors and 0 warnings are ready to import
    const importable = data.filter((r) => r.status === "valid").length;

    return {
      rowData: data,
      stats: {
        total: data.length,
        warned,
        skipped,
        importable,
        hasErrors: skipped > 0 || warned > 0,
      },
    };
  }, [rowsState]);

  // Filter row data based on selected status filter
  const displayedRowData = useMemo(() => {
    if (activeFilter === "all") return rowData;
    if (activeFilter === "ready") return rowData.filter((r) => r.status === "valid");
    return rowData.filter((r) => r.status === activeFilter);
  }, [rowData, activeFilter]);

  const handleFilterClick = (filter: FilterType) => {
    setActiveFilter((prev) => (prev === filter ? "all" : filter));
  };

  const displayFields =
    rowData.length > 0 ? Object.keys(rowData[0].values) : Object.keys(fieldLabels);

  const columnDefs = useMemo<ColDef[]>(() => {
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

          if (status === "skipped") {
            return (
              <Tooltip title={<div style={{ whiteSpace: "pre-line" }}>{statusMessage}</div>} overlayStyle={{ maxWidth: 400 }}>
                <CloseCircleOutlined style={{ ...iconStyle, color: "#ff4d4f" }} />
              </Tooltip>
            );
          }
          if (status === "warned") {
            return (
              <Tooltip title={<div style={{ whiteSpace: "pre-line" }}>{statusMessage}</div>} overlayStyle={{ maxWidth: 400 }}>
                <ExclamationCircleOutlined style={{ ...iconStyle, color: "#fa8c16" }} />
              </Tooltip>
            );
          }
          return (
            <Tooltip title="Ready to import">
              <CheckCircleOutlined style={{ ...iconStyle, color: "#52c41a" }} />
            </Tooltip>
          );
        },
      },
    ];

    const addressFields = ["candidate_address", "client_address", "go_pickup_point", "return_dropoff_point"];

    displayFields.forEach((identifier) => {
      const isAddressField = addressFields.includes(identifier);
      const isPickupType = identifier === "pickup_type";
      columns.push({
        headerName: fieldLabels[identifier] || identifier,
        field: identifier,
        width: isAddressField ? 210 : 140,
        editable: true,
        cellEditor: isAddressField
          ? TransportAddressCellEditor
          : isPickupType
          ? "agSelectCellEditor"
          : undefined,
        cellEditorParams: isPickupType
          ? {
              values: ["Round trip", "One way", "Return only"],
            }
          : undefined,
        cellEditorPopup: isAddressField ? true : undefined,
        // Prevent AG Grid from consuming keyboard events while the address
        // popup editor is open — ArrowDown/Up/Enter/Escape must reach the
        // Ant Design AutoComplete dropdown instead of navigating the grid.
        suppressKeyboardEvent: isAddressField
          ? (params) => params.editing
          : undefined,
        valueGetter: (params) => params.data?.values?.[identifier] ?? "",
        valueSetter: (params) => {
          if (params.data && params.data.values) {
            params.data.values[identifier] = params.newValue;
            return true;
          }
          return false;
        },
      });
    });

    return columns;
  }, [fieldLabels, displayFields]);

  // Row styling based on status
  const getRowClass = useCallback((params: RowClassParams<ProcessedRow>) => {
    if (!params.data) return "";
    if (params.data.status === "skipped") return "bg-red-50";
    if (params.data.status === "warned") return "bg-orange-50";
    return "";
  }, []);

  const handleCellValueChanged = useCallback(
    (params: CellValueChangedEvent<ProcessedRow>) => {
      const { data, colDef, newValue } = params;
      if (!data || !colDef.field) return;

      const rowIndex = data.id;
      const field = colDef.field;

      setRowsState((prevRows) => {
        const updated = [...prevRows];
        const targetRow = { ...updated[rowIndex] };
        targetRow.values = { ...targetRow.values, [field]: newValue };

        const val = targetRow.values || {};
        const newErrors: string[] = [];
        const newWarnings: string[] = [];

        // --- Required field checks ---
        if (!val["candidate_name"] || !String(val["candidate_name"]).trim()) {
          newErrors.push("Candidate name is required.");
        }
        if (!val["client_name"] || !String(val["client_name"]).trim()) {
          newErrors.push("Client name is required.");
        }
        if (!val["start_hour"] || !String(val["start_hour"]).trim()) {
          newErrors.push("Start hour is required.");
        }
        if (!val["end_hour"] || !String(val["end_hour"]).trim()) {
          newErrors.push("End hour is required.");
        }

        const rawPickupType = String(val["pickup_type"] || "").trim().toLowerCase();
        if (!rawPickupType) {
          newErrors.push("Pickup type is required.");
        } else {
          const validAliases = [
            "one_way", "oneway", "one way", "aller", "aller simple",
            "round_trip", "roundtrip", "round trip", "aller retour", "aller-retour",
            "return_only", "returnonly", "return only", "retour", "retour seul"
          ];
          if (!validAliases.includes(rawPickupType)) {
            newErrors.push(`Invalid pickup type: '${val["pickup_type"]}'`);
          }
        }

        // --- Location checks based on pickup type ---
        // Treat a non-empty address string as "resolved" for client-side validation.
        // (The backend will geocode on actual import.)
        const pType = String(val["pickup_type"] || "").toLowerCase().replace(/\s+/g, "_");
        const goPt = String(val["go_pickup_point"] || "").trim();
        const clientAddr = String(val["client_address"] || "").trim();
        const retPt = String(val["return_dropoff_point"] || "").trim();

        if (pType === "one_way") {
          if (!goPt) newWarnings.push("One-way trip: pickup point is missing. Please enter or search for an address.");
          if (!clientAddr) newWarnings.push("One-way trip: client address is missing.");
        } else if (pType === "return_only") {
          if (!clientAddr) newWarnings.push("Return-only trip: client address is missing.");
          if (!retPt) newWarnings.push("Return-only trip: return dropoff point is missing. Please enter or search for an address.");
        } else {
          // round_trip (default)
          if (!goPt) newWarnings.push("Round trip: pickup point is missing. Please enter or search for an address.");
          if (!clientAddr) newWarnings.push("Round trip: client address is missing.");
          if (!retPt) newWarnings.push("Round trip: return dropoff point is missing. Please enter or search for an address.");
        }

        targetRow.errors = newErrors;
        targetRow.warnings = newWarnings;

        if (newErrors.length > 0) {
          targetRow.status = "skipped";
        } else if (newWarnings.length > 0) {
          targetRow.status = "warned";
        } else {
          targetRow.status = "valid";
        }

        updated[rowIndex] = targetRow;
        return updated;
      });
    },
    []
  );

  return (
    <div className="flex flex-col h-full" style={{height: "calc(70vh - 100px)"}}>
      {/* Summary Header Bar */}
      <div className="flex items-center justify-between bg-slate-50 border border-slate-200 p-3 rounded-none shrink-0">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span className="text-xs font-medium text-gray-800">
            Review and edit imported records. {stats.importable} valid record(s) ready for import.
          </span>
        </div>
        <Tag color="blue" className="text-xs rounded-none">
          {stats.total} Total Rows
        </Tag>
      </div>

      {/* Interactive Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-gray-50/80 border border-gray-200 rounded-none shadow-2xs">
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
                  : "bg-gray-100 text-gray-600 border border-gray-200"
              }`}
            >
              {stats.total}
            </span>
          </button>
        </Tooltip>

        {/* Warnings Filter Pill */}
        {stats.warned > 0 && (
          <Tooltip title={activeFilter === "warned" ? "Showing warnings (Click to reset)" : `Click to filter ${stats.warned} warned row(s)`}>
            <button
              type="button"
              onClick={() => handleFilterClick("warned")}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-none cursor-pointer text-xs font-medium transition-all border ${
                activeFilter === "warned"
                  ? "bg-orange-50 border-orange-500 text-orange-900 font-semibold"
                  : "bg-white/60 border-orange-200 text-orange-600 hover:bg-orange-50/80 hover:border-orange-300"
              }`}
            >
              <ExclamationCircleOutlined style={{ color: "#fa8c16" }} />
              <span>Warnings</span>
              <span
                className={`px-1.5 py-0 rounded-none text-[11px] font-bold ${
                  activeFilter === "warned"
                    ? "bg-orange-500 text-white"
                    : "bg-orange-100 text-orange-700 border border-orange-200"
                }`}
              >
                {stats.warned}
              </span>
            </button>
          </Tooltip>
        )}

        {/* Errors Filtered */}
        {stats.skipped > 0 && (
          <Tooltip title={activeFilter === "skipped" ? "Showing errors (Click to reset)" : `Click to filter ${stats.skipped} error(s)`}>
            <button
              type="button"
              onClick={() => handleFilterClick("skipped")}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-none cursor-pointer text-xs font-medium transition-all border ${
                activeFilter === "skipped"
                  ? "bg-red-50 border-red-500 text-red-900 font-semibold"
                  : "bg-white/60 border-red-200 text-red-600 hover:bg-red-50/80 hover:border-red-300"
              }`}
            >
              <CloseCircleOutlined style={{ color: "#ff4d4f" }} />
              <span>Errors</span>
              <span
                className={`px-1.5 py-0 rounded-none text-[11px] font-bold ${
                  activeFilter === "skipped"
                    ? "bg-red-600 text-white"
                    : "bg-red-100 text-red-700 border border-red-200"
                }`}
              >
                {stats.skipped}
              </span>
            </button>
          </Tooltip>
        )}

        {/* Ready to Import Filter Pill */}
        <Tooltip title={activeFilter === "ready" ? "Showing ready rows (Click to reset)" : `Click to filter ${stats.importable} ready row(s)`}>
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
              {stats.importable}
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
      {stats.skipped > 0 && (
        <Alert
          type="warning"
          showIcon
          icon={<ExclamationCircleOutlined />}
          className="mb-4"
          message={
            <span>
              <strong>{stats.skipped} rows</strong> have errors and will be skipped during import.
              Hover over the status icon to see details.
            </span>
          }
        />
      )}

      {/* Data Grid */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full w-full" style={{ "--ag-wrapper-border-radius": "0" } as React.CSSProperties}>
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
            getRowClass={getRowClass}
            onCellValueChanged={handleCellValueChanged}
            headerHeight={40}
            rowHeight={36}
          />
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between border-t mt-6">
        <span className="text-sm text-gray-500">
          {stats.importable > 0
            ? `${stats.importable} transport jobs will be imported`
            : "No valid rows to import"}
        </span>

        <div className="flex gap-2">
          <Button onClick={onBack} disabled={isImporting} className="rounded-none">
            Back
          </Button>
          <Button onClick={onCancel} disabled={isImporting} className="rounded-none">
            Cancel
          </Button>
          <Button
            type="primary"
            onClick={onImport}
            loading={isImporting}
            disabled={stats.importable === 0}
            className="rounded-none"
          >
            Import {stats.importable > 0 ? `${stats.importable} Transport Jobs` : ""}
          </Button>
        </div>
      </div>
    </div>
  );
}