// components/profile/ProfileSettings.js
import React from "react";
import { View, Text, TouchableOpacity, Switch } from "react-native";
import { Feather } from "@expo/vector-icons";

const ProfileSettings = ({
  theme,
  isDarkMode,
  onEditProfile,
  onLogout,
  onToggleDarkMode,
  onNotificationSettings,
  onLanguageSettings,
  onPrivacySettings,
}) => {
  const SettingItem = ({
    icon,
    title,
    subtitle,
    onPress,
    hasSwitch,
    switchValue,
    onSwitchChange,
    hasChevron = true,
  }) => (
    <TouchableOpacity
      className="flex-row items-center py-4 px-5 border-b"
      style={{
        borderBottomColor: isDarkMode
          ? "rgba(255, 255, 255, 0.1)"
          : "rgba(0, 0, 0, 0.1)",
        borderBottomWidth: 1,
      }}
      onPress={onPress}
      disabled={hasSwitch}
    >
      <View
        className="w-10 h-10 rounded-full items-center justify-center mr-4"
        style={{
          backgroundColor: isDarkMode
            ? "rgba(255, 255, 255, 0.1)"
            : "rgba(25, 150, 211, 0.1)",
        }}
      >
        <Feather name={icon} size={20} color={theme.primaryColor} />
      </View>

      <View className="flex-1">
        <Text className="text-base font-medium" style={{ color: theme.textPrimary }}>
          {title}
        </Text>
        {subtitle && (
          <Text className="text-xs" style={{ color: theme.textSecondary }}>
            {subtitle}
          </Text>
        )}
      </View>

      {hasSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{ false: "#767577", true: theme.primaryColor }}
          thumbColor={switchValue ? "#FFFFFF" : "#f4f3f4"}
        />
      ) : hasChevron ? (
        <Feather name="chevron-right" size={20} color={theme.textSecondary} />
      ) : null}
    </TouchableOpacity>
  );

  return (
    <View
      className="mx-4 mt-4 rounded-2xl"
      style={{
        backgroundColor: theme.cardBackground,
        shadowColor: theme.shadowColor,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isDarkMode ? 0.3 : 0.15,
        shadowRadius: 8,
        elevation: 6,
      }}
    >
      <Text
        className="text-lg font-semibold pt-5 pb-2 px-5"
        style={{ color: theme.textPrimary }}
      >
        Settings & Preferences
      </Text>

      <SettingItem
        icon="edit-3"
        title="Edit Profile"
        subtitle="Update your personal information"
        onPress={onEditProfile}
      />

      <SettingItem
        icon="moon"
        title="Dark Mode"
        subtitle="Toggle between light and dark theme"
        hasSwitch={true}
        switchValue={isDarkMode}
        onSwitchChange={onToggleDarkMode}
      />

      <SettingItem
        icon="bell"
        title="Notification Settings"
        subtitle="Manage your notification preferences"
        onPress={onNotificationSettings}
      />

      <SettingItem
        icon="globe"
        title="Language & Region"
        subtitle="Change app language and region settings"
        onPress={onLanguageSettings}
      />

      <SettingItem
        icon="shield"
        title="Privacy & Security"
        subtitle="Manage your privacy and security settings"
        onPress={onPrivacySettings}
      />

      <TouchableOpacity
        className="flex-row items-center py-4 px-5 mt-2"
        onPress={onLogout}
      >
        <View className="w-10 h-10 rounded-full items-center justify-center mr-4" style={{ backgroundColor: "rgba(255, 59, 48, 0.1)" }}>
          <Feather name="log-out" size={20} color="#FF3B30" />
        </View>

        <Text className="text-base font-medium flex-1" style={{ color: "#FF3B30" }}>
          Sign Out
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ProfileSettings;
