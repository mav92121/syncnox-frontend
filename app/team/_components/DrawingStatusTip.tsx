"use client";
import React from "react";

interface DrawingStatusTipProps {
  active: boolean;
}

const DrawingStatusTip: React.FC<DrawingStatusTipProps> = ({ active }) => {
  if (!active) return null;

  return (
    <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-10 bg-black/80 text-white py-1.5 px-3.5 rounded-full text-xs font-medium pointer-events-none whitespace-nowrap shadow-md">
      Click to place points · Click the first point to finish · Esc to cancel
    </div>
  );
};

export default DrawingStatusTip;
