"use client";
import React from "react";

interface ZoneCountBadgeProps {
  count: number;
}

const ZoneCountBadge: React.FC<ZoneCountBadgeProps> = ({ count }) => {
  if (count === 0) return null;

  return (
    <div className="absolute bottom-2.5 right-2.5 bg-white rounded-md py-1 px-2.5 text-xs text-gray-600 shadow-sm border border-gray-200 pointer-events-none font-medium">
      {count} zone{count !== 1 ? "s" : ""} defined
    </div>
  );
};

export default ZoneCountBadge;
