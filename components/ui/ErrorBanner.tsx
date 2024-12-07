import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ErrorBannerProps {
  message: string | null;
  visible: boolean;
}

export function ErrorBanner({ message, visible }: ErrorBannerProps) {
  if (!visible || !message) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 35,
    left: 0,
    right: 0,
    zIndex: 50,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'transparent'
  },
  text: {
    color: '#FF0000',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600'
  }
}); 