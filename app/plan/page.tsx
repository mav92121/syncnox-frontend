"use client";

import JobForm from "@/components/Jobs/JobForm";
import Plan from "./Plan";
import { useIndexStore } from "@/zustand/index.store";
import { Drawer } from "antd";

const page = () => {
  const { currentTab } = useIndexStore();

  const renderTabContent = () => {
    switch (currentTab) {
      case "plan":
        return <Plan />;
      default:
        return <Plan />;
    }
  };

  return <div className="h-full w-full">{renderTabContent()}</div>;
};

export default page;
