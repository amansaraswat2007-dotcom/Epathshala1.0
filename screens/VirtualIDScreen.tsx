import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const VirtualIDScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>🆔 Virtual ID Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: 'red',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default VirtualIDScreen;
