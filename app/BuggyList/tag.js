import React from "react";
import { View, Text } from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";

const Tag = ({ icon, text, nightMode = false, bg = "#f0f0f0", color }) => {
  const defaultTextColor = color || (nightMode ? "black" : "#333");

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: bg,
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 6,
        marginRight: 6,
        marginBottom: 6,
      }}
    >
      {icon && (
        <FontAwesome
          name={icon}
          size={12}
          color={defaultTextColor}
          style={{ marginRight: 4 }}
        />
      )}
      <Text style={{ fontSize: 12, color: defaultTextColor }}>
        {text}
      </Text>
    </View>
  );
};

export default Tag;
