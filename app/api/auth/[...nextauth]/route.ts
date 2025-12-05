import { auth, handlers } from "@/auth";
import { NextRequest } from "next/server";

// ✅ Explicit route segment config for Next.js 16
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ✅ Try alternative export pattern
export async function GET(req: NextRequest) {
  return await handlers.GET(req);
}

export async function POST(req: NextRequest) {
  return await handlers.POST(req);
}
