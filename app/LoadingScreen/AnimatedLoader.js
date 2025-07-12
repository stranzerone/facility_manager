// Loader.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { usePermissions } from '../GlobalVariables/PermissionsContext';

const Loader = () => {
  const { nightMode } = usePermissions();
  
  // Create dynamic styles based on nightMode
  const dynamicStyles = createStyles(nightMode);

  return (
    <View style={dynamicStyles.container}>
      <Animatable.Text
        style={dynamicStyles.loadingText}
        animation="fadeIn"
        iterationCount="infinite"
        direction="alternate"
      >
      </Animatable.Text>
      <Animatable.View
        animation="pulse"
        iterationCount="infinite"
        style={dynamicStyles.loader}
      >
        <View style={dynamicStyles.loaderCircle} />
        <View style={dynamicStyles.loaderCircle} />
        <View style={dynamicStyles.loaderCircle} />
      </Animatable.View>
    </View>
  );
};

const createStyles = (nightMode) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "transparent",
  },
  loadingText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: nightMode ? '#FFFFFF' : '#074B7C',
    marginBottom: 20,
    textShadowColor: nightMode ? 'rgba(0, 0, 0, 0.5)' : 'transparent',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  loader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 100,
  },
  loaderCircle: {
    width: 15,
    height: 15,
    borderRadius: 15 / 2,
    backgroundColor: nightMode ? '#1976D2' : '#074B7C',
    margin: 5,
    shadowColor: nightMode ? '#1976D2' : '#074B7C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: nightMode ? 0.4 : 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
});

export default Loader;