import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "API routes working!" });
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
