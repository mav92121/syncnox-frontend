"use client";

import { useState, useMemo, useEffect } from "react";
import { Button, Table, Input, Modal, message, Tag, Popconfirm } from "antd";
import { Search, Plus, Upload, Trash2, MapPin, CheckCircle2 } from "lucide-react";
import { useLocationMappingStore } from "@/store/location-mapping.store";
import BulkImportModal from "@/components/BulkImport/BulkImportModal";
import AddLocationMappingModal from "./AddLocationMappingModal";

export default function LocationMappingList() {
  const {
    locationMappings,
    isLoading,
    fetchLocationMappings,
    deleteLocationMapping,
    bulkDeleteLocationMappings,
  } = useLocationMappingStore();

  const [search, setSearch] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);

  useEffect(() => {
    fetchLocationMappings();
  }, [fetchLocationMappings]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return locationMappings;
    return locationMappings.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        (item.address && item.address.toLowerCase().includes(q)) ||
        (item.aliases && item.aliases.some((a) => a.toLowerCase().includes(q)))
    );
  }, [locationMappings, search]);

  const handleBulkDelete = () => {
    if (selectedRowKeys.length === 0) return;

    Modal.confirm({
      title: "Bulk Delete Location Mappings",
      content: `Are you sure you want to delete ${selectedRowKeys.length} location mapping(s)?`,
      okText: "Delete All",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        const ids = selectedRowKeys.map((k) => Number(k));
        const success = await bulkDeleteLocationMappings(ids);
        if (success) {
          message.success(`${selectedRowKeys.length} mapping(s) deleted`);
          setSelectedRowKeys([]);
        } else {
          message.error("Failed to delete mappings");
        }
      },
    });
  };

  const columns = [
    {
      title: "Station / Location Name",
      dataIndex: "name",
      key: "name",
      render: (name: string, record: any) => (
        <div className="flex items-center gap-2 py-0.5">
          <div className="w-7 h-7 bg-emerald-50 text-[#003220] flex items-center justify-center shrink-0 border border-emerald-100">
            <MapPin size={15} />
          </div>
          <div>
            <span className="font-semibold text-gray-900 text-xs block">{name}</span>
            {record.city && <span className="text-[11px] text-gray-400">{record.city}</span>}
          </div>
        </div>
      ),
    },
    {
      title: "Resolved Address",
      dataIndex: "address",
      key: "address",
      render: (address: string) => (
        <span className="text-xs text-gray-700 font-normal">
          {address || <span className="text-gray-400 italic">No address specified</span>}
        </span>
      ),
    },
    // {
    //   title: "Aliases / Station Codes",
    //   dataIndex: "aliases",
    //   key: "aliases",
    //   render: (aliases: string[]) => (
    //     <div className="flex flex-wrap gap-1">
    //       {aliases && aliases.length > 0 ? (
    //         aliases.map((alias, idx) => (
    //           <Tag key={idx} className="text-[11px] font-mono rounded-none bg-slate-100 text-slate-700 border-slate-200">
    //             {alias}
    //           </Tag>
    //         ))
    //       ) : (
    //         <span className="text-xs text-gray-400">—</span>
    //       )}
    //     </div>
    //   ),
    // },
    {
      title: "Action",
      key: "action",
      width: 80,
      render: (_: any, record: any) => (
        <Popconfirm
          title="Delete mapping?"
          onConfirm={async () => {
            const ok = await deleteLocationMapping(record.id);
            if (ok) message.success("Mapping deleted");
          }}
        >
          <Button type="text" danger size="small" icon={<Trash2 size={14} />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="flex flex-col h-full bg-white p-4 space-y-4 overflow-hidden">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50 border border-slate-200 p-4 shrink-0">
        <div>
          <h2 className="text-base font-bold text-gray-900 m-0">Location & Station Mappings</h2>
          <p className="text-xs text-gray-500 m-0 mt-0.5">
            Reference mappings table used to resolve station names and custom location aliases directly to geocoded addresses during job creation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {selectedRowKeys.length > 0 && (
            <Button danger icon={<Trash2 size={14} />} onClick={handleBulkDelete} className="rounded-none text-xs">
              Delete ({selectedRowKeys.length})
            </Button>
          )}

          <Button
            icon={<Upload size={14} />}
            onClick={() => setBulkModalOpen(true)}
            className="rounded-none text-xs"
          >
            Bulk Import
          </Button>

          <Button
            type="primary"
            icon={<Plus size={14} />}
            onClick={() => setAddModalOpen(true)}
            className="rounded-none text-xs bg-[#003220] hover:bg-[#003220]/90"
          >
            Add Mapping
          </Button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center justify-between gap-3 shrink-0">
        <div className="relative flex items-center w-72">
          <Search size={14} className="absolute left-2.5 text-gray-400 pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search station name, address, code…"
            className="pl-8 text-xs rounded-none"
          />
        </div>
        <span className="text-xs text-gray-500 font-medium">
          {filtered.length} mapping{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Main Table */}
      <div className="flex-1 overflow-hidden border border-gray-200">
        <Table
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys),
          }}
          loading={isLoading}
          columns={columns}
          dataSource={filtered.map((item) => ({ ...item, key: item.id }))}
          pagination={false}
          size="small"
          scroll={{ y: "calc(100vh - 300px)" }}
          className="rounded-none"
        />
      </div>

      {/* Modals */}
      <AddLocationMappingModal open={addModalOpen} setOpen={setAddModalOpen} />
      <BulkImportModal
        open={bulkModalOpen}
        onClose={() => setBulkModalOpen(false)}
        entityType="location"
        onSuccess={() => fetchLocationMappings()}
      />
    </div>
  );
}
