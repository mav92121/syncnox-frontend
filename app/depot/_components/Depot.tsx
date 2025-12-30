"use client";
import { useState, useEffect } from "react";
import { Flex, Typography, Button, Spin, Drawer } from "antd";
import { useDepotStore } from "@/zustand/depots.store";
import { Depot as DepotType } from "@/types/depots.type";
import DepotForm from "./DepotForm";
import CreateDepotModal from "./CreateDepotModal";
import { DepotPayload } from "@/apis/depots.api";
import { ColDef } from "ag-grid-community";
import BaseTable from "@/components/Table/BaseTable";
import { createActionsColumn } from "@/components/Table/ActionsColumn";

const { Title } = Typography;

const Depot = () => {
  const { depots, isSaving, isLoading, updateDepot, createDepot, deleteDepot } =
    useDepotStore();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingDepot, setEditingDepot] = useState<DepotType | undefined>(
    undefined
  );

  const handleEdit = (depot: DepotType) => {
    setEditingDepot(depot);
    setIsDrawerOpen(true);
  };

  const handleCreate = () => {
    setIsCreateModalOpen(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setEditingDepot(undefined);
  };

  const handleCreateSubmit = async (values: DepotPayload) => {
    const success = await createDepot(values);
    if (success) {
      setIsCreateModalOpen(false);
    }
    return success;
  };

  const handleEditSubmit = async (values: DepotPayload) => {
    if (editingDepot) {
      const success = await updateDepot(editingDepot.id, values);
      if (success) {
        setIsDrawerOpen(false);
        setEditingDepot(undefined);
      }
      return success;
    }
    return false;
  };

  const columns: ColDef<DepotType>[] = [
    {
      headerName: "Name",
      field: "name",
      flex: 1,
    },
    {
      headerName: "Address",
      field: "address.formatted_address",
      flex: 2,
    },
    {
      headerName: "Latitude",
      field: "location.lat",
      width: 120,
    },
    {
      headerName: "Longitude",
      field: "location.lng",
      width: 120,
    },
    createActionsColumn<DepotType>({
      actions: [
        {
          key: "edit",
          label: "Edit",
          onClick: (depot: DepotType) => handleEdit(depot),
        },
        {
          key: "delete",
          label: "Delete",
          type: "delete",
          onClick: async (depot: DepotType) => {
            await deleteDepot(depot.id);
          },
        },
      ],
      entityName: "Depot",
    }),
  ];

  if (isLoading && depots.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Flex justify="space-between">
        <Title level={5} className="m-0 mb-2 pt-2">
          Depots
        </Title>
        <Button size="small" type="primary" onClick={handleCreate}>
          Add Depot
        </Button>
      </Flex>

      <div className="flex-1 min-h-0">
        <BaseTable<DepotType>
          columnDefs={columns}
          rowData={depots}
          loading={isLoading}
          emptyMessage="No depots found"
          pagination={false}
          containerStyle={{ height: "100%" }}
        />
      </div>

      <CreateDepotModal
        open={isCreateModalOpen}
        setOpen={setIsCreateModalOpen}
        onSubmit={handleCreateSubmit}
        isLoading={isSaving}
      />

      <Drawer
        title="Edit Depot"
        open={isDrawerOpen}
        onClose={handleDrawerClose}
        width={800}
        destroyOnHidden
      >
        <DepotForm
          initialValues={editingDepot}
          onSubmit={handleEditSubmit}
          isLoading={isSaving}
          onCancel={handleDrawerClose}
        />
      </Drawer>
    </div>
  );
};

export default Depot;
