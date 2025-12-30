"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useIndexStore } from "@/zustand/index.store";

export default function Home() {
  const { setCurrentTab } = useIndexStore();
  const router = useRouter();

  useEffect(() => {
    setCurrentTab("dashboard");
    router.replace("/dashboard");
  }, [setCurrentTab, router]);

  return null;
}
