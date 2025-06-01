// components/profile/ProfileHeader.js
import React from "react";
import { View, Text, Image } from "react-native";
import { Feather } from "@expo/vector-icons";

const ProfileHeader = ({ userData, theme, isDarkMode }) => {
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
          backgroundColor: userData.profileImage ? "transparent" : theme.primaryColor,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
          shadowColor: theme.shadowColor,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 6,
          elevation: 4,
        }}>
          {userData.profileImage ? (
            <Image 
              source={{ uri: userData.profileImage }} 
              style={{ width: 100, height: 100, borderRadius: 50 }}
            />
          ) : (
            <Feather name="user" size={40} color="#FFFFFF" />
          )}
        </View>
        
        <Text style={{
          color: theme.textPrimary,
          fontSize: 24,
          fontWeight: "700",
          marginBottom: 4,
        }}>
          {userData.name}
        </Text>
        
        <Text style={{
          color: theme.textSecondary,
          fontSize: 16,
          marginBottom: 2,
        }}>
          {userData.technicianId}
        </Text>
        
        <Text style={{
          color: theme.textSecondary,
          fontSize: 14,
        }}>
          {userData.department}
        </Text>
      </View>

      {/* Contact Information */}
      <View style={{ marginBottom: 20 }}>
        <Text style={{
          color: theme.textPrimary,
          fontSize: 16,
          fontWeight: "600",
          marginBottom: 12,
        }}>
          Contact Information
        </Text>
        
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
          <Feather name="mail" size={16} color={theme.textSecondary} />
          <Text style={{
            color: theme.textSecondary,
            fontSize: 14,
            marginLeft: 8,
          }}>
            {userData.email}
          </Text>
        </View>
        
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Feather name="phone" size={16} color={theme.textSecondary} />
          <Text style={{
            color: theme.textSecondary,
            fontSize: 14,
            marginLeft: 8,
          }}>
            {userData.phone}
          </Text>
        </View>
      </View>

      {/* Stats Row */}
      <View style={{ 
        flexDirection: "row", 
        justifyContent: "space-around",
        backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(25, 150, 211, 0.05)",
        borderRadius: 12,
        padding: 16,
      }}>
        <View style={{ alignItems: "center" }}>
          <Text style={{
            color: theme.primaryColor,
            fontSize: 20,
            fontWeight: "700",
          }}>
            {userData.completedJobs}
          </Text>
          <Text style={{
            color: theme.textSecondary,
            fontSize: 12,
            marginTop: 2,
          }}>
            Jobs Completed
          </Text>
        </View>
        
        <View style={{ alignItems: "center" }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{
              color: theme.primaryColor,
              fontSize: 20,
              fontWeight: "700",
              marginRight: 4,
            }}>
              {userData.rating}
            </Text>
            <Feather name="star" size={16} color="#FFD700" />
          </View>
          <Text style={{
            color: theme.textSecondary,
            fontSize: 12,
            marginTop: 2,
          }}>
            Rating
          </Text>
        </View>
        
        <View style={{ alignItems: "center" }}>
          <Text style={{
            color: theme.primaryColor,
            fontSize: 20,
            fontWeight: "700",
          }}>
            {userData.joinDate}
          </Text>
          <Text style={{
            color: theme.textSecondary,
            fontSize: 12,
            marginTop: 2,
          }}>
            Member Since
          </Text>
        </View>
      </View>
    </View>
  );
};

export default ProfileHeader;