export const formatTimeWindow = (
  timeWindow1: string | undefined,
  timeWindow2: string | undefined
) => {
  if (!timeWindow1 || !timeWindow2) return "";
  const arr1 = timeWindow1.split(":");
  const arr2 = timeWindow2.split(":");
  return `${arr1[0]}:${arr1[1]} - ${arr2[0]}:${arr2[1]}`;
};
