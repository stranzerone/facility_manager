import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'; // Import FontAwesome

const DynamicPopup = ({ visible, type, message, onClose, onOk }) => {
  // Define icon names and colors based on the type
  const iconNames = {
    success: 'check-circle',
    error: 'times-circle',
    warning: 'exclamation-triangle',
    alert: 'exclamation-circle',
    hint: 'info-circle',
    unauthorized: 'lock', // New type: lock icon for unauthorized
  };

  // Define colors for each type
  const colors = {
    success: '#28a745', // Green for success
    error: '#dc3545',   // Red for error
    warning: '#ffc107', // Yellow for warning
    alert: '#ff851b',   // Orange for alert
    hint: '#17a2b8',    // Teal for hint
    unauthorized: '#6c757d', // Gray for unauthorized
  };

  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.popupContainer}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✖</Text>
            </TouchableOpacity>
          </View>

          <Icon
            name={iconNames[type]}
            size={50}
            color={colors[type]}
            style={styles.icon}
          />
          <Text style={styles.message}>{message}</Text>

          <TouchableOpacity
            style={[styles.okButton, { backgroundColor: '#1996D3' }]}
            onPress={onOk}
          >
            <Text style={styles.okButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  popupContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  header: {
    width: '100%',
    alignItems: 'flex-end',
  },
  closeButton: {
    fontSize: 20,
    color: '#074B7C', // Color for the close button
  },
  icon: {
    marginVertical: 20,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  okButton: {
    padding: 10,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  okButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default DynamicPopup;
