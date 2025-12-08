"use client";

import Plan from "./Plan";
import { useIndexStore } from "@/zustand/index.store";
import Recents from "./Recents";

const page = () => {
  const { currentTab } = useIndexStore();

  const renderTabContent = () => {
    switch (currentTab) {
      case "plan":
        return <Plan />;
      case "recents":
        return <Recents />;
      default:
        return <Plan />;
    }
  };

  return <div className="relative h-full w-full">{renderTabContent()}</div>;
};

export default page;
