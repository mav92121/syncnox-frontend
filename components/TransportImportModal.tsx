"use client";

import { useState } from "react";
import { Modal, Steps, Typography, Button, Flex, Upload, Table, Alert, message } from "antd";
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Bus,
  ArrowRight,
  FileSpreadsheet,
  RefreshCw,
} from "lucide-react";
import { importTransportJobsExcel, TransportImportResponse } from "@/apis/transport-import.api";

const { Text, Title } = Typography;
const { Dragger } = Upload;

interface TransportImportModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function TransportImportModal({
  open,
  onClose,
  onSuccess,
}: TransportImportModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [importResult, setImportResult] = useState<TransportImportResponse | null>(null);

  const handleReset = () => {
    setCurrentStep(1);
    setFile(null);
    setIsUploading(false);
    setImportResult(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleFileSelect = (selectedFile: File) => {
    const isExcelOrCsv =
      selectedFile.name.endsWith(".xlsx") ||
      selectedFile.name.endsWith(".xls") ||
      selectedFile.name.endsWith(".csv");

    if (!isExcelOrCsv) {
      message.error("Please select a valid Excel (.xlsx, .xls) or CSV (.csv) file");
      return false;
    }

    setFile(selectedFile);
    return false;
  };

  const handleStartImport = async () => {
    if (!file) {
      message.error("Please upload a transport job schedule file first");
      return;
    }

    setIsUploading(true);
    try {
      const response = await importTransportJobsExcel(file);
      setImportResult(response);
      setCurrentStep(2);
      message.success(`Successfully imported ${response.imported} transport jobs`);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.detail || err.message || "Failed to import transport jobs file";
      message.error(typeof errorMsg === "string" ? errorMsg : JSON.stringify(errorMsg));
    } finally {
      setIsUploading(false);
    }
  };

  const steps = [{ title: "Upload Transport File" }, { title: "Import Summary" }];

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      maskClosable={false}
      footer={null}
      title={
        <Flex align="center" gap={10} className="pb-1">
          <div className="w-8 h-8 rounded-none bg-[#003220] flex items-center justify-center text-white shrink-0">
            <Bus size={18} />
          </div>
          <div>
            <Title level={5} className="m-0 text-gray-900 font-bold leading-tight">
              Import Transport Jobs
            </Title>
            <Text className="text-xs text-gray-500 font-normal">
              Bulk import candidate shuttle schedules, shift times & station mappings
            </Text>
          </div>
        </Flex>
      }
      width={760}
      centered
      className="transport-import-modal"
      styles={{
        body: { padding: "16px 24px 24px", borderRadius: 0 },
        header: { borderRadius: 0, paddingBottom: "12px", borderBottom: "1px solid #e5e7eb" },
        mask: { backdropFilter: "blur(4px)" },
      }}
      destroyOnClose
    >
      <div className="flex flex-col">
        <Steps
          current={currentStep - 1}
          items={steps}
          className="mb-5"
          size="small"
        />

        {/* Step 1: Upload File */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="bg-emerald-50/70 border border-emerald-200/80 p-3.5 rounded-none flex items-start gap-3">
              <Bus className="text-[#003220] shrink-0 mt-0.5" size={18} />
              <div className="text-xs text-gray-700 leading-relaxed">
                <span className="font-bold text-[#003220]">Supported Columns:</span> Candidate Name, Phone, Shift Start/End Hour, Pickup Station / Address, Dropoff Station / Address, Pickup Type.
                Station names will automatically resolve using your tenant's <span className="font-semibold underline">Location Mappings</span>.
              </div>
            </div>

            <Dragger
              beforeUpload={handleFileSelect}
              showUploadList={false}
              multiple={false}
              accept=".xlsx,.xls,.csv"
              className="bg-gray-50/80 hover:bg-emerald-50/30 border-2 border-dashed border-gray-300 hover:border-emerald-500 rounded-none p-6 transition-all cursor-pointer"
            >
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="w-12 h-12 rounded-none bg-emerald-100/80 text-[#003220] flex items-center justify-center mb-1">
                  <UploadCloud size={24} />
                </div>
                {file ? (
                  <div className="space-y-1 text-center">
                    <p className="text-sm font-bold text-gray-900 flex items-center justify-center gap-1.5">
                      <FileSpreadsheet size={16} className="text-emerald-700" />
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024).toFixed(1)} KB • Click or drag to replace
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-gray-800">
                      Click or drag transport Excel (.xlsx, .xls) / CSV file here
                    </p>
                    <p className="text-xs text-gray-500">
                      Supports files up to 10MB
                    </p>
                  </>
                )}
              </div>
            </Dragger>

            <Flex justify="end" gap={8} className="pt-3 border-t border-gray-100">
              <Button onClick={handleClose} className="rounded-none">
                Cancel
              </Button>
              <Button
                type="primary"
                onClick={handleStartImport}
                loading={isUploading}
                disabled={!file}
                className="bg-[#003220] hover:bg-[#002417] rounded-none px-6 font-medium"
                icon={<ArrowRight size={15} />}
              >
                Import Transport Jobs
              </Button>
            </Flex>
          </div>
        )}

        {/* Step 2: Import Summary */}
        {currentStep === 2 && importResult && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-none text-center">
                <p className="text-xs text-emerald-800 font-medium">Created Jobs</p>
                <p className="text-2xl font-extrabold text-[#003220] m-0">
                  {importResult.imported}
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-none text-center">
                <p className="text-xs text-blue-800 font-medium">Total Rows</p>
                <p className="text-2xl font-extrabold text-blue-900 m-0">
                  {importResult.total_rows}
                </p>
              </div>
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-none text-center">
                <p className="text-xs text-amber-800 font-medium">Skipped / Errors</p>
                <p className="text-2xl font-extrabold text-amber-900 m-0">
                  {importResult.skipped}
                </p>
              </div>
            </div>

            {importResult.row_results && importResult.row_results.length > 0 && (
              <div className="space-y-2">
                <Text className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <AlertCircle size={14} className="text-amber-600" />
                  Row Warnings & Skipped Details:
                </Text>
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-none">
                  <Table
                    dataSource={importResult.row_results}
                    rowKey="row"
                    pagination={false}
                    size="small"
                    className="text-xs"
                    columns={[
                      { title: "Excel Row", dataIndex: "row", width: 90 },
                      {
                        title: "Status",
                        dataIndex: "status",
                        width: 100,
                        render: (status: string) => (
                          <span
                            className={
                              status === "imported"
                                ? "text-emerald-700 font-bold"
                                : status === "warned"
                                ? "text-amber-600 font-semibold"
                                : "text-red-600 font-bold"
                            }
                          >
                            {status.toUpperCase()}
                          </span>
                        ),
                      },
                      {
                        title: "Details",
                        render: (_, record) => {
                          const msgs = [...(record.errors || []), ...(record.warnings || [])];
                          return msgs.length > 0 ? (
                            <span className="text-gray-700">{msgs.join("; ")}</span>
                          ) : (
                            <span className="text-gray-400">OK</span>
                          );
                        },
                      },
                    ]}
                  />
                </div>
              </div>
            )}

            <Alert
              type="success"
              showIcon
              icon={<CheckCircle2 className="text-emerald-700" size={18} />}
              message={<span className="font-bold text-xs text-emerald-950">Import Completed ({importResult.success_rate}%)</span>}
              description={
                <span className="text-xs text-emerald-900">
                  {importResult.imported} transport jobs have been created and added to your Draft Jobs list.
                </span>
              }
              className="rounded-none border-emerald-200 bg-emerald-50/80"
            />

            <Flex justify="end" gap={8} className="pt-3 border-t border-gray-100">
              <Button
                icon={<RefreshCw size={14} />}
                onClick={handleReset}
                className="rounded-none"
              >
                Import Another File
              </Button>
              <Button
                type="primary"
                onClick={handleClose}
                className="bg-[#003220] hover:bg-[#002417] rounded-none px-6 font-semibold"
              >
                Done
              </Button>
            </Flex>
          </div>
        )}
      </div>
    </Modal>
  );
}
