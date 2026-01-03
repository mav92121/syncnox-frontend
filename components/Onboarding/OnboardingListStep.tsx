"use client";
import { useState } from "react";
import { Button, Typography, message } from "antd";
import { ArrowRight, Plus, Trash2, LucideIcon } from "lucide-react";

const { Text } = Typography;

interface OnboardingListStepProps<T extends { id: number }> {
  items: T[];
  itemLabelSingular: string;
  itemLabelPlural: string;
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
  Icon,
  FormComponent,
  getItemDisplay,
  onNext,
  successMessage,
  emptyErrorMessage,
}: OnboardingListStepProps<T>) => {
  const [showForm, setShowForm] = useState(items.length === 0);

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

        {/* Form or Add Button */}
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
          <Button
            type="dashed"
            icon={<Plus size={14} />}
            onClick={() => setShowForm(true)}
            className="h-10 w-full"
          >
            Add {items.length > 0 ? "another" : "a"} {itemLabelSingular}
          </Button>
        )}
      </div>

      {/* Footer */}
      <div className="pt-3 flex justify-end shrink-0">
        <Button
          type="primary"
          onClick={handleContinue}
          disabled={items.length === 0}
          icon={<ArrowRight size={14} />}
          iconPosition="end"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default OnboardingListStep;
