"use client";

import React from "react";
import { Tooltip } from "antd";
import { FieldSurfaces } from "@/apis/custom-fields.api";
import { SURFACES_CONFIG, DEFAULT_SURFACES } from "./custom-fields.constants";

interface SurfacesBadgesProps {
  surfaces?: FieldSurfaces | null;
}

export const SurfacesBadges: React.FC<SurfacesBadgesProps> = ({ surfaces }) => {
  const sState = surfaces || DEFAULT_SURFACES;

  return (
    <div className="flex items-center gap-1">
      {SURFACES_CONFIG.map((s) => {
        const isOn = Boolean(sState[s.key as keyof FieldSurfaces]);
        return (
          <Tooltip key={s.key} title={s.title}>
            <span
              className={`w-5 h-5 flex items-center justify-center text-[10px] font-bold border transition-colors select-none ${
                isOn
                  ? "bg-[#003220] border-[#003220] text-white"
                  : "bg-white border-gray-200 text-gray-300"
              }`}
            >
              {s.label}
            </span>
          </Tooltip>
        );
      })}
    </div>
  );
};
