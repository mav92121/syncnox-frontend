"use client";
import { Button } from "antd";
import { logout } from "@/api/auth.api";
import { useRouter } from "next/navigation";
export default function Home() {
  const router = useRouter();
  const handleLogout = async () => {
    const result = await logout();
    if (result?.status === 200) {
      console.log("logout success -> ", result);
      router.push("/sign-in");
    }
  };
  return (
    <>
      <h1>Home</h1>
      <Button onClick={handleLogout}>Logout</Button>
    </>
  );
}
