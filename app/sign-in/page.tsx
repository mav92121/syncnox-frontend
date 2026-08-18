"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useIndexStore } from "@/store/index.store";
import { useState } from "react";
import { Button } from "antd";
import { Zap, Building2, Bot, FileUp } from "lucide-react";


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
    <div className="grid grid-cols-1 md:grid-cols-[55%_45%] h-screen max-h-screen w-screen max-w-vw overflow-hidden font-sans">
      {/* ── Left brand panel ─────────────────────────────── */}
      <div className="relative overflow-hidden bg-[#003220] text-white p-9 md:p-11 flex flex-col justify-between h-screen box-border rounded-none hidden md:flex">
        {/* Decorative ambient gradients */}
        <div className="absolute w-[450px] h-[450px] rounded-none bg-[radial-gradient(circle,rgba(110,180,110,0.12)_0%,transparent_70%)] -top-[120px] -right-[120px] pointer-events-none" />
        <div className="absolute w-[350px] h-[350px] rounded-none bg-[radial-gradient(circle,rgba(236,253,245,0.08)_0%,transparent_70%)] -bottom-[120px] -left-[100px] pointer-events-none" />

        {/* Brand */}
        <div className="relative z-10 flex items-center gap-3 font-bold text-xl tracking-tight text-white shrink-0">
          <Image
            src="/logo.svg"
            alt="Syncnox"
            width={32}
            height={32}
            className="brightness-0 invert"
          />
          <span className="font-bold text-3xl tracking-tight text-white">Syncnox</span>
        </div>

        {/* Copy & Feature Cards */}
        <div className="relative z-10 mt-4 shrink-0">
          <h1 className="text-xl md:text-2xl font-bold leading-tight mb-4 text-white max-w-[440px] tracking-tight">
            Plan a full day of deliveries in seconds.
          </h1>
          <p className="text-sm text-[#a7f3d0] max-w-[420px] mb-4 leading-relaxed">
            Syncnox optimizes routes for your entire fleet at once — fewer miles,
            faster drops, and drivers who finish on time.
          </p>

          <div className="grid grid-cols-2 gap-3 mt-6 mb-4">
            <div className="flex items-start gap-3 bg-white/[0.04] border border-white/[0.08] p-3 rounded-none hover:bg-white/[0.08] hover:border-[#6eb46e]/30 transition-all">
              <div className="w-8 h-8 rounded-none bg-[#6eb46e]/15 border border-[#6eb46e]/25 text-[#6eb46e] flex items-center justify-center shrink-0">
                <Zap size={16} />
              </div>
              <div>
                <b className="block text-xs font-semibold text-white leading-tight">Instant optimization</b>
                <small className="block text-[11px] text-[#a7f3d0] leading-tight mt-0.5">Sequence hundreds of stops in a single click</small>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white/[0.04] border border-white/[0.08] p-3 rounded-none hover:bg-white/[0.08] hover:border-[#6eb46e]/30 transition-all">
              <div className="w-8 h-8 rounded-none bg-[#6eb46e]/15 border border-[#6eb46e]/25 text-[#6eb46e] flex items-center justify-center shrink-0">
                <Building2 size={16} />
              </div>
              <div>
                <b className="block text-xs font-semibold text-white leading-tight">Multi-depot &amp; fleets</b>
                <small className="block text-[11px] text-[#a7f3d0] leading-tight mt-0.5">Vans, trucks, bikes across multiple warehouses</small>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white/[0.04] border border-white/[0.08] p-3 rounded-none hover:bg-white/[0.08] hover:border-[#6eb46e]/30 transition-all">
              <div className="w-8 h-8 rounded-none bg-[#6eb46e]/15 border border-[#6eb46e]/25 text-[#6eb46e] flex items-center justify-center shrink-0">
                <Bot size={16} />
              </div>
              <div>
                <b className="block text-xs font-semibold text-white leading-tight">Syncnox MCP</b>
                <small className="block text-[11px] text-[#a7f3d0] leading-tight mt-0.5">AI-powered route planning &amp; automation</small>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white/[0.04] border border-white/[0.08] p-3 rounded-none hover:bg-white/[0.08] hover:border-[#6eb46e]/30 transition-all">
              <div className="w-8 h-8 rounded-none bg-[#6eb46e]/15 border border-[#6eb46e]/25 text-[#6eb46e] flex items-center justify-center shrink-0">
                <FileUp size={16} />
              </div>
              <div>
                <b className="block text-xs font-semibold text-white leading-tight">One-click import</b>
                <small className="block text-[11px] text-[#a7f3d0] leading-tight mt-0.5">Bring your stops straight from a spreadsheet</small>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div className="relative z-10 mt-auto bg-white/[0.06] border border-white/[0.12] rounded-none p-3 shrink-0">
          <div className="flex justify-between items-center text-[11px] text-[#a7f3d0] font-semibold">
            <span>Today&apos;s route · 12 stops</span>
            <span className="bg-[#6eb46e]/20 text-[#6eb46e] px-2 py-0.5 rounded-none border border-[#6eb46e]/30 text-[10px]">−31% drive time</span>
          </div>
          <svg viewBox="0 0 440 72" className="w-full h-12 my-1.5">
            <path
              d="M20 58 L80 34 L140 48 L210 20 L270 38 L340 14 L420 42"
              stroke="#6eb46e"
              strokeWidth="2.5"
              fill="none"
            />
            <g fill="#6eb46e" stroke="#002a00" strokeWidth="1.5">
              <rect x="16" y="54" width="8" height="8" />
              <rect x="76" y="30" width="8" height="8" />
              <rect x="136" y="44" width="8" height="8" />
              <rect x="206" y="16" width="8" height="8" />
              <rect x="266" y="34" width="8" height="8" />
              <rect x="336" y="10" width="8" height="8" />
              <rect x="416" y="38" width="8" height="8" />
            </g>
          </svg>
          <div className="flex gap-5 mt-0.5">
            <div>
              <b className="text-base text-white block">2h 40m</b>
              <small className="text-[10px] text-[#a7f3d0]">Route time</small>
            </div>
            <div>
              <b className="text-base text-white block">$46</b>
              <small className="text-[10px] text-[#a7f3d0]">Fuel saved</small>
            </div>
            <div>
              <b className="text-base text-white block">98%</b>
              <small className="text-[10px] text-[#a7f3d0]">On-time</small>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right form panel ──────────────────────────────── */}
      <div className="bg-white flex items-center justify-center p-8 h-screen box-border overflow-hidden">
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
