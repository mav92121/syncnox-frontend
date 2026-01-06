import { useState } from "react";
import { Button } from "antd";
import GoogleMaps from "@/components/GoogleMaps";
import { FileAddOutlined, UploadOutlined } from "@ant-design/icons";
import AddJobsModal from "./AddJobsModal";
import BulkUploadModal from "@/components/BulkUploadModal";
import { useDepotStore } from "@/store/depots.store";

const Plan = () => {
  const [isAddJobsModalOpen, setIsAddJobsModalOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const { depots } = useDepotStore();
  const depot = depots[0] ?? {};

  return (
    <div className="h-full w-full overflow-y-hidden">
      <div className="h-full w-full opacity-20">
        <GoogleMaps
          showMapTypeControl={false}
          showZoomControl={false}
          zoom={8}
          center={{
            lat: depot?.location?.lat ?? 37.7749,
            lng: depot?.location?.lng ?? -122.4194,
          }}
        />
      </div>
      <div className="absolute top-1/3 right-1/2 transform translate-x-1/2 translate-y-1/2 flex flex-col gap-5 w-[500px]">
        <Button
          onClick={() => setIsBulkUploadOpen(true)}
          size="middle"
          className="flex gap-1"
        >
          <UploadOutlined /> <p className="text-lg">Bulk Upload Jobs</p>
        </Button>
        <Button
          onClick={() => setIsAddJobsModalOpen(true)}
          size="middle"
          className="flex gap-1"
          type="primary"
        >
          <FileAddOutlined /> <p className="text-lg">Manually Add Job</p>
        </Button>
      </div>
      <AddJobsModal open={isAddJobsModalOpen} setOpen={setIsAddJobsModalOpen} />
      <BulkUploadModal
        open={isBulkUploadOpen}
        onClose={() => setIsBulkUploadOpen(false)}
      />
    </div>
  );
};

export default Plan;
