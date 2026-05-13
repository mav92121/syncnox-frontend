"use client";
import { useState, useEffect } from "react";
import { Flex, Typography, Button, Spin, Drawer } from "antd";
import { useDepotStore } from "@/store/depots.store";
import { Depot as DepotType } from "@/types/depots.type";
import DepotForm from "./DepotForm";
import CreateDepotModal from "./CreateDepotModal";
import { DepotPayload } from "@/apis/depots.api";
import { ColDef } from "ag-grid-community";
import BaseTable from "@/components/Table/BaseTable";
import { createActionsColumn } from "@/components/Table/ActionsColumn";
import { Panel, PanelGroup } from "react-resizable-panels";
import ResizeHandle from "@/components/ResizeHandle";
import GoogleMaps from "@/components/GoogleMaps";

const { Title } = Typography;

const Depot = () => {
  const { depots, isSaving, isLoading, updateDepot, createDepot, deleteDepot } =
    useDepotStore();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingDepot, setEditingDepot] = useState<DepotType | undefined>(
    undefined,
  );

  // Map state
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [mapCenter, setMapCenter] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [selectedMarkerId, setSelectedMarkerId] = useState<
    number | string | null
  >(null);

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

  const markers = depots
    .filter((depot: DepotType) => depot.location?.lat && depot.location?.lng)
    .map((depot: DepotType, index: number) => ({
      id: depot.id,
      position: {
        lat: depot.location.lat,
        lng: depot.location.lng,
      },
      description: depot.address.formatted_address || "No address",
      jobData: depot as any,
      sequenceNumber: index + 1,
    }));

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
    {
      headerName: "View",
      cellRenderer: (params: any) => {
        return (
          <Button
            type="link"
            size="small"
            onClick={() => {
              if (params.data.location?.lat && params.data.location?.lng) {
                setIsMapOpen(true);
                setMapCenter({
                  lat: params.data.location.lat,
                  lng: params.data.location.lng,
                });
                setSelectedMarkerId(params.data.id);
              }
            }}
          >
            Map View
          </Button>
        );
      },
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

  const listContent = (
    <div className="flex flex-col h-full">
      <Flex justify="space-between">
        <Title className="m-0 mb-2 pt-2" level={5}>
          Depots
        </Title>
        <Flex gap={8}>
          <Button size="small" onClick={() => setIsMapOpen(!isMapOpen)}>
            {isMapOpen ? "Close Map" : "Map View"}
          </Button>
          <Button size="small" type="primary" onClick={handleCreate}>
            Add Depot
          </Button>
        </Flex>
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
    </div>
  );

  return (
    <>
      {isMapOpen ? (
        <div className="flex flex-col h-full">
          <PanelGroup direction="vertical">
            <Panel defaultSize={40} minSize={10}>
              <div className="h-full">
                <GoogleMaps
                  markers={markers}
                  center={mapCenter || undefined}
                  zoom={mapCenter ? 17 : undefined}
                  selectedMarkerId={selectedMarkerId}
                  onMarkerSelect={setSelectedMarkerId}
                  InfoWindowModal={({ marker }) => (
                    <div className="p-2 min-w-[200px]">
                      <div className="font-semibold text-gray-800 mb-1">
                        {(marker.jobData as any).name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {marker.description}
                      </div>
                      <Button
                        type="link"
                        size="small"
                        className="p-0 mt-2"
                        onClick={() => handleEdit(marker.jobData as any)}
                      >
                        Edit Depot
                      </Button>
                    </div>
                  )}
                />
              </div>
            </Panel>
            <ResizeHandle />
            <Panel defaultSize={60} minSize={5}>
              <div className="pt-2 h-full">{listContent}</div>
            </Panel>
          </PanelGroup>
        </div>
      ) : (
        listContent
      )}

      <CreateDepotModal
        open={isCreateModalOpen}
        setOpen={setIsCreateModalOpen}
        onSubmit={handleCreateSubmit}
        isLoading={isSaving}
        existingDepots={depots}
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
          existingDepots={depots}
        />
      </Drawer>
    </>
  );
};

export default Depot;
