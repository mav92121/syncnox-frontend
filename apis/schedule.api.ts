import apiClient from "@/config/apiClient.config";
import { ScheduleResponse } from "@/types/schedule.type";

export const fetchDriverSchedule = async (
  date: string
): Promise<ScheduleResponse> => {
  const response = await apiClient.get(
    `schedule/drivers?schedule_date=${date}`
  );
  return response.data;
};
