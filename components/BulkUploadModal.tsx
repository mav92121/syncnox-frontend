"use client";

import { Modal, Steps } from "antd";
import { useBulkUploadStore } from "@/store/bulkUpload.store";
import FileUploadStep from "./bulk-upload/FileUploadStep";
import ColumnMappingStep from "./bulk-upload/ColumnMappingStep";
import DataPreviewStep from "./bulk-upload/DataPreviewStep";

interface BulkUploadModalProps {
  open: boolean;
  onClose: () => void;
}

const BulkUploadModal = ({ open, onClose }: BulkUploadModalProps) => {
  const { currentStep, setCurrentStep, reset } = useBulkUploadStore();

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFinish = () => {
    handleClose();
  };

  const steps = [
    { title: "Upload File" },
    { title: "Map Columns" },
    { title: "Preview & Import" },
  ];

  return (
    <Modal
      title={<span className="text-xl font-semibold">Bulk Upload Jobs</span>}
      open={open}
      onCancel={handleClose}
      maskClosable={false}
      footer={null}
      width="90vw"
      centered
      className="bulk-upload-modal"
      styles={{
        body: { flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 },
        header: { borderRadius: 0, paddingBottom: '16px' },
        mask: { backdropFilter: 'blur(4px)' }
      }}
    >
      <div>
        <Steps
          current={currentStep - 1}
          items={steps}
          className="mb-3"
          size="small"
        />

        {/* Render only the current step */}
        <div className="mt-4 flex-1 min-h-0 flex flex-col">
          {currentStep === 1 && <FileUploadStep />}
          {currentStep === 2 && (
            <ColumnMappingStep onNext={() => setCurrentStep(3)} />
          )}
          {currentStep === 3 && (
            <DataPreviewStep
              onFinish={handleFinish}
              onBack={() => setCurrentStep(2)}
            />
          )}
        </div>
      </div>
    </Modal>
  );
};

export default BulkUploadModal;
