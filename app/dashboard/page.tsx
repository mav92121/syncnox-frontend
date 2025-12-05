"use client";

import { useEffect } from "react";
import { useTabStore } from "@/zustand/tab.store";
import { useJobsStore } from "@/zustand/jobs.store";
import DashboardView from "./_components/DashboardView";
import JobsList from "./_components/JobsList";
import RoutesView from "./_components/RoutesView";
import ScheduleView from "./_components/ScheduleView";

const Dashboard = () => {
  const { currentTab } = useTabStore();
  const { initializeJobs } = useJobsStore();

  useEffect(() => {
    initializeJobs();
  }, []);

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
    <div>
      <div>{renderTabContent()}</div>
    </div>
  );
};

export default Dashboard;
