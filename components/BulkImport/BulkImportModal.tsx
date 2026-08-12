"use client";

import { useState } from "react";
import { Modal, Steps, Typography, Button, Flex } from "antd";
import { FileSpreadsheet, CheckCircle2 } from "lucide-react";
import BulkImportFileUploadStep from "./BulkImportFileUploadStep";
import BulkImportColumnMappingStep from "./BulkImportColumnMappingStep";
import BulkImportDataPreviewStep from "./BulkImportDataPreviewStep";

const { Text, Title } = Typography;

interface BulkImportModalProps {
  open: boolean;
  onClose: () => void;
  entityType: "vehicle" | "driver";
  onSuccess?: () => void;
}

export default function BulkImportModal({
  open,
  onClose,
  entityType,
  onSuccess,
}: BulkImportModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [rawHeaders, setRawHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, any>[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [importedCount, setImportedCount] = useState<number | null>(null);

  const entityTitle = entityType === "vehicle" ? "Vehicles" : "Drivers";

  const handleReset = () => {
    setCurrentStep(1);
    setRawHeaders([]);
    setRawRows([]);
    setMapping({});
    setImportedCount(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleFileParsed = (data: { rawHeaders: string[]; rawRows: Record<string, any>[] }) => {
    setRawHeaders(data.rawHeaders);
    setRawRows(data.rawRows);
    setCurrentStep(2);
  };

  const handleMappingConfirmed = (confirmedMapping: Record<string, string>) => {
    setMapping(confirmedMapping);
    setCurrentStep(3);
  };

  const handleImportSuccess = (count: number) => {
    setImportedCount(count);
    if (onSuccess) {
      onSuccess();
    }
  };

  const steps = [
    { title: "Upload File" },
    { title: "Map Columns" },
    { title: "Preview & Import" },
  ];

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      title={
        <Flex align="center" gap={8}>
          <FileSpreadsheet className="text-primary-500" size={20} />
          <span className="text-xl font-semibold">Bulk Import {entityTitle}</span>
        </Flex>
      }
      width="90vw"
      centered
      className="bulk-import-modal"
      styles={{
        body: { flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 },
        header: { borderRadius: 0, paddingBottom: '16px' },
        mask: { backdropFilter: 'blur(4px)' }
      }}
      destroyOnClose
    >
      <div className="py-1 flex flex-col">
        {importedCount !== null ? (
          <div className="text-center py-8">
            <CheckCircle2 size={52} className="text-emerald-500 mx-auto mb-3" />
            <Title level={4} className="m-0 mb-1">
              Import Complete!
            </Title>
            <Text type="secondary" className="text-sm block mb-6">
              Successfully imported {importedCount} {entityTitle.toLowerCase()}.
            </Text>
            <Button type="primary" size="large" onClick={handleClose}>
              Done
            </Button>
          </div>
        ) : (
          <>
            <Steps
              current={currentStep - 1}
              items={steps}
              size="small"
              className="mb-4"
            />

            {currentStep === 1 && (
              <BulkImportFileUploadStep
                entityType={entityType}
                onFileParsed={handleFileParsed}
              />
            )}

            {currentStep === 2 && (
              <BulkImportColumnMappingStep
                entityType={entityType}
                rawHeaders={rawHeaders}
                rawRows={rawRows}
                initialMapping={mapping}
                onMappingConfirmed={handleMappingConfirmed}
                onBack={() => setCurrentStep(1)}
              />
            )}

            {currentStep === 3 && (
              <BulkImportDataPreviewStep
                entityType={entityType}
                rawRows={rawRows}
                mapping={mapping}
                onBack={() => setCurrentStep(2)}
                onSuccess={handleImportSuccess}
              />
            )}
          </>
        )}
      </div>
    </Modal>
  );
}
