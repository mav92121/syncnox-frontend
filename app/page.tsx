"use client";
import { useRouter } from "next/navigation";
import { useIndexStore } from "@/zustand/index.store";

export default function Home() {
  const { setCurrentTab } = useIndexStore();
  const router = useRouter();
  setCurrentTab("dashboard");
  router.replace("/dashboard");
}
