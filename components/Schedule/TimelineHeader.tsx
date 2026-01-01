"use client";

interface TimelineHeaderProps {
  dayStartHour?: number;
  dayEndHour?: number;
  slotMinutes?: number;
}

export default function TimelineHeader({
  dayStartHour = 0,
  dayEndHour = 24,
}: TimelineHeaderProps) {
  const hours = [];
  for (let h = dayStartHour; h < dayEndHour; h++) {
    hours.push(h);
  }

  return (
    <div className="flex border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
      {/* Driver column - sticky */}
      <div className="w-[180px] min-w-[180px] py-2 px-3 font-semibold border-r border-gray-200 bg-gray-50 sticky left-0 z-[5]">
        Driver
      </div>

      {/* Timeline hours */}
      <div className="flex-1 flex relative">
        {hours.map((hour) => (
          <div
            key={hour}
            className="flex-1 min-w-[60px] py-2 px-1 text-left text-xs font-medium text-gray-500 border-r border-gray-100"
          >
            {hour.toString().padStart(2, "0")}:00
          </div>
        ))}
      </div>
    </div>
  );
}
