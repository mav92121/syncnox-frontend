"use client";
import { usePathname } from "next/navigation";
import SideBar from "@/components/SideBar";
import NavBar from "@/components/NavBar";
import { Suspense, useEffect } from "react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { useJobsStore } from "@/zustand/jobs.store";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  // Register AG Grid modules on client side only to prevent hydration issues
  useEffect(() => {
    ModuleRegistry.registerModules([AllCommunityModule]);
  }, []);
  const { initializeJobs } = useJobsStore();
  useEffect(() => {
    initializeJobs();
  }, []);
  const isSignInPage = pathname === "/sign-in";

  if (isSignInPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <SideBar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Suspense fallback={null}>
          <NavBar />
        </Suspense>
        <main className="flex-1 overflow-y-auto p-2">{children}</main>
      </div>
    </div>
  );
};

export default AppLayout;
