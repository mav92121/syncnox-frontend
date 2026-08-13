"use client";

import { App, ConfigProvider, TimePicker, DatePicker } from "antd";
import theme from "@/config/theme.config";

// Global override: make all TimePicker and DatePicker instances auto-save on time click without requiring OK button
if (typeof window !== "undefined") {
  if (TimePicker) {
    (TimePicker as any).defaultProps = {
      ...(TimePicker as any).defaultProps,
      needConfirm: false,
    };
  }
  if (DatePicker) {
    (DatePicker as any).defaultProps = {
      ...(DatePicker as any).defaultProps,
      needConfirm: false,
    };
  }
}

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
