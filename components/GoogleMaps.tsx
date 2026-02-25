"use client";
import React, { useState, useCallback, useEffect } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  Polyline,
  InfoWindow,
} from "@react-google-maps/api";
import { Button, Dropdown, Radio, Spin } from "antd";
import { Layers } from "lucide-react";
import { Job, JobType } from "@/types/job.type";
import { createCustomMarkerIcon } from "@/utils/customMapMarker";

type MapType = "roadmap" | "satellite" | "hybrid" | "terrain";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const mapTypeStyles: React.CSSProperties = {
  position: "absolute",
  top: "10px",
  right: "10px",
  zIndex: 1,
  backgroundColor: "white",
  borderRadius: "4px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
  padding: "8px 0",
};

const defaultCenter = {
  lat: 37.7749,
  lng: -122.4194,
};

interface MarkerData {
  id: string | number;
  position: google.maps.LatLngLiteral;
  title?: string;
  description?: string;
  duration?: number;
  timeWindowStart?: string;
  timeWindowEnd?: string;
  jobType?: JobType;
  jobData?: Pick<Job, "id" | "address_formatted" | "status" | "location"> | Job;
  sequenceNumber?: number;
  color?: string;
  isDepot?: boolean;
  draggable?: boolean;
}

interface PolylineData {
  path: google.maps.LatLngLiteral[];
  options?: google.maps.PolylineOptions;
}

interface GoogleMapsProps {
  center?: google.maps.LatLngLiteral;
  zoom?: number;
  markers?: MarkerData[];
  polylines?: PolylineData[];
  InfoWindowModal?: React.FC<{ marker: MarkerData }>;
  selectedMarkerId?: string | number | null;
  onMarkerSelect?: (markerId: string | number | null) => void;
  onMarkerDragEnd?: (
    markerId: string | number,
    newPosition: google.maps.LatLngLiteral,
  ) => void;
  showMapTypeControl?: boolean;
  showZoomControl?: boolean;
  showDirectionArrows?: boolean;
}

const GoogleMaps: React.FC<GoogleMapsProps> = ({
  center = defaultCenter,
  zoom = 12,
  markers = [],
  polylines = [],
  InfoWindowModal,
  selectedMarkerId,
  onMarkerSelect,
  onMarkerDragEnd,
  showMapTypeControl = true,
  showZoomControl = true,
  showDirectionArrows = false,
}) => {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY || "",
  });
  const [mapTypeId, setMapTypeId] = useState<MapType>("roadmap");
  const [selectedMarker, setSelectedMarker] = useState<MarkerData | null>(null);

  const onLoad = useCallback(
    function callback(map: google.maps.Map) {
      // Always set the center and zoom explicitly
      // This ensures the zoom prop is respected regardless of markers
      map.setCenter(center);
      map.setZoom(zoom);
    },
    [center, zoom],
  );

  const handleMapTypeChange = (type: MapType) => {
    setMapTypeId(type);
  };

  // Sync selected marker with external selectedMarkerId prop
  useEffect(() => {
    if (selectedMarkerId !== undefined) {
      const marker = markers.find((m) => m.id === selectedMarkerId);
      setSelectedMarker(marker || null);
    }
  }, [selectedMarkerId, markers]);

  if (!isLoaded) {
    return <></>;
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={zoom}
      onLoad={onLoad}
      options={{
        mapTypeId: mapTypeId,
        disableDefaultUI: true,
        zoomControl: showZoomControl ? true : false,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
        ],
      }}
    >
      {showMapTypeControl && (
        <Dropdown
          popupRender={() => (
            <div style={mapTypeStyles}>
              <Radio.Group
                value={mapTypeId}
                onChange={(e) => handleMapTypeChange(e.target.value as MapType)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  padding: "0 12px",
                }}
              >
                <Radio value="roadmap">Roadmap</Radio>
                <Radio value="satellite">Satellite</Radio>
                <Radio value="hybrid">Hybrid</Radio>
                <Radio value="terrain">Terrain</Radio>
              </Radio.Group>
            </div>
          )}
          trigger={["hover", "click"]}
          placement="bottomRight"
        >
          <Button
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              zIndex: 1,
              backgroundColor: "white",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            }}
          >
            <Layers />
          </Button>
        </Dropdown>
      )}
      {/* Child components, such as markers, info windows, etc. */}
      {markers.map((marker) => {
        // Determine the number to display on the marker
        const markerNumber =
          marker.sequenceNumber ?? marker.jobData?.id ?? marker.id;

        // Get job status for color
        const status = marker.jobData?.status || "draft";

        // Check if this marker is selected
        const isSelected = selectedMarker?.id === marker.id;

        // Create custom icon
        const icon = createCustomMarkerIcon(
          markerNumber,
          status,
          isSelected,
          marker.color,
          marker.isDepot,
        );

        return (
          <Marker
            key={marker.id}
            position={marker.position}
            title={marker.title}
            icon={icon}
            draggable={marker.draggable}
            onClick={() => {
              setSelectedMarker(marker);
              onMarkerSelect?.(marker.id);
            }}
            onDragEnd={(e) => {
              if (e.latLng && onMarkerDragEnd) {
                onMarkerDragEnd(marker.id, {
                  lat: e.latLng.lat(),
                  lng: e.latLng.lng(),
                });
              }
            }}
          />
        );
      })}

      {polylines.map((line, index) => {
        const polylineOptions = { ...line.options };
        if (showDirectionArrows && window.google) {
          polylineOptions.icons = [
            {
              icon: {
                path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                scale: 2,
                strokeColor: line.options?.strokeColor ?? "red",
                strokeWeight: 2,
                fillColor: line.options?.strokeColor || "#1890ff",
                fillOpacity: 1,
              },
              offset: "50px",
              repeat: "100px",
            },
          ];
        }
        return (
          <Polyline key={index} path={line.path} options={polylineOptions} />
        );
      })}

      {selectedMarker && (
        <InfoWindow
          position={selectedMarker.position}
          onCloseClick={() => {
            setSelectedMarker(null);
            onMarkerSelect?.(null);
          }}
          options={{
            pixelOffset: new window.google.maps.Size(0, -30),
          }}
        >
          {InfoWindowModal ? (
            <InfoWindowModal marker={selectedMarker} />
          ) : (
            <div style={{ padding: "10px" }}>
              <p>{selectedMarker.description || "No description available."}</p>
            </div>
          )}
        </InfoWindow>
      )}
    </GoogleMap>
  );
};

export default React.memo(GoogleMaps);
