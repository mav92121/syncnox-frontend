"use client";
import React from "react";
import { Button, Tooltip } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UndoOutlined,
} from "@ant-design/icons";

interface ZoneToolbarProps {
  drawingMode: google.maps.drawing.OverlayType | null;
  selectedZoneId: string | null;
  isEditing: boolean;
  canUndo: boolean;
  onStartDrawing: () => void;
  onToggleEdit: () => void;
  onDeleteSelected: () => void;
  onUndo: () => void;
}

const ZoneToolbar: React.FC<ZoneToolbarProps> = ({
  drawingMode,
  selectedZoneId,
  isEditing,
  canUndo,
  onStartDrawing,
  onToggleEdit,
  onDeleteSelected,
  onUndo,
}) => {
  return (
    <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1.5 bg-white rounded-lg p-1.5 shadow-md border border-gray-200">
      <Tooltip title="Draw zone" placement="right">
        <Button
          type={drawingMode ? "primary" : "default"}
          size="small"
          icon={<PlusOutlined />}
          onClick={onStartDrawing}
          className="w-8 h-8 flex items-center justify-center"
        />
      </Tooltip>
      <Tooltip
        title={selectedZoneId ? "Edit vertices" : "Select a zone first"}
        placement="right"
      >
        <Button
          type={isEditing ? "primary" : "default"}
          size="small"
          icon={<EditOutlined />}
          onClick={onToggleEdit}
          disabled={!selectedZoneId}
          className="w-8 h-8 flex items-center justify-center"
        />
      </Tooltip>
      <Tooltip
        title={selectedZoneId ? "Delete zone" : "Select a zone first"}
        placement="right"
      >
        <Button
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={onDeleteSelected}
          disabled={!selectedZoneId}
          className="w-8 h-8 flex items-center justify-center"
        />
      </Tooltip>
      <Tooltip title={canUndo ? "Undo" : "Nothing to undo"} placement="right">
        <Button
          size="small"
          icon={<UndoOutlined />}
          onClick={onUndo}
          disabled={!canUndo}
          className="w-8 h-8 flex items-center justify-center"
        />
      </Tooltip>
    </div>
  );
};

export default ZoneToolbar;
