"use client";

import { useState, useEffect } from "react";
import { Table, Select, Button, Checkbox, Alert, message } from "antd";
import { useBulkUploadStore } from "@/store/bulkUpload.store";
import { geocodeBulkData } from "@/apis/bulk-upload.api";

interface ColumnMappingStepProps {
  onNext: () => void;
}

const ColumnMappingStep = ({ onNext }: ColumnMappingStepProps) => {
  const {
    uploadResponse,
    uploadedFile,
    columnMapping,
    setColumnMapping,
    saveAsDefault,
    setSaveAsDefault,
    setGeocodedData,
    setIsGeocoding,
    defaultScheduledDate,
  } = useBulkUploadStore();

  const [localMapping, setLocalMapping] = useState<Record<string, string>>({});
  const [hasLocationColumn, setHasLocationColumn] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (uploadResponse) {
      // Initialize local mapping with detected mappings from backend
      const initial: Record<string, string> = {};
      uploadResponse.columns.forEach((col) => {
        if (col.mapping) {
          // Use the mapping value directly from backend response
          initial[col.identifier] = col.mapping;
        }
      });
      setLocalMapping(initial);
      setColumnMapping(initial);
      checkLocationMapping(initial);
    }
  }, [uploadResponse]);

  const checkLocationMapping = (mapping: Record<string, string>) => {
    const hasAddress = Boolean(
      "address_formatted" in mapping &&
        mapping.address_formatted &&
        mapping.address_formatted !== "not_mapped"
    );
    setHasLocationColumn(hasAddress);
  };

  const handleMappingChange = (
    identifier: string,
    columnName: string | undefined
  ) => {
    const updated = { ...localMapping };
    if (!columnName) {
      delete updated[identifier];
    } else {
      updated[identifier] = columnName;
    }
    setLocalMapping(updated);
    checkLocationMapping(updated);
  };

  const handleContinue = async () => {
    if (!hasLocationColumn) {
      message.error("There has to be at least one column defining location");
      return;
    }

    if (!uploadedFile || !uploadResponse) {
      message.error("No file uploaded");
      return;
    }

    setIsProcessing(true);
    setIsGeocoding(true);

    try {
      // Create reverse mapping for API
      const apiMapping: Record<string, string> = {};
      Object.entries(localMapping).forEach(([identifier, columnName]) => {
        apiMapping[identifier] = columnName;
      });

      const response = await geocodeBulkData(
        uploadedFile,
        apiMapping,
        defaultScheduledDate
      );

      setColumnMapping(apiMapping);
      setGeocodedData(response.data);
      setIsGeocoding(false);
      onNext();
    } catch (error: any) {
      message.error(error.response?.data?.detail || "Failed to geocode data");
      setIsGeocoding(false);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!uploadResponse) {
    return null;
  }

  const availableColumns = uploadResponse.sample_data[0]
    ? Object.keys(uploadResponse.sample_data[0])
    : [];

  const mappingOptions = availableColumns.map((col) => ({
    value: col,
    label: col,
  }));

  // Table should show: Job Field -> Excel Column mapping
  const tableData = uploadResponse.columns.map((col) => ({
    key: col.index,
    identifier: col.identifier, // Job field identifier (e.g., "address_formatted")
    description: col.description, // Job field description (e.g., "Delivery Address *")
    mapping: localMapping[col.identifier] || undefined, // Excel column name or undefined
    sample: col.sample_value, // Sample value from Excel
  }));

  const columns = [
    {
      title: "Field", // Job model field
      dataIndex: "description",
      key: "description",
      width: "30%",
    },
    {
      title: "Maps To", // Excel column
      dataIndex: "mapping",
      key: "mapping",
      width: "30%",
      render: (value: string | undefined, record: any) => (
        <Select
          value={value}
          onChange={(val) => handleMappingChange(record.identifier, val)}
          options={mappingOptions}
          style={{ width: "100%" }}
          placeholder="Not Mapped"
          allowClear
        />
      ),
    },
    {
      title: "Sample Value", // From Excel
      dataIndex: "sample",
      key: "sample",
      width: "40%",
      ellipsis: true,
    },
  ];

  return (
    <div className="flex flex-col" style={{ height: "calc(70vh - 120px)" }}>
      {/* Location Error Alert */}
      {!hasLocationColumn && (
        <Alert
          description="There has to be at least one column defining location (address)"
          type="warning"
          showIcon
        />
      )}

      {/* Scrollable Table Container */}
      <div className="flex-1 overflow-y-auto custom-scrollbar mb-4">
        <Table
          columns={columns}
          dataSource={tableData}
          pagination={false}
          size="small"
        />
      </div>

      {/* Sticky Footer */}
      <div className="flex justify-between items-center pt-4 border-t bg-white">
        <Checkbox
          checked={saveAsDefault}
          onChange={(e) => setSaveAsDefault(e.target.checked)}
        >
          Save this mapping as my default mapping
        </Checkbox>

        <Button
          type="primary"
          onClick={handleContinue}
          disabled={!hasLocationColumn}
          loading={isProcessing}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default ColumnMappingStep;
