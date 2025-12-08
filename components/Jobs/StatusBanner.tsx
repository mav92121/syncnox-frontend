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
        {value[0].toUpperCase() + value.slice(1)}
      </span>
    </div>
  );
};

export default StatusBadge;
