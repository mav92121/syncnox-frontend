import dayjs from "dayjs";

export const PIXELS_PER_MINUTE = 4; // Width of 1 minute in pixels
export const HEADER_HEIGHT = 40;
export const ROW_HEIGHT = 80;

export const calculateTimeRange = (routes: any[]) => {
  let minTime: dayjs.Dayjs | null = null;
  let maxTime: dayjs.Dayjs | null = null;

  routes.forEach((route) => {
    route.stops.forEach((stop: any) => {
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
  startTime: dayjs.Dayjs
): number => {
  const time = dayjs(timeString);
  const diffMinutes = time.diff(startTime, "minute", true);
  return diffMinutes * PIXELS_PER_MINUTE;
};

export const generateTimeMarkers = (
  startTime: dayjs.Dayjs,
  endTime: dayjs.Dayjs,
  intervalMinutes: number = 30
) => {
  const markers = [];
  let currentTime = startTime.clone().startOf("hour"); // Align to hour
  if (currentTime.isBefore(startTime))
    currentTime = currentTime.add(intervalMinutes, "minute"); // Ensure inside range

  while (currentTime.isBefore(endTime)) {
    if (currentTime.isAfter(startTime)) {
      markers.push({
        time: currentTime,
        position:
          currentTime.diff(startTime, "minute", true) * PIXELS_PER_MINUTE,
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
