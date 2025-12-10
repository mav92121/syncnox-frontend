"use client";

import { useIndexStore } from "@/zustand/index.store";
import TeamList from "./_components/TeamList";

const page = () => {
  const { currentTab } = useIndexStore();

  const renderTabContent = () => {
    switch (currentTab) {
      case "team":
        return <TeamList />;
    }
  };

  return <div className="relative h-full w-full">{renderTabContent()}</div>;
};

export default page;
