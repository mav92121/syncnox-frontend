"use client";

export default function DashboardView() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Dashboard Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 border rounded">
          <h3 className="font-medium">Total Jobs</h3>
          <p className="text-2xl">0</p>
        </div>
        <div className="p-4 border rounded">
          <h3 className="font-medium">Active Routes</h3>
          <p className="text-2xl">0</p>
        </div>
        <div className="p-4 border rounded">
          <h3 className="font-medium">Scheduled</h3>
          <p className="text-2xl">0</p>
        </div>
      </div>
    </div>
  );
}
