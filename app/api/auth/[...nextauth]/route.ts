import { handlers } from "@/auth";
import { NextRequest } from "next/server";

console.log("NextAuth route handler loaded");

export const GET = async (req: NextRequest) => {
  console.log("GET request to auth route:", req.url);
  return handlers.GET(req);
};

export const POST = async (req: NextRequest) => {
  console.log("POST request to auth route:", req.url);
  return handlers.POST(req);
};

export const runtime = "nodejs";
