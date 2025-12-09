"use client";
import React, { useState, useCallback } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  Polyline,
  InfoWindow,
} from "@react-google-maps/api";
import { Button, Dropdown, Radio, Spin } from "antd";
import { Layers } from "lucide-react";

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
  showMapTypeControl?: boolean;
  showZoomControl?: boolean;
}

const GoogleMaps: React.FC<GoogleMapsProps> = ({
  center = defaultCenter,
  zoom = 12,
  markers = [],
  polylines = [],
  InfoWindowModal,
  showMapTypeControl = true,
  showZoomControl = true,
}) => {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY || "",
  });
  const [mapTypeId, setMapTypeId] = useState<MapType>("roadmap");
  const [selectedMarker, setSelectedMarker] = useState<MarkerData | null>(null);

  const onLoad = useCallback(
    function callback(map: google.maps.Map) {
      const bounds = new window.google.maps.LatLngBounds(center);
      // Optionally fit bounds to markers if provided
      if (markers.length > 0) {
        markers.forEach((marker) => bounds.extend(marker.position));
        map.fitBounds(bounds);
      } else {
        map.setCenter(center);
        map.setZoom(zoom);
      }
    },
    [center, markers, zoom]
  );

  const handleMapTypeChange = (type: MapType) => {
    setMapTypeId(type);
  };

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
          trigger={["click"]}
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
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          position={marker.position}
          title={marker.title}
          onClick={() => setSelectedMarker(marker)}
        />
      ))}

      {polylines.map((line, index) => (
        <Polyline key={index} path={line.path} options={line.options} />
      ))}

      {selectedMarker && (
        <InfoWindow
          position={selectedMarker.position}
          onCloseClick={() => setSelectedMarker(null)}
        >
          {InfoWindowModal ? (
            <InfoWindowModal marker={selectedMarker} />
          ) : (
            <div
              style={{
                minWidth: "200px",
                minHeight: "100px",
                resize: "both",
                overflow: "auto",
                padding: "10px",
              }}
            >
              <h3 className="font-bold text-lg">
                {selectedMarker.title || "Marker Details"}
              </h3>
              <p>{selectedMarker.description || "No description available."}</p>
            </div>
          )}
        </InfoWindow>
      )}
    </GoogleMap>
  );
};

export default React.memo(GoogleMaps);
