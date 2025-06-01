// themes/themeConfig.js
const CUSTOM_PRIMARY = "#1996D3";

export const lightTheme = {
  primaryColor: CUSTOM_PRIMARY,
  backgroundColor: "#F2F2F7",
  cardBackground: "#FFFFFF",
  textPrimary: "#000000",
  textSecondary: "#6D6D70",
  shadowColor: "#000000",
  statusBarStyle: "dark-content",
  separatorColor: "#E5E5EA",
  dangerColor: "#FF3B30",
};

export const darkTheme = {
  primaryColor: CUSTOM_PRIMARY,
  backgroundColor: "#000000",
  cardBackground: "#1C1C1E",
  textPrimary: "#FFFFFF",
  textSecondary: "#8E8E93",
  shadowColor: "#FFFFFF",
  statusBarStyle: "light-content",
  separatorColor: "#38383A",
  dangerColor: "#FF453A",
};

export const getTheme = (isDarkMode) => isDarkMode ? darkTheme : lightTheme;