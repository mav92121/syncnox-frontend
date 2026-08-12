"use client";

import { useState } from "react";
import { Table, Input, Select, Button, Tag, Popconfirm, message } from "antd";
import { Trash2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useVehicleStore } from "@/store/vehicle.store";
import { useTeamStore } from "@/store/team.store";
import { parse_skills, parse_time_slot, infer_vehicle_type } from "@/utils/importHelper.utils";

const VEHICLE_TYPES = [
  { value: "car", label: "Car" },
  { value: "van", label: "Van" },
  { value: "bus", label: "Bus" },
  { value: "small_truck", label: "Small Truck" },
  { value: "truck", label: "Truck" },
  { value: "scooter", label: "Scooter" },
  { value: "foot", label: "Foot" },
  { value: "bike", label: "Bike" },
  { value: "mountain_bike", label: "Mountain Bike" },
];

const DRIVER_ROLES = [
  { value: "driver", label: "Driver" },
  { value: "admin", label: "Admin" },
  { value: "manager", label: "Manager" },
];

interface BulkImportDataPreviewStepProps {
  entityType: "vehicle" | "driver";
  rawRows: Record<string, any>[];
  mapping: Record<string, string>; // { [excelHeader]: systemFieldKey }
  onBack: () => void;
  onSuccess: (importedCount: number) => void;
}

export default function BulkImportDataPreviewStep({
  entityType,
  rawRows,
  mapping,
  onBack,
  onSuccess,
}: BulkImportDataPreviewStepProps) {
  const { batchCreateVehiclesAction } = useVehicleStore();
  const { batchCreateTeamsAction } = useTeamStore();

  // Convert raw rows & mapping into initial structured records
  const [records, setRecords] = useState<Record<string, any>[]>(() => {
    // Create reverse map: systemFieldKey -> excelHeader
    const fieldToHeader: Record<string, string> = {};
    Object.entries(mapping).forEach(([header, systemKey]) => {
      fieldToHeader[systemKey] = header;
    });

    return rawRows.map((row, idx) => {
      const getVal = (fieldKey: string) => {
        const header = fieldToHeader[fieldKey];
        if (!header || row[header] === undefined || row[header] === null) return "";
        return String(row[header]).trim();
      };

      if (entityType === "vehicle") {
        const rawName = getVal("name");
        const rawType = getVal("type").toLowerCase();
        const validTypes = VEHICLE_TYPES.map((t) => t.value);
        const vType = validTypes.includes(rawType) ? rawType : (rawName ? infer_vehicle_type(rawName) : "van");

        const capVal = getVal("capacity");
        const capNum = capVal ? parseFloat(capVal) || null : null;

        const skillsStr = getVal("required_skills");

        return {
          _key: idx,
          name: rawName,
          type: vType,
          capacity: capNum !== null ? capNum : "",
          license_plate: getVal("license_plate"),
          make: getVal("make"),
          model: getVal("model"),
          required_skills: skillsStr,
        };
      } else {
        const rawName = getVal("name");
        const rawRole = getVal("role_type").toLowerCase();
        const role = ["driver", "admin", "manager"].includes(rawRole) ? rawRole : "driver";

        return {
          _key: idx,
          name: rawName,
          email: getVal("email"),
          phone_number: getVal("phone_number"),
          role_type: role,
          skills: getVal("skills"),
          monday: getVal("monday"),
          tuesday: getVal("tuesday"),
          wednesday: getVal("wednesday"),
          thursday: getVal("thursday"),
          friday: getVal("friday"),
          saturday: getVal("saturday"),
          sunday: getVal("sunday"),
        };
      }
    });
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateCell = (index: number, field: string, value: any) => {
    setRecords((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const removeRow = (index: number) => {
    setRecords((prev) => prev.filter((_, idx) => idx !== index));
  };

  const validRecordsCount = records.filter((r) => r.name.trim().length > 0).length;

  const handleImport = async () => {
    const validRows = records.filter((r) => r.name.trim().length > 0);
    if (validRows.length === 0) {
      message.error("No valid records to import. Please make sure names are specified.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (entityType === "vehicle") {
        const payload = validRows.map((r) => {
          const loadConstraints = r.capacity !== "" && !isNaN(Number(r.capacity))
            ? [{ constraint_type: "capacity" as const, max_value: Number(r.capacity), unit: "seats" }]
            : [];

          return {
            name: r.name.trim(),
            type: (r.type || "van") as any,
            license_plate: r.license_plate || null,
            make: r.make || null,
            model: r.model || null,
            required_skills: parse_skills(r.required_skills),
            load_constraints: loadConstraints,
          };
        });

        const created = await batchCreateVehiclesAction(payload);
        message.success(`Successfully imported ${created.length} vehicles!`);
        onSuccess(created.length);
      } else {
        const payload = validRows.map((r) => {
          const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
          const day_schedules: Record<string, any> = {};
          days.forEach((day) => {
            if (r[day]) {
              day_schedules[day] = parse_time_slot(r[day]);
            }
          });

          return {
            name: r.name.trim(),
            role_type: (r.role_type || "driver") as any,
            email: r.email || null,
            phone_number: r.phone_number || null,
            skills: parse_skills(r.skills),
            day_schedules: Object.keys(day_schedules).length > 0 ? day_schedules : null,
            status: "active" as const,
          };
        });

        const created = await batchCreateTeamsAction(payload);
        message.success(`Successfully imported ${created.length} drivers!`);
        onSuccess(created.length);
      }
    } catch (err: any) {
      message.error(err.message || "Failed to import records");
    } finally {
      setIsSubmitting(false);
    }
  };

  const vehicleColumns = [
    {
      title: "#",
      key: "idx",
      width: 45,
      render: (_: any, __: any, idx: number) => <span className="text-xs text-gray-400">{idx + 1}</span>,
    },
    {
      title: "Vehicle Name *",
      dataIndex: "name",
      key: "name",
      width: 170,
      render: (val: string, record: any, idx: number) => (
        <Input
          size="small"
          value={val}
          status={!val.trim() ? "error" : ""}
          onChange={(e) => updateCell(idx, "name", e.target.value)}
          placeholder="Required"
          className="text-xs"
        />
      ),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      width: 130,
      render: (val: string, record: any, idx: number) => (
        <Select
          showSearch
          optionFilterProp="label"
          size="small"
          value={val}
          onChange={(v) => updateCell(idx, "type", v)}
          options={VEHICLE_TYPES}
          className="w-full text-xs"
        />
      ),
    },
    {
      title: "Capacity (Seats)",
      dataIndex: "capacity",
      key: "capacity",
      width: 120,
      render: (val: any, record: any, idx: number) => (
        <Input
          size="small"
          type="number"
          value={val}
          onChange={(e) => updateCell(idx, "capacity", e.target.value)}
          placeholder="e.g. 4"
          className="text-xs"
        />
      ),
    },
    {
      title: "License Plate",
      dataIndex: "license_plate",
      key: "license_plate",
      width: 130,
      render: (val: string, record: any, idx: number) => (
        <Input
          size="small"
          value={val}
          onChange={(e) => updateCell(idx, "license_plate", e.target.value)}
          placeholder="Plate #"
          className="text-xs"
        />
      ),
    },
    {
      title: "Make / Model",
      key: "make_model",
      width: 170,
      render: (_: any, record: any, idx: number) => (
        <div className="flex gap-1">
          <Input
            size="small"
            value={record.make}
            onChange={(e) => updateCell(idx, "make", e.target.value)}
            placeholder="Make"
            className="text-xs w-1/2"
          />
          <Input
            size="small"
            value={record.model}
            onChange={(e) => updateCell(idx, "model", e.target.value)}
            placeholder="Model"
            className="text-xs w-1/2"
          />
        </div>
      ),
    },
    {
      title: "Required Skills",
      dataIndex: "required_skills",
      key: "required_skills",
      width: 160,
      render: (val: string, record: any, idx: number) => (
        <Input
          size="small"
          value={val}
          onChange={(e) => updateCell(idx, "required_skills", e.target.value)}
          placeholder="Class 1, Class 4..."
          className="text-xs"
        />
      ),
    },
    {
      title: "",
      key: "actions",
      width: 50,
      render: (_: any, record: any, idx: number) => (
        <Popconfirm title="Remove row?" onConfirm={() => removeRow(idx)} okText="Yes" cancelText="No">
          <Button size="small" type="text" danger icon={<Trash2 size={14} />} />
        </Popconfirm>
      ),
    },
  ];

  const driverColumns = [
    {
      title: "#",
      key: "idx",
      width: 45,
      render: (_: any, __: any, idx: number) => <span className="text-xs text-gray-400">{idx + 1}</span>,
    },
    {
      title: "Driver Name *",
      dataIndex: "name",
      key: "name",
      width: 160,
      render: (val: string, record: any, idx: number) => (
        <Input
          size="small"
          value={val}
          status={!val.trim() ? "error" : ""}
          onChange={(e) => updateCell(idx, "name", e.target.value)}
          placeholder="Required"
          className="text-xs"
        />
      ),
    },
    {
      title: "Role",
      dataIndex: "role_type",
      key: "role_type",
      width: 110,
      render: (val: string, record: any, idx: number) => (
        <Select
          showSearch
          optionFilterProp="label"
          size="small"
          value={val}
          onChange={(v) => updateCell(idx, "role_type", v)}
          options={DRIVER_ROLES}
          className="w-full text-xs"
        />
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 150,
      render: (val: string, record: any, idx: number) => (
        <Input
          size="small"
          value={val}
          onChange={(e) => updateCell(idx, "email", e.target.value)}
          placeholder="email@example.com"
          className="text-xs"
        />
      ),
    },
    {
      title: "Phone",
      dataIndex: "phone_number",
      key: "phone_number",
      width: 130,
      render: (val: string, record: any, idx: number) => (
        <Input
          size="small"
          value={val}
          onChange={(e) => updateCell(idx, "phone_number", e.target.value)}
          placeholder="+123456789"
          className="text-xs"
        />
      ),
    },
    {
      title: "Skills / Licenses",
      dataIndex: "skills",
      key: "skills",
      width: 150,
      render: (val: string, record: any, idx: number) => (
        <Input
          size="small"
          value={val}
          onChange={(e) => updateCell(idx, "skills", e.target.value)}
          placeholder="Class 1, Class 5..."
          className="text-xs"
        />
      ),
    },
    {
      title: "Mon Schedule",
      dataIndex: "monday",
      key: "monday",
      width: 120,
      render: (val: string, record: any, idx: number) => (
        <Input
          size="small"
          value={val}
          onChange={(e) => updateCell(idx, "monday", e.target.value)}
          placeholder="09:00 - 17:00"
          className="text-xs"
        />
      ),
    },
    {
      title: "Tue Schedule",
      dataIndex: "tuesday",
      key: "tuesday",
      width: 120,
      render: (val: string, record: any, idx: number) => (
        <Input
          size="small"
          value={val}
          onChange={(e) => updateCell(idx, "tuesday", e.target.value)}
          placeholder="09:00 - 17:00"
          className="text-xs"
        />
      ),
    },
    {
      title: "Wed Schedule",
      dataIndex: "wednesday",
      key: "wednesday",
      width: 120,
      render: (val: string, record: any, idx: number) => (
        <Input
          size="small"
          value={val}
          onChange={(e) => updateCell(idx, "wednesday", e.target.value)}
          placeholder="09:00 - 17:00"
          className="text-xs"
        />
      ),
    },
    {
      title: "Thu Schedule",
      dataIndex: "thursday",
      key: "thursday",
      width: 120,
      render: (val: string, record: any, idx: number) => (
        <Input
          size="small"
          value={val}
          onChange={(e) => updateCell(idx, "thursday", e.target.value)}
          placeholder="09:00 - 17:00"
          className="text-xs"
        />
      ),
    },
    {
      title: "Fri Schedule",
      dataIndex: "friday",
      key: "friday",
      width: 120,
      render: (val: string, record: any, idx: number) => (
        <Input
          size="small"
          value={val}
          onChange={(e) => updateCell(idx, "friday", e.target.value)}
          placeholder="09:00 - 17:00"
          className="text-xs"
        />
      ),
    },
    {
      title: "Sat Schedule",
      dataIndex: "saturday",
      key: "saturday",
      width: 120,
      render: (val: string, record: any, idx: number) => (
        <Input
          size="small"
          value={val}
          onChange={(e) => updateCell(idx, "saturday", e.target.value)}
          placeholder="09:00 - 17:00"
          className="text-xs"
        />
      ),
    },
    {
      title: "Sun Schedule",
      dataIndex: "sunday",
      key: "sunday",
      width: 120,
      render: (val: string, record: any, idx: number) => (
        <Input
          size="small"
          value={val}
          onChange={(e) => updateCell(idx, "sunday", e.target.value)}
          placeholder="09:00 - 17:00"
          className="text-xs"
        />
      ),
    },
    {
      title: "",
      key: "actions",
      width: 50,
      render: (_: any, record: any, idx: number) => (
        <Popconfirm title="Remove row?" onConfirm={() => removeRow(idx)} okText="Yes" cancelText="No">
          <Button size="small" type="text" danger icon={<Trash2 size={14} />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="flex flex-col h-full space-y-3 py-1">
      <div className="flex items-center justify-between text-xs text-gray-600">
        <span className="font-medium">
          Previewing {records.length} records ({validRecordsCount} ready to import)
        </span>
        <span className="text-gray-400">Click any field in table to edit before importing</span>
      </div>

      <div className="flex-1 min-h-0 border border-gray-200 rounded overflow-hidden">
        <Table
          columns={entityType === "vehicle" ? vehicleColumns : driverColumns}
          dataSource={records.map((r, i) => ({ ...r, key: i }))}
          pagination={false}
          size="small"
          scroll={{ x: "max-content", y: "calc(65vh - 200px)" }}
        />
      </div>

      <div className="flex justify-between items-center pt-2 border-t mt-auto">
        <Button onClick={onBack} disabled={isSubmitting}>
          Back to Mapping
        </Button>
        <Button
          type="primary"
          loading={isSubmitting}
          disabled={validRecordsCount === 0}
          onClick={handleImport}
          icon={<CheckCircle2 size={16} />}
        >
          Import {validRecordsCount} {entityType === "vehicle" ? "Vehicles" : "Drivers"}
        </Button>
      </div>
    </div>
  );
}
