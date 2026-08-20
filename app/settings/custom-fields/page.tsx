"use client";

import React, { useState, useEffect } from "react";
import {
  CustomFieldDefinition,
  FieldSurfaces,
  getCustomFields,
  createCustomField,
  updateCustomField,
  deleteCustomField,
  resetCustomFields,
} from "@/apis/custom-fields.api";
import {
  Plus,
  RotateCcw,
  LayoutTemplate,
  FileText,
  Truck,
  Users,
  Building,
} from "lucide-react";
import { Modal, message, Spin } from "antd";
import { TemplateGalleryModal } from "@/components/CustomFields/TemplateGalleryModal";
import {
  EntityTab,
  BaseFieldDefinition,
  DEFAULT_BASE_FIELDS,
  DEFAULT_SURFACES,
} from "@/components/CustomFields/custom-fields.constants";
import { CustomFieldFormModal } from "@/components/CustomFields/CustomFieldFormModal";
import { FieldsSectionCard } from "@/components/CustomFields/FieldsSectionCard";

export default function CustomFieldsSettingsPage() {
  const [selectedEntity, setSelectedEntity] = useState<EntityTab>("job");
  const [customFields, setCustomFields] = useState<CustomFieldDefinition[]>([]);
  const [hiddenBaseFields, setHiddenBaseFields] = useState<string[]>([]);
  const [baseFieldOverrides, setBaseFieldOverrides] = useState<
    Record<string, { is_required?: boolean; surfaces?: FieldSurfaces }>
  >({});
  const [loading, setLoading] = useState<boolean>(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isTemplateGalleryOpen, setIsTemplateGalleryOpen] = useState<boolean>(false);
  const [editingField, setEditingField] = useState<CustomFieldDefinition | null>(null);
  const [editingBaseFieldKey, setEditingBaseFieldKey] = useState<string | null>(null);

  // Form State
  const [label, setLabel] = useState<string>("");
  const [fieldKey, setFieldKey] = useState<string>("");
  const [dataType, setDataType] = useState<"string" | "number" | "boolean" | "select" | "date">("string");
  const [defaultValue, setDefaultValue] = useState<string>("");
  const [isRequired, setIsRequired] = useState<boolean>(false);
  const [isVisibleInList, setIsVisibleInList] = useState<boolean>(true);
  const [optionsStr, setOptionsStr] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [groupSection, setGroupSection] = useState<"additional" | "optimization" | "pod">("additional");
  const [surfacesState, setSurfacesState] = useState<FieldSurfaces>(DEFAULT_SURFACES);

  // Load custom fields & hidden base fields & overrides from localStorage
  const loadFields = async (entity: EntityTab) => {
    try {
      setLoading(true);
      const data = await getCustomFields(entity);
      setCustomFields(data);

      const storedHidden = localStorage.getItem(`syncnox_hidden_base_fields_${entity}`);
      setHiddenBaseFields(storedHidden ? JSON.parse(storedHidden) : []);

      const storedOverrides = localStorage.getItem(`syncnox_base_field_overrides_${entity}`);
      setBaseFieldOverrides(storedOverrides ? JSON.parse(storedOverrides) : {});
    } catch (err: any) {
      console.error("Failed to load custom fields", err);
      message.error("Failed to load custom fields");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFields(selectedEntity);
  }, [selectedEntity]);

  const handleToggleBaseRequired = (key: string, currentRequired: boolean, fieldLabel: string) => {
    const updated = {
      ...baseFieldOverrides,
      [key]: {
        ...baseFieldOverrides[key],
        is_required: !currentRequired,
      },
    };
    setBaseFieldOverrides(updated);
    localStorage.setItem(`syncnox_base_field_overrides_${selectedEntity}`, JSON.stringify(updated));
    message.success(`Set '${fieldLabel}' to ${!currentRequired ? "Required" : "Optional"}`);
  };

  const handleToggleCustomRequired = async (field: CustomFieldDefinition) => {
    try {
      await updateCustomField(field.id, { is_required: !field.is_required });
      message.success(`Set '${field.label}' to ${!field.is_required ? "Required" : "Optional"}`);
      loadFields(selectedEntity);
    } catch (err: any) {
      message.error("Failed to update custom field requirement");
    }
  };

  const handleLabelChange = (val: string) => {
    setLabel(val);
    if (!editingField && !editingBaseFieldKey) {
      const slug = val.toLowerCase().replace(/[^a-z0-9]/g, "_").replace(/_+/g, "_");
      if (!fieldKey || fieldKey === label.toLowerCase().replace(/[^a-z0-9]/g, "_").replace(/_+/g, "_")) {
        setFieldKey(slug);
      }
    }
  };

  const handleSave = async () => {
    if (!label.trim() || (!editingField && !editingBaseFieldKey && !fieldKey.trim())) {
      message.warning("Label and Field Key are required");
      return;
    }

    try {
      const optionsArr =
        dataType === "select"
          ? optionsStr.split(",").map((s) => s.trim()).filter(Boolean)
          : undefined;

      if (editingBaseFieldKey) {
        const updated = {
          ...baseFieldOverrides,
          [editingBaseFieldKey]: {
            ...baseFieldOverrides[editingBaseFieldKey],
            is_required: isRequired,
            surfaces: surfacesState,
          },
        };
        setBaseFieldOverrides(updated);
        localStorage.setItem(`syncnox_base_field_overrides_${selectedEntity}`, JSON.stringify(updated));
        message.success("Base field settings updated!");
      } else if (editingField) {
        await updateCustomField(editingField.id, {
          label: label.trim(),
          data_type: dataType,
          default_value: defaultValue.trim() || undefined,
          is_required: isRequired,
          is_visible_in_list: isVisibleInList,
          options: optionsArr,
          description: description.trim() || undefined,
          group: groupSection,
          surfaces: surfacesState,
        });
        message.success("Custom field updated successfully!");
      } else {
        await createCustomField({
          entity_type: selectedEntity,
          field_key: fieldKey.trim(),
          label: label.trim(),
          data_type: dataType,
          default_value: defaultValue.trim() || undefined,
          is_required: isRequired,
          is_visible_in_list: isVisibleInList,
          options: optionsArr,
          description: description.trim() || undefined,
          group: groupSection,
          surfaces: surfacesState,
        });
        message.success("Custom field created successfully!");
      }

      setIsModalOpen(false);
      resetForm();
      loadFields(selectedEntity);
    } catch (err: any) {
      message.error(err?.detail || err?.response?.data?.detail || "Failed to save field");
    }
  };

  const handleOpenEditModal = (field: CustomFieldDefinition) => {
    setEditingField(field);
    setEditingBaseFieldKey(null);
    setLabel(field.label);
    setFieldKey(field.field_key);
    setDataType(field.data_type as any);
    setDefaultValue(field.default_value || "");
    setIsRequired(field.is_required);
    setIsVisibleInList(field.is_visible_in_list);
    setOptionsStr(Array.isArray(field.options) ? field.options.join(", ") : "");
    setDescription(field.description || "");
    setGroupSection((field.group as any) || "additional");
    setSurfacesState(field.surfaces || DEFAULT_SURFACES);
    setIsModalOpen(true);
  };

  const handleOpenEditBaseModal = (
    bf: BaseFieldDefinition,
    currentRequired: boolean,
    currentSurfaces?: FieldSurfaces
  ) => {
    setEditingBaseFieldKey(bf.field_key);
    setEditingField(null);
    setLabel(bf.label);
    setFieldKey(bf.field_key);
    setDataType(bf.data_type as any);
    setDefaultValue("");
    setIsRequired(currentRequired);
    setIsVisibleInList(true);
    setOptionsStr("");
    setDescription(bf.description || "");
    setGroupSection((bf.group as any) || "additional");
    setSurfacesState(currentSurfaces || DEFAULT_SURFACES);
    setIsModalOpen(true);
  };

  const handleDeleteCustomField = async (id: number, fieldName: string) => {
    Modal.confirm({
      title: "Delete Custom Field",
      content: `Are you sure you want to delete "${fieldName}"? This will permanently remove this field definition and its stored values.`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      okButtonProps: { danger: true, style: { borderRadius: 0 } },
      cancelButtonProps: { style: { borderRadius: 0 } },
      onOk: async () => {
        try {
          await deleteCustomField(id);
          message.success("Custom field deleted");
          loadFields(selectedEntity);
        } catch (err: any) {
          message.error("Failed to delete custom field");
        }
      },
    });
  };

  const handleDeleteBaseField = (fieldKey: string, fieldLabel: string, isReq: boolean) => {
    if (isReq) {
      message.warning(`'${fieldLabel}' is a required base field and cannot be deleted.`);
      return;
    }

    Modal.confirm({
      title: "Delete Optional Field",
      content: `Are you sure you want to delete optional field "${fieldLabel}"? This field will be removed from field settings and forms.`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      okButtonProps: { danger: true, style: { borderRadius: 0 } },
      cancelButtonProps: { style: { borderRadius: 0 } },
      onOk: () => {
        const updated = [...hiddenBaseFields, fieldKey];
        setHiddenBaseFields(updated);
        localStorage.setItem(`syncnox_hidden_base_fields_${selectedEntity}`, JSON.stringify(updated));
        message.success(`Field '${fieldLabel}' deleted`);
      },
    });
  };

  const handleToggleBaseField = (key: string) => {
    const updated = hiddenBaseFields.includes(key)
      ? hiddenBaseFields.filter((k) => k !== key)
      : [...hiddenBaseFields, key];

    setHiddenBaseFields(updated);
    localStorage.setItem(`syncnox_hidden_base_fields_${selectedEntity}`, JSON.stringify(updated));
    message.info(updated.includes(key) ? `Base field '${key}' removed from list` : `Base field '${key}' restored`);
  };

  const handleResetToDefault = () => {
    const entityLabel = tabs.find((t) => t.key === selectedEntity)?.label;

    Modal.confirm({
      title: `Reset ${entityLabel} Fields to Default`,
      content: `Are you sure you want to reset all field configurations for ${entityLabel}? All custom fields will be deleted and all standard base fields will be restored to default settings.`,
      okText: "Reset to Default",
      okType: "danger",
      cancelText: "Cancel",
      okButtonProps: { danger: true, style: { borderRadius: 0 } },
      cancelButtonProps: { style: { borderRadius: 0 } },
      onOk: async () => {
        try {
          await resetCustomFields(selectedEntity);
          localStorage.removeItem(`syncnox_hidden_base_fields_${selectedEntity}`);
          localStorage.removeItem(`syncnox_base_field_overrides_${selectedEntity}`);
          setHiddenBaseFields([]);
          setBaseFieldOverrides({});
          message.success(`Custom fields for ${entityLabel} reset to default`);
          loadFields(selectedEntity);
        } catch (err: any) {
          console.error(err);
          message.error("Failed to reset fields to default");
        }
      },
    });
  };

  const resetForm = (presetGroup?: "additional" | "pod") => {
    setEditingField(null);
    setEditingBaseFieldKey(null);
    setLabel("");
    setFieldKey("");
    setDataType("string");
    setDefaultValue("");
    setIsRequired(false);
    setIsVisibleInList(true);
    setOptionsStr("");
    setDescription("");
    setGroupSection(presetGroup || "additional");
    setSurfacesState(DEFAULT_SURFACES);
  };

  const tabs: { key: EntityTab; label: string; icon: React.ReactNode }[] = [
    { key: "job", label: "Jobs", icon: <FileText className="w-4 h-4" /> },
    { key: "vehicle", label: "Vehicles", icon: <Truck className="w-4 h-4" /> },
    { key: "team_member", label: "Team Members", icon: <Users className="w-4 h-4" /> },
    { key: "depot", label: "Depots", icon: <Building className="w-4 h-4" /> },
  ];

  const currentBaseFields = DEFAULT_BASE_FIELDS[selectedEntity] || [];

  return (
    <div className="flex flex-col h-full overflow-hidden font-sans">
      {/* ── Page Header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200 shrink-0">
        <div>
          <h1 className="text-lg font-bold text-gray-900 m-0">Custom Fields & Field Settings</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Configure dynamic custom fields, visibility across apps, or reset configurations for Jobs, Vehicles, Team Members, and Depots.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsTemplateGalleryOpen(true)}
            className="inline-flex items-center gap-1.5 border border-[#003220] text-[#003220] hover:bg-emerald-50 text-xs font-semibold px-3 py-2 rounded-none transition-colors cursor-pointer bg-white"
          >
            <LayoutTemplate size={14} className="text-[#003220]" />
            <span>Browse Templates</span>
          </button>

          <button
            onClick={handleResetToDefault}
            className="inline-flex items-center gap-1.5 border border-red-300 text-red-600 hover:bg-red-50 text-xs font-semibold px-3 py-2 rounded-none transition-colors cursor-pointer bg-white"
          >
            <RotateCcw size={14} />
            <span>Reset to Default</span>
          </button>

          <button
            onClick={() => {
              resetForm("additional");
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 bg-[#003220] hover:bg-[#002417] text-white text-xs font-semibold px-4 py-2 rounded-none transition-colors cursor-pointer border-none"
          >
            <Plus size={15} />
            <span>Add Custom Field</span>
          </button>
        </div>
      </div>

      {/* ── Tabs bar ────────────────────────────────────────────── */}
      <div className="flex border-b border-gray-200 mt-4 space-x-6 shrink-0">
        {tabs.map((tab) => {
          const isActive = selectedEntity === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setSelectedEntity(tab.key)}
              className={`pb-2.5 px-1 text-xs font-semibold flex items-center gap-2 transition-all border-b-2 cursor-pointer bg-transparent ${
                isActive
                  ? "border-[#003220] text-[#003220] font-bold"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              <span className={isActive ? "text-[#003220]" : "text-gray-400"}>
                {tab.icon}
              </span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Content Sections ────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto mt-4 space-y-6 custom-scrollbar pr-1">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Spin size="default" />
          </div>
        ) : selectedEntity === "job" ? (
          <>
            <FieldsSectionCard
              badgeNumber="1"
              title="Required fields"
              categoryTag="OPTIMIZATION"
              description="Hard-coded into route optimization — map each to a solver role, hide unused, but these can't be deleted."
              baseItems={currentBaseFields.filter((f) => f.group === "optimization")}
              customItems={customFields.filter((f) => f.group === "optimization")}
              hiddenBaseFields={hiddenBaseFields}
              baseFieldOverrides={baseFieldOverrides}
              onToggleBaseRequired={handleToggleBaseRequired}
              onToggleCustomRequired={handleToggleCustomRequired}
              onOpenEditBaseModal={handleOpenEditBaseModal}
              onOpenEditCustomModal={handleOpenEditModal}
              onDeleteBaseField={handleDeleteBaseField}
              onDeleteCustomField={handleDeleteCustomField}
              onToggleBaseVisibility={handleToggleBaseField}
            />

            <FieldsSectionCard
              badgeNumber="2"
              title="Additional fields"
              categoryTag="DISPLAY"
              description="Display data shown to dispatchers, drivers and customers. Add your own."
              showAddButton
              onAddField={() => {
                resetForm("additional");
                setIsModalOpen(true);
              }}
              baseItems={currentBaseFields.filter((f) => !f.group || f.group === "additional")}
              customItems={customFields.filter((f) => !f.group || f.group === "additional")}
              hiddenBaseFields={hiddenBaseFields}
              baseFieldOverrides={baseFieldOverrides}
              onToggleBaseRequired={handleToggleBaseRequired}
              onToggleCustomRequired={handleToggleCustomRequired}
              onOpenEditBaseModal={handleOpenEditBaseModal}
              onOpenEditCustomModal={handleOpenEditModal}
              onDeleteBaseField={handleDeleteBaseField}
              onDeleteCustomField={handleDeleteCustomField}
              onToggleBaseVisibility={handleToggleBaseField}
            />

            <FieldsSectionCard
              badgeNumber="3"
              title="Proof of delivery"
              categoryTag="POD"
              description="Captured by the driver to complete the job — some visible to the customer."
              showAddButton
              onAddField={() => {
                resetForm("pod");
                setIsModalOpen(true);
              }}
              baseItems={currentBaseFields.filter((f) => f.group === "pod")}
              customItems={customFields.filter((f) => f.group === "pod")}
              hiddenBaseFields={hiddenBaseFields}
              baseFieldOverrides={baseFieldOverrides}
              onToggleBaseRequired={handleToggleBaseRequired}
              onToggleCustomRequired={handleToggleCustomRequired}
              onOpenEditBaseModal={handleOpenEditBaseModal}
              onOpenEditCustomModal={handleOpenEditModal}
              onDeleteBaseField={handleDeleteBaseField}
              onDeleteCustomField={handleDeleteCustomField}
              onToggleBaseVisibility={handleToggleBaseField}
            />
          </>
        ) : (
          <FieldsSectionCard
            title={`${tabs.find((t) => t.key === selectedEntity)?.label} Fields`}
            description={`Manage standard base fields and add custom properties for ${tabs.find((t) => t.key === selectedEntity)?.label.toLowerCase()}.`}
            showAddButton
            onAddField={() => {
              resetForm("additional");
              setIsModalOpen(true);
            }}
            baseItems={currentBaseFields}
            customItems={customFields}
            hiddenBaseFields={hiddenBaseFields}
            baseFieldOverrides={baseFieldOverrides}
            onToggleBaseRequired={handleToggleBaseRequired}
            onToggleCustomRequired={handleToggleCustomRequired}
            onOpenEditBaseModal={handleOpenEditBaseModal}
            onOpenEditCustomModal={handleOpenEditModal}
            onDeleteBaseField={handleDeleteBaseField}
            onDeleteCustomField={handleDeleteCustomField}
            onToggleBaseVisibility={handleToggleBaseField}
          />
        )}
      </div>

      {/* ── Add / Edit Custom Field Modal ───────────────────────────────── */}
      <CustomFieldFormModal
        open={isModalOpen}
        selectedEntity={selectedEntity}
        editingField={editingField}
        editingBaseFieldKey={editingBaseFieldKey}
        label={label}
        fieldKey={fieldKey}
        dataType={dataType}
        defaultValue={defaultValue}
        isRequired={isRequired}
        isVisibleInList={isVisibleInList}
        optionsStr={optionsStr}
        description={description}
        groupSection={groupSection}
        surfacesState={surfacesState}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        onSave={handleSave}
        onLabelChange={handleLabelChange}
        setFieldKey={setFieldKey}
        setDataType={setDataType}
        setDefaultValue={setDefaultValue}
        setIsRequired={setIsRequired}
        setIsVisibleInList={setIsVisibleInList}
        setOptionsStr={setOptionsStr}
        setDescription={setDescription}
        setGroupSection={setGroupSection}
        setSurfacesState={setSurfacesState}
      />

      {/* ── Template Gallery Modal ─────────────────────────────────────── */}
      <TemplateGalleryModal
        open={isTemplateGalleryOpen}
        entityType={selectedEntity}
        onClose={() => setIsTemplateGalleryOpen(false)}
        onApplied={() => {
          loadFields(selectedEntity);
        }}
      />
    </div>
  );
}
