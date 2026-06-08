"use client";
import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Polygon,
  DrawingManager,
} from "@react-google-maps/api";
import { Spin } from "antd";
import { GOOGLE_MAPS_LIBRARIES } from "@/components/GoogleMaps";
import ZoneToolbar from "./ZoneToolbar";
import DrawingStatusTip from "./DrawingStatusTip";
import ZoneCountBadge from "./ZoneCountBadge";

export interface ZonePolygon {
  id: string;
  paths: google.maps.LatLngLiteral[];
  color: string;
}

interface ServiceZoneMapProps {
  zones: ZonePolygon[];
  onZonesChange: (zones: ZonePolygon[]) => void;
  readOnly?: boolean;
}

export const ZONE_COLORS = [
  "#E8834B", // Orange (like OptimoRoute)
  "#4B9CE8", // Blue
  "#4BE87A", // Green
  "#E84B6B", // Red
  "#B04BE8", // Purple
  "#E8D84B", // Yellow
];

const defaultCenter = { lat: 20.5937, lng: 78.9629 }; // India center

const ServiceZoneMap: React.FC<ServiceZoneMapProps> = ({
  zones,
  onZonesChange,
  readOnly = false,
}) => {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY || "",
    version: "3.64",
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  const [drawingMode, setDrawingMode] =
    useState<google.maps.drawing.OverlayType | null>(null);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const mapRef = useRef<google.maps.Map | null>(null);
  const polygonRefs = useRef<Record<string, google.maps.Polygon>>({});
  const [historyStack, setHistoryStack] = useState<ZonePolygon[][]>([]);

  const pickColor = (existingCount: number) =>
    ZONE_COLORS[existingCount % ZONE_COLORS.length];

  const saveToHistory = useCallback((current: ZonePolygon[]) => {
    setHistoryStack((prev) => [...prev.slice(-19), current]);
  }, []);

  const handleUndo = () => {
    setHistoryStack((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      onZonesChange(last);
      return prev.slice(0, -1);
    });
  };

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const handlePolygonComplete = useCallback(
    (polygon: google.maps.Polygon) => {
      const path = polygon
        .getPath()
        .getArray()
        .map((latlng) => ({ lat: latlng.lat(), lng: latlng.lng() }));

      polygon.setMap(null); // Remove the temp drawing polygon

      const newZone: ZonePolygon = {
        id: `zone_${Date.now()}`,
        paths: path,
        color: pickColor(zones.length),
      };

      saveToHistory(zones);
      onZonesChange([...zones, newZone]);
      setDrawingMode(null);
      setSelectedZoneId(newZone.id);
    },
    [zones, onZonesChange, saveToHistory],
  );

  const handleDeleteSelected = () => {
    if (!selectedZoneId) return;
    saveToHistory(zones);
    onZonesChange(zones.filter((z) => z.id !== selectedZoneId));
    setSelectedZoneId(null);
    setIsEditing(false);
  };

  const handlePolygonPathChange = (zoneId: string) => {
    const polyRef = polygonRefs.current[zoneId];
    if (!polyRef) return;
    const newPaths = polyRef
      .getPath()
      .getArray()
      .map((latlng) => ({ lat: latlng.lat(), lng: latlng.lng() }));
    saveToHistory(zones);
    onZonesChange(
      zones.map((z) => (z.id === zoneId ? { ...z, paths: newPaths } : z)),
    );
  };

  const startDrawing = () => {
    setSelectedZoneId(null);
    setIsEditing(false);
    setDrawingMode(
      isLoaded ? window.google.maps.drawing.OverlayType.POLYGON : null,
    );
  };

  const toggleEdit = () => {
    if (!selectedZoneId) return;
    setIsEditing((prev) => !prev);
  };

  // Cancel drawing on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawingMode(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  if (!isLoaded) {
    return (
      <div className="h-[400px] flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="relative rounded-lg overflow-hidden border border-gray-200">
      {/* Toolbar */}
      {!readOnly && (
        <ZoneToolbar
          drawingMode={drawingMode}
          selectedZoneId={selectedZoneId}
          isEditing={isEditing}
          canUndo={historyStack.length > 0}
          onStartDrawing={startDrawing}
          onToggleEdit={toggleEdit}
          onDeleteSelected={handleDeleteSelected}
          onUndo={handleUndo}
        />
      )}

      {/* Status tip */}
      <DrawingStatusTip active={drawingMode !== null} />

      <GoogleMap
        mapContainerClassName="w-full h-[400px]"
        center={defaultCenter}
        zoom={5}
        onLoad={onMapLoad}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
          streetViewControl: false,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }],
            },
          ],
        }}
        onClick={() => {
          if (!drawingMode) {
            setSelectedZoneId(null);
            setIsEditing(false);
          }
        }}
      >
        <DrawingManager
          drawingMode={drawingMode}
          onPolygonComplete={handlePolygonComplete}
          options={{
            drawingControl: false,
            polygonOptions: {
              fillColor: ZONE_COLORS[zones.length % ZONE_COLORS.length],
              fillOpacity: 0.25,
              strokeColor: ZONE_COLORS[zones.length % ZONE_COLORS.length],
              strokeWeight: 2,
              clickable: true,
              editable: false,
              zIndex: 1,
            },
          }}
        />

        {zones.map((zone) => {
          const isSelected = selectedZoneId === zone.id;
          return (
            <Polygon
              key={zone.id}
              paths={zone.paths}
              options={{
                fillColor: zone.color,
                fillOpacity: isSelected ? 0.35 : 0.2,
                strokeColor: zone.color,
                strokeWeight: isSelected ? 2.5 : 1.5,
                editable: isSelected && isEditing,
                draggable: false,
                zIndex: isSelected ? 2 : 1,
              }}
              onLoad={(poly) => {
                polygonRefs.current[zone.id] = poly;
              }}
              onUnmount={() => {
                delete polygonRefs.current[zone.id];
              }}
              onClick={() => {
                if (!drawingMode) {
                  setSelectedZoneId(zone.id);
                  setIsEditing(false);
                }
              }}
              onMouseUp={() => {
                if (isEditing && isSelected) {
                  handlePolygonPathChange(zone.id);
                }
              }}
            />
          );
        })}
      </GoogleMap>

      {/* Zone count badge */}
      <ZoneCountBadge count={zones.length} />
    </div>
  );
};

export default ServiceZoneMap;
