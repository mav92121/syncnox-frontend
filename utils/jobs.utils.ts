export const formatTimeWindow = (timeWindow: string | null) => {
  if (!timeWindow) return "";
  const [hours, minutes] = timeWindow.split("T")[1].split(":");
  return `${hours}:${minutes}`;
};
