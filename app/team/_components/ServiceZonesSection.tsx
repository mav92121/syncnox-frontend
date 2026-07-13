"use client";
import React, { useState, useEffect } from "react";
import { Button, Spin, Alert, Tag } from "antd";
import { EnvironmentOutlined } from "@ant-design/icons";
import ServiceZoneMap, { ZonePolygon } from "./ServiceZoneMap";
import { fetchDriverZones } from "@/apis/team.api";

const ZONE_COLOR_NAMES: Record<string, string> = {
  "#E8834B": "Orange",
  "#4B9CE8": "Blue",
  "#4BE87A": "Green",
  "#E84B6B": "Red",
  "#B04BE8": "Purple",
  "#E8D84B": "Yellow",
};

interface ServiceZonesSectionProps {
  driverId: number;
  zones: ZonePolygon[];
  onZonesChange: (zones: ZonePolygon[]) => void;
}

const ServiceZonesSection: React.FC<ServiceZonesSectionProps> = ({
  driverId,
  zones,
  onZonesChange,
}) => {
  const [isLoading, setIsLoading] = useState(true);

  // Load existing zones
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await fetchDriverZones(driverId);
        if (data && data.length > 0) {
          onZonesChange(data);
        }
      } catch {
        // No zones yet – that's fine
      } finally {
        setIsLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driverId]);

  const handleClearAll = () => {
    onZonesChange([]);
  };

  return (
    <div className="px-1 flex flex-col gap-4">
      {/* Header */}
      <div>
        <h3 className="m-0 mb-1 font-semibold text-gray-800 text-sm">
          Service Areas
        </h3>
        <p className="text-xs text-gray-500">
          Use the controls in the top left corner of the map to draw a service
          area for this driver. Jobs in this area will be preferentially
          assigned to this driver.
        </p>
      </div>

      {/* Map */}
      {isLoading ? (
        <div className="h-[400px] flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
          <Spin size="large" />
        </div>
      ) : (
        <ServiceZoneMap zones={zones} onZonesChange={onZonesChange} />
      )}

      {/* Zones summary list */}
      {zones.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-3 justify-between">
            <span className="text-xs font-semibold text-gray-700">
              Defined zones:
            </span>
            <Button
              size="small"
              onClick={handleClearAll}
              danger
              className="p-0 h-auto font-medium text-xs"
            >
              Clear All Zones
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {zones.map((zone, idx) => (
              <Tag
                key={zone.id}
                color={zone.color}
                className="rounded-full px-2.5 py-0.5 text-white font-medium border-0 text-xs flex items-center"
              >
                <EnvironmentOutlined className="mr-1" />
                Zone {idx + 1}
                {ZONE_COLOR_NAMES[zone.color]
                  ? ` (${ZONE_COLOR_NAMES[zone.color]})`
                  : ""}
              </Tag>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && zones.length === 0 && (
        <Alert
          type="info"
          showIcon
          message="No service zones defined"
          description='Click the "+" button on the map to draw a service zone for this driver.'
          className="rounded-lg border-blue-100 bg-blue-50/50"
        />
      )}

      {/* Footer note */}
      <span className="block text-xs text-gray-400 italic">
        {"* If another driver's service area overlaps, jobs will be shared between the two drivers."}
      </span>
    </div>
  );
};

export default ServiceZonesSection;
