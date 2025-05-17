import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, Text, Animated, KeyboardAvoidingView, Platform } from 'react-native';
import AssetInfo from './AssetInfo';
const AssetDetailsMain = ({ uuid }) => {

  const WoUuId = uuid;

  // Toggle expansion




  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
     
        <View style={styles.content}>
          {/* Info Section */}
          <AssetInfo WoUuId={WoUuId} />

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: 10,
    paddingBottom: 80, // Add padding to the bottom for the tab bar
  },
  commentsContainer: {
    overflow: 'hidden', // Ensures content is hidden when collapsed
  },
  expandButton: {
    position: 'absolute',
    bottom: 50, // Position above the bottom tab bar
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#074B7C',
    borderRadius: 8,
  },
  expandText: {
    fontSize: 16,
    color: 'white',
    marginRight: 8, // Add some space between text and icon
  },
});

export default AssetDetailsMain;
