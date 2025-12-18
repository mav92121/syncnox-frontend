import { GripHorizontal } from "lucide-react";
import { PanelResizeHandle } from "react-resizable-panels";

const ResizeHandle = () => {
  return (
    <PanelResizeHandle className="relative h-1 bg-gray-300 hover:bg-blue-500 transition-colors cursor-ns-resize flex items-center justify-center group">
      <div className="absolute flex items-center justify-center">
        <GripHorizontal
          size={20}
          className="text-gray-500 group-hover:text-black transition-colors"
        />
      </div>
    </PanelResizeHandle>
  );
};

export default ResizeHandle;
