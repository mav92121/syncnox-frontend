"use client";

import { useState } from "react";
import { Alert, Upload, message } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd";
import { useBulkUploadStore } from "@/zustand/bulkUploadStore";
import { uploadBulkFile } from "@/apis/bulk-upload.api";

const { Dragger } = Upload;

const FileUploadStep = () => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const {
    setUploadedFile,
    setUploadResponse,
    setCurrentStep,
    setColumnMapping,
  } = useBulkUploadStore();

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const response = await uploadBulkFile(file);

      setUploadedFile(file);
      setUploadResponse(response);

      // Initialize empty mapping (will be populated in ColumnMappingStep)
      setColumnMapping({});

      message.success("File uploaded successfully!");
      setCurrentStep(2); // Move to column mapping step
    } catch (error: any) {
      message.error(error.response?.data?.detail || "Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  const customRequest = async (options: any) => {
    const { file, onSuccess, onError } = options;

    try {
      await handleUpload(file);
      onSuccess("ok");
    } catch (err) {
      onError(err);
    }
  };

  const beforeUpload = (file: File) => {
    const isValidType =
      file.type === "text/csv" ||
      file.type === "application/vnd.ms-excel" ||
      file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    if (!isValidType) {
      message.error("You can only upload CSV or Excel files!");
      return Upload.LIST_IGNORE;
    }

    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      message.error("File must be smaller than 10MB!");
      return Upload.LIST_IGNORE;
    }

    return true; // Allow upload
  };

  return (
    <div className="space-y-6">
      {/* Info Section */}
      <Alert
        message="Import Orders"
        description="You can import orders from your Excel, CSV and tab-delimited file. Supported formats: .csv, .xlsx, .xls"
        type="info"
        showIcon
      />

      {/* Upload Area */}
      <Dragger
        name="file"
        fileList={fileList}
        onChange={({ fileList }) => setFileList(fileList)}
        beforeUpload={beforeUpload}
        customRequest={customRequest}
        accept=".csv,.xlsx,.xls"
        disabled={isUploading}
        showUploadList={{
          showRemoveIcon: !isUploading,
        }}
        className="bg-white"
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined style={{ fontSize: 48, color: "#1890ff" }} />
        </p>
        <p className="ant-upload-text text-base">
          Drag & drop or <span className="text-blue-600">Browse</span>
        </p>
        <p className="ant-upload-hint text-sm text-gray-500">
          Supported: CSV, Excel or Tab-delimited text files
        </p>
      </Dragger>
    </div>
  );
};

export default FileUploadStep;
