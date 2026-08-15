"use client";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { Suspense, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useIndexStore } from "@/store/index.store";
import { useJobsStore } from "@/store/jobs.store";
import { useTeamStore } from "@/store/team.store";
import SideBar from "@/components/Layout/SideBar";
import NavBar from "@/components/Layout/NavBar";
import { useRouteStore } from "@/store/routes.store";
import { useDepotStore } from "@/store/depots.store";
import { useVehicleStore } from "@/store/vehicle.store";
import { useAutoSyncTab } from "@/hooks/useAutoSyncTab";
import { useDispatchSocket } from "@/hooks/useDispatchSocket";
import { useOnboardingStore } from "@/store/onboarding.store";
import { OnboardingModal } from "@/components/Onboarding";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const isSignInPage = pathname === "/sign-in";
  const hasInitialized = useRef(false);

  useDispatchSocket();
  const { data: session } = useSession();
  const { setUser, clearUser } = useIndexStore();
  const { initializeTeams } = useTeamStore();
  const { initializeRoutes } = useRouteStore();
  const { initializeDepots } = useDepotStore();
  const { initializeVehicles } = useVehicleStore();
  const { setOnboarding, fetchOnboardingStatus, onboarding } = useOnboardingStore();

  // Register AG Grid modules on client side only to prevent hydration issues
  useEffect(() => {
    ModuleRegistry.registerModules([AllCommunityModule]);
  }, []);
  useAutoSyncTab();

  // Sync session with user store and onboarding store

  const hasFetchedOnboardingRef = useRef(false);

  useEffect(() => {
    if (session?.user && !isSignInPage) {
      setUser({
        id: session.user.id,
        email: session.user.email,
        tenant_id: session.user.tenant_id.toString(),
      });
      // Fetch latest onboarding status from backend DB once on mount / page refresh
      if (!hasFetchedOnboardingRef.current) {
        hasFetchedOnboardingRef.current = true;
        fetchOnboardingStatus().catch(() => {});
      }
    } else if (!session && !isSignInPage) {
      // Session expired or user logged out
      clearUser();
    }
  }, [session, isSignInPage, setUser, clearUser, fetchOnboardingStatus]);



  // Initialize jobs and resources for authenticated pages
  const { initializeJobs } = useJobsStore();
  useEffect(() => {
    if (!isSignInPage && !hasInitialized.current) {
      hasInitialized.current = true;
      initializeJobs();
      initializeTeams();
      initializeRoutes();
      initializeDepots();
      initializeVehicles();
      if (!session?.user?.onboarding) {
        fetchOnboardingStatus();
      }
    }
  }, [isSignInPage, initializeJobs, initializeTeams, fetchOnboardingStatus, session]);


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
        <main className="flex-1 overflow-y-auto p-2 px-4 pb-4 relative">{children}</main>
      </div>
      {/* Onboarding overlay — full-page, includes completion screen at step 5 */}
      {onboarding && !onboarding.is_completed && <OnboardingModal />}
    </div>
  );
};

export default AppLayout;
