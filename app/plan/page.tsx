import GoogleMaps from "@/components/GoogleMaps";
import { Button } from "antd";
import { FileAddOutlined, UploadOutlined } from "@ant-design/icons";
import React from "react";

const Plan = () => {
  return (
    <div className="h-full w-full">
      <div className="h-full w-full opacity-30">
        <GoogleMaps
          showMapTypeControl={false}
          showZoomControl={false}
          zoom={8}
          center={{ lat: 37.7749, lng: -122.4194 }}
        />
      </div>
      <div className="absolute top-1/3 right-1/2 transform translate-x-1/2 translate-y-1/2 flex flex-col gap-5 w-[500px]">
        <Button size="large" className="flex gap-1">
          <UploadOutlined /> <p className="text-lg">Bulk Upload Jobs</p>
        </Button>
        <Button size="large" className="flex gap-1" type="primary">
          <FileAddOutlined /> <p className="text-lg">Manually Add Jobs</p>
        </Button>
      </div>
    </div>
  );
};

export default Plan;
