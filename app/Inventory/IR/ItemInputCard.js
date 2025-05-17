import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";


// Memoized Item Component for better performance
export default  ItemEntry = React.memo(({ 
  entry, 
  index, 
  handleRemoveItem, 
  toggleDropdown, 
  handleUpdate, 
  selectItem, 
  filterItems, 
  loading, 
  getTaxRateByUUID, 
  items 
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

  // Memoize the filtered items to prevent recalculation on every render
  const filteredItems = useMemo(() => {
    return filterItems(entry.search);
  }, [entry.search, filterItems]);

  return (
    <View
      className="bg-white rounded-2xl p-4 mb-4 relative"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 1,
      }}
    >
      <TouchableOpacity
        className="absolute top-3 right-3 z-10"
        onPress={() => handleRemoveItem(entry.id)}
      >
        <Icon name="close" size={20} color="#DC2626" />
      </TouchableOpacity>

      <Text className="text-sm text-gray-700 mb-1">
        <Icon name="list" size={14} /> {index + 1}.Select Item
      </Text>
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => toggleDropdown(index)}
        className="border border-gray-300 rounded-xl px-3 py-2 mb-1 flex-row justify-between items-center"
      >
        <TextInput
          className="text-black flex-1"
          placeholder={entry.item ? "" : "Choose item"}
          value={entry.search}
          onChangeText={(text) => {
            handleUpdate(index, "search", text);
            handleUpdate(index, "item", null);
          }}
          onFocus={() => handleUpdate(index, "isDropdownOpen", true)}
        />
        {loading ? (
          <Text>Loading..</Text>
        ) : (
          <Icon
            name={entry.isDropdownOpen ? "chevron-up" : "chevron-down"}
            size={20}
            color="#999"
          />
        )}
      </TouchableOpacity>

      {entry.isDropdownOpen && (
        <View className="border border-gray-300 rounded-xl bg-white mb-3 max-h-60">
          <ScrollView 
            nestedScrollEnabled={true} 
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={true}
          >
            {filteredItems?.slice(0, 10)?.map((item, i) => {
              const isSelected = items?.some(
                (entry, idx) => entry.item?.item?.uuid === item.item?.uuid && idx !== index
              );

              return (
                <TouchableOpacity
                  key={item.item?.uuid || i.toString()}
                  onPress={() => {
                    if (!isSelected) selectItem(index, item);
                  }}
                  disabled={isSelected}
                  className={`flex-row items-center px-4 py-2 border-b border-gray-200 ${
                    isSelected ? "opacity-50 hidden" : ""
                  }`}
                >
                  <Icon
                    name={isSelected ? "" : "cube"}
                    size={18}
                    color={isSelected ? "#ccc" : "#000"}
                    style={{ marginRight: 8 }}
                  />
                  <Text className={`text-base ${isSelected ? "text-gray-400 " : "text-black"}`}>
                    {item.item["Name"]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      <View className="flex-row justify-between items-center mb-1">
        <Text className="text-sm text-gray-700">
          <Icon name="sort-numeric-asc" size={14} /> Quantity
        </Text>
        {item && (
          <Text className="text-sm text-green-600 font-medium">
            <Icon name="cubes" size={14} /> Available: {available}
          </Text>
        )}
      </View>
      <TextInput
        className={`border rounded-xl px-3 py-2 mb-2 text-black ${
          isOverQuantity ? "border-red-500" : "border-gray-300"
        }`}
        keyboardType="numeric"
        value={entry.quantity}
        onChangeText={(val) => handleUpdate(index, "quantity", val)}
      />
{/* 
      <View className="flex-row justify-between flex-wrap mt-2">
        <Text className="text-sm w-1/2 text-gray-600">
          <Icon name="money" size={14} /> Price:{" "}
          <Text className="text-black font-medium">₹{price}</Text>
        </Text>
        <Text className="text-sm w-1/2 text-gray-600">
          <Icon name="percent" size={14} /> Tax:{" "}
          <Text className="text-black font-medium">
            ₹{tax.toFixed(2)} ({taxRate}%)
          </Text>
        </Text>
        <Text className="text-sm w-1/2 text-gray-600">
          <Icon name="calculator" size={14} /> Amount:{" "}
          <Text className="text-black font-medium">₹{amount.toFixed(2)}</Text>
        </Text>
        <Text className="text-sm w-1/2 text-gray-600">
          <Icon name="inr" size={14} /> Total:{" "}
          <Text className="text-black font-semibold">₹{total.toFixed(2)}</Text>
        </Text>
      </View> */}
    </View>
  );
});
