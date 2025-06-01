// screens/ProfileScreen.js
import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import ProfileHeader from "../components/profile/ProfileHeader";
import ProfileSettings from "../components/profile/ProfileSettings";
import ProfileSupport from "../components/profile/ProfileSupport";

const ProfileScreen = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Dummy user data
  const userData = {
    name: "John Smith",
    technicianId: "TECH-2024-001",
    department: "IT Support",
    email: "john.smith@company.com",
    phone: "+1 (555) 123-4567",
    profileImage: null, // Set to null to show default icon
    completedJobs: 127,
    rating: 4.8,
    joinDate: "Jan 2023"
  };

  // Light and Dark themes
  const lightTheme = {
    backgroundColor: "#F5F7FA",
    cardBackground: "#FFFFFF",
    textPrimary: "#1A1A1A",
    textSecondary: "#6B7280",
    primaryColor: "#1996D3",
    shadowColor: "#000000"
  };

  const darkTheme = {
    backgroundColor: "#121212",
    cardBackground: "#1E1E1E",
    textPrimary: "#FFFFFF",
    textSecondary: "#A0A0A0",
    primaryColor: "#1996D3",
    shadowColor: "#000000"
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  // Dummy handlers
  const handleLogout = () => {
    console.log("Logout pressed");
    // Add logout logic here
  };

  const handleEditProfile = () => {
    console.log("Edit profile pressed");
    // Navigate to edit profile screen
  };

  const handleToggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <ScrollView style={{ 
      flex: 1, 
      backgroundColor: theme.backgroundColor 
    }}>
      <ProfileHeader 
        userData={userData} 
        theme={theme} 
        isDarkMode={isDarkMode} 
      />
      
      <ProfileSettings 
        theme={theme} 
        isDarkMode={isDarkMode}
        onEditProfile={handleEditProfile}
        onLogout={handleLogout}
        onToggleDarkMode={handleToggleDarkMode}
        onNotificationSettings={() => console.log("Notification settings pressed")}
        onLanguageSettings={() => console.log("Language settings pressed")}
        onPrivacySettings={() => console.log("Privacy settings pressed")}
      />
      
      <ProfileSupport 
        theme={theme} 
        isDarkMode={isDarkMode}
        onFAQ={() => console.log("FAQ pressed")}
        onContactSupport={() => console.log("Contact support pressed")}
        onReportIssue={() => console.log("Report issue pressed")}
        onRateApp={() => console.log("Rate app pressed")}
      />
      
      {/* Add some bottom padding for better scrolling */}
      <View style={{ height: 20 }} />
    </ScrollView>
  );
};

export default ProfileScreen;