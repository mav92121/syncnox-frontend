"use client";

import { useState } from "react";
import { Table, Select, Button, Alert } from "antd";
import type { ColumnsType } from "antd/es/table";
import { TransportColumnField } from "@/apis/transport-import.api";

interface TransportImportMappingStepProps {
  headers: string[];
  fields: TransportColumnField[];
  autoMap: Record<string, string>; // fieldId -> excel header
  sampleData: Record<string, unknown>[];
  isProcessing: boolean;
  onBack: () => void;
  onContinue: (apiMapping: Record<string, string>) => void;
}

type SampleRow = Record<string, unknown> & { key: number };

export default function TransportImportMappingStep({
  headers,
  fields,
  autoMap,
  sampleData,
  isProcessing,
  onBack,
  onContinue,
}: TransportImportMappingStepProps) {
  // Local mapping: fieldId -> excelHeader (initialised from auto-detection)
  const [localMapping, setLocalMapping] = useState<Record<string, string>>(() => ({ ...autoMap }));

  const fieldOptions = fields.map((f) => ({
    value: f.identifier,
    label: f.description,
  }));

  // Candidate Name is the core required field (mirrors the "address" gate in the jobs flow).
  const hasCoreColumn = Boolean(localMapping["candidate_name"]);
  const mappedCount = Object.keys(localMapping).filter((k) => localMapping[k]).length;

  const getFieldForExcelColumn = (excelColumn: string) =>
    Object.keys(localMapping).find((field) => localMapping[field] === excelColumn) || undefined;

  const handleMappingChange = (excelColumn: string, selectedField: string | undefined) => {
    const updated = { ...localMapping };

    // If this excel column was previously mapped to another field, remove that mapping
    const previousField = Object.keys(updated).find((f) => updated[f] === excelColumn);
    if (previousField && previousField !== selectedField) {
      delete updated[previousField];
    }

    if (selectedField) {
      updated[selectedField] = excelColumn;
    } else if (previousField) {
      delete updated[previousField];
    }

    setLocalMapping(updated);
  };

  const handleContinue = () => {
    onContinue({ ...localMapping });
  };

  const dynamicColumns = headers.map((excelCol) => ({
    title: (
      <div className="flex flex-col gap-2 min-w-[200px] mb-2">
        <Select
          showSearch
          optionFilterProp="label"
          filterOption={(input, option) =>
            (option?.label ?? "").toString().toLowerCase().includes(input.toLowerCase())
          }
          value={getFieldForExcelColumn(excelCol)}
          onChange={(val) => handleMappingChange(excelCol, val)}
          options={fieldOptions}
          style={{ width: "100%" }}
          placeholder="Not Mapped"
          allowClear
          disabled={isProcessing}
          className="font-normal [&_.ant-select-selector]:!rounded-none"
        />
        <div className="font-semibold text-gray-700">{excelCol}</div>
      </div>
    ),
    dataIndex: excelCol,
    key: excelCol,
    width: 250,
    ellipsis: true,
    render: (value: unknown) => (
      <div className="truncate" title={value === null || value === undefined ? "" : String(value)}>
        {value === null || value === undefined ? "" : String(value)}
      </div>
    ),
  }));

  const tableColumns: ColumnsType<SampleRow> = [
    {
      title: "",
      key: "index",
      render: (_: unknown, __: unknown, index: number) => (
        <span className="font-semibold text-gray-500">{index + 1}</span>
      ),
      width: 60,
      fixed: "left" as const,
    },
    ...dynamicColumns,
  ];

  const dataSource: SampleRow[] = sampleData.map((row, idx) => ({ ...row, key: idx }));

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="mb-2 text-gray-600 font-medium shrink-0">Review Mapped Columns</div>

      {/* Core Column Error Alert */}
      {!hasCoreColumn && (
        <Alert
          description='There has to be at least one column mapped to "Candidate Name" (required).'
          type="warning"
          showIcon
          className="mb-4 rounded-none"
        />
      )}

      {/* Scrollable Table Container */}
      <div className="flex-1 min-h-0 relative mb-3 border border-gray-200 overflow-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-track]:rounded [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb:hover]:bg-gray-400 [scrollbar-width:thin] [scrollbar-color:#c1c1c1_#f1f1f1] [&_.ant-table-thead>tr>th]:sticky [&_.ant-table-thead>tr>th]:top-0 [&_.ant-table-thead>tr>th]:z-10 [&_.ant-table-thead>tr>th]:!bg-gray-50 [&_.ant-table-container]:!overflow-visible [&_.ant-table-content]:!overflow-visible [&_.ant-table-cell-fix-left]:!sticky [&_.ant-table-cell-fix-left]:!z-11 [&_.ant-table-thead>tr>.ant-table-cell-fix-left]:!z-20 [&_.ant-table-thead>tr>.ant-table-cell-fix-left]:!top-0">
        <Table
          columns={tableColumns}
          dataSource={dataSource}
          pagination={false}
          size="small"
          scroll={{ x: "max-content" }}
        />
      </div>

      {/* Sticky Footer */}
      <div className="flex justify-between items-center pt-5 border-t bg-white shrink-0">
        <span className="text-xs text-gray-500">
          {mappedCount === 0
            ? "No columns mapped yet."
            : `${mappedCount} of ${headers.length} columns mapped.`}
        </span>

        <div className="flex gap-2">
          <Button onClick={onBack} disabled={isProcessing} className="rounded-none">
            Back
          </Button>
          <Button
            type="primary"
            onClick={handleContinue}
            disabled={!hasCoreColumn}
            loading={isProcessing}
            className="rounded-none"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}