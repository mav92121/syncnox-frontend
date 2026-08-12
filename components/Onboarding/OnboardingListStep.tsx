"use client";
import { useState } from "react";
import { Button, Typography, message } from "antd";
import { ArrowRight, Plus, Trash2, LucideIcon, FileSpreadsheet } from "lucide-react";
import { useOnboardingStore } from "@/store/onboarding.store";
import BulkImportModal from "@/components/BulkImport/BulkImportModal";

const { Text } = Typography;

interface OnboardingListStepProps<T extends { id: number }> {
  items: T[];
  itemLabelSingular: string;
  itemLabelPlural: string;
  entityType?: "vehicle" | "driver";
  Icon: LucideIcon;
  FormComponent: React.ComponentType<{ onSubmit: () => void }>;
  getItemDisplay: (item: T) => { name: string; secondary?: string };
  onNext: () => void;
  successMessage: string;
  emptyErrorMessage: string;
}

const OnboardingListStep = <T extends { id: number }>({
  items,
  itemLabelSingular,
  itemLabelPlural,
  entityType,
  Icon,
  FormComponent,
  getItemDisplay,
  onNext,
  successMessage,
  emptyErrorMessage,
}: OnboardingListStepProps<T>) => {
  const [showForm, setShowForm] = useState(items.length === 0);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const { isLoading } = useOnboardingStore();

  const handleItemAdded = () => {
    setShowForm(false);
    message.success(successMessage);
  };

  const handleContinue = () => {
    if (items.length === 0) {
      message.error(emptyErrorMessage);
      return;
    }
    onNext();
  };

  return (
    <div className="h-full p-3 flex flex-col">
      {/* Scrollable Content Area */}
      <div className="custom-scrollbar flex-1 overflow-auto pr-1">
        {/* Added Items List */}
        {items.length > 0 && (
          <div className="mb-3">
            <Text strong className="block mb-2 text-[13px]">
              Added {itemLabelPlural} ({items.length})
            </Text>
            {items.map((item) => {
              const display = getItemDisplay(item);
              return (
                <div
                  key={item.id}
                  className="py-2.5 px-3 bg-gray-50 mb-1.5 flex items-center gap-2"
                >
                  <Icon size={14} />
                  <span className="text-[13px]">{display.name}</span>
                  {display.secondary && (
                    <Text type="secondary" className="text-xs">
                      ({display.secondary})
                    </Text>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Form or Add Buttons */}
        {showForm ? (
          <div className="border border-gray-200">
            {/* Card Header with Close Button */}
            {items.length > 0 && (
              <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 bg-gray-50">
                <Text className="text-[13px] text-gray-600">
                  New{" "}
                  {itemLabelSingular.charAt(0).toUpperCase() +
                    itemLabelSingular.slice(1)}
                </Text>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                  title="Cancel"
                >
                  <Trash2 size={14} className="text-red-500 cursor-pointer" />
                </button>
              </div>
            )}
            {/* Form Content */}
            <div className="p-3">
              <FormComponent onSubmit={handleItemAdded} />
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button
              type="dashed"
              icon={<Plus size={14} />}
              onClick={() => setShowForm(true)}
              className="h-10 flex-1"
            >
              Add {items.length > 0 ? "another" : "a"} {itemLabelSingular}
            </Button>
            {entityType && (
              <Button
                icon={<FileSpreadsheet size={14} />}
                onClick={() => setBulkModalOpen(true)}
                className="h-10 border-dashed"
              >
                Import Excel/CSV
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pt-3 flex justify-between items-center shrink-0 border-t mt-2">
        {entityType && showForm && (
          <Button
            size="small"
            type="link"
            icon={<FileSpreadsheet size={14} />}
            onClick={() => setBulkModalOpen(true)}
            className="text-xs px-0"
          >
            Import via Excel/CSV
          </Button>
        )}
        <div className="ml-auto">
          <Button
            type="primary"
            onClick={handleContinue}
            loading={isLoading}
            disabled={items.length === 0}
            icon={<ArrowRight size={14} />}
            iconPosition="end"
          >
            Continue
          </Button>
        </div>
      </div>

      {entityType && (
        <BulkImportModal
          open={bulkModalOpen}
          onClose={() => setBulkModalOpen(false)}
          entityType={entityType}
          onSuccess={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default OnboardingListStep;

