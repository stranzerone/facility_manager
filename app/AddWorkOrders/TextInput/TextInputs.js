import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { FontAwesome6 } from '@expo/vector-icons';
import { usePermissions } from '../../GlobalVariables/PermissionsContext';

const TaskInput = ({ onChangeName, onChangeDueDate, onChangeEstimatedTime, workOrderType, onChangeBreakDonwHours }) => {
  const [name, setName] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDueDate, setSelectedDueDate] = useState(null); // Initialize as null
  const [breakdownHours, setBreakdownHours] = useState('');
  const { nightMode } = usePermissions();

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (event.type === "set" && selectedDate) {
      const formattedDate = selectedDate.toISOString().split("T")[0]; // Extract YYYY-MM-DD
      setSelectedDueDate(formattedDate); // Store only date
      onChangeDueDate(formattedDate); // Pass only date to parent
    }
  };

  // Function to format date as DD-MM-YYYY
  const formatDate = (isoDate) => {
    if (!isoDate) return "DD-MM-YYYY"; // Default placeholder

    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const styles = getStyles(nightMode);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.innerContainer}>
          <View style={styles.row}>
            <Text style={styles.label}>Name</Text>
            <View>
              <TextInput
                style={[styles.input, styles.inputRow, { height: 50, width: 170 }]}
                placeholder="Enter task name"
                placeholderTextColor={nightMode ? "#9CA3AF" : "#6B7280"}
                value={name}
                onChangeText={setName}
                onBlur={() => onChangeName(name)}
                returnKeyType="done"
              />
              <View style={styles.mandatoryContainer}>
                <Text style={styles.mandatoryText}>
                  <FontAwesome6 name="star-of-life" size={8} color="red" /> mandatory
                </Text>
              </View>
            </View>
          </View>

          {/* Due Date Picker */}
          <TouchableOpacity onPress={() => setShowDatePicker(true)}>
            <View style={styles.row}>
              <Text style={styles.label}>Due Date</Text>
              <View>
                <View style={[styles.dateContainer, styles.inputRow, { height: 50, width: 170 }]}>
                  <Text style={styles.dateText}>{formatDate(selectedDueDate)}</Text>
                </View>
                <View style={styles.mandatoryContainer}>
                  <Text style={styles.mandatoryText}>
                    <FontAwesome6 name="star-of-life" size={8} color="red" /> mandatory
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={selectedDueDate ? new Date(selectedDueDate) : new Date()} // Ensure valid date
              mode="date"
              display="default"
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}

          {/* Estimated Time */}
          <View style={styles.row}>
            <Text style={styles.label}>Est Time</Text>
            <View>
              <TextInput
                style={[styles.input, styles.inputRow, { height: 40, width: 170 }]}
                placeholder="Estimated Hours"
                placeholderTextColor={nightMode ? "#9CA3AF" : "#6B7280"}
                value={estimatedTime}
                onChangeText={setEstimatedTime}
                keyboardType="numeric"
                onBlur={() => onChangeEstimatedTime(estimatedTime)}
              />
            </View>
          </View>

          {workOrderType === "breakdown" && (
            <View style={styles.row}>
              <Text style={styles.label}>Breakdown Hours</Text>
              <View>
                <TextInput
                  style={[styles.input, styles.inputRow, { height: 40, width: 170 }]}
                  placeholder="Breakdown Hours"
                  placeholderTextColor={nightMode ? "#9CA3AF" : "#6B7280"}
                  value={breakdownHours}
                  onChangeText={setBreakdownHours}
                  keyboardType="numeric"
                  onBlur={() => onChangeBreakDonwHours(breakdownHours)}
                />
                <View style={styles.mandatoryContainer}>
                  <Text style={styles.mandatoryText}>
                    <FontAwesome6 name="star-of-life" size={8} color="red" /> mandatory
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const getStyles = (nightMode) => StyleSheet.create({
  container: {
    flex: 1,
    display: 'flex',
    padding: 0,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    width: '40%',
    marginBottom: 5,
    fontSize: 16,
    fontWeight: 'bold',
    color: nightMode ? '#60A5FA' : '#074B7C',
  },
  input: {
    borderColor: nightMode ? '#4B5563' : '#1996D3',
    borderWidth: 1,
    width: '60%',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: nightMode ? '#374151' : '#FFFFFF',
    color: nightMode ? '#E5E5E5' : '#000000',
  },
  inputRow: {
    flex: 1,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderColor: nightMode ? '#4B5563' : '#1996D3',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
    height: 40,
    backgroundColor: nightMode ? '#374151' : '#FFFFFF',
  },
  dateText: {
    color: nightMode ? '#E5E5E5' : '#074B7C',
  },
  mandatoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -13,
  },
  mandatoryText: {
    color: '#EF4444',
    fontSize: 10,
    marginLeft: 4,
  },
});

export default TaskInput;