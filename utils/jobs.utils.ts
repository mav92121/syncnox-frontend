export const formatTimeWindow = (timeWindow: string | null) => {
  if (!timeWindow) return "";
  const [hours, minutes] = timeWindow.split("T")[1].split(":");
  return `${hours}:${minutes}`;
};

export const priorityStyleMap: Record<string, string> = {
  low: "bg-green-100 text-green-700 border border-green-200",
  medium: "bg-yellow-100 text-yellow-800 border border-yellow-200",
  high: "bg-red-100 text-red-800 border border-red-200",
  default: "bg-gray-100 text-gray-700 border border-gray-200",
};

export const paymentStyleMap: Record<string, string> = {
  paid: "bg-green-100 text-green-700 border border-green-200",
  unpaid: "bg-red-100 text-red-800 border border-red-200",
  default: "bg-gray-100 text-gray-700 border border-gray-200",
};

export const statusStyleMap: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700 border border-gray-200",
  assigned: "bg-yellow-100 text-yellow-800 border border-yellow-200",
  in_transit: "bg-blue-100 text-blue-800 border border-blue-200",
  completed: "bg-green-100 text-green-700 border border-green-200",
  default: "bg-gray-100 text-gray-700 border border-gray-200",
};
