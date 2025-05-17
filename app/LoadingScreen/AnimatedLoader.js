// Loader.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Animatable from 'react-native-animatable';

const Loader = () => {
  return (
    <View style={styles.container}>
      <Animatable.Text
        style={styles.loadingText}
        animation="fadeIn"
        iterationCount="infinite"
        direction="alternate"
      >
      
      </Animatable.Text>
      <Animatable.View
        animation="pulse"
        iterationCount="infinite"
        style={styles.loader}
      >
        <View style={styles.loaderCircle} />
        <View style={styles.loaderCircle} />
        <View style={styles.loaderCircle} />
      </Animatable.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "transparent",
  },
  loadingText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#074B7C',
    marginBottom: 20,
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
    backgroundColor: '#074B7C',
    margin: 5,
  },
});

export default Loader;
