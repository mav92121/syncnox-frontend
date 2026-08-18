"use client";

import { Suspense } from "react";
import LocationsView from "./_components/LocationsView";
import { Spin } from "antd";

function LocationsPageContent() {
  return <LocationsView defaultTab="depots" />;
}

export default function LocationsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-full">
          <Spin size="large" />
        </div>
      }
    >
      <LocationsPageContent />
    </Suspense>
  );
}
