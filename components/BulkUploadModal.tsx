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
      footer={null}
      width="70vw"
      destroyOnHidden
    >
      <div>
        <Steps
          current={currentStep - 1}
          items={steps}
          className="mb-3"
          size="small"
        />

        {/* Render only the current step */}
        <div className="mt-6">
          {currentStep === 1 && <FileUploadStep />}
          {currentStep === 2 && (
            <ColumnMappingStep onNext={() => setCurrentStep(3)} />
          )}
          {currentStep === 3 && <DataPreviewStep onFinish={handleFinish} />}
        </div>
      </div>
    </Modal>
  );
};

export default BulkUploadModal;
