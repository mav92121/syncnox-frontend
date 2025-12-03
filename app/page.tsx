"use client";
import { Button, message } from "antd";
import { logout } from "@/api/auth.api";
import { useRouter } from "next/navigation";
export default function Home() {
  const router = useRouter();
  const handleLogout = async () => {
    const result = await logout();
    if (result?.status === 200) {
      router.push("/sign-in");
      message.success(result?.message);
    }
  };
  return (
    <>
      <h1>Home</h1>
      <Button onClick={handleLogout}>Logout</Button>
    </>
  );
}
