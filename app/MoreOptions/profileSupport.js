// components/profile/ProfileSupport.js
import React from "react";
import { View, Text, TouchableOpacity, Linking, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";

const ProfileSupport = ({ theme, isDarkMode, onFAQ, onContactSupport, onReportIssue, onRateApp }) => {
  const SupportItem = ({ icon, title, subtitle, onPress, isExternal = false }) => (
    <TouchableOpacity 
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
      }}
      onPress={onPress}
    >
      <View style={{
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(25, 150, 211, 0.1)",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 16,
      }}>
        <Feather name={icon} size={20} color={theme.primaryColor} />
      </View>
      
      <View style={{ flex: 1 }}>
        <Text style={{
          color: theme.textPrimary,
          fontSize: 16,
          fontWeight: "500",
          marginBottom: subtitle ? 2 : 0,
        }}>
          {title}
        </Text>
        {subtitle && (
          <Text style={{
            color: theme.textSecondary,
            fontSize: 12,
          }}>
            {subtitle}
          </Text>
        )}
      </View>
      
      <Feather 
        name={isExternal ? "external-link" : "chevron-right"} 
        size={20} 
        color={theme.textSecondary} 
      />
    </TouchableOpacity>
  );

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@yourapp.com?subject=Support Request');
  };

  const handleRateApp = () => {
    // Replace with your app store URLs
    const appStoreUrl = 'https://apps.apple.com/app/your-app';
    const playStoreUrl = 'https://play.google.com/store/apps/details?id=your.app.package';
    
    // Detect platform and open appropriate store
    Linking.openURL(Platform.OS === 'ios' ? appStoreUrl : playStoreUrl);
  };

  return (
    <View style={{
      backgroundColor: theme.cardBackground,
      marginHorizontal: 16,
      marginTop: 16,
      borderRadius: 16,
      shadowColor: theme.shadowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDarkMode ? 0.3 : 0.15,
      shadowRadius: 8,
      elevation: 6,
    }}>
      <Text style={{
        color: theme.textPrimary,
        fontSize: 18,
        fontWeight: "600",
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 8,
      }}>
        Help & Support
      </Text>

      <SupportItem
        icon="help-circle"
        title="FAQ"
        subtitle="Find answers to common questions"
        onPress={onFAQ || (() => console.log('Navigate to FAQ'))}
      />

      <SupportItem
        icon="message-circle"
        title="Contact Support"
        subtitle="Get help from our support team"
        onPress={onContactSupport || handleContactSupport}
        isExternal={true}
      />

      <SupportItem
        icon="alert-triangle"
        title="Report an Issue"
        subtitle="Report bugs or technical problems"
        onPress={onReportIssue || (() => console.log('Navigate to Report Issue'))}
      />

      <SupportItem
        icon="star"
        title="Rate Our App"
        subtitle="Share your feedback on the app store"
        onPress={onRateApp || handleRateApp}
        isExternal={true}
      />

      {/* App Info Section */}
      <View style={{
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
        alignItems: "center",
      }}>
        <Text style={{
          color: theme.textSecondary,
          fontSize: 12,
          marginBottom: 4,
        }}>
          Version 1.0.0
        </Text>
        <Text style={{
          color: theme.textSecondary,
          fontSize: 10,
        }}>
          © 2024 Your Company Name. All rights reserved.
        </Text>
      </View>
    </View>
  );
};

export default ProfileSupport;