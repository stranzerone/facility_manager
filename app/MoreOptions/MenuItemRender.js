import React from "react";

const SupportSection = (navigation) => {
  return {
    id: "support",
    title: "Support & Information",
    items: [
      {
        id: "whatsNew",
        title: "What's New",
        subtitle: "Latest updates and features",
        icon: "zap",
        onPress: () => navigation.navigate("WhatsNew"),
        showArrow: true,
        badge: "NEW",
      },
      {
        id: "raiseIssue",
        title: "Raise Issue",
        subtitle: "Report a problem or bug",
        icon: "alert-circle",
        onPress: () => navigation.navigate("RaiseIssue"),
        showArrow: true,
      },
      {
        id: "contactUs",
        title: "Contact Us",
        subtitle: "Get in touch with support",
        icon: "phone",
        onPress: () => navigation.navigate("ContactUs"),
        showArrow: true,
      },
      {
        id: "aboutUs",
        title: "About Us",
        subtitle: "Learn more about our company",
        icon: "info",
        onPress: () => navigation.navigate("AboutUs"),
        showArrow: true,
      },
    ],
  };
};

export default SupportSection;