"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Spin, Alert } from "antd";
import OptimizationView from "../_components/OptimizationView";
import { useOptimizationStore } from "@/zustand/optimization.store";

const RoutePage = () => {
  const params = useParams();
  const id = params?.id ? Number(params.id) : null;
  const { fetchOptimization, currentOptimization, error } =
    useOptimizationStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      // Check if we already have this optimization in the store (from polling)
      if (currentOptimization && currentOptimization.id === id) {
        // Already have the data, no need to fetch
        setIsLoading(false);
        return;
      }

      // Need to fetch the data
      setIsLoading(true);
      fetchOptimization(id)
        .then(() => setIsLoading(false))
        .catch(() => setIsLoading(false));
    }
  }, [id, fetchOptimization, currentOptimization]);

  if (isLoading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <Spin size="large" tip="Loading optimization data..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <Alert
          message="Error Loading Optimization"
          description={error}
          type="error"
          showIcon
        />
      </div>
    );
  }

  if (!currentOptimization) {
    return (
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <Alert
          message="Optimization Not Found"
          description="The requested optimization could not be found."
          type="warning"
          showIcon
        />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col">
      {/* Unassigned Jobs Warning */}
      {currentOptimization.result?.unassigned_job_ids &&
        currentOptimization.result.unassigned_job_ids.length > 0 && (
          <div className="p-3 border-b bg-orange-50">
            <Alert
              message={`${currentOptimization.result.unassigned_job_ids.length} Job(s) Unassigned`}
              description={
                <div>
                  <p className="mb-2">
                    The following jobs could not be assigned to any route:{" "}
                    <strong>
                      #
                      {currentOptimization.result.unassigned_job_ids.join(
                        ", #"
                      )}
                    </strong>
                  </p>
                  <p className="text-sm">
                    <strong>Common reasons:</strong>
                  </p>
                  <ul className="text-sm list-disc ml-5 mt-1">
                    <li>Job time windows don't fit driver working hours</li>
                    <li>
                      Route would exceed driver's maximum distance or working
                      time
                    </li>
                    <li>Not enough drivers assigned to handle all jobs</li>
                    <li>Job location too far from depot or other jobs</li>
                  </ul>
                  <p className="text-sm mt-2">
                    <strong>Suggestions:</strong> Add more drivers, adjust time
                    windows, or increase maximum distance limits.
                  </p>
                </div>
              }
              type="warning"
              showIcon
              closable
            />
          </div>
        )}

      {/* Optimization View */}
      <div className="flex-1 min-h-0">
        <OptimizationView route={currentOptimization} />
      </div>
    </div>
  );
};

export default RoutePage;
