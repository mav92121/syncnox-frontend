"use client";

import { useState, useEffect, useCallback } from "react";
import { Typography, Button, Spin, message, Flex, DatePicker } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { ScheduleTimeline } from "@/components/Schedule";
import { fetchDriverSchedule } from "@/apis/schedule.api";
import {
  ResourceSchedule,
  SCHEDULE_STATUS_COLORS,
} from "@/types/schedule.type";
import dayjs, { Dayjs } from "dayjs";

const { Title } = Typography;

export default function ScheduleView() {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [resources, setResources] = useState<ResourceSchedule[]>([]);
  const [loading, setLoading] = useState(false);

  const loadSchedule = useCallback(async (date: Dayjs) => {
    setLoading(true);
    try {
      const dateStr = date.format("YYYY-MM-DD");
      const response = await fetchDriverSchedule(dateStr);
      setResources(response.resources);
    } catch (error) {
      console.error("Failed to fetch schedule:", error);
      message.error("Failed to load schedule data");
      setResources([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSchedule(selectedDate);
  }, [selectedDate, loadSchedule]);

  const goToPreviousDay = () => {
    setSelectedDate((prev) => prev.subtract(1, "day"));
  };

  const goToNextDay = () => {
    setSelectedDate((prev) => prev.add(1, "day"));
  };

  const goToToday = () => {
    setSelectedDate(dayjs());
  };

  return (
    <div className="flex flex-col h-full">
      <Flex justify="space-between" align="center" className="my-4">
        <Flex gap={24} align="center">
          <Title level={4} className="m-0 pt-2">
            Driver Schedule
          </Title>
          <Flex gap={8} align="center">
            {Object.entries(SCHEDULE_STATUS_COLORS).map(([status, color]) => (
              <Flex key={status} align="center" gap={4}>
                <div
                  style={{
                    width: "10px",
                    height: "10px",
                    backgroundColor: color,
                    borderRadius: "2px",
                  }}
                />
                <span
                  style={{
                    fontSize: "12px",
                    color: "#666",
                    textTransform: "capitalize",
                  }}
                >
                  {status.replace("_", " ")}
                </span>
              </Flex>
            ))}
          </Flex>
        </Flex>

        <Flex gap={8} align="center">
          <Button onClick={goToToday}>Today</Button>
          <Button icon={<LeftOutlined />} onClick={goToPreviousDay} />
          <DatePicker
            value={selectedDate}
            onChange={(date) => date && setSelectedDate(date)}
            format="MMM D, YYYY"
            allowClear={false}
            style={{ width: "150px" }}
          />
          <Button icon={<RightOutlined />} onClick={goToNextDay} />
        </Flex>
      </Flex>

      <div className="flex-1 min-h-0 mt-2 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
            <Spin />
          </div>
        )}
        <ScheduleTimeline
          resources={resources}
          dayStartHour={0}
          dayEndHour={24}
          slotMinutes={60}
          loading={loading}
        />
      </div>
    </div>
  );
}
