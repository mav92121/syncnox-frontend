"use client";
import { useJobsStore } from "@/zustand/jobs.store";
import { Spin } from "antd";

export default function JobsList() {
  const { filteredJobs, isLoading, error, setStatusFilter } = useJobsStore();

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-12rem)]">
        <Spin size="large" />
        <div className="mt-4 text-primary">Loading Jobs...</div>
      </div>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <div className="filters">
        <button onClick={() => setStatusFilter(null)}>All</button>
        <button onClick={() => setStatusFilter("draft")}>Draft</button>
        <button onClick={() => setStatusFilter("scheduled")}>Scheduled</button>
        <button onClick={() => setStatusFilter("completed")}>Completed</button>
      </div>

      <div className="jobs-list">
        {filteredJobs.length === 0 ? (
          <p>No jobs found</p>
        ) : (
          filteredJobs.map((job) => (
            <div key={job.id} className="job-item">
              <h3>
                {job.business_name || `${job.first_name} ${job.last_name}`}
              </h3>
              <p>Status: {job.status}</p>
              <p>Type: {job.job_type}</p>
              <p>Date: {new Date(job.scheduled_date).toLocaleDateString()}</p>
              <p>Address: {job.address_formatted}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
