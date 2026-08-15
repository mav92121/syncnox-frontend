"use client";

import { useState } from "react";
import { Table, Input, Select, Button, Tag, Popconfirm, message } from "antd";
import { Trash2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useVehicleStore } from "@/store/vehicle.store";
import { useTeamStore } from "@/store/team.store";
import { useDepotStore } from "@/store/depots.store";
import { useLocationMappingStore } from "@/store/location-mapping.store";
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

const LOCATION_CATEGORIES = [
  { value: "Metro Station", label: "Metro Station" },
  { value: "Transit Hub", label: "Transit Hub" },
  { value: "Depot", label: "Depot" },
  { value: "Warehouse", label: "Warehouse" },
  { value: "Waypoint", label: "Waypoint" },
  { value: "Landmark", label: "Custom Landmark" },
];

interface BulkImportDataPreviewStepProps {
  entityType: "vehicle" | "driver" | "location";
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
  const { batchCreateLocationMappingsAction } = useLocationMappingStore();
  const { createDepot } = useDepotStore();

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

        const weightVal = getVal("weight");
        const weightNum = weightVal ? parseFloat(weightVal) || null : null;

        const volumeVal = getVal("volume");
        const volumeNum = volumeVal ? parseFloat(volumeVal) || null : null;

        const qtyVal = getVal("quantity");
        const qtyNum = qtyVal ? parseFloat(qtyVal) || null : null;

        const palletsVal = getVal("pallets");
        const palletsNum = palletsVal ? parseFloat(palletsVal) || null : null;

        const skillsStr = getVal("required_skills");

        return {
          _key: idx,
          name: rawName,
          type: vType,
          capacity: capNum !== null ? capNum : "",
          weight: weightNum !== null ? weightNum : "",
          volume: volumeNum !== null ? volumeNum : "",
          quantity: qtyNum !== null ? qtyNum : "",
          pallets: palletsNum !== null ? palletsNum : "",
          license_plate: getVal("license_plate"),
          make: getVal("make"),
          model: getVal("model"),
          required_skills: skillsStr,
        };
      } else if (entityType === "driver") {
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
      } else {
        const rawName = getVal("name");
        const rawCategory = getVal("category");
        const category = rawCategory || "Metro Station";

        return {
          _key: idx,
          name: rawName,
          code: getVal("code"),
          address: getVal("address"),
          latitude: getVal("latitude"),
          longitude: getVal("longitude"),
          category: category,
          service_zone: getVal("service_zone"),
          operating_hours: getVal("operating_hours"),
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

  const validRecordsCount = records.filter((r) => r.name && r.name.trim().length > 0).length;

  const handleImport = async () => {
    const validRows = records.filter((r) => r.name && r.name.trim().length > 0);
    if (validRows.length === 0) {
      message.error("No valid records to import. Please make sure names are specified.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (entityType === "vehicle") {
        const payload = validRows.map((r) => {
          const loadConstraints: { constraint_type: any; max_value: number; unit: string }[] = [];

          if (r.capacity !== "" && !isNaN(Number(r.capacity))) {
            loadConstraints.push({ constraint_type: "capacity", max_value: Number(r.capacity), unit: "seats" });
          }
          if (r.weight !== "" && !isNaN(Number(r.weight))) {
            loadConstraints.push({ constraint_type: "weight", max_value: Number(r.weight), unit: "kg" });
          }
          if (r.volume !== "" && !isNaN(Number(r.volume))) {
            loadConstraints.push({ constraint_type: "volume", max_value: Number(r.volume), unit: "m3" });
          }
          if (r.quantity !== "" && !isNaN(Number(r.quantity))) {
            loadConstraints.push({ constraint_type: "quantity", max_value: Number(r.quantity), unit: "units" });
          }
          if (r.pallets !== "" && !isNaN(Number(r.pallets))) {
            loadConstraints.push({ constraint_type: "pallets", max_value: Number(r.pallets), unit: "pallets" });
          }

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
      } else if (entityType === "driver") {
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
      } else {
        // Location / Station Reference Mapping import (saved to metro_station mapping table)
        const payloads = validRows.map((r) => {
          const stationName = r.name ? r.name.trim() : "";
          const addressStr = r.address ? r.address.trim() : "";
          const stationCode = r.code ? r.code.trim() : "";

          const aliases = stationCode ? [stationCode] : [];

          return {
            name: stationName || addressStr,
            address: addressStr || stationName,
            aliases: aliases.length > 0 ? aliases : undefined,
            is_active: true,
          };
        });

        const count = await batchCreateLocationMappingsAction(payloads);
        message.success(`Successfully imported ${count} location reference mapping(s)!`);
        onSuccess(count);
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
          placeholder="Seats"
          className="text-xs"
        />
      ),
    },
    {
      title: "Weight (kg)",
      dataIndex: "weight",
      key: "weight",
      width: 110,
      render: (val: any, record: any, idx: number) => (
        <Input
          size="small"
          type="number"
          value={val}
          onChange={(e) => updateCell(idx, "weight", e.target.value)}
          placeholder="kg"
          className="text-xs"
        />
      ),
    },
    {
      title: "Volume (m³)",
      dataIndex: "volume",
      key: "volume",
      width: 110,
      render: (val: any, record: any, idx: number) => (
        <Input
          size="small"
          type="number"
          value={val}
          onChange={(e) => updateCell(idx, "volume", e.target.value)}
          placeholder="m³"
          className="text-xs"
        />
      ),
    },
    {
      title: "License Plate",
      dataIndex: "license_plate",
      key: "license_plate",
      width: 120,
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
      title: "Required Skills",
      dataIndex: "required_skills",
      key: "required_skills",
      width: 140,
      render: (val: string, record: any, idx: number) => (
        <Input
          size="small"
          value={val}
          onChange={(e) => updateCell(idx, "required_skills", e.target.value)}
          placeholder="e.g. HAZMAT"
          className="text-xs"
        />
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 60,
      render: (_: any, __: any, idx: number) => (
        <Popconfirm title="Remove row?" onConfirm={() => removeRow(idx)}>
          <Button type="text" danger size="small" icon={<Trash2 size={14} />} />
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
      width: 170,
      render: (val: string, record: any, idx: number) => (
        <Input
          size="small"
          value={val}
          onChange={(e) => updateCell(idx, "email", e.target.value)}
          placeholder="Email address"
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
          placeholder="Phone"
          className="text-xs"
        />
      ),
    },
    {
      title: "Skills",
      dataIndex: "skills",
      key: "skills",
      width: 130,
      render: (val: string, record: any, idx: number) => (
        <Input
          size="small"
          value={val}
          onChange={(e) => updateCell(idx, "skills", e.target.value)}
          placeholder="e.g. License C"
          className="text-xs"
        />
      ),
    },
    {
      title: "Monday",
      dataIndex: "monday",
      key: "monday",
      width: 110,
      render: (val: string, record: any, idx: number) => (
        <Input
          size="small"
          value={val}
          onChange={(e) => updateCell(idx, "monday", e.target.value)}
          placeholder="08:00 - 16:00"
          className="text-xs"
        />
      ),
    },
    {
      title: "Tuesday",
      dataIndex: "tuesday",
      key: "tuesday",
      width: 110,
      render: (val: string, record: any, idx: number) => (
        <Input
          size="small"
          value={val}
          onChange={(e) => updateCell(idx, "tuesday", e.target.value)}
          placeholder="08:00 - 16:00"
          className="text-xs"
        />
      ),
    },
    {
      title: "Wednesday",
      dataIndex: "wednesday",
      key: "wednesday",
      width: 110,
      render: (val: string, record: any, idx: number) => (
        <Input
          size="small"
          value={val}
          onChange={(e) => updateCell(idx, "wednesday", e.target.value)}
          placeholder="08:00 - 16:00"
          className="text-xs"
        />
      ),
    },
    {
      title: "Thursday",
      dataIndex: "thursday",
      key: "thursday",
      width: 110,
      render: (val: string, record: any, idx: number) => (
        <Input
          size="small"
          value={val}
          onChange={(e) => updateCell(idx, "thursday", e.target.value)}
          placeholder="08:00 - 16:00"
          className="text-xs"
        />
      ),
    },
    {
      title: "Friday",
      dataIndex: "friday",
      key: "friday",
      width: 110,
      render: (val: string, record: any, idx: number) => (
        <Input
          size="small"
          value={val}
          onChange={(e) => updateCell(idx, "friday", e.target.value)}
          placeholder="08:00 - 16:00"
          className="text-xs"
        />
      ),
    },
    {
      title: "Saturday",
      dataIndex: "saturday",
      key: "saturday",
      width: 110,
      render: (val: string, record: any, idx: number) => (
        <Input
          size="small"
          value={val}
          onChange={(e) => updateCell(idx, "saturday", e.target.value)}
          placeholder="08:00 - 16:00"
          className="text-xs"
        />
      ),
    },
    {
      title: "Sunday",
      dataIndex: "sunday",
      key: "sunday",
      width: 110,
      render: (val: string, record: any, idx: number) => (
        <Input
          size="small"
          value={val}
          onChange={(e) => updateCell(idx, "sunday", e.target.value)}
          placeholder="08:00 - 16:00"
          className="text-xs"
        />
      ),
    },

    {
      title: "Action",
      key: "action",
      width: 60,
      render: (_: any, __: any, idx: number) => (
        <Popconfirm title="Remove row?" onConfirm={() => removeRow(idx)}>
          <Button type="text" danger size="small" icon={<Trash2 size={14} />} />
        </Popconfirm>
      ),
    },
  ];

  const locationColumns = [
    {
      title: "#",
      key: "idx",
      width: 45,
      render: (_: any, __: any, idx: number) => <span className="text-xs text-gray-400">{idx + 1}</span>,
    },
    {
      title: "Location / Station Name *",
      dataIndex: "name",
      key: "name",
      width: 190,
      render: (val: string, record: any, idx: number) => (
        <Input
          size="small"
          value={val}
          status={!val.trim() ? "error" : ""}
          onChange={(e) => updateCell(idx, "name", e.target.value)}
          placeholder="e.g. Metro Center"
          className="text-xs"
        />
      ),
    },
    {
      title: "Code / Alias",
      dataIndex: "code",
      key: "code",
      width: 110,
      render: (val: string, record: any, idx: number) => (
        <Input
          size="small"
          value={val}
          onChange={(e) => updateCell(idx, "code", e.target.value)}
          placeholder="MTR-01"
          className="text-xs font-mono"
        />
      ),
    },
    {
      title: "Category / Type",
      dataIndex: "category",
      key: "category",
      width: 145,
      render: (val: string, record: any, idx: number) => (
        <Select
          showSearch
          optionFilterProp="label"
          size="small"
          value={val}
          onChange={(v) => updateCell(idx, "category", v)}
          options={LOCATION_CATEGORIES}
          className="w-full text-xs"
        />
      ),
    },
    {
      title: "Address / Formatted Location",
      dataIndex: "address",
      key: "address",
      width: 220,
      render: (val: string, record: any, idx: number) => (
        <Input
          size="small"
          value={val}
          onChange={(e) => updateCell(idx, "address", e.target.value)}
          placeholder="Street address"
          className="text-xs"
        />
      ),
    },
    {
      title: "Latitude",
      dataIndex: "latitude",
      key: "latitude",
      width: 110,
      render: (val: any, record: any, idx: number) => (
        <Input
          size="small"
          value={val}
          onChange={(e) => updateCell(idx, "latitude", e.target.value)}
          placeholder="41.8816"
          className="text-xs font-mono"
        />
      ),
    },
    {
      title: "Longitude",
      dataIndex: "longitude",
      key: "longitude",
      width: 110,
      render: (val: any, record: any, idx: number) => (
        <Input
          size="small"
          value={val}
          onChange={(e) => updateCell(idx, "longitude", e.target.value)}
          placeholder="-87.637"
          className="text-xs font-mono"
        />
      ),
    },
    {
      title: "Zone",
      dataIndex: "service_zone",
      key: "service_zone",
      width: 110,
      render: (val: string, record: any, idx: number) => (
        <Input
          size="small"
          value={val}
          onChange={(e) => updateCell(idx, "service_zone", e.target.value)}
          placeholder="Zone A"
          className="text-xs"
        />
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 60,
      render: (_: any, __: any, idx: number) => (
        <Popconfirm title="Remove row?" onConfirm={() => removeRow(idx)}>
          <Button type="text" danger size="small" icon={<Trash2 size={14} />} />
        </Popconfirm>
      ),
    },
  ];

  const columns =
    entityType === "vehicle"
      ? vehicleColumns
      : entityType === "driver"
      ? driverColumns
      : locationColumns;

  return (
    <div className="flex flex-col h-full space-y-3 py-1">
      <div className="flex items-center justify-between bg-slate-50 border border-slate-200 p-3 rounded-none">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span className="text-xs font-medium text-gray-800">
            Review and edit imported records. {validRecordsCount} valid record(s) ready for import.
          </span>
        </div>
        <Tag color="blue" className="text-xs rounded-none">
          {records.length} Total Rows
        </Tag>
      </div>

      <div className="flex-1 overflow-hidden border border-gray-200">
        <Table
          dataSource={records.map((r, idx) => ({ ...r, key: idx }))}
          columns={columns}
          pagination={false}
          size="small"
          scroll={{ y: 340, x: "max-content" }}
          className="rounded-none"
        />
      </div>

      <div className="flex items-center justify-between pt-2 border-t shrink-0">
        <Button onClick={onBack} disabled={isSubmitting} className="rounded-none">
          Back
        </Button>
        <div className="flex gap-2">
          <Button
            type="primary"
            loading={isSubmitting}
            onClick={handleImport}
            disabled={validRecordsCount === 0}
            className="rounded-none bg-[#003220] hover:bg-[#003220]/90"
          >
            Import {validRecordsCount} Record{validRecordsCount !== 1 ? "s" : ""}
          </Button>
        </div>
      </div>
    </div>
  );
}
