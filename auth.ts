import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { User } from "next-auth";
import "next-auth/jwt";

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      tenant_id: number;
    };
    access_token: string;
  }

  interface User {
    id: string;
    email: string;
    tenant_id: number;
    access_token: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    tenant_id: number;
    access_token: string;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<User | null> {
        try {
          const apiUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/auth/verify-credentials`;

          const response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error("❌ [AUTH] API Error Response:", errorText);
            return null;
          }

          const data = await response.json();

          // ✅ Store backend's access_token directly
          return {
            id: data.user.id,
            email: data.user.email,
            tenant_id: data.user.tenant_id,
            access_token: data.access_token, // Get from backend
          };
        } catch (error) {
          console.error("❌ [AUTH] Authorization error:", error);
          console.error("❌ [AUTH] Error details:", {
            message: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined,
          });
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: "/sign-in",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.tenant_id = user.tenant_id;
        token.access_token = user.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.email = token.email;
      session.user.tenant_id = token.tenant_id;
      session.access_token = token.access_token;

      return session;
    },
  },
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET,
  basePath: "/api/auth",
});
