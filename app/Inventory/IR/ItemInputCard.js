import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { usePermissions } from "../../GlobalVariables/PermissionsContext";
import { Platform } from "react-native";

// Memoized Item Component for better performance
export default ItemEntry = React.memo(({ 
  entry, 
  index, 
  handleRemoveItem, 
  toggleDropdown, 
  handleUpdate, 
  selectItem, 
  filterItems, 
  loading, 
  getTaxRateByUUID, 
  items,
  isDarkMode = false // Add dark mode prop
}) => {
  const item = entry.item;
  const price = parseFloat(item?.item?.["Purchase Price"] || 0);
  const taxRate = getTaxRateByUUID(item?.item?.Tax || "");
  const quantity = parseInt(entry.quantity) || 0;
  const tax = (price * quantity * taxRate) / 100;
  const amount = price * quantity;
  const total = amount + tax;
  const available = entry?.item?.stock?.[0]?.Stock || 0;
  const isOverQuantity = quantity > available;
  const {nightMode}  = usePermissions()
  // Theme colors
  const theme = {
    light: {
      cardBg: "#FFFFFF",
      shadowColor: "#000000",
      textPrimary: "#000000",
      textSecondary: "#374151",
      textMuted: "#6B7280",
      textSuccess: "#059669",
      textError: "#DC2626",
      border: "#D1D5DB",
      borderError: "#EF4444",
      inputBg: "#FFFFFF",
      dropdownBg: "#FFFFFF",
      selectedItemBg: "#F3F4F6",
      placeholderColor: "#9CA3AF",
      iconColor: "#999999",
      iconPrimary: "#000000",
    },
    dark: {
      cardBg: "#1F2937",
      shadowColor: "#000000",
      textPrimary: "#FFFFFF",
      textSecondary: "#E5E7EB",
      textMuted: "#9CA3AF",
      textSuccess: "#10B981",
      textError: "#F87171",
      border: "#4B5563",
      borderError: "#EF4444",
      inputBg: "#374151",
      dropdownBg: "#374151",
      selectedItemBg: "#4B5563",
      placeholderColor: "#6B7280",
      iconColor: "#9CA3AF",
      iconPrimary: "#E5E7EB",
    }
  };

  const currentTheme = nightMode ? theme.dark : theme.light;

  // Memoize the filtered items to prevent recalculation on every render
  const filteredItems = useMemo(() => {
    return filterItems(entry.search);
  }, [entry.search, filterItems]);

  return (
    <View
      style={{
        backgroundColor: currentTheme.cardBg,
        borderRadius: 16,
        padding: 16,
        marginBottom: 8,
        shadowColor: currentTheme.shadowColor,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDarkMode ? 0.3 : 0.06,
        shadowRadius: 4,
        elevation: isDarkMode ? 8 : 1,
      }}
    >
      <TouchableOpacity
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          zIndex: 10,
        }}
        onPress={() => handleRemoveItem(entry.id)}
      >
        <Icon name="close" size={20} color={currentTheme.textError} />
      </TouchableOpacity>

      <Text style={{
        fontSize: 14,
        color: currentTheme.textSecondary,
        marginBottom: 4,
      }}>
        <Icon name="list" size={14} color={currentTheme.iconColor} /> {index + 1}.Select Item
      </Text>
      
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => toggleDropdown(index)}
        style={{
          borderWidth: 1,
          borderColor: currentTheme.border,
          borderRadius: 12,
          paddingHorizontal: 12,
          paddingVertical:8,
          marginBottom: 4,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: currentTheme.inputBg,
        }}
      >
         <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'android' ? 70 : 0}
      style={{ flex: 1 }}
    >
        <TextInput
          style={{
            color: currentTheme.textPrimary,
            flex: 1,
          }}
          placeholder={entry.item ? "" : "Choose item"}
          placeholderTextColor={currentTheme.placeholderColor}
          value={entry.search}
          onChangeText={(text) => {
            handleUpdate(index, "search", text);
            handleUpdate(index, "item", null);
          }}
          onFocus={() => handleUpdate(index, "isDropdownOpen", true)}
        />
        </KeyboardAvoidingView>
        {loading ? (
          <Text style={{ color: currentTheme.textMuted }}>Loading..</Text>
        ) : (
          <Icon
            name={entry.isDropdownOpen ? "chevron-up" : "chevron-down"}
            size={20}
            color={currentTheme.iconColor}
          />
        )}
      </TouchableOpacity>

      {entry.isDropdownOpen && (
        <View style={{
          borderWidth: 1,
          borderColor: currentTheme.border,
          borderRadius: 12,
          backgroundColor: currentTheme.dropdownBg,
          marginBottom: 12,
          maxHeight: 240,
        }}>
          <ScrollView 
            nestedScrollEnabled={true} 
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={true}
          >
            {filteredItems?.slice(0, 10)?.map((item, i) => {
              const isSelected = items?.some(
                (entry, idx) => entry.item?.item?.uuid === item.item?.uuid && idx !== index
              );

              if (isSelected) return null; // Hide selected items instead of showing them grayed out

              return (
                <TouchableOpacity
                  key={item.item?.uuid || i.toString()}
                  onPress={() => selectItem(index, item)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderBottomWidth: i < filteredItems.length - 1 ? 1 : 0,
                    borderBottomColor: currentTheme.border,
                  }}
                >
                  <Icon
                    name="cube"
                    size={18}
                    color={currentTheme.iconPrimary}
                    style={{ marginRight: 8 }}
                  />
                  <Text style={{
                    fontSize: 16,
                    color: currentTheme.textPrimary,
                  }}>
                    {item.item["Name"]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
      }}>
        <Text style={{
          fontSize: 14,
          color: currentTheme.textSecondary,
        }}>
          <Icon name="sort-numeric-asc" size={14} color={currentTheme.iconColor} /> Quantity
        </Text>
        {item && (
          <Text style={{
            fontSize: 14,
            color: currentTheme.textSuccess,
            fontWeight: '500',
          }}>
            <Icon name="cubes" size={14} color={currentTheme.textSuccess} /> Available: {available}
          </Text>
        )}
      </View>
      
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: isOverQuantity ? currentTheme.borderError : currentTheme.border,
          borderRadius: 12,
          paddingHorizontal: 12,
          paddingVertical: 8,
          marginBottom: 8,
          color: currentTheme.textPrimary,
          backgroundColor: currentTheme.inputBg,
        }}
        keyboardType="numeric"
        value={entry.quantity}
        onChangeText={(val) => handleUpdate(index, "quantity", val)}
        placeholderTextColor={currentTheme.placeholderColor}
      />

      {/* Uncomment this section if you want to show price details
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        marginTop: 8,
      }}>
        <Text style={{
          fontSize: 14,
          width: '50%',
          color: currentTheme.textMuted,
        }}>
          <Icon name="money" size={14} color={currentTheme.iconColor} /> Price:{" "}
          <Text style={{
            color: currentTheme.textPrimary,
            fontWeight: '500',
          }}>₹{price}</Text>
        </Text>
        <Text style={{
          fontSize: 14,
          width: '50%',
          color: currentTheme.textMuted,
        }}>
          <Icon name="percent" size={14} color={currentTheme.iconColor} /> Tax:{" "}
          <Text style={{
            color: currentTheme.textPrimary,
            fontWeight: '500',
          }}>
            ₹{tax.toFixed(2)} ({taxRate}%)
          </Text>
        </Text>
        <Text style={{
          fontSize: 14,
          width: '50%',
          color: currentTheme.textMuted,
        }}>
          <Icon name="calculator" size={14} color={currentTheme.iconColor} /> Amount:{" "}
          <Text style={{
            color: currentTheme.textPrimary,
            fontWeight: '500',
          }}>₹{amount.toFixed(2)}</Text>
        </Text>
        <Text style={{
          fontSize: 14,
          width: '50%',
          color: currentTheme.textMuted,
        }}>
          <Icon name="inr" size={14} color={currentTheme.iconColor} /> Total:{" "}
          <Text style={{
            color: currentTheme.textPrimary,
            fontWeight: '600',
          }}>₹{total.toFixed(2)}</Text>
        </Text>
      </View>
      */}
    </View>
  );
});