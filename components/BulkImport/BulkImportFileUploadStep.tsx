"use client";

import { useState } from "react";
import { Upload, message, Button } from "antd";
import { UploadCloud, Download, AlertCircle } from "lucide-react";
import * as XLSX from "xlsx";
import { downloadVehicleTemplate } from "@/apis/vehicle.api";
import { downloadTeamTemplate } from "@/apis/team.api";

interface BulkImportFileUploadStepProps {
  entityType: "vehicle" | "driver";
  onFileParsed: (data: { rawHeaders: string[]; rawRows: Record<string, any>[] }) => void;
}

export default function BulkImportFileUploadStep({
  entityType,
  onFileParsed,
}: BulkImportFileUploadStepProps) {
  const [fileList, setFileList] = useState<any[]>([]);
  const [isParsing, setIsParsing] = useState(false);

  const entityTitle = entityType === "vehicle" ? "Vehicles" : "Drivers";

  const handleDownloadTemplate = async () => {
    try {
      if (entityType === "vehicle") {
        await downloadVehicleTemplate();
      } else {
        await downloadTeamTemplate();
      }
      message.success("Sample template downloaded");
    } catch (err) {
      message.error("Failed to download template");
    }
  };

  const processFile = (file: File) => {
    setIsParsing(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Parse JSON rows with raw values
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

        if (rawJson.length === 0) {
          message.error("The uploaded file is empty");
          setIsParsing(false);
          return;
        }

        // Extract raw headers from first row keys
        const headers: string[] = Object.keys(rawJson[0]);

        onFileParsed({
          rawHeaders: headers,
          rawRows: rawJson,
        });
      } catch (err: any) {
        message.error("Failed to parse file: " + (err.message || "Invalid file format"));
      } finally {
        setIsParsing(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="space-y-4 py-2">
      {/* Template banner */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <AlertCircle size={16} className="text-blue-600 shrink-0" />
          <span className="text-xs text-blue-900">
            Need the standard format for {entityTitle.toLowerCase()}? Download sample template.
          </span>
        </div>
        <Button
          size="small"
          type="link"
          icon={<Download size={14} />}
          onClick={handleDownloadTemplate}
          className="text-xs font-medium px-1"
        >
          Download CSV
        </Button>
      </div>

      <Upload.Dragger
        name="file"
        multiple={false}
        fileList={fileList}
        beforeUpload={(file) => {
          setFileList([file]);
          processFile(file);
          return false;
        }}
        onRemove={() => setFileList([])}
        accept=".csv,.xlsx,.xls"
        className="my-3 border-dashed bg-gray-50/50 hover:bg-gray-50"
        disabled={isParsing}
      >
        <p className="flex justify-center mb-2">
          <UploadCloud size={40} className="text-primary-500" />
        </p>
        <p className="ant-upload-text text-sm font-semibold text-gray-800">
          Click or drag Excel/CSV file to upload
        </p>
        <p className="ant-upload-hint text-xs text-gray-500">
          Supports .csv, .xlsx, .xls spreadsheets
        </p>
      </Upload.Dragger>
    </div>
  );
}
