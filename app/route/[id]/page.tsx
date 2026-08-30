"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Spin, Alert } from "antd";
import { AlertTriangle, AlertCircle, MapPin, ChevronUp, ChevronDown } from "lucide-react";
import OptimizationView from "../_components/OptimizationView";
import { useOptimizationStore } from "@/store/optimization.store";

const RoutePage = () => {
  const params = useParams();

  const rawId =
    typeof params?.id === "string"
      ? params.id
      : Array.isArray(params?.id)
        ? params.id[0]
        : undefined;
  const parsedId = rawId ? Number(rawId) : NaN;
  const id = Number.isFinite(parsedId) && parsedId > 0 ? parsedId : null;

  const { fetchOptimization, currentOptimization, clearOptimization, error } =
    useOptimizationStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isUnassignedExpanded, setIsUnassignedExpanded] = useState(true);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    const currentId = currentOptimization?.id;
    if (currentId === id) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    fetchOptimization(id)
      .then(() => {
        if (!cancelled) setIsLoading(false);
      })
      .catch(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
      clearOptimization();
    };
  }, [id, fetchOptimization, clearOptimization]);

  if (isLoading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (error && !currentOptimization) {
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

  const unassignedJobs = currentOptimization.result?.unassigned_jobs || [];

  return (
    <div className="absolute inset-0 flex flex-col">
      {/* Optimization View - Full screen */}
      <div className="flex-1 min-h-0">
        <OptimizationView route={currentOptimization} />
      </div>

      {/* Unassigned Jobs Panel - Floating Bottom Right */}
      {unassignedJobs.length > 0 && (
        <div className="fixed bottom-4 right-4 z-40 w-76 max-w-[calc(100vw-32px)] transition-all duration-300">
          {isUnassignedExpanded ? (
            /* Expanded Panel Card */
            <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden flex flex-col transition-all duration-300 animate-in fade-in zoom-in-95 duration-200">
              {/* Header Bar */}
              <div
                onClick={() => setIsUnassignedExpanded(false)}
                className="px-3 py-2 bg-gray-50/90 border-b border-gray-200 flex items-center justify-between cursor-pointer select-none hover:bg-gray-100/70 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-rose-50 text-rose-600 flex items-center justify-center font-medium">
                    <AlertTriangle size={13} />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-gray-900 text-xs">
                      Unassigned Jobs
                    </span>
                    <span className="bg-rose-600 text-white font-bold text-[10px] px-1.5 py-0.2 rounded-full">
                      {unassignedJobs.length}
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsUnassignedExpanded(false);
                  }}
                  title="Minimize"
                  className="text-gray-400 hover:text-gray-700 transition-colors p-0.5 rounded hover:bg-gray-200/60 cursor-pointer"
                >
                  <ChevronDown size={15} />
                </button>
              </div>

              {/* Body List */}
              <div className="p-2.5 max-h-56 overflow-y-auto space-y-2 custom-scrollbar">
                {unassignedJobs.map((job, idx) => (
                  <div
                    key={job.job_id || idx}
                    className="bg-white border border-gray-200 rounded-md p-2 shadow-2xs hover:border-gray-300 transition-all text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900 text-[10.5px]">
                        Job #{job.job_id}
                      </span>
                      <span className="text-[9.5px] font-semibold text-rose-600 uppercase tracking-wide bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">
                        Unassigned
                      </span>
                    </div>

                    {job.address_formatted && (
                      <div className="flex items-start gap-1 text-gray-600 font-normal leading-tight text-[11px]">
                        <MapPin
                          size={12}
                          className="text-gray-400 shrink-0 mt-0.5"
                        />
                        <span className="line-clamp-1">
                          {job.address_formatted}
                        </span>
                      </div>
                    )}

                    {job.reason && (
                      <div className="flex items-start gap-1 p-1.5  border border-rose-100 rounded text-[10.5px] leading-tight">
                        <AlertCircle
                          size={12}
                          className="text-rose-500 shrink-0 mt-0.5"
                        />
                        <span className="line-clamp-2">{job.reason}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Minimized Floating Pill Button */
            <div className="flex justify-end">
              <button
                onClick={() => setIsUnassignedExpanded(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full shadow-lg border border-gray-200 text-gray-800 hover:border-[#003220] transition-all cursor-pointer select-none group"
              >
                <div className="w-4 h-4 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  <AlertTriangle size={11} />
                </div>
                <span className="font-semibold text-xs text-gray-900">
                  Unassigned Jobs
                </span>
                <span className="bg-rose-600 text-white font-bold text-[10px] px-1.5 py-0.2 rounded-full">
                  {unassignedJobs.length}
                </span>
                <ChevronUp
                  size={14}
                  className="text-gray-400 group-hover:text-gray-700 transition-colors"
                />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RoutePage;
