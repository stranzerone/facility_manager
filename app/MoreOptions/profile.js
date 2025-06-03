import React from "react";
import { View, Text, Image } from "react-native";
import { Feather } from "@expo/vector-icons";

const ProfileSection = ({ theme, isDarkMode }) => {
  const dummyUser = {
    name: "John Doe",
    technicianId: "TECH1234",
    department: "Maintenance",
    profileImage: "https://via.placeholder.com/100x100.png?text=User",
  };

  return (
    <View style={{
      backgroundColor: theme.cardBackground,
      marginHorizontal: 16,
      marginTop: 16,
      borderRadius: 16,
      padding: 24,
      shadowColor: theme.shadowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDarkMode ? 0.3 : 0.15,
      shadowRadius: 8,
      elevation: 6,
    }}>
      {/* Profile Image and Basic Info */}
      <View style={{ alignItems: "center", marginBottom: 20 }}>
        <View style={{
          width: 100,
          height: 100,
          borderRadius: 50,
          backgroundColor: theme.primaryColor,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
          shadowColor: theme.shadowColor,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 6,
          elevation: 4,
        }}>
          <Image 
            source={{ uri: dummyUser.profileImage }}
            style={{ width: 100, height: 100, borderRadius: 50 }}
          />
        </View>

        <Text style={{
          color: theme.textPrimary,
          fontSize: 24,
          fontWeight: "700",
          marginBottom: 4,
        }}>
          {dummyUser.name}
        </Text>

        <Text style={{
          color: theme.textSecondary,
          fontSize: 16,
          marginBottom: 2,
        }}>
          {dummyUser.technicianId}
        </Text>

        <Text style={{
          color: theme.textSecondary,
          fontSize: 14,
        }}>
          {dummyUser.department}
        </Text>
      </View>
    </View>
  );
};

export default ProfileSection;
