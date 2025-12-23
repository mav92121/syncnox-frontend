import dayjs from "dayjs";

export const findClosestDateToToday = (dates: string[]): string => {
  const today = dayjs().format("YYYY-MM-DD");

  if (dates.length === 0) {
    return today;
  }

  let closestDate = dates[0];
  let minDiff = Math.abs(dayjs(closestDate).diff(today, "day"));

  for (const date of dates) {
    const diff = Math.abs(dayjs(date).diff(today, "day"));
    if (diff < minDiff) {
      minDiff = diff;
      closestDate = date;
    }
  }

  return closestDate;
};
