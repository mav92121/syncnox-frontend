"use client";

import React, { useState, useEffect } from "react";
import { Modal, Spin, Badge, Tag, Button } from "antd";
import {
  FieldTemplate,
  getFieldTemplates,
} from "@/apis/custom-fields.api";
import { ApplyTemplateModal } from "./ApplyTemplateModal";

import {
  LayoutTemplate,
  Package,
  Users,
  Truck,
  Building,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Sliders,
  Layers,
  Sparkles,
} from "lucide-react";

interface TemplateGalleryModalProps {
  open: boolean;
  entityType: "job" | "vehicle" | "team_member" | "depot";
  onClose: () => void;
  onApplied: () => void;
}

export const TemplateGalleryModal: React.FC<TemplateGalleryModalProps> = ({
  open,
  entityType,
  onClose,
  onApplied,
}) => {
  const [templates, setTemplates] = useState<FieldTemplate[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [expandedTemplateId, setExpandedTemplateId] = useState<number | null>(null);
  const [selectedTemplateForApply, setSelectedTemplateForApply] = useState<FieldTemplate | null>(null);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await getFieldTemplates(entityType);
      setTemplates(data);
      // Preview off by default
      setExpandedTemplateId(null);
    } catch (err: any) {
      console.error("Failed to load templates", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadTemplates();
    }
  }, [open, entityType]);

  const getIconComponent = (iconName?: string | null) => {
    switch (iconName) {
      case "Users":
        return <Users className="w-5 h-5 text-indigo-600" />;
      case "Truck":
        return <Truck className="w-5 h-5 text-blue-600" />;
      case "Building":
        return <Building className="w-5 h-5 text-amber-600" />;
      case "Package":
      default:
        return <Package className="w-5 h-5 text-[#003220]" />;
    }
  };

  const getEntityLabel = (type: string) => {
    switch (type) {
      case "job":
        return "Jobs";
      case "vehicle":
        return "Vehicles";
      case "team_member":
        return "Team Members";
      case "depot":
        return "Depots";
      default:
        return type;
    }
  };

  return (
    <>
      <Modal
        open={open}
        onCancel={onClose}
        footer={null}
        centered
        width={760}
        title={
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 pr-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-[#003220]/10 border border-[#003220]/20 flex items-center justify-center rounded-none">
                <LayoutTemplate className="w-4 h-4 text-[#003220]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 m-0">
                  Custom Field Templates — {getEntityLabel(entityType)}
                </h3>
                <p className="text-[11px] text-gray-500 font-normal m-0 mt-0.5">
                  Pick a pre-configured template tailored to your industry use case. You can customize fields after applying.
                </p>
              </div>
            </div>
          </div>
        }
      >

        <div className="py-4 custom-scrollbar max-h-[70vh] overflow-y-auto pr-1 font-sans text-xs">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Spin size="default" />
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 border border-dashed border-gray-200">
              <Layers className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 font-semibold text-xs m-0">No templates available for {entityType}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {templates.map((tpl) => {
                const isExpanded = expandedTemplateId === tpl.id;

                return (
                  <div
                    key={tpl.id}
                    className={`border transition-all rounded-none bg-white ${
                      isExpanded
                        ? "border-[#003220] shadow-sm"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {/* Header bar of template card */}
                    <div className="p-4 flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3.5 flex-1">
                        <div className="p-2.5 bg-gray-50 border border-gray-200 shrink-0">
                          {getIconComponent(tpl.icon)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-bold text-gray-900 m-0">{tpl.name}</h4>
                            {tpl.category && (
                              <Tag className="m-0 text-[10px] uppercase tracking-wider font-semibold border-emerald-200 text-[#003220] bg-emerald-50 rounded-none">
                                {tpl.category}
                              </Tag>
                            )}
                            <Tag className="m-0 text-[10px] font-mono border-gray-200 text-gray-600 bg-gray-50 rounded-none">
                              {tpl.fields.length} Fields
                            </Tag>
                          </div>

                          <p className="text-xs text-gray-600 mt-1 mb-0 leading-relaxed">
                            {tpl.description || "Pre-configured industry fields ready for immediate use."}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => setExpandedTemplateId(isExpanded ? null : tpl.id)}
                          className="inline-flex items-center gap-1 border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-semibold px-2.5 py-1.5 rounded-none transition-colors cursor-pointer bg-white"
                        >
                          <span>Preview</span>
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <button
                          onClick={() => setSelectedTemplateForApply(tpl)}
                          className="inline-flex items-center gap-1.5 bg-[#003220] hover:bg-[#002417] text-white text-xs font-semibold px-3.5 py-1.5 rounded-none transition-colors cursor-pointer border-none"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Use Template</span>
                        </button>
                      </div>
                    </div>

                    {/* Expandable Preview Section */}
                    {isExpanded && (
                      <div className="border-t border-gray-100 bg-gray-50/60 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-700">
                            Included Custom Fields ({tpl.fields.length})
                          </span>
                        </div>

                        <div className="border border-gray-200 bg-white overflow-hidden rounded-none">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="bg-gray-50 border-b border-gray-200 text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                                <th className="py-2 px-3">Field Label</th>
                                <th className="py-2 px-3">Field Key</th>
                                <th className="py-2 px-3">Data Type</th>
                                <th className="py-2 px-3">Required</th>
                                <th className="py-2 px-3">Description / Note</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-gray-800">
                              {tpl.fields.map((f, idx) => (
                                <tr key={idx} className="hover:bg-gray-50/50">
                                  <td className="py-2 px-3 font-semibold text-gray-900">{f.label}</td>
                                  <td className="py-2 px-3 font-mono text-[11px] text-gray-500">{f.field_key}</td>
                                  <td className="py-2 px-3 capitalize font-mono text-[11px] text-gray-600">
                                    {f.data_type}
                                    {f.data_type === "select" && f.options && (
                                      <span className="text-gray-400 font-sans ml-1 text-[10px]">
                                        ({f.options.length} options)
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-2 px-3">
                                    {f.is_required ? (
                                      <span className="text-[10px] font-semibold text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5">
                                        Required
                                      </span>
                                    ) : (
                                      <span className="text-[10px] text-gray-400">Optional</span>
                                    )}
                                  </td>
                                  <td className="py-2 px-3 text-gray-500 text-[11px]">
                                    {f.description || "-"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Modal>

      {/* Confirmation & Apply Mode Modal */}
      <ApplyTemplateModal
        open={Boolean(selectedTemplateForApply)}
        template={selectedTemplateForApply}
        onClose={() => setSelectedTemplateForApply(null)}
        onApplied={() => {
          setSelectedTemplateForApply(null);
          onApplied();
          onClose();
        }}
      />
    </>
  );
};
