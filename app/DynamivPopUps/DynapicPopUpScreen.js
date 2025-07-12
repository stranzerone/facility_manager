import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const DynamicPopup = ({ visible, type, message, onClose, onOk }) => {

  const nightMode = false;
  const iconNames = {
    success: 'check-circle',
    error: 'times-circle',
    warning: 'exclamation-triangle',
    alert: 'exclamation-circle',
    hint: 'info-circle',
    unauthorized: 'lock',
  };

  const colors = {
    success: '#28a745',
    error: '#dc3545',
    warning: '#ffc107',
    alert: '#ff851b',
    hint: '#17a2b8',
    unauthorized: '#6c757d',
  };

  const theme = {
    bg: nightMode ? '#1f1f1f' : '#ffffff',
    text: nightMode ? '#e0e0e0' : '#333333',
    border: nightMode ? '#333' : '#ddd',
    overlay: 'rgba(0, 0, 0, 0.6)',
    close: nightMode ? '#e0e0e0' : '#074B7C',
  };

  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { backgroundColor: theme.overlay }]}>
        <View style={[styles.popupContainer, { backgroundColor: theme.bg, borderColor: theme.border }]}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <Text style={[styles.closeButton, { color: theme.close }]}>✖</Text>
            </TouchableOpacity>
          </View>

          <Icon
            name={iconNames[type]}
            size={50}
            color={colors[type]}
            style={styles.icon}
          />

          <Text style={[styles.message, { color: theme.text }]}>
            {typeof message === 'string' ? message : message}
          </Text>

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
  },
  popupContainer: {
    width: '85%',
    borderRadius: 12,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  header: {
    width: '100%',
    alignItems: 'flex-end',
    position: 'absolute',
    top: 12,
    right: 12,
  },
  closeButton: {
    fontSize: 22,
  },
  icon: {
    marginTop: 10,
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  okButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  okButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default DynamicPopup;
