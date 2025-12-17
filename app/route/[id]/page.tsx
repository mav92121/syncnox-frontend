"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Spin, Alert, Card, List, Button, Typography } from "antd";
import { DownOutlined, UpOutlined } from "@ant-design/icons";
import OptimizationView from "../_components/OptimizationView";
import { useOptimizationStore } from "@/zustand/optimization.store";

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

  const { fetchOptimization, currentOptimization, error } =
    useOptimizationStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isUnassignedExpanded, setIsUnassignedExpanded] = useState(true);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    // Check if we already have this optimization in the store (from polling)
    const currentId = currentOptimization?.id;
    if (currentId === id) {
      // Already have the data, no need to fetch
      setIsLoading(false);
      return;
    }

    // Need to fetch the data
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
    };
  }, [id, fetchOptimization]);

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
      {/* Optimization View - Full screen */}
      <div className="flex-1 min-h-0">
        <OptimizationView route={currentOptimization} />
      </div>

      {/* Unassigned Jobs Panel - Floating Bottom Right */}
      {currentOptimization.result?.unassigned_jobs &&
        currentOptimization.result.unassigned_jobs.length > 0 && (
          <div
            className="fixed shadow-lg"
            style={{
              bottom: "20px",
              right: "20px",
              width: "320px",
              maxWidth: "calc(100vw - 40px)",
            }}
          >
            <Card
              className="rounded-lg border border-gray-200"
              bodyStyle={{
                padding: isUnassignedExpanded ? "12px 16px" : "0",
                maxHeight: isUnassignedExpanded ? "300px" : "0",
                overflow: "hidden",
                transition: "all 0.3s ease",
              }}
              title={
                <div className="flex items-center justify-between py-1">
                  <Typography.Text strong className="text-base">
                    Unassigned Jobs (
                    {currentOptimization.result.unassigned_jobs.length})
                  </Typography.Text>
                  <Button
                    type="text"
                    size="small"
                    icon={
                      isUnassignedExpanded ? <UpOutlined /> : <DownOutlined />
                    }
                    onClick={() =>
                      setIsUnassignedExpanded(!isUnassignedExpanded)
                    }
                    className="text-gray-500 hover:text-gray-700"
                  />
                </div>
              }
            >
              {isUnassignedExpanded && (
                <div className="overflow-y-auto" style={{ maxHeight: "200px" }}>
                  <List
                    size="small"
                    dataSource={currentOptimization.result.unassigned_jobs}
                    locale={{
                      emptyText: "No unassigned jobs",
                    }}
                    renderItem={(job) => (
                      <List.Item className="px-2 hover:bg-gray-50 cursor-pointer transition-colors">
                        <List.Item.Meta
                          title={
                            <Typography.Text className="text-sm">
                              {job.address_formatted}
                            </Typography.Text>
                          }
                          description={
                            <Typography.Text
                              type="secondary"
                              className="text-xs"
                            >
                              {job.reason}
                            </Typography.Text>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </div>
              )}
            </Card>
          </div>
        )}
    </div>
  );
};

export default RoutePage;
