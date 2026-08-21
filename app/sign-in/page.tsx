"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useIndexStore } from "@/store/index.store";
import { useState } from "react";
import { Button } from "antd";

export default function SignInPage() {
  const router = useRouter();
  const { setCurrentTab } = useIndexStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password. Please try again.");
        return;
      }

      if (result?.ok) {
        router.replace("/dashboard");
        setCurrentTab("dashboard");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen max-h-screen w-screen max-w-vw overflow-hidden font-sans">
      {/* ── Left brand panel ─────────────────────────────── */}
      <div className="relative hidden md:flex h-screen shrink-0 items-center justify-center bg-[#003220] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/Synced for Smarter Ops_page-0001.jpg.jpeg"
          alt="Synced for Smarter Ops"
          className="h-full w-auto object-contain block"
        />
      </div>

      {/* ── Right form panel ──────────────────────────────── */}
      <div className="flex-1 bg-white flex items-center justify-center p-8 h-screen box-border overflow-y-auto">
        <div className="max-w-[380px] w-full flex flex-col">
          {/* Logo + title */}
          <div className="text-center mb-6 flex flex-col items-center">
            <Image
              src="/syncnox.svg"
              alt="Syncnox"
              width={140}
              height={38}
              priority
              className="mb-2"
            />
            <p className="text-2xl font-bold text-gray-900 mt-3 mb-1">Sign in</p>
            {/* <p className="text-xs text-gray-500">Welcome back. Let&apos;s plan some routes.</p> */}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="mt-6 flex flex-col gap-3.5">
              {/* Email */}
              <div>
                <label htmlFor="si-email" className="block text-xs font-semibold text-gray-800 mb-1.5">
                  Email <span className="text-red-600">*</span>
                </label>
                <input
                  id="si-email"
                  type="email"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-none text-sm text-gray-900 bg-white focus:outline-none focus:border-[#003220] focus:ring-2 focus:ring-[#ecfdf5] transition-all"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="si-password" className="block text-xs font-semibold text-gray-800 mb-1.5">
                  Password <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <input
                    id="si-password"
                    type={showPw ? "text" : "password"}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-none text-sm text-gray-900 bg-white focus:outline-none focus:border-[#003220] focus:ring-2 focus:ring-[#ecfdf5] transition-all pr-14"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-none border-none text-xs font-semibold text-gray-500 hover:text-gray-900 cursor-pointer rounded-none"
                    onClick={() => setShowPw((v) => !v)}
                    tabIndex={-1}
                  >
                    {showPw ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-none p-3 text-xs text-red-600">
                  {error}
                </div>
              )}
            </div>

            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="w-full h-11 bg-[#003220] hover:bg-[#002a00] !border-[#003220] rounded-none font-semibold text-sm transition-all mt-5"
              id="si-submit-btn"
            >
              Sign In
            </Button>

          </form>

          <p className="text-center mt-4 text-xs text-gray-500">✓ No credit card required · 14-day free trial</p>
        </div>
      </div>
    </div>
  );
}
