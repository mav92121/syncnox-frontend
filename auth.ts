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
          // Validate credentials against backend
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_SERVER_URL}/api/auth/verify-credentials`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
              }),
            }
          );

          if (!response.ok) {
            console.error("Login failed:", response.statusText);
            return null;
          }

          const data = await response.json();

          // Return user object that will be stored in the JWT
          return {
            id: data.user.id,
            email: data.user.email,
            tenant_id: data.user.tenant_id,
          };
        } catch (error) {
          console.error("Authorization error:", error);
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
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.tenant_id = user.tenant_id;

        // Create access token for backend API calls
        // Using the same JWT library that backend expects
        const jose = await import("jose");
        const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);

        const accessToken = await new jose.SignJWT({
          id: user.id,
          tenant_id: user.tenant_id,
          email: user.email,
        })
          .setProtectedHeader({ alg: "HS256" })
          .setExpirationTime("24h")
          .sign(secret);

        token.access_token = accessToken;
      }

      return token;
    },
    async session({ session, token }) {
      // Expose user data to the client
      session.user.id = token.id;
      session.user.email = token.email;
      session.user.tenant_id = token.tenant_id;
      session.access_token = token.access_token;

      return session;
    },
  },
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET,
});
