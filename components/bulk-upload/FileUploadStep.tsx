"use client";

import { useState } from "react";
import { Alert, Upload, message, DatePicker } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { useBulkUploadStore } from "@/store/bulkUpload.store";
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
    defaultScheduledDate,
    setDefaultScheduledDate,
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
    if (!defaultScheduledDate) {
      message.error("Please select a default scheduled date before uploading!");
      return Upload.LIST_IGNORE;
    }

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
        description={
          <div>
            <p>
              You can import orders from your Excel, CSV and tab-delimited file.
              Supported formats: .csv, .xlsx, .xls
            </p>
            <p className="mt-2">
              <a
                href="/sample-bulk-upload.csv"
                download
                className="text-blue-600 hover:text-blue-800 underline font-medium"
              >
                Download Sample Template
              </a>
            </p>
          </div>
        }
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

      {/* Default Scheduled Date */}
      <div className="space-y-2 mt-4">
        <label className="block text-sm font-medium text-gray-700">
          Default Scheduled Date <span className="text-red-500">*</span>
        </label>
        <DatePicker
          value={defaultScheduledDate ? dayjs(defaultScheduledDate) : null}
          onChange={(date: Dayjs | null) => {
            setDefaultScheduledDate(date ? date.format("YYYY-MM-DD") : null);
          }}
          format="YYYY-MM-DD"
          className="w-full"
          placeholder="Select default date for all jobs"
          disabled={isUploading}
        />
        <p className="text-xs text-gray-500 mt-2">
          This date will be applied to all jobs. If your Excel file has a
          "Scheduled Date" column, those dates will override this default.
        </p>
      </div>
    </div>
  );
};

export default FileUploadStep;
