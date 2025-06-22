import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, ActivityIndicator } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const ApprovalSelectionModal = ({
  visible,
  onClose,
  approvers,
  selectedApprover,
  setSelectedApprover,
  onProceed,
  loading
}) => (
  <Modal
    animationType="slide"
    transparent
    visible={visible}
    onRequestClose={onClose}
  >
    <View className="flex-1 bg-black/60 justify-start pt-[30%]">
      <View className="flex-1 bg-white rounded-t-3xl shadow-2xl">

        <View className="items-center pt-3 pb-2">
          <View className="w-12 h-1 bg-gray-300 rounded-full" />
        </View>

        <View className="px-6 pb-4">
          <View className="flex-row justify-between items-center mb-1">
            <Text className="text-xl font-bold text-[#074B7C]">Select Approver</Text>
            <TouchableOpacity onPress={onClose} className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center">
              <FontAwesome name="times" size={16} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <Text className="text-gray-500 text-sm mb-4">
            Choose an approver for your request or proceed without selection
          </Text>
        </View>

        <View className="h-px bg-gray-200" />

        <ScrollView className="flex-1 px-6 py-4 h-44" showsVerticalScrollIndicator={false}>
          {approvers.map((approver, index) => (
            <View key={index} className={`flex-row items-center p-4 rounded-2xl mb-3 border-2 ${selectedApprover?.uuid === approver.uuid ? 'bg-[#074B7C]/5 border-[#074B7C]' : 'bg-gray-50 border-gray-200'}`}>
              <TouchableOpacity
                onPress={() => setSelectedApprover(approver)}
                activeOpacity={0.7}
                className="flex-row items-center flex-1"
              >
                <View className={`w-6 h-6 rounded-full items-center justify-center ${selectedApprover?.uuid === approver.uuid ? 'bg-[#074B7C]' : 'bg-gray-300'}`}> 
                  <FontAwesome name="user" size={16} color={selectedApprover?.uuid === approver.uuid ? "white" : "#6B7280"} />
                </View>

                <View className="ml-4 flex-1">
                  <Text className={`font-semibold text-base ${selectedApprover?.uuid === approver.uuid ? 'text-[#074B7C]' : 'text-gray-900'}`}>
                    {approver.Name}
                  </Text>
                </View>

                {selectedApprover?.uuid === approver.uuid && (
                  <View className="w-6 h-6 rounded-full bg-[#074B7C] items-center justify-center">
                    <FontAwesome name="check" size={12} color="white" />
                  </View>
                )}
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        <View className="px-6 py-4 bg-gray-50 rounded-t-2xl border-t border-gray-200">
          <TouchableOpacity
            onPress={() => selectedApprover ? onProceed(true, selectedApprover) : onProceed(false)}
            disabled={loading}
            activeOpacity={0.8}
            className={`py-4 rounded-xl ${loading ? 'bg-gray-400' : selectedApprover ? 'bg-[#074B7C] shadow-md' : 'bg-gray-600'}`}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="text-center font-semibold text-base text-white">
                {selectedApprover ? 'Proceed' : 'Proceed Without Selection'}
              </Text>
            )}
          </TouchableOpacity>

          <Text className="text-center text-gray-400 text-xs mt-3">
            {loading
              ? 'Processing your request...'
              : selectedApprover
                ? `Proceeding with ${selectedApprover.Name}`
                : 'No approver selected - proceeding without approval assignment'}
          </Text>
        </View>
      </View>
    </View>
  </Modal>
);

export default ApprovalSelectionModal;