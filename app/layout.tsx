import { AntdRegistry } from "@ant-design/nextjs-registry";
import type { Metadata } from "next";
import { ConfigProvider } from "antd";
import { Inter } from "next/font/google";
import theme from "@/config/theme.config";
import "./globals.css";
import AppLayout from "../components/AppLayout";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  icons: {
    icon: "logo.svg",
  },
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
      <AntdRegistry>
        <ConfigProvider theme={theme}>
          <body
            className={`${inter.className} antialiased text-[13px] overflow-hidden`}
          >
            <AppLayout>{children}</AppLayout>
          </body>
        </ConfigProvider>
      </AntdRegistry>
    </html>
  );
}
