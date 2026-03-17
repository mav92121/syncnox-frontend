"use client";

import { App, ConfigProvider } from "antd";
import theme from "@/config/theme.config";

interface AntdConfigProviderProps {
  children: React.ReactNode;
}

export default function AntdConfigProvider({
  children,
}: AntdConfigProviderProps) {
  return (
    <ConfigProvider
      theme={theme}
      form={{
        requiredMark: (label, { required }) => (
          <>
            {label}
            {required && (
              <span style={{ color: "#ff4d4f", marginLeft: 4 }}>*</span>
            )}
          </>
        ),
      }}
    >
      <App>{children}</App>
    </ConfigProvider>
  );
}
