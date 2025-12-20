"use client";

import Plan from "./Plan";
import { useIndexStore } from "@/zustand/index.store";
import Recents from "./Recents";

const page = () => {
  const { currentTab } = useIndexStore();

  const renderTabContent = () => {
    switch (currentTab) {
      case "add-jobs":
        return <Plan />;
      case "unassigned-jobs":
        return <Recents />;
      default:
        return <Recents />;
    }
  };

  return <div className="relative h-full w-full">{renderTabContent()}</div>;
};

export default page;
