import { handlers } from "@/auth";

// ✅ Export handlers directly - critical for production deployment
export const { GET, POST } = handlers;

export const runtime = "nodejs";
