import type { ThemeConfig } from "antd";
const theme: ThemeConfig = {
  token: {
    colorPrimary: "#003220",
    borderRadius: 0,
    fontFamily: "Inter, sans-serif",
    fontSize: 13,
    // Fix focus border width
    lineWidth: 1,
    lineWidthBold: 1,
    // Control border colors
    colorBorder: "#d9d9d9",
    colorBorderSecondary: "#f0f0f0",
    // Fix focus states
    controlOutlineWidth: 0.5,
    controlOutline: "#003220",
    controlHeight: 38, // Increased from default
  },
  components: {
    Input: {
      // Remove thick focus border
      activeBorderColor: "#003220",
      hoverBorderColor: "#003220",
      activeShadow: "0 0 0 1px rgba(0, 50, 32, 0.1)",
      errorActiveShadow: "0 0 0 1px #ff4d4f",
      warningActiveShadow: "0 0 0 1px #faad14",
      controlHeight: 38,
      paddingBlock: 8,
      fontSize: 12,
    },
    Select: {
      // Fix dropdown styling
      activeBorderColor: "#003220",
      hoverBorderColor: "#003220",
      //   activeShadow: "0 0 0 1px rgba(0, 50, 32, 0.1)",
      // Fix dropdown options
      optionSelectedBg: "#F6FFED",
      optionActiveBg: "#f5f5f5",
      optionSelectedColor: "#003220",
      controlHeight: 38,
      fontSize: 12,
      // paddingBlock: 8,
    },
    DatePicker: {
      activeBorderColor: "#003220",
      hoverBorderColor: "#003220",
      activeShadow: "0 0 0 1px rgba(0, 50, 32, 0.1)",
      controlHeight: 38,
      paddingBlock: 8,
      fontSize: 12,
    },
    // TimePicker: {
    //   controlHeight: 38,
    //   paddingBlock: 8,
    // },
    Button: {
      // Ensure button styling is consistent
      // primaryShadow: "0 2px 0 rgba(0, 50, 32, 0.1)",
      controlHeight: 38,
      paddingBlock: 8,
      fontSize: 12,
    },
    Checkbox: {
      // Fix checkbox border and focus styles
      controlHeight: 20,
      borderRadiusSM: 5,
      controlOutlineWidth: 0.5,
      controlOutline: "#003220",
      colorPrimary: "#003220",
      colorBorder: "#d9d9d9",
      colorBorderSecondary: "#f0f0f0",
      fontSize: 12,
    },
    Table: {
      rowSelectedBg: "#F6FFED",
      rowSelectedHoverBg: "#F6FFED",
      fontSize: 12,
    },
    Message: {
      colorSuccess: "#003220",
      fontSize: 12,
    },
  },
};

export default theme;
