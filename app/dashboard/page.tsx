"use client";
import { fetchJobs } from "@/api/job.api";
import { useEffect } from "react";

const Dashboard = () => {
  useEffect(() => {
    fetchJobs();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
      <p>Welcome to Syncnox Dashboard</p>
    </div>
  );
};

export default Dashboard;
