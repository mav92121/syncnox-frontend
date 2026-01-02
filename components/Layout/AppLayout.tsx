"use client";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { Suspense, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useIndexStore } from "@/zustand/index.store";
import { useJobsStore } from "@/zustand/jobs.store";
import { useTeamStore } from "@/zustand/team.store";
import SideBar from "@/components/Layout/SideBar";
import NavBar from "@/components/Layout/NavBar";
import { useRouteStore } from "@/zustand/routes.store";
import { useDepotStore } from "@/zustand/depots.store";
import { useVehicleStore } from "@/zustand/vehicle.store";
import { useAutoSyncTab } from "@/hooks/useAutoSyncTab";
import { useOnboardingStore } from "@/zustand/onboarding.store";
import { OnboardingModal } from "@/components/Onboarding";
import CompletionScreen from "@/components/Onboarding/CompletionScreen";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const isSignInPage = pathname === "/sign-in";
  const hasInitialized = useRef(false);
  const { data: session } = useSession();
  const { setUser, clearUser } = useIndexStore();
  const { initializeTeams } = useTeamStore();
  const { initializeRoutes } = useRouteStore();
  const { initializeDepots } = useDepotStore();
  const { initializeVehicles } = useVehicleStore();
  const {
    fetchOnboardingStatus,
    onboarding,
    showCompletion,
    setShowCompletion,
  } = useOnboardingStore();

  // Register AG Grid modules on client side only to prevent hydration issues
  useEffect(() => {
    ModuleRegistry.registerModules([AllCommunityModule]);
  }, []);
  useAutoSyncTab();

  // Sync session with user store (for page refreshes and session changes)
  useEffect(() => {
    if (session?.user && !isSignInPage) {
      setUser({
        id: session.user.id,
        email: session.user.email,
        tenant_id: session.user.tenant_id.toString(),
      });
    } else if (!session && !isSignInPage) {
      // Session expired or user logged out
      clearUser();
    }
  }, [session, isSignInPage, setUser, clearUser]);

  // Initialize jobs only once for authenticated pages (not on sign-in page)
  const { initializeJobs } = useJobsStore();
  useEffect(() => {
    if (!isSignInPage && !hasInitialized.current) {
      hasInitialized.current = true;
      initializeJobs();
      initializeTeams();
      initializeRoutes();
      initializeDepots();
      initializeVehicles();
      fetchOnboardingStatus();
    }
  }, [isSignInPage, initializeJobs, initializeTeams, fetchOnboardingStatus]);

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
        <main className="flex-1 overflow-y-auto p-2 relative">{children}</main>
      </div>
      {showCompletion ? (
        <CompletionScreen onClose={() => setShowCompletion(false)} />
      ) : (
        onboarding && !onboarding.is_completed && <OnboardingModal />
      )}
    </div>
  );
};

export default AppLayout;
