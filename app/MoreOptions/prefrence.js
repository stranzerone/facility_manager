import React from "react";

const PreferencesSection = (isDarkMode, nightMode, setNightMode, notificationSound, setNotificationSound) => {
  return {
    id: "preferences",
    title: "Preferences",
    items: [
      {
        id: "nightMode",
        title: "Dark Mode",
        subtitle: "Switch between light and dark theme",
        icon: isDarkMode ? "moon" : "sun",
        onPress: () => setNightMode(!nightMode),
        showToggle: true,
        toggleValue: isDarkMode,
      },
      {
        id: "notifications",
        title: "Notification Sound",
        subtitle: "Enable or disable notification sounds",
        icon: notificationSound ? "volume-2" : "volume-x",
        onPress: () => setNotificationSound(!notificationSound),
        showToggle: true,
        toggleValue: notificationSound,
      },
    ],
  };
};

export default PreferencesSection;