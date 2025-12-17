import { Routes, Stop } from "@/types/routes.type";
import dayjs from "dayjs";

export const HEADER_HEIGHT = 40;
export const ROW_HEIGHT = 60;

/**
 * Calculate dynamic pixels per minute based on interval
 * Smaller intervals get more pixels per minute for better spread
 */
export const getPixelsPerMinute = (intervalMinutes: number): number => {
  // Base scaling - smaller intervals need more spread
  const scalingMap: { [key: number]: number } = {
    5: 12, // 5 min intervals - most spread
    10: 8, // 10 min intervals
    15: 6, // 15 min intervals
    20: 5, // 20 min intervals
    25: 4.5, // 25 min intervals
    30: 4, // 30 min intervals - default
    60: 3, // 60 min intervals - least spread
  };

  return scalingMap[intervalMinutes] || 4; // Default to 4 if not found
};

export const calculateTimeRange = (routes: Routes[]) => {
  let minTime: dayjs.Dayjs | null = null;
  let maxTime: dayjs.Dayjs | null = null;

  routes.forEach((route) => {
    route.stops.forEach((stop: Stop) => {
      const time = dayjs(stop.arrival_time);
      if (!minTime || time.isBefore(minTime)) minTime = time;
      if (!maxTime || time.isAfter(maxTime)) maxTime = time;
    });
  });

  if (!minTime || !maxTime) {
    // Default fallback if no stops
    minTime = dayjs().startOf("day");
    maxTime = dayjs().endOf("day");
  }

  // Add buffer
  return {
    startTime: minTime.subtract(30, "minute"),
    endTime: maxTime.add(30, "minute"),
  };
};

export const getPosition = (
  timeString: string,
  startTime: dayjs.Dayjs,
  pixelsPerMinute: number = 4
): number => {
  const time = dayjs(timeString);
  const diffMinutes = time.diff(startTime, "minute", true);
  return diffMinutes * pixelsPerMinute;
};

export const generateTimeMarkers = (
  startTime: dayjs.Dayjs,
  endTime: dayjs.Dayjs,
  intervalMinutes: number = 30,
  pixelsPerMinute: number = 4
) => {
  const markers = [];
  let currentTime: dayjs.Dayjs;

  // For intervals that divide evenly into an hour, align to the appropriate boundary
  if (60 % intervalMinutes === 0) {
    // Start from the hour and find the first interval boundary after startTime
    currentTime = startTime.clone().startOf("hour");

    // Move to the first interval boundary at or after startTime
    while (currentTime.isBefore(startTime)) {
      currentTime = currentTime.add(intervalMinutes, "minute");
    }
  } else {
    // For intervals that don't divide evenly (e.g., 25 min), start from startTime
    currentTime = startTime.clone();
  }

  while (currentTime.isBefore(endTime)) {
    if (currentTime.isAfter(startTime) || currentTime.isSame(startTime)) {
      markers.push({
        time: currentTime,
        position: currentTime.diff(startTime, "minute", true) * pixelsPerMinute,
        label: currentTime.format("HH:mm"),
      });
    }
    currentTime = currentTime.add(intervalMinutes, "minute");
  }
  return markers;
};

export const ROUTE_COLORS = [
  "#1890ff", // Blue
  "#52c41a", // Green
  "#faad14", // Yellow
  "#f5222d", // Red
  "#722ed1", // Purple
  "#13c2c2", // Cyan
  "#eb2f96", // Magenta
  "#fa541c", // Orange
  "#2f54eb", // Geek Blue
  "#a0d911", // Lime
];

export const getRouteColor = (index: number) => {
  return ROUTE_COLORS[index % ROUTE_COLORS.length];
};
