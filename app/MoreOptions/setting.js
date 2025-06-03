import React from "react";

const SettingsSection = (navigation) => {
  return {
    id: "account",
    title: "Account Settings",
    items: [
      {
        id: "editProfile",
        title: "Edit Profile",
        subtitle: "Update your personal information",
        icon: "edit-3",
        onPress: () => navigation.navigate("EditProfile"),
        showArrow: true,
      },
      {
        id: "changePassword",
        title: "Change Password",
        subtitle: "Update your security credentials",
        icon: "lock",
        onPress: () => navigation.navigate("ChangePassword"),
        showArrow: true,
      },
    ],
  };
};

export default SettingsSection;