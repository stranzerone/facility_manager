import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faHome, faFileAlt, faQrcode, faBell, faEllipsisH } from '@fortawesome/free-solid-svg-icons';
import { usePermissions } from '../GlobalVariables/PermissionsContext';

const Footer = ({ activeTab, onTabPress }) => {
  const { nightMode } = usePermissions();
  const isDarkMode = nightMode;

  const tabs = [
    { key: 'Home', icon: faHome, label: 'Home' },
    { key: 'ServiceRequests', icon: faFileAlt, label: 'Complaints' },
    { key: 'QRCode', icon: faQrcode, label: '', isCenter: true },
    { key: 'Notifications', icon: faBell, label: 'Notifications' },
    { key: 'More', icon: faEllipsisH, label: 'More' },
  ];

  const TabButton = ({ tab, isActive, onPress }) => {
    if (tab.isCenter) {
      return (
        <TouchableOpacity
          style={styles.centerButton}
          onPress={() => onPress(tab.key)}
          activeOpacity={0.8}
        >
          <View style={styles.centerButtonInner}>
            <FontAwesomeIcon icon={tab.icon} size={24} color="white" />
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => onPress(tab.key)}
        activeOpacity={0.7}
      >
        <FontAwesomeIcon
          icon={tab.icon}
          size={20}
          color={isActive ? '#1996D3' : isDarkMode ? '#9CA3AF' : '#6B7280'}
        />
        {tab.label ? (
          <Text style={[
            styles.tabLabel,
            { color: isActive ? '#1996D3' : isDarkMode ? '#9CA3AF' : '#6B7280' }
          ]}>
            {tab.label}
          </Text>
        ) : null}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[
      styles.footerContainer,
      { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' }
    ]}>
      {tabs.map(tab => (
        <TabButton
          key={tab.key}
          tab={tab}
          isActive={activeTab === tab.key}
          onPress={onTabPress}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  footerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingVertical: 4,
    paddingHorizontal: 8,
    height: 64,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderTopWidth: 0.5,
    borderTopColor: '#D1D5DB',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
    minHeight: 54,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 2,
    fontWeight: '500',
    textAlign: 'center',
  },
  centerButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    top: -16,
  },
  centerButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1996D3',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
});

export default Footer;
