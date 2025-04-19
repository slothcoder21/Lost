import React from 'react';
import { StyleSheet, Text, TouchableOpacity, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default function ActionButton({ title, onPress }) {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#8AD3A3', // Light green color from the design
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 30, // More rounded corners
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
    width: width * 0.75, // Use 75% of screen width
    maxWidth: 320,
  },
  buttonText: {
    color: '#000000',
    fontSize: 18, // Smaller text
    fontWeight: '600',
    textAlign: 'center',
  },
}); 