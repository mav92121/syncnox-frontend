"use client";

import { Suspense } from "react";
import LocationsView from "../locations/_components/LocationsView";
import { Spin } from "antd";

export default function DepotPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-full">
          <Spin size="large" />
        </div>
      }
    >
      <LocationsView defaultTab="depots" />
    </Suspense>
  );
}
