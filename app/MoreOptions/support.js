import React from "react";

const SupportSection = () => {
  return {
    id: "support",
    title: "Support & Information",
    items: [
      {
        id: "whatsNew",
        title: "What's New",
        subtitle: "Latest updates and features",
        icon: "zap",
        onPress: () => {},
        showArrow: true,
        badge: "NEW",
      },
      {
        id: "raiseIssue",
        title: "Raise Issue",
        subtitle: "Report a problem or bug",
        icon: "alert-circle",
        onPress: () => {},
        showArrow: true,
      },
      {
        id: "contactUs",
        title: "Contact Us",
        subtitle: "Get in touch with support",
        icon: "phone",
        onPress: () => {},
        showArrow: true,
      },
      {
        id: "aboutUs",
        title: "About Us",
        subtitle: "Learn more about our company",
        icon: "info",
        onPress: () => {},
        showArrow: true,
      },
    ],
  };
};

export default SupportSection;