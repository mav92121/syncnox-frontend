"use client";

import { useIndexStore } from "@/zustand/index.store";
import DashboardView from "./_components/DashboardView";
import JobsList from "./_components/JobsList";
import RoutesView from "./_components/RoutesView";
import ScheduleView from "./_components/ScheduleView";

const Dashboard = () => {
  const { currentTab } = useIndexStore();

  const renderTabContent = () => {
    switch (currentTab) {
      case "dashboard":
        return <DashboardView />;
      case "jobs":
        return <JobsList />;
      case "routes":
        return <RoutesView />;
      case "schedule":
        return <ScheduleView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="h-full">
      <div className="h-full">{renderTabContent()}</div>
    </div>
  );
};

export default Dashboard;
