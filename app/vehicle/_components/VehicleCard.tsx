import { Vehicle } from "@/types/vehicle.type";
import { Truck } from "lucide-react";
import { Checkbox } from "antd";

interface VehicleCardProps {
  vehicle: Vehicle;
  isSelected: boolean;
  isChecked?: boolean;
  onToggleCheck?: (e: React.MouseEvent) => void;
  onClick: () => void;
}

function formatType(type: string | null): string {
  if (!type) return "";
  return type
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const VehicleCard = ({
  vehicle,
  isSelected,
  isChecked = false,
  onToggleCheck,
  onClick,
}: VehicleCardProps) => {
  const sub = [formatType(vehicle.type), vehicle.license_plate]
    .filter(Boolean)
    .join(" · ");

  return (
    <div
      className={`flex items-center gap-2.5 p-2.5 cursor-pointer border transition-all mb-1 bg-white relative rounded-none ${
        isSelected
          ? "bg-emerald-50/80 border-[#003220] shadow-xs"
          : "border-transparent hover:bg-emerald-50/40 hover:border-emerald-200"
      }`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      aria-pressed={isSelected}
    >
      {onToggleCheck && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            onToggleCheck(e);
          }}
          className="shrink-0 flex items-center justify-center mr-0.5"
        >
          <Checkbox checked={isChecked} />
        </div>
      )}
      <div
        className={`w-9 h-9 flex items-center justify-center shrink-0 rounded-none ${
          isSelected
            ? "bg-[#003220] text-white"
            : "bg-slate-100 text-[#003220]"
        }`}
      >
        <Truck size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-gray-900 truncate leading-snug">
          {vehicle.name}
        </div>
        {sub && (
          <div className="text-[11.5px] text-gray-500 truncate mt-0.5 leading-snug">
            {sub}
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleCard;
