"use client";

import { useState } from "react";
import { Modal, Steps, Typography, Flex, Button, Table, Alert, message } from "antd";
import {
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  FileSpreadsheet,
} from "lucide-react";
import {
  previewTransportImport,
  mapTransportImport,
  importTransportJobsExcel,
  TransportImportResponse,
  TransportImportPreview,
  TransportMapPreview,
} from "@/apis/transport-import.api";
import TransportImportUploadStep from "@/components/transport-import/TransportImportUploadStep";
import TransportImportMappingStep from "@/components/transport-import/TransportImportMappingStep";
import TransportImportPreviewStep from "@/components/transport-import/TransportImportPreviewStep";

const { Text, Title } = Typography;

interface TransportImportModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const STEPS = [{ title: "Upload File" }, { title: "Map Columns" }, { title: "Preview & Import" }];

interface ApiError extends Error {
  response?: { data?: { detail?: string } };
}

export default function TransportImportModal({
  open,
  onClose,
  onSuccess,
}: TransportImportModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<TransportImportPreview | null>(null);
  const [columnMapping, setColumnMapping] = useState<Record<string, string> | null>(null);
  const [mappedPreview, setMappedPreview] = useState<TransportMapPreview | null>(null);
  const [importResult, setImportResult] = useState<TransportImportResponse | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [isMapping, setIsMapping] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleReset = () => {
    setCurrentStep(1);
    setFile(null);
    setPreview(null);
    setColumnMapping(null);
    setMappedPreview(null);
    setImportResult(null);
    setIsUploading(false);
    setIsMapping(false);
    setIsImporting(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  // Step 1 -> 2: upload + parse + auto-detect columns
  const handleFileSelected = async (selectedFile: File) => {
    setIsUploading(true);
    setPreview(null);
    setMappedPreview(null);
    setColumnMapping(null);
    setImportResult(null);
    setFile(selectedFile);
    try {
      const response = await previewTransportImport(selectedFile);
      setPreview(response);
      setCurrentStep(2);
      message.success(
        `Parsed ${response.total_rows} row(s). Auto-detected ${Object.keys(response.auto_map).length} mapped columns.`
      );
    } catch (error) {
      message.error((error as ApiError).response?.data?.detail || "Failed to parse the file");
    } finally {
      setIsUploading(false);
    }
  };

  // Step 2 -> 3: apply mapping + validate rows
  const handleMappingContinue = async (apiMapping: Record<string, string>) => {
    if (!file) return;
    setIsMapping(true);
    try {
      const response = await mapTransportImport(file, apiMapping);
      setColumnMapping(apiMapping);
      setMappedPreview(response);
      setCurrentStep(3);
      if (response.errors_count > 0) {
        message.warning(
          `${response.errors_count} row(s) failed validation and will be skipped on import.`
        );
      }
    } catch (error) {
      message.error((error as ApiError).response?.data?.detail || "Failed to validate the file");
    } finally {
      setIsMapping(false);
    }
  };

  // Step 3: run the import
  const handleImport = async () => {
    if (!file) return;
    setIsImporting(true);
    try {
      const response = await importTransportJobsExcel(file, columnMapping || undefined);
      setImportResult(response);
      message.success(`Successfully imported ${response.imported} transport jobs`);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      const err = error as ApiError;
      const errorMsg = err.response?.data?.detail || err.message || "Failed to import transport jobs file";
      message.error(typeof errorMsg === "string" ? errorMsg : JSON.stringify(errorMsg));
    } finally {
      setIsImporting(false);
    }
  };

  const getModalWidth = () => {
    if (currentStep === 1) return 1160;
    if (currentStep === 2) return 1260;
    return 1420; // Step 3
  };

  const getModalClassName = () => {
    if (currentStep === 1) return "bulk-upload-modal-compact";
    return "bulk-upload-modal-large";
  };

  // After import: render the completion summary
  if (importResult) {
    return (
      <Modal
        open={open}
        onCancel={handleClose}
        maskClosable={false}
        footer={null}
        title={
          <Flex align="center" gap={8}>
            <FileSpreadsheet className="text-primary" size={20} />
            <span className="text-xl font-semibold">Bulk Import Transport Jobs</span>
          </Flex>
        }
        width={640}
        centered
        destroyOnClose
        className="bulk-upload-modal-compact"
        styles={{
          body: { padding: "20px 24px", display: "flex", flexDirection: "column", alignItems: "center" },
          mask: { backdropFilter: "blur(4px)" },
        }}
      >
        <div className="text-center w-full">
          <CheckCircle2 size={52} className="text-primary mx-auto mb-4" />
          <Title level={4} className="m-0 mb-2 font-bold text-gray-900">
            Import Complete!
          </Title>
          <Text className="text-gray-500 text-sm block mb-6">
            Successfully imported <strong>{importResult.imported}</strong> of{" "}
            <strong>{importResult.total_rows}</strong> transport jobs.
          </Text>

          {importResult.skipped > 0 && (
            <Alert
              type="warning"
              showIcon
              message={
                <span className="font-semibold text-xs text-amber-900">
                  {importResult.skipped} row(s) were skipped due to validation errors.
                </span>
              }
              className="mb-6 rounded-none text-left"
            />
          )}

          {importResult.row_results && importResult.row_results.length > 0 && (
            <div className="mb-6 text-left w-full">
              <Text className="text-xs font-bold text-gray-700 flex items-center gap-1.5 mb-2">
                <AlertCircle size={14} className="text-amber-600" />
                Row Warnings &amp; Skipped Details:
              </Text>
              <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-none">
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
                      render: (_: unknown, record: NonNullable<TransportImportResponse["row_results"]>[number]) => {
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

          <Flex justify="center" gap={12} className="pt-4 border-t border-gray-100 w-full mt-2">
            <Button icon={<RefreshCw size={14} />} onClick={handleReset} className="rounded-none">
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
      </Modal>
    );
  }

  // 3-step flow (before import)
  return (
    <Modal
      open={open}
      onCancel={handleClose}
      maskClosable={false}
      footer={null}
      title={
        <Flex align="center" gap={8}>
          <FileSpreadsheet className="text-primary" size={20} />
          <span className="text-xl font-semibold">Bulk Import Transport Jobs</span>
        </Flex>
      }
      width={getModalWidth()}
      centered
      destroyOnClose
      className={getModalClassName()}
      styles={{
        body: { flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", minHeight: 0 },
        header: { borderRadius: 0, paddingBottom: "16px" },
        mask: { backdropFilter: "blur(4px)" },
      }}
    >
      <div className="flex flex-col flex-1 min-h-0">
        <Steps current={currentStep - 1} items={STEPS} className="mb-6 shrink-0" size="small" />

        <div className="mt-6 flex-1 min-h-0 flex flex-col">
          {currentStep === 1 && (
            <TransportImportUploadStep
              isUploading={isUploading}
              onFileSelected={handleFileSelected}
            />
          )}

          {currentStep === 2 && preview && (
            <TransportImportMappingStep
              headers={preview.headers}
              fields={preview.columns}
              autoMap={preview.auto_map}
              sampleData={preview.sample_data}
              isProcessing={isMapping}
              onBack={() => setCurrentStep(1)}
              onContinue={handleMappingContinue}
            />
          )}

          {currentStep === 3 && mappedPreview && (
            <TransportImportPreviewStep
              rows={mappedPreview.data}
              totalRows={mappedPreview.total_rows}
              importableRows={mappedPreview.importable_rows}
              errorsCount={mappedPreview.errors_count}
              warningsCount={mappedPreview.warnings_count}
              fieldLabels={Object.fromEntries(
                (preview?.columns || []).map((c) => [c.identifier, c.description])
              )}
              isImporting={isImporting}
              onBack={() => setCurrentStep(2)}
              onCancel={handleClose}
              onImport={handleImport}
            />
          )}
        </div>
      </div>
    </Modal>
  );
}

function SummaryCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: "emerald" | "blue" | "amber";
}) {
  const styles: Record<string, { bg: string; border: string; text: string; labelText: string }> = {
    emerald: {
      bg: "bg-[#f4faf7]",
      border: "border-emerald-200",
      text: "text-[#003220]",
      labelText: "text-emerald-800"
    },
    blue: {
      bg: "bg-[#f5f8ff]",
      border: "border-blue-200",
      text: "text-blue-900",
      labelText: "text-blue-800"
    },
    amber: {
      bg: "bg-[#fffbeb]",
      border: "border-amber-200",
      text: "text-amber-900",
      labelText: "text-amber-800"
    },
  };
  const config = styles[color];
  return (
    <div className={`border py-5 px-4 rounded-none text-center transition-all ${config.bg} ${config.border}`}>
      <p className={`text-[11px] font-semibold tracking-wider uppercase m-0 ${config.labelText} opacity-85`}>
        {label}
      </p>
      <p className={`text-3xl font-black mt-1.5 mb-0 tracking-tight ${config.text}`}>
        {value}
      </p>
    </div>
  );
}
