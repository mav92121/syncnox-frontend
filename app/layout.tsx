import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "App | Syncnox",
  description:
    "Syncnox optimizes enterprise logistics from order to delivery. Our AI-powered agents automates complex scheduling, routing, and resource allocation across field operations, healthcare, manufacturing, and fleet management. With real-time optimization and a unified command center, operators reduce costs, improve efficiency, and ensure the right people and resources are in the right place at the right time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
