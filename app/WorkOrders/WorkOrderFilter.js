import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { usePermissions } from '../GlobalVariables/PermissionsContext';

const FilterOptions = ({ filters, selectedFilter, applyFilter, closeFilter }) => {
  const slideAnim = useRef(new Animated.Value(300)).current;
  const { nightMode } = usePermissions();

  const colors = {
    background: nightMode ? '#1e1e1e' : '#fff',
    border: nightMode ? '#555' : '#ddd',
    text: nightMode ? '#f8f9fa' : '#333',
    title: nightMode ? '#f8f9fa' : '#074B7C',
    optionBg: nightMode ? '#2c2c2c' : '#f5f5f5',
    selectedBg: '#074B7C',
    selectedText: '#fff',
    shadowColor: nightMode ? '#000' : '#000',
  };

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: -1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [slideAnim]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: 300,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      closeFilter();
    });
  };

  return (
    <Animated.View
      style={[
        styles.filterPopup,
        {
          transform: [{ translateY: slideAnim }],
          backgroundColor: colors.background,
          shadowColor: colors.shadowColor,
        },
      ]}
    >
      <View
        style={[
          styles.titleContainer,
          { borderBottomColor: colors.border },
        ]}
      >
        <Text style={[styles.modalTitle, { color: colors.title }]}>
          Filter by Status
        </Text>
        <TouchableOpacity onPress={handleClose}>
          <Icon name="close" size={20} color={colors.title} style={styles.closeIcon} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filters}
        keyExtractor={(item) => item}
        renderItem={({ item }) => {
          const isSelected = selectedFilter === item;
          return (
            <TouchableOpacity
              style={[
                styles.filterOption,
                {
                  backgroundColor: isSelected
                    ? colors.selectedBg
                    : colors.optionBg,
                  borderColor: isSelected
                    ? colors.selectedBg
                    : colors.border,
                },
              ]}
              onPress={() => applyFilter(item)}
            >
              <Text
                style={[
                  styles.filterText,
                  {
                    color: isSelected ? colors.selectedText : colors.text,
                    fontWeight: isSelected ? 'bold' : 'normal',
                  },
                ]}
              >
                {item}
              </Text>
              {isSelected && (
                <Icon
                  name="check"
                  size={18}
                  color={colors.selectedText}
                  style={styles.checkIcon}
                />
              )}
            </TouchableOpacity>
          );
        }}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  filterPopup: {
    position: 'absolute',
    // bottom: 50,
    width: '100%',
    padding: 15,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    elevation: 5,
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    zIndex: 10,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeIcon: {
    marginLeft: 10,
  },
  filterOption: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginBottom: 8,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    elevation: 1,
  },
  filterText: {
    fontSize: 16,
  },
  checkIcon: {
    marginLeft: 10,
  },
});

export default FilterOptions;
