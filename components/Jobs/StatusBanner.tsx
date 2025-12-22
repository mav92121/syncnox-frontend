// Reusable Badge Component for scalable cell rendering
const StatusBadge = ({
  value,
  styleMap,
}: {
  value: string;
  styleMap: Record<string, string>;
}) => {
  const style = styleMap[value] || styleMap.default;
  return (
    <div className="flex text-center items-center justify-start h-full w-full">
      <span className={`${style} px-3 text-sm font-medium min-w-[100px]`}>
        {value
          .split("_")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")}
      </span>
    </div>
  );
};

export default StatusBadge;
